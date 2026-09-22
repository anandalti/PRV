import bigNumber from 'bignumber.js';

export const BigNumber = bigNumber.clone({ DECIMAL_PLACES: 14, ROUNDING_MODE: bigNumber.ROUND_HALF_CEIL });

const checkForValidValue = (value = "") => {
  if (!value && value !== 0) return "";
  return Number(BigNumber(value).toPrecision(14));
};

export const convertUnit = (value, fUnit, tUnit) => {
  if(!value){
      return '';
  }
  const inputValue = BigNumber(value);
  const fromUF = BigNumber(fUnit.UnitFactor);
  const toUF = BigNumber(tUnit.UnitFactor);
  if(fUnit.UnitKey === tUnit.UnitKey){
      return inputValue.isNaN() ? '' : checkForValidValue(inputValue);
  }

  let toValue = inputValue
      .plus(fUnit.UnitOffset)
      .dividedBy(fromUF)
      .multipliedBy(toUF)
      .minus(tUnit.UnitOffset);

  toValue = toValue.isNaN()
      ? ''
      : toValue
  const returnVal = checkForValidValue(toValue);
  return returnVal;
};
