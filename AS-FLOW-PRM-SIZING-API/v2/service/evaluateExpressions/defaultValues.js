const { CALCULATE } = require("../../utils/constants");
const { evaluateExpression } = require("../../utils/parse");
const { pool } = require("../../db/pgsqldb");
const { getDefaultUnits, getReceivedUnit } = require("./getDefaultUnits");

const fetchDefaultValues = async (fieldName, workflowId) => {
    const data = await pool.query(
        `SELECT * FROM "SectionFieldDetails" sfd INNER JOIN "WorkflowSectionDetails" wsd ON sfd."SectionId" = wsd."SectionId" INNER JOIN "FieldExpression" fe ON fe."FieldId" = sfd."FieldId" INNER JOIN "FieldDefaultValue" fd ON fd."FieldId" = fe."FieldId" and fd."DefaultValueId"=fe."ExpressionId" WHERE fe."FocusedField" = $1 AND wsd."WorkflowId" = $2`,
        [fieldName, workflowId]
    );
    return data.rows;
}

const evaluateDefaultValues = async (defaultValues, inputs, focusedField) => {
    let newInputs = {};
    let pressurePercentage;
    // Pressure is the source of its displayed percentage when a rule input changes.
    // Run the pressure rule first even if the database returns the percentage first.
    const derivePressure = inputs.IsMultivalve === true
        && ['SetPressure', 'SystemMAWP', 'SizingBasis', 'IsMultivalve', 'IsASMESection8'].includes(focusedField);
    const values = derivePressure
        ? [...defaultValues].sort((a, b) => Number(b.CurrentId === 'OverPressure') - Number(a.CurrentId === 'OverPressure'))
        : defaultValues;
    for (const defaultValObj of values) {
        const { Symbol, Expression, CurrentId, ExpressionReqFields, Uom } = defaultValObj;
        // A derived percentage must never trigger the user's percentage-input rule.
        if (derivePressure && CurrentId === 'OverPressure' && defaultValObj.FocusedField === 'OverPressurePer') continue;
        if (derivePressure && CurrentId === 'OverPressurePer' && newInputs.OverPressure !== undefined) continue;
        if (Symbol == CALCULATE || Symbol === 'Validate_function') {
            const currentInputs = derivePressure ? { ...inputs, ...newInputs } : inputs;
            const variables = ExpressionReqFields.split(',').reduce((acc, field) => {
                acc[field] = currentInputs[field] ?? '';
                return acc;
            }, {});
            // get converted Values
            const { convertedValues, receivedUOM, defaultUom } = await getDefaultUnits(currentInputs, variables, CurrentId, Uom);
            try {
                const evalVal = evaluateExpression(Expression, convertedValues);
                // if(CurrentId=='Omega'){
                //     console.log('Evaluated default value >>>>> ', {CurrentId, evalVal,Expression});
                // }
                const convertedEvalValue = await getReceivedUnit(currentInputs, {[CurrentId]: isNaN(evalVal)?'' : evalVal}, receivedUOM, defaultUom);
                newInputs = {...newInputs, ...convertedEvalValue};
                if (derivePressure && CurrentId === 'OverPressure') {
                    const setPressure = Number(convertedValues.SetPressure);
                    pressurePercentage = evalVal === '' || !Number.isFinite(setPressure) || setPressure <= 0
                        || !Number.isFinite(Number(evalVal)) ? '' : 100 * Number(evalVal) / setPressure;
                }
            } catch (error) {
                console.error('Error evaluating default values:', {error,defaultValObj,Expression, convertedValues});
            }
            // const evalVal = evaluateExpression(Expression, convertedValues);
            // const convertedEvalValue = await getReceivedUnit(inputs, {[CurrentId]: evalVal}, receivedUOM, defaultUom);
            // newInputs = {...newInputs, ...convertedEvalValue};
        }
    }
    if (pressurePercentage !== undefined) {
        // Both operands are in the configured rule's pressure unit, before display conversion.
        newInputs.OverPressurePer = pressurePercentage;
    }
    return {...newInputs};
}

module.exports = {
    fetchDefaultValues,
    evaluateDefaultValues
};
