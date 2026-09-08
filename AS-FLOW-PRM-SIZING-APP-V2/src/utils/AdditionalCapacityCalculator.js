
export const CalculateAdditionalCapacity = (config) => {
    // console.log('In use PopupPanel:::CalculateAdditionalCapacity >>>> config >>> ',config)
    let AddCapacityPress;
    //let AddCapacityVac;
    //const IsPressureOnly = config.reqFields["IsPressureOnly"];
    const FlashingLiquid = config.reqFields["FlashingLiquid"];
    const RegulatorFailure = config.reqFields['RegulatorFailure'];
    const Other = config.reqFields['Other'];
    const RequiredCapacityMethod = config.reqFields["RequiredCapacityMethod"];
    const SizingBassis = config.reqFields["SizingBassis"];
    if(RequiredCapacityMethod==='Normal'){
        AddCapacityPress = !isNaN(parseFloat(FlashingLiquid)) ? parseFloat(FlashingLiquid) : 0;
        AddCapacityPress += !isNaN(parseFloat(RegulatorFailure)) ? parseFloat(RegulatorFailure) : 0;
        AddCapacityPress += !isNaN(parseFloat(Other)) ? parseFloat(Other) : 0;
    }else{
        AddCapacityPress = config.reqFields["AdditionalCapacityPressure"];
        AddCapacityPress = !isNaN(parseFloat(AddCapacityPress)) ? AddCapacityPress : 0;
    }
    
    let ProductMovementPressure= config.reqFields["ProductMovementPressure"];
    ProductMovementPressure = !isNaN(parseFloat(ProductMovementPressure)) ? parseFloat(ProductMovementPressure) : 0;
    let ThermalPressure = config.reqFields["ThermalPressure"];
    ThermalPressure = !isNaN(parseFloat(ThermalPressure)) ? parseFloat(ThermalPressure) : 0;
    
    let Wreq=Number(ProductMovementPressure)+Number(ThermalPressure)+Number(AddCapacityPress);
    // console.log('In use PopupPanel:::CalculateAdditionalCapacity 333>>>> value',AddCapacityPress,Wreq)
    return { AdditionalCapacityPressure: AddCapacityPress,Wreq:Wreq };
}