'use strict';

const { getPopupDetails, getRestrictedLIftDetails } = require('../../layoutjsons/layoutServiceJson');
const { FieldUomConversion } = require('../../fieldCalculations/FieldUomConversion');
const { saveRecordUsingSP } = require('../../../controllers/SaveWorkflowRecordController');
const { evalInputs } = require('../../../controllers/ValidateController');
const {
    calculateLiftRestrictions,
    calculateRestrictedLiftCapacity,
} = require('../../calculations/RestrictedLiftCalculations');
const RestrictedLiftData = require('../../../models/RestrictedLiftData');

const createInputError = (message) => {
    const err = new Error(message);
    err.code = 'BAD_USER_INPUT';
    err.status = 400;
    return err;
};

const assertObject = (value, message) => {
    if (!value || typeof value !== 'object') {
        throw createInputError(message);
    }
};

const assertAuthenticated = (userId) => {
    if (!userId) {
        const err = new Error('Unauthorized');
        err.code = 'UNAUTHENTICATED';
        err.status = 401;
        throw err;
    }
};

const normalizeUserId = (value) => {
    assertAuthenticated(value);
    return decodeURIComponent(value);
};

const toLegacyLiftRestrictionInput = (input) => ({
    ModelNumber: input?.ModelNumber ?? input?.modelNumber,
    Orifice: input?.Orifice ?? input?.orifice,
    RequiredCapacity: input?.RequiredCapacity ?? input?.requiredCapacity,
    RatedFlowCapacity: input?.RatedFlowCapacity ?? input?.ratedFlowCapacity,
    DoNotExceedCapacity: input?.DoNotExceedCapacity ?? input?.doNotExceedCapacity,
    IFR: input?.IFR ?? input?.ifr,
});

const toLegacyRLCapacityInput = (input) => ({
    LiftRestriction: input?.LiftRestriction ?? input?.liftRestriction,
    RatedFlowCapacity: input?.RatedFlowCapacity ?? input?.ratedFlowCapacity,
});

const toLegacyRestrictedLiftPayload = (input) => ({
    ModelNumber: input?.ModelNumber ?? input?.modelNumber,
    Orifice: input?.Orifice ?? input?.orifice,
    RestrictedLift: input?.RestrictedLift ?? input?.restrictedLift,
    RequiredFlow: input?.RequiredFlow ?? input?.requiredFlow,
    RatedFlowCapacity: input?.RatedFlowCapacity ?? input?.ratedFlowCapacity,
    FlowCapacityUOM: input?.FlowCapacityUOM ?? input?.flowCapacityUOM,
    IFR: input?.IFR ?? input?.ifr,
    DoNotExceedCapacity: input?.DoNotExceedCapacity ?? input?.doNotExceedCapacity,
    LiftRestriction: input?.LiftRestriction ?? input?.liftRestriction,
    RestrictedLiftCapacity: input?.RestrictedLiftCapacity ?? input?.restrictedLiftCapacity,
});

const getPopupLayout = async (command) => {
    assertObject(command, 'getPopupLayout command must be an object');
    const workflowId = command?.workflowId;
    const userId = normalizeUserId(command?.userId);

    if (!/^\d+$/.test(String(workflowId))) {
        throw createInputError('Invalid workflowId');
    }

    const data = await getPopupDetails(String(workflowId), userId);
    if (!data) {
        const err = new Error('Workflow popup layout not found');
        err.code = 'NOT_FOUND';
        err.status = 404;
        throw err;
    }

    return data;
};

const getRestrictedLiftPopupLayout = async (command) => {
    assertObject(command, 'getRestrictedLiftPopupLayout command must be an object');
    const userId = normalizeUserId(command?.userId);
    const queryInput = command?.query || {};
    const source = command?.source ?? 'REST';   // 'REST' | 'GraphQL'

    const layout = await getRestrictedLIftDetails({
        ...queryInput,
        ...toLegacyLiftRestrictionInput(queryInput),
        userId,
    }, source);

    if (!layout) {
        const err = new Error('Restricted lift popup layout not found');
        err.code = 'NOT_FOUND';
        err.status = 404;
        throw err;
    }

    return layout;
};

const validateSizing = async (command) => {
    assertObject(command, 'validateSizing command must be an object');
    const payload = command?.payload;
    assertObject(payload, 'Validation payload is required');
    assertObject(payload?.inputs, 'inputs is required in payload');
    return evalInputs(payload);
};

const convertUom = async (command) => {
    assertObject(command, 'convertUom command must be an object');
    const payload = command?.payload;
    assertObject(payload, 'Conversion payload is required');

    const response = await FieldUomConversion(payload);
    if (response?.error) {
        throw createInputError(response.error);
    }

    return response;
};

const saveWorkflowRecord = async (command) => {
    assertObject(command, 'saveWorkflowRecord command must be an object');
    const payload = command?.payload;
    assertObject(payload, 'Workflow payload is required');

    return saveRecordUsingSP(payload, true);
};

const getLiftRestrictions = async (command) => {
    assertObject(command, 'getLiftRestrictions command must be an object');
    const input = command?.input;
    assertObject(input, 'Lift restriction input is required');
    return calculateLiftRestrictions(toLegacyLiftRestrictionInput(input));
};

const getRestrictedLiftCapacity = async (command) => {
    assertObject(command, 'getRestrictedLiftCapacity command must be an object');
    const input = command?.input;
    assertObject(input, 'Restricted lift capacity input is required');
    return {
        restrictedLiftCapacity: calculateRestrictedLiftCapacity(toLegacyRLCapacityInput(input)),
    };
};

const saveRestrictedLiftData = async (command) => {
    assertObject(command, 'saveRestrictedLiftData command must be an object');
    const input = command?.input;
    assertObject(input, 'Restricted lift save input is required');

    const id = input?.id ?? input?.Id;
    if (id === undefined || id === null) {
        throw createInputError('id is required');
    }

    const { id: ignoredId, Id: ignoredLegacyId, ...payloadData } = input;
    const legacyPayload = toLegacyRestrictedLiftPayload(payloadData);
    const existing = await RestrictedLiftData.getRestrictedLiftDataById(id);

    if (!existing) {
        let newPayload = {
            ...legacyPayload,
            SizingId: id,
        };

        if (legacyPayload?.RestrictedLift === 'FullLift') {
            newPayload = {
                ...newPayload,
                LiftRestriction: 1,
                RestrictedLiftCapacity: legacyPayload?.RatedFlowCapacity,
                DoNotExceedCapacity: null,
            };
        }

        await RestrictedLiftData.createRestrictedLiftData(newPayload);
    } else {
        let updatePayload = { ...legacyPayload };

        if (legacyPayload?.RestrictedLift === 'FullLift') {
            updatePayload = {
                ...updatePayload,
                LiftRestriction: 1,
                RestrictedLiftCapacity: legacyPayload?.RatedFlowCapacity,
                DoNotExceedCapacity: null,
            };
        }

        await RestrictedLiftData.updateRestrictedLiftData(id, updatePayload);
    }

    return RestrictedLiftData.getRestrictedLiftDataById(id);
};

module.exports = {
    getPopupLayout,
    getRestrictedLiftPopupLayout,
    validateSizing,
    convertUom,
    saveWorkflowRecord,
    getLiftRestrictions,
    getRestrictedLiftCapacity,
    saveRestrictedLiftData,
};
