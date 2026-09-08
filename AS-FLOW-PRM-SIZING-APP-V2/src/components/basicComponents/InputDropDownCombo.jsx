// import useUnitConverter from "../../hooks/useUnitConvertor";
import useUpdateFieldUOM from "../../hooks/useUpdateFieldUOM";
import { getUOMKey } from "../../utils/validation";
import CopyButton from "../compoundComponents/CopyButton";
import DropDown from "./DropDown";
import Input from "./Input";
import useUnitConverter from "../../hooks/useUnitConvertor";
import { validateNaN } from "../../utils/utility";
import FormFieldsInput from "../hoc/FormFieldsInput";
import { onUpdateFields } from "../../store/slices/workflowSlice";
import { onUpdateFields as gvsOnUpdateFields } from "../../store/slices/genericValveSizingSlice";
import useUpdateFieldUOMForm from "../../hooks/useUpdateFieldUOMForm";
import { useDispatch, useSelector } from "react-redux";
import { setAdvViewResultDisplay } from "../../store/slices/workflowPayloadSlice";
import { UNIT_CONVERSION_FLAG } from "../../utils/constants";

const InputDropDownCombo = (props) => {
  // console.log('In InputDropDownCombo:: >>>>>>>>> ',props?.value,props?.fieldName, props)
  const dispatch = useDispatch();
  const { updateFieldUOM } = useUpdateFieldUOM();
  const { updateFieldUOMForm } = useUpdateFieldUOMForm();
  const { isAdvanced } = useSelector((state) => state.layout);
  const {advViewResultDisplayFlag} = useSelector((state) => state.workflowPayload);
  const {
    value: convertedValue,
    uom: convertedUOM,
    setUom,
    setValue,
    handleUomChange
  } = useUnitConverter(
    props?.value,
    props?.fieldName,
    props?.dimensionName,
    props?.uomValue,
    props?.options,
    props?.UomFieldName,
    props?.fieldDisplayOrder,
    props?.mirrorId
  );

  const handleInputChange = (item) => {
    // console.log(props?.fieldName, item);
    setValue(item.value);
    props.onChange(item);
  };
  const handleDDSelect = (item) => {
    if(props?.onMVChangeActionFlag==true){
      // console.log('In handleChange >>>> In handleDDSelect >>>> onMVChangeActionFlag true >>>> ',item,props)
      props.onChange(item);
      
    }else if(UNIT_CONVERSION_FLAG){
      handleUomChange(item);
      return;
    }else{
      if (props?.modal === "gvsModal") {
        gvsOnUpdateFields({
          name: `UomFieldName`,
          value: item.value,
          page: "updateFieldUOM 1",
        });
      } else {
        dispatch(
          onUpdateFields({
            name: `UomFieldName`,
            value: props?.UomFieldName,
            page: "updateFieldUOM 1",
          })
        );
      }
      // console.log('In handleChange >>>> ',isAdvanced,advViewResultDisplayFlag,item)
      if(isAdvanced && item?.name=='FlowCapacityUOM'){
        if(advViewResultDisplayFlag){
          dispatch(setAdvViewResultDisplay(false));
        }
      }
      dispatch(onUpdateFields({name:`UomFieldName`,value:props?.UomFieldName,page:"updateFieldUOM 1"}));
      setUom(item.value);
      const dimensionUoms = Array.isArray(props?.dimensionName)
        ? props?.dimensionName[0]
        : props?.dimensionName;
      const key =
        props?.UomFieldName !== undefined
          ? props?.UomFieldName
          : getUOMKey(dimensionUoms, props?.UomFieldName);
      // console.log("In useUnitConverter >>>>> InputUom::handleDDSelect >>>> ",props?.UomFieldName , key, item.value,props?.popupFields);
      // props.onChange({name:key,value:item.value})
      // dispatch(onUpdateFields({name:key,value:item.value,page:"InputDropDownCombo"}))
      if (props?.popupFields) {
        props?.onChange({
          name: key,
          value: item.value,
          page: "InputDropDownCombo",
          type: "UOM_DD",
        });
      } else {
        if (props?.formId) {
          updateFieldUOMForm({
            name: key,
            value: item.value,
            page: "InputDropDownCombo",
            formId: props?.formId,
          });
        } else {
          updateFieldUOM(
            { name: key, value: item.value, page: "InputDropDownCombo" },
            props?.popupFields,
            props?.mirrorId,
            props?.UomFieldName
          );
        }
      }
      // dispatch(onUpdatePayloadData({name:key,value:item.value}));
    }
  };

  const handleCopyButtonClick = (item) => {
    // console.log('In handleChange >>>> In handleCopyButtonClick >>>> ',item,props)
    let calculateFields;
    if (item?.calculateFields?.length > 0) {
      const target = item?.calculateFields[0]?.target;
      if (target) {
        if (target?.symbol === "API_FUNCTION_CALL") {
          calculateFields = item?.calculateFields[0]?.target;
        }
      }
    }
    props?.onChange({
      action: item?.action,
      targetField: item?.action?.targetField,
      currentField: item?.action?.currentField,
      actionTargetApi: calculateFields,
      onBlurAction: item?.onBlurAction,
      name: item?.fieldName,
      validatefield:true,
      fieldId:props?.fieldId,
      sectionId:props?.sectionId,
    });
  };
  // console.log('In InputDropDownCombo::2222 >>>>>>>>> ',props?.value,props?.fieldName, props?.uomValue,convertedValue,convertedUOM,props?.valueUOM)

  if (props?.fieldsLen > 1) {
    // if(props?.disabled){
    //     props?.onChange({name:props?.fieldName,value:convertedValue})
    // }
    return (
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: props?.style !==undefined?"17.5rem":"12.6rem" }}
      >
        <Input
          key={props?.fieldName}
          {...props}
          fieldName={props?.fieldName}
          type="number"
          value={convertedValue !== "" ? convertedValue : props?.value}
          className={
            props?.grid === 5
              ? props?.error !== undefined && props?.error !== null
                ? "input-field-right-error"
                : props?.mandatory
                ? "input-field-right-mandatory"
                : "input-field-right"
              : props?.inputClassName
              ? props?.inputClassName
              : undefined
          }
          disabled={props?.disabled}
          mandatory={props?.mandatory}
          displayValue={validateNaN(
            convertedValue !== "" ? convertedValue : props?.value,
            props?.fieldName
          )}
          onChange={(item) => handleInputChange(item)}
          style={props?.style !== undefined ? props?.style : {}}
        />
        <DropDown
          {...props}
          value={props?.uomValue !== undefined ? props?.uomValue : convertedUOM}
          fieldName={props?.UomFieldName}
          onChange={(item) => handleDDSelect(item)}
          width={props?.width}
          disabled={
            props?.disableUOM === undefined
              ? props?.disabled
              : props?.disableUOM
          }
        />
      </div>
    );
  } else {
    // if(props?.disabled){
    //     props?.onChange({name:props?.fieldName,value:convertedValue})
    // }
    return (
      <>
        <div>
          <Input
            key={props?.fieldName}
            {...props}
            fieldName={props?.fieldName}
            type="number"
            value={convertedValue}
            className={
              props?.grid === 5
                ? props?.error !== undefined && props?.error !== null
                  ? "input-field-right-error"
                  : props?.mandatory
                  ? "input-field-right-mandatory"
                  : "input-field-right"
                : props?.inputClassName
                ? props?.inputClassName
                : undefined
            }
            disabled={props?.disabled}
            mandatory={props?.mandatory}// && !props?.disabled}
            displayValue={validateNaN(
              convertedValue !== "" ? convertedValue : props?.value,
              props?.fieldName
            )}
            onChange={(item) => handleInputChange(item)}
            style={props?.style !== undefined ? props?.style : {}}
          />
        </div>
        {props?.action !== undefined ? (
          <FormFieldsInput inputType="uom">
            <div className="grid-inputuom-item">
              <DropDown
                {...props}
                value={props?.valueUOM !== undefined ? props?.valueUOM : convertedUOM}
                fieldName={props?.UomFieldName}
                onChange={(item) => handleDDSelect(item)}
                width={props?.width}
                disabled={
                  props?.disableUOM === undefined
                    ? props?.disabled
                    : props?.disableUOM
                }
              />
            </div>
            <div className="grid-inputuom-item">
              <CopyButton
                variant="contained"
                color="success"
                className="copy-button"
                iconColor="#ffffff"
                infoText={props?.action?.tooltip}
                onClick={() => handleCopyButtonClick(props)}
              />
            </div>
          </FormFieldsInput>
        ) : (
          <div
            className={
              props?.grid !== 5
                ? props?.fieldsLen > 1
                  ? ""
                  : "grid-inputuom-item"
                : ""
            }
            style={props?.grid === 5 ? { width: "8rem" } : {}}
          >
            <DropDown
              {...props}
              value={props?.valueUOM !== undefined ? props?.valueUOM : convertedUOM}
              fieldName={props?.UomFieldName}
              onChange={(item) => handleDDSelect(item)}
              width={props?.width}
              disabled={
                props?.disableUOM === undefined
                  ? props?.disabled
                  : props?.disableUOM
              }
            />
          </div>
        )}
      </>
    );
  }
};

export default InputDropDownCombo;
