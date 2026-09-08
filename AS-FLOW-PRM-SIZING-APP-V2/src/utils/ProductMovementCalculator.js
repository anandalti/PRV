import { convertUnit } from './convertUnit';

export const CalculateProductMovement = (config) => {
    // console.log('In use PopupPanel:::calculatedFields:: ProductMovementCalculator >>>> config >> ',config);
    const payload=config?.payloadData;
    const UOMs=config?.units;
    //"expression":"CalculateTankData == true && (TankShape == 'Rectangular'? Height_h * VesselWidth_w * LengthEndToEnd_lt : TankShape == 'Spherical'? (Math.PI * Math.pow(Diameter_d, 3)) / 6 : TankShape == 'Cylindrical' && Ends == 'FlatEnds' ? IsHorizontalOrientation === 'true'?(Math.PI * Math.pow(Diameter_d, 2) * LengthEndToEnd_lt) / 4:(Math.PI * Math.pow(Diameter_d, 2) * Height_h) / 4 : (Math.PI * Math.pow(Diameter_d, 2) * ((2 * Diameter_d) + (3 * LengthSeamToSeam_Ls))) / 12 )",
    let ProductMovePress;
    let ProductMoveVac;
    let tcResponse={}
    let equationValues={};
    let inputValues={};
    let equations={};
    let requiredUnits={};
    let receivedUnits={};
    const isPressureOnly=payload['IsPressureOnly'];
    const isVacuumOnly=payload['IsVacuumOnly'];
    const CalculationMethod = config.reqFields["CalculationMethod"];
    const ProductInTank = config.reqFields["ProductInTank"];
    const PumpInRateUOM = config.reqFields['PumpInRateUOM'];
    const PumpOutRateUOM = config.reqFields['PumpOutRateUOM'];
    const SizingBassis = config.reqFields["SizingBassis"];
    const FlowCapacityUOM =CalculationMethod === "Metric"? config.requiredUnits["FlowCapacityUOMMet"]: config.requiredUnits["FlowCapacityUOMEng"];

    requiredUnits['FlowCapacityUOM']=FlowCapacityUOM;
    // console.log(`In use PopupPanel:::calculatedFields:: ProductMovementCalculator >>>> SizingBassis >> ${SizingBassis}`);
    if(SizingBassis === "sev_Ed_Main"){
    
        const LiquidvolFlowUOM =CalculationMethod === "Metric"? config.requiredUnits["LiquidvolFlowUOMMet"]: config.requiredUnits["LiquidvolFlowUOMEng"];
        const converted_PinR = PumpInRateUOM !== "" && PumpInRateUOM !== undefined ? convertUnit(config.reqFields['PumpInRate'], PumpInRateUOM, LiquidvolFlowUOM) : "";
        equationValues['PumpInRate']=converted_PinR;
        inputValues['PumpInRate']=config.reqFields['PumpInRate'];
        requiredUnits['PumpInRate']=LiquidvolFlowUOM;
        receivedUnits['PumpInRate']=PumpInRateUOM;
        const converted_PoutR = PumpOutRateUOM !==  "" && PumpOutRateUOM !== undefined ? convertUnit(config.reqFields['PumpOutRate'], PumpOutRateUOM, LiquidvolFlowUOM) : "";
        equationValues['PumpOutRate']=converted_PoutR;
        inputValues['PumpOutRate']=config.reqFields['PumpOutRate'];
        requiredUnits['PumpOutRate']=LiquidvolFlowUOM;
        receivedUnits['PumpOutRate']=PumpOutRateUOM;
        const NpresConst = CalculationMethod === "Metric"? 1: 8.02;
        const NpresConst1 = CalculationMethod === "Metric"? 2: 16.04;
        const NvacConst = CalculationMethod === "Metric"? 1: 8.02;
        if (ProductInTank === "Nonvolatile Liquid, Psat ≤ 0.73psi (5.0kPa)") {
            ProductMovePress = converted_PinR*NpresConst;
            if(isPressureOnly){
                equations['ProductMovePress']=NpresConst==1 ? `Vmov = Fin`:`Vmov = ${NpresConst} * Fin`;
            }
        } else {
            ProductMovePress = converted_PinR*NpresConst1;
            if(isPressureOnly){
                equations['ProductMovePress']=NpresConst==1 ? `Vmov = Fin`:`Vmov = ${NpresConst1}  * Fin`;
            }
        }
        // console.log(`In use PopupPanel::: ProductMovePress >>> ${ProductMovePress} >>> converted_PinR ::: ${converted_PinR} >>> NpresConst ::: ${NpresConst} >>> NpresConst1 ::: ${NpresConst1}`);
        ProductMoveVac = converted_PoutR*NvacConst;
        if(isVacuumOnly){
            equations['ProductMoveVac']=`Vmov = ${NvacConst} * Fout`;
        }
        // console.log(`In use PopupPanel::: ProductMovePress >>> ${ProductMoveVac} >>> converted_PoutR ::: ${converted_PoutR} >>> NvacConst ::: ${NvacConst}`);
    } else {
        const Boiling_Flash_Point = config.reqFields["IsBoilingPointRadio"];
        let TemperatureUOM = payload["TemperatureUOM"]//config.reqFields["TemperatureUOM"];
        TemperatureUOM=UOMs['temperature']?.find(item=>item.UnitKey===TemperatureUOM);
        let reqTemperatureUOM =CalculationMethod === "Metric"?"temp.degC":"temp.degF"; //CalculationMethod === "Metric"? config.requiredUnits["TemperatureUOMMet"]: config.requiredUnits["TemperatureUOMEng"];
        reqTemperatureUOM=UOMs['temperature']?.find(item=>item.UnitKey===reqTemperatureUOM);

        const BoilingPoint = TemperatureUOM !== "" && TemperatureUOM !== undefined ? convertUnit(config.reqFields['BoilingPoint'], TemperatureUOM, reqTemperatureUOM) : "";
        equationValues['BoilingPoint']=BoilingPoint;
        inputValues['BoilingPoint']=config.reqFields['BoilingPoint'];
        requiredUnits['BoilingPoint']=reqTemperatureUOM;
        receivedUnits['BoilingPoint']=TemperatureUOM;
        const FlashPoint = TemperatureUOM !== "" && TemperatureUOM !== undefined ? convertUnit(config.reqFields['FlashPoint'], TemperatureUOM, reqTemperatureUOM) : "";
        equationValues['FlashPoint']=FlashPoint;
        inputValues['FlashPoint']=config.reqFields['FlashPoint'];
        requiredUnits['FlashPoint']=reqTemperatureUOM;
        receivedUnits['FlashPoint']=TemperatureUOM;

        const LiquidvolFlowUOM = CalculationMethod === "Metric"? config.requiredUnits["LiquidvolFlowUOMMet"]: config.requiredUnits["LiquidvolFlowUOMEngFB"];
        const converted_PinR = PumpInRateUOM !== "" && PumpInRateUOM !== undefined ? convertUnit(config.reqFields['PumpInRate'], PumpInRateUOM, LiquidvolFlowUOM) : "";
        equationValues['PumpInRate']=converted_PinR;
        inputValues['PumpInRate']=config.reqFields['PumpInRate'];
        requiredUnits['PumpInRate']=LiquidvolFlowUOM;
        receivedUnits['PumpInRate']=PumpInRateUOM;
        const converted_PoutR = PumpOutRateUOM !== "" && PumpOutRateUOM !== undefined ? convertUnit(config.reqFields['PumpOutRate'], PumpOutRateUOM, LiquidvolFlowUOM) : "";
        equationValues['PumpOutRate']=converted_PoutR;
        inputValues['PumpOutRate']=config.reqFields['PumpOutRate'];
        requiredUnits['PumpOutRate']=LiquidvolFlowUOM;
        receivedUnits['PumpOutRate']=PumpOutRateUOM;

        const FlashPointLimit = CalculationMethod === "Metric"? 37.8: 100;
        const BoilingPointLimit = CalculationMethod === "Metric"? 148.9: 300;
        const NpresConst = CalculationMethod === "Metric"? 1.01: 6.0;
        const NpresConst1 = CalculationMethod === "Metric"? 2.02: 12;
        const NvacConst = CalculationMethod === "Metric"? 0.94: 5.6;

        // console.log(`In use PopupPanel:::calculatedFields:::CalculateProductMovement >>>> Boiling_Flash_Point:${Boiling_Flash_Point} >>>> BoilingPoint:: ${BoilingPoint} >>>>FlashPoint:: ${FlashPoint} >>>> PumpInRate >>> ${config.reqFields['PumpInRate']} >>> ${converted_PinR} >>>> ${converted_PoutR} >>> ${Boiling_Flash_Point === "BoilingPoint" && BoilingPoint!==undefined && !isNaN(BoilingPoint)}`);
        if(((Boiling_Flash_Point === "FlashPoint" && FlashPoint!==undefined && !isNaN(FlashPoint)) ||
        (Boiling_Flash_Point === "BoilingPoint" && BoilingPoint!==undefined && !isNaN(BoilingPoint))
    )){
            // console.log(`In use PopupPanel:::calculatedFields:::CalculateProductMovement >>>> Boiling_Flash_Point:${Boiling_Flash_Point} >>>> BoilingPoint:: ${BoilingPoint} >>>>FlashPoint:: ${FlashPoint} >>>> PumpInRate >>> ${config.reqFields['PumpInRate']} >>> ${converted_PinR} >>>> ${converted_PoutR}`);
            if((FlashPoint && FlashPoint >= FlashPointLimit) || (BoilingPoint && BoilingPoint >= BoilingPointLimit)){
                ProductMovePress = NpresConst*converted_PinR;
            }else{
                ProductMovePress = NpresConst1*converted_PinR;
            }
            ProductMoveVac = NvacConst*converted_PoutR;
        }

        // console.log(`In use PopupPanel:::calculatedFields:::Calculate ProductMovement >>>> ProductMovePress:${ProductMovePress} >>>> ProductMoveVac:: ${ProductMoveVac}`);

        if((FlashPoint && FlashPoint >= FlashPointLimit) || (BoilingPoint && BoilingPoint >= BoilingPointLimit)){
            if(isPressureOnly){
                equations['ProductMovePress_2']=`Vmov = ${NpresConst} * Fin`;
            }
        }else{
            if(isPressureOnly){
                equations['ProductMovePress_2']=`Vmov = ${NpresConst1} * Fin`;
            }
        }
        if(isVacuumOnly){
            equations['ProductMoveVac_3']=`Vmov = ${NvacConst} * Fout`;
        }
    }
    let ProductMovementUOM = payload['FlowCapacityUOM'];//config.reqFields['ProductMovementUOM'];
    const dim=ProductMovementUOM.split('.')[0]
    ProductMovementUOM=UOMs[dim].find(ob => ob.UnitKey===ProductMovementUOM);
    receivedUnits['FlowCapacityUOM']=ProductMovementUOM;

    if (ProductMovePress === "" || isNaN(ProductMovePress) || !isPressureOnly) {
        ProductMovePress = '';
    } else {
        // console.log(ProductMovePress, 'In use PopupPanel:::calculatedFields:: ProductMovementCalculator 222>>>>1 ProductMovePress >>> ',ProductMovePress, ProductMovementUOM.UnitKey, FlowCapacityUOM.UnitKey)
        equationValues['ProductMovePress']=ProductMovePress;
        ProductMovePress = convertUnit(ProductMovePress, FlowCapacityUOM, ProductMovementUOM);
        inputValues['ProductMovePress']=ProductMovePress;
        receivedUnits['ProductMovePress']=ProductMovementUOM;
        requiredUnits['ProductMovePress']=FlowCapacityUOM;
    }
    if (ProductMoveVac === "" || isNaN(ProductMoveVac) || !isVacuumOnly) {
        ProductMoveVac = '';
    } else {
        let ProductMovementUOM = payload['FlowCapacityUOM'];//config.reqFields['ProductMovementUOM'];
        const dim=ProductMovementUOM.split('.')[0]
        ProductMovementUOM=UOMs[dim].find(ob => ob.UnitKey===ProductMovementUOM);
        // console.log(ProductMovePress, 'In use PopupPanel:::calculatedFields:: ProductMovementCalculator 222>>>>2 ProductMoveVac >>>> ',ProductMoveVac, ProductMovementUOM.UnitKey, FlowCapacityUOM.UnitKey)
        equationValues['ProductMoveVac']=ProductMoveVac;
        ProductMoveVac = convertUnit(ProductMoveVac, FlowCapacityUOM, ProductMovementUOM);
        inputValues['ProductMoveVac']=ProductMoveVac;
        receivedUnits['ProductMoveVac']=ProductMovementUOM;
        requiredUnits['ProductMoveVac']=FlowCapacityUOM;
    }
    tcResponse={equationValues, inputValues, equations, requiredUnits, receivedUnits};

    // console.log(`In use PopupPanel:::calculatedFields:: ProductMovementCalculator 333>>>> value >>> ProductMovePress:: ${ProductMovePress} , ProductMoveVac :: ${ProductMoveVac}, { ProductMovementPressure:: :: ${ProductMovePress}, ProductMovementVacuum:: ${ProductMoveVac}} >>>> `,tcResponse)
    return { ProductMovementPressure: ProductMovePress, ProductMovementVacuum:ProductMoveVac,tcResponse };
}