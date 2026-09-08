const { CALCULATE } = require("../../utils/constants");
const { evaluateExpression } = require("../../utils/parse");
const { pool } = require("../../db/pgsqldb");
const { getDefaultUnits } = require("./getDefaultUnits");

const _fieldPropertiesCache = new Map();

const getFieldProperties = async (name, workflowId) => {
    const cacheKey = `${name}:${workflowId}`;
    if (_fieldPropertiesCache.has(cacheKey)) {
        return _fieldPropertiesCache.get(cacheKey);
    }
    try {
        const data = await pool.query(
            `SELECT public."FUNC_GetFieldProperties_Optimized"($1, $2)`,
            [name, workflowId]
        );
        const result = data.rows[0]['FUNC_GetFieldProperties_Optimized'];
        // console.log('getFieldProperties >>>>>  ', data,name, workflowId, result['focused_validations']);
        _fieldPropertiesCache.set(cacheKey, result);
        return result;
    } catch (error) {
        const data = await pool.query(
            `SELECT public."FUNC_GetFieldProperties"($1, $2)`,
            [name, workflowId]
        );
        const result = data.rows[0]['FUNC_GetFieldProperties'];
        _fieldPropertiesCache.set(cacheKey, result);
        return result;
    }
}

const clearFieldPropertiesCache = () => { _fieldPropertiesCache.clear(); };

const fetchValidationExpressions = async (name, workflowId) => {
    const data = await pool.query(
        `SELECT * FROM "SectionFieldDetails" sfd INNER JOIN "WorkflowSectionDetails" wsd ON sfd."SectionId" = wsd."SectionId" INNER JOIN "FieldValidations" fv ON fv."FieldId" = sfd."FieldId" INNER JOIN "FieldExpression" fe ON fe."FieldId" = fv."FieldId" AND fe."ExpressionId" = fv."ValidationId" INNER JOIN "FieldErrors" Er ON Er."FieldId" = sfd."FieldId" and Er."ErrorId"=fv."ValidationId" WHERE sfd."FieldName" = $1 AND wsd."WorkflowId" = $2`,
        [name, workflowId]
    );
    return data.rows;
}

const fetchFocusedFieldExpressions = async (name, workflowId) => {
    const data = await pool.query(
        `SELECT * FROM "SectionFieldDetails" sfd INNER JOIN "WorkflowSectionDetails" wsd ON sfd."SectionId" = wsd."SectionId" INNER JOIN "FieldValidations" fv ON fv."FieldId" = sfd."FieldId" INNER JOIN "FieldExpression" fe ON fe."FieldId" = fv."FieldId" AND fe."ExpressionId" = fv."ValidationId" INNER JOIN "FieldErrors" Er ON Er."FieldId" = sfd."FieldId" and Er."ErrorId"=fv."ValidationId" WHERE fe."FocusedField" = $1 AND wsd."WorkflowId" = $2`,
        [name, workflowId]
    );
    return data.rows;
}

const checkPressureVacuumFields = (currentField, recievedInputs, fieldProperties) => {
    const { visible_fields, disabled_fields, mandatory_fields } = fieldProperties;
    const pressureFields = ['FluidName', 'MolWeight', 'KCpByCv', 'Compressibility', 'SystemMAWP', 'SetPressure', 'OverPressurePer', 'OverPressure', 'BuiltUp', 'ConstantSuperimposed', 'VariableSuperimposed', 'TotalBackPressure', 'InletLossPer', 'inletLoss', 'Relieving', 'Wreq', 'PumpInRate','DeltaPressure','VesselPressure','RequiredCapacityMethod','ProductInTank'];
    const disabledPressureFields = ['FluidName', 'MolWeight', 'KCpByCv', 'Compressibility','RequiredCapacityMethod','ProductInTank'];
    const visiblePressureFields = ['SystemMAWP', 'SetPressure', 'OverPressurePer', 'OverPressure', 'BuiltUp', 'ConstantSuperimposed', 'VariableSuperimposed', 'TotalBackPressure', 'InletLossPer', 'inletLoss', 'Relieving', 'Wreq', 'PumpInRate','DeltaPressure','VesselPressure','ProductInTank'];
    const mandatoryPressureFields = ['MolWeight', 'KCpByCv', 'Compressibility', 'SetPressure', 'OverPressurePer', 'OverPressure', 'Relieving', 'PumpInRate','DeltaPressure','VesselPressure'];
    const vacuumFields = ['FluidNameVacuum', 'MolWeightVacuum', 'KCpByCvVacuum', 'CompressibilityVacuum', 'SystemMAWV', 'SetVacuum', 'UnderPressurePer', 'UnderPressure', 'RelievingforVacuum', 'WreqV', 'PumpOutRate','DeltaPressureVacuum','VesselVacuum'];
    const disabledVacuumFields = ['FluidNameVacuum', 'MolWeightVacuum', 'KCpByCvVacuum', 'CompressibilityVacuum'];
    const visibleVacuumFields = ['SystemMAWV', 'SetVacuum', 'UnderPressurePer', 'UnderPressure', 'RelievingforVacuum', 'WreqV', 'PumpOutRate','DeltaPressureVacuum','VesselVacuum'];
    const mandatoryVacuumFields = ['MolWeightVacuum', 'KCpByCvVacuum', 'CompressibilityVacuum', 'SetVacuum', 'UnderPressurePer', 'UnderPressure', 'RelievingforVacuum', 'PumpOutRate','DeltaPressureVacuum','VesselVacuum'];
    const visibleExpressions = visible_fields.filter(exp => ![...pressureFields,...vacuumFields].includes(exp.CurrentId));
    const disabledExpressions = disabled_fields.filter(exp => ![...pressureFields,...vacuumFields].includes(exp.CurrentId));
    const mandatoryExpressions = mandatory_fields.filter(exp => ![...pressureFields,...vacuumFields].includes(exp.CurrentId));
    const { FieldName, FieldValue } = currentField;
    const inputs = {};
    const disabledFields = {};
    const visibleFields = {};
    const mandatoryFields = {};
    if ( FieldName==='IsVacuumOnly' && !FieldValue ) {
        inputs[FieldName] = FieldValue;
        inputs['IsPressureOnly'] = true;
        vacuumFields.forEach(field => {
            if(disabledVacuumFields.includes(field)) {
                disabledFields[field] = true;
            }
            if(visibleVacuumFields.includes(field)) {
                disabledFields[field] = true;
                visibleFields[field] = false;
            }
            if(mandatoryVacuumFields.includes(field)) {
                mandatoryFields[field] = false;
            }
        });
        pressureFields.forEach(field => {
            if(disabledPressureFields.includes(field)) {
                disabledFields[field] = false;
            }
            if(visiblePressureFields.includes(field)) {
                disabledFields[field] = false;
                visibleFields[field] = true;
            }
            if(mandatoryPressureFields.includes(field)) {
                mandatoryFields[field] = true;
            }
        });
    } else if ( FieldName==='IsPressureOnly' && !FieldValue )  {
        inputs[FieldName] = FieldValue;
        inputs['IsVacuumOnly'] = true;
        pressureFields.forEach(field => {
            if(disabledPressureFields.includes(field)) {
                disabledFields[field] = true;
            }
            if(visiblePressureFields.includes(field)) {
                disabledFields[field] = true;
                visibleFields[field] = false;
            }
            if(mandatoryPressureFields.includes(field)) {
                mandatoryFields[field] = false;
            }
        });
        vacuumFields.forEach(field => {
            if(disabledVacuumFields.includes(field)) {
                disabledFields[field] = false;
            }
            if(visibleVacuumFields.includes(field)) {
                disabledFields[field] = false;
                visibleFields[field] = true;
            }
            if(mandatoryVacuumFields.includes(field)) {
                mandatoryFields[field] = true;
            }
        });
    } else if ( FieldName==='IsVacuumOnly' && FieldValue ) {
        inputs[FieldName] = FieldValue;
        vacuumFields.forEach(field => {
            if(disabledVacuumFields.includes(field)) {
                disabledFields[field] = false;
            }
            if(visibleVacuumFields.includes(field)) {
                disabledFields[field] = false;
                visibleFields[field] = true;
            }
            if(mandatoryVacuumFields.includes(field)) {
                mandatoryFields[field] = true;
            }
        });
    } else if ( FieldName==='IsPressureOnly' && FieldValue ) {
        inputs[FieldName] = FieldValue;
        pressureFields.forEach(field => {
            if(disabledPressureFields.includes(field)) {
                disabledFields[field] = false;
            }
            if(visiblePressureFields.includes(field)) {
                disabledFields[field] = false;
                visibleFields[field] = true;
            }
            if(mandatoryPressureFields.includes(field)) {
                mandatoryFields[field] = true;
            }
        });
    }
    return { disabledFields, visibleFields, mandatoryFields, inputs, visibleExpressions, disabledExpressions, mandatoryExpressions };
}

const validate = async (uoms, validations, inputs, field) => {
    const errors = [];

    for (const validation of validations) {
        const { Symbol, FieldName, CurrentId, TargetField, Expression, ExpressionReqFields, MessageType, Message,MessageId,  DynamicFlag, ExpectedValue, Uom } = validation;
        if(Symbol == CALCULATE || Symbol === 'Validate_function') {
            const variables = ExpressionReqFields.split(',').reduce((acc, curField) => {
                acc[curField] = inputs[curField] ?? '';
                return acc;
            }, {});
            variables[field.FieldName] = field.FieldValue;
            const { convertedValues } = await getDefaultUnits(inputs, variables, CurrentId, Uom);
            const isError = evaluateExpression(Expression, convertedValues);
            if (isError) {
                let messageString = Message;
                if(DynamicFlag) {
                    const expectedValues = ExpectedValue.split(',').reduce((acc, value, index) => {
                        acc[index] = evaluateExpression(value, convertedValues);
                        return acc;
                    }, {});
                    expectedValues[0] = uoms.find(uom => uom.UnitKey === Uom)?.UnitName || expectedValues[0];
                    
                    Object.keys(expectedValues)?.forEach((key)=>{
                        if(key != '0') {
                            expectedValues[key] = !isNaN(Number(expectedValues[key])) ? Number(expectedValues[key]).toFixed(3) : expectedValues[key];
                        }
                        // messageString = messageString.replace(new RegExp(`<<\\$${key}>>`, 'g'), expectedValues[key]);
                        messageString = messageString.split(`<<$${key}>>`).join(String(expectedValues[key]));
                    });
                }
                errors.push({FieldName: FieldName ?? CurrentId, TargetField, type:MessageType, MessageId, messageString});
            }
        }
    }
    return errors;
}

module.exports = {
    getFieldProperties,
    clearFieldPropertiesCache,
    fetchValidationExpressions,
    fetchFocusedFieldExpressions,
    validate,
    checkPressureVacuumFields
};