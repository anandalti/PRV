import * as Math from 'mathjs';
import { convertUnit } from './convertUnit';
import VentingTable from './EmergencyVentingReqTable.json';

export const calculateReqFlowValue=(VentingTable,Awet,CalcMethod)=>{
    
    let PPL_Obj;
    let PPU_Obj;
    let AwetExactValueFlag=false;

    VentingTable.sort((a, b) => a.Awet - b.Awet);
    // console.log('In use PopupPanel::: VentingTable>>>',JSON.stringify(VentingTable));
    for (let index = 0; index < VentingTable?.length - 1; index++) {
        if(VentingTable[index].Method === CalcMethod){
            if(VentingTable[index].Awet==Awet){
                AwetExactValueFlag=true;
                PPL_Obj = VentingTable[index];
                break;
            }else if (VentingTable[index].Awet < Awet && VentingTable[index+1].Awet > Awet) {
                
                PPL_Obj = VentingTable[index];
                PPU_Obj = VentingTable[index+1];
                break;
            }
        }
    }

    // console.log('In use PopupPanel::: VentingTable :: PPL_Obj>>>',AwetExactValueFlag,JSON.stringify(PPL_Obj),JSON.stringify(PPU_Obj),(PPL_Obj!==undefined && PPU_Obj!==undefined) || (AwetExactValueFlag && PPL_Obj!==undefined),(PPL_Obj!==undefined && PPU_Obj!==undefined) , (AwetExactValueFlag && PPL_Obj!==undefined));

    if((PPL_Obj!==undefined && PPU_Obj!==undefined) || (AwetExactValueFlag && PPL_Obj!==undefined)){
        // console.log('In use PopupPanel::: VentingTable :: AwetExactValueFlag>>>',AwetExactValueFlag,JSON.stringify(PPL_Obj),JSON.stringify(PPU_Obj));
        if(AwetExactValueFlag){
            // console.log('In use PopupPanel::: VentingTable :: AwetExactValueFlag 2222>>>',AwetExactValueFlag,JSON.stringify(PPL_Obj),JSON.stringify(PPU_Obj));
            return PPL_Obj.Venting;
        }else{
            // console.log('In use PopupPanel::: VentingTable :: Awet_IN>>>',Awet,JSON.stringify(PPL_Obj),JSON.stringify(PPU_Obj));
            let UBF = PPU_Obj.Awet;
            let LBF = PPL_Obj.Awet;
            let LBA = PPL_Obj.Venting;
            let UBA = PPU_Obj.Venting;
            const venting_Value=(Awet - UBF) / (LBF - UBF) * (LBA - UBA) + UBA;
            // console.log('In use PopupPanel::: VentingTable :: venting_Value>>>',venting_Value);
            return venting_Value;
        }
    }
    return "";
}

export const CalculateRequiredFlow = (config) => {
    // console.log(config, 'Calculate RequiredFlow >>>> config')
    let reqFlowPress;
    let reqFlowVac;
    let tcResponse={}
    let equationValues={};
    let inputValues={};
    let equations={};
    let requiredUnits={};
    let receivedUnits={};
    let CalcFlag=true;
    const UOMs=config.units;
    const payload = config.payloadData;
    const isPressureOnly=payload['IsPressureOnly'];
    const isVacuumOnly=payload['IsVacuumOnly'];
    const SizingBassis = config.reqFields["SizingBassis"];
    const IsFlashingLiquid = config.reqFields['IsFlashingLiquid'];
    const FlashingLiquid = IsFlashingLiquid?config.reqFields["FlashingLiquid"]:0;
    const RegulatorFailure = config.reqFields["RegulatorFailure"];
    const Other = config.reqFields["Other"];
    const CalculationMethod = config.reqFields["CalculationMethod"];
    const RequiredCapacityMethod = config.reqFields["RequiredCapacityMethod"];
    let EnvironmentalFactor = config.reqFields['EnvironmentalFactor'];
    EnvironmentalFactor=isNaN(Number(EnvironmentalFactor))?'':Number(EnvironmentalFactor);
    equationValues['EnvironmentalFactor']=EnvironmentalFactor;
    inputValues['EnvironmentalFactor']=config.reqFields['EnvironmentalFactor'];
    CalcFlag=EnvironmentalFactor===''?false:EnvironmentalFactor>1?false:true;
    let PressureUOM = payload['PressureUOM'];
    PressureUOM=UOMs['pressure'].find(u => u.UnitKey===PressureUOM);
    let WettedAreaUOM = config.reqFields['WettedAreaUOM'];
    const IsSimpleEmergencyFlowRateCalc = config.reqFields['IsSimpleEmergencyFlowRateCalc'];


    let MolWtVapor = IsSimpleEmergencyFlowRateCalc==true?payload['MolWeight']:config.reqFields['MolWtVapor'];
    MolWtVapor=isNaN(Number(MolWtVapor))?'':Number(MolWtVapor);
    equationValues['MolWtVapor']=MolWtVapor;
    inputValues['MolWtVapor']=MolWtVapor;
    CalcFlag=MolWtVapor===''?false:MolWtVapor<=0?false:true;    

    let TemperatureUOM = payload['TemperatureUOM'];
    TemperatureUOM=UOMs['temperature'].find(u => u.UnitKey===TemperatureUOM);
    const LatentHeatUOM = config.reqFields['LatentHeatOfVaporizationUOM'];
    
    let reqLatentHeatOfVaporization = (CalculationMethod === "Metric") ? "latentheat.Jkg": "latentheat.BTUlb";
    reqLatentHeatOfVaporization=UOMs['latentheat'].find(u => u.UnitKey===reqLatentHeatOfVaporization);
    const reqTemperatureUOM = (CalculationMethod === "Metric") ? config.requiredUnits['TemperatureUOMMet']: config.requiredUnits['TemperatureUOMEng'];
    
    let reqPressureUOM = (CalculationMethod === "Metric") ? 'pressure.barg': 'pressure.psig';
    requiredUnits['PressureUOM']=reqPressureUOM;
    reqPressureUOM = UOMs['pressure'].find(u => u.UnitKey===reqPressureUOM);
    const reqFlowCapacityUOM = (CalculationMethod === "Metric") ? config.requiredUnits['FlowCapacityUOMMet']: config.requiredUnits['FlowCapacityUOMEng'];
    requiredUnits['FlowCapacityUOM']=reqFlowCapacityUOM;
    //const FlowCapacityUOM = config.requiredUnits["FlowCapacityUOM"];
    //const AreaUOM = config.requiredUnits['AreaUOM'];
    WettedAreaUOM=payload['AreaUOM'];
    WettedAreaUOM=UOMs['area'].find(u => u.UnitKey===WettedAreaUOM);

    let RequiredFlowUOM = payload['FlowCapacityUOM'];
    const dim=RequiredFlowUOM.split('.')[0];
    RequiredFlowUOM=UOMs[dim].find(u => u.UnitKey===RequiredFlowUOM);
    receivedUnits['FlowCapacityUOM']=RequiredFlowUOM;
    

    const reqAreaUOM =  (CalculationMethod === "Metric") ? config.requiredUnits['AreaUOMMet']: config.requiredUnits['AreaUOMEng'];
    // console.log(`In use PopupPanel::: RequiredCapacityMethod:: ${RequiredCapacityMethod} >>>>> reqAreaUOM:: ${reqAreaUOM?.UnitKey}`);
    if (RequiredCapacityMethod !== "Normal") {
        let SystemMAWP=config.reqFields['SystemMAWP'];
        SystemMAWP=SystemMAWP===undefined|| SystemMAWP===null || isNaN(SystemMAWP)?'':SystemMAWP;
        
        let WettedArea=config.reqFields['WettedArea'];
        WettedArea=WettedArea===undefined|| WettedArea===null || isNaN(WettedArea)?'':WettedArea;
       
        let LatentHeatOfVaporization=config.reqFields['LatentHeatOfVaporization'];
        LatentHeatOfVaporization=LatentHeatOfVaporization===undefined|| LatentHeatOfVaporization===null || isNaN(LatentHeatOfVaporization)?'':LatentHeatOfVaporization;
        let RelievingTemp=config.reqFields['Relieving'];
        RelievingTemp=RelievingTemp===undefined|| RelievingTemp===null || isNaN(RelievingTemp)?'':RelievingTemp;

        if(SystemMAWP==='' || WettedArea==='' || (LatentHeatOfVaporization==='' && !IsSimpleEmergencyFlowRateCalc) || (RelievingTemp==='' && !IsSimpleEmergencyFlowRateCalc)){
            // console.log(`In use PopupPanel::: >>>> SystemMAWP:: ${SystemMAWP} >>> WettedArea:: ${WettedArea} >>> LatentHeatOfVaporization:: ${LatentHeatOfVaporization} >>> RelievingTemp:: ${RelievingTemp}`);
            CalcFlag=false;
        }
        // console.log(`In use PopupPanel::: 11111111111 IsSimpleEmergencyFlowRateCalc:: ${IsSimpleEmergencyFlowRateCalc} >>>>> SystemMAWP:: ${config.reqFields['SystemMAWP']} >>> PressureUOM:: ${PressureUOM?.UnitKey}>>> reqPressureUOM:: ${reqPressureUOM?.UnitKey}`);
        
        if(CalcFlag){
            SystemMAWP = PressureUOM !== "" && PressureUOM !== undefined ? convertUnit(SystemMAWP, PressureUOM, reqPressureUOM) : "";
            equationValues['SystemMAWP']=SystemMAWP;
            inputValues['SystemMAWP']=config.reqFields['SystemMAWP'];
            receivedUnits['SystemMAWP']=PressureUOM;
            requiredUnits['SystemMAWP']=reqPressureUOM;
            // console.log(`In use PopupPanel::: 2222222222222222 IsSimpleEmergencyFlowRateCalc == true:: ${IsSimpleEmergencyFlowRateCalc == true} >>>>> WettedArea:: ${config.reqFields['WettedArea']} >>> WettedAreaUOM:: ${WettedAreaUOM?.UnitKey}>>> reqAreaUOM:: ${reqAreaUOM?.UnitKey}`);
            WettedArea = WettedAreaUOM !== "" && WettedAreaUOM !== undefined ? Number(convertUnit(WettedArea, WettedAreaUOM, reqAreaUOM)) : "";
            equationValues['WettedArea']=WettedArea;
            inputValues['WettedArea']=config.reqFields['WettedArea'];
            receivedUnits['WettedArea']=WettedAreaUOM;
            requiredUnits['WettedArea']=reqAreaUOM;
            if(IsSimpleEmergencyFlowRateCalc == true){
                // console.log(`In use PopupPanel::: 22222222 33333 IsSimpleEmergencyFlowRateCalc == true:: ${IsSimpleEmergencyFlowRateCalc == true} >>>>> WettedArea:: ${WettedArea} >>> CalculationMethod:: ${CalculationMethod}>>> CalculationMethod === "Metric":: ${CalculationMethod === "Metric"}`);
                if(CalculationMethod === "Metric"){
                    const N9 = 208.2;
                    if(WettedArea<260 && SystemMAWP <= 1.034){
                        const Awet_IN = WettedArea;
                        const {lower, upper} = findUpperAndLower(VentingTable, Awet_IN, CalculationMethod);
                        let UBF = upper.Venting;
                        let LBF = lower.Venting;
                        let LBA = lower.Awet;
                        let UBA = upper.Awet;
                        reqFlowPress = (Awet_IN - UBF) / (LBF - UBF) * (LBA - UBA) + UBA;
                        equations['reqFlowPress']=`V,em = Table Lookup (Awet)`;
                    }else if(WettedArea>=260 && SystemMAWP < 0.07){
                        reqFlowPress=19910;
                        equations['reqFlowPress']=`V,em = 19910`;
                    }else if(WettedArea>=260 && (SystemMAWP > 0.07 && SystemMAWP < 1.034)){
                        reqFlowPress = N9*EnvironmentalFactor*Math.pow(WettedArea,0.82);
                        equations['reqFlowPress']=`V,em = ${N9} * F * (Awet)^0.82`;
                    }
                }else{
                    const N9 = 1107;
                    // console.log(`In use PopupPanel::: 3333333333 reqFlowPress:: VentingTable :: WettedArea ::  ${WettedArea}  >>> CalculationMethod:: ${CalculationMethod}>>> ettedArea<2800 && SystemMAWP <= 15: ${WettedArea<2800 && SystemMAWP <= 15}`);
                    if(WettedArea<2800 && SystemMAWP <= 15){
                        reqFlowPress=calculateReqFlowValue(VentingTable,WettedArea, CalculationMethod);
                        equations['reqFlowPress']=`V,em = Table Lookup (Awet)`;
                        // console.log(`In use PopupPanel::: 444444 reqFlowPress:: VentingTable :: WettedArea ::  ${WettedArea}  >>> CalculationMethod:: ${CalculationMethod}>>> reqFlowPress:: ${reqFlowPress}`);
                    }else if(WettedArea>=2800 && SystemMAWP <= 1){
                        reqFlowPress=742000;
                        equations['reqFlowPress']=`V,em = 742000`;
                    }else if(WettedArea>=2800 && (SystemMAWP > 1 && SystemMAWP < 15)){
                        reqFlowPress = N9*EnvironmentalFactor*Math.pow(WettedArea,0.82);
                        equations['reqFlowPress']=`V,em = ${N9} * F * (Awet)^0.82`;
                    }
                }
            }else{
                // console.log(`In use PopupPanel::: 5555555 LatentHeatOfVaporization:: ${config.reqFields['LatentHeatOfVaporization']}  >>> LatentHeatUOM:: ${LatentHeatUOM?.UnitKey}>>> reqLatentHeatOfVaporization:: ${reqLatentHeatOfVaporization?.UnitKey}`);
                LatentHeatOfVaporization = LatentHeatUOM !== "" && LatentHeatUOM !== undefined ? convertUnit(config.reqFields['LatentHeatOfVaporization'], LatentHeatUOM, reqLatentHeatOfVaporization) : "";
                equationValues['LatentHeatOfVaporization']=LatentHeatOfVaporization;
                inputValues['LatentHeatOfVaporization']=config.reqFields['LatentHeatOfVaporization'];
                receivedUnits['LatentHeatOfVaporization']=LatentHeatUOM;
                requiredUnits['LatentHeatOfVaporization']=reqLatentHeatOfVaporization;
                // console.log(`In use PopupPanel::: 666666 RelievingTemp:: ${config.reqFields['Relieving']}  >>> LatentHeatUOM:: ${TemperatureUOM?.UnitKey}>>> reqTemperatureUOM:: ${reqTemperatureUOM?.UnitKey}`);
                RelievingTemp = TemperatureUOM !== "" && TemperatureUOM !== undefined ? convertUnit(config.reqFields['Relieving'], TemperatureUOM, reqTemperatureUOM) : "";
                equationValues['RelievingTemp']=RelievingTemp;
                inputValues['RelievingTemp']=config.reqFields['Relieving'];
                receivedUnits['RelievingTemp']=TemperatureUOM;
                requiredUnits['RelievingTemp']=reqTemperatureUOM;
                // console.log(`In use PopupPanel::: 222222 CalculationMethod::${CalculationMethod} >>>> WettedArea:: ${WettedArea} >>>>> SystemMAWP:: ${SystemMAWP} >>>> RelievingTemp:: ${RelievingTemp} >>>> MolWtVapor:: ${MolWtVapor}`);
                let Q; //heat input from fire exposure
                
                if(CalculationMethod === "Metric"){
                    if(WettedArea<18.6 && SystemMAWP <= 1.034){
                        Q = 63150*WettedArea;
                        equations['Q']=`Q = 63150 * Awet`;
                    }else if(WettedArea>=18.6 && WettedArea<93 && SystemMAWP <= 1.034){
                        Q = 224200*Math.pow(WettedArea,0.566);
                        equations['Q']=`Q = 224200 * (Awet)^0.566`;
                    }else if(WettedArea>=93 && WettedArea<260 && SystemMAWP <= 1.034){
                        Q = 630400*Math.pow(WettedArea,0.338);
                        equations['Q']=`Q = 630400 * (Awet)^0.338`;
                    }else if(WettedArea>=260 && SystemMAWP > 0.07 && SystemMAWP < 1.034){
                        Q = 43200*Math.pow(WettedArea,0.82);
                        equations['Q']=`Q = 43200 * (Awet)^0.82`;
                    }else if(WettedArea>=260 && SystemMAWP <= 0.07){
                        Q = 4129700;
                        equations['Q']=`Q = 4129700`;
                    }
                }else{
                    if(WettedArea<200 && SystemMAWP <= 15){
                        Q = 20000*WettedArea;
                        equations['Q']=`Q = 20000 * Awet`;
                    }else if(WettedArea>=200 && WettedArea<1000 && SystemMAWP <= 15){
                        Q = 199300*Math.pow(WettedArea,0.566);
                        equations['Q']=`Q = 199300 * (Awet)^0.566`;
                    }else if(WettedArea>=1000 && WettedArea<2800 && SystemMAWP <= 15){
                        Q = 963400*Math.pow(WettedArea,0.338);
                        equations['Q']=`Q = 963400 * (Awet)^0.338`;
                    }else if(WettedArea>=2800 && SystemMAWP > 1 && SystemMAWP < 15){
                        Q = 21000*Math.pow(WettedArea,0.82);
                        equations['Q']=`Q = 21000 * (Awet)^0.82`;
                    }else if(WettedArea>=2800 && SystemMAWP <= 1){
                        Q = 14090000;
                        equations['Q']=`Q = 14090000`;
                    }
                }
                equationValues['Q']=Q;
                let N10=CalculationMethod === "Metric"?906.6:3.091; // Constant for emergency venting
                // console.log(`In use PopupPanel::: 222222 reqFlowPress::${reqFlowPress} >>>> Q:: ${Q} >>>>> EnvironmentalFactor:: ${EnvironmentalFactor} >>> LatentHeatOfVaporization::: ${LatentHeatOfVaporization} >>>> RelievingTemp:: ${RelievingTemp} >>>> MolWtVapor:: ${MolWtVapor} >>> N10*Number(Q)*Number(EnvironmentalFactor) :: ${N10*Number(Q)*Number(EnvironmentalFactor)} >>>>>>>>>>. ((N10*Number(Q)*Number(EnvironmentalFactor))/Number(LatentHeatOfVaporization)) ::: ${((N10*Number(Q)*Number(EnvironmentalFactor))/Number(LatentHeatOfVaporization))} >>>>> Math.sqrt(Number(RelievingTemp)/Number(MolWtVapor))::: ${Math.sqrt(Number(RelievingTemp)/Number(MolWtVapor))} >>>>>> final :: ${((N10*Number(Q)*Number(EnvironmentalFactor))/Number(LatentHeatOfVaporization))*(Math.sqrt(Number(RelievingTemp)/Number(MolWtVapor)))}`);
                reqFlowPress = ((N10*Number(Q)*Number(EnvironmentalFactor))/Number(LatentHeatOfVaporization))*(Math.sqrt(Number(RelievingTemp)/Number(MolWtVapor)));
                equations['reqFlowPress']=`V,em = ${N10} * Q * F / Hvap * (T / M, Vapor)^0.5`;
                // equations['reqFlowPress']=`((N10*Q*EnvironmentalFactor)/LatentHeatOfVaporization)*((RelievingTemp/MolWtVapor)^0.5)`;
                
            }
        }else{
            reqFlowPress='';

        }
    }

    if (reqFlowPress === "" || isNaN(reqFlowPress) || !isPressureOnly) {
        reqFlowPress = '';
    } else {
        // console.log(`In use PopupPanel::: RequiredCapacityMethod:: ${reqFlowPress} >>>>> reqFlowPress:: ${reqFlowPress} >> reqFlowCapacityUOM::: ${reqFlowCapacityUOM?.UnitKey} >>>>> RequiredFlowUOM::: ${RequiredFlowUOM?.UnitKey}`);
        reqFlowPress = convertUnit(reqFlowPress, reqFlowCapacityUOM, RequiredFlowUOM);
        

    }

    let AdditionalCapacityPressure;

    if(reqFlowPress!==''){
        let ProductMovementPressure =config.reqFields['ProductMovementPressure']; //RequiredFlowUOM !== "" && RequiredFlowUOM !== undefined ? convertUnit(config.reqFields['ProductMovementPressure'], RequiredFlowUOM, reqFlowCapacityUOM) : "";
        ProductMovementPressure=ProductMovementPressure===undefined|| ProductMovementPressure===null || isNaN(ProductMovementPressure)?0:ProductMovementPressure;
        
        let ThermalPressure =config.reqFields['ThermalPressure']; //RequiredFlowUOM !== "" && RequiredFlowUOM !== undefined ? convertUnit(config.reqFields['ThermalPressure'], RequiredFlowUOM, reqFlowCapacityUOM) : "";
        ThermalPressure=ThermalPressure===undefined|| ThermalPressure===null || isNaN(ThermalPressure)?0:ThermalPressure;
                
        
        // console.log(`In use PopupPanel::: RequiredCapacityMethod:: ${RequiredCapacityMethod} >>>>> SizingBassis:: ${SizingBassis}`);
        if(RequiredCapacityMethod === 'Normal' && SizingBassis === 'sev_Ed_Main'){
            equationValues['FlashingLiquid']=convertUnit(FlashingLiquid,RequiredFlowUOM, reqFlowCapacityUOM );
            equationValues['RegulatorFailure']=convertUnit(RegulatorFailure,RequiredFlowUOM, reqFlowCapacityUOM );
            equationValues['Other']=convertUnit(Other,RequiredFlowUOM, reqFlowCapacityUOM );
            inputValues['FlashingLiquid']=FlashingLiquid;
            inputValues['RegulatorFailure']=RegulatorFailure;
            inputValues['Other']=Other;
            
            AdditionalCapacityPressure = !isNaN(parseFloat(FlashingLiquid)) ? parseFloat(FlashingLiquid) : 0;
            AdditionalCapacityPressure += !isNaN(parseFloat(RegulatorFailure)) ? parseFloat(RegulatorFailure) : 0;
            AdditionalCapacityPressure += !isNaN(parseFloat(Other)) ? parseFloat(Other) : 0;

            // AdditionalCapacityPressure = RequiredFlowUOM !== "" && RequiredFlowUOM !== undefined ? convertUnit(AddCapacityPress, RequiredFlowUOM, reqFlowCapacityUOM) : "";
            reqFlowPress = !isNaN(parseFloat(ProductMovementPressure)) ? parseFloat(ProductMovementPressure) : 0;
            reqFlowPress += !isNaN(parseFloat(ThermalPressure)) ? parseFloat(ThermalPressure) : 0;
        }else{
            AdditionalCapacityPressure =config.reqFields['AdditionalCapacityPressure']; //RequiredFlowUOM !== "" && RequiredFlowUOM !== undefined ? convertUnit(config.reqFields['AdditionalCapacityPressure'], RequiredFlowUOM, reqFlowCapacityUOM) : "";
            AdditionalCapacityPressure=AdditionalCapacityPressure===undefined|| AdditionalCapacityPressure===null || isNaN(AdditionalCapacityPressure)?0:AdditionalCapacityPressure;
        }

        reqFlowPress += !isNaN(parseFloat(AdditionalCapacityPressure)) ? parseFloat(AdditionalCapacityPressure) : 0;    
        equationValues['AdditionalCapacityPressure']=convertUnit(AdditionalCapacityPressure,RequiredFlowUOM, reqFlowCapacityUOM );
        equationValues['reqFlowPress']=convertUnit(reqFlowPress,RequiredFlowUOM, reqFlowCapacityUOM );
        inputValues['AdditionalCapacityPressure']=AdditionalCapacityPressure;
        inputValues['reqFlowPress']=reqFlowPress;
    }
    
    // receivedUnits['FlowCapacityUOM']=reqFlowCapacityUOM;
    // requiredUnits['FlowCapacityUOM']=RequiredFlowUOM;

    let AdditionalCapacityVacuum;

    let ProductMovementVacuum = config.reqFields['ProductMovementVacuum']; //RequiredFlowUOM !== "" && RequiredFlowUOM !== undefined ? convertUnit(config.reqFields['ProductMovementVacuum'], RequiredFlowUOM, reqFlowCapacityUOM) : "";
    ProductMovementVacuum=ProductMovementVacuum===undefined|| ProductMovementVacuum===null || isNaN(ProductMovementVacuum)?0:ProductMovementVacuum;

    let ThermalVacuum = config.reqFields['ThermalVacuum']; //RequiredFlowUOM !== "" && RequiredFlowUOM !== undefined ? convertUnit(config.reqFields['ThermalVacuum'], RequiredFlowUOM, reqFlowCapacityUOM) : "";
    ThermalVacuum=ThermalVacuum===undefined|| ThermalVacuum===null || isNaN(ThermalVacuum)?0:ThermalVacuum;

    AdditionalCapacityVacuum = config.reqFields['AdditionalCapacityVacuum']; //RequiredFlowUOM !== "" && RequiredFlowUOM !== undefined ? convertUnit(config.reqFields['AdditionalCapacityVacuum'], RequiredFlowUOM, reqFlowCapacityUOM) : "";
    AdditionalCapacityVacuum=AdditionalCapacityVacuum===undefined|| AdditionalCapacityVacuum===null || isNaN(AdditionalCapacityVacuum)?0:AdditionalCapacityVacuum;

    reqFlowVac = !isNaN(parseFloat(ProductMovementVacuum)) ? parseFloat(ProductMovementVacuum) : 0;
    reqFlowVac += !isNaN(parseFloat(ThermalVacuum)) ? parseFloat(ThermalVacuum) : 0;
    reqFlowVac += !isNaN(parseFloat(AdditionalCapacityVacuum)) ? parseFloat(AdditionalCapacityVacuum) : 0;
    
    inputValues['AdditionalCapacityVacuum']=AdditionalCapacityVacuum;
    inputValues['reqFlowVac']=reqFlowVac;
    equationValues['AdditionalCapacityVacuum']=convertUnit(AdditionalCapacityVacuum,RequiredFlowUOM, reqFlowCapacityUOM );
    equationValues['reqFlowVac']=convertUnit(reqFlowVac,RequiredFlowUOM, reqFlowCapacityUOM );

    
    if (isNaN(reqFlowPress) || !isPressureOnly) {
        reqFlowPress = '';
    } 

    if (isNaN(reqFlowVac) || !isVacuumOnly) {
        reqFlowVac = '';
    }

    tcResponse={equationValues:equationValues,inputValues:inputValues,equations:equations,requiredUnits:requiredUnits,receivedUnits:receivedUnits};
    const Output={ Wreq: reqFlowPress, WreqV:reqFlowVac,FlashingLiquid:FlashingLiquid,AdditionalCapacityPressure:AdditionalCapacityPressure,AdditionalCapacityVacuum:AdditionalCapacityVacuum,tcResponse:tcResponse};
    // console.log(`In use PopupPanel::: CalculateRequiredFlow >>> Output:: ${JSON.stringify(Output)} >>> AdditionalCapacityVacuum:: ${AdditionalCapacityVacuum} >>> AdditionalCapacityPressure:: ${AdditionalCapacityPressure} >>> reqFlowVac:: ${reqFlowVac} >>> reqFlowPress:: ${reqFlowPress}`);
    return Output;
}
