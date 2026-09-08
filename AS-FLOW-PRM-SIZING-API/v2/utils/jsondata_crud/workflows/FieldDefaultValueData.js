const FieldDefaultValue = require("../../../models/WorkflowSection/FieldDefaultValue");
const { getFinalExpressions } = require("../../helper");
const { createExpressions } = require("./FieldExpressionData");

async function getDefaultValuesByFieldIds(FieldId) {
    try {
        const defaultValues = await FieldDefaultValue.getAllFieldDefaultValueByFieldIds(FieldId);
        return defaultValues;
    } catch (err) {
        console.error('Error fetching default values:', err);
        throw err;
    }
}

async function getAllFieldsDefaultValues() {
    try {
        const defaultValues = await FieldDefaultValue.getAllFieldsDefaultValues();
        return defaultValues;
    } catch (err) {
        console.error('Error fetching default values:', err);
        throw err;
    }
}

async function createDefaultValue(defaultValues,ExpresisoncheckFlag) {
    try {
        // const ExpresisoncheckFlag = Array.isArray(defaultValues) && defaultValues?.length > 0;
        // if(ExpresisoncheckFlag){
            let expressions = [];
            let localFieldIds = [];
            let localDefaultValues = [];
            let LocalExpresisoncheckFlag={}
            defaultValues?.forEach((defvalue, ind) => {
                const { target, FieldName, FieldId, value } = defvalue;
                localFieldIds.push(FieldId);
                LocalExpresisoncheckFlag[FieldId]=ExpresisoncheckFlag[FieldName] || false;
                localDefaultValues.push(value);
                if(target!==undefined){
                    expressions.push({ fieldId: FieldId, target });
                }
            });
      
            const insertedDefaultValue = await FieldDefaultValue.createFieldDefaultValue({
                FieldId: localFieldIds,
                ExpresisoncheckFlag:LocalExpresisoncheckFlag,
                DefaultValue: localDefaultValues
            });
            if(expressions?.length >0){
                // console.log('In Default Expresison 11111 >>>>>>>>>>>>>>>> ',localFieldIds,expressions,insertedDefaultValue)
                const localExpressions = getFinalExpressions(localFieldIds, insertedDefaultValue, expressions, "DefaultValueId");
                // console.log('In Default Expresison 22222 >>>>>>>>>>>>>>>> ',localExpressions)
                await createExpressions(localExpressions);
            }
            
        // }else{
        //     const localDefaultValues=defaultValues[0]
        //     await FieldDefaultValue.createFieldDefaultValue({
        //             FieldId: [localDefaultValues?.FieldId],
        //             ExpresisoncheckFlag,
        //             DefaultValue: [localDefaultValues?.value]
        //         });
        // }
        // console.log('Default value created successfully:');
    } catch (err) {
        console.error('Error creating default value:', err);
        throw err;
    }
}

async function deleteDefaultValues(FieldId) {
    try {
        await FieldDefaultValue.deleteAllByFieldId(FieldId);
        console.log('Field Default Values deleted successfully.');
    } catch (err) {
        console.error('Error deleting Field Default Values:', err);
    }
}

module.exports = {createDefaultValue, deleteDefaultValues,getDefaultValuesByFieldIds,getAllFieldsDefaultValues};