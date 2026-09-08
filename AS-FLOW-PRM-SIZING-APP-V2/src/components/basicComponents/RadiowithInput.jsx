import PropTypes from "prop-types";
import Input from "./Input";
import InputDropDownCombo from "./InputDropDownCombo";
import MultiInputDropdownCombo from "./MultiInputDropdownCombo";
import { validateNaN } from "../../utils/utility";
import FormFieldsLabel from "../hoc/FormFieldsLabel";
import FormFieldsInput from "../hoc/FormFieldsInput";

const RadioWithInput = ({
  option,
  selectedValue,
  value,
  grid,
  error,
  handleInputChange,
  handleRadioChange,
  ...props
}) => {
  // console.log('In RadioWithInput>>>>>>>. ',selectedValue,option?.value,option,error,props,value,isNaN(parseFloat(value)))
  return (
    <>
      <FormFieldsLabel radio={true}>
        {/* <div className={`radio-container-sub`}> */}
        <div className="grid-radio-item-end">
          <input
            type="radio"
            id={option?.fieldName}
            name={option?.fieldGroupName}
            value={option?.fieldGroup}
            defaultChecked={selectedValue === option?.fieldGroup}
            disabled={option?.disabledRadio ? option?.disabledRadio[option?.fieldName] : false}
            onClick={() => handleRadioChange(option?.fieldGroup)}
          />
        </div>
        <label htmlFor={option?.fieldGroupName}>{option?.inputLabel}</label>
      </FormFieldsLabel>
      <FormFieldsInput inputType={option?.grid == 6 ? "default" : "uom"}>
        {option?.dimensionName === "" || option?.dimensionName === undefined || option?.dimensionName === null ? (
          // <div className="radio-container-sub2">
          <Input
            {...props}
            type="number"
            id={`${option?.fieldName}-input`}
            name={option?.inputLabel}
            error={error}
            disabled={selectedValue !== option?.fieldGroup || option?.disabled || option?.disabledRadio}
            value={value}
            displayValue={validateNaN(value)}
          />
        ) : // </div>
        Array.isArray(props?.fieldName) ? (
          <MultiInputDropdownCombo
            {...props}
            value={value}
            fieldGroup={option?.fieldGroup}
            selectedValue={selectedValue}
            disabled={selectedValue !== option?.fieldGroup  || (option?.disabled && selectedValue !== option?.fieldGroup && option?.disabled[option?.fieldName]) || (option?.disabledRadio && option?.disabledRadio[option?.fieldName])}
            disabledFields={props?.disabled}
            error={error}
            dimensionName={option?.dimensionName}
            options={option.options}
            width="100%"
          />
        ) : (
          <InputDropDownCombo
            {...props}
            value={value}
            disabled={selectedValue !== option?.fieldGroup || (typeof option?.disabled === 'object' ? option?.disabled[option?.fieldName] : option?.disabled) || (option?.disabledRadio && option?.disabledRadio[option?.fieldName])}
            disabledRadio={typeof option?.disabledRadio === 'object' ? option?.disabledRadio[option?.fieldName] : option?.disabledRadio}
            error={error}
            dimensionName={option?.dimensionName}
            options={option.options}
            field={option}
            width="100%"
          />
        )}
      </FormFieldsInput>
    </>
  );
};

RadioWithInput.propTypes = {
  index: PropTypes.number,
  option: PropTypes.object,
  error: PropTypes.object,
  value: PropTypes.number || PropTypes.string,
  selectedValue: PropTypes.string,
  inputValue: PropTypes.string,
  grid: PropTypes.number,
  handleInputChange: PropTypes.func,
  handleRadioChange: PropTypes.func,
};

export default RadioWithInput;
