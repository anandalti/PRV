const { convertUnit} = require("../../utils/helper");
const { getUOMs } = require("../getUom");

const CalculateProductMovement = async (payload) => {
    const UOMs=payload?.units===undefined?await getUOMs():payload?.units;
    // console.log('In usePopupPanel:::calculatedFields:: ProductMovementCalculator >>>> UOMs >> ',UOMs);
    //"expression":"CalculateTankData == true && (TankShape == 'Rectangular'? Height_h * VesselWidth_w * LengthEndToEnd_lt : TankShape == 'Spherical'? (Math.PI * Math.pow(Diameter_d, 3)) / 6 : TankShape == 'Cylindrical' && Ends == 'FlatEnds' ? IsHorizontalOrientation === 'true'?(Math.PI * Math.pow(Diameter_d, 2) * LengthEndToEnd_lt) / 4:(Math.PI * Math.pow(Diameter_d, 2) * Height_h) / 4 : (Math.PI * Math.pow(Diameter_d, 2) * ((2 * Diameter_d) + (3 * LengthSeamToSeam_Ls))) / 12 )",
    let ProductMovePress;
    let ProductMoveVac;
    let tcResponse={}
    let equationValues={};
    let inputValues={};
    let equations={};
    let requiredUnits={};
    let receivedUnits={};
    const isPressureOnly=payload['IsPressureOnly']??false;
    const isVacuumOnly=payload['IsVacuumOnly']??false;
    const CalculationMethod = payload["CalculationMethod"];
    const ProductInTank = payload["ProductInTank"];
    // let dim=''
    let PumpInRateUOM = payload?.selectedUnits['PumpInRateUOM'];
    // dim=PumpInRateUOM.split('.')[0]
    PumpInRateUOM=UOMs.find(u => u.UnitKey=== PumpInRateUOM);
    requiredUnits['PumpInRateUOM']=PumpInRateUOM;
    let PumpOutRateUOM = payload?.selectedUnits['PumpOutRateUOM'];
    // dim=PumpOutRateUOM.split('.')[0]
    PumpOutRateUOM=UOMs.find(u => u.UnitKey=== PumpOutRateUOM);
    requiredUnits['PumpOutRateUOM']=PumpOutRateUOM;
    const SizingBassis = payload["SizingBassis"];
    let FlowCapacityUOM =payload.requiredUnits["FlowCapacityUOM"];
    // dim=FlowCapacityUOM.split('.')[0]
    FlowCapacityUOM=FlowCapacityUOM!=="" && FlowCapacityUOM !==undefined?UOMs.find(u => u.UnitKey===FlowCapacityUOM):'';
    // console.log(' >>>>>>>>>>>>',FlowCapacityUOM,dim,payload?.requiredUnits,payload?.selectedUnits)

    requiredUnits['FlowCapacityUOM']=FlowCapacityUOM;
    // console.log(`In usePopupPanel:::calculatedFields:: ProductMovementCalculator >>>> SizingBassis >> ${SizingBassis}`);
    if(SizingBassis === "sev_Ed_Main"){
    
        let LiquidvolFlowUOM =payload.requiredUnits["LiquidvolFlowUOM"];
        LiquidvolFlowUOM=LiquidvolFlowUOM!=="" && LiquidvolFlowUOM !==undefined?UOMs.find(u => u.UnitKey===LiquidvolFlowUOM):'';
        const converted_PinR = PumpInRateUOM !== "" && PumpInRateUOM !== undefined ? convertUnit(payload['PumpInRate'], PumpInRateUOM, LiquidvolFlowUOM) : "";
        equationValues['PumpInRate']=converted_PinR;
        inputValues['PumpInRate']=payload['PumpInRate'];
        requiredUnits['PumpInRate']=LiquidvolFlowUOM;
        receivedUnits['PumpInRate']=PumpInRateUOM;
        const converted_PoutR = PumpOutRateUOM !==  "" && PumpOutRateUOM !== undefined ? convertUnit(payload['PumpOutRate'], PumpOutRateUOM, LiquidvolFlowUOM) : PumpInRateUOM !== "" && PumpInRateUOM !== undefined ? convertUnit(payload['PumpOutRate'], PumpInRateUOM, LiquidvolFlowUOM) : "";
        // console.log('>>>>>>>>converted_PoutR >>>>>>> ',converted_PoutR,payload['PumpOutRate'],PumpOutRateUOM,PumpInRateUOM,LiquidvolFlowUOM);
        equationValues['PumpOutRate']=converted_PoutR;
        inputValues['PumpOutRate']=payload['PumpOutRate'];
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
        // console.log(`In usePopupPanel::: ProductMovePress >>> ${ProductMovePress} >>> converted_PinR ::: ${converted_PinR} >>> NpresConst ::: ${NpresConst} >>> NpresConst1 ::: ${NpresConst1}`);
        ProductMoveVac = converted_PoutR*NvacConst;
        if(isVacuumOnly){
            equations['ProductMoveVac']=`Vmov = ${NvacConst} * Fout`;
        }
        // console.log(`In usePopupPanel::: ProductMovePress >>> ${ProductMoveVac} >>> converted_PoutR ::: ${converted_PoutR} >>> NvacConst ::: ${NvacConst}`);
    } else {
        const Boiling_Flash_Point = payload["IsBoilingPointRadio"];
        let TemperatureUOM = payload?.selectedUnits["TemperatureUOM"]//payload["TemperatureUOM"];
        TemperatureUOM=UOMs.find(item=>item.UnitKey===TemperatureUOM);
        let reqTemperatureUOM = payload.requiredUnits["TemperatureUOM"] ?? (CalculationMethod === "Metric"?"temp.degC":"temp.degF"); //CalculationMethod === "Metric"? config.requiredUnits["TemperatureUOMMet"]: config.requiredUnits["TemperatureUOMEng"];
        reqTemperatureUOM=UOMs.find(item=>item.UnitKey===reqTemperatureUOM);

        const BoilingPoint = TemperatureUOM !== "" && TemperatureUOM !== undefined ? convertUnit(payload['BoilingPoint'], TemperatureUOM, reqTemperatureUOM) : "";
        equationValues['BoilingPoint']=BoilingPoint;
        inputValues['BoilingPoint']=payload['BoilingPoint'];
        requiredUnits['BoilingPoint']=reqTemperatureUOM;
        receivedUnits['BoilingPoint']=TemperatureUOM;
        const FlashPoint = TemperatureUOM !== "" && TemperatureUOM !== undefined ? convertUnit(payload['FlashPoint'], TemperatureUOM, reqTemperatureUOM) : "";
        equationValues['FlashPoint']=FlashPoint;
        inputValues['FlashPoint']=payload['FlashPoint'];
        requiredUnits['FlashPoint']=reqTemperatureUOM;
        receivedUnits['FlashPoint']=TemperatureUOM;

        let LiquidvolFlowUOM = payload.requiredUnits["LiquidvolFlowUOM"];
        LiquidvolFlowUOM=LiquidvolFlowUOM!=="" && LiquidvolFlowUOM !==undefined?UOMs.find(u => u.UnitKey===LiquidvolFlowUOM):'';
        const converted_PinR = PumpInRateUOM !== "" && PumpInRateUOM !== undefined ? convertUnit(payload['PumpInRate'], PumpInRateUOM, LiquidvolFlowUOM) : "";
        // console.log(' >>>>>>>>>> converted_PinR >>>>> ',converted_PinR,payload['PumpInRate'],PumpInRateUOM,LiquidvolFlowUOM);
        equationValues['PumpInRate']=converted_PinR;
        inputValues['PumpInRate']=payload['PumpInRate'];
        requiredUnits['PumpInRate']=LiquidvolFlowUOM;
        receivedUnits['PumpInRate']=PumpInRateUOM;
        const converted_PoutR = PumpOutRateUOM !== "" && PumpOutRateUOM !== undefined ? convertUnit(payload['PumpOutRate'], PumpOutRateUOM, LiquidvolFlowUOM) : "";
        equationValues['PumpOutRate']=converted_PoutR;
        inputValues['PumpOutRate']=payload['PumpOutRate'];
        requiredUnits['PumpOutRate']=LiquidvolFlowUOM;
        receivedUnits['PumpOutRate']=PumpOutRateUOM;

        const reqTempUnit=CalculationMethod === "Metric"? "temp.degC":"temp.degF";
        const FlashPointLimit = CalculationMethod === "Metric"? 37.8: 100;
        const requiredFPLimit = convertUnit(FlashPointLimit, UOMs.find(u => u.UnitKey===reqTempUnit), reqTemperatureUOM);
        const BoilingPointLimit = CalculationMethod === "Metric"? 148.9: 300;
        const requiredBPLimit = convertUnit(BoilingPointLimit, UOMs.find(u => u.UnitKey===reqTempUnit), reqTemperatureUOM);
        const NpresConst = CalculationMethod === "Metric"? 1.01: 6.0;
        const NpresConst1 = CalculationMethod === "Metric"? 2.02: 12;
        const NvacConst = CalculationMethod === "Metric"? 0.94: 5.6;

        // console.log(`In usePopupPanel:::calculatedFields:::CalculateProductMovement >>>> Boiling_Flash_Point:${Boiling_Flash_Point} >>>> BoilingPoint:: ${BoilingPoint} >>>>FlashPoint:: ${FlashPoint} >>>> PumpInRate >>> ${payload['PumpInRate']} >>> ${converted_PinR} >>>> ${converted_PoutR} >>> ${Boiling_Flash_Point === "BoilingPoint" && BoilingPoint!==undefined && !isNaN(BoilingPoint)}`);
        if(((Boiling_Flash_Point === "FlashPoint" && FlashPoint!==undefined && !isNaN(FlashPoint)) ||
        (Boiling_Flash_Point === "BoilingPoint" && BoilingPoint!==undefined && !isNaN(BoilingPoint))
    )){
            // console.log(`In usePopupPanel:::calculatedFields:::CalculateProductMovement >>>> Boiling_Flash_Point:${Boiling_Flash_Point} >>>> BoilingPoint:: ${BoilingPoint} >>>>FlashPoint:: ${FlashPoint} >>>> PumpInRate >>> ${payload['PumpInRate']} >>> ${converted_PinR} >>>> ${converted_PoutR} >>>>>>>>>>> `,(FlashPoint && FlashPoint >= FlashPointLimit) || (BoilingPoint && BoilingPoint >= BoilingPointLimit));
            if((FlashPoint && FlashPoint >= requiredFPLimit) || (BoilingPoint && BoilingPoint >= requiredBPLimit)){
                ProductMovePress = NpresConst*converted_PinR;
            }else{
                ProductMovePress = NpresConst1*converted_PinR;
            }
            ProductMoveVac = NvacConst*converted_PoutR;
        }

        // console.log(`In usePopupPanel:::calculatedFields:::Calculate ProductMovement >>>> ProductMovePress:${ProductMovePress} >>>> ProductMoveVac:: ${ProductMoveVac}`);

        if((FlashPoint && FlashPoint >= requiredFPLimit) || (BoilingPoint && BoilingPoint >= requiredBPLimit)){
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
    let ProductMovementUOM = payload?.selectedUnits['FlowCapacityUOM'] ?? payload?.selectedUnits['ProductMovementUOM'];
    // dim=ProductMovementUOM.split('.')[0]
    ProductMovementUOM=UOMs.find(ob => ob.UnitKey===ProductMovementUOM);
    receivedUnits['FlowCapacityUOM']=ProductMovementUOM;

    if (ProductMovePress === "" || isNaN(ProductMovePress) || !isPressureOnly) {
        ProductMovePress = '';
    } else {
        // console.log(ProductMovePress, 'In usePopupPanel:::calculatedFields:: ProductMovementCalculator 222>>>>1 ProductMovePress >>> ',ProductMovePress, ProductMovementUOM.UnitKey, FlowCapacityUOM.UnitKey)
        equationValues['ProductMovePress']=ProductMovePress;
        ProductMovePress = convertUnit(ProductMovePress, FlowCapacityUOM, ProductMovementUOM);
        inputValues['ProductMovePress']=ProductMovePress;
        receivedUnits['ProductMovePress']=ProductMovementUOM;
        requiredUnits['ProductMovePress']=FlowCapacityUOM;
    }
    if (ProductMoveVac === "" || isNaN(ProductMoveVac) || !isVacuumOnly) {
        ProductMoveVac = '';
    } else {
        // let ProductMovementUOM = payload['FlowCapacityUOM'];//payload['ProductMovementUOM'];
        // const dim=ProductMovementUOM.split('.')[0]
        // ProductMovementUOM=UOMs[dim].find(ob => ob.UnitKey===ProductMovementUOM);
        // console.log(ProductMovePress, 'In usePopupPanel:::calculatedFields:: ProductMovementCalculator 222>>>>2 ProductMoveVac >>>> ',ProductMoveVac, ProductMovementUOM.UnitKey, FlowCapacityUOM.UnitKey)
        equationValues['ProductMoveVac']=ProductMoveVac;
        ProductMoveVac = convertUnit(ProductMoveVac, FlowCapacityUOM, ProductMovementUOM);
        inputValues['ProductMoveVac']=ProductMoveVac;
        receivedUnits['ProductMoveVac']=ProductMovementUOM;
        requiredUnits['ProductMoveVac']=FlowCapacityUOM;
    }
    tcResponse={equationValues, inputValues, equations, requiredUnits, receivedUnits};

    // console.log('In usePopupPanel:::calculatedFields:: ProductMovementCalculator 333>>>> value >>> ProductMovePress:: ',{ProductMovePress,ProductMoveVac, FlowCapacityUOM:FlowCapacityUOM?.UnitKey, ProductMovementUOM:ProductMovementUOM?.UnitKey})
    return { ProductMovementPressure: ProductMovePress, ProductMovementVacuum:ProductMoveVac,tcResponse };
}

module.exports = {
    CalculateProductMovement
};