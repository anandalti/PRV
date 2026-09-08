const FieldMandatory = require("../../../models/WorkflowSection/FieldMandatory");
const { getFinalExpressions } = require("../../helper");
const { createExpressions } = require("./FieldExpressionData");

async function getMandatoryByFieldIds(FieldId) {
    try {
        const mandatoryValues = await FieldMandatory.getAllFieldMandatoryByFieldIds(FieldId);
        return mandatoryValues;
    } catch (err) {
        console.error('Error fetching mandatory values:', err);
        throw err;
    }   
}

async function getAllFieldsMandatory() {
    try {
        const mandatoryValues = await FieldMandatory.getAllFieldMandatory();
        return mandatoryValues;
    } catch (err) {
        console.error('Error fetching mandatory values:', err);
        throw err;
    }   
}

async function createMandatory(MandatoryValues,ExpresisoncheckFlag) {
    try {
        // const ExpresisoncheckFlag = Array.isArray(MandatoryValues) && MandatoryValues?.length > 0;
        if(ExpresisoncheckFlag){
            let expressions = [];
            let localFieldIds = [];
            let localMandatoryValues = [];
            let LocalExpresisoncheckFlag={}
            MandatoryValues?.forEach((mandValue, ind) => {
                const { target, FieldName, FieldId,value } = mandValue;
                localFieldIds.push(FieldId);
                localMandatoryValues.push(value);
                LocalExpresisoncheckFlag[FieldId]=ExpresisoncheckFlag[FieldName] || false;
                if(target!==undefined){
                    expressions.push({ fieldId: FieldId, target });
                }
            });
      
            const insertedValue = await FieldMandatory.createFieldMandatory({
                FieldId: localFieldIds,
                ExpresisoncheckFlag: LocalExpresisoncheckFlag,
                DefaultValue: localMandatoryValues
            });
            if(expressions?.length >0){
                const localExpressions = getFinalExpressions(localFieldIds, insertedValue, expressions, "MandatoryId");
                await createExpressions(localExpressions);
            }

        }else{
            const localMandatory=MandatoryValues[0]
            await FieldMandatory.createFieldMandatory({
                    FieldId: [localMandatory?.FieldId],
                    ExpresisoncheckFlag,
                    DefaultValue: [localMandatory?.value]
            });
            
        }
        // console.log('Mandatory value created successfully:');
    } catch (err) {
        console.error('Error creating mandatory value:', err);
        throw err;
    }
}

async function deleteMandatory(FieldId) {
    try {
        await FieldMandatory.deleteAllByFieldId(FieldId);
        console.log('Field Mandatory Values deleted successfully.');
    } catch (err) {
        console.error('Error deleting Field Mandatory Values:', err);
    }
}

module.exports = {createMandatory, deleteMandatory, getMandatoryByFieldIds, getAllFieldsMandatory};