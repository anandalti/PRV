import PropTypes from 'prop-types'
import Checkbox from "../../../components/basicComponents/Checkbox";
// import DropDown from "../basicComponents/DropDown";
import Radio from "../../../components/basicComponents/Radio";
// import RadioInputGroup from "../basicComponents/RadioInputGroup";
import Grid from "../../../components/hoc/Grid";
import InputUom from "./PreferenceInputUom";
import { gridCenterSx } from "../../../styles/StyleObjectProperties";
import LabeledDropdown from "../../../components/basicComponents/LabeledDropdown";
import LabeledInput from "../../../components/basicComponents/LabeledInput";
import { useEffect, useState } from 'react';
import RadioInputUom from '../../../components/compoundComponents/RadioInputUom';
import Combobox from '../../../components/basicComponents/Combobox';
// import InputUomInfo from '../../../components/compoundComponents/InputUomInfo';

const PreferenceFormFields = ({fields, error,selectedFields, ...prop}) => {
    const [newFields, setNewFields] = useState(fields);
    // const { selectedFields } = useSelector(state=> state.workflow);
    const generateFields = (fields) => {
        {
            return newFields.map((field, index) => {
                let disabled = field.disabled;
                let value = field.value;
                let handleChange = field.handleChange;
                let componentError = field.error;
                // console.log('In form field ::: value/ ::: 2222 >>>>>>>>>>>>>> ',field?.options,value,field.fieldName,defaultValue,selectedFields)
                switch(field.type) {
                    case 'input':
                        return <LabeledInput key={index} value={value} {...field} {...prop} disabled={disabled} error={componentError} onChange={(item)=>handleChange(item)} />
                    case 'number':
                        return <LabeledInput key={index} value={value} {...field} {...prop} disabled={disabled} error={componentError} onChange={(item)=>handleChange(item)} />
                    case 'combobox':
                        return <Combobox key={index} {...field} {...prop} fields={fields} value={value} onChange={(item)=>handleChange(item)}/>
                        // return <DropDown key={index} {...field} {...prop} value={value} error={componentError} onChange={(item)=>handleChange(item)} width="70%" />
                    case 'select':
                        return <LabeledDropdown key={index} {...field} {...prop} value={value} error={componentError} onChange={(item)=>handleChange(item)} />
                    case 'checkbox':
                        return <Checkbox key={index} value={value} {...field} {...prop} error={componentError} onChange={(item)=>handleChange(item)}  />
                    case 'radio':
                        return <Radio key={index} {...field} {...prop} onChange={(e) => handleChange(e, field)}  />
                    case 'radioInput':
                        return <RadioInputUom key={index} {...field} {...prop} InputValue={value} error={componentError} dimensionName={dimensionName} uomValue={field.radioUnitValue} onChange={(item) => handleChange( item,field)}/>
                    case 'inputUom':{
                            return <InputUom key={index} {...field} {...prop} value={value} error={componentError} uomValue={field.unitValue} onChange={(item) => handleChange(item, field)} />
                         }
                    default:
                        return "Invalid Field Type"
                }
            })
        }
    }
    useEffect(() => {
        setNewFields(fields);
    }, [selectedFields, fields])

    return ( <Grid container spacing={2} sx={gridCenterSx}>
        <div style={{backgroundColor:"white",width:"100%",padding:"1.25rem 5rem 1.25rem 1rem"}}>
        {generateFields(fields)}
        </div>
    </Grid>)
}

PreferenceFormFields.prototype = {
    fields: PropTypes.array,
    handleChange: PropTypes.func,
    selectedFields: PropTypes.array
}

export default PreferenceFormFields;