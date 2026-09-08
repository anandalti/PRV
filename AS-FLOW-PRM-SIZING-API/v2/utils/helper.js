const bigNumber= require("bignumber.js");
const MathJS = require("mathjs");
const { Equation_1p5a, Equation_1p3a, Equation_1p5b, Equation_1p3b } = require("../service/calculations/Equations");
const CONVERT_TOFIXED_DECIMALS = 19;

const BigNumber = bigNumber.clone({ DECIMAL_PLACES: 19, ROUNDING_MODE: bigNumber.ROUND_HALF_CEIL });

const modelNumbersMAWP = [
  "4020H",
  "4040H",
  "4142HF",
  "4142HV",
  "4110H",
  "4410H",
  "4130H",
  "4020HP",
  "4020HC",
  "4020HV",
  "4040HP",
  "4040HC",
  "4040HV",
  "4110HV",
  "4142HFP",
  "4142HVV",
  "4130HP",
  "4410HV",
  "3500B",
  "3500S",
  "3600B",
  "3650B",
  "3650S",
  "96A",
];

function addNumbers(a, b) {
  return a + b;
}

function getFilteredData(data) {
  return Object.keys(data).reduce((acc, key) => {
    if (key !== "sd_id" && key !== "Id") {
      acc[key] = data[key];
    }
    return acc;
  }, {});
}

function getFormatedValues(data) {
  return Object.values(data).map(value => { return getFormatedValue(value); });;
}

function getFormatedValue(value) {
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''")}'`;
  } else if (typeof value === 'number') {
    return value;
  } else if (typeof value === 'boolean') { // Handle boolean values
    return value.toString();
  } else if (typeof value === 'object' && value !== null) {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  } else {
    return 'NULL'; // SQL NULL keyword — Array.join() preserves it as-is (unlike JS null which becomes empty string)
  }
}
const Variables = [
  {
    "Variable": "Tn",
    "English": "temp.degR",
    "Metric": "temp.degK"
  },
  {
    "Variable": "Tsat",
    "English": "temp.degR",
    "Metric": "temp.degK"
  },
  {
    "Variable": "Twater",
    "English": "temp.degR",
    "Metric": "temp.degK"
  },
  {
    "Variable": "TdesignMin",
    "English": "temp.degR",
    "Metric": "temp.degK"
  },
  {
    "Variable": "TdesignMax",
    "English": "temp.degR",
    "Metric": "temp.degK"
  },
  {
    "Variable": "MAWV",
    "English": "pressure.psig",
    "Metric": "pressure.barg"
  },
  {
    "Variable": "Vtank",
    "English": "pressure.psig",
    "Metric": "pressure.barg"
  },
  {
    "Variable": "Vover",
    "English": "pressure.psig",
    "Metric": "pressure.barg"
  },
  {
    "Variable": "Pn",
    "English": "pressure.psig",
    "Metric": "pressure.barg"
  },
  {
    "Variable": "Patm",
    "English": "abspressure.psia",
    "Metric": "abspressure.bara"
  },
  {
    "Variable": "MAWP",
    "English": "pressure.psig",
    "Metric": "pressure.barg"
  },
  {
    "Variable": "P2p",
    "English": "",
    "Metric": ""
  },
  {
    "Variable": "Pover",
    "English": "pressure.psig",
    "Metric": "pressure.barg"
  },
  {
    "Variable": "P1p",
    "English": "",
    "Metric": ""
  },
  {
    "Variable": "Ptank",
    "English": "pressure.psig",
    "Metric": "pressure.barg"
  },
  {
    "Variable": "Tmax",
    "English": "",
    "Metric": ""
  },
  {
    "Variable": "DeltaPv",
    "English": "pressure.psig",
    "Metric": "pressure.barg"
  },
  {
    "Variable": "Mu",
    "English": "viscosity.cp",
    "Metric": "viscosity.cp"
  },
  {
    "Variable": "T",
    "English": "temp.degR",
    "Metric": "temp.degK"
  },
  {
    "Variable": "Ppso",
    "English": "pressure.psig",
    "Metric": "pressure.barg"
  },
  {
    "Variable": "Pset",
    "English": "pressure.psig",
    "Metric": "pressure.barg"
  },
  {
    "Variable": "Ppn",
    "English": "pressure.psig",
    "Metric": "pressure.barg"
  },
  {
    "Variable": "Vset",
    "English": "pressure.psig",
    "Metric": "pressure.barg"
  },
  {
    "Variable": "Pback",
    "English": "pressure.psig",
    "Metric": "pressure.barg"
  },
  {
    "Variable": "DeltaP",
    "English": "pressure.psig",
    "Metric": "pressure.barg"
  }
]

const getConstants = (calcMethod) => {
  const constants = {};
  CONSTANTS.forEach(c => {
    constants[c.Name] = Number(c[calcMethod]);
  });
  return constants;
}

const getConstantsWithName = (calcMethod, Name) => {
  let obj = CONSTANTS.find(c => c.Name === Name);
  return obj ? obj[calcMethod] : 1;
}

const evaluateLimits = (limits, params, ModelNumber) => {
  if (!limits || limits.length === 0)
    return {
      result: true,
      failedExpressions: [],
    };

  // let allResultFalse = false;
  // let anyResultTrue = false;
  // let anyExists = false;
  // const allFailedExpressions = [];
  // let anyFailedExpressions = [];

  let allResult = true;
  let anyResult = false;
  let anyExists = false;
  const allFailedExpressions = [];
  let anyFailedExpressions = [];

  const nullAllLimits = limits.filter(limit => limit.SizeCode === null && limit.AnyOrAll === "All");
  const nullAnyLimits = limits.filter(limit => limit.SizeCode === null && limit.AnyOrAll === "Any");
  const notNullAllLimits = limits.filter(limit => limit.SizeCode !== null && limit.AnyOrAll === "All");
  const notNullAnyLimits = limits.filter(limit => limit.SizeCode !== null && limit.AnyOrAll === "Any");
    // if(ModelNumber=='3650B'){
    //   console.log(' >>>>>>>>>>>>>>>>>>>> ', ModelNumber, nullAllLimits,  notNullAllLimits, params);
    // }
  for (const limit of nullAllLimits) {
    evaluateLimit(limit, params,ModelNumber);
    // if(ModelNumber=='3650B'){
    //   console.log('3650B >>>>>>>>>>>>>>>>>>>> ', limit, params);
    // }
    if (!limit.result) {
      allResult = false;
      allFailedExpressions.push(limit.failedExpression);
    }
  }
  for (const limit of nullAnyLimits) {
    if(allFailedExpressions.length) {
      anyResult = false;
    }
    evaluateLimit(limit, params);
    anyExists = true;
    
    if (limit.result) {
      anyResult = true;
    } else if (!anyResult) {
      anyFailedExpressions.push(limit.failedExpression);
    }
  }
  
const useOrCondition = (ModelNumber == 81 || ModelNumber == 84);
if (
    useOrCondition
        ? (!allFailedExpressions.length || !anyFailedExpressions.length)
        : (!allFailedExpressions.length && !anyFailedExpressions.length)
) {

  //if(!allFailedExpressions.length && !anyFailedExpressions.length) {
    for (const limit of notNullAllLimits) {
      evaluateLimit(limit, params);

      if (!limit.result) {
        allResult = false;
        allFailedExpressions.push(limit.failedExpression);
      }
    }
    for (const limit of notNullAnyLimits) {
      if(allFailedExpressions.length) {
        anyResult = false;
      }
      evaluateLimit(limit, params);
      anyExists = true;
      if (limit.result) {
        anyResult = true;
      } else if (!anyResult) {
        anyFailedExpressions.push(limit.failedExpression);
      }
    }
  }

  if(allFailedExpressions.length || (anyExists && !anyResult)) {
    return {
      result: false,
      failedExpressions: Array.from(new Set([...anyFailedExpressions, ...allFailedExpressions])),
    }
  } else {
    return {
      result: true,
      failedExpressions: []
    }
  }

  // for (const limit of limits) {
  //   evaluateLimit(limit, params);
  //   let expressionTrue = limit.result;
  //   let anyOrAll = limit.AnyOrAll;

  //   if(anyOrAll === "All" && !expressionTrue) {
  //     allResultFalse = true;
  //     allFailedExpressions.push(limit.failedExpression);
  //     break;
  //   }
  //   if(anyOrAll === "Any") {
  //     anyExists = true;
  //     if(expressionTrue) {
  //       anyResultTrue = true;
  //     } else {
  //       anyFailedExpressions.push(limit.failedExpression);
  //     }
  //   }
  // }

  // if(allResultFalse || (anyExists && !anyResultTrue)) {
  //   return {
  //     result: false,
  //     failedExpressions: Array.from(new Set([...allFailedExpressions, ...anyFailedExpressions])),
  //   }
  // } else {
  //   return {
  //     result: true,
  //     failedExpressions: []
  //   }
  // }
};

// const evaluateLimit = (limit, params) => {
//   limit.result = true;
//   limit.filteredExpression = [];
//   limit.failedExpression = null;
//   if (limit.parsedExpression) {
//     for (const expression of limit.parsedExpression) {
//       limit.filteredExpression.push(expression);
//       let result = false;
//       if (expression.variables.find((v) => v === "T")) {
//         result = evaluateTExpression(expression, params);
//       } else if (!expression.variables.find(v => !Object.hasOwn(params, v) || ['', null].includes(params[v]))) {
//         result = evaluateExpression(expression, params);
//       }
//       if (!result) {
//         limit.result = false;
//         limit.failedExpression = expression.originalExpression;
//         break;
//       }
//     }
//   }
// };

const evaluateLimit = (limit, params, ModelNumber=null) => {
  limit.result = true;
  limit.filteredExpression = [];
  limit.failedExpression = null;
  if (limit.parsedExpression) {
    for (const expression of limit.parsedExpression) {
      //if (!expression.variables.find((v) => !params[v])) {
      //if (!expression.variables.find(v => !Object.hasOwn(params, v) || ['', null].includes(params[v]))) {
      if (!expression.variables.find(v => !Object.hasOwn(params, v))) {
        limit.filteredExpression.push(expression);
        let result = true;
        if (expression.variables.find((v) => v === "T")) {
          result = evaluateTExpression(expression, params);
        } else if(!expression.variables.find(v =>['', null].includes(params[v]))){
          // if(ModelNumber=='3650B'){
          //   console.log('3650B >>>>>>>>>>>>>>>>>>>> ', ModelNumber, expression);
          // }
          // console.log('Expression >>>> ', expression,params);
          result = evaluateExpression(expression, params);
        }
        if (!result) {
          limit.result = false;
          limit.failedExpression = expression.originalExpression;
          break;
        }
      }
    }
  }
};

const evaluateExpression = (expression, params) => {
  const exprn = expression.expression;
  let comparator = null;
  let operator = null;
  if (exprn.indexOf("<=") !== -1) {
    operator = "<=";
    comparator = MathJS.smallerEq;
  } else if (exprn.indexOf("<") !== -1) {
    operator = "<";
    comparator = MathJS.smaller;
  } else if (exprn.indexOf(">=") !== -1) {
    operator = ">=";
    comparator = MathJS.largerEq;
  } else if (exprn.indexOf(">") !== -1) {
    operator = ">";
    comparator = MathJS.larger;
  } else if (exprn.indexOf("==") !== -1) {
    operator = "==";
    comparator = MathJS.equal;
  } else if (exprn.indexOf("!=") !== -1) {
    operator = "!=";
    comparator = MathJS.unequal;
  } else {
    throw "Unknown expression encountered!";
  }

  const parts = exprn.split(operator);
  let lhs = parts[0].trim();
  let rhs = parts[1].trim();

  expression.variables
    .sort((a, b) => a.length - b.length)
    .forEach((v) => {
      lhs = lhs.replace(v, params[v]);
      rhs = rhs.replace(v, params[v]);
    });
  const result = comparator(MathJS.evaluate(lhs), MathJS.evaluate(rhs));
    return result;
};

const evaluateTExpression = (expression, params) => {
  let result = true;
  if (params["T"] && params.SizingBasis !== "Fire Case")
    result = evaluateExpression(expression, { T: params["T"] });

  if (result && params["Tn"])
    result = evaluateExpression(expression, { T: params["Tn"] });

  if (
    result &&
    params["TdesignMin"] &&
    expression.expression.indexOf(">") !== -1
  )
    result = evaluateExpression(expression, { T: params["TdesignMin"] });

  if (
    result &&
    params["TdesignMax"] &&
    expression.expression.indexOf("<") !== -1
  )
    result = evaluateExpression(expression, { T: params["TdesignMax"] });
  
    if (
    result &&
    params["T"] &&
    expression.variables[0] === 'T' &&
    params['workflowId'] == 14
  )
    result = evaluateExpression(expression, { T: params["T"] });

  return result;
};



const CONSTANTS = [
  {
    "_id": "6007da029a97bc001c8dd9d1",
    "Name": "N6",
    "Description": "Constant for Gas Reactive Force - Static Load Part",
    "English": "1",
    "Metric": "10"
  },
  {
    "_id": "6007da029a97bc001c8dd9ef",
    "Name": "N37_1",
    "Description": "Constant for Wetted Fire Sizing Heat Input : Adequate Drainage & Fire Fighting Efforts Exist",
    "English": "21000",
    "Metric": "43200"
  },
  {
    "_id": "6007da029a97bc001c8dd9d7",
    "Name": "N13",
    "Description": "Constant for Liquid Volumetric Flow",
    "English": "38",
    "Metric": "5.09338"
  },
  {
    "_id": "6007da029a97bc001c8dd9dc",
    "Name": "N18",
    "Description": "Constant for Napier Correction Factor - Denominator",
    "English": "0.2292",
    "Metric": "3.32426494877678"
  },
  {
    "_id": "6007da029a97bc001c8dd9d6",
    "Name": "N11",
    "Description": "Constant for Wetted Surface Area - API 2000",
    "English": "30",
    "Metric": "9.14"
  },
  {
    "_id": "6007da029a97bc001c8dd9e0",
    "Name": "N22",
    "Description": "Constant for Gas Reactive Force - Moment",
    "English": "0.03593452072719",
    "Metric": "0.235617201"
  },
  {
    "_id": "6007da029a97bc001c8dd9e1",
    "Name": "N23",
    "Description": "Constant for Gas Reactive Force - Static",
    "English": "1",
    "Metric": "10"
  },
  {
    "_id": "6007da029a97bc001c8dd9d3",
    "Name": "N8",
    "Description": "Constant for Noise Level Alternate Distances",
    "English": "100",
    "Metric": "30"
  },
  {
    "_id": "6007da029a97bc001c8dd9cc",
    "Name": "N1",
    "Description": "Constant for Sub-critical Gas Volumetric Flow",
    "English": "278700",
    "Metric": "12515"
  },
  {
    "_id": "6007da029a97bc001c8dd9dd",
    "Name": "N19",
    "Description": "Constant for Wetted Surface Area - API 521",
    "English": "25",
    "Metric": "7.62"
  },
  {
    "_id": "6007da029a97bc001c8dd9ee",
    "Name": "N36",
    "Description": "Constantfor Fire Sizing Factor",
    "English": "0.1406",
    "Metric": "0.15183"
  },
  {
    "_id": "6007da029a97bc001c8dd9e4",
    "Name": "N26",
    "Description": "Constant 1 for Mass Flux",
    "English": "68.09",
    "Metric": "113.84"
  },
  {
    "_id": "6007da029a97bc001c8dd9e6",
    "Name": "N28",
    "Description": "Constant for 2-phase capacity calculation",
    "English": "25",
    "Metric": "1"
  },
  {
    "_id": "6007da029a97bc001c8dd9f6",
    "Name": "N44_1",
    "Description": "Constant for Product Movement - Non Volatile Fluid",
    "English": "8.02",
    "Metric": "1"
  },
  {
    "_id": "6007da029a97bc001c8dd9ce",
    "Name": "N3",
    "Description": "Constant for Critical Gas Volumetric Flow",
    "English": "6.32",
    "Metric": "22.421524664"
  },
  {
    "_id": "6007da029a97bc001c8dd9e5",
    "Name": "N27",
    "Description": "Constant 2 for Mass Flux",
    "English": "96.3",
    "Metric": "161"
  },
  {
    "_id": "6007da029a97bc001c8dd9ec",
    "Name": "N34",
    "Description": "Constant for Outlet Static Pressure",
    "English": "0.00245",
    "Metric": "0.003225"
  },
  {
    "_id": "6007da029a97bc001c8dd9d4",
    "Name": "N9",
    "Description": "Constant for Emergency Venting - Lesser Accuracy",
    "English": "1107",
    "Metric": "208.2"
  },
  {
    "_id": "6007da029a97bc001c8dd9d0",
    "Name": "N5",
    "Description": "Constant for Gas Reactive Force - Moment Part",
    "English": "366",
    "Metric": "27.906976744186"
  },
  {
    "_id": "6007da029a97bc001c8dd9d9",
    "Name": "N15",
    "Description": "Constant for Liquid Reaction Force",
    "English": "2.002",
    "Metric": "20.02"
  },
  {
    "_id": "6007da029a97bc001c8dd9cf",
    "Name": "N4",
    "Description": "Constant for Critical Gas Mass Flow",
    "English": "1",
    "Metric": "1"
  },
  {
    "_id": "6007da029a97bc001c8dd9de",
    "Name": "N20",
    "Description": "Constant for Steam Stagnation Pressure",
    "English": "0.02763555520128",
    "Metric": "0.018120214"
  },
  {
    "_id": "6007da029a97bc001c8dd9e3",
    "Name": "N25",
    "Description": "Constant 2 for Natural Omega",
    "English": "0.185",
    "Metric": "100"
  },
  {
    "_id": "6007da029a97bc001c8dd9f5",
    "Name": "N43",
    "Description": "Constant for Liquid Mass Flow",
    "English": "19027.5",
    "Metric": "5093.38"
  },
  {
    "_id": "6007da029a97bc001c8dd9e9",
    "Name": "N31",
    "Description": "Constant for 2-Phase Reactive Force - Static",
    "English": "1",
    "Metric": "0.1"
  },
  {
    "_id": "6007da029a97bc001c8dd9e2",
    "Name": "N24",
    "Description": "Constant 1 for Natural Omega",
    "English": "0.37",
    "Metric": "200"
  },
  {
    "_id": "602de1da69fd7b001c169f0c",
    "Name": "N222N1b",
    "Description": "Taken from ConstantDefinitionLibrary, check if it is in Appendix C",
    "English": "1",
    "Metric": "6894.75729318"
  },
  {
    "_id": "6007da029a97bc001c8dd9d8",
    "Name": "N14",
    "Description": "Constant for Reynolds Number Calculation",
    "English": "2800",
    "Metric": "31333.333333333"
  },
  {
    "_id": "6007da029a97bc001c8dd9da",
    "Name": "N16",
    "Description": "Constant for Steam Mass Flow",
    "English": "51.5",
    "Metric": "52.5"
  },
  {
    "_id": "6007da029a97bc001c8dd9e7",
    "Name": "N29",
    "Description": "Constant for 2-phase capacity calculation",
    "English": "0.3208",
    "Metric": "1"
  },
  {
    "_id": "6007da029a97bc001c8dd9e8",
    "Name": "N30",
    "Description": "Constant for 2-Phase Reactive Force - Moment",
    "English": "2898000",
    "Metric": "1296"
  },
  {
    "_id": "6007da029a97bc001c8dd9ea",
    "Name": "N32",
    "Description": "Constant for Tank Blanketing Regulator",
    "English": "907",
    "Metric": "263"
  },
  {
    "_id": "6007da029a97bc001c8dd9cd",
    "Name": "N2",
    "Description": "Constant for Sub-critical Gas Mass Flow",
    "English": "735",
    "Metric": "560"
  },
  {
    "_id": "6007da029a97bc001c8dd9d2",
    "Name": "N7",
    "Description": "Constant for Noise Level",
    "English": "0.29354",
    "Metric": "1.1552"
  },
  {
    "_id": "6007da029a97bc001c8dd9d5",
    "Name": "N10",
    "Description": "Constant for Emergency Venting - Higher Accuracy",
    "English": "3.091",
    "Metric": "906.6"
  },
  {
    "_id": "6007da029a97bc001c8dd9f1",
    "Name": "N38",
    "Description": "Constant for Wetted Fire Sizing Rqd. Flow",
    "English": "1",
    "Metric": "3600"
  },
  {
    "_id": "602de1b669fd7b001c169f0b",
    "Name": "N222N1a",
    "Description": "Taken from ConstantDefinitionLibrary, check if it is in Appendix C",
    "English": "1",
    "Metric": "100000"
  },
  {
    "_id": "6007da029a97bc001c8dd9db",
    "Name": "N17",
    "Description": "Constant for Napier Correction Factor - Numerator",
    "English": "0.1906",
    "Metric": "2.7644192811381"
  },
  {
    "_id": "6007da029a97bc001c8dd9f2",
    "Name": "N40",
    "Description": "Constant for Theoretical Kb",
    "English": "735",
    "Metric": "558.034615384615"
  },
  {
    "_id": "6007da029a97bc001c8dd9f3",
    "Name": "N41",
    "Description": "Constant for Appendix 11 Equation",
    "English": "197",
    "Metric": "200.88"
  },
  {
    "_id": "6007da029a97bc001c8dd9f8",
    "Name": "N45",
    "Description": "Constant for Thermal Out-breathing",
    "English": "1.51",
    "Metric": "1"
  },
  {
    "_id": "6007da029a97bc001c8dd9ed",
    "Name": "N35",
    "Description": "Constant for Unwetted Fire Sizing Rqd Area",
    "English": "1",
    "Metric": "18.235"
  },
  {
    "_id": "6007da029a97bc001c8dd9f4",
    "Name": "N42",
    "Description": "Constant for Appendix 11 Equation",
    "English": "3",
    "Metric": "10.36"
  },
  {
    "_id": "6007da029a97bc001c8dd9eb",
    "Name": "N33",
    "Description": "Constant for Gas Constant",
    "English": "520",
    "Metric": "394.8"
  },
  {
    "_id": "6007da029a97bc001c8dd9f9",
    "Name": "N46",
    "Description": "Constant for Thermal In-breathing",
    "English": "3.08",
    "Metric": "1"
  },
  {
    "_id": "6007da029a97bc001c8dd9df",
    "Name": "N21",
    "Description": "Constant for Enthalpy Delta",
    "English": "823",
    "Metric": "1914.3"
  },
  {
    "_id": "6007da029a97bc001c8dd9f0",
    "Name": "N37_2",
    "Description": "Constant for Wetted Fire Sizing Heat Input : Adequate Drainage & Fire Fighting Efforts Do Not Exist",
    "English": "34500",
    "Metric": "70900"
  },
  {
    "_id": "6007da029a97bc001c8dd9f7",
    "Name": "N44_2",
    "Description": "Constant for Product Movement - Volatile Fluid",
    "English": "16.04",
    "Metric": "2"
  },
  {
    "_id": "6007da029a97bc004c7dd7f4",
    "Name": "N47",
    "Description": "Constant for Annex B (Deviation for Ideal Gas)",
    "English": "25",
    "Metric": "1"
  }
]

const evalFactor = (expression) => MathJS.evaluate(expression.replace(/\*\*/g, "^"));

const checkForValidValue = (value = "") => {
  if (!value && value !== 0) return "";
  return Number(BigNumber(value).toFixed());
};
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
const convertUnit = (value, fromUnit, toUnit) => {
  if(value==='' || value===null || value===undefined){
      return value;
  }
  if(fromUnit===undefined || toUnit===undefined){
      console.log('fromUnit or toUnit is undefined >>>>>>>>>>>>>>>>> ',value, fromUnit, toUnit);
  }
  const inputValue = BigNumber(value);
  let fromUF, toUF;
  if(fromUnit.DimensionName === 'pressure' && fromUnit.DimensionName === 'abspressure') {
    fromUF = BigNumber(BigNumber(fromUnit.UnitFactor).toFixed(11));
    toUF = BigNumber(BigNumber(toUnit.UnitFactor).toFixed(11));
  } else {
    fromUF = BigNumber(BigNumber(fromUnit.UnitFactor).toFixed(9));
    toUF = BigNumber(BigNumber(toUnit.UnitFactor).toFixed(9));
  }
  if(fromUnit.UnitKey === toUnit.UnitKey){
      return inputValue.isNaN() ? '' : Number(inputValue);//checkForValidValue(inputValue);
  }

  let toValue = inputValue
      .plus(fromUnit.UnitOffset)
      .multipliedBy(toUF)
      .dividedBy(fromUF)
      .minus(toUnit.UnitOffset);

  toValue = toValue.isNaN()
      ? ''
      : toValue
  const returnVal = toValue;//checkForValidValue(toValue);
  return Number(roundBigNumber(returnVal));
};

// const checkForValidValue = (value = "") => {
//   if (!value && value !== 0) return "";
//   return Number(value);
// };
// const convertUnit = (value, fromUnit, toUnit) => {
//   // console.log(value,fromUnit, toUnit);
//   if (fromUnit?.UnitKey === toUnit?.UnitKey) {
//     return value;
//   }
//   let toValue = (Number(value) + Number(fromUnit.UnitOffset))
//     / Number(fromUnit.UnitFactor)
//     * Number(toUnit.UnitFactor)
//     - Number(toUnit.UnitOffset);
//   toValue = Number.isInteger(toValue) ? Math.round(toValue).toString() : toValue.toString();
//   // console.log('In convertUnit >>>>>> ', value, fromUnit, toUnit, toValue);
//   return checkForValidValue(toValue);
// };

const unitConversion = (uoms, payloadData) => {
  // const pressureUOM=units['pressure'];
  // const absPressureUOM=units['abspressure'];
  // const temperatureUOM=units['temperature'];
  const currentUOM = {
    pressure: payloadData['PressureUOM'],
    abspressure: payloadData['AtmPressureUOM'],
    temperature: payloadData['TemperatureUOM'],
  };
  const requiredUOM = {
    pressure: 'pressure.barg',
    abspressure: 'abspressure.bara',
    temperature: 'temp.degK',
  };
  let Pset = payloadData['SetPressure'] ?? payloadData['VesselPressure'] ?? payloadData['DeltaPressure']
  Pset = convertUnit(Pset, uoms.find(u => u.UnitKey === currentUOM['pressure']), uoms.find(u => u.UnitKey === requiredUOM['pressure']));
  Pset = Pset === '' || Pset === undefined || Pset === null ? 0 : Pset; // Ensure Pset is a number
  let Pover = convertUnit(payloadData['OverPressure'], uoms.find(u => u.UnitKey === currentUOM['pressure']), uoms.find(u => u.UnitKey === requiredUOM['pressure']));
  Pover = Pover === '' || Pover === undefined || Pover === null ? 0 : Pover; // Ensure Pover is a number
  let Ploss = convertUnit(payloadData['InletLoss'], uoms.find(u => u.UnitKey === currentUOM['pressure']), uoms.find(u => u.UnitKey === requiredUOM['pressure']));
  Ploss = Ploss === '' || Ploss === undefined || Ploss === null ? 0 : Ploss; // Ensure Ploss is a number
  let Pabs = convertUnit(payloadData['AtmPressure'], uoms.find(u => u.UnitKey === currentUOM['abspressure']), uoms.find(u => u.UnitKey === requiredUOM['abspressure']));
  Pabs = Pabs === '' || Pabs === undefined || Pabs === null ? 0 : Pabs; // Ensure Pabs is a number
  const T = convertUnit(payloadData['Relieving'], uoms.find(u => u.UnitKey === currentUOM['temperature']), uoms.find(u => u.UnitKey === requiredUOM['temperature']));
  const Tv = convertUnit(payloadData['RelievingforVacuum'], uoms.find(u => u.UnitKey === currentUOM['temperature']), uoms.find(u => u.UnitKey === requiredUOM['temperature']));
  const P1 = Number(Pset) + Number(Pover) - Number(Ploss) + Number(Pabs);
  const P1v = Pabs;
  // console.log(' >>>>>>>>>>> ',payloadData['VacuumFlag'], Pabs, Pset, Pover, Ploss, P1, T,Number(Pset), Number(Pover), Number(Ploss), Number(Pabs));
  return payloadData['VacuumFlag']?[P1v, Tv]:[P1, T];
}

const convertUnitDiffDims = (value, fromUnit, toUnit, units, payloadData) => {
  // console.log( 'uoms >>>>>>>>>>>>>> ',value, fromUnit, toUnit)
  const fromDim = fromUnit['DimensionName'];
  const toDim = toUnit['DimensionName'];
  // console.log({units,fromDim,toDim});
  if (fromUnit?.UnitKey?.split('.')[0] === toUnit?.UnitKey?.split('.')[0]) {
    const returnValue = convertUnit(value, fromUnit, toUnit)
    // console.log('initialUnit 1111:: returnValue>>>>>>>>>>>>>>>>>>',returnValue)
    return returnValue;
  }
  let inputValue = Number(value);
  let uoms = units.filter(u => u['DimensionName'] === fromDim);
  const fromUnit1 = uoms.find(unit => unit["DimensionName"] === fromDim && unit['UnitFactor'] == 1);
  const initVal = convertUnit(inputValue, fromUnit, fromUnit1, uoms);

  // const initunit=targetGasVolFlowFlag?uoms['gasvolflow'].find(u => u.UnitKey==='gasvolflow.Nm3s'):uoms['gasvolflowact'].find(u => u.UnitKey==='gasvolflowact.m3s')
  uoms = units.filter(u => u['DimensionName'] === toDim);
  const toUnit1 = uoms.find(unit => unit["DimensionName"] === toDim && unit['UnitFactor'] == 1);

  let newValue = initVal;
  const SpGravity=payloadData['SpGravity'] ?? payloadData['SpGravityLiquid']
  switch (fromDim) {
    case 'massflow':
      if (toDim === 'gasvolflowact') {
        const [P1, T] = unitConversion(units, payloadData);
        newValue = (1.01325 / P1) * (T / 273.15) * ((initVal * 22.413996) / payloadData['MolWeight'])
      } else if (toDim === 'gasvolflow') {
        newValue = (initVal * 22.413996) / payloadData['MolWeight']
      } else if (toDim === 'liquidvolflow') {
        newValue = initVal / (1000 * payloadData['SpGravity'])
      }
      // console.log('111111 >>>>>>> >>>>>>>>>>>>> ',fromDim,toDim,initVal,newValue,payloadData['MolWeight'])
      break;
    case 'gasvolflowact':
      if (toDim === 'massflow') {
        const [P1, T] = unitConversion(units, payloadData);
        newValue = (P1 / 1.01325) * (273.15 / T) * ((initVal * payloadData['MolWeight']) / 22.413996);
      } else if (toDim === 'gasvolflow') {
        const [P1, T] = unitConversion(units, payloadData);
        // console.log(' P1>>>>>>>>>>>>>>>>>>>>>>> ',P1,T,initVal)
        newValue = (P1 / 1.01325) * (273.15 / T) * initVal
      }
      // console.log('222222 >>>>>>> >>>>>>>>>>>>> ',fromDim,toDim,initVal,newValue,payloadData['MolWeight'])
      break;
    case 'gasvolflow':
      if (toDim === 'massflow') {
        newValue = (initVal * payloadData['MolWeight']) / 22.413996;
      } else if (toDim === 'gasvolflowact') {
        const [P1, T] = unitConversion(units, payloadData);
        newValue = (1.01325 / P1) * (T / 273.15) * initVal
        // console.log(' >>>>>>>>>>>>>>>>>>>>>> ',P1,T,initVal,newValue)
      }
      // console.log('33333 >>>>>>> >>>>>>>>>>>>> ',fromDim,toDim,initVal,newValue,payloadData['MolWeight'])
      break;
    case 'liquidvolflow':
      if (toDim === 'massflow') {
        newValue = initVal * 1000 * payloadData['SpGravity']
      }
      break;
    case 'viscositykin':
      if (toDim === 'viscosity') {
        const spg=payloadData['SpGravity'] !=='' && payloadData['SpGravity'] !== undefined && payloadData['SpGravity'] !== null ? payloadData['SpGravity'] : 1;
        
        newValue = initVal * spg;
        // console.log(spg,initVal,newValue)
      }
      break;
    case 'viscosity':
      if (toDim === 'viscositykin') {
        const spg=payloadData['SpGravity'] !=='' && payloadData['SpGravity'] !== undefined && payloadData['SpGravity'] !== null ? payloadData['SpGravity'] : 1;
        newValue = initVal / spg;
        // console.log(spg,initVal,newValue)
      }
      break;
    default:
      newValue = initVal
  }

  const returnValue = convertUnit(newValue, toUnit1, toUnit, uoms);
  // console.log(' 222222222222 >>>>>>>>>>>>>>>>>>>>>> ',newValue,toUnit1?.UnitName,toUnit?.UnitName,returnValue)
  return returnValue;
}

const getParsedExpressions = (limits, variables, uom, calcMethod, params) => {
  const regex = /-?[\d.]+\s(temp|viscosity|pressure)\S+/;
  const variableEx = new RegExp(/[A-Za-z]+/);

  const parseExpression = (limit, uomHash, varHash) => {
    if (!limit.Expression) return [];

    return limit.Expression.split(";").map((exp) => {
      const matchIndex = exp.search(regex);
      if (matchIndex === -1) {
        const lhsVariables = exp.split(" ").filter((p) => variableEx.test(p));
        return { expression: exp, variables: lhsVariables, originalExpression: exp };
      }

      const lhs = exp.substr(0, matchIndex);
      const lhsVariables = lhs.split(" ").filter((p) => variableEx.test(p));
      const rhs = exp.substr(matchIndex).trim().split(" ");
      const value = parseFloat(rhs[0]);
      const unit = rhs[1];
      const fromUnit = uomHash[unit];
      const toUnit = varHash[lhsVariables[0]]?.[calcMethod] ? uomHash[varHash[lhsVariables[0]][calcMethod]] : fromUnit;
      const toValue = fromUnit.UnitKey === toUnit.UnitKey ? value : convertUnit(value, fromUnit, toUnit);
      return { expression: lhs + toValue, variables: lhsVariables, originalExpression: exp };
    });
  };

  const uomHash = Object.fromEntries(uom.map(entry => [entry.UnitKey, entry]));
  const varHash = Object.fromEntries(variables.map(entry => [entry.Variable, entry]));


  if (Array.isArray(limits)) {
    limits.forEach((limit) => {
      limit.parsedExpression = parseExpression(limit, uomHash, varHash);
    });
  }
  return limits;
};

let mapServiceWithPACode_old = (val) => {
  if (val == "Liquid") return "L";
  if (val == "Gas/Vapor") return "G";
  if (val == "Steam") return "S";
  // if (val == "2-Phase") return "2-phase";
  if (val == "Fire") return "G";
  return "G";
};
const TwoPhase_WF=[13,14,15,16, 17, 18, 19, 20, 21];
const TwoPhase_CDSeries_WF=[14,15, 17, 18, 20];

let mapServiceWithPACode = (val,wf) => {
  // return mapServiceWithPACode_old(val);
  if (val == "Liquid") return ['L'];
  if (val == "Gas/Vapor") return ["G"];
  if (val == "Steam") return ["S"];
  if (val == "2-Phase"){
    if(TwoPhase_WF.includes(wf)){
      return ['G','L'];
    }
    return ["G"];
  } 
  if (val == "Fire") return ["G"];
  return ["G"];
};

const ModelNumbers = {
  ModelJOSE: "JOS-E",
  ModelJLTJOSE: "JLT-JOS-E",
  ModelJLTJBSE: "JLT-JBS-E",
  ModelJLTJBSBPE: "JLT-JBS-BP-E",
  ModelJOSHE: "JOS-H-E",
  ModelJBSE: "JBS-E",
  ModelJBSBPE: "JBS-BP-E",
  ModelJOSE_Pound: "JOS-E#",
  ModelJBSE_Pound: "JBS-E#",
  ModelJOSHE_Pound: "JOS-H-E#",
  ModelJLTJOSE_Pound: "JLT-JOS-E#",
  ModelJLTJBSE_Pound: "JLT-JBS-E#",
  ModelJBSBPELD: "JBS-BP-E (Leak Detection)",
  ModelJLTJBSBPELD: "JLT-JBS-BP-E (Leak Detection)",
  ModelJDSE: "JDS-E",
  ModelJLTJDSE: "JLT-JDS-E",
  Model800: "800",
  Model900: "900",
  ModelBP: "BP",
  ModelHCI: "HCI",
  ModelHSJ: "HSJ",
  ModelHE: "HE",
  ModelHSL: "HSL",
  Model81P: "81P",
  Model61: "61",
  Model63: "63",
  Model81: "81",
  Model86: "86",
  Model83: "83",
  Model711: "711",
  Model3500B: "3500B",
  Model3600B: "3600B",
  Model3650B: "3650B",
  Model3500S: "3500S",
  Model3600S: "3600S",
  Model3650S: "3650S",
  Model9100ARC: "9100",
  Model9200ARC: "9200",
  Model7100ARC: "7100",
  Model5300ARC: "5300",
  Model243: "243",
  Model249: "249",
  Model253: "253",
  Model259: "259",
  Model263: "263",
  Model269: "269",
  Model443: "443",
  Model453: "453",
  Model463: "463",
  Model546: "546",
  Model566: "566",
  Model843: "843",
  Model853: "853",
  Model863: "863",
  Model5166: "5166",
  Model5146: "5146",
  ModelMLCP: "MLCP",
  ModelLCP: "LCP",
  Model727: "727",
  Model5247: "5247",
  Model93: "93",
  Model95: "95",
  Model9200V_SC: "9200V SC",
  Model9209V_SC: "9209V SC",
  Model9290C_SC: "9290C SC",
  Model9290P_SC: "9290P SC",
  Model9299C_SC: "9299C SC",
  Model9200V_DC: "9200V DC",
  Model9240C_DC: "9240C DC",
  Model9290C_DC: "9290C DC",
  Model9300V_SC: "9300V SC",
  Model9309V_SC: "9309V SC",
  Model9390C_SC: "9390C SC",
  Model9390P_SC: "9390P SC",
  Model9399C_SC: "9399C SC",
  Model9300V_DC: "9300V DC",
  Model9340C_DC: "9340C DC",
  Model9390C_DC: "9390C DC",
  Model96_A: "96A"
};

const hcflModels = {
  ModelHCFL_4020H: "4020H",
  ModelHCFL_4040H: "4040H",
  ModelHCFL_4142HF: "4142HF",
  ModelHCFL_4142HV: "4142HV",
  ModelHCFL_4110H: "4110H",
  ModelHCFL_4410H: "4410H",
  ModelHCFL_4130H: "4130H",
  ModelHCFL_4020HP: "4020HP",
  ModelHCFL_4020HC: "4020HC",
  ModelHCFL_4020HV: "4020HV",
  ModelHCFL_4040HP: "4040HP",
  ModelHCFL_4040HC: "4040HC",
  ModelHCFL_4040HV: "4040HV",
  ModelHCFL_4110HV: "4110HV",
  ModelHCFL_4142HFP: "4142HFP",
  ModelHCFL_4142HVV: "4142HVV",
  ModelHCFL_4130HP: "4130HP",
  ModelHCFL_4410HV: "4410HV"
}


const WorkflowCalculations = [
  { "WorkflowId": 1, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_0309107172_0411127576" },
  { "WorkflowId": 1, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_0309107172_0411127576" },
  { "WorkflowId": 1, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API520", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_0309107172_0411127576" },
  { "WorkflowId": 1, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "API520", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_0309107172_0411127576" },
  { "WorkflowId": 1, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_0309107172_0411127576" },
  { "WorkflowId": 1, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_0309107172_0411127576" },
  { "WorkflowId": 1, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API520", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_0309107172_0411127576" },
  { "WorkflowId": 1, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "API520", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_0309107172_0411127576" },
  { "WorkflowId": 1, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_0105066970_0207087374" },
  { "WorkflowId": 1, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_0105066970_0207087374" },
  { "WorkflowId": 1, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_0105066970_0207087374" },
  { "WorkflowId": 1, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_0105066970_0207087374" },
  { "WorkflowId": 1, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_0105066970_0207087374" },
  { "WorkflowId": 1, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_0105066970_0207087374" },
  { "WorkflowId": 1, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_0105066970_0207087374" },
  { "WorkflowId": 1, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_0105066970_0207087374" },
  { "WorkflowId": 2, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API520", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_0309107172_0411127576" },
  { "WorkflowId": 2, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "API520", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_0309107172_0411127576" },
  { "WorkflowId": 2, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API520", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_0309107172_0411127576" },
  { "WorkflowId": 2, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "API520", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_0309107172_0411127576" },
  { "WorkflowId": 2, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_0105066970_0207087374" },
  { "WorkflowId": 2, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_0105066970_0207087374" },
  { "WorkflowId": 2, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_0105066970_0207087374" },
  { "WorkflowId": 2, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_0105066970_0207087374" },
  { "WorkflowId": 3, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API2000", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_API2000" },
  { "WorkflowId": 3, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API2000", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_API2000" },
  { "WorkflowId": 3, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API2000", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_API2000" },
  { "WorkflowId": 3, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API2000", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_API2000" },
  { "WorkflowId": 4, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "ISO4126", "IsValumetric": false, "WorkflowCalculation": "FCWValidationTestKitISOG1" },

  { "WorkflowId": 5, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 5, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 5, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 5, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 5, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API520", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 5, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "API520", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 5, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 5, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 5, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 5, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 5, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 5, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 5, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API520", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 5, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "API520", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 5, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 5, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  
  { "WorkflowId": 6, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API520", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 6, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "API520", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 6, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 6, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 6, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API520", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 6, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "API520", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 6, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 6, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 7, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "ISO4126", "IsValumetric": false, "WorkflowCalculation": "FCWValidationTestKitISOL1" },

  { "WorkflowId": 8, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "SectionI", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_3586889293_3687899495" },
  { "WorkflowId": 8, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "SectionI", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_3586889293_3687899495" },
  { "WorkflowId": 9, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_3586889293_3687899495" },
  { "WorkflowId": 9, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_3586889293_3687899495" },
  { "WorkflowId": 9, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_3586889293_3687899495" },
  { "WorkflowId": 9, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_3586889293_3687899495" },
  { "WorkflowId": 9, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_3586889293_3687899495" },
  { "WorkflowId": 9, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_3586889293_3687899495" },
  { "WorkflowId": 9, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_3586889293_3687899495" },
  { "WorkflowId": 9, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_3586889293_3687899495" },
  { "WorkflowId": 10, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_3586889293_3687899495" },
  { "WorkflowId": 10, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_3586889293_3687899495" },
  { "WorkflowId": 10, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_3586889293_3687899495" },
  { "WorkflowId": 10, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_3586889293_3687899495" },
  { "WorkflowId": 11, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "ISO4126", "IsValumetric": false, "WorkflowCalculation": "FCWValidationTestKitISOS1" },

  { "WorkflowId": 12, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API521Fire", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_8182838485" },
  { "WorkflowId": 12, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": true, "Code": "API521Fire", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_8182838485" },
  { "WorkflowId": 12, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API521Fire", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_8182838485" },
  { "WorkflowId": 12, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": true, "Code": "API521Fire", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_8182838485" },

  { "WorkflowId": 12, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "API521Fire", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_8182838485" },
  { "WorkflowId": 12, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": true, "Code": "API521Fire", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_8182838485" },
  { "WorkflowId": 12, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "API521Fire", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_8182838485" },
  { "WorkflowId": 12, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": true, "Code": "API521Fire", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_8182838485" },

  { "WorkflowId": 13, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "Appendix11", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF13" },
  { "WorkflowId": 13, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "Appendix11", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF13" },
  { "WorkflowId": 13, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "Appendix11", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF13" },
  { "WorkflowId": 13, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "Appendix11", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF13" },
  
  { "WorkflowId": 14, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "MultiPhaseDiers8thMassFlux", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF14" },
  { "WorkflowId": 14, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "MultiPhaseDiers8thMassFlux", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF14" },
  { "WorkflowId": 14, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "MultiPhaseDiers8thMassFlux", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF14" },
  { "WorkflowId": 14, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "MultiPhaseDiers8thMassFlux", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF14" },

  { "WorkflowId": 14, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": true, "Code": "MultiPhaseDiers8thMassFlux", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF14" },
  { "WorkflowId": 14, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": true, "Code": "MultiPhaseDiers8thMassFlux", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF14" },
  { "WorkflowId": 14, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": true, "Code": "MultiPhaseDiers8thMassFlux", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF14" },
  { "WorkflowId": 14, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": true, "Code": "MultiPhaseDiers8thMassFlux", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF14" },

  // { "WorkflowId": 14, "CalculationMethod": "Metric", "KADataSet": "APIDEF", "IsASMESection8": false, "Code": "MultiPhaseDiers8thMassFlux", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF14" },
  // { "WorkflowId": 14, "CalculationMethod": "English", "KADataSet": "APIDEF", "IsASMESection8": false, "Code": "MultiPhaseDiers8thMassFlux", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF14" },
  // { "WorkflowId": 14, "CalculationMethod": "Metric", "KADataSet": "APIDEF", "IsASMESection8": true, "Code": "MultiPhaseDiers8thMassFlux", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF14" },
  // { "WorkflowId": 14, "CalculationMethod": "English", "KADataSet": "APIDEF", "IsASMESection8": true, "Code": "MultiPhaseDiers8thMassFlux", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF14" },
  { "WorkflowId": 14, "CalculationMethod": "Metric", "KADataSet": "APIWTAVG", "IsASMESection8": false, "Code": "MultiPhaseDiers8thMassFlux", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF14" },
  { "WorkflowId": 14, "CalculationMethod": "English", "KADataSet": "APIWTAVG", "IsASMESection8": false, "Code": "MultiPhaseDiers8thMassFlux", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF14" },
  { "WorkflowId": 14, "CalculationMethod": "Metric", "KADataSet": "APIWTAVG", "IsASMESection8": true, "Code": "MultiPhaseDiers8thMassFlux", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF14" },
  { "WorkflowId": 14, "CalculationMethod": "English", "KADataSet": "APIWTAVG", "IsASMESection8": true, "Code": "MultiPhaseDiers8thMassFlux", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF14" },

  { "WorkflowId": 15, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "MultiPhaseDiers8thFlashingNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF15" },
  { "WorkflowId": 15, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "MultiPhaseDiers8thFlashingNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF15" },
  { "WorkflowId": 15, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "MultiPhaseDiers8thFlashingNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF15" },
  { "WorkflowId": 15, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "MultiPhaseDiers8thFlashingNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF15" },

  { "WorkflowId": 15, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": true, "Code": "MultiPhaseDiers8thFlashingNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF15" },
  { "WorkflowId": 15, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": true, "Code": "MultiPhaseDiers8thFlashingNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF15" },
  { "WorkflowId": 15, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": true, "Code": "MultiPhaseDiers8thFlashingNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF15" },
  { "WorkflowId": 15, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": true, "Code": "MultiPhaseDiers8thFlashingNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF15" },

  // { "WorkflowId": 15, "CalculationMethod": "Metric", "KADataSet": "APIDEF", "IsASMESection8": false, "Code": "MultiPhaseDiers8thFlashingNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF15" },
  // { "WorkflowId": 15, "CalculationMethod": "English", "KADataSet": "APIDEF", "IsASMESection8": false, "Code": "MultiPhaseDiers8thFlashingNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF15" },
  // { "WorkflowId": 15, "CalculationMethod": "Metric", "KADataSet": "APIDEF", "IsASMESection8": true, "Code": "MultiPhaseDiers8thFlashingNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF15" },
  // { "WorkflowId": 15, "CalculationMethod": "English", "KADataSet": "APIDEF", "IsASMESection8": true, "Code": "MultiPhaseDiers8thFlashingNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF15" },
  { "WorkflowId": 15, "CalculationMethod": "Metric", "KADataSet": "APIWTAVG", "IsASMESection8": false, "Code": "MultiPhaseDiers8thFlashingNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF15" },
  { "WorkflowId": 15, "CalculationMethod": "English", "KADataSet": "APIWTAVG", "IsASMESection8": false, "Code": "MultiPhaseDiers8thFlashingNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF15" },
  { "WorkflowId": 15, "CalculationMethod": "Metric", "KADataSet": "APIWTAVG", "IsASMESection8": true, "Code": "MultiPhaseDiers8thFlashingNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF15" },
  { "WorkflowId": 15, "CalculationMethod": "English", "KADataSet": "APIWTAVG", "IsASMESection8": true, "Code": "MultiPhaseDiers8thFlashingNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF15" },


  { "WorkflowId": 16, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "MultiPhaseDiers8thSubcooled", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF16" },
  { "WorkflowId": 16, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "MultiPhaseDiers8thSubcooled", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF16" },
  { "WorkflowId": 16, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "MultiPhaseDiers8thSubcooled", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF16" },
  { "WorkflowId": 16, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "MultiPhaseDiers8thSubcooled", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF16" },
  { "WorkflowId": 16, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "MultiPhaseDiers8thSubcooled", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_WF16" },
  { "WorkflowId": 16, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "MultiPhaseDiers8thSubcooled", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_WF16" },
  { "WorkflowId": 16, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "MultiPhaseDiers8thSubcooled", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_WF16" },
  { "WorkflowId": 16, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "MultiPhaseDiers8thSubcooled", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_WF16" },
  
  { "WorkflowId": 16, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": true, "Code": "MultiPhaseDiers8thSubcooled", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF16" },
  { "WorkflowId": 16, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": true, "Code": "MultiPhaseDiers8thSubcooled", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF16" },
  { "WorkflowId": 16, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": true, "Code": "MultiPhaseDiers8thSubcooled", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF16" },
  { "WorkflowId": 16, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": true, "Code": "MultiPhaseDiers8thSubcooled", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF16" },
  { "WorkflowId": 16, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": true, "Code": "MultiPhaseDiers8thSubcooled", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_WF16" },
  { "WorkflowId": 16, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": true, "Code": "MultiPhaseDiers8thSubcooled", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_WF16" },
  { "WorkflowId": 16, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": true, "Code": "MultiPhaseDiers8thSubcooled", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_WF16" },
  { "WorkflowId": 16, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": true, "Code": "MultiPhaseDiers8thSubcooled", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_WF16" },
  
  { "WorkflowId": 17, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "MultiPhaseDiers7thFlashingwVapor", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF17" },
  { "WorkflowId": 17, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "MultiPhaseDiers7thFlashingwVapor", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF17" },
  { "WorkflowId": 17, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "MultiPhaseDiers7thFlashingwVapor", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF17" },
  { "WorkflowId": 17, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "MultiPhaseDiers7thFlashingwVapor", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF17" },
  { "WorkflowId": 17, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": true, "Code": "MultiPhaseDiers7thFlashingwVapor", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF17" },
  { "WorkflowId": 17, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": true, "Code": "MultiPhaseDiers7thFlashingwVapor", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF17" },
  { "WorkflowId": 17, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": true, "Code": "MultiPhaseDiers7thFlashingwVapor", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF17" },
  { "WorkflowId": 17, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": true, "Code": "MultiPhaseDiers7thFlashingwVapor", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF17" },

  // { "WorkflowId": 17, "CalculationMethod": "Metric", "KADataSet": "APIDEF", "IsASMESection8": false, "Code": "MultiPhaseDiers7thFlashingwVapor", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF17" },
  // { "WorkflowId": 17, "CalculationMethod": "English", "KADataSet": "APIDEF", "IsASMESection8": false, "Code": "MultiPhaseDiers7thFlashingwVapor", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF17" },
  // { "WorkflowId": 17, "CalculationMethod": "Metric", "KADataSet": "APIDEF", "IsASMESection8": true, "Code": "MultiPhaseDiers7thFlashingwVapor", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF17" },
  // { "WorkflowId": 17, "CalculationMethod": "English", "KADataSet": "APIDEF", "IsASMESection8": true, "Code": "MultiPhaseDiers7thFlashingwVapor", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF17" },

  { "WorkflowId": 17, "CalculationMethod": "Metric", "KADataSet": "APIWTAVG", "IsASMESection8": false, "Code": "MultiPhaseDiers7thFlashingwVapor", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF17" },
  { "WorkflowId": 17, "CalculationMethod": "English", "KADataSet": "APIWTAVG", "IsASMESection8": false, "Code": "MultiPhaseDiers7thFlashingwVapor", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF17" },
  { "WorkflowId": 17, "CalculationMethod": "Metric", "KADataSet": "APIWTAVG", "IsASMESection8": true, "Code": "MultiPhaseDiers7thFlashingwVapor", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF17" },
  { "WorkflowId": 17, "CalculationMethod": "English", "KADataSet": "APIWTAVG", "IsASMESection8": true, "Code": "MultiPhaseDiers7thFlashingwVapor", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF17" },


  { "WorkflowId": 18, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "MultiPhaseDiers7thNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF18" },
  { "WorkflowId": 18, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "MultiPhaseDiers7thNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF18" },
  { "WorkflowId": 18, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "MultiPhaseDiers7thNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF18" },
  { "WorkflowId": 18, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "MultiPhaseDiers7thNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF18" },
  { "WorkflowId": 18, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": true, "Code": "MultiPhaseDiers7thNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF18" },
  { "WorkflowId": 18, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": true, "Code": "MultiPhaseDiers7thNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF18" },
  { "WorkflowId": 18, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": true, "Code": "MultiPhaseDiers7thNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF18" },
  { "WorkflowId": 18, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": true, "Code": "MultiPhaseDiers7thNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF18" },

  // { "WorkflowId": 18, "CalculationMethod": "Metric", "KADataSet": "APIDEF", "IsASMESection8": false, "Code": "MultiPhaseDiers7thNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF18" },
  // { "WorkflowId": 18, "CalculationMethod": "English", "KADataSet": "APIDEF", "IsASMESection8": false, "Code": "MultiPhaseDiers7thNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF18" },
  // { "WorkflowId": 18, "CalculationMethod": "Metric", "KADataSet": "APIDEF", "IsASMESection8": true, "Code": "MultiPhaseDiers7thNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF18" },
  // { "WorkflowId": 18, "CalculationMethod": "English", "KADataSet": "APIDEF", "IsASMESection8": true, "Code": "MultiPhaseDiers7thNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF18" },
  { "WorkflowId": 18, "CalculationMethod": "Metric", "KADataSet": "APIWTAVG", "IsASMESection8": false, "Code": "MultiPhaseDiers7thNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF18" },
  { "WorkflowId": 18, "CalculationMethod": "English", "KADataSet": "APIWTAVG", "IsASMESection8": false, "Code": "MultiPhaseDiers7thNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF18" },
  { "WorkflowId": 18, "CalculationMethod": "Metric", "KADataSet": "APIWTAVG", "IsASMESection8": true, "Code": "MultiPhaseDiers7thNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF18" },
  { "WorkflowId": 18, "CalculationMethod": "English", "KADataSet": "APIWTAVG", "IsASMESection8": true, "Code": "MultiPhaseDiers7thNonFlashing", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF18" },



  { "WorkflowId": 19, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "MultiPhaseDiers7thSubcooled", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF19" },
  { "WorkflowId": 19, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "MultiPhaseDiers7thSubcooled", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF19" },
  { "WorkflowId": 19, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "MultiPhaseDiers7thSubcooled", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF19" },
  { "WorkflowId": 19, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "MultiPhaseDiers7thSubcooled", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF19" },
  { "WorkflowId": 19, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "MultiPhaseDiers7thSubcooled", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_WF19" },
  { "WorkflowId": 19, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "MultiPhaseDiers7thSubcooled", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_WF19" },
  { "WorkflowId": 19, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "MultiPhaseDiers7thSubcooled", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_WF19" },
  { "WorkflowId": 19, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "MultiPhaseDiers7thSubcooled", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_WF19" },
  
  { "WorkflowId": 19, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": true, "Code": "MultiPhaseDiers7thSubcooled", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF19" },
  { "WorkflowId": 19, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": true, "Code": "MultiPhaseDiers7thSubcooled", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF19" },
  { "WorkflowId": 19, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": true, "Code": "MultiPhaseDiers7thSubcooled", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF19" },
  { "WorkflowId": 19, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": true, "Code": "MultiPhaseDiers7thSubcooled", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF19" },
  { "WorkflowId": 19, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": true, "Code": "MultiPhaseDiers7thSubcooled", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_WF19" },
  { "WorkflowId": 19, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": true, "Code": "MultiPhaseDiers7thSubcooled", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_WF19" },
  { "WorkflowId": 19, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": true, "Code": "MultiPhaseDiers7thSubcooled", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_WF19" },
  { "WorkflowId": 19, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": true, "Code": "MultiPhaseDiers7thSubcooled", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_WF19" },

  { "WorkflowId": 20, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "MultiPhaseDiers7thFlashingwGas", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF20" },
  { "WorkflowId": 20, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "MultiPhaseDiers7thFlashingwGas", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF20" },
  { "WorkflowId": 20, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "MultiPhaseDiers7thFlashingwGas", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF20" },
  { "WorkflowId": 20, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "MultiPhaseDiers7thFlashingwGas", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF20" },
  { "WorkflowId": 20, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": true, "Code": "MultiPhaseDiers7thFlashingwGas", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF20" },
  { "WorkflowId": 20, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": true, "Code": "MultiPhaseDiers7thFlashingwGas", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF20" },
  { "WorkflowId": 20, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": true, "Code": "MultiPhaseDiers7thFlashingwGas", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF20" },
  { "WorkflowId": 20, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": true, "Code": "MultiPhaseDiers7thFlashingwGas", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF20" },

  // { "WorkflowId": 20, "CalculationMethod": "Metric", "KADataSet": "APIDEF", "IsASMESection8": false, "Code": "MultiPhaseDiers7thFlashingwGas", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF20" },
  // { "WorkflowId": 20, "CalculationMethod": "English", "KADataSet": "APIDEF", "IsASMESection8": false, "Code": "MultiPhaseDiers7thFlashingwGas", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF20" },
  // { "WorkflowId": 20, "CalculationMethod": "Metric", "KADataSet": "APIDEF", "IsASMESection8": true, "Code": "MultiPhaseDiers7thFlashingwGas", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF20" },
  // { "WorkflowId": 20, "CalculationMethod": "English", "KADataSet": "APIDEF", "IsASMESection8": true, "Code": "MultiPhaseDiers7thFlashingwGas", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF20" },
  { "WorkflowId": 20, "CalculationMethod": "Metric", "KADataSet": "APIWTAVG", "IsASMESection8": false, "Code": "MultiPhaseDiers7thFlashingwGas", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF20" },
  { "WorkflowId": 20, "CalculationMethod": "English", "KADataSet": "APIWTAVG", "IsASMESection8": false, "Code": "MultiPhaseDiers7thFlashingwGas", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF20" },
  { "WorkflowId": 20, "CalculationMethod": "Metric", "KADataSet": "APIWTAVG", "IsASMESection8": true, "Code": "MultiPhaseDiers7thFlashingwGas", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF20" },
  { "WorkflowId": 20, "CalculationMethod": "English", "KADataSet": "APIWTAVG", "IsASMESection8": true, "Code": "MultiPhaseDiers7thFlashingwGas", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF20" },

  { "WorkflowId": 21, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "SeparatedFlow", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF21" },
  { "WorkflowId": 21, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "SeparatedFlow", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF21" },
  { "WorkflowId": 21, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "SeparatedFlow", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF21" },
  { "WorkflowId": 21, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "SeparatedFlow", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF21" },
  { "WorkflowId": 21, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": true, "Code": "SeparatedFlow", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF21" },
  { "WorkflowId": 21, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": true, "Code": "SeparatedFlow", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF21" },
  { "WorkflowId": 21, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": true, "Code": "SeparatedFlow", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF21" },
  { "WorkflowId": 21, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": true, "Code": "SeparatedFlow", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF21" },
  

  { "WorkflowId": 22, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "None", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_FlameArrester" },
  { "WorkflowId": 22, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "None", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_FlameArrester" },
  { "WorkflowId": 22, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "None", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_FlameArrester" },
  { "WorkflowId": 22, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "None", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_FlameArrester" },
  
  { "WorkflowId": 23, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API2000", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_API2000" },
  { "WorkflowId": 23, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API2000", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_API2000" },
  { "WorkflowId": 23, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API2000", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_API2000" },
  { "WorkflowId": 23, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API2000", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_API2000" },
  
  { "WorkflowId": 24, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "None", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_FreeVent" },
  { "WorkflowId": 24, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "None", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_FreeVent" },
  { "WorkflowId": 24, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "None", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_FreeVent" },
  { "WorkflowId": 24, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "None", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_FreeVent" },

  { "WorkflowId": 26, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": true, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF26" },
  { "WorkflowId": 26, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": true, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF26" },
  { "WorkflowId": 26, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF26" },
  { "WorkflowId": 26, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF26" },
  { "WorkflowId": 26, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": true, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF26" },
  { "WorkflowId": 26, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": true, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF26" },
  { "WorkflowId": 26, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF26" },
  { "WorkflowId": 26, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "API520", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF26" },
  { "WorkflowId": 26, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF26" },
  { "WorkflowId": 26, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF26" },
  { "WorkflowId": 26, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "SectionVIII", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF26" },
  { "WorkflowId": 26, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "SectionVIII", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF26" },
  { "WorkflowId": 26, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF26" },
  { "WorkflowId": 26, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": true, "Code": "SectionVIII", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF26" },
  { "WorkflowId": 26, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "SectionVIII", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF26" },
  { "WorkflowId": 26, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "SectionVIII", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_WF26" },

  { "WorkflowId": 27, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "SectionI", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 27, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "SectionI", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 27, "CalculationMethod": "English", "KADataSet": "ASME", "IsASMESection8": false, "Code": "SectionI", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 27, "CalculationMethod": "English", "KADataSet": "API", "IsASMESection8": false, "Code": "SectionI", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 27, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "SectionI", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 27, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "SectionI", "IsValumetric": true, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 27, "CalculationMethod": "Metric", "KADataSet": "ASME", "IsASMESection8": false, "Code": "SectionI", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_13157778_14167980" },
  { "WorkflowId": 27, "CalculationMethod": "Metric", "KADataSet": "API", "IsASMESection8": false, "Code": "SectionI", "IsValumetric": false, "WorkflowCalculation": "FCWVTK_13157778_14167980" }

];

const WorkflowSelectedField = {
  "FCWVTK_0309107172_0411127576": "Vsel",
  "FCWVTK_0105066970_0207087374": "Wsel",
  "FCWVTK_WF26": "Wsel",  
  "FCWVTK_13157778_14167980": "Vsel",
  "FCWVTK_3586889293_3687899495": "Wsel",
  "FCWVTK_API2000": "Wsel",
  "FCWVTK_API2000_V": "Wsel",
  "FCWVTK_FreeVent": "Wsel",
  "FCWVTK_FreeVent_V": "Wsel",
  "FCWVTK_FlameArrester": "Wsel",
  "FCWVTK_FlameArrester_V": "Wsel",
  "FCWVTK_8182838485": "Wsel",
  "FCWVTK_WF13": "Wsel",
  "FCWVTK_WF14": "Wsel",
  "FCWVTK_WF15": "Wsel",
  "FCWVTK_WF16": "Wsel",
  "FCWVTK_WF17": "Wsel",
  "FCWVTK_WF18": "Wsel",
  "FCWVTK_WF19": "Wsel",
  "FCWVTK_WF20": "Wsel",
  "FCWVTK_WF21": "Wsel",
  "FCWValidationTestKit17": "Vsel",
  "FCWValidationTestKit18": "Vsel",
  "FCWValidationTestKit19": "Wsel",
  "FCWValidationTestKit20": "Wsel",
  "FCWValidationTestKit37535465": "Vsel",
  "FCWValidationTestKit38575867": "Wvalvep",
  "FCWValidationTestKit39555666": "Vsel",
  "FCWValidationTestKit40596068": "Wvalvep",
  "FCWValidationTestKit32": "Vsel",
  "FCWValidationTestKit34": "Vsel",
  "FCWValidationTestKit31": "Wsel",
  "FCWValidationTestKit33": "Wsel",
  "FCWValidationTestKitISOG1": "Qm",
  "FCWValidationTestKitISOL1": "Qm",
  "FCWValidationTestKitISOS1": "Qm"
}

const WorkflowResultsHeader = {
  "FCWVTK_0309107172_0411127576": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Vsel", label: "Rated Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_0105066970_0207087374": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Rated Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_WF26":[{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Rated Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_0309107172_0411127576_Act": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Vsel", label: "Actual Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_0105066970_0207087374_Act": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Actual Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_13157778_14167980": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Vsel", label: "Rated Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_3586889293_3687899495": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Rated Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_13157778_14167980_Act": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Vsel", label: "Actual Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_3586889293_3687899495_Act": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Actual Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_API2000_PV": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Pressure Type" }, { name: "VPValveTypeV", label: "Vacuum Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice Area (for pressure)(AreaUOM)" }, { name: "Areq_v", label: "Required Orifice Area (for Vacuum)(AreaUOM)" }, { name: "Wsel", label: "Max Pressure Flow Capacity (FlowCapacityUOM)" }, { name: "Wsel_v", label: "Max Vacuum Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_API2000_V": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice Area (for Vacuum) (AreaUOM)" }, { name: "Wsel", label: "Max Vacuum Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_API2000": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice Area (for Pressure) (AreaUOM)" }, { name: "Wsel", label: "Max Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_FreeVent": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice Area (for Pressure) (AreaUOM)" }, { name: "Wsel", label: "Max Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_FreeVent_PV": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Pressure Type" }, { name: "VPValveTypeV", label: "Vacuum Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice Area (for pressure)(AreaUOM)" }, { name: "Areq_v", label: "Required Orifice Area (for Vacuum)(AreaUOM)" }, { name: "Wsel", label: "Max Pressure Flow Capacity (FlowCapacityUOM)" }, { name: "Wsel_v", label: "Max Vacuum Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_FreeVent_V": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice Area (for Vacuum) (AreaUOM)" }, { name: "Wsel", label: "Max Vacuum Flow Capacity (FlowCapacityUOM)" }],
  
  "FCWVTK_FlameArrester": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" },  { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Wsel", label: "Max Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_FlameArrester_PV": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "VPValveType", label: "Pressure Type" }, { name: "VPValveTypeV", label: "Vacuum Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Wsel", label: "Max Pressure Flow Capacity (FlowCapacityUOM)" }, { name: "Wsel_v", label: "Max Vacuum Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_FlameArrester_V": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" },  { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" },  { name: "Wsel", label: "Max Vacuum Flow Capacity (FlowCapacityUOM)" }],

  "FCWVTK_8182838485": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Rated Flow Capacity (FlowCapacityUOM)"} ,{ name: "Wreqp", label: "Required Pressure Flow (FlowCapacityUOM)" }],
  "FCWValidationTestKitISOG1": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Qm", label: "Valve Flow (FlowCapacityUOM)" }],
  "FCWValidationTestKitISOL1": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Qm", label: "Valve Flow (FlowCapacityUOM)" }],
  "FCWValidationTestKitISOS1": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Qm", label: "Valve Flow (FlowCapacityUOM)" }],

  "FCWVTK_WF13": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Rated Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_WF14": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Max Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_WF15": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Rated Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_WF16": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Rated Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_WF17": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Rated Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_WF18": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Rated Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_WF19": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Rated Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_WF20": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Rated Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_WF21": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Rated Pressure Flow Capacity (FlowCapacityUOM)" }, { name: "AreqG", label: "Partial Required Area - Gas (AreaUOM)" }, { name: "AreqL", label: "Partial Required Area - Liquid 1 (AreaUOM)" }, { name: "AreqL2", label: "Partial Required Area - Liquid 2 (AreaUOM)" }],
  "FCWVTK_WF21_GL": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Rated Pressure Flow Capacity (FlowCapacityUOM)" }, { name: "AreqG", label: "Partial Required Area - Gas (AreaUOM)" }, { name: "AreqL", label: "Partial Required Area - Liquid 1 (AreaUOM)" }],

  "FCWVTK_WF13_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Rated Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_WF14_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Max Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_WF15_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Max Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_WF16_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Max Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_WF17_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Max Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_WF18_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Max Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_WF19_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Max Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_WF20_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Max Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_WF21_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Rated Pressure Flow Capacity (FlowCapacityUOM)" }, { name: "AreqG", label: "Partial Required Area - Gas (AreaUOM)" }, { name: "AreqL", label: "Partial Required Area - Liquid 1 (AreaUOM)" }, { name: "AreqL2", label: "Partial Required Area - Liquid 2 (AreaUOM)" }],
  "FCWVTK_WF21_GL_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Rated Pressure Flow Capacity (FlowCapacityUOM)" }, { name: "AreqG", label: "Partial Required Area - Gas (AreaUOM)" }, { name: "AreqL", label: "Partial Required Area - Liquid 1 (AreaUOM)" }],
  

  "FCWVTK_0309107172_0411127576_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Vsel", label: "Max Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_0105066970_0207087374_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Max Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_WF26_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Max Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_13157778_14167980_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Vsel", label: "Max Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_3586889293_3687899495_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Max Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_API2000_PV_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Pressure Type" }, { name: "VPValveTypeV", label: "Vacuum Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice Area (for pressure)(AreaUOM)" }, { name: "Areq_v", label: "Required Orifice Area (for Vacuum)(AreaUOM)" }, { name: "Wsel", label: "Max Pressure Flow Capacity (FlowCapacityUOM)" }, { name: "Wsel_v", label: "Max Vacuum Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_API2000_V_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice Area (for Vacuum) (AreaUOM)" }, { name: "Wsel", label: "Max Vacuum Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_API2000_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice Area (for Pressure) (AreaUOM)" }, { name: "Wsel", label: "Max Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_FreeVent_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice Area (for Pressure) (AreaUOM)" }, { name: "Wsel", label: "Max Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_FreeVent_PV_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Pressure Type" }, { name: "VPValveTypeV", label: "Vacuum Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice Area (for pressure)(AreaUOM)" }, { name: "Areq_v", label: "Required Orifice Area (for Vacuum)(AreaUOM)" }, { name: "Wsel", label: "Max Pressure Flow Capacity (FlowCapacityUOM)" }, { name: "Wsel_v", label: "Max Vacuum Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_FreeVent_V_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice Area (for Vacuum) (AreaUOM)" }, { name: "Wsel", label: "Max Vacuum Flow Capacity (FlowCapacityUOM)" }],

  "FCWVTK_FlameArrester_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" },  { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" },  { name: "Wsel", label: "Max Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_FlameArrester_PV_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" },  { name: "VPValveType", label: "Pressure Type" }, { name: "VPValveTypeV", label: "Vacuum Type" }, { name: "NewOrifice", label: "Size / Orifice" },  { name: "Wsel", label: "Max Pressure Flow Capacity (FlowCapacityUOM)" }, { name: "Wsel_v", label: "Max Vacuum Flow Capacity (FlowCapacityUOM)" }],
  "FCWVTK_FlameArrester_V_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" },  { name: "Wsel", label: "Max Vacuum Flow Capacity (FlowCapacityUOM)" }],

  "FCWVTK_8182838485_API": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Max Flow Capacity (FlowCapacityUOM)"} ,{ name: "Wreqp", label: "Required Pressure Flow (FlowCapacityUOM)" }],
  
  "FCWValidationTestKit17": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Vsel", label: "Rated Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWValidationTestKit18": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Vsel", label: "Rated Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWValidationTestKit19": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Rated Capacity (FlowCapacityUOM)" }],
  "FCWValidationTestKit20": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Rated Capacity (FlowCapacityUOM)" }],
  "FCWValidationTestKit37535465": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Vsel", label: "Rated Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWValidationTestKit38575867": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Rated Capacity (FlowCapacityUOM)" }],
  "FCWValidationTestKit39555666": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Vsel", label: "Rated Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWValidationTestKit40596068": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Rated Capacity (FlowCapacityUOM)" }],
  "FCWValidationTestKit32": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Vsel", label: "Rated Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWValidationTestKit34": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Vsel", label: "Rated Pressure Flow Capacity (FlowCapacityUOM)" }],
  "FCWValidationTestKit31": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Rated Capacity (FlowCapacityUOM)" }],
  "FCWValidationTestKit33": [{ name: "ValveId", label: "" }, { name: "Brand", label: "Brand" }, { name: "ModelNumber", label: "Model" }, { name: "ValveType", label: "Valve Type" }, { name: "VPValveType", label: "Valve Type" }, { name: "NewOrifice", label: "Size / Orifice" }, { name: "Areq", label: "Required Orifice area (for pressure) (AreaUOM)" }, { name: "Wsel", label: "Rated Capacity (FlowCapacityUOM)" }],
  
}

const validatePbackType = (valve, inputs) => {
  const { ModelNumber, AllowedPbackTypes, Orifice, SizeCode } = valve;
  const binaryArray = AllowedPbackTypes.toString(2).padStart(6, '0').split('').map(Number).reverse();
  const IsBu = !!inputs?.BuiltUp && !!Number(inputs.BuiltUp);
  const IsPsic = !!inputs?.ConstantSuperimposed && !!Number(inputs.ConstantSuperimposed);
  let IsPsiv = !!inputs?.VariableSuperimposed && !!Number(inputs.VariableSuperimposed);
  IsPsiv = IsPsic ? IsPsic && IsPsiv : IsPsiv;
  const IsBuPsic = IsBu && IsPsic;
  const IsBuPsiv = (IsBu && IsPsiv) || (IsBu && IsPsic && IsPsiv);
  const IsNone = !IsBu && !IsPsic && !IsPsiv;

  const PBackTypesArray = {
    IsNone,
    IsBu,
    IsPsic,
    IsPsiv,
    IsBuPsic,
    IsBuPsiv
  };
  return IsNone
    ?
    binaryArray[0] === 1
    :
    Object.values(PBackTypesArray)
      .every((val, index) => index > 0 && binaryArray[index] === 0 ? !!binaryArray[index] === val : true);
}

const kdCalculation = (AsmeApiDataSet, valve, inputs, uoms, TPR, PR, Patm, Pset, Pover,P1, Vset = null, Vover = null,PV=false) => {
  let { ModelNumber, VPValveType, Service, ShortName, m, b, E, Tp, Tpunits, Kmax, KAPI } = valve;
  let { VPValveTypeV,mv,bv,  EV, TpV, TpunitsV, KmaxV, KAPIV } = valve;
  let {  CalculationMethod, Code, IsPressureOnly, IsVacuumOnly } = inputs;

  const isComplexValve=IsPressureOnly && IsVacuumOnly;
  const ValveFunction=isComplexValve?PV?valve.ValveFunctionV:valve.ValveFunction:valve.ValveFunction;
  
  VPValveType=isComplexValve?PV?VPValveTypeV:VPValveType:VPValveType;
  E=isComplexValve?PV?EV:E:E;
  Tp=isComplexValve?PV?TpV:Tp:Tp;
  Tpunits=isComplexValve?PV?TpunitsV:Tpunits:Tpunits;
  Kmax=isComplexValve?PV?KmaxV:Kmax:Kmax;
  KAPI=isComplexValve?PV?KAPIV:KAPI:KAPI;
  m=isComplexValve?PV?mv:m:m;
  b=isComplexValve?PV?bv:b:b;

  Kmax = AsmeApiDataSet === 'ASME' ? Kmax : KAPI;
  
  const PsetCheckValue = CalculationMethod === 'English' ? 15 : convertUnit(15, uoms.find(u => u.UnitKey === 'pressure.psig'), uoms.find(u => u.UnitKey === 'pressure.barg'));
  let X = 0;
  let X_Equ='';
  //if(valve?.Brand!=='Anderson Greenwood' && valve?.VPValveType!=='LP'){
    //Tp =  CalculationMethod === 'English' ? convertUnit(Tp, uoms.find(u => u.UnitKey === 'pressure.mbarg'), uoms.find(u => u.UnitKey === 'pressure.psig')) : convertUnit(Tp, uoms.find(u => u.UnitKey === 'pressure.mbarg'), uoms.find(u => u.UnitKey === 'pressure.barg'));
    Tp = (Tpunits !== null && Tpunits !== "" && Tpunits !== undefined) ? CalculationMethod === 'English' ? convertUnit(Tp, uoms.find(u => u.UnitKey === `pressure.${Tpunits}`), uoms.find(u => u.UnitKey === 'pressure.psig')) : convertUnit(Tp, uoms.find(u => u.UnitKey === `pressure.${Tpunits}`), uoms.find(u => u.UnitKey === 'pressure.barg')) : Tp;
  //}
  let Models9300 = [
    "93",
    "95",
    "MLCP",
    '9300',
    "9300V DC",
    "9300V SC",
    "9309V SC",
    "9340C DC",
    "9390C DC",
    "9390C SC",
    "9390P SC",
    "9399C SC"
  ];

  let Models9200 = [
    "9200",
    "9200V DC",
    "9200V SC",
    "9209V SC",
    "9240C DC",
    "9290C DC",
    "9290C SC",
    "9290P SC",
    "9299C SC",
  ];

  let ModelsHCFL=[
    "4040HP",
    "4040H",
    "4410HV",
    "4020HC",
    "4410H",
    "4130HP",
    "4020HP",
    "4040HV",
    "4142HVV",
    "4142HF",
    "4040HC",
    "4020H",
    "4142HFP",
    "4110HV",
    "4130H",
    "4142HV",
    "4020HV",
    "4110H"
  ];

  let Models96A = [
    "96A"
  ];

  if (Models9300.includes(ModelNumber) && ValveFunction==='P') {
    X = PR;
    X_Equ='X =PR';
  }
  else if (Models9200.includes(ModelNumber) && CalculationMethod == 'English') {
    X = P1 - Patm;
    X_Equ='X = P1-Patm';
  }
  else if (Models9200.includes(ModelNumber) && CalculationMethod == 'Metric') {
    X = 100000 * (P1 - Patm) / 6894.75729318;
    X_Equ='X = 14.504 * (P1-Patm)';
  }
  else if (Models96A.includes(ModelNumber) && ValveFunction==='V') {
    X = Vover / Vset;
    X_Equ='X = Vover/Vset';
  }
  else if ( ModelsHCFL.includes(ModelNumber)) {
    if(ValveFunction==='V'){
      X = Vset + Vover;
      X_Equ='X = Vset+Vover';
    }else{
      X = Pset + Pover;
      X_Equ='X = Pset+Pover';
    }
  }
  else if (ShortName=='V' && ValveFunction==='V') {
    X = Vover / Vset;
    X_Equ='X = Vover/Vset';
  }
  else if (ShortName=='V' && ValveFunction==='P') {
    X = Pover / Pset;
    X_Equ='X = Pover/Pset';
  }
  // if(valve?.ModelNumber =='HSL' && AsmeApiDataSet === 'ASME' && valve?.Orifice === 'G'){ 
  //   console.log(` >>>>>>>>>>>>> E: ${E}, X: ${X}, ModelNumber: ${ModelNumber}, Tp: ${Tp}, Tpunits:${Tpunits}, ValveFunction: ${valve.ValveFunction}, VPValveType: ${VPValveType}`)
  // }
  let Kd_Equation2_3 = Tp==0 || E==0?Kmax:Tp * (Math.pow(X, E));
  //let Kd_Equation2_3 = TPR >= PR ? Kmax : Tp * (Math.pow(X, E));
  let Kd_Equation2_4 = Kmax;
  let Kd_Equation2_12 = X >= Tp ? Kmax : Kmax * (Math.pow(Math.sin((X / Tp) * (Math.PI / 2)), E));
  let Kd_Equation2_13 = m * PR + b;

  let Kd = Kd_Equation2_4;
  if (Service == 'G') {
    if (ShortName == 'AG' && VPValveType == 'LP') {
      // if (valve.ValveId === 276) {
      //   console.log('AG LP', Pset, PsetCheckValue, Pset < PsetCheckValue, !IsVacuumOnly, CalculationMethod);
      // }
      if (Pset < PsetCheckValue && ValveFunction==='P') {
        Kd = Kd_Equation2_3;
      }
    }
    else if ((ShortName == 'AG' && VPValveType == 'SO_ID')
      || (ShortName == 'AG' && VPValveType == 'SO_LL')
      || (ShortName == 'AG' && VPValveType == 'SO_SQ')) {
        // if(valve?.ValveId==3493){
        //   console.log(`X: ${X} >> Vset:${Vset} >>> Vover: ${Vover}>>> Tp: ${Tp} >>> m: ${m}, b: ${b}, PR: ${PR} , m*PR: ${m*PR}, m*PR+b: ${m*PR+b}`)
        // }
      if (X < Tp) {
        Kd = Kd_Equation2_13;
      }
    }
    else if (ShortName == 'AG' && VPValveType == 'VB') {
      Kd = Kd_Equation2_12;
    }
    else if(ShortName == 'V'){
      Kd = Kd_Equation2_12;
    }
  }
  // if([418].indexOf(valve.ValveId)!==-1){
  //   console.log('In kdCalculation >>>>>>> ',AsmeApiDataSet,ShortName,isComplexValve,PV,ValveFunction,Kmax,Kd,Tp,X,E,ModelNumber, VPValveType, Service, ShortName, m, b, E, Tp, Kmax, KAPI )
  // }
  return {Kd,X,X_Equ};
}

const KdKxCheck = (AsmeApiDataSet,valve, inputs, uoms, TPR, PR, Patm, Pset, Pover,P1, Vset = null, Vover = null,PV=false) => {
//   if(valve.ValveId==175){
//     console.log(`175 Calc ==== >>>>> ModelNumber: ${JSON.stringify(valve)}`);
// }
    const ValveFunction=inputs.IsPressureOnly && inputs.IsVacuumOnly?PV?valve.ValveFunctionV:valve.ValveFunction:valve.ValveFunction;

    const valveFuncFlag=PV && ValveFunction==='V';
    let Kmax = valveFuncFlag?valve?.KmaxV:valve?.Kmax;
    let K = Kmax; 
    let KApi = valveFuncFlag?valve?.KAPIV:valve?.KAPI;
    const Code=inputs.Code;
    let KxValue= 'K';
    let {Kd, X, X_Equ} = kdCalculation(AsmeApiDataSet, valve, inputs, uoms, TPR, PR, Patm, Pset, Pover, P1,Vset, Vover,valveFuncFlag);

    // if DB Kmax is 0 for given valve example ModelId 46 && valve Id 374 then perform Kmax=Kd and K=Kd
    Kmax=Kmax===0?Kd:Kmax;
    K=Kmax===0?Kd:K;
    let Kx = K; // if Kmax==0?Kmax=Kd, K=Kd
    if (AsmeApiDataSet === "API") {
        Kx = KApi;
        KxValue='K,API';
    }else if (Code === "SectionI" || Code === "SectionVIII" || Code === "API521Fire" || Code === "SeparatedFlow") {
        // if(valve?.ValveId===418){
        //   console.log({IsASMESection8:inputs?.IsASMESection8,Code,Kmax, K, KApi, Kx, KxValue})
        //   // console.log((Code !== "SectionVIII") || (inputs?.IsASMESection8 && Code === "SectionVIII") || Code === "SeparatedFlow")
        // }
        if ((Code !== "SectionVIII") || (inputs?.IsASMESection8 && Code === "SectionVIII") || Code === "SeparatedFlow") {
            K = K * 0.9;
            Kx = K;
            KxValue='K';
            if(valve?.ModelNumber==900 && valve?.Orifice==5){
              // console.log({K,Kx, KxValue})
            }
        }
        else {
          // if(valve?.ValveId===418){
          //   console.log('In K >>>>>>>>>> ',K, K/0.9);
          // }
            K = K / 0.9;
            Kx = K;
            KxValue='K';
        }
    }else if (Code === "API2000" || Code === "API520" || Code === 'Appendix11') {
      Kx = Kd;
      K = Kd * 0.9;
      KxValue='Kd';
    
    }
    // if([183,211].indexOf(valve.ValveId)!==-1){
    //   console.log('In KdKxCheck >>>>>>> ',inputs.IsPressureOnly,inputs.IsVacuumOnly,PV,ValveFunction,Kd,Kx,KxValue)
    // }
    return { Kd, Kx, K, Kmax,KApi, KxValue,X, X_Equ };
}

const knCalculation = (params) => {

  let Kn = 0;
  let P1 = params.P1;
  const uoms = params.uoms;
  const CalculationMethod = params.CalculationMethod;
  const lowerLimitValue = CalculationMethod === 'English' ? 1500 : convertUnit(1500, uoms.find(u => u.UnitKey === 'abspressure.psia'), uoms.find(u => u.UnitKey === 'abspressure.bara'));
  const upperLimitValue = CalculationMethod === 'English' ? 3208.2 : convertUnit(3208.2, uoms.find(u => u.UnitKey === 'abspressure.psia'), uoms.find(u => u.UnitKey === 'abspressure.bara'));
  const N17 = Number(getConstantsWithName(CalculationMethod, 'N17'));
  const N18 = Number(getConstantsWithName(CalculationMethod, 'N18'));

  if (lowerLimitValue < P1 && P1 <= upperLimitValue) {
    // 1000 and 1061 are constant regardless of unit system
    Kn = (N17 * P1 - 1000) / (N18 * P1 - 1061);
    // added per changes to the March 26, 2009 Calc spec. 
    if (Kn < 1) {
      Kn = 1;
    }
  }else if (P1 <= lowerLimitValue || P1 > upperLimitValue) {
    Kn = 1;
  }
  return Kn;
}

const ValidateExpression = (expression, object) => {
  const keys = Object.keys(object);
  const values = Object.values(object);
  const keysString = keys.join(', ');
  const func = new Function(keysString, `return ${expression}`);
  return func(...values);
}

const KbKwValidateExpressions = (expression, inputs, uoms, pressureUom) => {
  if (!isNaN(Number(expression))) return expression;
  const pressureKeys = ['Patm', 'Pset', 'Pover', 'Psetp', 'Ploss', 'Pbu', 'Psic', 'Psiv', 'Pback'];
  const newInputs = Object.keys(inputs).reduce((acc, input) => {
    acc[input] = inputs[input];
    if (pressureKeys.includes(input)) {
      acc[input] = convertUnit(inputs[input], uoms.find(u => u.UnitKey === pressureUom), uoms.find(u => u.UnitKey === 'pressure.psig')) ?? 0;
    }
    return acc;
  }, {});
  const kw = ValidateExpression(expression, newInputs);
  // if(kw <= 0){
  //   console.log(expression, newInputs)
  // }
  return kw;
}
const ALP_Models = [
  "93",
  "95",
  "9290P SC",
  "9290C SC",
  "9209V SC",
  "9299C SC",
  "9240C DC",
  "9390P SC",
  "9390C DC",
  "9309V SC",
  "9399C SC",
  "9340C DC",
  "MLCP",
  "9390HP SC",
  "9390HC SC",
  "9309HV SC",
  "9399HC SC"
]

const IsCriticalFlow = (uoms, CalculationMethod, Pset, PR, TPR, valve) => {
  let Models9300 = [
    "93",
    "95",
    "MLCP",
    '9300',
    "9300V DC",
    "9300V SC",
    "9309V SC",
    "9340C DC",
    "9390C DC",
    "9390C SC",
    "9390P SC",
    "9399C SC"
  ];
  // console.log(valve?.Brand,valve?.ModelNumber,valve?.VPValveType,Pset)
  let ModelNumber = valve.ModelNumber;
  if(valve?.Brand==='Anderson Greenwood'){
    if(['WL','SO_ID','SO_LL','SO_SQ','WL_ID','WL_LL','WL_SQ','VB'].includes(valve?.VPValveType)){
      return false;
    }else if(['CS','BP','PO'].includes(valve?.VPValveType)){
      return true;
    }else if(valve?.VPValveType==='LP'){
      const PsetCheckValue = CalculationMethod === 'English' ? 15 : convertUnit(15, uoms.find(u => u.UnitKey === 'pressure.psig'), uoms.find(u => u.UnitKey === 'pressure.barg'));
      return Pset >= PsetCheckValue;
    }
  }else if(valve?.Brand==='Crosby®'){
    if(['CS','BB','BP','BD'].includes(valve?.VPValveType)){
      return true;
    }
  }
  const PsetCheckValue = CalculationMethod === 'English' ? 15 : convertUnit(15, uoms.find(u => u.UnitKey === 'pressure.psig'), uoms.find(u => u.UnitKey === 'pressure.barg'));
  
  return (Pset >= PsetCheckValue) || ((PR <= TPR) && !Models9300.includes(ModelNumber)); // commented old condition
  // return ALP_Models.includes(ModelNumber) && Pset < PsetCheckValue ? false :((PR <= TPR) && !Models9300.includes(ModelNumber)) || (Pset >= PsetCheckValue) || (PR <= TPR); // applied critical check on selected models else return critical true
  // ((PR <= TPR) && !Models9300.includes(ModelNumber)) condition is added for gas/vapour non code 520 instead of !Models9300.includes(ModelNumber
}

const Calculate_W=(isVolumetric,IsCritical,isEnglishCalc,requiredValues,CalcInSCFM = false,valve=null)=>{
  
  const {inputs,A,C,Kx,P1,Kb,Kc,M,T,Z,Fs}=requiredValues;
  const N1 = Number(inputs.constants['N1']);
  const N3 = Number(inputs.constants['N3']);
  const N2 = Number(inputs.constants['N2']);
  const N4 = Number(inputs.constants['N4']);
  // const N33 = Number(inputs.constants['N33']);

    
  const W = isVolumetric
            ? IsCritical
              ? Equation_1p5a(N3, A, C, Kx, P1, Kb, Kc, M, T, Z)
              : Equation_1p3a(N1, Kx, A, P1, Fs, M, T, Z)
              // : isEnglishCalc
              //   ? Equation_1p3a(N1, Kx, A, P1, Fs, M, T, Z) / 60
                // : CalcInSCFM ? isEnglishCalc?Equation_1p3a(N1, Kx, A, P1, Fs, M, T, Z) / 60
                //   :Equation_1p3a(N1, Kx, A, P1, Fs, M, T, Z)
                   
            : IsCritical
              ? Equation_1p5b(N4, A, C, Kx, P1, Kb, Kc, M, T, Z)
              : Equation_1p3b(N2, Kx, A, P1, Fs, M, T, Z);


    // if(valve?.VPValveType === 'SO_ID'){
    //     console.log('SO_ID Pressure Type >>>>> ',{isVolumetric,W, N1, N2, N3, N4, A, C, Kx, P1, Kb, Kc, M, T, Z,W_1p3a: Equation_1p3a(N1, Kx, A, P1, Fs, M, T, Z),W_1p5b:Equation_1p5b(N4, A, C, Kx, P1, Kb, Kc, M, T, Z)})
    // }
  // console.log({W,N3, A, C, Kx, P1, Kb, Kc, M, T, Z,W1: Equation_1p3b(N2, Kx, A, P1, Fs, M, T, Z)})
  return W;
}

const Get_W_Equ=(isVolumetric,IsCritical,inputs)=>{
  
  // const {inputs,A,C,Kx,P1,Kb,Kc,M,T,Z,Fs}=requiredValues;
  const N1 = Number(inputs.constants['N1']);
  const N3 = Number(inputs.constants['N3']);
  const N2 = Number(inputs.constants['N2']);
  const N4 = Number(inputs.constants['N4']);
  // const N33 = Number(inputs.constants['N33']);

    
  const W_Equ = isVolumetric
            ? IsCritical
              ? `(${N3} * A * C * Kx * P1 * Kb * Kc) / ((M * T * Z) ** 0.5)`
              : `(${N1} * Kx * A * P1 * Fs) / ((M * T * Z) ** 0.5)`
            : IsCritical
              ? `((A * C * Kx * P1 * Kb * Kc) / ${N4}) * ((M / (T * Z)) ** 0.5)`
              : `(${N2} * Kx * A * P1 * Fs) * ((M / (T * Z)) ** 0.5)`;

  // console.log({W,N3, A, C, Kx, P1, Kb, Kc, M, T, Z})
  return W_Equ;
}

let Models92xx93xxMLCP = [
  "93",
  "95",
  "MLCP",
  '9300',
  "9300V DC",
  "9300V SC",
  "9309V SC",
  "9340C DC",
  "9390C DC",
  "9390C SC",
  "9390P SC",
  "9399C SC",
  "9200",
  "9200V DC",
  "9200V SC",
  "9209V SC",
  "9240C DC",
  "9290C DC",
  "9290C SC",
  "9290P SC",
  "9299C SC",
  'MLCP'
];

const FAValveType=["FA","WL+FA","FA+FV"];
const Ploss_Models = [
  "61",
  "81",
  "83",
  "86",
  "93",
  "95",
  "96A",
  "243",
  "249",
  "253",
  "259",
  "263",
  "269",
  "443",
  "453",
  "463",
  "546",
  "566",
  "727",
  "800",
  "843",
  "853",
  "863",
  "900",
  "5146",
  "5166",
  "5247",
  "63B",
  "81P",
  "9240C",
  "9240C DC",
  "9290C",
  "9290C SC",
  "9290C DC",
  "9290P",
  "9290P SC",
  "9299C",
  "9299C SC",
  "9340C",
  "9340C DC",
  "9390C",
  "9390C SC",
  "9390C DC",
  "9390P",
  "9390P SC",
  "9399C",
  "9399C SC",
  "BP",
  "JB",
  "JBS-E",
  "JDS-E",
  "JBS-E#",
  "JBS-BP-E",
  "JLT-JBS-E",
  "JLT-JDS-E",
  "JLTJBS-E#",
  "JLT-JBS-BP-E",
  "JLT-JOS-E",
  "JLTJOS-E#",
  "JOS-E",
  "JOS-E#",
  "JOS-H-E",
  "JOS-H-E#",
  "LCP",
  "MLCP"
  ]

  const getKeyValuesForVariables = (valve, uoms, calcMethod) => {
    const vars = {
      "Tn": valve['Operating'] ? convertUnit(valve['Operating'], uoms.find(u => u.UnitKey === valve['TemperatureUOM']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'Tn')[calcMethod])) : '',
      "Twater": valve['WaterRelieving'] ? convertUnit(valve['WaterRelieving'], uoms.find(u => u.UnitKey === valve['TemperatureUOM']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'Twater')[calcMethod])) : '',
      "Tsat": valve['SaturatedSteam'] ? convertUnit(valve['SaturatedSteam'], uoms.find(u => u.UnitKey === valve['TemperatureUOM']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'Tsat')[calcMethod])) : '',
      "TdesignMin": valve['DesignMin'] ? convertUnit(valve['DesignMin'], uoms.find(u => u.UnitKey === valve['TemperatureUOM']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'TdesignMin')[calcMethod])) : '',
      "TdesignMax": valve['DesignMax'] ? convertUnit(valve['DesignMax'], uoms.find(u => u.UnitKey === valve['TemperatureUOM']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'TdesignMax')[calcMethod])) : '',
      "MAWV": valve['SystemMAWV'] ? convertUnit(valve['SystemMAWV'], uoms.find(u => u.UnitKey === valve['PressureUOMVacuum']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'MAWV')[calcMethod])) : '',
      "Vtank": valve['VesselVacuum'] ? convertUnit(valve['VesselVacuum'], uoms.find(u => u.UnitKey === valve['PressureUOMVacuum']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'Ptank')[calcMethod])) : '',
      "Vover": valve['UnderPressure'] ? convertUnit(valve['UnderPressure'], uoms.find(u => u.UnitKey === valve['PressureUOMVacuum']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'Vover')[calcMethod])) : '',
      "Patm": valve['AtmPressure'] ? convertUnit(valve['AtmPressure'], uoms.find(u => u.UnitKey === valve['AtmPressureUOM']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'Patm')[calcMethod])) : '',
      "Pn": valve['OperatingPressure'] ? convertUnit(valve['OperatingPressure'], uoms.find(u => u.UnitKey === valve['PressureUOM']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'Pn')[calcMethod])) : '',
      "MAWP": valve['SystemMAWP'] ? convertUnit(valve['SystemMAWP'], uoms.find(u => u.UnitKey === valve['PressureUOM']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'MAWP')[calcMethod])) : '',
      "P2p": valve['AbsoluteOutletPressure'] ? convertUnit(valve['AbsoluteOutletPressure'], uoms.find(u => u.UnitKey === valve['PressureUOM']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'P2p')[calcMethod])) : '',
      "Pover": valve['OverPressure'] ? convertUnit(valve['OverPressure'], uoms.find(u => u.UnitKey === valve['PressureUOM']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'Pover')[calcMethod])) : '',
      "Ploss": valve['InletLoss'] ? convertUnit(valve['InletLoss'], uoms.find(u => u.UnitKey === valve['PressureUOM']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'Pset')[calcMethod])) : '',
      "P1p": '',
      "Ptank": valve['VesselPressure'] ? convertUnit(valve['VesselPressure'], uoms.find(u => u.UnitKey === valve['PressureUOM']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'Ptank')[calcMethod])) : '',
      "Tmax": '',
      "DeltaPv": valve['DeltaPressureVacuum'] ? convertUnit(valve['DeltaPressureVacuum'], uoms.find(u => u.UnitKey === valve['PressureUOM']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'DeltaPv')[calcMethod])) : '',
      "Mu": valve['Viscosity'] ? convertUnit(valve['Viscosity'], uoms.find(u => u.UnitKey === valve['ViscosityUOM']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'Mu')[calcMethod])) : '',
      "T": valve['Relieving'] ? convertUnit(valve['Relieving'], uoms.find(u => u.UnitKey === valve['TemperatureUOM']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'T')[calcMethod])) : '',
      "Ppso": '',
      "Pset": valve['SetPressure'] ? convertUnit(valve['SetPressure'], uoms.find(u => u.UnitKey === valve['PressureUOM']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'Pset')[calcMethod])) : '',
      "Ppn": '',
      "Vset": valve['SetVacuum'] ? convertUnit(valve['SetVacuum'], uoms.find(u => u.UnitKey === valve['PressureUOMVacuum']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'Vset')[calcMethod])) : '',
      "Pback": valve['TotalBackPressure'] ? convertUnit(valve['TotalBackPressure'], uoms.find(u => u.UnitKey === valve['PressureUOM']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'Pback')[calcMethod])) : '',
      "DeltaP": valve['DeltaPressure'] ? convertUnit(valve['DeltaPressure'], uoms.find(u => u.UnitKey === valve['PressureUOM']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'DeltaP')[calcMethod])) : '',
      "P1pv": valve['AbsoluteInletPressureVacuum'] ? convertUnit(valve['AbsoluteInletPressureVacuum'], uoms.find(u => u.UnitKey === valve['PressureUOMVacuum']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'P1pv')[calcMethod])) : '',
      "P2pv": valve['AbsoluteOutletPressureVacuum'] ? convertUnit(valve['AbsoluteOutletPressureVacuum'], uoms.find(u => u.UnitKey === valve['PressureUOMVacuum']), uoms.find(u => u.UnitKey === Variables.find(v => v.Variable === 'P2pv')[calcMethod])) : ''
    };
    return vars;
  }

  const Pressure_Vacuum_WF=[3,22,23,24];
  const CONST_FOR_WATTED_SURFACE_AREA = 9.14;

  const FACTOR_FOR_LATITUDE = [
  { TankLatitude: "Below 42°", Factor: 0.32 },
  { TankLatitude: "Between 42° and 58°", Factor: 0.25 },
  { TankLatitude: "Above 58°", Factor: 0.2 },
];

const FACTOR_FOR_VARIOUS_CONDITION = [
  {
    TankLatitude: "Below 42°",
    VaporPressure: "Hexane or Similar",
    AverageStorageTemperature: "Below 77°F (25°C)",
    Factor: 4,
  },
  {
    TankLatitude: "Below 42°",
    VaporPressure: "Hexane or Similar",
    AverageStorageTemperature: "Greater Than or Equal to 77°F (25°C)",
    Factor: 6.5,
  },
  {
    TankLatitude: "Below 42°",
    VaporPressure: "Higher than Hexane or Unknown",
    AverageStorageTemperature: "Below 77°F (25°C)",
    Factor: 6.5,
  },
  {
    TankLatitude: "Below 42°",
    VaporPressure: "Higher than Hexane or Unknown",
    AverageStorageTemperature: "Greater Than or Equal to 77°F (25°C)",
    Factor: 6.5,
  },
  {
    TankLatitude: "Between 42° and 58°",
    VaporPressure: "Hexane or Similar",
    AverageStorageTemperature: "Below 77°F (25°C)",
    Factor: 3,
  },
  {
    TankLatitude: "Between 42° and 58°",
    VaporPressure: "Hexane or Similar",
    AverageStorageTemperature: "Greater Than or Equal to 77°F (25°C)",
    Factor: 5,
  },
  {
    TankLatitude: "Between 42° and 58°",
    VaporPressure: "Higher than Hexane or Unknown",
    AverageStorageTemperature: "Below 77°F (25°C)",
    Factor: 5,
  },
  {
    TankLatitude: "Between 42° and 58°",
    VaporPressure: "Higher than Hexane or Unknown",
    AverageStorageTemperature: "Greater Than or Equal to 77°F (25°C)",
    Factor: 5,
  },
  {
    TankLatitude: "Above 58°",
    VaporPressure: "Hexane or Similar",
    AverageStorageTemperature: "Below 77°F (25°C)",
    Factor: 2.5,
  },
  {
    TankLatitude: "Above 58°",
    VaporPressure: "Hexane or Similar",
    AverageStorageTemperature: "Greater Than or Equal to 77°F (25°C)",
    Factor: 4,
  },
  {
    TankLatitude: "Above 58°",
    VaporPressure: "Higher than Hexane or Unknown",
    AverageStorageTemperature: "Below 77°F (25°C)",
    Factor: 4,
  },
  {
    TankLatitude: "Above 58°",
    VaporPressure: "Higher than Hexane or Unknown",
    AverageStorageTemperature: "Greater Than or Equal to 77°F (25°C)",
    Factor: 4,
  },
];

const getFinalExpressions = (fieldIds, databaseValues, expressions, targetColumn) => {
  let localExpressions=[];
  if(Array.isArray(databaseValues) && databaseValues?.length>0){
    databaseValues?.forEach((v,ind) => {
      const localExpn=expressions.find((locExp,index) => locExp.fieldId===v.FieldId && ind===index);
      // console.log(' >>>>>>>>>> ',v,localExpn,localExpressions)
      if(localExpn !==undefined){
        localExpressions.push({ ...localExpn, ExpressionId: v[targetColumn] });
      }
      // expressions.forEach(expr => {
      //     // if(fieldIds?.length===1){
      //     //     localExpressions.push({ ...expr, ExpressionId: expr[targetColumn] });
      //     // }else 
      //     if (expr.fieldId === v.FieldId) {
      //         const existanceFlag=localExpressions?.length>0? localExpressions.find(localExpr => localExpr?.ExpressionId===v[targetColumn] && localExpr?.target?.currentId===expr?.target?.currentId && localExpr?.target?.focusedField===expr?.target?.focusedField && localExpr?.target?.expression===expr?.target?.expression): false;
      //         console.log(' >>>>>>>>>>>>>>>>>>>>>>>>>',expr,v[targetColumn], existanceFlag) 
      //         if(!existanceFlag || existanceFlag===undefined){
      //           localExpressions.push({ ...expr, ExpressionId: v[targetColumn] });
      //         }
              
      //     }
      // });
    });
  }else if (Array.isArray(expressions) && expressions.length > 0) {
    expressions.forEach(expr => {
      localExpressions.push({ ...expr, ExpressionId: expr[targetColumn] });
    });
  }
  // console.log(' >>>>>>>>>>>>>>>>>>>>>>>>>',fieldIds,localExpressions)
  return localExpressions;
};

const getExpressionCheckFlag = (expressions, fieldnames) => {
  let expressionflags={};
  if (Array.isArray(fieldnames) && fieldnames.length > 0) {
    fieldnames?.forEach(fieldname => {
      if (Array.isArray(expressions) && expressions.length > 0) {
        for (const expr of expressions) {
          const target = expr?.target;
          if (target && target?.Symbol === 'Calculate') {
            if(target?.currentId==fieldname || target?.Id==fieldname){
              expressionflags[fieldname] = true;
            }
          } else if (expr?.currentId === fieldname) {
            expressionflags[fieldname] = false;
          }
        }
        
      }else{
        expressionflags[fieldname] = false;
      }
    });
  }else{
    expressionflags[fieldnames]=false;
  }
  
  return expressionflags;
}

const getSubFieldsData=(insertedFields,subField,fieldNames,IsApiCallActionRequired=false)=>{
  const ExpressioncheckFlag ={}; //getExpressionCheckFlag(subField,fieldNames);//Array.isArray(subField) && subField?.length>0;
  let localFieldValues=[];
  // console.log(insertedFields,subField,fieldNames)
  if (Array.isArray(fieldNames) && fieldNames.length > 0) {
  // if(ExpresisoncheckFlag[localFieldName]){
    // if(insertedFields?.length>1){
    fieldNames?.forEach(localFieldName=>{
      //  console.log({insertedFields:insertedFields,subField,fieldNames,FieldName:localFieldName})
      if(Array.isArray(subField) && subField?.length>0){
        insertedFields?.forEach(({FieldId,FieldName}) => {
          subField?.forEach((field) => {
            if(field?.target){
              const {id,target,value,currentId}=field;
              // let localFieldName=fieldNames.find(name=>name.trim()===FieldName);
              // fieldNames?.forEach(localFieldName=>{
                // console.log('localFieldName >>>>>>>>> 33333 >>>>>. ',localFieldName);
                // if(localFieldName !==undefined){
              if(id===localFieldName || target?.Id===localFieldName){
                localFieldValues.push({ ...field,FieldId, FieldName:localFieldName });
              }else if( target?.currentId===localFieldName || currentId===localFieldName){
                localFieldValues.push({ ...field,FieldId, FieldName:localFieldName });
              }else if(IsApiCallActionRequired){
                localFieldValues.push({ ...field,FieldId, FieldName:localFieldName });
              }
              ExpressioncheckFlag[localFieldName]=true;
                // }
              // })
            }else if(field?.currentId===localFieldName || field?.id===localFieldName){
              localFieldValues.push({ value: field?.value, FieldId, FieldName:localFieldName });
              ExpressioncheckFlag[localFieldName]=false;
            }else if(IsApiCallActionRequired){
              localFieldValues.push({ value: field?.value, FieldId, FieldName:localFieldName });
              ExpressioncheckFlag[localFieldName]=false;
            }

            
          });
        });
      }else {
        const localValue=subField?.value ?? subField
        insertedFields?.forEach(({FieldId,FieldName}) => {
          localFieldValues.push({ value: localValue, FieldId, FieldName:localFieldName });
          ExpressioncheckFlag[localFieldName]=false;
        });
      }
    });
    // }else{
    //   insertedFields?.forEach(({FieldId,FieldName}) => {
    //     subField?.forEach((defValue) => {
    //       localFieldValues.push({ ...defValue, FieldId, FieldName });
    //     });
    //   });
    // }
  }else{
    const localValue=subField?.value ?? subField
    insertedFields?.forEach(({FieldId,FieldName}) => {
      // if(fieldNames?.length>1){
      //   // let localFieldName=fieldNames.find(name=>name.trim()===FieldName);
      //   fieldNames?.forEach(localFieldName=>{
          // console.log('localFieldName >>>>>>>>> 44444 >>>>>. ',localFieldName);
      if(fieldNames !==undefined ){
        localFieldValues.push({ value: localValue, FieldId, localFieldName:fieldNames });
        ExpressioncheckFlag[fieldNames]=false;
      }
      //   })
      // }else{
      //   localFieldValues.push({ value: localValue, FieldId, FieldName });
      // }
      
    });
  }
  
  // console.log('localFieldName >>>>>>>>> 55555 >>>>>. ',localFieldValues);
  return {localFieldValues, ExpressioncheckFlag};
}

const typeDefaultValues = (defaultValues)=>{
  const typedValues = {};
  const intRegex = /^-?\d+$/;
  const floatRegex = /^-?\d*(\.\d+)?([eE][-+]?\d+)?$/;
  const boolRegex= /^(true|false)$/i;

  for (const key in defaultValues) {
    const value = defaultValues[key];
    // if(value ==null || value == undefined || value ==''){
    //   console.log(key,value,boolRegex.test(value),floatRegex.test(value),intRegex.test(value))
    // }
    if ( (boolRegex.test(value) && value !='' && value !=0 && value !=1) || 
    value === 'true' || value === 'false') {
      // console.log('check default type >>>>> ',key,value,value?.toLowerCase() === 'true')
      typedValues[key] = value === 'true';
    } else if (floatRegex.test(value) && value !='') {
      typedValues[key] = parseFloat(value);
    } else if(intRegex.test(value)  && value !='') {
      typedValues[key] = parseInt(value, 10);
    } else {
      typedValues[key] =value;
    }
  }
  // console.log('check default type 22222 >>>>> ',typedValues)
  return typedValues;
}

const filterExpressionAndDefValues=(fields,Values,ValueId)=>{
  let reqValues={};
  let fieldValues={};
  let reqExpression=[];
  if(Values?.length>0){
      let multiFieldCounter=0;
      let localFieldId=null;
      let localValue=[];
      Values.forEach(Val=>{
          const fieldName=fields.find(field=>field.FieldId===Val.FieldId);
          if(fieldName){
              if(!Val?.ExpresisoncheckFlag && ValueId !=='ValidationId'){
                
                let localfieldName=fieldName?.FieldName?.split('|');
                const fieldNameLength=localfieldName?.length;
                if(localFieldId==null || localFieldId!=Val.FieldId){
                  localfieldName=localfieldName[0].trim();
                  multiFieldCounter=1;
                  reqValues[fieldName?.FieldName]=Val?.DefaultValue;
                  fieldValues[localfieldName]=Val?.DefaultValue;
                  if(fieldNameLength>1){
                    // localDefaultValue[localfieldName]=Val?.DefaultValue;
                    localValue=[{"id":localfieldName,"currentId":localfieldName,"value":Val?.DefaultValue=='true'?true: Val?.DefaultValue=='false'?false:Val?.DefaultValue}];
                  }
                }else if(fieldNameLength>1){
                  localfieldName=localfieldName[multiFieldCounter].trim();
                  multiFieldCounter+=1;
                  fieldValues[localfieldName]=Val?.DefaultValue;
                  // localDefaultValue[localfieldName]=Val?.DefaultValue;
                  localValue.push({"id":localfieldName,"currentId":localfieldName,"value":Val?.DefaultValue=='true'?true: Val?.DefaultValue=='false'?false:Val?.DefaultValue});
                  reqValues[fieldName?.FieldName]=localValue;
                  // console.log(fieldName?.FieldName,Val?.DefaultValue,localValue)
                }
                // reqValues[localfieldName]=Val?.DefaultValue;
                localFieldId=Val.FieldId;
              }else{
                  reqExpression.push({FieldName:fieldName?.FieldName, ExpressionId:Val[ValueId]});
              }  
          }

      })
  }
  expressionIds=reqExpression.map(exp=>exp.ExpressionId);
  return {value:reqValues,fieldValues,expressions:reqExpression,expressionIds};
}

const mergeDefaultAndExpressionValues=(defaultValues,fieldValues,expressionValues)=>{
  let mergedValues={};
  const fieldKeys=Object.keys(fieldValues);
  for(const key in defaultValues){
    const keyCounts=key?.split('|')?.length;
    if(keyCounts>1){
      const localKeys=key?.split('|');
      let localValues=[];
      localKeys.forEach((localKey)=>{
        if(expressionValues[localKey]!==undefined){
          localValues.push({"id":localKey.trim(),"currentId":localKey.trim(),"value":expressionValues[localKey]});
        }else if(fieldValues[key]!==undefined){
          const fieldKeyValues=fieldValues[key]?.find(fv=>fv?.id.trim()===localKey.trim());
          if(fieldKeyValues!==undefined){
            localValues.push({"id":localKey.trim(),"currentId":localKey.trim(),"value":fieldKeyValues?.value});
          }
        }else if(fieldValues[localKey]!==undefined){
          localValues.push({"id":localKey.trim(),"currentId":localKey.trim(),"value":fieldValues[localKey]});
        }
      });
      mergedValues[key]=localValues;
    }else if(expressionValues[key] !=undefined){
      mergedValues[key]=expressionValues[key] ?? fieldValues[key];
    }else if(fieldValues[key]!==undefined){
      mergedValues[key]=fieldValues[key];
    }else {
      const fieldValue= fieldKeys.find(fk=>fk.indexOf(key)!==-1);
      if(fieldValue!==undefined && mergedValues[fieldValue]===undefined){
        mergedValues[fieldValue]=fieldValues[fieldValue];
        // console.log(' >>>>>>>>> ',fieldValue,mergedValues[fieldValue])
      }
      // mergedValues[key]=defaultValues[key];
    }
  }
  return mergedValues;
}

const getFieldWiseExpressions=(fieldname,expressions)=>{
  let fieldExpressions=[];
  let localFieldNames=fieldname?.split('|');
  
  if(localFieldNames?.length>1){
    localFieldNames.forEach((localFieldName)=>{
      const fieldExpression = expressions.find(exp => exp.FocusedField === localFieldName);
      
      if (fieldExpression) {
          fieldExpressions.push(fieldExpression);
      }
    });
  }else{
    fieldExpressions = expressions.filter(exp => exp.FocusedField == fieldname);
  }
  // console.log('In getFieldWiseExpressions >>>>> ',fieldname,localFieldNames,expressions?.length,fieldExpressions?.length)
  return fieldExpressions;
}

const getFieldWiseUOMFocussedExpressions=(fieldname,expressions)=>{
  
  const fieldExpressions = expressions.filter(exp => exp.CurrentId=== fieldname && exp.FocusedField.indexOf('UOM')!==-1);
  
  // console.log('In getFieldWiseExpressions >>>>> ',fieldname,localFieldNames,expressions?.length,fieldExpressions?.length)
  return fieldExpressions?.length>0?fieldExpressions: undefined;
}

const WorkFlowIds=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]

const workFlowPopupData = {
  3: "API2000Popup",
  12: "FireSizingPopup",
  23: "API2000Popup",
  24: "API2000Popup",
};

// const Two_Phase_WorkflowIds=[13,14,15,16,17,18,19,20,21];
// export const TwoPhase_CDSeries_WF=[14,15, 17, 18, 20];

const Models_9300H_Sizing=["9300V SC","9309V SC","9390C SC","9390P SC","9399C SC","9300V DC","9340C DC","9390C DC"]

const Sec1_Model_Configuration = {
  title: "PRV²Size",
  content: ['NOTE: Although ASME Code Section I(V), PG-69.1.6 allows the use of direct spring loaded relief valves for economizer spring service, Crosby® style HSJ safety valves are not capacity certified on water.',
    'Emerson Automation Solutions suggests the use of Anderson Greenwood Series 5200 modulating pilot operated safety relief valves for economizer service applications covered by ASME Code Section I(V). Futher information can be found in catalog VCTDS-00803.'
  ],
};

const Two_Phase_Model_Configuration = {
  title: "PRV²Size",
  content: ['Emerson Automation Solutions recommends using a balanced bellows (JLT-JBS-E or JLT-JBS-BP-E) or pilot operated valve, because the built up back pressure in the body bowl of the valve can be difficult to predict. The balanced valve will allow the valve to perform properly should any unforeseen built-up back pressure be present.'],
};

const Omni900Modal_Configuration = {
  title: "PRV²Size",
  content: {
    text1: 'Select the valve model for configuration & proceed:',
    isOptionsDisplay: true,
    options: [
      { label: 'Omni900H', value: 'Omni900H' },
      { label: 'Omni900V', value: 'Omni900V' },
    ],
    isOptionSelectable: true,
    singleOrMultiSelect: 'single',
  },
};

const LINK_FOR_9300H='https://www.emerson.com/en-us';
const Modal93XX_Configuration = {
  title: "PRV²Size",
  content: {
    text1: 'NOTE: A better solution may be available using a 9300H.',
    text2: {
      contentList:['The ','9300H sizing tool',' can be used to check.'],
      textAsLinksAndLinkedUrl:{
        '9300H sizing tool': LINK_FOR_9300H
      }
    }
  },
};

const SSOAModels = ['EMC', 'EMH', 'EMB', 'JBS-E','JDS-E','JBS-E#','JBS-BP-E','JBS-BP-E (Leak Detection)','JOS-E','JOS-E#','JOS-H-E','JOS-H-E#'];
const OnlySSOAModels = ['EMC', 'EMH', 'EMB'];

const filterSSOA = (valves, inputs) => {
    let newValves = [...valves];    
    if(inputs?.IsSetOnAir === undefined || inputs?.IsSetOnAir === null || inputs?.IsSetOnAir === '') {
      return newValves;
    }
    if(inputs?.IsSetOnAir) {
        newValves = valves.filter(valve => SSOAModels.includes(valve.ModelNumber));
    }else if(inputs?.Code !== "ISO4126") {
        newValves = valves.filter(valve => !OnlySSOAModels.includes(valve.ModelNumber));
    }
    return newValves;
}

const EM_Models_MOD={
  "EMC":  "EMC",
  "EMH": "EMH",
  "EMB": "EMB"
}

const EM_Models=['EMC', 'EMH', 'EMB'];

const EM_SERVICE_Kdr={
  "GAS":0.711,
  "LIQ":0.453,
  "STM":0.711
}

const EM_Connection_Size={
  "DN25 / 1": { "CS": "025", "min": 0.4 },
  "DN32 / 1 1/4": { "CS": "032", "min": 0.3 },
  "DN40 / 1 1/2": { "CS": "040", "min": 0.3 },
  "DN50 / 2": { "CS": "050", "min": 0.3 },
  "DN65 / 2 1/2": { "CS": "065", "min": 0.3 },
  "DN80 / 3": { "CS": "080", "min": 0.3 },
  "DN100 / 4": { "CS": "100", "min": 0.3 }
}

const filterEMModels = (valves, inputs,workflowId) => {
  let newValves = [...valves];
  let isEMModelRequired = false;
  let isEMHModelRequired = false;
  // console.log(' >>>>>>>>>>>>>>>>>>>>>>>>> ',workflowId,inputs?.FluidName,inputs?.IsASMESection8)
  if(!inputs?.IsASMESection8) {
    isEMModelRequired = true;
    if([1,2,4,12,26,9,14].includes(workflowId) && inputs?.FluidName.toUpperCase()==='AIR' ) {
      isEMHModelRequired = true;
    }
  }
  if(isEMModelRequired) {
    newValves=valves.filter(valve => (valve.ModelNumber==='EMH' && isEMHModelRequired) || (valve.ModelNumber!=='EMH' ));
  }else{
    newValves=valves.filter(valve => !EM_Models.includes(valve.ModelNumber));
  }
  return newValves;

}
const IFR_Models=['JOS-E','JLT-JOS-E','JOS-E#','JLT-JOS-E#','JOS-H-E','JOS-H-E#'];

const getCDTP=(valve,inputs)=>{

}

const JSeriesRSModels=['JOS-E','JBS-E','JLT-JOS-E','JLT-JBS-E','JBS-BP-E','JLT-JBS-BP-E','JOS-E#','JBS-E#','JLT-JOS-E#','JLT-JBS-E#','JOS-H-E','JOS-H-E#','JDS-E','JLT-JDS-E','JBS-BP-E (Leak Detection)','JLT-JBS-BP-E (Leak Detection)','JBS-BP-E (leak detection)','JLT-JBS-BP-E (leak detection)']
const Models_MOD_IFR={
  "JOS-E": {"MOD": "JOS", "Need_IFR": "NO"},
  "JBS-E": {"MOD": "JBS", "Need_IFR": "YES"},
  "JLT-JOS-E": {"MOD": "JOL", "Need_IFR": "NO"},
  "JLT-JBS-E": {"MOD": "JBL", "Need_IFR": "YES"},
  "JBS-BP-E": {"MOD": "JBP", "Need_IFR": "YES"},
  "JLT-JBS-BP-E": {"MOD": "JLP", "Need_IFR": "YES"},
  "JOS-E#": {"MOD": "JOP", "Need_IFR": "NO"},
  "JBS-E#": {"MOD": "JHB", "Need_IFR": "YES"},
  "JOS-H-E#": {"MOD": "JHH", "Need_IFR": "NO"},
  "JLT-JOS-E#": {"MOD": "JL#", "Need_IFR": "NO"},
  "JLT-JBS-E#": {"MOD": "JT#", "Need_IFR": "YES"},
  "JOS-H-E": {"MOD": "JOH", "Need_IFR": "NO"},
  "JDS-E": {"MOD": "JDS", "Need_IFR": "YES"},
  "JBS-BP-E (Leak Detection)": {"MOD": "JBD", "Need_IFR": "YES"},
  "JBS-BP-E (leak detection)": {"MOD": "JBD", "Need_IFR": "YES"},
  "JLT-JDS-E": {"MOD": "JDL", "Need_IFR": "YES"},
  "JLT-JBS-BP-E (Leak Detection)": {"MOD": "JBK", "Need_IFR": "YES"},
  "JLT-JBS-BP-E (leak detection)": {"MOD": "JBK", "Need_IFR": "YES"}
};

const JseriesRestrictedErrors={
'err1':'Required capacity is mandatory for restricted lift calculation.',
'err2':'Do Not Exceed Capacity cannot be less than the Required Capacity.',
'err3':'Restricted lift is not available for bellows valves with D/E orifices and high pressure inlet flanges.',
'err4':'Lift restriction is not avaialble, because full lift is required.',
'err5':'Lift restriction is not available.  Do Not Exceed capacity may be too low.',
'err6':'Lift restriction is not avaialble, because full lift is required.'
};



/* ===============================
   NORMALIZE HELPER
================================ */
const normalizeValues = (val) => {
  if (val === null || val === undefined) return "";
  return String(val).trim().toUpperCase();
}

const Desktop_Valid_Models=[
  "243","249","253","259","263","269","443","453","463",
"546","566","63","81","83","84","81P","843","853","863",
"HE","HSJ","HSL","HCI",
"JBS-BP-E","JBS-BP-E (Leak Detection)","JBS-E","JBS-E#","JDS-E",
"JLT-JBS-BP-E","JLT-JBS-BP-E (Leak Detection)","JLT-JBS-E","JLT-JBS-E#",
"JLT-JDS-E","JLT-JOS-E","JLT-JOS-E#",
"JOS-E","JOS-E#","JOS-H-E","JOS-H-E#",
"900","BP"
]
// Model list which need to be shown with - for size/Orifice values on result page and other than this list all models will be shown with "(inches) for size/Orifice value in result page.
const OrificeDesignationModels = [
  "81","83","84","243","249","253","259","263","269","443","453","463","546","566","727","843","853","863","900","5247","63B","81P","BP","EMB","EMC","EMH","HCA","HCI","HE","HSJ","HSL","JB","JBS-BP-E","JBS-BP-E (Leak Detection)","JBS-E","JBS-E#","JDS-E","JLT-JBS-BP-E","JLT-JBS-BP-E (Leak Detection)","JLT-JBS-E","JLT-JBS-E#","JLT-JDS-E","JLT-JOS-E","JLT-JOS-E#","JOS-E","JOS-E#","JOS-H-E","JOS-H-E#"
]

/**
 * Maps UOM codes to their symbol representations
 * Used for extracting values from multi-UOM objects
 * @param {string} uomCode - The UOM code (e.g., 'area.in2')
 * @returns {string} - The UOM symbol (e.g., 'in²')
 */
const getUomSymbol = (uomCode) => {
    const symbolMap = {
        'area.in2': 'in²',
        'area.cm2': 'cm²',
        'area.mm2': 'mm²',
        'massflux.lbsft2': 'lbsft2',
        'massflux.kgsm2': 'kgsm2',
        'massflow.lbhr': 'lbhr',
        'massflow.kgh': 'kgh',
    };
    return symbolMap[uomCode] || uomCode;
};

/**
 * Extracts numeric value from multi-UOM object based on UOM code
 * Handles both single numeric values and multi-UOM display objects
 * @param {string|number|object} value - The value (can be numeric or multi-UOM object)
 * @param {string} uomCode - The UOM code (e.g., 'area.in2')
 * @returns {number|string} - The extracted numeric value or original value
 */
const extractNumericFromUom = (value, uomCode) => {
    if (!value && value !== 0) return value;
    
    // If already numeric, return as-is
    if (typeof value === 'number') {
        return value;
    }
    
    // If it's a string number, parse it
    if (typeof value === 'string' && !isNaN(value)) {
        return parseFloat(value);
    }
    
    // If it's a multi-UOM object, extract the correct value
    if (typeof value === 'object' && value !== null) {
        const uomSymbol = getUomSymbol(uomCode);
        const numericValue = value[uomSymbol];
        
        if (numericValue === undefined || numericValue === null) {
            // Try alternative extraction methods - get first available value
            const firstValue = Object.values(value)[0];
            return typeof firstValue === 'string' ? parseFloat(firstValue) : firstValue;
        }
        
        return typeof numericValue === 'string' ? parseFloat(numericValue) : numericValue;
    }
    
    return value;
};

const SectionVIII_WF=[1,5,9,12,26,14,15,16,17,18,19,20,21]

module.exports = {
  BigNumber,
  addNumbers,
  getFilteredData,
  getFormatedValues,
  getFormatedValue,
  getKeyValuesForVariables,
  Variables,
  getConstants,
  evaluateLimits,
  evaluateLimit,
  evaluateExpression,
  evaluateTExpression,
  evalFactor,
  checkForValidValue,
  convertUnit,
  convertUnitDiffDims,
  modelNumbersMAWP,
  mapServiceWithPACode,
  getParsedExpressions,
  ModelNumbers,
  hcflModels,
  WorkflowCalculations,
  WorkflowResultsHeader,
  WorkflowSelectedField,
  ALP_Models,
  validatePbackType,
  kdCalculation,
  knCalculation,
  ValidateExpression,
  KbKwValidateExpressions,
  IsCriticalFlow,
  Models92xx93xxMLCP,
  KdKxCheck,
  getConstantsWithName,
  FAValveType,
  Ploss_Models,
  Calculate_W,
  Get_W_Equ,
  Pressure_Vacuum_WF,
  TwoPhase_WF,TwoPhase_CDSeries_WF,
  CONST_FOR_WATTED_SURFACE_AREA,
  FACTOR_FOR_LATITUDE,
  FACTOR_FOR_VARIOUS_CONDITION,
  getFinalExpressions,
  getExpressionCheckFlag,
  getSubFieldsData,
  WorkFlowIds,
  typeDefaultValues,
  filterExpressionAndDefValues,
  mergeDefaultAndExpressionValues,
  getFieldWiseExpressions,
  getFieldWiseUOMFocussedExpressions,
  workFlowPopupData,
  Models_9300H_Sizing,
  Sec1_Model_Configuration,
  Two_Phase_Model_Configuration,
  Omni900Modal_Configuration,
  Modal93XX_Configuration,
  getCDTP,
  filterSSOA,
  IFR_Models,
  JSeriesRSModels,
  Models_MOD_IFR,
  JseriesRestrictedErrors,
  EM_Models_MOD,
  SectionVIII_WF,
  EM_SERVICE_Kdr,
  EM_Connection_Size,
  EM_Models,
  normalizeValues,
  Desktop_Valid_Models,
  OrificeDesignationModels,
  filterEMModels,
  getUomSymbol,
  extractNumericFromUom
};
