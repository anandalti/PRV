

import { useDispatch, useSelector } from 'react-redux';
import { updatePreferenceSections, updatePreferencePayloadData, bulkUpdateSelectedPreferences, onUpdatePreferenceField } from '../store/slices/preferenceSlice';
const usePreferenceAddUomOptions = () => {
    const dispatch = useDispatch();
    const { preferenceSections, preferencePayloadData } = useSelector(state => state.preference);
    const { preferences } = useSelector(state => state.auth);
    const uom = useSelector(state => state.uom.units);
    const addOptions = (displayUnitSystem) => {
        if (preferenceSections.length) {
            let updatedPreference = preferenceSections.map(section => ({
                ...section, // Spread to copy section properties
                fields: section.fields.map(field => ({
                    ...field, // Spread to copy field properties
                    defaultValue: (field.fieldName === "DisplayUnitSystem" && displayUnitSystem === "All")? "All": preferences[field.fieldName] || field.defaultValue,
                    defaultUnit: field.type === "inputUom" && preferences[field.UomFieldName] || field.defaultUnit,
                    disabled: field.fieldName === "CalculationMethod" ? false : field.disabled,
                    options: getOptions(field, displayUnitSystem)
                    // options: Array.isArray(field.dimensionName) ? field.dimensionName.flatMap(dimension => {
                    //    // console.log(uom[dimension], 'uom[dimension]', dimension)
                    //     return uom.hasOwnProperty(dimension) ? [field.type === "select" && { label: "No Default", value: "noDefault" },
                    //     ...uom[dimension].map(unit => ({
                    //         value: unit.UnitKey,
                    //         label: unit.UnitName
                    //     }))] : field.options;
                    // }) : field.options
                }))
            }));
            let payloadData = {};
            let selectedFields = [];
            if (Array.isArray(updatedPreference) && updatedPreference.length) {
                updatedPreference.forEach(section => {
                    if (Array.isArray(section.fields) && section.fields.length) {
                        section.fields.forEach(field => {
                            if (field && field.fieldName && field.fieldName !== "DisplayUnitSystem") {
                                payloadData[field.fieldName] = preferencePayloadData[field.fieldName] || preferences[field.fieldName] || field.defaultValue;
                                let obj = {
                                    name: field.fieldName,
                                    value: preferencePayloadData[field.fieldName] || preferences[field.fieldName] || field.defaultValue
                                }
                                selectedFields.push(obj);
                            }else{
                                payloadData[field.fieldName] = preferences[field.fieldName] || field.defaultValue;
                                let obj = {
                                    name: field.fieldName,
                                    value: preferences[field.fieldName] || field.defaultValue
                                }
                                selectedFields.push(obj); 
                            }
                            if(field && field.type === "inputUom"){
                                let uomKey = field.UomFieldName;
                                payloadData[uomKey] =  preferences[uomKey] || field.defaultUnit;
                                let obj = {
                                    name: uomKey,
                                    value: preferences[uomKey] || field.defaultUnit
                                }
                                selectedFields.push(obj);
                            }
                        });
                    }
                });
            }
            // console.log(selectedFields, 'selectedFields')
            dispatch(updatePreferencePayloadData(payloadData));
            dispatch(bulkUpdateSelectedPreferences(selectedFields));
            dispatch(updatePreferenceSections(updatedPreference));
        }
    }
    const updateOptions = (displayUnitSystem) => {
        if (displayUnitSystem !== 'English' && displayUnitSystem !== 'Metric') {
           // console.log('displayUnitSystem inside ', displayUnitSystem)
            addOptions(displayUnitSystem);
        } else {
            if (preferenceSections.length) {
                let updatedPreference = preferenceSections.map(section => ({
                    ...section, // Spread to copy section properties
                    fields: section.fields.map(field => ({
                        ...field, // Spread to copy field properties
                        defaultValue: field.type === "select" && field.dependence === "Display Unit System" ?
                        (displayUnitSystem === "English" ? field.defaultValueEnglish :
                            displayUnitSystem === "Metric" ? field.defaultValueMetric : field.defaultValue)
                        : preferencePayloadData[field.fieldName] || field.defaultValue, //getDefaultValue(field, displayUnitSystem),
                        defaultUnit: field.type === "inputUom" && field.dependence === "Display Unit System" ?
                            (displayUnitSystem === "English" ? field.defaultUnitEnglish :
                                displayUnitSystem === "Metric" ? field.defaultUnitMetric : field.defaultUnit)
                            : field.defaultUnit,
                        disabled: field.fieldName === "CalculationMethod",
                        options: getOptions(field, displayUnitSystem)
                        // options: Array.isArray(field.dimensionName) ? field.dimensionName.flatMap(dimension => {
                        //     return uom.hasOwnProperty(dimension) ? [
                        //         ...(field.type === "select" ? [{ label: "No Default", value: "noDefault" }] : []),
                        //         ...uom[dimension].map(unit => (
                        //             unit.SystemUnit === displayUnitSystem ? {
                        //                 value: unit.UnitKey,
                        //                 label: unit.UnitName
                        //             } : null
                        //         )).filter(unit => unit !== null)
                        //     ] : field.options;
                        // }) : field.options
                    }))
                }));
                let payloadData = {};
                let selectedFields = [];
                if (Array.isArray(updatedPreference) && updatedPreference.length) {
                    updatedPreference.forEach(section => {
                        if (Array.isArray(section.fields) && section.fields.length) {
                            section.fields.forEach(field => {
                                if (field && field.fieldName && field.fieldName !== "DisplayUnitSystem") {
                                    if(field.type === "inputUom" && field.dependence === "Display Unit System"){
                                        let uomKey = field.UomFieldName;
                                        payloadData[uomKey] = field.defaultUnit;
                                        let obj = {
                                            name: uomKey,
                                            value: field.defaultUnit
                                        }
                                        selectedFields.push(obj);
                                        // console.log(field.defaultValue, 'field.defaultValue')

                                    }else{
                                        payloadData[field.fieldName] = field.defaultValue;
                                        let obj = {
                                            name: field.fieldName,
                                            value: field.defaultValue
                                        }
                                        selectedFields.push(obj);
                                    }

                                }else{
                                    payloadData[field.fieldName] = displayUnitSystem;
                                    let obj = {
                                        name: field.fieldName,
                                        value: field.defaultValue
                                    }
                                    selectedFields.push(obj);
                                }
                            });
                        }
                    });
                }
                // console.log(selectedFields, 'selectedFields')
                dispatch(bulkUpdateSelectedPreferences(selectedFields));
                dispatch(updatePreferencePayloadData(payloadData));
                dispatch(updatePreferenceSections(updatedPreference));
            }
        }
    }
    const getDefaultValue =(field, displayUnitSystem)=>{
        if(field.type === 'inputUom'){
             let localValue = preferencePayloadData[field.fieldName];
             let oldUom = uom[field.dimensionName[0]].find(unit=> unit.UnitKey === preferencePayloadData[field.UomFieldName]) 
             // Determine the default value based on the displayUnitSystem
            let defaultUnitKey;
            if (displayUnitSystem === "English") {
                defaultUnitKey = field.defaultUnitEnglish;
            } else if (displayUnitSystem === "Metric") {
                defaultUnitKey = field.defaultUnitMetric;
            } else {
                defaultUnitKey = field.defaultUnit;
            }

            // Find the new unit of measurement based on the determined defaultUnitKey
            let newUom = uom[field.dimensionName[0]].find(unit => unit.UnitKey === defaultUnitKey);  
             // let newUom = field.
            //  console.log({localValue, oldUom, newUom, defaultUnitKey}, 'localValue, oldUom, newUom')
             //let newValue = convertUnit(localValue, oldUom, newUom)
             //console.log({name: field.fieldName, value:newValue}, '{name: [field.fieldName], value:newValue}')
             //dispatch(onUpdatePreferenceField({name: field.fieldName, value:newValue}))
            return newValue
        }else{
            return field.type === "select" && field.dependence === "Display Unit System" ?
            (displayUnitSystem === "English" ? field.defaultValueEnglish :
                displayUnitSystem === "Metric" ? field.defaultValueMetric : field.defaultValue)
            : preferencePayloadData[field.fieldName] || field.defaultValue
        }
    }
    const getOptions = (field, displayUnitSystem) => {
        return Array.isArray(field.dimensionName) ? field.dimensionName.flatMap(dimension => {
            return uom.hasOwnProperty(dimension) ? [
                ...(field.type === "select" ? [{ label: "No Default", value: "noDefault" }] : []),
                ...uom[dimension].map(unit => (
                    (unit.SystemUnit === displayUnitSystem || displayUnitSystem ==="All") ? {
                        value: unit.UnitKey,
                        label: unit.UnitName
                    } : null
                )).filter(unit => unit !== null)
            ] : field.options;
        }) : field.options;
    }
    return { addOptions, updateOptions };
}
export default usePreferenceAddUomOptions