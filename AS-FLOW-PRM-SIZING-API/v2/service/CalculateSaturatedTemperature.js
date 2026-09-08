const {  pool } = require("../db/pgsqldb");
const { convertUnit } = require("../utils/helper");
const { getUOMs } = require("./getUom");
// const SuperCriticalSteam = require("../data/SuperCritical_Steam.json");
// const { calculateValueKsc } = require("./fieldCalculations/ISO4126_Calculations");

const CalcSaturatedTemperture=async(payload)=>{
    try {
        const uoms = await getUOMs();
        let SetPressure =payload?.SetPressure;
        let OverPressure = payload?.OverPressure;
        let InletLoss = payload?.InletLoss;
        let AtmPressure = payload?.AtmPressure;
        let T= payload?.Relieving;
        let PressureUOM = payload?.PressureUOM;
        let TempUOM = payload?.TemperatureUOM;
        let atmPressureUOM =payload?.AtmPressureUOM;
        if(TempUOM===undefined || TempUOM===null || TempUOM===''){
            TempUOM='temp.degF';
        }
        if(PressureUOM==='' || PressureUOM===undefined || PressureUOM===null){
            PressureUOM='pressure.psig';
        }
        if(atmPressureUOM===undefined || atmPressureUOM===null || atmPressureUOM===''){
            atmPressureUOM='abspressure.psia';
        }
        T=T!=='' && T!==undefined && T!==null?convertUnit(T,uoms.find(u => u.UnitKey===TempUOM),uoms.find(u => u.UnitKey==='temp.degF')):null;
        
        
        if(SetPressure!=='' && SetPressure!==undefined && SetPressure!==null){
            SetPressure=isNaN(SetPressure)?0:Number(SetPressure);
            SetPressure=convertUnit(SetPressure,uoms.find(u => u.UnitKey===PressureUOM),uoms.find(u => u.UnitKey==='pressure.psig'));
        }else{
            SetPressure=0;
        }
        if(OverPressure!=='' && OverPressure!==undefined && OverPressure!==null){
            OverPressure=isNaN(OverPressure)?0:Number(OverPressure);
            OverPressure=convertUnit(OverPressure,uoms.find(u => u.UnitKey===PressureUOM),uoms.find(u => u.UnitKey==='pressure.psig'));
        }else{
            OverPressure=0;
        }
        if(InletLoss!=='' && InletLoss!==undefined && InletLoss!==null){
            InletLoss=isNaN(InletLoss)?0:Number(InletLoss);
            InletLoss=convertUnit(InletLoss,uoms.find(u => u.UnitKey===PressureUOM),uoms.find(u => u.UnitKey==='pressure.psig'));
        }else{
            InletLoss=0;
        }
        if(AtmPressure!=='' && AtmPressure!==undefined && AtmPressure!==null){
            AtmPressure=isNaN(AtmPressure)?0:Number(AtmPressure);
            AtmPressure=convertUnit(AtmPressure,uoms.find(u => u.UnitKey===atmPressureUOM),uoms.find(u => u.UnitKey==='abspressure.psia'));
        }else{
            AtmPressure=0;
        }
        
        const P1=SetPressure+OverPressure+AtmPressure-InletLoss;
        // console.log('first query SizingDetails_IN 111111>>>>>>>>>>>>>> ', P1,T,SetPressure,OverPressure,AtmPressure,InletLoss);
        // let SteamCondition='';
        
        
            let data=await pool.query(`SELECT * FROM public."FUNC_GetTsathoKsh"($1,$2)`, [P1,T]);
            data=data?.rows[0]?.FUNC_GetTsathoKsh[0];
            // console.log('first query SizingDetails_IN 111111>>>>>>>>>>>>>> ',data);
            const Tsat=data?.Tsat!==null && data?.Tsat!==undefined && data?.Tsat!==''?convertUnit(data.Tsat,uoms.find(u => u.UnitKey==='temp.degF'),uoms.find(u => u.UnitKey===TempUOM)):data.Tsat;
            // if(T < Tsat){
            //     SteamCondition='NOT SET';
            // }else if(T === Tsat){
            //     SteamCondition='Saturated';
            // }else{
            //     SteamCondition='Superheated';
            // }
            return {
                    "SaturatedSteam":Tsat,
                    "ho":data.ho,
                    "Ksh":data.Ksh,
                    // "SteamCondition":SteamCondition
                }
        
    } catch (error) {
        console.error('Error in Saturated Temperature >>>>>>>>> ',error)
        throw error;
    }
}

const CalcSaturatedTempertureKsc=async(payload)=>{
    try {
        const uoms = await getUOMs();
        let SetPressure =payload?.SetPressure;
        let OverPressure = payload?.OverPressure;
        let InletLoss = payload?.InletLoss;
        let AtmPressure = payload?.AtmPressure;
        let T= payload?.Relieving;
        let PressureUOM = payload?.PressureUOM;
        let TempUOM = payload?.TemperatureUOM;
        let atmPressureUOM =payload?.AtmPressureUOM;
        if(TempUOM===undefined || TempUOM===null || TempUOM===''){
            TempUOM='temp.degF';
        }
        if(PressureUOM==='' || PressureUOM===undefined || PressureUOM===null){
            PressureUOM='pressure.psig';
        }
        if(atmPressureUOM===undefined || atmPressureUOM===null || atmPressureUOM===''){
            atmPressureUOM='abspressure.psia';
        }
        T=T!=='' && T!==undefined && T!==null?convertUnit(T,uoms.find(u => u.UnitKey===TempUOM),uoms.find(u => u.UnitKey==='temp.degF')):null;
        
        
        if(SetPressure!=='' && SetPressure!==undefined && SetPressure!==null){
            SetPressure=isNaN(SetPressure)?0:Number(SetPressure);
            SetPressure=convertUnit(SetPressure,uoms.find(u => u.UnitKey===PressureUOM),uoms.find(u => u.UnitKey==='pressure.psig'));
        }else{
            SetPressure=0;
        }
        if(OverPressure!=='' && OverPressure!==undefined && OverPressure!==null){
            OverPressure=isNaN(OverPressure)?0:Number(OverPressure);
            OverPressure=convertUnit(OverPressure,uoms.find(u => u.UnitKey===PressureUOM),uoms.find(u => u.UnitKey==='pressure.psig'));
        }else{
            OverPressure=0;
        }
        if(InletLoss!=='' && InletLoss!==undefined && InletLoss!==null){
            InletLoss=isNaN(InletLoss)?0:Number(InletLoss);
            InletLoss=convertUnit(InletLoss,uoms.find(u => u.UnitKey===PressureUOM),uoms.find(u => u.UnitKey==='pressure.psig'));
        }else{
            InletLoss=0;
        }
        if(AtmPressure!=='' && AtmPressure!==undefined && AtmPressure!==null){
            AtmPressure=isNaN(AtmPressure)?0:Number(AtmPressure);
            AtmPressure=convertUnit(AtmPressure,uoms.find(u => u.UnitKey===atmPressureUOM),uoms.find(u => u.UnitKey==='abspressure.psia'));
        }else{
            AtmPressure=0;
        }
        
        const P1=SetPressure+OverPressure+AtmPressure-InletLoss;
        // console.log('first query SizingDetails_IN 111111>>>>>>>>>>>>>> ', P1,T,SetPressure,OverPressure,AtmPressure,InletLoss);
        let SteamCondition='';
        let TgtminReqTemp;

        if(P1 <=3208.2){
            let data=await pool.query(`SELECT * FROM public."FUNC_GetTsathoKsh"($1,$2)`, [P1,T]);
            // console.log('first query SizingDetails_IN 111111>>>>>>>>>>>>>> ',SetPressure,OverPressure,AtmPressure,InletLoss, P1,T,data?.rows[0]?.FUNC_GetTsathoKsh[0]);
            data=data?.rows[0]?.FUNC_GetTsathoKsh[0];
            const Tsat=data?.Tsat!==null && data?.Tsat!==undefined && data?.Tsat!==''?convertUnit(data.Tsat,uoms.find(u => u.UnitKey==='temp.degF'),uoms.find(u => u.UnitKey===TempUOM)):data.Tsat;
            if(T < Tsat){
                SteamCondition='NOT SET';
            }else if(T === Tsat){
                SteamCondition='Saturated';
            }else{
                SteamCondition='Superheated';
            }
            return {
                    "SaturatedSteam":Tsat,
                    "ho":data.ho,
                    "Ksh":data.Ksh,
                    "Ksc":1,
                    "TgtminReqTemp":null,
                    "SteamCondition":SteamCondition
                }
        }else if(T>1200 || P1>6000){
            return {
                "SaturatedSteam":null,
                "ho":null,
                "Ksh":1,
                "Ksc":0,
                "SteamCondition":'NOT SET'
            }
        }else if(T!==null && T!==undefined && T!==''){
            // const filteredData=SuperCriticalSteam.filter(item=>item.P1>=P1);
            
            let errorId;
            // data = calculateValueKsc([...SuperCriticalSteam],P1,T);
            let data=await pool.query(`SELECT * FROM public."FUNC_GetKsc"($1,$2)`, [P1,T]);
            // console.log('first query SizingDetails_IN 111111>>>>>>>>>>>>>> ',SetPressure,OverPressure,AtmPressure,InletLoss, P1,T,data?.rows[0]?.FUNC_GetTsathoKsh[0]);
            data=data?.rows[0];
            // console.log(' >>>>>>>>>> ',data)
            // TgtminReqTemp=parseFloat(data?.MinReqT);
            TgtminReqTemp=parseFloat(parseFloat(data?.T_Out).toFixed(3));
            let Ksc=parseFloat(parseFloat(data?.Ksc_Out).toFixed(2));
            if(T < 705.47){
                SteamCondition='NOT SET';
                errorId='TltminReqTemp';
                Ksc=0;
            }else if(T >= 705.47 && T < TgtminReqTemp){
                SteamCondition='NOT SET';
                errorId='TltminSCReqTemp';
                Ksc=0;
            }else{
                SteamCondition='Supercritical';
            }
            // if(T < TgtminReqTemp){
                // errorId='TltminSCReqTemp';
            // }
            return {
                "SaturatedSteam":null,
                "ho":null,
                "Ksh":1,
                "Ksc":Ksc,
                "SteamCondition":SteamCondition,
                "ErrorId":errorId,
                "TgtminReqTemp":TgtminReqTemp
            }
        }else{
            return {
                "SaturatedSteam":null,
                "ho":null,
                "Ksh":1,
                "Ksc":0,
                "SteamCondition":'NOT SET'
            }
        }
    } catch (error) {
        console.error('Error in Saturated Temperature >>>>>>>>> ',error)
        throw error;
    }
}

module.exports={
    CalcSaturatedTemperture,
    CalcSaturatedTempertureKsc
}