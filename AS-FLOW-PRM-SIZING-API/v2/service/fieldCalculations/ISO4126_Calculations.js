const ISO4126AppAA = require("../../data/ISO4126AA.json");
const ISO4126AppAB = require("../../data/ISO4126AB.json");
const ISO4126AppAC = require("../../data/ISO4126AC.json");
const { convertUnit } = require("../../utils/helper");
const { getUOMs } = require("../getUom");

const CalculateInterpolateSingleInput=(inputValue,LowerSource,UpperSource,LowerDest,UpperDest)=>{
    //Tsat=("P1_IN" - "UBP") / ("LBP" - "UBP") * ("LBT" - "UBT") + "UBT"
    return (inputValue - UpperSource) / (LowerSource - UpperSource) * (LowerDest - UpperDest) + UpperDest;
}

const CalculateInterpolateMultiInput=(P1,T,PPL,PPU,TPL,TPU,PPL_Obj,PPU_Obj)=>{
    
    let PPL_TPL= PPL_Obj[Object.keys(PPL_Obj).find(key => Number(key) == TPL)];//PPL_Obj[TPL];
    PPL_TPL= PPL_TPL==='-' || PPL_TPL===undefined || PPL_TPL===null?0:Number(PPL_TPL);
    let PPL_TPU= PPL_Obj[Object.keys(PPL_Obj).find(key => Number(key) == TPU)];
    PPL_TPU= PPL_TPU==='-' || PPL_TPU===undefined || PPL_TPU===null?0:Number(PPL_TPU);
    let PPU_TPL= PPU_Obj[Object.keys(PPU_Obj).find(key => Number(key) == TPL)];
    PPU_TPL= PPU_TPL==='-' || PPU_TPL===undefined || PPU_TPL===null?0:Number(PPU_TPL);
    let PPU_TPU= PPU_Obj[Object.keys(PPU_Obj).find(key => Number(key) == TPU)];
    PPU_TPU= PPU_TPU==='-' || PPU_TPU===undefined || PPU_TPU===null?0:Number(PPU_TPU);
    // console.log({PPL,PPU,TPL,TPU,PPL_TPL,PPL_TPU,PPU_TPL,PPU_TPU})
    const P1TL=(P1 - PPU) / (PPL - PPU) * (PPL_TPL - PPU_TPL) + PPU_TPL;
    const P1TU=(P1 - PPU) / (PPL - PPU) * (PPL_TPU - PPU_TPU) + PPU_TPU;
    // console.log({P1TL,P1TU,value:(T - TPU) / (TPL - TPU) * (P1TL - P1TU) + P1TU})
    return (T - TPU) / (TPL - TPU) * (P1TL - P1TU) + P1TU;
}

const getAppAAData=(P1)=>{
    const ISO4126Data=[...ISO4126AppAA];
    let PPL_Obj;
    let PPU_Obj;
    let exactValueFlag=false;

    ISO4126Data.sort((a, b) => a.P1 - b.P1);

    // console.log(JSON.stringify(ISO4126Data))

    for (let index = 0; index < ISO4126Data?.length - 1; index++) {
        if(ISO4126Data[index].P1==P1){
            exactValueFlag=true;
            PPL_Obj = ISO4126Data[index];
            break;
        }else if (ISO4126Data[index].P1 < P1 && ISO4126Data[index+ 1].P1 > P1) {
            PPL_Obj = ISO4126Data[index];
            PPU_Obj = ISO4126Data[index + 1];
            break;
        }
    }
    let AAObject;
    if(PPL_Obj===undefined){
        if(P1<=ISO4126Data[0].P1){
            exactValueFlag=true;
            PPL_Obj = ISO4126Data[0];
        }else if(P1>=ISO4126Data[ISO4126Data.length-1].P1){
            exactValueFlag=true;
            PPL_Obj = ISO4126Data[ISO4126Data.length-1];

        }
    }
    if(exactValueFlag){
        AAObject={...PPL_Obj};
    }else{
        const Tsat=PPL_Obj===undefined?'':CalculateInterpolateSingleInput(P1,PPL_Obj.P1,PPU_Obj.P1,PPL_Obj.Tsat,PPU_Obj.Tsat) //("P1_IN" - "UBP") / ("LBP" - "UBP") * ("LBT" - "UBT") + "UBT"
        
        const K= PPL_Obj===undefined?'':CalculateInterpolateSingleInput(P1,PPL_Obj.P1,PPU_Obj.P1,PPL_Obj.Ksat,PPU_Obj.Ksat)
        
        const Kssat= PPL_Obj===undefined?'':CalculateInterpolateSingleInput(P1,PPL_Obj.P1,PPU_Obj.P1,PPL_Obj.Kssat,PPU_Obj.Kssat)
        
        AAObject={P1,Tsat,Ksat:K,Kssat:Kssat};
    }
    // console.log('In getAppAAData >>>>>>>>>>>>>>>>> ',P1,PPL_Obj,PPU_Obj,exactValueFlag);
    return AAObject;
}

const calculateValue=(data,P1,T)=>{
    // const ISO4126ACData=[...ISO4126AppAC]

    let PPL_Obj;
    let PPU_Obj;
    let PPL;
    let PPU;
    let TPL;
    let TPU;
    let P1ExactValueFlag=false;
    let TExactValueFlag=false;

    data.sort((a, b) => a.P1 - b.P1);
    // console.log('Data Calculations >>>',JSON.stringify(data))
    for (let index = 0; index < data?.length - 1; index++) {
        // console.log('In condition >>>>>>>>>>>>>>>> ',P1,data[index].P1,data[index+1].P1,data[index].P1 < P1 && data[index+1].P1 > P1,data[index].P1 < P1 , data[index+1].P1> P1)
        if(data[index].P1==P1){
            P1ExactValueFlag=true;
            PPL_Obj = data[index];
            break;
        }else if (data[index].P1 < P1 && data[index+1].P1 > P1) {
            
            PPL_Obj = data[index];
            PPU_Obj = data[index+1];
            PPL = PPL_Obj.P1;
            PPU = PPU_Obj.P1;
            break;
        }
    }
    // console.log(`Data Calculations >>> calculate Value for ISO 11111  >>>>>>>>>>>>>>>> P1: ${P1} ,PPL_Obj: ${JSON.stringify(PPL_Obj)},PPU_Obj: ${JSON.stringify(PPU_Obj)}, PPL_Obj!==undefined && PPU_Obj!==undefined: ${PPL_Obj!==undefined && PPU_Obj!==undefined})}`)
    if(PPL_Obj!==undefined && PPU_Obj!==undefined){
        const temperatureKeys = Object.keys(PPL_Obj).filter(key => !isNaN(key)).map(Number).sort((a, b) => a - b);
        // console.log(`Data Calculations >>> calculate Value for ISO 2222 >>>>>>>>>>>>>>>> temperatureKeys ${temperatureKeys} ,T: ${T}`)
        for (let i = 0; i < temperatureKeys.length - 1; i++) {
            if(Number(temperatureKeys[i]) == T){
                TExactValueFlag=true;
                TPL = Number(temperatureKeys[i]);
                break;
            }else if (Number(temperatureKeys[i]) < T && Number(temperatureKeys[i + 1]) > T) {
                TPL = Number(temperatureKeys[i]);
                TPU = Number(temperatureKeys[i + 1]);
                break;
            }
        }
        // console.log(`Data Calculations >>> calculate Value for ISO 33333 >>>>>>>>>>>>>>>> TExactValueFlag ${TExactValueFlag} ,P1ExactValueFlag: ${P1ExactValueFlag}, TPL: ${TPL}, TPU: ${TPU}`)
        
        if(TExactValueFlag && P1ExactValueFlag){
            return TPL;
        }else if(P1ExactValueFlag){

        }else if(TExactValueFlag){
            let PPL_TPL = Number(PPL_Obj[Object.keys(PPL_Obj).find(key => Number(key) == TPL)]);
            PPL_TPL= PPL_TPL==='-' || PPL_TPL===undefined || PPL_TPL===null?0:Number(PPL_TPL);
            let PPU_TPL = Number(PPU_Obj[Object.keys(PPU_Obj).find(key => Number(key) == TPL)]);
            PPU_TPL= PPU_TPL==='-' || PPU_TPL===undefined || PPU_TPL===null?0:Number(PPU_TPL);
            const value=CalculateInterpolateSingleInput(P1,PPL_Obj.P1,PPU_Obj.P1,PPL_TPL,PPU_TPL);
            // console.log({P1,PPL_P1:PPL_Obj.P1,PPU_P1:PPU_Obj.P1,PPL_TPL:PPL_TPL,PPU_TPL:PPU_TPL,value})
            return value;
        }else{
            // console.log(' Exact Value Flag>>>>>>>>>>>>>>>>>>>>> ',{P1,T,PPL,PPU,TPL,TPU,PPL_Obj,PPU_Obj});
            // console.log(`Data Calculations >>> calculate Value for ISO 44444444 >>>>>>>>>>>>>>>> P1: ${P1},T:${T},PPL:${PPL},PPU:${PPU},TPL:${TPL},TPU:${TPU},PPL_Obj:${PPL_Obj},PPU_Obj:${PPU_Obj}`)
            return CalculateInterpolateMultiInput(P1,T,PPL,PPU,TPL,TPU,PPL_Obj,PPU_Obj);
        }
    }
    return "";
}

const calculateValueKsc=(data,P1,T)=>{
    // const ISO4126ACData=[...ISO4126AppAC]

    let PPL_Obj;
    let PPU_Obj;
    let PPL;
    let PPU;
    let TPL;
    let TPU;
    let P1ExactValueFlag=false;
    let TExactValueFlag=false;

    data.sort((a, b) => a.P1 - b.P1);
    // console.log('Data Calculations >>>',JSON.stringify(data))
    for (let index = 0; index < data?.length - 1; index++) {
        // console.log('In condition >>>>>>>>>>>>>>>> ',P1,data[index].P1,data[index+1].P1,data[index].P1 < P1 && data[index+1].P1 > P1,data[index].P1 < P1 , data[index+1].P1> P1)
        if(data[index].P1==P1){
            P1ExactValueFlag=true;
            PPL_Obj = data[index];
            break;
        }else if (data[index].P1 < P1 && data[index+1].P1 > P1) {
            
            PPL_Obj = data[index];
            PPU_Obj = data[index+1];
            PPL = PPL_Obj.P1;
            PPU = PPU_Obj.P1;
            break;
        }
    }
    // console.log({PPL_tempAtMaxKsc:PPL_Obj?.tempAtMaxKsc,PPU_tempAtMaxKsc:PPU_Obj?.tempAtMaxKsc,PPL_Obj,PPU_Obj})
    // console.log(`Data Calculations >>> calculate Value for ISO 11111  >>>>>>>>>>>>>>>> P1: ${P1} ,PPL_Obj: ${JSON.stringify(PPL_Obj)},PPU_Obj: ${JSON.stringify(PPU_Obj)}, PPL_Obj!==undefined && PPU_Obj!==undefined: ${PPL_Obj!==undefined && PPU_Obj!==undefined})}`)
    const tempAtMaxKsc = PPL_Obj?.tempAtMaxKsc;
    const TgtminReqTemp=T>=PPL_Obj?.tempAtMaxKsc;
    
    if(TgtminReqTemp){
        if(PPL_Obj!==undefined && PPU_Obj!==undefined){
            const temperatureKeys = Object.keys(PPL_Obj).filter(key => !isNaN(key)).map(Number).sort((a, b) => a - b);
            // console.log(`Data Calculations >>> calculate Value for ISO 2222 >>>>>>>>>>>>>>>> temperatureKeys ${temperatureKeys} ,T: ${T}`)
            for (let i = 0; i < temperatureKeys.length - 1; i++) {
                if(Number(temperatureKeys[i]) == T){
                    TExactValueFlag=true;
                    TPL = Number(temperatureKeys[i]);
                    break;
                }else if (Number(temperatureKeys[i]) < T && Number(temperatureKeys[i + 1]) > T) {
                    TPL = Number(temperatureKeys[i]);
                    TPU = Number(temperatureKeys[i + 1]);
                    break;
                }
            }
            // console.log(`Data Calculations >>> calculate Value for ISO 33333 >>>>>>>>>>>>>>>> TExactValueFlag ${TExactValueFlag} ,P1ExactValueFlag: ${P1ExactValueFlag}, TPL: ${TPL}, TPU: ${TPU}`)
            
            if(TExactValueFlag && P1ExactValueFlag){
                return {Ksc:TPL,TgtminReqTemp,tempAtMaxKsc};
            // }else if(P1ExactValueFlag){

            }else if(TExactValueFlag){
                let PPL_TPL = Number(PPL_Obj[Object.keys(PPL_Obj).find(key => Number(key) == TPL)]);
                PPL_TPL= PPL_TPL==='-' || PPL_TPL===undefined || PPL_TPL===null?0:Number(PPL_TPL);
                let PPU_TPL = Number(PPU_Obj[Object.keys(PPU_Obj).find(key => Number(key) == TPL)]);
                PPU_TPL= PPU_TPL==='-' || PPU_TPL===undefined || PPU_TPL===null?0:Number(PPU_TPL);
                const value=CalculateInterpolateSingleInput(P1,PPL_Obj.P1,PPU_Obj.P1,PPL_TPL,PPU_TPL);
                // console.log({P1,PPL_P1:PPL_Obj.P1,PPU_P1:PPU_Obj.P1,PPL_TPL:PPL_TPL,PPU_TPL:PPU_TPL,value})
                return {Ksc:value,TgtminReqTemp,tempAtMaxKsc};
            }else{
                // console.log(' Exact Value Flag>>>>>>>>>>>>>>>>>>>>> ',{P1,T,PPL,PPU,TPL,TPU,PPL_Obj,PPU_Obj});
                // console.log(`Data Calculations >>> calculate Value for ISO 44444444 >>>>>>>>>>>>>>>> P1: ${P1},T:${T},PPL:${PPL},PPU:${PPU},TPL:${TPL},TPU:${TPU},PPL_Obj:${PPL_Obj},PPU_Obj:${PPU_Obj}`)
                const value= CalculateInterpolateMultiInput(P1,T,PPL,PPU,TPL,TPU,PPL_Obj,PPU_Obj);
                return {Ksc:value,TgtminReqTemp};
            }
        }
    }
    
    return {Ksc:"",TgtminReqTemp,tempAtMaxKsc:PPL_Obj?.tempAtMaxKsc};
}


const SteamISOCalculations= async (payload)=>{
    // console.log(payload)
    const uoms=payload?.units===undefined ? await getUOMs(): payload?.units;
    const requiredUnits = {
            "absPressureUOM": "abspressure.bara",
            "pressureUOM": "pressure.barg",
            "TemperatureUOM": "temp.degC",
    };
    const receivedUOM = {
        "absPressureUOM": payload?.selectedUnits?.AtmPressureUOM,
        "pressureUOM": payload?.selectedUnits?.PressureUOM,
        "TemperatureUOM": payload?.selectedUnits?.TemperatureUOM===undefined || payload?.selectedUnits?.TemperatureUOM===null || payload?.selectedUnits?.TemperatureUOM===''?'temp.degF':payload?.selectedUnits?.TemperatureUOM,
    };
    let fromUnit=receivedUOM["pressureUOM"];
    fromUnit=uoms.find(uom => uom.UnitKey === fromUnit);
    let toUnit=requiredUnits["pressureUOM"];
    toUnit=uoms.find(uom => uom.UnitKey === toUnit);
    let Pset=payload["SetPressure"];
 
    Pset=Pset!==undefined && Pset!==''?convertUnit(Pset,fromUnit,toUnit):0;

    let Pover=payload["OverPressure"];

    Pover=Pover!==undefined && Pover!==''?convertUnit(Pover,fromUnit,toUnit):0;

    let Ploss=payload["InletLoss"];
    Ploss=Ploss!==undefined && Ploss!==''?convertUnit(Ploss,fromUnit,toUnit):0;

    let Pabs=payload["AtmPressure"];
    fromUnit=receivedUOM["absPressureUOM"];
    fromUnit=uoms.find(uom => uom.UnitKey === fromUnit);
    toUnit=requiredUnits["absPressureUOM"];
    toUnit=uoms.find(uom => uom.UnitKey === toUnit);

    Pabs=Pabs!==undefined && Pabs!==''?convertUnit(Pabs,fromUnit,toUnit):0;
    const P1=Number(Pset)+Number(Pover)-Number(Ploss)+Number(Pabs);
  
    const IsSaturatedSteam=payload["IsSaturatedSteam"]??false;
    const IsWetSteam=payload["IsWetSteam"]??false;
    const DrynessFactor=Number(payload["DrynessFactor"])??1;
    let xs=!IsSaturatedSteam && !IsWetSteam?1:DrynessFactor===undefined?1:DrynessFactor;
    
    fromUnit=receivedUOM["TemperatureUOM"];
    fromUnit=uoms.find(uom => uom.UnitKey === fromUnit);
    toUnit=requiredUnits["TemperatureUOM"];
    toUnit=uoms.find(uom => uom.UnitKey === toUnit);
    let T=payload["Relieving"];
    // console.log('ISO4126 Calculations >>>>>>>>>>>>>>>>>>>> ',{Pset,Pover,Ploss,Pabs,P1,T,IsSaturatedSteam,IsWetSteam,DrynessFactor});
    
    let converted_T=T!==undefined && T!==''?convertUnit(T,fromUnit,toUnit):'';
    
    
    let Tsat,Ksat,Kssat,Ks,K,AAObject;
    let Error=[];
    let calculationFlag=true;
    let SteamCondition='';
    
    if(P1<=220){
        
        AAObject=getAppAAData(P1);
        Tsat=AAObject?.Tsat;
        Ksat=AAObject?.Ksat;
        Kssat=AAObject?.Kssat;
        // console.log(`ISO4126 Calculations >>> 00000 P1<=220 >>>>>>>>>>>>>>>>> P1: ${P1}, converted_T<=Tsat :${converted_T<=Tsat}, converted_T:${converted_T}, Tsat:${Tsat}, Ksat:${Ksat}, Kssat:${Kssat}, IsSaturatedSteam: ${IsSaturatedSteam}, IsWetSteam:${IsWetSteam}, xs:${xs}`)
        if(IsSaturatedSteam || IsWetSteam){
            converted_T=Tsat;
        }else if(T==='' || T===undefined){
            converted_T=Tsat;   
        }
        if(converted_T<=Tsat){
            Ks=Kssat;
            K=Ksat;
            calculationFlag=false;
            if(converted_T==Tsat){
                SteamCondition=xs==1?'Saturated':xs<1?'Wet':'';
            }else{
                SteamCondition='Not set'
            }
        }else{
            SteamCondition='Superheated';
        }
    }else if(T>373.7){
        SteamCondition='Supercritical';
    }else{
        SteamCondition='Not set';  
    }
    
    if(calculationFlag){
        Ks=calculateValue([...ISO4126AppAB],P1,(T==='' || T===undefined) && converted_T===0?0:converted_T);
        K= calculateValue([...ISO4126AppAC],P1,(T==='' || T===undefined) && converted_T===0?0:converted_T);
        K= K=='' || isNaN(K)?'1.310':K
        if((T==='' || T===undefined) && converted_T===0){
            converted_T='';
        }
    }
    // console.log('ISO4126 Calculations >>>>>>>>>>>>>>>>>>>> ',{Pset,Pover,Ploss,Pabs,P1,T,converted_T,IsSaturatedSteam,IsWetSteam,DrynessFactor});
    T=converted_T!==''?convertUnit(converted_T,toUnit,fromUnit):converted_T;
    Tsat=P1<=220?convertUnit(Tsat,toUnit,fromUnit):'';
    const result={"IsentropicExponent":K,"Relieving":T,"SaturatedSteam":Tsat,Ks,SteamCondition,"DrynessFactor":xs,Error,"TemperatureUOM":fromUnit.UnitKey}
    // console.log('ISO4126 Calculations >>>ISO  >>>>>>>>>>>>>>>>>>>> ',result)
    
    return result;
}

module.exports = {
    SteamISOCalculations,
    getAppAAData,
    calculateValue,
    calculateValueKsc
};