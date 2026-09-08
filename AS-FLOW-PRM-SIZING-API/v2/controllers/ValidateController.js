const { evaluateDefaultValues } = require("../service/evaluateExpressions/defaultValues");
const { validate, getFieldProperties, checkPressureVacuumFields } = require("../service/evaluateExpressions/validations");
const { evaluatePropertyExpressions } = require("../service/evaluateExpressions/fieldProperties");
const { CheckRequiredApiAction } = require("../service/ApiActionService");
const { getUOMs } = require("../service/getUom");
const { getGenericErrorsDetails } = require("../service/CommonService");

const validateExpressions = async (req, res) => {
    try {
        const results = await evalInputs(req.body);
        res.json({ results });
    } catch (error) {
        console.error({ error })
        res.status(401).json({ error: error });
    }
};

const evalInputs = async (payload) => {
    const { currentField, inputs: recievedInputs, error, visibleFields: currentVisibleFields, disabledFields: currentDisabledFields, mandatoryFields: currentMandatoryFields, hideFromSideBarFields: currentHideFromSideBarFields } = payload;
    const { workflowId } = recievedInputs;
    let resultInputs = { ...recievedInputs };
    const [uoms, genericErrors] = await Promise.all([getUOMs(), getGenericErrorsDetails()]);
    if (!workflowId) {
        throw new Error('WorkflowId is required to fetch validations');
    }

    let disabledFields = currentDisabledFields ? {...currentDisabledFields} : {};
    let visibleFields = currentVisibleFields ? {...currentVisibleFields} : {};
    let mandatoryFields = currentMandatoryFields ? {...currentMandatoryFields} : {};
    let hideFromSideBarFields = currentHideFromSideBarFields ? {...currentHideFromSideBarFields} : {};
    // Check Complex Valves Inputs Pressure and Vacuum fields
    if (['IsPressureOnly', 'IsVacuumOnly'].includes(currentField?.FieldName)) {
        const fieldProperties = await getFieldProperties(currentField?.FieldName, workflowId);
        let newDisabledFields = {};
        let newVisibleFields = {};
        let newMandatoryFields = {};
        let newInputs = {...recievedInputs}
        const { disabledFields, visibleFields, mandatoryFields, inputs, visibleExpressions, disabledExpressions, mandatoryExpressions } = checkPressureVacuumFields(currentField, recievedInputs, fieldProperties);
        newInputs = { ...newInputs, ...inputs };
        
        if (disabledExpressions && disabledExpressions?.length) {
            const localDisabledFields = await evaluatePropertyExpressions(disabledExpressions, newInputs);
            newDisabledFields = { ...newDisabledFields, ...disabledFields, ...localDisabledFields };
        } else {
            newDisabledFields = { ...newDisabledFields, ...disabledFields };
        }
        if (visibleExpressions && visibleExpressions?.length) {
            const localVisibleFields = await evaluatePropertyExpressions(visibleExpressions, newInputs);
            newVisibleFields = { ...newVisibleFields,...visibleFields, ...localVisibleFields };
        } else {
            newVisibleFields = { ...newVisibleFields, ...visibleFields };
        }
        if (mandatoryExpressions && mandatoryExpressions?.length) {
            const localMandatoryFields = await evaluatePropertyExpressions(mandatoryExpressions, newInputs);
            newMandatoryFields = { ...newMandatoryFields, ...mandatoryFields, ...localMandatoryFields };
        } else {
            newMandatoryFields = { ...newMandatoryFields, ...mandatoryFields };
        }
        
        return { errors: error, inputs: { ...newInputs }, visibleFields: { ...currentVisibleFields, ...newVisibleFields }, disabledFields: { ...currentDisabledFields, ...newDisabledFields }, mandatoryFields: { ...currentMandatoryFields, ...newMandatoryFields }, hideFromSideBarFields: currentHideFromSideBarFields };
    } 
    // Get current field
    // CWE-1287: guard with Array.isArray before calling .reduce() — req.body.error
    // could be any JSON type (string, number, object); optional chaining alone only
    // guards null/undefined, not other non-array types.
    let currentErrors = Array.isArray(error) ? error.reduce((acc, err) => {
        if(err.name) {
            acc.push(err);
        }
        return acc;
    }, []) : [];
    const { FieldName: currentFieldName } = currentField;
    const fieldProperties = await getFieldProperties(currentFieldName, workflowId);
    const { validations, default_values: defaultValues, visible_fields: visibleFieldExpressions, disabled_fields: disabledFieldExpressions, mandatory_fields: mandatoryFieldExpressions, hidden_in_sidebar: hideFromSideBarFieldExpressions, focused_validations: focusedValidations } = fieldProperties;
    // Identify validations on current field
    let newValues;
    let updatedInputFields = [];
    resultInputs = {
        ...recievedInputs,
        [currentFieldName]: currentField.FieldValue
    }
    if (defaultValues && defaultValues?.length) {
        newValues = await evaluateDefaultValues(defaultValues, resultInputs);
        // console.log('newValues >>>>> ', {newValues,defaultValues});
        resultInputs = {
            ...resultInputs,
            ...newValues
        };
        updatedInputFields = Object.keys(newValues);
    }
    // console.log('resultInputs >> 91 >>>>> ', {resultInputs});
    //TODO: Implement logic to handle API hit to calculate field Values based on other field changes
    if(currentField?.isFieldActionRequired || currentFieldName==='IsMultivalve'){
        const localPayload={...payload,inputs:resultInputs}
        const ApiResponse= await CheckRequiredApiAction(localPayload,workflowId);
        if(typeof ApiResponse === 'object'){
            // console.log('ApiResponse >>>>>>>>>> 96 >>>>> ', ApiResponse,localPayload,recievedInputs)
            if(workflowId==13 && ApiResponse?.SaturatedSteam !=null && ApiResponse?.SaturatedSteam !=undefined && ApiResponse?.SaturatedSteam!=0){
                resultInputs={...resultInputs,Relieving:ApiResponse?.SaturatedSteam}
            }else if(resultInputs?.Relieving ==='' && ApiResponse?.SaturatedSteam !=null && ApiResponse?.SaturatedSteam !=undefined && ApiResponse?.SaturatedSteam!=0){
                resultInputs={...resultInputs,Relieving:ApiResponse?.SaturatedSteam}
            }else if(workflowId==8 && currentFieldName==='SizingBasis' && currentField?.prevValue !==undefined && ['Economizer','Preheater'].indexOf(currentField?.prevValue) !==-1 ){
                resultInputs={...resultInputs,Relieving:ApiResponse?.SaturatedSteam}
            }
            if(workflowId==8 && ['Economizer','Preheater'].indexOf(recievedInputs?.SizingBasis) ===-1 ){
                if(ApiResponse?.ErrorId){
                    currentErrors = currentErrors?.filter(err => err.name !== 'Relieving');
                    const errorMsg=genericErrors.find(err=>err.key === ApiResponse?.ErrorId)?.value;
                    const message=errorMsg?.replace('<<$1>>',ApiResponse?.TgtminReqTemp??'');
                    currentErrors.push({name:'Relieving', value:{message:message, type:'error'}});
                    // console.log('currentErrors 0000000000 >>>>> ', currentErrors);
                }else{
                    currentErrors = currentErrors?.filter(err => err.name !== 'Relieving');
                }
            }
            resultInputs={...resultInputs, ...ApiResponse}
            // console.log('ApiResponse >>>>>>>>>> 96 >>>>> ', ApiResponse, resultInputs)
        }
    }
    // console.log('currentErrors 111111111 >> 118 >>>>> ', resultInputs);
    let validationResults = [];
    if (validations && validations?.length) {
        currentErrors = currentErrors?.filter(err => !validations.some(v => v.FieldName === err.name && v.MessageId === (err.value?.error?.message ?? err.value.message)));
        validationResults = await validate(uoms, validations, resultInputs, currentField);
        // console.log('validations  >>> 123 >>>>> ', validationResults);
    }
    
    
    // getValidations on focused field
    
    const focusedFieldExpressions = validations && validations?.length && focusedValidations && focusedValidations?.length && focusedValidations?.filter(exp => !validations.some(e => e.ErrorId === exp.ErrorId));
    if (focusedFieldExpressions && focusedFieldExpressions?.length) {
        currentErrors = currentErrors?.filter(err => !focusedFieldExpressions.some(v => v.FieldName === err.name && v.MessageId === (err.value?.error?.message ?? err.value.message)));
        const focusedFieldValidation = await validate(uoms, focusedFieldExpressions, resultInputs, currentField);
        validationResults.push(...focusedFieldValidation);
        // console.log('focusedFieldValidation >>>>> ', focusedFieldValidation, validationResults);
    }
    // disable/visible/mandatory fields
    
    if (disabledFieldExpressions && disabledFieldExpressions?.length) {
        const localDisabledFields = await evaluatePropertyExpressions(disabledFieldExpressions, resultInputs);
        disabledFields = { ...disabledFields, ...localDisabledFields };
    }
    if (visibleFieldExpressions && visibleFieldExpressions?.length) {
        const localVisibleFields = await evaluatePropertyExpressions(visibleFieldExpressions, resultInputs);
        visibleFields = { ...visibleFields, ...localVisibleFields };
    }
    if (mandatoryFieldExpressions && mandatoryFieldExpressions?.length) {
        const localMandatoryFields = await evaluatePropertyExpressions(mandatoryFieldExpressions, resultInputs);
        mandatoryFields = { ...mandatoryFields, ...localMandatoryFields };
    }

    // hide from sidebar fields
    if (hideFromSideBarFieldExpressions && hideFromSideBarFieldExpressions?.length) {
        const localHideFromSideBarFields = await evaluatePropertyExpressions(hideFromSideBarFieldExpressions, resultInputs);
        hideFromSideBarFields = { ...hideFromSideBarFields, ...localHideFromSideBarFields };
    }
    const validationExps = [];
    if(validations && validations?.length) validationExps.push(...validations);
    if(focusedFieldExpressions && focusedFieldExpressions?.length) validationExps.push(...focusedFieldExpressions);
    // check validations for updated fields
    const resolvedFields = [];
    // console.log('currentErrors 111111111 >> 163 >>>>> ', resultInputs);
    while (updatedInputFields?.length) {
        const updatedfields = [...updatedInputFields].filter(f => !resolvedFields.includes(f));
        updatedInputFields = [];
        const fieldPropertiesMap = Object.fromEntries(
            await Promise.all(
                updatedfields.map(async (fieldName) => [fieldName, await getFieldProperties(fieldName, workflowId)])
            )
        );
        // console.log('currentErrors 111111111 >> 172 >>>>> ', updatedfields);
        for (const fieldName of updatedfields) {
            resolvedFields.push(fieldName);
            const fieldObj = {
                FieldName: fieldName,
                FieldValue: resultInputs[fieldName]
            };
            const updatedFieldProperties = fieldPropertiesMap[fieldName];
            const { validations: fieldValidationsArr, default_values: defaultValueExps, visible_fields: visibleFieldExpressions, disabled_fields: disabledFieldExpressions, mandatory_fields: mandatoryFieldExpressions, hidden_in_sidebar: hideFromSideBarFieldExpressions, focused_validations: focusedValidations } = updatedFieldProperties;
            const defaultValueExprs = defaultValueExps?.filter(exp => !updatedfields.includes(exp.FieldName) && currentFieldName === exp.FocusedField);
            // console.log('currentErrors 111111111 >> 181 >>>>> ', fieldName,defaultValueExprs?.length);
            // if(fieldName==='OverPressurePer'){
                // console.log('currentErrors 111111111 >> 186 >>>>> ', fieldName, defaultValueExprs, resultInputs);
            // }else{
            //     console.log('currentErrors 111111111 >> 188 >>>>> ', fieldName, resultInputs);
            // }
            if (defaultValueExprs?.length) {
                newValues = await evaluateDefaultValues(defaultValueExprs, resultInputs);
                
                
                resultInputs = {
                    ...resultInputs,
                    ...newValues
                };
                updatedInputFields = Object.keys(newValues);
                // console.log('newValues >>>>> ', {fieldName,newValues,resultInputs});
            }

            const fieldValidations = fieldValidationsArr?.filter(exp => !validationExps.some(e => e.ValidationId === exp.ValidationId));

            if (fieldValidations?.length) {
                currentErrors = currentErrors?.filter(err => !fieldValidations.some(v => v.FieldName === err.name && v.MessageId === (err.value?.error?.message ?? err.value.message)));
                const fieldValidation = await validate(uoms, fieldValidations, resultInputs, fieldObj);
                validationResults.push(...fieldValidation);
                validationExps.push(...fieldValidations);
                // console.log('fieldValidations  >>> 194 >>>>> ',  validationResults);
            }
            if (focusedValidations && focusedValidations?.length) {
                currentErrors = currentErrors?.filter(err => !focusedValidations.some(v => v.FieldName === err.name && v.MessageId === (err.value?.error?.message ?? err.value.message)));
                const focusedFieldValidation = await validate(uoms, focusedValidations, resultInputs, fieldObj);
                validationResults.push(...focusedFieldValidation);
                // console.log('focusedFieldValidation  >>> 199 >>>>> ', validationResults);
            }
            if (disabledFieldExpressions?.length) {
                const disabledField = await evaluatePropertyExpressions(disabledFieldExpressions, resultInputs);
                disabledFields = { ...disabledFields, ...disabledField };
            }
            if (visibleFieldExpressions?.length) {
                const visibleField = await evaluatePropertyExpressions(visibleFieldExpressions, resultInputs);
                visibleFields = { ...visibleFields, ...visibleField };
            }
            if (mandatoryFieldExpressions?.length) {
                const mandatoryField = await evaluatePropertyExpressions(mandatoryFieldExpressions, resultInputs);
                mandatoryFields = { ...mandatoryFields, ...mandatoryField };
            }
            if (hideFromSideBarFieldExpressions?.length) {
                const hideFromSideBarField = await evaluatePropertyExpressions(hideFromSideBarFieldExpressions, resultInputs);
                hideFromSideBarFields = { ...hideFromSideBarFields, ...hideFromSideBarField };
            }
        }
    }

    // console.log('currentErrors 22222222222 >> 218 >>>>> ', resultInputs);
    if(currentErrors && currentErrors?.length) {
        currentErrors.forEach(err => {
            const error = {
                FieldName: err.name,
                type: err.value?.error?.type ?? err.value.type,
                MessageId: err.value?.error?.message ?? err.value.message,
                messageString: err.value?.error?.description ?? err.value.description
            }
            validationResults.push(error);
        });
    }
    // console.log('currentErrors 3333333333 >> 230 >>>>> ', validationResults);

    return { errors: validationResults, inputs: resultInputs, visibleFields, disabledFields, mandatoryFields, hideFromSideBarFields };
}

module.exports = {
    validateExpressions,
    evalInputs,
};
