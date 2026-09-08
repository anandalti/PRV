const fs = require('fs');
const path = require('path');
const { CalcSaturatedTemperture, CalcSaturatedTempertureKsc } = require("./CalculateSaturatedTemperature");
const { SteamISOCalculations } = require('./fieldCalculations/ISO4126_Calculations');
const { CalculateTup, Calculate_14_ReqFlowCapacity, Calculate_15_ReqFlowCapacity, checkP1_CP_T_CT, Calculate_17_Inlet_SpVolMix, Calculate_18_Non_Flashing_Wreq, Calculate_21_ReqFlowCapacity } = require('./fieldCalculations/CalculateWorkflowFunctions');
const { CalculateAreaMethods } = require('./fieldCalculations/SurfaceAreaCalculator');
const { CalculatePressureAPI2000 } = require('./api2000popup/CalculatePressureAPI2000');
// const { i } = require('mathjs');

let _fieldApiActionsCache = null;

const  CheckRequiredApiAction=async (payload,  workflowId=null)=>{
    try {
        const filePath = path.join(__dirname, `../data/workflowSectionFields/`);
        if (!_fieldApiActionsCache) {
            _fieldApiActionsCache = JSON.parse(fs.readFileSync(`${filePath}FieldApiActions.json`, 'utf8'));
        }
        const apiActions=_fieldApiActionsCache;
        const currentField=payload?.currentField;
        const currentFieldName=currentField?.FieldName;
        let apiAction;
        if(currentFieldName==='IsMultivalve'){
            if(workflowId==9){
                const worflowSection=JSON.parse(fs.readFileSync(`${filePath}workflowSections.json`, 'utf8'));
                const localSectionId = worflowSection?.find(section => section?.WorkflowId === workflowId && section?.SectionName === 'temperatureProperties')?.SectionId;
                const sectionFields=JSON.parse(fs.readFileSync(`${filePath}SectionFields.json`, 'utf8'));
                const localFieldId=sectionFields?.find(field => field?.SectionId === localSectionId && field?.FieldName === 'Relieving')?.FieldId;
                // console.log('localFieldId >>>>>>>>>>>>>>',localSectionId,localFieldId)
                apiAction=apiActions?.find(action => action?.FieldId===localFieldId);
            }
        }else{
            apiAction=apiActions?.find(action => action.Id===currentField?.actionId && action?.FieldId===currentField?.FieldId);
        }
        
        // console.log('apiAction >>>>>>>>>>>>>>',payload?.currentField,apiAction,currentField?.actionId,currentField?.FieldId)
        if(apiAction!==undefined){
            if(apiAction?.Symbol==='Exec_API' || apiAction?.Symbol==='API_FUNCTION_CALL'){
                const localinputs={...payload?.inputs,...currentField};
                if(apiAction.Url==='/calculateSaturatedSteam'){
                    if(localinputs?.workflowId==8){
                        const data = await CalcSaturatedTempertureKsc(localinputs);
                        return data;
                    }else{
                        const data =  await CalcSaturatedTemperture(localinputs);
                        // console.log('data >>>>>>>>>>>>>>',data)
                        return data;
                    }
                }else if(apiAction.Url==='/calculations/iso4126'){
                    const selectedUnits={AtmPressureUOM:localinputs['AtmPressureUOM'] ?? "abspressure.psia",PressureUOM:localinputs['PressureUOM'] ?? "pressure.psig",TemperatureUOM:localinputs['TemperatureUOM'] ?? "temp.degF"}
                    return await SteamISOCalculations({...localinputs,selectedUnits});
                }else if(apiAction.Url==='/calculations/14/flowCapacity'){
                    // console.log(localinputs)
                    return await Calculate_14_ReqFlowCapacity(localinputs);
                }else if(apiAction.Url==='/calculations/15/flowCapacity'){
                    // console.log(localinputs)
                    return await Calculate_15_ReqFlowCapacity(localinputs);
                }else if(apiAction.Url==='/calculations/chkcriticalpressuretemperature'){
                    const selectedUnits={AtmPressureUOM:localinputs['AtmPressureUOM'] ?? "abspressure.psia",PressureUOM:localinputs['PressureUOM'] ?? "pressure.psig",TemperatureUOM:localinputs['TemperatureUOM'] ?? "temp.degF"}
                    return await checkP1_CP_T_CT({...localinputs,selectedUnits});
                }else if(apiAction.Url==='/calculations/17/calcSpecVolMix'){
                    // console.log(localinputs)
                    const selectedUnits={SpecificVolumeUOM:localinputs['SpecificVolumeUOM']};
                    return await Calculate_17_Inlet_SpVolMix({...localinputs,selectedUnits});
                }else if(apiAction.Url==='/calculations/18/flowCapacity'){

                    return await Calculate_18_Non_Flashing_Wreq(localinputs);
                }else if(apiAction.Url==='/calculations/21/flowCapacity'){
                    const selectedUnits= {
                            "FlowCapacityWvUOM": localinputs['FlowCapacityWvUOM'] ?? "massflow.lbday",
                            "FlowCapacityLiqUOM": localinputs['FlowCapacityLiqUOM'] ?? "massflow.lbday",
                            "FlowCapacityLiq2UOM": localinputs['FlowCapacityLiq2UOM'] ?? "massflow.lbday",
                            "FlowCapacityUOM": localinputs['FlowCapacityUOM'] ?? "massflow.lbday",
                            "PressureUOM": localinputs['PressureUOM'] ?? "pressure.psig",
                            "TemperatureUOM": localinputs['TemperatureUOM'] ?? "temp.degF",
                            "AtmPressureUOM": localinputs['AtmPressureUOM'] ?? "abspressure.psia"
                        }
                    return  await Calculate_21_ReqFlowCapacity({...localinputs,selectedUnits});
                }else if(apiAction.Url==='/calculations/tup'){
                    const selectedUnits={AtmPressureUOM:localinputs['AtmPressureUOM'] ?? "abspressure.psia",PressureUOM:localinputs['PressureUOM'] ?? "pressure.psig",TemperatureUOM:localinputs['TemperatureUOM'] ?? "temp.degF"}
                   return await CalculateTup({...localinputs,selectedUnits,apiCallingField:currentField?.FieldName}); 
                }else if(apiAction.Url==='/calculations/popup/firesize/surfacearea'){
                    const selectedUnits={
                                    LengthUOM: localinputs['LengthUOM'],
                                    Diameter_d_UOM: localinputs['Diameter_d_UOM']!==undefined && localinputs['Diameter_d_UOM']!==null && localinputs['Diameter_d_UOM']!=="" ? localinputs['Diameter_d_UOM'] : localinputs['LengthUOM'],
                                    Elevation_H_UOM: localinputs['Elevation_H_UOM']!==undefined && localinputs['Elevation_H_UOM']!==null && localinputs['Elevation_H_UOM']!=="" ? localinputs['Elevation_H_UOM'] : localinputs['LengthUOM'],
                                    LiquidDepth_f_UOM: localinputs['LiquidDepth_f_UOM']!==undefined && localinputs['LiquidDepth_f_UOM']!==null && localinputs['LiquidDepth_f_UOM']!=="" ? localinputs['LiquidDepth_f_UOM'] : localinputs['LengthUOM'],
                                    Height_h_UOM: localinputs['Height_h_UOM']!==undefined && localinputs['Height_h_UOM']!==null && localinputs['Height_h_UOM']!=="" ? localinputs['Height_h_UOM'] : localinputs['LengthUOM'],
                                    LengthEndToEnd_lt_UOM: localinputs['LengthEndToEnd_lt_UOM']!==undefined && localinputs['LengthEndToEnd_lt_UOM']!==null && localinputs['LengthEndToEnd_lt_UOM']!=="" ? localinputs['LengthEndToEnd_lt_UOM'] : localinputs['LengthUOM'],
                                    SurfaceAreaUOM: localinputs['SurfaceAreaUOM']!=undefined && localinputs['SurfaceAreaUOM']!=null && localinputs['SurfaceAreaUOM']!=="" ? localinputs['SurfaceAreaUOM'] : localinputs['AreaUOM'],
                                    AreaUOM: localinputs['AreaUOM'],
                                    LatentHeatOfVaporUOM: localinputs['LatentHeatOfVaporUOM'] ,
                                    RequiredPressureFlowUOM: localinputs['RequiredPressureFlowUOM']!==undefined && localinputs['RequiredPressureFlowUOM']!==null && localinputs['RequiredPressureFlowUOM']!=="" ? localinputs['RequiredPressureFlowUOM'] : localinputs['FlowCapacityUOM'],
                                    AddCapacityForPressureUOM: localinputs['AddCapacityForPressureUOM']!==undefined && localinputs['AddCapacityForPressureUOM']!==null && localinputs['AddCapacityForPressureUOM']!=="" ? localinputs['AddCapacityForPressureUOM'] : localinputs['FlowCapacityUOM'],
                                    PressureUOM: localinputs['PressureUOM']!==undefined && localinputs['PressureUOM']!==null && localinputs['PressureUOM']!=="" ? localinputs['PressureUOM'] : "pressure.psig",
                                    TemperatureUOM: localinputs['TemperatureUOM']!==undefined && localinputs['TemperatureUOM']!==null && localinputs['TemperatureUOM']!=="" ? localinputs['TemperatureUOM'] : "temp.degF",
                                    AtmPressureUOM: localinputs['AtmPressureUOM']!==undefined && localinputs['AtmPressureUOM']!==null && localinputs['AtmPressureUOM']!=="" ? localinputs['AtmPressureUOM'] : "abspressure.psia",
                                    FlowCapacityUOM: localinputs['FlowCapacityUOM'], 
                                }
                        // console.log('In ApiAction Service >>>>> ',localinputs,selectedUnits);
                    return await CalculateAreaMethods({...localinputs,selectedUnits});
                }else if(apiAction.Url==='/calculations/popup/api2000/pressure'){
                    const TankShape=localinputs['TankShape'];
                    const EndsGroup=localinputs['EndsGroup'];
                    const IsHorizontalOrientation=localinputs['IsHorizontalOrientation'];
                    let LengthEndToEnd_lt=((TankShape == 'Rectangular') || (TankShape == 'Cylindrical' && EndsGroup == 'FlatEnds' && IsHorizontalOrientation == 'Horizontal'))? localinputs['LengthEndToEnd_ltin'] : localinputs['LengthEndToEnd_lt'];
                    localinputs['LengthEndToEnd_lt']=LengthEndToEnd_lt;
                    // console.log('LengthEndToEnd_lt >>>>> ',TankShape,EndsGroup,IsHorizontalOrientation,LengthEndToEnd_lt);
                    const selectedUnits= {
                            PressureUOM: localinputs['PressureUOM']!==undefined && localinputs['PressureUOM']!==null && localinputs['PressureUOM']!==''? localinputs['PressureUOM']:"pressure.psig",
                            WettedAreaUOM: localinputs['WettedAreaUOM']!==undefined && localinputs['WettedAreaUOM']!==null && localinputs['WettedAreaUOM']!==''? localinputs['WettedAreaUOM']: localinputs['AreaUOM'] ?? "area.ft2",
                            LatentHeatOfVaporizationUOM: localinputs['LatentHeatOfVaporizationUOM']!==undefined && localinputs['LatentHeatOfVaporizationUOM']!==null && localinputs['LatentHeatOfVaporizationUOM']!==''? localinputs['LatentHeatOfVaporizationUOM']:"latentheat.BTUlb",
                            TankVolumeUOM: localinputs['TankVolumeUOM']!==undefined && localinputs['TankVolumeUOM']!==null && localinputs['TankVolumeUOM']!==''? localinputs['TankVolumeUOM']:"volume.ft3",
                            ThermalUOM: localinputs['ThermalUOM']!==undefined && localinputs['ThermalUOM']!==null && localinputs['ThermalUOM']!==''? localinputs['ThermalUOM']: localinputs['FlowCapacityUOM'] ?? "gasvolflow.SCFM",
                            TemperatureUOM: localinputs['TemperatureUOM']!==undefined && localinputs['TemperatureUOM']!==null && localinputs['TemperatureUOM']!==''? localinputs['TemperatureUOM']:"temp.degF",
                            PumpInRateUOM: localinputs['PumpInRateUOM'] !==undefined && localinputs['PumpInRateUOM']!==null && localinputs['PumpInRateUOM']!==''? localinputs['PumpInRateUOM']:"liquidvolflow.GPMUS",
                            PumpOutRateUOM: localinputs['PumpOutRateUOM'] !==undefined && localinputs['PumpOutRateUOM']!==null && localinputs['PumpOutRateUOM']!==''? localinputs['PumpOutRateUOM']: localinputs['PumpInRateUOM'] ?? "liquidvolflow.GPMUS",
                            ProductMovementUOM: localinputs['ProductMovementUOM']!==undefined && localinputs['ProductMovementUOM']!==null && localinputs['ProductMovementUOM']!==''? localinputs['ProductMovementUOM']: localinputs['FlowCapacityUOM'] ?? "gasvolflow.SCFM",
                            HeatTransferCoefficientUOM: localinputs['HeatTransferCoefficientUOM']!==undefined && localinputs['HeatTransferCoefficientUOM']!==null && localinputs['HeatTransferCoefficientUOM']!==''? localinputs['HeatTransferCoefficientUOM']:"heattransfer.BTUsft2R",
                            insulationThicknessUOM: localinputs['insulationThicknessUOM']!==undefined && localinputs['insulationThicknessUOM']!==null && localinputs['insulationThicknessUOM']!==''? localinputs['insulationThicknessUOM']: localinputs['LengthUOM'] ?? "length.ft",
                            InsulationThermalConductivityUOM: localinputs['InsulationThermalConductivityUOM']!==undefined && localinputs['InsulationThermalConductivityUOM']!==null && localinputs['InsulationThermalConductivityUOM']!==''? localinputs['InsulationThermalConductivityUOM'] : "thermalconductivity.BTUsftR",
                            SurfaceAreaUOM: localinputs['SurfaceAreaUOM'] !==undefined && localinputs['SurfaceAreaUOM']!==null && localinputs['SurfaceAreaUOM']!==''? localinputs['SurfaceAreaUOM']: localinputs['AreaUOM'] ?? "area.ft2",
                            LengthUOM: localinputs['LengthUOM']!==undefined && localinputs['LengthUOM']!==null && localinputs['LengthUOM']!==''? localinputs['LengthUOM']:"length.ft",
                            Height_h_UOM: localinputs['Height_h_UOM']!==undefined && localinputs['Height_h_UOM']!==null && localinputs['Height_h_UOM']!==''? localinputs['Height_h_UOM']: localinputs['LengthUOM'] ?? "length.ft",
                            VesselWidth_w_UOM: localinputs['VesselWidth_w_UOM']!==undefined && localinputs['VesselWidth_w_UOM']!==null && localinputs['VesselWidth_w_UOM']!==''? localinputs['VesselWidth_w_UOM']: localinputs['LengthUOM'] ?? "length.ft",
                            LengthEndToEnd_lt_UOM: localinputs['LengthEndToEnd_lt_UOM']!==undefined && localinputs['LengthEndToEnd_lt_UOM']!==null && localinputs['LengthEndToEnd_lt_UOM']!==''? localinputs['LengthEndToEnd_lt_UOM']: localinputs['LengthUOM'] ?? "length.ft",
                            Diameter_d_UOM: localinputs['Diameter_d_UOM']!==undefined && localinputs['Diameter_d_UOM']!==null && localinputs['Diameter_d_UOM']!==''? localinputs['Diameter_d_UOM']: localinputs['LengthUOM'] ?? "length.ft",
                            AreaUOM: localinputs['AreaUOM']!==undefined && localinputs['AreaUOM']!==null && localinputs['AreaUOM']!==''? localinputs['AreaUOM']:"area.ft2",
                            Elevation_H_UOM: localinputs['Elevation_H_UOM']!==undefined && localinputs['Elevation_H_UOM']!==null && localinputs['Elevation_H_UOM']!==''? localinputs['Elevation_H_UOM']: localinputs['LengthUOM'] ?? "length.ft",
                            FlowCapacityUOM: localinputs['FlowCapacityUOM']!==undefined && localinputs['FlowCapacityUOM']!==null && localinputs['FlowCapacityUOM']!==''? localinputs['FlowCapacityUOM']:"gasvolflow.SCFM"
                        };
                 
                    return await CalculatePressureAPI2000({...localinputs,selectedUnits});
                }
            }
        }
        return "No Matching action found!!"
    } catch (error) {
        console.error('Error in executing checkRequiredApiAction >>>>>>> ',error);
        throw error
    }
}

module.exports={
    CheckRequiredApiAction,
    clearFieldApiActionsCache: () => { _fieldApiActionsCache = null; }
}