import PropTypes from 'prop-types';
import { useState } from 'react';
import Radio from '../basicComponents/Radio';

const RadioLabel = (props) => {
    // console.log('In RadioLabel >>>>>>>>>>>> ',props)
    const { fieldList, onChange } = props;
    let initialSelectedValue =  fieldList?.find(field => props?.value[field?.fieldName]===true)?.fieldName; //|| fieldList!==null ? fieldList?.length>0 ?fieldList[0]?.fieldName:'':'';
    // console.log('Popup 1111 >>>>>>>>>>>> In radio >>>>>>>>>>>> ',props?.value,initialSelectedValue,fieldList?.find(field => props?.value[field?.fieldName]===true)?.fieldName)
    const [selectedValue, setSelectedValue] = useState(initialSelectedValue);

    // useEffect(() => {
    //     if (onChange && selectedValue !== initialSelectedValue) {
    //         onChange(selectedValue);
    //     }
    // }, [selectedValue]);

    const handleRadioChange = (fieldName,label,field) => {
        // console.log('In RadioLabel >>>>>>>>>>>> ',fieldName,props?.fieldName)
        setSelectedValue(fieldName);
        onChange({name: props?.fieldName, value: fieldName,
                label:label,type:props?.type,
                validatefield: props?.isValidationRequired && props?.validateActionType=='onChange' ? true : false,
                fieldId:field?.fieldId,
            });
    };
    // console.log('In RadioLabel >>>>>>>>>>>> ',props)
    return (
        <div className={props?.gridDirection==='column' || props?.style?.gridDirection==='column'?"grid-radio-container-columns":props?.gridDirection==='rows' || props?.style?.gridDirection==='rows'?"grid-radio-container-rows":"grid-radio-container"}
            style={props?.gridDirection==='column' || props?.style?.gridDirection==='column' ? {gridTemplateColumns:props?.gridTemplateColumns}:{alignItems:"flex-start"}}
            >
            {/* {fieldList.length===3 && <div></div>} */}
            {(props?.gridDirection!=='rows' || props?.style?.gridDirection!=='rows') && <div>{props?.label!==''?props?.label:''}</div>}
            {fieldList?.map((field, index) => {
                const visibilityFlag = props?.visibility ? props?.visibility[field?.fieldName] : field?.visible;
                if(visibilityFlag){
                    return <div
                        key={`${field.fieldName}-${index}`}
                        className={(props?.gridDirection==='rows' || props?.style?.gridDirection==='rows') && field.grid === 4?"radio-container margin-left-12rem" :props?.gridDirection!=='column' || props?.style?.gridDirection!=='column'?field.grid == 3 ?`radio-container-rl-popup margin-left-40`:`radio-container ${field.grid === 4 ? 'margin-left-10' : 'margin-left-40'}`:''}
                        style={props?.style?{...props?.style}:{}}
                        // style={{ gridTemplateColumns: field.grid === 4 ? '1fr 0.85fr 0.74fr' : '1fr 1fr' }}
                    >
                        <Radio
                            {...props}
                            lastValueFlag={fieldList.length-1===index}
                            option={field}
                            selectedValue={selectedValue}
                            handleRadioChange={handleRadioChange}
                        />
                    </div>
                }
        })}
        </div>
    );
};

RadioLabel.propTypes = {
    fieldList: PropTypes.array.isRequired,
    onChange: PropTypes.func
};

export default RadioLabel;
