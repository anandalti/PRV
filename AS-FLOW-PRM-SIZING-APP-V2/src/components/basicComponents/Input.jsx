import PropTypes from "prop-types";
import ToolTip from "./ToolTip";
import React, { useEffect, useRef } from "react";

const Input = ({ fieldName, value, ...props }) => {
  // console.log('In Input >>>>>>>>>>>>>>>> ',fieldName,value,props?.fieldsLen,props?.displayValue,props)
  const [displayValue, setDisplayValue] = React.useState("");
  const [isInputFocused, setIsInputFocused] = React.useState(false);
  // Memoize previous value for comparison
  const prevValueRef = useRef(value);
  
  useEffect(() => {
    setDisplayValue(value);
    prevValueRef.current = value;
  }, [value]);

  if (props?.fieldsLen > 1) {
    const handleInputChange = (e) => {
      // console.log('In Input >>>>>>>>>>>>>>>> ',props?.type)
      if (props?.type === "number") {
        // const regex = /^[+-]?((0(\.\d*)?)|([1-9]\d*\.?\d*))$/;
        // const regex =/^[-]?\d*\.?\d*$/ //props?.regex? /^[0]?\d*\.?\d*$/ : /^[-]?\d*\.?\d*$/;

        const regex = props?.regex === "ALLOW_NEGATIVE" ? /^[-]?\d*\.?\d*$/ : /^[0]?\d*\.?\d*$/;

        if (regex.test(e.target.value)) {
          let localValue = e.target.value;
          if (localValue !== "" && localValue !== "-") {
            const negSplit = localValue.split("-");
            if (negSplit.length > 1) {
              localValue = negSplit[1];
            }
            let valueSplit = localValue.split(".");
            localValue =
              valueSplit?.length == 1
                ? negSplit.length > 1
                  ? `-${parseInt(valueSplit[0])}`
                  : parseInt(valueSplit[0])
                : negSplit.length > 1
                ? `-${valueSplit[0] === "" ? "0." : parseInt(valueSplit[0]) + "." + valueSplit[1]}`
                : valueSplit[0] === ""
                ? "0."
                : parseInt(valueSplit[0]) + "." + valueSplit[1];

            // console.log(' >>>>>>>>>>>> ',valueSplit,localValue.toString(),parseInt(e.target.value),parseInt(valueSplit[0])==0)
          }
          props.onChange({
            name: fieldName,
            value: localValue,
            mandatory: props?.mandatory,
            onchangevalidation: props?.onchangevalidation,
          });
          setDisplayValue(localValue);
        }
      } else {
        props.onChange({
          name: fieldName,
          value: e.target.value,
          mandatory: props?.mandatory,
          onchangevalidation: props?.onchangevalidation,
        });
        setDisplayValue(e.target.value);
      }
    };

    const handleBlur = (e) => {
      let localValue = e.target.value;
      // Only trigger onBlur if value has changed
      // if (localValue !== prevValueRef.current) {
      // console.log('handleBlur >>>>>>>>>>>>>> ',fieldName,e.target.name,e.target.value,props,props?.type === "number",props?.calculateFields !== undefined,props?.isValidationRequired && (props?.validateActionType=='both' || props?.validateActionType=='onBlur'))
        if (props?.type === "number") {
          if (props?.calculateFields !== undefined) {
            let onBlurFlag = props?.isValidationRequired && (props?.validateActionType=='both' || props?.validateActionType=='onBlur');
            props?.calculateFields.forEach((item) => {
              if (item?.target?.actionType === "OnBlur") {
                onBlurFlag = true;
              }
            });
            if (onBlurFlag) {
              props.onBlur({ name: fieldName, value: e.target.value, mandatory: props?.mandatory, 
                    validatefield:props?.isValidationRequired && (props?.validateActionType=='both' || props?.validateActionType=='onBlur'),
                    fieldId:props?.fieldId ?? props?.field?.fieldId,
                    sectionId:props?.sectionId ?? props?.field?.sectionId,
                    actionId:props?.actionId ?? props?.field?.actionId,
                    isFieldActionRequired:props?.isFieldActionRequired ?? props?.field?.isFieldActionRequired });
            }
          }
          localValue =
            localValue === "" || localValue === null || localValue === undefined || isNaN(localValue)
              ? props?.value
              : parseFloat(localValue).toFixed(3);
          setDisplayValue(localValue);
          setIsInputFocused(false);
        }
        // Update memoized value
        prevValueRef.current = localValue;
      // }
    };
    const handleFocusedFieldName = () => {
      setIsInputFocused(true);
      props?.handleFocusedFieldName(fieldName);
    };
    // if(fieldName==="OverPressure" || fieldName==="InletLoss"){
    //   console.log('In Input >>>>>>>>>>>>>>>> ',fieldName,props?.mandatory)
    // }
    const mandatoryFlag = typeof props.mandatory === "object" ? props.mandatory[fieldName] : props.mandatory;
    return (
      <div
        className={props?.gridTemplateColumns !== undefined && props?.style?.gridTemplateColumns !== undefined ? "" : "grid-item-left"}
        style={props?.style !== undefined ? props?.style : {}}
      >
        {fieldName !== "Blank" ? (
          <ToolTip {...props} infoText={undefined} fieldName={fieldName}>
            <input
              className={
                props?.className !== undefined
                  ? props.className
                  : `input-field${props?.popupFields===true?"-popup":""}${
                    props?.error?.[0]?.value?.error?.type === 'error' 
                    ? "-error" 
                    : props?.error?.[0]?.value?.error?.type === "warning" 
                    ? "-warning" 
                    : mandatoryFlag
                    ? "-mandatory" 
                    : ""
                  }`
              }
              type={props.type}
              name={fieldName}
              // value={props?.displayValue!==undefined?props?.displayValue:value}
              value={isInputFocused ? value : props?.displayValue !== undefined ? props?.displayValue : value}
              // onChange={(e) => props.onChange({name: fieldName, value: e.target.value,mandatory:props?.mandatory})}
              onChange={handleInputChange}
              onBlur={handleBlur}
              mandatory={mandatoryFlag}
              // onFocus={() => setIsInputFocused(true)}
              disabled={props.disabled}
              style={props.style}
              onFocus={handleFocusedFieldName}
            />
          </ToolTip>
        )
      :(
        <div></div>
      )} 
      </div>
    );
  } else {
    const handleInputChange = (e) => {
      // console.log('In Input >>>>>>>>>>>>>>>> ',props?.type,e.target.value)
      if (props?.type === "number") {
        const regex = props?.regex === "ALLOW_NEGATIVE" ? /^[-]?\d*\.?\d*$/ : /^[0]?\d*\.?\d*$/; //props?.regex? /^[0]?\d*\.?\d*$/ : /^[-]?\d*\.?\d*$/;
        // console.log('In Input 222222>>>>>>>>>>>>>>>> ',props?.regex,regex,e.target.value,regex.test(e.target.value))
        if (regex.test(e.target.value)) {
          let localValue = e.target.value;
          if (localValue !== "" && localValue !== "-") {
            const negSplit = localValue.split("-");
            if (negSplit.length > 1) {
              localValue = negSplit[1];
            }
            let valueSplit = localValue.split(".");
            localValue =
              valueSplit?.length == 1
                ? negSplit.length > 1
                  ? `-${parseInt(valueSplit[0])}`
                  : parseInt(valueSplit[0])
                : negSplit.length > 1
                ? `-${valueSplit[0] === "" ? "0." : parseInt(valueSplit[0]) + "." + valueSplit[1]}`
                : valueSplit[0] === ""
                ? "0."
                : parseInt(valueSplit[0]) + "." + valueSplit[1];
          }
          props.onChange({
            name: fieldName,
            value: localValue,
            mandatory: props?.mandatory,
            onchangevalidation: props?.onchangevalidation,
          });
          setDisplayValue(localValue);
        }
      } else {
        props?.onChange({
          name: fieldName,
          value: e.target.value,
          mandatory: props?.mandatory,
          onchangevalidation: props?.onchangevalidation,
        });
        setDisplayValue(e.target.value);
      }
    };
    const handleBlur = (e) => {
      // Only trigger onBlur if value has changed
      let localValue = e.target.value;
      // if (localValue !== prevValueRef.current) {
      // console.log('On Blur >>>>>>>>>>>> ',fieldName,e.target.name,e.target.value,props,props?.type === "number",props?.calculateFields !== undefined,props?.isValidationRequired && (props?.validateActionType=='both' || props?.validateActionType=='onBlur'),props?.field)
        if (props?.type === "number") {
          if (props?.calculateFields !== undefined) {
            let onBlurFlag = props?.isValidationRequired && (props?.validateActionType=='both' || props?.validateActionType=='onBlur');
            props?.calculateFields?.forEach((item) => {
              if (item?.target?.actionType === "OnBlur") {
                onBlurFlag = true;
              }
            });
            if (onBlurFlag) {
              props?.onBlur({ name: fieldName, value: e.target.value, mandatory: props?.mandatory, 
                  validatefield:props?.isValidationRequired && (props?.validateActionType=='both' || props?.validateActionType=='onBlur'),
                  fieldId:props?.fieldId ?? props?.field?.fieldId,
                  sectionId:props?.sectionId ?? props?.field?.sectionId,
                  actionId:props?.actionId ?? props?.field?.actionId,
                  isFieldActionRequired:props?.isFieldActionRequired ?? props?.field?.isFieldActionRequired
                });
            }
          }else if(props?.isValidationRequired && (props?.validateActionType=='both' || props?.validateActionType=='onBlur')){
            const localItem={ name: fieldName, value: e.target.value, mandatory: props?.mandatory, 
                  validatefield:props?.isValidationRequired && (props?.validateActionType=='both' || props?.validateActionType=='onBlur'),
                  fieldId:props?.fieldId ?? props?.field?.fieldId,
                  sectionId:props?.sectionId ?? props?.field?.sectionId,
                  actionId:props?.actionId ?? props?.field?.actionId,
                  isFieldActionRequired:props?.isFieldActionRequired ?? props?.field?.isFieldActionRequired
                };
            // console.log('On Blur >>>>>>>>>>>> 22222',localItem)
            props?.onBlur(localItem);
          } else if (props?.onBlurAction) {
            props?.onBlur({ name: fieldName, value: e.target.value, mandatory: props?.mandatory, fieldId:props?.fieldId,sectionId:props?.sectionId });
          }
          localValue =
            localValue === "" || localValue === null || localValue === undefined || isNaN(localValue)
              ? props?.value
              : parseFloat(localValue).toFixed(3);
          setDisplayValue(localValue);
          setIsInputFocused(false);
        }
        // Update memoized value
        prevValueRef.current = localValue;
      // }
    };
    const handleFocusedFieldName = () => {
      setIsInputFocused(true);
      if (props?.handleFocusedFieldName !== undefined) {
        props?.handleFocusedFieldName(fieldName);
      }
    };

    // if(fieldName==="OverPressure" || fieldName==="InletLoss"){
    //   console.log('In Input >>>>>>>>>>>>>>>> 22222',fieldName,props?.mandatory,typeof props.mandatory,typeof props.mandatory === "object" ? props.mandatory[fieldName] : props.mandatory)
    // }
    const mandatoryFlag = typeof props.mandatory === "object" ? props.mandatory[fieldName] : props.mandatory;
    return (
      <>
        {fieldName !== "Blank" ? (
          <ToolTip {...props} infoText={undefined} fieldName={fieldName}>
            <input
              className={
                props?.className !== undefined
                  ? props.className
                  : `input-field${props?.popupFields===true?"-popup":""}${
                    props?.error?.find(err => err?.value?.error?.type === 'error')
                      ? "-error" 
                      :props?.error?.find(err => err?.value?.error?.type === 'warning')
                      ? "-warning" 
                      : mandatoryFlag
                      ? "-mandatory" 
                      : ""
                    }${props?.disabledRadio ? " disabledRadio" : ""}`
              }
              type={props.type === "number" ? "text" : props.type}
              name={fieldName}
              autoComplete="off"
              value={
                isInputFocused && props?.focusedFieldName === fieldName
                  ? value
                  : props?.displayValue !== undefined && props?.displayValue !== null
                  ? props?.displayValue
                  : ''
              }
              onChange={handleInputChange}
              disabled={props.disabled}
              mandatory={mandatoryFlag}
              style={{ ...props.style, width: "100%", boxSizing: "border-box" }}
              onBlur={handleBlur}
              onFocus={handleFocusedFieldName}
            />
          </ToolTip>
        ):(
          <div></div>
        )
      }
      </>
    );
  }
};
Input.propTypes = {
  className: PropTypes.string,
  grid: PropTypes.number,
  fieldName: PropTypes.string,
  label: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  style: PropTypes.object,
  disabled: PropTypes.bool,
};

export default Input;
