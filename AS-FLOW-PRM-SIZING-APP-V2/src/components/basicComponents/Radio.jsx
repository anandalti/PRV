import PropTypes from 'prop-types';

const Radio = ({ lastValueFlag,option, selectedValue, handleRadioChange,...props }) => {
    return (
        <div className={`radio-container-sub ${option.grid === 6 ? 'margin-left-30' : ''}`}
        style={{ gridTemplateColumns: '0.10fr 1fr'  }}
            // style={{ gridTemplateColumns: lastValueFlag ? '0.10fr 1fr' : '0.25fr 1fr' }}
        >
            <div className="grid-radio-item-end">
                <input
                    type="radio"
                    id={option.fieldName}
                    name={option.fieldGroupName}
                    value={option.value}
                    checked={selectedValue === option.fieldName}
                    onChange={() => handleRadioChange(option.fieldName,option.label,option)}
                />
            </div>
            <label htmlFor={option.fieldName} style={props?.fontSize?{fontSize:props?.fontSize}:props?.popupFields?{fontSize:14}:{fontSize:16}}>{option?.inputLabel}</label>
        </div>
    );
};

Radio.propTypes = {
    lastValueFlag: PropTypes.bool,
    option: PropTypes.object.isRequired,
    selectedValue: PropTypes.string.isRequired,
    handleRadioChange: PropTypes.func.isRequired
};

export default Radio;
