const FieldDisabled = require("../../../models/WorkflowSection/FieldDisabled");
const { getFinalExpressions } = require("../../helper");
const { createExpressions } = require("./FieldExpressionData");

async function getDisabledByFieldIds(FieldId) {
    try {
        const disabledValues = await FieldDisabled.getAllFieldDisabledByFieldIds(FieldId);
        return disabledValues;
    } catch (error) {
        console.error('Error fetching disabled values:', error);
    }
}

async function getAllFieldsDisabled() {
    try {
        const disabledValues = await FieldDisabled.getAllFieldsDisabled();
        return disabledValues;
    } catch (error) {
        console.error('Error fetching disabled values:', error);
    }
}
async function createDisabled(DisabledValues,ExpresisoncheckFlag) {
    try {
        // const ExpresisoncheckFlag = Array.isArray(DisabledValues) && DisabledValues?.length > 0;
        if(ExpresisoncheckFlag){
            let expressions = [];
            let localFieldIds = [];
            let localDisabledValues = [];
            let LocalExpresisoncheckFlag={}
            DisabledValues?.forEach((disableValue, ind) => {
                const { target, FieldName, FieldId,value } = disableValue;
                localFieldIds.push(FieldId);
                localDisabledValues.push(value);
                LocalExpresisoncheckFlag[FieldId]=ExpresisoncheckFlag[FieldName] || false;
                if(target!==undefined){
                    expressions.push({ fieldId: FieldId, target });
                }
            });

            const insertedValue = await FieldDisabled.createFieldDisabled({
                FieldId: localFieldIds,
                ExpresisoncheckFlag: LocalExpresisoncheckFlag,
                DefaultValue: localDisabledValues
            });
            if(expressions?.length >0){
                const localExpressions = getFinalExpressions(localFieldIds, insertedValue, expressions, "DisabledId");
                await createExpressions(localExpressions);
            }
        }else{
            const localDisabled=DisabledValues[0]
            await FieldDisabled.createFieldDisabled({
                    FieldId: [localDisabled?.FieldId],
                    ExpresisoncheckFlag,
                    DefaultValue: [localDisabled?.value]
                });
        }
    } catch (err) {
        console.error('Error creating disabled value:', err);
        throw err;
    }
}

async function deleteDisabled(FieldId) {
    try {
        await FieldDisabled.deleteAllByFieldId(FieldId);
        console.log('Field Disabled Values deleted successfully.');
    } catch (err) {
        console.error('Error deleting Field Disabled Values:', err);
    }
}

module.exports = {createDisabled, deleteDisabled,getDisabledByFieldIds, getAllFieldsDisabled};