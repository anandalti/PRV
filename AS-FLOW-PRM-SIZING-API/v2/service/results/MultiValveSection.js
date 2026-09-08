const { parse } = require("dotenv");
const path = require("path");
const fs = require("fs");
const { getUOMs } = require("../getUom");
const { getConstants, convertUnit } = require("../../utils/helper");
const calculateKbKw = require("../../utils/calculateKb");
const { calculations } = require("../calculations/Calculations");
const { evaluateFireMultiValveRule, comparePressures } = require("../fieldCalculations/SectionVIIIFireMultiValveRules");

const callFunctionByName = (functionName, ...args) => {
    // console.log('functionName >>>>>>>> ', functionName);
    const func = calculations[functionName];
    // console.log('typeof func >>>>>>>> ', typeof func);
    if (typeof func === 'function') {
        return func(...args);
    } else {
        throw new Error(`Function ${functionName} not found`);
    }
};

const ReCalculateFlowCapacityforSelectedValve= (row,highSetValues,lowSetValues,uoms,errors)=>{
    
    const P1= highSetValues.PsetH + highSetValues.PoverH + row?.Patm - row?.Ploss;
            // if(P1 !== row?.P1){
    const ReResponse= JSON.parse(row?.ReResponse ?? '{}');
    const calculationFuntion= ReResponse?.calculationFuntion ?? ReResponse['calculationFuntion'] ?? '';
    // console.log('calculationFuntion >>>>>>>> ', calculationFuntion);
    const uomReceived =ReResponse?.uomReceived ?? null;
    const TemperatureUOM = uoms.find(u => u.UnitName === uomReceived?.temperatureUOM)?.UnitKey;
    const AtmPressureUOM = uoms.find(u => u.UnitName === uomReceived?.absPressureUOM)?.UnitKey;
    const PressureUOM = uoms.find(u => u.UnitName === uomReceived?.pressureUOM)?.UnitKey;
    const FlowCapacityUOM = uoms.find(u => u.UnitName === uomReceived?.flowCapacityUOM)?.UnitKey;
    const OrificeAreaUOM = uoms.find(u => u.UnitName === uomReceived?.orificeAreaUOM)?.UnitKey;
    const ViscosityUOM = uoms.find(u => u.UnitName === uomReceived?.viscosityUOM)?.UnitKey;
    const MassFluxUOM = uoms.find(u => u.UnitName === uomReceived?.massfluxUOM)?.UnitKey;
    const AreaUOM = uoms.find(u => u.UnitName === uomReceived?.areaUOM)?.UnitKey;
    const LatentHeatOfVaporUOM = uoms.find(u => u.UnitName === uomReceived?.latentHeatOfVaporUOM)?.UnitKey;
    const LiquidSpecificHeatAtInletUOM = uoms.find(u => u.UnitName === uomReceived?.specificHeatUOM)?.UnitKey;
    const SurfaceAreaUOM = uoms.find(u => u.UnitName === uomReceived?.surfaceAreaUOM)?.UnitKey;
    const LatentHeatUOM = uoms.find(u => u.UnitName === uomReceived?.latentheatUOM)?.UnitKey ?? uoms.find(u => u.UnitName === uomReceived?.latentHeatUOM)?.UnitKey;
    const SpecificVolumeUOM = uoms.find(u => u.UnitName === uomReceived?.specificVolumeUOM)?.UnitKey;
    const DensityUOM = uoms.find(u => u.UnitName === uomReceived?.densityUOM)?.UnitKey;

    const CalculationMethod = row?.CalculationMethod || 'English';
    // console.log('calculationFuntion >>>>>>>> ', calculationFuntion, TemperatureUOM, AtmPressureUOM, PressureUOM, FlowCapacityUOM, OrificeAreaUOM, ViscosityUOM,LatentHeatUOM);
    const constants = getConstants(CalculationMethod);
    const AsmeApiDataSet = row?.KADataSet;
    const functionName = calculationFuntion; //`${calculationFuntion}_MVSVCC`;
    // console.log('functionName >>>>>>>> ', functionName);

    // console.log('AsmeApiDataSet >>>>>>>> ', AsmeApiDataSet);
    let valve={
        ValveId: row?.ValveId,
        ValveFunction: row?.ValveFunction,
        Kmax: row?.valveKmax,
        KAPI: row?.valveKApi,
        KmaxL: row?.valveKmaxL,
        KAPIL: row?.valveKAPIL,
        A: row?.valveA,
        AAPI: row?.valveAAPI,
        AL:row?.valveAL,
        AAPIL:row?.valveAAPIL,
        ModelNumber: row?.ModelNumber, 
        VPValveType: row?.VPValveType, 
        ShortName: row?.ShortName, 
        m: row?.m, 
        b: row?.b, 
        E: row?.E, 
        Tp: row?.Tp,
        ValveFunction: row?.ValveFunction,
        Brand: row?.Brand,
        Orifice: row?.Orifice,
        SizeCode: row?.SizeCode
    }
    // console.log('Valve details for calculation >>>>>>>> ', highSetValues.PsetH,row?.ValvePset);
    const inputs = {
        ...row,
        Pset: highSetValues.PsetH,
        Pover: highSetValues.PoverH ?? row?.ValvePover,
        PoverP: highSetValues.PoverPH ?? row?.ValvePoverP,
        ValvePoverP:highSetValues.PoverPH ?? row?.ValvePoverP,
        ValvePover: highSetValues.PoverH ?? row?.ValvePover,
        ValvePset: highSetValues.PsetH ?? row?.ValvePset,
        PsetH: highSetValues.PsetH,
        PoverH: highSetValues.PoverH,
        TemperatureUOM,
        AtmPressureUOM,
        PressureUOM,
        FlowCapacityUOM,
        OrificeAreaUOM,
        ViscosityUOM,
        MassFluxUOM,
        DensityUOM,
        SpecificVolumeUOM,
        LiquidSpecificHeatAtInletUOM,
        LatentHeatUOM,
        AreaUOM,
        LatentHeatOfVaporUOM,
        SurfaceAreaUOM,
        CalculationMethod,
        KCpByCv: row?.k,
        IsASMESection8: row?.IsASMESection8,
        RuptureDiscKcFd: row?.Kc ?? row?.Fd,
        Relieving: row?.T,
        SetPressure: highSetValues?.PsetH,
        OverPressure: highSetValues?.PoverH ?? row?.ValvePover,
        OverPressurePer: highSetValues?.PoverPH ?? row?.ValvePoverP,
        SizingBasis: row?.SizingBasis,
        InletLoss: row?.Ploss,
        SystemMAWP: row?.SystemMAWP,
        AtmPressure: row?.Patm,
        BuiltUp: row?.Pbu,
        ConstantSuperimposed: row?.Psic,
        VariableSuperimposed: row?.Psiv,
        TotalBackPressure: row?.Pback,
        MolWeight: row?.M,
        Viscosity: row?.Mu,
        Compressibility: row?.Z,
        SpGravity: row?.SG,
        service: row?.service,
        Wreq: row?.Wreq ?? row?.Vreq,
        functionName:calculationFuntion
    }
    // console.log('AsmeApiDataSet 22222222>>>>>>>> ', AsmeApiDataSet,inputs?.functionName);
    const Kb = calculateKbKw(valve, inputs, constants);
    // console.log('Kb >>>>>>>> ', Kb);
    

    let valve_calculation=callFunctionByName(functionName, row?.KADataSet, valve, {...inputs,constants,...Kb}, uoms);
    let localReResponse= JSON.parse(valve_calculation?.ReResponse) ;
    // console.log('valve_calculation >>>>>>>> ', valve_calculation);
    if(localReResponse!==null){
        localReResponse['calculationFuntion'] = calculationFuntion;
        valve_calculation['ReResponse'] = JSON.stringify(localReResponse);
    }
    // console.log('valve_calculation 22222222222 >>>>>>>> ', errors.length);
    const returnValue = {
        ...row,
        ...valve_calculation,
        PoverH: highSetValues.PoverH,
        PsetL: lowSetValues.PsetL,
        PoverL: lowSetValues.PoverL,
        ValvePover: highSetValues.PoverH,
        PoverPH: highSetValues.PoverPH,
        ValvePoverP: highSetValues.PoverPH,
        errors: errors.length > 0 ? [...errors] : undefined
    }
    // console.log('returnValue >>>>>>>> ', returnValue);
    return returnValue;
}
const getMultiValveSectionDetails = async (params) => {
    
    if(params?.IsMultivalve === true && process.env?.MULTIVALVE_SECTION_WF.split(',').includes(params?.WorkflowId?.toString())){
        let multiValveFieldFilePath = path.join(__dirname, `../../data/MultiValve/MultiValveFieldSelection.json`);
        if(fs.existsSync(multiValveFieldFilePath)){
            const multiValveFieldData = JSON.parse(fs.readFileSync(multiValveFieldFilePath, 'utf-8'));
            const multiValveFields = Object.keys(multiValveFieldData) ??[];
            let MultiValveFieldSection = {}
            multiValveFields?.forEach(field => {
                let localSection = multiValveFieldData[field];
                if(localSection?.uomFieldName==='OrificeAreaUOM'){
                    const CalculationMethod= params?.CalculationMethod || 'English';
                    let OrificeAreaUOM = params?.OrificeAreaUOM ?? '';
                    if(OrificeAreaUOM ===''){
                        if(CalculationMethod === 'English'){
                            OrificeAreaUOM = 'in²';
                        }else{
                            OrificeAreaUOM = 'mm²';
                        }
                    }
                    localSection['uomValue'] = OrificeAreaUOM;
                    localSection['defaultUOMValue'] = OrificeAreaUOM;
                }else if(localSection?.uomFieldName==='FlowCapacityUOM'){
                    const CalculationMethod= params?.CalculationMethod || 'English';
                    let FlowCapacityUOM = params?.FlowCapacityUOM ?? '';
                    if(FlowCapacityUOM ===''){
                        if(CalculationMethod === 'English'){
                            FlowCapacityUOM = 'GPM';
                        }else{
                            FlowCapacityUOM = 'm³/h';
                        }
                    }
                    localSection['uomValue'] = FlowCapacityUOM;
                    localSection['defaultUOMValue'] = FlowCapacityUOM;
                }
                MultiValveFieldSection[field] = { ...localSection };
            });
            return { status: "success", data: { MultiValveFieldSection } };
        }else{
            return { status: "error",message: "Multivalve field data not available.", data: { MultiValveFieldSection: {} } };
        }
    }else{
        return { status: "error", message: "Multivalve is not active.", data: { MultiValveFieldSection: {} } };
    }
}


const getMultiValveSelectionCalculations = async (params,validateFlag=false) => {
    // console.log('In getMultiValveSelection Calculations >>>>>>>> ',params[0],validateFlag);
    let totalRequiredArea = 0;
    let totalSelectedArea = 0;
    let RequiredPressFlow= 0;
    let RatedPressFlow= 0;
    let TotalSelectedPercentage = 0;
    let TotalActualPressFlow= 0;
    let OrificeAreaUOM  = '';
    let FlowCapacityUOM = '';
    let PressureUOM =  '';

    const uoms = await getUOMs();
    const fieldErrors=[]
    const workFlowId = params?.workFlowId;
    const valveData = params?.valveData ?? [];
    let localParams=valveData?.map((field,index) => {
        // console.log('Field details >>>>>>>> ',{index,field});
        // console.log({index,validateFlag,Wreq: field?.Wreq, Vreq: field?.Vreq, Wsel: field?.Wsel, Vsel: field?.Vsel, WActual: field?.WActual, VActual: field?.VActual, Asel: field?.Asel, ValvePset:field?.ValvePset, ValvePover:field?.ValvePover, ValvePoverP:field?.ValvePoverP});
        const ReResponse= JSON.parse(field?.ReResponse ?? '{}');
        // console.log({index, ReResponse});
        let UOMReceived= ReResponse?.uomReceived ?? '';
        if(workFlowId==21){
            UOMReceived= ReResponse?.ReResponseG?.uomReceived ?? '';
        }

        // console.log(workFlowId,{index, UOMReceived, AreqInput: ReResponse?.AreqInput,
        //     WselInput: ReResponse?.WselInput, Areq: ReResponse?.Areq, Wsel: ReResponse?.Wsel, Wreq: ReResponse?.Wreq,
        //     WreqInput: ReResponse?.WreqInput,
        //     WActual: ReResponse?.WActual,
        //     UOMReceived
        // });

        OrificeAreaUOM = UOMReceived?.orificeAreaUOM ?? '';
        FlowCapacityUOM = UOMReceived?.flowCapacityUOM ?? '';
        PressureUOM = UOMReceived?.pressureUOM ?? '';
        
        
        OrificeAreaUOM = uoms?.find(uom => uom?.UnitName === OrificeAreaUOM)?.UnitKey ?? OrificeAreaUOM;
        FlowCapacityUOM = uoms?.find(uom => uom?.UnitName === FlowCapacityUOM)?.UnitKey ?? FlowCapacityUOM;
        PressureUOM = uoms?.find(uom => uom?.UnitName === PressureUOM)?.UnitKey ?? PressureUOM;

        const [dimension, unit] = FlowCapacityUOM !== undefined ? FlowCapacityUOM?.split('.') : ['', ''];
        const isVolumetric = !(dimension === 'massflow');
        // console.log({index, OrificeAreaUOM, FlowCapacityUOM, PressureUOM,isVolumetric,dimension,FlowCapacityUOM:FlowCapacityUOM?.split('.')});
        // console.log({index, UOMReceived, OrificeAreaUOM, FlowCapacityUOM, PressureUOM});
        // console.log(UOMReceived, OrificeAreaUOM, FlowCapacityUOM);
        // totalRequiredArea += parseFloat(field?.Areq[OrificeAreaUOM]) ?? 0;
        totalSelectedArea += parseFloat(field?.Asel) || 0;
        RequiredPressFlow = parseFloat(!isVolumetric ? field?.Wreq ?? field?.Vreq: field?.Vreq) || 0;
        RatedPressFlow += parseFloat(!isVolumetric ? field?.Wsel ?? field?.Vsel: field?.Vsel) || 0;
        TotalActualPressFlow += parseFloat(!isVolumetric ? field?.WActual ?? field?.VActual: field?.VActual) || 0;
        let PsetKey= 'PsetH';
        let PoverKey= 'PoverH';
        let PsetType = 'PsetH';
        let disabled = false;
        let ValvePset = validateFlag ?parseFloat(field?.ValvePset) || 0 : parseFloat(field?.Pset) || 0;
        let ValvePover = validateFlag ?parseFloat(field?.ValvePover):parseFloat(field?.Pover) || 0;
        const rawPoverP = parseFloat(field?.PoverP);
        let ValvePoverP = validateFlag
            ? parseFloat(field?.ValvePoverP)
            : (!isNaN(rawPoverP) && rawPoverP !== 0)
                ? rawPoverP
                : (parseFloat(field?.Pover) && parseFloat(field?.Pset)
                    ? (parseFloat(field?.Pover) / parseFloat(field?.Pset)) * 100
                    : 0);
        // console.log('ValvePoverP >>>> ',validateFlag,parseFloat(field?.ValvePoverP),rawPoverP,(parseFloat(field?.Pover) / parseFloat(field?.Pset)),parseFloat(field?.Pover) && parseFloat(field?.Pset),(parseFloat(field?.Pover) / parseFloat(field?.Pset)) * 100,ValvePoverP);
        const localValveW=!isVolumetric ? field?.W ?? field?.Wsel ?? field?.Vsel: field?.V ?? field?.Vsel;
        const localWreq=!isVolumetric ? field?.Wreq ?? field?.Vreq: field?.Vreq;
        const ValveW = parseFloat(localValveW).toFixed(3) || 0;
        const ValveSelectedPer = ((parseFloat(!isVolumetric ? field?.Wsel ?? field?.Vsel : field?.Vsel) / RequiredPressFlow) * 100).toFixed(2) || 0;
        // console.log({index, isVolumetric, Wsel: field?.Wsel, Vsel: field?.Vsel, ValveSelectedPer, ValvePset, ValvePover, ValvePoverP, ValveW, localWreq, RequiredPressFlow,RPF:!isVolumetric ? field?.Wreq ?? field?.Vreq: field?.Vreq,RPF1:!isVolumetric ? field?.Wsel ?? field?.Vsel: field?.Vsel,
        //     isVolumetric:!isVolumetric,Wreq: field?.Wreq,Vreq:field?.Vreq,Wsel: field?.Wsel,Vsel:field?.Vsel,errors:field?.errors});
        if(index===0){
            PsetType = 'PsetL';
            PsetKey = 'PsetL';
            PoverKey = 'PoverL';
            disabled = true;
            // ValvePset = parseFloat(removedValve?.Pset) || 0;
            // ValvePover = parseFloat(removedValve?.Pover) || 0;
            // ValvePoverP = parseFloat(removedValve?.PoverP) || 0;
        }
        if(field?.errors){
            fieldErrors.push({index, errors: field?.errors});
        }
        let PopupContentUrl;
        let RatedFlowCapacity;
        let RequiredCapacity;
        // console.log({index, ValvePset, ValvePover, ValvePoverP, RequiredPressFlow, ValveSelectedPer});
        if(field?.isValvePopup){
            if(field?.popupDetails){
                if(field?.popupDetails?.PopupContentUrl){
                    
                    PopupContentUrl= field?.popupDetails?.PopupContentUrl;
                    let PopupContentData=PopupContentUrl?.split('?');
                    if(PopupContentData?.length>1){
                        let queryParams= PopupContentData[1]?.split('&');
                        if(queryParams?.length>0){
                            queryParams.forEach(param => {
                                let [key, value] = param.split('=');
                                if(key === 'RatedFlowCapacity' && value){
                                    RatedFlowCapacity = parseFloat(value);
                                }else if(key === 'RequiredCapacity' && value){
                                    RequiredCapacity = parseFloat(value);
                                }
                            });
                        }
                    }

                    PopupContentUrl= PopupContentUrl?.replace(`RatedFlowCapacity=${RatedFlowCapacity}`, `RatedFlowCapacity=${localValveW}`);
                    PopupContentUrl= PopupContentUrl?.replace(`RequiredCapacity=${RequiredCapacity}`, `RequiredCapacity=${localWreq}`);
                }
            }
        }
        const returnValue= {
            ...field,
            rowId: index+1,
            ValveSelectedPer,
            ValvePset: parseFloat(ValvePset).toFixed(3) || 0,
            ValvePover: parseFloat(ValvePover).toFixed(3) || 0,
            ValvePoverP: parseFloat(ValvePoverP).toFixed(3) || 0,
            // ValvePset: parseFloat(ValvePset) || 0,
            // ValvePover: parseFloat(ValvePover)|| 0,
            // ValvePoverP: parseFloat(ValvePoverP)|| 0,
            ValveW,
            PsetH: index===0? undefined :!validateFlag ?parseFloat(field?.ValvePset):parseFloat(field?.Pset) || 0,
            PoverH: index===0? undefined :!validateFlag ?parseFloat(field?.ValvePover):parseFloat(field?.Pover) || 0,
            PsetL: parseFloat(field?.Pset) || 0,
            PoverL: parseFloat(field?.Pover) || 0,
            PsetType,
            RatedFlowCapacity: localValveW,
            RequiredCapacity: localWreq,
            popupDetails:field?.isValvePopup ? {
                ...field?.popupDetails,
                PopupContentUrl: field?.isValvePopup && field?.popupDetails?.RestrictedLiftCalculation ? PopupContentUrl : undefined
            } : undefined,
            disabled
        }
        // if(index==1){
            // console.log({index, returnValue});
        // }
        
        return returnValue;
    });

    // console.log('totalSelectedArea >>>>>>>> ',localParams?.length,RequiredPressFlow,RatedPressFlow,totalSelectedArea);
    totalRequiredArea= RequiredPressFlow / RatedPressFlow * totalSelectedArea;

    TotalSelectedPercentage= ((RatedPressFlow / RequiredPressFlow) * 100).toFixed(2);
    TotalSelectedPercentage= isNaN(TotalSelectedPercentage) || !isFinite(TotalSelectedPercentage) ? '' : TotalSelectedPercentage;
    // TotalActualPressFlow = RatedPressFlow * (TotalSelectedPercentage/100);
    // console.log('totalRequiredArea >>>>>>>> ',totalRequiredArea);
    let selectedValvesHeader = path.join(__dirname, `../../data/MultiValve/SelectedValvesColumns.json`);
    // console.log('selectedValvesHeader >>>>>>>> ',selectedValvesHeader);
    if(fs.existsSync(selectedValvesHeader)){
        const selectedValvesHeaderData = JSON.parse(fs.readFileSync(selectedValvesHeader, 'utf-8'));
        
        const localFlowCapacityUOM = uoms?.find(u => u?.UnitKey === FlowCapacityUOM);

        const localPressureUOM = uoms?.find(u => u?.UnitKey === PressureUOM);
        // const PressureLabel = col?.label?.replace('PressureUOM', localPressureUOM?.UnitName);

        selectedValvesHeader=selectedValvesHeaderData.map(header => {
            if(header?.name === 'ValveSelectedPer'){
                header['label'] = `Percent of Required Flow (%)`;
            }else if(header?.name === 'ValvePset'){
                header['label'] = `Set Pressure (${localPressureUOM?.UnitName})`;
            }else if(header?.name === 'ValvePover'){
                header['label'] = `Over Pressure (${localPressureUOM?.UnitName})`;
                
            }else if(header?.name === 'ValveW'){
                
                header['label'] = `Rated Flow Capacity (${localFlowCapacityUOM?.UnitName})`;
            } 
            if(workFlowId==8 && header?.name !== 'ValvePset'){
                header['disabled'] = true;
            }
            if (valveData[0]?.SizingBasis?.toLowerCase() === 'fire case' && [true, 'true'].includes(valveData[0]?.IsASMESection8) && ['ValvePover', 'ValvePoverP'].includes(header?.name)) {
                header['disabled'] = true;
            }
            return header;
        });
    }

    const flowRateMetIconFlag= fieldErrors?.length === 0 ?localParams?.length>0 && parseFloat(RequiredPressFlow) <= parseFloat(RatedPressFlow):false;
    const TwoOrMoreValveSelectedFlag= fieldErrors?.length === 0 ? localParams?.length >= 2 : false;
    // console.log('localParams?.length >>>>>>>> ',localParams?.length,localParams?.length>=2)
    const ProceedButtonEnableFlag= fieldErrors?.length === 0 ? localParams?.length >= 2 && flowRateMetIconFlag : false;
    const MultiValveSelectionData ={
        totalRequiredArea:totalRequiredArea==0 ? '' : parseFloat(totalRequiredArea.toFixed(3)),
        totalSelectedArea : totalSelectedArea==0 ? '' : parseFloat(totalSelectedArea.toFixed(3)),
        RequiredPressFlow : RequiredPressFlow==0 ? '' : parseFloat(RequiredPressFlow.toFixed(3)),
        RatedPressFlow : RatedPressFlow==0 ? '' : parseFloat(RatedPressFlow.toFixed(3)),
        TotalSelectedPercentage,
        TotalActualPressFlow : TotalActualPressFlow==0 ? '' : parseFloat(TotalActualPressFlow.toFixed(3)),
        OrificeAreaUOM,
        flowRateMetIconFlag,
        TwoOrMoreValveSelectedFlag,
        FlowCapacityUOM,
        PressureUOM
    }
    // console.log('localPaMultiValveSelectionDatarams >>>>>>>> ',MultiValveSelectionData);
    return {status: "success", MultiValveSelectionData, selectedValves: localParams, selectedValvesHeader,ProceedButtonEnableFlag};
}



const deleteMultiValveRow = async (data) => {
    const { rowIdToRemove, workFlowId,valveData, error } = data;
    const removedValve= valveData?.find(row => row?.rowId === rowIdToRemove);
    const removedRowIndex = valveData?.findIndex(row => row?.rowId === rowIdToRemove);
    let localUpdatedRows = valveData?.filter((row,index) => row?.rowId !== rowIdToRemove) ?? [];
    localUpdatedRows = await Promise.all(localUpdatedRows?.map(async (row,index) => {
        if(removedRowIndex===0 && index === 0){
            const uoms = await getUOMs();
            const localRow={
                ...row,
                ValvePset: parseFloat(removedValve?.Pset) || 0,
                ValvePover: parseFloat(removedValve?.Pover) || 0,
                ValvePoverP: parseFloat(removedValve?.PoverP) || 0,
                Pset: parseFloat(removedValve?.Pset) || 0,
                Pover: parseFloat(removedValve?.Pover) || 0,
                PoverP: parseFloat(removedValve?.PoverP) || 0,
                PsetL: parseFloat(removedValve?.Pset) || 0,
                PoverL: parseFloat(removedValve?.Pover) || 0,
                PsetH: undefined,
                PoverH: undefined,
            }
            return ReCalculateFlowCapacityforSelectedValve(row, {PsetH: removedValve?.Pset, PoverH: removedValve?.Pover, PoverPH: removedValve?.PoverP},{PsetL: removedValve?.Pset,PoverL: removedValve?.Pover},uoms,[]);

        }else{
            return row;
        }
    }));
    const UpdatedSelectedValvesData=await getMultiValveSelectionCalculations({workFlowId, valveData: localUpdatedRows});
    const updatedErrors= error?.filter(err => err?.rowId !== rowIdToRemove) ?? [];
    UpdatedSelectedValvesData['error'] = updatedErrors;
    return UpdatedSelectedValvesData;
}



const validateMultiValveSelectionData = async (params) => {
    const uoms = await getUOMs();
    const rowId= params?.rowIdToValidate ?? '';
    const workFlowId= params?.workFlowId ?? params?.workflowId ?? params?.workflowid ??'';
    const fieldName= params?.fieldName ?? '';
    const selectedRows= params?.valveData ?? [];
    let error = params?.error ?? [];
    let rowToValidate = selectedRows?.find(row => row?.rowId === rowId);
    // console.log('validateMultiValveSelectionData >>>>>>>> ', fieldName,rowId, rowToValidate);  
    const SizingBasis = rowToValidate?.SizingBasis ?? '';
    const Pmawp = rowToValidate?.SystemMAWP===''?'':parseFloat(rowToValidate?.SystemMAWP) || '';
    const PsetL = parseFloat(selectedRows[0]?.Pset) || 0;
    const PsetH = parseFloat(rowToValidate?.ValvePset) || 0;
    const PoverL = parseFloat(selectedRows[0]?.Pover) || 0;
    // console.log({SizingBasis, Pmawp, PsetL, PsetH, PoverL});
    let PoverH = parseFloat(rowToValidate?.ValvePover) || 0;
    let PoverPH = parseFloat(rowToValidate?.ValvePoverP) || 0;
    let ValvePoverP = parseFloat(rowToValidate?.ValvePoverP) || 0;
    let ValvePover = parseFloat(rowToValidate?.ValvePover) || 0;
    // console.log({PsetL, PsetH, PoverL, PoverH,PoverPH, ValvePoverP,fieldName,ValvePoverPFlag:fieldName === 'ValvePoverP',ValvePoverFlag:fieldName === 'ValvePover'});
    if(fieldName === 'ValvePoverP'){
        PoverH = (PsetH * PoverPH) / 100;
        ValvePover = PoverH;
        // PoverH = parseInt(Math.round((PsetH * PoverPH) / 100).toString());
    }else if(fieldName === 'ValvePover'){
        PoverPH = (PoverH / PsetH) * 100;
        ValvePoverP = PoverPH;
        // PoverPH = parseInt(Math.round(PoverH / PsetH * 100).toString());
    }

    const ReResponse= JSON.parse(rowToValidate?.ReResponse ?? '{}');
    const equationValues = ReResponse?.equationValues ?? {};
    const requiredUnits = equationValues?.requiredUnits ?? {};
    const receivedUnits = equationValues?.receivedUOM ?? {};
    // console.log({receivedUnits, requiredPressureUOM: requiredUnits});
    const requiredPressureUOM = 'pressure.psig';
    const convertedPsetH = convertUnit(PsetH, uoms.find(uom => uom.UnitKey === receivedUnits?.pressureUOM), uoms.find(uom => uom.UnitKey === requiredPressureUOM));
    let convertedPoverH = convertUnit(PoverH, uoms.find(uom => uom.UnitKey === receivedUnits?.pressureUOM), uoms.find(uom => uom.UnitKey === requiredPressureUOM));
    const convertedPmawp = convertUnit(Pmawp, uoms.find(uom => uom.UnitKey === receivedUnits?.pressureUOM), uoms.find(uom => uom.UnitKey === requiredPressureUOM));
    const convertedPsetL = convertUnit(PsetL, uoms.find(uom => uom.UnitKey === receivedUnits?.pressureUOM), uoms.find(uom => uom.UnitKey === requiredPressureUOM));
    const convertedPoverL = convertUnit(PoverL, uoms.find(uom => uom.UnitKey === receivedUnits?.pressureUOM), uoms.find(uom => uom.UnitKey === requiredPressureUOM));
    // console.log(' >>>>>>>>>>>>>>>>>>>>>>> 111111111111111 >>>>>>>>>>>>>>>>>>>>>>>>>>>>',{convertedPsetH, PoverH, convertedPmawp, convertedPsetL, convertedPoverL});
    // console.log({PsetL, PsetH, PoverL, PoverHrs,PoverPH, ValvePoverP,ValvePover});
    // console.log(' >>>>>>>>>>>>>>>>>>>>>>> 222222222222222 >>>>>>>>>>>>>>>>>>>>>>>>>>>>',workFlowId, SizingBasis,Pmawp, PsetL, PsetH, PoverL);
    let PoverMinTHMessageContent='In Selected valve <<ModelNumber>>(row: <<RowNumber>>), Over Pressure (PoverH) should be 3 psig.';
    let PoverMinTHMessageContent1='In Selected valve <<ModelNumber>>(row: <<RowNumber>>), Over Pressure (PoverH) should be <<$1>> psig.';
    let PoverMinTHMessageContent2='In Selected valve <<ModelNumber>>(row: <<RowNumber>>), Over Pressure (PoverH) would be less than 10% of set pressure for given set pressure: <<$1>> psig';
    let PoverMessageContent='In Selected valve <<ModelNumber>>(row: <<RowNumber>>), Over Pressure (PoverH) must be between <<$1>> psig and <<$2>> psig.';
    let PsetHMessageContent='In Selected valve <<ModelNumber>>(row: <<RowNumber>>), High Set Pressure (PsetH) must be less than or equal to <<$1>>% of <<$2>> (<<$3>>).';
    let PsetHMessageContent2='In Selected valve <<ModelNumber>>(row: <<RowNumber>>), High Set Pressure (PsetH) cannot be lower than the lowest installed valve set pressure (<<$1>> psig).';
    let PsetHSecIMessageContent='In Selected valve <<ModelNumber>>(row: <<RowNumber>>), High Set Pressure (PsetH) must be less than or equal <<$1>> <<$2>>.';
    let PsetHPoverHValueCheckMessageContent='In Selected valve <<ModelNumber>>(row: <<RowNumber>>), Pset,H + Pover,H must be less than or equal to <<$1>>.';
    let PsetHPoverHValueCheckMessageFlag=false;
    let PoverLowLimit=0;
    let PoverHighLimit=0;
    let PoverMessageFlag=false;
    let PsetHMessageFlag=false;
    let PsetHLtPseLMessageFlag=false;
    let PsetHPercentage=0;
    let PsetHTextValue='';
    let PsetHlimitvalve=0;
    let errors= [];
    let PoverH1;
    const fixedDigit=7;
    let PsetHChangeFlag=false;
    let fireRuleApplied=false;
    
    if(workFlowId==8 && (Pmawp ==='' || PsetL === Pmawp)){
        console.log('In workFlowId 8 >>>>>>>> ',workFlowId, PsetL, PsetH, PsetL <= PsetH, PsetH <= PsetL * (1.06/1.03), PsetL * (1.06/1.03));
        if ((PsetL <= PsetH) && (PsetH <= PsetL * (1.06/1.03))){
            if(fieldName === 'ValvePset'){
                if(convertedPsetH < (2/0.03)){
                    PoverH=convertUnit(2, uoms.find(uom => uom.UnitKey === requiredPressureUOM), uoms.find(uom => uom.UnitKey === receivedUnits?.pressureUOM));
                    convertedPoverH=2;
                }else{
                    PoverH= 0.03 * PsetH;
                    convertedPoverH=0.03 * convertedPsetH;
                }
                
            }else{
            
                convertedPoverH= parseFloat(convertedPoverH?.toFixed(fixedDigit));
            }
            // if((convertedPsetL <= (4/0.21)) && (convertedPoverH< 3 || convertedPoverH > parseFloat((4-(convertedPsetH - convertedPsetL)).toFixed(fixedDigit)))){
            //         PoverLowLimit=3;
            //         PoverHighLimit=4;
            //         PoverMessageFlag=true;
            // }else if((convertedPsetL >= (4/0.21) && convertedPsetL < (3/0.10)) && (convertedPoverH< 3 || convertedPoverH > parseFloat(((0.21 * convertedPsetL)-(convertedPsetH - convertedPsetL)).toFixed(fixedDigit)))){
            //     PoverLowLimit=3;
            //     PoverHighLimit=((0.21 * convertedPsetL)-(convertedPsetH - convertedPsetL)).toFixed(2);
            //     PoverMessageFlag=true;
            // }else if(convertedPsetL >= (3/0.10) && (convertedPoverH< parseFloat((0.10 * convertedPsetH).toFixed(fixedDigit)) || convertedPoverH > parseFloat(((0.21 * convertedPsetL)-(convertedPsetH - convertedPsetL)).toFixed(fixedDigit)))){
            //     PoverLowLimit=(0.10 * convertedPsetH).toFixed(2);
            //     PoverHighLimit=((0.21 * convertedPsetL)-(convertedPsetH - convertedPsetL)).toFixed(2);
            //     PoverMessageFlag=true;
            // }
        }else if (PsetL > PsetH){
            PsetHLtPseLMessageFlag=true;
            PsetHMinValue=convertedPsetL;
        }else {
            PsetHMessageFlag=true;
            PsetHPercentage=110;
            PsetHTextValue='the lowest Set Pressure';
            PsetHlimitvalve=(PsetL * (1.06/1.03)).toFixed(2);
        }
    }else if(workFlowId==8 && PsetL < Pmawp){
        if ((PsetL <= PsetH) && (PsetH <= Pmawp * (1.06/1.03))){
            if(fieldName === 'ValvePset'){
                if(convertedPsetH < (2/0.03)){
                    PoverH=convertUnit(2, uoms.find(uom => uom.UnitKey === requiredPressureUOM), uoms.find(uom => uom.UnitKey === receivedUnits?.pressureUOM));
                    convertedPoverH=2;
                }else{
                    PoverH= 0.03 * PsetH;
                    convertedPoverH=0.03 * convertedPsetH;
                }
            }else{
                convertedPoverH= parseFloat(convertedPoverH?.toFixed(fixedDigit));
            }
        }else if (PsetL > PsetH){
            PsetHLtPseLMessageFlag=true;
            PsetHMinValue=convertedPsetL;
        }else {
            PsetHMessageFlag=true;
            PsetHTextValue='System MAWP';
            PsetHlimitvalve=(Pmawp * (1.06/1.03)).toFixed(2);
        }
    }else if(SizingBasis?.toLowerCase() === 'fire case' && [true, 'true'].includes(rowToValidate?.IsASMESection8)){
        // FRS Table10 cases 17?22 and 2026 Design Spec Part IV, notes 8?10.
        // High-set overpressure is calculated from the common relieving pressure.
        // A violated minimum produces an error; changing the calculated pressure
        // would make the high and low valves relieve at different pressures.
        const fireRule = evaluateFireMultiValveRule({
            IsMultivalve: true,
            IsASMESection8: true,
            SizingBasis: 'Fire Case',
            SetPressure: convertedPsetL,
            SystemMAWP: Pmawp === '' ? '' : convertedPmawp,
            OverPressure: convertedPoverL,
            HighSetPressure: convertedPsetH,
        });
        fireRuleApplied = true;
        if (!fireRule) {
            errors.push({ type: 'MultiValve Error', rowId,
                message: `In Selected valve ${rowToValidate?.ModelNumber}(row: ${rowId}), the lowest Set Pressure must be positive and must not exceed System MAWP.` });
        } else {
            convertedPoverH = fireRule.highSetOverPressure;
            PoverH = convertUnit(convertedPoverH, uoms.find(uom => uom.UnitKey === requiredPressureUOM), uoms.find(uom => uom.UnitKey === receivedUnits?.pressureUOM));
            ValvePover = PoverH;
            PoverLowLimit = fireRule.minHighSetOverPressure;
            PoverHighLimit = fireRule.maxHighSetOverPressure;
            PoverMessageFlag = comparePressures(convertedPoverH, PoverLowLimit) < 0 || comparePressures(convertedPoverH, PoverHighLimit) > 0;
            if (comparePressures(convertedPsetH, fireRule.minHighSetPressure) < 0) {
                PsetHLtPseLMessageFlag = true;
            } else if (!fireRule.highSetPressureValid) {
                PsetHMessageFlag = true;
                PsetHPercentage = 110;
                PsetHTextValue = fireRule.caseNumber <= 19 ? 'the lowest Set Pressure' : 'System MAWP';
                PsetHlimitvalve = convertUnit(fireRule.maxHighSetPressure, uoms.find(uom => uom.UnitKey === requiredPressureUOM), uoms.find(uom => uom.UnitKey === receivedUnits?.pressureUOM)).toFixed(7);
            }
            const maximumRelievingPressure = convertedPsetL + fireRule.maxOverPressure;
            if (comparePressures(convertedPsetH + convertedPoverH, maximumRelievingPressure) > 0) {
                PsetHPoverHValueCheckMessageFlag = true;
                PsetHPoverHValueCheckMessageContent = PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${maximumRelievingPressure.toFixed(3)} psig`);
            }
        }
    }else if(SizingBasis?.toLowerCase() === 'fire case'){
        // Preserve existing behavior for non-ASME/unspecified applications.
        // The numbered Section VIII cases apply only when that code is enabled.
        if(Pmawp ==='' || PsetL === Pmawp){
            if ((PsetL <= PsetH) && (PsetH <= PsetL * 1.10)){
                if(fieldName === 'ValvePset'){
                    PsetHChangeFlag=true;
                    PoverH=parseFloat((PsetL + PoverL - PsetH).toFixed(9));
                    convertedPoverH=parseFloat((convertedPsetL + convertedPoverL - convertedPsetH).toFixed(9));
                    
                }else{
                    convertedPoverH= parseFloat(convertedPoverH?.toFixed(fixedDigit));
                }
                if((convertedPsetL <= (4/0.21))){
                    if (convertedPoverH< 3 || convertedPoverH > parseFloat((4-(convertedPsetH - convertedPsetL)).toFixed(fixedDigit))){
                        PoverLowLimit=3;
                        PoverHighLimit=4-(convertedPsetH - convertedPsetL);
                        PoverMessageFlag=true;
                        if(fieldName === 'ValvePset'){
                            convertedPoverH= convertedPoverH< PoverLowLimit ? PoverLowLimit : convertedPoverH > PoverHighLimit ? PoverHighLimit : PoverLowLimit>PoverHighLimit ? PoverLowLimit : convertedPoverH;                      
                        }else if(fieldName === 'ValvePover' || fieldName === 'ValvePoverP'){
                            if(PoverLowLimit > PoverHighLimit){
                                PoverHighLimit= PoverLowLimit;
                            }
                        }
                    }
                }else if((convertedPsetL >= (4/0.21) && convertedPsetL < (3/0.10))){
                    if (convertedPoverH< 3 || convertedPoverH > parseFloat(((0.21 * convertedPsetL)-(convertedPsetH - convertedPsetL)).toFixed(fixedDigit))){
                        PoverLowLimit=3;
                        PoverHighLimit=parseFloat(((0.21 * convertedPsetL)-(convertedPsetH - convertedPsetL)).toFixed(7));
                        PoverMessageFlag=true;
                        if(fieldName === 'ValvePset'){
                            convertedPoverH= convertedPoverH< PoverLowLimit ? PoverLowLimit : convertedPoverH > PoverHighLimit ? PoverHighLimit : PoverLowLimit>PoverHighLimit ? PoverLowLimit : convertedPoverH;
                        }else if(fieldName === 'ValvePover' || fieldName === 'ValvePoverP'){
                            if(PoverLowLimit > PoverHighLimit){
                                PoverHighLimit= PoverLowLimit;
                            }
                        }
                    }
                }else if(convertedPsetL >= (3/0.10)){
                    if (convertedPoverH< parseFloat((0.10 * convertedPsetH).toFixed(fixedDigit)) || convertedPoverH > parseFloat(((0.21 * convertedPsetL)-(convertedPsetH - convertedPsetL)).toFixed(fixedDigit))){
                        PoverLowLimit=parseFloat((0.10 * convertedPsetH).toFixed(2));
                        PoverHighLimit=parseFloat(((0.21 * convertedPsetL)-(convertedPsetH - convertedPsetL)).toFixed(7));
                        PoverMessageFlag=true;
                        if(fieldName === 'ValvePset'){
                            convertedPoverH= convertedPoverH< PoverLowLimit ? PoverLowLimit : convertedPoverH > PoverHighLimit ? PoverHighLimit : PoverLowLimit>PoverHighLimit ? PoverLowLimit : convertedPoverH;
                        // }else if(fieldName === 'ValvePover' || fieldName === 'ValvePoverP'){
                        //     if(PoverLowLimit > PoverHighLimit){
                        //         PoverHighLimit= PoverLowLimit;
                        //     }
                        }
                    }
                }
            }else if (PsetL > PsetH){
                PsetHLtPseLMessageFlag=true;
                PsetHMinValue=convertedPsetL;
            }else {
                PsetHMessageFlag=true;
                PsetHPercentage=110;
                PsetHTextValue='the lowest Set Pressure';
                PsetHlimitvalve=(PsetL * 1.10).toFixed(7);
            }
            // const PsetHplusPoverH = Math.trunc(parseFloat((convertedPsetH + convertedPoverH).toFixed(9))) * 1000000000 / 1000000000;
            const PsetHplusPoverH = parseFloat((convertedPsetH + convertedPoverH).toFixed(9))
            // console.log(' >>>>>>>>>>>>>>>>>>>>>>> 22222222222 333333333333333 >>>>>>>>>>>>>>>>>>>>>>>>>>>>',{convertedPsetH, convertedPoverH, convertedPsetL,PsetHplusPoverH: convertedPsetH+convertedPoverH,PsetHplusPoverHLimit: 1.21 * convertedPsetL});
            if((convertedPsetL <= (4/0.21))){
                    
                    // if(PsetHplusPoverH > (Math.trunc(parseFloat((convertedPsetL + 4).toFixed(7)) * 1000) / 1000)){
                    if(PsetHplusPoverH > parseFloat((convertedPsetL + 4).toFixed(9))){
                        PsetHPoverHValueCheckMessageFlag=true;
                        // PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${convertedPsetL + 4} psig (Pset,L + 4 psig)`);
                        // PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${(Math.trunc(parseFloat((convertedPsetL + 4).toFixed(7)) * 1000) / 1000).toFixed(3)} psig (Pset,L + 4 psig)`);
                        PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${parseFloat((convertedPsetL + 4).toFixed(3))} psig (Pset,L + 4 psig)`);
                    }
            }else if((convertedPsetL > (4/0.21) && convertedPsetL < (3/0.10))){
                
                // if(PsetHplusPoverH > (Math.trunc(parseFloat((1.21 * convertedPsetL).toFixed(7)) * 1000) / 1000)){
                if(PsetHplusPoverH > parseFloat((1.21 * convertedPsetL).toFixed(9))){
                    PsetHPoverHValueCheckMessageFlag=true;
                    // PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${(1.21 * convertedPsetL).toFixed(4)} psig (1.21 * Pset,L)`);
                    // PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${(Math.trunc(parseFloat((1.21 * convertedPsetL).toFixed(7)) * 1000) / 1000).toFixed(3)} psig (1.21 * Pset,L)`);
                    PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${parseFloat((1.21 * convertedPsetL).toFixed(3))} psig (1.21 * Pset,L)`);
                }
            }else if(convertedPsetL >= (3/0.10)){
                // console.log(' >>>>>>>>>>>>>>>>>>>>>>> 333333333333333 >>>>>>>>>>>>>>>>>>>>>>>>>>>>',{convertedPsetH, convertedPoverH, convertedPsetL,PsetHplusPoverH: convertedPsetH+convertedPoverH,Pset121Limit: 1.21 * convertedPsetL});
                // if(PsetHplusPoverH > (Math.trunc(parseFloat((1.21 * convertedPsetL).toFixed(7)) * 1000) / 1000)){
                if(PsetHplusPoverH > parseFloat((1.21 * convertedPsetL).toFixed(9))){
                    
                    // PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${(Math.trunc(parseFloat((1.21 * convertedPsetL).toFixed(7)) * 1000) / 1000).toFixed(3)} psig (1.21 * Pset,L)`);
                    PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${(1.21 * convertedPsetL).toFixed(3)} psig (1.21 * Pset,L)`);
                    PsetHPoverHValueCheckMessageFlag=true;
                    // PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `1.21 * Pset,L (${(1.21 * convertedPsetL).toFixed(2)} psig)`);
                }
            }
            
        }else if(PsetL < Pmawp){
            // console.log(' >>>>>>>>>>>>>>>>>>>>>>> 222222222222222 >>>>>>>>>>>>>>>>>>>>>>>>>>>>',PsetL,Pmawp,PsetH,  Pmawp * 1.10,(PsetL <= PsetH) && (PsetH <= Pmawp * 1.10));
            if ((PsetL <= PsetH) && (PsetH <= Pmawp * 1.10)){
                if(fieldName === 'ValvePset'){
                    PsetHChangeFlag=true;
                    PoverH=parseFloat((PsetL + PoverL - PsetH).toFixed(9));
                    convertedPoverH=parseFloat((convertedPsetL + convertedPoverL - convertedPsetH).toFixed(9));
                    
                }else{
                    convertedPoverH= parseFloat(convertedPoverH?.toFixed(fixedDigit));
                }
                if((convertedPmawp <= (4/0.21) && convertedPsetL < (3/0.10)) && (convertedPoverH< 3 || convertedPoverH > parseFloat((4+ convertedPmawp - convertedPsetH).toFixed(fixedDigit)))){
                    PoverLowLimit=3;
                    PoverHighLimit=parseFloat((4+ convertedPmawp - convertedPsetH).toFixed(7));
                    PoverMessageFlag=true;
                    if(fieldName === 'ValvePset'){
                        convertedPoverH= convertedPoverH< PoverLowLimit ? PoverLowLimit : convertedPoverH > PoverHighLimit ? PoverHighLimit : PoverLowLimit>PoverHighLimit ? PoverLowLimit : convertedPoverH;
                    }else if(fieldName === 'ValvePover' || fieldName === 'ValvePoverP'){
                            if(PoverLowLimit > PoverHighLimit){
                                PoverHighLimit= PoverLowLimit;
                            }
                    }
                }else if((convertedPmawp > (4/0.21) && convertedPsetL < (3/0.10)) && (convertedPoverH< 3 || convertedPoverH > parseFloat(((0.21 * convertedPmawp)+ convertedPmawp - convertedPsetH).toFixed(fixedDigit)))){
                    PoverLowLimit=3;
                    PoverHighLimit=parseFloat(((0.21 * convertedPmawp)+ convertedPmawp - convertedPsetH).toFixed(7));
                    PoverMessageFlag=true;
                    if(fieldName === 'ValvePset'){
                        convertedPoverH= convertedPoverH< PoverLowLimit ? PoverLowLimit : convertedPoverH > PoverHighLimit ? PoverHighLimit : PoverLowLimit>PoverHighLimit ? PoverLowLimit : convertedPoverH;
                    }else if(fieldName === 'ValvePover' || fieldName === 'ValvePoverP'){
                            if(PoverLowLimit > PoverHighLimit){
                                PoverHighLimit= PoverLowLimit;
                            }
                    }
                }else if((convertedPmawp >= (4/0.21) && convertedPsetL >= (3/0.10)) && (convertedPoverH< parseFloat((0.10 * convertedPsetH).toFixed(fixedDigit)) || convertedPoverH > parseFloat(((0.21 * convertedPmawp)+ convertedPmawp - convertedPsetH).toFixed(fixedDigit)))){
                    PoverLowLimit=parseFloat((0.10 * convertedPsetH).toFixed(7));
                    PoverHighLimit=parseFloat(((0.21 * convertedPmawp)+ convertedPmawp - convertedPsetH).toFixed(7));
                    PoverMessageFlag=true;
                    if(fieldName === 'ValvePset'){
                        convertedPoverH= convertedPoverH< PoverLowLimit ? PoverLowLimit : convertedPoverH > PoverHighLimit ? PoverHighLimit : PoverLowLimit>PoverHighLimit ? PoverLowLimit : convertedPoverH;
                    }
                    // console.log(' >>>>>>>>>>>>>>>>>>>>>>> 333333333333333 >>>>>>>>>>>>>>>>>>>>>>>>>>>>',{PsetL, PsetH, Pmawp, convertedPmawp, convertedPsetH, convertedPoverH, PoverLowLimit, PoverHighLimit}); 
                    
                }
            }else if (PsetL > PsetH){
                PsetHLtPseLMessageFlag=true;
                PsetHMinValue=convertedPsetL;
            }else {
                PsetHMessageFlag=true;
                PsetHPercentage=110;
                PsetHTextValue='System MAWP';
                PsetHlimitvalve=(Pmawp * 1.10).toFixed(7);
            }
            // const PsetHplusPoverH = Math.trunc(parseFloat((convertedPsetH + convertedPoverH).toFixed(9))) * 1000000000 / 1000000000;
            const PsetHplusPoverH = parseFloat((convertedPsetH + convertedPoverH).toFixed(9))
            // console.log(' >>>>>>>>>>>>>>>>>>>>>>>  333333333333333 444444444444 >>>>>>>>>>>>>>>>>>>>>>>>>>>>',{convertedPsetH, convertedPoverH, convertedPsetL,PsetHplusPoverH: convertedPsetH+convertedPoverH,PsetHplusPoverHLimit: convertedPmawp + 4});
            if((convertedPmawp <= (4/0.21) && convertedPsetL < (3/0.10)) ){
                if(PsetHplusPoverH > parseFloat((convertedPmawp + 4).toFixed(9))){
                    PsetHPoverHValueCheckMessageFlag=true;
                    PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${parseFloat((convertedPmawp + 4).toFixed(3))} psig (MAWP + 4 psig)`);
                }
            }else if((convertedPmawp > (4/0.21) && convertedPsetL < (3/0.10))){
                // if(PsetHplusPoverH > (Math.trunc(parseFloat((1.21 * convertedPmawp).toFixed(7)) * 1000) / 1000)){
                if(PsetHplusPoverH > parseFloat((1.21 * convertedPmawp).toFixed(9))){
                    PsetHPoverHValueCheckMessageFlag=true;
                    // PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${(Math.trunc(parseFloat((1.21 * convertedPmawp).toFixed(7)) * 1000) / 1000).toFixed(3)} psig (1.21 * MAWP)`);
                    PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${parseFloat((1.21 * convertedPmawp).toFixed(3))} psig (1.21 * MAWP)`);
                }
            }else if((convertedPmawp >= (4/0.21) && convertedPsetL >= (3/0.10))){
                // if(PsetHplusPoverH > (Math.trunc(parseFloat((1.21 * convertedPmawp).toFixed(7)) * 1000) / 1000)){
                if(PsetHplusPoverH > parseFloat((1.21 * convertedPmawp).toFixed(9))){
                    PsetHPoverHValueCheckMessageFlag=true;
                    PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${parseFloat((1.21 * convertedPmawp).toFixed(3))} psig (1.21 * MAWP)`);
                }
            }
        }else{
            PsetHMessageFlag=true;
            PsetHPercentage=110;
            PsetHTextValue='System MAWP';
            PsetHlimitvalve=(Pmawp * 1.10).toFixed(2);
        }
    }else if(Pmawp ==='' || PsetL === Pmawp){
        if ((PsetL <= PsetH) && (PsetH <= PsetL * 1.05)){
            if(fieldName === 'ValvePset'){
                PoverH=parseFloat((PsetL + PoverL - PsetH).toFixed(9));
                convertedPoverH=parseFloat((convertedPsetL + convertedPoverL - convertedPsetH).toFixed(9));
                
            }else{
                convertedPoverH= parseFloat(convertedPoverH?.toFixed(fixedDigit));
            }
            
            if((convertedPsetL < (4/0.16))){
                if((convertedPoverH< 3 || convertedPoverH > parseFloat((4-(convertedPsetH - convertedPsetL)).toFixed(fixedDigit)))){
                    PoverLowLimit=3;
                    PoverHighLimit=4;
                    PoverMessageFlag=true;
                    if(fieldName === 'ValvePset'){
                        convertedPoverH= convertedPoverH< PoverLowLimit ? PoverLowLimit : convertedPoverH > PoverHighLimit ? PoverHighLimit : PoverLowLimit>PoverHighLimit ? PoverLowLimit : convertedPoverH;
                    }else if(fieldName === 'ValvePover' || fieldName === 'ValvePoverP'){
                            if(PoverLowLimit > PoverHighLimit){
                                PoverHighLimit= PoverLowLimit;
                            }
                    }
                }
                
                // if((convertedPsetH+convertedPoverH) > (convertedPsetL + 4)){
                //     PsetHPoverHValueCheckMessageFlag=true;
                //     PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${(Math.trunc((convertedPsetL + 4) * 1000) / 1000).toFixed(3)} psig (Pset,L + 4 psig)`);
                // }
            }else if((convertedPsetL >= (4/0.16) && convertedPsetL < (3/0.10))){
                if((convertedPoverH< 3 || convertedPoverH > parseFloat(((0.16 * convertedPsetL)-(convertedPsetH - convertedPsetL)).toFixed(fixedDigit)))){
                    PoverLowLimit=3;
                    PoverHighLimit=parseFloat(((0.16 * convertedPsetL)-(convertedPsetH - convertedPsetL)).toFixed(7));
                    PoverMessageFlag=true;
                    if(fieldName === 'ValvePset'){
                        convertedPoverH= convertedPoverH< PoverLowLimit ? PoverLowLimit : convertedPoverH > PoverHighLimit ? PoverHighLimit : PoverLowLimit>PoverHighLimit ? PoverLowLimit : convertedPoverH;
                    }else if(fieldName === 'ValvePover' || fieldName === 'ValvePoverP'){
                            if(PoverLowLimit > PoverHighLimit){
                                PoverHighLimit= PoverLowLimit;
                            }
                    }
                }
                // if((convertedPsetH+convertedPoverH) > (1.16 * convertedPsetL)){
                //     PsetHPoverHValueCheckMessageFlag=true;
                //     PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${(Math.trunc((1.16 * convertedPsetL) * 1000) / 1000).toFixed(3)} psig (1.16 * Pset,L)`);
                // }
            }else if(convertedPsetL >= (3/0.10)){
                if(convertedPoverH< parseFloat((0.10 * convertedPsetH).toFixed(fixedDigit)) || convertedPoverH > parseFloat(((0.16 * convertedPsetL)-(convertedPsetH - convertedPsetL)).toFixed(fixedDigit))){
                    PoverLowLimit=parseFloat((0.10 * convertedPsetH).toFixed(7));
                    PoverHighLimit=parseFloat(((0.16 * convertedPsetL)-(convertedPsetH - convertedPsetL)).toFixed(7));
                    PoverMessageFlag=true;
                    if(fieldName === 'ValvePset'){
                        convertedPoverH= convertedPoverH< PoverLowLimit ? PoverLowLimit : convertedPoverH > PoverHighLimit ? PoverHighLimit : PoverLowLimit>PoverHighLimit ? PoverLowLimit : convertedPoverH;
                    }
                }
                // if((convertedPsetH+convertedPoverH) > (1.16 * convertedPsetL)){
                //     PsetHPoverHValueCheckMessageFlag=true;
                //     PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${(Math.trunc((1.16 * convertedPsetL) * 1000) / 1000).toFixed(3)} psig (1.16 * Pset,L)`);
                // }
            }
        }else if (PsetL > PsetH){
                PsetHLtPseLMessageFlag=true;
                PsetHMinValue=convertedPsetL;
        }else {
            PsetHMessageFlag=true;
            PsetHPercentage=105;
            PsetHTextValue='the lowest Set Pressure';
            PsetHlimitvalve=(PsetL * 1.05).toFixed(7);
        }
        // const PsetHplusPoverH = Math.trunc(parseFloat((convertedPsetH + convertedPoverH).toFixed(9))) * 1000000000 / 1000000000;
        const PsetHplusPoverH = parseFloat((convertedPsetH + convertedPoverH).toFixed(9))
        // console.log(' >>>>>>>>>>>>>>>>>>>>>>> 22222222222 333333333333333 >>>>>>>>>>>>>>>>>>>>>>>>>>>>',{convertedPsetH, convertedPoverH, convertedPsetL,PsetHplusPoverH: convertedPsetH+convertedPoverH,PsetHplusPoverHLimit: (Math.trunc((convertedPsetL + 4) * 1000) / 1000).toFixed(3)});
        if((convertedPsetL < (4/0.16))){
                
                // if(PsetHplusPoverH > (Math.trunc(parseFloat((convertedPsetL + 4).toFixed(7)) * 1000) / 1000)){
                if(PsetHplusPoverH > parseFloat((convertedPsetL + 4).toFixed(9))){
                    PsetHPoverHValueCheckMessageFlag=true;
                    // PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${(Math.trunc(parseFloat((convertedPsetL + 4).toFixed(7)) * 1000) / 1000).toFixed(3)} psig (Pset,L + 4 psig)`);
                    PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${parseFloat((convertedPsetL + 4).toFixed(3))} psig (Pset,L + 4 psig)`);
                }
            }else if((convertedPsetL >= (4/0.16) && convertedPsetL < (3/0.10))){
                
                // if(PsetHplusPoverH > (Math.trunc(parseFloat((1.16 * convertedPsetL).toFixed(7)) * 1000) / 1000)){
                if(PsetHplusPoverH > parseFloat((1.16 * convertedPsetL).toFixed(9))){
                    PsetHPoverHValueCheckMessageFlag=true;
                    // PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${(Math.trunc(parseFloat((1.16 * convertedPsetL).toFixed(7)) * 1000) / 1000).toFixed(3)} psig (1.16 * Pset,L)`);
                    PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${parseFloat((1.16 * convertedPsetL).toFixed(3))} psig (1.16 * Pset,L)`);
                }
            }else if(convertedPsetL >= (3/0.10)){
                
                // if(PsetHplusPoverH > (Math.trunc(parseFloat((1.16 * convertedPsetL).toFixed(7)) * 1000) / 1000)){
                if(PsetHplusPoverH > parseFloat((1.16 * convertedPsetL).toFixed(9))){
                    PsetHPoverHValueCheckMessageFlag=true;
                    // PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${(Math.trunc(parseFloat((1.16 * convertedPsetL).toFixed(7)) * 1000) / 1000).toFixed(3)} psig (1.16 * Pset,L)`);
                    PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${parseFloat((1.16 * convertedPsetL).toFixed(3))} psig (1.16 * Pset,L)`);
                }
            }
    }else if(PsetL < Pmawp){
        // console.log(' >>>>>>>>>>>>>>>>>>>>>>>  333333333333333 >>>>>>>>>>>>>>>>>>>>>>>>>>>>',PsetL,Pmawp,PsetH,  Pmawp * 1.05,(PsetL <= PsetH) && (PsetH <= Pmawp * 1.05)); 
        if ((PsetL <= PsetH) && (PsetH <= Pmawp * 1.05)){
            if(fieldName === 'ValvePset'){
                PoverH=parseFloat((PsetL + PoverL - PsetH).toFixed(9));
                convertedPoverH=parseFloat((convertedPsetL + convertedPoverL - convertedPsetH).toFixed(9));
                
            }else{
                convertedPoverH= parseFloat(convertedPoverH?.toFixed(fixedDigit));
            }
            if((convertedPmawp < (4/0.16) && convertedPsetL < (3/0.10))){
                if (convertedPoverH< 3 || convertedPoverH > parseFloat((4+ convertedPmawp - convertedPsetH).toFixed(fixedDigit))){
                    PoverLowLimit=3;
                    PoverHighLimit=parseFloat((4+ convertedPmawp - convertedPsetH).toFixed(7));
                    PoverMessageFlag=true;
                    if(fieldName === 'ValvePset'){
                        convertedPoverH= convertedPoverH< PoverLowLimit ? PoverLowLimit : convertedPoverH > PoverHighLimit ? PoverHighLimit : PoverLowLimit>PoverHighLimit ? PoverLowLimit : convertedPoverH;
                    }else if(fieldName === 'ValvePover' || fieldName === 'ValvePoverP'){
                            if(PoverLowLimit > PoverHighLimit){
                                PoverHighLimit= PoverLowLimit;
                            }
                    }
                }
                
            }else if((convertedPmawp >= (4/0.16) && convertedPsetL < (3/0.10))){
                if (convertedPoverH< 3 || convertedPoverH > parseFloat(((0.16 * convertedPmawp)+ convertedPmawp - convertedPsetH).toFixed(fixedDigit))){
                    PoverLowLimit=3;
                    PoverHighLimit=parseFloat(((0.16 * convertedPmawp)+ convertedPmawp - convertedPsetH).toFixed(7));
                    PoverMessageFlag=true;
                    if(fieldName === 'ValvePset'){
                        convertedPoverH= convertedPoverH< PoverLowLimit ? PoverLowLimit : convertedPoverH > PoverHighLimit ? PoverHighLimit : PoverLowLimit>PoverHighLimit ? PoverLowLimit : convertedPoverH;
                    }else if(fieldName === 'ValvePover' || fieldName === 'ValvePoverP'){
                            if(PoverLowLimit > PoverHighLimit){
                                PoverHighLimit= PoverLowLimit;
                            }
                    }
                }
                
            }else if((convertedPmawp >= (4/0.16) && convertedPsetL >= (3/0.10))){
                if (convertedPoverH< parseFloat((0.10 * convertedPsetH).toFixed(fixedDigit)) || convertedPoverH > parseFloat(((0.16 * convertedPmawp)+ convertedPmawp - convertedPsetH).toFixed(fixedDigit))){
                    PoverLowLimit=parseFloat((0.10 * convertedPsetH).toFixed(7));
                    PoverHighLimit=parseFloat(((0.16 * convertedPmawp)+ convertedPmawp - convertedPsetH).toFixed(7));
                    PoverMessageFlag=true;
                    if(fieldName === 'ValvePset'){
                        convertedPoverH= convertedPoverH< PoverLowLimit ? PoverLowLimit : convertedPoverH > PoverHighLimit ? PoverHighLimit : PoverLowLimit>PoverHighLimit ? PoverLowLimit : convertedPoverH;
                    }
                }
                
            }
        }else if (PsetL > PsetH){
                PsetHLtPseLMessageFlag=true;
                PsetHMinValue=convertedPsetL;    
        }else {
            PsetHMessageFlag=true;
            PsetHPercentage=105;
            PsetHTextValue='System MAWP';
            PsetHlimitvalve=(Pmawp * 1.05).toFixed(2);
        }
        // const PsetHplusPoverH = Math.trunc(parseFloat((convertedPsetH + convertedPoverH).toFixed(9))) * 1000000000 / 1000000000;
        const PsetHplusPoverH = parseFloat((convertedPsetH + convertedPoverH).toFixed(9))
        // console.log(' >>>>>>>>>>>>>>>>>>>>>>>  444444444444 >>>>>>>>>>>>>>>>>>>>>>>>>>>>',PsetHplusPoverH,convertedPsetH,convertedPoverH,convertedPsetH + convertedPoverH,parseFloat((convertedPsetH + convertedPoverH).toFixed(9)),Math.trunc(parseFloat((convertedPsetH + convertedPoverH).toFixed(9))) * 1000000000 / 1000000000);
        if((convertedPmawp < (4/0.16) && convertedPsetL < (3/0.10))){
            // console.log(' >>>>>>>>>>>>>>>>>>>>>>>  555555555555555 >>>>>>>>>>>>>>>>>>>>>>>>>>>>',{convertedPsetH, convertedPoverH, convertedPsetL,PsetHplusPoverH,PsetHplusPoverHLimit: Math.trunc(parseFloat((convertedPmawp + 4).toFixed(7)) * 1000) / 1000,checkflag:PsetHplusPoverH > (Math.trunc(parseFloat((convertedPmawp + 4).toFixed(7)) * 1000) / 1000)});
            // if(PsetHplusPoverH > (Math.trunc(parseFloat((convertedPmawp + 4).toFixed(7)) * 1000) / 1000)){
            if(PsetHplusPoverH > parseFloat((convertedPmawp + 4).toFixed(9))){
                PsetHPoverHValueCheckMessageFlag=true;
                // PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${(Math.trunc(parseFloat((convertedPmawp + 4).toFixed(7)) * 1000) / 1000).toFixed(3)} psig (MAWP + 4 psig)`);
                PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${parseFloat((convertedPmawp + 4).toFixed(3))} psig (MAWP + 4 psig)`);
                // console.log(' >>>>>>>>>>>>>>>>>>>>>>>  66666666666666 >>>>>>>>>>>>>>>>>>>>>>>>>>>>',PsetHPoverHValueCheckMessageContent);
            }
        }else if((convertedPmawp >= (4/0.16) && convertedPsetL < (3/0.10))){
            
            // `if(PsetHplusPoverH > (Math.trunc(parseFloat((1.16 * convertedPmawp).toFixed(7)) * 1000) / 1000)){`
            if(PsetHplusPoverH > parseFloat((1.16 * convertedPmawp).toFixed(9))){
                PsetHPoverHValueCheckMessageFlag=true;
                // PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${(Math.trunc(parseFloat((1.16 * convertedPmawp).toFixed(7)) * 1000) / 1000).toFixed(3)} psig (1.16 * MAWP)`);
                PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${parseFloat((1.16 * convertedPmawp).toFixed(3))} psig (1.16 * MAWP)`);
            }
        }else if((convertedPmawp >= (4/0.16) && convertedPsetL >= (3/0.10))){
            
            // if(PsetHplusPoverH > (Math.trunc(parseFloat((1.16 * convertedPmawp).toFixed(7)) * 1000) / 1000)){
            if(PsetHplusPoverH > parseFloat((1.16 * convertedPmawp).toFixed(9))){
                PsetHPoverHValueCheckMessageFlag=true;
                // PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${(Math.trunc(parseFloat((1.16 * convertedPmawp).toFixed(7)) * 1000) / 1000).toFixed(3)} psig (1.16 * MAWP)`);
                PsetHPoverHValueCheckMessageContent=PsetHPoverHValueCheckMessageContent.replace('<<$1>>', `${parseFloat((1.16 * convertedPmawp).toFixed(3))} psig (1.16 * MAWP)`);
            }
        }
    }else{
        PsetHMessageFlag=true;
        PsetHPercentage=105;
        PsetHTextValue='System MAWP';
        PsetHlimitvalve=(Pmawp * 1.05).toFixed(7);
    }
    // console.log(' >>>>>>>>>>>>>>>. 555555555555555 >>>>>>>>>> ',errors)
    if(PsetHChangeFlag && PoverMessageFlag){
        // convertedPoverH= convertedPoverH< PoverLowLimit ? PoverLowLimit : convertedPoverH > PoverHighLimit ? PoverHighLimit : PoverLowLimit;
        PoverH= convertUnit(convertedPoverH, uoms.find(uom => uom.UnitKey === requiredPressureUOM), uoms.find(uom => uom.UnitKey === receivedUnits?.pressureUOM));
        ValvePover= PoverH;
        PoverHP=(convertedPoverH / convertedPsetH) * 100;
        ValvePoverP= PoverHP;
        PoverMessageFlag=false;
        // console.log(' >>>>>>>>>>>>>>>>>>>>>>> 444444444444 >>>>>>>>>>>>>>>>>>>>>>>>>>>>',{PsetL, PsetH, Pmawp, convertedPmawp, convertedPsetH, convertedPoverH, PoverLowLimit, PoverHighLimit}); 
    } 
    if(!fireRuleApplied && PoverLowLimit >= PoverHighLimit && convertedPoverH == PoverLowLimit && PoverMessageFlag) {
        PoverMessageFlag=false;
    }
    if(PsetHLtPseLMessageFlag){
        errors.push({ type:'MultiValve Error', rowId, message: PsetHMessageContent2.replace('<<$1>>',convertedPsetL.toFixed(3)).replace('<<ModelNumber>>',rowToValidate?.ModelNumber).replace('<<RowNumber>>',rowId) });
    }
    
    if(PoverMessageFlag){
        
        if(PoverLowLimit == PoverHighLimit){
            errors.push({ type:'MultiValve Error', rowId, message: PoverMinTHMessageContent1.replace('<<$1>>',PoverLowLimit).replace('<<ModelNumber>>',rowToValidate?.ModelNumber).replace('<<RowNumber>>',rowId) });
            // errors.push({ type:'MultiValve Error', rowId, message: PoverMinTHMessageContent2.replace('<<$1>>',convertedPsetH).replace('<<ModelNumber>>',rowToValidate?.ModelNumber).replace('<<RowNumber>>',rowId) });
        }else{
            errors.push({ type:'MultiValve Error', rowId, message: PoverMessageContent.replace('<<$1>>',PoverLowLimit).replace('<<$2>>',PoverHighLimit.toFixed(3)).replace('<<ModelNumber>>',rowToValidate?.ModelNumber).replace('<<RowNumber>>',rowId) });
        }
        
    }
    if(PsetHMessageFlag){
        if(workFlowId==8){
            errors.push({ type:'MultiValve Error', rowId, message: PsetHSecIMessageContent.replace('<<$1>>',PsetHlimitvalve).replace('<<$2>>',receivedUnits?.pressureUOM).replace('<<ModelNumber>>',rowToValidate?.ModelNumber).replace('<<RowNumber>>',rowId) });
        }else{
            errors.push({ type:'MultiValve Error', rowId, message: PsetHMessageContent.replace('<<$1>>',PsetHPercentage).replace('<<$2>>',PsetHTextValue).replace('<<$3>>',PsetHlimitvalve).replace('<<ModelNumber>>',rowToValidate?.ModelNumber).replace('<<RowNumber>>',rowId) });
        }
    }
    // console.log(' >>>>>>>>>>>>>>>>>>>>>>> 8888888888888888 >>>>>>>>>>>>>>>>>>>>>>>>>>>>',PsetHPoverHValueCheckMessageFlag);
    if(PsetHPoverHValueCheckMessageFlag){
        errors.push({ type:'MultiValve Error', rowId, message: PsetHPoverHValueCheckMessageContent.replace('<<ModelNumber>>',rowToValidate?.ModelNumber).replace('<<RowNumber>>',rowId) });
    }
    
    if(fieldName === 'ValvePset' || fireRuleApplied){
        ValvePoverP = (PoverH / PsetH) * 100;
        PoverPH= ValvePoverP;
    }
    PoverPH= isNaN(PoverPH) ? 0 : PoverPH;
    // console.log(' >>>>>>>>>>>>>>>>>>>>>>> 666666666666666666 >>>>>>>>>>>>>>>>>>>>>>>>>>>>',{PsetL, PsetH, PoverL, PoverH,PoverPH, ValvePoverP,ValvePover});
    let localUpdatedRows = selectedRows?.map((row,index) => {
        if(row?.rowId === rowId){
            const returnValue =  ReCalculateFlowCapacityforSelectedValve(row, {PsetH, PoverH, PoverPH},{PsetL,PoverL},uoms,errors);
            return returnValue;
            
        }else{
            return row;
        }
    }) ?? [];
    // console.log(' >>>>>>>>>>>>>>>>>>>>>>> 777777777777777777777777 >>>>>>>>>>>>>>>>>>>>>>>>>>>>',{localUpdatedRows});
    const UpdatedSelectedValvesData=await getMultiValveSelectionCalculations({workFlowId, valveData: localUpdatedRows},true);
    
    let ProceedButtonEnableFlag=UpdatedSelectedValvesData?.ProceedButtonEnableFlag;
    
    if(error?.length > 0){
        // console.log(' >>>>>>888888888888888888 >>>>>>> ',rowId,error,ProceedButtonEnableFlag)
         error = error.filter(e => e?.rowId != rowId );
        //  console.log(' >>>>>>999999999999999 >>>>>>> ',rowId,error,ProceedButtonEnableFlag)
    }
    
    if(errors?.length>0){
        ProceedButtonEnableFlag=false;
        const prevMultiValveErrors=errors?.filter(e => e.type === 'MultiValve Error');
        // console.log(' >>>>>>101010101010 >>>>>>> ',rowId,prevMultiValveErrors)
        const prevOtherErrors=errors?.filter(e => e.type !== 'MultiValve Error');
        error=[...prevMultiValveErrors,...error,...prevOtherErrors];
    }
    return {...UpdatedSelectedValvesData,error,ProceedButtonEnableFlag };
    // return {...UpdatedSelectedValvesData,error: errors.length > 0 ? [...errors,...error] : [...error],ProceedButtonEnableFlag };
    // return {status: "success", message: "Validation dev in progress."}
}

module.exports = {
    getMultiValveSectionDetails,
    getMultiValveSelectionCalculations,
    deleteMultiValveRow,
    validateMultiValveSelectionData
}
