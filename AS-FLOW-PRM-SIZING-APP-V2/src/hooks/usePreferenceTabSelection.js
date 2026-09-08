import { useSelector } from "react-redux";

const usePreferenceTabSelection = () => {
    const { preferenceSections, selectedPreferences, error } = useSelector(state => state.preference);
    const { units } = useSelector(state => state.uom);
    const { preferences } = useSelector(state => state.auth);
    const tabValues = {};

    preferenceSections.forEach(element => {
        const localArray = element.fields.map(field => {
            const fieldName = field.type === 'inputUom' ? field.UomFieldName : field.fieldName;
            const currentUOMField = selectedPreferences.find(selectedField => selectedField.name === fieldName) || {};
            const currentField = selectedPreferences.find(selectedField => selectedField.name === field.fieldName) || {};
            const defaultValue = currentField.value
            let unitLabel = '';
            if (Array.isArray(field.dimensionName) && field.dimensionName.length) {
                const unitName = currentUOMField.value || preferences[fieldName];
                const unit = field.dimensionName.flatMap(dimensionName => units[dimensionName] || [])
                    .find(unit => unit.UnitKey === unitName);
                if (unit) unitLabel = unit.UnitName;
            }

            const value = field.type === 'checkbox' ? (defaultValue ? 'Y' : 'N') :
                          field.type === 'inputUom' ? `${defaultValue} ${unitLabel}` :
                          unitLabel || defaultValue;
            const errorExist = error?.find(err => err.name === field.fieldName);
            return { name: field.label, value, mandatory: field.mandatory, isError: errorExist ?true:false};
        });

        tabValues[element.displayOrder] = localArray;
    });

    return { tabValues };
}

export default usePreferenceTabSelection;