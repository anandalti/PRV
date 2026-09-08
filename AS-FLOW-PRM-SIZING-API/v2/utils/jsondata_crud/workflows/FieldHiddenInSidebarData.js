const FieldHiddenInSidebar = require("../../../models/WorkflowSection/FieldHiddenInSidebar");
const { getFinalExpressions } = require("../../helper");
const { createExpressions } = require("./FieldExpressionData");

async function getHiddenFromSidebarByFieldIds(fieldIds) {
    try {
        const hiddenFields = await FieldHiddenInSidebar.getAllFieldHiddenInSidebarByFieldIds(fieldIds);
        return hiddenFields;
    } catch (error) {
        console.error('Error fetching hidden fields:', error);
        throw error;
    }
}

async function getAllFieldsHiddenFromSidebar() {
    try {
        const hiddenFields = await FieldHiddenInSidebar.getAllFieldHiddenInSidebar();
        return hiddenFields;
    } catch (error) {
        console.error('Error fetching hidden fields:', error);
        throw error;
    }
}

async function createHideFromSideBar(HideFromSideBarValues,ExpresisoncheckFlag) {
    try {
        // const ExpresisoncheckFlag = Array.isArray(HideFromSideBarValues) && HideFromSideBarValues?.length > 0;
        if (ExpresisoncheckFlag) {
            let expressions = [];
            let localFieldIds = [];
            let localHideFromSideBarValues = [];
            let LocalExpresisoncheckFlag={}
            HideFromSideBarValues?.forEach((mandValue, ind) => {
                const { target, FieldName, FieldId,value } = mandValue;
                localFieldIds.push(FieldId);
                localHideFromSideBarValues.push(value);
                LocalExpresisoncheckFlag[FieldId]=ExpresisoncheckFlag[FieldName] || false;
                if(target!==undefined){
                    expressions.push({ fieldId: FieldId, target });
                }
            });
      
            const insertedValue = await FieldHiddenInSidebar.createFieldHiddenInSidebar({
                FieldId: localFieldIds,
                ExpresisoncheckFlag: LocalExpresisoncheckFlag,
                DefaultValue: localHideFromSideBarValues
            });
            if(expressions?.length >0){
                const localExpressions = getFinalExpressions(localFieldIds, insertedValue, expressions, "SideHiddenId");
                await createExpressions(localExpressions);
            }
        } else {
            const localHideFromSideBar = HideFromSideBarValues[0];
            await FieldHiddenInSidebar.createFieldHiddenInSidebar({
                FieldId: [localHideFromSideBar?.FieldId],
                ExpresisoncheckFlag,
                DefaultValue: [localHideFromSideBar?.value]
            });
        }
        // console.log('Hide from sidebar value created successfully:', FieldId);
    } catch (err) {
        console.error('Error creating hide from sidebar value:', err);
        throw err;
    }
}

async function deleteHideFromSideBar(FieldId) {
    try {
        await FieldHiddenInSidebar.deleteAllByFieldId(FieldId);
        console.log('Field Hidden Values deleted successfully.');
    } catch (err) {
        console.error('Error deleting Field Hidden Values:', err);
    }
}

module.exports = {createHideFromSideBar, deleteHideFromSideBar, getHiddenFromSidebarByFieldIds, getAllFieldsHiddenFromSidebar};