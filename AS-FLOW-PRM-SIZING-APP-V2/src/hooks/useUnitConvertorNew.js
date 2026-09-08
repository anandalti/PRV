import { useState, useEffect, act } from 'react';
import {  filterDimensionUnits,  getDisplayUnit } from '../utils/validation';
import {  useDispatch, useSelector } from 'react-redux';
import { setUomChangeFlag } from '../store/slices/uomSlice';
import { Distributed_Sections_WF } from '../utils/constants';
import { getConvertedValue } from '../utils/convertUnit';


const useUnitConverterNew = (initialValue,fieldName, dimensionName,uomValue,options,UomFieldName,displayOrder) => {
  const dispatch = useDispatch();
  const {payloadData} = useSelector(state => state.workflowPayload);
  const {units,defaultUnits} = useSelector(state => state.uom);
  const { selectedFields,selectedWorkflow } = useSelector(state => state.workflow);
  const [value, setValue] = useState(initialValue ? uomValue!=='%' ?parseFloat(initialValue):initialValue : '');
  const [uom, setUom] = useState(null);
  const [oldUomValue, setOldUomValue] = useState(uomValue);
 
  useEffect(() => {
    
    // console.log('In useUnitConverter newVal:: uomValue 111111111>>>>>>>> ',initialValue,value,fieldName, dimensionName,uomValue,uom,oldUomValue,oldUomFieldName,UomFieldName,currentSectionId,options)
    if(uomValue!==null && uomValue !==undefined && uomValue!=='%'){
      
      let localUOM=uom;
      if(displayOrder===1 && Distributed_Sections_WF.indexOf(selectedWorkflow) !==-1){
        localUOM=uomValue;
      }
      if(uomValue!==localUOM && localUOM!==null){
        // console.log('displayOrder 222222222222>>>>>>>>>>>>>>>>> ',fieldName,displayOrder,uomValue,localUOM)
        setUom(uomValue)
        if(oldUomValue.split('.')[0]!==uomValue.split('.')[0]){
          const optionUom=options.find((item)=>item.value===uomValue);
            if(optionUom!==undefined && optionUom!==null){
              setOldUomValue(uomValue);
            }
        }
      }else{
        // console.log('displayOrder 33333333333>>>>>>>>>>>>>>>>> ',fieldName,displayOrder,uomValue,localUOM)
        if(localUOM!==null){
          const optionUom=options.find((item)=>item.value===localUOM);
          if(optionUom!==undefined && optionUom!==null){
            setOldUomValue(localUOM);
          }
        }
      
        const optionUom=options.find((item)=>item.value===uomValue);
        if(optionUom!==undefined && optionUom!==null){
          setUom(uomValue);
        }
        dispatch(setUomChangeFlag(true));
      }
      setValue(initialValue)
    }else if(uomValue==='%'){
      // console.log('In useUnitConverter newVal:: uomValue 44444444444444>>>>>>>> ',initialValue,value,fieldName, dimensionName,uomValue,uom,oldUomValue,oldUomFieldName,UomFieldName,currentSectionId,options)
      // setValue(initialValue=='0'?"" : initialValue)
      setValue(initialValue)
    }else if(value!==initialValue){
      // console.log('In useUnitConverter newVal:: uomValue 555555555555>>>>>>>> ',initialValue,value,fieldName, dimensionName,uomValue,uom,oldUomValue,oldUomFieldName,UomFieldName,currentSectionId,options)
      // setValue(initialValue=='0'?"" : initialValue);
      setValue(initialValue)
      // setCurrentSectionId(activeMenu);
    }
  }, [uomValue,initialValue]);

  useEffect(() => {
    // console.log('In useUnitConverter :: value 3333333>>>>>>>> ',initialValue,value,uom,oldUomValue,dimensionName)
    if(uom!==null && uom!==undefined && uomValue!=='%'){
           
      const {dimensionUnits,unitValue}=filterDimensionUnits(defaultUnits,selectedFields,UomFieldName,uom,oldUomValue,dimensionName,units)
      
      if(unitValue!==undefined && unitValue!==null){
        const newValue=getConvertedValue(value,unitValue,fieldName,uom,dimensionUnits,units,selectedFields,payloadData)
        // console.log('In useUnitConverter :: newVal 66666 ::: ',fieldName,newValue)
        if(displayOrder!==1 ){
          // if(fieldName!==undefined && fieldName!==null && fieldName!=='' &&  fieldName!=='%'){
          //   dispatch(onUpdateFields({name:fieldName,value:newValue,page:"useUnitConversion 1"}))
          // }
          
          setValue(newValue);
        }
      }else{
        const displayUnit=getDisplayUnit(selectedFields);
        const localUomValue=defaultUnits[displayUnit][dimensionName[0]];
        // console.log('first time uomValue >>>>>>>>>>>>>>>>> ',localUomValue)
        setUom(localUomValue);
      }
    }
  }, [uom]);
  
  return { value, uom, setUom, setValue };
};

export default useUnitConverterNew;