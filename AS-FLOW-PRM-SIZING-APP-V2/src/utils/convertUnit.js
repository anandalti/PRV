import bigNumber from "bignumber.js";

import {
    BIGNUMBER_DECIMALS,
    CONVERT_TOFIXED_DECIMALS,
    BIGNUMBER_ROUNDING_MODE,
  } from "./constants";

export const BigNumber = bigNumber.clone({DECIMAL_PLACES: BIGNUMBER_DECIMALS, ROUNDING_MODE: BIGNUMBER_ROUNDING_MODE});
const roundBigNumber = (value) => {
    // console.log('first >>>>>>>>>>>>>>>>>>>> roundBigNumber >>>>>>>>>>>>> ',value)
    const bigNum = value instanceof BigNumber ? value : new BigNumber(value);
    const strValue = bigNum.toFixed(CONVERT_TOFIXED_DECIMALS);
    const [integerPart, decimalPart] = strValue.split('.');
    if (bigNum.isInteger() || !decimalPart) {
        return bigNum.toFixed(CONVERT_TOFIXED_DECIMALS);
    }
    
    let countZero = 0;
    let countNine = 0;
    let roundIndex = -1;
    let roundUp = false;
    for (let i = 0; i < decimalPart.length; i++) {
        if (decimalPart[i] === '0') {
        countZero++;
        countNine = 0;
        } else if (decimalPart[i] === '9') {
        countNine++;
        countZero = 0;
        } else {
        countZero = 0;
        countNine = 0;
        }
    
        if (countZero >= 8) {
        roundIndex = i - 4; // Index to round up to
        break;
        }
        if (countNine >= 8) {
        roundIndex = i - 4; // Index to round up to
        roundUp = true;
        break;
        }
    }
    if (roundIndex === -1) {
        return bigNum.toFixed(CONVERT_TOFIXED_DECIMALS); // No need to round, return the original value
    }
    if(roundUp) {
        if (roundIndex === 0) {
            const val = new BigNumber(integerPart).plus(1);
            return val.toFixed(CONVERT_TOFIXED_DECIMALS);
        } else {
            const val = new BigNumber(`${integerPart}.${decimalPart.slice(0, roundIndex)}`).plus(1/10**roundIndex);
            return val.toFixed(CONVERT_TOFIXED_DECIMALS);
        }
    } else {
        const val = BigNumber(`${integerPart}.${decimalPart.slice(0, roundIndex)}`);
        return val.toFixed(CONVERT_TOFIXED_DECIMALS);
    }
};
export const checkForValidValue = (value = "") => {
    if (!value && value != 0) return "";
    // return (value);
    const val = roundBigNumber(value);
    const refVal = BigNumber(val);
    if (refVal.isNaN()) {
        return "";
    } else if (refVal.isZero()) {
        return "0.000";
    } else {
        const newVal = refVal.toFixed();
        return newVal;
    }    
};

export const convertUnit = (value, fromUnit, toUnit) => {
    // console.log( 'Popup Change 11111 >>>>>>>>>>>>>>> convertUnit >>>>>>>>>>>>>>11 ',value,  fromUnit?.UnitKey, toUnit?.UnitKey,(!value && value !=0) , value==='')
    if((!value && value !=0) || value===''){
        return '';
    }
    const inputValue = BigNumber(value);
    const fromUF = BigNumber(BigNumber(fromUnit.UnitFactor).toFixed(9));
    const toUF = BigNumber(BigNumber(toUnit.UnitFactor).toFixed(9));
    if(fromUnit.UnitKey === toUnit.UnitKey){
        return inputValue.isNaN() ? '' : BigNumber(inputValue).toFixed(9);//checkForValidValue(inputValue);
    }

    let toValue = inputValue
        .plus(fromUnit.UnitOffset)
        .dividedBy(fromUF)
        .multipliedBy(toUF)
        .minus(toUnit.UnitOffset);
    toValue = toValue.isNaN() ? '' :toValue;
    // toValue = isNaN(toValue)
    //     ? toValue
    //     : Math.round(toValue) == toValue
    //         ? Math.round(toValue.toString())
    //         : toValue.toString();
    const returnVal = checkForValidValue(toValue); // BigNumber(BigNumber(toValue).toFixed(9));
    // console.log('>>>>>>>>>>>>>>>>>>>> roundBigNumber >>>>>>>>>>>>>  -- 9090 ', value, fromUnit, toUnit,toValue,returnVal);
    // console.log('first >>>>>>>>>>>>>>>>>>>> roundBigNumber >>>>>>>>>>>>> ',value)
    return returnVal;
};

const unitConversion = (units, payloadData,VacuumFlag=false) => {
    const pressureUOM=units['pressure'];
    const absPressureUOM=units['abspressure'];
    const temperatureUOM=units['temperature'];
    
    const calcMethod=payloadData['CalculationMethod'];

    let currPressure=payloadData['PressureUOM'];
    currPressure=currPressure?currPressure:calcMethod==='English'?'pressure.psig':'pressure.barg';
    let currAbsPressure=payloadData['AtmPressureUOM'];
    currAbsPressure=currAbsPressure?currAbsPressure:calcMethod==='English'?'abspressure.psia':'abspressure.bara';
    let currTemperature=payloadData['TemperatureUOM'];
    currTemperature=currTemperature?currTemperature:calcMethod==='English'?'temp.degF':'temp.degK';

    const currentUOM={
        pressure:currPressure,
        abspressure:currAbsPressure,
        temperature:currTemperature,
    };
    const requiredUOM={
        pressure:'pressure.barg',
        abspressure:'abspressure.bara',
        temperature:'temp.degK',
    };
    const Pset=convertUnit(payloadData['SetPressure'],pressureUOM.find(u => u.UnitKey===currentUOM['pressure']),pressureUOM.find(u => u.UnitKey===requiredUOM['pressure']),pressureUOM) ?? 0;
    const Pover=convertUnit(payloadData['OverPressure'],pressureUOM.find(u => u.UnitKey===currentUOM['pressure']),pressureUOM.find(u => u.UnitKey===requiredUOM['pressure']),pressureUOM) ?? 0;
    const Ploss=convertUnit(payloadData['InletLoss'],pressureUOM.find(u => u.UnitKey===currentUOM['pressure']),pressureUOM.find(u => u.UnitKey===requiredUOM['pressure']),pressureUOM) ?? 0;
    const Pabs=convertUnit(payloadData['AtmPressure'],absPressureUOM.find(u => u.UnitKey===currentUOM['abspressure']),absPressureUOM.find(u => u.UnitKey===requiredUOM['abspressure']),absPressureUOM) ?? 0;
    const T=convertUnit(payloadData['Relieving'],temperatureUOM.find(u => u.UnitKey===currentUOM['temperature']),temperatureUOM.find(u => u.UnitKey===requiredUOM['temperature']),temperatureUOM) ?? 0;
    // const P1=Pset.plus(Pover).minus(Ploss).plus(Pabs);
    const P1=Number(Pset)+Number(Pover)-Number(Ploss)+Number(Pabs);

    const Tv=convertUnit(payloadData['RelievingforVacuum'],temperatureUOM.find(u => u.UnitKey===currentUOM['temperature']),temperatureUOM.find(u => u.UnitKey===requiredUOM['temperature']),temperatureUOM);
    const P1v=Pabs;

    return VacuumFlag?[P1v,Tv]:[P1,T];
}

export const convertUnitDiffDims = (value, fromUnit, toUnit,units,payloadData,VacuumFlag=false,liq2Flag=false) => {
    // console.log( 'Popup Change 11111 >>>>>>>>>>>>>>>uoms >>>>>>>>>>>>>> ',value,isNaN(value), fromUnit?.UnitKey, toUnit?.UnitKey)
    
    if(isNaN(value)){
        return value;
    }

    if(fromUnit ===undefined || toUnit ===undefined){
       
        return value
    }
    const fromDim=fromUnit['DimensionName'];
    const toDim=toUnit['DimensionName'];
    if(fromUnit?.UnitKey?.split('.')[0] === toUnit?.UnitKey?.split('.')[0]) {
        const returnValue=convertUnit(value, fromUnit, toUnit);
        // console.log( 'Popup Change 11111 >>>>>>>>>>>>>>> uoms >>>>>>>>>>>>>>11 ',value,  fromUnit?.UnitKey, toUnit?.UnitKey)
        return returnValue;   
    }
    let inputValue = isNaN(value)?value:BigNumber(value);
    if(isNaN(inputValue)){
        return inputValue;
    }
    let uoms=units[fromDim];
    const fromUnit1 = uoms.find(unit => unit["DimensionName"] === fromDim && unit['UnitFactor']==1);
    const initVal = convertUnit(inputValue, fromUnit, fromUnit1, uoms);
    
    uoms=units[toDim];
    const toUnit1 = uoms.find(unit => unit["DimensionName"] === toDim && unit['UnitFactor']==1);
    // console.log('UniConversion >>>> first conversion 11111 >>>>>>>>>>>>>>>> ',initVal, fromUnit, toUnit,fromUnit1, toUnit1)
    let newValue=initVal;
    // console.log('Popup Change 11111 >>>>>>>>>>>>>>>UniConversion >>>> first conversion 22222 >>>>>>>>>>>>>>>> ',initVal, fromDim,toDim,VacuumFlag,payloadData)

    switch(fromDim){
        case 'massflow':
            if(toDim==='gasvolflowact'){
                const MolWeight=Number(VacuumFlag?payloadData['MolWeightVacuum']:payloadData['MolWeight']);
                if(MolWeight==0 || MolWeight=='' || MolWeight==undefined || MolWeight==null){
                    return '';
                }
                const [P1,T]=unitConversion(units,payloadData,VacuumFlag);
                // newValue = initVal.multipliedBy(22.413996).dividedBy(MolWeight).multipliedBy(1.01325).dividedBy(P1).multipliedBy(T).dividedBy(273.15);
                newValue=(1.01325/P1)*(T/273.15)*((initVal * 22.413996)/MolWeight);
            }else if(toDim==='gasvolflow'){
                const MolWeight=Number(VacuumFlag?payloadData['MolWeightVacuum']:payloadData['MolWeight']);
                if(MolWeight==0 || MolWeight=='' || MolWeight==undefined || MolWeight==null){
                    return '';
                }
                // newValue = initVal.multipliedBy(22.413996).dividedBy(MolWeight);
                newValue=(initVal * 22.413996)/MolWeight
            }else if(toDim==='liquidvolflow'){
                // console.log('SpGravity >>>>>>>>>>>>>>>>>>>>>>>>>>>> ',{liq2Flag,SpGravity:payloadData['SpGravity'],SpGravityLiquid:payloadData['SpGravityLiquid'],SpGravityLiquid2:payloadData['SpGravityLiquid2'],SpGravityFlag:payloadData['SpGravity']??liq2Flag?payloadData['SpGravityLiquid2']:payloadData['SpGravityLiquid']})
                let SpGravity=Number(VacuumFlag?payloadData['SpGravityVacuum']:payloadData['SpGravity']!==undefined && payloadData['SpGravity']!==null && payloadData['SpGravity']!==''?payloadData['SpGravity']:liq2Flag?payloadData['SpGravityLiquid2']:payloadData['SpGravityLiquid']);
                if(SpGravity==0 || SpGravity=='' || SpGravity==undefined || SpGravity==null){
                    return '';
                }
                // newValue = initVal.dividedBy(1000).dividedBy(SpGravity);
                newValue=initVal /(1000*SpGravity)
            }
            break;
        case 'gasvolflowact':
            if(toDim==='massflow'){
                const [P1,T]=unitConversion(units,payloadData,VacuumFlag);
                const MolWeight=Number(VacuumFlag?payloadData['MolWeightVacuum']:payloadData['MolWeight']);
                // newValue=P1.dividedBy(1.01325).multipliedBy(273.15).dividedBy(T).multipliedBy(initVal).multipliedBy(MolWeight).dividedBy(22.413996);
                newValue=(P1/1.01325)*(273.15/T)*((initVal * MolWeight)/22.413996);
            }else if(toDim==='gasvolflow'){
                const [P1,T]=unitConversion(units,payloadData,VacuumFlag);
                // newValue=P1.dividedBy(1.01325).multipliedBy(273.15).dividedBy(T).multipliedBy(initVal);
                newValue=(P1/1.01325)*(273.15/T)*initVal
            }
            break;
        case 'gasvolflow':
            if(toDim==='massflow'){
                const MolWeight=VacuumFlag?payloadData['MolWeightVacuum']:payloadData['MolWeight'];
                // newValue=initVal.dividedBy(22.413996).multipliedBy(MolWeight);
                newValue=(initVal * MolWeight)/22.413996;
            }else if(toDim==='gasvolflowact' ){
                
                const [P1,T]=unitConversion(units,payloadData,VacuumFlag);
                // newValue=initVal.multipliedBy(1.01325).dividedBy(P1).multipliedBy(T).dividedBy(273.15);
                newValue=(1.01325/P1)*(T/273.15)*initVal
                // console.log('UniConversion >>>> first conversion 33333 >>>>>>>>>>>>>>>> ',initVal, fromDim,toDim,VacuumFlag,P1,T,newValue)
            }
            break;
        case 'liquidvolflow':
            if(toDim==='massflow'){
                let SpGravity=Number(VacuumFlag?payloadData['SpGravityVacuum']:payloadData['SpGravity']!==undefined && payloadData['SpGravity']!==null && payloadData['SpGravity']!==''?payloadData['SpGravity']:liq2Flag?payloadData['SpGravityLiquid2']:payloadData['SpGravityLiquid']);
                // newValue=initVal.multipliedBy(1000).multipliedBy(SpGravity);
                newValue=initVal*1000*SpGravity;
            }
            break;
        case 'viscositykin':
            if(toDim==='viscosity'){
                let SpGravity=Number(VacuumFlag?payloadData['SpGravityVacuum']:payloadData['SpGravity']!==undefined && payloadData['SpGravity']!==null && payloadData['SpGravity']!==''?payloadData['SpGravity']:liq2Flag?payloadData['SpGravityLiquid2']:payloadData['SpGravityLiquid']);
                // newValue=initVal.multipliedBy(SpGravity);
                newValue=initVal*SpGravity;
            }
            break;
        case 'viscosity':
            if(toDim==='viscositykin'){
                let SpGravity=Number(VacuumFlag?payloadData['SpGravityVacuum']:payloadData['SpGravity']!==undefined && payloadData['SpGravity']!==null && payloadData['SpGravity']!==''?payloadData['SpGravity']:liq2Flag?payloadData['SpGravityLiquid2']:payloadData['SpGravityLiquid']);
                if(SpGravity===0 || SpGravity==='' || SpGravity===undefined || SpGravity===null){
                    return '';
                }
                // newValue=initVal.dividedBy(SpGravity);
                newValue=initVal/SpGravity
            }
            break;
        default:
            newValue=initVal
    }
    const returnValue=convertUnit(newValue, toUnit1, toUnit,uoms);
    // console.log('Popup Change 11111 >>>>>>>>>>>>>>>UniConversion >>>>>>>>>>>>>>>> ',value,newValue, fromUnit, toUnit,returnValue)
    return isNaN(returnValue)?'':returnValue;
}

export const getConvertedValue=(value,unitValue,fieldName,uom,dimensionUnits,units,selectedFields,payloadData)=>{
    const oldUom=dimensionUnits?.find(unit => unit.UnitKey===unitValue);
    const newUom=dimensionUnits?.find(unit => unit.UnitKey===uom);
    let localValue=selectedFields.find((item)=>item.name===fieldName);
    
    if(localValue===undefined){
        localValue=value
    }else{
        localValue=localValue.value;
    }

    const VacuumFlag=fieldName==='SetVacuum' || fieldName==='UnderPressure' || fieldName==='WreqV' || fieldName.indexOf('Vacuum')!==-1?true:false;
    const liq2Flag=fieldName.indexOf('Liquid2')!==-1?true:false;
    // console.log('In get Converted Value >>>>>>>.>>>>>>>>>> ',fieldName,liq2Flag,fieldName.indexOf('Liquid2'))
    let newValue=convertUnitDiffDims(localValue, oldUom, newUom,units,payloadData,VacuumFlag,liq2Flag) //:convertUnit(localValue, oldUom, newUom,units)
    //console.log('In useUnitConverter newVal 888888 ::: ',fieldName, newValue)
    newValue=newValue=='0'?"0.000" :newValue

    return newValue
}