import PropTypes from 'prop-types';
import RadioWithInput from './RadiowithInput';


const RadioInputGroup = (props) => {
  

  // console.log('In RadioInputGroup:: >>>>>>> ',props,props?.selectedValue,convertedValue,convertedUOM)
  return (
    <>
      <RadioWithInput
          option={props?.option}
          selectedValue={props?.selectedValue}
          inputValue={props?.grid===4?props?.inputValue:convertedValue}
          grid={props?.grid}
          error={props?.error}
          handleInputChange={handleInputChange}
          handleRadioChange={(fieldName)=>props?.handleRadioChange(fieldName)}
        />
    </>
  )
};

RadioInputGroup.prototype = {
  fieldList: PropTypes.array,
  handleChange: PropTypes.func
}

export default RadioInputGroup;