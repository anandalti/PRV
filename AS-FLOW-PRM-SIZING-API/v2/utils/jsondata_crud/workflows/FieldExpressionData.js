const FieldExpression = require("../../../models/WorkflowSection/FieldExpression");

async function getExpressionsByExpressionIds(ExpressionIds) {
    try {
        const expressions = await FieldExpression.getAllByExpressionIds(ExpressionIds);
        return expressions;
    } catch (error) {
        console.error('Error fetching expressions by ExpressionIds:', error);
        throw error;
    }
}

async function getAllFieldsExpressions() {
    try {
        const expressions = await FieldExpression.getAllFieldsExpressions();
        return expressions;
    } catch (error) {
        console.error('Error fetching all field expressions:', error);
        throw error;
    }
}

async function createExpressions(expressions) {
    try {
        if(expressions?.length===0) return;
        let expList=[];
        // console.log('In Expression >>>>>>> ', expressions);
        expressions.forEach( (express, ind) =>{
            // console.log('ind >>>>>>>>>>>>>> ',express, ind)
            const {fieldId, target,ExpressionId,value:ExpValue} = express;
            const { id, symbol, focusedField, currentId, expression: expr, expectedResultType, expressionReqFields, expectedValue, uom, nextRound, value } = target;
            // console.log('express >>>>> ',ind,express,value)
            const localExpressionReqFields = Array.isArray(expressionReqFields) ? expressionReqFields.join(',') : expressionReqFields;
            const localExpectedValue=  Array.isArray(expectedValue) ? expectedValue.join(',') : expectedValue;
            const uomField= uom===undefined?'' : typeof uom === 'string' ? uom : JSON.stringify(uom);

            expList.push({
                FieldId:fieldId,
                ExpressionId,
                TargetField: id,
                Symbol:symbol,
                FocusedField:focusedField,
                CurrentId:currentId,
                Expression: expr,
                ExpectedResultType:expectedResultType,
                ExpressionReqFields: localExpressionReqFields,
                ExpectedValue:localExpectedValue,
                Uom:uomField,
                NextRound:nextRound,
                Value:value ?? ExpValue
            })
        });
        // console.log('In Expression >>>>>>> ', expList);
        await FieldExpression.createFieldExpression(expList);
        
        // console.log('Expressions created successfully. >> ',FieldId);
    } catch (err) {
        console.error('Error creating expressions:', err);
        throw err;
    }
}

async function deleteExpressions(ExpressionId) {
    try {
        const fieldExpressions = await FieldExpression.getAllByExpresisonId(ExpressionId);
        if (fieldExpressions.length === 0) return;

        await FieldExpression.deleteAllByExpresisonId(ExpressionId);
        console.log('Field Expressions deleted successfully.');
    } catch (err) {
        console.error('Error deleting Field Expressions:', err);
        throw err;
    }
}

async function deleteExpressionsByFieldId(FieldId) {
    try {
        await FieldExpression.deleteAllByFieldId(FieldId);
        console.log('Field Expressions deleted successfully.');
    } catch (err) {
        console.error('Error deleting Field Expressions:', err);
    }
}

module.exports = { createExpressions, deleteExpressions, 
    deleteExpressionsByFieldId,
    getExpressionsByExpressionIds,
    getAllFieldsExpressions
};