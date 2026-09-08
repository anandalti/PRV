const FieldApiCallAction = require("../../../models/WorkflowSection/FieldApiCallAction");

async function getAllFieldApiActions() {
    try {
        const apiActions = await FieldApiCallAction.getAllFieldApiCallAction();
        return apiActions;
    } catch (err) {
        console.error('Error fetching default values:', err);
        throw err;
    }
}


async function getFieldApiActionsByFieldIds(FieldId) {
    try {
        const apiActions = await FieldApiCallAction.getAllFieldApiCallActionByFieldIds(FieldId);
        return apiActions;
    } catch (err) {
        console.error('Error fetching default values:', err);
        throw err;
    }
}

async function createApiCallAction(apiCallActions) {
    try {
        let ApiPayload=[];
        if(apiCallActions?.length>0){
            for (const action of apiCallActions) {
                const {target,FieldId}=action
                const { id, symbol, method, actionType, url, api, currentFields, apiParameters, apiResponseParams } = target;
                let localcurrentFields= currentFields ?? apiParameters;
                localcurrentFields = Array.isArray(localcurrentFields) ? localcurrentFields.join(',') : localcurrentFields;
                const ResponseParams = Array.isArray(apiResponseParams) ? apiResponseParams.join(',') : apiResponseParams;
                const localUrl= url ?? api;
                const localPayload={
                    FieldId,
                    Symbol:symbol,
                    Method:method,
                    ActionType:actionType,
                    Url:localUrl,
                    RequestParams: localcurrentFields ?? '',
                    ResponseParams: ResponseParams ?? ''
                }
                // console.log(action,localPayload)
                ApiPayload.push(localPayload);
            }
        }
        await FieldApiCallAction.createFieldApiCallAction(ApiPayload);
        // console.log('API Call Actions created successfully.');
    } catch (err) {
        console.error('Error creating API Call Actions:', err);
        throw err;
    }
}

async function deleteApiCallAction(FieldId) {
    try {
        await FieldApiCallAction.deleteFieldApiCallAction(FieldId);
        console.log('API Call Actions deleted successfully.');
    } catch (err) {
        console.error('Error deleting API Call Actions:', err);
    }
}

module.exports = { createApiCallAction, deleteApiCallAction,  getFieldApiActionsByFieldIds, getAllFieldApiActions};
                