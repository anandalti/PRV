import { useState, useEffect } from 'react';
import {  getDisplayUnit, getUOMKey } from '../utils/validation';
import {  useDispatch, useSelector } from 'react-redux';
import { onUpdatePreferenceField } from '../store/slices/preferenceSlice';
import { convertUnit } from '../utils/convertUnit';
const usepreferenceUnitConvertor = (initialValue,fieldName, dimensionName,uomValue,options, UomFieldName) => {
  
  const dispatch = useDispatch();
  const {units,defaultUnits} = useSelector(state => state.uom);
  const { selectedPreferences } = useSelector(state => state.preference);
  const [value, setValue] = useState(initialValue ? parseFloat(initialValue).toFixed(3) : 0);
  const [uom, setUom] = useState(null);
  const [oldUomValue, setOldUomValue] = useState(uomValue);

  useEffect(() => {
    // console.log('In useUnitConverter newVal:: uomValue >>>>>>>> ',initialValue,fieldName, dimensionName,uomValue,uom,options)
    if(uomValue!==null && uomValue!==undefined){
      if(uom!==null){
        let newOptions = Array.isArray(dimensionName) ? dimensionName.flatMap(dimension => {
          return units.hasOwnProperty(dimension) ? [
              ...units[dimension].map(unit => (
                      {value: unit.UnitKey,
                      label: unit.UnitName}
              )).filter(unit => unit !== null)
          ] : options 
        }) : options;
        const optionUom=newOptions.find((item)=>item.value===uom);
        //const optionUom=options.find((item)=>item.value===uom);
        if(optionUom!==undefined && optionUom!==null){
          setOldUomValue(uom);
        }
      }
      setUom(uomValue);
    }
  }, [uomValue]);
  // console.log({uom, uomValue, oldUomValue, value, initialValue});
  useEffect(() => {
    // console.log('In useUnitConverter :: value >>>>>>>> ',initialValue,value,uom,oldUomValue)
    if(uom!==null){
      const dimensionUoms=Array.isArray(dimensionName)?dimensionName[0]:dimensionName;
      let unitValue;
      if(oldUomValue===null){
   
        unitValue=selectedPreferences.find((item)=>item.name===UomFieldName);
        // console.log('In useUnitConverter :: unitValue >>>>>>>> ',fieldName,unitValue)
        if(unitValue===undefined || unitValue?.value===undefined){
            const displayUnit=getDisplayUnit(selectedPreferences);
            unitValue=defaultUnits[displayUnit][dimensionUoms];
        }
      
        unitValue=unitValue?.value===undefined?unitValue:unitValue?.value;
      }else{
        unitValue=uomValue;
      }
      // console.log('In useUnitConverter newVal 333333 ::: ',units,dimensionUoms,units[dimensionUoms])
      const dimensionUnits=units[dimensionUoms];

      // console.log('In useUnitConverter newVal 333333 ::: ',fieldName,uom,unitValue,uomValue,dimensionUnits)
      const oldUom=dimensionUnits.find(unit => unit.UnitKey===oldUomValue);
      const newUom=dimensionUnits.find(unit => unit.UnitKey===uom);
      let localValue=selectedPreferences.find((item)=>item.name===fieldName);
      
      if(localValue===undefined){
        localValue=value
      }else{
        localValue=localValue.value;
      }
      // console.log('In useUnitConverter ::: Before Unit convert:: 44444 ::: ',fieldName, oldUom, localValue, newUom)
      // console.log("Unit Convertor called");
      // console.log({localValue, oldUom, newUom});
      const newValue=convertUnit(localValue, oldUom, newUom,units)
      // console.log('In useUnitConverter newVal 44444 ::: ',fieldName, oldUom, localValue, newUom,newValue)
      setValue(newValue=='0'?"" : newValue);
      dispatch(onUpdatePreferenceField({name:fieldName,value:newValue}))
    }
  }, [uom]);
  return { value, uom, setUom, setValue };
};

export default usepreferenceUnitConvertor;