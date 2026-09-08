import { CalculateProductMovement } from "./ProductMovementCalculator"
import { CalculateRequiredFlow } from "./RequiredFlowCalculator";
import { RinCalculator } from "./RinCalculator";
import { CalculateThermalPressure } from "./ThermalPressureCalculator";
import { CalculateApi2000SurfaceAreaAndTankVolume } from "./Api2000SurfaceAreaCalculator";
import { convertUnit } from './convertUnit';


export const CalculatePressureAPI2000 = (config) => {
    
    // console.log('In use PopupPanel:::calculatedFields:: In Calculate PressureAPI2000 >>>> config >>>>>>>>>>>>> ',config)
    let localConfig={...config};
    const payload=localConfig.payloadData;
    const UOMs=config.units;
    const isPressureOnly=payload['IsPressureOnly'];
    const isVacuumOnly=payload['IsVacuumOnly'];
    let CalculateTankData = config.reqFields["CalculateTankData"];
    let RequiredFlow;
    let RinValue;
    let RinCalcFlag=false;
    let SurAreaAndTnkVol;
    let requiredFields;
    let AdditionalCapacityPressure=0;
    let AdditionalCapacityVacuum=Number(config.reqFields['AdditionalCapacityVacuum']);
    let Output={};
    let tcResponse={};
    let equationValues={};
    let inputValues={};
    let requiredUnits={};
    let receivedUnits={};
    let equations={};
    inputValues['CalculateTankData']=CalculateTankData;

    let SizingBassis = config.reqFields["SizingBassis"];

    if(CalculateTankData){
        SurAreaAndTnkVol=CalculateApi2000SurfaceAreaAndTankVolume(localConfig);
        tcResponse=SurAreaAndTnkVol?.tcResponse;
        equationValues={...tcResponse?.equationValues};
        receivedUnits={...tcResponse?.receivedUnits};
        requiredUnits={...tcResponse?.requiredUnits};
        equations={...tcResponse?.equations};
        inputValues={...tcResponse?.inputValues};
        // console.log(`In use PopupPanel:::calculatedFields:: In Calculate PressureAPI2000 >>>> SurAreaAndTnkVol >> ${SurAreaAndTnkVol}`);
        requiredFields={...localConfig.reqFields,...SurAreaAndTnkVol};
        // console.log(`In use PopupPanel:::calculatedFields:: In Calculate PressureAPI2000 >>>> SurAreaAndTnkVol >> ${SurAreaAndTnkVol}>>>> Surface Area >> ${requiredFields?.SurfaceArea} >>>> TankVolume >> ${requiredFields?.TankVolume}`)
        localConfig={...localConfig,reqFields:requiredFields};
        // console.log(`In use PopupPanel:::calculatedFields:: In Calculate PressureAPI2000 >>>> Tank Volume >> ${localConfig?.reqFields?.TankVolume}>>>> Surface Area >> ${localConfig?.reqFields?.SurfaceArea}`)
        Output={...Output,...SurAreaAndTnkVol};
    }
    
    if(localConfig.reqFields['TankHasInsulation']!=='None' && SizingBassis === "sev_Ed_Main"){
        RinValue=RinCalculator(localConfig);
        let localTcResponse=RinValue?.tcResponse;
        let localEquationValues=localTcResponse?.equationValues;
        equationValues={...equationValues,...localEquationValues};
        let localInputValues=localTcResponse?.inputValues;
        inputValues={...inputValues,...localInputValues};
        let localRequiredUnits=localTcResponse?.requiredUnits;
        requiredUnits={...requiredUnits,...localRequiredUnits};
        let localReceivedUnits=localTcResponse?.receivedUnits;
        receivedUnits={...receivedUnits,...localReceivedUnits};
        let localEquations=localTcResponse?.equations;
        equations={...equations,...localEquations};
        // console.log('In use PopupPanel:::In Calculate PressureAPI2000 >>>> RinCalculator >>>>>>>>>>>>> ',RinValue)
        RinCalcFlag=true;
    }else{
        RinValue={Rin:'1.0'};
        equationValues['SurfaceArea']='';
        inputValues['SurfaceArea']='';
        if(payload['RequiredCapacityMethod']==='Normal'){
            inputValues['TankVolume']=config.reqFields['TankVolume'];
            receivedUnits['TankVolume']=config.requiredUnits['VolumeUOM'];
            
        }else{
            let PressureUOM = payload['PressureUOM'];
            PressureUOM=UOMs['pressure'].find(u => u.UnitKey===PressureUOM);
            let TemperatureUOM = payload['TemperatureUOM'];
            TemperatureUOM=UOMs['temperature'].find(u => u.UnitKey===TemperatureUOM);
            const IsSimpleEmergencyFlowRateCalc = config.reqFields['IsSimpleEmergencyFlowRateCalc'];


            let MolWtVapor = IsSimpleEmergencyFlowRateCalc==true?payload['MolWeight']:config.reqFields['MolWtVapor'];
            // let MolWtVapor = config.reqFields['MolWtVapor'];
            MolWtVapor=isNaN(Number(MolWtVapor))?'':Number(MolWtVapor);

            inputValues['WettedArea']=config.reqFields['WettedArea'];
            inputValues['LatentHeatOfVaporization']=config.reqFields['LatentHeatOfVaporization'];
            receivedUnits['LatentHeatOfVaporization']=config.reqFields['LatentHeatOfVaporizationUOM'];
            inputValues['SystemMAWP']=config.reqFields['SystemMAWP'];
            receivedUnits['SystemMAWP']=PressureUOM;
            inputValues['RelievingTemp']=config.reqFields['Relieving'];
            receivedUnits['RelievingTemp']=TemperatureUOM;
            inputValues['EnvironmentalFactor']=config.reqFields['EnvironmentalFactor'];
            inputValues['MolWtVapor']=MolWtVapor;
        }

        receivedUnits['AreaUOM']=config.requiredUnits['AreaUOM'];
        
    }
    equationValues['Rin']=RinValue.Rin;
    inputValues['Rin']='1.0';
    Output={...Output,...RinValue};
    requiredFields={...localConfig.reqFields,Rin:RinValue['Rin']};
    localConfig={...localConfig,reqFields:requiredFields};
    
    let ProductMovement;
    let ThermalFlow;

    let resultCalcFlag1=payload['RequiredCapacityMethod']==='Normal' || (isPressureOnly && isVacuumOnly && payload['RequiredCapacityMethod']==='Emergency');

    if(resultCalcFlag1){
        SizingBassis = localConfig.reqFields["SizingBassis"];
        ProductMovement=CalculateProductMovement(localConfig);
        Output={...Output,...ProductMovement};
        let localTcResponse=ProductMovement?.tcResponse;
        let localEquationValues=localTcResponse?.equationValues;
        equationValues={...equationValues,...localEquationValues};
        let localInputValues=localTcResponse?.inputValues;
        inputValues={...inputValues,...localInputValues};
        let localRequiredUnits=localTcResponse?.requiredUnits;
        requiredUnits={...requiredUnits,...localRequiredUnits};
        let localReceivedUnits=localTcResponse?.receivedUnits;
        receivedUnits={...receivedUnits,...localReceivedUnits};
        let localEquations=localTcResponse?.equations;
        equations={...equations,...localEquations};
        // console.log('In use PopupPanel:::calculatedFields:::In Calculate PressureAPI2000 >>>> ProductMovement >>>>>>>>>>>>> ',ProductMovement)
        ThermalFlow=CalculateThermalPressure(localConfig);
        Output={...Output,...ThermalFlow};
        localTcResponse=ThermalFlow?.tcResponse;
        localEquationValues=localTcResponse?.equationValues;
        equationValues={...equationValues,...localEquationValues};
        localInputValues=localTcResponse?.inputValues;
        inputValues={...inputValues,...localInputValues};
        localRequiredUnits=localTcResponse?.requiredUnits;
        requiredUnits={...requiredUnits,...localRequiredUnits};
        localReceivedUnits=localTcResponse?.receivedUnits;
        receivedUnits={...receivedUnits,...localReceivedUnits};
        localEquations=localTcResponse?.equations;
        equations={...equations,...localEquations};

        if(isPressureOnly){
            if(SizingBassis === "sev_Ed_Main"){
                equations['Vout']=`Vout = Vmov + Vtherm + Vreg + Vflash + Vother`
            }else{
                equations['Vout']=`Vout = Vmov + Vtherm + Vadd,P`;
            }
        }

        if(isVacuumOnly){
            equations['Vin']=`Vin = Vmov + Vtherm + Vadd,V`;
            
        }

        // console.log('In use PopupPanel:::calculatedFields::In Calculate PressureAPI2000 >>>> ThermalFlow >>>>>>>>>>>>> ',{equationValues,requiredUnits,inputValues,receivedUnits,equations})
    }

    if(payload['RequiredCapacityMethod']==='Normal'){
        
        
        const { ProductMovementPressure, ProductMovementVacuum }=ProductMovement;
        const { ThermalPressure, ThermalVacuum }=ThermalFlow;

        const IsFlashingLiquid = config.reqFields['IsFlashingLiquid'];
        let FlashingLiquid =0;

        if(SizingBassis === "sev_Ed_Main"){
            
            FlashingLiquid = IsFlashingLiquid?config.reqFields["FlashingLiquid"]:0;
            FlashingLiquid=isNaN(Number(FlashingLiquid))?0:Number(FlashingLiquid);
            let RegulatorFailure = config.reqFields["RegulatorFailure"];
            RegulatorFailure=isNaN(Number(RegulatorFailure))?0:Number(RegulatorFailure);
            let Other = config.reqFields["Other"];
            Other=isNaN(Number(Other))?0:Number(Other);
            AdditionalCapacityPressure=FlashingLiquid+RegulatorFailure+Other;
            inputValues['FlashingLiquid']=FlashingLiquid;
            equationValues['FlashingLiquid']=convertUnit(FlashingLiquid,receivedUnits['FlowCapacityUOM'],requiredUnits['FlowCapacityUOM']);
            inputValues['RegulatorFailure']=RegulatorFailure;
            equationValues['RegulatorFailure']=convertUnit(RegulatorFailure,receivedUnits['FlowCapacityUOM'],requiredUnits['FlowCapacityUOM']);
            inputValues['Other']=Other;
            equationValues['Other']=convertUnit(Other,receivedUnits['FlowCapacityUOM'],requiredUnits['FlowCapacityUOM']);
        }else{
            AdditionalCapacityPressure=payload['AdditionalCapacityPressure'];
            AdditionalCapacityPressure=isNaN(Number(AdditionalCapacityPressure))?0:Number(AdditionalCapacityPressure);
        }
        // equationValues['AdditionalCapacityPressure']=AdditionalCapacityPressure;
        // inputValues['AdditionalCapacityPressure']=convertUnit(AdditionalCapacityPressure,receivedUnits['FlowCapacityUOM'],requiredUnits['FlowCapacityUOM']);
        // console.log('In use PopupPanel:::calculatedFields:: In Calculate PressureAPI2000 >>>> AdditionalCapacityVacuum >>>>>>>>>>>>> ',AdditionalCapacityVacuum,isNaN(Number(AdditionalCapacityVacuum)),payload['AdditionalCapacityVacuum'])
        AdditionalCapacityVacuum=payload['AdditionalCapacityVacuum'];
        AdditionalCapacityVacuum=isNaN(Number(AdditionalCapacityVacuum))?0:Number(AdditionalCapacityVacuum);
        // equationValues['AdditionalCapacityVacuum']=AdditionalCapacityVacuum;
        // inputValues['AdditionalCapacityVacuum']=convertUnit(AdditionalCapacityVacuum,receivedUnits['FlowCapacityUOM'],requiredUnits['FlowCapacityUOM']);
        if(isPressureOnly){
            equationValues['Vout']=convertUnit(Number(ProductMovementPressure)+Number(ThermalPressure)+Number(AdditionalCapacityPressure),receivedUnits['FlowCapacityUOM'],requiredUnits['FlowCapacityUOM']);
            inputValues['Vout']=Number(ProductMovementPressure)+Number(ThermalPressure)+Number(AdditionalCapacityPressure);
        }
        if(isVacuumOnly){
            equationValues['Vin']=convertUnit(Number(ProductMovementVacuum)+Number(ThermalVacuum)+Number(AdditionalCapacityVacuum),receivedUnits['FlowCapacityUOM'],requiredUnits['FlowCapacityUOM']);
            inputValues['Vin']=Number(ProductMovementVacuum)+Number(ThermalVacuum)+Number(AdditionalCapacityVacuum);
        }
        RequiredFlow={ Wreq: !isPressureOnly?'':Number(ProductMovementPressure)+Number(ThermalPressure) +Number(AdditionalCapacityPressure), 
                    WreqV: !isVacuumOnly?'':Number(ProductMovementVacuum)+Number(ThermalVacuum)+Number(AdditionalCapacityVacuum),
                    FlashingLiquid:FlashingLiquid===0?'':FlashingLiquid,AdditionalCapacityVacuum:AdditionalCapacityVacuum}; 

        Output={...Output,...RequiredFlow,AdditionalCapacityPressure:!isPressureOnly?'':isNaN(Number(AdditionalCapacityPressure))?0:AdditionalCapacityPressure,AdditionalCapacityVacuum:!isVacuumOnly?'':isNaN(Number(AdditionalCapacityVacuum))?0:AdditionalCapacityVacuum};
    }else{
        // Output={...Output,ProductMovementPressure:'', ProductMovementVacuum:'',ThermalPressure:'',ThermalVacuum:''};
        const { ProductMovementPressure, ProductMovementVacuum }=ProductMovement===undefined?{ProductMovementPressure:'',ProductMovementVacuum:''}:ProductMovement;
        const { ThermalPressure, ThermalVacuum }=ThermalFlow===undefined?{ThermalPressure:'', ThermalVacuum:''}:ThermalFlow;

        Output={...Output,ProductMovementPressure:'', ProductMovementVacuum:ProductMovementVacuum,ThermalPressure:'',ThermalVacuum:ThermalVacuum};
        RequiredFlow=CalculateRequiredFlow(localConfig);
        // console.log('RequiredFlow >>>>>>>>>>>>> ',RequiredFlow)
        let localTcResponse=RequiredFlow?.tcResponse;
        let localEquationValues=localTcResponse?.equationValues;
        equationValues={...equationValues,...localEquationValues};
        let localInputValues=localTcResponse?.inputValues;
        inputValues={...inputValues,...localInputValues};
        let localRequiredUnits=localTcResponse?.requiredUnits;
        requiredUnits={...requiredUnits,...localRequiredUnits};
        let localReceivedUnits=localTcResponse?.receivedUnits;
        receivedUnits={...receivedUnits,...localReceivedUnits};
        let localEquations=localTcResponse?.equations;
        equations={...equations,...localEquations};

        let localWreqV=RequiredFlow['WreqV'];
        let addCapVac=RequiredFlow['AdditionalCapacityVacuum'];
        if(resultCalcFlag1){
            localWreqV=Number(ProductMovementVacuum)+Number(ThermalVacuum)+Number(AdditionalCapacityVacuum);
            addCapVac=Number(AdditionalCapacityVacuum);
            
            equationValues['Vout']=convertUnit(Number(ProductMovementPressure)+Number(ThermalPressure)+Number(AdditionalCapacityPressure),receivedUnits['FlowCapacityUOM'],requiredUnits['FlowCapacityUOM']);
            inputValues['Vout']=Number(ProductMovementPressure)+Number(ThermalPressure)+Number(AdditionalCapacityPressure);
        
        
            equationValues['Vin']=convertUnit(Number(ProductMovementVacuum)+Number(ThermalVacuum)+Number(AdditionalCapacityVacuum),receivedUnits['FlowCapacityUOM'],requiredUnits['FlowCapacityUOM']);
            inputValues['Vin']=Number(ProductMovementVacuum)+Number(ThermalVacuum)+Number(AdditionalCapacityVacuum);
            
        }
        localWreqV=isNaN(Number(localWreqV))?0:Number(localWreqV);
        addCapVac=isNaN(Number(addCapVac))?0:Number(addCapVac);
        RequiredFlow={...RequiredFlow,WreqV:localWreqV,AdditionalCapacityVacuum:addCapVac};
        // console.log('In use PopupPanel:::calculatedFields:: In Calculate PressureAPI2000 >>>> AdditionalCapacityPressure >>>>>>>>>>>>> ',isNaN(Number(AdditionalCapacityPressure)),JSON.stringify(RequiredFlow))

        Output={...Output,...RequiredFlow,ProductMovementPressure:'',ThermalPressure:''};
    }
    if(!isPressureOnly){
        Output={...Output,ProductMovementPressure:'',ThermalPressure:'',FlashingLiquid:'',RegulatorFailure:'',Other:'',AdditionalCapacityPressure:'',Wreq:''};
    }

    if(!isVacuumOnly){
        Output={...Output,ProductMovementVacuum:'',ThermalVacuum:'',AdditionalCapacityVacuum:'',WreqV:''};
    }
    equationValues['CalculateRequiredFlowPressure']=isPressureOnly;
    equationValues['CalculateRequiredFlowVacuum']=isVacuumOnly;
    inputValues['AdditionalCapacityVacuum']=Output['AdditionalCapacityVacuum'];
    equationValues['AdditionalCapacityVacuum']=convertUnit(Output['AdditionalCapacityVacuum'],receivedUnits['FlowCapacityUOM'],requiredUnits['FlowCapacityUOM']);
    inputValues['AdditionalCapacityPressure']=Output['AdditionalCapacityPressure'];
    equationValues['AdditionalCapacityVacuum']=convertUnit(Output['AdditionalCapacityPressure'],receivedUnits['FlowCapacityUOM'],requiredUnits['FlowCapacityUOM']);
    tcResponse={equationValues:equationValues,requiredUnits:requiredUnits,receivedUnits:receivedUnits,equations:equations,inputValues:inputValues};
    // console.log('In use PopupPanel:::calculatedFields:: In Calculate PressureAPI2000 >>>> Output >>>>>>>>>>>>> ',Output,tcResponse)
    return {...Output,WreqV1:Output['WreqV'],Wreq1:Output['Wreq'],tcResponse:tcResponse};
}