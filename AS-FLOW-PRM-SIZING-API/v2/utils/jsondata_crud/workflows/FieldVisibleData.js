const FieldVisible = require("../../../models/WorkflowSection/FieldVisible");
const { getFinalExpressions } = require("../../helper");
const { createExpressions } = require("./FieldExpressionData");

async function getVisibleByFieldIds(FieldId) {
    try {
        const visibleValues = await FieldVisible.getAllFieldVisibleByFieldIds(FieldId);
        return visibleValues;   
    } catch (error) {
        console.error('Error fetching visible values:', error);
    }

}

async function getAllFieldsVisible() {
    try {
        const visibleValues = await FieldVisible.getAllFieldVisible();
        return visibleValues;   
    } catch (error) {
        console.error('Error fetching all visible values:', error);
    }

}

async function createVisible(VisibleValues, ExpresisoncheckFlag) {
    try {
        // const ExpresisoncheckFlag = Array.isArray(VisibleValues) && VisibleValues?.length > 0;
        if(ExpresisoncheckFlag){
            let expressions = [];
            let localFieldIds = [];
            let localVisibleValues = [];
            let LocalExpresisoncheckFlag={}
            VisibleValues?.forEach((mandValue, ind) => {
                const { target, FieldName, FieldId,value } = mandValue;
                localFieldIds.push(FieldId);
                localVisibleValues.push(value);
                LocalExpresisoncheckFlag[FieldId]=ExpresisoncheckFlag[FieldName] || false;
                if(target!==undefined){
                    expressions.push({ fieldId: FieldId, target });
                }
            });
      
            const insertedValue = await FieldVisible.createFieldVisible({
                FieldId: localFieldIds,
                ExpresisoncheckFlag: LocalExpresisoncheckFlag,
                DefaultValue: localVisibleValues
            });
            if(expressions?.length >0){
                const localExpressions = getFinalExpressions(localFieldIds, insertedValue, expressions, "VisibleId");
                await createExpressions(localExpressions);
            }
            
        }else{
            const localVisible=VisibleValues[0]
            await FieldVisible.createFieldVisible({
                    FieldId:[localVisible?.FieldId],
                    ExpresisoncheckFlag,
                    DefaultValue: [localVisible?.value]
                });
        }
        // console.log('Default value created successfully:', FieldId);
    } catch (err) {
        console.error('Error creating default value:', err);
        throw err;
    }
}

async function deleteVisible(FieldId) {
    try {
        await FieldVisible.deleteAllByFieldId(FieldId);
        console.log('Field Visible Values deleted successfully.');
    } catch (err) {
        console.error('Error deleting Field Visible Values:', err);
    }
}

module.exports = {createVisible, deleteVisible, getVisibleByFieldIds, getAllFieldsVisible};