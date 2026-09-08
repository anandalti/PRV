import PropTypes from "prop-types";
import { useState } from "react";
import RadioWithInput from "../basicComponents/RadiowithInput";
import FormFieldsInputRow from "../hoc/FormFieldsInputRow";

const RadioInputUom = (props) => {
  // console.log('In RadiotInputUom ::: props2211 ::: >>>> ',props, props?.defaultSelected, props?.fieldList[0]?.fieldGroup)
  const [selectedValue, setSelectedValue] = useState(
    // typeof props?.defaultValue==='object'?props?.defaultValue[props?.defaultSelected]===true
    props?.defaultSelected
      ? props?.defaultSelected
      : props?.fieldList[0]?.fieldGroup
  );
  return (
    <>
      <FormFieldsInputRow>
        {props?.fieldList?.map((field, index) => {
          // console.log('In RadiotInputUom ::: field ::: 111111>>>> ',field,field?.fieldName,props?.dimensionName,props?.uomValue,props?.InputValue,props?.InputValue[field?.fieldName])
          let componentError = null;
          let dimensionName;
          let uomValue;
          let value;
          let multiFieldFlag = Array.isArray(field?.fieldName);
          const item = field?.fieldName;
          const UomFieldName = field?.UomFieldName;
          // return (<>
          //   {
          if (!multiFieldFlag) {
            if (
              props?.dimensionName !== undefined &&
              Object.keys(props?.dimensionName).length > 0
            ) {
              dimensionName = props?.dimensionName[item];
            }
            if (
              props?.uomValue !== undefined &&
              Object.keys(props?.uomValue).length > 0
            ) {
              uomValue = props?.uomValue[item];
            }
            // else field.grid = 6;

            if (
              props?.InputValue !== undefined &&
              Object.keys(props?.InputValue).length > 0
            ) {
              value = props?.InputValue[item];
              // console.log('In RadiotInputUom ::: field::: 2222222 >>>> ',value,props?.InputValue,props?.InputValue[field?.fieldName])
            }
            if (props?.error !== null) {
              if (Array.isArray(props?.error) && props?.error.length > 0) {
                componentError = props?.error?.filter((it) => it.name === item);
                if (componentError?.length === 0) {
                  componentError = null;
                }
              } else if (typeof props?.error === "object") {
                componentError = props?.error[item];
              }
            }
          } else {
            dimensionName = props?.dimensionName;
            uomValue = props?.uomValue;
            value = props?.InputValue;
            componentError = props?.error;
          }

          const handleRadioChange = (fieldGroup) => {
            // console.log(' >>>>>>>>>>>>>>>>>>>> ',{fieldGroup,fieldName:props.fieldName})
            props.onChange({ name: props.fieldName, value: fieldGroup });
            setSelectedValue(fieldGroup);
          };
          return (
            <RadioWithInput
              {...props}
              key={`${item}-${index}`}
              option={field}
              fieldName={item}
              //UomFieldName={field?.UomFieldName}
              fieldGroup={field?.fieldGroup}
              regex={field?.regex}
              value={value}
              dimensionName={dimensionName}
              uomValue={uomValue}
              grid={field?.grid}
              mandatory={field?.mandatory}
              error={componentError}
              // selectedValue={selectedValue}
              selectedValue={
                typeof props?.defaultValue === "object" &&
                props?.fieldList?.find(
                  (field) =>
                    typeof props?.defaultValue[field.fieldName] === "boolean" &&
                    props?.defaultValue[field.fieldName] === true
                ) !== undefined
                  ? props?.fieldList?.find(
                      (field) => props?.defaultValue[field.fieldName] === true
                    )?.fieldName
                  : props?.fieldList.some(
                      (field) => selectedValue === field.fieldGroup
                    )
                  ? selectedValue
                  : props?.fieldList[1]?.fieldGroup
              }
              handleRadioChange={(fieldGroup) => handleRadioChange(fieldGroup)}
              onChange={(it) => props?.onChange(it)}
              onBlur={(it) => props?.onBlur(it)}
              handleFocusedFieldName={(it) => props?.handleFocusedFieldName(it)}
              UomFieldName={UomFieldName}
            />
          );
        })}
      </FormFieldsInputRow>
      {/* <div
        className="grid-radio-container"
        // style={{ display: "none" }}
      >
        {props?.fieldList?.map((field, index) => {
          // console.log('In RadiotInputUom ::: field ::: 111111>>>> ',field,field?.fieldName,props?.dimensionName,props?.uomValue,props?.InputValue,props?.InputValue[field?.fieldName])
          let componentError = null;
          let dimensionName;
          let uomValue;
          let value;
          let multiFieldFlag = Array.isArray(field?.fieldName);
          const item = field?.fieldName;
          const UomFieldName = field?.UomFieldName;
          // return (<>
          //   {
          if (!multiFieldFlag) {
            if (props?.dimensionName !== undefined && Object.keys(props?.dimensionName).length > 0) {
              dimensionName = props?.dimensionName[item];
            }
            if (props?.uomValue !== undefined && Object.keys(props?.uomValue).length > 0) {
              uomValue = props?.uomValue[item];
            }
            if (props?.InputValue !== undefined && Object.keys(props?.InputValue).length > 0) {
              value = props?.InputValue[item];
              // console.log('In RadiotInputUom ::: field::: 2222222 >>>> ',value,props?.InputValue,props?.InputValue[field?.fieldName])
            }
            if (props?.error !== null) {
              if (Array.isArray(props?.error) && props?.error.length > 0) {
                componentError = props?.error?.filter((it) => it.name === item);
                if (componentError?.length === 0) {
                  componentError = null;
                }
              } else if (typeof props?.error === "object") {
                componentError = props?.error[item];
              }
            }
          } else {
            dimensionName = props?.dimensionName;
            uomValue = props?.uomValue;
            value = props?.InputValue;
            componentError = props?.error;
          }

          const handleRadioChange = (fieldGroup) => {
            props.onChange({ name: props.fieldName, value: fieldGroup });
            setSelectedValue(fieldGroup);
          };
          // console.log('In RadiotInputUom ::: field ::: 222222>>>> ',field,selectedValue,item,value,dimensionName,uomValue,componentError)
          return (
            <div
              key={`${item}-${index}`}
              className={`radio-container`}
              style={{
                gridTemplateColumns: field?.grid === 4 ? "1fr 0.93fr 0.93fr" : "0.6fr 1fr",
                marginLeft: field?.grid === 6 ? "5.875rem" : "0.875rem",
              }}
            >
              <RadioWithInput
                {...props}
                key={`${item}-${index}`}
                option={field}
                fieldName={item}
                //UomFieldName={field?.UomFieldName}
                fieldGroup={field?.fieldGroup}
                regex={field?.regex}
                value={value}
                dimensionName={dimensionName}
                uomValue={uomValue}
                grid={field?.grid}
                mandatory={field?.mandatory}
                error={componentError}
                // selectedValue={selectedValue}
                selectedValue={
                  props?.fieldList.some((field) => selectedValue === field.fieldGroup)
                    ? selectedValue
                    : props?.fieldList[1]?.fieldGroup
                }
                handleRadioChange={(fieldGroup) => handleRadioChange(fieldGroup)}
                onChange={(it) => props?.onChange(it)}
                onBlur={(it) => props?.onBlur(it)}
                handleFocusedFieldName={(it) => props?.handleFocusedFieldName(it)}
                UomFieldName={UomFieldName}
              />
            </div>
          );
          //   })
          // }
          // </>)
        })}
      </div> */}
    </>
  );
};

RadioInputUom.prototype = {
  fieldList: PropTypes.array,
  dimensionName: PropTypes.object,
  uomValue: PropTypes.object,
  InputValue: PropTypes.object,
  error: PropTypes.object,
  handleChange: PropTypes.func,
};

export default RadioInputUom;
