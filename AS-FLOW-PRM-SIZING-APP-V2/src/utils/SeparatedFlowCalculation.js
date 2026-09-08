import { convertUnitDiffDims } from "./convertUnit";

export const Calculate_21_ReqFlowCapacity=(config)=>{
    // console.log('In Calculate_21_ReqFlowCapacity >>>>>>>>>>>>s>>>>>>> ',config);
    let Wreq='';
    let gasInputValue=config.reqFields['Wv'];
    let liquidInputValue=config.reqFields['Wl'];
    let Liq2InputValue=config.reqFields['Liquid2Wl'];
    let IsLiquidOnlyAtInlet=config.reqFields['IsLiquidOnlyAtInlet'];
    let IsLiquid2=config.reqFields['IsLiquid2'];
    
    if(gasInputValue!==undefined && gasInputValue!=='' && liquidInputValue!==undefined && liquidInputValue!=='' && liquidInputValue!=0){
        let liquid2Flag=IsLiquid2?Liq2InputValue!==undefined && Liq2InputValue!=='' && Liq2InputValue!=0:true;
        // console.log(' >>>>>>>>>>>>>>> liquid2Flag >>>>>>>>>>> ',liquid2Flag);
        if(liquid2Flag){
            const requidUnit=config.reqFields['FlowCapacityUOM'];
            const gasInputUnit=config.reqFields['FlowCapacityWvUOM'];
            const LiquidInputUnit=config.reqFields['FlowCapacityLiqUOM'];
            const Liquid2InputUnit=IsLiquid2?config.reqFields['FlowCapacityLiq2UOM']:0;
            const payloadData=config.payloadData;
            const units=config.units;

            let convertedGasValue=Number(convertUnitDiffDims(gasInputValue, gasInputUnit, requidUnit,units,payloadData,false));
            let convertedLiquidValue=Number(convertUnitDiffDims(liquidInputValue, LiquidInputUnit, requidUnit,units,payloadData,false,false));
            let convertedLiq2Value=IsLiquid2?Number(convertUnitDiffDims(Liq2InputValue, Liquid2InputUnit, requidUnit,units,payloadData,false,true)):0;

            
            if(IsLiquid2 ){
                // console.log('In Calculate_21_ReqFlowCapacity >>>>>>>>>>>>>>>>>>> IsLiquid2 >>>>>>>',{IsLiquid2,convertedGasValue,convertedLiquidValue,convertedLiq2Value});
                if(gasInputValue!=='' && liquidInputValue!=='' && Liq2InputValue!=='' && liquidInputValue!=0 && Liq2InputValue!=0){
                    Wreq=convertedGasValue+convertedLiquidValue+convertedLiq2Value;
                }
            }else if(IsLiquidOnlyAtInlet){
                // console.log('In Calculate_21_ReqFlowCapacity >>>>>>>>>>>>>>>>>>> IsLiquidOnlyAtInlet >>>>>>>',IsLiquidOnlyAtInlet);
                if(liquidInputValue!=='' && liquidInputValue!=0){
                    Wreq=convertedLiquidValue;
                }
            }else if(gasInputValue!=='' && liquidInputValue!=='' && liquidInputValue!=0){
                Wreq=convertedGasValue+convertedLiquidValue;
            }
        }
    }
    
    // console.log('In Calculate_21_ReqFlowCapacity >>>>>>>>>>>>>>>>>>> final >>>>>>>',convertedGasValue,convertedLiquidValue,convertedLiq2Value,Wreq);
    return {Wreq}
}

