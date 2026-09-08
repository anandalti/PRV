const fs = require('fs');
const path = require('path');
const { pool } = require("../../db/pgsqldb");
const calculateKbKw = require("../../utils/calculateKb");
const {round} = require("mathjs");
const { getConstants, mapServiceWithPACode, TwoPhase_WF, TwoPhase_CDSeries_WF, validatePbackType, convertUnit, getKeyValuesForVariables, evaluateLimits, WorkflowCalculations, Pressure_Vacuum_WF, Models92xx93xxMLCP, hcflModels, getParsedExpressions, Variables, ModelNumbers, WorkflowSelectedField, WorkflowResultsHeader, Ploss_Models, FAValveType, Models_9300H_Sizing, Omni900Modal_Configuration, Modal93XX_Configuration, filterSSOA, JSeriesRSModels, Models_MOD_IFR, Two_Phase_Model_Configuration, Sec1_Model_Configuration, modelNumbersMAWP, OrificeDesignationModels, filterEMModels } = require("../../utils/helper");
const { calculations } = require("../calculations/Calculations");
const { getUOMs } = require("../getUom");
const { evaluateExpression } = require("../../utils/parse");
const { CALCULATE } = require("../../utils/constants");
const { CLIENT_RENEG_LIMIT } = require('tls');
const { CalcSaturatedTempertureKsc } = require('../CalculateSaturatedTemperature');
const { getMultiValveSelectionCalculations } = require('./MultiValveSection');

// --- Valve data cache (GetSimpleValvesWithLimits / GetComplexValvesWithLimits) ---
const _valveDataCache = new Map();
const VALVE_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

async function _fetchValvesWithLimits(isComplex, workflowId, service, serviceType) {
    const cacheKey = isComplex
        ? `complex|${workflowId}`
        : `simple|${workflowId}|${serviceType}|${JSON.stringify(service)}`;
    const cached = _valveDataCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.rows;
    let rows;
    if (isComplex) {
        const data = await pool.query(
            `SELECT * FROM public."GetComplexValvesWithLimits"($1)`, [workflowId]);
        rows = data.rows;
    } else {
        const data = await pool.query(
            `SELECT * FROM public."GetSimpleValvesWithLimits"($1, $2::text[], $3)`,
            [workflowId, service, serviceType]);
        rows = data.rows;
    }
    _valveDataCache.set(cacheKey, { rows, expiresAt: Date.now() + VALVE_CACHE_TTL_MS });
    return rows;
}
// ---------------------------------------------------------------------------

function isHCFLModel(sModelNumber) {
    return hcflModels[`ModelHCFL_${sModelNumber}`] === undefined ? false : true;
}
const checkSpecialConditions = (args, valve,uoms,WorkFlowId) => {
    let sizingBasis = '';
    let service = mapServiceWithPACode(args.FluidType,WorkFlowId);
    let errorValves = []
    const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = valve;
    let Status = true;
    let errorMessage = '';
    const IsPressureOnly =args.IsPressureOnly;
    const IsVacuumOnly=args.IsVacuumOnly;
    if ([ModelNumbers.Model3500B, ModelNumbers.Model3500S, ModelNumbers.Model3600B, ModelNumbers.Model3600S, ModelNumbers.Model3650B, ModelNumbers.Model3650S, ModelNumbers.Model96_A].includes(ModelNumber) || isHCFLModel(ModelNumber)
    ) {
  
        // Adapted logic for checking variables and domain
        
        let bHasVariables = (!args.IsPressureOnly && args.IsVacuumOnly ? args.SystemMAWP !== undefined && args.SystemMAWP !== null && args.SystemMAWP !== "":true) || !args.IsVacuumOnly;
        if (!bHasVariables) {
            // errorValves.push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, failedExpressions: `${ModelNumber} requires a value to be entered for MAWP.` });
            errorMessage = `${ModelNumber} requires a value to be entered for MAWP.`
        }
        Status = bHasVariables;
        // return {status:bHasVariables, errorValves};
    }
    // if(valve.ModelNumber==='93'){

    //     console.log('valve 444444>>>> ',valve.ValveId,valve.ModelNumber,Status);
    // }
    // Other conditions would follow a similar pattern of adaptation
    if (ModelNumber === ModelNumbers.Model900 || ModelNumber === ModelNumbers.Model800 || ModelNumber === ModelNumbers.ModelBP) {
        if (service === "S" || service.includes("S")) {
            let pset = args.SetPressure;
            // Assuming pset is an object with a method compareToConstant(value, unit) in your JS context
            // and args is an object where keys are variable names and values are their corresponding values or objects
            // const Pset_psig = convertUnit(args.SetPressure, args.PressureUOM, 'pressure.psig');
            const fromUnit=uoms.find(uom => uom.UnitKey === args?.PressureUOM);
            const toUnit=uoms.find(uom => uom.UnitKey === 'pressure.psig');
            const Pset_psig = convertUnit(args.SetPressure, fromUnit, toUnit);
            if (pset && Pset_psig > 1000) {
                // errorValves.push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, failedExpressions: `${ModelNumber} requires pset to be less than or equal to 1000 psi.` });
                // return {status:false, errorValves};
                errorMessage = `${ModelNumber} requires pset to be less than or equal to 1000 psi.`
                Status = false;
            }
        }
    }
    // console.log('valve 55555>>>> ',valve.ValveId,Status);
    let Pset, Pback, Pn;
    if (VPValveType === "LP" && args.SetPressure && args.TotalBackPressure) {
        Pset = args.SetPressure; // Assuming Pset is an object with Quantity and a method ToUnit
        Pback = args.TotalBackPressure; // Assuming Pback is an object with Quantity and a method ToUnit
        let ratio = Number(Pback) / Number(Pset);

        if (ratio < 0 || ratio > 0.9) {

            // errorValves.push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, failedExpressions: `${ModelNumber} does not allow Pback to exceed 90% of Pset` });
            // return {status:false, errorValves};
            errorMessage = `${ModelNumber} does not allow Pback to exceed 90% of Pset`
            Status = false;
        }
    }
    // console.log('valve 666666>>>> ',valve.ValveId,Status);
    if (args.SetPressure && args.OperatingPressure) {
        Pset = args.SetPressure; // Reusing Pset from above if already defined
        Pn = args.OperatingPressure; // Assuming Pn is an object with Quantity and a method ToUnit
        // let ratio = Pn.Quantity / Pset.ToUnit(Pn.InternalUnit);
        const ratio = Number(args.OperatingPressure) / Number(args.SetPressure);
        if (ratio > 0.9) {
            // ErrorLogger.addCalculationWarning("Operating pressure is within 10% of set pressure", "Pn"); // Adjusted to use string "Pn" directly
            // errorValves.push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, failedExpressions: "Operating pressure is within 10% of set pressure" });
            errorMessage = "Operating pressure is within 10% of set pressure"
        }
    }
    // console.log('valve 4444444>>>> ',valve.ValveId,Status);
    let code = args?.Code;
    if (service) {
        sizingBasis = args.SizingBasis;
        let sEconomizer = "Economizer"; // Assuming Enumerations.GetStringForEnum is replaced by direct string values
        let sPreheater = "Preheater";
        let sFireCase = "Fire Case";

        //let bAlwaysUseTsat = args?.AlwaysUseTsat;

        if ((service === "S" || service.includes("S")) &&
            (ModelNumber === ModelNumbers.Model5146 ||
                ModelNumber === ModelNumbers.Model5166 ||
                ModelNumber === ModelNumbers.Model5247)) {
            // if (!args?.IsSaturatedSteam && (args?.Relieving === args?.SaturatedSteam)) {
            //     // return {status:false, errorValves};
            //     Status = false;
            // }else 
            if(!args?.IsSaturatedSteam){
            //     // return {status:false, errorValves};
                Status = false;
            } else if (ModelNumber !== ModelNumbers.Model5247 && code !== "SectionI" && code !== "SectionVIII") {
                // return {status:false, errorValves};
                Status = false;
            }
        }
        // console.log('valve 4444444>>>> ',valve.ValveId,Status);
        let Tn = args?.Operating;
        if (sizingBasis === sFireCase && Tn === null) {
            // errorValves.push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, failedExpressions: "Tn" });
            // return {status:false, errorValves};
            errorMessage = "Tn"
            Status = false;
        }
        
        if ((sizingBasis === sEconomizer || sizingBasis === sPreheater) && (service === "S"  || service.includes("S")) &&
            (ModelNumber === ModelNumbers.ModelHCI ||
                ModelNumber === ModelNumbers.ModelHSL ||
                ModelNumber === ModelNumbers.ModelHE)) {
            // return {status:false, errorValves};
            Status = false;
        }
        // console.log('valve 555555>>>> ',valve.ValveId,Status);
        let pset, ploss;
        if (code && args.SetPressure) {
            const fromUnit=uoms.find(uom => uom.UnitKey === args?.PressureUOM);
            const toUnit=uoms.find(uom => uom.UnitKey === 'pressure.psig');
            const Pset_psig = convertUnit(args.SetPressure, fromUnit, toUnit);
            // console.log('valve 555555 6666 >>>> ',valve.ValveId,Status,service, code , args.SetPressure, Number(Pset_psig),args.PressureUOM );
            if ((service === "G"  || service.includes("G")) && code === "API2000" && Number(Pset_psig) > 15.0) {
                if (ModelNumber !== ModelNumbers.Model711) {
                    // return {status:false, errorValves};
                    Status = false;
                    // console.log('valve 555555 6666 222222>>>> ',valve.ValveId,Status,service, code ,  Number(Pset_psig),ModelNumber , ModelNumbers.Model711 );
                }
            }
        }
        // if(valve.ModelNumber==='4040HP'){
        //     console.log('valve 666666>>>> ',valve.ValveId,valve.ModelNumber,Status);
        // }
        if (code && args.InletLoss) {
            const fromUnit=uoms.find(uom => uom.UnitKey === args?.PressureUOM);
            const toUnit=uoms.find(uom => uom.UnitKey === 'pressure.psig');
            const Ploss_psig = convertUnit(args.InletLoss, fromUnit, toUnit);
            if (code === "API2000" && Number(Ploss_psig) !== 0) {
                if (Brand === "Varec") {
                    Status = false;
                }else if(!Ploss_Models.includes(ModelNumber)){
                    Status = false;
                }
            }
            
        }
        if (code === "API2000" && args.SystemMAWP==="" && !IsPressureOnly && IsVacuumOnly) {
             if ((Brand === "Varec"  || Brand === "Anderson Greenwood") && !Status) {
                 Status = false;
                 errorMessage="MAWP == ''"
             }
        }
    }
    // if([182,183,184,185,186,187,188,210,211,212,213,214,215,216].indexOf(valve.ValveId)!==-1){
        // console.log('valve 888888>>>> ',valve.ValveId,Status);
    // }
    if (Status === false) {
        errorValves = [{ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: errorMessage }];
        return { status: false, errorValves };
    }
    return { status: true }; // Default return, adapt as necessary
}

const callFunctionByName = (functionName, ...args) => {
    const func = calculations[functionName];
    if (typeof func === 'function') {
        return func(...args);
    } else {
        throw new Error(`Function ${functionName} not found`);
    }
};

const workflowCalculation = (workflowObject, valve, inputs, uoms, workFlowTestKit) => {
    let returnValue = { "workflowTestKit": workFlowTestKit, "Calculations": {} }
    if(valve?.Orifice=='K2'){
        // console.log(workflowObject,workFlowTestKit, valve?.ModelNumber, valve?.Orifice, ' >>>>>>>>>>>>>>>>>> workflowCalculation called with workflowObject and valve');
    }
    if (workflowObject !== undefined) {
        const functionName = workflowObject?.WorkflowCalculation; //valve?.IsComplexValve ? `${workflowObject?.WorkflowCalculation}_PV` : workflowObject?.WorkflowCalculation;
        returnValue["Calculations"] = callFunctionByName(functionName, workflowObject?.KADataSet, valve, inputs, uoms);
    }

    return returnValue
}

const checkNumberOnly = (val) => {
    const regex = /^\d+$/;
    return regex.test(val);
}

const getOrificefromSizecode = (valve) => {

    let NewOrifice='';

    let OrificeValue=valve?.Orifice !== null && valve?.Orifice !== '';
    let SizeCodeValue=valve?.SizeCode !== null && valve?.SizeCode !== '' && valve?.SizeCode > 1 && valve?.SizeCode?.length <= 1;
    let InletSizeValue=valve?.InletSize !== null && valve?.InletSize !== '' && valve?.InletSize != 0;
    let OutletSizeValue=valve?.OutletSize !== null && valve?.OutletSize !== '' && valve?.OutletSize != 0;
    let OrificeDesignationModelsFlag=OrificeDesignationModels.includes(valve?.ModelNumber); 
 
    if(OrificeValue || (!SizeCodeValue && !InletSizeValue && !OutletSizeValue)){
        NewOrifice = checkNumberOnly(valve?.Orifice)? OrificeDesignationModelsFlag ?`-${valve?.Orifice}`: `${valve?.Orifice}"`:valve?.Orifice;
    }else if(!OrificeValue && InletSizeValue && OutletSizeValue){
        NewOrifice = `${valve?.InletSize}" x ${valve?.OutletSize}"`;
    }else if(!OrificeValue && !InletSizeValue && OutletSizeValue){
        NewOrifice = OrificeDesignationModelsFlag ?`-${valve?.OutletSize}`: `${valve?.OutletSize}"`;
    }else if(!OrificeValue && !SizeCodeValue && InletSizeValue){ // && !OutletSizeValue){
        NewOrifice = OrificeDesignationModelsFlag ?`-${valve?.InletSize}`: `${valve?.InletSize}"`;
    }else if(!OrificeValue && SizeCodeValue && !OutletSizeValue){
        NewOrifice = checkNumberOnly(valve?.SizeCode)? OrificeDesignationModelsFlag ?`-${valve?.SizeCode}`: `${valve?.SizeCode}"`:`${valve?.SizeCode}`;
    }
    return NewOrifice;
}

const getEmptyAreaUOM = () => ({ "in²": "", "cm²": "", "mm²": "" });

const getFormattedAreaValue = (value) => {
    if (value === '' || value === null || value === undefined) return '';
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return '';
    return numericValue === 0 ? '0.000' : Number(round(numericValue, 3)).toFixed(3);
}

const getAreaAllUOM = (rawAreaValue, inputs, uoms) => {
    if (rawAreaValue && typeof rawAreaValue === 'object' && !Array.isArray(rawAreaValue)) {
        return {
            "in²": rawAreaValue["in²"] ?? '',
            "cm²": rawAreaValue["cm²"] ?? '',
            "mm²": rawAreaValue["mm²"] ?? ''
        };
    }

    if (rawAreaValue === '' || rawAreaValue === null || rawAreaValue === undefined) {
        return getEmptyAreaUOM();
    }

    const fromUnit = uoms.find(uom => uom.UnitKey === inputs?.OrificeAreaUOM);
    const toIn2 = uoms.find(uom => uom.UnitKey === 'area.in2');
    const toCm2 = uoms.find(uom => uom.UnitKey === 'area.cm2');
    const toMm2 = uoms.find(uom => uom.UnitKey === 'area.mm2');

    return {
        "in²": getFormattedAreaValue(convertUnit(rawAreaValue, fromUnit, toIn2)),
        "cm²": getFormattedAreaValue(convertUnit(rawAreaValue, fromUnit, toCm2)),
        "mm²": getFormattedAreaValue(convertUnit(rawAreaValue, fromUnit, toMm2))
    };
}

const getCalculationValidate = (workflowObject, valve, inputs, uoms, workFlowTestKit, ComplexValveFlag) => {
    if(valve?.Orifice=='K2'){
        // console.log('000011112222 >>>>>>>>> ',valve?.ModelNumber,workflowObject,workFlowTestKit);
    }
    let valveCalculations = workflowCalculation(workflowObject, valve, inputs, uoms, workFlowTestKit);
    // if(valveCalculations === undefined || valveCalculations === null || Object.keys(valveCalculations).length === 0) {
    //     console.log(' >>>>>>>>>>>>>>>> ',valve?.ModelNumber,valve?.Orifice);
        
    // }
    if(valve?.Orifice == 'K2'){
            // console.log('22222 >>>>>>>>>>>>>>>> ',valve?.ModelNumber,valve?.Orifice,valveCalculations);
        }
    const WorkflowId = workflowObject?.WorkflowId;
    // let valveCalculations = workflowCalculation(workflowId,CalculationMethod,isVolumetric,valve, inputs,uoms);
    if (workFlowTestKit === "") {
        ComplexValveFlag = valve?.IsComplexValve;
    }
    workFlowTestKit = valveCalculations["workflowTestKit"];
    valveCalculations = valveCalculations["Calculations"];
    let reResponse = valveCalculations["ReResponse"];
    if (reResponse) {
        reResponse = JSON.parse(valveCalculations["ReResponse"]);
        reResponse = {
            ...reResponse,
            "calculationFuntion": workflowObject?.WorkflowCalculation
        }
    }
    // 900 SAP Model Selection For OMNI Model
    const { ModelNumber } = valve;
    let valveModels = false;
    if (ModelNumber == '900' && ['5', '6'].includes(valve?.Orifice)) {
        // console.log(' >>>>>>>>>>>>>>>>>> ',{ModelNumber,Orifice:valve?.Orifice,flag:ModelNumber == '900' && ['5', '6'].includes(valve?.Orifice)})
        // console.log({valveCalculations, valve });
        let Pset = Number(inputs?.SetPressure);
        if(inputs?.PressureUOM !== 'pressure.psig') {
            Pset = convertUnit(Pset, uoms.find(uom => uom.UnitKey === inputs?.PressureUOM), uoms.find(uom => uom.UnitKey === 'pressure.psig'));
        }
        if (valve?.Orifice == '5' && Pset > 500 && Pset <= 1500) {
            valveModels = ['951', '955'];
        }
        if(valve?.Orifice == '6' && Pset >= 15 && Pset <= 1500) {
            valveModels = ['961', '965'];
        }
    }
    if (reResponse && valveModels) {
        // console.log(' >>>>>>>>>>>>>>>>>> ',{ModelNumber,Orifice:valve?.Orifice,valveModels})
        reResponse['valveModels'] = valveModels;
    }
    // valveNumber, Pset, Orifice -> link the models array
    
    valveCalculations = { ...valveCalculations, ReResponse: JSON.stringify(reResponse) };
    const NewOrifice = getOrificefromSizecode(valve);

    // valve = { ...valve, ...valveCalculations, NewOrifice };
    
    // return valve;
    if (valveCalculations?.Areq !== undefined) {
        let Areq = !!valveCalculations?.Areq ? Number(round(convertUnit(valveCalculations?.Areq, uoms.find(uom => uom.UnitKey === inputs?.OrificeAreaUOM), uoms.find(uom => uom.UnitKey === 'area.in2')), 3)).toFixed(3) : "";
        Areq = Areq === '' || Areq === null || isNaN(Areq) ? '' : Areq == 0 ? '0.000' : Areq;
        let Areqcm2 = !!valveCalculations?.Areq ? Number(round(convertUnit(valveCalculations?.Areq, uoms.find(uom => uom.UnitKey === inputs?.OrificeAreaUOM), uoms.find(uom => uom.UnitKey === 'area.cm2')), 3)).toFixed(3) : "";
        Areqcm2 = Areq === '' || Areq === null || isNaN(Areq) ? '' : Areqcm2 == 0 ? '0.000' : Areqcm2;
        let Areqmm2 = !!valveCalculations?.Areq ? Number(round(convertUnit(valveCalculations?.Areq, uoms.find(uom => uom.UnitKey === inputs?.OrificeAreaUOM), uoms.find(uom => uom.UnitKey === 'area.mm2')), 3)).toFixed(3): "";
        Areqmm2 = Areq === '' || Areq === null || isNaN(Areq) ? '' : Areqmm2 == 0 ? '0.000' : Areqmm2;
        let AreqAllUOM = { "in²": Areq, "cm²": Areqcm2, "mm²": Areqmm2 }
        if(valve?.Orifice == 'K2'){
            // console.log({Areq, Areqcm2, Areqmm2, AreqAllUOM});
        }
        
        if([21].includes(WorkflowId)){
            // if(valveCalculations?.AreqG===undefined || valveCalculations?.AreqG===null){
            //     console.log(' >>>>>>>>>>>>> ',valve?.ModelNumber,valve?.Orifice,valveCalculations?.AreqG, valveCalculations?.AreqL, valveCalculations?.AreqL2,valveCalculations);
            // }
            let AreqAllUOMG = { "in²": '0', "cm²": '0', "mm²": '0' };
            let AreqG=0;
            let AreqGcm2=0;
            let AreqGmm2=0
            if(valveCalculations?.AreqG !==0){
                AreqG = !!valveCalculations?.AreqG ? Number(round(convertUnit(valveCalculations?.AreqG, uoms.find(uom => uom.UnitKey === inputs?.OrificeAreaUOM), uoms.find(uom => uom.UnitKey === 'area.in2')), 3)).toFixed(3) : "";
                AreqG = AreqG === '' || AreqG === null || isNaN(AreqG) ? '' : AreqG == 0 ? '0.000' : AreqG;
                AreqGcm2 = Number(round(convertUnit(valveCalculations?.AreqG, uoms.find(uom => uom.UnitKey === inputs?.OrificeAreaUOM), uoms.find(uom => uom.UnitKey === 'area.cm2')), 3)).toFixed(3);
                Areqcm2 = AreqG === '' || AreqG === null || isNaN(AreqG) ? '' : AreqGcm2 == 0 ? '0.000' : AreqGcm2;
                AreqGmm2 = Number(round(convertUnit(valveCalculations?.AreqG, uoms.find(uom => uom.UnitKey === inputs?.OrificeAreaUOM), uoms.find(uom => uom.UnitKey === 'area.mm2')), 3)).toFixed(3);
                AreqGmm2 = AreqG === '' || AreqG === null || isNaN(AreqG) ? '' : AreqGmm2 == 0 ? '0.000' : AreqGmm2;
                AreqAllUOMG = { "in²": AreqG, "cm²": AreqGcm2, "mm²": AreqGmm2 }
            }
            // console.log({AreqG, AreqGcm2, AreqGmm2, AreqAllUOMG});
            //for Liquid Areq
            let AreqAllUOML = { "in²": '0', "cm²": '0', "mm²": '0' };
            if(valveCalculations?.AreqL !==0){
                let AreqL = !!valveCalculations?.AreqL ? Number(round(convertUnit(valveCalculations?.AreqL, uoms.find(uom => uom.UnitKey === inputs?.OrificeAreaUOM), uoms.find(uom => uom.UnitKey === 'area.in2')), 3)).toFixed(3) : "";
                AreqL = AreqL === '' || AreqL === null || isNaN(AreqL) ? '' : AreqL == 0 ? '0.000' : AreqL;
                let AreqLcm2 = Number(round(convertUnit(valveCalculations?.AreqL, uoms.find(uom => uom.UnitKey === inputs?.OrificeAreaUOM), uoms.find(uom => uom.UnitKey === 'area.cm2')), 3)).toFixed(3);
                AreqLcm2 = AreqL === '' || AreqL === null || isNaN(AreqL) ? '' : AreqLcm2 == 0 ? '0.000' : AreqLcm2;
                let AreqLmm2 = Number(round(convertUnit(valveCalculations?.AreqL, uoms.find(uom => uom.UnitKey === inputs?.OrificeAreaUOM), uoms.find(uom => uom.UnitKey === 'area.mm2')), 3)).toFixed(3);
                AreqLmm2 = AreqL === '' || AreqL === null || isNaN(AreqL) ? '' : AreqLmm2 == 0 ? '0.000' : AreqLmm2;
                AreqAllUOML = { "in²": AreqL, "cm²": AreqLcm2, "mm²": AreqLmm2 }
            }
            // console.log({AreqL, AreqLcm2, AreqLmm2, AreqAllUOML});
            //for Liquid Areq
            let AreqAllUOML2 = { "in²": '0', "cm²": '0', "mm²": '0' };
                
            if(inputs?.IsLiquid2){
                let AreqL2 = !!valveCalculations?.AreqL2 ? Number(round(convertUnit(valveCalculations?.AreqL2, uoms.find(uom => uom.UnitKey === inputs?.OrificeAreaUOM), uoms.find(uom => uom.UnitKey === 'area.in2')), 3)).toFixed(3) : "";
                AreqL2 = AreqL2 === '' || AreqL2 === null || isNaN(AreqL2) ? '' : AreqL2 == 0 ? '0.000' : AreqL2;
                let AreqL2cm2 = Number(round(convertUnit(valveCalculations?.AreqL2, uoms.find(uom => uom.UnitKey === inputs?.OrificeAreaUOM), uoms.find(uom => uom.UnitKey === 'area.cm2')), 3)).toFixed(3);
                AreqL2cm2 = AreqL2 === '' || AreqL2 === null || isNaN(AreqL2) ? '' : AreqL2cm2 == 0 ? '0.000' : AreqL2cm2;
                let AreqL2mm2 = Number(round(convertUnit(valveCalculations?.AreqL2, uoms.find(uom => uom.UnitKey === inputs?.OrificeAreaUOM), uoms.find(uom => uom.UnitKey === 'area.mm2')), 3)).toFixed(3);
                AreqL2mm2 = AreqL2 === '' || AreqL2 === null || isNaN(AreqL2) ? '' : AreqL2mm2 == 0 ? '0.000' : AreqL2mm2;
                AreqAllUOML2 = { "in²": AreqL2, "cm²": AreqL2cm2, "mm²": AreqL2mm2 };
                // console.log({AreqL2, AreqL2cm2, AreqL2mm2, AreqAllUOML2});
                valve = { ...valve, ...valveCalculations, NewOrifice, Areq: AreqAllUOM, AreqG: AreqAllUOMG, AreqL: AreqAllUOML, AreqL2: AreqAllUOML2 };
            }else{
                valve = { ...valve, ...valveCalculations, NewOrifice, Areq: AreqAllUOM, AreqG: AreqAllUOMG, AreqL: AreqAllUOML,AreqL2: AreqAllUOML2 };
            }
        }else if (inputs.IsPressureOnly && inputs.IsVacuumOnly) {
            let Areq_v = !!valveCalculations?.Areq_v ? Number(round(convertUnit(valveCalculations?.Areq_v, uoms.find(uom => uom.UnitKey === inputs?.OrificeAreaUOM), uoms.find(uom => uom.UnitKey === 'area.in2')), 3)).toFixed(3) : "";
            Areq_v = Areq_v === '' || Areq_v === null || isNaN(Areq_v) ? '' : Areq_v == 0 ? '0.000' : Areq_v;
            let Areqvcm2 = Number(round(convertUnit(valveCalculations?.Areq_v, uoms.find(uom => uom.UnitKey === inputs?.OrificeAreaUOM), uoms.find(uom => uom.UnitKey === 'area.cm2')), 3)).toFixed(3);
            Areqvcm2 = Areq_v === '' || Areq_v === null || isNaN(Areq_v)  ? '' : Areqvcm2 == 0 ? '0.000' : Areqvcm2;
            let Areqvmm2 = Number(round(convertUnit(valveCalculations?.Areq_v, uoms.find(uom => uom.UnitKey === inputs?.OrificeAreaUOM), uoms.find(uom => uom.UnitKey === 'area.mm2')), 3)).toFixed(3);
            Areqvmm2 = Areq_v === '' || Areq_v === null || isNaN(Areq_v)  ? '' : Areqvmm2 == 0 ? '0.000' : Areqvmm2;
            let AreqvAllUOM = { "in²": Areq_v, "cm²": Areqvcm2, "mm²": Areqvmm2 }
            valve = { ...valve, ...valveCalculations, NewOrifice, Areq: AreqAllUOM, Areq_v: AreqvAllUOM };
            // console.log('In complex valve >>>> ', valve);
        } else {
            valve = { ...valve, ...valveCalculations, NewOrifice, Areq: AreqAllUOM };
        }

    } else {
        valve = { ...valve, ...valveCalculations, NewOrifice };
    }
    return valve;
}

const getCalculationValidateCalc = (workflowObject, valve, inputs, uoms, workFlowTestKit, ComplexValveFlag) => {

    let valveCalculations = workflowCalculation(workflowObject, valve, inputs, uoms, workFlowTestKit);

    const WorkflowId = workflowObject?.WorkflowId;
    // let valveCalculations = workflowCalculation(workflowId,CalculationMethod,isVolumetric,valve, inputs,uoms);
    if (workFlowTestKit === "") {
        ComplexValveFlag = valve?.IsComplexValve;
    }
    workFlowTestKit = valveCalculations["workflowTestKit"];
    valveCalculations = valveCalculations["Calculations"];
    let reResponse = valveCalculations["ReResponse"];
    if (reResponse) {
        reResponse = JSON.parse(valveCalculations["ReResponse"]);
        reResponse = {
            ...reResponse,
            "calculationFuntion": workflowObject?.WorkflowCalculation
        }
    }
    // 900 SAP Model Selection For OMNI Model
    const { ModelNumber } = valve;
    let valveModels = false;
    if (ModelNumber == '900' && ['5', '6'].includes(valve?.Orifice)) {
        
        let Pset = Number(inputs?.SetPressure);
        if(inputs?.PressureUOM !== 'pressure.psig') {
            Pset = convertUnit(Pset, uoms.find(uom => uom.UnitKey === inputs?.PressureUOM), uoms.find(uom => uom.UnitKey === 'pressure.psig'));
        }
        if (valve?.Orifice == '5' && Pset > 500 && Pset <= 1500) {
            valveModels = ['951', '955'];
        }
        if(valve?.Orifice == '6' && Pset >= 15 && Pset <= 1500) {
            valveModels = ['961', '965'];
        }
    }
    if (reResponse && valveModels) {
        // console.log(' >>>>>>>>>>>>>>>>>> ',{ModelNumber,Orifice:valve?.Orifice,valveModels})
        reResponse['valveModels'] = valveModels;
    }
    // valveNumber, Pset, Orifice -> link the models array
    
    valveCalculations = { ...valveCalculations, ReResponse: JSON.stringify(reResponse) };
    const NewOrifice = getOrificefromSizecode(valve);

    const areaFields = ['Areq', 'AreqG', 'AreqL', 'AreqL2', 'Areq_v'];
    const normalizedAreaFields = {};
    areaFields.forEach((fieldName) => {
        if (Object.prototype.hasOwnProperty.call(valveCalculations, fieldName)) {
            normalizedAreaFields[fieldName] = getAreaAllUOM(valveCalculations[fieldName], inputs, uoms);
        }
    });

    valve = { ...valve, ...valveCalculations, ...normalizedAreaFields, NewOrifice };
    // console.log(workflowObject?.KADataSet,valve?.ModelNumber,NewOrifice,valve?.A,inputs?.Wreq,valve?.Kx,valve?.Kb,valve?.Kc,valve?.G,valve?.W,valve?.Areq);
    return valve;
}

const popupNames={
    3: "API2000Popup",
    23: "API2000Popup",
    24: "API2000Popup",
    12: "FireSizingPopup"
}

const evaluateVisiblity = (field, inputs) => {
    if(typeof field?.visible === 'boolean') return field.visible;
    if(Array.isArray(field?.visible)) {
        let visible = true;
        field.visible.forEach(expression => {
            const { symbol, expression:express, expressionReqFields } = expression?.target;
            if(symbol == CALCULATE) {
                const variables = expressionReqFields.reduce((acc, curField) => {
                    acc[curField] = inputs[curField] ?? '';
                    return acc;
                }, {});
                visible = evaluateExpression(express, variables);
            }
        });
        return visible;
    }
    return true;
}

const errorMessages = (errors, optionKeys, workflowId, inputs) => {
    if (!errors ) return [];

    let finalErrors = {};
    optionKeys?.forEach(key => {
        if(errors[key]!==undefined){
            // const resultErrors = errors[key]?.filter(e => key === 'All' || e.ValveTypeSummary === key) || [];
            let groupedErrors = {};
            let errorMessages = [];
            let Kvltpointr3 = [];
            let omegagt0 = [];

            // ['ASME', 'API'].forEach((obj) => {
            errors[key]?.forEach(error => {
                if (!groupedErrors[error?.Brand]) groupedErrors[error?.Brand] = [];
                const expr = Array.isArray(error?.failedExpressions) ? error?.failedExpressions.join(', ') : error?.failedExpressions;
                if (expr && !groupedErrors[error?.Brand].includes(expr)) groupedErrors[error?.Brand].push(expr);
            });
            
            Kvltpointr3 = Object.keys(groupedErrors).filter(k => groupedErrors[k].includes("Kv < 0.3"));
            if (Kvltpointr3.length > 0) {
                errorMessages.push({
                    type: 'General Errors',
                    message: `The viscosity correction factor has dropped below 0.3, and the calculation cannot continue.`
                });
            }

            omegagt0 = Object.keys(groupedErrors).filter(k => groupedErrors[k].includes("ω <= 0"));
            if (omegagt0.length > 0) {
                errorMessages.push({
                    type: 'General Errors',
                    message: `ω must be greater than or equal to 0.`
                });
            }
        
        

            groupedErrors = {};
            errors[key]?.forEach(error => {
                const key = `${error?.Brand} ${error?.ModelNumber}`;
                if (!groupedErrors[key]) {
                    groupedErrors[key] = [];
                }

                let expr;
                if (Array.isArray(error?.failedExpressions)) {
                    expr = error.failedExpressions.join(', ');
                } else {
                    expr = error?.failedExpressions;
                }
                // Exclude 'Kv < 0.3' and 'ω <= 0'
                if (
                    expr &&
                    // expr !== "Kv < 0.3" &&
                    // expr !== "ω <= 0" &&
                    !groupedErrors[key].includes(expr)
                ) {
                    groupedErrors[key].push(expr);
                }
            });

            for (const key in groupedErrors) {
                if (!Kvltpointr3.includes(key) && !omegagt0.includes(key)) {
                    if (groupedErrors[key].length === 1 || (groupedErrors[key].length === 2 && groupedErrors[key].includes("Kv < 0.3") )) {
                        const expr = groupedErrors[key][0]=="Kv < 0.3" ? groupedErrors[key][1]: groupedErrors[key][0];
                        if(expr===undefined) continue;
                        if (expr === "Kb = 0") {
                            errorMessages.push({ type: 'Valve Errors', message: `${key} is not allowed for differential pressure under 15 psi.` });
                        }else if (expr === "Vreqp >= 0") {
                            if(!["Crosby® HSJ", "Crosby® HCI", "Crosby® HE", "Crosby® HSL"].includes(key)){
                                errorMessages.push({ type: 'Valve Errors', message: `No valves for ${key} met the required flow rate.` });
                            }
                        } else if (expr === "Pset > 1000 && Model == 900") {
                            errorMessages.push({ type: 'Valve Errors', message: `900 requires pset to be less then or equal to 1000 psi.` });
                        
                        } else if (expr === "Pback < 0.9 * Pset") {
                            errorMessages.push({ type: 'Valve Errors', message: `${key} does not allow Pback to exceed 90% of Pset` });
                        } else if (expr === "PbackType === 0") {
                            errorMessages.push({ type: 'Valve Errors', message: `${key} is not allowed for this backpressure type.` });
                        } else if (expr === "IsSaturatedSteam == true") {
                            errorMessages.push({ type: 'Valve Errors', message: `${key} is allowed only when Saturated Steam checked.` });
                        } else if (expr === "MAWP == ''") {
                            errorMessages.push({ type: 'Valve Errors', message: `${key} requires a value to be entered for MAWP.` });
                        } else if (expr !== "Kv < 0.3" && expr !== "ω <= 0") {
                            errorMessages.push({ type: 'Valve Errors', message: `${key} is not available because it has failed expression(s) ${expr}` });
                        }
                    } else {
                        errorMessages.push({ type: 'Valve Errors', message: `No configuration of ${key} is available under these pressure/temperature limits.` });
                    }
                }
            }
            
            // General Information and Warnings
            const uniqueGeneralWarnings = [];
            const uniqueGeneralInfo = [];
            const filename = `workflowSections${workflowId}.json`;
            const layoutFilePath = path.join(__dirname, `../../data/`);
            // console.log('In Error handling messages >>>> ', workflowId,fs.existsSync(`${layoutFilePath}${filename}`),`${layoutFilePath}${filename}`);
            const genericErrorsPath = `${layoutFilePath}genericErrors.json`;
            const genericErrors = fs.existsSync(genericErrorsPath)
                ? JSON.parse(fs.readFileSync(genericErrorsPath, 'utf8'))
                : [];
            if (fs.existsSync(`${layoutFilePath}${filename}`)) {
                const fileData = fs.readFileSync(`${layoutFilePath}${filename}`, 'utf8');
                let sections = JSON.parse(fileData);
                // console.log('In Error handling messages 222222222 >>>> ', workflowId,fs.existsSync(`${layoutFilePath}${filename}`),sections?.length);
                if(sections?.length>0){
                    for (const section of sections) {
                        const fields=section?.fields || [];
                        // console.log('In Error handling messages 333333 >>>> ', workflowId,fields?.length);
                        if(fields?.length>0){
                            for (const field of fields) {
                                if(inputs[field?.fieldName]==='') {
                                    if (field?.fieldBlankMessage !== undefined && field?.fieldBlankMessage !== null) {
                                        let visible = true;
                                        if([3,21,23,24].includes(workflowId)){
                                            const {visibleFields} = inputs?.FieldProperties;
                                            visible = visibleFields[field?.fieldName] ?? evaluateVisiblity(field, inputs);
                                        }
                                        // console.log('In Error handling messages 333333 >>>> ', workflowId,field?.fieldName,inputs[field?.fieldName],field?.fieldBlankMessage);
                                        if(visible) {
                                            const errorMessage = genericErrors.find((item) => item.key === field.fieldBlankMessage?.message)?.value;
                                            // console.log('In Error handling messages 444444 >>>> ', workflowId,field.fieldBlankMessage?.message,errorMessage);
                                            if(errorMessage!==undefined){
                                                uniqueGeneralInfo.push({ type: 'General Information', message: errorMessage });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // console.log(' >>>>>>>>> field check >>>> ', uniqueGeneralInfo?.length);
            
            const uiErrors = inputs?.error || [];
            uiErrors?.forEach(error => {
                const isMessageExists = uniqueGeneralWarnings.some(item => item.message === error?.value?.description);
                if (!isMessageExists) {
                    uniqueGeneralWarnings.push({ type: 'General Warnings', message: error?.value?.description });
                }
                // const errorMessage = genericErrors.find((item) => item.key === error?.value?.message)?.value;
                // if (errorMessage && !uniqueGeneralWarnings.some(item => item.message === errorMessage)) {
                //     uniqueGeneralWarnings.push({ type: 'General Warnings', message: error?.value?.description });
                // }
            });

            finalErrors[key] = [...uniqueGeneralInfo, ...uniqueGeneralWarnings, ...errorMessages];
            // finalErrors[key] = [...uniqueGeneralInfo,...errorMessages];
    }
    });

    return finalErrors;
  };

const popupMessageCheck=(WorkflowId,valve,inputs,id,source='REST')=>{
    let popupContent;
    const SizingBasis=inputs?.SizingBasis;
    const ValveType=valve?.ValveType;
    const ModelNumber=valve?.ModelNumber;
    const brand=valve?.Brand;
    // const ReResponse=valve?.ReResponse ? JSON.parse(valve?.ReResponse) : JSON.parse(valve?.ReResponse_v);
    const reResponseStr = valve?.ReResponse || valve?.ReResponse_v;
const ReResponse = reResponseStr ? JSON.parse(reResponseStr) : null;
    const valveModels=ReResponse?.valveModels;
    const Wreq=inputs?.Wreq ? inputs?.Wreq : inputs?.Vreq ? inputs?.Vreq : inputs?.Qreq ? inputs?.Qreq : inputs?.VlreqMass;
    // console.log(brand,Wreq,ModelNumber)
    if(Models_9300H_Sizing.includes(ModelNumber)){
        popupContent={...Modal93XX_Configuration}
        // dispatch(onUpdateProceed93XXModal(true));
    }else if(!inputs?.IsMultivalve && brand=='Crosby®' && Wreq!=='' && Wreq!==null && Wreq!==undefined && 
        (JSeriesRSModels.includes(ModelNumber) 
            || ModelNumber=='HCI' 
            || ['EMC','EMB','EMH'].includes(ModelNumber)
        ) ){
        const Orifice=valve?.Orifice.replace(/"/g, '');
        
        const Wsel=valve?.Wsel?valve?.Wsel:valve?.Vsel?valve?.Vsel:valve?.Qm;
        const userId=inputs?.userId ?? inputs?.UserMailId;

        let url=`{baseURL}/layoutData/restrictedLiftPopup?SizingId=${id}&ModelNumber=${ModelNumber}&Orifice=${Orifice}&RequiredCapacity=${Wreq}&RatedFlowCapacity=${Wsel}`;
        const query="query RestrictedLiftPopup($input: RestrictedLiftPopupInput!) { restrictedLiftPopup(input: $input) { success message code data errors { code message field } } }"
        let queryVariables={}
        if(['EMC','EMB','EMH'].includes(ModelNumber)){
            let Service=inputs?.FluidType;
            // console.log({Service,Orifice})
            Service=Service==='Liquid'?'LIQ':Service==='Steam'?'STM':Service==='Gas/Vapor' || Service==='Gas / Vapor' || Service==='Fire'?'GAS':'2-PHASE';
            url= `${url}&Service=${Service}`;
            queryVariables={...queryVariables,Service:Service}
        }else if(JSeriesRSModels.includes(ModelNumber)){
            const IFR=Models_MOD_IFR[ModelNumber]?.Need_IFR=="Yes" ? "1" : "0";
            url= `${url}&IFR=${IFR}`;
            queryVariables={...queryVariables,IFR:IFR}
        }
        queryVariables={
            ...queryVariables,
            SizingId:id,
            ModelNumber:ModelNumber,
            Orifice:Orifice,
            RequiredCapacity:Wreq,
            RatedFlowCapacity:Wsel,
            userId:userId
        }
        // Include only transport-relevant fields:
        // REST  → PopupContentUrl (frontend parses URL to call the REST endpoint)
        // GraphQL → PopupQuery + queryVariables (frontend calls GQL directly, no URL parsing)
        if (source === 'GraphQL') {
            popupContent = {
                RestrictedLiftCalculation: true,
                PopupQuery: query,
                queryVariables: queryVariables,
            };
        } else {
            popupContent = {
                RestrictedLiftCalculation: true,
                PopupContentUrl: `${url}&userId=${userId}`,
            };
        }
        // console.log('In Popup Details >>>>>> ',popupContent);
    }else if(!TwoPhase_WF.includes(WorkflowId) && ReResponse?.valveModels !==undefined && ReResponse?.valveModels?.length>0){
        // console.log('handleProceed >>>>>>>>>>>>>>>>> ',ReResponse?.valveModels,selectedResultRows,selectedModel,Models_9300H_Sizing.includes(selectedModel));
        const localOptions=valveModels.map(model=>({label:model, value:model}));
        popupContent={
            ...Omni900Modal_Configuration,
            options:[...localOptions]
        }
        // dispatch(onUpdateProceedOmni900Modal(true));
    }else  if(['Economizer','Preheater'].includes(SizingBasis) && ModelNumber=='HSJ'){
        popupContent={...Sec1_Model_Configuration}
    }else  if(brand=='Crosby®' && TwoPhase_WF.includes(WorkflowId) && ValveType.indexOf('Conventional')!==-1  &&  ValveType.indexOf('Spring')!==-1){
        popupContent={...Two_Phase_Model_Configuration}
    }
    return popupContent;
}

const getWorkflowResults=async (params,id=null)=>{
    let startTime = new Date().getTime();
    const { WorkFlowId, CalculationMethod, ...inputdata } = params;
    let inputs = { ...inputdata };
    const constants = getConstants(CalculationMethod);
    const uoms = await getUOMs();

    startTime = new Date().getTime();
    const service = mapServiceWithPACode(inputs.FluidType,WorkFlowId);

    const { FlowCapacityUOM } = inputs;
    const [dimension, unit] = FlowCapacityUOM !== undefined ? FlowCapacityUOM?.split('.') : ['', ''];
    const isVolumetric = !(dimension === 'massflow');

    const workflowId = parseInt(WorkFlowId);
    let passedValves = [];
    const failedValves = [];
    let updatedPassedValves = {};
    
    let ComplexOrSimpleValves = [];
    let ComplexOrSimpleValveLimits = [];

    let Vreqp = inputs?.Wreq || inputs?.Qreq || inputs?.VlreqMass;
    let VreqV = inputs?.WreqV || inputs?.QreqV || inputs?.VlreqMassV;

    let CD_Series_WF = TwoPhase_CDSeries_WF.includes(workflowId);
    startTime = new Date().getTime();
    if (inputs.IsPressureOnly && inputs.IsVacuumOnly) {
        const rows = await _fetchValvesWithLimits(true, workflowId, service, null);
        const { ComplexValves, Limits } = rows[0];
        ComplexOrSimpleValves = [...ComplexValves]
        ComplexOrSimpleValveLimits = [...Limits]
    } else {
        const serviceType = inputs.IsVacuumOnly ? 'V' : 'P';
        const rows = await _fetchValvesWithLimits(false, workflowId, service, serviceType);
        let { SimpleValves, Limits } = rows?.length>0 ? rows[0] : {SimpleValves:[], Limits:[]};
        SimpleValves=SimpleValves==null?[]:SimpleValves;
        Limits=Limits==null?[]:Limits;
        ComplexOrSimpleValves = [...SimpleValves]
        ComplexOrSimpleValveLimits = [...Limits];
    }
    //Todo: Add 2,3 Orifice filter for 81, 83
    ComplexOrSimpleValves = ComplexOrSimpleValves.filter(valve => {
        if((inputs.Wreq === '' || inputs.Wreq < 0 || inputs.Qreq === '' || inputs.Qreq < 0) && ['81','83'].includes(valve.ModelNumber) && ['2','3'].includes(valve.Orifice)){
            return false;
        }
        return true;
    });

    //ComplexOrSimpleValves = filterSSOA(ComplexOrSimpleValves, inputs);
    ComplexOrSimpleValveLimits = ComplexOrSimpleValveLimits.filter(limit => ComplexOrSimpleValves.some(valve => valve.ModelId === limit.ModelId));

    // console.log(' >>>>>>>>>>>>>> ',ComplexOrSimpleValves?.length, ComplexOrSimpleValveLimits?.length);
    if(TwoPhase_WF.includes(WorkFlowId)){
        const mergedRows = {};
        const voidKeys=['ValveId', 'ValvePropertyId', 'Kmax', 'KAPI', 'Service','A','AAPI'];
        // console.log('Before Traverse >>>>>> ',passedValves?.length);
        ComplexOrSimpleValves.forEach((row) => {
            
            const uniqueKey=`${row.ModelNumber}_${row.Orifice}`;// Unique key for grouping
            
            if (!mergedRows[uniqueKey]) {
                // Initialize the merged row with common fields
                mergedRows[uniqueKey] = { ...row };
            } else {
                // Merge fields with different values by appending the Service suffix
                Object.keys(row).forEach((key) => {
                    if (key === 'Service') return; // Skip the Service key itself
                    // if(row?.ModelNumber === '453' && row?.Orifice.indexOf('K')!== -1 && key=='A'){
                    //     console.log(' >>>>>>>>>>>>>>>>> ',uniqueKey,row,key,mergedRows[uniqueKey][key] , row[key],mergedRows[uniqueKey][key] !== row[key],row.Service)
                    // }
                    if (mergedRows[uniqueKey][key] !== row[key]) {
                        mergedRows[uniqueKey][`${key}${row.Service}`] = row[key];
                    }else if(voidKeys.includes(key)){
                        mergedRows[uniqueKey][`${key}${row.Service}`] = row[key];
                    }
                });
            }

            // Add the Service value to the merged row
            if (!mergedRows[uniqueKey].Services) {
                mergedRows[uniqueKey].Services = new Set();
            }
            mergedRows[uniqueKey].Services.add(row.Service);
            // if(row?.ModelNumber === '453' && row?.Orifice.indexOf('K')!== -1){
            //     console.log(' >>>>>>>>>>>>>>>>> ',mergedRows)
            // }
        });
        // console.log('mergedRows >>>>>> ',mergedRows);
        // Convert the Services Set to an Array and return the merged rows as an array
        ComplexOrSimpleValves= Object.values(mergedRows).filter((row) => 
            {
                if(Array.from(row.Services)?.length>1){
                    return {
                        ...row,
                        Services: Array.from(row.Services),
                    }
                }
            }
        ).map((row) => ({
            ...row,
            Services: Array.from(row.Services),
        }));
    }

    if (inputs?.genericSizingDetails?.Orifice) {
        const { KandAdataset, K, OrificeArea, Orifice } =
        inputs.genericSizingDetails;
        const filteredValve = ComplexOrSimpleValves.find(
        (valve) => valve.ValveId == Orifice
        );

        if (filteredValve) {
        const datasetMapping = {
            NonDataSet: () => {
            if (K) filteredValve.Kmax = filteredValve.KAPI = K;
            if (OrificeArea)
                filteredValve.A = filteredValve.AAPI = OrificeArea;
            },
            ASME: () => {
            if (K !== filteredValve.Kmax)
                filteredValve.Kmax = filteredValve.KAPI = K;
            if (OrificeArea !== filteredValve.A)
                filteredValve.A = filteredValve.AAPI = OrificeArea;
            },
            API: () => {
            if (K !== filteredValve.KAPI)
                filteredValve.KAPI = filteredValve.Kmax = K;
            if (OrificeArea !== filteredValve.AAPI)
                filteredValve.AAPI = filteredValve.A = OrificeArea;
            },
        };

        datasetMapping[KandAdataset]?.();
        ComplexOrSimpleValves = [filteredValve];
        }
    }
        

    startTime = new Date().getTime();
    let workFlowTestKit = "";
    let workFlowTestKitAPI = "";
    let workFlowTestKitAPIDef = "";
    let workFlowTestKitAPIWtAvg = "";
    
    let OrificesFlag = inputs?.Orifices;
    let isVacuumOnly = inputs?.IsVacuumOnly;
    let IsPressureOnly = inputs?.IsPressureOnly;
    const IsFAIncludedOnRV = inputs?.IsFAIncludedOnRV;
    let ComplexValveFlag = inputs?.IsPressureOnly && inputs?.IsVacuumOnly;
    // console.log('ComplexOrSimpleValves >>>>>>>>>>>>>>> ',ComplexOrSimpleValves?.length)
    ComplexOrSimpleValves.forEach((valve) => {
        const isAllowedPback = validatePbackType(valve, inputs);
        // console.log('isAllowedPback >>>> ', valve.ModelNumber, valve.Orifice, isAllowedPback);
        let Pset = convertUnit(inputs?.SetPressure, uoms.find(uom => uom.UnitKey === inputs?.PressureUOM), uoms.find(uom => uom.UnitKey === 'pressure.psig'));

        if (!isAllowedPback) {
            const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = valve;
            failedValves.push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["PbackType === 0"] });
        } else {
            const newValve = { ...valve };
            // Convert A and AAPI in case of Metric - default value is in cm2
            // if(newValve?.ModelNumber === '453' && newValve?.Orifice.indexOf('K')!== -1){
            //     console.log('111111 >>>>>>>>>>>>>',{newValve})
            // }
            if (CalculationMethod === 'Metric') {
                
                newValve.A = !isNaN(valve.A) ? convertUnit(valve.A, uoms.find(uom => uom.UnitKey === 'area.in2'), uoms.find(uom => uom.UnitKey === 'area.cm2')) : 0;
                newValve.AAPI = !isNaN(valve.AAPI) ? convertUnit(valve.AAPI, uoms.find(uom => uom.UnitKey === 'area.in2'), uoms.find(uom => uom.UnitKey === 'area.cm2')) : 0;
                if(service.includes('L')){
                    newValve.AL = !isNaN(valve.AL) ? convertUnit(valve.AL, uoms.find(uom => uom.UnitKey === 'area.in2'), uoms.find(uom => uom.UnitKey === 'area.cm2')) : 0;
                    newValve.AAPIL = !isNaN(valve.AAPIL) ? convertUnit(valve.AAPIL, uoms.find(uom => uom.UnitKey === 'area.in2'), uoms.find(uom => uom.UnitKey === 'area.cm2')) : 0;
                }
                if (valve.IsComplexValve) {
                    newValve.AV = !isNaN(valve.AV) ? convertUnit(valve.AV, uoms.find(uom => uom.UnitKey === 'area.in2'), uoms.find(uom => uom.UnitKey === 'area.cm2')) : 0;
                    newValve.AAPIV = !isNaN(valve.AAPIV) ? convertUnit(valve.AAPIV, uoms.find(uom => uom.UnitKey === 'area.in2'), uoms.find(uom => uom.UnitKey === 'area.cm2')) : 0;
                }
            }
            
            if (!ComplexOrSimpleValveLimits.find(limit => limit.ModelId === valve.ModelId && [valve.SizeCode, null, valve.Orifice].includes(limit.SizeCode))) {
                const { status, errorValves } = checkSpecialConditions(inputs, newValve,uoms,WorkFlowId);
                // console.log('Simple Valves>>>>>>>>>>>>> ', status, errorValves);
                passedValves.push(newValve);

            } else {
                const limits = ComplexOrSimpleValveLimits.filter(limit => limit.ModelId === valve.ModelId && ['', valve.SizeCode, null, valve.Orifice].includes(limit.SizeCode));
                if(valve?.Orifice=='K2'){
                    // console.log(' 11111>>>>>>>>>>>>>>>>> ', valve.ModelNumber, valve.Orifice, limits);
                }
                // Extract the variables converted based on the Calculation Method
                const variables = getKeyValuesForVariables(inputs, uoms, CalculationMethod);
                // Parse the Expressions in Limits and convert the values based on the Calculation Method
                const parsedLimits = getParsedExpressions(limits, Variables, uoms, CalculationMethod, { ...variables, ...inputs });
                if(valve?.Orifice=='K2'){
                    console.log('parsedLimits >>>> ', valve.ModelNumber, valve.Orifice, parsedLimits,parsedLimits[0]?.parsedExpression,parsedLimits[0]?.filteredExpression);
                }
                // Evaluate Expressions using the expressions and converted variables from the sizing inputs
                const { result, failedExpressions } = evaluateLimits(parsedLimits, { ...variables, ...inputs }, valve.ModelNumber);
                // if(valve?.Orifice=='K2'){
                //     console.log(' 2222>>>>>>>>>>>>>>>>> ', valve.ModelNumber, valve.Orifice, result, failedExpressions);
                // }
                // If result is true the Valve has passed the limits
                if (result) {
                    if (([8, 9, 10].includes(workflowId)) && (Pset > 1000 && ['900'].includes(valve.ModelNumber))) {
                        const localModelNumber = failedValves.find(fail => fail.ModelNumber === '900');
                        if (localModelNumber === undefined) {
                            const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = newValve;
                            failedValves.push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Pset > 1000 && Model == 900"] });
                        }
                    }
                    // MAWP Filters
                    else if (!inputs.IsVacuumOnly || (!isNaN(Number(inputs.SystemMAWP)) && Number(inputs.SystemMAWP) >= 0) || !modelNumbersMAWP.indexOf(valve.ModelNumber) !== -1) {
                        // Pback ratio Filters

                        if ((inputs?.IsVacuumOnly && inputs?.IsPressureOnly) || !(Number(inputs.SetPressure) > 0 && Number(inputs.TotalBackPressure) > 0)) {
                            const { status, errorValves } = checkSpecialConditions(inputs, newValve,uoms,WorkFlowId);

                            if (status) {
                                passedValves.push(newValve);
                            } else if (errorValves?.length > 0) {
                                failedValves.push(...errorValves);
                            } else {
                                if ((['Economizer', 'Preheater'].includes(inputs.SizingBasis) || inputs.IsSaturatedSteam) && ['5247', '5146', '5166'].includes(newValve.ModelNumber)) {
                                    passedValves.push(newValve);
                                }
                                else {
                                    const { Brand, ModelNumber, ValveType, SizeCode, ValveTypeSummary, VPValveType } = newValve;
                                    failedValves.push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["IsSaturatedSteam == true"] });
                                }
                            }
                        } else {
                            const ratio = Number(inputs.TotalBackPressure) / Number(inputs.SetPressure);
                            // failed Pback ratio valves
                            if (!(ratio >= 0 && ratio <= 0.9) && valve.VPValveType === "LP") {
                                const { Brand, ModelNumber, ValveType, SizeCode, ValveTypeSummary, VPValveType } = newValve;
                                failedValves.push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Pback < 0.9 * Pset"] });
                            } else {
                                const { status, errorValves } = checkSpecialConditions(inputs, newValve,uoms,WorkFlowId);
                                // console.log('Simple Valves 222222>>>>>>>>>>>>> ', status, errorValves);
                                if (status) {
                                    passedValves.push(newValve);
                                } else if (errorValves?.length > 0) {
                                    failedValves.push(...errorValves)
                                } else {
                                    if ((['Economizer', 'Preheater'].includes(inputs.SizingBasis) || inputs.IsSaturatedSteam) && ['5247', '5146', '5166'].includes(newValve.ModelNumber)) {
                                        passedValves.push(newValve);
                                    }
                                    else {
                                        const { Brand, ModelNumber, ValveType, SizeCode, ValveTypeSummary, VPValveType } = newValve;
                                        failedValves.push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["IsSaturatedSteam == true"] });
                                    }
                                }

                            }
                        }
                    } else {
                        // failed MAWP >= 0 valves
                        const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = newValve;
                        failedValves.push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["MAWP >= 0"] });
                    }
                } else if (([8, 9, 10].includes(workflowId)) && (Pset > 1000 && ['900'].includes(valve.ModelNumber))) {
                    const localModelNumber = failedValves.find(fail => fail.ModelNumber === '900');
                    if (localModelNumber === undefined) {
                        const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = newValve;
                        failedValves.push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Pset > 1000 && Model == 900"] });
                    }

                } else {
                    // failed limits valves
                    const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = newValve;
                    failedValves.push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions });
                }
            }
        }
    });


    startTime = new Date().getTime();
    const isASMEFlag = !!inputs?.IsASMESection8;
    // console.log(' >>>>>>>>>>>>>>>>>>>>> ',{workflowId,CalculationMethod,isASMEFlag,Code:inputs.Code,isVolumetric})
    const { workflowObjectASME, workflowObjectAPI, workflowObjectAPIDEF, workflowObjectAPIWTAVG } = WorkflowCalculations?.reduce((acc, wf) => {
        if (wf.WorkflowId === workflowId &&
            wf.CalculationMethod === CalculationMethod &&
            (wf.IsASMESection8 === isASMEFlag) &&
            wf.Code === inputs.Code &&
            wf.KADataSet === 'ASME' &&
            wf.IsValumetric === isVolumetric) {
            acc['workflowObjectASME'] = wf;
        } else if (wf.WorkflowId === workflowId &&
            wf.CalculationMethod === CalculationMethod &&
            (wf.IsASMESection8 === isASMEFlag) &&
            wf.Code === inputs.Code &&
            wf.KADataSet === 'API' &&
            wf.IsValumetric === isVolumetric) {
            acc['workflowObjectAPI'] = wf;

        } else if (CD_Series_WF && wf.WorkflowId === workflowId &&
            wf.CalculationMethod === CalculationMethod &&
            (wf.IsASMESection8 === isASMEFlag) &&
            wf.Code === inputs.Code &&
            wf.KADataSet === 'APIWTAVG' &&
            wf.IsValumetric === isVolumetric) {
            acc['workflowObjectAPIWTAVG'] = wf;
        }
        return acc;
    }, {});
    Vreqp = Vreqp === undefined ? '' : Vreqp;
    VreqV = VreqV === undefined ? '' : VreqV;
    const filteredFailedValves = CD_Series_WF ?
    {
        'ASME': failedValves.filter(v => passedValves.every(p => p.ModelNumber !== v.ModelNumber)),
        'API': failedValves.filter(v => passedValves.every(p => p.ModelNumber !== v.ModelNumber)),
        'APIWtAvg': failedValves.filter(v => passedValves.every(p => p.ModelNumber !== v.ModelNumber))
    }
    :{
        'ASME': failedValves.filter(v => passedValves.every(p => p.ModelNumber !== v.ModelNumber)),
        'API': failedValves.filter(v => passedValves.every(p => p.ModelNumber !== v.ModelNumber))
    }

    if(WorkFlowId==8){
        const ecoPreHSBFlag=['Preheater','Economizer']?.includes(inputs?.SizingBasis);
        if(!ecoPreHSBFlag){
            let P1 = Number(inputs.SetPressure) + Number(inputs.OverPressure) - Number(inputs.InletLoss) + Number(inputs.AtmPressure);
            P1= convertUnit(Number(P1), uoms.find(u => u.UnitKey === inputs?.AtmPressureUOM), uoms.find(u => u.UnitKey === "abspressure.psia"));
            let Ksh=1;
            let Ksc=1;
            if(P1<3208.2){
                if(inputs?.Ksh==undefined){
                    const calcKsh = await CalcSaturatedTempertureKsc(inputs);
                    Ksh = calcKsh.Ksh;
                }else{
                    Ksh = inputs.Ksh;
                }
            }else{
                if(inputs?.Ksc==undefined){
                    const calcKsc = await CalcSaturatedTempertureKsc(inputs);
                    Ksc = calcKsc.Ksc;
                }else{
                    Ksc = inputs.Ksc;
                }
            }
            inputs={...inputs, Ksh, Ksc}   
        }
    }
    
    workFlowTestKit =  workflowObjectASME?.WorkflowCalculation; // we need workFlowTestKit even if not any valve get passed validation for displayColumns names. line #1364
    
    passedValves = filterSSOA(passedValves, inputs);
    //console.log('passedValves >>>>>>>>>>>>>>> ',passedValves?.length)
    updatedPassedValves = passedValves.reduce((acc, valve) => {
        try {
            // console.log('Valve under calculation >>>>>>>>>>>>>>> ',valve.ModelNumber,valve.Orifice)
            const Kb = calculateKbKw(valve, inputs, constants);
            //workFlowTestKit =  workflowObjectASME?.WorkflowCalculation;
            const valveKey = WorkflowSelectedField[workFlowTestKit];  
                     
            let valveASME = getCalculationValidate(workflowObjectASME, valve, { constants, ...inputs, CalculationMethod, ...Kb,service }, uoms, workFlowTestKit, ComplexValveFlag);
            // if(valve?.ModelNumber==='9399C SC'){ 
            //     // console.log('000000000001111111111 >>>>>>>>>>>>>>>>>>',valve?.ModelNumber,valve?.Orifice,workFlowTestKit,valveKey,workflowObjectASME,valve)  
            //     console.log('ResultService >>>>>> isMultivalve >>>>>> ',inputs?.IsMultivalve,valve?.ModelNumber,valve?.NewOrifice ?? `${valve?.InletSize}" x ${valve?.OutletSize}"`,valveASME?.A,valveASME?.W,valveASME?.W_v);
            // } 
            workFlowTestKitAPI = workflowObjectAPI?.WorkflowCalculation;
            const valveKeyAPI = WorkflowSelectedField[workFlowTestKitAPI];
            let valveAPI = getCalculationValidate(workflowObjectAPI, valve, { constants, ...inputs, CalculationMethod, ...Kb,service }, uoms, workFlowTestKitAPI, ComplexValveFlag);
            
            let valveAPIWtAvg = {};
            let valveKeyAPIWtAvg = "";
            if(CD_Series_WF){
                
                workFlowTestKitAPIWtAvg = workflowObjectAPIWTAVG!==undefined? workflowObjectAPIWTAVG?.WorkflowCalculation:"";
                valveKeyAPIWtAvg = WorkflowSelectedField[workFlowTestKitAPIWtAvg];
                valveAPIWtAvg = getCalculationValidate(workflowObjectAPIWTAVG, valve, { constants, ...inputs, CalculationMethod, ...Kb }, uoms, workFlowTestKitAPIWtAvg, ComplexValveFlag);
            }

            if(TwoPhase_WF.includes(workflowId) && valveASME?.omega !==undefined && valveASME?.omega<=0){
                const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = valveASME;
                // console.log(' >>>>>>>>>>>>>>>>> ',ModelNumber, valveASME.Kv, valveASME.Kvreq);
                filteredFailedValves['ASME'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["ω <= 0"], valveASME });
            }else if ([5, 6, 7,...TwoPhase_WF].includes(workflowId) && (Vreqp !== '' && valveASME[valveKey] > 0 && valveASME[valveKey] >= Number(Vreqp))&& (valveASME.Kv < 0.3 || valveASME.Kvreq < 0.3 || valveASME.KvL < 0.3 ||valveASME.KvreqL < 0.3 || (inputs?.IsLiquid2 && valveASME.KvL2 < 0.3) ||( inputs?.IsLiquid2 && valveASME.KvreqL2 < 0.3))) {
                const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = valveASME;
                // console.log(' >>>>>>>>>>>>>>>>> ',ModelNumber, valveASME.Kv, valveASME.Kvreq);
                filteredFailedValves['ASME'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Kv < 0.3"], valveASME });
            } else {
                // console.log({ModelNumber:valveASME.ModelNumber, valveKey,Orifice:valveASME.Orifice, Vreqp});  

                if(Pressure_Vacuum_WF.indexOf(workflowId) !== -1 && isVacuumOnly && IsPressureOnly && (
                    inputs?.IsMultivalve || (!inputs?.IsMultivalve && ((Vreqp === '' && valveASME[valveKey] > 0 && VreqV === '' && valveASME[`${valveKey}_v`] > 0) || (Vreqp === '' && valveASME[valveKey] > 0 && (VreqV !== '' && valveASME[`${valveKey}_v`] > 0 && valveASME[`${valveKey}_v`] >= Number(VreqV))) || (VreqV === '' && valveASME[`${valveKey}_v`] > 0 && Vreqp !== '' && valveASME[valveKey] > 0 && valveASME[valveKey] >= Number(Vreqp))|| ((Vreqp !== '' && valveASME[valveKey] > 0 && valveASME[valveKey] >= Number(Vreqp)) &&  (VreqV !== '' && valveASME[`${valveKey}_v`] > 0 && valveASME[`${valveKey}_v`] >= Number(VreqV)))))
                ) 
                && IsFAIncludedOnRV){
                    // console.log({ModelNumber:valveASME.ModelNumber, valveKey,Orifice:valveASME.Orifice,valveKey:valveASME[valveKey], Vreqp,IsFAIncludedOnRV,VPValveType:valveASME.VPValveType}); 
                    if(FAValveType.indexOf(valveASME.VPValveType) !== -1 && workflowId!== 22){
                        if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber) && (valveASME.Kmax_v > 0 && valveASME.A_v > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                            // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3),[`${valveKey}_v`]: Number(round(valveASME[`${valveKey}_v`], 3)).toFixed(3)  });
                            acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]),[`${valveKey}_v`]: Number(valveASME[`${valveKey}_v`])  });
                        }
                    }else if(valveASME.VPValveType=='FA+FV' && workflowId== 22){
                        if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber) && (valveASME.Kmax_v > 0 && valveASME.A_v > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                            // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3),[`${valveKey}_v`]: Number(round(valveASME[`${valveKey}_v`], 3)).toFixed(3)  });
                            acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]),[`${valveKey}_v`]: Number(valveASME[`${valveKey}_v`])  });
                        }
                    }
                }else if(Pressure_Vacuum_WF.indexOf(workflowId) !== -1 && isVacuumOnly && IsPressureOnly && (
                    inputs?.IsMultivalve || (!inputs?.IsMultivalve && ((Vreqp === '' && valveASME[valveKey] > 0 && VreqV === '' && valveASME[`${valveKey}_v`] > 0) || (Vreqp === '' && valveASME[valveKey] > 0 && (VreqV !== '' && valveASME[`${valveKey}_v`] > 0 && valveASME[`${valveKey}_v`] >= Number(VreqV))) || (VreqV === '' && valveASME[`${valveKey}_v`] > 0 && Vreqp !== '' && valveASME[valveKey] > 0 && valveASME[valveKey] >= Number(Vreqp))|| ((Vreqp !== '' && valveASME[valveKey] > 0 && valveASME[valveKey] >= Number(Vreqp)) &&  (VreqV !== '' && valveASME[`${valveKey}_v`] > 0 && valveASME[`${valveKey}_v`] >= Number(VreqV)))))
                ) && !IsFAIncludedOnRV){
            
                    if(FAValveType.indexOf(valveASME.VPValveType) === -1 && workflowId!== 22){
                        if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber) && (valveASME.Kmax_v > 0 && valveASME.A_v > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                            // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3),[`${valveKey}_v`]: Number(round(valveASME[`${valveKey}_v`], 3)).toFixed(3)  });
                            acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]),[`${valveKey}_v`]: Number(valveASME[`${valveKey}_v`])});
                        }
                    }else if(valveASME.VPValveType !=='FA+FV' && workflowId== 22){
                        if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber) && (valveASME.Kmax_v > 0 && valveASME.A_v > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                            // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3),[`${valveKey}_v`]: Number(round(valveASME[`${valveKey}_v`], 3)).toFixed(3)  });
                            acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]),[`${valveKey}_v`]: Number(valveASME[`${valveKey}_v`])  });
                        }
                    }
                }else if(Pressure_Vacuum_WF.indexOf(workflowId) !== -1 && isVacuumOnly && !IsPressureOnly && (
                    inputs?.IsMultivalve || (!inputs?.IsMultivalve && ((VreqV === '' && valveASME[valveKey] > 0) || (VreqV !== '' && valveASME[valveKey] > 0 && valveASME[valveKey] >= Number(VreqV))))
                )  && IsFAIncludedOnRV){
            
                    if(FAValveType.indexOf(valveASME.VPValveType) !== -1 && workflowId!== 22){
                        if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                            // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3) });
                            acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]) });
                        }
                    }else if(valveASME.VPValveType=='FA+FV' && workflowId== 22){
                        if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber) && (valveASME.Kmax_v > 0 && valveASME.A_v > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                            // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3),[`${valveKey}_v`]: Number(round(valveASME[`${valveKey}_v`], 3)).toFixed(3)  });
                            acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]),[`${valveKey}_v`]: Number(valveASME[`${valveKey}_v`])  });
                        }
                    }
                }else if(Pressure_Vacuum_WF.indexOf(workflowId) !== -1 && isVacuumOnly && !IsPressureOnly && (
                    inputs?.IsMultivalve || (!inputs?.IsMultivalve && ((VreqV === '' && valveASME[valveKey] > 0) || (VreqV !== '' && valveASME[valveKey] > 0 && valveASME[valveKey] >= Number(VreqV))))
                )  && !IsFAIncludedOnRV){
                    
                    if(FAValveType.indexOf(valveASME.VPValveType) === -1 && workflowId!== 22){
                        if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                            // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3) });
                            acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]) });
                        }
                    }else if(valveASME.VPValveType !=='FA+FV' && workflowId== 22){
                        if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber) && (valveASME.Kmax_v > 0 && valveASME.A_v > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                            // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3),[`${valveKey}_v`]: Number(round(valveASME[`${valveKey}_v`], 3)).toFixed(3)  });
                            acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]),[`${valveKey}_v`]: Number(valveASME[`${valveKey}_v`])  });
                        }
                    }
                }else if(Pressure_Vacuum_WF.indexOf(workflowId) !== -1 && !isVacuumOnly && IsPressureOnly && (
                    inputs?.IsMultivalve || (!inputs?.IsMultivalve && ((Vreqp === '' && valveASME[valveKey] > 0) || (Vreqp !== '' && valveASME[valveKey] > 0 && valveASME[valveKey] >= Number(Vreqp))))
                ) && IsFAIncludedOnRV){
                    
                    if(FAValveType.indexOf(valveASME.VPValveType) !== -1 && workflowId!== 22){
                        if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber) && (valveASME.Kmax_v > 0 && valveASME.A_v > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                            // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3) });
                            acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]) });
                        }
                    }else if(valveASME.VPValveType=='FA+FV' && workflowId== 22){
                        if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber) && (valveASME.Kmax_v > 0 && valveASME.A_v > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                            // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3),[`${valveKey}_v`]: Number(round(valveASME[`${valveKey}_v`], 3)).toFixed(3)  });
                            acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]),[`${valveKey}_v`]: Number(valveASME[`${valveKey}_v`])  });
                        }
                    }
                }else if(Pressure_Vacuum_WF.indexOf(workflowId) !== -1 && !isVacuumOnly && IsPressureOnly && (
                    inputs?.IsMultivalve || (!inputs?.IsMultivalve && ((Vreqp === '' && valveASME[valveKey] > 0) || (Vreqp !== '' && valveASME[valveKey] > 0 && valveASME[valveKey] >= Number(Vreqp))))
                ) && !IsFAIncludedOnRV){
                
                    if(FAValveType.indexOf(valveASME.VPValveType) === -1 && workflowId!== 22){
                        if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber) && (valveASME.Kmax_v > 0 && valveASME.A_v > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                            // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3) });
                            acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]) });
                        }
                    }else if(valveASME.VPValveType !=='FA+FV' && workflowId== 22){
                        if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber) && (valveASME.Kmax_v > 0 && valveASME.A_v > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                            // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3),[`${valveKey}_v`]: Number(round(valveASME[`${valveKey}_v`], 3)).toFixed(3)  });
                            acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]),[`${valveKey}_v`]: Number(valveASME[`${valveKey}_v`])  });
                        }
                    }
                }else if (workflowId == 12  && inputs.FireSizingMethod === 'Unwetted' && ((Vreqp === '' && valveASME[valveKey] > 0) || (Vreqp !== '' && valveASME[valveKey] > 0 && valveASME[valveKey] >= Number(Vreqp)))) {

                    if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                        // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3) });
                        if(valveASME[valveKey] >= valveASME['Wreqp']){

                            acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]) });
                        }
                    }
                }else if (Pressure_Vacuum_WF.indexOf(workflowId) === -1 && (
                    inputs?.IsMultivalve || (!inputs?.IsMultivalve && ((Vreqp === '' && valveASME[valveKey] > 0) || (Vreqp !== '' && valveASME[valveKey] > 0 && valveASME[valveKey] >= Number(Vreqp))))
                )) {
                    //  if(valveASME?.ModelNumber=='853'){
                    //         console.log('22222 >>>>>>>>>>>> ',valveASME)
                    //     }
                    if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                        // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3) });
                        acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]) });
                    }
                    // console.log(' >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>..... 111111111111111111111 >>>>> ',valveASME?.ModelNumber, valveASME?.Orifice);
                } else {
            
                    const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, ReResponse } = valveASME;
                    if ([5, 6, 7,...TwoPhase_WF].includes(workflowId) && (valveASME.Kv < 0.3 || valveASME.Kvreq < 0.3 || valveASME.KvL < 0.3 ||valveASME.KvreqL < 0.3 || (inputs?.IsLiquid2 && valveASME.KvL2 < 0.3) ||( inputs?.IsLiquid2 && valveASME.KvreqL2 < 0.3))) {
                        // const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = valveASME;
                        // console.log(' >>>>>>>>>>>>>>>>> ',ModelNumber, valveASME.Kv, valveASME.Kvreq);
                        filteredFailedValves['ASME'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Kv < 0.3"], valveASME });
                    }
                    let parsedResponse={};
                    
                    let Kb = 0;
                    if (ReResponse) {
                        try {
                            parsedResponse = JSON.parse(ReResponse);
                            Kb = parsedResponse?.Kb || parsedResponse?.equationValues?.Kb || 0;
                        } catch (error) {
                            console.error("Failed to parse ReResponse:", error, workFlowTestKit);
                        }
                    }
                    
                    // if(Brand === 'Anderson Greenwood'){
                            // console.log(ModelNumber,VPValveType,valveKey,valveASME[valveKey],Kb,isNaN(valveASME[valveKey]),(valveASME[valveKey] == 0 || isNaN(valveASME[valveKey])) && Kb === 0)
                    //     }
                    if ((valveASME[valveKey] == 0 || isNaN(valveASME[valveKey])) && Kb === 0) {
                        if (Brand === 'Anderson Greenwood' && VPValveType === 'PO') {
                            filteredFailedValves['ASME'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Kb = 0"], valveASME });
                        } else {
                            filteredFailedValves['ASME'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["PbackType === 0"], valveASME });
                        }
                    } else {
                        filteredFailedValves['ASME'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Vreqp >= 0"], valveASME });
                    }
                }
            }

            if(TwoPhase_WF.includes(workflowId) && valveAPI?.omega !==undefined && valveAPI?.omega<=0){
                const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = valveAPI;
                // console.log(' >>>>>>>>>>>>>>>>> ',ModelNumber, valveASME.Kv, valveASME.Kvreq);
                filteredFailedValves['API'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["ω <= 0"], valveAPI });
            // }else if ([5, 6, 7,...TwoPhase_WF].includes(workflowId) && (Vreqp === '' && valveAPI[valveKeyAPI] > 0) || (Vreqp !== '' && valveAPI[valveKeyAPI] > 0 && valveAPI[valveKeyAPI] >= Number(Vreqp)) && (valveAPI.Kv < 0.3 || valveAPI.Kvreq < 0.3  || valveAPI.KvL < 0.3 ||valveAPI.KvreqL < 0.3 || (inputs?.IsLiquid2 && valveAPI.KvL2 < 0.3) ||(inputs?.IsLiquid2 && valveAPI.KvreqL2 < 0.3))) {
            }else if ([5, 6, 7,...TwoPhase_WF].includes(workflowId) && (valveAPI.Kv < 0.3 || valveAPI.Kvreq < 0.3 || valveAPI.KvL < 0.3 ||valveAPI.KvreqL < 0.3 || (inputs?.IsLiquid2 && valveAPI.KvL2 < 0.3) ||( inputs?.IsLiquid2 && valveAPI.KvreqL2 < 0.3))) { //done changes for WF-6 to resolve issue #42 from file "PRVPAV2 API Issue List"
                const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = valveAPI;
                filteredFailedValves['API'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Kv < 0.3"], valveAPI });
            } else {
                
                // if(Pressure_Vacuum_WF.indexOf(workflowId) !== -1 && isVacuumOnly && IsPressureOnly){

                if (workflowId == 12 && inputs.FireSizingMethod === 'Unwetted' && ((Vreqp === '' && valveAPI[valveKey] > 0) || (Vreqp !== '' && valveAPI[valveKey] > 0 && valveAPI[valveKey] >= Number(Vreqp)))) {

                    if ((valveAPI.Kmax > 0 && valveAPI.A > 0) || Models92xx93xxMLCP.includes(valveAPI.ModelNumber)) {
                        // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3) });
                        if(valveAPI[valveKey] >= valveAPI['Wreqp']){

                            acc['API'].push({ ...valveAPI, [valveKey]: Number(valveAPI[valveKey]) });
                        }
                    }
                }else if ((Vreqp === '' && valveAPI[valveKeyAPI] > 0) || (Vreqp !== '' && valveAPI[valveKeyAPI] > 0 && valveAPI[valveKeyAPI] >= Number(Vreqp))) {
                    if ((valveAPI.KAPI > 0 && valveAPI.AAPI > 0) || Models92xx93xxMLCP.includes(valveAPI.ModelNumber)) {
                        // acc['API'].push({ ...valveAPI, [valveKeyAPI]: round(valveAPI[valveKeyAPI], 3) });
                        acc['API'].push({ ...valveAPI, [valveKeyAPI]: Number(valveAPI[valveKeyAPI]) });
                    }
                } else {
                    const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, ReResponse } = valveAPI;

                    if ([5, 6, 7,...TwoPhase_WF].includes(workflowId) && (Vreqp === '' && valveAPI[valveKeyAPI] > 0) || (Vreqp !== '' && valveAPI[valveKeyAPI] > 0 && valveAPI[valveKeyAPI] >= Number(Vreqp)) && (valveAPI.Kv < 0.3 || valveAPI.Kvreq < 0.3  || valveAPI.KvL < 0.3 ||valveAPI.KvreqL < 0.3 || (inputs?.IsLiquid2 && valveAPI.KvL2 < 0.3) ||(inputs?.IsLiquid2 && valveAPI.KvreqL2 < 0.3))) {
                        // const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = valveAPI;
                        filteredFailedValves['API'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Kv < 0.3"], valveAPI });
                    }
                    let Kb = 0;
                    let parsedResponse={};
                    if (ReResponse) {
                        try {
                            parsedResponse = JSON.parse(ReResponse);
                            Kb = parsedResponse?.Kb || parsedResponse?.equationValues?.Kb || 0;
                        } catch (error) {
                            console.error("Failed to parse ReResponse:", error, workFlowTestKitAPI);
                        }
                    }
                    if ((valveAPI[valveKeyAPI] == 0 || isNaN(valveAPI[valveKeyAPI])) && Kb === 0) {
                        if (Brand === 'Anderson Greenwood' && VPValveType === 'PO') {
                            filteredFailedValves['API'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Kb = 0"], valveAPI });
                        } else {
                            filteredFailedValves['API'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["PbackType === 0"], valveAPI });
                        }
                    } else {
                        filteredFailedValves['API'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Vreqp >= 0"], valveAPI });
                    }
                }
            }

            if(CD_Series_WF){
                
                if(TwoPhase_WF.includes(workflowId) && valveAPIWtAvg?.omega !==undefined && valveAPIWtAvg?.omega<=0){
                    const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = valveAPIWtAvg;
                    // console.log(' >>>>>>>>>>>>>>>>> ',ModelNumber, valveASME.Kv, valveASME.Kvreq);
                    filteredFailedValves['APIWtAvg'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["ω <= 0"], valveAPIWtAvg });
                }else if ([5, 6, 7,...TwoPhase_WF].includes(workflowId) && (Vreqp === '' && valveAPIWtAvg[valveKeyAPIWtAvg] > 0) || (Vreqp !== '' && valveAPIWtAvg[valveKeyAPIWtAvg] > 0 && valveAPIWtAvg[valveKeyAPIWtAvg] >= Number(Vreqp)) && (valveAPIWtAvg.Kv < 0.3 || valveAPIWtAvg.Kvreq < 0.3  || valveAPIWtAvg.KvL < 0.3 ||valveAPIWtAvg.KvreqL < 0.3 || (inputs?.IsLiquid2 && valveAPIWtAvg.KvL2 < 0.3) ||(inputs?.IsLiquid2 && valveAPIWtAvg.KvreqL2 < 0.3))) {
                    const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = valveAPIWtAvg;
                    filteredFailedValves['APIWtAvg'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Kv < 0.3"], valveAPIWtAvg });
                } else {
                    
                    // if(Pressure_Vacuum_WF.indexOf(workflowId) !== -1 && isVacuumOnly && IsPressureOnly){

                    if ((Vreqp === '' && valveAPIWtAvg[valveKeyAPIWtAvg] > 0) || (Vreqp !== '' && valveAPIWtAvg[valveKeyAPIWtAvg] > 0 && valveAPIWtAvg[valveKeyAPIWtAvg] >= Number(Vreqp))) {
                        if ((valveAPIWtAvg.KAPI > 0 && valveAPIWtAvg.AAPI > 0) || Models92xx93xxMLCP.includes(valveAPIWtAvg.ModelNumber)) {
                            // acc['API'].push({ ...valveAPI, [valveKeyAPI]: round(valveAPI[valveKeyAPI], 3) });
                            acc['APIWtAvg'].push({ ...valveAPIWtAvg, [valveKeyAPIWtAvg]: Number(valveAPIWtAvg[valveKeyAPIWtAvg]) });
                        }
                    } else {
                        const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, ReResponse } = valveAPIWtAvg;

                        if ([5, 6, 7,...TwoPhase_WF].includes(workflowId) && (Vreqp === '' && valveAPIWtAvg[valveKeyAPIWtAvg] > 0) || (Vreqp !== '' && valveAPIWtAvg[valveKeyAPIWtAvg] > 0 && valveAPIWtAvg[valveKeyAPIWtAvg] >= Number(Vreqp)) && (valveAPIWtAvg.Kv < 0.3 || valveAPIWtAvg.Kvreq < 0.3  || valveAPIWtAvg.KvL < 0.3 ||valveAPIWtAvg.KvreqL < 0.3 || (inputs?.IsLiquid2 && valveAPIWtAvg.KvL2 < 0.3) ||(inputs?.IsLiquid2 && valveAPIWtAvg.KvreqL2 < 0.3))) {
                            // const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = valveAPI;
                            filteredFailedValves['APIWtAvg'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Kv < 0.3"], valveAPIWtAvg });
                        }
                        let Kb = 0;
                        let parsedResponse={};
                        if (ReResponse) {
                            try {
                                parsedResponse = JSON.parse(ReResponse);
                                Kb = parsedResponse?.Kb || parsedResponse?.equationValues?.Kb || 0;
                            } catch (error) {
                                console.error("Failed to parse ReResponse:", error, workFlowTestKitAPIWtAvg);
                            }
                        }
                        if ((valveAPIWtAvg[valveKeyAPIWtAvg] == 0 || isNaN(valveAPIWtAvg[valveKeyAPIWtAvg])) && Kb === 0) {
                            if (Brand === 'Anderson Greenwood' && VPValveType === 'PO') {
                                filteredFailedValves['APIWtAvg'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Kb = 0"], valveAPIWtAvg });
                            } else {
                                filteredFailedValves['APIWtAvg'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["PbackType === 0"], valveAPIWtAvg });
                            }
                        } else {
                            filteredFailedValves['APIWtAvg'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Vreqp >= 0"], valveAPIWtAvg });
                        }
                    }
                }
            }
        } catch (e) {
            console.log({ e });
        }
        return acc;
    }, { 'ASME': [], 'API': [], 'APIDef': [], 'APIWtAvg': [] });
        // }, { 'ASME': [], 'API': [],  'APIWtAvg': [] });

    // console.log('updatedPassedValves >>>>>>>>>>>>>>> ',updatedPassedValves['ASME']?.length,updatedPassedValves['API']?.length,updatedPassedValves['API Default']?.length,updatedPassedValves['API Wt. Avg.']?.length);
    // Build a Set of ModelNumbers for passed valves for quick lookup
    const passedASMEModelNumbers = new Set(updatedPassedValves['ASME']?.map(v => v.ModelNumber));
    const passedAPIModelNumbers = new Set(
        [
            ...(updatedPassedValves['API'] || []),
            ...(updatedPassedValves['APIDef'] || []),
            ...(updatedPassedValves['APIWtAvg'] || [])
        ].map(v => v.ModelNumber)
    );

    ['ASME', 'API', 'APIDef', 'APIWtAvg']?.forEach(key => {
        // console.log(`updatedPassedValves[${key}] >>>>>>>>>>>>>>> `,updatedPassedValves[key]?.length)
        updatedPassedValves[key] = updatedPassedValves[key]?.map(valve => {
            const popupDetails=popupMessageCheck(workflowId,valve,inputs,id);
            if(popupDetails!==undefined){
                // console.log('ASME Popup Details >>>>>>>>>>> ',valveASME?.ModelNumber,popupDetails)
                return { ...valve,isValvePopup:true,popupDetails  };
            }
            return {...valve};
        })
    });

    // Filter ASME failed valves
    ['ASME', 'API', 'APIDef', 'APIWtAvg']?.forEach(key => {
        if(key==='ASME' && filteredFailedValves[key]!== undefined && filteredFailedValves[key]?.length > 0){
            filteredFailedValves[key] = filteredFailedValves[key]?.filter(valve => {
                if (passedASMEModelNumbers.has(valve.ModelNumber)) {
                    return valve?.failedExpressions?.includes("Kv < 0.3");
                }
                return true;
            });
        }else if(filteredFailedValves[key]!== undefined && filteredFailedValves[key]?.length > 0){
            filteredFailedValves[key] = filteredFailedValves[key]?.filter(valve => {
                if (passedAPIModelNumbers.has(valve.ModelNumber)) {
                    return valve?.failedExpressions?.includes("Kv < 0.3");
                }
                return true;
            });
        }
    }); 

    const filteredFailedValves1= errorMessages(filteredFailedValves,['ASME', 'API', 'APIDef', 'APIWtAvg'],workflowId,inputs);
// console.log({...filteredFailedValves1})
    // filteredFailedValves['ASME'] = filteredFailedValves['ASME'].filter(valve => {
    //     if (passedASMEModelNumbers.has(valve.ModelNumber)) {
    //         // Only keep if failedExpressions contains "Kv < 0.3"
    //         return valve?.failedExpressions?.includes("Kv < 0.3");
    //     }
    //     return true;
    // });

    // // Filter API failed valves
    // filteredFailedValves['API'] = filteredFailedValves['API'].filter(valve => {
    //     if (passedAPIModelNumbers.has(valve.ModelNumber)) {
    //         return valve?.failedExpressions?.includes("Kv < 0.3");
    //     }
    //     return true;
    // });
          
    startTime = new Date().getTime();
    let modelColumns = updatedPassedValves['ASME']?.length > 0 && Object.keys(updatedPassedValves['ASME'][0])?.map(valve => ({
        name: valve
    }));
    if(modelColumns==false){
        modelColumns = updatedPassedValves['API']?.length > 0 && Object.keys(updatedPassedValves['API'][0])?.map(valve => ({
            name: valve
        }));
    }
    const resultValves = { ...updatedPassedValves };

    const fieldName = WorkflowSelectedField[workFlowTestKit];
    // console.log(isVacuumOnly && IsPressureOnly,isVacuumOnly , IsPressureOnly,workflowId,inputs.IsASMESection8,(workflowId==1 || workflowId==5 || workflowId==9) && inputs.IsASMESection8)
    const kit = isVacuumOnly && IsPressureOnly ? workFlowTestKit + '_PV' : isVacuumOnly ? workFlowTestKit + '_V' : ((workflowId==1 || workflowId==5 || workflowId==9) && !inputs.IsASMESection8) || workflowId==2 || workflowId==6 || workflowId==10?workFlowTestKit+'_Act':workFlowTestKit;
    let kitAPI = isVacuumOnly && IsPressureOnly ? workFlowTestKitAPI + '_PV' : isVacuumOnly ? workFlowTestKitAPI + '_V' :workFlowTestKitAPI;
    kitAPI=kitAPI+'_API';
    // console.log(kit,kitAPI,workflowId,inputs.IsLiquid2)
    const displayColumns = WorkflowResultsHeader[kit]?.map(col => {
        // console.log(col,fieldName);
        if (col?.name == fieldName) {
            const localUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);
            let label = col?.label?.replace('FlowCapacityUOM', localUOM?.UnitName);
            if (!isVolumetric) {
                label = label.replace('Pressure ', '');
            }
            return { ...col, label }
        }else if (col?.name == 'Wreqp') {
            const localUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);
            let label = col?.label?.replace('FlowCapacityUOM', localUOM?.UnitName);
            // if (!isVolumetric) {
            //     label = label.replace('Pressure ', '');
            // }
            return { ...col, label }
        
        } else if (isVacuumOnly && IsPressureOnly && col?.name == `${fieldName}_v`) {
            const localUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);
            const label = col?.label?.replace('FlowCapacityUOM', localUOM?.UnitName);
            return { ...col, label }
        } else {
            return col;
        }
    });

    const displayColumnsAPI = WorkflowResultsHeader[kitAPI]?.map(col => {
        if (col?.name == fieldName) {
            const localUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);
            let label = col?.label?.replace('FlowCapacityUOM', localUOM?.UnitName);
            // if (!isVolumetric && inputs?.WorkflowId !==12) {
            //     label = label.replace('Pressure ', '');
            // }
            return { ...col, label }
        }else if (col?.name == 'Wreqp') {
            const localUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);
            let label = col?.label?.replace('FlowCapacityUOM', localUOM?.UnitName);
            return { ...col, label }
        }else if (col?.name == 'Wreq_v') {
            const localUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);
            let label = col?.label?.replace('FlowCapacityUOM', localUOM?.UnitName);
            if (!isVolumetric) {
                label = label.replace('Pressure ', '');
            }
            return { ...col, label }
        }else if (col?.name == 'WreqV') {
            const localUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);
            let label = col?.label?.replace('FlowCapacityUOM', localUOM?.UnitName);
            if (!isVolumetric) {
                label = label.replace('Pressure ', '');
            }
            return { ...col, label }
        } else if (isVolumetric && !IsPressureOnly && col?.name == `${fieldName}_v`) {
            const localUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);
            const label = col?.label?.replace('FlowCapacityUOM', localUOM?.UnitName);
            return { ...col, label }
        } else if (isVacuumOnly && IsPressureOnly && col?.name == `${fieldName}_v`) {
            const localUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);
            const label = col?.label?.replace('FlowCapacityUOM', localUOM?.UnitName);
            return { ...col, label }
        } else {
            return col;
        }
    });
    // console.log(filteredFailedValves['ASME'])
    // console.log(filteredFailedValves['ASME']?.length,filteredFailedValves['API']?.length,filteredFailedValves['APIWtAvg']?.length,filteredFailedValves['APIDef']?.length);

    const isMultiValveActive = inputs?.IsMultivalve === true ? (workflowId === 3 || workflowId === 23)? true: false : false;
    // console.log('isMultiValveActive >>>>>>>>>>>>>>>>> ',{isMultiValveActive,workflowId,isMultivalve:inputs?.IsMultivalve,MULTIVALVE_SECTION_WF: process.env?.MULTIVALVE_SECTION_WF.split(','),MULTIVALVE_SECTION_WF_Flag:process.env?.MULTIVALVE_SECTION_WF.split(',').includes(workflowId.toString())})
    let MultiValveFieldSection;
    let finalDisplayColumns = [...displayColumns];
    let finalDisplayColumnsAPI = displayColumnsAPI ? [...displayColumnsAPI] : [];
    if (isMultiValveActive) {
        const newColumns = [{ name: "Quantity", label: "Quantity" }];
        const localUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);
        if(isVacuumOnly && IsPressureOnly){
            newColumns.push({ name: "MaxWsel", label: `Total Max Pressure Valve Flow (${localUOM?.UnitName})` });
            newColumns.push({ name: "MaxWselV", label: `Total Max Vacuum Valve Flow (${localUOM?.UnitName})` });
        // } else if(isVacuumOnly){
        //     newColumns.push({ name: "MaxWselV", label: `Total Max Vacuum Valve Flow (${localUOM?.UnitName})` });
        // } else if(IsPressureOnly){
        //     newColumns.push({ name: "MaxWsel", label: `Total Max Pressure Valve Flow (${localUOM?.UnitName})` });
        }
        finalDisplayColumns    = displayColumns    ? [...displayColumns,    ...newColumns] : displayColumns;
        // finalDisplayColumnsAPI = displayColumnsAPI ? [...displayColumnsAPI, [...newColumns]] : displayColumnsAPI;
        // console.log('finalDisplayColumns >>>>>>>>>>>>>>>>> ',finalDisplayColumns)
    }else if(inputs?.IsMultivalve === true && process.env?.MULTIVALVE_SECTION_WF.split(',').includes(workflowId.toString())){
        let multiValveFieldFilePath = path.join(__dirname, `../../data/MultiValve/MultiValveFieldSelection.json`);
        let workflowSection=path.join(__dirname, `../../data/workflows/workflowSections${workflowId}.json`);
        let workflowSectionData;
        let dimensionData;
        if(fs.existsSync(workflowSection)){
            workflowSectionData = JSON.parse(fs.readFileSync(workflowSection, 'utf-8'));
            workflowSectionData = workflowSectionData?.length > 0 ? workflowSectionData?.find(section => section?.sectionName==='flowCapacity') : null;
            workflowSectionData = workflowSectionData ? workflowSectionData?.fields : {};
            dimensionData= workflowSectionData?.length > 0 ? workflowSectionData[0]?.dimensionName : null;
        }
        
        // const localUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);
        //     const label = col?.label?.replace('FlowCapacityUOM', localUOM?.UnitName);
                    
        // console.log(fs.existsSync(multiValveFieldFilePath),multiValveFieldFilePath)
        if(fs.existsSync(multiValveFieldFilePath)){
            const multiValveFieldData = JSON.parse(fs.readFileSync(multiValveFieldFilePath, 'utf-8'));
            const multiValveFields = Object.keys(multiValveFieldData) ??[];
            MultiValveFieldSection = {}
            multiValveFields.forEach(field => {
                let localSection = multiValveFieldData[field];
                // console.log(field,localSection)
                if(localSection?.uomFieldName==='OrificeAreaUOM'){
                    const CalculationMethod= inputs?.CalculationMethod || 'English';
                    // console.log('CalculationMethod >>>>>>>>>>>>> ',CalculationMethod,localSection?.options)
                    // const options=localSection?.options ??[];// JSON.parse(localSection?.options) : [];
                    let OrificeAreaUOM = inputs?.OrificeAreaUOM ?? '';
                    if(OrificeAreaUOM ===''){
                        if(CalculationMethod === 'English'){
                            OrificeAreaUOM = "area.in2";
                        } else {
                            OrificeAreaUOM = "area.cm2";
                        }
                    }
                    localSection['uomValue'] = OrificeAreaUOM;
                    localSection['defaultUOMValue'] = OrificeAreaUOM;
                }
                if(localSection?.uomFieldName==='FlowCapacityUOM'){
                    if(dimensionData !==null){
                        // console.log('dimensionData >>>>>>>>>>>>> ',dimensionData);
                        let dimensionUnits = [];
                        dimensionData?.forEach((dim,index) => {
                            
                            let localdimensionUnits = []
                            uoms?.forEach(u => {
                                if(u?.DimensionName === dim){
                                    localdimensionUnits.push({value:u?.UnitKey,label:u?.UnitName});
                                }});
                            
                            if(dimensionData?.length -1 > index && localdimensionUnits?.length > 0){
                                localdimensionUnits?.push({'value':`dim ${index + 1}`,'label':'-----'}) ?? [];
                            }
                            // console.log('dim >>>>>>>>>>>>> ',dim,Array.isArray(localdimensionUnits),localdimensionUnits?.length);
                            dimensionUnits = [...dimensionUnits, ...localdimensionUnits];
                        });
                        localSection['options'] = [...dimensionUnits];
                        
                        
                    }
                    localSection['uomValue'] = inputs?.FlowCapacityUOM ?? '';
                    localSection['defaultUOMValue'] = inputs?.FlowCapacityUOM ?? '';
                }
                MultiValveFieldSection[field] = { ...localSection };
            });

            // return { ...MultiValveFieldSection}
        }
            
    }
        
    return {
        columns: modelColumns,
        displayColumns: finalDisplayColumns,
        displayColumnsAPI: finalDisplayColumnsAPI,
        rows: resultValves,
        // errors: filteredFailedValves,
        MultiValveFieldSection,
        errors: {...filteredFailedValves1}

    }
}

const getWorkflowResultsCalc=async (params,id=null,source='REST')=>{
    let startTime = new Date().getTime();
    const { WorkFlowId, CalculationMethod, KADataSet, pageNumber, pageSize, DisplayAllOrifices, activeFilters, ...inputdata } = params;
    const isPaginated = pageNumber !== undefined && pageNumber !== null
                     && pageSize  !== undefined && pageSize  !== null;
    // console.log('getWorkflowResultsCalc 11111111 >>>>>>>>>>>>>>>>> ',{WorkFlowId, CalculationMethod, KADataSet, pageNumber, pageSize})
    if(inputdata?.error?.length > 0){
        let errorTypeMsg=[];
        inputdata?.error?.forEach(err => {
            const alreadyExists = errorTypeMsg?.some(e => e?.message === err?.value?.description);  
            if(err?.value?.type === 'error' && !alreadyExists){
                errorTypeMsg.push({type:'General Errors',message:err?.value?.description});
            }
        });
        if(errorTypeMsg?.length > 0){
            return {
                columns: false,
                displayColumns: [],
                // displayColumnsAPI: finalDisplayColumnsAPI,
                rows: {
                    'ASME': KADataSet=== 'ASME' ? [] : false,
                    'API': KADataSet=== 'API' ? [] : false,
                    // 'APIDef': KADataSet=== 'APIDef' ? [] : false,
                    // 'APIWtAvg': KADataSet=== 'APIWtAvg' ? [] : false
                },
                totalCounts:0,
                pageNumber: isPaginated ? Number(pageNumber) : null,
                pageSize:   isPaginated ? Number(pageSize)   : null,
                filterOption:{},
                // errors: filteredFailedValves,
                SelectedValves: inputdata?.SelectedValves ?? [],
                selectedValvesHeader: undefined,
                MultiValveFieldSection: undefined,
                ProceedButtonEnableFlag:false,
                MultiValveSelectionData: undefined,
                errors: {
                    'ASME': [...errorTypeMsg],
                    'API': [...errorTypeMsg],
                    // 'APIDef': KADataSet=== 'APIDef' ? [...errorTypeMsg] : false,
                    // 'APIWtAvg': KADataSet=== 'APIWtAvg' ? [...errorTypeMsg] : false
                }

            }
        }
    }
    // console.log('getWorkflowResultsCalc 22222222222 >>>>>>>>>>>>>>>>> ',{WorkFlowId, CalculationMethod, KADataSet, pageNumber, pageSize})
    const hasActiveFilters = activeFilters && typeof activeFilters === 'object' && Object.keys(activeFilters).length > 0;
    let inputs = { ...inputdata };
    const constants = getConstants(CalculationMethod);
    const uoms = await getUOMs();

    startTime = new Date().getTime();
    const service = mapServiceWithPACode(inputs.FluidType,WorkFlowId);

    const { FlowCapacityUOM } = inputs;
    const [dimension, unit] = FlowCapacityUOM !== undefined ? FlowCapacityUOM?.split('.') : ['', ''];
    const isVolumetric = !(dimension === 'massflow');

    const workflowId = parseInt(WorkFlowId);
    let passedValves = [];
    const failedValves = [];
    let updatedPassedValves = {};
    
    let ComplexOrSimpleValves = [];
    let ComplexOrSimpleValveLimits = [];

    let Vreqp = inputs?.Wreq || inputs?.Qreq || inputs?.VlreqMass;
    let VreqV = inputs?.WreqV || inputs?.QreqV || inputs?.VlreqMassV;

    let CD_Series_WF = TwoPhase_CDSeries_WF.includes(workflowId);
    const isMultiValveActive = inputs?.IsMultivalve === true ? (workflowId === 3 || workflowId === 23)? true: false : false;
    startTime = new Date().getTime();
    if (inputs.IsPressureOnly && inputs.IsVacuumOnly) {
        const rows = await _fetchValvesWithLimits(true, workflowId, service, null);
        const { ComplexValves, Limits } = rows[0];
        ComplexOrSimpleValves = [...ComplexValves]
        ComplexOrSimpleValveLimits = [...Limits]
    } else {
        const serviceType = inputs.IsVacuumOnly ? 'V' : 'P';
        const rows = await _fetchValvesWithLimits(false, workflowId, service, serviceType);
        let { SimpleValves, Limits } = rows?.length>0 ? rows[0] : {SimpleValves:[], Limits:[]};
        SimpleValves=SimpleValves==null?[]:SimpleValves;
        Limits=Limits==null?[]:Limits;
        ComplexOrSimpleValves = [...SimpleValves]
        ComplexOrSimpleValveLimits = [...Limits];
        // ComplexOrSimpleValves.forEach(valve => {
        //     if(valve?.ModelNumber === '3650B'){
        //         console.log(' >>>>>>>>>>>>>>>>> ',valve.ModelId,valve?.ModelNumber,valve?.Orifice,valve?.Kmax,valve?.KAPI,valve?.A,valve?.AAPI);
        //     }
        // });
        // ComplexOrSimpleValveLimits.forEach(limit => {
        //     if(limit?.ModelId === 7){
        //         console.log('limit >>>>>>>>>>>>>>>>> ',limit);
        //     }
        // });
    }
    //Todo: Add 2,3 Orifice filter for 81, 83
    ComplexOrSimpleValves = ComplexOrSimpleValves.filter(valve => {
        if((inputs.Wreq === '' || inputs.Wreq < 0 || inputs.Qreq === '' || inputs.Qreq < 0) && ['81','83'].includes(valve.ModelNumber) && ['2','3'].includes(valve.Orifice)){
            return false;
        }
        return true;
    });

    //ComplexOrSimpleValves = filterSSOA(ComplexOrSimpleValves, inputs);
    ComplexOrSimpleValveLimits = ComplexOrSimpleValveLimits.filter(limit => ComplexOrSimpleValves.some(valve => valve.ModelId === limit.ModelId));

    console.log(' >>>>>>>>>>>>>> ',ComplexOrSimpleValves?.length, ComplexOrSimpleValveLimits?.length);
    if(TwoPhase_WF.includes(WorkFlowId)){
        const mergedRows = {};
        const voidKeys=['ValveId', 'ValvePropertyId', 'Kmax', 'KAPI', 'Service','A','AAPI'];
        // console.log('Before Traverse >>>>>> ',passedValves?.length);
        ComplexOrSimpleValves.forEach((row) => {
            
            const uniqueKey=`${row.ModelNumber}_${row.Orifice}`;// Unique key for grouping
            
            if (!mergedRows[uniqueKey]) {
                // Initialize the merged row with common fields
                mergedRows[uniqueKey] = { ...row };
            } else {
                // Merge fields with different values by appending the Service suffix
                Object.keys(row).forEach((key) => {
                    if (key === 'Service') return; // Skip the Service key itself
                    // if(row?.ModelNumber === '453' && row?.Orifice.indexOf('K')!== -1 && key=='A'){
                    //     console.log(' >>>>>>>>>>>>>>>>> ',uniqueKey,row,key,mergedRows[uniqueKey][key] , row[key],mergedRows[uniqueKey][key] !== row[key],row.Service)
                    // }
                    if (mergedRows[uniqueKey][key] !== row[key]) {
                        mergedRows[uniqueKey][`${key}${row.Service}`] = row[key];
                    }else if(voidKeys.includes(key)){
                        mergedRows[uniqueKey][`${key}${row.Service}`] = row[key];
                    }
                });
            }

            // Add the Service value to the merged row
            if (!mergedRows[uniqueKey].Services) {
                mergedRows[uniqueKey].Services = new Set();
            }
            mergedRows[uniqueKey].Services.add(row.Service);
            // if(row?.ModelNumber === '453' && row?.Orifice.indexOf('K')!== -1){
            //     console.log(' >>>>>>>>>>>>>>>>> ',mergedRows)
            // }
        });
        // console.log('mergedRows >>>>>> ',mergedRows);
        // Convert the Services Set to an Array and return the merged rows as an array
        ComplexOrSimpleValves= Object.values(mergedRows).filter((row) => 
            {
                if(Array.from(row.Services)?.length>1){
                    return {
                        ...row,
                        Services: Array.from(row.Services),
                    }
                }
            }
        ).map((row) => ({
            ...row,
            Services: Array.from(row.Services),
        }));
    }

    if (inputs?.genericSizingDetails?.Orifice) {
        const { KandAdataset, K, OrificeArea, Orifice } =
        inputs.genericSizingDetails;
        const filteredValve = ComplexOrSimpleValves.find(
        (valve) => valve.ValveId == Orifice
        );

        if (filteredValve) {
        const datasetMapping = {
            NonDataSet: () => {
            if (K) filteredValve.Kmax = filteredValve.KAPI = K;
            if (OrificeArea)
                filteredValve.A = filteredValve.AAPI = OrificeArea;
            },
            ASME: () => {
            if (K !== filteredValve.Kmax)
                filteredValve.Kmax = filteredValve.KAPI = K;
            if (OrificeArea !== filteredValve.A)
                filteredValve.A = filteredValve.AAPI = OrificeArea;
            },
            API: () => {
            if (K !== filteredValve.KAPI)
                filteredValve.KAPI = filteredValve.Kmax = K;
            if (OrificeArea !== filteredValve.AAPI)
                filteredValve.AAPI = filteredValve.A = OrificeArea;
            },
        };

        datasetMapping[KandAdataset]?.();
        ComplexOrSimpleValves = [filteredValve];
        }
    }
        

    startTime = new Date().getTime();
    let workFlowTestKit = "";
    let workFlowTestKitAPI = "";
    let workFlowTestKitAPIDef = "";
    let workFlowTestKitAPIWtAvg = "";
    
    let OrificesFlag = inputs?.Orifices;
    let isVacuumOnly = inputs?.IsVacuumOnly;
    let IsPressureOnly = inputs?.IsPressureOnly;
    const IsFAIncludedOnRV = inputs?.IsFAIncludedOnRV;
    let ComplexValveFlag = inputs?.IsPressureOnly && inputs?.IsVacuumOnly;
    // console.log('ComplexOrSimpleValves >>>>>>>>>>>>>>> ',ComplexOrSimpleValves?.length)
    ComplexOrSimpleValves.forEach((valve) => {
        const isAllowedPback = validatePbackType(valve, inputs);
        // console.log('isAllowedPback >>>> ', valve.ModelNumber, valve.Orifice, isAllowedPback);
        let Pset = convertUnit(inputs?.SetPressure, uoms.find(uom => uom.UnitKey === inputs?.PressureUOM), uoms.find(uom => uom.UnitKey === 'pressure.psig'));

        if (!isAllowedPback) {
            const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = valve;
            failedValves.push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["PbackType === 0"] });
        } else {
            const newValve = { ...valve };
            // Convert A and AAPI in case of Metric - default value is in cm2
            // if(newValve?.ModelNumber === '453' && newValve?.Orifice.indexOf('K')!== -1){
            //     console.log('111111 >>>>>>>>>>>>>',{newValve})
            // }
            if (CalculationMethod === 'Metric') {
                
                newValve.A = !isNaN(valve.A) ? convertUnit(valve.A, uoms.find(uom => uom.UnitKey === 'area.in2'), uoms.find(uom => uom.UnitKey === 'area.cm2')) : 0;
                newValve.AAPI = !isNaN(valve.AAPI) ? convertUnit(valve.AAPI, uoms.find(uom => uom.UnitKey === 'area.in2'), uoms.find(uom => uom.UnitKey === 'area.cm2')) : 0;
                if(service.includes('L')){
                    newValve.AL = !isNaN(valve.AL) ? convertUnit(valve.AL, uoms.find(uom => uom.UnitKey === 'area.in2'), uoms.find(uom => uom.UnitKey === 'area.cm2')) : 0;
                    newValve.AAPIL = !isNaN(valve.AAPIL) ? convertUnit(valve.AAPIL, uoms.find(uom => uom.UnitKey === 'area.in2'), uoms.find(uom => uom.UnitKey === 'area.cm2')) : 0;
                }
                if (valve.IsComplexValve) {
                    newValve.AV = !isNaN(valve.AV) ? convertUnit(valve.AV, uoms.find(uom => uom.UnitKey === 'area.in2'), uoms.find(uom => uom.UnitKey === 'area.cm2')) : 0;
                    newValve.AAPIV = !isNaN(valve.AAPIV) ? convertUnit(valve.AAPIV, uoms.find(uom => uom.UnitKey === 'area.in2'), uoms.find(uom => uom.UnitKey === 'area.cm2')) : 0;
                }
            }
            
            if (!ComplexOrSimpleValveLimits.find(limit => limit.ModelId === valve.ModelId && [valve.SizeCode, null, valve.Orifice].includes(limit.SizeCode))) {
                
                const { status, errorValves } = checkSpecialConditions(inputs, newValve,uoms,WorkFlowId);
                // console.log('Simple Valves>>>>>>>>>>>>> ', status, errorValves);
                passedValves.push(newValve);

            } else {
                const limits = ComplexOrSimpleValveLimits.filter(limit => limit.ModelId === valve.ModelId && ['', valve.SizeCode, null, valve.Orifice].includes(limit.SizeCode));
                // if(valve?.ModelId==7){
                //     console.log(' 2222222222>>>>>>>>>>>>>>>>> ', valve.ModelNumber, valve.Orifice, limits);
                // }
                // Extract the variables converted based on the Calculation Method
                const variables = getKeyValuesForVariables(inputs, uoms, CalculationMethod);
                // Parse the Expressions in Limits and convert the values based on the Calculation Method
                const parsedLimits = getParsedExpressions(limits, Variables, uoms, CalculationMethod, { ...variables, ...inputs });
                // if(valve?.ModelId==7){
                //     console.log('parsedLimits >>>> ', valve.ModelNumber, valve.Orifice, parsedLimits,parsedLimits[0]?.parsedExpression,parsedLimits[0]?.filteredExpression);
                // }
                // Evaluate Expressions using the expressions and converted variables from the sizing inputs
                const { result, failedExpressions } = evaluateLimits(parsedLimits, { ...variables, ...inputs }, valve.ModelNumber);
                // if(valve?.ModelId==7){
                //     console.log(' 2222 3333333333>>>>>>>>>>>>>>>>> ', valve.ModelNumber, valve.Orifice, result, failedExpressions);
                // }
                // If result is true the Valve has passed the limits
                if (result) {
                    if (([8, 9, 10].includes(workflowId)) && (Pset > 1000 && ['900'].includes(valve.ModelNumber))) {
                        const localModelNumber = failedValves.find(fail => fail.ModelNumber === '900');
                        if (localModelNumber === undefined) {
                            const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = newValve;
                            failedValves.push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Pset > 1000 && Model == 900"] });
                        }
                    }
                    // MAWP Filters
                    else if (!inputs.IsVacuumOnly || (!isNaN(Number(inputs.SystemMAWP)) && Number(inputs.SystemMAWP) >= 0) || !modelNumbersMAWP.indexOf(valve.ModelNumber) !== -1) {
                        // Pback ratio Filters

                        if ((inputs?.IsVacuumOnly && inputs?.IsPressureOnly) || !(Number(inputs.SetPressure) > 0 && Number(inputs.TotalBackPressure) > 0)) {
                            const { status, errorValves } = checkSpecialConditions(inputs, newValve,uoms,WorkFlowId);

                            if (status) {
                                passedValves.push(newValve);
                            } else if (errorValves?.length > 0) {
                                failedValves.push(...errorValves);
                            } else {
                                if ((['Economizer', 'Preheater'].includes(inputs.SizingBasis) || inputs.IsSaturatedSteam) && ['5247', '5146', '5166'].includes(newValve.ModelNumber)) {
                                    passedValves.push(newValve);
                                }
                                else {
                                    const { Brand, ModelNumber, ValveType, SizeCode, ValveTypeSummary, VPValveType } = newValve;
                                    failedValves.push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["IsSaturatedSteam == true"] });
                                }
                            }
                        } else {
                            const ratio = Number(inputs.TotalBackPressure) / Number(inputs.SetPressure);
                            // failed Pback ratio valves
                            if (!(ratio >= 0 && ratio <= 0.9) && valve.VPValveType === "LP") {
                                const { Brand, ModelNumber, ValveType, SizeCode, ValveTypeSummary, VPValveType } = newValve;
                                failedValves.push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Pback < 0.9 * Pset"] });
                            } else {
                                
                                const { status, errorValves } = checkSpecialConditions(inputs, newValve,uoms,WorkFlowId);
                                // console.log('Simple Valves 222222>>>>>>>>>>>>> ', status, errorValves);
                                if (status) {
                                    passedValves.push(newValve);
                                } else if (errorValves?.length > 0) {
                                    failedValves.push(...errorValves)
                                } else {
                                    if ((['Economizer', 'Preheater'].includes(inputs.SizingBasis) || inputs.IsSaturatedSteam) && ['5247', '5146', '5166'].includes(newValve.ModelNumber)) {
                                        passedValves.push(newValve);
                                    }
                                    else {
                                        const { Brand, ModelNumber, ValveType, SizeCode, ValveTypeSummary, VPValveType } = newValve;
                                        failedValves.push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["IsSaturatedSteam == true"] });
                                    }
                                }

                            }
                        }
                    } else {
                        // failed MAWP >= 0 valves
                        const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = newValve;
                        failedValves.push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["MAWP >= 0"] });
                    }
                } else if (([8, 9, 10].includes(workflowId)) && (Pset > 1000 && ['900'].includes(valve.ModelNumber))) {
                    const localModelNumber = failedValves.find(fail => fail.ModelNumber === '900');
                    if (localModelNumber === undefined) {
                        const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = newValve;
                        failedValves.push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Pset > 1000 && Model == 900"] });
                    }

                } else {
                    // failed limits valves
                    const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = newValve;
                    failedValves.push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions });
                }
            }
        }
    });


    startTime = new Date().getTime();
    const isASMEFlag = !!inputs?.IsASMESection8;
    // console.log(' >>>>>>>>>>>>>>>>>>>>> ',{workflowId,CalculationMethod,isASMEFlag,Code:inputs.Code,isVolumetric})
    const { workflowObjectASME, workflowObjectAPI, workflowObjectAPIDEF, workflowObjectAPIWTAVG } = WorkflowCalculations?.reduce((acc, wf) => {
        if (wf.WorkflowId === workflowId &&
            wf.CalculationMethod === CalculationMethod &&
            (wf.IsASMESection8 === isASMEFlag) &&
            wf.Code === inputs.Code &&
            wf.KADataSet === 'ASME' &&
            wf.IsValumetric === isVolumetric) {
            acc['workflowObjectASME'] = wf;
        } else if (wf.WorkflowId === workflowId &&
            wf.CalculationMethod === CalculationMethod &&
            (wf.IsASMESection8 === isASMEFlag) &&
            wf.Code === inputs.Code &&
            wf.KADataSet === 'API' &&
            wf.IsValumetric === isVolumetric) {
            acc['workflowObjectAPI'] = wf;

        } else if (CD_Series_WF && wf.WorkflowId === workflowId &&
            wf.CalculationMethod === CalculationMethod &&
            (wf.IsASMESection8 === isASMEFlag) &&
            wf.Code === inputs.Code &&
            wf.KADataSet === 'APIWTAVG' &&
            wf.IsValumetric === isVolumetric) {
            acc['workflowObjectAPIWTAVG'] = wf;
        }
        return acc;
    }, {});
    Vreqp = Vreqp === undefined ? '' : Vreqp;
    VreqV = VreqV === undefined ? '' : VreqV;
    const filteredFailedValves = CD_Series_WF ?
    {
        'ASME': failedValves.filter(v => passedValves.every(p => p.ModelNumber !== v.ModelNumber)),
        'API': failedValves.filter(v => passedValves.every(p => p.ModelNumber !== v.ModelNumber)),
        'APIWtAvg': failedValves.filter(v => passedValves.every(p => p.ModelNumber !== v.ModelNumber))
    }
    :{
        'ASME': failedValves.filter(v => passedValves.every(p => p.ModelNumber !== v.ModelNumber)),
        'API': failedValves.filter(v => passedValves.every(p => p.ModelNumber !== v.ModelNumber))
    }

    if(WorkFlowId==8){
        const ecoPreHSBFlag=['Preheater','Economizer']?.includes(inputs?.SizingBasis);
        if(!ecoPreHSBFlag){
            let P1 = Number(inputs.SetPressure) + Number(inputs.OverPressure) - Number(inputs.InletLoss) + Number(inputs.AtmPressure);
            P1= convertUnit(Number(P1), uoms.find(u => u.UnitKey === inputs?.AtmPressureUOM), uoms.find(u => u.UnitKey === "abspressure.psia"));
            let Ksh=1;
            let Ksc=1;
            if(P1<3208.2){
                if(inputs?.Ksh==undefined){
                    const calcKsh = await CalcSaturatedTempertureKsc(inputs);
                    Ksh = calcKsh.Ksh;
                }else{
                    Ksh = inputs.Ksh;
                }
            }else{
                if(inputs?.Ksc==undefined){
                    const calcKsc = await CalcSaturatedTempertureKsc(inputs);
                    Ksc = calcKsc.Ksc;
                }else{
                    Ksc = inputs.Ksc;
                }
            }
            inputs={...inputs, Ksh, Ksc}   
        }
    }

    workFlowTestKit =  workflowObjectASME?.WorkflowCalculation; // we need workFlowTestKit even if not any valve get passed validation for displayColumns names. line #2249

    if(['SectionVIII','API520','AnnexB','ISO4126','API521Fire'].includes(inputs?.Code)){
        passedValves = filterEMModels(passedValves, inputs,workflowId);
    }
    passedValves = filterSSOA(passedValves, inputs);
    // console.log('passedValves >>>>>>>>>>>>>>>');
    // console.log('passedValves >>>>>>>>>>>>>>> ',passedValves?.length,new Set(passedValves?.map(v => v.ModelNumber)))
    updatedPassedValves = passedValves.reduce((acc, valve) => {
        try {
            // console.log('Valve under calculation >>>>>>>>>>>>>>> ',valve.ModelNumber,valve.Orifice)
            const Kb = calculateKbKw(valve, inputs, constants);
          
            let valveKey="";
            let valveKeyAPI="";
            let valveASME={};
            let valveAPI={};
            let valveAPIWtAvg = {};
            let valveKeyAPIWtAvg = "";

            // if(KADataSet === 'ASME'){
                //workFlowTestKit =  workflowObjectASME?.WorkflowCalculation;
                valveKey = WorkflowSelectedField[workFlowTestKit];  
                        
                valveASME = getCalculationValidateCalc(workflowObjectASME, valve, { constants, ...inputs, CalculationMethod, ...Kb,service }, uoms, workFlowTestKit, ComplexValveFlag);
                // if(['81P','EMB','EMC','900']?.includes(valveASME?.ModelNumber)){ 
                //     // console.log('000000000001111111111 >>>>>>>>>>>>>>>>>>',valve?.ModelNumber,valve?.Orifice,workFlowTestKit,valveKey,workflowObjectASME,valve)  
                //     console.log('ResultService >>>>>> isMultivalve >>>>>> ',inputs?.IsMultivalve,valve?.ModelNumber,Vreqp,valveASME[valveKey],valve?.Orifice,valve?.NewOrifice, `${valve?.InletSize}" x ${valve?.OutletSize}"`,valveASME?.A,valveASME?.W,valveASME.Kv,valveASME?.omega);
                // } 

                
                if(TwoPhase_WF.includes(workflowId) && valveASME?.omega !==undefined && valveASME?.omega<=0){
                    const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = valveASME;
                    // console.log(' >>>>>>>>>>>>>>>>> ',ModelNumber, valveASME.Kv, valveASME.Kvreq);
                    filteredFailedValves['ASME'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["ω <= 0"], valveASME });
                }else if ([5, 6, 7,...TwoPhase_WF].includes(workflowId) && (Vreqp !== '' && valveASME[valveKey] > 0 && valveASME[valveKey] >= Number(Vreqp))&& (valveASME.Kv < 0.3 || valveASME.Kvreq < 0.3 || valveASME.KvL < 0.3 ||valveASME.KvreqL < 0.3 || (inputs?.IsLiquid2 && valveASME.KvL2 < 0.3) ||( inputs?.IsLiquid2 && valveASME.KvreqL2 < 0.3))) {
                    const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = valveASME;
                    // console.log(' >>>>>>>>>>>>>>>>> ',ModelNumber, SizeCode,valveASME.Kv, valveASME.Kvreq);
                    filteredFailedValves['ASME'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Kv < 0.3"], valveASME });
                } else {
                    // console.log({ModelNumber:valveASME.ModelNumber, valveKey,Orifice:valveASME.Orifice, Vreqp});  

                    if(Pressure_Vacuum_WF.indexOf(workflowId) !== -1 && isVacuumOnly && IsPressureOnly && (
                        // inputs?.IsMultivalve
                        (inputs?.IsMultivalve && ((IsPressureOnly && Vreqp !== '' && valveASME[valveKey] > 0) || (isVacuumOnly && VreqV === '' && valveASME[`${valveKey}_v`] > 0))) 
                        || (!inputs?.IsMultivalve && ((Vreqp === '' && valveASME[valveKey] > 0 && VreqV === '' && valveASME[`${valveKey}_v`] > 0) || (Vreqp === '' && valveASME[valveKey] > 0 && (VreqV !== '' && valveASME[`${valveKey}_v`] > 0 && valveASME[`${valveKey}_v`] >= Number(VreqV))) || (VreqV === '' && valveASME[`${valveKey}_v`] > 0 && Vreqp !== '' && valveASME[valveKey] > 0 && valveASME[valveKey] >= Number(Vreqp))|| ((Vreqp !== '' && valveASME[valveKey] > 0 && valveASME[valveKey] >= Number(Vreqp)) &&  (VreqV !== '' && valveASME[`${valveKey}_v`] > 0 && valveASME[`${valveKey}_v`] >= Number(VreqV)))))
                    ) 
                    && IsFAIncludedOnRV){
                        // console.log({ModelNumber:valveASME.ModelNumber, valveKey,Orifice:valveASME.Orifice,valveKey:valveASME[valveKey], Vreqp,IsFAIncludedOnRV,VPValveType:valveASME.VPValveType}); 
                        if(FAValveType.indexOf(valveASME.VPValveType) !== -1 && workflowId!== 22){
                            if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber) && (valveASME.Kmax_v > 0 && valveASME.A_v > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                                // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3),[`${valveKey}_v`]: Number(round(valveASME[`${valveKey}_v`], 3)).toFixed(3)  });
                                acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]),[`${valveKey}_v`]: Number(valveASME[`${valveKey}_v`])  });
                            }
                        }else if(valveASME.VPValveType=='FA+FV' && workflowId== 22){
                            if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber) && (valveASME.Kmax_v > 0 && valveASME.A_v > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                                // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3),[`${valveKey}_v`]: Number(round(valveASME[`${valveKey}_v`], 3)).toFixed(3)  });
                                acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]),[`${valveKey}_v`]: Number(valveASME[`${valveKey}_v`])  });
                            }
                        }
                    }else if(Pressure_Vacuum_WF.indexOf(workflowId) !== -1 && isVacuumOnly && IsPressureOnly && (
                        // inputs?.IsMultivalve
                        (inputs?.IsMultivalve && ((IsPressureOnly && Vreqp !== '' && valveASME[valveKey] > 0) || (isVacuumOnly && VreqV === '' && valveASME[`${valveKey}_v`] > 0))) 
                        || (!inputs?.IsMultivalve && ((Vreqp === '' && valveASME[valveKey] > 0 && VreqV === '' && valveASME[`${valveKey}_v`] > 0) || (Vreqp === '' && valveASME[valveKey] > 0 && (VreqV !== '' && valveASME[`${valveKey}_v`] > 0 && valveASME[`${valveKey}_v`] >= Number(VreqV))) || (VreqV === '' && valveASME[`${valveKey}_v`] > 0 && Vreqp !== '' && valveASME[valveKey] > 0 && valveASME[valveKey] >= Number(Vreqp))|| ((Vreqp !== '' && valveASME[valveKey] > 0 && valveASME[valveKey] >= Number(Vreqp)) &&  (VreqV !== '' && valveASME[`${valveKey}_v`] > 0 && valveASME[`${valveKey}_v`] >= Number(VreqV)))))
                    ) && !IsFAIncludedOnRV){
                
                        if(FAValveType.indexOf(valveASME.VPValveType) === -1 && workflowId!== 22){
                            if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber) && (valveASME.Kmax_v > 0 && valveASME.A_v > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                                // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3),[`${valveKey}_v`]: Number(round(valveASME[`${valveKey}_v`], 3)).toFixed(3)  });
                                acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]),[`${valveKey}_v`]: Number(valveASME[`${valveKey}_v`])});
                            }
                        }else if(valveASME.VPValveType !=='FA+FV' && workflowId== 22){
                            if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber) && (valveASME.Kmax_v > 0 && valveASME.A_v > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                                // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3),[`${valveKey}_v`]: Number(round(valveASME[`${valveKey}_v`], 3)).toFixed(3)  });
                                acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]),[`${valveKey}_v`]: Number(valveASME[`${valveKey}_v`])  });
                            }
                        }
                    }else if(Pressure_Vacuum_WF.indexOf(workflowId) !== -1 && isVacuumOnly && !IsPressureOnly && (
                        (inputs?.IsMultivalve && isVacuumOnly && VreqV === '' && valveASME[`${valveKey}_v`] > 0) || (!inputs?.IsMultivalve && ((VreqV === '' && valveASME[valveKey] > 0) || (VreqV !== '' && valveASME[valveKey] > 0 && valveASME[valveKey] >= Number(VreqV))))
                    )  && IsFAIncludedOnRV){
                
                        if(FAValveType.indexOf(valveASME.VPValveType) !== -1 && workflowId!== 22){
                            if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                                // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3) });
                                acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]) });
                            }
                        }else if(valveASME.VPValveType=='FA+FV' && workflowId== 22){
                            if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber) && (valveASME.Kmax_v > 0 && valveASME.A_v > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                                // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3),[`${valveKey}_v`]: Number(round(valveASME[`${valveKey}_v`], 3)).toFixed(3)  });
                                acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]),[`${valveKey}_v`]: Number(valveASME[`${valveKey}_v`])  });
                            }
                        }
                    }else if(Pressure_Vacuum_WF.indexOf(workflowId) !== -1 && isVacuumOnly && !IsPressureOnly && (
                        (inputs?.IsMultivalve && isVacuumOnly && VreqV === '' && valveASME[`${valveKey}_v`] > 0) || (!inputs?.IsMultivalve && ((VreqV === '' && valveASME[valveKey] > 0) || (VreqV !== '' && valveASME[valveKey] > 0 && valveASME[valveKey] >= Number(VreqV))))
                    )  && !IsFAIncludedOnRV){
                        
                        if(FAValveType.indexOf(valveASME.VPValveType) === -1 && workflowId!== 22){
                            if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                                // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3) });
                                acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]) });
                            }
                        }else if(valveASME.VPValveType !=='FA+FV' && workflowId== 22){
                            if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber) && (valveASME.Kmax_v > 0 && valveASME.A_v > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                                // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3),[`${valveKey}_v`]: Number(round(valveASME[`${valveKey}_v`], 3)).toFixed(3)  });
                                acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]),[`${valveKey}_v`]: Number(valveASME[`${valveKey}_v`])  });
                            }
                        }
                    }else if(Pressure_Vacuum_WF.indexOf(workflowId) !== -1 && !isVacuumOnly && IsPressureOnly && (
                        (inputs?.IsMultivalve && IsPressureOnly && Vreqp !== '' && valveASME[valveKey] > 0) || (!inputs?.IsMultivalve && ((Vreqp === '' && valveASME[valveKey] > 0) || (Vreqp !== '' && valveASME[valveKey] > 0 && valveASME[valveKey] >= Number(Vreqp))))
                    ) && IsFAIncludedOnRV){
                        
                        if(FAValveType.indexOf(valveASME.VPValveType) !== -1 && workflowId!== 22){
                            if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber) && (valveASME.Kmax_v > 0 && valveASME.A_v > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                                // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3) });
                                acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]) });
                            }
                        }else if(valveASME.VPValveType=='FA+FV' && workflowId== 22){
                            if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber) && (valveASME.Kmax_v > 0 && valveASME.A_v > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                                // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3),[`${valveKey}_v`]: Number(round(valveASME[`${valveKey}_v`], 3)).toFixed(3)  });
                                acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]),[`${valveKey}_v`]: Number(valveASME[`${valveKey}_v`])  });
                            }
                        }
                    }else if(Pressure_Vacuum_WF.indexOf(workflowId) !== -1 && !isVacuumOnly && IsPressureOnly && (
                        (inputs?.IsMultivalve && IsPressureOnly && Vreqp !== '' && valveASME[valveKey] > 0) || (!inputs?.IsMultivalve && ((Vreqp === '' && valveASME[valveKey] > 0) || (Vreqp !== '' && valveASME[valveKey] > 0 && valveASME[valveKey] >= Number(Vreqp))))
                    ) && !IsFAIncludedOnRV){
                    
                        if(FAValveType.indexOf(valveASME.VPValveType) === -1 && workflowId!== 22){
                            if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber) && (valveASME.Kmax_v > 0 && valveASME.A_v > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                                // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3) });
                                acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]) });
                            }
                        }else if(valveASME.VPValveType !=='FA+FV' && workflowId== 22){
                            if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber) && (valveASME.Kmax_v > 0 && valveASME.A_v > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                                // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3),[`${valveKey}_v`]: Number(round(valveASME[`${valveKey}_v`], 3)).toFixed(3)  });
                                acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]),[`${valveKey}_v`]: Number(valveASME[`${valveKey}_v`])  });
                            }
                        }
                    }else if (workflowId == 12  && inputs.FireSizingMethod === 'Unwetted' && ((inputs?.IsMultivalve && Vreqp !== '' && valveASME[valveKey] > 0)  || (!inputs?.IsMultivalve && ((Vreqp === '' && valveASME[valveKey] > 0) || (Vreqp !== '' && valveASME[valveKey] > 0 && valveASME[valveKey] >= Number(Vreqp)))))) {

                        if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                            // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3) });
                            if(valveASME[valveKey] >= valveASME['Wreqp']){

                                acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]) });
                            }
                        }
                    }else if (Pressure_Vacuum_WF.indexOf(workflowId) === -1 && (
                        (inputs?.IsMultivalve && Vreqp !== '' && valveASME[valveKey] > 0) || (!inputs?.IsMultivalve && ((Vreqp === '' && valveASME[valveKey] > 0) || (Vreqp !== '' && valveASME[valveKey] > 0 && valveASME[valveKey] >= Number(Vreqp))))
                    )) {
                        // if(['81P','EMB','EMC','900']?.includes(valveASME?.ModelNumber)){ 
                                // console.log('22222 >>>>>>>>>>>> ',inputs?.IsMultivalve,valveASME?.ModelNumber,valveASME?.Orifice,valveASME.Kmax , valveASME.A,Models92xx93xxMLCP.includes(valveASME.ModelNumber) )
                        //     }
                        if ((valveASME.Kmax > 0 && valveASME.A > 0) || Models92xx93xxMLCP.includes(valveASME.ModelNumber)) {
                            // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3) });
                            // if(['81P','EMB','EMC','900']?.includes(valveASME?.ModelNumber)){ 
                            // console.log(' >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>..... 111111111111111111111 >>>>> ',valveASME?.ModelNumber, valveASME?.Orifice);
                            // }
                            acc['ASME'].push({ ...valveASME, [valveKey]: Number(valveASME[valveKey]) });
                        }
                        // console.log(' >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>..... 111111111111111111111 >>>>> ',valveASME?.ModelNumber, valveASME?.Orifice);
                    } else {
                
                        const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, ReResponse } = valveASME;
                        if ([5, 6, 7,...TwoPhase_WF].includes(workflowId) && (valveASME.Kv < 0.3 || valveASME.Kvreq < 0.3 || valveASME.KvL < 0.3 ||valveASME.KvreqL < 0.3 || (inputs?.IsLiquid2 && valveASME.KvL2 < 0.3) ||( inputs?.IsLiquid2 && valveASME.KvreqL2 < 0.3))) {
                            // const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = valveASME;
                            // console.log('22222222222  >>>>>>>>>>>>>>>>> ',ModelNumber, valveASME?.Orifice,valveASME?.NewOrifice,SizeCode,valveASME.Kv, valveASME.Kvreq);
                            filteredFailedValves['ASME'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Kv < 0.3"], valveASME });
                        }
                        let parsedResponse={};
                        
                        let Kb = 0;
                        if (ReResponse) {
                            try {
                                parsedResponse = JSON.parse(ReResponse);
                                Kb = parsedResponse?.Kb || parsedResponse?.equationValues?.Kb || 0;
                            } catch (error) {
                                console.error("Failed to parse ReResponse:", error, workFlowTestKit);
                            }
                        }
                        
                        // if(Brand === 'Anderson Greenwood'){
                                // console.log(ModelNumber,VPValveType,valveKey,valveASME[valveKey],Kb,isNaN(valveASME[valveKey]),(valveASME[valveKey] == 0 || isNaN(valveASME[valveKey])) && Kb === 0)
                        //     }
                        if ((valveASME[valveKey] == 0 || isNaN(valveASME[valveKey])) && Kb === 0) {
                            if (Brand === 'Anderson Greenwood' && VPValveType === 'PO') {
                                filteredFailedValves['ASME'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Kb = 0"], valveASME });
                            } else {
                                filteredFailedValves['ASME'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["PbackType === 0"], valveASME });
                            }
                        } else {
                            filteredFailedValves['ASME'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Vreqp >= 0"], valveASME });
                        }
                    }
                }
            // } else if(KADataSet === 'API'){
                workFlowTestKitAPI = workflowObjectAPI?.WorkflowCalculation;
                valveKeyAPI = WorkflowSelectedField[workFlowTestKitAPI];
                valveAPI = getCalculationValidateCalc(workflowObjectAPI, valve, { constants, ...inputs, CalculationMethod, ...Kb,service }, uoms, workFlowTestKitAPI, ComplexValveFlag);
                // console.log('API ResultService >>>>>> isMultivalve >>>>>> ',inputs?.IsMultivalve,valve?.ModelNumber,valve?.Orifice,valve?.NewOrifice, `${valve?.InletSize}" x ${valve?.OutletSize}"`,valveAPI?.AAPI,valveAPI?.KAPI);
                if(TwoPhase_WF.includes(workflowId) && valveAPI?.omega !==undefined && valveAPI?.omega<=0){
                    const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = valveAPI;
                    // console.log(' >>>>>>>>>>>>>>>>> ',ModelNumber, valveASME.Kv, valveASME.Kvreq);
                    filteredFailedValves['API'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["ω <= 0"], valveAPI });
                // }else if ([5, 6, 7,...TwoPhase_WF].includes(workflowId) && (Vreqp === '' && valveAPI[valveKeyAPI] > 0) || (Vreqp !== '' && valveAPI[valveKeyAPI] > 0 && valveAPI[valveKeyAPI] >= Number(Vreqp)) && (valveAPI.Kv < 0.3 || valveAPI.Kvreq < 0.3  || valveAPI.KvL < 0.3 ||valveAPI.KvreqL < 0.3 || (inputs?.IsLiquid2 && valveAPI.KvL2 < 0.3) ||(inputs?.IsLiquid2 && valveAPI.KvreqL2 < 0.3))) {
                }else if ([5, 6, 7,...TwoPhase_WF].includes(workflowId) && (valveAPI.Kv < 0.3 || valveAPI.Kvreq < 0.3 || valveAPI.KvL < 0.3 ||valveAPI.KvreqL < 0.3 || (inputs?.IsLiquid2 && valveAPI.KvL2 < 0.3) ||( inputs?.IsLiquid2 && valveAPI.KvreqL2 < 0.3))) { //done changes for WF-6 to resolve issue #42 from file "PRVPAV2 API Issue List"
                    const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = valveAPI;
                    filteredFailedValves['API'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Kv < 0.3"], valveAPI });
                } else {
                    
                    // if(Pressure_Vacuum_WF.indexOf(workflowId) !== -1 && isVacuumOnly && IsPressureOnly){

                    if (workflowId == 12 && inputs.FireSizingMethod === 'Unwetted' && ((inputs?.IsMultivalve && Vreqp !== '' && valveASME[valveKey] > 0)  || (!inputs?.IsMultivalve && ((Vreqp === '' && valveAPI[valveKey] > 0) || (Vreqp !== '' && valveAPI[valveKey] > 0 && valveAPI[valveKey] >= Number(Vreqp)))))) {

                        if ((valveAPI.Kmax > 0 && valveAPI.A > 0) || Models92xx93xxMLCP.includes(valveAPI.ModelNumber)) {
                            // acc['ASME'].push({ ...valveASME, [valveKey]: Number(round(valveASME[valveKey], 3)).toFixed(3) });
                            if(valveAPI[valveKey] >= valveAPI['Wreqp']){

                                acc['API'].push({ ...valveAPI, [valveKey]: Number(valveAPI[valveKey]) });
                            }
                        }
                    }else if ((inputs?.IsMultivalve && Vreqp !== '' && valveASME[valveKey] > 0)  || (!inputs?.IsMultivalve && ((Vreqp === '' && valveAPI[valveKeyAPI] > 0) || (Vreqp !== '' && valveAPI[valveKeyAPI] > 0 && valveAPI[valveKeyAPI] >= Number(Vreqp))))) {
                        // console.log('API ResultService >>>>>> isMultivalve ::: 22222222222>>>>>> ',inputs?.IsMultivalve,valve?.ModelNumber,valve?.Orifice,valve?.NewOrifice, `${valve?.InletSize}" x ${valve?.OutletSize}"`,valveAPI?.AAPI,valveAPI?.KAPI);
                        if ((valveAPI.KAPI > 0 && valveAPI.AAPI > 0) || Models92xx93xxMLCP.includes(valveAPI.ModelNumber)) {
                            // acc['API'].push({ ...valveAPI, [valveKeyAPI]: round(valveAPI[valveKeyAPI], 3) });
                            acc['API'].push({ ...valveAPI, [valveKeyAPI]: Number(valveAPI[valveKeyAPI]) });
                        }
                    } else {
                        const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, ReResponse } = valveAPI;

                        if ([5, 6, 7,...TwoPhase_WF].includes(workflowId) && (Vreqp === '' && valveAPI[valveKeyAPI] > 0) || (Vreqp !== '' && valveAPI[valveKeyAPI] > 0 && valveAPI[valveKeyAPI] >= Number(Vreqp)) && (valveAPI.Kv < 0.3 || valveAPI.Kvreq < 0.3  || valveAPI.KvL < 0.3 ||valveAPI.KvreqL < 0.3 || (inputs?.IsLiquid2 && valveAPI.KvL2 < 0.3) ||(inputs?.IsLiquid2 && valveAPI.KvreqL2 < 0.3))) {
                            // const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = valveAPI;
                            filteredFailedValves['API'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Kv < 0.3"], valveAPI });
                        }
                        let Kb = 0;
                        let parsedResponse={};
                        if (ReResponse) {
                            try {
                                parsedResponse = JSON.parse(ReResponse);
                                Kb = parsedResponse?.Kb || parsedResponse?.equationValues?.Kb || 0;
                            } catch (error) {
                                console.error("Failed to parse ReResponse:", error, workFlowTestKitAPI);
                            }
                        }
                        if ((valveAPI[valveKeyAPI] == 0 || isNaN(valveAPI[valveKeyAPI])) && Kb === 0) {
                            if (Brand === 'Anderson Greenwood' && VPValveType === 'PO') {
                                filteredFailedValves['API'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Kb = 0"], valveAPI });
                            } else {
                                filteredFailedValves['API'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["PbackType === 0"], valveAPI });
                            }
                        } else {
                            filteredFailedValves['API'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Vreqp >= 0"], valveAPI });
                        }
                    }
                }
            // }else 
            if(
                // KADataSet === 'APIDef' && 
                CD_Series_WF){
                workFlowTestKitAPIWtAvg = workflowObjectAPIWTAVG!==undefined? workflowObjectAPIWTAVG?.WorkflowCalculation:"";
                valveKeyAPIWtAvg = WorkflowSelectedField[workFlowTestKitAPIWtAvg];
                valveAPIWtAvg = getCalculationValidateCalc(workflowObjectAPIWTAVG, valve, { constants, ...inputs, CalculationMethod, ...Kb }, uoms, workFlowTestKitAPIWtAvg, ComplexValveFlag);

                if(TwoPhase_WF.includes(workflowId) && valveAPIWtAvg?.omega !==undefined && valveAPIWtAvg?.omega<=0){
                    const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = valveAPIWtAvg;
                    // console.log(' >>>>>>>>>>>>>>>>> ',ModelNumber, valveASME.Kv, valveASME.Kvreq);
                    filteredFailedValves['APIWtAvg'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["ω <= 0"], valveAPIWtAvg });
                }else if ([5, 6, 7,...TwoPhase_WF].includes(workflowId) && (Vreqp === '' && valveAPIWtAvg[valveKeyAPIWtAvg] > 0) || (Vreqp !== '' && valveAPIWtAvg[valveKeyAPIWtAvg] > 0 && valveAPIWtAvg[valveKeyAPIWtAvg] >= Number(Vreqp)) && (valveAPIWtAvg.Kv < 0.3 || valveAPIWtAvg.Kvreq < 0.3  || valveAPIWtAvg.KvL < 0.3 ||valveAPIWtAvg.KvreqL < 0.3 || (inputs?.IsLiquid2 && valveAPIWtAvg.KvL2 < 0.3) ||(inputs?.IsLiquid2 && valveAPIWtAvg.KvreqL2 < 0.3))) {
                    const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = valveAPIWtAvg;
                    filteredFailedValves['APIWtAvg'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Kv < 0.3"], valveAPIWtAvg });
                } else {
                    
                    // if(Pressure_Vacuum_WF.indexOf(workflowId) !== -1 && isVacuumOnly && IsPressureOnly){

                    if ((inputs?.IsMultivalve && Vreqp !== '' && valveASME[valveKey] > 0)  || 
                            (!inputs?.IsMultivalve && ((Vreqp === '' && valveAPIWtAvg[valveKeyAPIWtAvg] > 0) || (Vreqp !== '' && valveAPIWtAvg[valveKeyAPIWtAvg] > 0 && valveAPIWtAvg[valveKeyAPIWtAvg] >= Number(Vreqp))))) {
                        if ((valveAPIWtAvg.KAPI > 0 && valveAPIWtAvg.AAPI > 0) || Models92xx93xxMLCP.includes(valveAPIWtAvg.ModelNumber)) {
                            // acc['API'].push({ ...valveAPI, [valveKeyAPI]: round(valveAPI[valveKeyAPI], 3) });
                            acc['APIWtAvg'].push({ ...valveAPIWtAvg, [valveKeyAPIWtAvg]: Number(valveAPIWtAvg[valveKeyAPIWtAvg]) });
                        }
                    } else {
                        const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, ReResponse } = valveAPIWtAvg;

                        if ([5, 6, 7,...TwoPhase_WF].includes(workflowId) && (Vreqp === '' && valveAPIWtAvg[valveKeyAPIWtAvg] > 0) || (Vreqp !== '' && valveAPIWtAvg[valveKeyAPIWtAvg] > 0 && valveAPIWtAvg[valveKeyAPIWtAvg] >= Number(Vreqp)) && (valveAPIWtAvg.Kv < 0.3 || valveAPIWtAvg.Kvreq < 0.3  || valveAPIWtAvg.KvL < 0.3 ||valveAPIWtAvg.KvreqL < 0.3 || (inputs?.IsLiquid2 && valveAPIWtAvg.KvL2 < 0.3) ||(inputs?.IsLiquid2 && valveAPIWtAvg.KvreqL2 < 0.3))) {
                            // const { Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary } = valveAPI;
                            filteredFailedValves['APIWtAvg'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Kv < 0.3"], valveAPIWtAvg });
                        }
                        let Kb = 0;
                        let parsedResponse={};
                        if (ReResponse) {
                            try {
                                parsedResponse = JSON.parse(ReResponse);
                                Kb = parsedResponse?.Kb || parsedResponse?.equationValues?.Kb || 0;
                            } catch (error) {
                                console.error("Failed to parse ReResponse:", error, workFlowTestKitAPIWtAvg);
                            }
                        }
                        if ((valveAPIWtAvg[valveKeyAPIWtAvg] == 0 || isNaN(valveAPIWtAvg[valveKeyAPIWtAvg])) && Kb === 0) {
                            if (Brand === 'Anderson Greenwood' && VPValveType === 'PO') {
                                filteredFailedValves['APIWtAvg'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Kb = 0"], valveAPIWtAvg });
                            } else {
                                filteredFailedValves['APIWtAvg'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["PbackType === 0"], valveAPIWtAvg });
                            }
                        } else {
                            filteredFailedValves['APIWtAvg'].push({ Brand, ModelNumber, ValveType, SizeCode, VPValveType, ValveTypeSummary, failedExpressions: ["Vreqp >= 0"], valveAPIWtAvg });
                        }
                    }
                }
            }
        } catch (e) {
            console.log({ e });
        }
        return acc;
    }, { 'ASME': [], 'API': [], 'APIDef': [], 'APIWtAvg': [] });
        // }, { 'ASME': [], 'API': [],  'APIWtAvg': [] });

    // console.log('updatedPassedValves >>>>>>>>>>>>>>> ',KADataSet,updatedPassedValves[KADataSet]?.length);
    // Build a Set of ModelNumbers for passed valves for quick lookup
    const passedASMEModelNumbers = new Set(updatedPassedValves['ASME']?.map(v => v.ModelNumber));
    const passedAPIModelNumbers = new Set(
        [
            ...(updatedPassedValves['API'] || []),
            ...(updatedPassedValves['APIDef'] || []),
            ...(updatedPassedValves['APIWtAvg'] || [])
        ].map(v => v.ModelNumber)
    );

    ['ASME', 'API', 'APIDef', 'APIWtAvg']?.forEach(key => {
        // console.log(`updatedPassedValves[${key}] >>>>>>>>>>>>>>> `,updatedPassedValves[key]?.length)
        updatedPassedValves[key] = updatedPassedValves[key]?.map(valve => {
            const popupDetails=popupMessageCheck(workflowId,valve,inputs,id,source);
            if(popupDetails!==undefined){
                // console.log('ASME Popup Details >>>>>>>>>>> ',valveASME?.ModelNumber,popupDetails)
                return { ...valve,isValvePopup:true,popupDetails  };
            }
            return {...valve};
        })
    });

    // Filter ASME failed valves
    ['ASME', 'API', 'APIDef', 'APIWtAvg']?.forEach(key => {
        if(key==='ASME' && filteredFailedValves[key]!== undefined && filteredFailedValves[key]?.length > 0){
            filteredFailedValves[key] = filteredFailedValves[key]?.filter(valve => {
                if (passedASMEModelNumbers.has(valve.ModelNumber)) {
                    return valve?.failedExpressions?.includes("Kv < 0.3");
                }
                return true;
            });
        }else if(filteredFailedValves[key]!== undefined && filteredFailedValves[key]?.length > 0){
            filteredFailedValves[key] = filteredFailedValves[key]?.filter(valve => {
                if (passedAPIModelNumbers.has(valve.ModelNumber)) {
                    return valve?.failedExpressions?.includes("Kv < 0.3");
                }
                return true;
            });
        }
    }); 

    const filteredFailedValves1= errorMessages(filteredFailedValves,['ASME', 'API', 'APIDef', 'APIWtAvg'],workflowId,inputs);

    
    startTime = new Date().getTime();
    let modelColumns = updatedPassedValves['ASME']?.length > 0 && Object.keys(updatedPassedValves['ASME'][0])?.map(valve => ({
        name: valve
    }));
    if(modelColumns==false){
        modelColumns = updatedPassedValves['API']?.length > 0 && Object.keys(updatedPassedValves['API'][0])?.map(valve => ({
            name: valve
        }));
    }
    // const resultValves = { ...updatedPassedValves };
    

    const fieldName = WorkflowSelectedField[workFlowTestKit];
    // console.log(isVacuumOnly && IsPressureOnly,isVacuumOnly , IsPressureOnly,workflowId,inputs.IsASMESection8,(workflowId==1 || workflowId==5 || workflowId==9) && inputs.IsASMESection8)
    const kit = isVacuumOnly && IsPressureOnly ? workFlowTestKit + '_PV' : isVacuumOnly ? workFlowTestKit + '_V' : ((workflowId==1 || workflowId==5 || workflowId==9) && !inputs.IsASMESection8) || workflowId==2 || workflowId==6 || workflowId==10?workFlowTestKit+'_Act':workFlowTestKit;
    let kitAPI = isVacuumOnly && IsPressureOnly ? workFlowTestKitAPI + '_PV' : isVacuumOnly ? workFlowTestKitAPI + '_V' :workFlowTestKitAPI;
    kitAPI=kitAPI+'_API';
    // console.log(kit,kitAPI,workflowId,inputs.IsLiquid2)
    const displayColumns = WorkflowResultsHeader[kit]?.map(col => {
        // console.log(col,fieldName);
        if (col?.name == fieldName) {
            const localUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);
            let label = col?.label?.replace('FlowCapacityUOM', localUOM?.UnitName);
            if (!isVolumetric) {
                label = label.replace('Pressure ', '');
            }
            return { ...col, label }
        }else if (col?.name == 'Wreqp') {
            const localUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);
            let label = col?.label?.replace('FlowCapacityUOM', localUOM?.UnitName);
            // if (!isVolumetric) {
            //     label = label.replace('Pressure ', '');
            // }
            return { ...col, label }
        
        } else if (isVacuumOnly && IsPressureOnly && col?.name == `${fieldName}_v`) {
            const localUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);
            const label = col?.label?.replace('FlowCapacityUOM', localUOM?.UnitName);
            return { ...col, label }
        } else {
            return col;
        }
    });

    const displayColumnsAPI = WorkflowResultsHeader[kitAPI]?.map(col => {
        if (col?.name == fieldName) {
            const localUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);
            let label = col?.label?.replace('FlowCapacityUOM', localUOM?.UnitName);
            // if (!isVolumetric && inputs?.WorkflowId !==12) {
            //     label = label.replace('Pressure ', '');
            // }
            return { ...col, label }
        }else if (col?.name == 'Wreqp') {
            const localUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);
            let label = col?.label?.replace('FlowCapacityUOM', localUOM?.UnitName);
            return { ...col, label }
        }else if (col?.name == 'Wreq_v') {
            const localUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);
            let label = col?.label?.replace('FlowCapacityUOM', localUOM?.UnitName);
            if (!isVolumetric) {
                label = label.replace('Pressure ', '');
            }
            return { ...col, label }
        }else if (col?.name == 'WreqV') {
            const localUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);
            let label = col?.label?.replace('FlowCapacityUOM', localUOM?.UnitName);
            if (!isVolumetric) {
                label = label.replace('Pressure ', '');
            }
            return { ...col, label }
        } else if (isVolumetric && !IsPressureOnly && col?.name == `${fieldName}_v`) {
            const localUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);
            const label = col?.label?.replace('FlowCapacityUOM', localUOM?.UnitName);
            return { ...col, label }
        } else if (isVacuumOnly && IsPressureOnly && col?.name == `${fieldName}_v`) {
            const localUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);
            const label = col?.label?.replace('FlowCapacityUOM', localUOM?.UnitName);
            return { ...col, label }
        } else {
            return col;
        }
    });
    // console.log(filteredFailedValves['ASME'])
    // console.log(filteredFailedValves['ASME']?.length,filteredFailedValves['API']?.length,filteredFailedValves['APIWtAvg']?.length,filteredFailedValves['APIDef']?.length);

    
    let valveErrors ={};
    // console.log('isMultiValveActive >>>>>>>>>>>>>>>>> ',{isMultiValveActive,workflowId,isMultivalve:inputs?.IsMultivalve,MULTIVALVE_SECTION_WF: process.env?.MULTIVALVE_SECTION_WF.split(','),MULTIVALVE_SECTION_WF_Flag:process.env?.MULTIVALVE_SECTION_WF.split(',').includes(workflowId.toString())})
    let ProceedButtonEnableFlag = !inputs?.IsMultivalve ? (inputs?.SelectedValve?.length > 0) : false;
    let MultiValveFieldSection;
    let selectedValvesHeader;
    let SelectedValvesData;
    let MultiValveSelectionData;
    let finalDisplayColumns = displayColumns ? [...displayColumns] : [];
    let finalDisplayColumnsAPI = displayColumnsAPI ? [...displayColumnsAPI] : [];
    // console.log('isMultiValveActive >>>>>>>>>>>>>>>>> ',{isMultiValveActive,workflowId,isMultivalve:inputs?.IsMultivalve,MULTIVALVE_SECTION_WF: process.env?.MULTIVALVE_SECTION_WF.split(','),MULTIVALVE_SECTION_WF_Flag:process.env?.MULTIVALVE_SECTION_WF.split(',').includes(workflowId.toString())})
    if (isMultiValveActive) {
        const newColumns = [{ name: "Quantity", label: "Quantity" }];
        const localUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);
        if(isVacuumOnly && IsPressureOnly){
            newColumns.push({ name: "MaxWsel", label: `Total Max Pressure Valve Flow (${localUOM?.UnitName})` });
            newColumns.push({ name: "MaxWselV", label: `Total Max Vacuum Valve Flow (${localUOM?.UnitName})` });
        // } else if(isVacuumOnly){
        //     newColumns.push({ name: "MaxWselV", label: `Total Max Vacuum Valve Flow (${localUOM?.UnitName})` });
        // } else if(IsPressureOnly){
        //     newColumns.push({ name: "MaxWsel", label: `Total Max Pressure Valve Flow (${localUOM?.UnitName})` });
        }
        finalDisplayColumns    = displayColumns    ? [...displayColumns,    ...newColumns] : displayColumns;
        // finalDisplayColumnsAPI = displayColumnsAPI ? [...displayColumnsAPI, [...newColumns]] : displayColumnsAPI;
        // console.log('finalDisplayColumns >>>>>>>>>>>>>>>>> ',finalDisplayColumns)
    }else if(inputs?.IsMultivalve === true && process.env?.MULTIVALVE_SECTION_WF.split(',').includes(workflowId.toString())){
        let multiValveFieldFilePath = path.join(__dirname, `../../data/MultiValve/MultiValveFieldSelection.json`);
        let workflowSection=path.join(__dirname, `../../data/workflows/workflowSections${workflowId}.json`);
        let workflowSectionData;
        let dimensionData;
        let localSelectedValves={};
        
        // console.log('SelectedValve >>>>>>>>>>>>>>>>> ',inputs?.SelectedValve?.length)
        if(inputs?.SelectedValve?.length > 0){
            const localPassedValves =updatedPassedValves[KADataSet];
            // const filteredSelectedValves=localPassedValves?.filter(localvalve=> inputs?.SelectedValve?.some(selected=> selected?.ValveId === localvalve?.ValveId && selected?.ModelNumber === localvalve?.ModelNumber && selected?.NewOrifice === localvalve?.NewOrifice && selected?.InletSize === localvalve?.InletSize && selected?.OutletSize === localvalve?.OutletSize));
            let filteredSelectedValves=[] //=localPassedValves?.filter(localvalve=> inputs?.SelectedValve?.some(selected=> selected?.ValveId === localvalve?.ValveId && selected?.ModelNumber === localvalve?.ModelNumber));
            // const filteredSelectedValves=inputs?.SelectedValve?.filter(selected=> localPassedValves?.some(localvalve=> selected?.ValveId === localvalve?.ValveId));
            // console.log('filteredSelectedValves >>>>>>>>>>>>> ',KADataSet,filteredSelectedValves?.length,inputs?.SelectedValve?.length,filteredSelectedValves[0])
            const PsetL= inputs?.SelectedValve[0]?.Pset;
            const PoverL= inputs?.SelectedValve[0]?.Pover;
            const PoverPL= inputs?.SelectedValve[0]?.PoverP;
            filteredSelectedValves = inputs?.SelectedValve?.map(selected => {
                // const selected = inputs?.SelectedValve?.find(selected => selected?.ValveId === filValve?.ValveId && selected?.ModelNumber === filValve?.ModelNumber);
                const selectedPassedValve = passedValves?.find(passedValve => passedValve?.ValveId === selected?.ValveId && passedValve?.ModelNumber === selected?.ModelNumber);
                // console.log('selectedPassedValve >>>>>>>>>>>>> ',selected?.ModelNumber, selectedPassedValve ? 'Found in passed valves' : 'Not found in passed valves');
                if(selectedPassedValve){
                    // console.log('selectedPassedValve?.ReResponse >>>>>>>>>>>>> ',selected?.ReResponse)
                    const ReResponse = JSON.parse(selected?.ReResponse);
                    const calculationFuntion= ReResponse?.calculationFuntion || '';
                    const UOMReceived= ReResponse?.equationValues?.receivedUOM ?? '';
                    // console.log('calculationFuntion >>>>>>>>>>>>> ',calculationFuntion,UOMReceived,inputs?.FlowCapacityUOM,inputs?.PressureUOM)
                    let finalValve={...selected}
                    if(calculationFuntion !==''){
                        // const Pset=selected?.ValvePset;
                        // const Pover=selected?.ValvePover;
                        const Pset= Number(PsetL) !== Number(inputs?.SetPressure) ? Number(inputs?.SetPressure) : convertUnit(Number(selected.Pset), uoms.find(u => u.UnitKey === UOMReceived.pressureUOM), uoms.find(u => u.UnitKey === inputs.PressureUOM));
                        // Pset= Pset?.toFixed(2) == parseFloat(inputs?.SetPressure).toFixed(2) ? Number(inputs?.SetPressure) : Pset; // to handle the case when user entered value is same as valve Pset value after conversion, to avoid any mismatch due to rounding off in conversion  
                        const Pover= Number(PoverL) !== Number(inputs?.OverPressure) ? Number(inputs?.OverPressure) : convertUnit(Number(selected.Pover), uoms.find(u => u.UnitKey === UOMReceived.pressureUOM), uoms.find(u => u.UnitKey === inputs.PressureUOM));
                        const PoverPset= Number(PoverPL) !== Number(inputs?.OverPressurePer) ? Number(inputs?.OverPressurePer) : selected.PoverP;
                        let localInputs={...inputs, 
                            SetPressure: Pset, OverPressure: Pover, OverPressurePer: PoverPset,
                        };
                        const Kb = calculateKbKw(selectedPassedValve, localInputs, constants);
                        // console.log('Pset >>>>>>>>>>>>> ',Pset, Pover, PoverPset,localInputs)
                        let workflowObject;
                        if(KADataSet === 'ASME'){
                            workflowObject=workflowObjectASME;
                        } else if(KADataSet === 'API'){
                            workflowObject=workflowObjectAPI;
                        }else if(KADataSet === 'APIWtAvg'){
                            workflowObject=workflowObjectAPIWTAVG;
                        }
                        workFlowTestKit =  workflowObject?.WorkflowCalculation;
                        valveKey = WorkflowSelectedField[workFlowTestKit];  
                        let requiredCapacityFieldName='Wreq';
                        let actualCapacityFieldName='WActual';
                        let calculatedCapacityFieldName='W';
                        if(valveKey === 'Vsel'){
                            requiredCapacityFieldName='Vreq';
                            actualCapacityFieldName='VActual';
                            calculatedCapacityFieldName='V';
                        }
                        // console.log('workflowObject, selectedPassedValve, CalculationMethod, workFlowTestKit, ComplexValveFlag >>>>>>>>>>>>> ',workflowObject, CalculationMethod, workFlowTestKit, ComplexValveFlag)   
                        const selectedValve = getCalculationValidateCalc(workflowObject, selectedPassedValve, { constants, ...localInputs, CalculationMethod, ...Kb,service }, uoms, workFlowTestKit, ComplexValveFlag);
                        // if(selected?.ValveId===418){
                        //     console.log('selectedValve >>>>>>>>>>>>> ',inputs?.Wreq, 
                        //         valveKey, selectedValve?.[valveKey], selectedValve?.[actualCapacityFieldName],selectedValve?.Asel
                        //         ,selectedValve?.[calculatedCapacityFieldName]
                        //     )
                        // }
                        const localWreq = Number(inputs?.Wreq ? inputs?.Wreq : inputs?.Qreq ? inputs?.Qreq : inputs?.VlreqMass);
                        finalValve= {
                            ...selected,
                            ...selectedValve,
                            [requiredCapacityFieldName]: Number(localWreq) ?? 0,
                            Wreqp: Number(inputs?.Wreqp) ?? 0,
                            [actualCapacityFieldName]: Number(selectedValve?.[actualCapacityFieldName]) ?? 0,
                            [calculatedCapacityFieldName]: Number(selectedValve?.[calculatedCapacityFieldName]) ?? 0,
                            [valveKey]:Number(selectedValve?.[valveKey]),
                            Asel: Number(selectedValve?.Asel) || 0,
                            ValveW: Number(selectedValve?.[valveKey]) || 0,
                        }
                    }
                    // console.log({finalValve})
                    return finalValve;
                }else{
                    // console.log('Selected valve not found in passed valves >>>>>>>>>>>>> ',selected?.ModelNumber,selected?.Orifice,selected?.NewOrifice, selected?.Brand,filteredFailedValves1[KADataSet]?.find(val => val.Brand===selected?.Brand && val?.ModelNumber===selected?.ModelNumber ),
                    // filteredFailedValves[KADataSet]?.find(val => val.Brand===selected?.Brand && val?.ModelNumber===selected?.ModelNumber && val?.SizeCode===selected?.SizeCode) );

                    const valveError=filteredFailedValves[KADataSet]?.find(val => val.Brand===selected?.Brand && val?.ModelNumber===selected?.ModelNumber && val?.SizeCode===selected?.SizeCode);
                    let errContent={};
                    if(valveError){
                        const message = `${valveError?.Brand} ${valveError?.ModelNumber} failed the limit ${valveError?.failedExpressions?.join(', ')}`
                        errContent= {type:'MultiValve Error',message}
                        valveErrors[KADataSet]= [ errContent, ...(valveErrors[KADataSet] || [])];
                    }
                    return {
                        ...selected,
                        errors: {...errContent}
                    }
                }
            });
            
            // filteredSelectedValves?.forEach(valve=>{
            //     console.log('filteredSelectedValves >>>>>>>>>>>>> ',valve?.ModelNumber,valve?.Orifice,valve?.NewOrifice, valve?.Wreq ,valve?.WActual,valve?.Vreq,valve?.VActual,valve?.Areq,valve?.Asel,valve?.Wsel,valve?.Vsel,valve?.W,valve?.V,valve?.Wreqp)
            // })
            localSelectedValves=await getMultiValveSelectionCalculations({workFlowId:workflowId,valveData:filteredSelectedValves});
            // console.log('localSelectedValves >>>>>>>>>>>>> ',localSelectedValves?.selectedValvesHeader,localSelectedValves?.selectedValves)
            MultiValveSelectionData=localSelectedValves?.MultiValveSelectionData;
            // console.log('MultiValveSelectionData >>>>>>>>>>>>> ',MultiValveSelectionData)
            SelectedValvesData=localSelectedValves?.selectedValves;
            selectedValvesHeader=localSelectedValves?.selectedValvesHeader;
            ProceedButtonEnableFlag=localSelectedValves?.ProceedButtonEnableFlag;
        }
        // console.log('SelectedValve >>>>>>>>>>>>>>>>> ',inputs?.SelectedValve?.length)
        if(fs.existsSync(workflowSection)){
            workflowSectionData = JSON.parse(fs.readFileSync(workflowSection, 'utf-8'));
            workflowSectionData = workflowSectionData?.length > 0 ? workflowSectionData?.find(section => section?.sectionName==='flowCapacity' || section?.sectionName==='vaporFlowCapacity') : null;
            workflowSectionData = workflowSectionData ? workflowSectionData?.fields : {};
            dimensionData= workflowSectionData?.length > 0 ? workflowSectionData[0]?.dimensionName : null;
            // console.log('dimensionData >>>>>>>>>>>>> ',dimensionData)
        }
        
        // const localUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);
        //     const label = col?.label?.replace('FlowCapacityUOM', localUOM?.UnitName);
                    
        // console.log(fs.existsSync(multiValveFieldFilePath),multiValveFieldFilePath)
        if(fs.existsSync(multiValveFieldFilePath)){
            let maxFieldFlag=false;
            let localDisplayCols= KADataSet==='ASME'?finalDisplayColumns:finalDisplayColumnsAPI;

            localDisplayCols?.forEach(col=>{
                if(col?.name==='Wsel' && col?.label?.includes('Max')){
                   maxFieldFlag = true;
                }
            });
            const multiValveFieldData = JSON.parse(fs.readFileSync(multiValveFieldFilePath, 'utf-8'));
            const multiValveFields = Object.keys(multiValveFieldData) ??[];
            MultiValveFieldSection = {}
            multiValveFields.forEach(field => {
                let localSection = multiValveFieldData[field];
                // console.log(field,localSection)
                // if(workflowId ==8 && field?.name !=='ValvePset'){
                //     localSection['columnDisabled'] = true;
                // }
                if(localSection?.uomFieldName==='OrificeAreaUOM'){
                    const CalculationMethod= inputs?.CalculationMethod || 'English';
                    // console.log('CalculationMethod >>>>>>>>>>>>> ',CalculationMethod,localSection?.options)
                    // const options=localSection?.options ??[];// JSON.parse(localSection?.options) : [];
                    let OrificeAreaUOM = inputs?.OrificeAreaUOM ?? '';
                    if(OrificeAreaUOM ===''){
                        if(CalculationMethod === 'English'){
                            OrificeAreaUOM = "area.in2";
                        } else {
                            OrificeAreaUOM = "area.cm2";
                        }
                    }
                    // console.log('MultiValveSelectionData >>>>>>>>>>>>> ',field, MultiValveSelectionData?.[field])
                    localSection['value'] = MultiValveSelectionData?.[field] ?? '';
                    localSection['uomValue'] = OrificeAreaUOM;
                    localSection['defaultUOMValue'] = OrificeAreaUOM;
                }
                if(localSection?.uomFieldName==='FlowCapacityUOM'){
                    if(dimensionData !==null){
                        // console.log('dimensionData >>>>>>>>>>>>> ',dimensionData);
                        let dimensionUnits = [];
                        dimensionData?.forEach((dim,index) => {
                            
                            let localdimensionUnits = []
                            uoms?.forEach(u => {
                                if(u?.DimensionName === dim){
                                    localdimensionUnits.push({value:u?.UnitKey,label:u?.UnitName});
                                }});
                            
                            if(dimensionData?.length -1 > index && localdimensionUnits?.length > 0){
                                localdimensionUnits?.push({'value':`dim ${index + 1}`,'label':'-----'}) ?? [];
                            }
                            // console.log('dim >>>>>>>>>>>>> ',dim,Array.isArray(localdimensionUnits),localdimensionUnits?.length);
                            dimensionUnits = [...dimensionUnits, ...localdimensionUnits];
                        });
                        localSection['options'] = [...dimensionUnits];
                        
                        
                    }
                    localSection['value'] = MultiValveSelectionData?.[field] ?? '';
                    localSection['uomValue'] = inputs?.FlowCapacityUOM ?? '';
                    localSection['defaultUOMValue'] = inputs?.FlowCapacityUOM ?? '';
                }
                if(maxFieldFlag){
                    if(field==='RatedPressFlow'){
                        localSection['label'] = localSection['label']?.replace('Rated','Max');
                        localSection['infoText'] = `Total Max Pressure Valve Flow`;
                    }
                    if(field==='TotalActualPressFlow'){
                        localSection['visible'] = false;
                    }
                }
                MultiValveFieldSection[field] = { ...localSection,value:MultiValveSelectionData?.[field] ?? '' };
            });

            
        }
        
        const activeKeys = ['ASME', 'API', 'APIDef', 'APIWtAvg'].filter(
            key => updatedPassedValves[key]?.length > 0
        );

        if (activeKeys.length > 1) {
            // Build a lookup Set of "ModelNumber|Orifice" for each active key
            const keySets = activeKeys.map(key =>
                new Set(updatedPassedValves[key].map(v => `${v?.ModelNumber}|${v?.Orifice}`))
            );
            // Intersection: only pairs present in every active key's Set
            const commonSet = new Set(
                [...keySets[0]].filter(k => keySets.every(set => set.has(k)))
            );
            // Trim each active key's array down to the common objects only
            activeKeys.forEach(key => {
                updatedPassedValves[key] = updatedPassedValves[key].filter(
                    v => commonSet.has(`${v?.ModelNumber}|${v?.Orifice}`)
                );
            });
        }
    }

    
    // ─── ORIFICE FILTERING (DisplayAllOrifices === false means: show minimum orifice per model) ───
    // Only runs when frontend explicitly sends DisplayAllOrifices=false (PAGINATION_FLAG=true path).
    // When DisplayAllOrifices is undefined (PAGINATION_FLAG=false), this block is skipped entirely
    // and the frontend's handleOrificeData() handles filtering client-side as before.
    if (DisplayAllOrifices === false) {
        const API2000_WF_IDS = [3, 23, 24];
        const fireUnwetted = workflowId === 12 && inputs?.FireSizingMethod === 'Unwetted';
        const isAPI2000WF = API2000_WF_IDS.includes(workflowId);
        // Use same column set as frontend: KADataSet=ASME → finalDisplayColumns, else finalDisplayColumnsAPI
        const orificeDisplayColumns = KADataSet === 'ASME' ? finalDisplayColumns : finalDisplayColumnsAPI;
        const valveKey = orificeDisplayColumns?.find(
            col => col.name === 'Vsel' || col.name === 'Wsel' || col.name === 'Qm' || col.name === 'MaxWsel'
        );
        ['ASME', 'API', 'APIDef', 'APIWtAvg'].forEach(datasetKey => {
            if (!updatedPassedValves[datasetKey]?.length) return;
            const groupMap = {};
            updatedPassedValves[datasetKey].forEach(valve => {
                const modelKey = isAPI2000WF
                    ? `${valve.ModelId}-${valve.ModelNumber}-${valve.VPValveType}`
                    : `${valve.ModelId}-${valve.ModelNumber}`;
                const selVal = valveKey ? Number(valve[valveKey.name]) : Infinity;
                if (fireUnwetted) {
                    // WorkflowId=12, Unwetted: only keep orifice where Wreqp <= selVal
                    const WreqVal = Number(valve['Wreqp']);
                    if (isNaN(WreqVal) || WreqVal > selVal) return;
                }
                if (!groupMap[modelKey]) {
                    groupMap[modelKey] = [valve];
                } else if (selVal < Number(groupMap[modelKey][0][valveKey?.name])) {
                    groupMap[modelKey] = [valve];                         // smaller → replace
                } else if (selVal === Number(groupMap[modelKey][0][valveKey?.name])) {
                    groupMap[modelKey] = [...groupMap[modelKey], valve];  // tie → keep both
                }
                // larger → skip
            });
            const filtered = [];
            Object.values(groupMap).forEach(group => filtered.push(...group));
            updatedPassedValves[datasetKey] = filtered;
        });
    }
    // ─── END ORIFICE FILTERING ────────────────────────────────────────────────────────────────────

    Object.keys(filteredFailedValves1)?.forEach(key=>{
        if(key=== KADataSet){
            valveErrors[key] = [...valveErrors[key] || [], ...filteredFailedValves1[key]];
        }else{
            valveErrors[key] = filteredFailedValves1[key]?.length > 0 ? true : false;
        }
    });

    // ─── ACTIVE FILTERS APPLICATION ──────────────────────────────────────────────
    // Filter the full in-memory result set before computing totalCounts + pagination.
    // Runs FIRST so that filterOptions extraction below uses the post-filter dataset.
    // Backend only filters when activeFilters is a non-empty object; otherwise no-op.
    if (hasActiveFilters) {
        Object.keys(updatedPassedValves).forEach(key => {
            if (!Array.isArray(updatedPassedValves[key])) return;
            updatedPassedValves[key] = updatedPassedValves[key].filter(valve => {
                return Object.keys(activeFilters).every(colName => {
                    const filterValues = activeFilters[colName];
                    if (!Array.isArray(filterValues) || filterValues.length === 0) return true;
                    return filterValues.includes(valve[colName]);
                });
            });
        });
    }
    // ─── END ACTIVE FILTERS APPLICATION ──────────────────────────────────────────

    // ─── FILTER OPTIONS EXTRACTION ───────────────────────────────────────────────
    // Build distinct-value lists per column from the POST-FILTER result set (cascading).
    // Returned on pageNumber=0 so options refresh after every filter selection change.
    // Areq-family columns store objects {in², cm², mm²} — skipped here; frontend handles them.
    const areqFields = ['Areq', 'Areq_v', 'AreqG', 'AreqL', 'AreqL2', 'Wsel', 'Vsel'];
    let filterOptions = undefined;
    if (isPaginated && Number(pageNumber) === 0) {
        const activeDataset = updatedPassedValves[KADataSet];
        if (Array.isArray(activeDataset) && activeDataset.length > 0) {
            const colDefs = KADataSet === 'ASME' ? finalDisplayColumns : finalDisplayColumnsAPI;
            filterOptions = { [KADataSet]: {} };
            colDefs?.forEach(col => {
                if (areqFields.includes(col.name)) return; // skip object-valued area columns
                const values = activeDataset.map(row => row[col.name]);
                filterOptions[KADataSet][col.name] = [...new Set(values)].filter(v => v !== undefined && v !== null && v !== '');
            });
        }
    }
    // ─── END FILTER OPTIONS EXTRACTION ───────────────────────────────────────────

    // Capture total counts before slicing (used for frontend pagination UI)
    const totalCounts = {};
    Object.keys(updatedPassedValves).forEach(key => {
        totalCounts[key] = Array.isArray(updatedPassedValves[key])
            ? updatedPassedValves[key].length
            : 0;
    });

    let resultValves = {};
    Object.keys(updatedPassedValves)?.forEach(key => {
        if(key=== KADataSet){
            let valveData = updatedPassedValves[key];
            if (isPaginated) {
                const start = Number(pageNumber) * Number(pageSize);
                valveData = valveData.slice(start, start + Number(pageSize));
            }
            resultValves[key] = valveData;
            // console.log('resultValves[key] >>>>>>>>>>>>>>>>> ',key,resultValves[key]?.length)
        }else{
            resultValves[key] = updatedPassedValves[key]?.length > 0 ? true : false;
        }
    });

    
        
    return {
        columns: modelColumns,
        displayColumns: KADataSet==='ASME'?finalDisplayColumns:finalDisplayColumnsAPI,
        // displayColumnsAPI: finalDisplayColumnsAPI,
        rows: resultValves,
        totalCounts,
        pageNumber: isPaginated ? Number(pageNumber) : null,
        pageSize:   isPaginated ? Number(pageSize)   : null,
        filterOptions,
        // errors: filteredFailedValves,
        SelectedValves:SelectedValvesData ?? inputs?.SelectedValve ?? [],
        selectedValvesHeader,
        MultiValveFieldSection,
        ProceedButtonEnableFlag,
        MultiValveSelectionData: inputs?.IsMultivalve === true ? MultiValveSelectionData : undefined,
        errors: {...valveErrors}

    }
}



module.exports={
    getWorkflowResults,
    getWorkflowResultsCalc,
    getCalculationValidate,
    checkSpecialConditions
}