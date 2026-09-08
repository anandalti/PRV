const math = require('mathjs');
const { convertUnit, convertUnitDiffDims, kdCalculation, knCalculation, ValidateExpression, KbKwValidateExpressions, IsCriticalFlow, KdKxCheck, Calculate_W, ALP_Models, Get_W_Equ, ModelNumbers } = require('../../utils/helper');
const { calculateKv, TestcalculateKv } = require('../../utils/calculateKv');
const {
    Equation_1p1, Equation_1p4,Equation_1p6, Equation_1p15,
    Equation_1p3a,
    Equation_1p3b,
    Equation_1p5b,
} = require('./Equations');
const calculateCDTP = require('../../utils/calculateCDTP');
const { CalcSaturatedTempertureKsc } = require('../CalculateSaturatedTemperature');
const { MaxPressureFlowCapacity } = require('../../../helper/reportsDataMapper/valveSizingInformation');

let calculations = {};

const MergedCode_21=(GasData,LiquidData,Liquid2Data)=>{
    let localGasData={};
    let localLiquidData={};
    let localLiquid2Data={};
    Object.keys(GasData).forEach((key)=>{
        localGasData[`${key}G`]=GasData[key];
    });
    Object.keys(LiquidData).forEach((key)=>{
        localLiquidData[`${key}L`]=LiquidData[key];
    });
    if(Liquid2Data!==undefined){
        Object.keys(Liquid2Data).forEach((key)=>{
            localLiquid2Data[`${key}L2`]=Liquid2Data[key];
        });
    }
    return {...localGasData,...localLiquidData,...localLiquid2Data};
}

function FCWVTK_WF21(AsmeApiDataSet, valve, inputs, uoms) {
    // if(valve?.ModelNumber==900 && valve?.Orifice==5){
        // console.log('In wf 21 >>>>>>>>>>>>>>>>>>>>>>>>> ',valve?.ModelNumber,valve?.ValveId,valve?.Orifice,valve?.Service);
    // }
    
    let GasData={};
    let LiquidData={};
    let Liquid2Data;
    if(inputs?.IsLiquid2){
        Liquid2Data={};
    }
    const ValveDataSetMultiPhase=inputs?.ValveDataSetMultiPhase;
    const isEnglishCalc = inputs.CalculationMethod === 'English';
    if(valve?.Services?.length>1){
        let localGInputs={...inputs,Wreq:inputs?.Wv,FlowCapacityUOM:inputs?.FlowCapacityWvUOM}
        GasData= FCWVTK_0105066970_0207087374(AsmeApiDataSet, valve, localGInputs, uoms);

        let localValve={...valve,Service:'L',ValveId:valve?.ValveIdL,ValvePropertyId:valve?.ValvePropertyIdL,Kmax:valve?.KmaxL,KAPI:valve?.KAPIL};

        let localinputs={...inputs,SpGravity:inputs?.SpGravityLiquid,Viscosity:inputs?.ViscosityLiquid,VlreqMass:inputs?.Wl,Wreq:inputs?.Wl,ViscosityCorrectionFactor:false,FlowCapacityUOM:inputs?.FlowCapacityLiqUOM};
        LiquidData=FCWVTK_13157778_14167980(AsmeApiDataSet, localValve, localinputs, uoms);
        const [dimension, unit] = localinputs?.FlowCapacityUOM !== undefined ? localinputs?.FlowCapacityUOM?.split('.') : ['', ''];
        const isVolumetric = !(dimension === 'massflow');
        
        let reqflowCapacityUOM= isEnglishCalc ? "liquidvolflow.GPMUS" : "liquidvolflow.m3hr";
        reqflowCapacityUOM=uoms.find(u => u.UnitKey === reqflowCapacityUOM)
        let reqMassflowCapacityUOM= isEnglishCalc ? "massflow.lbhr" : "massflow.kghr";
        reqMassflowCapacityUOM=uoms.find(u => u.UnitKey === reqMassflowCapacityUOM);
        // const reqflowCapacityUOM= isVolumetric?localinputs?.FlowCapacityUOM:isEnglishCalc ? "liquidvolflow.GPMUS" : "liquidvolflow.m3hr";
        const Wreq=LiquidData?.Vreq;
        const Wsel=LiquidData?.Vsel;
        
        
        let ReResponse=JSON.parse(LiquidData?.ReResponse);
        let equationValues={...ReResponse?.equationValues};
        let requiredUnits=equationValues?.requiredUnits;
        let receivedUOM=equationValues?.receivedUOM;
        let equReceivedUOM=localinputs?.FlowCapacityUOM;
        equReceivedUOM=uoms.find(u => u.UnitKey === equReceivedUOM)
        const equWreq=convertUnitDiffDims(Wreq, equReceivedUOM, reqMassflowCapacityUOM, uoms, localinputs);
        const equWsel=convertUnitDiffDims(Wsel, equReceivedUOM, reqMassflowCapacityUOM, uoms, localinputs);

        let Vreq=convertUnitDiffDims(LiquidData?.Vreq, equReceivedUOM, reqflowCapacityUOM, uoms, localinputs);
        let Vsel=convertUnitDiffDims(LiquidData?.Vsel, equReceivedUOM, reqflowCapacityUOM, uoms, localinputs);

        requiredUnits={...requiredUnits,flowCapacityLiqUOM:reqflowCapacityUOM.UnitName,flowCapacityUOM:reqMassflowCapacityUOM.UnitName}
        receivedUOM={...receivedUOM,flowCapacityLiqUOM:reqflowCapacityUOM.UnitName,flowCapacityUOM:reqMassflowCapacityUOM.UnitName}
        equationValues={...equationValues,requiredUnits,receivedUOM,Vsel:Vsel,Vreq:Vreq,Wreq:equWreq,Wsel:equWsel};

        let inputValues={...ReResponse?.inputValues};
        let uomRequired=ReResponse?.uomRequired;
        let uomReceived=ReResponse?.uomReceived;
        let inpflowCapacityUOM= isVolumetric?localinputs?.FlowCapacityUOM:"liquidvolflow.Lmin";
        inpflowCapacityUOM=uoms.find(u => u.UnitKey === inpflowCapacityUOM);
        let inpMassflowCapacityUOM= inputs?.FlowCapacityUOM;
        inpMassflowCapacityUOM=uoms.find(u => u.UnitKey === inpMassflowCapacityUOM);
        let inpReceivedUOM=localinputs?.FlowCapacityUOM;
        inpReceivedUOM=uoms.find(u => u.UnitKey === inpReceivedUOM);
        const inpWreq=convertUnitDiffDims(Wreq, inpReceivedUOM, inpMassflowCapacityUOM, uoms, localinputs);
        const inpWsel=convertUnitDiffDims(Wsel, inpReceivedUOM, inpMassflowCapacityUOM, uoms, localinputs);

        Vreq=convertUnitDiffDims(LiquidData?.Vreq, inpReceivedUOM, inpflowCapacityUOM, uoms, localinputs);
        Vsel=convertUnitDiffDims(LiquidData?.Vsel, inpReceivedUOM, inpflowCapacityUOM, uoms, localinputs);
        
        uomRequired={...uomRequired,flowCapacityLiqUOM:reqflowCapacityUOM.UnitName,flowCapacityUOM:reqMassflowCapacityUOM.UnitName}
        uomReceived={...uomReceived,flowCapacityLiqUOM:inpflowCapacityUOM.UnitName,flowCapacityUOM:inpMassflowCapacityUOM.UnitName}
        inputValues={...inputValues,Vsel,Vreq,Wreq:inpWreq,Wsel:inpWsel};

        ReResponse=JSON.stringify({...ReResponse,equationValues,inputValues,uomRequired,uomReceived})
        LiquidData={...LiquidData,Wreq,Wsel,Vreq,Vsel,ReResponse};

        if(inputs?.IsLiquid2){
            localinputs={...inputs,SpGravity:inputs?.SpGravityLiquid2,Viscosity:inputs?.ViscosityLiquid2,VlreqMass:inputs?.Liquid2Wl,Wreq:inputs?.Liquid2Wl,ViscosityCorrectionFactor:false,FlowCapacityUOM:inputs?.FlowCapacityLiq2UOM};
            Liquid2Data=FCWVTK_13157778_14167980(AsmeApiDataSet, localValve, localinputs, uoms);
            
            const [dimension, unit] = localinputs?.FlowCapacityUOM !== undefined ? localinputs?.FlowCapacityUOM?.split('.') : ['', ''];
            const isVolumetric = !(dimension === 'massflow');
            
            let reqflowCapacityUOM= isEnglishCalc ? "liquidvolflow.GPMUS" : "liquidvolflow.m3hr";
            reqflowCapacityUOM=uoms.find(u => u.UnitKey === reqflowCapacityUOM)
            let reqMassflowCapacityUOM= isEnglishCalc ? "massflow.lbhr" : "massflow.kghr";
            reqMassflowCapacityUOM=uoms.find(u => u.UnitKey === reqMassflowCapacityUOM);
           
            const Wreq=Liquid2Data?.Vreq;
            const Wsel=Liquid2Data?.Vsel;
            
            
            let ReResponse=JSON.parse(Liquid2Data?.ReResponse);
            let equationValues={...ReResponse?.equationValues};
            let requiredUnits=equationValues?.requiredUnits;
            let receivedUOM=equationValues?.receivedUOM;
            let equReceivedUOM=localinputs?.FlowCapacityUOM;
            equReceivedUOM=uoms.find(u => u.UnitKey === equReceivedUOM)
            const equWreq=convertUnitDiffDims(Wreq, equReceivedUOM, reqMassflowCapacityUOM, uoms, localinputs);
            const equWsel=convertUnitDiffDims(Wsel, equReceivedUOM, reqMassflowCapacityUOM, uoms, localinputs);
    
            let Vreq=convertUnitDiffDims(Liquid2Data?.Vreq, equReceivedUOM, reqflowCapacityUOM, uoms, localinputs);
            let Vsel=convertUnitDiffDims(Liquid2Data?.Vsel, equReceivedUOM, reqflowCapacityUOM, uoms, localinputs);
    
            requiredUnits={...requiredUnits,flowCapacityLiqUOM:reqflowCapacityUOM.UnitName,flowCapacityUOM:reqMassflowCapacityUOM.UnitName}
            receivedUOM={...receivedUOM,flowCapacityLiqUOM:reqflowCapacityUOM.UnitName,flowCapacityUOM:reqMassflowCapacityUOM.UnitName}
            equationValues={...equationValues,requiredUnits,receivedUOM,Vsel:Vsel,Vreq:Vreq,Wreq:equWreq,Wsel:equWsel};
    
            let inputValues={...ReResponse?.inputValues};
            let uomRequired=ReResponse?.uomRequired;
            let uomReceived=ReResponse?.uomReceived;
            let inpflowCapacityUOM= isVolumetric?localinputs?.FlowCapacityUOM:"liquidvolflow.Lmin";
            inpflowCapacityUOM=uoms.find(u => u.UnitKey === inpflowCapacityUOM);
            let inpMassflowCapacityUOM= inputs?.FlowCapacityUOM;
            inpMassflowCapacityUOM=uoms.find(u => u.UnitKey === inpMassflowCapacityUOM);
            let inpReceivedUOM=localinputs?.FlowCapacityUOM;
            inpReceivedUOM=uoms.find(u => u.UnitKey === inpReceivedUOM);
            const inpWreq=convertUnitDiffDims(Wreq, inpReceivedUOM, inpMassflowCapacityUOM, uoms, localinputs);
            const inpWsel=convertUnitDiffDims(Wsel, inpReceivedUOM, inpMassflowCapacityUOM, uoms, localinputs);
    
            Vreq=convertUnitDiffDims(Liquid2Data?.Vreq, inpReceivedUOM, inpflowCapacityUOM, uoms, localinputs);
            Vsel=convertUnitDiffDims(Liquid2Data?.Vsel, inpReceivedUOM, inpflowCapacityUOM, uoms, localinputs);
            
            uomRequired={...uomRequired,flowCapacityLiqUOM:reqflowCapacityUOM.UnitName,flowCapacityUOM:reqMassflowCapacityUOM.UnitName}
            uomReceived={...uomReceived,flowCapacityLiqUOM:inpflowCapacityUOM.UnitName,flowCapacityUOM:inpMassflowCapacityUOM.UnitName}
            inputValues={...inputValues,Vsel,Vreq,Wreq:inpWreq,Wsel:inpWsel};
    
            ReResponse=JSON.stringify({...ReResponse,equationValues,inputValues,uomRequired,uomReceived})
            Liquid2Data={...Liquid2Data,Wreq,Wsel,Vreq,Vsel,ReResponse};

           
        }
    }
    
    let mergedData=MergedCode_21(GasData,LiquidData,Liquid2Data);

    let Wreqp=inputs?.Wreq;
    let reqflowCapacityUOM= isEnglishCalc ? "massflow.lbhr" : "massflow.kghr";
    reqflowCapacityUOM=uoms.find(u => u.UnitKey === reqflowCapacityUOM);
    let recFlowCapacityUOM=inputs?.FlowCapacityUOM;
    recFlowCapacityUOM=uoms.find(u => u.UnitKey === recFlowCapacityUOM);
    const WreqR=convertUnitDiffDims(Wreqp, recFlowCapacityUOM, reqflowCapacityUOM, uoms, inputs);
    // if(valve?.ModelNumber=='900' && valve?.Orifice=='5' && AsmeApiDataSet==="ASME"){
    //     console.log(' >>>>>>>>>>>>>>>>> ',{GasData,LiquidData,Liquid2Data,inputs})
    // }
    let ReResponseG=JSON.parse(GasData?.ReResponse)?.equationValues;
    let ReResponseL=JSON.parse(LiquidData?.ReResponse)?.equationValues;
    let ReResponseL2=inputs?.IsLiquid2?JSON.parse(Liquid2Data?.ReResponse)?.equationValues:null;
    let Wg=ReResponseG?.Wreq; //inputs?.Wv;
    let Wl=ReResponseL?.Wreq; //inputs?.Wl;
    let Wl2=inputs?.IsLiquid2?ReResponseL2?.Wreq:0; //inputs?.Liquid2Wl;
    // let Wl2=inputs?.IsLiquid2?inputs?.Liquid2Wl:0;
    let Wgmax=ReResponseG?.Wsel; //GasData?.Wsel;
    let Wlmax=ReResponseL?.Wsel ?? ReResponseL?.Vsel; //LiquidData?.Wsel ?? LiquidData?.Vsel;
    let Wl2max=inputs?.IsLiquid2?ReResponseL2?.Wsel ?? ReResponseL2?.Vsel :0 //inputs?.IsLiquid2?Liquid2Data?.Wsel ?? Liquid2Data?.Vsel:0;
    
    let WgMaxActual=GasData?.WActual; //GasData?.WselInput;
    let WlMaxActual=LiquidData?.WActual ?? LiquidData?.VActual; //LiquidData?.WselInput ?? LiquidData?.VselInput;
    let Wl2MaxActual=inputs?.IsLiquid2?Liquid2Data?.WActual ?? Liquid2Data?.VActual :0 //inputs?.IsLiquid2?Liquid2Data?.WselInput ?? Liquid2Data?.VselInput:0;
    // console.log(' >>>>>>>>>>>>>>>>>>> ',ReResponseG?.WActual,ReResponseL?.WActual ?? ReResponseL?.VActual,ReResponseL2?.WActual ?? ReResponseL2?.VActual,WgMaxActual,WlMaxActual,Wl2MaxActual)
    let Kv=ReResponseL?.Kv;
    let Kv2=inputs?.IsLiquid2?ReResponseL2?.Kv:0;
    let Kvfinal=ReResponseL?.Kvreq;
    let Kv2final=inputs?.IsLiquid2?ReResponseL2?.Kvreq:0;
    // if((Kvfinal<0.3 || Kv2final<0.3) && valve?.ModelNumber=='900'){
    //     console.log(' >>>>>>>>>>>>>>>>> ',valve?.ModelNumber,valve?.Orifice,Kv,Kvfinal,Kv2final,AsmeApiDataSet)
    // }
    let Wsel=inputs?.IsLiquid2?WreqR/((Wg/Wgmax)+((Wl*Kv)/(Wlmax*Kvfinal))+((Wl2*Kv2)/(Wl2max*Kv2final))):WreqR/((Wg/Wgmax)+((Wl*Kv)/(Wlmax*Kvfinal)));
    let WActual= inputs?.IsLiquid2?WreqR/((Wg/WgMaxActual)+((Wl*Kv)/(WlMaxActual*Kvfinal))+((Wl2*Kv2)/(Wl2MaxActual*Kv2final))):WreqR/((Wg/WgMaxActual)+((Wl*Kv)/(WlMaxActual*Kvfinal)));

    let AreqG=(ReResponseG?.Areq);
    AreqG= isNaN(AreqG) ? 0 : AreqG;
    let AreqL=(ReResponseL?.Areq);
    AreqL= isNaN(AreqL) ? 0 : AreqL;
    let AreqL2=inputs?.IsLiquid2?(ReResponseL2?.Areq):0;
    AreqL2= isNaN(AreqL2) ? 0 : AreqL2;
    let Areq=AreqG+AreqL+AreqL2;

    let reqOrificeAreaUOM= isEnglishCalc ? "area.in2" : "area.cm2";
    reqOrificeAreaUOM=uoms.find(u => u.UnitKey === reqOrificeAreaUOM);

    let recOrificeAreaUOM= inputs?.OrificeAreaUOM;
    recOrificeAreaUOM=uoms.find(u => u.UnitKey === recOrificeAreaUOM);

    let ReResponse={
        Areq,
        Wsel,
        WselInput:convertUnitDiffDims(Wsel, reqflowCapacityUOM, recFlowCapacityUOM, uoms, inputs),
        AreqInput:convertUnitDiffDims(Areq, reqOrificeAreaUOM, recOrificeAreaUOM, uoms, inputs),
        Wreq:WreqR,
        WreqInput:Wreqp,
        WActual,
        Kb:GasData?.Kb,
        wreqUOM:recFlowCapacityUOM?.UnitName,
        wreqUOMRequired:reqflowCapacityUOM?.UnitName,
        ReResponseG:JSON.parse(GasData?.ReResponse),
        ReResponseL:JSON.parse(LiquidData?.ReResponse),
        ReResponseL2:inputs?.IsLiquid2?JSON.parse(Liquid2Data?.ReResponse):null,

        
    }
    // if(valve?.ModelNumber=='546' && valve?.Orifice=='H' && AsmeApiDataSet==="API"){
    //     console.log({GasData,mergedData});
        
    //     console.log('In wf 21 >>>>>>>>>>>>>>>>>>>>>>>>> ',valve?.ModelNumber,valve?.ValveId,valve?.Orifice,valve?.Service,ReResponse?.AreqInput,ReResponse?.Wsel,ReResponse?.WselInput,reqflowCapacityUOM?.UnitName,recFlowCapacityUOM?.UnitName,ReResponse?.Wreq,ReResponse?.WreqInput);
    // }
    mergedData={...mergedData,Areq:ReResponse?.AreqInput,Wsel:ReResponse?.WselInput,Wreq:Wreqp,
        ValveDataSet2Phase:AsmeApiDataSet,
        ReResponse:JSON.stringify(ReResponse),
        Asel:ReResponse?.AreqInput,
        Wsel,
        WActual,
        Services:valve.Services,ValveIdL:valve?.ValveIdL,ValvePropertyIdL:valve?.ValvePropertyIdL,KmaxL:valve?.KmaxL,KAPIL:valve?.KAPIL,
        valveKmax: valve?.Kmax, valveKApi: valve?.KAPI??valve?.KApi,
        SizingBasis: inputs.SizingBasis,SystemMAWP: inputs.SystemMAWP,PoverP:inputs?.OverPressurePer,
        KADataSet:AsmeApiDataSet,CalculationMethod:inputs.CalculationMethod,
        IsASMESection8: inputs?.IsASMESection8,valveA:valve.A,valveAAPI: valve.AAPI,
        service: inputs?.service, ShortName: valve?.ShortName, 
        m: valve?.m, b: valve?.b, E: valve?.E, Tp: valve?.Tp,Tpunits:valve?.Tpunits,
        Viscosity: Number(inputs?.Viscosity),SpGravity: Number(inputs?.SpGravity),
        KCpByCv: inputs.KCpByCv, RuptureDiscKcFd: inputs?.RuptureDiscKcFd,
            
        ValveDataSetMultiPhase:inputs.ValveDataSetMultiPhase,
        Wv:inputs.Wv,FlowCapacityWvUOM:inputs.FlowCapacityWvUOM,
        SpGravityLiquid:inputs?.SpGravityLiquid,ViscosityLiquid:inputs?.ViscosityLiquid,Wl:inputs?.Wl,FlowCapacityLiqUOM:inputs?.FlowCapacityLiqUOM,
        IsLiquid2:inputs?.IsLiquid2,SpGravityLiquid2:inputs?.SpGravityLiquid2,ViscosityLiquid2:inputs?.ViscosityLiquid2,Liquid2Wl:inputs?.Liquid2Wl,FlowCapacityLiq2UOM:inputs?.FlowCapacityLiq2UOM,
        OrificeAreaUOM:inputs?.OrificeAreaUOM,
        FlowCapacityUOM:inputs?.FlowCapacityUOM,
        k:inputs.KCpByCv, Code:inputs.Code, Kc:inputs?.RuptureDiscKcFd, M:inputs.MolWeight, Z:inputs.Compressibility, 
        T: inputs.Relieving, Patm: inputs.AtmPressure, Pset: inputs.SetPressure, Pover: inputs.OverPressure, Ploss: inputs?.InletLoss,
        Pbu: inputs.BuiltUp, Psic: inputs.ConstantSuperimposed, Psiv: inputs.VariableSuperimposed, Pback: inputs.TotalBackPressure,
        AbsPR_AbsPressureRatio:inputs.AbsPR_AbsPressureRatio,Equation2p5_Expression:inputs?.Equation2p5_Expression,Kb_Expression: inputs.Kb_Expression,

    }
    
    return {...mergedData}
}

function FCWVTK_WF13(AsmeApiDataSet, valve, inputs, uoms) {
    const [dimension, unit] = inputs?.FlowCapacityUOM !== undefined ? inputs?.FlowCapacityUOM?.split('.') : ['', ''];
    const isVolumetric = !(dimension === 'massflow');

    const isEnglishCalc = inputs.CalculationMethod === 'English';
    const requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
        "latentheatUOM": isEnglishCalc ? "latentheat.BTUlb" : "latentheat.KJkg",
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
        "latentheatUOM": "latentheat.BTUlb",
    }
    
    const N33 = inputs.constants['N33'];
    const N16 = inputs.constants['N16'];
    const N41 = inputs.constants['N41'];
    const N42 = inputs.constants['N42'];

    const Code = inputs.Code;
    const Z = Number(inputs.Compressibility);
    const k = Number(inputs.KCpByCv) === 1 ? 1.00001 : Number(inputs.KCpByCv);
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const M = Number(inputs.MolWeight);
    const T = convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Tsat = convertUnit(Number(inputs.SaturatedSteam), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs?.SaturationSteam);
    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    const Pset = convertUnit(Number(inputs.SetPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.SetPressure);
    const Pover = isNaN(Number(inputs.OverPressure)) ? 0 : convertUnit(Number(inputs.OverPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); // Number(inputs.OverPressure);
    const Psetp = (Pset + Pover) / 1.1;
    const Ploss = isNaN(Number(inputs.InletLoss)) ? 0 : convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    const Pbu = isNaN(Number(inputs.BuiltUp)) ? 0 : convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const Psic = isNaN(Number(inputs.ConstantSuperimposed)) ? 0 : convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    const Psiv = isNaN(Number(inputs.VariableSuperimposed)) ? 0 : convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    const Pback = isNaN(Number(inputs.TotalBackPressure)) ? 0 : convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const ho = isNaN(Number(inputs.ho)) ? 0 : convertUnit(Number(inputs.ho), uoms.find(u => u.UnitKey === receivedUOM.latentheatUOM), uoms.find(u => u.UnitKey === requiredUnits.latentheatUOM));//Number(inputs.TotalBackPressure);
    const Ksh = T === Tsat ? 1 : Number(inputs?.Ksh);
    const Ksc = 1;

    let A = AsmeApiDataSet === "ASME" ? valve?.A : valve?.AAPI;
    const KmaxL= valve?.KmaxL;
    const KAPIL= valve?.KAPIL;
    const KG = AsmeApiDataSet === "ASME" ? 0.9 * valve?.Kmax : valve?.KAPI;
    const KL = AsmeApiDataSet === "ASME" ? 0.9 * valve?.KmaxL : valve?.KAPIL;
    
    const Asel = A;
    let Wreqp = Number(inputs?.Wreq ? inputs?.Wreq : inputs?.Qreq ? inputs?.Qreq : inputs?.VlreqMass);
    Wreqp = isNaN(Wreqp) ? 0 : convertUnitDiffDims(Wreqp, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    const Wreq = Wreqp;
    let P1 = Pset + Pover - Ploss + Patm;
    let P2 = Pback + Patm;
    let PR = P2 / P1;
    let TPR = Equation_1p1(k);
    let C = Equation_1p6(N33, k);

    // let Kmax = AsmeApiDataSet === "ASME" ? valve.Kmax : valve.KAPI;
    //Kd = AsmeApiDataSet === "ASME" ? kdCalculation(AsmeApiDataSet, valve, inputs, uoms, TPR, PR, Patm, Pset, Pover, P1) : Kmax;
    // let Kx = AsmeApiDataSet === "API" ? Kd : Code === "SectionI" || Code === "SectionVIII" ? 0.9 * Kd : Kd;
    // let K = Kx;

    const {Kd, Kx, K, Kmax,KApi, KxValue,X, X_Equ}=KdKxCheck(AsmeApiDataSet,valve, inputs, uoms, TPR, PR, Patm, Pset, Pover,P1);
    
    
    const ValveDataSetMultiPhase=inputs?.ValveDataSetMultiPhase;
    let Kn = knCalculation({ P1, CalculationMethod: inputs.CalculationMethod, uoms });
    let AbsPR = ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR });
    let Equation2p5 = ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR });
    let Kb = KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    let Kw = KbKwValidateExpressions(inputs.Kw_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }
    Kb = Number(Kb);
    if(isNaN(Kw) || Kw < 0) {
        Kw = 0;
    }
    Kw = Number(Kw);
    let W = A * (N41* Psetp - N42 * Math.pow(Psetp, 1.456));
    let Wsel = W;
    let Areq = A * Wreqp / W;
    // if(valve?.ModelNumber=='463' && valve?.Orifice=='FB, 8x8x8' && AsmeApiDataSet==="ASME"){
    //     console.log({KG,KL,Kd,Kx,K,Kw,Kb})
    // }
    const equationValues = {
        requiredUnits, receivedUOM, Code, k, Kc, M, Z, T, Tsat, Patm, Pset, Pover, Psetp,
        Ploss, Pbu, Psic, Psiv, Pback, Ksh,ho,Ksc, Kd, Kx, K, Kmax,KmaxL,KG,KL, KxValue,KApi,KAPIL, A, Asel, Wreq, Wreqp,
        P1, P2, PR, TPR, C, Kn, AbsPR, Equation2p5, Kb,Kw, W, Wsel, Areq, N33, N16,X, X_Equ
    }

    const convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedTsat = convertUnit(Tsat, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPover = convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPloss = convertUnit(Ploss, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPbu = convertUnit(Pbu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsic = convertUnit(Psic, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsiv = convertUnit(Psiv, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPback = convertUnit(Pback, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedho = convertUnit(ho, uoms.find(u => u.UnitKey === requiredUnits.latentheatUOM), uoms.find(u => u.UnitKey === receivedUOM.latentheatUOM));
    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedW = convertUnitDiffDims(W, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWsel = convertUnitDiffDims(Wsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreqp = convertUnitDiffDims(Wreqp, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);

    const inputValues = {
        Code, k, Kc, M, Z, T: convertedT, Tsat: convertedTsat, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover,
        Psetp: convertedPsetp, Ploss: convertedPloss, Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback,
        Ksh, ho: convertedho, Ksc, Kd, Kx, K, Kmax,KmaxL,KG,KL, KxValue,KApi,KAPIL, A: convertedA, Asel: convertedAsel, Wreqp: convertedWreqp,
        Wreq: convertedWreq, P1: convertedP1, P2: convertedP2, PR, TPR, C, Kn, AbsPR, Equation2p5, Kb,Kw,
        W: convertedW, Wsel: convertedWsel, Areq: convertedAreq, N33, N16,
        ValveDataSet2Phase:AsmeApiDataSet
    }

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    
    let latentheatUOM = uoms.find(u => u.UnitKey === requiredUnits.latentheatUOM).UnitName;
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, latentheatUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    
    latentheatUOM = uoms.find(u => u.UnitKey === receivedUOM.latentheatUOM).UnitName;
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, latentheatUOM };

    const ReResponse = JSON.stringify({ equationValues, inputValues, uomRequired, uomReceived });

    return {
        Code, k, Kc,Ksc, M, T: convertedT, Tsat: convertedTsat, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover,
        Psetp: convertedPsetp, Ploss: convertedPloss, Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback,
        Ksh,ho: convertedho, A: convertedA, Asel: convertedAsel, Wreqp: convertedWreqp,
        Wreq: convertedWreq, P1: convertedP1, P2: convertedP2, PR, TPR, C, Kd, Kx, K, Kmax,KmaxL,KG,KL, KxValue,KApi,KAPIL, Kn, AbsPR, Equation2p5, Kb,Kw,
        W: convertedW, Wsel: convertedWsel, Areq: convertedAreq, ReResponse, N33, N16
    }
}

function FCWVTK_WF14(AsmeApiDataSet, valve, inputs, uoms) {

    const isEnglishCalc = inputs.CalculationMethod === 'English';
    const requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
        "latentheatUOM": isEnglishCalc ? "latentheat.BTUlb" : "latentheat.KJkg",
        "specificVolumeUOM": isEnglishCalc ? "specificvolume.ft3lb" : "specificvolume.m3kg",
        "densityUOM": isEnglishCalc ? "density.lbft3" : "density.kgm3",
        "massfluxUOM": isEnglishCalc ? "massflux.lbsft2" : "massflux.kghrcm2",
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
        "specificVolumeUOM": inputs?.SpecificVolumeUOM,
        "densityUOM": inputs?.DensityUOM,
        "massfluxUOM": inputs?.MassFluxUOM,
        "latentheatUOM": "latentheat.BTUlb",
    }

    
    let SpecificVolumeGas = Number(inputs?.SpecificVolume);
    let SpecificVolumeLiquid = Number(inputs?.SpecificVolumeLiquid);
    let G= Number(inputs?.MassFlux);
    const Kv = Number(inputs?.ViscosityCorrectionFactorKv);
    let Vreqp = Number(inputs?.Wv);
    let Liquid2Wlp = Number(inputs?.Wl);
    let Wreqp = Number(inputs?.Wreq);
    // const x1 = Vreqp/Wreqp;
    // const x1_Equ = `x1 = Wv/Wreq`;

    // const v1_Equ = `v1 = x1 * vv1 + (1-x1) * vl1`;
    // const v1 = SpecificVolumeGas * x1 + SpecificVolumeLiquid * (1 - x1);
    // const a1 = x1 * SpecificVolumeGas/v1;
    // const a1_Equ = `α1 = x1 * vv1 / v1`;
    const N26 = inputs.constants['N26'];
    const N28 = inputs.constants['N28'];
    const N33 = inputs.constants['N33'];

    const Code = inputs.Code;
    const Z = Number(inputs.Compressibility);
    const k = Number(inputs.KCpByCv) === 1 ? 1.00001 : Number(inputs.KCpByCv);
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const M = Number(inputs.MolWeight);

    const T = convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    const Pset = convertUnit(Number(inputs.SetPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.SetPressure);
    const Pover = isNaN(Number(inputs.OverPressure)) ? 0 : convertUnit(Number(inputs.OverPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); // Number(inputs.OverPressure);
    const Psetp = (Pset + Pover) / 1.1;
    
    const Ploss = isNaN(Number(inputs.InletLoss)) ? 0 : convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    const Pbu = isNaN(Number(inputs.BuiltUp)) ? 0 : convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const Psic = isNaN(Number(inputs.ConstantSuperimposed)) ? 0 : convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    const Psiv = isNaN(Number(inputs.VariableSuperimposed)) ? 0 : convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    const Pback = isNaN(Number(inputs.TotalBackPressure)) ? 0 : convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
   
    SpecificVolumeGas = isNaN(Number(SpecificVolumeGas)) ? 0 : convertUnit(Number(SpecificVolumeGas), uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM));
    
    SpecificVolumeLiquid = isNaN(Number(SpecificVolumeLiquid)) ? 0 : convertUnit(Number(SpecificVolumeLiquid), uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM));
    // if(AsmeApiDataSet === "ASME" && valve?.ModelNumber === '900' && valve?.Orifice == 5){ 
    //     console.log(G, receivedUOM.massfluxUOM, requiredUnits.massfluxUOM, uoms.find(u => u.UnitKey === receivedUOM.massfluxUOM), uoms.find(u => u.UnitKey === requiredUnits.massfluxUOM));
      
    // }
    G= isNaN(Number(G)) ? 0 : convertUnit(Number(G), uoms.find(u => u.UnitKey === receivedUOM.massfluxUOM), uoms.find(u => u.UnitKey === requiredUnits.massfluxUOM));

    // let A = inputs?.IsLiquidOnlyAtInlet?AsmeApiDataSet === "ASME" ? valve?.AL : valve?.AAPIL:AsmeApiDataSet === "ASME" ? valve?.A : valve?.AAPI;
    let A = AsmeApiDataSet === "ASME" ? valve?.A : valve?.AAPI;
    let AL = AsmeApiDataSet === "ASME" ? valve?.AL : valve?.AAPIL;
    // AL=convertUnit(AL, uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM), uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM));
    const Asel = inputs?.IsLiquidOnlyAtInlet?AL:A;
    Wreqp = isNaN(Wreqp) ? 0 : convertUnitDiffDims(Wreqp, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    const Wreq = Wreqp;
    Vreqp = isNaN(Vreqp) ? 0 : convertUnitDiffDims(Vreqp, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    const Vreq = Vreqp;
    
    Liquid2Wlp = isNaN(Liquid2Wlp) ? 0 : convertUnitDiffDims(Liquid2Wlp, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    const Liquid2Wl = Liquid2Wlp;

    const ValveDataSetMultiPhase=inputs?.ValveDataSetMultiPhase;

    const x1 = Vreqp/Wreqp;
    const x1_Equ = `x1 = Wv/Wreq`;

    const v1_Equ = `v1 = x1 * vv1 + (1-x1) * vl1`;
    const v1 = SpecificVolumeGas * x1 + SpecificVolumeLiquid * (1 - x1);
    const a1 = x1 * SpecificVolumeGas/v1;
    // const a1=AsmeApiDataSet === "ASME" || (AsmeApiDataSet === "API" && ValveDataSetMultiPhase==="APIWtAvg")? x1 * SpecificVolumeGas/v1 : Number((x1 * SpecificVolumeGas/v1).toFixed(2));
    const a1_Equ = `α1 = x1 * vv1 / v1`;

    let P1 = Pset + Pover - Ploss + Patm;
    let P2 = Pback + Patm;
    let PR = P2 / P1;
    let TPR = Equation_1p1(k);
    let C = Equation_1p6(N33, k);
    
    let AbsPR = ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR });
    let Equation2p5 = ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR });
    let Kb = KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    let Kw = KbKwValidateExpressions(inputs.Kw_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }
    Kb = Number(Kb);
    if(isNaN(Kw) || Kw < 0) {
        Kw = 0;
    }
    Kw = Number(Kw);
    let isCritical =IsCriticalFlow(uoms, inputs.CalculationMethod, Pset, PR, TPR, valve);
    
    const IsASMESection8 = inputs?.IsASMESection8;
    const KG = AsmeApiDataSet === "ASME" ? IsASMESection8?0.9 * valve?.Kmax: valve?.Kmax : valve?.KAPI;
    const KL = AsmeApiDataSet === "ASME" ? IsASMESection8?0.9 * valve?.KmaxL : valve?.KmaxL : valve?.KAPIL;
    // const KG = AsmeApiDataSet === "ASME" ? 0.9 * valve?.Kmax : valve?.KAPI;
    // const KL = AsmeApiDataSet === "ASME" ? 0.9 * valve?.KmaxL : valve?.KAPIL;

    // const K2Phi = AsmeApiDataSet === "ASME" || (AsmeApiDataSet === "API" && ValveDataSetMultiPhase==="APIWtAvg") ? a1 * KG + (1-a1) * KL : Vreqp==0?0.65:0.85;
    // const K2Phi_Equ = AsmeApiDataSet === "ASME"  || (AsmeApiDataSet === "API" && ValveDataSetMultiPhase==="APIWtAvg") ? `K2φ = α1 * KG + (1 - α1) * KL`: Vreqp==0?'0.65':'0.85';

    const K2Phi = AsmeApiDataSet === "ASME" || (AsmeApiDataSet.toUpperCase() === "APIWTAVG") ? a1 * KG + (1-a1) * KL : Vreqp==0?0.65:0.85;
    const K2Phi_Equ = AsmeApiDataSet === "ASME"  || (AsmeApiDataSet.toUpperCase() === "APIWTAVG") ? `K2φ = α1 * KG + (1 - α1) * KL`: Vreqp==0?'0.65':'0.85';

    // console.log(valve?.ModelNumber, valve?.Orifice,AsmeApiDataSet, K2Phi);

    const Kbw = a1 * Kb + (1-a1) * Kw;
    const Kbw_Equ = `Kbw = α1 * Kb + (1 - α1) * Kw`;

    const W = N28 * Asel * K2Phi * Kbw * Kc * Kv * G;
    const W_Equ = `${N28} * A * K2φ * Kbw * Kc * Kv * G`;

    let Wsel = W;
    let Areq = Asel * Wreqp / W;
    const Areq_Equ = `Areq = A * Wreq / W`;
    

    const equationValues = {
        requiredUnits, receivedUOM, Code, k, Kc, M, Z, T, Patm, Pset, Pover, Psetp,
        Ploss, Pbu, Psic, Psiv, Pback, A,AL, Asel, Wreq, Wreqp,
        P1, P2, PR, TPR, C, AbsPR, Equation2p5, Kb, Kw, KG, KL, K2Phi, K2Phi_Equ, Kbw_Equ, Kbw, W, Wsel, Areq, N26, N28, N33,  SpecificVolumeGas, SpecificVolumeLiquid, Kv,
        Liquid2Wl,Vreq, Liquid2Wlp,  isCritical, x1, x1_Equ, a1, a1_Equ,v1, v1_Equ, G, W_Equ, Areq_Equ,
        
    }

    // if(AsmeApiDataSet === "API" && valve?.ModelNumber === '463' && valve?.Orifice.indexOf('2x3')!== -1

    // ){ 
    //     console.log(valve?.ModelId,valve?.ModelNumber, valve?.Orifice, AsmeApiDataSet, {P1,P2,PR,A,AL,Kb, Kw,Kbw, KG, KL, K2Phi,G,N28,W,Areq,Vreqp,Wreqp,vl1:SpecificVolumeLiquid,wl:Liquid2Wl,x1,v1,KG,KL,a1});
    // }

    const convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPover = convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPloss = convertUnit(Ploss, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPbu = convertUnit(Pbu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsic = convertUnit(Psic, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsiv = convertUnit(Psiv, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPback = convertUnit(Pback, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAL = convertUnit(AL, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedW = convertUnitDiffDims(W, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWsel = convertUnitDiffDims(Wsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreqp = convertUnitDiffDims(Wreqp, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedLiquid2Wl = convertUnitDiffDims(Liquid2Wl, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedVreq = convertUnitDiffDims(Vreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedG = convertUnit(G, uoms.find(u => u.UnitKey === requiredUnits.massfluxUOM), uoms.find(u => u.UnitKey === receivedUOM.massfluxUOM));
    const inputValues = {
        Code, k, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover,
        Psetp: convertedPsetp, Ploss: convertedPloss, Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, A: convertedA,AL: convertedAL, Asel: convertedAsel, Wreqp: convertedWreqp,
        Wreq: convertedWreq, P1: convertedP1, P2: convertedP2, PR, TPR, C, AbsPR, Equation2p5, Kb, Kw, KG, KL, K2Phi, Kbw,
        W: convertedW, Wsel: convertedWsel, Areq: convertedAreq, N26, N28, N33,   SpecificVolumeGas: Number(inputs?.SpecificVolume), SpecificVolumeLiquid: Number(inputs?.SpecificVolumeLiquid), Kv,
        Liquid2Wl: convertedLiquid2Wl, Vreq: convertedVreq, Liquid2Wlp, isCritical, x1, a1,v1, G:convertedG,
        ValveDataSet2Phase:AsmeApiDataSet
    }

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    let specificVolumeUOM = uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM).UnitName;
    let massfluxUOM = uoms.find(u => u.UnitKey === requiredUnits.massfluxUOM).UnitName;
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM,specificVolumeUOM, massfluxUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    specificVolumeUOM = uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM).UnitName;
    massfluxUOM = uoms.find(u => u.UnitKey === receivedUOM.massfluxUOM).UnitName;

    
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM,specificVolumeUOM, massfluxUOM };

    const ReResponse = JSON.stringify({ equationValues, inputValues, uomRequired, uomReceived });
    // console.log(' >>>>>>>>>>>> ', AsmeApiDataSet, valve?.ModelNumber, valve?.Orifice, A,AL,convertedA, convertedAL, Wreqp, convertedWreqp, Wreq, convertedWreq, Wsel, convertedWsel, W, convertedW);
    // if(AsmeApiDataSet === "ASME" && valve?.ModelNumber === '453' && valve?.Orifice.indexOf('K')!== -1

    // ){ 
    //     console.log(valve?.ModelId,valve?.ModelNumber, valve?.Orifice, AsmeApiDataSet, inputValues);
    // }
    return {
        Code, k, Kc, M, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover,
        Psetp: convertedPsetp, Ploss: convertedPloss, Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback,
        A: convertedA, Asel: convertedAsel, Wreqp: convertedWreqp,
        Wreq: convertedWreq, P1: convertedP1, P2: convertedP2, PR, TPR, C,  AbsPR, Equation2p5, Kb, Kw, KG, KL, K2Phi, Kbw,
        W: convertedW, Wsel: convertedWsel, Areq: convertedAreq, ReResponse, N26, N28, N33, SpecificVolumeGas, Kv,
        Liquid2Wl: Liquid2Wl, Liquid2Wlp, isCritical,  x1, a1, G:convertedG,
        MassFlux:convertedG,
        valveKmax: valve?.Kmax, valveKApi: valve?.KAPI??valve?.KApi,
        SizingBasis: inputs.SizingBasis,SystemMAWP: inputs.SystemMAWP,
        KADataSet:AsmeApiDataSet,CalculationMethod:inputs.CalculationMethod,
        IsASMESection8: inputs?.IsASMESection8,valveA:valve.A,valveAAPI: valve.AAPI,
        // ModelNumber: valve?.ModelNumber, VPValveType: valve?.VPValveType, 
        service: inputs?.service, ShortName: valve?.ShortName, 
        m: valve?.m, b: valve?.b, E: valve?.E, Tp: valve?.Tp,Tpunits:valve?.Tpunits,
        SpecificVolume:inputs?.SpecificVolume,SpecificVolumeLiquid:inputs?.SpecificVolumeLiquid,MassFlux:inputs?.MassFlux,
        ViscosityCorrectionFactorKv:inputs?.ViscosityCorrectionFactorKv,Wv:inputs?.Wv,Wl:inputs?.Wl,Wreq:inputs?.Wreq,
        IsLiquidOnlyAtInlet:inputs?.IsLiquidOnlyAtInlet,ValveDataSetMultiPhase:inputs?.ValveDataSetMultiPhase,
        valveKmaxL:valve?.KmaxL,valveKAPIL:valve?.KAPIL,valveAL:valve?.AL,valveAAPIL:valve?.AAPIL,
    }
}

function FCWVTK_WF15(AsmeApiDataSet, valve, inputs, uoms) {    

    const isEnglishCalc = inputs.CalculationMethod === 'English';
    const requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
        "specificVolumeUOM": isEnglishCalc ? "specificvolume.ft3lb" : "specificvolume.m3kg",
        "massfluxUOM": isEnglishCalc ? "massflux.lbsft2" : "massflux.kghrcm2",
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
        "specificVolumeUOM": inputs?.SpecificVolumeUOM
    }
    let CombinedSpVolAtInlet = Number(inputs?.CombinedSpVolAtInlet);
    let CombinedSpVolAt90PerP1 = Number(inputs?.CombinedSpVolAt90PerP1);
    let SpecificVolumeGas = Number(inputs?.SpecificVolume);
    let SpecificVolumeLiquid = Number(inputs?.SpecificVolumeLiquid);
    const Kv = Number(inputs?.ViscosityCorrectionFactorKv);
    let Vreqp = Number(inputs?.Vreq);
    let Liquid2Wlp = Number(inputs?.Liquid2Wl);
    const IsASMESection8 = inputs?.IsASMESection8;
    let Wreqp = Number(inputs?.Wreq ? inputs?.Wreq : inputs?.Qreq ? inputs?.Qreq : inputs?.VlreqMass);
    const x1 = Vreqp/Wreqp;
    const x1_Equ = `x1 = Wv/Wreq`;
    const v9byv1 = CombinedSpVolAt90PerP1/CombinedSpVolAtInlet;
    let omega = Number(inputs?.Omega);
    omega_Equ = `ω = 9 * (v9 / v1 - 1)`;
    omega = (9 * ((v9byv1) - 1));
    const criticalPressureRatio = Number((1+(1.0446 - 0.0093431 * (omega ** 0.5)) * (omega ** (-0.56261))) ** (-0.70356 + (0.014685 * Math.log(omega))).toFixed(15));
    const criticalPressureRatio_Equ = `ηc = [1 + (1.0446 - 0.0093431 * ω^0.5] * ω^(-0.56261)] ^ (-0.70356 + 0.014685 * ln(ω))`;
    const v1_Equ = `v1 = x1 * vv1 + (1-x1) * vl1`;
    const a1 = x1 * SpecificVolumeGas/CombinedSpVolAtInlet;
    const a1_Equ = `α1 = x1 * vv1 / v1`;
    const N26 = inputs.constants['N26'];
    const N28 = inputs.constants['N28'];
    const N33 = inputs.constants['N33'];

    const Code = inputs.Code;
    const Z = Number(inputs.Compressibility);
    const k = Number(inputs.KCpByCv) === 1 ? 1.00001 : Number(inputs.KCpByCv);
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const M = Number(inputs.MolWeight);
    const T = convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    const Pset = convertUnit(Number(inputs.SetPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.SetPressure);
    const Pover = isNaN(Number(inputs.OverPressure)) ? 0 : convertUnit(Number(inputs.OverPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); // Number(inputs.OverPressure);
    const Psetp = (Pset + Pover) / 1.1;
    const Ploss = isNaN(Number(inputs.InletLoss)) ? 0 : convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    const Pbu = isNaN(Number(inputs.BuiltUp)) ? 0 : convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const Psic = isNaN(Number(inputs.ConstantSuperimposed)) ? 0 : convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    const Psiv = isNaN(Number(inputs.VariableSuperimposed)) ? 0 : convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    const Pback = isNaN(Number(inputs.TotalBackPressure)) ? 0 : convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    SpecificVolumeGas = isNaN(Number(SpecificVolumeGas)) ? 0 : convertUnit(Number(SpecificVolumeGas), uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM));
    SpecificVolumeLiquid = isNaN(Number(SpecificVolumeLiquid)) ? 0 : convertUnit(Number(SpecificVolumeLiquid), uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM));
    CombinedSpVolAtInlet = isNaN(Number(CombinedSpVolAtInlet)) ? 0 : convertUnit(Number(CombinedSpVolAtInlet), uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM));
    CombinedSpVolAt90PerP1 = isNaN(Number(CombinedSpVolAt90PerP1)) ? 0 : convertUnit(Number(CombinedSpVolAt90PerP1), uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM));
   
    let A = AsmeApiDataSet === "ASME" ? valve?.A : valve?.AAPI;
    const Asel = A;
    const Wreq = isNaN(Wreqp) ? 0 : convertUnitDiffDims(Wreqp, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);

    const Vreq = isNaN(Vreqp) ? 0 : convertUnitDiffDims(Vreqp, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);

    
    const Liquid2Wl = isNaN(Liquid2Wlp) ? 0 : convertUnitDiffDims(Liquid2Wlp, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    let P1 = Pset + Pover - Ploss + Patm;
    let P2 = Pback + Patm;
    let PR = P2 / P1;
    let TPR = Equation_1p1(k);
    let C = Equation_1p6(N33, k);
    
    
    
    let AbsPR = ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR });
    let Equation2p5 = ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR });
    let Kb = KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    let Kw = KbKwValidateExpressions(inputs.Kw_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    
    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }
    Kb = Number(Kb);
    if(isNaN(Kw) || Kw < 0) {
        Kw = 0;
    }
    Kw = Number(Kw);
    const Pc = criticalPressureRatio * P1;
    const Pc_Equ = `Pc = ηc * P1`;
    let isCritical = Pc >= P2 ? 'Critical' : 'Sub-Critical';
    
    
    let G, G_Equ;
    if(isCritical === 'Critical') {
        G = N26 * criticalPressureRatio * ((P1/ (Number(CombinedSpVolAtInlet) * omega)) ** 0.5);
        G_Equ = `${N26} * ηc * [P1 / (v1 * ω)] ^ 0.5`;
    } else {
        G = N26 * ((-2 * ((omega * Math.log(PR)) + ((omega -1) * (1 - PR)))) ** 0.5) / ((omega * (1/PR -1)) + 1 ) * ((P1/Number(CombinedSpVolAtInlet)) ** 0.5);
        G_Equ = `${N26} * {-2 * [ω * ln(η2) + (ω - 1) * (1 - η2)]} ^ 0.5 * [(P1 / v1) ^ 0.5] / [ω * (1/η2 - 1) + 1]`;
    }
    const KG = AsmeApiDataSet === "ASME" ? (IsASMESection8 ? 0.9 * valve?.Kmax: valve?.Kmax) : valve?.KAPI;
    const KGActual = AsmeApiDataSet === "ASME" ? valve?.Kmax : valve?.KAPI;
    const KL = AsmeApiDataSet === "ASME" ? (IsASMESection8 ? 0.9 * valve?.KmaxL : valve?.KmaxL) : valve?.KAPIL;
    const KLActual = AsmeApiDataSet === "ASME" ? valve?.KmaxL : valve?.KAPIL;
  
    const ValveDataSetMultiPhase=inputs?.ValveDataSetMultiPhase;
    
    const K2Phi = AsmeApiDataSet === "ASME" || (AsmeApiDataSet.toUpperCase() === "APIWTAVG") ? a1 * KG + (1-a1) * KL : Vreqp==0?0.65:0.85;
    const K2Phi_Equ = AsmeApiDataSet === "ASME"  || (AsmeApiDataSet.toUpperCase() === "APIWTAVG") ? `K2φ = α1 * KG + (1 - α1) * KL`: Vreqp==0?'0.65':'0.85';

    const K2PhiAct = AsmeApiDataSet === "ASME" || (AsmeApiDataSet.toUpperCase() === "APIWTAVG") ? a1 * KGActual + (1-a1) * KLActual : Vreqp==0?0.65:0.85;
    
    const Kbw = a1 * Kb + (1-a1) * Kw;
    const Kbw_Equ = `Kbw = α1 * Kb + (1 - α1) * Kw`;
    const W = N28 * A * K2Phi * Kbw * Kc * Kv * G;
    const WActual = N28 * A * K2PhiAct * Kbw * Kc * Kv * G;
    const W_Equ = isEnglishCalc ? `${N28} * A * K2φ * Kbw * Kc * Kv * G` : `A * K2φ * Kbw * Kc * Kv * G`;
    let Wsel = W;
    let Areq = A * Wreq / W;
    const Areq_Equ = `Areq = A * Wreq / W`;
    // if(AsmeApiDataSet === "ASME" && ['81P','900'].includes(valve?.ModelNumber) ){
    //     console.log(valve?.ModelNumber, valve?.Orifice, N28 , A , K2Phi , Kbw , Kc , Kv , G, W, WActual, a1,KG, Kb);
    // }
    
    const equationValues = {
        requiredUnits, receivedUOM, Code, k, Kc, M, Z, T, Patm, Pset, Pover, Psetp,
        Ploss, Pbu, Psic, Psiv, Pback, A, Asel, Wreq, Wreqp,
        P1, P2, PR, TPR, C, AbsPR, Equation2p5, Kb, Kw, KG, KL, K2Phi, K2Phi_Equ, Kbw_Equ, Kbw, W, WActual, Wsel, Areq, N26, N28, N33, omega, CombinedSpVolAtInlet, SpecificVolumeGas, SpecificVolumeLiquid, CombinedSpVolAt90PerP1, Kv,
        Liquid2Wl,Vreq, Pc, Pc_Equ, isCritical, criticalPressureRatio, criticalPressureRatio_Equ, x1, x1_Equ, a1, a1_Equ, v1_Equ, G, G_Equ, W_Equ, Areq_Equ
    }

    const convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPover = convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPloss = convertUnit(Ploss, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPbu = convertUnit(Pbu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsic = convertUnit(Psic, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsiv = convertUnit(Psiv, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPback = convertUnit(Pback, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedW = convertUnitDiffDims(W, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWActual = convertUnitDiffDims(WActual, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWsel = convertUnitDiffDims(Wsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreqp = convertUnitDiffDims(Wreqp, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);

    const inputValues = {
        Code, k, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover,
        Psetp: convertedPsetp, Ploss: convertedPloss, Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, A: convertedA, Asel: convertedAsel, Wreqp: convertedWreqp,
        Wreq: convertedWreq, P1: convertedP1, P2: convertedP2, PR, TPR, C, AbsPR, Equation2p5, Kb, Kw, KG, KL, K2Phi, Kbw,
        W: convertedW, Wsel: convertedWsel, Areq: convertedAreq, N26, N28, N33, omega, CombinedSpVolAtInlet: Number(inputs?.CombinedSpVolAtInlet), SpecificVolumeGas: Number(inputs?.SpecificVolume), SpecificVolumeLiquid: Number(inputs?.SpecificVolumeLiquid), CombinedSpVolAt90PerP1: Number(inputs?.CombinedSpVolAt90PerP1), Kv,
        Liquid2Wl: Liquid2Wlp, Vreq: Vreqp, Pc: Pc, isCritical, criticalPressureRatio, x1, a1, G,
        WActual: convertedWActual,
        ValveDataSet2Phase:AsmeApiDataSet
    }

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    let massfluxUOM = uoms.find(u => u.UnitKey === requiredUnits.massfluxUOM).UnitName;
    let specificVolumeUOM = uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM).UnitName;
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, specificVolumeUOM, massfluxUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    specificVolumeUOM = uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM).UnitName;
    
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, specificVolumeUOM };

    const ReResponse = JSON.stringify({ equationValues, inputValues, uomRequired, uomReceived });

    return {
        Code, k, Kc, M, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover,
        Psetp: convertedPsetp, Ploss: convertedPloss, Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback,
        A: convertedA, Asel: convertedAsel, Wreqp: convertedWreqp,
        Wreq: convertedWreq, P1: convertedP1, P2: convertedP2, PR, TPR, C,  AbsPR, Equation2p5, Kb, Kw, KG, KL, K2Phi, Kbw,
        W: convertedW, WActual: convertedWActual, Wsel: convertedWsel, Areq: convertedAreq, ReResponse, N26, N28, N33, omega, CombinedSpVolAtInlet, SpecificVolumeGas, Kv,
        Vreq, Vreqp, Liquid2Wl: Liquid2Wl, Liquid2Wlp, Pc: Pc, isCritical, criticalPressureRatio, x1, a1, G,
        valveKmax: valve?.Kmax, valveKApi: valve?.KAPI??valve?.KApi,
        SizingBasis: inputs.SizingBasis,SystemMAWP: inputs.SystemMAWP,
        KADataSet:AsmeApiDataSet,CalculationMethod:inputs.CalculationMethod,
        IsASMESection8: inputs?.IsASMESection8,valveA:valve.A,valveAAPI: valve.AAPI,
        // ModelNumber: valve?.ModelNumber, VPValveType: valve?.VPValveType, 
        service: inputs?.service, ShortName: valve?.ShortName, 
        m: valve?.m, b: valve?.b, E: valve?.E, Tp: valve?.Tp,Tpunits:valve?.Tpunits,
        CombinedSpVolAtInlet:inputs?.CombinedSpVolAtInlet,CombinedSpVolAt90PerP1:inputs?.CombinedSpVolAt90PerP1,
        SpecificVolume:inputs?.SpecificVolume,SpecificVolumeLiquid:inputs?.SpecificVolumeLiquid,
        ViscosityCorrectionFactorKv:inputs?.ViscosityCorrectionFactorKv,Vreq:inputs?.Vreq,Liquid2Wl:inputs?.Liquid2Wl,
        Wreq:inputs?.Wreq,ValveDataSetMultiPhase:inputs?.ValveDataSetMultiPhase,
        valveKmaxL:valve?.KmaxL,valveKAPIL:valve?.KAPIL,valveAL:valve?.AL,valveAAPIL:valve?.AAPIL,

    }
}


function FCWVTK_WF16(AsmeApiDataSet, valve, inputs, uoms) {    

    const isEnglishCalc = inputs.CalculationMethod === 'English';

    const isMassFlow = inputs?.FlowCapacityUOM.includes('massflow');

    const requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isEnglishCalc ? "liquidvolflow.GPMUS" : "liquidvolflow.m3hr",
        "flowCapacityMassUOM": isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
        "massfluxUOM": isEnglishCalc ? "massflux.lbsft2" : "massflux.kghrcm2",
        "densityUOM": isEnglishCalc ? "density.lbft3" : "density.kgm3",
        "specificVolumeUOM": isEnglishCalc ? "specificvolume.ft3lb" : "specificvolume.m3kg"
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
        "specificVolumeUOM": inputs?.SpecificVolumeUOM,
        "densityUOM": inputs?.DensityUOM
    }
    
    // To calculate: Vl, W, Areq, G, Ps, PRst, PR
    const N26 = inputs.constants['N26'];
    const N27 = inputs.constants['N27'];
    const N29 = inputs.constants['N29'];
    const IsASMESection8 = inputs?.IsASMESection8;
    const k = Number(inputs.KCpByCv) === 1 ? 1.00001 : Number(inputs.KCpByCv);
    let omega = Number(inputs?.Omega);
    let DensityLiquid = Number(inputs?.DensityLiquid);
    let MixDensityAt90PerSat = Number(inputs?.MixDensityAt90PerSat);
    let A = AsmeApiDataSet === "ASME" ? valve?.A : valve?.AAPI;
    let AL = AsmeApiDataSet === "ASME" ? valve?.AL : valve?.AAPIL;
    let Asel = AL ? AL : A;
    const KL = AsmeApiDataSet === "ASME" ? (IsASMESection8 ? 0.9 * valve?.KmaxL : valve?.KmaxL) : valve?.KAPIL;
    const KLActual = AsmeApiDataSet === "ASME" ? valve?.KmaxL : valve?.KAPIL;
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const Kv = Number(inputs?.ViscosityCorrectionFactorKv);
    let Wreqp = Number(inputs?.VlreqMass ? inputs?.VlreqMass : inputs?.Qreq ? inputs?.Qreq : inputs?.Wreq);
    let Ps = Number(inputs.VaporSaturationPressure);
    let Patm = Number(inputs.AtmPressure);
    let Pset = Number(inputs.SetPressure);
    let Pover = Number(inputs.OverPressure);
    let Ploss = Number(inputs.InletLoss);
    let Pbu = Number(inputs.BuiltUp);
    let Psic = Number(inputs.ConstantSuperimposed)
    let Psiv = Number(inputs.VariableSuperimposed)
    let Pback = Number(inputs.TotalBackPressure)
    let inputValues = {
       k, Kc, Ps, Patm, Pset, Pover, Ploss, Pbu, Psic, Psiv, Pback, Wreq: Wreqp, KL, N26, N27, N29, Kc, Kv, MixDensityAt90PerSat, DensityLiquid
    };
    
    // console.log({A,AL,Asel})
    Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    Pset = convertUnit(Number(inputs.SetPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.SetPressure);
    Pover = isNaN(Number(inputs.OverPressure)) ? 0 : convertUnit(Number(inputs.OverPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); // Number(inputs.OverPressure);
    Ploss = isNaN(Number(inputs.InletLoss)) ? 0 : convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    Pbu = isNaN(Number(inputs.BuiltUp)) ? 0 : convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    Psic = isNaN(Number(inputs.ConstantSuperimposed)) ? 0 : convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    Psiv = isNaN(Number(inputs.VariableSuperimposed)) ? 0 : convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    Pback = isNaN(Number(inputs.TotalBackPressure)) ? 0 : convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    Ps = isNaN(Number(inputs.VaporSaturationPressure)) ? 0 : convertUnit(Number(inputs.VaporSaturationPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM));//Number(inputs.TotalBackPressure);
    DensityLiquid = isNaN(DensityLiquid) ? 0 : convertUnit(DensityLiquid, uoms.find(u => u.UnitKey === receivedUOM.densityUOM), uoms.find(u => u.UnitKey === requiredUnits.densityUOM));
    MixDensityAt90PerSat = isNaN(MixDensityAt90PerSat) ? 0 : convertUnit(MixDensityAt90PerSat, uoms.find(u => u.UnitKey === receivedUOM.densityUOM), uoms.find(u => u.UnitKey === requiredUnits.densityUOM));
    const SpGravity = isEnglishCalc ? DensityLiquid / 62.36649718 : DensityLiquid / 1000;
    const newInputs = {...inputs, SpGravity };
    const Wreq = isNaN(Wreqp) ? 0 : convertUnitDiffDims(Wreqp, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, newInputs);
    let Psetp = (Pset + Pover) / 1.1;
    let P1 = Pset + Pover - Ploss + Patm;
    let P2 = Pback + Patm;
    let PR = P2 / P1;

    let Kw = KbKwValidateExpressions(inputs.Kw_Expression, { Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    
    if(isNaN(Kw) || Kw < 0) {
        Kw = 0;
    }
    inputValues.Kw = Kw;

    const omega_Equ = `ωs = 9 * (ρl1 / ρ9 -1)`;
    omega = 9 * (DensityLiquid / MixDensityAt90PerSat - 1);
    const tranSatPressureRatio = 2 * omega / (1 + 2 * omega);
    const tranSatPressureRatio_Equ = `ηst = 2 * ωs / (1 + 2 * ωs)`;
    const Pst = tranSatPressureRatio * P1;
    const Pst_Equ = `Pst = ηst * P1`;

    const satPressureRatio = Ps / P1;
    const satPressureRatio_Equ = `ηs = Ps / P1`;


    let subcoolingRegion = '';
    let isCritical = '';
    let G_Equ = ``;
    let G;
    let Pc = '';
    let Pc_Equ = '';
    let PR1 = '';
    let criticalPressureRatio = '';
    let criticalPressureRatio_Equ = '';
    const ValveDataSetMultiPhase=inputs?.ValveDataSetMultiPhase;
    // Check for Cooling 
    if(Ps >= Pst) {
        subcoolingRegion = 'Low Subcooling';
        if(satPressureRatio <= tranSatPressureRatio) {
            criticalPressureRatio = satPressureRatio;
            criticalPressureRatio_Equ = `ηc =  ηs`;
        } else {
            if(omega == 0.5) {
                if(satPressureRatio == 1) {
                    criticalPressureRatio = 0.5;
                    criticalPressureRatio_Equ = `ηc = 0.5`;
                } else {
                    criticalPressureRatio = 2 * ((1+satPressureRatio - (satPressureRatio**2 * (1 - 0.5 * Math.log(satPressureRatio)) + satPressureRatio + (1/satPressureRatio) + 0.5 * Math.log(satPressureRatio) + 1)**0.5)/(satPressureRatio - (1/satPressureRatio)));
                    criticalPressureRatio_Equ = `ηc = 2[1+ηs-(ηs^2*(1-0.5ln(ηs)) + ηs + (1/ηs) + 0.5 * ln(ηs) + 1)^0.5/ηs - 1/ηs]`;
                }
            } else {
                criticalPressureRatio = satPressureRatio * (2 * omega/ ((2 * omega) - 1)) * [1 - (1 - (((2 * omega) - 1)/ (2 * omega * satPressureRatio))) ** 0.5];
                criticalPressureRatio_Equ = `ηc = ηs * (2 * ωs/ (2 * ωs - 1)) * [1 - (1 - ((2 * ωs - 1)/ (2 * ωs * ηs))) ^ 0.5]`;
            }
        }
        Pc = criticalPressureRatio * P1;
        Pc_Equ = `Pc = ηc * P1`;
        isCritical = Pc >= P2 ? 'Critical' : 'Sub-Critical';
        PR1 = isCritical === 'Critical' ? criticalPressureRatio : PR;
        G_Equ = `G = ${N26} * {2 * (1 - ηs) + 2 * [ωs * ηs * ln(ηs/${isCritical === 'Critical' ? 'ηc' : 'η2'}) - (ωs - 1) * (ηs - ${isCritical === 'Critical' ? 'ηc' : 'η2'})]}^0.5 / [ωs * (ηs / ${isCritical === 'Critical' ? 'ηc' : 'η2'} - 1) + 1] * (P1 * ρl1)^0.5`;
        G = N26 * (2 * (1 - satPressureRatio) + 2 * (omega * satPressureRatio * Math.log(satPressureRatio / PR1) - (omega - 1) * (satPressureRatio - PR1))) ** 0.5 * (P1 * DensityLiquid) ** 0.5 / (omega * (satPressureRatio / PR1 - 1) + 1);
    } else {
        subcoolingRegion = 'High Subcooling';
        isCritical = Ps >= P2 ? 'Critical' : 'Sub-Critical';
        const P = isCritical === 'Critical' ? Ps : P2;
        G_Equ = `G = ${N27} * [ρl1 * (P1 - ${ isCritical === 'Critical' ? `Ps` : `P2`})]^0.5`;
        G = N27 * (DensityLiquid * (P1 - P)) ** 0.5;
    }
    const Vl_Equ = isEnglishCalc ?  `Vl = A * KL * Kw * Kc * Kv * G / ${N29} * ρl1` : `Vl = A * KL * Kw * Kc * Kv * G / ρl1`;
    const Vl_eq = (Asel * KL * Kw * Kc * Kv * G) / (N29 * DensityLiquid);
    let Vl = Vl_eq;
    let VlActual = (Asel * KLActual * Kw * Kc * Kv * G) / (N29 * DensityLiquid);
    let Areq = Asel * Wreq / Vl_eq;
    const Areq_Equ = `Areq = A * VL1req / VL`;
    let W = '';
    let WActual = '';
    let W_eq = '';

    let Wsel = Vl_eq
    // Mass Flow 
    if(isMassFlow) {
        W = convertUnitDiffDims(Vl, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, newInputs);
        WActual = convertUnitDiffDims(VlActual, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, newInputs);
        W_eq = convertUnitDiffDims(Vl, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityMassUOM), uoms, newInputs);
        Vl = inputs?.prevFlowCapacityUOM?.includes('liquidvolflow') ? convertUnitDiffDims(Vl, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === inputs?.prevFlowCapacityUOM), uoms, newInputs) : Vl;
        VlActual = inputs?.prevFlowCapacityUOM?.includes('liquidvolflow') ? convertUnitDiffDims(VlActual, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === inputs?.prevFlowCapacityUOM), uoms, newInputs) : VlActual;
        // Wsel = W;
    } else {
        W = convertUnitDiffDims(Vl, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityMassUOM), uoms, newInputs);
        WActual = convertUnitDiffDims(VlActual, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityMassUOM), uoms, newInputs);
        W_eq = W;
        Vl = convertUnitDiffDims(Vl, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, newInputs);
        VlActual = convertUnitDiffDims(VlActual, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, newInputs);  
    }    
    
    const equationValues = {
        requiredUnits, receivedUOM, DensityLiquid, MixDensityAt90PerSat, Kc, Patm, Pset, Pover, Psetp, criticalPressureRatio, criticalPressureRatio_Equ, omega_Equ,subcoolingRegion,
        satPressureRatio, satPressureRatio_Equ, Pst, Pst_Equ, Ps, Patm, Pset, Pover, Ploss, Pbu, Psic, Psiv, Pback,
        tranSatPressureRatio, tranSatPressureRatio_Equ, Ploss, Pbu, Psic, Psiv, Pback, A: Asel, Wreq, Wreqp,
        P1, P2, PR, PR1, Kw, KL, W, W_eq, Wsel, Areq, N27, N29, omega, Kv, Pc, Pc_Equ, isCritical, G, G_Equ, Vl, Vl_eq, Vl_Equ, Areq_Equ,
        WActual, VlActual
    }
    

    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedWsel = convertUnitDiffDims(Wsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, newInputs);
    const convertedWreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, newInputs);
    inputValues = {
        ...inputValues,
        W,
        WActual,
        Vl,
        VlActual,
        Wsel: convertedWsel,
        Areq: convertedAreq,
        Asel: convertedAsel,
        A: convertedAsel,
        ValveDataSet2Phase:AsmeApiDataSet
    }

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    let flowCapacityMassUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityMassUOM).UnitName;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    let specificVolumeUOM = uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM).UnitName;
    let massfluxUOM = uoms.find(u => u.UnitKey === requiredUnits.massfluxUOM).UnitName;
    let densityUOM = uoms.find(u => u.UnitKey === requiredUnits.densityUOM).UnitName;
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityVolumetricUOM: flowCapacityUOM, flowCapacityUOM, flowCapacityMassUOM, orificeAreaUOM, specificVolumeUOM, massfluxUOM, densityUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = isMassFlow ? (inputs?.prevFlowCapacityUOM?.includes('liquidvolflow')  ? uoms.find(u => u.UnitKey === inputs?.prevFlowCapacityUOM).UnitName: flowCapacityUOM ) : uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    flowCapacityMassUOM = isMassFlow ? uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName : flowCapacityMassUOM;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    specificVolumeUOM = uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM).UnitName;
    densityUOM = uoms.find(u => u.UnitKey === receivedUOM.densityUOM).UnitName;
    let inputFlowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;  
    
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM: inputFlowCapacityUOM, flowCapacityVolumetricUOM: flowCapacityUOM, flowCapacityMassUOM, orificeAreaUOM, specificVolumeUOM, densityUOM };

    const ReResponse = JSON.stringify({ equationValues, inputValues, uomRequired, uomReceived });
    // console.log({valve, ReResponse: JSON.stringify(ReResponse)});
    // if(['463', '443'].includes(valve.ModelNumber)) {
    //     console.log({ReResponse: JSON.stringify(ReResponse)});
    // }

    return {
        Kc, Patm: Number(inputs?.AtmPressure), Pset: Number(inputs?.SetPressure), Pover: Number(inputs?.OverPressure),
        Psetp: convertedPsetp, Ploss: Number(inputs?.InletLoss), Pbu: Number(inputs?.BuiltUp), Psic: Number(inputs?.ConstantSuperimposed),
        Psiv: Number(inputs?.VariableSuperimposed), Pback: Number(inputs?.TotalBackPressure), A: convertedAsel, Asel: convertedAsel,
        Wreqp, Wreq: convertedWreq, P1: convertedP1, P2: convertedP2, PR, PR1, Kw, KL, W, Wsel: convertedWsel, 
        Areq: convertedAreq, ReResponse, N26, N27, N29, omega, Kv, Pc, isCritical, criticalPressureRatio, G, WActual,
        valveKmax: valve?.Kmax, valveKApi: valve?.KAPI??valve?.KApi,
        SizingBasis: inputs.SizingBasis,SystemMAWP: inputs.SystemMAWP,
        KADataSet:AsmeApiDataSet,CalculationMethod:inputs.CalculationMethod,
        IsASMESection8: inputs?.IsASMESection8,valveA:valve.A,valveAAPI: valve.AAPI,valveAL:valve.AL,valveAAPIL: valve.AAPIL,AL:valve?.AL,AAPIL: valve.AAPIL,
        service: inputs?.service, ShortName: valve?.ShortName, 
        m: valve?.m, b: valve?.b, E: valve?.E, Tp: valve?.Tp,Tpunits:valve?.Tpunits,
        DensityLiquid:inputs?.DensityLiquid,MixDensityAt90PerSat:inputs?.MixDensityAt90PerSat,
        valveKmaxL:valve?.KmaxL,valveKAPIL:valve?.KAPIL,valveAL:valve?.AL,valveAAPIL:valve?.AAPIL,
        ViscosityCorrectionFactorKv:inputs?.ViscosityCorrectionFactorKv,VaporSaturationPressure:inputs?.VaporSaturationPressure,
        ValveDataSetMultiPhase:inputs?.ValveDataSetMultiPhase,prevFlowCapacityUOM:inputs?.prevFlowCapacityUOM,
        Wreq:inputs?.Wreq
    }
}

function FCWVTK_WF17(AsmeApiDataSet, valve, inputs, uoms) {    
    // console.log(' >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ');
    const isEnglishCalc = inputs.CalculationMethod === 'English';
    const requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
        "specificVolumeUOM": isEnglishCalc ? "specificvolume.ft3lb" : "specificvolume.m3kg",
        "specificHeatUOM": isEnglishCalc ? "specificheat.BTUlbR" : "specificheat.KJkgK",
        "latentHeatUOM": isEnglishCalc ? "latentheat.BTUlb" : "latentheat.KJkg",
        "massfluxUOM": isEnglishCalc ? "massflux.lbsft2" : "massflux.kghrcm2",
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
        "specificVolumeUOM": inputs?.SpecificVolumeUOM,
        "specificHeatUOM": inputs?.LiquidSpecificHeatAtInletUOM,
        "latentHeatUOM": inputs?.LatentHeatUOM
    }

    if(inputs?.functionName === 'FCWVTK_WF17') {
        console.log(' >>>>>>>>>>>>> ', {requiredUnits, receivedUOM});
    }
    
    let Vv1 = Number(inputs?.SpecificVolume);
    let Vl1 = Number(inputs?.SpecificVolumeLiquid);
    let Cp= Number(inputs?.LiquidSpecificHeatAtInlet);
    let hvl1 = Number(inputs?.LatentHeat);
    let V9 = Number(inputs?.IsDensityOrSpVolumeAt90PerSat);
    let Kv = Number(inputs?.ViscosityCorrectionFactorKv ?? 1);
    let Wv = Number(inputs?.Wv);
    let Wl = Number(inputs?.Wl);
    let Wreqp = Number(inputs?.Wreq);
    let x1 = Wv/Wreqp;
    const x1_Equ = `x1 = Wv/Wreq`;
    
    const N24 = inputs.constants['N24'];
    const N25 = inputs.constants['N25'];
    const N26 = inputs.constants['N26'];
    const N28 = inputs.constants['N28'];
    const N33 = inputs.constants['N33'];

    const Code = inputs.Code;
    const Z = Number(inputs.Compressibility);
    const k = Number(inputs.KCpByCv) === 1 ? 1.00001 : Number(inputs.KCpByCv);
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const M = Number(inputs.MolWeight);
    // console.log(' >>>>>>>>>>>>>> 11111111111 >>>>>>>>>>>>>>>>>>>>')
    const CT= convertUnit(Number(inputs.CriticalTemperature), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.CombinedSpVolAtInlet);
    const T = convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    const CriticalPressure= convertUnit(Number(inputs.CriticalPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.CombinedSpVolAtInlet);
    const Pset = convertUnit(Number(inputs.SetPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.SetPressure);
    const Pover = isNaN(Number(inputs.OverPressure)) ? 0 : convertUnit(Number(inputs.OverPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); // Number(inputs.OverPressure);
    const Psetp = (Pset + Pover) / 1.1;
    // console.log(' >>>>>>>>>>>>>> 2222222 >>>>>>>>>>>>>>>>>>>>')
    const Ploss = isNaN(Number(inputs.InletLoss)) ? 0 : convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    const Pbu = isNaN(Number(inputs.BuiltUp)) ? 0 : convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const Psic = isNaN(Number(inputs.ConstantSuperimposed)) ? 0 : convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    const Psiv = isNaN(Number(inputs.VariableSuperimposed)) ? 0 : convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    const Pback = isNaN(Number(inputs.TotalBackPressure)) ? 0 : convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    // console.log(' >>>>>>>>>>>>>> 3333333333 >>>>>>>>>>>>>>>>>>>>')
    const InletSpVolMixture=convertUnit(Number(inputs?.InletSpVolMixture), uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM))
    Vv1 = isNaN(Number(Vv1)) ? 0 : convertUnit(Number(Vv1), uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM));
    Vl1 = isNaN(Number(Vl1)) ? 0 : convertUnit(Number(Vl1), uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM));
    V9 = isNaN(Number(V9)) ? 0 : convertUnit(Number(V9), uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM));
    Cp = isNaN(Number(Cp)) ? 0 : convertUnit(Number(Cp), uoms.find(u => u.UnitKey === receivedUOM.specificHeatUOM), uoms.find(u => u.UnitKey === requiredUnits.specificHeatUOM));
    hvl1 = isNaN(Number(hvl1)) ? 0 : convertUnit(Number(hvl1), uoms.find(u => u.UnitKey === receivedUOM.latentHeatUOM), uoms.find(u => u.UnitKey === requiredUnits.latentHeatUOM));
    // console.log(' >>>>>>>>>>>>>> 4444444444444444 >>>>>>>>>>>>>>>>>>>>')
    let A = AsmeApiDataSet === "ASME" ? valve?.A : valve?.AAPI;
    const Asel = A;
    const Wreq = isNaN(Wreqp) ? 0 : convertUnitDiffDims(Wreqp, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);

    const Vreq = isNaN(Wv) ? 0 : convertUnitDiffDims(Wv, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
  
    const Liquid2Wl = isNaN(Wl) ? 0 : convertUnitDiffDims(Wl, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    // console.log(' >>>>>>>>>>>>>> 5555555555555 >>>>>>>>>>>>>>>>>>>>')
    const vvl1=Vv1-Vl1;
    let v1= x1 * Vv1 + (1 - x1) * Vl1;
    const v1_Equ = `v1 = x1 * vv1 + (1-x1) * vl1`;
    let P1 = Pset + Pover - Ploss + Patm;
    let P2 = Pback + Patm;
    let PR = P2 / P1;
    const SuperCriticalFlag=inputs?.IsSingleORMultiCompSys=='SingleComponentSystem' && inputs?.YesNoDetermine=='DetermineCriticalPoint' && CT <= T && CriticalPressure <= P1;
    x1=SuperCriticalFlag ? 1 : x1;
    v1 = SuperCriticalFlag ? InletSpVolMixture : v1;
    let TPR = Equation_1p1(k);
    let C = Equation_1p6(N33, k);
    
    let AbsPR = ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR });
    let Equation2p5 = ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR });
    let Kb = KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    let Kw = KbKwValidateExpressions(inputs.Kw_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }
    if(isNaN(Kw) || Kw < 0) {
        Kw = 0;
    }
    Kb = Number(Kb);
    Kw = Number(Kw);
    let omega;
    if(SuperCriticalFlag || inputs?.YesNoDetermine=='noradio'){
        omega = 9 * (V9 / v1 - 1);
        omega_Equ = `ωs = 9 * (v9 / v1 - 1)`;
    } else {
        omega=x1 * Vv1/v1 * (1- N24 * P1 * vvl1/hvl1) + N25 * Cp * T * P1/v1 * (vvl1/hvl1) ** 2;
        omega_Equ = `x1 * Vv1/v1 * (1- ${N24} * P1 * vvl1/hvl1) + ${N25} * Cp * T * P1/v1 * (vvl1/hvl1)^2`
    }
    const criticalPressureRatio = Number((1+(1.0446 - 0.0093431 * (omega ** 0.5)) * (omega ** (-0.56261))) ** (-0.70356 + (0.014685 * Math.log(omega))).toFixed(15));
    const criticalPressureRatio_Equ = `ηc = [1 + (1.0446 - 0.0093431 * ω^0.5] * ω^(-0.56261)] ^ (-0.70356 + 0.014685 * ln(ω))`;
    const ValveDataSetMultiPhase=inputs?.ValveDataSetMultiPhase;

    // const a1 =  SuperCriticalFlag?1:AsmeApiDataSet === "ASME" || (AsmeApiDataSet === "API" && ValveDataSetMultiPhase==="APIWtAvg")? x1 * Vv1/v1 : Number((x1 * Vv1/v1).toFixed(2));
    const a1 =  SuperCriticalFlag?1:AsmeApiDataSet === "ASME" || AsmeApiDataSet.toUpperCase() === "APIWTAVG" ? x1 * Vv1/v1 : Number((x1 * Vv1/v1).toFixed(2));
    const a1_Equ = `α1 = x1 * vv1 / v1`;

    const Pc = criticalPressureRatio * P1;
    const Pc_Equ = `Pc = ηc * P1`;
    let isCritical = Pc >= P2 ? 'Critical' : 'Sub-Critical';
    // if(valve.ModelNumber=='JLT-JBS-E' && valve?.Orifice=='T' && AsmeApiDataSet === "ASME") {
    //     console.log({ValveId:valve?.ValveId,ModelNumber:valve.ModelNumber,Orifice:valve?.Orifice, a1, x1,v1,vvl1, Vl1, Vv1,Cp,T,hvl1,P1,P2, Pc, Pc_Equ,omega,criticalPressureRatio});
    // }
    let G, G_Equ;
    if(isCritical === 'Critical') {
        G = N26 * criticalPressureRatio * ((P1/ (Number(v1) * omega)) ** 0.5);
        G_Equ = `${N26} * ηc * [P1 / v1 * ω] ^ 0.5`;
    } else {
        G = N26 * ((-2 * ((omega * Math.log(PR)) + ((omega -1) * (1 - PR)))) ** 0.5) / ((omega * (1/PR -1)) + 1 ) * ((P1/Number(v1)) ** 0.5);
        G_Equ = `${N26} * {-2 * [ω * ln(η2) + (ω - 1) * (1 - η2)]} ^ 0.5 * [(P1 / v1) ^ 0.5] / [ω * (1/η2 - 1) + 1]`;
    }
    
    const IsASMESection8 = inputs?.IsASMESection8;
    const KG = AsmeApiDataSet === "ASME" ? IsASMESection8?0.9 * valve?.Kmax: valve?.Kmax : valve?.KAPI;
    const KGAct = AsmeApiDataSet === "ASME" ? valve?.Kmax : valve?.KAPI;
    const KL = AsmeApiDataSet === "ASME" ? IsASMESection8?0.9 * valve?.KmaxL : valve?.KmaxL : valve?.KAPIL;
    const KLAct = AsmeApiDataSet === "ASME" ? valve?.KmaxL : valve?.KAPIL;

    // const KG = AsmeApiDataSet === "ASME" ? 0.9 * valve?.Kmax : valve?.KAPI;
    // const KL = AsmeApiDataSet === "ASME" ? 0.9 * valve?.KmaxL : valve?.KAPIL;
    
    // const K2Phi = AsmeApiDataSet === "ASME" || (AsmeApiDataSet === "API" && ValveDataSetMultiPhase==="APIWtAvg") ? a1 * KG + (1-a1) * KL : Wv==0?0.65:0.85;
    // const K2Phi_Equ = AsmeApiDataSet === "ASME"  || (AsmeApiDataSet === "API" && ValveDataSetMultiPhase==="APIWtAvg") ? `K2φ = α1 * KG + (1 - α1) * KL`: Wv==0?'0.65':'0.85';

    const K2Phi = AsmeApiDataSet === "ASME" || (AsmeApiDataSet.toUpperCase() === "APIWTAVG") ? a1 * KG + (1-a1) * KL : Wv==0?0.65:0.85;
    const K2PhiAct = AsmeApiDataSet === "ASME" || (AsmeApiDataSet.toUpperCase() === "APIWTAVG") ? a1 * KGAct + (1-a1) * KLAct : Wv==0?0.65:0.85;
    const K2Phi_Equ = AsmeApiDataSet === "ASME"  || (AsmeApiDataSet.toUpperCase() === "APIWTAVG") ? `K2φ = α1 * KG + (1 - α1) * KL`: Wv==0?'0.65':'0.85';


    const Kbw = a1 * Kb + (1-a1) * Kw;
    const Kbw_Equ = `Kbw = α1 * Kb + (1 - α1) * Kw`;
    const W = N28 * A * K2Phi * Kbw * Kc * Kv * G;
    const WActual = N28 * A * K2PhiAct * Kbw * Kc * Kv * G;
    const W_Equ =  `${N28} * A * K2φ * Kbw * Kc * Kv * G`; //isEnglishCalc ? `${N28} * A * K2φ * Kbw * Kc * Kv * G` : `A * K2φ * Kbw * Kc * Kv * G`;
    let Wsel = W;
    let Areq = A * Wreq / W;
    const Areq_Equ = `Areq = A * Wreq / W`;
    // if(valve.ModelNumber=='453' && valve?.Orifice=='J' ) {
        
    //     console.log({AsmeApiDataSet,ValveId:valve?.ValveId,ModelNumber:valve.ModelNumber,Orifice:valve?.Orifice,N28, N26 ,Vv1,Vl1,V9,Cp,hvl1, k,Kv,Wv:Vreq,Wl:Liquid2Wl,Wreq,Pset,Pover,Ploss,Pback,Patm,Kc,KG,KL,Kb,Kb_Expression:inputs.Kb_Expression,Kw,A,P1,P2,'η2':PR,AbsPR,TPR,  x1,x1_Equ,vvl1,v1,v1_Equ,'α1':a1,'α1_equ':a1_Equ,'K2φ':K2Phi,'K2φ_equ':K2Phi_Equ,Kbw,Kbw_Equ,'ω':omega, omega_Equ,'ηc':criticalPressureRatio,'ηc_equ':criticalPressureRatio_Equ, Pc,  Pc_Equ, isCritical, G, G_Equ,Wsel,  W, W_Equ, Areq,Areq_Equ});
    // }
    const equationValues = {
        requiredUnits, receivedUOM, Code, k, Kc, M, Z, T, Patm, Pset, Pover, Psetp,
        Ploss, Pbu, Psic, Psiv, Pback, A, Asel, Wreq, Wreqp,
        P1, P2, PR, TPR, C, AbsPR, Equation2p5, Kb, Kw, KG, KGAct, KL, KLAct, K2Phi, K2PhiAct, K2Phi_Equ, Kbw_Equ, Kbw, W, WActual, Wsel, Areq, N26, N28, N33, omega,omega_Equ, v1,vvl1, Vv1,V9, Vl1,hvl1,Cp, Kv,
        Liquid2Wl,Vreq, Pc, Pc_Equ, isCritical, criticalPressureRatio, criticalPressureRatio_Equ, x1, x1_Equ, a1, a1_Equ, v1_Equ, G, G_Equ, W_Equ, Areq_Equ,
        IsSingleORMultiCompSys: inputs?.IsSingleORMultiCompSys,FarFromCriticalPoint:inputs?.IsSingleORMultiCompSys=='SingleComponentSystem'?inputs?.YesNoDetermine=='yesradio'?'Yes':inputs?.YesNoDetermine=='noradio'?'No':inputs?.YesNoDetermine:'',
        IsBoilingRangeLT150F: inputs?.IsSingleORMultiCompSys=='SingleComponentSystem'?'':inputs?.YesNoDetermine=='yesradio'?'Yes':'No',
        CriticalPressure:inputs?.CriticalPressure,CriticalTemperature:inputs?.CriticalTemperature,
       
    }

    const convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPover = convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPloss = convertUnit(Ploss, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPbu = convertUnit(Pbu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsic = convertUnit(Psic, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsiv = convertUnit(Psiv, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPback = convertUnit(Pback, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedW = convertUnitDiffDims(W, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWActual = convertUnitDiffDims(WActual, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWsel = convertUnitDiffDims(Wsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreqp = convertUnitDiffDims(Wreqp, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const consvertedVreq = convertUnitDiffDims(Vreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWl = convertUnitDiffDims(Liquid2Wl, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedVv1 = convertUnitDiffDims(Vv1, uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM), uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms, inputs);
    const convertedVl1 = convertUnitDiffDims(Vl1, uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM), uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms, inputs);
    const convertedV9 = convertUnitDiffDims(V9, uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM), uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms, inputs);
    const convertedHvl1= convertUnit(hvl1, uoms.find(u => u.UnitKey === requiredUnits.latentHeatUOM), uoms.find(u => u.UnitKey === receivedUOM.latentHeatUOM));
    const convertedCp = convertUnit(Cp, uoms.find(u => u.UnitKey === requiredUnits.specificHeatUOM), uoms.find(u => u.UnitKey === receivedUOM.specificHeatUOM));

    const inputValues = {
        Code, k, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover,
        Psetp: convertedPsetp, Ploss: convertedPloss, Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, A: convertedA, Asel: convertedAsel, Wreqp: convertedWreqp,
        Wreq: convertedWreq, P1: convertedP1, P2: convertedP2, PR, TPR, C, AbsPR, Equation2p5, Kb, Kw, KG, KL, K2Phi, Kbw,
        W: convertedW, Wsel: convertedWsel, Areq: convertedAreq, N26, N28, N33, omega,omega_Equ, v1,vvl1, Vv1:convertedVv1, Vl1:convertedVl1, V9:convertedV9,hvl1:convertedHvl1,Cp:convertedCp, Kv,
        Liquid2Wl: convertedWl, WActual: convertedWActual, Vreq: consvertedVreq, Pc: Pc, isCritical, criticalPressureRatio, x1, a1, G,
        IsSingleORMultiCompSys: inputs?.IsSingleORMultiCompSys,FarFromCriticalPoint:inputs?.IsSingleORMultiCompSys=='SingleComponentSystem'?inputs?.YesNoDetermine=='yesradio'?'Yes':inputs?.YesNoDetermine=='noradio'?'No':inputs?.YesNoDetermine:'',
        IsBoilingRangeLT150F: inputs?.IsSingleORMultiCompSys=='SingleComponentSystem'?'':inputs?.YesNoDetermine=='yesradio'?'Yes':'No',
        CriticalPressure:inputs?.CriticalPressure,CriticalTemperature:inputs?.CriticalTemperature,
        ValveDataSet2Phase:AsmeApiDataSet
    }

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    let latentHeatUOM = uoms.find(u => u.UnitKey === requiredUnits.latentHeatUOM).UnitName;
    let specificHeatUOM = uoms.find(u => u.UnitKey === requiredUnits.specificHeatUOM).UnitName;
    let specificVolumeUOM = uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM).UnitName;
    const massfluxUOM = uoms.find(u => u.UnitKey === requiredUnits.massfluxUOM).UnitName;
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, specificVolumeUOM, latentHeatUOM,specificHeatUOM,massfluxUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    latentHeatUOM = uoms.find(u => u.UnitKey === receivedUOM.latentHeatUOM).UnitName;
    specificHeatUOM = uoms.find(u => u.UnitKey === receivedUOM.specificHeatUOM).UnitName;
    specificVolumeUOM = uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM).UnitName;
    
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, specificVolumeUOM,specificHeatUOM, latentHeatUOM };

    const ReResponse = JSON.stringify({ equationValues, inputValues, uomRequired, uomReceived });

    return {
        Code, k, Kc, M, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover,
        Psetp: convertedPsetp, Ploss: convertedPloss, Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback,
        A: convertedA, Asel: convertedAsel, Wreqp: convertedWreqp,
        Wreq: convertedWreq, P1: convertedP1, P2: convertedP2, PR, TPR, C,  AbsPR, Equation2p5, Kb, Kw, KG, KGAct, KL, KLAct, K2Phi, K2PhiAct, Kbw,
        W: convertedW, Wsel: convertedWsel, Areq: convertedAreq, ReResponse, N26, N28, N33, omega,omega_Equ, v1,vvl1, Vv1:convertedVv1, Vl1:convertedVl1, V9:convertedV9,hvl1:convertedHvl1, Cp:convertedCp, Kv,
        Vreq:consvertedVreq, WActual: convertedWActual, Wl:inputs?.Wl, Wv, Liquid2Wl: convertedWl, Pc: Pc, isCritical, criticalPressureRatio, x1, a1, G,
        valveKmax: valve?.Kmax, valveKApi: valve?.KAPI??valve?.KApi,
        SizingBasis: inputs.SizingBasis,SystemMAWP: inputs.SystemMAWP,
        KADataSet:AsmeApiDataSet,CalculationMethod:inputs.CalculationMethod,
        IsASMESection8: inputs?.IsASMESection8,valveA:valve.A,valveAAPI: valve.AAPI,
        service: inputs?.service, ShortName: valve?.ShortName, 
        m: valve?.m, b: valve?.b, E: valve?.E, Tp: valve?.Tp,Tpunits:valve?.Tpunits,
        CriticalTemperature:inputs?.CriticalTemperature,CriticalPressure:inputs?.CriticalPressure,
        IsSingleORMultiCompSys: inputs?.IsSingleORMultiCompSys, YesNoDetermine: inputs?.YesNoDetermine,
        valveKmaxL:valve?.KmaxL,valveKAPIL:valve?.KAPIL,valveAL:valve?.AL,valveAAPIL:valve?.AAPIL,
        ViscosityCorrectionFactorKv:inputs?.ViscosityCorrectionFactorKv,
        ValveDataSetMultiPhase:inputs?.ValveDataSetMultiPhase,
        InletSpVolMixture: inputs?.InletSpVolMixture,
        Wreq:inputs?.Wreq,SpecificVolume:inputs?.SpecificVolume,SpecificVolumeLiquid:inputs?.SpecificVolumeLiquid,LiquidSpecificHeatAtInlet:inputs?.LiquidSpecificHeatAtInlet,
        LatentHeat:inputs?.LatentHeat,IsDensityOrSpVolumeAt90PerSat:inputs?.IsDensityOrSpVolumeAt90PerSat,
    }
}

function FCWVTK_WF18(AsmeApiDataSet, valve, inputs, uoms) {    
    // console.log(' >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ');
    const isEnglishCalc = inputs.CalculationMethod === 'English';
    const requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
        "specificVolumeUOM": isEnglishCalc ? "specificvolume.ft3lb" : "specificvolume.m3kg",
        "specificHeatUOM": isEnglishCalc ? "specificheat.BTUlbR" : "specificheat.KJkgK",
        "latentHeatUOM": isEnglishCalc ? "latentheat.BTUlb" : "latentheat.KJkg",
        "massfluxUOM": isEnglishCalc ? "massflux.lbsft2" : "massflux.kghrcm2",
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
        "specificVolumeUOM": inputs?.SpecificVolumeUOM,
        "specificHeatUOM": inputs?.SpecificVolumeUOM,
        "latentHeatUOM": inputs?.LatentHeatUOM
    }
    
    let Vg1 = Number(inputs?.GasVaporCombinedSpVol);
    let Vl1 = Number(inputs?.SpecificVolumeLiquid);
   
    let Kv = Number(inputs?.ViscosityCorrectionFactorKv ?? 1);
    let Wg = Number(inputs?.Wg);
    let Wv = Number(inputs?.Wv);
    let Wl = Number(inputs?.Wl);
    let Wreqp = Number(inputs?.Wreq);
    const x1 = (Wg+Wv)/Wreqp;
    const x1_Equ = `x1 = (Wg + Wv)/Wreq`;
    
 
    const N26 = inputs.constants['N26'];
    const N28 = inputs.constants['N28'];
    const N33 = inputs.constants['N33'];

    const Code = inputs.Code;
    const Z = Number(inputs.Compressibility);
    const k = Number(inputs.KCpByCv) === 1 ? 1.00001 : Number(inputs.KCpByCv);
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const M = Number(inputs.MolWeight);
    // console.log(' >>>>>>>>>>>>>> 11111111111 >>>>>>>>>>>>>>>>>>>>')
    const T = convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    const Pset = convertUnit(Number(inputs.SetPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.SetPressure);
    const Pover = isNaN(Number(inputs.OverPressure)) ? 0 : convertUnit(Number(inputs.OverPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); // Number(inputs.OverPressure);
    const Psetp = (Pset + Pover) / 1.1;
    // console.log(' >>>>>>>>>>>>>> 2222222 >>>>>>>>>>>>>>>>>>>>')
    const Ploss = isNaN(Number(inputs.InletLoss)) ? 0 : convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    const Pbu = isNaN(Number(inputs.BuiltUp)) ? 0 : convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const Psic = isNaN(Number(inputs.ConstantSuperimposed)) ? 0 : convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    const Psiv = isNaN(Number(inputs.VariableSuperimposed)) ? 0 : convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    const Pback = isNaN(Number(inputs.TotalBackPressure)) ? 0 : convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    // console.log(' >>>>>>>>>>>>>> 3333333333 >>>>>>>>>>>>>>>>>>>>')
    Vg1 = isNaN(Number(Vg1)) ? 0 : convertUnit(Number(Vg1), uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM));
    Vl1 = isNaN(Number(Vl1)) ? 0 : convertUnit(Number(Vl1), uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM));
    // console.log(' >>>>>>>>>>>>>> 4444444444444444 >>>>>>>>>>>>>>>>>>>>')
    let A = AsmeApiDataSet === "ASME" ? valve?.A : valve?.AAPI;
    const Asel = A;
    const Wreq = isNaN(Wreqp) ? 0 : convertUnitDiffDims(Wreqp, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    Wg= isNaN(Wg) ? 0 : convertUnitDiffDims(Wg, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    const Vreq = isNaN(Wv) ? 0 : convertUnitDiffDims(Wv, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
  
    const Liquid2Wl = isNaN(Wl) ? 0 : convertUnitDiffDims(Wl, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    // console.log(' >>>>>>>>>>>>>> 5555555555555 >>>>>>>>>>>>>>>>>>>>')
    const vvl1=Vg1-Vl1;
    let v1= x1 * Vg1 + (1 - x1) * Vl1;
    let P1 = Pset + Pover - Ploss + Patm;
    let P2 = Pback + Patm;
    let PR = P2 / P1;
    let TPR = Equation_1p1(k);
    let C = Equation_1p6(N33, k);
    
    let AbsPR = ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR });
    let Equation2p5 = ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR });
    let Kb = KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    let Kw = KbKwValidateExpressions(inputs.Kw_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }
    if(isNaN(Kw) || Kw < 0) {
        Kw = 0;
    }
    Kb = Number(Kb);
    Kw = Number(Kw);
    let omega = (x1 * Vg1 )/(v1 * k);
    omega_Equ = `ωs = (x1 * Vg1 ) / (v1 * k)`;

    const ValveDataSetMultiPhase=inputs?.ValveDataSetMultiPhase;

    const criticalPressureRatio = Number((1+(1.0446 - 0.0093431 * (omega ** 0.5)) * (omega ** (-0.56261))) ** (-0.70356 + (0.014685 * Math.log(omega))).toFixed(15));
    const criticalPressureRatio_Equ = `ηc = [1 + (1.0446 - 0.0093431 * ω^0.5] * ω^(-0.56261)] ^ (-0.70356 + 0.014685 * ln(ω))`;
    const v1_Equ = `v1 = x1 * vg1 + (1-x1) * vl1`;
    // const a1 = x1 * Vg1/v1;
    // const a1=AsmeApiDataSet === "ASME" || (AsmeApiDataSet === "API" && ValveDataSetMultiPhase==="APIWtAvg")? x1 * Vg1/v1 : Number((x1 * Vg1/v1).toFixed(2));
    const a1=AsmeApiDataSet === "ASME" || AsmeApiDataSet.toUpperCase() === "APIWTAVG"? x1 * Vg1/v1 : Number((x1 * Vg1/v1).toFixed(2));
    const a1_Equ = `α1 = x1 * vg1 / v1`;

    const Pc = criticalPressureRatio * P1;
    const Pc_Equ = `Pc = ηc * P1`;
    let isCritical = Pc >= P2 ? 'Critical' : 'Sub-Critical';

    let G, G_Equ;
    if(isCritical === 'Critical') {
        G = N26 * criticalPressureRatio * ((P1/ (Number(v1) * omega)) ** 0.5);
        G_Equ = `${N26} * ηc * [P1 / v1 * ω] ^ 0.5`;
    } else {
        G = N26 * ((-2 * ((omega * Math.log(PR)) + ((omega -1) * (1 - PR)))) ** 0.5) / ((omega * (1/PR -1)) + 1 ) * ((P1/Number(v1)) ** 0.5);
        G_Equ = `${N26} * {-2 * [ω * ln(η2) + (ω - 1) * (1 - η2)]} ^ 0.5 * [(P1 / v1) ^ 0.5] / [ω * (1/η2 - 1) + 1]`;
    }

    const IsASMESection8 = inputs?.IsASMESection8;
    const KG = AsmeApiDataSet === "ASME" ? IsASMESection8?0.9 * valve?.Kmax: valve?.Kmax : valve?.KAPI;
    const KGAct = AsmeApiDataSet === "ASME" ? valve?.Kmax : valve?.KAPI;
    const KL = AsmeApiDataSet === "ASME" ? IsASMESection8?0.9 * valve?.KmaxL : valve?.KmaxL : valve?.KAPIL;
    const KLAct = AsmeApiDataSet === "ASME" ? valve?.KmaxL : valve?.KAPIL;

    // const KG = AsmeApiDataSet === "ASME" ? 0.9 * valve?.Kmax : valve?.KAPI;
    // const KL = AsmeApiDataSet === "ASME" ? 0.9 * valve?.KmaxL : valve?.KAPIL;
    // const K2Phi = AsmeApiDataSet === "ASME" ? a1 * KG + (1-a1) * KL : Wv==0?0.65:0.85;
    // const K2Phi_Equ = AsmeApiDataSet === "ASME" ? `K2φ = α1 * KG + (1 - α1) * KL`: '';
    // const K2Phi = AsmeApiDataSet === "ASME" || (AsmeApiDataSet === "API" && ValveDataSetMultiPhase==="APIWtAvg") ? a1 * KG + (1-a1) * KL : (Wg+Wv)==0?0.65:0.85;
    // const K2Phi_Equ = AsmeApiDataSet === "ASME"  || (AsmeApiDataSet === "API" && ValveDataSetMultiPhase==="APIWtAvg") ? `K2φ = α1 * KG + (1 - α1) * KL`: (Wg+Wv)==0?'0.65':'0.85';

    const K2Phi = AsmeApiDataSet === "ASME" || (AsmeApiDataSet.toUpperCase() === "APIWTAVG") ? a1 * KG + (1-a1) * KL : (Wg+Wv)==0?0.65:0.85;
    const K2PhiAct = AsmeApiDataSet === "ASME" || (AsmeApiDataSet.toUpperCase() === "APIWTAVG") ? a1 * KGAct + (1-a1) * KLAct : (Wg+Wv)==0?0.65:0.85;
    const K2Phi_Equ = AsmeApiDataSet === "ASME"  || (AsmeApiDataSet.toUpperCase() === "APIWTAVG") ? `K2φ = α1 * KG + (1 - α1) * KL`: (Wg+Wv)==0?'0.65':'0.85';

    const Kbw = a1 * Kb + (1-a1) * Kw;
    const Kbw_Equ = `Kbw = α1 * Kb + (1 - α1) * Kw`;
    const W = N28 * A * K2Phi * Kbw * Kc * Kv * G;
    const WActual = N28 * A * K2PhiAct * Kbw * Kc * Kv * G;
    const W_Equ =  `${N28} * A * K2φ * Kbw * Kc * Kv * G`; //isEnglishCalc ? `${N28} * A * K2φ * Kbw * Kc * Kv * G` : `A * K2φ * Kbw * Kc * Kv * G`;
    let Wsel = W;
    let Areq = A * Wreq / W;
    const Areq_Equ = `Areq = A * Wreq / W`;
    // if(valve.ModelNumber=='453' && valve?.Orifice=='D' //&& AsmeApiDataSet === "ASME"

    // ) {
        
    //     console.log({AsmeApiDataSet,ValveId:valve?.ValveId,ModelNumber:valve.ModelNumber,Orifice:valve?.Orifice,N28, N26 ,Vg1,Vl1, k,Kv,Wg,Wv:Vreq,Wl:Liquid2Wl,Wreq,Pset,Pover,Ploss,Pback,Patm,Kc,KG,KL,Kb,Kb_Expression:inputs.Kb_Expression,Kw,A,P1,P2,'η2':PR,AbsPR,TPR,  x1,x1_Equ,v1,v1_Equ,'α1':a1,'α1_equ':a1_Equ,'K2φ':K2Phi,'K2φ_equ':K2Phi_Equ,Kbw,Kbw_Equ,'ω':omega, omega_Equ,'ηc':criticalPressureRatio,'ηc_equ':criticalPressureRatio_Equ, Pc,  Pc_Equ, isCritical, G, G_Equ,Wsel,  W, W_Equ, Areq,Areq_Equ});
    // }
    const equationValues = {
        requiredUnits, receivedUOM, Code, k, Kc, M, Z, T, Patm, Pset, Pover, Psetp,
        Ploss, Pbu, Psic, Psiv, Pback, A, Asel, Wreq, Wreqp,
        P1, P2, PR, TPR, C, AbsPR, Equation2p5, Kb, Kw, KG, KGAct, KL, KLAct, K2Phi, K2PhiAct, K2Phi_Equ, Kbw_Equ, Kbw, W,WActual, Wsel, Areq, N26, N28, N33, omega, v1,vvl1, Vg1, Vl1, Kv,
        Wg, Liquid2Wl,Vreq, Pc, Pc_Equ, isCritical, criticalPressureRatio, criticalPressureRatio_Equ, x1, x1_Equ, a1, a1_Equ, v1_Equ, G, G_Equ, W_Equ, Areq_Equ,
       
    }

    const convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPover = convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPloss = convertUnit(Ploss, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPbu = convertUnit(Pbu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsic = convertUnit(Psic, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsiv = convertUnit(Psiv, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPback = convertUnit(Pback, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedW = convertUnitDiffDims(W, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWActual = convertUnitDiffDims(WActual, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);    
    const convertedWsel = convertUnitDiffDims(Wsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreqp = convertUnitDiffDims(Wreqp, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const consvertedVreq = convertUnitDiffDims(Vreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWl = convertUnitDiffDims(Liquid2Wl, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWg= convertUnitDiffDims(Wg, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedVg1 = convertUnitDiffDims(Vg1, uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM), uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms, inputs);
    const convertedVl1 = convertUnitDiffDims(Vl1, uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM), uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms, inputs);
    
    const inputValues = {
        Code, k, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover,
        Psetp: convertedPsetp, Ploss: convertedPloss, Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, A: convertedA, Asel: convertedAsel, Wreqp: convertedWreqp,
        Wreq: convertedWreq, P1: convertedP1, P2: convertedP2, PR, TPR, C, AbsPR, Equation2p5, Kb, Kw, KGAct, KL, KLAct, K2Phi, K2PhiAct, Kbw,
        W: convertedW, WActual: convertedWActual, Wsel: convertedWsel, Areq: convertedAreq, N26, N28, N33, omega, v1,vvl1, Vg1:convertedVg1, Vl1:convertedVl1, Kv,
        Liquid2Wl: convertedWl, Vreq: consvertedVreq,Wg:convertedWg, Pc: Pc, isCritical, criticalPressureRatio, x1, a1, G,
        ValveDataSet2Phase:AsmeApiDataSet
    }

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    
    let specificVolumeUOM = uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM).UnitName;
    const massfluxUOM = uoms.find(u => u.UnitKey === requiredUnits.massfluxUOM).UnitName;
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, specificVolumeUOM, massfluxUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    specificVolumeUOM = uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM).UnitName;
    
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, specificVolumeUOM };

    const ReResponse = JSON.stringify({ equationValues, inputValues, uomRequired, uomReceived });

    return {
        Code, k, Kc, M, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover,
        Psetp: convertedPsetp, Ploss: convertedPloss, Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback,
        A: convertedA, Asel: convertedAsel, Wreqp: convertedWreqp,
        Wreq: convertedWreq, P1: convertedP1, P2: convertedP2, PR, TPR, C,  AbsPR, Equation2p5, Kb, Kw, KGAct, KL, KLAct, K2Phi, K2PhiAct, Kbw,
        W: convertedW, WActual: convertedWActual, Wsel: convertedWsel, Areq: convertedAreq, ReResponse, N26, N28, N33, omega, v1,vvl1, Vg1:convertedVg1, Vl1:convertedVl1, Kv,
        Vreq:consvertedVreq,Wg:convertedWg,Wv:consvertedVreq, Wl: convertedWl, Pc: Pc, isCritical, criticalPressureRatio, x1, a1, G,
        GasVaporCombinedSpVol:inputs?.GasVaporCombinedSpVol,SpecificVolumeLiquid:inputs?.SpecificVolumeLiquid,
        ViscosityCorrectionFactorKv:inputs?.ViscosityCorrectionFactorKv,Wg:inputs?.Wg,Wv:inputs?.Wv,Wl:inputs?.Wl,
        valveKmax: valve?.Kmax, valveKApi: valve?.KAPI??valve?.KApi,
        SizingBasis: inputs.SizingBasis,SystemMAWP: inputs.SystemMAWP,
        KADataSet:AsmeApiDataSet,CalculationMethod:inputs.CalculationMethod,
        IsASMESection8: inputs?.IsASMESection8,valveA:valve.A,valveAAPI: valve.AAPI,
        service: inputs?.service, ShortName: valve?.ShortName, 
        m: valve?.m, b: valve?.b, E: valve?.E, Tp: valve?.Tp,Tpunits:valve?.Tpunits,
        valveKmaxL:valve?.KmaxL,valveKAPIL:valve?.KAPIL,valveAL:valve?.AL,valveAAPIL:valve?.AAPIL,
        ValveDataSetMultiPhase:inputs?.ValveDataSetMultiPhase,
        Wreq:inputs?.Wreq,
    }
}

function FCWVTK_WF19(AsmeApiDataSet, valve, inputs, uoms) {    
    
    const isEnglishCalc = inputs.CalculationMethod === 'English';

    const isMassFlow = inputs?.FlowCapacityUOM.includes('massflow');
    let isSuperCritical = false;
    const requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isEnglishCalc ? "liquidvolflow.GPMUS" : "liquidvolflow.m3hr",
        "flowCapacityMassUOM": isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
        "massfluxUOM": isEnglishCalc ? "massflux.lbsft2" : "massflux.kghrcm2",
        "densityUOM": isEnglishCalc ? "density.lbft3" : "density.kgm3",
        "specificVolumeUOM": isEnglishCalc ? "specificvolume.ft3lb" : "specificvolume.m3kg",
        "latentHeatUOM": isEnglishCalc ? "latentheat.BTUlb" : "latentheat.KJkg",
        "specificHeatUOM": isEnglishCalc ? "specificheat.BTUlbR" : "specificheat.KJkgK"
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
        "specificVolumeUOM": inputs?.SpecificVolumeUOM,
        "latentHeatUOM": inputs?.LatentHeatUOM,
        "specificHeatUOM": inputs?.LiquidSpecificHeatAtInletUOM,
        "densityUOM": inputs?.DensityUOM
    }

    const N25 = inputs.constants['N25'];
    const N26 = inputs.constants['N26'];
    const N27 = inputs.constants['N27'];
    const N29 = inputs.constants['N29'];
    const IsASMESection8 = inputs?.IsASMESection8;
    const k = Number(inputs.KCpByCv) === 1 ? 1.00001 : Number(inputs.KCpByCv);
    const CriticalPressure = inputs?.CriticalPressure;
    const CriticalTemperature = inputs?.CriticalTemperature;
    const IsSingleORMultiCompSys = inputs?.IsSingleORMultiCompSys;
    let DensityLiquid = Number(inputs?.DensityLiquid);
    let MixDensityAt90PerSat = Number(inputs?.MixDensityAt90PerSat);
    let LiquidSpecificHeatAtInlet = Number(inputs?.LiquidSpecificHeatAtInlet);
    let A = AsmeApiDataSet === "ASME" ? valve?.A : valve?.AAPI;
    let AL = AsmeApiDataSet === "ASME" ? valve?.AL : valve?.AAPIL;
    let Asel = AL ? AL : A;
    let KL = AsmeApiDataSet === "ASME" ? (IsASMESection8 ? 0.9 * valve?.KmaxL : valve?.KmaxL) : valve?.KAPIL;
    let KLAct = AsmeApiDataSet === "ASME" ? valve?.KmaxL : valve?.KAPIL;

    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const Kv = Number(inputs?.ViscosityCorrectionFactorKv);
    let Wreqp = Number(inputs?.VlreqMass ? inputs?.VlreqMass : inputs?.Qreq ? inputs?.Qreq : inputs?.Wreq);
    let Ps = Number(inputs.VaporSaturationPressure);
    let Patm = Number(inputs.AtmPressure);
    let Pset = Number(inputs.SetPressure);
    let Pover = Number(inputs.OverPressure);
    let Ploss = Number(inputs.InletLoss);
    let Pbu = Number(inputs.BuiltUp);
    let Psic = Number(inputs.ConstantSuperimposed)
    let Psiv = Number(inputs.VariableSuperimposed)
    let Pback = Number(inputs.TotalBackPressure)
    let T = Number(inputs.Relieving);
    let hvls = Number(inputs?.LatentHeat);
    let vvs = Number(inputs?.SaturatedVaporSpVol);
    let vls = Number(inputs?.SaturatedLiquidSpVol);
    let omega = Number(inputs?.Omega);
    let inputValues = {
       k, Kc, Ps, Patm, Pset, Pover, Ploss, Pbu, Psic, Psiv, Pback, Wreq: Wreqp, N26, N27, N29, Kc, Kv, MixDensityAt90PerSat, DensityLiquid,
       LiquidSpecificHeatAtInlet, T, CriticalPressure, CriticalTemperature, vvs, vls,hvls, IsSingleORMultiCompSys,
       FarFromCriticalPoint:inputs?.IsSingleORMultiCompSys=='SingleComponentSystem'?inputs?.YesNoDetermine=='yesradio'?'Yes':inputs?.YesNoDetermine=='noradio'?'No':inputs?.YesNoDetermine:'',
        IsBoilingRangeLT150F: inputs?.IsSingleORMultiCompSys=='SingleComponentSystem'?'':inputs?.YesNoDetermine=='yesradio'?'Yes':'No', 
    };
    
    
    Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    Pcrit = convertUnit(Number(inputs?.CriticalPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    Pset = convertUnit(Number(inputs.SetPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.SetPressure);
    Pover = isNaN(Number(inputs.OverPressure)) ? 0 : convertUnit(Number(inputs.OverPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); // Number(inputs.OverPressure);
    Ploss = isNaN(Number(inputs.InletLoss)) ? 0 : convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    Pbu = isNaN(Number(inputs.BuiltUp)) ? 0 : convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    Psic = isNaN(Number(inputs.ConstantSuperimposed)) ? 0 : convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    Psiv = isNaN(Number(inputs.VariableSuperimposed)) ? 0 : convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    Pback = isNaN(Number(inputs.TotalBackPressure)) ? 0 : convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    Ps = isNaN(Number(inputs.VaporSaturationPressure)) ? 0 : convertUnit(Number(inputs.VaporSaturationPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM));//Number(inputs.TotalBackPressure);
    T = isNaN(Number(inputs.Relieving)) ? 0 : convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving);
    Tcrit = isNaN(Number(inputs?.CriticalTemperature)) ? 0 : convertUnit(Number(inputs?.CriticalTemperature), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving);
    DensityLiquid = isNaN(DensityLiquid) ? 0 : convertUnit(DensityLiquid, uoms.find(u => u.UnitKey === receivedUOM.densityUOM), uoms.find(u => u.UnitKey === requiredUnits.densityUOM));
    const SpGravity = isEnglishCalc ? DensityLiquid / 62.36649718 : DensityLiquid / 1000;
    const newInputs = {...inputs, SpGravity };
    MixDensityAt90PerSat = isNaN(MixDensityAt90PerSat) ? 0 : convertUnit(MixDensityAt90PerSat, uoms.find(u => u.UnitKey === receivedUOM.densityUOM), uoms.find(u => u.UnitKey === requiredUnits.densityUOM));
    LiquidSpecificHeatAtInlet = isNaN(LiquidSpecificHeatAtInlet) ? 0 : convertUnit(LiquidSpecificHeatAtInlet, uoms.find(u => u.UnitKey === receivedUOM.specificHeatUOM), uoms.find(u => u.UnitKey === requiredUnits.specificHeatUOM));
    hvls = isNaN(hvls) ? 0 : convertUnit(hvls, uoms.find(u => u.UnitKey === receivedUOM.latentHeatUOM), uoms.find(u => u.UnitKey === requiredUnits.latentHeatUOM));
    vvs = isNaN(vvs) ? 0 : convertUnit(vvs, uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM));
    vls = isNaN(vls) ? 0 : convertUnit(vls, uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM));
    let vvls = vvs- vls;
    const Wreq = isNaN(Wreqp) ? 0 : convertUnitDiffDims(Wreqp, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, newInputs);
    let Psetp = (Pset + Pover) / 1.1;
    let P1 = Pset + Pover - Ploss + Patm;
    let P2 = Pback + Patm;
    let PR = P2 / P1;

    let Kw = KbKwValidateExpressions(inputs.Kw_Expression, { Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    
    if(isNaN(Kw) || Kw < 0) {
        Kw = 0;
    }
    inputValues.Kw = Kw;
    Kw = Number(Kw);

    let farFromCriticalPoint = false;
    let isBoilingRangeLT150F = false;
    if(IsSingleORMultiCompSys === 'SingleComponentSystem') {
        farFromCriticalPoint = inputs?.YesNoDetermine === 'yesradio';
        if(inputs?.YesNoDetermine === 'DetermineCriticalPoint') {
            if(P1 <= 0.5 * Pcrit || T <= 0.9 * Tcrit) {
                farFromCriticalPoint = true;
            } else if (P1 >= Pcrit && T >= Tcrit) {
                isSuperCritical = true;
            } else {
                farFromCriticalPoint = false;
            }
        }
    } else {
        isBoilingRangeLT150F = inputs?.YesNoDetermine === 'yesradio';
    }
    
    if(isSuperCritical) {
        return {};
    }

    let omega_Equ = '';
    if(farFromCriticalPoint || isBoilingRangeLT150F) {
        omega_Equ = '1.31';
        omega = N25 * DensityLiquid * LiquidSpecificHeatAtInlet * T * Ps * (vvls / hvls) ** 2;
    } else {
        omega_Equ = '1.32';
        omega = 9 * (DensityLiquid / MixDensityAt90PerSat - 1);
    }
    
    const tranSatPressureRatio = 2 * omega / (1 + 2 * omega);
    const tranSatPressureRatio_Equ = `ηst = 2 * ωs / (1 + 2 * ωs)`;
    const Pst = tranSatPressureRatio * P1;
    const Pst_Equ = `Pst = ηst * P1`;

    const satPressureRatio = Ps / P1;
    const satPressureRatio_Equ = `ηs = Ps / P1`;


    let subcoolingRegion = '';
    let isCritical = '';
    let G_Equ = ``;
    let G;
    let Pc = '';
    let Pc_Equ = '';
    let PR1 = '';
    let criticalPressureRatio = '';
    let criticalPressureRatio_Equ = '';
    // Check for Cooling 
    if(Ps >= Pst) {
        subcoolingRegion = 'Low Subcooling';
        if(satPressureRatio <= tranSatPressureRatio) {
            criticalPressureRatio = satPressureRatio;
            criticalPressureRatio_Equ = `ηc =  ηs`;
        } else {
            if(omega == 0.5) {
                if(satPressureRatio == 1) {
                    criticalPressureRatio = 0.5;
                    criticalPressureRatio_Equ = `ηc = 0.5`;
                } else {
                    criticalPressureRatio = 2 * ((1+satPressureRatio - (satPressureRatio**2 * (1 - 0.5 * Math.log(satPressureRatio)) + satPressureRatio + (1/satPressureRatio) + 0.5 * Math.log(satPressureRatio) + 1)**0.5)/(satPressureRatio - (1/satPressureRatio)));
                    criticalPressureRatio_Equ = `ηc = 2[1+ηs-(ηs^2*(1-0.5ln(ηs)) + ηs + (1/ηs) + 0.5 * ln(ηs) + 1)^0.5/ηs - 1/ηs]`;
                }
            } else {
                criticalPressureRatio = satPressureRatio * (2 * omega/ ((2 * omega) - 1)) * [1 - (1 - (((2 * omega) - 1)/ (2 * omega * satPressureRatio))) ** 0.5];
                criticalPressureRatio_Equ = `ηc = ηs * (2 * ωs/ (2 * ωs - 1)) * [1 - (1 - ((2 * ωs - 1)/ (2 * ωs * ηs))) ^ 0.5]`;
            }
        }
        Pc = criticalPressureRatio * P1;
        Pc_Equ = `Pc = ηc * P1`;
        isCritical = Pc >= P2 ? 'Critical' : 'Sub-Critical';
        PR1 = isCritical === 'Critical' ? criticalPressureRatio : PR;
        G_Equ = `G = ${N26} * {2 * (1 - ηs) + 2 * [ωs * ηs * ln(ηs/${isCritical === 'Critical' ? 'ηc' : 'η2'}) - (ωs - 1) * (ηs - ${isCritical === 'Critical' ? 'ηc' : 'η2'})]}^0.5 / [ωs * (ηs / ${isCritical === 'Critical' ? 'ηc' : 'η2'} - 1) + 1] * (P1 * ρl1)^0.5`;
        G = N26 * (2 * (1 - satPressureRatio) + 2 * (omega * satPressureRatio * Math.log(satPressureRatio / PR1) - (omega - 1) * (satPressureRatio - PR1))) ** 0.5 * (P1 * DensityLiquid) ** 0.5 / (omega * (satPressureRatio / PR1 - 1) + 1);
        // if(isNaN(G) || G < 0) {
            // console.log('G >>>>>>>>> 111111111111 >>>>>>>>', G, satPressureRatio, PR1, omega,DensityLiquid);
        // }
    } else {
        subcoolingRegion = 'High Subcooling';
        isCritical = Ps >= P2 ? 'Critical' : 'Sub-Critical';
        const P = isCritical === 'Critical' ? Ps : P2;
        G_Equ = `G = ${N27} * [ρl1 * (P1 - ${ isCritical === 'Critical' ? `Ps` : `P2`})]^0.5`;
        G = N27 * (DensityLiquid * (P1 - P)) ** 0.5;
        // if(isNaN(G) || G < 0) {
            // console.log('G >>>>>>>>> 222222222 >>>>>>>>', G, DensityLiquid, P1, P);
        // }
    }
    if(AsmeApiDataSet !== 'ASME') {
        KL = P1 === Ps ? 0.85 : 0.65;
        KLAct = P1 === Ps ? 0.85 : 0.65;
    }
    const ValveDataSetMultiPhase=inputs?.ValveDataSetMultiPhase;
    const Vl_Equ = isEnglishCalc ?  `Vl = A * KL * Kw * Kc * Kv * G / ${N29} * ρl1` : `Vl = A * KL * Kw * Kc * Kv * G / ρl1`;
    const Vl_eq = (Asel * KL * Kw * Kc * Kv * G) / (N29 * DensityLiquid);
    let VlAct = (Asel * KLAct * Kw * Kc * Kv * G) / (N29 * DensityLiquid);
    let Vl = Vl_eq;
    let Areq = Asel * Wreq / Vl_eq;
    const Areq_Equ = `Areq = A * VL1req / VL`;
    let W = '';
    let W_eq = '';
    let WActual = '';
    let Wsel = Vl_eq;
    // if(isNaN(G) || isNaN(W)){
        // console.log('W >>>>>>>>>>>>>>>>>>>>>>>',valve?.ModelNumber,valve?.Orifice, W, WActual, Wsel, Areq, Wreq, Vl, G,inputs);
    // }
    if(isMassFlow) {
        W = convertUnitDiffDims(Vl, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, newInputs);
        WActual = convertUnitDiffDims(VlAct, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, newInputs);
        W_eq = convertUnitDiffDims(Vl, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityMassUOM), uoms, newInputs);
        Vl = inputs?.prevFlowCapacityUOM?.includes('liquidvolflow') ? convertUnitDiffDims(Vl, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === inputs?.prevFlowCapacityUOM), uoms, newInputs) : Vl;
        VlAct = inputs?.prevFlowCapacityUOM?.includes('liquidvolflow') ? convertUnitDiffDims(VlAct, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === inputs?.prevFlowCapacityUOM), uoms, newInputs) : VlAct;
    } else {
        W = convertUnitDiffDims(Vl, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityMassUOM), uoms, newInputs);
        WActual = convertUnitDiffDims(VlAct, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityMassUOM), uoms, newInputs);
        W_eq = W;
        Vl = convertUnitDiffDims(Vl, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, newInputs);
        VlAct = convertUnitDiffDims(VlAct, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, newInputs);
    } 
    
    const equationValues = {
        requiredUnits, receivedUOM, DensityLiquid, MixDensityAt90PerSat, Kc, Patm, Pset, Pover, Psetp, criticalPressureRatio, criticalPressureRatio_Equ, omega_Equ,subcoolingRegion,
        satPressureRatio, satPressureRatio_Equ, Pst, Pst_Equ, Ps, Patm, Pset, Pover, Ploss, Pbu, Psic, Psiv, Pback,
        tranSatPressureRatio, tranSatPressureRatio_Equ, Ploss, Pbu, Psic, Psiv, Pback, A: Asel, Wreq, Wreqp,
        P1, P2, PR, PR1, Kw, KL, KLAct, W, WActual, W_eq, Wsel, Areq, N27, N29, omega, Kv, Pc, Pc_Equ, isCritical, G, G_Equ, Vl, VlAct, Vl_eq, Vl_Equ, Areq_Equ, LiquidSpecificHeatAtInlet, vls, hvls, vvls, vvs
    }
    

    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedWsel = convertUnitDiffDims(Wsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, newInputs);
    const convertedWreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, newInputs);
    inputValues = {
        ...inputValues,
        KL,
        KLAct,
        W,
        WActual,
        Vl,
        VlAct,
        Wsel: convertedWsel,
        Areq: convertedAreq,
        Asel: convertedAsel,
        A: convertedAsel,
        ValveDataSet2Phase:AsmeApiDataSet
    }

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    let flowCapacityMassUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityMassUOM).UnitName;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    let specificVolumeUOM = uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM).UnitName;
    let massfluxUOM = uoms.find(u => u.UnitKey === requiredUnits.massfluxUOM).UnitName;
    let densityUOM = uoms.find(u => u.UnitKey === requiredUnits.densityUOM).UnitName;
    let specificHeatUOM = uoms.find(u => u.UnitKey === requiredUnits.specificHeatUOM).UnitName;
    let latentHeatUOM = uoms.find(u => u.UnitKey === requiredUnits.latentHeatUOM).UnitName;
    

    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityVolumetricUOM: flowCapacityUOM, flowCapacityUOM, flowCapacityMassUOM, orificeAreaUOM, specificVolumeUOM, massfluxUOM, densityUOM, specificHeatUOM, latentHeatUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = isMassFlow ? (inputs?.prevFlowCapacityUOM?.includes('liquidvolflow')  ? uoms.find(u => u.UnitKey === inputs?.prevFlowCapacityUOM).UnitName: flowCapacityUOM ) : uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    flowCapacityMassUOM = isMassFlow ? uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName : flowCapacityMassUOM;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    specificVolumeUOM = uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM).UnitName;
    densityUOM = uoms.find(u => u.UnitKey === receivedUOM.densityUOM).UnitName;
    specificHeatUOM = uoms.find(u => u.UnitKey === receivedUOM.specificHeatUOM).UnitName;
    latentHeatUOM = uoms.find(u => u.UnitKey === receivedUOM.latentHeatUOM).UnitName;

    let inputFlowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;

    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM: inputFlowCapacityUOM, flowCapacityVolumetricUOM: flowCapacityUOM, flowCapacityMassUOM, orificeAreaUOM, specificVolumeUOM, densityUOM, specificHeatUOM, latentHeatUOM };

    const ReResponse = JSON.stringify({ equationValues, inputValues, uomRequired, uomReceived });
    
    return {
        Kc, Patm: Number(inputs?.AtmPressure), Pset: Number(inputs?.SetPressure), Pover: Number(inputs?.OverPressure),
        Psetp: convertedPsetp, Ploss: Number(inputs?.InletLoss), Pbu: Number(inputs?.BuiltUp), Psic: Number(inputs?.ConstantSuperimposed),
        Psiv: Number(inputs?.VariableSuperimposed), Pback: Number(inputs?.TotalBackPressure), A: convertedAsel, Asel: convertedAsel,
        Wreqp, Wreq: convertedWreq, P1: convertedP1, P2: convertedP2, PR, PR1, Kw, KL, KLAct, W, WActual, Vl, VlAct, Wsel: convertedWsel, 
        Areq: convertedAreq, ReResponse, N26, N27, N29, Omega:inputs?.Omega, Kv, Pc, isCritical, criticalPressureRatio, G,
        valveKmax: valve?.Kmax, valveKApi: valve?.KAPI??valve?.KApi,
        SizingBasis: inputs.SizingBasis,SystemMAWP: inputs.SystemMAWP,
        KADataSet:AsmeApiDataSet,CalculationMethod:inputs.CalculationMethod,
        IsASMESection8: inputs?.IsASMESection8,valveA:valve.A,valveAAPI: valve.AAPI,
        service: inputs?.service, ShortName: valve?.ShortName, 
        k: inputs?.KCpByCv, T: Number(inputs?.Relieving),
        m: valve?.m, b: valve?.b, E: valve?.E, Tp: valve?.Tp,Tpunits:valve?.Tpunits,
        CriticalTemperature:inputs?.CriticalTemperature,CriticalPressure:inputs?.CriticalPressure,
        IsSingleORMultiCompSys: inputs?.IsSingleORMultiCompSys, YesNoDetermine: inputs?.YesNoDetermine,
        valveKmaxL:valve?.KmaxL,valveKAPIL:valve?.KAPIL,valveAL:valve?.AL,valveAAPIL:valve?.AAPIL,
        ViscosityCorrectionFactorKv:inputs?.ViscosityCorrectionFactorKv,DensityLiquid:inputs?.DensityLiquid,
        ValveDataSetMultiPhase:inputs?.ValveDataSetMultiPhase,SaturatedVaporSpVol:inputs?.SaturatedVaporSpVol,SaturatedLiquidSpVol:inputs?.SaturatedLiquidSpVol,
        InletSpVolMixture: inputs?.InletSpVolMixture,VaporSaturationPressure:inputs?.VaporSaturationPressure,MixDensityAt90PerSat:inputs?.MixDensityAt90PerSat,
        Wreq:inputs?.VlreqMass,VlreqMass:inputs?.VlreqMass,SpecificVolume:inputs?.SpecificVolume,SpecificVolumeLiquid:inputs?.SpecificVolumeLiquid,LiquidSpecificHeatAtInlet:inputs?.LiquidSpecificHeatAtInlet,
        LatentHeat:inputs?.LatentHeat,IsDensityOrSpVolumeAt90PerSat:inputs?.IsDensityOrSpVolumeAt90PerSat,
    }
}

function FCWVTK_WF20(AsmeApiDataSet, valve, inputs, uoms) {    

    const isEnglishCalc = inputs.CalculationMethod === 'English';

    const requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
        "massfluxUOM": isEnglishCalc ? "massflux.lbsft2" : "massflux.kghrcm2",
        "densityUOM": isEnglishCalc ? "density.lbft3" : "density.kgm3",
        "specificVolumeUOM": isEnglishCalc ? "specificvolume.ft3lb" : "specificvolume.m3kg",
        "specificHeatUOM": isEnglishCalc ? "specificheat.BTUlbR" : "specificheat.KJkgK",
        "latentHeatUOM": isEnglishCalc ? "latentheat.BTUlb" : "latentheat.KJkg"
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
        "specificVolumeUOM": inputs?.SpecificVolumeUOM,
        "densityUOM": inputs?.DensityUOM,
        "specificHeatUOM": inputs?.LiquidSpecificHeatAtInletUOM,
        "latentHeatUOM": inputs?.LatentHeatUOM
    }
    
    // To calculate: Vl, W, Areq, G, Ps, PRst, PR
    const N25 = inputs.constants['N25'];
    const N26 = inputs.constants['N26'];
    const N27 = inputs.constants['N27'];
    const N28 = inputs.constants['N28'];
    const N29 = inputs.constants['N29'];
    const N33 = inputs.constants['N33'];
    const IsASMESection8 = inputs?.IsASMESection8;    
    const IsSingleORMultiCompSys = inputs?.IsSingleORMultiCompSys;
    const k = Number(inputs.KCpByCv) === 1 ? 1.00001 : Number(inputs.KCpByCv);
    const IsMixtureLTPoint1PerHydrorgen = inputs?.IsMixtureLTPoint1PerHydrorgen;
    let omega = Number(inputs?.Omega);
    let DensityLiquid = Number(inputs?.DensityLiquid);
    let vv1 = Number(inputs?.SpecificVolume);
    let vvg1 = Number(inputs?.GasVaporCombinedSpVol);
    let vl1 = Number(inputs?.SpecificVolumeLiquid);
    let Cp = Number(inputs?.LiquidSpecificHeatAtInlet);
    let T = Number(inputs?.Relieving);
    let hvl1 = Number(inputs?.LatentHeat);
    let v9 = Number(inputs?.CombinedSpVolAt90PerP1);
    let Asel = AsmeApiDataSet === "ASME" ? valve?.A : valve?.AAPI;
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const Kv = Number(inputs?.ViscosityCorrectionFactorKv);
    let Wg = Number(inputs?.Wg);
    let Wl = Number(inputs?.Wl);
    let Wv = Number(inputs?.Wv);
    let Wreqp = Number(inputs?.Wreq ? inputs?.Wreq : inputs?.Qreq ? inputs?.Qreq : inputs?.VlreqMass);
    let Pcrit = Number(inputs?.CriticalPressure);
    let Tcrit = Number(inputs?.CriticalTemperature);
    let Pv1 = Number(inputs?.VaporPressure);
    let Pg1 = Number(inputs?.GasPartialPressure);
    let Patm = Number(inputs.AtmPressure);
    let Pset = Number(inputs.SetPressure);
    let Pover = Number(inputs.OverPressure);
    let Ploss = Number(inputs.InletLoss);
    let Pbu = Number(inputs.BuiltUp);
    let Psic = Number(inputs.ConstantSuperimposed)
    let Psiv = Number(inputs.VariableSuperimposed)
    let Pback = Number(inputs.TotalBackPressure)
    const KG = AsmeApiDataSet === "ASME" ? (IsASMESection8 ? 0.9 * valve?.Kmax : valve?.Kmax) : valve?.KAPI;
    const KGAct = AsmeApiDataSet === "ASME" ? valve?.Kmax : valve?.KAPI;
    const KL = AsmeApiDataSet === "ASME" ? (IsASMESection8 ? 0.9 * valve?.KmaxL : valve?.KmaxL) : valve?.KAPIL;
    const KLAct = AsmeApiDataSet === "ASME" ? valve?.KmaxL : valve?.KAPIL;
    let inputValues = {
       k, Kc, Patm, Pset, Pover, Ploss, Pbu, Psic, Psiv, Pback, Pcrit, Tcrit, T, Wg, Wv, Wl, Wreq: Wreqp, KL, KLAct, KG, KGAct, N26, N27, N29, Kc, Kv, DensityLiquid,
       vl1, vv1, vvg1, Cp, T, hvl1, Pv1, Pg1, IsMixtureLTPoint1PerHydrorgen: (IsMixtureLTPoint1PerHydrorgen ? 'Yes' : 'No'), 
       FarFromCriticalPoint: inputs?.YesNoDetermine==='noradio' ? 'No' : 'Yes',
        IsBoilingRangeLT150F: inputs?.IsSingleORMultiCompSys=='SingleComponentSystem'?'':inputs?.YesNoDetermine=='yesradio'?'Yes':'No',
    };
    
    Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    Pcrit = convertUnit(Number(inputs.CriticalPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.CriticalPressure);
    Pset = convertUnit(Number(inputs.SetPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.SetPressure);
    Pover = isNaN(Number(inputs.OverPressure)) ? 0 : convertUnit(Number(inputs.OverPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); // Number(inputs.OverPressure);
    Ploss = isNaN(Number(inputs.InletLoss)) ? 0 : convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    Pbu = isNaN(Number(inputs.BuiltUp)) ? 0 : convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    Psic = isNaN(Number(inputs.ConstantSuperimposed)) ? 0 : convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    Psiv = isNaN(Number(inputs.VariableSuperimposed)) ? 0 : convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    Pback = isNaN(Number(inputs.TotalBackPressure)) ? 0 : convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    Pv1 = isNaN(Number(inputs?.VaporPressure)) ? 0 : convertUnit(Number(inputs.VaporPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM));
    Pg1 = isNaN(Number(inputs?.GasPartialPressure)) ? 0 : convertUnit(Number(inputs.GasPartialPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM));
    DensityLiquid = isNaN(DensityLiquid) ? 0 : convertUnit(DensityLiquid, uoms.find(u => u.UnitKey === receivedUOM.densityUOM), uoms.find(u => u.UnitKey === requiredUnits.densityUOM));
    vv1 = isNaN(vv1) ? 0 : convertUnit(vv1, uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM));
    vvg1 = isNaN(vvg1) ? 0 : convertUnit(vvg1, uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM));
    vl1 = isNaN(vl1) ? 0 : convertUnit(vl1, uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM));
    v9 = isNaN(v9) ? 0 : convertUnit(v9, uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM), uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM));
    Cp = isNaN(Cp) ? 0 : convertUnit(Cp, uoms.find(u => u.UnitKey === receivedUOM.specificHeatUOM), uoms.find(u => u.UnitKey === requiredUnits.specificHeatUOM));
    T = isNaN(T) ? 0 : convertUnit(T, uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM));
    Tcrit = isNaN(Tcrit) ? 0 : convertUnit(Tcrit, uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM));
    hvl1 = isNaN(hvl1) ? 0 : convertUnit(hvl1, uoms.find(u => u.UnitKey === receivedUOM.latentHeatUOM), uoms.find(u => u.UnitKey === requiredUnits.latentHeatUOM));

    const Wreq = isNaN(Wreqp) ? 0 : convertUnitDiffDims(Wreqp, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    Wg = isNaN(Wg) ? 0 : convertUnitDiffDims(Wg, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    Wl = isNaN(Wl) ? 0 : convertUnitDiffDims(Wl, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    Wv = isNaN(Wv) ? 0 : convertUnitDiffDims(Wv, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    let Psetp = (Pset + Pover) / 1.1;
    let P1 = Pset + Pover - Ploss + Patm;
    let P2 = Pback + Patm;
    let yv1 = Pv1 / P1;
    let yg1 = Pg1 / P1;
    // Section 1.4.3.4.1 Calculate Omega
    const vvl1 = vv1 - vl1; 
    const vvl1_Equ = `vvl1 = vv1 - vl1`;
    const x1 = (Wg + Wv) / Wreq;
    const x1_Equ = `x1 = (Wg + Wv) / Wreq`;
    const v1 = x1 * vvg1 + ((1 - x1) * vl1);
    const v1_Equ = `v1 = x1 * vvg1 + (1 - x1) * vl1`;
    const a1 = x1 * vvg1 / v1;
    const a1_Equ = `α1 = x1 * vvg1 / v1`;
    // const v1 = x1 * vv1 + ((1 - x1) * vl1);
    // const v1_Equ = `v1 = x1 * vv1 + (1 - x1) * vl1`;
    // const a1 = x1 * vv1 / v1;
    // const a1_Equ = `α1 = x1 * vv1 / v1`;
    // Calculate Omega
    let PR = P2 / P1;
    let PR_Equ = `η2 = P2 / P1`;
    let TPR = Equation_1p1(k);
    let C = Equation_1p6(N33, k);
    
    let AbsPR = ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR });
    let Equation2p5 = ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR });
    let Kb = KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    let Kw = KbKwValidateExpressions(inputs.Kw_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }
    if(isNaN(Kw) || Kw < 0) {
        Kw = 0;
    }
    Kb = Number(Kb);
    Kw = Number(Kw);
    let isSuperCritical = false;
    let farFromCriticalPoint = inputs?.YesNoDetermine === 'yesradio';
    let isBoilingRangeLT150F = true;
    if(inputs?.YesNoDetermine === 'DetermineCriticalPoint') {
        if(P1 <= 0.5 * Pcrit || T <= 0.9 * Tcrit) {
            farFromCriticalPoint = true;
        } else if (P1 >= Pcrit && T >= Tcrit) {
            isSuperCritical = true;
        } else {
            farFromCriticalPoint = false;
        }
    }
    if(IsSingleORMultiCompSys === 'MultiComponentSystem') {
        isBoilingRangeLT150F = inputs?.IsBoilingRangeLT150FYesNo === 'bryesradio';
    }
    if(isSuperCritical) {
        return {};
    }

    let omega_Equ = '';
    let criticalPressureRatio = '';
    let criticalPressureRatio_Equ = '';
    let flashingCriticalPressureRatio = '';
    let flashingCriticalPressureRatio_Equ = '';
    let nonflashingCriticalPressureRatio = '';
    let nonflashingCriticalPressureRatio_Equ = '';
    let Pc = '';
    let Pc_Equ = '';
    let isCritical = '';
    let G_Equ = ``;
    let G;
    let Gg_Equ = ``;
    let Gg;
    let Gv_Equ = ``;
    let Gv;
    let PRg = '';
    let PRg_Equ = ``;
    let PRv = '';
    let PRv_Equ = ``;

   
    if(IsMixtureLTPoint1PerHydrorgen && farFromCriticalPoint && isBoilingRangeLT150F && (yv1 < 0.9 || yg1 > 0.1)) {
        omega_Equ = '1.3.9';
        omega = a1/k + N25 * (1 - a1) * DensityLiquid * Cp * T * Pv1 * (vvl1 / hvl1) ** 2;
        flashingCriticalPressureRatio = Number((1+(1.0446 - 0.0093431 * (omega ** 0.5)) * (omega ** (-0.56261))) ** (-0.70356 + (0.014685 * Math.log(omega))).toFixed(15));
        flashingCriticalPressureRatio_Equ = `ηvc = [1 + (1.0446 - 0.0093431 * ω^0.5] * ω^(-0.56261)] ^ (-0.70356 + 0.014685 * ln(ω))`;
        let omega_g = a1/k;
        nonflashingCriticalPressureRatio = Number((1+(1.0446 - 0.0093431 * (omega_g ** 0.5)) * (omega_g ** (-0.56261))) ** (-0.70356 + (0.014685 * Math.log(omega_g))).toFixed(15));
        nonflashingCriticalPressureRatio_Equ = `ηgc = [1 + (1.0446 - 0.0093431 * (α1/k)^0.5] * (α1/k)^(-0.56261)] ^ (-0.70356 + 0.014685 * ln(α1/k))`;
        Pc = (yg1 * nonflashingCriticalPressureRatio + (1 - yg1) * flashingCriticalPressureRatio) * P1;
        Pc_Equ = `Pc = (yg1 * ηgc + (1 - yg1) * ηvc) * P1`;
        if(Pc > P2) {
            isCritical = 'Critical';
            G_Equ = `G = ${N26} * {(P1/v1) * [(ygl * ηgc ^ 2 * k/α1) + ((1-ygl) * ηvc ^ 2/ω)] } ^ 0.5`;
            G = N26 * ((P1 / v1) * ((yg1 * nonflashingCriticalPressureRatio ** 2 * k / a1) + ((1 - yg1) * flashingCriticalPressureRatio ** 2 / omega))) ** 0.5;
        } else {
            isCritical = 'Sub-Critical';
            PRg_Equ = `ηg = 1/(2*yg1) * {η2 + yg1 - [ω - ((( η2 - yg1)*(ω - α1/k) + ω) ^ 2 - 4 * ω * η2 * (1 - yg1) * (ω - α1/k)) ^ 0.5/(ω - α1/k)]}`;
            PRg = 1 / (2 * yg1) * (PR + yg1 - (omega - (((PR - yg1) * (omega - omega_g) + omega) ** 2 - 4 * omega * PR * (1 - yg1) * (omega - omega_g)) ** 0.5) / (omega - omega_g));
            PRv_Equ = `ηv = 1/[2*(1-yg1)] * {η2 - yg1 + [ω - ((( η2 - yg1)*(ω - α1/k) + ω) ^ 2 - 4 * ω * η2 * (1 - yg1) * (ω - α1/k)) ^ 0.5/(ω - α1/k)]}`;
            PRv = 1 / (2 * (1 - yg1)) * (PR - yg1 + (omega - (((PR - yg1) * (omega - omega_g) + omega) ** 2 - 4 * omega * PR * (1 - yg1) * (omega - omega_g)) ** 0.5) / (omega - omega_g));
            Gg_Equ = `${N26} * {-2 * [α1/k * ln(ηg) + (α1/k - 1) * (1 - ηg)]} ^ 0.5 / [α1/k * (1/ηg - 1) + 1] * (P1 / v1) ^ 0.5`;
            Gg = N26 * ((-2 * ((omega_g * Math.log(PRg)) + ((omega_g - 1) * (1 - PRg)))) ** 0.5) / ((omega_g * (1 / PRg - 1)) + 1) * ((P1 / v1) ** 0.5);
            Gv_Equ = `${N26} * {-2 * [ω * ln(ηv) + (ω - 1) * (1 - ηv)]} ^ 0.5 / [ω * (1/ηv - 1) + 1] * (P1 / v1) ^ 0.5`;
            Gv = N26 * ((-2 * ((omega * Math.log(PRv)) + ((omega - 1) * (1 - PRv)))) ** 0.5) / ((omega * (1 / PRv - 1)) + 1) * ((P1 / v1) ** 0.5);
            G_Equ = `G = [yg1 * Gg^2 + (1-yg1) * Gv^2] ^ 0.5`;
            G = (yg1 * Gg ** 2 + (1 - yg1) * Gv ** 2) ** 0.5;
        }
    } else {
        omega_Equ = '1.4.0';
        omega = 9 * (v9 / v1 - 1);
        criticalPressureRatio = Number((1+(1.0446 - 0.0093431 * (omega ** 0.5)) * (omega ** (-0.56261))) ** (-0.70356 + (0.014685 * Math.log(omega))).toFixed(15));
        criticalPressureRatio_Equ = `ηc = [1 + (1.0446 - 0.0093431 * ω^0.5] * ω^(-0.56261)] ^ (-0.70356 + 0.014685 * ln(ω))`;
        Pc = criticalPressureRatio * P1;
        Pc_Equ = `Pc = ηc * P1`;
        if(Pc >= P2) {
            isCritical = 'Critical';
            G_Equ = `G = ${N26} * ηc * [P1/(v1 * ω)] ^ 0.5`;
            G = N26 * criticalPressureRatio * (P1 / (v1 * omega)) ** 0.5;
        } else {
            isCritical = 'Sub-Critical';
            G_Equ = `${N26} * {-2 * [ω * ln(η2) + (ω - 1) * (1 - η2)]} ^ 0.5 * [(P1 / v1) ^ 0.5] / [ω * (1/η2 - 1) + 1]`;
            G = N26 * ((-2 * ((omega * Math.log(PR)) + ((omega -1) * (1 - PR)))) ** 0.5) / ((omega * (1/PR -1)) + 1 ) * ((P1/Number(v1)) ** 0.5);
        }
    }

    // const K2Phi = AsmeApiDataSet === "ASME" ? a1 * KG + (1-a1) * KL : 0.85;
    // const K2Phi_Equ = AsmeApiDataSet === "ASME" ? `K2φ = α1 * KG + (1 - α1) * KL`: '';
    const ValveDataSetMultiPhase=inputs?.ValveDataSetMultiPhase;
    // const K2Phi = AsmeApiDataSet === "ASME" || (AsmeApiDataSet === "API" && ValveDataSetMultiPhase==="APIWtAvg") ? a1 * KG + (1-a1) * KL : (Wg+Wv)==0?0.65:0.85;
    // const K2Phi_Equ = AsmeApiDataSet === "ASME"  || (AsmeApiDataSet === "API" && ValveDataSetMultiPhase==="APIWtAvg") ? `K2φ = α1 * KG + (1 - α1) * KL`: (Wg+Wv)==0?'0.65':'0.85';

    const K2Phi = AsmeApiDataSet === "ASME" || (AsmeApiDataSet.toUpperCase() === "APIWTAVG") ? a1 * KG + (1-a1) * KL : (Wg+Wv)==0?0.65:0.85;
    const K2PhiAct = AsmeApiDataSet === "ASME" || (AsmeApiDataSet.toUpperCase() === "APIWTAVG") ? a1 * KGAct + (1-a1) * KLAct : (Wg+Wv)==0?0.65:0.85;
    const K2Phi_Equ = AsmeApiDataSet === "ASME"  || (AsmeApiDataSet.toUpperCase() === "APIWTAVG") ? `K2φ = α1 * KG + (1 - α1) * KL`: (Wg+Wv)==0?'0.65':'0.85';

    const Kbw = a1 * Kb + (1-a1) * Kw;
    const Kbw_Equ = `Kbw = α1 * Kb + (1 - α1) * Kw`;
    
    const W_Equ =  isEnglishCalc ? `${N28} * A * K2φ * Kbw * Kc * Kv * G` : `A * K2φ * Kbw * Kc * Kv * G`;
    const W = N28 * Asel * K2Phi * Kbw * Kc * Kv * G;
    const WActual = N28 * Asel * K2PhiAct * Kbw * Kc * Kv * G;

    let Areq = Asel * Wreq / W;
    const Areq_Equ = `Areq = A * Wreq / W`;

    //  if(valve.ModelNumber=='566' && valve?.Orifice=='FB, 1.5x2' && AsmeApiDataSet === "API") {

    //     console.log({AsmeApiDataSet,ValveId:valve?.ValveId,ModelNumber:valve.ModelNumber,Orifice:valve?.Orifice,N28, N26 ,vv1,vl1,vvg1,v9,Cp,hvl1, k,Kv,Wg,Wv,Wl,Wreq,Pset,Pover,Ploss,Pback,Patm,Kc,KG,KL,Kb,Kb_Expression:inputs.Kb_Expression,Kw,A:Asel,P1,P2,'η2':PR,AbsPR,TPR,  x1,x1_Equ,vvl1,v1,v1_Equ,'α1':a1,'α1_equ':a1_Equ,'K2φ':K2Phi,'K2φ_equ':K2Phi_Equ,Kbw,Kbw_Equ,'ω':omega, omega_Equ,'ηc':criticalPressureRatio,'ηc_equ':criticalPressureRatio_Equ, Pc,  Pc_Equ, isCritical, G, G_Equ,  W, W_Equ, Areq,Areq_Equ});
    // }
    
    const equationValues = {
        requiredUnits, receivedUOM,DensityLiquid, Kc, Patm, Pset, Pover, Psetp, criticalPressureRatio, criticalPressureRatio_Equ, omega_Equ,
        Patm, Pset, Pover, Ploss, Pbu, Psic, Psiv, Pback, Ploss, Pbu, Psic, Psiv, Pback, Pcrit, Tcrit, A: Asel, Wreq, Wreqp, P1, P2, PR, PR_Equ, Kw, KL,k,KG,Kb,Kw,
        W, W_Equ, Wsel: W, WActual, Areq, N27, N29, omega,omega_Equ, Kv, Pc, Pc_Equ, isCritical, G, G_Equ, Areq_Equ, flashingCriticalPressureRatio, flashingCriticalPressureRatio_Equ,
        nonflashingCriticalPressureRatio, nonflashingCriticalPressureRatio_Equ, Pc, Pc_Equ, isCritical, Gg: Gg, Gg_Equ, Gv: Gv, Gv_Equ,
        PRg, PRg_Equ, PRv, PRv_Equ, isSuperCritical, farFromCriticalPoint, isBoilingRangeLT150F,Wl, Wv, Wg,
        v1, vvg1, vl1, vv1, v9, Cp, T, hvl1, Pv1, Pg1, yv1, yg1, vvl1, x1, a1, vvl1_Equ, x1_Equ, a1_Equ, v1_Equ, PR_Equ, K2Phi, K2Phi_Equ, Kbw, Kbw_Equ
    }
    

    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedWsel = convertUnitDiffDims(W, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedv9 = convertUnit(v9, uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM), uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM));


    inputValues = {
        ...inputValues,
        W,
        WActual,
        Wsel: convertedWsel,
        Areq: convertedAreq,
        Asel: convertedAsel,
        A: convertedAsel,
        v9: convertedv9,
        Kb,
        Kw,
        K2Phi,
        ValveDataSet2Phase:AsmeApiDataSet
    }

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    let specificVolumeUOM = uoms.find(u => u.UnitKey === requiredUnits.specificVolumeUOM).UnitName;
    let massfluxUOM = uoms.find(u => u.UnitKey === requiredUnits.massfluxUOM).UnitName;
    let densityUOM = uoms.find(u => u.UnitKey === requiredUnits.densityUOM).UnitName;
    let specificHeatUOM = uoms.find(u => u.UnitKey === requiredUnits.specificHeatUOM).UnitName;
    let latentHeatUOM = uoms.find(u => u.UnitKey === requiredUnits.latentHeatUOM).UnitName;
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, specificVolumeUOM, massfluxUOM, densityUOM, specificHeatUOM, latentHeatUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    specificVolumeUOM = uoms.find(u => u.UnitKey === receivedUOM.specificVolumeUOM).UnitName;
    densityUOM = uoms.find(u => u.UnitKey === receivedUOM.densityUOM).UnitName;
    specificHeatUOM = uoms.find(u => u.UnitKey === receivedUOM.specificHeatUOM).UnitName;
    latentHeatUOM = uoms.find(u => u.UnitKey === receivedUOM.latentHeatUOM).UnitName;

    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, specificVolumeUOM, densityUOM, specificHeatUOM, latentHeatUOM, massfluxUOM };

    const ReResponse = JSON.stringify({ equationValues, inputValues, uomRequired, uomReceived });
   
    return {
        Kc, Patm: Number(inputs?.AtmPressure), Pset: Number(inputs?.SetPressure), Pover: Number(inputs?.OverPressure),k,
        Psetp: convertedPsetp, Ploss: Number(inputs?.InletLoss), Pbu: Number(inputs?.BuiltUp), Psic: Number(inputs?.ConstantSuperimposed),
        Psiv: Number(inputs?.VariableSuperimposed), Pback: Number(inputs?.TotalBackPressure), T: Number(inputs?.Relieving), A: convertedAsel, 
        Wreqp, Wreq: convertedWreq, P1: convertedP1, P2: convertedP2, PR,  Kw, KL, W, WActual, Wsel: convertedWsel, 
        Areq: convertedAreq, ReResponse, N26, N27, N29, omega,omega_Equ, Kv, Pc, isCritical, criticalPressureRatio, G,
        valveKmax: valve?.Kmax, valveKApi: valve?.KAPI??valve?.KApi,
        SizingBasis: inputs.SizingBasis,SystemMAWP: inputs.SystemMAWP,
        KADataSet:AsmeApiDataSet,CalculationMethod:inputs.CalculationMethod,
        IsASMESection8: inputs?.IsASMESection8,valveA:valve.A,valveAAPI: valve.AAPI,
        service: inputs?.service, ShortName: valve?.ShortName, 
        m: valve?.m, b: valve?.b, E: valve?.E, Tp: valve?.Tp,Tpunits:valve?.Tpunits,
        valveKmaxL:valve?.KmaxL,valveKAPIL:valve?.KAPIL,valveAL:valve?.AL,valveAAPIL:valve?.AAPIL,
        IsASMESection8:inputs?.IsASMESection8,IsSingleORMultiCompSys:inputs?.IsSingleORMultiCompSys,KCpByCv:inputs?.KCpByCv,
        IsMixtureLTPoint1PerHydrorgen:inputs?.IsMixtureLTPoint1PerHydrorgen,Omega:inputs?.Omega,DensityLiquid:inputs?.DensityLiquid,
        SpecificVolume:inputs?.SpecificVolume,GasVaporCombinedSpVol:inputs?.GasVaporCombinedSpVol,SpecificVolumeLiquid:inputs?.SpecificVolumeLiquid,
        LiquidSpecificHeatAtInlet:inputs?.LiquidSpecificHeatAtInlet,LatentHeat:inputs?.LatentHeat,CombinedSpVolAt90PerP1:inputs?.CombinedSpVolAt90PerP1,
        Asel,RuptureDiscKcFd:inputs?.RuptureDiscKcFd,ViscosityCorrectionFactorKv:inputs?.ViscosityCorrectionFactorKv,Wg:inputs?.Wg,Wl:inputs?.Wl,Wv:inputs?.Wv,
        CriticalPressure:inputs?.CriticalPressure,CriticalTemperature:inputs?.CriticalTemperature,VaporPressure:inputs?.VaporPressure,
        GasPartialPressure:inputs?.GasPartialPressure,AbsPR_AbsPressureRatio:inputs?.AbsPR_AbsPressureRatio,Equation2p5_Expression:inputs?.Equation2p5_Expression,
        Kb_Expression:inputs?.Kb_Expression,Kw_Expression:inputs?.Kw_Expression,YesNoDetermine:inputs?.YesNoDetermine,IsBoilingRangeLT150FYesNo:inputs?.IsBoilingRangeLT150FYesNo,
        ValveDataSetMultiPhase:inputs?.ValveDataSetMultiPhase
    }
}

//Workflow: 22:: Flame Arrester
function FCWVTK_FlameArrester_P(AsmeApiDataSet, valve, inputs, uoms) {
    // console.log(inputs?.WorkflowId,inputs?.FluidType, valve?.ValveId, AsmeApiDataSet);
    const [dimension, unit] = inputs?.FlowCapacityUOM !== undefined ? inputs?.FlowCapacityUOM?.split('.') : ['', ''];
    const isVolumetric = !(dimension === 'massflow');
    const isEnglishCalc = inputs.CalculationMethod === 'English';

    let requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isVolumetric?isEnglishCalc ? "gasvolflow.SCFM" : "gasvolflow.Nm3hr":isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
    }
    const N1 = inputs.constants['N1'];
    const N3 = inputs.constants['N3'];
    const N2 = inputs.constants['N2'];
    const N4 = inputs.constants['N4'];
    const N33 = inputs.constants['N33'];
    const Code = inputs.Code;
    const k = Number(inputs.KCpByCv) == 1 ? 1.0001 : Number(inputs.KCpByCv);
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const M = Number(inputs.MolWeight);
    const Z = Number(inputs.Compressibility);
    const T = convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    const Pset = convertUnit(Number(inputs.DeltaPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.SetPressure);
    const Tp = convertUnit(Number(valve.Tp), uoms.find(u => u.UnitKey === `pressure.${valve?.Tpunits}`), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.Tp);
    const Psetp = Pset;
  
    let Wreq = Number(inputs?.Wreq);
    
    const Pover=0;
    let P1 = Pset + Patm;
    let P2 = Patm;
    let PR = P2 / P1;
   
    let C = Equation_1p6(N33, k);
    let TPR = Equation_1p1(k);

    let {Kd, Kx, K, Kmax,KApi, KxValue,X, X_Equ}=KdKxCheck(AsmeApiDataSet,valve, inputs, uoms, TPR, PR, Patm, Pset, 0,P1);
    X=Pset;
    let E=valve?.E;
    Kd=X>Tp?Kmax:Kmax* (math.sin((X/Tp)* (math.pi/2))) ** E;
    const Ploss= Pbu= Psic= Psiv= Pback=0
    

    let AbsPR = inputs?.AbsPR_AbsPressureRatio ? ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR }) : 1;
    let Equation2p5 = inputs?.Equation2p5_Expression ? ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR }) : '';
    let Kb = KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }
    Kb = Number(Kb);
   
    // if(valve.ValveId === 36){
        // console.log(`ValveId: ${valve.ValveId}, K: ${K}, Kb: ${Kb}, Kd: ${Kd}, Kx: ${Kx}, Code: ${Code}, AsmeApiDataSet: ${AsmeApiDataSet}, IsASMESection8: ${inputs?.IsASMESection8}`);
    // }
    const A = AsmeApiDataSet === "ASME" ? valve.A : valve.AAPI;
    let Asel = A;
    let Fs = Equation_1p4(PR, k);
    let IsCritical = IsCriticalFlow(uoms, inputs.CalculationMethod, Pset, PR, TPR, valve);
    requiredUnits={...requiredUnits,
        flowCapacityUOM: isVolumetric && isEnglishCalc && !IsCritical ? 'gasvolflow.SCFH' : requiredUnits.flowCapacityUOM  //isVolumetric?isEnglishCalc ? IsCritical?"gasvolflow.SCFH" :"gasvolflow.SCFM" : "gasvolflow.Nm3hr":isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
    }
    
    let W=Calculate_W(isVolumetric,IsCritical,isEnglishCalc,{inputs,A,C,Kx:Kd,P1,Kb,Kc,M,T,Z,Fs});
    
    const Wreq1 = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);

    let Wsel = W;
    let Wns = isVolumetric?6.32 * A * C * Kx * P1 * Kb * Kc / math.sqrt(M * T * Z) / 2239.54760573 * M / 22.413996 * 7936.641438656
            :A * C * Kx * P1 * Kb * Kc / 1 * math.sqrt(M / T / Z);

    let Areq = A * (Wreq1 / W);
    // let Areq1 = A * (Wreq / W1);
    let Wreqp = Wreq1;
    // if(valve.ModelNumber == '5010' && valve.InletSize == 12) {
        
    //     console.log({type:"Pressure",ValveId:valve.ValveId,ModelNumber:valve?.ModelNumber,Orifice:valve?.Orifice,isVolumetric,IsCritical,N1:Number(inputs.constants['N1']),N3:Number(inputs.constants['N3']),Kmax,E,X,Tp,N1,N2,A,C,Kd,Kb,Kc,P1,Fs,M,T,Z,Wsel,Areq,Wreq,Wreq_input:inputs?.Wreq,W,receivedUOM:receivedUOM.flowCapacityUOM,requiredUOM:requiredUnits.flowCapacityUOM});
    // }
    const equationValues = {
        requiredUnits, receivedUOM,
        k, Code, Kc, M, Z, T, Patm, Pset,  Psetp, Wreq, P1, P2, PR, TPR, C, A, Asel,E,Tp,
        Kmax, Kd, Kx, K,KApi, KxValue, AbsPR, Equation2p5, Kb, W, Wsel, Wns, Areq, Wreqp, N2, N4, N33, Fs, IsCritical,X, X_Equ
    }

    const convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedTp = convertUnit(Tp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === `pressure.${valve?.Tpunits}`));
    
    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedWreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreqp = convertUnitDiffDims(Wreqp, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedW = convertUnitDiffDims(W, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWsel = convertUnitDiffDims(Wsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWns = convertUnitDiffDims(Wns, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));

    const inputValues = {
        k, Code, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset,  Psetp: convertedPsetp,
        Wreqp: convertedWreqp, P1: convertedP1, P2: convertedP2, PR, TPR, C,E,Tp: convertedTp,
        A: convertedA, Asel: convertedAsel, Kmax, Kd, Kx, K, KApi, AbsPR, Equation2p5, Kb, W: convertedW, Wsel: convertedWsel, Wns: convertedWns, Areq: convertedAreq,
        Wreq: convertedWreq, N2, N4, N33, Fs, IsCritical
    }

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    flowCapacityUOM = isVolumetric && isEnglishCalc && !IsCritical ? 'SCFH' : flowCapacityUOM;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM };

    const ReRsponse = { equationValues, inputValues, uomRequired, uomReceived };
    IsCritical = IsCritical ? 'Critical' : 'Sub Critical';

    // if(valve.ValveId==168){
    //     console.log("ReRsponse=====================", ReRsponse);
    // }

    return {
        k, Code, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Psetp: convertedPsetp, 
         Wreqp: convertedWreqp, P1: convertedP1, P2: convertedP2, PR, TPR, C,
        A: convertedA, Asel: convertedAsel, Kmax, Kd, Kx, K, AbsPR, Equation2p5, Kb, W: convertedW, Wsel: convertedWsel, Wns: convertedWns, Areq: convertedAreq,
        Wreq: convertedWreq, N2, N4, N33, Fs, IsCritical,
        "ReResponse": JSON.stringify(ReRsponse)
    };
}

function FCWVTK_FlameArrester_V(AsmeApiDataSet, valve, inputs, uoms,PV=false) {
    const [dimension, unit] = inputs?.FlowCapacityUOM !== undefined ? inputs?.FlowCapacityUOM?.split('.') : ['', ''];
    const isVolumetric = !(dimension === 'massflow');
    const isEnglishCalc = inputs.CalculationMethod === 'English';
    let requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "vacuumUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isVolumetric?isEnglishCalc ? "gasvolflow.SCFM" : "gasvolflow.Nm3hr":isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "vacuumUOM": inputs?.PressureUOMVacuum,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
    }
    const N1 = inputs.constants['N1'];
    const N3 = inputs.constants['N3'];
    const N2 = inputs.constants['N2'];
    const N4 = inputs.constants['N4'];
    const N33 = inputs.constants['N33'];
    const Code = inputs.Code;
    const k = Number(inputs.KCpByCvVacuum) == 1 ? 1.0001 : Number(inputs.KCpByCvVacuum);
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const M = Number(inputs.MolWeightVacuum);
    const Z = Number(inputs.CompressibilityVacuum);
    const T = convertUnit(Number(inputs.RelievingforVacuum), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    const Pset = convertUnit(Number(inputs.DeltaPressureVacuum), uoms.find(u => u.UnitKey === receivedUOM.vacuumUOM), uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM)); //Number(inputs.SetPressure);
    const Tp = convertUnit(Number(valve.Tp), uoms.find(u => u.UnitKey === `pressure.${valve?.Tpunits}`), uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM)); //Number(inputs.Tp);
    const Pover = Ploss= Pbu= Psic= Psiv= Pback=0;
    
    const Psetp = Pset;
    let Wreq = Number(inputs?.WreqV);
    

    let P1 = Patm;
    let P2 = Patm - Pset ;
    let PR = P2 / P1;
    
    let C = Equation_1p6(N33, k);
    let TPR = Equation_1p1(k);

    // let Kmax = AsmeApiDataSet === "ASME" ? valve.Kmax : valve.KAPI;

    let localTpUnits=valve?.Tpunits;
    localTpUnits=localTpUnits===undefined || localTpUnits==='' || localTpUnits===null?'psig':localTpUnits;

    // if(valve.ValveId==175){
    //     console.log(`175 Calc ==== >>>>> ModelNumber: ${valve.ModelNumber}, >>>>>`,AsmeApiDataSet, TPR, PR, Patm, Pset, Pover,P1,localTpUnits,convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM), uoms.find(u => u.UnitKey === `pressure.${localTpUnits}`)));
    // }
    let {Kd, Kx, K, Kmax,KApi, KxValue,X, X_Equ}=KdKxCheck(AsmeApiDataSet,valve, inputs, uoms, TPR, PR, Patm, Pset, Pover,P1,convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM), uoms.find(u => u.UnitKey === `pressure.${localTpUnits}`)),0,PV);
    X=Pset;
    let E=valve?.E;
    Kd=X>Tp?Kmax:Kmax* (math.sin((X/Tp)* (math.pi/2))) ** E;

    let AbsPR = inputs?.AbsPR_AbsPressureRatio ? ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR }) : 1;
    let Equation2p5 = inputs?.Equation2p5_Expression ? ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR }) : '';
    let Kb = KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }
    Kb = Number(Kb);

    const A = AsmeApiDataSet === "ASME" ? valve.A : valve.AAPI;
    let Asel = A;
    let Fs = Equation_1p4(PR, k);
    let IsCritical = IsCriticalFlow(uoms, inputs.CalculationMethod, Pset, PR, TPR, valve);
    requiredUnits={...requiredUnits,
        flowCapacityUOM: isVolumetric && isEnglishCalc && !IsCritical ? 'gasvolflow.SCFH' : requiredUnits.flowCapacityUOM  //isVolumetric?isEnglishCalc ? IsCritical?"gasvolflow.SCFH" :"gasvolflow.SCFM" : "gasvolflow.Nm3hr":isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
    }
    // let W = isVolumetric? isEnglishCalc ? (Equation_1p3a(N1, Kx, A, P1, Fs, M, T, Z) / 60) : Equation_1p3a(N1, Kx, A, P1, Fs, M, T, Z)
    //         : (Equation_1p3b(N2, Kx, A, P1, Fs, M, T, Z));
    
    let W=Calculate_W(isVolumetric,IsCritical,isEnglishCalc,{inputs,A,C,Kx:Kd,P1,Kb,Kc,M,T,Z,Fs});
    const localinputs={...inputs,VacuumFlag:true};
    
    Wreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, localinputs);

    let Wsel = W;
    let Wns = isVolumetric?6.32 * A * C * Kx * P1 * Kb * Kc / math.sqrt(M * T * Z) / 2239.54760573 * M / 22.413996 * 7936.641438656
                :A * C * Kx * P1 * Kb * Kc / 1 * math.sqrt(M / T / Z);

    let Areq = A * (Wreq / W);
    let Wreqv = Wreq;

    // if(valve.ValveId==175){
    //     console.log(`175 Calc ==== >>>>> ModelNumber: ${valve.ModelNumber}, Kx: ${Kx} ValveId: ${valve.ValveId}, VPValveType: ${valve.VPValveType}, A: ${A}, W: ${W}, Areq: ${Areq}, Wreq: ${Wreq}`);
    // }

    const equationValues = {
        requiredUnits, receivedUOM,
        k, Code, Kc, M, Z, T, Patm, Pset,  Psetp,  Wreq, P1, P2, PR, TPR, C, A, Asel,E,Tp,
        Kmax, Kd, Kx, K,KApi, KxValue, AbsPR, Equation2p5, Kb, W, Wsel, Wns, Areq, Wreqv, N2, N4, N33, Fs, IsCritical,X, X_Equ
    }

    const convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM), uoms.find(u => u.UnitKey === receivedUOM.vacuumUOM));
    const convertedTp = convertUnit(Tp, uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM), uoms.find(u => u.UnitKey === `pressure.${valve?.Tpunits}`));
    // const convertedPover = convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    
    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedWreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, localinputs);
    const convertedWreqv = convertUnitDiffDims(Wreqv, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, localinputs);
    const convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedW = convertUnitDiffDims(W, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, localinputs);
    const convertedWsel = convertUnitDiffDims(Wsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, localinputs);
    const convertedWns = convertUnitDiffDims(Wns, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, localinputs);
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));

    const inputValues = {
        k, Code, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Psetp: convertedPsetp, Wreqv: convertedWreqv, P1: convertedP1, P2: convertedP2, PR, TPR, C,E,Tp: convertedTp,
        A: convertedA, Asel: convertedAsel, Kmax, Kd, Kx, K,KApi, AbsPR, Equation2p5, Kb, W: convertedW, Wsel: convertedWsel, Wns: convertedWns, Areq: convertedAreq,
        Wreq: convertedWreq, N2, N4, N33, Fs, IsCritical
    }

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    flowCapacityUOM = isVolumetric && isEnglishCalc && !IsCritical ? 'SCFH' : flowCapacityUOM;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.vacuumUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM };

    const ReRsponse = { equationValues, inputValues, uomRequired, uomReceived };
    IsCritical = IsCritical ? 'Critical' : 'Sub Critical';

    return {
        k, Code, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset,Psetp: convertedPsetp,
         Wreqv: convertedWreqv, P1: convertedP1, P2: convertedP2, PR, TPR, C,E,Tp: convertedTp,
        A: convertedA, Asel: convertedAsel, Kmax, Kd, Kx, K, AbsPR, Equation2p5, Kb, W: convertedW, Wsel: convertedWsel, Wns: convertedWns, Areq: convertedAreq,
        Wreq: convertedWreq, N2, N4, N33, Fs, IsCritical,
        "ReResponse_v": JSON.stringify(ReRsponse)
    };

    // return {
    //     k_v: k, Code_v: Code, Kc_v: Kc, M_v: M, Z_v: Z, T_v: convertedT, Patm_v: convertedPatm, Pset_v: convertedPset, Pover_v: convertedPover, Psetp_v: convertedPsetp, Ploss_v: convertedPloss,
    //     Pbu_v: convertedPbu, Psic_v: convertedPsic, Psiv_v: convertedPsiv, Pback_v: convertedPback, Wreqv_v: convertedWreqv, P1_v: convertedP1, P2_v: convertedP2, PR_v: PR, TPR_v: TPR, C_v: C,
    //     A_v: convertedA, Asel_v: convertedAsel, Kmax_v: Kmax, Kd_v: Kd, Kx_v: Kx, K_v: K, AbsPR_v: AbsPR, Equation2p5_v: Equation2p5, Kb_v: Kb, W_v: convertedW, Wsel_v: convertedWsel, Wns_v: convertedWns, Areq_v: convertedAreq,
    //     Wreq_v: convertedWreq, N2_v: N2, N4_v: N4, N33_v: N33, Fs_v: Fs, IsCritical_v: IsCritical,
    //     "ReResponse_v": JSON.stringify(ReRsponse)
    // };
}

function FCWVTK_FlameArrester_PV_V(AsmeApiDataSet, valve, inputs, uoms,PV) {
    const [dimension, unit] = inputs?.FlowCapacityUOM !== undefined ? inputs?.FlowCapacityUOM?.split('.') : ['', ''];
    const isVolumetric = !(dimension === 'massflow');
    const isEnglishCalc = inputs.CalculationMethod === 'English';
    let requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "vacuumUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isVolumetric?isEnglishCalc ? "gasvolflow.SCFM" : "gasvolflow.Nm3hr":isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "vacuumUOM": inputs?.PressureUOMVacuum,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
    }
    const N1 = inputs.constants['N1'];
    const N3 = inputs.constants['N3'];
    const N2 = inputs.constants['N2'];
    const N4 = inputs.constants['N4'];
    const N33 = inputs.constants['N33'];
    const Code = inputs.Code;
    const k = Number(inputs.KCpByCvVacuum) == 1 ? 1.0001 : Number(inputs.KCpByCvVacuum);
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const M = Number(inputs.MolWeightVacuum);
    const Z = Number(inputs.CompressibilityVacuum);
    const T = convertUnit(Number(inputs.RelievingforVacuum), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    
    const Pset = convertUnit(Number(inputs.DeltaPressureVacuum), uoms.find(u => u.UnitKey === receivedUOM.vacuumUOM), uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM)); //Number(inputs.SetPressure);
    const Tp = convertUnit(Number(valve.Tp), uoms.find(u => u.UnitKey === `pressure.${valve?.TpunitsV}`), uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM)); //Number(inputs.Tp);
    const Pover = Ploss= Pbu= Psic= Psiv= Pback=0;

     const Psetp = Pset;
    let Wreq = Number(inputs?.WreqV);
    

    let P1 = Patm;
    let P2 = Patm - Pset;
    let PR = P2 / P1;

    let DeltaP=P1-P2;
    // let P1GtP2Flag=P1>P2;

    let C = Equation_1p6(N33, k);
    let TPR = Equation_1p1(k);

    // let Kmax = AsmeApiDataSet === "ASME" ? PV?valve.KmaxV:valve.Kmax : PV?valve.KAPIV:valve.KAPI;

    let localTpUnits=PV?valve?.TpunitsV:valve?.Tpunits;
    localTpUnits=localTpUnits===undefined || localTpUnits==='' || localTpUnits===null?'psig':localTpUnits;
    

    let {Kd, Kx, K, Kmax,KApi, KxValue,X, X_Equ}=KdKxCheck(AsmeApiDataSet,valve, inputs, uoms, TPR, PR, Patm, Pset, Pover,P1,convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM), uoms.find(u => u.UnitKey === `pressure.${localTpUnits}`)),0,PV);
    X=Pset;
    let E=valve?.E;
    Kd=X>Tp?Kmax:Kmax* (math.sin((X/Tp)* (math.pi/2))) ** E;

    let AbsPR = inputs?.AbsPR_AbsPressureRatio ? ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR }) : 1;
    let Equation2p5 = inputs?.Equation2p5_Expression ? ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR }) : '';
    let Kb = KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }
    Kb = Number(Kb);

    const A = AsmeApiDataSet === "ASME" ? PV?valve.AV:valve.A : PV?valve.AAPIV:valve.AAPI;
    let Asel = A;
    let Fs = Equation_1p4(PR, k);
    let IsCritical = IsCriticalFlow(uoms, inputs.CalculationMethod, Pset, PR, TPR, valve);
    requiredUnits={...requiredUnits,
        flowCapacityUOM: isVolumetric && isEnglishCalc && !IsCritical ? 'gasvolflow.SCFH' : requiredUnits.flowCapacityUOM  //isVolumetric?isEnglishCalc ? IsCritical?"gasvolflow.SCFH" :"gasvolflow.SCFM" : "gasvolflow.Nm3hr":isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
    }
    
    
    let W=Calculate_W(isVolumetric,IsCritical,isEnglishCalc,{inputs,A,C,Kx:Kd,P1,Kb,Kc,M,T,Z,Fs});

    const localinputs={...inputs,VacuumFlag:true};
    
    Wreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, localinputs);

    let Wsel = W;
    let Wns = isVolumetric?6.32 * A * C * Kx * P1 * Kb * Kc / math.sqrt(M * T * Z) / 2239.54760573 * M / 22.413996 * 7936.641438656
                :A * C * Kx * P1 * Kb * Kc / 1 * math.sqrt(M / T / Z);
    let Areq = A * (Wreq / W);
    let Wreqv = Wreq;
    
    // if(valve.ModelNumber == '5010' && valve.InletSize == 12){
    //     console.log({type:"Vacuum",ValveId:valve.ValveId,ModelNumber:valve?.ModelNumber,Orifice:valve?.Orifice,isVolumetric,IsCritical,N1:Number(inputs.constants['N1']),N3:Number(inputs.constants['N3']),Kmax,E,X,Tp,N1,N2,A,C,Kd,Kb,Kc,P1,P2,PR,Fs,M,T,Z,Wsel,Areq,Wreq,Wreq_input:inputs?.WreqV,W,W1,receivedUOM:receivedUOM.flowCapacityUOM,requiredUOM:requiredUnits.flowCapacityUOM});
    // }


    const equationValues = {
        requiredUnits, receivedUOM,
        k, Code, Kc, M, Z, T, Patm, Pset, Psetp, Wreq, P1, P2, PR, TPR, C, A, Asel,E,Tp,
        Kmax, Kd, Kx, K,KApi, KxValue, AbsPR, Equation2p5, Kb, W, Wsel, Wns, Areq, Wreqv, N2, N4, N33, Fs, IsCritical,X, X_Equ
    }

    const convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM), uoms.find(u => u.UnitKey === receivedUOM.vacuumUOM));
    const convertedTp = convertUnit(Tp, uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM), uoms.find(u => u.UnitKey === `pressure.${valve?.TpunitsV}`));
    
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    
    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedWreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, localinputs);
    const convertedWreqv = convertUnitDiffDims(Wreqv, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, localinputs);
    const convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedW = convertUnitDiffDims(W, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, localinputs);
    const convertedWsel = convertUnitDiffDims(Wsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, localinputs);
    const convertedWns = convertUnitDiffDims(Wns, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, localinputs);
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));

    const inputValues = {
        k, Code, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset,Psetp: convertedPsetp,
         Wreqv: convertedWreqv, P1: convertedP1, P2: convertedP2, PR, TPR, C,E,Tp: convertedTp,
        A: convertedA, Asel: convertedAsel, Kmax, Kd, Kx, K,KApi, AbsPR, Equation2p5, Kb, W: convertedW, Wsel: convertedWsel, Wns: convertedWns, Areq: convertedAreq,
        Wreq: convertedWreq, N2, N4, N33, Fs, IsCritical
    }

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    flowCapacityUOM = isVolumetric && isEnglishCalc && !IsCritical ? 'SCFH' : flowCapacityUOM;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.vacuumUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM };

    const ReRsponse = { equationValues, inputValues, uomRequired, uomReceived };
    IsCritical = IsCritical ? 'Critical' : 'Sub Critical';

    return {
        k_v: k, Code_v: Code, Kc_v: Kc, M_v: M, Z_v: Z, T_v: convertedT, Patm_v: convertedPatm, Pset_v: convertedPset,  Psetp_v: convertedPsetp,
         Wreqv_v: convertedWreqv, P1_v: convertedP1, P2_v: convertedP2, PR_v: PR, TPR_v: TPR, C_v: C,E,Tp: convertedTp,
        A_v: convertedA, Asel_v: convertedAsel, Kmax_v: Kmax, Kd_v: Kd, Kx_v: Kx, K_v: K, AbsPR_v: AbsPR, Equation2p5_v: Equation2p5, Kb_v: Kb, W_v: convertedW, Wsel_v: convertedWsel, Wns_v: convertedWns, Areq_v: convertedAreq,
        Wreq_v: convertedWreq, N2_v: N2, N4_v: N4, N33_v: N33, Fs_v: Fs, IsCritical_v: IsCritical,
        "ReResponse_v": JSON.stringify(ReRsponse)
    };
}

function FCWVTK_FlameArrester_PV(AsmeApiDataSet, Valve, inputs, uoms,PV) {
    const pressureResponse=FCWVTK_FlameArrester_P(AsmeApiDataSet, Valve, inputs, uoms);
    // console.log('pressure response >>>>>> ',pressureResponse);
    let vacuumResponse=FCWVTK_FlameArrester_PV_V(AsmeApiDataSet, Valve, inputs, uoms,PV);
    vacuumResponse={...vacuumResponse}

    return {...pressureResponse,...vacuumResponse};

};

function FCWVTK_FlameArrester(AsmeApiDataSet, valve, inputs, uoms){
    if(inputs?.IsPressureOnly && inputs?.IsVacuumOnly){
        return FCWVTK_FlameArrester_PV(AsmeApiDataSet, valve, inputs, uoms,true);
      }else if(inputs?.IsVacuumOnly){
           return FCWVTK_FlameArrester_V(AsmeApiDataSet, valve, inputs, uoms,false);
      }else{
           return FCWVTK_FlameArrester_P(AsmeApiDataSet, valve, inputs, uoms);
      }
}

// CM: WorkFlowId: 1, 2, Mass Flow Rate

function FCWVTK_API2000_P(AsmeApiDataSet, valve, inputs, uoms) {
    const [dimension, unit] = inputs?.FlowCapacityUOM !== undefined ? inputs?.FlowCapacityUOM?.split('.') : ['', ''];
    const isVolumetric = !(dimension === 'massflow');
    const isEnglishCalc = inputs.CalculationMethod === 'English';

    let requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isVolumetric?isEnglishCalc ? "gasvolflow.SCFM" : "gasvolflow.Nm3hr":isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
    }
    const N1 = Number(inputs.constants['N1']);
    const N3 = Number(inputs.constants['N3']);
    const N2 = Number(inputs.constants['N2']);
    const N4 = Number(inputs.constants['N4']);
    const N33 = Number(inputs.constants['N33']);
    const Code = inputs.Code;
    const k = Number(inputs.KCpByCv) == 1 ? 1.0001 : Number(inputs.KCpByCv);
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const M = Number(inputs.MolWeight);
    const Z = Number(inputs.Compressibility);
    const T = convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    const Pset = convertUnit(Number(inputs.SetPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.SetPressure);
    const Pover = isNaN(Number(inputs.OverPressure)) ? 0 : convertUnit(Number(inputs.OverPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); // Number(inputs.OverPressure);
    const Psetp = (Pset + Pover) / 1.1;
    const Ploss = isNaN(Number(inputs.InletLoss)) ? 0 : convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    const Pbu = isNaN(Number(inputs.BuiltUp)) ? 0 : convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const Psic = isNaN(Number(inputs.ConstantSuperimposed)) ? 0 : convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    const Psiv = isNaN(Number(inputs.VariableSuperimposed)) ? 0 : convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    const Pback = isNaN(Number(inputs.TotalBackPressure)) ? 0 : convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);

    let Wreq = Number(inputs?.Wreq ? inputs?.Wreq : inputs?.Qreq ? inputs?.Qreq : inputs?.VlreqMass);
    

    let P1 = Pset + Pover - Ploss + Patm;
    let P2 = Patm + Pbu + Psic + Psiv;
    let PR = P2 / P1;
    let DeltaP=P1-P2;
    let P1GtP2Flag=P1>P2;
    let C = Equation_1p6(N33, k);
    let TPR = Equation_1p1(k);

    const {Kd, Kx, K, Kmax,KApi, KxValue,X, X_Equ}=KdKxCheck(AsmeApiDataSet,valve, inputs, uoms, TPR, PR, Patm, Pset, Pover,P1);
    
    // if(valve.ValveId === 382){
    //     console.log(`ValveId: ${valve.ValveId}, K: ${K}, KAPI: ${valve.KAPI}, Kd: ${Kd}, Kx: ${Kx}, Code: ${Code}, AsmeApiDataSet: ${AsmeApiDataSet}, IsASMESection8: ${inputs?.IsASMESection8}`);
    // }

    let AbsPR = inputs?.AbsPR_AbsPressureRatio ? ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR }) : 1;
    let Equation2p5 = inputs?.Equation2p5_Expression ? ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR }) : '';
    let Kb = KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }
    Kb = Number(Kb);

    const A = AsmeApiDataSet === "ASME" ? valve.A : valve.AAPI;
    let Asel = A;
    let Fs = Equation_1p4(PR, k);
    let IsCritical = inputs?.IsMultivalve ? false: IsCriticalFlow(uoms, inputs.CalculationMethod, Pset, PR, TPR, valve);
    requiredUnits={...requiredUnits,
        flowCapacityUOM: isVolumetric && isEnglishCalc && !IsCritical ? 'gasvolflow.SCFH' : requiredUnits.flowCapacityUOM  //isVolumetric?isEnglishCalc ? IsCritical?"gasvolflow.SCFH" :"gasvolflow.SCFM" : "gasvolflow.Nm3hr":isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
    }
    let W=Calculate_W(isVolumetric,IsCritical,isEnglishCalc,{inputs,A,C,Kx,P1,Kb,Kc,M,T,Z,Fs},false,valve);
    // const W_equ=Get_W_Equ(isVolumetric,IsCritical,inputs);
    Wreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    // let W = isVolumetric? isEnglishCalc ? (Equation_1p3a(N1, Kx, A, P1, Fs, M, T, Z) / 60) :Equation_1p3a(N1, Kx, A, P1, Fs, M, T, Z)
    //                     :Equation_1p5b(N4, A, C, Kx, P1, Kb, Kc, M, T, Z); 
    let Wsel = W;
    let Wns = isVolumetric?6.32 * A * C * Kx * P1 * Kb * Kc / math.sqrt(M * T * Z) / 2239.54760573 * M / 22.413996 * 7936.641438656
            :A * C * Kx * P1 * Kb * Kc / 1 * math.sqrt(M / T / Z);

    let Areq = A * (Wreq / W);
    let Wreqp = Wreq;

    if(AsmeApiDataSet ==='ASME' && valve.ModelNumber === '3650B'
        // &&( (valve?.ModelNumber==='4040HP' && `${valve?.InletSize}" x ${valve?.OutletSize}"`=='12" x 14"') || (valve?.ModelNumber==='4020HP' && valve?.InletSize == 12)) 
        // && `${valve?.InletSize}" x ${valve?.OutletSize}"`==='2" x 3"' 
    ){
        // console.log({ModelNumber:valve?.ModelNumber,Orifice:valve?.Orifice,Orifice2: `${valve?.InletSize}" x ${valve?.OutletSize}"`,PressureType:valve?.VPValveType,Wreq,Areq,W,A,C,N4,Kmax,Kx,Kd,m:valve?.m,b:valve?.b,Tp:valve?.Tp,P1,Kb,Kc,M,T,Z,Fs,PR,TPR,isVolumetric,IsCritical,equ})
    }

    
    const equationValues = {
        requiredUnits, receivedUOM,
        k, Code, Kc, M, Z, T, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback, Wreq, P1, P2, PR, TPR, C, A, Asel,
        Kmax, Kd, Kx, K,KApi, KxValue, AbsPR, Equation2p5, Kb, W, Wsel, Wns, Areq, Wreqp, N2, N4, N33, Fs, IsCritical,X, X_Equ,
    }
    
    // if([183,211].indexOf(valve.ValveId)!==-1){
    //     console.log('P >>>>>', equationValues)
    //     // console.log(`PV_V >>> Calc ==== >>>>> ModelNumber: ${valve.ModelNumber}, Kx: ${Kx} ValveId: ${valve.ValveId}, VPValveType: ${valve.VPValveType}, >> isVolumetric: ${isVolumetric}, IsCritical: ${IsCritical},>>>  A: ${A}, W: ${W}, Areq: ${Areq}, Wreq: ${Wreq}`);
    // }
    const convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPover = convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPloss = convertUnit(Ploss, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPbu = convertUnit(Pbu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsic = convertUnit(Psic, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsiv = convertUnit(Psiv, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPback = convertUnit(Pback, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedWreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreqp = convertUnitDiffDims(Wreqp, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedW = convertUnitDiffDims(W, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWsel = convertUnitDiffDims(Wsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWns = convertUnitDiffDims(Wns, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const inputValues = {
        k, Code, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover, Psetp: convertedPsetp, Ploss: convertedPloss,
        Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, Wreqp: convertedWreqp, P1: convertedP1, P2: convertedP2, PR, TPR, C,
        A: convertedA, Asel: convertedAsel, Kmax, Kd, Kx, K, KApi, AbsPR, Equation2p5, Kb, W: convertedW, Wsel: convertedWsel, Wns: convertedWns, Areq: convertedAreq,
        Wreq: convertedWreq, N2, N4, N33, Fs, IsCritical
    }

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    flowCapacityUOM = isVolumetric && isEnglishCalc && !IsCritical ? 'SCFH' : flowCapacityUOM;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM };

    const ReRsponse = { equationValues, inputValues, uomRequired, uomReceived };
    IsCritical = IsCritical ? 'Critical' : 'Sub Critical';

    // if(valve.ModelNumber=='4110HV'){
    //     console.log("ReRsponse=====================", ReRsponse);
    // }

    return {
        k, Code, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover, Psetp: convertedPsetp, Ploss: convertedPloss,
        Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, Wreqp: convertedWreqp, P1: convertedP1, P2: convertedP2, PR, TPR, C,
        A: convertedA, Asel: convertedAsel, Kmax, Kd, Kx, K, AbsPR, Equation2p5, Kb, W: convertedW, Wsel: convertedWsel, Wns: convertedWns, Areq: convertedAreq,
        Wreq: convertedWreq, N2, N4, N33, Fs, IsCritical,
        "ReResponse": JSON.stringify(ReRsponse)
    };
}

function FCWVTK_API2000_V(AsmeApiDataSet, valve, inputs, uoms,PV=false) {
    const [dimension, unit] = inputs?.FlowCapacityUOM !== undefined ? inputs?.FlowCapacityUOM?.split('.') : ['', ''];
    const isVolumetric = !(dimension === 'massflow');
    const isEnglishCalc = inputs.CalculationMethod === 'English';
    let requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "vacuumUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isVolumetric?isEnglishCalc ? "gasvolflow.SCFM" : "gasvolflow.Nm3hr":isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "vacuumUOM": inputs?.PressureUOMVacuum,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
    }
    const N1 = Number(inputs.constants['N1']);
    const N3 = Number(inputs.constants['N3']);
    const N2 = Number(inputs.constants['N2']);
    const N4 = Number(inputs.constants['N4']);
    const N33 = Number(inputs.constants['N33']);
    const Code = inputs.Code;
    const k = Number(inputs.KCpByCvVacuum) == 1 ? 1.0001 : Number(inputs.KCpByCvVacuum);
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const M = Number(inputs.MolWeightVacuum);
    const Z = Number(inputs.CompressibilityVacuum);
    const T = convertUnit(Number(inputs.RelievingforVacuum), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    const Pset = convertUnit(Number(inputs.SetVacuum), uoms.find(u => u.UnitKey === receivedUOM.vacuumUOM), uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM)); //Number(inputs.SetPressure);
    const Pover = isNaN(Number(inputs.UnderPressure)) ? 0 : convertUnit(Number(inputs.UnderPressure), uoms.find(u => u.UnitKey === receivedUOM.vacuumUOM), uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM)); // Number(inputs.OverPressure);
    const Psetp = (Pset + Pover) / 1.1;
    const Ploss = isNaN(Number(inputs.InletLoss)) ? 0 : convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    const Pbu = isNaN(Number(inputs.BuiltUp)) ? 0 : convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const Psic = isNaN(Number(inputs.ConstantSuperimposed)) ? 0 : convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    const Psiv = isNaN(Number(inputs.VariableSuperimposed)) ? 0 : convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    const Pback = isNaN(Number(inputs.TotalBackPressure)) ? 0 : convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);

    let Wreq = Number(inputs?.WreqV);
    

    let P1 = Patm;
    let P2 = Patm - Pset -Pover;
    let PR = P2 / P1;

    let DeltaP=P1-P2;
    // let P1GtP2Flag=P1>P2;

    let C = Equation_1p6(N33, k);
    let TPR = Equation_1p1(k);

    // let Kmax = AsmeApiDataSet === "ASME" ? valve.Kmax : valve.KAPI;

    let localTpUnits=valve?.Tpunits;
    localTpUnits=localTpUnits===undefined || localTpUnits==='' || localTpUnits===null?'psig':localTpUnits;

    const {Kd, Kx, K, Kmax,KApi, KxValue,X, X_Equ}=KdKxCheck(AsmeApiDataSet,valve, inputs, uoms, TPR, PR, Patm, Pset, Pover,P1,convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM), uoms.find(u => u.UnitKey === `pressure.${localTpUnits}`)),convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM), uoms.find(u => u.UnitKey === `pressure.${localTpUnits}`)),PV);
    

    let AbsPR = inputs?.AbsPR_AbsPressureRatio ? ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR }) : 1;
    let Equation2p5 = inputs?.Equation2p5_Expression ? ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR }) : '';
    let Kb = KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }
    Kb = Number(Kb);

    const A = AsmeApiDataSet === "ASME" ? valve.A : valve.AAPI;
    let Asel = A;
    let Fs = Equation_1p4(PR, k);
    let IsCritical = IsCriticalFlow(uoms, inputs.CalculationMethod, Pset, PR, TPR, valve);

    // let W = isVolumetric?IsCritical ? Equation_1p5a(N3, A, C, Kx, P1, Kb, Kc, M, T, Z) : isEnglishCalc ? (Equation_1p3a(N1, Kx, A, P1, Fs, M, T, Z) / 60) : Equation_1p3a(N1, Kx, A, P1, Fs, M, T, Z)
    //         :IsCritical ? Equation_1p5b(N4, A, C, Kx, P1, Kb, Kc, M, T, Z) : (Equation_1p3b(N2, Kx, A, P1, Fs, M, T, Z));

    requiredUnits={...requiredUnits,
        flowCapacityUOM: isVolumetric && isEnglishCalc && !IsCritical ? 'gasvolflow.SCFH' : requiredUnits.flowCapacityUOM  //isVolumetric?isEnglishCalc ? IsCritical?"gasvolflow.SCFH" :"gasvolflow.SCFM" : "gasvolflow.Nm3hr":isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
    }
    let W=Calculate_W(isVolumetric,IsCritical,isEnglishCalc,{inputs,A,C,Kx,P1,Kb,Kc,M,T,Z,Fs});
    
    Wreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);

    let Wsel = W;
    let Wns = isVolumetric?6.32 * A * C * Kx * P1 * Kb * Kc / math.sqrt(M * T * Z) / 2239.54760573 * M / 22.413996 * 7936.641438656
                :A * C * Kx * P1 * Kb * Kc / 1 * math.sqrt(M / T / Z);
    let Areq = A * (Wreq / W);
    let Wreqv = Wreq;
    // if(valve.ModelNumber=='4110HV'){
        // console.log(`4110HV Calc ==== >>>>> ModelNumber: ${valve.ModelNumber}, Kd: ${Kd} ValveId: ${valve.ValveId}, VPValveType: ${valve.VPValveType}, A: ${A}, W: ${W}, Areq: ${Areq}, Wreq: ${Wreq}`);
    // }

    const equationValues = {
        requiredUnits, receivedUOM,
        k, Code, Kc, M, Z, T, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback, Wreq, P1, P2, PR, TPR, C, A, Asel,
        Kmax, Kd, Kx, K,KApi, KxValue, AbsPR, Equation2p5, Kb, W, Wsel, Wns, Areq, Wreqv, N2, N4, N33, Fs, IsCritical,X, X_Equ
    }

    const convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM), uoms.find(u => u.UnitKey === receivedUOM.vacuumUOM));
    const convertedPover = convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM), uoms.find(u => u.UnitKey === receivedUOM.vacuumUOM));
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM), uoms.find(u => u.UnitKey === receivedUOM.vacuumUOM));
    const convertedPloss = convertUnit(Ploss, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPbu = convertUnit(Pbu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsic = convertUnit(Psic, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsiv = convertUnit(Psiv, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPback = convertUnit(Pback, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedWreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreqv = convertUnitDiffDims(Wreqv, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedW = convertUnitDiffDims(W, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWsel = convertUnitDiffDims(Wsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWns = convertUnitDiffDims(Wns, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));

    const inputValues = {
        k, Code, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover, Psetp: convertedPsetp, Ploss: convertedPloss,
        Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, Wreqv: convertedWreqv, P1: convertedP1, P2: convertedP2, PR, TPR, C,
        A: convertedA, Asel: convertedAsel, Kmax, Kd, Kx, K, KApi, AbsPR, Equation2p5, Kb, W: convertedW, Wsel: convertedWsel, Wns: convertedWns, Areq: convertedAreq,
        Wreq: convertedWreq, N2, N4, N33, Fs, IsCritical
    }

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let vaccumUOM = uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    flowCapacityUOM = isVolumetric && isEnglishCalc && !IsCritical ? 'SCFH' : flowCapacityUOM;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    
    const uomRequired = { temperatureUOM, absPressureUOM, vaccumUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    vaccumUOM = uoms.find(u => u.UnitKey === receivedUOM.vacuumUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    
    const uomReceived = { temperatureUOM, absPressureUOM, vaccumUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM };

    const ReRsponse = { equationValues, inputValues, uomRequired, uomReceived };
    IsCritical = IsCritical ? 'Critical' : 'Sub Critical';

    return {
        k, Code, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover, Psetp: convertedPsetp, Ploss: convertedPloss,
        Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, Wreqv: convertedWreqv, P1: convertedP1, P2: convertedP2, PR, TPR, C,
        A: convertedA, Asel: convertedAsel, Kmax, Kd, Kx, K, AbsPR, Equation2p5, Kb, W: convertedW, Wsel: convertedWsel, Wns: convertedWns, Areq: convertedAreq,
        Wreq: convertedWreq, N2, N4, N33, Fs, IsCritical,
        "ReResponse_v": JSON.stringify(ReRsponse)
    };

    // return {
    //     k_v: k, Code_v: Code, Kc_v: Kc, M_v: M, Z_v: Z, T_v: convertedT, Patm_v: convertedPatm, Pset_v: convertedPset, Pover_v: convertedPover, Psetp_v: convertedPsetp, Ploss_v: convertedPloss,
    //     Pbu_v: convertedPbu, Psic_v: convertedPsic, Psiv_v: convertedPsiv, Pback_v: convertedPback, Wreqv_v: convertedWreqv, P1_v: convertedP1, P2_v: convertedP2, PR_v: PR, TPR_v: TPR, C_v: C,
    //     A_v: convertedA, Asel_v: convertedAsel, Kmax_v: Kmax, Kd_v: Kd, Kx_v: Kx, K_v: K, AbsPR_v: AbsPR, Equation2p5_v: Equation2p5, Kb_v: Kb, W_v: convertedW, Wsel_v: convertedWsel, Wns_v: convertedWns, Areq_v: convertedAreq,
    //     Wreq_v: convertedWreq, N2_v: N2, N4_v: N4, N33_v: N33, Fs_v: Fs, IsCritical_v: IsCritical,
    //     "ReResponse_v": JSON.stringify(ReRsponse)
    // };
}

function FCWVTK_API2000_PV_V(AsmeApiDataSet, valve, inputs, uoms,PV) {
    const [dimension, unit] = inputs?.FlowCapacityUOM !== undefined ? inputs?.FlowCapacityUOM?.split('.') : ['', ''];
    const isVolumetric = !(dimension === 'massflow');
    const isEnglishCalc = inputs.CalculationMethod === 'English';
    let requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "vacuumUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isVolumetric?isEnglishCalc ? "gasvolflow.SCFM" : "gasvolflow.Nm3hr":isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "vacuumUOM": inputs?.PressureUOMVacuum,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
    }
    const N1 = Number(inputs.constants['N1']);
    const N3 = Number(inputs.constants['N3']);
    const N2 = Number(inputs.constants['N2']);
    const N4 = Number(inputs.constants['N4']);
    const N33 = Number(inputs.constants['N33']);
    const Code = inputs.Code;
    const k = Number(inputs.KCpByCvVacuum) == 1 ? 1.0001 : Number(inputs.KCpByCvVacuum);
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const M = Number(inputs.MolWeightVacuum);
    const Z = Number(inputs.CompressibilityVacuum);
    const T = convertUnit(Number(inputs.RelievingforVacuum), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    const Pset = convertUnit(Number(inputs.SetVacuum), uoms.find(u => u.UnitKey === receivedUOM.vacuumUOM), uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM)); //Number(inputs.SetPressure);
    const Pover = isNaN(Number(inputs.UnderPressure)) ? 0 : convertUnit(Number(inputs.UnderPressure), uoms.find(u => u.UnitKey === receivedUOM.vacuumUOM), uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM)); // Number(inputs.OverPressure);
    const Psetp = (Pset + Pover) / 1.1;
    const Ploss = isNaN(Number(inputs.InletLoss)) ? 0 : convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    const Pbu = isNaN(Number(inputs.BuiltUp)) ? 0 : convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const Psic = isNaN(Number(inputs.ConstantSuperimposed)) ? 0 : convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    const Psiv = isNaN(Number(inputs.VariableSuperimposed)) ? 0 : convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    const Pback = isNaN(Number(inputs.TotalBackPressure)) ? 0 : convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);

    let Wreq = Number(inputs?.WreqV);
    

    let P1 = Patm;
    let P2 = Patm - Pset -Pover;
    let PR = P2 / P1;

    let DeltaP=P1-P2;
    // let P1GtP2Flag=P1>P2;

    let C = Equation_1p6(N33, k);
    let TPR = Equation_1p1(k);

    let localTpUnits=PV?valve?.TpunitsV:valve?.Tpunits;
    localTpUnits=localTpUnits===undefined || localTpUnits==='' || localTpUnits===null?'psig':localTpUnits;
    
    const {Kd, Kx, K, Kmax,KApi, KxValue,X, X_Equ}=KdKxCheck(AsmeApiDataSet,valve, inputs, uoms, TPR, PR, Patm, Pset, Pover,P1,convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM), uoms.find(u => u.UnitKey === `pressure.${localTpUnits}`)),convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM), uoms.find(u => u.UnitKey === `pressure.${localTpUnits}`)),PV);

    let AbsPR = inputs?.AbsPR_AbsPressureRatio ? ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR }) : 1;
    let Equation2p5 = inputs?.Equation2p5_Expression ? ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR }) : '';
    let Kb = KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }
    Kb = Number(Kb);
    const A = AsmeApiDataSet === "ASME" ? PV?valve.AV:valve.A : PV?valve.AAPIV:valve.AAPI;
    let Asel = A;
    let Fs = Equation_1p4(PR, k);
    let IsCritical = IsCriticalFlow(uoms, inputs.CalculationMethod, Pset, PR, TPR, valve);

    // let W = isVolumetric?IsCritical ? Equation_1p5a(N3, A, C, Kx, P1, Kb, Kc, M, T, Z) : isEnglishCalc ? (Equation_1p3a(N1, Kx, A, P1, Fs, M, T, Z) / 60) : Equation_1p3a(N1, Kx, A, P1, Fs, M, T, Z)
    //         :IsCritical ? Equation_1p5b(N4, A, C, Kx, P1, Kb, Kc, M, T, Z) : (Equation_1p3b(N2, Kx, A, P1, Fs, M, T, Z));

    requiredUnits={...requiredUnits,
        flowCapacityUOM: isVolumetric && isEnglishCalc && !IsCritical ? 'gasvolflow.SCFH' : requiredUnits.flowCapacityUOM  //isVolumetric?isEnglishCalc ? IsCritical?"gasvolflow.SCFH" :"gasvolflow.SCFM" : "gasvolflow.Nm3hr":isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
    }
    let W=Calculate_W(isVolumetric,IsCritical,isEnglishCalc,{inputs,A,C,Kx,P1,Kb,Kc,M,T,Z,Fs});
    const localinputs={...inputs,VacuumFlag:true};
    Wreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, localinputs);

    let Wsel = W;
    let Wns = isVolumetric?6.32 * A * C * Kx * P1 * Kb * Kc / math.sqrt(M * T * Z) / 2239.54760573 * M / 22.413996 * 7936.641438656
                :A * C * Kx * P1 * Kb * Kc / 1 * math.sqrt(M / T / Z);
    let Areq = A * (Wreq / W);
    let Wreqv = Wreq;

    
    
    const equationValues = {
        requiredUnits, receivedUOM,
        k, Code, Kc, M, Z, T, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback, Wreq, P1, P2, PR, TPR, C, A, Asel,
        Kmax, Kd, Kx, K,KApi, KxValue, AbsPR, Equation2p5, Kb, W, Wsel, Wns, Areq, Wreqv, N2, N4, N33, Fs, IsCritical,X, X_Equ
    }
    // if([183,211].indexOf(valve.ValveId)!==-1){
    //     console.log(`PV >>>>>`, equationValues)
    //     // console.log(`PV_V >>> Calc ==== >>>>> ModelNumber: ${valve.ModelNumber},PV:${PV}, ValveFunction:: ${valve?.ValveFunction}, ValveFunctionV:: ${valve?.ValveFunctionV} KmaxV: ${valve.KmaxV}, K: ${K} Kx: ${Kx} ValveId: ${valve.ValveId}, VPValveType: ${valve.VPValveType}, >> isVolumetric: ${isVolumetric}, IsCritical: ${IsCritical},>>>  A: ${A}, W: ${W}, Areq: ${Areq}, Wreq: ${Wreq}`);
    // }

    const convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM), uoms.find(u => u.UnitKey === receivedUOM.vacuumUOM));
    const convertedPover = convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM), uoms.find(u => u.UnitKey === receivedUOM.vacuumUOM));
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPloss = convertUnit(Ploss, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPbu = convertUnit(Pbu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsic = convertUnit(Psic, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsiv = convertUnit(Psiv, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPback = convertUnit(Pback, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedWreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, localinputs);
    const convertedWreqv = convertUnitDiffDims(Wreqv, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, localinputs);
    const convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedW = convertUnitDiffDims(W, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, localinputs);
    const convertedWsel = convertUnitDiffDims(Wsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, localinputs);
    const convertedWns = convertUnitDiffDims(Wns, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, localinputs);
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));

    const inputValues = {
        k, Code, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover, Psetp: convertedPsetp, Ploss: convertedPloss,
        Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, Wreqv: convertedWreqv, P1: convertedP1, P2: convertedP2, PR, TPR, C,
        A: convertedA, Asel: convertedAsel, Kmax, Kd, Kx, K, KApi, AbsPR, Equation2p5, Kb, W: convertedW, Wsel: convertedWsel, Wns: convertedWns, Areq: convertedAreq,
        Wreq: convertedWreq, N2, N4, N33, Fs, IsCritical
    }

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let vaccumUOM = uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    flowCapacityUOM = isVolumetric && isEnglishCalc && !IsCritical ? 'SCFH' : flowCapacityUOM;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    
    const uomRequired = { temperatureUOM, absPressureUOM, vaccumUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    vaccumUOM = uoms.find(u => u.UnitKey === receivedUOM.vacuumUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    
    const uomReceived = { temperatureUOM, absPressureUOM, vaccumUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM };

    const ReRsponse = { equationValues, inputValues, uomRequired, uomReceived };
    IsCritical = IsCritical ? 'Critical' : 'Sub Critical';

    // return {
    //     k, Code, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover, Psetp: convertedPsetp, Ploss: convertedPloss,
    //     Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, Wreqv: convertedWreqv, P1: convertedP1, P2: convertedP2, PR, TPR, C,
    //     A: convertedA, Asel: convertedAsel, Kmax, Kd, Kx, K, AbsPR, Equation2p5, Kb, W: convertedW, Wsel: convertedWsel, Wns: convertedWns, Areq: convertedAreq,
    //     Wreq: convertedWreq, N2, N4, N33, Fs, IsCritical,
    //     "ReResponse": JSON.stringify(ReRsponse)
    // };

    return {
        k_v: k, Code_v: Code, Kc_v: Kc, M_v: M, Z_v: Z, T_v: convertedT, Patm_v: convertedPatm, Pset_v: convertedPset, Pover_v: convertedPover, Psetp_v: convertedPsetp, Ploss_v: convertedPloss,
        Pbu_v: convertedPbu, Psic_v: convertedPsic, Psiv_v: convertedPsiv, Pback_v: convertedPback, Wreqv_v: convertedWreqv, P1_v: convertedP1, P2_v: convertedP2, PR_v: PR, TPR_v: TPR, C_v: C,
        A_v: convertedA, Asel_v: convertedAsel, Kmax_v: Kmax, Kd_v: Kd, Kx_v: Kx, K_v: K, AbsPR_v: AbsPR, Equation2p5_v: Equation2p5, Kb_v: Kb, W_v: convertedW, Wsel_v: convertedWsel, Wns_v: convertedWns, Areq_v: convertedAreq,
        Wreq_v: convertedWreq, N2_v: N2, N4_v: N4, N33_v: N33, Fs_v: Fs, IsCritical_v: IsCritical,
        "ReResponse_v": JSON.stringify(ReRsponse)
    };
}

function FCWVTK_API2000_PV(AsmeApiDataSet, Valve, inputs, uoms,PV) {
    let pressureResponse=FCWVTK_API2000_P(AsmeApiDataSet, Valve, inputs, uoms);
    // console.log('pressure response >>>>>> ',pressureResponse);
    let vacuumResponse=FCWVTK_API2000_PV_V(AsmeApiDataSet, Valve, inputs, uoms,PV);
    vacuumResponse={...vacuumResponse}
    let Quantity;
    let MaxWsel;
    let MaxWselV;
    let ReResponse;
    let ReResponse_v;
    // if(AsmeApiDataSet ==='ASME' && Valve?.ModelNumber==='9399C SC'){
    //     // console.log('isMultivalve >>>>>> ',inputs?.IsMultivalve,Valve?.ModelNumber,Valve?.Orifice ?? `${Valve?.InletSize}" x ${Valve?.OutletSize}"`,pressureResponse?.A,pressureResponse?.W);
    // }    
    if(inputs?.IsMultivalve){
        Quantity= Math.ceil(Number(pressureResponse?.Wreq) / Number(pressureResponse?.W));
        const QuantityV= Math.ceil(Number(vacuumResponse?.Wreq_v) / Number(vacuumResponse?.W_v));
        Quantity= Quantity > QuantityV ? Quantity : QuantityV;
        MaxWsel=Quantity*Number(pressureResponse?.W);
        MaxWselV=Quantity*Number(vacuumResponse?.W_v);

        ReResponse=JSON.parse(pressureResponse?.ReResponse);
        let equationValues={...ReResponse?.equationValues};
        equationValues={...equationValues, MaxWsel: Number(equationValues?.W) * Quantity,Quantity};
        let inputValues={...ReResponse?.inputValues};
        inputValues={...inputValues, MaxWsel: Number(inputValues?.W) * Quantity,Quantity};
        ReResponse={...ReResponse, equationValues: equationValues, inputValues: inputValues};
        pressureResponse={...pressureResponse, Quantity,MaxWsel, ReResponse: JSON.stringify(ReResponse)};

        ReResponse_v=JSON.parse(vacuumResponse?.ReResponse_v);
        let equationValues_v={...ReResponse_v?.equationValues};
        equationValues_v={...equationValues_v, MaxWselV: Number(equationValues_v?.W) * Quantity,Quantity};
        let inputValues_v={...ReResponse_v?.inputValues};
        inputValues_v={...inputValues_v, MaxWselV: Number(inputValues_v?.W) * Quantity,Quantity};
        ReResponse_v={...ReResponse_v, equationValues: equationValues_v, inputValues: inputValues_v};
        vacuumResponse={...vacuumResponse, MaxWselV, ReResponse_v: JSON.stringify(ReResponse_v)};
        // console.log('pressure response >>>>>> ',{ vacuumResponse,pressureResponse });
    }
    return {...pressureResponse,...vacuumResponse};
};

function FCWVTK_API2000(AsmeApiDataSet, valve, inputs, uoms){
    if(inputs?.IsPressureOnly && inputs?.IsVacuumOnly){
        return FCWVTK_API2000_PV(AsmeApiDataSet, valve, inputs, uoms,true);
      }else if(inputs?.IsVacuumOnly){
           let vacuumResponse= FCWVTK_API2000_V(AsmeApiDataSet, valve, inputs, uoms,false);
            let Quantity;
            let MaxWselV;
            let ReResponse_v;
            if(inputs?.IsMultivalve){
                const QuantityV= Math.ceil(Number(vacuumResponse?.Wreq) / Number(vacuumResponse?.W));
                MaxWselV=QuantityV*Number(vacuumResponse?.W);
                // console.log('vacuum response >>>>>> ',valve?.ModelNumber,MaxWselV,QuantityV,vacuumResponse?.Wreq,vacuumResponse?.W);
                ReResponse_v=JSON.parse(vacuumResponse?.ReResponse_v);
                let equationValues_v={...ReResponse_v?.equationValues};
                equationValues_v={...equationValues_v, MaxWselV: Number(equationValues_v?.W) * QuantityV,Quantity: QuantityV};
                let inputValues_v={...ReResponse_v?.inputValues};
                inputValues_v={...inputValues_v, MaxWselV: Number(inputValues_v?.W) * QuantityV,Quantity: QuantityV};
                ReResponse_v={...ReResponse_v, equationValues: equationValues_v, inputValues: inputValues_v};
                vacuumResponse={...vacuumResponse, MaxWselV,Quantity: QuantityV, ReResponse_v: JSON.stringify(ReResponse_v)};
            }
           return {...vacuumResponse}
      }else{
            let pressureResponse= FCWVTK_API2000_P(AsmeApiDataSet, valve, inputs, uoms);
            let Quantity;
            let MaxWsel;
            let ReResponse;
            if(inputs?.IsMultivalve){
                Quantity= Math.ceil(Number(pressureResponse?.Wreq) / Number(pressureResponse?.W));
                MaxWsel=Quantity*Number(pressureResponse?.W);
                
                ReResponse=JSON.parse(pressureResponse?.ReResponse);
                let equationValues={...ReResponse?.equationValues};
                equationValues={...equationValues, MaxWsel: Number(equationValues?.W) * Quantity,Quantity};
                let inputValues={...ReResponse?.inputValues};
                inputValues={...inputValues, MaxWsel: Number(inputValues?.W) * Quantity,Quantity};
                ReResponse={...ReResponse, equationValues: equationValues, inputValues: inputValues};
                pressureResponse={...pressureResponse, Quantity,MaxWsel, ReResponse: JSON.stringify(ReResponse)};
            }
            return {...pressureResponse};
      }
}

function FCWVTK_FreeVent_P(AsmeApiDataSet, valve, inputs, uoms) {
    const [dimension, unit] = inputs?.FlowCapacityUOM !== undefined ? inputs?.FlowCapacityUOM?.split('.') : ['', ''];
    const isVolumetric = !(dimension === 'massflow');
    const isEnglishCalc = inputs.CalculationMethod === 'English';

    let requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isVolumetric?isEnglishCalc ? "gasvolflow.SCFM" : "gasvolflow.Nm3hr":isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
    }
    const N1 = inputs.constants['N1'];
    const N3 = inputs.constants['N3'];
    const N2 = inputs.constants['N2'];
    const N4 = inputs.constants['N4'];
    const N33 = inputs.constants['N33'];
    const Code = inputs.Code;
    const k = Number(inputs.KCpByCv) == 1 ? 1.0001 : Number(inputs.KCpByCv);
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const M = Number(inputs.MolWeight);
    const Z = Number(inputs.Compressibility);
    const T = convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    const Pset = convertUnit(Number(inputs.VesselPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.SetPressure);
    // const Pover = isNaN(Number(inputs.OverPressure)) ? 0 : convertUnit(Number(inputs.OverPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); // Number(inputs.OverPressure);
    const Psetp = Pset;//(Pset + Pover) / 1.1;
    // const Ploss = isNaN(Number(inputs.InletLoss)) ? 0 : convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    // const Pbu = isNaN(Number(inputs.BuiltUp)) ? 0 : convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    // const Psic = isNaN(Number(inputs.ConstantSuperimposed)) ? 0 : convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    // const Psiv = isNaN(Number(inputs.VariableSuperimposed)) ? 0 : convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    // const Pback = isNaN(Number(inputs.TotalBackPressure)) ? 0 : convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);

    let Wreq = Number(inputs?.Wreqv ? inputs?.Wreqv :inputs?.Wreq ? inputs?.Wreq : inputs?.Qreq ? inputs?.Qreq : inputs?.VlreqMass);
    
    const Pover=0;
    let P1 = Pset + Patm;
    let P2 = Patm;
    let PR = P2 / P1;
    // let X=P1-P2;
  

    let C = Equation_1p6(N33, k);
    let TPR = Equation_1p1(k);

    const {Kd, Kx, K, Kmax,KApi, KxValue,X, X_Equ}=KdKxCheck(AsmeApiDataSet,valve, inputs, uoms, TPR, PR, Patm, Pset, 0,P1);
    const Ploss= Pbu= Psic= Psiv= Pback=0
    

    let AbsPR = inputs?.AbsPR_AbsPressureRatio ? ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR }) : 1;
    let Equation2p5 = inputs?.Equation2p5_Expression ? ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR }) : '';
    let Kb = KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }
    Kb = Number(Kb);
    const A = AsmeApiDataSet === "ASME" ? valve.A : valve.AAPI;
    let Asel = A;
    let Fs = Equation_1p4(PR, k);
    let IsCritical = IsCriticalFlow(uoms, inputs.CalculationMethod, Pset, PR, TPR, valve);
    requiredUnits={...requiredUnits,
        flowCapacityUOM: isVolumetric && isEnglishCalc && !IsCritical ? 'gasvolflow.SCFH' : requiredUnits.flowCapacityUOM  //isVolumetric?isEnglishCalc ? IsCritical?"gasvolflow.SCFH" :"gasvolflow.SCFM" : "gasvolflow.Nm3hr":isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
    }
    
    // let W = isVolumetric? isEnglishCalc ? (Equation_1p3a(N1, Kx, A, P1, Fs, M, T, Z) / 60) :Equation_1p3a(N1, Kx, A, P1, Fs, M, T, Z)
    //                     :Equation_1p3b(N2, Kx, A, P1, Fs, M, T, Z); 

    let W=Calculate_W(isVolumetric,IsCritical,isEnglishCalc,{inputs,A,C,Kx,P1,Kb,Kc,M,T,Z,Fs});

    Wreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);

    let Wsel = W;
    let Wns = isVolumetric?6.32 * A * C * Kx * P1 * Kb * Kc / math.sqrt(M * T * Z) / 2239.54760573 * M / 22.413996 * 7936.641438656
            :A * C * Kx * P1 * Kb * Kc / 1 * math.sqrt(M / T / Z);

    let Areq = A * (Wreq / W);
    let Wreqp = Wreq;
    // if(valve.ValveId === 168){
    //     console.log(`ValveId: ${valve.ValveId}, Areq: ${Areq}, Wreqp: ${Wreqp}, A: ${A}, W: ${W}, isVolumetric: ${isVolumetric}, isEnglishCalc: ${isEnglishCalc}, Fs: ${Fs}, Asel: ${Asel}`);
    // }
    const equationValues = {
        requiredUnits, receivedUOM,
        k, Code, Kc, M, Z, T, Patm, Pset,  Psetp, Wreq, P1, P2, PR, TPR, C, A, Asel,
        Kmax, Kd, Kx, K,KApi, KxValue, AbsPR, Equation2p5, Kb, W, Wsel, Wns, Areq, Wreqp, N2, N4, N33, Fs, IsCritical,X, X_Equ
    }

    const convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    // const convertedPover = convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    // const convertedPloss = convertUnit(Ploss, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    // const convertedPbu = convertUnit(Pbu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    // const convertedPsic = convertUnit(Psic, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    // const convertedPsiv = convertUnit(Psiv, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    // const convertedPback = convertUnit(Pback, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedWreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreqp = convertUnitDiffDims(Wreqp, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedW = convertUnitDiffDims(W, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWsel = convertUnitDiffDims(Wsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWns = convertUnitDiffDims(Wns, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));

    const inputValues = {
        k, Code, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset,  Psetp: convertedPsetp,
        Wreqp: convertedWreqp, P1: convertedP1, P2: convertedP2, PR, TPR, C,
        A: convertedA, Asel: convertedAsel, Kmax, Kd, Kx, K, KApi, AbsPR, Equation2p5, Kb, W: convertedW, Wsel: convertedWsel, Wns: convertedWns, Areq: convertedAreq,
        Wreq: convertedWreq, N2, N4, N33, Fs, IsCritical
    }

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    flowCapacityUOM = isVolumetric && isEnglishCalc && !IsCritical ? 'SCFH' : flowCapacityUOM;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM };

    const ReRsponse = { equationValues, inputValues, uomRequired, uomReceived };
    IsCritical = IsCritical ? 'Critical' : 'Sub Critical';

    // if(valve.ValveId==168){
    //     console.log("ReRsponse=====================", ReRsponse);
    // }

    return {
        k, Code, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Psetp: convertedPsetp, 
         Wreqp: convertedWreqp, P1: convertedP1, P2: convertedP2, PR, TPR, C,
        A: convertedA, Asel: convertedAsel, Kmax, Kd, Kx, K, AbsPR, Equation2p5, Kb, W: convertedW, Wsel: convertedWsel, Wns: convertedWns, Areq: convertedAreq,
        Wreq: convertedWreq, N2, N4, N33, Fs, IsCritical,
        "ReResponse": JSON.stringify(ReRsponse)
    };
}

function FCWVTK_FreeVent_V(AsmeApiDataSet, valve, inputs, uoms,PV=false) {
    const [dimension, unit] = inputs?.FlowCapacityUOM !== undefined ? inputs?.FlowCapacityUOM?.split('.') : ['', ''];
    const isVolumetric = !(dimension === 'massflow');
    const isEnglishCalc = inputs.CalculationMethod === 'English';
    let requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "vacuumUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isVolumetric?isEnglishCalc ? "gasvolflow.SCFM" : "gasvolflow.Nm3hr":isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "vacuumUOM": inputs?.PressureUOMVacuum,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
    }
    const N1 = inputs.constants['N1'];
    const N3 = inputs.constants['N3'];
    const N2 = inputs.constants['N2'];
    const N4 = inputs.constants['N4'];
    const N33 = inputs.constants['N33'];
    const Code = inputs.Code;
    const k = Number(inputs.KCpByCvVacuum) == 1 ? 1.0001 : Number(inputs.KCpByCvVacuum);
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const M = Number(inputs.MolWeightVacuum);
    const Z = Number(inputs.CompressibilityVacuum);
    const T = convertUnit(Number(inputs.RelievingforVacuum), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    const Pset = convertUnit(Number(inputs.VesselVacuum), uoms.find(u => u.UnitKey === receivedUOM.vacuumUOM), uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM)); //Number(inputs.SetPressure);
    const Pover = Ploss= Pbu= Psic= Psiv= Pback=0;
    
    // const Pover = isNaN(Number(inputs.UnderPressure)) ? 0 : convertUnit(Number(inputs.UnderPressure), uoms.find(u => u.UnitKey === receivedUOM.vacuumUOM), uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM)); // Number(inputs.OverPressure);
    // const Psetp = (Pset + Pover) / 1.1;
    // const Ploss = isNaN(Number(inputs.InletLoss)) ? 0 : convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    // const Pbu = isNaN(Number(inputs.BuiltUp)) ? 0 : convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    // const Psic = isNaN(Number(inputs.ConstantSuperimposed)) ? 0 : convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    // const Psiv = isNaN(Number(inputs.VariableSuperimposed)) ? 0 : convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    // const Pback = isNaN(Number(inputs.TotalBackPressure)) ? 0 : convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const Psetp = Pset;
    let Wreq = Number(inputs?.WreqV ? inputs?.WreqV :inputs?.Wreq ? inputs?.Wreq : inputs?.Qreq ? inputs?.Qreq : inputs?.VlreqMass);
    

    let P1 = Patm;
    let P2 = Patm - Pset ;
    let PR = P2 / P1;
    // let X=P1-P2;
    let C = Equation_1p6(N33, k);
    let TPR = Equation_1p1(k);

    // let Kmax = AsmeApiDataSet === "ASME" ? valve.Kmax : valve.KAPI;

    let localTpUnits=valve?.Tpunits;
    localTpUnits=localTpUnits===undefined || localTpUnits==='' || localTpUnits===null?'psig':localTpUnits;

    // if(valve.ValveId==175){
    //     console.log(`175 Calc ==== >>>>> ModelNumber: ${valve.ModelNumber}, >>>>>`,AsmeApiDataSet, TPR, PR, Patm, Pset, Pover,P1,localTpUnits,convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM), uoms.find(u => u.UnitKey === `pressure.${localTpUnits}`)));
    // }
    const {Kd, Kx, K, Kmax,KApi, KxValue,X, X_Equ}=KdKxCheck(AsmeApiDataSet,valve, inputs, uoms, TPR, PR, Patm, Pset, Pover,P1,convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM), uoms.find(u => u.UnitKey === `pressure.${localTpUnits}`)),0,PV);

    let AbsPR = inputs?.AbsPR_AbsPressureRatio ? ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR }) : 1;
    let Equation2p5 = inputs?.Equation2p5_Expression ? ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR }) : '';
    let Kb = KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);

    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }
    Kb = Number(Kb);
    
    const A = AsmeApiDataSet === "ASME" ? valve.A : valve.AAPI;
    let Asel = A;
    let Fs = Equation_1p4(PR, k);
    let IsCritical = IsCriticalFlow(uoms, inputs.CalculationMethod, Pset, PR, TPR, valve);
    requiredUnits={...requiredUnits,
        flowCapacityUOM: isVolumetric && isEnglishCalc && !IsCritical ? 'gasvolflow.SCFH' : requiredUnits.flowCapacityUOM  //isVolumetric?isEnglishCalc ? IsCritical?"gasvolflow.SCFH" :"gasvolflow.SCFM" : "gasvolflow.Nm3hr":isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
    }
    // let W = isVolumetric? isEnglishCalc ? (Equation_1p3a(N1, Kx, A, P1, Fs, M, T, Z) / 60) : Equation_1p3a(N1, Kx, A, P1, Fs, M, T, Z)
    //         : (Equation_1p3b(N2, Kx, A, P1, Fs, M, T, Z));
    
    let W=Calculate_W(isVolumetric,IsCritical,isEnglishCalc,{inputs,A,C,Kx,P1,Kb,Kc,M,T,Z,Fs});

    Wreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);

    let Wsel = W;
    let Wns = isVolumetric?6.32 * A * C * Kx * P1 * Kb * Kc / math.sqrt(M * T * Z) / 2239.54760573 * M / 22.413996 * 7936.641438656
                :A * C * Kx * P1 * Kb * Kc / 1 * math.sqrt(M / T / Z);

    let Areq = A * (Wreq / W);
    let Wreqv = Wreq;

    // if(valve.ValveId==175){
    //     console.log(`175 Calc ==== >>>>> ModelNumber: ${valve.ModelNumber}, Kx: ${Kx} ValveId: ${valve.ValveId}, VPValveType: ${valve.VPValveType}, A: ${A}, W: ${W}, Areq: ${Areq}, Wreq: ${Wreq}`);
    // }

    const equationValues = {
        requiredUnits, receivedUOM,
        k, Code, Kc, M, Z, T, Patm, Pset,  Psetp,  Wreq, P1, P2, PR, TPR, C, A, Asel,
        Kmax, Kd, Kx, K,KApi, KxValue, AbsPR, Equation2p5, Kb, W, Wsel, Wns, Areq, Wreqv, N2, N4, N33, Fs, IsCritical,X, X_Equ
    }

    const convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    // const convertedPover = convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    // const convertedPloss = convertUnit(Ploss, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    // const convertedPbu = convertUnit(Pbu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    // const convertedPsic = convertUnit(Psic, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    // const convertedPsiv = convertUnit(Psiv, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    // const convertedPback = convertUnit(Pback, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedWreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreqv = convertUnitDiffDims(Wreqv, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedW = convertUnitDiffDims(W, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWsel = convertUnitDiffDims(Wsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWns = convertUnitDiffDims(Wns, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));

    const inputValues = {
        k, Code, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Psetp: convertedPsetp, Wreqv: convertedWreqv, P1: convertedP1, P2: convertedP2, PR, TPR, C,
        A: convertedA, Asel: convertedAsel, Kmax, Kd, Kx, K,KApi, AbsPR, Equation2p5, Kb, W: convertedW, Wsel: convertedWsel, Wns: convertedWns, Areq: convertedAreq,
        Wreq: convertedWreq, N2, N4, N33, Fs, IsCritical
    }

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    flowCapacityUOM = isVolumetric && isEnglishCalc && !IsCritical ? 'SCFH' : flowCapacityUOM;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM };

    const ReRsponse = { equationValues, inputValues, uomRequired, uomReceived };
    IsCritical = IsCritical ? 'Critical' : 'Sub Critical';

    return {
        k, Code, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset,Psetp: convertedPsetp,
         Wreqv: convertedWreqv, P1: convertedP1, P2: convertedP2, PR, TPR, C,
        A: convertedA, Asel: convertedAsel, Kmax, Kd, Kx, K, AbsPR, Equation2p5, Kb, W: convertedW, Wsel: convertedWsel, Wns: convertedWns, Areq: convertedAreq,
        Wreq: convertedWreq, N2, N4, N33, Fs, IsCritical,
        "ReResponse_v": JSON.stringify(ReRsponse)
    };

    // return {
    //     k_v: k, Code_v: Code, Kc_v: Kc, M_v: M, Z_v: Z, T_v: convertedT, Patm_v: convertedPatm, Pset_v: convertedPset, Pover_v: convertedPover, Psetp_v: convertedPsetp, Ploss_v: convertedPloss,
    //     Pbu_v: convertedPbu, Psic_v: convertedPsic, Psiv_v: convertedPsiv, Pback_v: convertedPback, Wreqv_v: convertedWreqv, P1_v: convertedP1, P2_v: convertedP2, PR_v: PR, TPR_v: TPR, C_v: C,
    //     A_v: convertedA, Asel_v: convertedAsel, Kmax_v: Kmax, Kd_v: Kd, Kx_v: Kx, K_v: K, AbsPR_v: AbsPR, Equation2p5_v: Equation2p5, Kb_v: Kb, W_v: convertedW, Wsel_v: convertedWsel, Wns_v: convertedWns, Areq_v: convertedAreq,
    //     Wreq_v: convertedWreq, N2_v: N2, N4_v: N4, N33_v: N33, Fs_v: Fs, IsCritical_v: IsCritical,
    //     "ReResponse_v": JSON.stringify(ReRsponse)
    // };
}

function FCWVTK_FreeVent_PV_V(AsmeApiDataSet, valve, inputs, uoms,PV) {
    const [dimension, unit] = inputs?.FlowCapacityUOM !== undefined ? inputs?.FlowCapacityUOM?.split('.') : ['', ''];
    const isVolumetric = !(dimension === 'massflow');
    const isEnglishCalc = inputs.CalculationMethod === 'English';
    let requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "vacuumUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isVolumetric?isEnglishCalc ? "gasvolflow.SCFM" : "gasvolflow.Nm3hr":isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "vacuumUOM": inputs?.PressureUOMVacuum,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
    }
    const N1 = inputs.constants['N1'];
    const N3 = inputs.constants['N3'];
    const N2 = inputs.constants['N2'];
    const N4 = inputs.constants['N4'];
    const N33 = inputs.constants['N33'];
    const Code = inputs.Code;
    const k = Number(inputs.KCpByCvVacuum) == 1 ? 1.0001 : Number(inputs.KCpByCvVacuum);
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const M = Number(inputs.MolWeightVacuum);
    const Z = Number(inputs.CompressibilityVacuum);
    const T = convertUnit(Number(inputs.RelievingforVacuum), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    
    const Pset = convertUnit(Number(inputs.VesselVacuum), uoms.find(u => u.UnitKey === receivedUOM.vacuumUOM), uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM)); //Number(inputs.SetPressure);
    const Pover = Ploss= Pbu= Psic= Psiv= Pback=0;

    // const Pover = isNaN(Number(inputs.UnderPressure)) ? 0 : convertUnit(Number(inputs.UnderPressure), uoms.find(u => u.UnitKey === receivedUOM.vacuumUOM), uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM)); // Number(inputs.OverPressure);
    // const Psetp = (Pset + Pover) / 1.1;
    // const Ploss = isNaN(Number(inputs.InletLoss)) ? 0 : convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    // const Pbu = isNaN(Number(inputs.BuiltUp)) ? 0 : convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    // const Psic = isNaN(Number(inputs.ConstantSuperimposed)) ? 0 : convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    // const Psiv = isNaN(Number(inputs.VariableSuperimposed)) ? 0 : convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    // const Pback = isNaN(Number(inputs.TotalBackPressure)) ? 0 : convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const Psetp = Pset;
    let Wreq = Number(inputs?.WreqV ? inputs?.WreqV :inputs?.Wreq ? inputs?.Wreq : inputs?.Qreq ? inputs?.Qreq : inputs?.VlreqMass);
    

    let P1 = Patm;
    let P2 = Patm - Pset;
    let PR = P2 / P1;

    let DeltaP=P1-P2;
    // let P1GtP2Flag=P1>P2;

    let C = Equation_1p6(N33, k);
    let TPR = Equation_1p1(k);

    // let Kmax = AsmeApiDataSet === "ASME" ? PV?valve.KmaxV:valve.Kmax : PV?valve.KAPIV:valve.KAPI;

    let localTpUnits=PV?valve?.TpunitsV:valve?.Tpunits;
    localTpUnits=localTpUnits===undefined || localTpUnits==='' || localTpUnits===null?'psig':localTpUnits;
    

    const {Kd, Kx, K, Kmax,KApi, KxValue,X, X_Equ}=KdKxCheck(AsmeApiDataSet,valve, inputs, uoms, TPR, PR, Patm, Pset, Pover,P1,convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.vacuumUOM), uoms.find(u => u.UnitKey === `pressure.${localTpUnits}`)),0,PV);

    let AbsPR = inputs?.AbsPR_AbsPressureRatio ? ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR }) : 1;
    let Equation2p5 = inputs?.Equation2p5_Expression ? ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR }) : '';
    let Kb = KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }
    Kb = Number(Kb);
    const A = AsmeApiDataSet === "ASME" ? PV?valve.AV:valve.A : PV?valve.AAPIV:valve.AAPI;
    let Asel = A;
    let Fs = Equation_1p4(PR, k);
    let IsCritical = IsCriticalFlow(uoms, inputs.CalculationMethod, Pset, PR, TPR, valve);
    requiredUnits={...requiredUnits,
        flowCapacityUOM: isVolumetric && isEnglishCalc && !IsCritical ? 'gasvolflow.SCFH' : requiredUnits.flowCapacityUOM  //isVolumetric?isEnglishCalc ? IsCritical?"gasvolflow.SCFH" :"gasvolflow.SCFM" : "gasvolflow.Nm3hr":isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
    }
    // let W = isVolumetric? isEnglishCalc ? (Equation_1p3a(N1, Kx, A, P1, Fs, M, T, Z) / 60) : Equation_1p3a(N1, Kx, A, P1, Fs, M, T, Z)
    //         : (Equation_1p3b(N2, Kx, A, P1, Fs, M, T, Z));
    
    let W=Calculate_W(isVolumetric,IsCritical,isEnglishCalc,{inputs,A,C,Kx,P1,Kb,Kc,M,T,Z,Fs});

    Wreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);

    let Wsel = W;
    let Wns = isVolumetric?6.32 * A * C * Kx * P1 * Kb * Kc / math.sqrt(M * T * Z) / 2239.54760573 * M / 22.413996 * 7936.641438656
                :A * C * Kx * P1 * Kb * Kc / 1 * math.sqrt(M / T / Z);
    let Areq = A * (Wreq / W);
    let Wreqv = Wreq;
    // if(valve.ModelNumber=='4110HV'){
    //     console.log(`4110HV Calc ==== >>>>> ModelNumber: ${valve.ModelNumber}, Kd: ${Kd} ValveId: ${valve.ValveId}, VPValveType: ${valve.VPValveType}, A: ${A}, W: ${W}, Areq: ${Areq}, Wreq: ${Wreq}`);
    // }


    const equationValues = {
        requiredUnits, receivedUOM,
        k, Code, Kc, M, Z, T, Patm, Pset, Psetp, Wreq, P1, P2, PR, TPR, C, A, Asel,
        Kmax, Kd, Kx, K,KApi, KxValue, AbsPR, Equation2p5, Kb, W, Wsel, Wns, Areq, Wreqv, N2, N4, N33, Fs, IsCritical,X, X_Equ
    }

    const convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    // const convertedPover = convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    // const convertedPloss = convertUnit(Ploss, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    // const convertedPbu = convertUnit(Pbu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    // const convertedPsic = convertUnit(Psic, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    // const convertedPsiv = convertUnit(Psiv, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    // const convertedPback = convertUnit(Pback, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedWreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreqv = convertUnitDiffDims(Wreqv, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedW = convertUnitDiffDims(W, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWsel = convertUnitDiffDims(Wsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWns = convertUnitDiffDims(Wns, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));

    const inputValues = {
        k, Code, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset,Psetp: convertedPsetp,
         Wreqv: convertedWreqv, P1: convertedP1, P2: convertedP2, PR, TPR, C,
        A: convertedA, Asel: convertedAsel, Kmax, Kd, Kx, K,KApi, AbsPR, Equation2p5, Kb, W: convertedW, Wsel: convertedWsel, Wns: convertedWns, Areq: convertedAreq,
        Wreq: convertedWreq, N2, N4, N33, Fs, IsCritical
    }

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    flowCapacityUOM = isVolumetric && isEnglishCalc && !IsCritical ? 'SCFH' : flowCapacityUOM;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM };

    const ReRsponse = { equationValues, inputValues, uomRequired, uomReceived };
    IsCritical = IsCritical ? 'Critical' : 'Sub Critical';

    return {
        k_v: k, Code_v: Code, Kc_v: Kc, M_v: M, Z_v: Z, T_v: convertedT, Patm_v: convertedPatm, Pset_v: convertedPset,  Psetp_v: convertedPsetp,
         Wreqv_v: convertedWreqv, P1_v: convertedP1, P2_v: convertedP2, PR_v: PR, TPR_v: TPR, C_v: C,
        A_v: convertedA, Asel_v: convertedAsel, Kmax_v: Kmax, Kd_v: Kd, Kx_v: Kx, K_v: K, AbsPR_v: AbsPR, Equation2p5_v: Equation2p5, Kb_v: Kb, W_v: convertedW, Wsel_v: convertedWsel, Wns_v: convertedWns, Areq_v: convertedAreq,
        Wreq_v: convertedWreq, N2_v: N2, N4_v: N4, N33_v: N33, Fs_v: Fs, IsCritical_v: IsCritical,
        "ReResponse_v": JSON.stringify(ReRsponse)
    };
}

function FCWVTK_FreeVent_PV(AsmeApiDataSet, Valve, inputs, uoms,PV) {
    const pressureResponse=FCWVTK_FreeVent_P(AsmeApiDataSet, Valve, inputs, uoms);
    // console.log('pressure response >>>>>> ',pressureResponse);
    let vacuumResponse=FCWVTK_FreeVent_PV_V(AsmeApiDataSet, Valve, inputs, uoms,PV);
    vacuumResponse={...vacuumResponse}

    return {...pressureResponse,...vacuumResponse};

};

function FCWVTK_FreeVent(AsmeApiDataSet, valve, inputs, uoms){
    if(inputs?.IsPressureOnly && inputs?.IsVacuumOnly){
        return FCWVTK_FreeVent_PV(AsmeApiDataSet, valve, inputs, uoms,true);
      }else if(inputs?.IsVacuumOnly){
           return FCWVTK_FreeVent_V(AsmeApiDataSet, valve, inputs, uoms,false);
      }else{
           return FCWVTK_FreeVent_P(AsmeApiDataSet, valve, inputs, uoms);
      }
}

function FCWVTK_WF26(AsmeApiDataSet, valve, inputs, uoms) {
    const [dimension, unit] = inputs?.FlowCapacityUOM !== undefined ? inputs?.FlowCapacityUOM?.split('.') : ['', ''];
    const isVolumetric = !(dimension === 'massflow');
    const isEnglishCalc = inputs.CalculationMethod === 'English';
    let requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
        "massfluxUOM": isEnglishCalc ? "massflux.lbsft2" : "massflux.kghrcm2",
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
        "massfluxUOM": inputs?.MassFluxUOM,
    }
    // console.log('FCWVTK_WF26>>>>>>>>>>>>>>>>1111111111111 >>>>>>>>>>> ')
    const N2 = inputs.constants['N2'];
    const N4 = inputs.constants['N4'];
    const N33 = inputs.constants['N33'];
    const N47 = inputs.constants['N47'];
    const Code = inputs.Code;
    const k = Number(inputs.KCpByCv) == 1 ? 1.0001 : Number(inputs.KCpByCv);
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const M = Number(inputs.MolWeight);
    const Z = Number(inputs.Compressibility);
    const T = convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    const Pset = convertUnit(Number(inputs.SetPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.SetPressure);
    const Pover = isNaN(Number(inputs.OverPressure)) ? 0 : convertUnit(Number(inputs.OverPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); // Number(inputs.OverPressure);
    const Psetp = (Pset + Pover) / 1.1;
    const Ploss = isNaN(Number(inputs.InletLoss)) ? 0 : convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    const Pbu = isNaN(Number(inputs.BuiltUp)) ? 0 : convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const Psic = isNaN(Number(inputs.ConstantSuperimposed)) ? 0 : convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    const Psiv = isNaN(Number(inputs.VariableSuperimposed)) ? 0 : convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    const Pback = isNaN(Number(inputs.TotalBackPressure)) ? 0 : convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    // console.log('FCWVTK_WF26>>>>>>>>>>>>>>>>22222222222222 >>>>>>>>>>> ')
    let Wreq = Number(inputs?.Wreq ? inputs?.Wreq : inputs?.Qreq ? inputs?.Qreq : inputs?.VlreqMass);
    let G = Number(inputs?.MassFlux)
    G= isNaN(Number(G)) ? 0 : convertUnit(Number(G), uoms.find(u => u.UnitKey === receivedUOM.massfluxUOM), uoms.find(u => u.UnitKey === requiredUnits.massfluxUOM));

    let P1 = Pset + Pover - Ploss + Patm;
    let P2 = Patm + Pbu + Psic + Psiv;
    let PR = P2 / P1;
    let C = Equation_1p6(N33, k);
    let TPR = Equation_1p1(k);
    // console.log('FCWVTK_WF26>>>>>>>>>>>>>>>>333333333333 0000000000000>>>>>>>>>>> ')
    // let Kmax = AsmeApiDataSet === "ASME" ? valve.Kmax : valve.KAPI;
    // let Kd = AsmeApiDataSet === "ASME" ? kdCalculation(AsmeApiDataSet, valve, inputs, uoms, TPR, PR, Patm, Pset, Pover, P1) : Kmax;
    // let Kx = AsmeApiDataSet === "API" ? Kd : Code === "SectionI" || Code === "SectionVIII" ? 0.9 * Kd : Kd;
    // let K = Kx;
    const isALPModel= false;//ALP_Models.includes(valve?.ModelNumber);
    // if(valve?.ValveId === 765) {
    //     console.log({AsmeApiDataSet,Orifice:valve.Orifice,SizeCodeValue:valve.SizeCode,InletSizeValue:valve.InletSize,OutletSizeValue:valve?.OutletSize,isALPModel,isVolumetric,IsCritical,N47,A,Wreq,Kx,Kb,Kc,G,W,W_equ,Areq});
    // }
    // const {Kd, Kx, K, Kmax,KApi, KxValue,X, X_Equ}=KdKxCheck(AsmeApiDataSet,valve, {...inputs,Code:isALPModel && inputs?.Code=='AnnexB'?'SectionVIII':inputs?.Code}, uoms, TPR, PR, Patm, Pset, Pover,P1);
    // console.log('FCWVTK_WF26>>>>>>>>>>>>>>>>333333333333 11111111111111111>>>>>>>>>>> ',isALPModel)
    const {Kd, Kx, K, Kmax,KApi, KxValue,X, X_Equ}=KdKxCheck(AsmeApiDataSet,valve, {...inputs,Code:inputs?.Code}, uoms, TPR, PR, Patm, Pset, Pover,P1);
    // console.log('FCWVTK_WF26>>>>>>>>>>>>>>>>333333333333 2222222222222222222222>>>>>>>>>>> ')
    let AbsPR = inputs?.AbsPR_AbsPressureRatio ? ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR }) : 1;
    // console.log('FCWVTK_WF26>>>>>>>>>>>>>>>>333333333333 33333333333333333333333>>>>>>>>>>> ')
    let Equation2p5 = inputs?.Equation2p5_Expression ? ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR }) : '';
    // console.log('FCWVTK_WF26>>>>>>>>>>>>>>>>333333333333 44444444444444>>>>>>>>>>> ')
    let Kb =KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }
    // console.log('FCWVTK_WF26>>>>>>>>>>>>>>>>4444444444444444 >>>>>>>>>>> ')
    Kb = Number(Kb);
    const A = AsmeApiDataSet === "ASME" ? valve.A : valve.AAPI;
    let Asel = A;
    let Fs = Equation_1p4(PR, k);
    let IsCritical = IsCriticalFlow(uoms, inputs.CalculationMethod, Pset, PR, TPR, valve);

    
    // let W= isALPModel ? 
    //             Calculate_W(isVolumetric,IsCritical,isEnglishCalc,{inputs,A,C,Kx,P1,Kb,Kc,M,T,Z,Fs}) 
    //             : N47 * A * Kx * Kb * Kc * G ;
    // const W_equ= isALPModel? Get_W_Equ(isVolumetric,IsCritical,inputs):isEnglishCalc? `${N47} * A * Kx * Kb * Kc * G`: `A * Kx * Kb * Kc * G`;
    
    let W=  N47 * A * Kx * Kb * Kc * G ;
    const W_equ= isEnglishCalc? `${N47} * A * Kx * Kb * Kc * G`: `A * Kx * Kb * Kc * G`;
    
    let WActual = N47 * A * Kd * Kb * Kc * G ;
    
    Wreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);

    let Wsel = W;
    let Wns = W;//A * C * Kx * P1 * Kb * Kc / 1 * math.sqrt(M / T / Z);
    let Areq = A * (Wreq / W);
    let Wreqp = Wreq;

    const Cdtp= calculateCDTP(valve, inputs, uoms);
    // if(valve?.ValveId === 765) {
        // console.log({AsmeApiDataSet,Orifice:valve.Orifice,SizeCodeValue:valve.SizeCode,InletSizeValue:valve.InletSize,OutletSizeValue:valve?.OutletSize,isALPModel,isVolumetric,IsCritical,N47,A,Wreq,Kx,Kb,Kc,G,W,W_equ,Areq,G});

    // }
    // if(Wreq < W)   {
        // console.log({AsmeApiDataSet,ModelNumber:valve?.ModelNumber,Orifice:valve?.Orifice,N47,A,Wreq,Kx,Kb,Kc,G,W,Areq});

    // }

    const equationValues = {
        requiredUnits, receivedUOM,
        k, Code, Kc, M, Z, T, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback, Wreq, P1, P2, PR, TPR, C, A, Asel,
        Kmax, Kd, Kx, K,KApi, KxValue, AbsPR, Equation2p5, Kb,CDTP:Cdtp, W,WActual, Wsel, Wns, Areq, Wreqp, N2, N4, N33, Fs, IsCritical,X, X_Equ, G, W_equ
    }
    const convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPover = convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPloss = convertUnit(Ploss, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPbu = convertUnit(Pbu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsic = convertUnit(Psic, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsiv = convertUnit(Psiv, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPback = convertUnit(Pback, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedWreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreqp = convertUnitDiffDims(Wreqp, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    // const convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM));
    const convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedW = convertUnitDiffDims(W, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWsel = convertUnitDiffDims(Wsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWActual = convertUnitDiffDims(WActual, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWns = convertUnitDiffDims(Wns, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedFlowingPressure = convertUnitDiffDims(P1, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms, inputs); 
    const convertedG = convertUnit(Number(G), uoms.find(u => u.UnitKey === requiredUnits.massfluxUOM), uoms.find(u => u.UnitKey === receivedUOM.massfluxUOM));

    const inputValues = {
        k, Code, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover, Psetp: convertedPsetp, Ploss: convertedPloss,
        Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, Wreqp: convertedWreqp, P1: convertedP1, P2: convertedP2, PR, TPR, C,
        A: convertedA, Asel: convertedAsel, Kmax, Kd, Kx, K, KApi, AbsPR, Equation2p5, Kb, W: convertedW, WActual: convertedWActual, Wsel: convertedWsel, Wns: convertedWns, Areq: convertedAreq,flowingPressure: convertedFlowingPressure,
        Wreq: convertedWreq, N2, N4, N33, Fs, IsCritical, G: convertedG,MassFlux: convertedG, W_equ
    }

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    let massfluxUOM = uoms.find(u => u.UnitKey === requiredUnits.massfluxUOM).UnitName;
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, massfluxUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    massfluxUOM = uoms.find(u => u.UnitKey === receivedUOM.massfluxUOM).UnitName;
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, massfluxUOM };

    const ReRsponse = { equationValues, inputValues, uomRequired, uomReceived };
    IsCritical = IsCritical ? 'Critical' : 'Sub Critical';

    // if (valve.ValveId === 765) {
        // console.log("ReRsponse=====================");
    // }

    // return {
    //     k, Code, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover, Psetp: convertedPsetp, Ploss: convertedPloss,
    //     Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, Wreqp: convertedWreqp, P1: convertedP1, P2: convertedP2, PR, TPR, C,
    //     A: convertedA, Asel: convertedAsel, Kmax, Kd, Kx, K, AbsPR, Equation2p5, Kb, W: convertedW, Wsel: convertedWsel, Wns: convertedWns, Areq: convertedAreq,
    //     Wreq: convertedWreq, N2, N4, N33, Fs, IsCritical, G: convertedG, W_equ,
    //     "ReResponse": JSON.stringify(ReRsponse)
    // };

      return {
        k, Code, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover,PoverP:inputs?.OverPressurePer, Psetp: convertedPsetp, Ploss: convertedPloss,
        Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, Wreqp: convertedWreqp, P1: convertedP1, P2: convertedP2, PR, TPR, C,
        A: convertedA, Asel: convertedAsel, Kmax, Kd, Kx, K, AbsPR, Equation2p5, Kb, W: convertedW, WActual: convertedWActual, Wsel: convertedWsel, Wns: convertedWns, Areq: convertedAreq,
        Wreq: convertedWreq, N2, N4, N33, Fs, IsCritical,G: convertedG,MassFlux:convertedG, W_equ,
        valveKmax: valve?.Kmax, valveKApi: valve?.KAPI??valve?.KApi,
        SizingBasis: inputs.SizingBasis,SystemMAWP: inputs.SystemMAWP,
        KADataSet:AsmeApiDataSet,CalculationMethod:inputs.CalculationMethod,
        IsASMESection8: inputs?.IsASMESection8,valveA:valve.A,valveAAPI: valve.AAPI,
        // ModelNumber: valve?.ModelNumber, VPValveType: valve?.VPValveType, 
        service: inputs?.service, ShortName: valve?.ShortName, 
        m: valve?.m, b: valve?.b, E: valve?.E, Tp: valve?.Tp,Tpunits:valve?.Tpunits,
        "ReResponse": JSON.stringify(ReRsponse)
    };
}

function FCWVTK_0105066970_0207087374(AsmeApiDataSet, valve, inputs, uoms) {
    const [dimension, unit] = inputs?.FlowCapacityUOM !== undefined ? inputs?.FlowCapacityUOM?.split('.') : ['', ''];
    const isVolumetric = !(dimension === 'massflow');
    const isEnglishCalc = inputs.CalculationMethod === 'English';
    let requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
    }
    const N2 = inputs.constants['N2'];
    const N4 = inputs.constants['N4'];
    const N33 = inputs.constants['N33'];
    const Code = inputs.Code;
    const k = Number(inputs.KCpByCv) == 1 ? 1.0001 : Number(inputs.KCpByCv);
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const M = Number(inputs.MolWeight);
    const Z = Number(inputs.Compressibility);
    const T = convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    const Pset = convertUnit(Number(inputs.SetPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.SetPressure);
    const Pover = isNaN(Number(inputs.OverPressure)) ? 0 : convertUnit(Number(inputs.OverPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); // Number(inputs.OverPressure);
    const Psetp = (Pset + Pover) / 1.1;
    const Ploss = isNaN(Number(inputs.InletLoss)) ? 0 : convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    const Pbu = isNaN(Number(inputs.BuiltUp)) ? 0 : convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const Psic = isNaN(Number(inputs.ConstantSuperimposed)) ? 0 : convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    const Psiv = isNaN(Number(inputs.VariableSuperimposed)) ? 0 : convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    const Pback = isNaN(Number(inputs.TotalBackPressure)) ? 0 : convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);

    let Wreq = Number(inputs?.Wreq ? inputs?.Wreq : inputs?.Qreq ? inputs?.Qreq : inputs?.VlreqMass);
    

    let P1 = Pset + Pover - Ploss + Patm;
    let P2 = Patm + Pbu + Psic + Psiv;
    let PR = P2 / P1;
    let C = Equation_1p6(N33, k);
    let TPR = Equation_1p1(k);

    // let Kmax = AsmeApiDataSet === "ASME" ? valve.Kmax : valve.KAPI;
    // let Kd = AsmeApiDataSet === "ASME" ? kdCalculation(AsmeApiDataSet, valve, inputs, uoms, TPR, PR, Patm, Pset, Pover, P1) : Kmax;
    // let Kx = AsmeApiDataSet === "API" ? Kd : Code === "SectionI" || Code === "SectionVIII" ? 0.9 * Kd : Kd;
    // let K = Kx;
    // if(valve?.ValveId === 418){
    //     console.log('Calculated Values before KdKx 11111111111 >>>>> ', { P1, P2, PR, C, TPR,Kmax: valve.Kmax,Code:inputs.Code });
    // }
    const {Kd, Kx, K, Kmax,KApi, KxValue,X, X_Equ}=KdKxCheck(AsmeApiDataSet,valve, inputs, uoms, TPR, PR, Patm, Pset, Pover,P1);
    // if(valve?.ValveId === 418){
    //     console.log('Calculated Kd, Kx, K, Kmax, KApi, KxValue, X, X_Equ 11111111111 >>>>> ', { Kd, Kx, K, Kmax,KApi, KxValue,X, X_Equ });
    // }
    let AbsPR = inputs?.AbsPR_AbsPressureRatio ? ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR }) : 1;
    let Equation2p5 = inputs?.Equation2p5_Expression ? ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR }) : '';
    // if(valve?.ModelNumber == 'JB' && valve?.Orifice== 'V' && AsmeApiDataSet === 'ASME') {
    //         console.log('Equation2p5Kb >>>>>>>>>>>>> ',inputs.Equation2p5_Expression, { C, k, AbsPR, Equation2p5, PR,AbsPR_AbsPressureRatio:inputs.AbsPR_AbsPressureRatio });
    //     }
    let Kb =KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
        // if(valve?.ModelNumber == 'JB' && valve?.Orifice== 'V' && AsmeApiDataSet === 'ASME') {
        //     console.log('Kb >>>>>>>>>>>>> ',inputs.Kb_Expression, { Kb, Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback });
        // }
    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }

    Kb = Number(Kb);
    const A = AsmeApiDataSet === "ASME" ? valve.A : valve.AAPI;
    let Asel = A;
    let Fs = Equation_1p4(PR, k);
    let IsCritical = IsCriticalFlow(uoms, inputs.CalculationMethod, Pset, PR, TPR, valve);

    requiredUnits={...requiredUnits,
        flowCapacityUOM: isVolumetric && isEnglishCalc && !IsCritical ? 'gasvolflow.SCFH' : requiredUnits.flowCapacityUOM  //isVolumetric?isEnglishCalc ? IsCritical?"gasvolflow.SCFH" :"gasvolflow.SCFM" : "gasvolflow.Nm3hr":isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
    }
    //let W = A * C * K * P1 * Kb * Kc / 1 * math.sqrt(M / (T + 459.67) / Z);
    // let W = IsCritical ? Equation_1p5b(N4, A, C, Kx, P1, Kb, Kc, M, T, Z) : (Equation_1p3b(N2, Kx, A, P1, Fs, M, T, Z));
    // let W = Equation_1p5b(N4, A, C, Kx, P1, Kb, Kc, M, T, Z);

    let W=Calculate_W(isVolumetric,IsCritical,isEnglishCalc,{inputs,A,C,Kx,P1,Kb,Kc,M,T,Z,Fs});
    const W__equ=Get_W_Equ(isVolumetric,IsCritical,inputs)
    // if(valve?.ModelNumber == 'JB' && valve?.Orifice== 'V' && AsmeApiDataSet === 'ASME') {
    //     console.log({ W, W__equ,isVolumetric,IsCritical,isEnglishCalc,calculationFunction:inputs.functionName,A,C,Kx,Kd,P1,Kb,Kc,M,T,Z,Fs  });
    // }
    let WActual = Calculate_W(isVolumetric,IsCritical,isEnglishCalc,{inputs,A,C,Kd,P1,Kb,Kc,M,T,Z,Fs});

    Wreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    
    let Wsel = W;
    WActual = isNaN(WActual) ? W/Kx * Kd : WActual;
    let Wns = A * C * Kx * P1 * Kb * Kc / 1 * math.sqrt(M / T / Z);
    let Areq = A * (Wreq / W);
    let Wreqp = Wreq;
    // if(valve?.ModelNumber == 'JB' && valve?.Orifice== 'V' && AsmeApiDataSet === 'ASME') {
    //     console.log('Calculated W, WActual, Wsel, Wns, Areq, Wreqp 11111111111 >>>>> ', { W, WActual, Wsel, Wns, Areq, Wreqp,calculationFunction:inputs.functionName,A,C,Kx,P1,Kb,Kc,M,T,Z,Fs });
    // }
    const Cdtp= '';//calculateCDTP(valve, inputs, uoms);
    // if(valve?.ModelNumber === '900' && AsmeApiDataSet === 'ASME') {
    //     console.log({Areq,A,Wreq,W,WActual,C,Kx,P1,Kb,Kc,M,T,Z,Fs,Wreqp,Cdtp});

    // }

    const equationValues = {
        requiredUnits, receivedUOM,
        k, Code, Kc, M, Z, T, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback, Wreq, P1, P2, PR, TPR, C, A, Asel,
        Kmax, Kd, Kx, K,KApi, KxValue, AbsPR, Equation2p5, Kb,CDTP:Cdtp, W, WActual, Wsel, Wns, Areq, Wreqp, N2, N4, N33, Fs, IsCritical,X, X_Equ
    }
    const convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPover = convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPloss = convertUnit(Ploss, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPbu = convertUnit(Pbu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsic = convertUnit(Psic, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsiv = convertUnit(Psiv, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPback = convertUnit(Pback, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedWreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreqp = convertUnitDiffDims(Wreqp, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    // const convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM));
    const convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedW = convertUnitDiffDims(W, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWActual = convertUnitDiffDims(WActual, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWsel = convertUnitDiffDims(Wsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWns = convertUnitDiffDims(Wns, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedFlowingPressure = convertUnitDiffDims(P1, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms, inputs); 


    const inputValues = {
        k, Code, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover, Psetp: convertedPsetp, Ploss: convertedPloss,
        Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, Wreqp: convertedWreqp, P1: convertedP1, P2: convertedP2, PR, TPR, C,
        A: convertedA, Asel: convertedAsel, Kmax, Kd, Kx, K, KApi, AbsPR, Equation2p5, Kb, W: convertedW, WActual: convertedWActual, Wsel: convertedWsel, Wns: convertedWns, Areq: convertedAreq,flowingPressure: convertedFlowingPressure,
        Wreq: convertedWreq, N2, N4, N33, Fs, IsCritical
    }

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM };

    const ReRsponse = { equationValues, inputValues, uomRequired, uomReceived };
    IsCritical = IsCritical ? 'Critical' : 'Sub Critical';

    // if (valve.ValveId === 328) {
    //     console.log("ReRsponse=====================", ReRsponse);
    // }
    // if (valve.ValveId === 418) {
    //     console.log("inputs?.OverPressurePer=====================", inputs?.OverPressurePer);
    // }
    return {
        k, Code, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover,PoverP:inputs?.OverPressurePer, Psetp: convertedPsetp, Ploss: convertedPloss,
        Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, Wreqp: convertedWreqp, P1: convertedP1, P2: convertedP2, PR, TPR, C,
        A: convertedA, Asel: convertedAsel, Kmax, Kd, Kx, K, AbsPR, Equation2p5, Kb, W: convertedW, WActual: convertedWActual, Wsel: convertedWsel, Wns: convertedWns, Areq: convertedAreq,
        Wreq: convertedWreq, N2, N4, N33, Fs, IsCritical,valveKmax: valve?.Kmax, valveKApi: valve?.KAPI??valve?.KApi,
        SizingBasis: inputs.SizingBasis,SystemMAWP: inputs.SystemMAWP,
        KADataSet:AsmeApiDataSet,CalculationMethod:inputs.CalculationMethod,
        IsASMESection8: inputs?.IsASMESection8,valveA:valve.A,valveAAPI: valve.AAPI,
        // ModelNumber: valve?.ModelNumber, VPValveType: valve?.VPValveType, 
        service: inputs?.service, ShortName: valve?.ShortName, 
        m: valve?.m, b: valve?.b, E: valve?.E, Tp: valve?.Tp,Tpunits:valve?.Tpunits,
        "ReResponse": JSON.stringify(ReRsponse)
    };
}

// CM:  WorkFlowId: 1, 2, Volumetric Flow Rate
function FCWVTK_0309107172_0411127576(AsmeApiDataSet, valve, inputs, uoms) {
    const [dimension, unit] = inputs?.FlowCapacityUOM !== undefined ? inputs?.FlowCapacityUOM?.split('.') : ['', ''];
    const isVolumetric = !(dimension === 'massflow');
    const isEnglishCalc = inputs.CalculationMethod === 'English';
    let requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isEnglishCalc ? "gasvolflow.SCFM" : "gasvolflow.Nm3hr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
    }
    // if(valve?.ValveId === 418){
    //     console.log('Received Units and Required Units 11111111111 >>>>> ', { receivedUOM });    
    // }
    const N1 = inputs.constants['N1'];
    const N3 = inputs.constants['N3'];
    const N33 = inputs.constants['N33'];
    const Code = inputs.Code;
    const k = Number(inputs.KCpByCv) == 1 ? 1.00001 : Number(inputs.KCpByCv);
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const M = Number(inputs.MolWeight);
    const Z = Number(inputs.Compressibility);
    const T = convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    const Pset = convertUnit(Number(inputs.SetPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.SetPressure);
    const Pover = convertUnit(Number(inputs.OverPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); // Number(inputs.OverPressure);
    const Psetp = (Pset + Pover) / 1.1;
    const Ploss = convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    const Pbu = isNaN(Number(inputs.BuiltUp)) ? 0 : convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const Psic = convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    const Psiv = convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    const Pback = isNaN(Number(inputs.TotalBackPressure)) ? 0 : convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);

    let Vreq = Number(inputs?.Wreq ? inputs?.Wreq : inputs?.Qreq ? inputs?.Qreq : inputs?.VlreqMass);
    

    let P1 = Pset + Pover - Ploss + Patm;
    let P2 = Patm + Pbu + Psic + Psiv;
    let PR = P2 / P1;
    let C = Equation_1p6(N33, k);
    let TPR = Equation_1p1(k);

    // let Kmax = (AsmeApiDataSet === 'ASME') ? valve.Kmax : valve.KAPI;
    // let Kd = AsmeApiDataSet === "ASME" ? kdCalculation(AsmeApiDataSet, valve, inputs, uoms, TPR, PR, Patm, Pset, Pover, P1) : Kmax;
    // let Kx = AsmeApiDataSet === "API" ? Kd : Code === "SectionI" || Code === "SectionVIII" ? 0.9 * Kd : Kd;
    // let K = Kx;

    const {Kd, Kx, K, Kmax,KApi, KxValue,X, X_Equ}=KdKxCheck(AsmeApiDataSet,valve, inputs, uoms, TPR, PR, Patm, Pset, Pover,P1);
    // if(valve?.ModelNumber ==='81P' && valve?.Orifice=='4'){
    //     console.log('81P >>>>>>>>>>>>>> ', { AsmeApiDataSet,Kd, Kx, K, Kmax,KApi, KxValue,X, X_Equ });
    // }
    let AbsPR = ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR });
    let Equation2p5 = ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR });
    let Kb = KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }
    Kb = Number(Kb);
    // if (valve.ValveId === 423) {
    //     console.log('KbKwValidateExpressions===================', inputs.Kb_Expression, inputs.KbId, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback });
    // }

    const A = (AsmeApiDataSet === 'ASME') ? valve.A : valve.AAPI;
    // if(valve?.ValveId === 631 && AsmeApiDataSet === 'API') {
    //     console.log({A,valveA:valve.A,valveAAPI:valve.AAPI})
    // }
    let Asel = A;
    let Fs = Equation_1p4(PR, k);
    let IsCritical = IsCriticalFlow(uoms, inputs.CalculationMethod, Pset, PR, TPR, valve);
    requiredUnits={...requiredUnits,
        flowCapacityUOM: isVolumetric && isEnglishCalc && !IsCritical ? 'gasvolflow.SCFH' : requiredUnits.flowCapacityUOM  //isVolumetric?isEnglishCalc ? IsCritical?"gasvolflow.SCFH" :"gasvolflow.SCFM" : "gasvolflow.Nm3hr":isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
    }
    // let V = IsCritical ? Equation_1p5a(N3, A, C, Kx, P1, Kb, Kc, M, T, Z) : isEnglishCalc ? (Equation_1p3a(N1, Kx, A, P1, Fs, M, T, Z) / 60) : Equation_1p3a(N1, Kx, A, P1, Fs, M, T, Z);
    // console.log(Number(inputs.Relieving),T,uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM),uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM))
    let V=Calculate_W(isVolumetric,IsCritical,isEnglishCalc,{inputs,A,C,Kx,P1,Kb,Kc,M,T,Z,Fs});
    let VActual=Calculate_W(isVolumetric,IsCritical,isEnglishCalc,{inputs,A,C,Kd,P1,Kb,Kc,M,T,Z,Fs});
    let Vsel = V;
    VActual = isNaN(VActual) ? V/Kx * Kd : VActual;
    Vreq = convertUnitDiffDims(Vreq, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    
    let Wns = 6.32 * A * C * Kx * P1 * Kb * Kc / math.sqrt(M * T * Z) / 2239.54760573 * M / 22.413996 * 7936.641438656;
    let Areq = A * (Vreq / V);
    let Vreqp = Vreq;
    const Cdtp= calculateCDTP(valve, inputs, uoms);
// if(valve?.ValveId === 631 && AsmeApiDataSet === 'API') {
//         console.log('Vreq', {
//             Code, k, Kc, M, Z, T, Patm, Pset, Pover, Ploss, Pbu, Psic, Psiv, Pback, P1, P2, PR, C, TPR, Kmax, Kd, Kx, K, AbsPR, Equation2p5, Kb,
//             Areq, A, Asel, Vreq, V, VActual, Vsel, Wns, Vreqp
//         });
//     }

    const equationValues = {
        requiredUnits, receivedUOM,
        Code, k, Kc, M, Z, T, Patm, Pset, Pover, Ploss, Pbu, Psic, Psiv,CDTP:Cdtp,
        Pback, P1, P2, PR, C, TPR, Kmax, Kd, Kx, K,KApi, KxValue, AbsPR, Equation2p5, Kb,
        Areq, A, Asel, Vreq, V,VActual, Vsel, Wns, Vreqp, Fs, IsCritical, N1, N3,X, X_Equ
    }

    const convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPover = convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPloss = convertUnit(Ploss, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPbu = convertUnit(Pbu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsic = convertUnit(Psic, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsiv = convertUnit(Psiv, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPback = convertUnit(Pback, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedA = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedVreq = convertUnitDiffDims(Vreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedVreqp = convertUnitDiffDims(Vreqp, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedV = convertUnitDiffDims(V, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedVActual = convertUnitDiffDims(VActual, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedVsel = convertUnitDiffDims(Vsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWns = convertUnitDiffDims(Wns, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedFlowingPressure = convertUnitDiffDims(P1, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms, inputs); 
    // if(valve?.ModelNumber=='93'){
    //     console.log('in calculations >>>>>>>>. ',Vsel,convertedVsel,uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM)?.UnitKey,uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM)?.UnitKey)
    // }
    const inputValues = {
        Code, k, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover, Ploss: convertedPloss,
        Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, P1: convertedP1, P2: convertedP2,
        PR, C, TPR, Kmax, Kd, Kx, K, KApi, AbsPR, Equation2p5, Kb, Areq: convertedAreq, A: convertedA, Asel: convertedAsel,
        Vreq: convertedVreq, V: convertedV, VActual: convertedVActual, Vsel: convertedVsel, Wns: convertedWns, Vreqp: convertedVreqp, Fs, IsCritical, N1, N3, flowingPressure: convertedFlowingPressure
    }

    // if(valve?.ValveId === 631 && AsmeApiDataSet === 'API') {
    //     console.log('Vreq', {
    //         AsmeApiDataSet,
    //         inputValues,
    //         valve
    //     })
    // }

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    //flowCapacityUOM = isVolumetric && isEnglishCalc && !IsCritical ? 'SCFH' : flowCapacityUOM;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM };

    const ReResponse = JSON.stringify({ equationValues, inputValues, uomRequired, uomReceived });
    IsCritical = IsCritical ? 'Critical' : 'Sub Critical';

    // console.log("inputs?.OverPressurePer=====================", inputs?.OverPressurePer);
    return {
        Code, k, Kc, M, Z, T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover,PoverP:inputs?.OverPressurePer, Ploss: convertedPloss,
        Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, P1: convertedP1, P2: convertedP2,
        PR, C, TPR, Kmax, Kd, Kx, K, AbsPR, Equation2p5, Kb, Areq: convertedAreq, A: convertedA, Asel: convertedAsel,
        Vreq: convertedVreq, V: convertedV, VActual: convertedVActual, Vsel: convertedVsel, Wns: convertedWns, Vreqp: convertedVreqp, Fs, IsCritical, N1, N3,
        SizingBasis: inputs.SizingBasis,SystemMAWP: inputs.SystemMAWP,valveKmax: valve?.Kmax, valveKApi: valve?.KAPI??valve?.KApi,
        KADataSet:AsmeApiDataSet,CalculationMethod:inputs.CalculationMethod,
        IsASMESection8: inputs?.IsASMESection8,valveA:valve.A,valveAAPI: valve.AAPI,
        // ModelNumber: valve?.ModelNumber, VPValveType: valve?.VPValveType, 
        service: inputs?.service, ShortName: valve?.ShortName, 
        m: valve?.m, b: valve?.b, E: valve?.E, Tp: valve?.Tp,Tpunits:valve?.Tpunits,
        ReResponse
    };
}

function FCWVTK_13157778_14167980(AsmeApiDataSet, valve, inputs, uoms) {
    const [dimension, unit] = inputs?.FlowCapacityUOM !== undefined ? inputs?.FlowCapacityUOM?.split('.') : ['', ''];
    const isVolumetric = !(dimension === 'massflow');
    const isEnglishCalc = inputs.CalculationMethod === 'English';
    const requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degF" : "temp.degC",
        "flowCapacityUOM": isEnglishCalc ? "liquidvolflow.GPMUS" : "liquidvolflow.m3hr",
        "flowMassCapacityUOM": isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "viscosityUOM": isEnglishCalc ? "viscosity.cp" : "viscosity.cp",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "viscosityUOM": inputs?.ViscosityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM
    }

    const N13 = inputs.constants['N13'];
    const N14 = inputs.constants['N14'];
    const N15 = inputs.constants['N15'];
    const SG = Number(inputs?.SpGravity);
    const Mu = convertUnitDiffDims(Number(inputs?.Viscosity), uoms.find(u => u.UnitKey === inputs?.ViscosityUOM), uoms.find(u => u.UnitKey === requiredUnits.viscosityUOM), uoms, inputs);
    const Code = inputs.Code;
    const k = Number(inputs.KCpByCv) == 1 ? 1.0001 : Number(inputs.KCpByCv);
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const ViscosityCorrectionFactor = inputs.ViscosityCorrectionFactor || false;

    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    const Pset = convertUnit(Number(inputs.SetPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.SetPressure);
    const Pover = isNaN(Number(inputs.OverPressure)) ? 0 : convertUnit(Number(inputs.OverPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); // Number(inputs.OverPressure);
    const Psetp = (Pset + Pover) / 1.1;
    const Ploss = isNaN(Number(inputs.InletLoss)) ? 0 : convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    const Pbu = isNaN(Number(inputs.BuiltUp)) ? 0 : convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const Psic = isNaN(Number(inputs.ConstantSuperimposed)) ? 0 : convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    const Psiv = isNaN(Number(inputs.VariableSuperimposed)) ? 0 : convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    const Pback = isNaN(Number(inputs.TotalBackPressure)) ? 0 : convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);

    let Vreq = Number(inputs?.Wreq ? inputs?.Wreq : inputs?.Qreq ? inputs?.Qreq : inputs?.VlreqMass);
    Vreq = convertUnitDiffDims(Vreq, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    let Pa = Pset + Pover - Ploss;
    let Pb = Pback;
    let A = AsmeApiDataSet === "ASME" ? valve.A : valve.AAPI;
    let Asel = A;
    let TPR = Equation_1p1(k);
    let PR = Pa / Pb;
    let P1 = Pa;
    // let Kmax = AsmeApiDataSet === "ASME" ? valve.Kmax : valve.KAPI;
    // let Kd = Kmax;
    //let K = AsmeApiDataSet === "API" ? Kd : Code === "SectionVIII" ? Kd * 0.9 : Kd;
    const {Kd, Kx, K, Kmax,KApi, KxValue,X, X_Equ}=KdKxCheck(AsmeApiDataSet,valve, inputs, uoms, TPR, PR, Patm, Pset, Pover,P1);

    let Kw = KbKwValidateExpressions(inputs.Kw_Expression, { Pset, Pover, Psetp, Ploss, Patm, Pbu, Pback }, uoms, requiredUnits.pressureUOM);
    // if(AsmeApiDataSet==='ASME' && ['JLT-JBS-E','BP','81P','JLT-JBS-BP-E'].includes(valve.ModelNumber)){
    //     console.log('FCWVTK_13157778_14167980 11111111111 >>>>> ', valve?.Brand, valve?.ModelNumber,valve?.VPValveType,Pset, Pover, Psetp, Ploss, Patm, Pbu, Pback, Kw,inputs.Kw_Expression);
    // }
    if(isNaN(Kw) || Kw < 0) {
        Kw = 0;
    }
    Kw = Number(Kw);
    const Kvcalc = calculateKv({ Kv: 1, N13, N14, N15, U: Mu, A, Kz: Kx, Kc, Kw, Pa, Pb, SG, Ao: 1, Vreq, Code, ViscosityCorrectionFactor });
    // if(AsmeApiDataSet==='ASME' && ['JLT-JBS-E','BP','81P','JLT-JBS-BP-E'].includes(valve.ModelNumber)){
    //     console.log('FCWVTK_13157778_14167980 11111111111 >>>>> ', Kvcalc.Kv, N13, N14, N15, Mu, A, Kx, Kc, Kw, Pa, Pb, SG, Vreq, Code, ViscosityCorrectionFactor);
    // }
    const KvcalcActual = calculateKv({ Kv: 1, N13, N14, N15, U: Mu, A, Kz: Kd, Kc, Kw, Pa, Pb, SG, Ao: 1, Vreq, Code, ViscosityCorrectionFactor });
    // const Kvcalc = TestcalculateKv({ Kv: 1, N13, N14, N15, U: Mu, A, Kz: Kx, Kc, Kw, Pa, Pb, SG, Ao: 1, Vreq, Code, ViscosityCorrectionFactor,ModelNumber: valve.ModelNumber,Orifice:valve?.Orifice });
    const Kv = Kvcalc.Kv;
    const R = Kvcalc.Rreq;
    const Rmax = Kvcalc.R;
    const Kvreq = Kvcalc.Kvreq;
    
    const Vsel = Kvcalc.V;
    let VActual = KvcalcActual.V;
    const Areq = A * (Vreq / Vsel) * (Kv / Kvreq);
    const Wsel = convertUnitDiffDims(Vsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowMassCapacityUOM), uoms, inputs);
    VActual=convertUnitDiffDims(VActual, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowMassCapacityUOM), uoms, inputs);
    const Cdtp= calculateCDTP(valve, inputs, uoms);
    // if(valve?.ModelNumber === '900' && valve?.Orifice === '5' && AsmeApiDataSet === 'ASME') {
    //     console.log('FCWVTK_13157778_14167980', {Areq,A,Vreq,Vsel,Kv,Kvreq
    //     , R, Rmax, Kvreq, Vsel, Areq, Vreq, A, Asel, Kd, Kx, K, Kmax,KApi, KxValue,
    //         Pset, Pover, Psetp, Ploss, Patm, Pbu, Psic, Psiv, Pback,
    //         Pa, Pb,receivedUOM,requiredUnits
    //     });

    // }
    let equationValues = {
        requiredUnits, receivedUOM,
        SG, Mu, Code, ViscosityCorrectionFactor, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback,
        Pa, Pb, A, Asel, CDTP:Cdtp, Kc, Kd, Kx, K, Kmax,KApi, KxValue, Kw, Kv, Rmax, R, Kvreq, Vsel, Wsel, Vreq, Areq, N13, N14, N15,X, X_Equ
    }

    const convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPover = convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPloss = convertUnit(Ploss, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPbu = convertUnit(Pbu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsic = convertUnit(Psic, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsiv = convertUnit(Psiv, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPback = convertUnit(Pback, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPa = convertUnit(Pa, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPb = convertUnit(Pb, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedVreq = convertUnitDiffDims(Vreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedVsel = convertUnitDiffDims(Vsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedVActual = convertUnitDiffDims(VActual, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedMu = convertUnitDiffDims(Mu, uoms.find(u => u.UnitKey === requiredUnits.viscosityUOM), uoms.find(u => u.UnitKey === receivedUOM.viscosityUOM), uoms, inputs);
    let Wreq = convertUnitDiffDims(convertedVreq, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowMassCapacityUOM), uoms, inputs);
    const inputValues = {
        SG, Mu, Code, Kv, Kc, ViscosityCorrectionFactor, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover,
        Psetp: convertedPsetp, Ploss: convertedPloss, Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback,
        Pa: convertedPa, Pb: convertedPb, A: convertedA, Asel: convertedAsel, Kd, Kx, K, Kmax,KApi, KxValue, Kw, Vsel: convertedVsel, Vreq: convertedVreq,
        Areq: convertedAreq, Mu: convertedMu, Rmax, R, N13, N14, N15, Wsel
    }

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    let flowMassCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowMassCapacityUOM).UnitName;
    
    let viscosityUOM = uoms.find(u => u.UnitKey === requiredUnits.viscosityUOM).UnitName;
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, viscosityUOM , flowMassCapacityUOM};

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    
    viscosityUOM = uoms.find(u => u.UnitKey === receivedUOM.viscosityUOM).UnitName;
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, viscosityUOM };
    equationValues = { ...equationValues, Wreq };

    const ReResponse = JSON.stringify({ equationValues, inputValues, uomRequired, uomReceived });

    return {
        SG, Mu, Code, Kv, Kc, ViscosityCorrectionFactor, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover,PoverP:inputs?.OverPressurePer,
        Psetp: convertedPsetp, Ploss: convertedPloss, Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback,
        Pa: convertedPa, Pb: convertedPb, A: convertedA, Asel: convertedAsel, Kd, Kx, K, Kmax,KApi, KxValue, Kw, Vsel: convertedVsel, Vreq: convertedVreq,
        Areq: convertedAreq, Mu: convertedMu, Rmax, R, Kvreq, ReResponse, N13, N14, N15,VActual:convertedVActual,
        SizingBasis: inputs.SizingBasis,SystemMAWP: inputs.SystemMAWP,valveKmax: valve?.Kmax, valveKApi: valve?.KAPI??valve?.KApi,
        KADataSet:AsmeApiDataSet,CalculationMethod:inputs.CalculationMethod,
        IsASMESection8: inputs?.IsASMESection8,valveA:valve.A,valveAAPI: valve.AAPI,
        // ModelNumber: valve?.ModelNumber, VPValveType: valve?.VPValveType, 
        service: inputs?.service, ShortName: valve?.ShortName, 
        m: valve?.m, b: valve?.b, E: valve?.E, Tp: valve?.Tp,Tpunits:valve?.Tpunits,
        Viscosity: Number(inputs?.Viscosity),SpGravity: Number(inputs?.SpGravity),
        KCpByCv: inputs.KCpByCv, RuptureDiscKcFd: inputs?.RuptureDiscKcFd,ViscosityCorrectionFactor: inputs.ViscosityCorrectionFactor
    };
};


function FCWVTK_3586889293_3687899495(AsmeApiDataSet, valve, inputs, uoms) {
    const [dimension, unit] = inputs?.FlowCapacityUOM !== undefined ? inputs?.FlowCapacityUOM?.split('.') : ['', ''];
    const isVolumetric = !(dimension === 'massflow');

    const isEnglishCalc = inputs.CalculationMethod === 'English';
    const requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
        "latentheatUOM": isEnglishCalc ? "latentheat.BTUlb" : "latentheat.KJkg",
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
        "latentheatUOM": inputs?.LatentHeatUOM || (isEnglishCalc ? "latentheat.BTUlb" : "latentheat.KJkg")
    }
    
    const N33 = inputs.constants['N33'];
    const N16 = inputs.constants['N16'];
    const Code = inputs.Code;
    const k = Number(inputs.KCpByCv) === 1 ? 1.00001 : Number(inputs.KCpByCv);
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const M = Number(inputs.MolWeight);
    const T = convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Tsat = convertUnit(Number(inputs.SaturatedSteam), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs?.SaturationSteam);
    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    const Pset = convertUnit(Number(inputs.SetPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.SetPressure);
    const Pover = isNaN(Number(inputs.OverPressure)) ? 0 : convertUnit(Number(inputs.OverPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); // Number(inputs.OverPressure);
    const Psetp = (Pset + Pover) / 1.1;
    const Ploss = isNaN(Number(inputs.InletLoss)) ? 0 : convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    const Pbu = isNaN(Number(inputs.BuiltUp)) ? 0 : convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const Psic = isNaN(Number(inputs.ConstantSuperimposed)) ? 0 : convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    const Psiv = isNaN(Number(inputs.VariableSuperimposed)) ? 0 : convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    const Pback = isNaN(Number(inputs.TotalBackPressure)) ? 0 : convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const ho = isNaN(Number(inputs.ho)) ? 0 : convertUnit(Number(inputs.ho), uoms.find(u => u.UnitKey === receivedUOM.latentheatUOM), uoms.find(u => u.UnitKey === requiredUnits.latentheatUOM));//Number(inputs.TotalBackPressure);
    const ecoPreHSBFlag=['Preheater','Economizer']?.includes(inputs?.SizingBasis)
    let Ksh = T === Tsat || ecoPreHSBFlag ? 1 : Number(inputs?.Ksh);
    //let Ksc = ecoPreHSBFlag?1:Number(inputs?.Ksc);
    let Ksc = ecoPreHSBFlag?1:inputs?.Ksc==undefined?1:Number(inputs?.Ksc)
    let A = AsmeApiDataSet === "ASME" ? valve?.A : valve?.AAPI;
    const Asel = A;
    let Wreqp = Number(inputs?.Wreq ? inputs?.Wreq : inputs?.Qreq ? inputs?.Qreq : inputs?.VlreqMass);
    Wreqp = isNaN(Wreqp) ? 0 : convertUnitDiffDims(Wreqp, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    const Wreq = Wreqp;
    let P1 = Pset + Pover - Ploss + Patm;
    const P1_calc= (Math.trunc(Pset * 10000000) / 10000000) + (Math.trunc(Pover * 10000000) / 10000000) + (Math.trunc(Patm * 10000000) / 10000000) - (Math.trunc(Ploss * 10000000) / 10000000);
    let P2 = Pback + Patm;
    let PR = P2 / P1;
    let TPR = Equation_1p1(k);
    let C = Equation_1p6(N33, k);

    // let Kmax = AsmeApiDataSet === "ASME" ? valve.Kmax : valve.KAPI;
    //Kd = AsmeApiDataSet === "ASME" ? kdCalculation(AsmeApiDataSet, valve, inputs, uoms, TPR, PR, Patm, Pset, Pover, P1) : Kmax;
    // let Kx = AsmeApiDataSet === "API" ? Kd : Code === "SectionI" || Code === "SectionVIII" ? 0.9 * Kd : Kd;
    // let K = Kx;

    const {Kd, Kx, K, Kmax,KApi, KxValue,X, X_Equ}=KdKxCheck(AsmeApiDataSet,valve, inputs, uoms, TPR, PR, Patm, Pset, Pover,P1);


    let Kn = knCalculation({ P1, CalculationMethod: inputs.CalculationMethod, uoms });
    // if(!ecoPreHSBFlag){
    //     const P1_Ksc= convertUnit(Number(P1), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === "abspressure.psia"));
    //     if(P1_Ksc<3208.2){
    //         // if(Ksh===undefined){
    //         //     const calcKsh = await CalcSaturatedTempertureKsc(inputs);
    //         //     Ksh = calcKsh.Ksh;
    //         // }
    //         Ksc=1;
    //     }else{
    //         Ksh=1;
    //         // if(Ksc===undefined){
    //         //     const calcKsc = await CalcSaturatedTempertureKsc(inputs);
    //         //     Ksc = calcKsc.Ksc;
    //         // }
    //     }
               
    // }
    // P1= isNaN(P1) ? 0 : Math.trunc(P1 * 1000000) / 1000000;
    // A= isNaN(A) ? 0 : A>8 ? Math.trunc(A * 100000) / 100000 : Math.trunc(A * 100000) / 100000;
    let AbsPR = ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR });
    let Equation2p5 = ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR });
    let Kb = KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }
    Kb = Number(Kb);
    let W = Equation_1p15(N16, A, P1, Kx, Kb, Kc, Kn, Ksh, Ksc) ;
    let WActual = Equation_1p15(N16, A, P1, Kd, Kb, Kc, Kn, Ksh, Ksc) ;
    let Wsel = W;
    WActual = isNaN(WActual) ? W/Kx * Kd : WActual;
    let Areq = A * Wreqp / W;
    // if(valve?.ModelNumber =='5247' && AsmeApiDataSet === 'ASME' && valve?.Orifice === 'F'){ 
    //     console.log('11111 >>>>>>> ',{ModelNumber: valve?.ModelNumber, Orifice: valve?.Orifice, AsmeApiDataSet, Wreqp, W, WActual, Areq, N16, A, P1,P1_chk:Pset + Pover - Ploss + Patm,Ploss, Kx, Kd, Kb, Kc, Kn, Ksh, Ksc, TPR, PR, Patm, Pset, Pover, Kmax:valve?.Kmax, KApi:valve?.KAPI})
    // }

    // console.log('11111 >>>>>>> ',valve?.ModelNumber,valve?.Orifice, A,Asel, P1, Kx,Ksh)
    
    const Cdtp= calculateCDTP(valve, inputs, uoms);
    // if([520].indexOf(valve.ValveId)!==-1){
    //     console.log({N16, A, P1, Kx, Kb, Kc, Kn, Ksh, Ksc, W})
    // }
    const equationValues = {
        requiredUnits, receivedUOM, Code, k, Kc, M, T, Tsat, Patm, Pset, Pover, Psetp,
        Ploss, Pbu, Psic, Psiv, Pback, CDTP:Cdtp, Ksh,ho,Ksc, Kd, Kx, K, Kmax, KxValue,KApi, A, Asel, Wreq, Wreqp,
        P1, P2, PR, TPR, C, Kn, AbsPR, Equation2p5, Kb, W, Wsel,WActual, Areq, N33, N16,X, X_Equ
    }

    const convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedTsat = convertUnit(Tsat, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPover = convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPloss = convertUnit(Ploss, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPbu = convertUnit(Pbu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsic = convertUnit(Psic, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsiv = convertUnit(Psiv, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPback = convertUnit(Pback, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedho = convertUnit(ho, uoms.find(u => u.UnitKey === requiredUnits.latentheatUOM), uoms.find(u => u.UnitKey === receivedUOM.latentheatUOM));
    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedW = convertUnitDiffDims(W, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWsel = convertUnitDiffDims(Wsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWActual = convertUnitDiffDims(WActual, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreqp = convertUnitDiffDims(Wreqp, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    // console.log('11111 >>>>>>> ',valve?.ModelNumber,valve?.Orifice, convertedWreqp, convertedW, convertedWActual, convertedAreq,convertedA,convertedP1,N16,Ksh,Kx,Kd)
    const inputValues = {
        Code, k, Kc, M, T: convertedT, Tsat: convertedTsat, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover,
        Psetp: convertedPsetp, Ploss: convertedPloss, Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback,
        Ksh, ho: convertedho, Ksc, Kd, Kx, K, Kmax, KxValue,KApi, A: convertedA, Asel: convertedAsel, Wreqp: convertedWreqp,
        Wreq: convertedWreq, WActual: convertedWActual, P1: convertedP1, P2: convertedP2, PR, TPR, C, Kn, AbsPR, Equation2p5, Kb,
        W: convertedW, Wsel: convertedWsel, Areq: convertedAreq, N33, N16
    }

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    
    let latentheatUOM = uoms.find(u => u.UnitKey === requiredUnits.latentheatUOM).UnitName;
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, latentheatUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    
    latentheatUOM = uoms.find(u => u.UnitKey === receivedUOM.latentheatUOM).UnitName;
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, latentheatUOM };

    const ReResponse = JSON.stringify({ equationValues, inputValues, uomRequired, uomReceived });

    return {
        Code, k, Kc,Ksc, M, T: convertedT, Tsat: convertedTsat, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover,
        Psetp: convertedPsetp, Ploss: convertedPloss, Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback,
        Ksh,ho: convertedho, A: convertedA, Asel: convertedAsel, Wreqp: convertedWreqp,
        Wreq: convertedWreq, P1: convertedP1, P2: convertedP2, PR, TPR, C, Kd, Kx, K, Kmax, KxValue,KApi, Kn, AbsPR, Equation2p5, Kb,
        W: convertedW, Wsel: convertedWsel,WActual: convertedWActual, Areq: convertedAreq, ReResponse, N33, N16,
        PoverP:inputs?.OverPressurePer,
        SizingBasis: inputs.SizingBasis,SystemMAWP: inputs.SystemMAWP,valveKmax: valve?.Kmax, valveKApi: valve?.KAPI??valve?.KApi,
        KADataSet:AsmeApiDataSet,CalculationMethod:inputs.CalculationMethod,
        IsASMESection8: inputs?.IsASMESection8,valveA:valve.A,valveAAPI: valve.AAPI,
        // ModelNumber: valve?.ModelNumber, VPValveType: valve?.VPValveType, 
        service: inputs?.service, ShortName: valve?.ShortName, 
        m: valve?.m, b: valve?.b, E: valve?.E, Tp: valve?.Tp,Tpunits:valve?.Tpunits
    }
}

function FCWVTK_8182838485_UnWetted(AsmeApiDataSet, valve, inputs, uoms) {
    const isEnglishCalc = inputs.CalculationMethod === 'English';

    const [dimension, unit] = inputs?.FlowCapacityUOM !== undefined ? inputs?.FlowCapacityUOM?.split('.') : ['', ''];
    const isVolumetric = !(dimension === 'massflow');

    let requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
        "surfaceAreaUOM": isEnglishCalc ? "area.ft2" : "area.m2"
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
        "surfaceAreaUOM": inputs?.SurfaceAreaUOM ?? inputs?.AreaUOM
    }
    const N2 = Number(inputs.constants['N2']);
    const N4 = Number(inputs.constants['N4']);
    const N36 = Number(inputs.constants['N36']);
    const N33 = Number(inputs.constants['N33']);
    const N35 = Number(inputs.constants['N35']);

    const Code = inputs.Code;
    const k = Number(inputs.KCpByCv) == 1 ? 1.0001 : Number(inputs.KCpByCv);
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const M = Number(inputs.MolWeight);
    const Z = Number(inputs.Compressibility);

    const Aprime = convertUnit(Number(inputs.SurfaceArea), uoms.find(u => u.UnitKey === receivedUOM.surfaceAreaUOM), uoms.find(u => u.UnitKey === requiredUnits.surfaceAreaUOM)); //Number(inputs.Relieving); //Require Conversion
    const F = Number(inputs.EnvironmentalFactor ?? 1);
    const Tn = convertUnit(Number(inputs.Operating), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Tw = convertUnit(Number(inputs?.WallTemp)??0, uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion

    const T = convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    const Pset = convertUnit(Number(inputs.SetPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.SetPressure);
    const Pover = convertUnit(Number(inputs.OverPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); // Number(inputs.OverPressure);
    const Pn = convertUnit(Number(inputs.OperatingPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); // Number(inputs.OverPressure);
    const Psetp = (Pset + Pover) / 1.1;
    const Ploss = convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    const Pbu = convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const Psic = convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    const Psiv = convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    const Pback = convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);

    let Wreq = Number(inputs?.Wreq ? inputs?.Wreq : inputs?.Qreq ? inputs?.Qreq : inputs?.VlreqMass);
    let WreqAddp = Number(inputs?.AddCapacityForPressure ?? 0);

    let P1 = Pset + Pover - Ploss + Patm;
    let P2 = Patm + Pbu + Psic + Psiv;
    let PR = P2 / P1;
    let C = Equation_1p6(N33, k);
    let TPR = Equation_1p1(k);

    const {Kd, Kx, K, Kmax,KApi, KxValue,X, X_Equ}=KdKxCheck(AsmeApiDataSet,valve, inputs, uoms, TPR, PR, Patm, Pset, Pover,P1);

    let AbsPR = inputs?.AbsPR_AbsPressureRatio ? ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR }) : 1;
    let Equation2p5 = inputs?.Equation2p5_Expression ? ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR }) : '';
    let Kb = KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }
    Kb = Number(Kb);
    const A = AsmeApiDataSet === "ASME" ? valve.A : valve.AAPI;
    let Asel = A;
    let Fs = Equation_1p4(PR, k);
    let IsCritical = IsCriticalFlow(uoms, inputs.CalculationMethod, Pset, PR, TPR, valve);
    requiredUnits={...requiredUnits,
        flowCapacityUOM: isVolumetric && isEnglishCalc && !IsCritical ? 'gasvolflow.SCFH' : requiredUnits.flowCapacityUOM  //isVolumetric?isEnglishCalc ? IsCritical?"gasvolflow.SCFH" :"gasvolflow.SCFM" : "gasvolflow.Nm3hr":isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
    }
    // let W = IsCritical ? Equation_1p5b(N4, A, C, Kx, P1, Kb, Kc, M, T, Z) : (Equation_1p3b(N2, Kx, A, P1, Fs, M, T, Z));
    let W = Calculate_W(isVolumetric,IsCritical,isEnglishCalc,{inputs,A,C,Kx,P1,Kb,Kc,M,T,Z,Fs});
    // if([520].indexOf(valve.ValveId)!==-1){
    //     console.log({A,C,Kx,P1,Kb,Kc,M,T,Z,Fs,IsCritical,W})
    // }
    let Wsel = W;
    let WActual = Calculate_W(isVolumetric,IsCritical,isEnglishCalc,{inputs,A,C,Kd,P1,Kb,Kc,M,T,Z,Fs});
    WActual = isNaN(WActual) ? W/Kx * Kd : WActual;
    Wreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    WreqAddp = convertUnitDiffDims(WreqAddp, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    // let Tup = P1 * Tn / Pn;
    // let Fprime = N36 * ((Tw - Tup) ** 1.25) / (C * Kx * (Tup ** 0.6506));
    // Fprime = Fprime < 0.01 ? 0.01 : Fprime;
    // //let Areq = F * Fprime * Aprime / (P1 ** 0.5);

    // let Areq = A * Wreq / Wsel;

    // let Wreqp = Areq * Wsel / Asel;

    let Tup = inputs?.Tup!==undefined?inputs?.Tup:P1 * Tn / (Pn + Patm);
    // let Tup = P1 * Tn / (Pn + Patm);
    const IsFireSizingFactorCalculated=inputs?.IsFireSizingFactorCalculated;
    
    let Fprime = N36 * ((Tw - Tup) ** 1.25) / (C * Kx * (Tup ** 0.6506));
    Fprime = isNaN(Fprime)?0.01: Fprime < 0.01 ? 0.01 : Fprime;
    Fprime= IsFireSizingFactorCalculated?Fprime:Number(inputs?.FireSizingFactor);
    let Areq = N35 *F * Fprime * Aprime / (P1 ** 0.5);
   
    Wreq = Areq * Wsel / Asel;
    let Wreqp = Wreq + WreqAddp;

    const Cdtp= calculateCDTP(valve, inputs, uoms);
    // if(valve.ValveId==297){
    //     console.log(`In unwetted >>>> ModelNumber::${valve.ModelNumber} >>>IsCritical:: ${IsCritical} >> Pset:: ${Pset} >> PR::${PR} >> N4:${N4}, A:${A}, C:${C}, K:${K}, P1:${P1}, P2:${P2}, Pr:${PR}, TPR:${TPR} >>> Kb:${Kb}, Kc:${Kc}, M:${M}, T:${T}, Tw:${Tw}, Tup:${Tup}, Z:${Z}, N2:${N2}, Fs:${Fs}`);
    // }
    // if(valve.ValveId==297){
    //     console.log(`In unwetted >>>> Wreqp:: ${Wreqp} >> Areq:: ${Areq} >> Wsel:: ${Wsel} >> Asel:: ${Asel} >> 
    //                             F:: ${F} >> F'::${Fprime} >> A'::${Aprime} >> P1::${P1} >>
    //                             IsFireSizingFactorCalculated :: ${IsFireSizingFactorCalculated} >> Tup::${Tup} >> Tw::${Tw} >> Kx::${Kx} >> C::${C} >> N36::${N36} >>
    //                             Fs::${Fs} >> IsCritical :: ${IsCritical} >> K::${K} >> Kd::${Kd} >> Kmax::${Kmax} >> KApi::${KApi} >> KxValue::${KxValue} >> PR::${PR} >> TPR::${TPR} >> AbsPR::${AbsPR} >> Equation2p5::${Equation2p5} >> Kb::${Kb} >> W::${W} `);
    // }
    const equationValues = {
        requiredUnits, receivedUOM,
        N2, N4, N36, N33, Code, k, Kc, M, Z, Aprime, F, Tn, Tw, T, CDTP:Cdtp,Patm, Pset, Pover, Pn, Psetp, Ploss, Pbu, Psic, Psiv, Pback, Wreq,
        P1, P2, PR, C, TPR, Kmax, Kd, Kx, K,KApi, KxValue, AbsPR, Equation2p5, Kb, A, Asel, Fs, IsCritical, W, Wsel,WActual, Tup, Fprime, Areq, Wreqp,IsFireSizingFactorCalculated:IsFireSizingFactorCalculated.toString(),X, X_Equ
    };

    const convertedAprime = convertUnit(Aprime, uoms.find(u => u.UnitKey === requiredUnits.surfaceAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.surfaceAreaUOM));
    const convertedTn = convertUnit(Tn, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedTw = convertUnit(Tw, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPover = convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPn = convertUnit(Pn, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPloss = convertUnit(Ploss, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPbu = convertUnit(Pbu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsic = convertUnit(Psic, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsiv = convertUnit(Psiv, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPback = convertUnit(Pback, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedW = convertUnitDiffDims(W, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWsel = convertUnitDiffDims(Wsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreqp = convertUnitDiffDims(Wreqp, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWActual = convertUnitDiffDims(WActual, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const inputValues = {
        N2, N4, N36, N33, Code, k, Kc, M, Z, Aprime: convertedAprime, F, Tn: convertedTn, Tw: convertedTw, T: convertedT, Patm: convertedPatm, Pset: convertedPset,
        Pover: convertedPover, Pn: convertedPn, Psetp: convertedPsetp, Ploss: convertedPloss, Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback,
        Wreq: convertedWreq, WActual: convertedWActual, P1: convertedP1, P2: convertedP2, PR, C, TPR, Kmax, Kd, KApi, Kx, K, AbsPR, Equation2p5, Kb, A: convertedA, Asel: convertedAsel, Fs, IsCritical,
        W: convertedW, Wsel: convertedWsel, Tup, Fprime, Areq: convertedAreq, Wreqp: convertedWreqp,IsFireSizingFactorCalculated:IsFireSizingFactorCalculated.toString()
    };

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    
    let surfaceAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.surfaceAreaUOM).UnitName;
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, surfaceAreaUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    
    surfaceAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.surfaceAreaUOM).UnitName;
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, surfaceAreaUOM };

    const ReResponse = JSON.stringify({ equationValues, inputValues, uomRequired, uomReceived });
    IsCritical = IsCritical ? 'Critical' : 'Sub Critical';
    return {
        N2, N4, N36, N33, Code, k, Kc, M, Z, Aprime: convertedAprime, F, Tn: convertedTn, Tw: convertedTw, T: convertedT, Patm: convertedPatm, Pset: convertedPset,
        Pover: convertedPover, Pn: convertedPn, Psetp: convertedPsetp, Ploss: convertedPloss, Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback,
        Wreq: convertedWreq, P1: convertedP1, P2: convertedP2, PR, C, TPR, Kmax, Kd, KApi, Kx, K, AbsPR, Equation2p5, Kb, A: convertedA, Asel: convertedAsel, Fs, IsCritical,
        W: convertedW, Wsel: convertedWsel,WActual: convertedWActual, Tup, Fprime, Areq: convertedAreq, Wreqp: convertedWreqp,IsFireSizingFactorCalculated:IsFireSizingFactorCalculated.toString(), ReResponse,
        PoverP:inputs?.OverPressurePer,
        SizingBasis: inputs.SizingBasis,SystemMAWP: inputs.SystemMAWP,valveKmax: valve?.Kmax, valveKApi: valve?.KAPI??valve?.KApi,
        KADataSet:AsmeApiDataSet,CalculationMethod:inputs.CalculationMethod,
        IsASMESection8: inputs?.IsASMESection8,valveA:valve.A,valveAAPI: valve.AAPI,
        // ModelNumber: valve?.ModelNumber, VPValveType: valve?.VPValveType, 
        service: inputs?.service, ShortName: valve?.ShortName, 
        m: valve?.m, b: valve?.b, E: valve?.E, Tp: valve?.Tp,Tpunits:valve?.Tpunits,
        SurfaceArea: inputs?.SurfaceArea,OperatingPressure: inputs?.OperatingPressure,Operating: inputs?.Operating,WallTemp: inputs?.WallTemp,
        AddCapacityForPressure: inputs?.AddCapacityForPressure,FireSizingFactor: inputs?.FireSizingFactor,IsFireSizingFactorCalculated:inputs?.IsFireSizingFactorCalculated,
        EnvironmentalFactor: inputs?.EnvironmentalFactor
    };

}

function FCWVTK_8182838485_Wetted(AsmeApiDataSet, valve, inputs, uoms) {
    const isEnglishCalc = inputs.CalculationMethod === 'English';
    const [dimension, unit] = inputs?.FlowCapacityUOM !== undefined ? inputs?.FlowCapacityUOM?.split('.') : ['', ''];
    const isVolumetric = !(dimension === 'massflow');
    let requiredUnits = {
        "absPressureUOM": isEnglishCalc ? "abspressure.psia" : "abspressure.bara",
        "pressureUOM": isEnglishCalc ? "pressure.psig" : "pressure.barg",
        "temperatureUOM": isEnglishCalc ? "temp.degR" : "temp.degK",
        "flowCapacityUOM": isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
        "orificeAreaUOM": isEnglishCalc ? "area.in2" : "area.cm2",
        "areaUOM": isEnglishCalc ? "area.ft2" : "area.m2",
        "latentHeatOfVaporUOM": isEnglishCalc ? "latentheat.BTUlb" : "latentheat.Jkg"
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
        "areaUOM": inputs?.AreaUOM,
        "latentHeatOfVaporUOM": inputs?.LatentHeatOfVaporUOM
    }
    const N2 = Number(inputs.constants['N2']);
    const N4 = Number(inputs.constants['N4']);
    const N36 = Number(inputs.constants['N36']);
    const N33 = Number(inputs.constants['N33']);
    const N38 = Number(inputs.constants['N38']);
    const N37 = inputs.DrianExist ? Number(inputs.constants['N37_1']) : Number(inputs.constants['N37_2']);
    const Code = inputs.Code;
    const k = Number(inputs.KCpByCv) == 1 ? 1.0001 : Number(inputs.KCpByCv);
    const Kc = Number(inputs?.RuptureDiscKcFd || 1);
    const M = Number(inputs.MolWeight);
    const Z = Number(inputs.Compressibility);

    const Awet = convertUnit(Number(inputs?.WettedArea), uoms.find(u => u.UnitKey === receivedUOM.areaUOM), uoms.find(u => u.UnitKey === requiredUnits.areaUOM)); //Number(inputs.Relieving); //Require Conversion
    const F = Number(inputs.EnvironmentalFactor ?? 1);
    const Hvap = convertUnit(Number(inputs?.LatentHeatOfVapor??1), uoms.find(u => u.UnitKey === receivedUOM.latentHeatOfVaporUOM), uoms.find(u => u.UnitKey === requiredUnits.latentHeatOfVaporUOM)); //Number(inputs.Relieving); //Require Conversion

    const T = convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    const Pset = convertUnit(Number(inputs.SetPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.SetPressure);
    const Pover = convertUnit(Number(inputs.OverPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); // Number(inputs.OverPressure);
    const Pn = convertUnit(Number(inputs.OperatingPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); // Number(inputs.OverPressure);
    const Psetp = (Pset + Pover) / 1.1;
    const Ploss = convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    const Pbu = convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const Psic = convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    const Psiv = convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    const Pback = convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);

    let Wreq = Number(inputs?.Wreq ? inputs?.Wreq : inputs?.Qreq ? inputs?.Qreq : inputs?.VlreqMass);
    

    let WreqAddp = Number(inputs?.AddCapacityForPressure ?? 0);
    

    let P1 = Pset + Pover - Ploss + Patm;
    let P2 = Patm + Pbu + Psic + Psiv;
    let PR = P2 / P1;
    let C = Equation_1p6(N33, k);
    let TPR = Equation_1p1(k);

    // let Kmax = AsmeApiDataSet === "ASME" ? valve.Kmax : valve.KAPI;
    // let Kd = AsmeApiDataSet === "ASME" ? kdCalculation(AsmeApiDataSet, valve, inputs, uoms, TPR, PR, Patm, Pset, Pover, P1) : Kmax;
    // let Kx = AsmeApiDataSet === "API" ? Kd : 0.9 * Kd;
    // let K = Kx;

    const {Kd, Kx, K, Kmax,KApi, KxValue,X, X_Equ}=KdKxCheck(AsmeApiDataSet,valve, inputs, uoms, TPR, PR, Patm, Pset, Pover,P1);

    let AbsPR = inputs?.AbsPR_AbsPressureRatio ? ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR }) : 1;
    let Equation2p5 = inputs?.Equation2p5_Expression ? ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR }) : '';
    let Kb = KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }
    Kb = Number(Kb);
    const A = AsmeApiDataSet === "ASME" ? valve.A : valve.AAPI;
    let Asel = A;
    let Fs = Equation_1p4(PR, k);
    let IsCritical = IsCriticalFlow(uoms, inputs.CalculationMethod, Pset, PR, TPR, valve);

    requiredUnits={...requiredUnits,
        flowCapacityUOM: isVolumetric && isEnglishCalc && !IsCritical ? 'gasvolflow.SCFH' : requiredUnits.flowCapacityUOM  //isVolumetric?isEnglishCalc ? IsCritical?"gasvolflow.SCFH" :"gasvolflow.SCFM" : "gasvolflow.Nm3hr":isEnglishCalc ? "massflow.lbhr" : "massflow.kghr",
    }
    // let W = IsCritical ? Equation_1p5b(N4, A, C, Kx, P1, Kb, Kc, M, T, Z) : (Equation_1p3b(N2, Kx, A, P1, Fs, M, T, Z));
    let W = Calculate_W(isVolumetric,IsCritical,isEnglishCalc,{inputs,A,C,Kx,P1,Kb,Kc,M,T,Z,Fs});
    let Wsel = W;
    let WActual = Calculate_W(isVolumetric,IsCritical,isEnglishCalc,{inputs,A,C,Kd,P1,Kb,Kc,M,T,Z,Fs});
    WActual = isNaN(WActual) ? W/Kx * Kd : WActual;
    Wreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    WreqAddp = convertUnitDiffDims(WreqAddp, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    let Q = N37 * F * (Awet ** 0.82);
    let Wreqp = (N38 * Q / Hvap) + WreqAddp;

    let Areq = A * (Wreq / W);
    // console.log(`In Wetted flow >>>>>>>> ModelNumber:${valve?.ModelNumber}, Orifice:${valve?.Orifice},N2:${N2}, N4:${N4}, N36:${N36}, N33:${N33}, N37:${N37}, N38:${N38}, 
    //             Code:${Code}, k:${k}, Kc:${Kc}, M:${M}, Z:${Z}, F:${F}, Hvap:${Hvap}, 
    //             T:${T}, Patm:${Patm}, Pset:${Pset}, Pover:${Pover}, Pn:${Pn}, Psetp:${Psetp}, Ploss:${Ploss}, Pbu:${Pbu}, Psic:${Psic}, Psiv:${Psiv}, Pback:${Pback}, 
    //             Q: ${Q}, A: ${A}, IsCritical: ${IsCritical.toString()}, Awet:${Awet}, W:${W}, Wreqp: ${Wreqp}, Wreq:${Wreq},Areq:${Areq}`);
    
    const Cdtp= calculateCDTP(valve, inputs, uoms);
    // if(valve.ValveId==632){
    //     console.log(`In Wetted flow >>>>>>>> N2:${N2}, N4:${N4}, N36:${N36}, N33:${N33}, N37:${N37}, N38:${N38}, 
    //                 Code:${Code}, k:${k}, Kc:${Kc}, M:${M}, Z:${Z}, Awet:${Awet}, F:${F}, Hvap:${Hvap}, 
    //                 T:${T}, Patm:${Patm}, Pset:${Pset}, Pover:${Pover}, Pn:${Pn}, Psetp:${Psetp}, Ploss:${Ploss}, Pbu:${Pbu}, Psic:${Psic}, Psiv:${Psiv}, Pback:${Pback}, 
    //                 Q: ${Q}, A: ${A}, IsCritical: ${IsCritical.toString()}, Awet:${Awet}, W:${W}, Wreqp: ${Wreqp}, Wreq:${Wreq},Areq:${Areq}`);
    // }
    const equationValues = {
        requiredUnits, receivedUOM,
        N2, N4, N36, N33, N37, N38, Code, k, Kc, M, Z, Awet, F, Hvap, T, CDTP:Cdtp, Patm, Pset, Pover, Pn, Psetp, Ploss, Pbu, Psic, Psiv, Pback, Wreq,
        P1, P2, PR, C, TPR, Kmax, Kd, Kx, K, KApi, KxValue, AbsPR, Equation2p5, Kb, A, Asel, Fs, IsCritical, W, Wsel,WActual, Q, Wreqp, Areq,X, X_Equ
    };

    const convertedAwet = convertUnit(Awet, uoms.find(u => u.UnitKey === requiredUnits.areaUOM), uoms.find(u => u.UnitKey === receivedUOM.areaUOM));
    const convertedHvap = convertUnit(Hvap, uoms.find(u => u.UnitKey === requiredUnits.latentHeatOfVaporUOM), uoms.find(u => u.UnitKey === receivedUOM.latentHeatOfVaporUOM));
    const convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    const convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPover = convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPn = convertUnit(Pn, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPloss = convertUnit(Ploss, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPbu = convertUnit(Pbu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsic = convertUnit(Psic, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPsiv = convertUnit(Psiv, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedPback = convertUnit(Pback, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    const convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    const convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    const convertedW = convertUnitDiffDims(W, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWsel = convertUnitDiffDims(Wsel, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedQ = convertUnitDiffDims(Q, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreqp = convertUnitDiffDims(Wreqp, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWreq = convertUnitDiffDims(Wreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const convertedWActual = convertUnitDiffDims(WActual, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    const inputValues = {
        N2, N4, N36, N33, N37, N38, Code, k, Kc, M, Z, Awet: convertedAwet, F, Hvap: convertedHvap, T: convertedT, Patm: convertedPatm, Pset: convertedPset,
        Pover: convertedPover, Pn: convertedPn, Psetp: convertedPsetp, Ploss: convertedPloss, Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback,
        Wreq: convertedWreq, WActual: convertedWActual, P1: convertedP1, P2: convertedP2, PR, C, TPR, Kmax, Kd, Kx, K, KApi, AbsPR, Equation2p5, Kb, A: convertedA, Asel: convertedAsel, Fs, IsCritical,
        W: convertedW, Wsel: convertedWsel, Q: convertedQ, Wreqp: convertedWreqp, Areq: convertedAreq
    };

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    
    let areaUOM = uoms.find(u => u.UnitKey === requiredUnits.areaUOM).UnitName;
    let latentHeatOfVaporUOM = uoms.find(u => u.UnitKey === requiredUnits.latentHeatOfVaporUOM).UnitName;
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, areaUOM, latentHeatOfVaporUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    
    areaUOM = uoms.find(u => u.UnitKey === receivedUOM.areaUOM).UnitName;
    latentHeatOfVaporUOM = uoms.find(u => u.UnitKey === receivedUOM.latentHeatOfVaporUOM).UnitName;
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, areaUOM, latentHeatOfVaporUOM };

    const ReResponse = JSON.stringify({ equationValues, inputValues, uomRequired, uomReceived });
    IsCritical = IsCritical ? 'Critical' : 'Sub Critical';
    return {
        N2, N4, N36, N33, N37, N38, Code, k, Kc, M, Z, Awet: convertedAwet, F, Hvap: convertedHvap, T: convertedT, Patm: convertedPatm, Pset: convertedPset,
        Pover: convertedPover, Pn: convertedPn, Psetp: convertedPsetp, Ploss: convertedPloss, Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback,
        Wreq: convertedWreq, P1: convertedP1, P2: convertedP2, PR, C, TPR, Kmax, Kd, Kx, K, AbsPR, Equation2p5, Kb, A: convertedA, Asel: convertedAsel, Fs, IsCritical,
        W: convertedW, Wsel: convertedWsel,WActual: convertedWActual, Q: convertedQ, Wreqp: convertedWreqp, Areq: convertedAreq, ReResponse,
           PoverP:inputs?.OverPressurePer,
        SizingBasis: inputs.SizingBasis,SystemMAWP: inputs.SystemMAWP,valveKmax: valve?.Kmax, valveKApi: valve?.KAPI??valve?.KApi,
        KADataSet:AsmeApiDataSet,CalculationMethod:inputs.CalculationMethod,
        IsASMESection8: inputs?.IsASMESection8,valveA:valve.A,valveAAPI: valve.AAPI,
        // ModelNumber: valve?.ModelNumber, VPValveType: valve?.VPValveType, 
        service: inputs?.service, ShortName: valve?.ShortName, 
        m: valve?.m, b: valve?.b, E: valve?.E, Tp: valve?.Tp,Tpunits:valve?.Tpunits,
        WettedArea: inputs?.WettedArea,OperatingPressure: inputs?.OperatingPressure,Operating: inputs?.Operating,
        AddCapacityForPressure: inputs?.AddCapacityForPressure,
        EnvironmentalFactor: inputs?.EnvironmentalFactor,
        DrianExist: inputs?.DrianExist,LatentHeatOfVapor: inputs?.LatentHeatOfVapor

    };

}

function FCWVTK_8182838485(AsmeApiDataSet, valve, inputs, uoms) {
   
    if (inputs.FireSizingMethod === 'Unwetted') {
        return FCWVTK_8182838485_UnWetted(AsmeApiDataSet, valve, inputs, uoms);
    }
    else {
        return FCWVTK_8182838485_Wetted(AsmeApiDataSet, valve, inputs, uoms);
    }
}

function FCWValidationTestKit17_PV(AsmeApiDataSet, valve, inputs, uoms) {
    const requiredUnits = {
        "absPressureUOM": "abspressure.psia",
        "pressureUOM": "pressure.psig",
        "temperatureUOM": "temp.degF",
        "flowCapacityUOM": "gasvolflow.SCFH"
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM
    }

    let returnValues = {};

    let A = Number(valve.A);
    let Tp = Number(valve.Tp);
    let E = Number(valve.E);
    let Kmax = Number(valve.Kmax);

    let Av = Number(valve.A);
    let Tpv = Number(valve.Tp);
    let Ev = Number(valve.E);
    let Kmaxv = Number(valve.Kmax);

    let M = Number(inputs.MolWeight);
    let k = Number(inputs.KCpByCv);
    let Z = Number(inputs.Compressibility);

    let Mv = Number(inputs.MolWeightVacuum);
    let kv = Number(inputs.KCpByCvVacuum);
    let Zv = Number(inputs.CompressibilityVacuum);

    let Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    let DeltaP = convertUnit(Number(inputs.DeltaPressure), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let DeltaPv = convertUnit(Number(inputs.DeltaPressureVacuum), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let T = convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM));
    let Tv = convertUnit(Number(inputs.RelievingforVacuum), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM));

    let P2p = Patm;
    let P1p = P2p + DeltaP;
    let PR = P2p / P1p;
    let Xp = DeltaP;
    let Kd = Xp >= Tp ? Kmax : Kmax * math.pow(math.sin(Xp / Tp * (math.pi / 2)), E);
    let Fs = math.sqrt((k / (k - 1)) * (math.pow(PR, 2 / k) - math.pow(PR, ((k + 1) / k))));
    let Vsel = 278700 * Kd * A * P1p * Fs / math.sqrt(M * (T + 459.67) * Z);

    let P1v = Patm;
    let P2v = P1v - DeltaPv;
    let PRv = P2v / P1v;
    let Xv = DeltaPv;
    let Kdv = Xv >= Tpv ? Kmaxv : Kmaxv * math.pow(math.sin(Xv / Tpv * (math.pi / 2)), Ev);
    let Fsv = math.sqrt((kv / (kv - 1)) * (math.pow(PRv, 2 / kv) - math.pow(PRv, ((kv + 1) / kv))));
    let Vselv = 278700 * Kdv * Av * P1v * Fsv / math.sqrt(Mv * (Tv + 459.67) * Zv);

    returnValues = { ...returnValues, P1p, P2p, PR, Xp, Kd, Fs, Vsel, P1v, P2v, PRv, Xv, Kdv, Fsv, Vselv };

    return returnValues;
}

function FCWValidationTestKit17(AsmeApiDataSet, valve, inputs, uoms) {
    const requiredUnits = {
        "absPressureUOM": "abspressure.psia",
        "pressureUOM": "pressure.psig",
        "temperatureUOM": "temp.degF",
        "flowCapacityUOM": "gasvolflow.SCFH"
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM
    }

    let returnValues = {
        P1p: null,
        P2p: null,
        PR: null,
        TPR: null,
        Xp: null,
        Kd: null,
        Fs: null,
        Vsel: null,
        P1v: null,
        P2v: null,
        PRv: null,
        Xv: null,
        Kdv: null,
        Fsv: null,
        Vselv: null
    };

    let A = Number(valve.A);
    let Tp = Number(valve.Tp);
    let E = Number(valve.E);
    let Kmax = Number(valve.Kmax);

    let Av = Number(valve.A);
    let Tpv = Number(valve.Tp);
    let Ev = Number(valve.E);
    let Kmaxv = Number(valve.Kmax);

    let M = Number(inputs.MolWeight);
    let k = Number(inputs.KCpByCv);
    let Z = Number(inputs.Compressibility);

    let Mv = Number(inputs.MolWeightVacuum);
    let kv = Number(inputs.KCpByCvVacuum);
    let Zv = Number(inputs.CompressibilityVacuum);
    let IsPressureOnly = inputs.IsPressureOnly;
    let IsVacuumOnly = inputs.IsVacuumOnly;
    let Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    let DeltaP = convertUnit(Number(inputs.DeltaPressure), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let DeltaPv = convertUnit(Number(inputs.DeltaPressureVacuum), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let T = convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM));
    let Tv = convertUnit(Number(inputs.RelievingforVacuum), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM));
    if (IsPressureOnly && valve.ValveFunction === "P") {
        let P2p = Patm;
        let P1p = P2p + DeltaP;
        let PR = P2p / P1p;
        let Xp = DeltaP;
        let Kd = Xp >= Tp ? Kmax : Kmax * math.pow(math.sin(Xp / Tp * (math.pi / 2)), E);
        let Fs = math.sqrt((k / (k - 1)) * (math.pow(PR, 2 / k) - math.pow(PR, ((k + 1) / k))));
        let Vsel = 278700 * Kd * A * P1p * Fs / math.sqrt(M * (T + 459.67) * Z);
        returnValues = { ...returnValues, P1p, P2p, PR, Xp, Kd, Fs, Vsel };
    }
    else if (IsVacuumOnly && valve.ValveFunction === "V") {
        let P1v = Patm;
        let P2v = P1v - DeltaPv;
        let PRv = P2v / P1v;
        let Xv = DeltaPv;
        let Kdv = Xv >= Tpv ? Kmaxv : Kmaxv * math.pow(math.sin(Xv / Tpv * (math.pi / 2)), Ev);
        let Fsv = math.sqrt((kv / (kv - 1)) * (math.pow(PRv, 2 / kv) - math.pow(PRv, ((kv + 1) / kv))));
        let Vselv = 278700 * Kdv * Av * P1v * Fsv / math.sqrt(Mv * (Tv + 459.67) * Zv);
        returnValues = { ...returnValues, P1v, P2v, PRv, Xv, Kdv, Fsv, Vselv };
    }
    return returnValues;
}


function FCWValidationTestKit18_PV(AsmeApiDataSet, valve, inputs, uoms) {
    const requiredUnits = {
        "absPressureUOM": "abspressure.bara",
        "pressureUOM": "pressure.barg",
        "temperatureUOM": "temp.degC",
        "flowCapacityUOM": "gasvolflow.Nm3hr"
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM
    }

    let returnValues = {};

    let A = Number(valve.A);
    let Tp = Number(valve.Tp);
    Tp = Tp / (100000 / 4.44822161526 / math.pow((3.28083989501312 * 12), 2));
    let E = Number(valve.E);
    let Kmax = Number(valve.Kmax);

    let Av = Number(valve.A);
    let Tpv = Number(valve.Tp);
    Tpv = Tpv / (100000 / 4.44822161526 / math.pow((3.28083989501312 * 12), 2));
    let Ev = Number(valve.E);
    let Kmaxv = Number(valve.Kmax);

    let M = Number(inputs.MolWeight);
    let k = Number(inputs.KCpByCv);
    let Z = Number(inputs.Compressibility);

    let Mv = Number(inputs.MolWeightVacuum);
    let kv = Number(inputs.KCpByCvVacuum);
    let Zv = Number(inputs.CompressibilityVacuum);

    let Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    let DeltaP = convertUnit(Number(inputs.DeltaPressure), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let DeltaPv = convertUnit(Number(inputs.DeltaPressureVacuum), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let T = convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM));
    let Tv = convertUnit(Number(inputs.RelievingforVacuum), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM));

    let P2p = Patm;
    let P1p = P2p + DeltaP;
    let PR = P2p / P1p;
    let Xp = DeltaP;
    let Kd = Xp >= Tp ? Kmax : Kmax * math.pow(math.sin(Xp / Tp * (math.pi / 2)), E);
    let Fs = math.sqrt((k / (k - 1)) * (math.pow(PR, 2 / k) - math.pow(PR, ((k + 1) / k))));
    let Vsel = 12515 * Kd * A * P1p * Fs / math.sqrt(M * (T + 273.15) * Z);

    let P1v = Patm;
    let P2v = P1v - DeltaPv;
    let PRv = P2v / P1v;
    let Xv = DeltaPv;
    let Kdv = Xv >= Tpv ? Kmaxv : Kmaxv * math.pow(math.sin(Xv / Tpv * (math.pi / 2)), Ev);
    let Fsv = math.sqrt((kv / (kv - 1)) * (math.pow(PRv, 2 / kv) - math.pow(PRv, ((kv + 1) / kv))));
    let Vselv = 12515 * Kdv * Av * P1v * Fsv / math.sqrt(Mv * (Tv + 273.15) * Zv);

    returnValues = { ...returnValues, P1p, P2p, PR, Xp, Kd, Fs, Vsel, P1v, P2v, PRv, Xv, Kdv, Fsv, Vselv };

    return returnValues;
}

function FCWValidationTestKit18(AsmeApiDataSet, valve, inputs, uoms) {
    const requiredUnits = {
        "absPressureUOM": "abspressure.bara",
        "pressureUOM": "pressure.barg",
        "temperatureUOM": "temp.degC",
        "flowCapacityUOM": "gasvolflow.Nm3hr"
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM
    }

    let returnValues = {
        P1p: null,
        P2p: null,
        PR: null,
        TPR: null,
        Xp: null,
        Kd: null,
        Fs: null,
        Vsel: null,
        P1v: null,
        P2v: null,
        PRv: null,
        Xv: null,
        Kdv: null,
        Fsv: null,
        Vselv: null
    };

    let A = Number(valve.A);
    let Tp = Number(valve.Tp);
    Tp = Tp / (100000 / 4.44822161526 / math.pow((3.28083989501312 * 12), 2));
    let E = Number(valve.E);
    let Kmax = Number(valve.Kmax);

    let Av = Number(valve.A);
    let Tpv = Number(valve.Tp);
    Tpv = Tpv / (100000 / 4.44822161526 / math.pow((3.28083989501312 * 12), 2));
    let Ev = Number(valve.E);
    let Kmaxv = Number(valve.Kmax);

    let M = Number(inputs.MolWeight);
    let k = Number(inputs.KCpByCv);
    let Z = Number(inputs.Compressibility);

    let Mv = Number(inputs.MolWeightVacuum);
    let kv = Number(inputs.KCpByCvVacuum);
    let Zv = Number(inputs.CompressibilityVacuum);
    let IsPressureOnly = inputs.IsPressureOnly;
    let IsVacuumOnly = inputs.IsVacuumOnly;
    let Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    let DeltaP = convertUnit(Number(inputs.DeltaPressure), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let DeltaPv = convertUnit(Number(inputs.DeltaPressureVacuum), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let T = convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM));
    let Tv = convertUnit(Number(inputs.RelievingforVacuum), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM));
    if (IsPressureOnly && valve.ValveFunction === "P") {
        let P2p = Patm;
        let P1p = P2p + DeltaP;
        let PR = P2p / P1p;
        let Xp = DeltaP;
        let Kd = Xp >= Tp ? Kmax : Kmax * math.pow(math.sin((Xp / Tp) * (math.pi / 2)), E);
        // (J56>=J53,J55,Kmax*( math.sin( (Xp/Tp)*(math.pi/2) )^J54 ))
        let Fs = math.sqrt((k / (k - 1)) * (math.pow(PR, 2 / k) - math.pow(PR, ((k + 1) / k))));
        let Vsel = 12515 * Kd * A * P1p * Fs / math.sqrt(M * (T + 273.15) * Z);
        //    (12515*J57*J51*J47*J58/SQRT(J11*(J18+273.15)*J13))
        returnValues = { ...returnValues, P1p, P2p, PR, Xp, Kd, Fs, Vsel };
    }
    else if (IsVacuumOnly && valve.ValveFunction === "V") {
        let P1v = Patm;
        let P2v = P1v - DeltaPv;
        let PRv = P2v / P1v;
        let Xv = DeltaPv;
        let Kdv = Xv >= Tpv ? Kmaxv : Kmaxv * math.pow(math.sin(Xv / Tpv * (math.pi / 2)), Ev);
        let Fsv = math.sqrt((kv / (kv - 1)) * (math.pow(PRv, 2 / kv) - math.pow(PRv, ((kv + 1) / kv))));
        let Vselv = 12515 * Kdv * Av * P1v * Fsv / math.sqrt(Mv * (Tv + 273.15) * Zv);
        returnValues = { ...returnValues, P1v, P2v, PRv, Xv, Kdv, Fsv, Vselv };
    }
    return returnValues;
}

function FCWValidationTestKit20_PV(AsmeApiDataSet, valve, inputs, uoms) {
    const requiredUnits = {
        "absPressureUOM": "abspressure.psia",
        "pressureUOM": "pressure.psig",
        "temperatureUOM": "temp.degF",
        "flowCapacityUOM": "massflow.kghr"
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM
    }

    let returnValues = {};

    let A = Number(valve.A);
    let Tp = Number(valve.Tp);
    Tp = Tp / (100000 / 4.44822161526 / math.pow((3.28083989501312 * 12), 2));
    let E = Number(valve.E);
    let Kmax = Number(valve.Kmax);

    let Av = Number(valve.A);
    let Tpv = Number(valve.Tp);
    Tpv = Tpv / (100000 / 4.44822161526 / math.pow((3.28083989501312 * 12), 2));
    let Ev = Number(valve.E);
    let Kmaxv = Number(valve.Kmax);

    let M = Number(inputs.MolWeight);
    let k = Number(inputs.KCpByCv);
    let Z = Number(inputs.Compressibility);

    let Mv = Number(inputs.MolWeightVacuum);
    let kv = Number(inputs.KCpByCvVacuum);
    let Zv = Number(inputs.CompressibilityVacuum);

    let Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    let DeltaP = convertUnit(Number(inputs.DeltaPressure), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let DeltaPv = convertUnit(Number(inputs.DeltaPressureVacuum), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let T = convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM));
    let Tv = convertUnit(Number(inputs.RelievingforVacuum), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM));

    let P2p = Patm;
    let P1p = P2p + DeltaP;
    let PR = P2p / P1p;
    let Xp = DeltaP;
    let Kd = Xp >= Tp ? Kmax : Kmax * math.pow(math.sin(Xp / Tp * (math.pi / 2)), E);
    // =IF(I56>=I53,I55,Kmax*( math.sin( (Xp/Tp)*(math.pi/2) )^I54 ))
    let Fs = math.sqrt((k / (k - 1)) * (math.pow(PR, 2 / k) - math.pow(PR, ((k + 1) / k))));
    let Wsel = 560 * Kd * A * P1p * Fs * math.sqrt(M / (T + 273.15) / Z);
    //   560*Kd*A*P1p*Fs*math.sqrt(M/(273.15+T)/Z),3

    let P1v = Patm;
    let P2v = P1v - DeltaPv;
    let PRv = P2v / P1v;
    let Xv = DeltaPv;
    let Kdv = Xv >= Tpv ? Kmaxv : Kmaxv * math.pow(math.sin(Xv / Tpv * (math.pi / 2)), Ev);
    let Fsv = math.sqrt((kv / (kv - 1)) * (math.pow(PRv, 2 / kv) - math.pow(PRv, ((kv + 1) / kv))));
    let Wselv = 560 * Kd * Av * P1p * Fs * math.sqrt(Mv / (Tv + 273.15) / Zv);
    // 560*Kd*A*P1p*Fs*math.sqrt(M/(273.15+T)/Z)
    returnValues = { ...returnValues, P1p, P2p, PR, Xp, Kd, Fs, Wsel, P1v, P2v, PRv, Xv, Kdv, Fsv, Wselv };
    
    return returnValues;
}


function FCWValidationTestKit20(AsmeApiDataSet, valve, inputs, uoms) {
    const requiredUnits = {
        "absPressureUOM": "abspressure.bara",
        "pressureUOM": "pressure.barg",
        "temperatureUOM": "temp.degC",
        "flowCapacityUOM": "massflow.kghr"
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM
    }

    let returnValues = {
        P1p: null,
        P2p: null,
        PR: null,
        TPR: null,
        Xp: null,
        Kd: null,
        Fs: null,
        Wsel: null,
        P1v: null,
        P2v: null,
        PRv: null,
        Xv: null,
        Kdv: null,
        Fsv: null,
        Wsel: null
    };

    let A = Number(valve.A);
    let Tp = Number(valve.Tp);
    Tp = Tp / (100000 / 4.44822161526 / math.pow((3.28083989501312 * 12), 2));
    let E = Number(valve.E);
    let Kmax = Number(valve.Kmax);

    let Av = Number(valve.A);
    let Tpv = Number(valve.Tp);
    Tpv = Tpv / (100000 / 4.44822161526 / math.pow((3.28083989501312 * 12), 2));
    let Ev = Number(valve.E);
    let Kmaxv = Number(valve.Kmax);

    let M = Number(inputs.MolWeight);
    let k = Number(inputs.KCpByCv);
    let Z = Number(inputs.Compressibility);

    let Mv = Number(inputs.MolWeightVacuum);
    let kv = Number(inputs.KCpByCvVacuum);
    let Zv = Number(inputs.CompressibilityVacuum);
    let IsPressureOnly = inputs.IsPressureOnly;
    let IsVacuumOnly = inputs.IsVacuumOnly;
    let Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    let DeltaP = convertUnit(Number(inputs.DeltaPressure), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let DeltaPv = convertUnit(Number(inputs.DeltaPressureVacuum), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let T = convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM));
    let Tv = convertUnit(Number(inputs.RelievingforVacuum), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM));
    if (IsPressureOnly && valve.ValveFunction === "P") {
        let P2p = Patm;
        let P1p = P2p + DeltaP;
        let PR = P2p / P1p;
        let Xp = DeltaP;
        let Kd = Xp >= Tp ? Kmax : Kmax * math.pow(math.sin(Xp / Tp * (math.pi / 2)), E);
        let Fs = math.sqrt((k / (k - 1)) * (math.pow(PR, 2 / k) - math.pow(PR, ((k + 1) / k))));
        let Wsel = 560 * Kd * A * P1p * Fs * math.sqrt(M / (T + 273.15) / Z);
        // (560*F57*F51*F47*F58*SQRT(F11/(273.15+F18)/F13),3))
        returnValues = { ...returnValues, P1p, P2p, PR, Xp, Kd, Fs, Wsel };
    }
    else if (IsVacuumOnly && valve.ValveFunction === "V") {
        let P1v = Patm;
        let P2v = P1v - DeltaPv;
        let PRv = P2v / P1v;
        let Xv = DeltaPv;
        let Kdv = Xv >= Tpv ? Kmaxv : Kmaxv * math.pow(math.sin(Xv / Tpv * (math.pi / 2)), Ev);
        let Fsv = math.sqrt((kv / (kv - 1)) * (math.pow(PRv, 2 / kv) - math.pow(PRv, ((kv + 1) / kv))));
        let Wselv = 560 * Kdv * Av * P1v * Fsv * math.sqrt(Mv / (Tv + 273.15) / Zv);
        returnValues = { ...returnValues, P1v, P2v, PRv, Xv, Kdv, Fsv, Wselv };
    }
    return returnValues;
};

function FCWValidationTestKitISOG1(AsmeApiDataSet, valve, inputs, uoms) {
    const requiredUnits = {
        "absPressureUOM": "abspressure.bara",
        "pressureUOM": "pressure.barg",
        "temperatureUOM": "temp.degK",
        "flowCapacityUOM": "massflow.kghr",
        "orificeAreaUOM": "area.mm2",
        "specificvolumeUOM": "specificvolume.m3kg"
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
        "specificvolumeUOM": "specificvolume.ft3lb"
    }

    const k = Number(inputs?.KCpByCv ?? 1);
    const M = Number(inputs?.MolWeight);
    const Z = Number(inputs?.Compressibility);
    const Fd = Number(inputs?.RuptureDiscKcFd || 1);
    const T = convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    const Pset = convertUnit(Number(inputs.SetPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.SetPressure);
    const Pover = isNaN(Number(inputs.OverPressure)) ? 0 : convertUnit(Number(inputs.OverPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); // Number(inputs.OverPressure);
    const Psetp = (Pset + Pover) / 1.1;
    const Ploss = isNaN(Number(inputs.InletLoss)) ? 0 : convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    const Pbu = isNaN(Number(inputs.BuiltUp)) ? 0 : convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const Psic = isNaN(Number(inputs.ConstantSuperimposed)) ? 0 : convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    const Psiv = isNaN(Number(inputs.VariableSuperimposed)) ? 0 : convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    const Pback = isNaN(Number(inputs.TotalBackPressure)) ? 0 : convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    let Qreq = Number(inputs?.Wreq ? inputs?.Wreq : inputs?.Qreq ? inputs?.Qreq : inputs?.VlreqMass);
    Qreq = isNaN(Qreq) ? 0 : convertUnitDiffDims(Qreq, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);
    let Kmax = (AsmeApiDataSet === 'ASME') ? valve.Kmax : valve.KAPI;
    let Kd = Kmax;
    let K = 0.9 * Kd;
    let Asel = (AsmeApiDataSet === 'ASME') ? valve.A : valve.AAPI;
    Asel = convertUnit(Asel, uoms.find(u => u.UnitKey === "area.cm2"), uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM));
    let A = Asel;

    let C = 3.948 * math.pow((k * ((2 / (k + 1)) ** ((k + 1) / (k - 1)))), 0.5);
    let P1 = Pset + Pover - Ploss + Patm;
    let P2 = Patm + Pback;
    let Pu = Psic + Psiv + Patm;
    let PR = P2 / P1;
    let TPR = math.pow(2 / (k + 1), k / (k - 1));
    let AbsPR = ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR });
    let Equation2p5 = ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR });
    let Kb = KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }
    Kb = Number(Kb);
    let IsSystemCritical = PR <= TPR ? true : false;
    let Kb_ISO = IsSystemCritical ? 1 : (math.pow(((2 * k / (k - 1)) * ((math.pow(PR, (2 / k))) - (math.pow(PR, ((k + 1) / k))))), 0.5)) / (C / 3.948);
    let Kdr = (K * Kb) / Kb_ISO;
    let Qm = P1 * C * Asel * Kdr * Kb_ISO * Fd * math.pow((M / (Z * T)), 0.5);
    let QmActual = Qm / 0.9;
    let Areq = (Qreq / Qm) * Asel;
    let v1 = (0.08314 * T) / (P1 * M);

    const Cdtp= calculateCDTP(valve, inputs, uoms);
    // if (valve.ValveId == 595) {
    //     console.log("ValveId == 595=================", {Kb_Expression:inputs.Kb_Expression,
    //        requiredUnits, receivedUOM, k, M, Z, Fd, T, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback, Qreq, Kmax, Kd, K, Asel,
    //         C, P1, P2, PR, TPR, AbsPR, Equation2p5, Kb, IsSystemCritical,  Kb_ISO, Kdr, Qm, QmActual, Areq, v1,
    //     });
    // }
    const equationValues = {
        requiredUnits, receivedUOM, k, M, Z, Fd, T, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback,
        Qreq,CDTP:Cdtp, Kmax, Kd, K, Asel,A, C, P1, P2, Pu, PR, TPR, AbsPR, Equation2p5, Kb, IsSystemCritical, Kb_ISO, Kdr,
        Qm, QmActual, Areq, v1
    };

    let convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    let convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    let convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPover = convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPloss = convertUnit(Ploss, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPbu = convertUnit(Pbu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPsic = convertUnit(Psic, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPsiv = convertUnit(Psiv, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPback = convertUnit(Pback, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    let convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    let convertedPu = convertUnit(Pu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedv1 = convertUnit(v1, uoms.find(u => u.UnitKey === requiredUnits.specificvolumeUOM), uoms.find(u => u.UnitKey === receivedUOM.specificvolumeUOM));
    let convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    let convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    let convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    let convertedQreq = convertUnitDiffDims(Qreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    let convertedQm = convertUnitDiffDims(Qm, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    let convertedQmActual = convertUnitDiffDims(QmActual, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);

    const inputValues = {
        k, M, Z, Fd, Kmax, Kd, K, C, PR, TPR, AbsPR, Equation2p5, Kb, IsSystemCritical, Kb_ISO, Kdr, v1:convertedv1,
        T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover, Psetp: convertedPsetp, Ploss: convertedPloss,
        Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, P1: convertedP1, P2: convertedP2, Pu:convertedPu,
        Asel: convertedAsel, A:convertedA, Areq: convertedAreq, Qreq: convertedQreq, Qm: convertedQm, QmActual: convertedQmActual
    };

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    
    let specificvolumeUOM = uoms.find(u => u.UnitKey === requiredUnits.specificvolumeUOM).UnitName;
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, specificvolumeUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    
    specificvolumeUOM = uoms.find(u => u.UnitKey === receivedUOM.specificvolumeUOM).UnitName;
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, specificvolumeUOM };

    const ReResponse = JSON.stringify({ equationValues, inputValues, uomRequired, uomReceived });

    return {
        k, M, Z, Fd, Kmax, Kd, K, C, PR, TPR, AbsPR, Equation2p5, Kb, IsSystemCritical, Kb_ISO, Kdr, v1,
        T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover, Psetp: convertedPsetp, Ploss: convertedPloss,
        Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, P1: convertedP1, P2: convertedP2, Pu:convertedPu,
        Asel: convertedAsel,A:convertedA, Areq: convertedAreq, Qreq: convertedQreq, Qm: convertedQm, QmActual: convertedQmActual,
        ReResponse
    }
}

function FCWValidationTestKitISOL1(AsmeApiDataSet, valve, inputs, uoms) {
    const requiredUnits = {
        "absPressureUOM": "abspressure.bara",
        "pressureUOM": "pressure.barg",
        "temperatureUOM": "temp.degC",
        "flowCapacityUOM": "massflow.kghr",
        "viscosityUOM": "viscosity.Pas",
        "orificeAreaUOM": "area.mm2",
        "specificvolumeUOM": "specificvolume.m3kg"
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "viscosityUOM": inputs?.ViscosityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
        "specificvolumeUOM": "specificvolume.ft3lb"
    }

    let A = null, Fd = null, K = null, Kw = null, Mu = null, PA = null, PB = null, Qreq = null, SG = null; // Inputs
    let Amin = null, Areq = null, Kdr = null, Kv = null, Kv_m = 1, Kv_req = null, Qm = null, QmActual = null, R = null, Rm = null, v1 = null; // Outputs
    let bCondition9Met = true, bValidationFailed = false;

    // Grab decimal inputs
    Fd = Number(inputs?.RuptureDiscKcFd || 1);
    let Kmax = (AsmeApiDataSet === 'ASME') ? valve.Kmax : valve.KAPI;
    let Kd = Kmax;
    K = 0.9 * Kd;

    SG = Number(inputs?.SpGravity);

    // Grab Measure inputs

    A = AsmeApiDataSet === "ASME" ? valve.A : valve.AAPI;
    A = convertUnit(A, uoms.find(uom => uom.UnitKey === 'area.cm2'), uoms.find(uom => uom.UnitKey === requiredUnits.orificeAreaUOM));
    Mu = Number(inputs.Viscosity);
    // console.log(uoms.find(u => u.UnitKey === receivedUOM.viscosityUOM), uoms.find(u => u.UnitKey === requiredUnits.viscosityUOM));
    Mu = isNaN(Mu) ? 0 : convertUnitDiffDims(Mu, uoms.find(u => u.UnitKey === receivedUOM.viscosityUOM), uoms.find(u => u.UnitKey === requiredUnits.viscosityUOM), uoms, inputs);

    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    const Pset = convertUnit(Number(inputs.SetPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.SetPressure);
    const Pover = isNaN(Number(inputs.OverPressure)) ? 0 : convertUnit(Number(inputs.OverPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); // Number(inputs.OverPressure);
    const Psetp = (Pset + Pover) / 1.1;
    const Ploss = isNaN(Number(inputs.InletLoss)) ? 0 : convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    const Pbu = isNaN(Number(inputs.BuiltUp)) ? 0 : convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const Pback = isNaN(Number(inputs.TotalBackPressure)) ? 0 : convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const Psic = isNaN(Number(inputs.ConstantSuperimposed)) ? 0 : convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    const Psiv = isNaN(Number(inputs.VariableSuperimposed)) ? 0 : convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    const T = convertUnit(inputs?.Relieving, uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM))

    PA = Pset + Pover - Ploss;
    PB = Pback;
    Kw = KbKwValidateExpressions(inputs.Kw_Expression, { Pset, Pover, Psetp, Ploss, Patm, Pbu, Pback }, uoms, requiredUnits.pressureUOM);

    Qreq = Number(inputs?.Wreq ? inputs?.Wreq : inputs?.Qreq ? inputs?.Qreq : inputs?.VlreqMass);
    Qreq = isNaN(Qreq) ? 0 : convertUnitDiffDims(Qreq, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);


    // Step 1
    if (K !== null && Kw !== null) {
        Kdr = K * Kw;
    }

    // Step 3
    if (SG !== null) {
        v1 = 1 / (SG * 1000);
    }

    let isKv_m_updated = false;

    // Step 9 dictates that we go back to step 3 if its condition is met
    while (bCondition9Met) {
        if (!isKv_m_updated || !(Kv_m != null && (Kv_m == null || Kv_m <= 0.3))) {
            // Steps 4 and 5
            if (A !== null && Kv_m !== null && Kdr !== null && Fd !== null && v1 !== null && PA !== null && PB !== null) {
                Qm = 1.6 * A * Kv_m * Kdr * Fd / Math.sqrt(v1 / (PA - PB));
                QmActual = Qm / 0.9;
            }

            // Steps 6 and 7
            if (Qm !== null && Mu !== null && A !== null) {
                Rm = (Qm / (3.6 * Mu)) * Math.sqrt(4 / (Math.PI * A));
                if (Rm !== 0.0) {
                    Kv = Math.pow(0.9935 + (2.878 / Math.sqrt(Rm)) + (342.75 / Math.pow(Rm, 1.5)), -1);
                }
            }

            if (Kv !== null) {
                if (Kv >= 1.0) {
                    Kv = 1.0;
                }

                // Steps 8 and 9
                if (Kv_m > Kv) {
                    Kv_m = Kv;
                    isKv_m_updated = true;
                } else if (Kv_m <= Kv) {
                    bCondition9Met = false;
                }
            } else {
                // This is here to prevent an infinite loop.
                bCondition9Met = false;
                bValidationFailed = true;
            }
        } else {
            bCondition9Met = false;
            bValidationFailed = true;
        }
    }

    // Steps 10 through 12 (they share Kv_m <= Kv and each builds on the previous)
    if (!bValidationFailed && A !== null && Kv !== null && Qm !== null && Qreq !== null && Kv_m <= Kv) {
        Amin = A * Qreq / Qm;

        // Steps 11 through 13
        if (Mu !== null) {
            R = (Qreq / (3.6 * Mu)) * Math.sqrt(4 / (Math.PI * A));

            if (R !== 0.0) {
                Kv_req = Math.pow(0.9935 + (2.878 / Math.sqrt(R)) + (342.75 / Math.pow(R, 1.5)), -1);
            }

            if (Kv_req !== null) {
                if (Kv_req > 1.0) {
                    Kv_req = 1.0;
                }
                if (!(Kv_req != null && (Kv_req == null || Kv_req <= 0.3))) {
                    Areq = Amin * Kv / Kv_req;
                } else {
                    bValidationFailed = true;
                }
            }
        }
    }

    const Cdtp= calculateCDTP(valve, inputs, uoms);

    const equationValues = {
        requiredUnits, receivedUOM,
        Asel:A, A, Fd, CDTP:Cdtp, Kmax, Kd, K, Kw, Mu, PA, PB, Qreq, SG, Amin, Areq, Kdr, Kv, Kv_m, Kv_req, Qm, QmActual, R, Rm, v1,
        T, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback,
    }

    let convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    let convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    let convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPover = convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPloss = convertUnit(Ploss, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPbu = convertUnit(Pbu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPsic = convertUnit(Psic, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPsiv = convertUnit(Psiv, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPback = convertUnit(Pback, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPA = convertUnit(PA, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPB = convertUnit(PB, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    let convertedAmin = convertUnit(Amin, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    let convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    let convertedR = convertUnit(R, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM));
    let convertedRm = convertUnit(Rm, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM));
    let convertedv1 = convertUnit(v1, uoms.find(u => u.UnitKey === requiredUnits.specificvolumeUOM), uoms.find(u => u.UnitKey === receivedUOM.specificvolumeUOM));
    let convertedMu = isNaN(Mu) ? 0 : convertUnitDiffDims(Mu, uoms.find(u => u.UnitKey === requiredUnits.viscosityUOM), uoms.find(u => u.UnitKey === receivedUOM.viscosityUOM), uoms, inputs);
    let convertedQreq = convertUnitDiffDims(Qreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    let convertedQm = convertUnitDiffDims(Qm, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    let convertedQmActual = convertUnitDiffDims(QmActual, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);

    const inputValues = {
        A, Fd, Kmax, Kd, K, Kw, Mu: convertedMu, PA, PB, Qreq, SG, Amin, Areq, Kdr, Kv, Kv_m, Kv_req, Qm, QmActual, R, Rm, v1,
        T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover, Psetp: convertedPsetp, Ploss: convertedPloss,
        Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, PA: convertedPA, PB: convertedPB,
        A: convertedA, Asel:convertedA, Amin: convertedAmin, Areq: convertedAreq, Qreq: convertedQreq, Qm: convertedQm, QmActual: convertedQmActual,
        R: convertedR, Rm: convertedRm, v1: convertedv1
    };

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    
    let viscosityUOM = uoms.find(u => u.UnitKey === requiredUnits.viscosityUOM).UnitName;
    let specificvolumeUOM = uoms.find(u => u.UnitKey === requiredUnits.specificvolumeUOM).UnitName;
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, viscosityUOM, specificvolumeUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    
    viscosityUOM = uoms.find(u => u.UnitKey === receivedUOM.viscosityUOM).UnitName;
    specificvolumeUOM = uoms.find(u => u.UnitKey === receivedUOM.specificvolumeUOM).UnitName;
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, viscosityUOM, specificvolumeUOM };

    const ReResponse = JSON.stringify({ equationValues, inputValues, uomRequired, uomReceived });

    return {
        A, Fd, Kmax, Kd, K, Kw, Mu: convertedMu, PA, PB, Qreq, SG, Amin, Areq, Kdr, Kv, Kv_m, Kv_req, Qm, QmActual, R, Rm, v1,
        T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover, Psetp: convertedPsetp, Ploss: convertedPloss,
        Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, PA: convertedPA, PB: convertedPB,
        A: convertedA, Amin: convertedAmin, Areq: convertedAreq, Qreq: convertedQreq, Qm: convertedQm, QmActual: convertedQmActual,
        R: convertedR, Rm: convertedRm, v1: convertedv1,
        ReResponse
    }
}

function FCWValidationTestKitISOS1(AsmeApiDataSet, valve, inputs, uoms) {
    const requiredUnits = {
        "absPressureUOM": "abspressure.bara",
        "pressureUOM": "pressure.barg",
        "temperatureUOM": "temp.degK",
        "flowCapacityUOM": "massflow.kghr",
        "orificeAreaUOM": "area.mm2",
        "specificvolumeUOM": "specificvolume.m3kg"
    }
    const receivedUOM = {
        "absPressureUOM": inputs?.AtmPressureUOM,
        "pressureUOM": inputs?.PressureUOM,
        "temperatureUOM": inputs?.TemperatureUOM,
        "flowCapacityUOM": inputs?.FlowCapacityUOM,
        "orificeAreaUOM": inputs?.OrificeAreaUOM,
        "specificvolumeUOM": "specificvolume.ft3lb"
    }
    const SteamCondition = inputs?.SteamCondition;
    let Ks = inputs?.Ks;
    const xs = !inputs?.IsSaturatedSteam && !inputs?.IsWetSteam ? 1 : Number(inputs?.DrynessFactor);
    const k = Number(inputs?.IsentropicExponent);
    const Fd = Number(inputs?.RuptureDiscKcFd || 1);
    const T = convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM)); //Number(inputs.Relieving); //Require Conversion
    const Patm = convertUnit(Number(inputs.AtmPressure), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM), uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM)); //Number(inputs.AtmPressure);
    const Pset = convertUnit(Number(inputs.SetPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.SetPressure);
    const Pover = isNaN(Number(inputs.OverPressure)) ? 0 : convertUnit(Number(inputs.OverPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); // Number(inputs.OverPressure);
    const Psetp = (Pset + Pover) / 1.1;
    const Ploss = isNaN(Number(inputs.InletLoss)) ? 0 : convertUnit(Number(inputs.InletLoss), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.InletLoss);
    const Pbu = isNaN(Number(inputs.BuiltUp)) ? 0 : convertUnit(Number(inputs.BuiltUp), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    const Psic = isNaN(Number(inputs.ConstantSuperimposed)) ? 0 : convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.ConstantSuperimposed);
    const Psiv = isNaN(Number(inputs.VariableSuperimposed)) ? 0 : convertUnit(Number(inputs.VariableSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM)); //Number(inputs.VariableSuperimposed);
    const Pback = isNaN(Number(inputs.TotalBackPressure)) ? 0 : convertUnit(Number(inputs.TotalBackPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));//Number(inputs.TotalBackPressure);
    let Qreq = Number(inputs?.Wreq ? inputs?.Wreq : inputs?.Qreq ? inputs?.Qreq : inputs?.VlreqMass);
    Qreq = isNaN(Qreq) ? 0 : convertUnitDiffDims(Qreq, uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms, inputs);

    let Kmax = (AsmeApiDataSet === 'ASME') ? valve.Kmax : valve.KAPI;
    let Kd = Kmax;
    let K = 0.9 * Kmax;

    let Asel = (AsmeApiDataSet === 'ASME') ? valve.A : valve.AAPI;
    Asel = convertUnit(Asel, uoms.find(uom => uom.UnitKey === 'area.cm2'), uoms.find(uom => uom.UnitKey === requiredUnits.orificeAreaUOM))
    let A = Asel;

    let C = 3.948 * math.sqrt(k * math.pow(2 / (k + 1), (k + 1) / (k - 1)));
    let P1 = Pset + Pover - Ploss + Patm;
    let P2 = Patm + Pback;
    let Pu = Psic + Psiv + Patm;
    let PR = P2 / P1;
    let TPR = math.pow(2 / (k + 1), k / (k - 1));
    let AbsPR = ValidateExpression(inputs.AbsPR_AbsPressureRatio, { PR });
    let Equation2p5 = ValidateExpression(inputs.Equation2p5_Expression, { C, k, AbsPR });
    let Kb = KbKwValidateExpressions(inputs.Kb_Expression, { Equation2p5, TPR, AbsPR, Patm, Pset, Pover, Psetp, Ploss, Pbu, Psic, Psiv, Pback }, uoms, requiredUnits.pressureUOM);
    
    if(isNaN(Kb) || Kb < 0) {
        Kb = 0;
    }
    Kb = Number(Kb);

    let IsSystemCritical = PR > TPR;
    let Kb_ISO = isNaN(C) ? 1 : !IsSystemCritical ? 1 : (Math.pow(((2 * k / (k - 1)) * ((Math.pow(PR, (2 / k))) - (Math.pow(PR, ((k + 1) / k))))), 0.5)) / (C / 3.948);
    let Kdr = (K * Kb) / Kb_ISO;
    let Qm = (Asel * Kdr * Kb_ISO * Fd * P1) / (Ks * Math.pow(xs, 0.5));
    let QmActual = Qm / 0.9;
    let Areq = (Qreq / Qm) * Asel;
    let v1 = isNaN(C) ? 0 : Math.pow((0.2883 * C * Ks), 2) / P1;
    
    const Cdtp= calculateCDTP(valve, inputs, uoms);

    // if (valve.ValveId == 914) {
    //     console.log("ValveId == 914=================", {
    //         requiredUnits, receivedUOM,
    //         Ks, xs, k, Fd, T, Patm, Pset, Pover, Ploss, Pbu, Psic, Psiv, Pback, Qreq, Kmax, Kd, K, Kb, Asel, C, P1, P2, PR, TPR,
    //         AbsPR, Equation2p5, Kb, IsSystemCritical, Kb_ISO, Kdr, Qm, QmActual, Areq, v1
    //     });
    // }
    const equationValues = {
        requiredUnits, receivedUOM,CDTP:Cdtp,
        Ks, xs, k, Fd, T, Patm, Pset, Pover, Ploss, Pbu, Psic, Psiv, Pback, Qreq, Kmax, Kd, K, Kb, Asel, A, C, P1, P2, Pu, PR, TPR,
        AbsPR, Equation2p5, Kb, IsSystemCritical, Kb_ISO, Kdr, Qm, QmActual, Areq, v1
    }

    let convertedT = convertUnit(T, uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM));
    let convertedPatm = convertUnit(Patm, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    let convertedPset = convertUnit(Pset, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPover = convertUnit(Pover, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPsetp = convertUnit(Psetp, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPloss = convertUnit(Ploss, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPbu = convertUnit(Pbu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPsic = convertUnit(Psic, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPsiv = convertUnit(Psiv, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedPback = convertUnit(Pback, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedP1 = convertUnit(P1, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    let convertedP2 = convertUnit(P2, uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM), uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM));
    let convertedPu = convertUnit(Pu, uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM));
    let convertedAsel = convertUnit(Asel, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    let convertedA = convertUnit(A, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    let convertedAreq = convertUnit(Areq, uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM), uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM));
    let convertedQreq = convertUnitDiffDims(Qreq, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    let convertedQm = convertUnitDiffDims(Qm, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    let convertedQmActual = convertUnitDiffDims(QmActual, uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM), uoms, inputs);
    let convertedv1 = convertUnit(v1, uoms.find(u => u.UnitKey === requiredUnits.specificvolumeUOM), uoms.find(u => u.UnitKey === receivedUOM.specificvolumeUOM));


    const inputValues = {
        Ks, xs, k, Fd, Kmax, Kd, K, C, PR, TPR, AbsPR, Equation2p5, Kb, IsSystemCritical, Kb_ISO, Kdr, v1:convertedv1,
        T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover, Psetp: convertedPsetp, Ploss: convertedPloss,
        Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, P1: convertedP1, P2: convertedP2, Pu:convertedPu,
        Asel: convertedAsel, A:convertedA, Areq: convertedAreq, Qreq: convertedQreq, Qm: convertedQm, QmActual: convertedQmActual
    };

    let temperatureUOM = uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM).UnitName;
    let absPressureUOM = uoms.find(u => u.UnitKey === requiredUnits.absPressureUOM).UnitName;
    let pressureUOM = uoms.find(u => u.UnitKey === requiredUnits.pressureUOM).UnitName;
    let flowCapacityUOM = uoms.find(u => u.UnitKey === requiredUnits.flowCapacityUOM).UnitName;
    let orificeAreaUOM = uoms.find(u => u.UnitKey === requiredUnits.orificeAreaUOM).UnitName;
    
    let specificvolumeUOM = uoms.find(u => u.UnitKey === requiredUnits.specificvolumeUOM).UnitName;
    const uomRequired = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, specificvolumeUOM };

    temperatureUOM = uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM).UnitName;
    absPressureUOM = uoms.find(u => u.UnitKey === receivedUOM.absPressureUOM).UnitName;
    pressureUOM = uoms.find(u => u.UnitKey === receivedUOM.pressureUOM).UnitName;
    flowCapacityUOM = uoms.find(u => u.UnitKey === receivedUOM.flowCapacityUOM).UnitName;
    orificeAreaUOM = uoms.find(u => u.UnitKey === receivedUOM.orificeAreaUOM).UnitName;
    
    specificvolumeUOM = uoms.find(u => u.UnitKey === receivedUOM.specificvolumeUOM).UnitName;
    const uomReceived = { temperatureUOM, absPressureUOM, pressureUOM, flowCapacityUOM, orificeAreaUOM, specificvolumeUOM };

    const ReResponse = JSON.stringify({ equationValues, inputValues, uomRequired, uomReceived });

    return {
        Ks, xs, k, Fd, Kmax, Kd, K, C, PR, TPR, AbsPR, Equation2p5, Kb, IsSystemCritical, Kb_ISO, Kdr, v1,
        T: convertedT, Patm: convertedPatm, Pset: convertedPset, Pover: convertedPover, Psetp: convertedPsetp, Ploss: convertedPloss,
        Pbu: convertedPbu, Psic: convertedPsic, Psiv: convertedPsiv, Pback: convertedPback, P1: convertedP1, P2: convertedP2, Pu:convertedPu,
        Asel: convertedAsel, A:convertedA,  Areq: convertedAreq, Qreq: convertedQreq, Qm: convertedQm, QmActual: convertedQmActual,
        ReResponse
    }
}

Object.assign(calculations, {
    FCWVTK_WF26,
    // FCWVTK_0105066970_0207087374_MVSVCC,
    FCWVTK_0105066970_0207087374,
    FCWVTK_0309107172_0411127576,

    FCWVTK_API2000,

    FCWVTK_13157778_14167980,
    FCWVTK_3586889293_3687899495,
    
    FCWValidationTestKitISOG1,
    FCWValidationTestKitISOL1,
    FCWValidationTestKitISOS1,

    FCWVTK_8182838485,

    FCWVTK_FreeVent,
    FCWVTK_FlameArrester,
    
    FCWVTK_WF13,
    FCWVTK_WF14,
    FCWVTK_WF15,
    FCWVTK_WF16,
    FCWVTK_WF17,
    FCWVTK_WF18,
    FCWVTK_WF19,
    FCWVTK_WF20,
    FCWVTK_WF21,
    // FCWValidationTestKit37535465_PV,
    // FCWValidationTestKit37535465,
    // FCWValidationTestKit38575867_PV,
    // FCWValidationTestKit38575867,
    // FCWValidationTestKit39555666_PV,
    // FCWValidationTestKit39555666,
    // FCWValidationTestKit40596068_PV,
    // FCWValidationTestKit40596068,
    
});

module.exports = { calculations }