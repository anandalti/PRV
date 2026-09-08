import * as Math from 'mathjs';
import { convertUnit } from './convertUnit';
import { FACTOR_FOR_LATITUDE, FACTOR_FOR_VARIOUS_CONDITION } from './constants';
import ThermalVentingTable from './ThermalVentingReqTable.json'

function findUpperAndLower(data, TankVolume, CalculationMethod, IsFPGTE100F) {
    let lower = null;
    let upper = null;

    for (let i = 0; i < data.length; i++) {
        if(data[i].CalculationMethod === CalculationMethod && data[i].IsFPGTE100F === IsFPGTE100F){
            // console.log('In use PopupPanel:::CalculateThermalPressure >>>>lower >>>>>>>>> ',TankVolume,data[i].TankVolume,IsFPGTE100F,data[i].IsFPGTE100F,CalculationMethod,data[i].CalculationMethod)
            if (data[i].TankVolume < TankVolume) {
                lower = data[i];
            }
            if (data[i].TankVolume > TankVolume) {
                upper = data[i];
                break;
            }
        }
    }
    // console.log('In use PopupPanel:::CalculateThermalPressure >>>>lower, upper >>>>>>>>> ',lower, upper)
    return { lw:lower, upp:upper };
}

const calculateThermalValue=(data, TankVolume, CalculationMethod, IsFPGTE100F,TankVol)=>{
    // console.log(`In use PopupPanel:::CalculateThermalPressure >>>> >>> TankVolume ${TankVolume} >>> CalculationMethod ${CalculationMethod} >>> IsFPGTE100F ${IsFPGTE100F} >>> TankVol ${TankVol}`)
    let lower = null;
    let upper = null;
    let PPL_Obj;
    let PPU_Obj;
    let TvExactValueFlag=false;

    data.sort((a, b) => a.TankVolume - b.TankVolume);
    // console.log('ISO4126 Calculations >>>',JSON.stringify(VentingTable))
    for (let index = 0; index < data?.length - 1; index++) {
        
        if(data[index].CalculationMethod === CalculationMethod && data[index].IsFPGTE100F === IsFPGTE100F){
            if(Number(data[index].TankVolume)==Number(TankVolume) ){
                TvExactValueFlag=true;
                PPL_Obj = data[index];
                break;
            }
        }
    }

        if(TvExactValueFlag){
            lower=PPL_Obj;
            upper=null;
        }else{
            
            const {lw,upp}= findUpperAndLower(data, TankVolume, CalculationMethod, IsFPGTE100F);
            
            lower={...lw};
            upper={...upp};
        }
        let ThermalPres;
        let ThermalVac;
        // console.log(`In use PopupPanel:::CalculateThermalPressure >>>> lower ${JSON.stringify(lower)} >>> upper ${JSON.stringify(upper)} `)
        if(lower !== null && upper === null){
            ThermalPres = lower.VThermalPressure;
            ThermalVac = lower.VThermalVacuum;
        }else if(lower !== null && upper !== null){
            let UBA = upper.VThermalPressure;
            let LBA = lower.VThermalPressure;
            let LBF = lower.TankVolume;
            let UBF = upper.TankVolume;
            // console.log(`In use PopupPanel:::CalculateThermalPressure >>>> UBF ${UBF} >>> LBF ${LBF} >>>> LBA:: ${LBA} >>>> UBA:: ${UBA} >>>> TankVol:: ${TankVol}`)
            ThermalPres = (TankVol - UBF) / (LBF - UBF) * (LBA - UBA) + UBA;
            //for thermal vacuum
            UBA = upper.VThermalVacuum;
            LBA = lower.VThermalVacuum;
            // console.log(`In use PopupPanel:::CalculateThermalPressure >>>> UBF ${UBF} >>> LBF ${LBF} >>>> LBA:: ${LBA} >>>> UBA:: ${UBA} >>>> TankVol:: ${TankVol}`)
            ThermalVac = (TankVol - UBF) / (LBF - UBF) * (LBA - UBA) + UBA;
        }else{
            ThermalPres = ThermalVac = 0.000
        }
        // console.log(`In use PopupPanel:::CalculateThermalPressure >>>> ThermalPres:: ${ThermalPres} >>> ThermalVac:: ${ThermalVac} >>> TvExactValueFlag ${TvExactValueFlag} >>>> data:: ${data?.length}`)
        return {ThermalPres, ThermalVac}
    // }
    // return "";
}

export const CalculateThermalPressure = (config) => {
    // console.log('In use PopupPanel:::CalculateThermalPressure >>>> config >> ',config)
    
    let ThermalPres;
    let ThermalVac;
    const payload=config?.payloadData;
    const UOMs=config?.units;
    let tcResponse={}
    let equationValues={};
    let inputValues={};
    let equations={};
    let requiredUnits={};
    let receivedUnits={};
    // console.log('In use PopupPanel:::CalculateThermalPressure >>>> payload >> ',payload, UOMs)
    const isVacuumOnly=payload['IsVacuumOnly'];
    const isPressureOnly=payload['IsPressureOnly'];
    const CalculationMethod = config.reqFields["CalculationMethod"];
    const Rin = config.reqFields["Rin"];
    const TankLatitude = config.reqFields["TankLatitude"];
    const VaporSaturationPressure = config.reqFields["VaporSaturationPressure"];
    const AverageStorageTemperature = config.reqFields["AverageStorageTemperature"];
    let TankVolumeUOM = CalculationMethod === "Metric"? config.requiredUnits['TankVolumeUOMMet']:config.requiredUnits['TankVolumeUOMEng'];
    const SizingBassis = config.reqFields["SizingBassis"];
    const VolumeUOM = config.reqFields["TankVolumeUOM"];
    
    const FlowCapacityUOM =CalculationMethod === "Metric"? config.requiredUnits["FlowCapacityUOMMet"]: config.requiredUnits["FlowCapacityUOMEng"];
    // console.log('In use PopupPanel:::CalculateThermalPressure >>>> 11111111111111111 >> ',config.reqFields['TankVolume'],TankVolumeUOM?.UnitKey, VolumeUOM?.UnitKey)
    const converted_TankVol = TankVolumeUOM !== "" && TankVolumeUOM !== undefined ? Number(convertUnit(Number(config.reqFields['TankVolume']),  VolumeUOM,TankVolumeUOM)) : "";
    equationValues['TankVolume']=converted_TankVol;
    inputValues['TankVolume']=config.reqFields['TankVolume'];
    receivedUnits['TankVolume']=VolumeUOM;
    requiredUnits['TankVolume']=TankVolumeUOM;
    const N45 = CalculationMethod === "Metric"?1:1.51
    const N46 = CalculationMethod === "Metric"?1:3.08
    let Y_L;
    let C_L;
    // console.log('In use PopupPanel:::CalculateThermalPressure >>>> 2222222222222222 >> ',SizingBassis,config.reqFields['TankVolume'],converted_TankVol,TankVolumeUOM?.UnitKey, VolumeUOM?.UnitKey)
    if(SizingBassis === "sev_Ed_Main"){
        if(Rin >0 && converted_TankVol>0){
            Y_L = FACTOR_FOR_LATITUDE.find(item=>item.TankLatitude ===TankLatitude).Factor;
            C_L = FACTOR_FOR_VARIOUS_CONDITION.find(item=>
                                    item.TankLatitude === TankLatitude && 
                                    item.AverageStorageTemperature === AverageStorageTemperature && 
                                    item.VaporPressure === VaporSaturationPressure).Factor;
            
            ThermalPres =N45*Y_L*(Math.pow(converted_TankVol, 0.9))*Rin;
            ThermalVac = N46*C_L*(Math.pow(converted_TankVol, 0.7))*Rin;
            equations['YL']=`YL = Table Lookup (LAT)`;
            equations['ThermalPres']=`Vtherm = ${N45} * YL * Rin * VOL^0.9`;
            equations['ThermalVac']=`Vtherm = ${N46} * CL * Rin * VOL^0.7`;
            equations['CL']=`CL = Table Lookup (Ps, Tst, LAT)`;
            
            equationValues['YL']=Y_L;
            equationValues['CL']=C_L;

            // console.log(`In use PopupPanel:::CalculateThermalPressure >>>> 222222 3333333 >>  N45: ${N45},Tank Vol:${converted_TankVol}, (Tank vol)**0.9 : ${Math.pow(converted_TankVol, 0.9)},Y_L : ${Y_L},C_L: ${C_L}, Rin: ${Rin}, ThermalPres: ${ThermalPres}`)
        }else{
            ThermalPres = ThermalVac = 0.000
        }
        // console.log('In use PopupPanel:::CalculateThermalPressure >>>> 3333333333333333333333 >> ',Rin >0 && converted_TankVol>0,Y_L,C_L,ThermalPres)
    }else{
        
        const Boiling_Flash_Point = config.reqFields["IsBoilingPointRadio"];
        let TemperatureUOM = payload["TemperatureUOM"]//config.reqFields["TemperatureUOM"];
        TemperatureUOM=UOMs['temperature']?.find(item=>item.UnitKey===TemperatureUOM);
        
        let reqTemperatureUOM = CalculationMethod === "Metric"?"temp.degC":"temp.degF"; //config.requiredUnits["TemperatureUOMMet"]: config.requiredUnits["TemperatureUOMEng"];             
        reqTemperatureUOM=UOMs['temperature']?.find(item=>item.UnitKey===reqTemperatureUOM);
        const BoilingPoint = TemperatureUOM !== "" && TemperatureUOM !== undefined ? convertUnit(config.reqFields['BoilingPoint'], TemperatureUOM, reqTemperatureUOM) : "";
        const FlashPoint = TemperatureUOM !== "" && TemperatureUOM !== undefined ? convertUnit(config.reqFields['FlashPoint'], TemperatureUOM, reqTemperatureUOM) : "";
        TankVolumeUOM = CalculationMethod === "Metric"? "volume.m3":"volume.BBL";
        TankVolumeUOM=UOMs['volume']?.find(item=>item.UnitKey===TankVolumeUOM);
        const converted_FPTankVol =convertUnit(config.reqFields['TankVolume'],  VolumeUOM, TankVolumeUOM);
        
        if(((Boiling_Flash_Point === "FlashPoint" && FlashPoint!==undefined && !isNaN(FlashPoint)) 
            || (Boiling_Flash_Point === "BoilingPoint" && BoilingPoint!==undefined && !isNaN(BoilingPoint))) && !isNaN(converted_FPTankVol)){
          
            let FlashPointLimit = CalculationMethod === "Metric"? 37.8: 100;
            let BoilingPointLimit = CalculationMethod === "Metric"? 148.9: 300;
            // console.log('In use PopupPanel:::CalculateThermalPressure >>>> 44444444444444444 333333333 >> ',Boiling_Flash_Point,FlashPoint >= FlashPointLimit,FlashPoint,FlashPointLimit,converted_FPTankVol)
            if(Boiling_Flash_Point === "FlashPoint" && !isNaN(FlashPoint)){
                if(FlashPoint >= FlashPointLimit){
                    ({ ThermalPres, ThermalVac } = calculateThermalValue(ThermalVentingTable, converted_FPTankVol, CalculationMethod, 'TRUE',converted_FPTankVol));
                }else{
                    ({ ThermalPres, ThermalVac } = calculateThermalValue(ThermalVentingTable, converted_FPTankVol, CalculationMethod, 'FALSE',converted_FPTankVol));
                }
            }else if(Boiling_Flash_Point === "BoilingPoint" && !isNaN(BoilingPoint) ){
                if(BoilingPoint >= BoilingPointLimit){
                    ({ ThermalPres, ThermalVac } = calculateThermalValue(ThermalVentingTable, converted_FPTankVol, CalculationMethod, 'TRUE',converted_FPTankVol));
                }else{
                    ({ ThermalPres, ThermalVac } = calculateThermalValue(ThermalVentingTable, converted_FPTankVol, CalculationMethod, 'FALSE',converted_FPTankVol));
                }
            }  
            if(isPressureOnly){

                equations['ThermalPres_2']=`Vtherm = Table Lookup (VOL, F.P or B.P)`; 
            }
            if(isVacuumOnly){

                equations['ThermalVac_3']=`Vtherm = Table Lookup (VOL)`; 
            }

        }else{
            //console.log(Boiling_Flash_Point, 'CalculateThermalPressure >>>>222 config')
            ThermalPres = ThermalVac = 0.000
        }
    }
    // console.log('In use PopupPanel:::CalculateThermalPressure >>>> 55555555555555555 >> ',isPressureOnly,ThermalPres,isVacuumOnly,ThermalPres)
    if (converted_TankVol === "" || isNaN(converted_TankVol) || Rin<=0) {
        ThermalPres = "0.000";
        ThermalVac = "0.000"
    } else {
        let ThermalUOM = payload['FlowCapacityUOM']//config.reqFields['ThermalUOM'];
        const dim=ThermalUOM.split('.')[0]
        ThermalUOM=UOMs[dim].find(ob => ob.UnitKey===ThermalUOM);
        // const PTHERMALUOM = CalculationMethod === "Metric"? "": config.requiredUnits["VTHERMALUOMEng"];
        equationValues['ThermalPres']=ThermalPres;
        ThermalPres =  isPressureOnly?convertUnit(ThermalPres, FlowCapacityUOM, ThermalUOM):'';
        inputValues['ThermalPres']=ThermalPres;
        receivedUnits['ThermalPres']=ThermalUOM;
        requiredUnits['ThermalPres']=FlowCapacityUOM;

        equationValues['ThermalVac']=ThermalVac;
        ThermalVac = isVacuumOnly? convertUnit(ThermalVac, FlowCapacityUOM, ThermalUOM):'';
        inputValues['ThermalVac']=ThermalVac;
        receivedUnits['ThermalVac']=ThermalUOM;
        requiredUnits['ThermalVac']=FlowCapacityUOM;
        // console.log('In use PopupPanel:::CalculateThermalPressure >>>>ThermalPres 111111>>>>>>>>> ',ThermalPres, ThermalVac,FlowCapacityUOM?.UnitKey, ThermalUOM?.UnitKey)
    }
    // console.log('In use PopupPanel:::CalculateThermalPressure >>>>ThermalPres >>>>>>>>> ',ThermalPres, ThermalVac)
    tcResponse={equations, equationValues, requiredUnits, receivedUnits,inputValues};
    return { ThermalPressure: ThermalPres, ThermalVacuum:ThermalVac,tcResponse };
}
