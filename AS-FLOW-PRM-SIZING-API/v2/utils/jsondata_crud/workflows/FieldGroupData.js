const FieldGroup = require("../../../models/WorkflowSection/FieldGroup");

async function getAllFieldsGroup() {
    try {
        const groupValues = await FieldGroup.getAllFieldGroups();
        return groupValues;
    } catch (error) {
        console.error('Error fetching group values:', error);
        throw error;
    }
}

async function getAllGroupValuesByFieldIds(fieldIds) {
    try {
        const groupValues = await FieldGroup.getFieldGroupByFieldIds(fieldIds);
        return groupValues;
    } catch (error) {
        console.error('Error fetching group values:', error);
        throw error;
    }
}
async function createGroupValues(fieldIds, fieldGroupType, fieldGroupName, defaultSelected) {
    try {
        const Field=fieldIds[0];
        const {FieldId} = Field;
        await FieldGroup.createFieldGroup({
            FieldId,
            FieldGroupType: fieldGroupType,
            FieldGroupName: fieldGroupName,
            DefaultSelected: defaultSelected
        });
    } catch (err) {
        console.error('Error creating group values:', err);
        throw err;
    }
}

async function deleteGroupValues(FieldId) {
    try {
        await FieldGroup.deleteAllByFieldId(FieldId);
        console.log('Field Groups deleted successfully.');
    } catch (err) {
        console.error('Error deleting Field Groups:', err);
    }
}

module.exports = {createGroupValues, deleteGroupValues, getAllGroupValuesByFieldIds, getAllFieldsGroup};