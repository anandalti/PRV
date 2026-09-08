import { convertUnit } from "./convertUnit";
import * as MathJS from "mathjs";


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

export const getKeyValuesForVariables = (valve, uoms, calcMethod) => {
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

const evaluateLimits = (limits, params) => {
    // console.log(!limits,limits.length === 0)
    if (!limits || limits.length === 0)
      return {
        result: true,
        failedExpressions: [],
      };
  
    let allResult = true;
    let anyResult = false;
    let anyExists = false;
    const allFailedExpressions = [];
    let anyFailedExpressions = [];
    for (const lt of limits) {
        // let limit={...lt,result:true,filteredExpression:[],failedExpression:null};
        let limit=evaluateLimit(lt, params);
  
      if (limit.AnyOrAll === "All" && !limit.result) {
        allResult = false;
        allFailedExpressions.push(limit.failedExpression);
        break;
      } else if (limit.AnyOrAll === "Any") {
        anyExists = true;
        if (limit.result) {
          anyResult = true;
          anyFailedExpressions = [];
        } else if (!anyResult) {
          anyFailedExpressions.push(limit.failedExpression);
        }
      }
    }
  
    return {
      result: allResult && (!anyExists || anyResult),
      failedExpressions: [...allFailedExpressions, ...anyFailedExpressions],
    };
  };
  
  const evaluateLimit = (limit, params) => {
    let localLimit = { ...limit,result:true,filteredExpression:[],failedExpression:null };
    // console.log('Before >>>>>>>> ',localLimit)
    if (localLimit.parsedExpression) {
      for (const expression of localLimit.parsedExpression) {
        if (!expression.variables.find((v) => !params[v])) {
            localLimit.filteredExpression.push(expression);
          let result = false;
          if (expression.variables.find((v) => v === "T")) {
            result = evaluateTExpression(expression, params);
          } else {
            result = evaluateExpression(expression, params);
          }
          if (!result) {
            localLimit.result = false;
            localLimit.failedExpression = expression.originalExpression;
            break;
          }
        }
      }
      // console.log('After >>>>>>>> ',localLimit)
    }
    return {...localLimit,AnyOrAll:'All'};
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
  
    return result;
  };

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
        const rhs = exp.substr(matchIndex).split(" ");
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
  
    let localLimits =[...limits];
    if (Array.isArray(limits)) {
        
        localLimits=limits.map((limit) => {
        const parsedExpression = parseExpression(limit, uomHash, varHash);
        // console.log('parsedExpression >>>>>>>>> ',parsedExpression)
        return {...limit, parsedExpression};
      });
    }
    // console.log('limits >>>>>>>>. ',localLimits)
    return localLimits;
  };

  export const evaluateLimitExpressions=(limits,payload, units)=>{
    const CalculationMethod=payload?.CalculationMethod;
    let uoms=[];
    Object.values(units).forEach((item)=> {
        uoms.push(...item);
    })
    const variables = getKeyValuesForVariables(payload, uoms, CalculationMethod);
    // Parse the Expressions in Limits and convert the values based on the Calculation Method
    const parsedLimits = getParsedExpressions(limits, Variables, uoms, CalculationMethod, { ...variables, ...payload });
    const { result, failedExpressions } = evaluateLimits(parsedLimits, { ...variables, ...payload });
    console.log('Combo Limits >>> In evaluateLimitExpressions >>>>>>>>>>>>> ',parsedLimits,result, failedExpressions)
    return {result, failedExpressions};
  }
  