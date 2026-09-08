import PropTypes from 'prop-types';
import Input from "./Input";
import InputDropDownCombo from './InputDropDownCombo';
import MultiInputDropdownCombo from './MultiInputDropdownCombo';
import { validateNaN } from '../../utils/utility';
import FormFieldsInputRow from '../hoc/FormFieldsInputRow';
import FormFieldsLabel from '../hoc/FormFieldsLabel';
import FormFieldsInput from '../hoc/FormFieldsInput';
import TextDisplay from './TextDisplay';

const MultiInputwithUom = ({ option,selectedValue,value,grid,error, handleInputChange,handleRadioChange,...props }) => {
  // console.log('MultiInputwithUom >>>>>>>>>>>>> ',props)
  return (
    <>
      <FormFieldsInputRow>
        <FormFieldsLabel>
          <TextDisplay {...props} text={option?.inputLabel} />
        </FormFieldsLabel>
        <FormFieldsInput inputType={option?.dimensionName==="" || option?.dimensionName===undefined?"default"
                                  :Array.isArray(props?.fieldName)?"input2-uom":"uom"}>
          {
            option?.dimensionName==="" || option?.dimensionName===undefined?
            // <div className="radio-container-sub2">
              <Input {...props} type="number" id={`${option?.fieldName}-input`} name={option?.inputLabel} error={error} 
                    disabled={props?.disabled} value={value}  
                    displayValue={validateNaN(value)}
                    />
            // </div>
            :Array.isArray(props?.fieldName)?
            <MultiInputDropdownCombo {...props} value={value} disabled={props?.disabled}  error={error} dimensionName={option?.dimensionName} options={option.options} width={props?.popupFields?"6rem":"8rem"}/>
            :
            <InputDropDownCombo {...props} value={value} disabled={props?.disabled} error={error} dimensionName={option?.dimensionName} options={option.options} width={props?.popupFields?"6rem":"8rem"}/>
          }
        </FormFieldsInput>
      </FormFieldsInputRow>
        {/* <div className={`radio-container-sub ${props?.popupFields !==true && grid===6 && 'margin-left-40'}`} style={props?.popupFields?{width:"4.5rem"}:{}}>
            <label htmlFor={option?.fieldGroupName} style={props?.popupFields?{fontSize:14}:{}}>{option?.inputLabel}</label>
        </div>
        {
          option?.dimensionName==="" || option?.dimensionName===undefined?
          <div className="radio-container-sub2">
            <Input {...props} type="number" id={`${option?.fieldName}-input`} name={option?.inputLabel} error={error} 
                  disabled={props?.disabled} value={value}  
                  displayValue={validateNaN(value)}
                  />
          </div>
          :Array.isArray(props?.fieldName)?
          <MultiInputDropdownCombo {...props} value={value} disabled={props?.disabled}  error={error} dimensionName={option?.dimensionName} options={option.options} width={props?.popupFields?"6rem":"8rem"}/>
          :
          <InputDropDownCombo {...props} value={value} disabled={props?.disabled} error={error} dimensionName={option?.dimensionName} options={option.options} width={props?.popupFields?"6rem":"8rem"}/>
        } */}
      </>

  );
};

MultiInputwithUom.propTypes = {
  index: PropTypes.number,
  option: PropTypes.object,
  error: PropTypes.object,
  value: PropTypes.number || PropTypes.string,
  selectedValue: PropTypes.string,
  inputValue: PropTypes.string,
  grid: PropTypes.number,
  handleInputChange: PropTypes.func,
  handleRadioChange: PropTypes.func
};

export default MultiInputwithUom;