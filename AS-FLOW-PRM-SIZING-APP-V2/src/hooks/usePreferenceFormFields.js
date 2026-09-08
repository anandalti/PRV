import { useDispatch, useSelector } from 'react-redux';
import { onUpdatePreferenceField, updatePreferenceError } from '../store/slices/preferenceSlice';
import { checkDefaultValue, checkValidations, getDisplayUnit } from '../utils/validation';
import { DISPLAY_UNIT_SYSTEM } from '../utils/constants';
import usePreferenceGetOptions from './usePreferenceGetOptions';
import usePreferenceUpdateValues from './usePreferenceUpdateValues';
const usePreferenceFormFields = () => {
    const dispatch = useDispatch();
    const { selectedPreferences, preferencePayloadData, error } = useSelector(state => state.preference);
    const {preferences} = useSelector(state => state.auth);
    const {defaultUnits} = useSelector(state => state.uom);
    const {getOptions } = usePreferenceGetOptions()
    const {updateValues, getupdatedValue } = usePreferenceUpdateValues()
    const handleChange = (item, field) => {
        //console.log(preferencePayloadData[item.name], ' >>>>>>> itemName')
        if(field?.type === "inputUom" && field.UomFieldName === item.name){
            let inputValue = getupdatedValue(field, item.value)
            dispatch(onUpdatePreferenceField({name:field.fieldName, value: inputValue}));
        }
        dispatch(onUpdatePreferenceField(item));
        if(item.name === DISPLAY_UNIT_SYSTEM){
            getOptions(item.value)
            updateValues(item.value)
        }

        if(field?.validations?.length > 0){
            // Check for validation errors
            let errorExist = checkValidations(field.validations, field.fieldName, item.value, field);
            // Create a map from the existing errors for efficient access and update
            const errorMap = error.reduce((map, item) => {
                map[item.name] = item;
                return map;
            }, {});
            if(errorExist?.length > 0){
                if (!errorExist[0]?.flag) {
                    // If no errors, remove the field's error from the map
                    delete errorMap[field.fieldName];
                } else {
                    // If errors exist, update or add the field's error
                    errorMap[field.fieldName] = errorExist[0];
                }
            }
            // Convert the updated map back to an array
            let errorArray = Object.values(errorMap);
            // console.log('Validations ::: rule 111111 errorExist', errorArray)
            dispatch(updatePreferenceError(errorArray));
        }
    };
    const createFields = (items) => {
        {
            return items.map((field, index) => {
                let defaultValue = field.defaultValue;
                let componentError = null;
                let dimensionName;
                let unitValue;
                
                if (error !== null && error !== undefined && error.length > 0) {
                    componentError = error?.filter((item) => item.name === field.fieldName)
                    if (componentError.length === 0) {
                        componentError = null
                    }
                }
                const validOptions = field?.options?.filter(option => typeof option === 'object');
                let value;
                const findField = selectedPreferences?.find(selectedField => selectedField.name === field.fieldName);
                const findUomField = selectedPreferences?.find(selectedField => selectedField.name === field.UomFieldName);
                const displayUnit = selectedPreferences?.find(selectedField => selectedField.name === "DisplayUnitSystem");
                //const findField = preferencePayloadData[field.fieldName];
                //console.log('first findField::: ',findField,field.fieldName,defaultValue);
                value = findField?.value !== undefined ? findField?.value : defaultValue;
                unitValue = findUomField?.value !== undefined ? findUomField?.value : field.defaultUnit;
                const disabled = field.fieldName === "CalculationMethod" &&  displayUnit.value !== "All"? true: field.disabled;
                
                return {
                    value: value,
                    options: validOptions,
                    error: componentError,
                    handleChange: handleChange,
                    type: field.type,
                    fieldName: field.fieldName, 
                    label: field.label,
                    infoText: field.infoText,
                    grid: field.grid,
                    disabled: disabled,
                    visible: field.visible,
                    dimensionName: field.dimensionName,
                    defaultUnitEnglish: field.defaultUnitEnglish,
                    defaultUnitMetric: field.defaultUnitMetric,
                    mandatory: field.mandatory,
                    unitValue: unitValue,
                    UomFieldName: field?.UomFieldName,
                    validations: field.validations,
                }
                //return field;

            })
        }
    }
    
    return {
        createFields
    }
}

export default usePreferenceFormFields;