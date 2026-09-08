'use strict';

const {
    getFluidsDetails,
    getFluidsDetailById,
    getGenericErrorsDetails,
} = require('../../CommonService');
const { getUOMs, getDefaultUOMs } = require('../../getUom');
const { getWorkflowDetails, getPreferences } = require('../../layoutjsons/layoutServiceJson');
const GetWorkflowData = require('../../../models/GetWorkflowData');

const CACHE_TTL_MS = 60 * 60 * 1000;
let workflowCache = null;
let workflowCacheExpiresAt = 0;

const createError = (message, code = 'INTERNAL_SERVER_ERROR', status = 500) => {
    const err = new Error(message);
    err.code = code;
    err.status = status;
    return err;
};

const assertAuthenticated = (userId) => {
    if (!userId) {
        throw createError('Unauthorized', 'UNAUTHENTICATED', 401);
    }
};

const assertObject = (value, message) => {
    if (!value || typeof value !== 'object') {
        throw createError(message, 'BAD_USER_INPUT', 400);
    }
};

const toWorkflowDTO = (row) => ({
    id: row?.Id ?? row?.id,
    valveCategoryId: row?.ValveCategoryId ?? row?.valveCategoryId,
    valveCategoryName: row?.ValveCategoryName ?? row?.valveCategoryName,
    valveCategoryDescription: row?.ValveCategoryDescription ?? row?.valveCategoryDescription,
    valveCategoryIsActive: row?.ValveCategoryIsActive ?? row?.valveCategoryIsActive,
    valveCategoryIcon: row?.ValveCategoryIcon ?? row?.valveCategoryIcon,
    valveCategoryDisplayOrder: row?.ValveCategoryDisplayOrder ?? row?.valveCategoryDisplayOrder,
    fluidTypeId: row?.FluidTypeId ?? row?.fluidTypeId,
    fluidTypeName: row?.FluidTypeName ?? row?.fluidTypeName,
    fluidTypeDescription: row?.FluidTypeDescription ?? row?.fluidTypeDescription,
    fluidTypeIsActive: row?.FluidTypeIsActive ?? row?.fluidTypeIsActive,
    fluidTypeIcon: row?.FluidTypeIcon ?? row?.fluidTypeIcon,
    fluidTypeDisplayOrder: row?.FluidTypeDisplayOrder ?? row?.fluidTypeDisplayOrder,
    sizingMethodologyId: row?.SizingMethodologyId ?? row?.sizingMethodologyId,
    sizingMethodologyName: row?.SizingMethodologyName ?? row?.sizingMethodologyName,
    code: row?.Code ?? row?.code,
    sizingMethodologyDescription: row?.SizingMethodologyDescription ?? row?.sizingMethodologyDescription,
    sizingMethodologyIsActive: row?.SizingMethodologyIsActive ?? row?.sizingMethodologyIsActive,
    sizingMethodologyDisplayOrder: row?.SizingMethodologyDisplayOrder ?? row?.sizingMethodologyDisplayOrder,
    isGenericReq: row?.IsGenericReq ?? row?.isGenericReq,
});

const groupUoms = (uoms) => uoms.reduce((acc, uom) => {
    if (acc[uom.DimensionName]) {
        acc[uom.DimensionName].push(uom);
    } else {
        acc[uom.DimensionName] = [uom];
    }
    return acc;
}, {});

const groupDefaultUoms = (defaultUoms) => defaultUoms.reduce((acc, uom) => {
    if (acc[uom.SystemUnit]) {
        acc[uom.SystemUnit] = {
            ...acc[uom.SystemUnit],
            [uom?.DimensionName]: uom?.UnitKey,
        };
    } else {
        acc[uom.SystemUnit] = {
            [uom?.DimensionName]: uom?.UnitKey,
        };
    }
    return acc;
}, {});

const getGenericErrorsGrid = async (command) => {
    assertObject(command, 'getGenericErrorsGrid command must be an object');
    assertAuthenticated(command?.userId);

    const data = await getGenericErrorsDetails();
    if (!data) {
        throw createError('Generic Errors not found', 'NOT_FOUND', 404);
    }

    return data;
};

const getFluids = async (command) => {
    assertObject(command, 'getFluids command must be an object');
    assertAuthenticated(command?.userId);

    if (command?.fluidTypeId) {
        const data = await getFluidsDetailById(String(command.fluidTypeId));
        if (!data) {
            throw createError('Fluids Details not found', 'NOT_FOUND', 404);
        }
        return data;
    }

    const data = await getFluidsDetails();
    if (!data) {
        throw createError('Fluids Details not found', 'NOT_FOUND', 404);
    }

    return data;
};

const getUomDetails = async (command) => {
    assertObject(command, 'getUomDetails command must be an object');
    assertAuthenticated(command?.userId);

    const [uoms, defaultUoms] = await Promise.all([getUOMs(), getDefaultUOMs()]);
    return {
        uoms: groupUoms(uoms),
        defaultUoms: groupDefaultUoms(defaultUoms),
    };
};

const getWorkflowData = async (command) => {
    assertObject(command, 'getWorkflowData command must be an object');
    assertAuthenticated(command?.userId);

    const outputFormat = command?.outputFormat === 'dto' ? 'dto' : 'legacy';
    const id = command?.id;

    let rows;

    if (id !== undefined && id !== null) {
        const workflowId = Number(id);
        if (!Number.isInteger(workflowId)) {
            throw createError('Invalid id', 'BAD_USER_INPUT', 400);
        }

        const item = await GetWorkflowData.getGetWorkflowDataById(workflowId);
        if (!item || item?.status === 'Error') {
            throw createError(`Data not found for WorkflowId ${workflowId}`, 'NOT_FOUND', 404);
        }

        rows = [item];
    } else {
        const now = Date.now();
        if (workflowCache && now < workflowCacheExpiresAt) {
            rows = workflowCache;
        } else {
            rows = await GetWorkflowData.getAllGetWorkflowData();
            workflowCache = rows;
            workflowCacheExpiresAt = now + CACHE_TTL_MS;
        }
    }

    return outputFormat === 'dto' ? rows.map(toWorkflowDTO) : rows;
};

const getPreferencesLayout = async (command) => {
    assertObject(command, 'getPreferencesLayout command must be an object');
    assertAuthenticated(command?.userId);

    const data = await getPreferences();
    if (!data) {
        throw createError('Preferences layout not found', 'NOT_FOUND', 404);
    }

    return data;
};

const getWorkflowLayout = async (command) => {
    assertObject(command, 'getWorkflowLayout command must be an object');
    assertAuthenticated(command?.userId);

    const workFlowId = command?.workFlowId;
    if (!Number.isInteger(workFlowId) || workFlowId < 0) {
        throw createError('Invalid workFlowId', 'BAD_USER_INPUT', 400);
    }

    const data = await getWorkflowDetails(String(workFlowId), decodeURIComponent(command.userId));
    if (!data) {
        throw createError('Workflow Details not found', 'NOT_FOUND', 404);
    }

    return data;
};

module.exports = {
    getGenericErrorsGrid,
    getFluids,
    getUomDetails,
    getWorkflowData,
    getPreferencesLayout,
    getWorkflowLayout,
};
