import { useState, useEffect, act } from "react";
import {
  filterDimensionUnits,
  
  getDisplayUnit,
} from "../utils/validation";
import { useDispatch, useSelector } from "react-redux";
import { fieldConvertUomAPI, fieldValidationAPI, onUpdateFields } from "../store/slices/workflowSlice";
import { setUomChangeFlag } from "../store/slices/uomSlice";
import { Distributed_Sections_WF } from "../utils/constants";
import { getConvertedValue } from "../utils/convertUnit";

const useUnitConverter = (
  initialValue,
  fieldName,
  dimensionName,
  uomValue,
  options,
  UomFieldName,
  displayOrder,
  mirrorId
) => {
  const dispatch = useDispatch();
  // const {payloadData:orgPayloadData} = useSelector(state => state.workflowPayload);
  const { payloadData } = useSelector((state) => state.workflowPayload);
  const { userData } = useSelector(state => state.auth);
  const { gvsPayloadData } = useSelector((state) => state.genericValveSizing);
  const { units, defaultUnits } = useSelector((state) => state.uom);
  const { selectedFields, selectedWorkflow, workflowSections, workflowPopup, error,fieldValidationResults } = useSelector(
    (state) => state.workflow
  );
  const [value, setValue] = useState(
    initialValue
      ? uomValue !== "%"
        ? parseFloat(initialValue)
        : initialValue
      : ""
  );
  const [uom, setUom] = useState(null);
  const [oldUomValue, setOldUomValue] = useState(
    payloadData[`prev${UomFieldName}`]
  );
  // const payloadData={...orgPayloadData,...gvsPayloadData};

  const handleUomChange = (item) => {
    // console.log('handleUomChange>>>>>>>>>>>>>>>>>>>',item,workflowSections)
    const requiredWorkflowSection = workflowSections.find(section => section.sectionId === item.sectionId);
    const sectionFields = requiredWorkflowSection ? requiredWorkflowSection.fields : [];
    let fieldValues = {};
    sectionFields.forEach(field => {
      // console.log('handleUomChange>>>>>>>>>>>>>>>>>>> 222222 ',field,field?.uomFieldName,item?.UomFieldName,field.fieldName)
      if(field?.uomFieldName===item?.UomFieldName){
        let fieldName=field.fieldName?.split('|')
        if(fieldName.length>1){
          fieldName?.forEach(localFieldName=>{
            fieldValues[localFieldName] = payloadData[localFieldName] !== undefined && payloadData[localFieldName] !==null && payloadData[localFieldName] !=0? payloadData[localFieldName] : '';
          });
        }else{
          fieldValues[field.fieldName] = payloadData[field.fieldName] !== undefined && payloadData[field.fieldName] !==null && payloadData[field.fieldName] !=0? payloadData[field.fieldName] : '';
        }
      }
    });

    const popupFields = workflowPopup?.fields?workflowPopup.fields:[];
    popupFields.forEach(field => {
      if(field?.uomFieldName===item?.UomFieldName){
        let fieldName=field.fieldName?.split('|')
        if(fieldName.length>1){
          fieldName?.forEach(localFieldName=>{
            fieldValues[localFieldName] = payloadData[localFieldName] !== undefined && payloadData[localFieldName] !==null && payloadData[localFieldName] !=0? payloadData[localFieldName] : '';
          });
        }else{
          fieldValues[field.fieldName] = payloadData[field.fieldName] !== undefined && payloadData[field.fieldName] !==null && payloadData[field.fieldName] !=0? payloadData[field.fieldName] : '';
        } 
      }
    });
    let config = {};
    // console.log('fieldValues >>>>>>>>>>>>>>>>>>>',fieldValues,workflowPopup);
    // const config ={
    //   url: '/UOM/conversion',
    //   method: 'POST',
    //   data: {
    //     values:fieldValues,
    //     fromUom: item.prevUom,
    //     toUom: item.value,
    //     inputs: {...payloadData}
    //   }
    // }
    // // console.log('config >>>>>>>>>>>>>>>>>>>',config);
    // dispatch(fieldConvertUomAPI(config));
    //if((item.prevUom.indexOf('massflow')!==-1 && item.value.indexOf('massflow')===-1) || (item.prevUom.indexOf('massflow')===-1 && item.value.indexOf('massflow')!==-1)){
    if(item.prevUom.includes('gasvolflow') || item.prevUom.includes('gasvolflowact') || item.prevUom.includes('massflow')){  
      const disabledFields=fieldValidationResults?.disabledFields ?? {};
      const mandatoryFields=fieldValidationResults?.mandatoryFields ?? {};
      const visibleFields=fieldValidationResults?.visibleFields ?? {};
      const hideFromSideBarFields=fieldValidationResults?.hideFromSideBarFields ?? {};
      const data={
                  currentField:{FieldName:item?.UomFieldName,FieldValue:item.value,FieldId:item?.fieldId},
                  inputs:{...payloadData,[item.name]:item.value,userId:userData?.EmailId,workflowId:selectedWorkflow,sectionId:item?.sectionId},
                  error,
                  disabledFields,
                  mandatoryFields,
                  visibleFields,
                  hideFromSideBarFields
              }
      config={url:'/validate',method:'POST',data}
      dispatch(fieldValidationAPI(config)).then((response)=>{
          // console.log('In Tool 1111 >>>>>>>>>>>.  44444444 >>>>>>>>>> Validation done successfully ');
          const hasNonEmptyValues = Object.values(fieldValues).some(
              v => v !== '' && v !== null && v !== undefined
          );
          if (hasNonEmptyValues) {
              const config ={
                url: '/UOM/conversion',
                method: 'POST',
                data: {
                  values:fieldValues,
                  fromUom: item.prevUom,
                  toUom: item.value,
                  inputs: {...payloadData}
                }
              }
              // console.log('config >>>>>>>>>>>>>>>>>>>',config);
              dispatch(fieldConvertUomAPI(config));
          }
      });
    }else{
      const hasNonEmptyValues = Object.values(fieldValues).some(
          v => v !== '' && v !== null && v !== undefined
      );
      if (hasNonEmptyValues) {
          config ={
            url: '/UOM/conversion',
            method: 'POST',
            data: {
              values:fieldValues,
              fromUom: item.prevUom,
              toUom: item.value,
              inputs: {...payloadData}
            }
          }
          // console.log('config >>>>>>>>>>>>>>>>>>>',config);
          dispatch(fieldConvertUomAPI(config));
      }
    }
    setOldUomValue(item.prevUom);
    dispatch(
      onUpdateFields({
        name: item?.UomFieldName,
        value: item.value,
        page: "useUnitConversion 1"
      })
    );
    setUom(item.value);
    dispatch(setUomChangeFlag(true));
    return config
  }
  useEffect(() => {
    // console.log('In useUnitConverter newVal:: uomValue 111111111>>>>>>>> ',initialValue,value,fieldName, dimensionName,uomValue,uom,oldUomValue,UomFieldName,options,payloadData[`prev${UomFieldName}`])
    if (uomValue !== null && uomValue !== undefined && uomValue !== "%") {
      let localUOM = uom;
      if (
        //displayOrder===1 &&
        Distributed_Sections_WF.indexOf(selectedWorkflow) !== -1
      ) {
        localUOM = uomValue;
      }

      if (uomValue !== localUOM && localUOM !== null) {
        // console.log('In useUnitConverter displayOrder 222222222222>>>>>>>>>>>>>>>>> ',fieldName,displayOrder,uomValue,localUOM,oldUomValue,payloadData[`prev${UomFieldName}`])
        setUom(uomValue);
        // const prevUOM=oldUomValue===undefined?payloadData[`prev${UomFieldName}`]:oldUomValue;
        // if(prevUOM.split('.')[0]!==uomValue.split('.')[0]){
        //   const optionUom=options.find((item)=>item.value===uomValue);
        //     if(optionUom!==undefined && optionUom!==null){
        //       const prevUOM=payloadData[`prev${UomFieldName}`]
        //       setOldUomValue(prevUOM);
        //     }
        // }
        // }else if(fieldName==='Wreq' || fieldName==='WreqV'){
      } else {
        // console.log('In useUnitConverter displayOrder 33333333333>>>>>>>>>>>>>>>>> ',fieldName,displayOrder,uomValue,localUOM)
        // if(localUOM!==null){
        //   const optionUom=options.find((item)=>item.value===localUOM);
        //   if(optionUom!==undefined && optionUom!==null){
        //     // setOldUomValue(localUOM);
        //     const prevUOM=payloadData[`prev${UomFieldName}`]
        //     setOldUomValue(prevUOM);
        //   }
        // }

        const optionUom = options.find((item) => item.value === uomValue);
        if (optionUom !== undefined && optionUom !== null) {
          setUom(uomValue);
        }
        dispatch(setUomChangeFlag(true));
      }
      setValue(initialValue);
    } else if (uomValue === "%") {
      setValue(initialValue);
    } else if (value !== initialValue) {
      setValue(initialValue);
    }
  }, [uomValue, initialValue]);

  useEffect(() => {
    // console.log('In useUnitConverter :: value 3333333>>>>>>>> ',initialValue,value,uom,oldUomValue,dimensionName)
    if (
      uom !== null &&
      uom !== undefined &&
      uomValue !== "%" &&
      dimensionName !== undefined &&
      dimensionName !== null &&
      dimensionName !== ""
    ) {
      const { dimensionUnits, unitValue } = filterDimensionUnits(
        defaultUnits,
        selectedFields,
        UomFieldName,
        uom,
        oldUomValue,
        dimensionName,
        units
      );
      if (unitValue !== undefined && unitValue !== null) {
        // console.log('In useUnitConverter ::Popup Change 11111 >>>>>>>>>>>>>>> useUnitConvertor 1>>>> 11111>>>>> ',value,isNaN(value),dimensionUnits,unitValue,payloadData[`prev${UomFieldName}`],payloadData['UomFieldName'],UomFieldName)

        if (value !=='' && payloadData["UomFieldName"] === UomFieldName) {
          const prevUOM = payloadData[`prev${UomFieldName}`];
          const newValue = getConvertedValue(
            value,
            prevUOM,
            fieldName,
            uom,
            dimensionUnits,
            units,
            selectedFields,
            payloadData
          );
          // console.log('In useUnitConverter :: Popup Change 22222 >>>>>>>>>>>>>>> useUnitConvertor 1>>>>',fieldName,UomFieldName,value,newValue,unitValue,uom,displayOrder!==1, UomFieldName === fieldName,displayOrder)
          if (displayOrder !== 1) {
            // console.log('In useUnitConverter ::Popup Change 33333 >>>>>>>>>>>>>>> useUnitConvertor 1>>>>',fieldName,prevUOM,UomFieldName,value,newValue,unitValue,uom,fieldName!==undefined && fieldName!==null && fieldName!=='' &&  fieldName!=='%')
            if (
              fieldName !== undefined &&
              fieldName !== null &&
              fieldName !== "" &&
              fieldName !== "%"
            ) {
              dispatch(
                onUpdateFields({
                  name: fieldName,
                  value: newValue,
                  page: "useUnitConversion 1",
                  mirrorId: mirrorId,
                })
              );
            }
            setValue(newValue);
          }
        }
      } else {
        const displayUnit = getDisplayUnit(selectedFields);
        const localUomValue = defaultUnits[displayUnit][dimensionName[0]];
        // console.log('In useUnitConverter :: Popup Change 22222 first time uomValue >>>>>>>>>>>>>>>>> ',localUomValue)
        setUom(localUomValue);
      }
    }
  }, [uom]);

  return { value, uom, setUom, setValue, handleUomChange };
};

export default useUnitConverter;
