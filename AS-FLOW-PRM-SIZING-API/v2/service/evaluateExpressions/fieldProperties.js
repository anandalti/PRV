const { CALCULATE } = require("../../utils/constants");
const { evaluateExpression } = require("../../utils/parse");
const { pool } = require("../../db/pgsqldb");
const { getDefaultUnits } = require("./getDefaultUnits");

const fetchDisabledFieldExpressions = async (name, workflowId) => {
    const data = await pool.query(
        `SELECT * FROM "SectionFieldDetails" sfd INNER JOIN "WorkflowSectionDetails" wsd ON sfd."SectionId" = wsd."SectionId" INNER JOIN "FieldExpression" fe ON fe."FieldId" = sfd."FieldId" INNER JOIN "FieldDisabled" fd ON fd."FieldId" = fe."FieldId" and fd."DisabledId"=fe."ExpressionId" WHERE fe."FocusedField" = $1 AND wsd."WorkflowId" = $2`,
        [name, workflowId]
    );
    return data.rows;
}

const fetchVisibleFieldExpressions = async (name, workflowId) => {
    const data = await pool.query(
        `SELECT * FROM "SectionFieldDetails" sfd INNER JOIN "WorkflowSectionDetails" wsd ON sfd."SectionId" = wsd."SectionId" INNER JOIN "FieldExpression" fe ON fe."FieldId" = sfd."FieldId" INNER JOIN "FieldVisible" fv ON fv."FieldId" = fe."FieldId" and fv."VisibleId"=fe."ExpressionId" WHERE fe."FocusedField" = $1 AND wsd."WorkflowId" = $2`,
        [name, workflowId]
    );
    return data.rows;
}

const fetchMandatoryFieldExpressions = async (name, workflowId) => {
    const data = await pool.query(
        `SELECT * FROM "SectionFieldDetails" sfd INNER JOIN "WorkflowSectionDetails" wsd ON sfd."SectionId" = wsd."SectionId" INNER JOIN "FieldExpression" fe ON fe."FieldId" = sfd."FieldId" INNER JOIN "FieldMandatory" fm ON fm."FieldId" = fe."FieldId" and fm."MandatoryId"=fe."ExpressionId" WHERE fe."FocusedField" = $1 AND wsd."WorkflowId" = $2`,
        [name, workflowId]
    );
    return data.rows;
}

const evaluatePropertyExpressions = async (expressions, inputs) => {
    const propertyVals = {};
    await Promise.all(expressions.map(async (expression) => {
       // const { Symbol, Expression:express, CurrentId, ExpressionReqFields } = expression;
        const { Symbol, Expression:express, CurrentId, ExpressionReqFields, Uom } = expression;
        if(Symbol == CALCULATE || Symbol === 'Validate_function') {
            const variables = ExpressionReqFields.split(',').reduce((acc, field) => {
                acc[field] = inputs[field] ?? '';
                return acc;
            }, {});
            // console.log('evaluatePropertyExpressions >>>>', Symbol, express, CurrentId, variables);
            const { convertedValues } = await getDefaultUnits(inputs, variables, CurrentId, Uom);
            try {
                const evalVal = evaluateExpression(express, convertedValues);
                // console.log('evaluatePropertyExpressions >>>>', evalVal);
                // propertyVals.push({ [CurrentId]: evalVal });
                // if(expression?.ExpressionId?.indexOf('VISIBLE') !== -1 && CurrentId==='PumpOutRate'){
                //     console.log('visibleValues >>>>>',expression,express,CurrentId, variables, evalVal);
                // }
                propertyVals[CurrentId] = evalVal;
            } catch (error) {
                console.error('Error evaluating property expression for field:', CurrentId, error.message);
            }
        }
    }));
    return propertyVals;
}

module.exports = {
    fetchDisabledFieldExpressions,
    fetchVisibleFieldExpressions,
    fetchMandatoryFieldExpressions,
    evaluatePropertyExpressions
};