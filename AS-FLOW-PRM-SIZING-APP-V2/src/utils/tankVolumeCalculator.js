import * as Math from 'mathjs';
import { convertUnit } from './convertUnit';

export const CalculateTankVolume=(config)=>{
    // console.log(config, 'CalculateTankVolumefunc >>>> config')
    
    let result;
    let CalculateTankData = config.reqFields["CalculateTankData"];
    let TankShape = config.reqFields["TankShape"];
    let Ends = config.reqFields["Ends"];
    let IsHorizontalOrientation = config.reqFields["IsHorizontalOrientation"];
    let LengthSeamToSeam_Ls = config.reqFields["LengthEndToEnd_lt"] - config.reqFields["Diameter_d"];
    
    if (CalculateTankData === true) {
        const dia_uom=config.reqFields['Diameter_d_UOM'];
        const hei_uom=config.reqFields['Height_h_UOM'];
        const vess_w_uom =config.reqFields["VesselWidth_w_UOM"];
        const EtoE_lt_uom =config.reqFields["LengthEndToEnd_lt_UOM"];
        const StoS_ls_uom =config.reqFields["LengthSeamToSeam_Ls_UOM"];
        const length_uom=config.requiredUnits["LengthUOM"];
        const volume_uom=config.requiredUnits["VolumeUOM"];
        const converted_d=dia_uom!=="" && dia_uom !==undefined?Number(convertUnit(config.reqFields['Diameter_d'],dia_uom,length_uom)):"";
        if (TankShape === 'Spherical') {
            result = (Math.pi * Math.pow(converted_d, 3)) / 6;
        }else if(TankShape === 'Rectangular') {
            const converted_h=hei_uom!=="" && hei_uom !==undefined?convertUnit(config.reqFields['Height_h'],hei_uom,length_uom):"";
            const converted_V_w=vess_w_uom!=="" && vess_w_uom !==undefined?convertUnit(config.reqFields['VesselWidth_w'],vess_w_uom,length_uom):"";
            const converted_EtoE_lt=EtoE_lt_uom!=="" && EtoE_lt_uom !==undefined?convertUnit(config.reqFields['LengthEndToEnd_lt'],EtoE_lt_uom,length_uom):"";
            result = converted_h * converted_V_w * converted_EtoE_lt;
            // console.log('In CalculateTankVolumefunc >>>>>>>>>>. Rectangular', "VesselWidth_w", config.reqFields['VesselWidth_w'], converted_V_w,vess_w_uom, "LengthEndToEnd_lt",converted_EtoE_lt, EtoE_lt_uom,"result", result);
            
           // console.log('In CalculateTankVolumefunc >>>>>>>>>>. Rectangular',"height", converted_h,hei_uom,"VesselWidth_w", converted_V_w,vess_w_uom, "LengthEndToEnd_lt",converted_EtoE_lt, EtoE_lt_uom,"result", result);
        } else if (TankShape === 'Cylindrical' && Ends === 'FlatEnds') {
            const converted_h=hei_uom!=="" && hei_uom !==undefined?convertUnit(config.reqFields['Height_h'],hei_uom,length_uom):"";
            const converted_EtoE_lt=EtoE_lt_uom!=="" && EtoE_lt_uom !==undefined?convertUnit(config.reqFields['LengthEndToEnd_lt'],EtoE_lt_uom,length_uom):"";
            if (IsHorizontalOrientation === 'true') {
                result = (Math.pi * Math.pow(converted_d, 2) * converted_EtoE_lt) / 4;
            } else {
                result = (Math.pi * Math.pow(converted_d, 2) * converted_h) / 4;
            }
        } else {
            const converted_StoS_ls=StoS_ls_uom!=="" && StoS_ls_uom !==undefined?convertUnit(LengthSeamToSeam_Ls,StoS_ls_uom,length_uom):"";
            result = (Math.pi * Math.pow(converted_d, 2) * ((2 * converted_d) + (3 * converted_StoS_ls))) / 12;
        }
        if(result==="" || isNaN(result)){
            result="0.000";
        }else{
            const tank_vol_uom=config.reqFields['TankVolumeUOM'];
            // console.log('CalculateTankVolumefunc >>>> value tankVolume', result,volume_uom,tank_vol_uom)
            result=convertUnit(result,volume_uom,tank_vol_uom);
        }
    }
    // console.log(result, 'CalculateTankVolume >>>> value')
    return {TankVolume:result};
}