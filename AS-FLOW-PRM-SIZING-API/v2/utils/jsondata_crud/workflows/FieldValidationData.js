const FieldValidations = require("../../../models/WorkflowSection/FieldValidations");
const { createError } = require("./FieldErrorsData");
const { createExpressions } = require("./FieldExpressionData");

async function getValidationsByFieldIds(fieldIds) {
    try {
        const validations = await FieldValidations.getAllValidationsByFieldIds(fieldIds);
        return validations;
    } catch (error) {
        console.error('Error fetching field validations:', error);
        throw error;
    }

}

async function getFieldValidations() {
    try {
        const validations = await FieldValidations.getFieldValidations();
        return validations;
    } catch (error) {
        console.error('Error fetching field validations:', error);
        throw error;
    }

}

async function createValidations(fieldIds,validations) {
    try {
        let expressions = [];
        let errors = [];
        let localFieldIds = []; 
    
        validations?.forEach((validation,ind) => {
            const { target,message,FieldName,FieldId  } = validation;
            localFieldIds.push(FieldId);
            expressions.push({ fieldId: FieldId, target });
            errors.push({ fieldId: FieldId, type: message?.type, message: message?.message, dynamic: message?.dynamic || false });
        });

        // console.log('In Validations >>>>>>.', { validations, localFieldIds, expressions, errors });

        const insertedValidation = await FieldValidations.createFieldValidation({
            fieldIds: localFieldIds,
        });
        
        const localExpressions = []; 
        const localErrors = [];
        // console.log('In Field Creation >>>> ', {insertedValidation,expressions,errors});
        insertedValidation.forEach((v,ind) => {
            if(expressions[ind]?.fieldId===v.FieldId){
                localExpressions.push({ ...expressions[ind], ExpressionId: v.ValidationId });
            }
            if (errors[ind]?.fieldId === v.FieldId) {
                localErrors.push({ ...errors[ind], ErrorId: v.ValidationId });
            }
        });
        // console.log('In Validations >>>>>>>>> ',localExpressions)
        await createExpressions(localExpressions);
        // console.log('In Validations >>>>>>>>> ',localErrors)
        await createError(localErrors);

        // console.log('Validations created successfully. >> ', fieldIds);
    } catch (err) {
        console.error('Error creating validations:', err);
        throw err;
    }
}

async function deleteValidations(FieldId) {
    try {
        await FieldValidations.deleteAllByFieldId(FieldId);
        console.log('Field Validations deleted successfully.');
    } catch (err) {
        console.error('Error deleting Field Validations:', err);
        throw err;
    }
}

module.exports = { createValidations, deleteValidations, getValidationsByFieldIds, getFieldValidations };