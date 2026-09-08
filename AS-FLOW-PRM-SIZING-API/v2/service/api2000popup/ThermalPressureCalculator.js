const Math = require('mathjs');
const { convertUnit, FACTOR_FOR_LATITUDE, FACTOR_FOR_VARIOUS_CONDITION } = require("../../utils/helper");
const ThermalVentingTable = require('../../data/ThermalVentingReqTable.json');
const { getUOMs } = require('../getUom');

function findUpperAndLower(data, TankVolume, CalculationMethod, IsFPGTE100F) {
    let lower = null;
    let upper = null;

    for (let i = 0; i < data.length; i++) {
        if(data[i].CalculationMethod === CalculationMethod && data[i].IsFPGTE100F === IsFPGTE100F){
            // console.log('In usePopupPanel:::CalculateThermalPressure >>>>lower >>>>>>>>> ',TankVolume,data[i].TankVolume,IsFPGTE100F,data[i].IsFPGTE100F,CalculationMethod,data[i].CalculationMethod)
            if (data[i].TankVolume < TankVolume) {
                lower = data[i];
            }
            if (data[i].TankVolume > TankVolume) {
                upper = data[i];
                break;
            }
        }
    }
    // console.log('In usePopupPanel:::CalculateThermalPressure >>>>lower, upper >>>>>>>>> ',lower, upper)
    return { lw:lower, upp:upper };
}

const calculateThermalValue=(data, TankVolume, CalculationMethod, IsFPGTE100F,TankVol)=>{
    // console.log(`In usePopupPanel:::CalculateThermalPressure >>>> >>> TankVolume ${TankVolume} >>> CalculationMethod ${CalculationMethod} >>> IsFPGTE100F ${IsFPGTE100F} >>> TankVol ${TankVol}`)
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
        // console.log(`In usePopupPanel:::CalculateThermalPressure >>>> lower ${JSON.stringify(lower)} >>> upper ${JSON.stringify(upper)} `)
        if(lower !== null && upper === null){
            ThermalPres = lower.VThermalPressure;
            ThermalVac = lower.VThermalVacuum;
        }else if(lower !== null && upper !== null){
            let UBA = upper.VThermalPressure;
            let LBA = lower.VThermalPressure;
            let LBF = lower.TankVolume;
            let UBF = upper.TankVolume;
            // console.log(`In usePopupPanel:::CalculateThermalPressure >>>> UBF ${UBF} >>> LBF ${LBF} >>>> LBA:: ${LBA} >>>> UBA:: ${UBA} >>>> TankVol:: ${TankVol}`)
            ThermalPres = (TankVol - UBF) / (LBF - UBF) * (LBA - UBA) + UBA;
            //for thermal vacuum
            UBA = upper.VThermalVacuum;
            LBA = lower.VThermalVacuum;
            // console.log(`In usePopupPanel:::CalculateThermalPressure >>>> UBF ${UBF} >>> LBF ${LBF} >>>> LBA:: ${LBA} >>>> UBA:: ${UBA} >>>> TankVol:: ${TankVol}`)
            ThermalVac = (TankVol - UBF) / (LBF - UBF) * (LBA - UBA) + UBA;
        }else{
            ThermalPres = ThermalVac = 0.000
        }
        // console.log(`In usePopupPanel:::CalculateThermalPressure >>>> ThermalPres:: ${ThermalPres} >>> ThermalVac:: ${ThermalVac} >>> TvExactValueFlag ${TvExactValueFlag} >>>> data:: ${data?.length}`)
        return {ThermalPres, ThermalVac}
    // }
    // return "";
}

const CalculateThermalPressure = async (payload) => {
    // console.log('In usePopupPanel:::CalculateThermalPressure >>>> payload >> ',payload)
    
    let ThermalPres;
    let ThermalVac;
    // const payload=payload?.payloadData;
    const UOMs=payload?.units===undefined?await getUOMs():payload?.units;
    let tcResponse={}
    let equationValues={};
    let inputValues={};
    let equations={};
    let requiredUnits={};
    let receivedUnits={};
    // let dim='';
    // console.log('In usePopupPanel:::CalculateThermalPressure >>>> payload >> ',payload, UOMs)
    const isVacuumOnly=payload['IsVacuumOnly']??false;
    const isPressureOnly=payload['IsPressureOnly']??false;
    const CalculationMethod = payload["CalculationMethod"];
    const Rin = payload["Rin"];
    const TankLatitude = payload["TankLatitude"];
    const VaporSaturationPressure = payload["VaporSaturationPressure"];
    const AverageStorageTemperature = payload["AverageStorageTemperature"];
    let TankVolumeUOM = payload.requiredUnits['TankVolumeUOM']; //CalculationMethod === "Metric"? payload.requiredUnits['TankVolumeUOMMet']:payload.requiredUnits['TankVolumeUOMEng'];
    // dim=TankVolumeUOM.split('.')[0]
    TankVolumeUOM=UOMs.find(u => u.UnitKey=== TankVolumeUOM);

    const SizingBassis = payload["SizingBassis"];
    let VolumeUOM = payload?.selectedUnits["TankVolumeUOM"];
    VolumeUOM=VolumeUOM!=="" && VolumeUOM !==undefined?UOMs.find(u => u.UnitKey===VolumeUOM):'';
    
    let FlowCapacityUOM =payload.requiredUnits["FlowCapacityUOM"] //CalculationMethod === "Metric"? payload.requiredUnits["FlowCapacityUOMMet"]: payload.requiredUnits["FlowCapacityUOMEng"];
    // console.log('In usePopupPanel:::CalculateThermalPressure >>>> 11111111111111111 >> ',payload['TankVolume'],TankVolumeUOM?.UnitKey, VolumeUOM?.UnitKey)
    FlowCapacityUOM=FlowCapacityUOM!=="" && FlowCapacityUOM !==undefined?UOMs.find(u => u.UnitKey===FlowCapacityUOM):'';
    const converted_TankVol = TankVolumeUOM !== "" && TankVolumeUOM !== undefined ? Number(convertUnit(Number(payload['TankVolume']),  VolumeUOM,TankVolumeUOM)) : "";
    equationValues['TankVolume']=converted_TankVol;
    inputValues['TankVolume']=payload['TankVolume'];
    receivedUnits['TankVolume']=VolumeUOM;
    requiredUnits['TankVolume']=TankVolumeUOM;
    const N45 = CalculationMethod === "Metric"?1:1.51
    const N46 = CalculationMethod === "Metric"?1:3.08
    let Y_L;
    let C_L;
    // console.log('In usePopupPanel:::CalculateThermalPressure >>>> 2222222222222222 >> ',SizingBassis,payload['TankVolume'],converted_TankVol,TankVolumeUOM?.UnitKey, VolumeUOM?.UnitKey)
    if(SizingBassis === "sev_Ed_Main"){
        if(Rin >0 && converted_TankVol>0){
            Y_L = FACTOR_FOR_LATITUDE.find(item=>item.TankLatitude ===TankLatitude).Factor;
            C_L = FACTOR_FOR_VARIOUS_CONDITION.find(item=>
                                    item.TankLatitude === TankLatitude && 
                                    item.AverageStorageTemperature === AverageStorageTemperature && 
                                    item.VaporPressure === VaporSaturationPressure).Factor;
            
            ThermalPres =N45*Y_L*(Math.pow(converted_TankVol, 0.9))*Rin;
            ThermalVac = N46*C_L*(Math.pow(converted_TankVol, 0.7))*Rin;
            // console.log({ThermalPres,N45,Y_L,converted_TankVol,press_conv_tnk_vol:Math.pow(converted_TankVol, 0.9),Rin,ThermalVac,N46,C_L})
            equations['YL']=`YL = Table Lookup (LAT)`;
            equations['ThermalPres']=`Vtherm = ${N45} * YL * Rin * VOL^0.9`;
            equations['ThermalVac']=`Vtherm = ${N46} * CL * Rin * VOL^0.7`;
            equations['CL']=`CL = Table Lookup (Ps, Tst, LAT)`;
            
            equationValues['YL']=Y_L;
            equationValues['CL']=C_L;

            // console.log(`In usePopupPanel:::CalculateThermalPressure >>>> 222222 3333333 >>  N45: ${N45},Tank Vol:${converted_TankVol}, (Tank vol)**0.9 : ${Math.pow(converted_TankVol, 0.9)},Y_L : ${Y_L},C_L: ${C_L}, Rin: ${Rin}, ThermalPres: ${ThermalPres}`)
        }else{
            ThermalPres = ThermalVac = 0.000
        }
        // console.log('In usePopupPanel:::CalculateThermalPressure >>>> 3333333333333333333333 >> ',Rin >0 && converted_TankVol>0,Y_L,C_L,ThermalPres)
    }else{
        
        const Boiling_Flash_Point = payload["IsBoilingPointRadio"];
        let TemperatureUOM = payload?.selectedUnits["TemperatureUOM"]//payload["TemperatureUOM"];
        TemperatureUOM=UOMs.find(item=>item.UnitKey===TemperatureUOM);

        let reqTemperatureUOM = payload.requiredUnits["TemperatureUOM"] ?? (CalculationMethod === "Metric"?"temp.degC":"temp.degF"); //payload.requiredUnits["TemperatureUOMMet"]: payload.requiredUnits["TemperatureUOMEng"];
        reqTemperatureUOM=UOMs.find(item=>item.UnitKey===reqTemperatureUOM);
        const BoilingPoint = TemperatureUOM !== "" && TemperatureUOM !== undefined ? convertUnit(payload['BoilingPoint'], TemperatureUOM, reqTemperatureUOM) : "";
        const FlashPoint = TemperatureUOM !== "" && TemperatureUOM !== undefined ? convertUnit(payload['FlashPoint'], TemperatureUOM, reqTemperatureUOM) : "";
        TankVolumeUOM = CalculationMethod === "Metric"? "volume.m3":"volume.BBL";
        TankVolumeUOM=UOMs.find(item=>item.UnitKey===TankVolumeUOM);
        const converted_FPTankVol =convertUnit(payload['TankVolume'],  VolumeUOM, TankVolumeUOM);
        
        if(((Boiling_Flash_Point === "FlashPoint" && FlashPoint!==undefined && !isNaN(FlashPoint)) 
            || (Boiling_Flash_Point === "BoilingPoint" && BoilingPoint!==undefined && !isNaN(BoilingPoint))) && !isNaN(converted_FPTankVol)){
          
            const reqTempUnit=CalculationMethod === "Metric"? "temp.degC":"temp.degF";
            let FlashPointLimit = CalculationMethod === "Metric"? 37.8: 100;
            const requiredFPLimit = convertUnit(FlashPointLimit, UOMs.find(u => u.UnitKey===reqTempUnit), reqTemperatureUOM);
            let BoilingPointLimit = CalculationMethod === "Metric"? 148.9: 300;
            const requiredBPLimit = convertUnit(BoilingPointLimit, UOMs.find(u => u.UnitKey===reqTempUnit), reqTemperatureUOM);
            // console.log('In usePopupPanel:::CalculateThermalPressure >>>> 44444444444444444 333333333 >> ',Boiling_Flash_Point,FlashPoint >= FlashPointLimit,FlashPoint,FlashPointLimit,converted_FPTankVol)
            if(Boiling_Flash_Point === "FlashPoint" && !isNaN(FlashPoint)){
                if(FlashPoint >= requiredFPLimit){
                    ({ ThermalPres, ThermalVac } = calculateThermalValue(ThermalVentingTable, converted_FPTankVol, CalculationMethod, 'TRUE',converted_FPTankVol));
                }else{
                    ({ ThermalPres, ThermalVac } = calculateThermalValue(ThermalVentingTable, converted_FPTankVol, CalculationMethod, 'FALSE',converted_FPTankVol));
                }
            }else if(Boiling_Flash_Point === "BoilingPoint" && !isNaN(BoilingPoint) ){
                if(BoilingPoint >= requiredBPLimit){
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
            //console.log(Boiling_Flash_Point, 'CalculateThermalPressure >>>>222 payload')
            ThermalPres = ThermalVac = 0.000
        }
    }
    
    if (converted_TankVol === "" || isNaN(converted_TankVol) || Rin<=0) {
        ThermalPres = "0.000";
        ThermalVac = "0.000"
    } else {
        let ThermalUOM = payload?.selectedUnits['FlowCapacityUOM'] ?? payload?.selectedUnits['ThermalUOM'];
        
        ThermalUOM=UOMs.find(ob => ob.UnitKey===ThermalUOM);
        // console.log('In usePopupPanel:::CalculateThermalPressure >>>> 55555555555555555 >> ',isPressureOnly,ThermalPres,isVacuumOnly,ThermalVac,ThermalUOM?.UnitKey,FlowCapacityUOM?.UnitKey)
        // const PTHERMALUOM = CalculationMethod === "Metric"? "": payload.requiredUnits["VTHERMALUOMEng"];
        equationValues['ThermalPres']=ThermalPres;
        ThermalPres =  isPressureOnly?convertUnit(ThermalPres, FlowCapacityUOM, ThermalUOM):'';
        // console.log({ThermalPres, FlowCapacityUOM:FlowCapacityUOM?.UnitKey, ThermalUOM:ThermalUOM?.UnitKey})
        inputValues['ThermalPres']=ThermalPres;
        receivedUnits['ThermalPres']=ThermalUOM;
        requiredUnits['ThermalPres']=FlowCapacityUOM;

        equationValues['ThermalVac']=ThermalVac;
        ThermalVac = isVacuumOnly? convertUnit(ThermalVac, FlowCapacityUOM, ThermalUOM):'';
        inputValues['ThermalVac']=ThermalVac;
        receivedUnits['ThermalVac']=ThermalUOM;
        requiredUnits['ThermalVac']=FlowCapacityUOM;
        // console.log('In usePopupPanel:::CalculateThermalPressure >>>>ThermalPres 111111>>>>>>>>> ',{ThermalPres, ThermalVac,FlowCapacityUOM:FlowCapacityUOM?.UnitKey, ThermalUOM:ThermalUOM?.UnitKey})
    }
    // console.log('In usePopupPanel:::CalculateThermalPressure >>>>ThermalPres >>>>>>>>> ',ThermalPres, ThermalVac)
    tcResponse={equations, equationValues, requiredUnits, receivedUnits,inputValues};
    return { ThermalPressure: ThermalPres, ThermalVacuum:ThermalVac,tcResponse };
}

module.exports = {
    CalculateThermalPressure
};
