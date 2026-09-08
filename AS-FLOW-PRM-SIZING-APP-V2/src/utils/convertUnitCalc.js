import BigNumber from "bignumber.js";
export const getUnit = (factors, unit) => {
  return factors.find(factor => factor.UnitKey == unit);
}

export const convertUnit = (uom, value, fUnit, tUnit) => {
  // console.log('123');
  if (fUnit === tUnit) {
    return value;
  }
  // console.log('1234');
  // console.log({value});
  if (value !== "") {
    // console.log({fUnit,tUnit,value});
    let inputValue = new BigNumber(value);
    // console.log({inputValue});
    let fromUnit = getUnit(uom, fUnit);
    // console.log({fromUnit});
    let toUnit = getUnit(uom, tUnit);
    // console.log({toUnit});
    const fromUnitFactor = parseFloat(fromUnit["UnitFactor"]);
    const toUnitFactor = parseFloat(toUnit["UnitFactor"]);
    // console.log({ fromUnitFactor, toUnitFactor });
    let toValue = inputValue.plus(fromUnit.UnitOffset).dividedBy(fromUnitFactor).multipliedBy(toUnitFactor).minus(toUnit.UnitOffset);
    toValue = isNaN(toValue) ? toValue : Math.round(toValue) == toValue ? Math.round(toValue.toString()) : toValue.toString();// round(toValue,3);//round(toValue,toUnit.Displayprecision);
    // console.log({toValue});
    return toValue;
  }
  return value;
}