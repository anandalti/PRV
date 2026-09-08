import { convertUnitDiffDims } from "./convertUnit";

export const Calculate_14_ReqFlowCapacity=(config)=>{
    
    let gasInputValue=config.reqFields['Wv'];
    let liquidInputValue=config.reqFields['Wl'];

    let IsLiquidOnlyAtInlet=config.reqFields['IsLiquidOnlyAtInlet'];
   
    let Wreq='';
    if(IsLiquidOnlyAtInlet){
        if(liquidInputValue!=='' && liquidInputValue!=0){
            Wreq=Number(liquidInputValue);
        }
    }else if(gasInputValue!=='' && liquidInputValue!=='' ){
        if(Number(gasInputValue)+Number(liquidInputValue) > 0){
            Wreq=Number(gasInputValue)+Number(liquidInputValue);
        }
    }

    return {Wreq}
}

export const Calculate_17_ReqFlowCapacity=(config)=>{
    
    let Wv=config.reqFields['Wv'];
    let Wl=config.reqFields['Wl'];

    let Wreq='';
    
    if(Wv!=='' && Wl!=='' ){
        Wreq=Number(Wv)+Number(Wl);
    }

    return {Wreq}
}

export const Calculate_17_Inlet_SpVolMix=(config)=>{
    
    let Wreq='';
    let InletSpVolMixture='';
    let X1='';

    const Wv=config.reqFields['Wv'];
    const Wl=config.reqFields['Wl'];
       
    if(Wv==='' || Wl===''){
        return {Wreq,InletSpVolMixture};
    }
        
    Wreq=Number(Wv) + Number(Wl);
    
    if(Wv!==undefined && Wv!=='' && Wreq!==undefined && Wreq!==''){
        X1 = Wv / Wreq;

        let Vv1=config.reqFields['SpecificVolume'];
        
        if(Vv1!==undefined && Vv1!=='' ){
            
            let Vl1=config.reqFields['SpecificVolumeLiquid'];
            
            if(Vl1!==undefined && Vl1!=='' ){
                const payloadData=config.payloadData;
                const units=config.units;

                const CalcMethod=payloadData['CalculationMethod'];
                let reqSpVolUom = CalcMethod==='English'?"specificvolume.ft3lb":"specificvolume.m3kg";
                reqSpVolUom= units['specificvolume'].find(u => u.UnitKey===reqSpVolUom);
                
                const recSpVolUom=config.reqFields['SpecificVolumeUOM'];
       
                Vv1=Number(convertUnitDiffDims(Vv1, recSpVolUom, reqSpVolUom,units,payloadData,false));
                Vl1=Number(convertUnitDiffDims(Vl1, recSpVolUom, reqSpVolUom,units,payloadData,false));
                InletSpVolMixture = Number(X1 * Vv1) + Number((1 - X1) * Vl1);
                
                InletSpVolMixture = Number(convertUnitDiffDims(InletSpVolMixture, reqSpVolUom, recSpVolUom, units, payloadData, false));
                // console.log('Calculate_17_Inlet_SpVolMix >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 5555 >>>>>>> ',{InletSpVolMixture,recSpVolUom, reqSpVolUom});
            }
        }
    }
    

    return {Wreq,InletSpVolMixture}
}

export const Calculate_17_Non_Flashing_Wreq=(config)=>{
    
    let Wg=config.reqFields['Wg'];
    let Wv=config.reqFields['Wv'];
    let Wl=config.reqFields['Wl'];

    let Wreq='';
    
    if(Wg!=='' && Wv!=='' && Wl!=='' ){
        if((Number(Wg)+Number(Wv)) >0){
            Wreq=Number(Wg)+Number(Wv)+Number(Wl);
        }
    }

    return {Wreq}
}

export const checkP1_CP_T_CT=(config)=>{
    const IsSingleORMultiCompSys=config.reqFields['IsSingleORMultiCompSys'];
    const YesNoDetermine=config.reqFields['YesNoDetermine'];
    let Wv=config.reqFields['Wv'];
    let Wl=config.reqFields['Wl'];
    if(IsSingleORMultiCompSys=='SingleComponentSystem' && YesNoDetermine==='DetermineCriticalPoint'){
        const payloadData=config.payloadData;
        const UOMs=config.units;
        const CalcMethod=payloadData['CalculationMethod'];
        const requiredUnits={
            absPressureUOM: CalcMethod==='English'?"abspressure.psia":"abspressure.bara",
            pressureUOM: CalcMethod==='English'?"pressure.psig":"pressure.barg",
            TemperatureUOM: CalcMethod==='English'?"temp.degF":"temp.degC"
        }
        const receivedUnits={
            absPressureUOM: config.reqFields['AbsPressureUOM'],
            pressureUOM: config.reqFields['PressureUOM'],
            TemperatureUOM: config.reqFields['TemperatureUOM']
        }
        let Pset=config.reqFields['SetPressure'];
        Pset=Number(Pset);
        Pset=convertUnit(Pset,UOMs['pressure'].find(u => u.UnitKey===receivedUnits['pressureUOM']),UOMs['pressure'].find(u => u.UnitKey===requiredUnits['pressureUOM']));
        let Pover=config.reqFields['OverPressure'];
        Pover=Number(Pover);
        Pover=convertUnit(Pover,UOMs['pressure'].find(u => u.UnitKey===receivedUnits['pressureUOM']),UOMs['pressure'].find(u => u.UnitKey===requiredUnits['pressureUOM']));
        let Ploss=config.reqFields['InletLoss'];
        Ploss=Number(Ploss);
        Ploss=convertUnit(Ploss,UOMs['pressure'].find(u => u.UnitKey===receivedUnits['pressureUOM']),UOMs['pressure'].find(u => u.UnitKey===requiredUnits['pressureUOM']));
        let Patm=config.reqFields['AtmPressure'];
        Patm=Number(Patm);
        Patm=convertUnit(Patm,UOMs['abspressure'].find(u => u.UnitKey===receivedUnits['AtmPressureUOM']),UOMs['abspressure'].find(u => u.UnitKey===requiredUnits['absPressureUOM']));
        let T=config.reqFields['Relieving'];
        T=Number(T);
        T=convertUnit(T,UOMs['temperature'].find(u => u.UnitKey===receivedUnits['TemperatureUOM']),UOMs['temperature'].find(u => u.UnitKey===requiredUnits['TemperatureUOM']));
        let CriticalPressure=config.reqFields['CriticalPressure'];
        CriticalPressure=Number(CriticalPressure);
        CriticalPressure=convertUnit(CriticalPressure,UOMs['abspressure'].find(u => u.UnitKey===receivedUnits['AtmPressureUOM']),UOMs['abspressure'].find(u => u.UnitKey===requiredUnits['absPressureUOM']));
        let CriticalTemperature=config.reqFields['CriticalTemperature'];
        CriticalTemperature=Number(CriticalTemperature);
        CriticalTemperature=convertUnit(CriticalTemperature,UOMs['temperature'].find(u => u.UnitKey===receivedUnits['TemperatureUOM']),UOMs['temperature'].find(u => u.UnitKey===requiredUnits['TemperatureUOM']));

        const P1= Number(Pset) + Number(Pover) - Number(Ploss) + Number(Patm);

        if(P1 >= CriticalPressure && T >= CriticalTemperature){
            return {Wv:'',Wl:''}
        }

        
    
    
    }
    return {Wv,Wl}
}