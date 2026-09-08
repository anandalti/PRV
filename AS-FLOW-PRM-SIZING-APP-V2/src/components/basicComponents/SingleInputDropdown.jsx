import useUnitConverter from "../../hooks/useUnitConvertor";
import { validateNaN } from "../../utils/utility";
import { getUOMKey } from "../../utils/validation";
import DropDown from "./DropDown";
import Input from "./Input";
import { onUpdateFields } from "../../store/slices/workflowSlice";
import useUpdateFieldUOM from "../../hooks/useUpdateFieldUOM";
import { useDispatch } from "react-redux";
import { UNIT_CONVERSION_FLAG } from "../../utils/constants";

const SingleInputDropdown = (props) => {
    // console.log('In useUnitConverter :: In Single InputDropDownCombo:: >>>>>>>>> ',props?.value,props?.fieldName, props?.UomFieldName, props)
    const dispatch = useDispatch();
    const { updateFieldUOM } = useUpdateFieldUOM();
    const { value: convertedValue, uom:convertedUOM, setUom, setValue,handleUomChange } = useUnitConverter(props?.value,props?.fieldName, props?.dimensionName,props?.uomValue,props?.options,props?.UomFieldName);

    const handleInputChange = (item) => {
        setValue(item.value);
        props.onChange(item)
    }
    const handleDDSelect = ( item) => {
      if(UNIT_CONVERSION_FLAG){
        handleUomChange(item);
        
        return;
      }else{
        // console.log('In useUnitConverter :: InputUom::handleDDSelect >>>> ',props,item,props?.popupFields)
        dispatch(onUpdateFields({name:`UomFieldName`,value:props?.UomFieldName,page:"updateFieldUOM 1"}));
        setUom(item.value);
        const dimensionUoms=Array.isArray(props?.dimensionName)?props?.dimensionName[0]:props?.dimensionName;
        const key=props?.UomFieldName!==undefined?props?.UomFieldName:getUOMKey(dimensionUoms,props?.UomFieldName);
    
        if(props?.popupFields){
          props.onChange({name:key,value:item.value,page:"SingleInputDropdown",type:"UOM_DD"});
          // dispatch(onUpdateFields({name:key,value:item.value,page:"updateFieldUOM 3"}));
        }else{
          updateFieldUOM({name:key,value:item.value,page:"SingleInputDropdown"},props?.popupFields,props?.mirrorId,props?.UomFieldName)
        }
      }
    }

    const handleCopyButtonClick = (item) => {
        props?.onChange({action:item?.type,targetField:item?.targetField,currentField:item?.currentField})
    }
  return (
    <>
        <Input key={props?.fieldName} {...props} 
               fieldName={props?.fieldName} 
               type='number' 
                value={convertedValue}
                disabled={props?.disabled}
                mandatory={props?.mandatory}// && !props?.disabled}
                displayValue={validateNaN(convertedValue)}
                onChange={( item) => handleInputChange(item)}
                // style={props?.popupFields?{width:"7rem"}:props?.display?{width:"10rem",marginRight:"10px"}:{width:"10rem"}}
            />
        {props?.display && <DropDown {...props} value={convertedUOM}
                fieldName={`${props?.fieldName}UOM`} 
                onChange={(item) => handleDDSelect(item)}
                styles={props?.popupFields?{width:"8rem",marginLeft:"10px"}:{width:"8rem",marginLeft:"10px"}}
                disabled={props?.disableUOM===undefined?props?.disabled:props?.disableUOM}
                />}
    </>
  )
}

export default SingleInputDropdown