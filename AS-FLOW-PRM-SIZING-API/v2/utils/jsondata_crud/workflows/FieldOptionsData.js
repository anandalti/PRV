const FieldOptions = require("../../../models/WorkflowSection/FieldOptions");

async function getAllFieldsOptions() {
    try {
        const options = await FieldOptions.getAllFieldOptions();
        return options;
    } catch (error) {
        console.error('Error fetching field options:', error);
        throw error;
    }

}
async function getOptionsByFieldIds(FieldId) {
    try {
        const options = await FieldOptions.getFieldOptionsByFieldIds(FieldId);
        return options;
    } catch (error) {
        console.error('Error fetching field options:', error);
        throw error;
    }

}
async function createOptions(fieldIds, options) {
    try {
        const field=fieldIds[0];
        const FieldId = field.FieldId;
        for (const option of options) {
            const { label, value } = option;
            await FieldOptions.createFieldOption({
                FieldId,
                Label: label,
                Value: value
            });
        }
    } catch (err) {
        console.error('Error creating options:', err);
        throw err;
    }
}

async function deleteOptions(FieldId) {
    try {
        await FieldOptions.deleteAllByFieldId(FieldId);
        console.log('Field Options deleted successfully.');
    } catch (err) {
        console.error('Error deleting Field Options:', err);
    }
}

module.exports = {createOptions, deleteOptions, getOptionsByFieldIds, getAllFieldsOptions};