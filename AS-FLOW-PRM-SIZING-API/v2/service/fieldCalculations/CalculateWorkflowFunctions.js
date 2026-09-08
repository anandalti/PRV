const { convertUnit,convertUnitDiffDims } = require("../../utils/helper");
const { getUOMs } = require("../getUom");

 const Calculate_14_ReqFlowCapacity=(payload)=>{
    
    let gasInputValue=payload['Wv'];
    let liquidInputValue=payload['Wl'];

    let IsLiquidOnlyAtInlet=payload['IsLiquidOnlyAtInlet'];

    let Wreq='';
    // console.log({gasInputValue,liquidInputValue,IsLiquidOnlyAtInlet});
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

 const Calculate_15_ReqFlowCapacity=(payload)=>{
    
    let gasInputValue=payload['Vreq'];
    let liquidInputValue=payload['Liquid2Wl'];

    // let IsLiquidOnlyAtInlet=payload['IsLiquidOnlyAtInlet'];

    let Wreq='';
    // console.log({gasInputValue,liquidInputValue});
    if(gasInputValue!=='' && liquidInputValue!=='' ){
        if(Number(gasInputValue)+Number(liquidInputValue) > 0){
            Wreq=Number(gasInputValue)+Number(liquidInputValue);
        }
    }

    return {Wreq}
}

//  const Calculate_17_ReqFlowCapacity=(payload)=>{

//     let Wv=payload['Wv'];
//     let Wl=payload['Wl'];

//     let Wreq='';
    
//     if(Wv!=='' && Wl!=='' ){
//         Wreq=Number(Wv)+Number(Wl);
//     }

//     return {Wreq}
// }

 const Calculate_17_Inlet_SpVolMix=async (payload)=>{
    
    let Wreq='';
    let InletSpVolMixture='';
    let X1='';

    const Wv=payload['Wv'];
    const Wl=payload['Wl'];

    if(Wv==='' || Wl===''){
        return {Wreq,InletSpVolMixture};
    }
        
    Wreq=Number(Wv) + Number(Wl);
    
    if(Wv!==undefined && Wv!=='' && Wreq!==undefined && Wreq!==''){
        X1 = Wv / Wreq;

        let Vv1=payload['SpecificVolume'];

        if(Vv1!==undefined && Vv1!=='' ){

            let Vl1=payload['SpecificVolumeLiquid'];

            if(Vl1!==undefined && Vl1!=='' ){
                const payloadData={};
                const units=payload?.units===undefined ? await getUOMs(): payload?.units;

                const CalcMethod=payload['CalculationMethod'];
                let reqSpVolUom = CalcMethod==='English'?"specificvolume.ft3lb":"specificvolume.m3kg";
                reqSpVolUom= units.find(u => u.UnitKey===reqSpVolUom);
                
                let recSpVolUom=payload?.selectedUnits['SpecificVolumeUOM'];
                recSpVolUom= units.find(u => u.UnitKey===recSpVolUom);
       
                Vv1=Number(convertUnitDiffDims(Vv1, recSpVolUom, reqSpVolUom,units,payloadData,false));
                Vl1=Number(convertUnitDiffDims(Vl1, recSpVolUom, reqSpVolUom,units,payloadData,false));
                InletSpVolMixture = Number(X1 * Vv1) + Number((1 - X1) * Vl1);
                
                InletSpVolMixture = Number(convertUnitDiffDims(InletSpVolMixture, reqSpVolUom, recSpVolUom, units, payloadData, false));
                // console.log('Calculate_17 Inlet_SpVolMix >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 5555 >>>>>>> ',{InletSpVolMixture,recSpVolUom, reqSpVolUom});
            }
        }
    }
    

    return {Wreq,InletSpVolMixture}
}

 const Calculate_18_Non_Flashing_Wreq=(payload)=>{
    
    let Wg=payload['Wg'];
    let Wv=payload['Wv'];
    let Wl=payload['Wl'];

    let Wreq='';
    
    if(Wg!=='' && Wv!=='' && Wl!=='' ){
        if((Number(Wg)+Number(Wv)) >0){
            Wreq=Number(Wg)+Number(Wv)+Number(Wl);
        }
    }

    return {Wreq}
}

const Calculate_21_ReqFlowCapacity= async(payload)=>{
    // console.log('In Calculate 21 ReqFlowCapacity >>>>>>>>>>>>s>>>>>>> ',config);
    const units = payload?.units===undefined ? await getUOMs(): payload?.units;
    
    const requiredUnits = {
            "absPressureUOM": "abspressure.bara",
            "pressureUOM": "pressure.barg",
            "TemperatureUOM": "temp.degC",
            "FlowCapacityUOM": payload?.selectedUnits?.FlowCapacityUOM,
    };
    const receivedUOM = {
        "absPressureUOM": payload?.selectedUnits?.AtmPressureUOM,
        "pressureUOM": payload?.selectedUnits?.PressureUOM,
        "TemperatureUOM": payload?.selectedUnits?.TemperatureUOM,
        "FlowCapacityWvUOM": payload?.selectedUnits?.FlowCapacityWvUOM,
        "FlowCapacityLiqUOM": payload?.selectedUnits?.FlowCapacityLiqUOM,
        "FlowCapacityLiq2UOM": payload?.selectedUnits?.FlowCapacityLiq2UOM,
    };

    let reqFlowCapUnit=requiredUnits['FlowCapacityUOM'];
    reqFlowCapUnit=units.find(u => u.UnitKey===reqFlowCapUnit);
    let gasInputUnit=receivedUOM['FlowCapacityWvUOM'];
    gasInputUnit=units.find(u => u.UnitKey===gasInputUnit);
    let LiquidInputUnit=receivedUOM['FlowCapacityLiqUOM'];
    LiquidInputUnit=units.find(u => u.UnitKey===LiquidInputUnit);
    let Liquid2InputUnit=receivedUOM['FlowCapacityLiq2UOM'];
    Liquid2InputUnit=units.find(u => u.UnitKey===Liquid2InputUnit);

    let IsLiquid2=payload['IsLiquid2'];
    let gasInputValue=payload['Wv'];
    let liquidInputValue=payload['Wl'];
    let Liq2InputValue=payload['Liquid2Wl'];
    let IsLiquidOnlyAtInlet=payload['IsLiquidOnlyAtInlet'];
    const pressureUOM=units.find(u => u.UnitKey===receivedUOM['pressureUOM']);
    const TemperatureUOM=units.find(u => u.UnitKey===receivedUOM['TemperatureUOM']);
    const absPressureUOM=units.find(u => u.UnitKey===receivedUOM['absPressureUOM']);
    const payloadData={
        'PressureUOM':pressureUOM, 
        'TemperatureUOM':TemperatureUOM, 
        'AtmPressureUOM':absPressureUOM,
        'MolWeight':payload['MolWeight'],
        'SpGravity':payload['SpGravity'],
        'SetPressure':payload['SetPressure'],
        'OverPressure':payload['OverPressure'],
        'InletLoss':payload['InletLoss'],
        'AtmPressure':payload['AtmPressure'],
        'Relieving':payload['Relieving'],
        'SpGravityLiquid':payload['SpGravityLiquid'],
        'SpGravityLiquid2':payload['SpGravityLiquid2'],
    };
    
    let convertedGasValue=Number(convertUnitDiffDims(gasInputValue, gasInputUnit, reqFlowCapUnit,units,payloadData,false));
    let convertedLiquidValue=Number(convertUnitDiffDims(liquidInputValue, LiquidInputUnit, reqFlowCapUnit,units,{...payloadData, SpGravity:payloadData['SpGravityLiquid']}, false, false));
    let convertedLiq2Value=Number(convertUnitDiffDims(Liq2InputValue, Liquid2InputUnit, reqFlowCapUnit,units,{...payloadData, SpGravity:payloadData['SpGravityLiquid2']}, false, false));

    let Wreq='';
    if(IsLiquid2 ){
        // console.log('In Calculate 21 ReqFlowCapacity >>>>>>>>>>>>>>>>>>> IsLiquid2 >>>>>>>',{IsLiquid2,convertedGasValue,convertedLiquidValue,convertedLiq2Value});
        if(gasInputValue!=='' && liquidInputValue!=='' && Liq2InputValue!=='' && liquidInputValue!=0 && Liq2InputValue!=0){
            Wreq=convertedGasValue+convertedLiquidValue+convertedLiq2Value;
        }
    }else if(IsLiquidOnlyAtInlet){
        // console.log('In Calculate 21 ReqFlowCapacity >>>>>>>>>>>>>>>>>>> IsLiquidOnlyAtInlet >>>>>>>',IsLiquidOnlyAtInlet);
        if(liquidInputValue!=='' && liquidInputValue!=0){
            Wreq=convertedLiquidValue;
        }
    }else if(gasInputValue!=='' && liquidInputValue!=='' && liquidInputValue!=0){
        Wreq=convertedGasValue+convertedLiquidValue;
    }

    
    // console.log('In Calculate 21 ReqFlowCapacity >>>>>>>>>>>>>>>>>>> final >>>>>>>',convertedGasValue,convertedLiquidValue,convertedLiq2Value,Wreq);
    return {Wreq}
}

 const checkP1_CP_T_CT=async (payload)=>{
    // console.log(' >>>>>>>>>>> ',payload);
    const IsSingleORMultiCompSys=payload['IsSingleORMultiCompSys'];
    const YesNoDetermine=payload['YesNoDetermine'];
    let Wv=payload['Wv'];
    let Wl=payload['Wl'];
    if(IsSingleORMultiCompSys=='SingleComponentSystem' && YesNoDetermine==='DetermineCriticalPoint'){
        // const payloadData=payload['payloadData'];
        const UOMs=payload?.units===undefined ? await getUOMs(): payload?.units;
        const CalcMethod=payload['CalculationMethod'];
        const requiredUnits={
            absPressureUOM: CalcMethod==='English'?"abspressure.psia":"abspressure.bara",
            pressureUOM: CalcMethod==='English'?"pressure.psig":"pressure.barg",
            TemperatureUOM: CalcMethod==='English'?"temp.degF":"temp.degC"
        }
        const receivedUnits={
            "absPressureUOM": payload?.selectedUnits?.AtmPressureUOM,
            "pressureUOM": payload?.selectedUnits?.PressureUOM,
            "TemperatureUOM": payload?.selectedUnits?.TemperatureUOM,
        }
        let fromUnit=UOMs.find(u => u.UnitKey === receivedUnits['pressureUOM']);
        let toUnit=UOMs.find(u => u.UnitKey === requiredUnits['pressureUOM']);
        let Pset=payload['SetPressure'];
        Pset=Number(Pset);
        
        Pset=convertUnit(Pset,fromUnit,toUnit);
        let Pover=payload['OverPressure'];
        Pover=Number(Pover);
        Pover=convertUnit(Pover,fromUnit,toUnit);
        let Ploss=payload['InletLoss'];
        Ploss=Number(Ploss);
        Ploss=convertUnit(Ploss,fromUnit,toUnit);
        let Patm=payload['AtmPressure'];
        Patm=Number(Patm);
        fromUnit=UOMs.find(u => u.UnitKey === receivedUnits['absPressureUOM']);
        toUnit=UOMs.find(u => u.UnitKey === requiredUnits['absPressureUOM']);
        // console.log(' >>>>>>>>>>>>. 1111111111111 >>>>>>>>>>> ',Patm,requiredUnits['absPressureUOM'],fromUnit,receivedUnits['absPressureUOM'],toUnit);
        Patm=convertUnit(Patm,fromUnit,toUnit);
        let CriticalPressure=payload['CriticalPressure'];
        CriticalPressure=Number(CriticalPressure);
        CriticalPressure=Number(convertUnit(CriticalPressure,fromUnit,toUnit));

        fromUnit=UOMs.find(u => u.UnitKey === receivedUnits['TemperatureUOM']);
        toUnit=UOMs.find(u => u.UnitKey === requiredUnits['TemperatureUOM']);
        let T=payload['Relieving'];
        T=Number(T);
        // console.log(' >>>>>>>>>>>>. 1111111111111 >>>>>>>>>>> ',T,requiredUnits['TemperatureUOM'],fromUnit,receivedUnits['TemperatureUOM'],toUnit);
        T=Number(convertUnit(T,fromUnit,toUnit));
        
        let CriticalTemperature=payload['CriticalTemperature'];
        CriticalTemperature=Number(CriticalTemperature);
        CriticalTemperature=Number(convertUnit(CriticalTemperature,fromUnit,toUnit));

        const P1= Number(Pset) + Number(Pover) - Number(Ploss) + Number(Patm);

        if(P1 >= CriticalPressure && T >= CriticalTemperature){
            return {Wv:'',Wl:''}
        }
    }
    return {Wv,Wl}
}

const CalculateTup= async(payload)=>{
    // console.log('In CalculateTup >>>>>>>>>>>>>>>>>>',payload?.funcCallingField,payload,payload?.units);
    let finalValues={};
    let operating=payload?.Operating;
    let operatingPopup=payload?.OperatingPopup;
    let operatingPressure=payload?.OperatingPressure;
    let operatingPressurePopup=payload?.OperatingPressurePopup;
    let IsFireSizingFactorCalculated=payload?.IsFireSizingFactorCalculated;
    if(payload?.apiCallingField==='OperatingPopup' || payload?.funcCallingField==='OperatingPopup'){
        operating=operatingPopup;
    }

    if(payload?.apiCallingField==='OperatingPressurePopup' || payload?.funcCallingField==='OperatingPressurePopup'){
        operatingPressure=operatingPressurePopup;
    }

    if(payload?.apiCallingField==='Operating' || payload?.funcCallingField==='Operating' || operatingPopup==="" || operatingPopup===undefined){
        operatingPopup=operating;
    }

    if(payload?.apiCallingField==='OperatingPressure' || payload?.funcCallingField==='OperatingPressure' || operatingPressurePopup==="" || operatingPressurePopup===undefined){
        operatingPressurePopup=operatingPressure;
    }   

    finalValues={...finalValues,"Operating":operating,"OperatingPressure":operatingPressure,"OperatingPopup":operatingPopup,"OperatingPressurePopup":operatingPressurePopup};

    if(payload?.apiCallingField==='VesselWall' || payload?.funcCallingField==='VesselWall'){
        finalValues={...finalValues,"WallTemp":payload?.VesselWall};
    }

    if(payload?.apiCallingField==='WallTemp' || payload?.funcCallingField==='WallTemp'){
        finalValues={...finalValues,"VesselWall":payload?.WallTemp};
    }

    // console.log('In CalculateTup >>>>>>>>>>>>>>>>>> finalValues >>>>>>>>',finalValues);

    if(payload?.FireSizingMethod==='Unwetted' && payload.SetPressure !== '' && payload.SetPressure !== undefined && payload.SetPressure !== null){
        const isEnglishCalc = payload.CalculationMethod === 'English';
        const uoms=payload?.units===undefined ? await getUOMs(): payload?.units;
        // const payload=config.payloadData;
        const requiredUnits = {
            "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
            "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
            "TemperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
       }

   
        const receivedUOM = {
            "absPressureUOM": payload?.selectedUnits?.AtmPressureUOM,
            "pressureUOM": payload?.selectedUnits?.PressureUOM,
            "TemperatureUOM": payload?.selectedUnits?.TemperatureUOM,
        }
        // console.log(' >>>>>>>>>>>>>>>>>>>>> ',Object?.keys(uoms),Object?.values(uoms));
        // console.log(' >>>>>>>>>> ',uoms,typeof uoms,Array.isArray(uoms),uoms?.length);
        let fromUnit=uoms.find(u => u.UnitKey === receivedUOM.pressureUOM);
        let toUnit=uoms.find(u => u.UnitKey === requiredUnits.pressureUOM);
        let Pset=Number(payload.SetPressure);
        Pset = convertUnit(Pset, fromUnit, toUnit); 
        Pset=Number(Pset);
        // console.log('In CalculateTup :: 222222 >>>>>>>>>>>>>>>>>>>>>>',Pset,fromUnit,toUnit);
        let Pover=Number(payload.OverPressure ?? 0);
        Pover = convertUnit(Pover, fromUnit, toUnit);
        Pover=Number(Pover);
        let Ploss=Number(payload.InletLoss ?? 0);
        Ploss = convertUnit(Ploss, fromUnit, toUnit); 
        Ploss=Number(Ploss);
        let Pn=Number(operatingPressure);
        Pn = convertUnit(Pn, fromUnit, toUnit); 
        Pn=Number(Pn);

        fromUnit=uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM);
        toUnit=uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM);
        let Patm=Number(payload.AtmPressure);
        Patm = convertUnit(Patm, fromUnit, toUnit); 
        Patm=Number(Patm);
        
        // console.log('In CalculateTup :: 222222 >>>>>>>>>>>>>>>>>>>>>>',Patm,fromUnit,toUnit);
        fromUnit=uoms.find(u => u.UnitKey === receivedUOM.TemperatureUOM);
        toUnit=uoms.find(u => u.UnitKey === requiredUnits.TemperatureUOM);
        let Tn=Number(operating);
        Tn = convertUnit(Tn, fromUnit, toUnit);
        Tn=Number(Tn);
        const P1=Pset+Pover+Patm-Ploss;
        // console.log('In CalculateTup :: 333333 >>>>>>>>>>>>>>>>>>>>>>',Pset,Pover,Patm,Ploss,Pn,Tn,P1,fromUnit,toUnit);
        
        if(Pn!=0 && Tn!=0){
            let Tup = P1 * Tn / (Pn + Patm);
            // let Tup = P1 * Tn / Pn ;
            // console.log('In CalculateTup :: 444444 >>>>>>>>>>>>>>>>>>>>>>',P1,Tn,Pn,Pn + Patm,Tup,IsFireSizingFactorCalculated);
            if(IsFireSizingFactorCalculated){

                const T=convertUnit(Tup, toUnit, fromUnit);
                return {"Relieving":T,"Tup":Tup,...finalValues};
            }else{
                // console.log('In CalculateTup :: 444444 >>>>>>>>>>>>>>>>>>>>>>',Tup,finalValues);
                return {"Tup":Tup,...finalValues};
            }
            
            
        }else{
            return {"Relieving":"","Tup":"",...finalValues};
        }
        
    }else{
        return {"Tup":"",...finalValues};
    }
}


module.exports = {
    Calculate_14_ReqFlowCapacity,
    Calculate_15_ReqFlowCapacity,
    // Calculate_17_ReqFlowCapacity,
    Calculate_17_Inlet_SpVolMix,
    Calculate_18_Non_Flashing_Wreq,
    Calculate_21_ReqFlowCapacity,
    checkP1_CP_T_CT,
    CalculateTup
};