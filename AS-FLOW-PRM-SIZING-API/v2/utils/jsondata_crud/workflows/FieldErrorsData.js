const FieldErrors = require("../../../models/WorkflowSection/FieldErrors");
const fs = require('fs');
const path = require('path');

async function getAllErrors() {
    try {
        const errors = await FieldErrors.getAllErrors();
        return errors;
    } catch (error) {
        console.error('Error fetching all errors:', error);
        throw error;
    }
}
async function createError(errors) {
    try {
        if(errors?.length===0) return;
        let errList=[];
        let genericErrorList=[];
        // console.log('In Expression >>>>>>> ', expressions);
        const layoutFilePath = path.join(__dirname, `../../../data/genericErrors.json`);
        if (fs.existsSync(layoutFilePath)) {
            // Read from file
            // console.log('>>>>>>>>>>>>>>> In create WorkflowDetails ::: Layout file found<<<<<<<<<<<<<<<', filename);
            const fileData = fs.readFileSync(layoutFilePath, 'utf8');
            genericErrorList = JSON.parse(fileData);
        }
        errors.forEach( (error, ind) =>{
            // console.log('ind >>>>>>>>>>>>>> ',express, ind)
            const localMessage = genericErrorList.find( err => err.key === error.message);
            errList.push({
                FieldId: error.fieldId,
                ErrorId: error.ErrorId,
                MessageType: error.type,
                MessageId: error.message,
                Message: localMessage?.value ?? error.message,
                DynamicFlag: localMessage?.dynamic ?? error.dynamic ?? false,
            })
        });
        await FieldErrors.createFieldError(errList);
    } catch (err) {
        console.error('Error creating field error:', err);
        throw err;
    }
}
async function deleteErrors(FieldId) {
    try {
        await FieldErrors.deleteAllByFieldId(FieldId);
        console.log('Field Errors deleted successfully.');
    } catch (err) {
        console.error('Error deleting Field Errors:', err);
    }
}

module.exports = {createError, deleteErrors, getAllErrors};