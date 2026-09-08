import { useDispatch, useSelector } from 'react-redux';
import { updatePreferenceSections } from '../store/slices/preferenceSlice';
const usePreferenceGetOptions = () => {
    const dispatch = useDispatch();
    const { preferenceSections } = useSelector(state => state.preference);
    const { units } = useSelector(state => state.uom);
    const getOptions = (displayUnitSystem) => {
        if (preferenceSections.length) {
            let updatedPreference = preferenceSections.map(section => ({
                ...section, // Spread to copy section properties
                fields: section.fields.map(field => ({
                    ...field, // Spread to copy field properties
                    options: Array.isArray(field.dimensionName) ? [
                        ...(field.type === "select" && field.dimensionName.some(dimension => units.hasOwnProperty(dimension)) ? [{ label: "No Default", value: "noDefault" }] : []),
                        ...field.dimensionName.flatMap(dimension => {
                            return units.hasOwnProperty(dimension) ? units[dimension].map(unit => (
                                unit.SystemUnit === displayUnitSystem || displayUnitSystem === "All" ? {
                                    value: unit.UnitKey,
                                    label: unit.UnitName
                                } : null
                            )).filter(unit => unit !== null) : field.options;
                        })
                    ] : field.options
                }))
            }));
            dispatch(updatePreferenceSections(updatedPreference));
        }
    }
    return { getOptions }
};
export default usePreferenceGetOptions;