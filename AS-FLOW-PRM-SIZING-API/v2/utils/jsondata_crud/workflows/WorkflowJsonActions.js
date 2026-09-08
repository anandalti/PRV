const fs = require('fs');
const path = require('path');
const { saveWorkflowDetails, normalizeWorkflowId } = require('../../../service/layoutjsons/workflowPersistence');
const { createSections, deleteSections, 
    //getWorkflowSections 

} = require('./SectionData');

const { typeDefaultValues, filterExpressionAndDefValues, mergeDefaultAndExpressionValues, getFieldWiseExpressions, getFieldWiseUOMFocussedExpressions } = require('../../helper');
const { getAllFieldsMandatory } = require('./FieldMandatoryData');

const { getAllFieldsVisible } = require('./FieldVisibleData');
const { getAllFieldsHiddenFromSidebar } = require('./FieldHiddenInSidebarData');
const { getAllFieldsOptions } = require('./FieldOptionsData');
const UOM = require('../../../models/UOM');
const { getAllFieldsGroup } = require('./FieldGroupData');
const { evaluateDefaultValues } = require('../../../service/evaluateExpressions/defaultValues');
const { evaluatePropertyExpressions } = require('../../../service/evaluateExpressions/fieldProperties');
const { getFieldValidations } = require('../../../models/WorkflowSection/FieldValidations');
const { getAllSectionAllFields } = require('../../../models/WorkflowSection/SectionFieldDetails');
const { getAllFieldsDefaultValues } = require('../../../models/WorkflowSection/FieldDefaultValue');
const { getAllFieldsDisabled } = require('../../../models/WorkflowSection/FieldDisabled');
const { getAllWorkflowSections } = require('../../../models/WorkflowSection/WorkflowSectionDetails');
const { getAllFieldsExpressions } = require('../../../models/WorkflowSection/FieldExpression');
const { getAllErrors } = require('../../../models/WorkflowSection/FieldErrors');
const { getAllFieldApiActions } = require('./FieldApiCallActionData');

// Expressions

const getExpressionDetails = (expressions, expressionDetailsAll) => {
    if (!expressions?.length) return [];
    const expressionIdsSet = new Set(expressions.map(e => e.ExpressionId));
    return expressionDetailsAll.filter(val => expressionIdsSet.has(val.ExpressionId));
};

const getValuesForFields=async (fields,expressionDetailsAll,defaultvals,fieldDefaultValues,key)=>{
    let localFieldDefValues={...fieldDefaultValues}
    const result = filterExpressionAndDefValues(fields, defaultvals, key);
    const expressions = result.expressions;
    let defaultValues = {...typeDefaultValues(result.value),...defaultValues};
    localFieldDefValues={...typeDefaultValues(result.fieldValues),...localFieldDefValues};

    let expressionDetails = getExpressionDetails(expressions,expressionDetailsAll);
    if (key==='DefaultValueId' && expressionDetails?.length > 0) {
        const localdefaultvals = await evaluateDefaultValues(expressionDetails, {...localFieldDefValues,workflowId},displayFlag);
        defaultValues = { ...defaultValues, ...localdefaultvals };
        defaultValues=mergeDefaultAndExpressionValues(defaultValues,localFieldDefValues,localdefaultvals);
        localFieldDefValues={...localFieldDefValues,...localdefaultvals};
        
    }
    return {defaultValues,fieldwiseDefaultValues:localFieldDefValues,expressionDetails};
}
const getSectionFieldsDetails=async (FieldIds,data,fileDataMap,workflowId,displayFlag)=>{
    let defaultValues = displayFlag?{EnterTankData:true,CalculateTankData:false,IsPressureOnly:true,IsVacuumOnly:false}:{};
    let fieldwiseDefaultValues = {...defaultValues};
    let mandatoryValues = {};
    let disabledValues = {};
    let visibleValues = {};
    let hideFromSideBarValues = {};
    let defExpressions = [];
    let mandatoryExpressions = [];
    let disabledExpressions = [];
    let visibleExpressions = [];
    let hideFromSideBarExpressions = [];
    let apiActions=[];

    const defaultUOMs = fileDataMap['DefaultUOMs.json'];
    let validationValsAll = fileDataMap['FieldValidations.json'];
    let expressionDetailsAll = fileDataMap['FieldExpressions.json'];
    let defaultvalsAll = fileDataMap['FieldDefaultValues.json'];
    let mandatoryValsAll = fileDataMap['FieldMandatoryValues.json'];
    let disabledValsAll = fileDataMap['FieldDisabledValues.json'];
    let visibleValsAll = fileDataMap['FieldVisibleValues.json'];
    let hideFromSideBarValsAll = fileDataMap['FieldHiddenFromSidebarValues.json'];
    let optionValsAll = fileDataMap['FieldOptions.json'];
    let groupValsAll = fileDataMap['FieldGroup.json'];
    let apiActionsAll= fileDataMap['FieldApiActions.json'];

    const sectionFieldSet = new Set(FieldIds);
    const fields = data.flatMap(section => section.fields);
    // console.log(' >>>>> ',fields?.length,FieldIds?.length)
    let fieldIdNameMap = {};
    fields?.forEach(field => {
        fieldIdNameMap[field.FieldId] = field.FieldName;
    });

    // Filter all value arrays once using Set
    const filterByFieldId = (arr) => arr.filter(val => sectionFieldSet.has(val.FieldId));
    const validationVals = filterByFieldId(validationValsAll);
    const defaultvals = filterByFieldId(defaultvalsAll);
    const mandatoryVals = filterByFieldId(mandatoryValsAll);
    const disabledVals = filterByFieldId(disabledValsAll);
    const visibleVals = filterByFieldId(visibleValsAll);
    const hideFromSideBarVals = filterByFieldId(hideFromSideBarValsAll);
    const apiActionsVals = filterByFieldId(apiActionsAll);
    

    // Validations
    let result = filterExpressionAndDefValues(fields, validationVals, 'ValidationId');
    defExpressions = result.expressions;
    defaultValues = {...typeDefaultValues(result.value),...defaultValues};
    fieldwiseDefaultValues={...typeDefaultValues(result.fieldValues),...fieldwiseDefaultValues};
    let validExpressionDetails = getExpressionDetails(defExpressions,expressionDetailsAll);
    
    // const defValuesforFields=await getValuesForFields(fields,expressionDetailsAll,defaultvals,fieldwiseDefaultValues,'DefaultValueId');
    // defaultValues=defValuesforFields.defaultValues;
    // fieldwiseDefaultValues=defValuesforFields.fieldwiseDefaultValues;
    // let defExpressionDetails = defValuesforFields?.expressionDetails
    result = filterExpressionAndDefValues(fields, defaultvals, 'DefaultValueId');
    defExpressions = result.expressions;
    defaultValues = {...typeDefaultValues(result.value),...defaultValues};
    fieldwiseDefaultValues={...typeDefaultValues(result.fieldValues),...fieldwiseDefaultValues};
    // console.log({fieldwiseDefaultValues,defaultValues})
    let defExpressionDetails = getExpressionDetails(defExpressions,expressionDetailsAll);
    if (defExpressionDetails?.length > 0) {
        const localdefaultvals = await evaluateDefaultValues(defExpressionDetails, {...fieldwiseDefaultValues,workflowId},displayFlag);
        // console.log({localdefaultvals,defaultValues})
        defaultValues = { ...defaultValues, ...localdefaultvals };
        defaultValues=mergeDefaultAndExpressionValues(defaultValues,fieldwiseDefaultValues,localdefaultvals);
        fieldwiseDefaultValues={...fieldwiseDefaultValues,...localdefaultvals};
        
    }
    
    // Mandatory
    result = filterExpressionAndDefValues(fields, mandatoryVals, 'MandatoryId');
    mandatoryExpressions = result.expressions;
    mandatoryValues = typeDefaultValues(result.value);
    let mandatoryExpressionDetails = getExpressionDetails(mandatoryExpressions,expressionDetailsAll);
    if (mandatoryExpressionDetails?.length > 0) {
        const localmandatoryvals = await evaluatePropertyExpressions(mandatoryExpressionDetails, {...fieldwiseDefaultValues,workflowId});
        mandatoryValues=mergeDefaultAndExpressionValues(defaultValues,mandatoryValues,localmandatoryvals);
    }

    // Disabled
    result = filterExpressionAndDefValues(fields, disabledVals, 'DisabledId');
    disabledExpressions = result.expressions;
    disabledValues = typeDefaultValues(result.value);
    let disabledExpressionDetails = getExpressionDetails(disabledExpressions,expressionDetailsAll);
    // console.log('disabledVals >>>>>>>>>>>> ', disabledValues,defaultValues,disabledExpressionDetails?.length);
    if (disabledExpressionDetails?.length > 0) {
        const localdisabledvals = await evaluatePropertyExpressions(disabledExpressionDetails,  {...fieldwiseDefaultValues,workflowId});
        // disabledValues = { ...disabledValues, ...localdisabledvals };
        // console.log('disabledVals >>>>>>>>>>>> ',{defaultValues,fieldValues: disabledValues,expressionValues:localdisabledvals});
        disabledValues=mergeDefaultAndExpressionValues(defaultValues,disabledValues,localdisabledvals);
        // console.log('disabledVals >>>>>>>>>>>> 11111111 >>>> ',{disabledValues});
    }

    // Visible
    result = filterExpressionAndDefValues(fields, visibleVals, 'VisibleId');
    visibleExpressions = result.expressions;
    visibleValues = typeDefaultValues(result.value);
    let visibleExpressionDetails = getExpressionDetails(visibleExpressions,expressionDetailsAll);
    if (visibleExpressionDetails?.length > 0) {
        const localvisiblevals = await evaluatePropertyExpressions(visibleExpressionDetails, {...fieldwiseDefaultValues,workflowId});
        visibleValues=mergeDefaultAndExpressionValues(defaultValues,visibleValues,localvisiblevals);
        // console.log('visibleExpressionDetails >>>>>', visibleExpressionDetails?.length, {...fieldwiseDefaultValues,workflowId},visibleValues);
    }

    // Hide From Sidebar
    result = filterExpressionAndDefValues(fields, hideFromSideBarVals, 'SideHiddenId');
    hideFromSideBarExpressions = result.expressions;
    hideFromSideBarValues = typeDefaultValues(result.value);
    let hideFromSideBarExpressionDetails = getExpressionDetails(hideFromSideBarExpressions,expressionDetailsAll);
    if (hideFromSideBarExpressionDetails?.length > 0) {
        const localhidefromsidebarvals = await evaluatePropertyExpressions(hideFromSideBarExpressionDetails,  {...fieldwiseDefaultValues,workflowId});
        // hideFromSideBarValues = { ...hideFromSideBarValues, ...localhidefromsidebarvals };
        hideFromSideBarValues=mergeDefaultAndExpressionValues(defaultValues,hideFromSideBarValues,localhidefromsidebarvals);
    }

    // Options
    const optionMap = optionValsAll.reduce((acc, obj) => {
        const key = obj.FieldId;
        if (!acc[key]) acc[key] = [];
        acc[key].push({ label: obj.Label, value: obj.Value });
        return acc;
    }, {});
    let OptionValues = {};
    for (const key of Object.keys(optionMap)) {
        const fieldName = fields.find(field => parseInt(field.FieldId) == parseInt(key));
        if (fieldName) {
            OptionValues[fieldName.FieldName] = optionMap[key];
        }
    }

    // Groups
    const groupMap = groupValsAll.reduce((acc, obj) => {
        const key = obj.FieldId;
        acc[key] = { fieldId: key, fieldGroupId: obj.FieldGroupId, fieldGroupName: obj.FieldGroupName, fieldGroupType: obj.FieldGroupType, defaultSelected: obj.DefaultSelected };
        return acc;
    }, {});
    let GroupValues = {};
    for (const key of Object.keys(groupMap)) {
        const fieldName = fields.find(field => parseInt(field.FieldId) == parseInt(key));
        if (fieldName) {
            GroupValues[fieldName.FieldName] = groupMap[key];
        }
    }
    // if(FieldIds?.length===37){
    //     console.log('default Values >>>>>>>>>>>>> ',{defaultValues,mandatoryValues,disabledValues,visibleValues,hideFromSideBarValues});
    // }
    return data.map(section => {
        return {
            workflowId: section.WorkflowId,
            sectionId: section.SectionId,
            sectionName: section.SectionName,
            sectionLabel: section.SectionLabel,
            displayType: section.DisplayType,
            displayOrder: section.DisplayOrder,
            fields: section.fields.map(field => {
                // const validValues = validExpressionDetails.filter(validExp => field.FieldName === validExp.FocusedField);
                // const defValues = defExpressionDetails.filter(defExp => field.FieldName === defExp.FocusedField);
                // const mandValues = mandatoryExpressionDetails.filter(mandExp => field.FieldName === mandExp.FocusedField);
                // const disValues = disabledExpressionDetails.filter(disExp => field.FieldName === disExp.FocusedField);
                // const visValues = visibleExpressionDetails.filter(visExp => field.FieldName === visExp.FocusedField);
                // const hideValues = hideFromSideBarExpressionDetails.filter(hideExp => field.FieldName === hideExp.FocusedField);
                // let validateVisibleUOMField=undefined;
                const validValues = getFieldWiseExpressions(field.FieldName, validExpressionDetails);
                const defValues = getFieldWiseExpressions(field.FieldName, defExpressionDetails);
                const mandValues = getFieldWiseExpressions(field.FieldName, mandatoryExpressionDetails);
                const disValues = getFieldWiseExpressions(field.FieldName, disabledExpressionDetails);
                const visValues = getFieldWiseExpressions(field.FieldName, visibleExpressionDetails);
                const hideValues = getFieldWiseExpressions(field.FieldName, hideFromSideBarExpressionDetails);
                
                const visValuesUOM = getFieldWiseUOMFocussedExpressions(field.FieldName, visibleExpressionDetails);
                // if(visValuesUOM?.length>0){
                //     console.log('visValuesUOM >>>>>>>>>>>>>>>>> ',field.FieldName,field.UomFieldName,visValuesUOM);
                //     // validateVisibleUOMField=true;
                // }
                let apiActionValues= apiActionsVals.filter(exp => exp.FieldId ==field.FieldId);
                
                apiActionValues=apiActionValues?.length>0?apiActionValues[0]:undefined;
                const popupFields=section?.DisplayType==='popup'?true:undefined;
                const fieldActionRequired=apiActionValues!==undefined?true:undefined;                            
                const actionType= fieldActionRequired?apiActionValues?.Symbol==='COPY_FIELD_DATA'?apiActionValues?.Symbol :'CALCULATE_FIELD_VALUE':undefined
                const copyFrom=fieldActionRequired && apiActionValues?.Symbol==='COPY_FIELD_DATA'?'SaturatedSteam':undefined;
                const copyTo=fieldActionRequired && apiActionValues?.Symbol==='COPY_FIELD_DATA'?'Relieving':undefined;
                const actionId=fieldActionRequired?apiActionValues?.Id:undefined
                // console.log('in field wise checking :: fieldActionRequired>>>>>>>>> ',field.FieldName, field?.FieldAction,fieldActionRequired,actionType,copyFrom,copyTo,actionId);
                const action=field?.FieldAction!==undefined && field?.FieldAction!==null && field?.FieldAction!==''?JSON.parse(JSON.stringify(field?.FieldAction)):undefined;

                const isValidationRequired = popupFields && field.FieldType == 'radio' ? true : actionType==='CALCULATE_FIELD_VALUE' || validValues?.length > 0 || defValues?.length > 0 || mandValues?.length > 0 || disValues?.length > 0 || visValues?.length > 0 || hideValues?.length > 0;
                const localDimensionName = field?.DimensionName == null ? null : field?.DimensionName?.split(',') ?? null;
                let fieldDefaultUOM = localDimensionName === null ? null : defaultUOMs?.filter(uom => uom.DimensionName === localDimensionName[0]);

                
                if (fieldDefaultUOM !== null) {
                    fieldDefaultUOM = fieldDefaultUOM.reduce((acc, item) => {
                        acc[item.SystemUnit] = item.UnitKey;
                        return acc;
                    }, {});
                }
                const groupObj = GroupValues[field.FieldName] ?? null;
                
                const validateActionType = !isValidationRequired ? null : field.FieldType == 'label' || field.FieldType == 'divider' ? null : field.FieldType == 'combobox' || field.FieldType == 'inputUom' || field.FieldType == 'inputUominfo' || field.FieldType == 'radioInput' ? 'both' : field.FieldType == 'checkbox' || field.FieldType == 'radio' || field.FieldType == 'select' ? "onChange" : "onBlur";
                const label=field.FieldLabel?.indexOf('{') !== -1 && field.FieldLabel?.indexOf('}') !== -1?JSON.parse(field.FieldLabel):field.FieldLabel;
                const disableUOM = field?.UomFieldName !== undefined && field?.UomFieldName !== null && field?.UomFieldName !== '' ? false : undefined;
                let fieldVisibleflag=visibleValues[field.FieldName] !== undefined ? visibleValues[field.FieldName] : true
                if(field.FieldType==='label' || field.FieldType==='radio'){
                    const localVisible=visibleExpressionDetails.filter(visExp => field.FieldName === visExp.CurrentId && visExp.Value==='true');
                    if(localVisible.length > 0){
                        // console.log(' >>>>>>>>>>> ',localVisible)
                        fieldVisibleflag=true;
                    }
                    
                }
                // console.log( 'defaultValues>>>>>>>>> ',field.FieldName,defaultValues[field.FieldName]);
                return {
                    sectionId: field.SectionId,
                    fieldId: field.FieldId,
                    fieldName: field.FieldName,
                    label: label,
                    type: field.FieldType,
                    fieldDisplayOrder: field.FieldDisplayOrder,
                    isValidationRequired,
                    validateActionType,
                    gridSection: field?.GridSection ?? undefined,
                    popupFields,
                    mandatory: mandatoryValues[field.FieldName] ?? false,
                    defaultValue: defaultValues[field.FieldName] ?? "",
                    disabled: disabledValues[field.FieldName] ?? false,
                    disableUOM,
                    visible: fieldVisibleflag,
                    hideFromSideBar: hideFromSideBarValues[field.FieldName] ?? false,
                    options: OptionValues[field.FieldName] ?? [],
                    dimensionName: localDimensionName,
                    infoText: field.InfoText || '',
                    grid: field.Grid || null,
                    style: field.Style || null,
                    regex: field.Regex || null,
                    uomFieldName: field?.UomFieldName ?? '',
                    
                    defaultUOM: fieldDefaultUOM ? fieldDefaultUOM : null,
                    fieldGroupType: groupObj !== null ? groupObj["fieldGroupType"] : undefined,
                    fieldGroupName: groupObj !== null ? groupObj["fieldGroupName"] : undefined,
                    defaultSelected: groupObj !== null ? groupObj["defaultSelected"] : undefined,
                    isFieldActionRequired:fieldActionRequired,
                    actionType,
                    copyFrom,
                    copyTo,
                    actionId,
                    copyAction:action??undefined,
                    validateVisibleUOMField:visValuesUOM??undefined
                };
            })
        };
    });
}

const fetchSectionFieldsData=()=>{
   // Read all files once and parse
   const filePath = path.join(__dirname, `../../../data/workflowSectionFields/`);
   let fileDataMap = {};
    const filesToRead = [
        'workflowSections.json',
        'SectionFields.json',
        'FieldValidations.json',
        'FieldExpressions.json',
        'FieldErrors.json',
        'FieldDefaultValues.json',
        'FieldMandatoryValues.json',
        'FieldDisabledValues.json',
        'FieldVisibleValues.json',
        'FieldHiddenFromSidebarValues.json',
        'FieldOptions.json',
        'FieldGroup.json',
        'FieldApiActions.json',
        'DefaultUOMs.json'
    ];
    
    for (const fname of filesToRead) {
        fileDataMap[fname] = JSON.parse(fs.readFileSync(`${filePath}${fname}`, 'utf8'));
    } 
    return fileDataMap;
}
const updateWorkFlowFile = async (workFlowId) => {
    try {
        workFlowId = normalizeWorkflowId(workFlowId);
        let WorkflowData = [];
        let PopupData = [];
        let generatedWorkflow = [];
        let generatedPopup = null;
        
        const fileDataMap = fetchSectionFieldsData();
        
        let sections = fileDataMap['workflowSections.json'].filter(section => parseInt(section.WorkflowId) === parseInt(workFlowId));
        if (!sections.length) {
            throw Object.assign(new Error(`No sections found for workflowId: ${workFlowId}`), { status: 404 });
        }
        // console.log(' >>>>>>>>>>>>>> In updateWorkFlowFile >>>>> ',workFlowId,sections?.length);
        if (sections?.length > 0) {
            let sectionFieldIds = [];
            let popupSectionFieldIds = [];
            let SectionFieldsAll = fileDataMap['SectionFields.json'];
         
            // Build sectionFieldIds and WorkflowData in one pass
            for (const section of sections) {
                // console.log('In Section >>>>>', section);
                const sectionFields = SectionFieldsAll.filter(field => parseInt(field.SectionId) === parseInt(section.SectionId));
                // console.log('In sectionFields >>>>>', sectionFields?.length);
                if(section.DisplayType==='popup'){
                    
                    if (sectionFields?.length > 0) {
                        const fieldIds = sectionFields.map(field => field.FieldId);
                        popupSectionFieldIds.push(...fieldIds);
                        PopupData.push({ ...section, fields: [...sectionFields] });
                    } else {
                        PopupData.push({ ...section, fields: [] });
                    }
                }else{
                    
                    if (sectionFields?.length > 0) {
                        const fieldIds = sectionFields.map(field => field.FieldId);
                        sectionFieldIds.push(...fieldIds);
                        WorkflowData.push({ ...section, fields: [...sectionFields] });
                    } else {
                        WorkflowData.push({ ...section, fields: [] });
                    }
                }
            }
            
            let finalData=[];
            // console.log('sectionFieldIds >>> popupSectionFieldIds >>>>>>> ',sectionFieldIds?.length,popupSectionFieldIds?.length)
            if (WorkflowData.length > 0) {
                // console.log('sectionFieldIds >>>>>>> ',sectionFieldIds?.length,path.join(layoutFilePath, filename))
                finalData = await getSectionFieldsDetails(sectionFieldIds, WorkflowData,fileDataMap,workFlowId);

                let localSortedData=[];
                finalData=finalData.sort((a,b)=>a.displayOrder - b.displayOrder);
                for(const section of finalData){
                    const sortedFields=section.fields.sort((a,b)=>a.fieldDisplayOrder - b.fieldDisplayOrder);
                    localSortedData.push({...section,fields:sortedFields});
                }
                // console.log(path.join(layoutFilePath, filename),finalData?.length)
                generatedWorkflow = localSortedData;
            }
            if(popupSectionFieldIds?.length > 0){
                // console.log('popupSectionFieldIds >>>>>>> ',popupSectionFieldIds?.length)
                finalData = await getSectionFieldsDetails(popupSectionFieldIds, PopupData,fileDataMap,workFlowId,true);
                finalData=finalData[0];
                // console.log(path.join(layoutFilePath, filename))
                generatedPopup = finalData;
            }
            // Update the data in json file at layout FilePath in filename
            
        }

        // Publish the same generated JSON to PostgreSQL and the backend files.
        await saveWorkflowDetails(workFlowId, generatedWorkflow, generatedPopup);
        return { status: "Success", data: WorkflowData };
    } catch (error) {
        console.error('Error updating workflow layout:', error);
        throw error;
    }

}
const createDataFiles = async () => {
    const filename = `workflowSections.json`;
    const layoutFilePath = path.join(__dirname, `../../../data/workflowSectionFields/`);
    const sections= await getAllWorkflowSections();
    const fields= await getAllSectionAllFields();
    const validations= await getFieldValidations();
    const defaultValues= await getAllFieldsDefaultValues();
    const visibleValues = await getAllFieldsVisible();
    const disabledValues = await getAllFieldsDisabled();
    const mandatoryValues = await getAllFieldsMandatory();
    const hiddenfromSidebarValues = await getAllFieldsHiddenFromSidebar();
    const expressionValues= await getAllFieldsExpressions();
    const errorValues= await getAllErrors();
    const optionsValues= await getAllFieldsOptions();
    const groupValues= await getAllFieldsGroup();
    const apiActionValues = await getAllFieldApiActions();
    const defaultUOMs = await UOM.getAllDefaultUOM();
    const uoms = await UOM.getAllUOM();
    // console.log('In sections >>>>>>>>>', sections?.length);
    // console.log('In hiddenfromSidebarValues >>>>>>>>>', hiddenfromSidebarValues?.length);
    // console.log('In expressionValues >>>>>>>>>', expressionValues?.length);
    // console.log('In errorValues >>>>>>>>>', errorValues?.length);

    if (sections?.length > 0) {
        fs.writeFileSync(`${layoutFilePath}${filename}`, JSON.stringify(sections, null, 2), 'utf8');
    }    
    if (fields && fields?.length>0) {
        fs.writeFileSync(`${layoutFilePath}SectionFields.json`, JSON.stringify(fields, null, 2), 'utf8');
    }
    
    if (validations && validations?.length>0) {
        fs.writeFileSync(`${layoutFilePath}FieldValidations.json`, JSON.stringify(validations, null, 2), 'utf8');
    }
    
    if (defaultValues && defaultValues?.length>0) {
        fs.writeFileSync(`${layoutFilePath}FieldDefaultValues.json`, JSON.stringify(defaultValues, null, 2), 'utf8');
    }

    if (disabledValues && disabledValues?.length>0) {
        fs.writeFileSync(`${layoutFilePath}FieldDisabledValues.json`, JSON.stringify(disabledValues, null, 2), 'utf8');
    }
    
    if (visibleValues && visibleValues?.length > 0) {
        fs.writeFileSync(`${layoutFilePath}FieldVisibleValues.json`, JSON.stringify(visibleValues, null, 2), 'utf8');
    }

    if (mandatoryValues && mandatoryValues?.length>0) {
        fs.writeFileSync(`${layoutFilePath}FieldMandatoryValues.json`, JSON.stringify(mandatoryValues, null, 2), 'utf8');
    }
    
    if (hiddenfromSidebarValues && hiddenfromSidebarValues?.length > 0) {
        fs.writeFileSync(`${layoutFilePath}FieldHiddenFromSidebarValues.json`, JSON.stringify(hiddenfromSidebarValues, null, 2), 'utf8');
    }

    if (expressionValues && expressionValues?.length>0) {
        fs.writeFileSync(`${layoutFilePath}FieldExpressions.json`, JSON.stringify(expressionValues, null, 2), 'utf8');
    }
    
    if (errorValues && errorValues?.length>0) {
        fs.writeFileSync(`${layoutFilePath}FieldErrors.json`, JSON.stringify(errorValues, null, 2), 'utf8');
    }

    if (optionsValues && optionsValues?.length>0) {
        fs.writeFileSync(`${layoutFilePath}FieldOptions.json`, JSON.stringify(optionsValues, null, 2), 'utf8');
    }

    if (groupValues && groupValues?.length>0) {
        fs.writeFileSync(`${layoutFilePath}FieldGroup.json`, JSON.stringify(groupValues, null, 2), 'utf8');
    }

    if(apiActionValues && apiActionValues?.length){
        fs.writeFileSync(`${layoutFilePath}FieldApiActions.json`, JSON.stringify(apiActionValues, null, 2), 'utf8');
    }

    if( defaultUOMs && defaultUOMs?.length>0) {
        fs.writeFileSync(`${layoutFilePath}DefaultUOMs.json`, JSON.stringify(defaultUOMs, null, 2), 'utf8');
    }

    if( uoms && uoms?.length>0) {
        fs.writeFileSync(`${layoutFilePath}UOMs.json`, JSON.stringify(uoms, null, 2), 'utf8');
    }

    
    // console.log(sections)
    
    return true;
}

const popupNames={
    3: "API2000Popup",
    23: "API2000Popup",
    24: "API2000Popup",
    12: "FireSizingPopup"
}

const PopupDBIds={
    "API2000Popup": 51,
    "FireSizingPopup": 52
}

const createPopupDetails = async (workFlowId) => {
    if(!popupNames[workFlowId]){
        console.error('Popup Layout not defined for this workflowId');
        return;
    }
    const filename = `${popupNames[workFlowId]}.json`;
    const layoutFilePath = path.join(__dirname, `../../../data/${filename}`);
    if (fs.existsSync(layoutFilePath)) {
        // Read from file
        // console.log('>>>>>>>>>>>>>>> In create WorkflowDetails ::: Layout file found<<<<<<<<<<<<<<<', filename);
        const fileData = fs.readFileSync(layoutFilePath, 'utf8');
        let layout = JSON.parse(fileData.replace(/^\uFEFF/, ''));
        const popupId=PopupDBIds[popupNames[workFlowId]];
        // console.log('>>>>>>>>>>>>>>> In create WorkflowDetails ::: Layout file found<<<<<<<<<<<<<<<', layout[0]);
        await createSections(workFlowId, [layout]);
        return true
    } else {
        console.error('Workflow layout file not found');
    }
}


const createWorkflowDetails = async (workFlowId) => {
    const filename = `workflowSections${workFlowId}.json`;
    const layoutFilePath = path.join(__dirname, `../../../data/${filename}`);
    if (fs.existsSync(layoutFilePath)) {
        const starttime = new Date();
        // Read from file
        // console.log('>>>>>>>>>>>>>>> In create WorkflowDetails ::: Layout file found<<<<<<<<<<<<<<<', filename);
        const fileData = fs.readFileSync(layoutFilePath, 'utf8');
        let layout = JSON.parse(fileData.replace(/^\uFEFF/, ''));
        // console.log('>>>>>>>>>>>>>>> In create WorkflowDetails ::: Layout file found >>> Processing Started <<<<<<<<<<<<<<<');
        await createSections(workFlowId, layout);
        // console.log('>>>>>>>>>>>>>>> In WorkflowDetails ::: Completed<<<<<<<<<<<<<<');
        if(popupNames[workFlowId]){
            // console.log('>>>>>>>>>>>>>>> In create PopupDetails ::: Start<<<<<<<<<<<<<<');
            await createPopupDetails(workFlowId);
            // console.log('>>>>>>>>>>>>>>> In create PopupDetails ::: Completed<<<<<<<<<<<<<<');
        }
        // console.log('<<<<<<<<<<<< 222222222222 >>>>>>>>>>>>>')
        // await createDataFiles();
        const timetaken = `${(new Date() - starttime)/1000}s`;
        console.log('<<<<<<<<<<<<finished loading >>>>>>>>>>>>> ',workFlowId, timetaken);
        return true
    } else {
        console.error('Workflow layout file not found');
    }
}





const deleteWorkflowDetails = async (workFlowId) => {
    // Implement deletion logic here
    await deleteSections(workFlowId);
}

module.exports = { 
    createWorkflowDetails, 
    deleteWorkflowDetails, 
    createPopupDetails,
    updateWorkFlowFile,
    createDataFiles,
    fetchSectionFieldsData,
    getValuesForFields
 };
