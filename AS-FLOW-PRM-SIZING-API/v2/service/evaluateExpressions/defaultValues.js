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

const evaluateDefaultValues = async (defaultValues, inputs) => {
    let newInputs = {};
    for (const defaultValObj of defaultValues) {
        const { Symbol, Expression, CurrentId, ExpressionReqFields, Uom } = defaultValObj;
        if (Symbol == CALCULATE || Symbol === 'Validate_function') {
            const variables = ExpressionReqFields.split(',').reduce((acc, field) => {
                acc[field] = inputs[field] ?? '';
                return acc;
            }, {});
            // get converted Values
            const { convertedValues, receivedUOM, defaultUom } = await getDefaultUnits(inputs, variables, CurrentId, Uom);
            try {
                const evalVal = evaluateExpression(Expression, convertedValues);
                // if(CurrentId=='Omega'){
                //     console.log('Evaluated default value >>>>> ', {CurrentId, evalVal,Expression});
                // }
                const convertedEvalValue = await getReceivedUnit(inputs, {[CurrentId]: isNaN(evalVal)?'' : evalVal}, receivedUOM, defaultUom);
                newInputs = {...newInputs, ...convertedEvalValue};
            } catch (error) {
                console.error('Error evaluating default values:', {error,defaultValObj,Expression, convertedValues});
            }
            // const evalVal = evaluateExpression(Expression, convertedValues);
            // const convertedEvalValue = await getReceivedUnit(inputs, {[CurrentId]: evalVal}, receivedUOM, defaultUom);
            // newInputs = {...newInputs, ...convertedEvalValue};
        }
    }
    return {...newInputs};
}

module.exports = {
    fetchDefaultValues,
    evaluateDefaultValues
};