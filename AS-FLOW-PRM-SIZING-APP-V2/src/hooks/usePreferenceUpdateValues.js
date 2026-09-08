import { useDispatch, useSelector } from 'react-redux';
import { bulkUpdateSelectedPreferences, updatePreferencePayloadData } from '../store/slices/preferenceSlice';
import { useEffect } from 'react';
import { convertUnit } from '../utils/convertUnit';
const usePreferenceUpdateValues = () => {
    const dispatch = useDispatch();
    const { preferences } = useSelector(state => state.auth);
    const { units } = useSelector(state => state.uom);
    //const [selectedPreference, setSelectedPreference] = useState(preferences);
    const { preferenceSections, preferencePayloadData } = useSelector(state => state.preference);
    useEffect(() => {
        // const newSelectedPreference = Object.keys(preferences).map(key => ({
        //     name: key,
        //     value: preferences[key]
        // }))
        // setSelectedPreference(newSelectedPreference);
        // console.log('useEffect', newSelectedPreference);
        // dispatch(bulkUpdateSelectedPreferences(newSelectedPreference));
        //return () => dispatch(bulkUpdateSelectedPreferences([]));
    }, []);
    const updateValues = (displayUnitSystem, initialRender) => {
        let payloadData = {};
        let selectedFields = [];
        if (!initialRender) {
            preferenceSections.forEach(section => {
                section.fields.forEach(field => {
                    if (field.fieldName === "DisplayUnitSystem") {
                        payloadData[field.fieldName] = displayUnitSystem;
                        selectedFields.push({ name: field.fieldName, value: displayUnitSystem });
                        return;
                    }

                    if (field.type === "inputUom" || field.type === "select") {
                        const isUomField = field.type === "inputUom" && field.dependence === "Display Unit System";
                        const fieldName = isUomField ? field.UomFieldName : field.fieldName;
                        const fieldValue = ["English", "All"].includes(displayUnitSystem) ?
                            (isUomField ? field.defaultUnitEnglish : field.defaultValueEnglish) :
                            displayUnitSystem === 'Metric' ?
                                (isUomField ? field.defaultUnitMetric : field.defaultValueMetric) :
                                preferences[fieldName];
                        if (isUomField) {
                            //payloadData[field.fieldName] = preferences[field.fieldName];
                            selectedFields.push({ name: field.fieldName, value: preferences[field.fieldName] });
                            const inputValue = getConvertedValue(field, displayUnitSystem)
                            payloadData[field.fieldName] = inputValue;
                            selectedFields.push({ name: field.fieldName, value: inputValue });
                        }
                        payloadData[fieldName] = fieldValue;
                        selectedFields.push({ name: fieldName, value: fieldValue });
                    }
                });
            });
            dispatch(bulkUpdateSelectedPreferences(selectedFields));
            dispatch(updatePreferencePayloadData(payloadData));
        } else {
            const newSelectedPreference = Object.keys(preferences).map(key => ({
                name: key,
                value: preferences[key]
            }))
            dispatch(bulkUpdateSelectedPreferences(newSelectedPreference));
            dispatch(updatePreferencePayloadData(preferences));
        }
    }
    const getConvertedValue = (field, displayUnitSystem) => {
        if (field.type === 'inputUom') {
            let localValue = preferencePayloadData[field.fieldName];
            let oldUom = units[field.dimensionName[0]].find(unit => unit.UnitKey === preferencePayloadData[field.UomFieldName])
            // Determine the default value based on the displayUnitSystem
            let defaultUnitKey;
            if (["English", "All"].includes(displayUnitSystem)) {
                defaultUnitKey = field.defaultUnitEnglish;
            } else if (displayUnitSystem === "Metric") {
                defaultUnitKey = field.defaultUnitMetric;
            } else {
                defaultUnitKey = field.defaultUnit;
            }

            // Find the new unit of measurement based on the determined defaultUnitKey
            let newUom = units[field.dimensionName[0]].find(unit => unit.UnitKey === defaultUnitKey);
            // let newUom = field.
            let newValue = convertUnit(localValue, oldUom, newUom)
            return newValue
        }
    }

    const getupdatedValue = (field, newUomUnit) => {
        if (field.type === 'inputUom') {
            let localValue = preferencePayloadData[field.fieldName];
            let oldUom = units[field.dimensionName[0]].find(unit => unit.UnitKey === preferencePayloadData[field.UomFieldName])
            let newUom = units[field.dimensionName[0]].find(unit => unit.UnitKey === newUomUnit);
            let newValue = convertUnit(localValue, oldUom, newUom)
            return newValue
        }
    }

    return { updateValues, getConvertedValue, getupdatedValue };
};

export default usePreferenceUpdateValues;