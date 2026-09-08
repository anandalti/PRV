'use strict';

const {
    getWorkflowResultsCalc,
} = require('../../results/ResultService');

const {
    getMultiValveSelectionCalculations,
    deleteMultiValveRow,
    validateMultiValveSelectionData,
} = require('../../results/MultiValveSection');

const { saveRecordUsingSP } = require('../../../controllers/SaveWorkflowRecordController');
const { pool } = require('../../../db/pgsqldb');

const API521FlowRateReq = require('../../../models/API521FlowRateReq');
const API2000FlowRateReq = require('../../../models/API2000FlowRateReq');
const API2000TankDataAPI521Fire = require('../../../models/API2000TankDataAPI521Fire');
const API2000Results = require('../../../models/API2000Results');

const assertObject = (value, message) => {
    if (!value || typeof value !== 'object') {
        const err = new Error(message);
        err.code = 'BAD_USER_INPUT';
        err.status = 400;
        throw err;
    }
};

const assertPositiveInt = (value, fieldName) => {
    if (!Number.isInteger(value) || value < 1) {
        const err = new Error(`${fieldName} must be a positive integer`);
        err.code = 'BAD_USER_INPUT';
        err.status = 400;
        throw err;
    }
};

const assertNonEmptyArray = (value, fieldName) => {
    if (!Array.isArray(value) || value.length === 0) {
        const err = new Error(`${fieldName} must be a non-empty array`);
        err.code = 'BAD_USER_INPUT';
        err.status = 400;
        throw err;
    }
};

const patchPopupUrls = (results, id) => {
    if (id !== null && results?.rows) {
        Object.values(results.rows).forEach(valveGroup => {
            if (Array.isArray(valveGroup)) {
                valveGroup.forEach(valve => {
                    if (valve?.popupDetails?.PopupContentUrl) {
                        valve.popupDetails.PopupContentUrl =
                            valve.popupDetails.PopupContentUrl.replace(
                                'SizingId=null',
                                `SizingId=${id}`,
                            );
                    }
                    // Also patch queryVariables.SizingId so the GraphQL path
                    // receives the resolved id — the URL string above is patched
                    // but the JSON object was still holding the original null.
                    if (
                        valve?.popupDetails?.queryVariables &&
                        valve.popupDetails.queryVariables.SizingId === null
                    ) {
                        valve.popupDetails.queryVariables.SizingId = String(id);
                    }
                });
            }
        });
    }
    return results;
};

const patchMultiValveFlag = (sizingData, results) => {
    if (sizingData !== null && sizingData?.length > 0) {
        const localSizingData = sizingData[0];
        const multiValveSelectionDisplayFlag = localSizingData?.IsMultivalve
            ? results?.MultiValveFieldSection !== undefined
                ? true
                : undefined
            : undefined;
        return [{ ...localSizingData, multiValveSelectionDisplayFlag }];
    }
    return sizingData;
};

const runResultsCalculations = async (command) => {
    assertObject(command, 'runResultsCalculations command must be an object');

    const { workflowId, saveSizingFlag, payload, requestContext } = command;
    // 'REST' | 'GraphQL' — used to tailor popupContent shape per transport
    const apiSource = requestContext?.source ?? 'REST';
    if (!Number.isInteger(workflowId) || workflowId < 1) {
        const err = new Error('workflowId is required and must be a positive integer');
        err.code = 'BAD_USER_INPUT';
        err.status = 400;
        throw err;
    }
    // console.log(' >>>>>>>>>>>>>>>>>>>>>>> 222222222222222 >>>>>>>>>>>>>>>>>>>>>>>>>>>>',workflowId,saveSizingFlag,apiSource);
    assertObject(payload, 'payload must be a JSON object');

    const fullParams = { ...payload, WorkflowId: workflowId };
    const shouldSave = saveSizingFlag === true;

    const savePromise = shouldSave
        ? saveRecordUsingSP(fullParams, false)
        : Promise.resolve({ message: '', sizingData: null });
    // console.log(' >>>>>>>>>>>>>>>>>>>>>>> 333333333333333 >>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    const calcPromise = getWorkflowResultsCalc(fullParams, null, apiSource);

    let [{ message, sizingData }, results] = await Promise.all([savePromise, calcPromise]);

    const id =
        sizingData !== null && sizingData?.length > 0
            ? sizingData[0]?.Id
            : (fullParams?.Id ?? null);

    patchPopupUrls(results, id);
    sizingData = patchMultiValveFlag(sizingData, results);

    return { results, sizingResponse: { message, sizingData } };
};

const addMultiValveRow = async (command) => {
    assertObject(command, 'addMultiValveRow command must be an object');
    const { workFlowId,valveData } = command;
    assertNonEmptyArray(valveData, 'valveData');
    return getMultiValveSelectionCalculations({ workFlowId,valveData });
};

const removeMultiValveRow = async (command) => {
    assertObject(command, 'removeMultiValveRow command must be an object');
    const { rowIdToRemove, workFlowId, valveData, error } = command;
    assertPositiveInt(rowIdToRemove, 'rowIdToRemove');
    assertNonEmptyArray(valveData, 'valveData');
    return deleteMultiValveRow({ rowIdToRemove, workFlowId, valveData, error });
};

const validateMultiValveRow = async (command) => {
    assertObject(command, 'validateMultiValveRow command must be an object');
    const { rowIdToValidate,workFlowId, fieldName, valveData, error } = command;
    assertPositiveInt(rowIdToValidate, 'rowIdToValidate');
    if (!fieldName) {
        const err = new Error('fieldName is required');
        err.code = 'BAD_USER_INPUT';
        err.status = 400;
        throw err;
    }
    assertNonEmptyArray(valveData, 'valveData');

    return validateMultiValveSelectionData({
        rowIdToValidate,
        workFlowId,
        fieldName,
        valveData,
        error,
    });
};

const getSizingDetailsBySizingId = async (command) => {
    assertObject(command, 'getSizingDetailsBySizingId command must be an object');
    const { sizingId } = command;
    if (!sizingId || typeof sizingId !== 'string' || sizingId.trim() === '') {
        const err = new Error('sizingId must be a non-empty string');
        err.code = 'BAD_USER_INPUT';
        err.status = 400;
        throw err;
    }

    const queryResult = await pool.query(
        `SELECT * FROM public."GetSizingDetailsBySizingId"($1)`,
        [sizingId.trim()],
    );

    let data = queryResult?.rows[0]?.SizingDetails;
    if (!data || data.length === 0) {
        return null;
    }

    data = data[0];
    // console.log('getSizingDetailsBySizingId data >>>>>>>>>>>>>. ', data);
    if(data !== null && data !== undefined){
        Object.keys(data).forEach(item=>{
            if(data[item]==null){
                data[item]="";
            }
        });
    }
    if (data?.SelectedValves?.length > 0) {
        const selectedValves = data.SelectedValves;
        const totalReqArea = selectedValves[0]?.TotalReqArea;
        const totalSelectedArea = selectedValves[0]?.TotalSelectedArea;
        const totalSelectedPer = selectedValves[0]?.TotalSelectedPer;
        const totalRatedPressValveFlow = selectedValves[0]?.TotalRatedPressValveFlow;
        const totalActualPressValveFlow = selectedValves[0]?.TotalActualPressValveFlow;
        const requiredPressFlow = data?.Wreq ?? data?.Vreq ?? data?.Qreq;

        data.SelectedValves = selectedValves.map(val => ({
            ...val,
            ...val?.SelectedValve,
            ReResponse: val?.ReResponse ? JSON.stringify(val.ReResponse) : undefined,
            ReResponse_v: val?.ReResponse_v ? JSON.stringify(val.ReResponse_v) : undefined,
        }));

        data.MultiValveSelectionData =
            data?.IsMultivalve && data?.SelectedValves?.length > 1
                ? {
                      TotalReqArea: totalReqArea,
                      TotalSelectedArea: totalSelectedArea,
                      TotalSelectedPer: totalSelectedPer,
                      TotalRatedPressValveFlow: totalRatedPressValveFlow,
                      TotalActualPressValveFlow: totalActualPressValveFlow,
                      RequiredPressFlow: requiredPressFlow,
                      OrificeAreaUOM: data?.OrificeAreaUOM,
                      PressureUOM: data?.PressureUOM,
                      FlowCapacityUOM: data?.FlowCapacityUOM,
                  }
                : undefined;
    }

    if (data?.WorkFlowId === 12) {
        let popupData = await API521FlowRateReq.getAPI521FlowRateReqBySizingId(data.Id);
        popupData = {
            ...popupData,
            OperatingPopup: popupData?.Operating,
            OperatingPressurePopup: popupData?.OperatingPressure,
            AreaUOM: popupData?.WettedAreaUOM ?? popupData?.SurfaceAreaUOM,
            LengthEndToEnd_ltip: popupData?.LengthEndToEnd_lt,
        };

        let tankData = await API2000TankDataAPI521Fire.getAPI2000TankDataAPI521FireBySizingId(data.Id);
        tankData = {
            ...tankData,
            LengthUOM:
                tankData?.Diameter_d_UOM ||
                tankData?.Elevation_H_UOM ||
                tankData?.Height_h_UOM ||
                tankData?.VesselWidth_w_UOM ||
                tankData?.LengthEndToEnd_lt_UOM ||
                tankData?.LengthSeamToSeam_Ls_UOM ||
                tankData?.LiquidDepth_f_UOM,
            LengthEndToEnd_ltip: tankData?.LengthEndToEnd_lt,
            horizontalvertical: tankData?.IsHorizontalOrientation ? 'IsHorizontalOrientation' : 'Vertical',
            IsHorizontalOrientation: tankData?.IsHorizontalOrientation ? 'Horizontal' : 'Vertical',
        };

        data = [{ ...popupData, ...tankData, ...data }];
    } else if ([3, 23, 24].indexOf(data?.WorkFlowId) !== -1) {
        const Wreq1 = data?.Wreq;
        const WreqV1 = data?.WreqV;
        let popupData = await API2000FlowRateReq.getAPI2000FlowRateReqBySizingId(data.Id);
        let tankData = await API2000TankDataAPI521Fire.getAPI2000TankDataAPI521FireBySizingId(data.Id);
        const results = await API2000Results.getAPI2000ResultsBySizingId(data.Id);

        tankData = {
            ...tankData,
            LengthUOM:
                tankData?.Diameter_d_UOM ||
                tankData?.Elevation_H_UOM ||
                tankData?.Height_h_UOM ||
                tankData?.VesselWidth_w_UOM ||
                tankData?.LengthEndToEnd_lt_UOM ||
                tankData?.LengthSeamToSeam_Ls_UOM ||
                tankData?.LiquidDepth_f_UOM,
            LengthEndToEnd_ltin: tankData?.LengthEndToEnd_lt,
            IsHorizontalOrientation: tankData?.IsHorizontalOrientation ? 'Horizontal' : 'Vertical',
            Horizontal: tankData?.IsHorizontalOrientation,
            Vertical: !tankData?.IsHorizontalOrientation,
            EndsGroup: tankData?.Ends,
            FlatEnds: tankData?.Ends === 'FlatEnds',
            HemisphericalEnds: tankData?.Ends === 'HemisphericalEnds',
        };

        popupData = {
            ...popupData,
            OperatingPressurePopup: popupData?.OperatingPressure,
            AreaUOM: popupData?.WettedAreaUOM ?? popupData?.SurfaceAreaUOM,
            LengthEndToEnd_ltin: popupData?.LengthEndToEnd_lt,
            IsBoilingPointRadio: popupData?.IsBoilingPointRadio ? 'BoilingPoint' : 'FlashPoint',
            IsSimpleEmergencyFlowRateCalc: popupData?.IsSimpleEmergencyFlowRateCalc === 'true',
        };

        data = [{ Wreq1, WreqV1, ...popupData, ...tankData, ...results, ...data }];
    } else {
        data = [{
            ...data,
            IsSingleORMultiCompSys: data?.IsSingleORMultiCompSys !== null
                ? data?.IsSingleORMultiCompSys
                    ? 'SingleComponentSystem'
                    : 'MultiComponentSystem'
                : undefined,
            SingleComponentSystem: data?.SingleComponentSystem,
            MultiComponentSystem: data?.SingleComponentSystem,
            YesNoDetermine: data?.IsSingleORMultiCompSys
                ? data?.IsSingleORMultiCompSys
                    ? data?.FarFromCriticalPoint
                    : (data?.IsBoilingRangeLeT150F ? 'yesradio' : 'noradio')
                : undefined,
            IsBoilingRangeLT150F: data?.SingleComponentSystem !== null
                ? (!data?.SingleComponentSystem && data?.YesNoDetermine === 'yesradio')
                : false,
        }];
    }

    return data;
};

module.exports = {
    runResultsCalculations,
    addMultiValveRow,
    removeMultiValveRow,
    validateMultiValveRow,
    getSizingDetailsBySizingId,
};
