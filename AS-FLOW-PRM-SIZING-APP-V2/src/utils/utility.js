import {
  BIGNUMBER_DECIMALS,
  BIGNUMBER_ROUNDING_MODE,
  CONVERT_TOFIXED_DECIMALS,
  RULES,
  preferenceKeyMapping,
} from "./constants";
import bigNumber from "bignumber.js";
import { getConvertedValue } from "./convertUnit";

export const BigNumber = bigNumber.clone({DECIMAL_PLACES: BIGNUMBER_DECIMALS, ROUNDING_MODE: BIGNUMBER_ROUNDING_MODE});
export const getUpdatedDefaultUnits=(units, preference)=>{
    let defaultUnits = JSON.parse(JSON.stringify(units))
    if(preference){
        // Determine which unit system to update
        const unitSystem = preference.DisplayUnitSystem === "Metric" ? 'Metric' : 'English';
        // Update defaultUnit based on the preference values
        for (const prefKey in preference) {
            const prefValue = preference[prefKey];
            if (typeof prefValue === 'string') {
                const [prefPrefix] = prefValue.split('.'); // Get the part before the dot
                
                // Iterate over each key in the selected unit system of defaultUnit
                for (const unitKey in defaultUnits[unitSystem]) {
                    const unitValue = defaultUnits[unitSystem][unitKey];
                    const [unitPrefix] = unitValue.split('.'); // Get the part before the dot
                    // If the prefixes match, replace the part after the dot with the new value
                    if (prefPrefix === unitPrefix) {
                        const [, prefSuffix] = prefValue.split('.'); // Get the part after the dot from preference
                        defaultUnits[unitSystem][unitKey] = `${unitPrefix}.${prefSuffix}`;
                    }
                }
            }
        }
    }
    // console.log('defaultUnits 1111111 >>>>>>>>>>>>>>>>> ',defaultUnits)
    return defaultUnits
}
export const updateSelectedFields = (
  selectedWorkflow,
  previousWorkflow,
  selectedFields
) => {
  //const rule = rules.find(r=>r.fromWorkflow===previousWorkflow && r.toWorkflow ===selectedWorkflow);
  const rule = RULES.find(
    (r) =>
      r.fromWorkflow.includes(previousWorkflow) &&
      r.toWorkflow.includes(selectedWorkflow)
  );
  if (rule && selectedFields) {
    const retainedFields = rule.retainedFields;
    const newSelectedFields = selectedFields.filter((field) =>
      retainedFields.includes(field.name)
    );
    // const newSelectedFields = selectedFields.map(field=>{
    //     if(retainedFields.includes(field.name)){
    //         return field
    //     }else{
    //         return {name:field.name, value:null }
    //     }
    // })
    return newSelectedFields;
  }
  return [];
};

export const updateErrors = (selectedWorkflow, previousWorkflow, error) => {
  //const rule = rules.find(r=>r.fromWorkflow===previousWorkflow && r.toWorkflow ===selectedWorkflow);
  const rule = RULES.find(
    (r) =>
      r.fromWorkflow.includes(previousWorkflow) &&
      r.toWorkflow.includes(selectedWorkflow)
  );
  if (rule && error !== null && Array.isArray(error)) {
    const retainedFields = rule.retainedFields;
    const updatedErrors = error.filter((field) =>
      retainedFields.includes(field.name)
    );
    return updatedErrors;
  }
  return [];
};

export const getUserPreference = (userPreference) => {
  // Guard against null/undefined — preferences may not be loaded yet after login
  if (userPreference == null) return {};
  // Create a new object to hold the mapped preferences
  const mappedUserPreference = {};
  Object.keys(userPreference).forEach((key) => {
    if (preferenceKeyMapping[key]) {
      // Map the key to the new key
      mappedUserPreference[preferenceKeyMapping[key]] = userPreference[key];
    } else {
      // Keep the original key if it's not in the mapping
      mappedUserPreference[key] = userPreference[key];
    }
  });
  // If you need to replace the original object
  userPreference = mappedUserPreference;
  // console.log(userPreference);
  //console.log('[updateUserPreference >>>>] ', userPreference);
  return userPreference;
};

export const setErrorMessage = (name, type, message, flag) => {
  return { name, value: { error: { type, message, flag } } };
};

function countLeadingAndTrailingZeros(number) {
  const numberStr = number.toString();

  if (!numberStr.includes(".")) {
    return { leadingZeros: 0, trailingZeros: 0 };
  }

  // Split the number into integer and decimal parts
  const [integerPart, decimalPart] = numberStr.split(".");

  // Count leading zeros in the decimal part
  let leadingZeros = 0;
  for (const char of decimalPart) {
    if (char === "0") {
      leadingZeros++;
    } else {
      break;
    }
  }

  // Count trailing zeros in the decimal part
  let trailingZeros = 0;
  for (let i = decimalPart.length - 1; i >= 0; i--) {
    if (decimalPart[i] === "0") {
      trailingZeros++;
    } else {
      break;
    }
  }

  return { leadingZeros, trailingZeros };
}

export const validateNaN=(value,fieldName=null,fixedPrecision=3)=>{
    if(value!=='' && value!==undefined && value!==null && typeof parseFloat(value)==='number'){
        let localValue=value.toString().split('.')
        
        if (localValue.length > 1) {
            if(parseInt(localValue[0])==0){ // && parseFloat(value)>0){
                let afterDecimal = localValue[1];
                const {leadingZeros,trailingZeros}=countLeadingAndTrailingZeros(value);
                const secLen=localValue[1].length;
                const precisionRemovingTrailingZeros=fixedPrecision!==7? fixedPrecision :secLen-trailingZeros>fixedPrecision?fixedPrecision:secLen-trailingZeros;
                let precision=precisionRemovingTrailingZeros;
                if(leadingZeros>0){
                    precision = leadingZeros <= 2 ? precision : parseFloat(value)==0 ?3 :fixedPrecision!==7?leadingZeros+1:precision;
                    localValue = parseFloat(localValue[0] + '.' + afterDecimal)?.toFixed(precision);
                }else{
                    localValue = parseFloat(localValue[0] + '.' + afterDecimal)?.toFixed(precision);
                }
            }else{
                
                const {leadingZeros,trailingZeros}=countLeadingAndTrailingZeros(value);
                const secLen=localValue[1].length;
                let precision=fixedPrecision!==7? fixedPrecision :leadingZeros>7 || parseInt(localValue[1])==0?3:secLen-trailingZeros>fixedPrecision?fixedPrecision:secLen-trailingZeros;
                localValue = parseFloat(value)?.toFixed(precision);
            }
            const splitValue = localValue.toString().split('.');
            if(splitValue.length === 1){
                localValue = parseInt(localValue) + '.000';
            }
        } else {
            localValue = parseInt(localValue[0]) + '.000';
        }
        return localValue.toString();
    }
    return value
}

// export const convertUnit = (value, fromUnit, toUnit) => {
//     // console.log( 'Popup Change 11111 >>>>>>>>>>>>>>> convertUnit >>>>>>>>>>>>>>11 ',value,  fromUnit?.UnitKey, toUnit?.UnitKey,(!value && value !=0) , value==='')
//     if((!value && value !=0) || value===''){
//         return '';
//     }
//     const inputValue = BigNumber(value);
//     const fromUF = BigNumber(fromUnit.UnitFactor);
//     const toUF = BigNumber(toUnit.UnitFactor);
//     if(fromUnit.UnitKey === toUnit.UnitKey){
//         return inputValue.isNaN() ? '' : checkForValidValue(inputValue);
//     }

//     let toValue = inputValue
//         .plus(fromUnit.UnitOffset)
//         .dividedBy(fromUF)
//         .multipliedBy(toUF)
//         .minus(toUnit.UnitOffset);
//     toValue = toValue.isNaN() ? '' :toValue;
//     // toValue = isNaN(toValue)
//     //     ? toValue
//     //     : Math.round(toValue) == toValue
//     //         ? Math.round(toValue.toString())
//     //         : toValue.toString();
//     const returnVal = checkForValidValue(toValue);
//     // console.log('checkVal -- 9090 ', value, fromUnit, toUnit,toValue,returnVal);
//     return returnVal;
// };

// const unitConversion = (units, payloadData,VacuumFlag=false) => {
//     const pressureUOM=units['pressure'];
//     const absPressureUOM=units['abspressure'];
//     const temperatureUOM=units['temperature'];
    
//     const calcMethod=payloadData['CalculationMethod'];

//     let currPressure=payloadData['PressureUOM'];
//     currPressure=currPressure?currPressure:calcMethod==='English'?'pressure.psig':'pressure.barg';
//     let currAbsPressure=payloadData['AtmPressureUOM'];
//     currAbsPressure=currAbsPressure?currAbsPressure:calcMethod==='English'?'abspressure.psia':'abspressure.bara';
//     let currTemperature=payloadData['TemperatureUOM'];
//     currTemperature=currTemperature?currTemperature:calcMethod==='English'?'temp.degF':'temp.degK';

//     const currentUOM={
//         pressure:currPressure,
//         abspressure:currAbsPressure,
//         temperature:currTemperature,
//     };
//     const requiredUOM={
//         pressure:'pressure.barg',
//         abspressure:'abspressure.bara',
//         temperature:'temp.degK',
//     };
//     const Pset=convertUnit(payloadData['SetPressure'],pressureUOM.find(u => u.UnitKey===currentUOM['pressure']),pressureUOM.find(u => u.UnitKey===requiredUOM['pressure']),pressureUOM) ?? 0;
//     const Pover=convertUnit(payloadData['OverPressure'],pressureUOM.find(u => u.UnitKey===currentUOM['pressure']),pressureUOM.find(u => u.UnitKey===requiredUOM['pressure']),pressureUOM) ?? 0;
//     const Ploss=convertUnit(payloadData['InletLoss'],pressureUOM.find(u => u.UnitKey===currentUOM['pressure']),pressureUOM.find(u => u.UnitKey===requiredUOM['pressure']),pressureUOM) ?? 0;
//     const Pabs=convertUnit(payloadData['AtmPressure'],absPressureUOM.find(u => u.UnitKey===currentUOM['abspressure']),absPressureUOM.find(u => u.UnitKey===requiredUOM['abspressure']),absPressureUOM) ?? 0;
//     const T=convertUnit(payloadData['Relieving'],temperatureUOM.find(u => u.UnitKey===currentUOM['temperature']),temperatureUOM.find(u => u.UnitKey===requiredUOM['temperature']),temperatureUOM) ?? 0;
//     // const P1=Pset.plus(Pover).minus(Ploss).plus(Pabs);
//     const P1=Pset+Pover-Ploss+Pabs;

//     const Tv=convertUnit(payloadData['RelievingforVacuum'],temperatureUOM.find(u => u.UnitKey===currentUOM['temperature']),temperatureUOM.find(u => u.UnitKey===requiredUOM['temperature']),temperatureUOM);
//     const P1v=Pabs;

//     return VacuumFlag?[P1v,Tv]:[P1,T];
// }

// export const convertUnitDiffDims = (value, fromUnit, toUnit,units,payloadData,VacuumFlag=false) => {
//     // console.log( 'Popup Change 11111 >>>>>>>>>>>>>>>uoms >>>>>>>>>>>>>> ',value,isNaN(value), fromUnit?.UnitKey, toUnit?.UnitKey)
    
//     if(isNaN(value)){
//         return value;
//     }

//     if(fromUnit ===undefined || toUnit ===undefined){
       
//         return value
//     }
//     const fromDim=fromUnit['DimensionName'];
//     const toDim=toUnit['DimensionName'];
//     if(fromUnit?.UnitKey?.split('.')[0] === toUnit?.UnitKey?.split('.')[0]) {
//         const returnValue=convertUnit(value, fromUnit, toUnit);
//         // console.log( 'Popup Change 11111 >>>>>>>>>>>>>>> uoms >>>>>>>>>>>>>>11 ',value,  fromUnit?.UnitKey, toUnit?.UnitKey)
//         return returnValue;   
//     }
//     let inputValue = BigNumber(value);
//     let uoms=units[fromDim];
//     const fromUnit1 = uoms.find(unit => unit["DimensionName"] === fromDim && unit['UnitFactor']==1);
//     const initVal = convertUnit(inputValue, fromUnit, fromUnit1, uoms);
//     if(isNaN(initVal)){
//         return initVal;
//     }
//     uoms=units[toDim];
//     const toUnit1 = uoms.find(unit => unit["DimensionName"] === toDim && unit['UnitFactor']==1);
//     // console.log('UniConversion >>>> first conversion 11111 >>>>>>>>>>>>>>>> ',initVal, fromUnit, toUnit,fromUnit1, toUnit1)
//     let newValue=initVal;
//     // console.log('Popup Change 11111 >>>>>>>>>>>>>>>UniConversion >>>> first conversion 22222 >>>>>>>>>>>>>>>> ',initVal, fromDim,toDim,VacuumFlag,payloadData)

//     switch(fromDim){
//         case 'massflow':
//             if(toDim==='gasvolflowact'){
//                 const MolWeight=Number(VacuumFlag?payloadData['MolWeightVacuum']:payloadData['MolWeight']);
//                 if(MolWeight==0 || MolWeight=='' || MolWeight==undefined || MolWeight==null){
//                     return '';
//                 }
//                 const [P1,T]=unitConversion(units,payloadData,VacuumFlag);
//                 // newValue = initVal.multipliedBy(22.413996).dividedBy(MolWeight).multipliedBy(1.01325).dividedBy(P1).multipliedBy(T).dividedBy(273.15);
//                 newValue=(1.01325/P1)*(T/273.15)*((initVal * 22.413996)/MolWeight);
//             }else if(toDim==='gasvolflow'){
//                 const MolWeight=Number(VacuumFlag?payloadData['MolWeightVacuum']:payloadData['MolWeight']);
//                 if(MolWeight==0 || MolWeight=='' || MolWeight==undefined || MolWeight==null){
//                     return '';
//                 }
//                 // newValue = initVal.multipliedBy(22.413996).dividedBy(MolWeight);
//                 newValue=(initVal * 22.413996)/MolWeight
//             }else if(toDim==='liquidvolflow'){
//                 const SpGravity=Number(VacuumFlag?payloadData['SpGravityVacuum']:payloadData['SpGravity']);
//                 if(SpGravity==0 || SpGravity=='' || SpGravity==undefined || SpGravity==null){
//                     return '';
//                 }
//                 // newValue = initVal.dividedBy(1000).dividedBy(SpGravity);
//                 newValue=initVal /(1000*SpGravity)
//             }
//             break;
//         case 'gasvolflowact':
//             if(toDim==='massflow'){
//                 const [P1,T]=unitConversion(units,payloadData,VacuumFlag);
//                 const MolWeight=Number(VacuumFlag?payloadData['MolWeightVacuum']:payloadData['MolWeight']);
//                 // newValue=P1.dividedBy(1.01325).multipliedBy(273.15).dividedBy(T).multipliedBy(initVal).multipliedBy(MolWeight).dividedBy(22.413996);
//                 newValue=(P1/1.01325)*(273.15/T)*((initVal * MolWeight)/22.413996);
//             }else if(toDim==='gasvolflow'){
//                 const [P1,T]=unitConversion(units,payloadData,VacuumFlag);
//                 // newValue=P1.dividedBy(1.01325).multipliedBy(273.15).dividedBy(T).multipliedBy(initVal);
//                 newValue=(P1/1.01325)*(273.15/T)*initVal
//             }
//             break;
//         case 'gasvolflow':
//             if(toDim==='massflow'){
//                 const MolWeight=VacuumFlag?payloadData['MolWeightVacuum']:payloadData['MolWeight'];
//                 // newValue=initVal.dividedBy(22.413996).multipliedBy(MolWeight);
//                 newValue=(initVal * MolWeight)/22.413996;
//             }else if(toDim==='gasvolflowact' ){
                
//                 const [P1,T]=unitConversion(units,payloadData,VacuumFlag);
//                 // newValue=initVal.multipliedBy(1.01325).dividedBy(P1).multipliedBy(T).dividedBy(273.15);
//                 newValue=(1.01325/P1)*(T/273.15)*initVal
//                 // console.log('UniConversion >>>> first conversion 33333 >>>>>>>>>>>>>>>> ',initVal, fromDim,toDim,VacuumFlag,P1,T,newValue)
//             }
//             break;
//         case 'liquidvolflow':
//             if(toDim==='massflow'){
//                 const SpGravity=Number(VacuumFlag?payloadData['SpGravityVacuum']:payloadData['SpGravity']);
//                 // newValue=initVal.multipliedBy(1000).multipliedBy(SpGravity);
//                 newValue=initVal*1000*SpGravity;
//             }
//             break;
//         case 'viscositykin':
//             if(toDim==='viscosity'){
//                 const SpGravity=Number(VacuumFlag?payloadData['SpGravityVacuum']:payloadData['SpGravity']);
//                 // newValue=initVal.multipliedBy(SpGravity);
//                 newValue=initVal*SpGravity;
//             }
//             break;
//         case 'viscosity':
//             if(toDim==='viscositykin'){
//                 const SpGravity=Number(VacuumFlag?payloadData['SpGravityVacuum']:payloadData['SpGravity']);
//                 if(SpGravity===0 || SpGravity==='' || SpGravity===undefined || SpGravity===null){
//                     return '';
//                 }
//                 // newValue=initVal.dividedBy(SpGravity);
//                 newValue=initVal/SpGravity
//             }
//             break;
//         default:
//             newValue=initVal
//     }
//     const returnValue=convertUnit(newValue, toUnit1, toUnit,uoms);
//     // console.log('Popup Change 11111 >>>>>>>>>>>>>>>UniConversion >>>>>>>>>>>>>>>> ',value,newValue, fromUnit, toUnit,returnValue)
//     return isNaN(returnValue)?'':returnValue;
// }




/**
 * Re-update / Bind Dependent Fields options/values
 * @param {*} dataSources
 * @param {*} jsonConfig
 * @returns
 */
export const mapFieldsWithDependencies = (dataSources, jsonConfig) => {
  const getParentField = (field) => {
    return jsonConfig.find((f) => {
      const fieldNames = Array.isArray(f.fieldName)
        ? f.fieldName
        : [f.fieldName];
      return fieldNames.includes(field.dependsOn);
    });
  };

  const handleComboboxDependency = (field, parentField, dataSources) => {
    const parentValue =
      parentField.value && typeof parentField.value === "object"
        ? parentField.value[parentField.fieldName]
        : parentField.value;

    if (
      dataSources[field.sourceKey] &&
      Array.isArray(dataSources[field.sourceKey])
    ) {
      field.options = dataSources[field.sourceKey].filter(
        (item) => String(item[`${field.dependsSourceId}`]) == parentValue
      );

      if (field.options && field.options.length === 0) {
        // field.disabled = true;
      }
    } else {
      field.options = [];
      // field.disabled = true;
    }
  };

  const handleCheckboxDependency = (field, parentField) => {
    if (field.type === "textarea") {
      const parentValue =
        typeof parentField.value === "object"
          ? parentField.value[parentField.fieldName]
          : parentField.value;
      field.isNumbered = parentValue;
    }
  };

  return jsonConfig.map((field) => {
    if (!field.dependsOn) {
      if (field.sourceKey && dataSources[field.sourceKey]) {
        field.options = dataSources[field.sourceKey];
      }
    } else {
      const parentField = getParentField(field);
      if (parentField) {
        switch (parentField?.type) {
          case "combobox":
            handleComboboxDependency(field, parentField, dataSources);
            break;
          case "checkbox":
            handleCheckboxDependency(field, parentField);
            break;
          default:
            break;
        }
      }
    }
    return field;
  });
};

/**
 * Reset the dependent fields' values based on the updated field.
 * @param {Array|Object} fieldsData - The selected fields (either array or object-based)
 * @param {Object} updatedField - The updated field that may affect dependent fields
 * @param {Object|Array} fieldSource - The full set of field data (either array or object-based)
 * @returns {Array} - Updated selected fields with dependent fields reset
 */
export const resetDependentFields = (fieldsData, updatedField, fieldSource) => {
  const dependentFields = new Set();
  const findDependencies = (fieldName, source) => {
    const iterateSource = Array.isArray(source)
      ? source
      : Object.values(source).flat();
    iterateSource.forEach((field) => {
      const fieldNames = Array.isArray(field.fieldName)
        ? field.fieldName
        : [field.fieldName];
      const currentFieldName = fieldNames[0] ?? "";
      if (field.dependsOn === fieldName) {
        dependentFields.add(currentFieldName);
        if (currentFieldName) {
          findDependencies(currentFieldName, source);
        }
      }
    });
  };
  findDependencies(updatedField.fieldName, fieldSource);
  return fieldsData.map((field) => {
    if (dependentFields.has(field.name)) {
      return { ...field, value: "" };
    }
    return field;
  });
};

/**
 * Update / Replace Field Properties
 * @param {*} source
 * @param {*} target
 * @returns
 */
export const deepReplaceProperties = (source, target) => {
  const updatedTarget = { ...target };
  Object.keys(source).forEach((key) => {
    if (key in updatedTarget) {
      if (
        typeof source[key] === "object" &&
        !Array.isArray(source[key]) &&
        typeof updatedTarget[key] === "object"
      ) {
        updatedTarget[key] = deepReplaceProperties(
          source[key],
          updatedTarget[key]
        );
      } else {
        updatedTarget[key] = source[key];
      }
    }
  });
  return updatedTarget;
};

/**
 * Update K & A data based on K&A data set value
 * @param {string} value
 * @returns {Array} filteredItems
 */
export const updateOrificeData = (state, kdValue, { units, defaultUnits }) => {
  const orificeData = state.genericValves.find(
    (item) => item.ValveId == state.selectedOrifice.value
  );
  if (!orificeData) return;
  // Filter out existing "OrificeArea" and "K" fields
  state.gvsSelectedFields = state.gvsSelectedFields.filter(
    (field) =>
      field.name !== "OrificeArea" && field.name !== "K" && field.name !== "Kd"
  );
  const { Kmax, A, KAPI, AAPI } = orificeData;
  // Determine new values based on kdValue
  const KValue =
    kdValue === "ASME"
      ? Kmax
      : kdValue === "API"
      ? KAPI
      : state.gvsPayloadData?.K || "";
  let AValue =
    kdValue === "ASME"
      ? A
      : kdValue === "API"
      ? AAPI
      : state.gvsPayloadData?.OrificeArea || "";
  if (state.gvsPayloadData?.OrificeAreaUOM !== "area.in2") {
    console.log(
      "OrificeAreaUOM >>>>>>>>>>>>>>>> ",
      state.gvsPayloadData?.OrificeAreaUOM
    );
    AValue = getConvertedValue(
      AValue,
      "area.in2",
      "OrificeArea",
      state.gvsPayloadData?.OrificeAreaUOM,
      units["area"],
      units,
      state.gvsSelectedFields,
      state.gvsPayloadData
    );
  }
  // Push new values
  state.gvsSelectedFields.push(
    { name: "OrificeArea", value: AValue, mandatory: false },
    { name: "K", value: KValue, mandatory: false },
    { name: "Kd", value: KValue * 1.111, mandatory: false }
  );

  // Update payload data
  state.gvsPayloadData = {
    ...state.gvsPayloadData,
    K: KValue,
    Kd: KValue * 1.111,
    OrificeArea: AValue,
  };
};

// export const fixDecimalValue=(value)=>{
//   let splitVal=value.toString().split(".");
//   const flag=splitVal?.length>1?splitVal[1].length>16?true:false:false;

//   let localValue=splitVal?.length>1?flag?parseFloat(value).toFixed(16):value:value;
 
//   splitVal=localValue.toString().split(".");

//   const result= flag?splitVal?.length>1?splitVal[0]+"."+splitVal[1].substring(0,CONVERT_TOFIXED_DECIMALS):localValue:localValue;
//   // return splitVal?.length>1?parseFloat(parseFloat(result).toFixed(CONVERT_TOFIXED_DECIMALS)):parseFloat(parseFloat(result).toFixed(3))
//   return splitVal?.length>1?parseFloat(parseFloat(validateNaN(result,null,CONVERT_TOFIXED_DECIMALS)).toFixed(CONVERT_TOFIXED_DECIMALS)):parseFloat(parseFloat(validateNaN(result,null,CONVERT_TOFIXED_DECIMALS)).toFixed(3))
// }

// export const expFunctions={
//   "fixDecimalValue":fixDecimalValue,
// }
