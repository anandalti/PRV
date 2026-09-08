const { pool } = require("../db/pgsqldb");
const { extractNumericFromUom } = require("../utils/helper");
const API521FlowRateReq = require("../models/API521FlowRateReq");
const API2000FlowRateReq = require("../models/API2000FlowRateReq");
const API2000Results = require("../models/API2000Results");
const API2000TankDataAPI521Fire = require("../models/API2000TankDataAPI521Fire");
const GenericValveSizing = require("../models/GenericValveSizing");
const SelectedValve = require("../models/SelectedValve");
const FlowCapacity = require("../models/FlowCapacity");
const FluidDetails = require("../models/FluidDetails");
const PressureDetails = require("../models/PressureDetails");
const SizingDetails = require("../models/SizingDetails");
const SystemDetails = require("../models/SystemDetails");
const TemperatureDetails = require("../models/TemperatureDetails");
const SizingFieldProperties = require("../models/SizingFieldProperties");

const saveRecordUsingSP = async (data,saveSelectedValveFlag) => {
    const SizingModelData= {...data, ValveType:data?.SizingValveType,ErrorWarnings: data?.error};
    // console.log(SizingModelData)
    let SizingData= new SizingDetails(SizingModelData);
    let FluidData= new FluidDetails(data);
    let PressureData= new PressureDetails(data);
    let TemperatureData= new TemperatureDetails(data);
    let FlowCapacityData= new FlowCapacity(data);
    let SystemDetailsData= new SystemDetails({...data,
        IsBoilingRangeLT150F: data?.IsSingleORMultiCompSys ? data?.IsSingleORMultiCompSys=='MultiComponentSystem' ? (data?.IsBoilingRangeLT150FYesNo ? data?.IsBoilingRangeLT150FYesNo == 'bryesradio' : data?.YesNoDetermine=='yesradio') : null : null,
        FarFromCriticalPoint: data?.IsSingleORMultiCompSys ? (data?.IsSingleORMultiCompSys=='SingleComponentSystem' || data?.WorkFlowId == 20)? data?.YesNoDetermine : null:null,
        IsSingleORMultiCompSys: data?.IsSingleORMultiCompSys ? data?.IsSingleORMultiCompSys==='SingleComponentSystem' : null,
    });
    let API521FlowRateData= new API521FlowRateReq(data);
    let API2000FlowRateData= new API2000FlowRateReq(data);
    let API2000ResultsData= new API2000Results(data);
    let API2000TankDataAPI521FireData= new API2000TankDataAPI521Fire({...data,
            LengthEndToEnd_lt:data?.WorkFlowId===12? data?.TankShape==='Cylindrical' && data?.horizontalvertical==='Horizontal' && data?.EndsGroup=='FlatEnds'?data?.LengthEndToEnd_ltip : data?.LengthEndToEnd_lt :((data?.TankShape == 'Rectangular') || (data?.TankShape == 'Cylindrical' && data?.EndsGroup == 'FlatEnds' && data?.IsHorizontalOrientation == 'Horizontal'))? data?.LengthEndToEnd_ltin : data?.LengthEndToEnd_lt,
            IsHorizontalOrientation:data?.WorkFlowId===12?data?.horizontalvertical==='Vertical'?false:true:data?.IsHorizontalOrientation==='Vertical'?false:true,
            Ends: data?.WorkFlowId===12?data?.EndsGroup:data?.EndsGroup ?? data?.Ends,
            IsLtOrLs:data?.FireSizingMethod==='Wetted' && data?.TankShape==='Cylindrical' ? true:false,
        });
    let GenericValveSizingData= new GenericValveSizing(data);
    // let SelectedValveData= new SelectedValve({...data, SizeOrOrifice: data?.NewOrifice ?? data?.SizeOrOrifice,ValveType:data.VPValveType,ValveTypeDesc:data?.ValveType, ReResponse:  data?.ReResponse ? data?.ReResponse : (data?.SelectedValve?.ReResponse ?? data?.SelectedValve?.ReResponse_v)});
    // console.log('Selected Valves >>>>>>>>>>>>>. ', data?.SelectedValve?.length);
    let SelectedValveData= saveSelectedValveFlag && data?.SelectedValve?.length>0 ? 
        data?.SelectedValve?.map(val=>  {  
            return new SelectedValve(
                {
                    ...data, 
                    ...val,
                    SizingId: data?.Id,
                    ValveId: val.ValveId,
                    Brand: val.Brand,
                    ModelNumber: val.ModelNumber,
                    SizeOrOrifice: val?.NewOrifice ?? val?.SizeOrOrifice,
                    ValveType:val.VPValveType,
                    ValveTypeDesc:val?.ValveType, 
                    SetPressure: val.Pset,
                    OverPressurePer: val.PoverP,
                    OverPressure: val.Pover,
                    PressureFlowUOM: data.PressureUOM,
                    AreaUOM: data.OrificeAreaUOM,
                    FlowCapacity: val?.Wreq ?? val?.WreqV ?? val?.Vreq ?? val?.Qreq,
                    ReqOrificeArea: extractNumericFromUom(val?.Areq, data?.OrificeAreaUOM),
                    SelectedValve: {...val},
                    ReResponse:  val?.ReResponse ?? val?.ReResponse_v
                }) 
            })
        : [];
        // console.log(SelectedValveData?.length)
    let SizingFieldPropertiesData= new SizingFieldProperties(data);

    SizingFieldPropertiesData= Object.fromEntries(Object.entries(SizingFieldPropertiesData).filter(([_, v]) => v !== undefined && v !== '' && v !== null));
    SizingData= Object.fromEntries(Object.entries(SizingData).filter(([_, v]) => v !== undefined && v !== '' && v !== null));
    FluidData= Object.fromEntries(Object.entries(FluidData).filter(([_, v]) => v !== undefined && v !== '' && v !== null));
    PressureData= Object.fromEntries(Object.entries(PressureData).filter(([_, v]) => v !== undefined && v !== '' && v !== null));
    TemperatureData= Object.fromEntries(Object.entries(TemperatureData).filter(([_, v]) => v !== undefined && v !== '' && v !== null));
    FlowCapacityData= Object.fromEntries(Object.entries(FlowCapacityData).filter(([_, v]) => v !== undefined && v !== '' && v !== null));
    SystemDetailsData= Object.fromEntries(Object.entries(SystemDetailsData).filter(([_, v]) => v !== undefined && v !== '' && v !== null));
    API521FlowRateData= Object.fromEntries(Object.entries(API521FlowRateData).filter(([_, v]) => v !== undefined && v !== '' && v !== null));
    API2000FlowRateData= Object.fromEntries(Object.entries(API2000FlowRateData).filter(([_, v]) => v !== undefined && v !== '' && v !== null));
    API2000ResultsData= Object.fromEntries(Object.entries(API2000ResultsData).filter(([_, v]) => v !== undefined && v !== '' && v !== null));
    API2000TankDataAPI521FireData= Object.fromEntries(Object.entries(API2000TankDataAPI521FireData).filter(([_, v]) => v !== undefined && v !== '' && v !== null));
    GenericValveSizingData= Object.fromEntries(Object.entries(GenericValveSizingData).filter(([_, v]) => v !== undefined && v !== '' && v !== null));
    SelectedValveData= SelectedValveData?.map (val => Object.fromEntries(Object.entries(val).filter(([_, v]) => v !== undefined && v !== '' && v !== null)));

    const SizingDetails_IN={
        "SizingDetails":[SizingData],
        "FluidDetails":[FluidData],
        "SystemDetails":[SystemDetailsData],
        "PressureDetails":[PressureData],
        "TemperatureDetails":[TemperatureData],
        "FlowCapacity":[FlowCapacityData],
        "API521FlowRateReq":[API521FlowRateData],
        "API2000FlowRateReq":[API2000FlowRateData],
        "API2000Results":[API2000ResultsData],
        "API2000TankDataAPI521Fire":[API2000TankDataAPI521FireData],
        "GenericValveSizing":[GenericValveSizingData],
        "SelectedValve":[...SelectedValveData],
        "SizingFieldProperties":[SizingFieldPropertiesData]
    };
        
    // console.log('API2000TankDataAPI521FireData 11111>>>>>>>>>>>>>. ', SizingDetails_IN?.SelectedValve);
    let output=await pool.query(`CALL public."PROC_SaveSizing"($1,$2,$3)`, [SizingDetails_IN,'',{}]);
    // console.log(' 222222 >>>>>>>>>>>>>. ', output);
    const message=output?.rows[0]?.Message_OUT;
    let sizingData=output?.rows[0]?.SizingData_OUT;
    const localsizingObj=sizingData[0];
    // console.log('localsizingObj >>>>>>>>>>>>>. ', data?.IsMultivalve,data?.SelectedValve?.length,sizingData);
    sizingData=[{
        ...localsizingObj,
        multiValveSelectionDisplayFlag: data?.IsMultivalve && data?.SelectedValve?.length > 1 ? true : false,
    }];
    // console.log(' 33333 >>>>>>>>>>>>>. ', message, sizingData);

    return {message, sizingData,ProceedButtonEnableFlag:false};
}

const saveWorkflowRecordUsingSP = async (req, res) => {

    const data = req.body;
    
    try {
       const {message, sizingData, ProceedButtonEnableFlag} = await saveRecordUsingSP(data,true);
        

        res.status(200).json({
            success: true,
            message,
            sizingData,
            ProceedButtonEnableFlag
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error executing stored procedure',
        });
    }
}

module.exports = {
    saveWorkflowRecordUsingSP,
    saveRecordUsingSP
};
