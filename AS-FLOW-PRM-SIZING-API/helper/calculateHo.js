var { Tho, P1ho, ho } = require("../helper/hoinput");

const conevrtedTemp = (val, tempUOM) => {
   const temp_uom = tempUOM.split(".")[1];
   if(temp_uom === "degF"){
       return val
   }

   if(temp_uom === "degC"){
       return (val * 9/5) + 32
   }

   if(temp_uom === "degR"){
       return val - 459.67
   }

   if(temp_uom === "degK"){
       return (val - 273.15) * 9/5 + 32
   }
}

const hoForExactMatch = (P1, TempF) => {
   const hoValue = findValueFromHoJson(TempF, P1);
   return hoValue;
}

const findValueFromHoJson = (TempF, P1) => {
   const p1Index = P1ho.indexOf(P1);
   const objectToMap = ho[p1Index];
   let hoValue = null;
   Object.keys(objectToMap).forEach(key => {
      if (Number(key).toFixed(3).toString().includes(TempF.toFixed(3).toString())) {
         hoValue = objectToMap[key]
      }
   })

   return hoValue;
}

const combinationOfLesserAndGreaterP1AndT = (P1, TempF) => {
   let lesserT = null;
   let higherT = null;
   let lesserP1 = null;
   let higherP1 = null;
   let combination = {}

   for (let i = 0; i < Tho.length; i++) {
      const el = Tho[i];
      if (el < TempF) {
         lesserT = el
      } else if (el > TempF && higherT === null) {
         higherT = el;
         break;
      }
   }

   for (let i = 0; i < P1ho.length; i++) {
      const el = P1ho[i];
      if (el < P1) {
         lesserP1 = el
      } else if (el > P1 && higherP1 === null) {
         higherP1 = el;
         break;
      }
   }

   combination.topLeft = {
      T: lesserT,
      P1: lesserP1
   }
   combination.topRight = {
      T: higherT,
      P1: lesserP1
   }
   combination.bottomLeft = {
      T: lesserT,
      P1: higherP1
   }
   combination.bottomRight = {
      T: higherT,
      P1: higherP1
   }

   Object.keys(combination).forEach(key => {
      const hoValue = findValueFromHoJson(combination[key].T, combination[key].P1);
      combination[key].value = Number(hoValue);
   })

   console.log(combination)
   return combination;
}

const interPolate = (x, x0, x1, y0, y1) => {
   // If x0 = x1, then the two given points are actually the same point on the line, and either
   // y0 or y1 can be taken as the interpolated value
   let interpolatedValue = y0;
   if (x0 !== x1) {
      let m = (y1 - y0) / (x1 - x0);
      interpolatedValue = y0 + m * (x - x0);
   }

   return interpolatedValue;
}

//Stagnation Enthalpy
const hoValue = async(p1value, Temp, tempUom, convertUnit, prefCalculationMethod) => {
   const TempF = conevrtedTemp(Number(Temp), tempUom);
   let P1 = p1value;
   let ho = null;

   if(prefCalculationMethod !== "English"){
      P1 = await convertUnit("abspressure.bara", "abspressure.psia", P1)
      P1 = Number(P1)
   }

   // if exact match, return the equivalent value
   if (Tho[TempF] && P1ho[P1]) {
      ho = hoForExactMatch(P1, TempF);
      return ho;
   }

   if(TempF < 211.968 || P1 < 14.7){
      return 1150.3;
   }

   if(TempF > 1200 || P1 > 6000){
      return 1507.9;
   }

   // If not an exactMatch, get the combination
   let combination = combinationOfLesserAndGreaterP1AndT(P1, TempF);
   const interpolationAB = interPolate(TempF, combination.topLeft.T, combination.topRight.T, combination.topLeft.value, combination.topRight.value);
   const interpolationBC = interPolate(P1, combination.topRight.P1, combination.bottomRight.P1, combination.topRight.value, combination.bottomRight.value);

   const hoValue = (interpolationBC / combination.topRight.value) * interpolationAB;
   return hoValue;
};

module.exports = hoValue;
