import { useSelector } from "react-redux";
const usePreferencesTabPanel = (tabIndex) => {
    let globalItem = []
    let activeTabMenu = {}
    const { preferenceSections } = useSelector(state => state.preference);
    let selectedItem;
    const displayItems =(section)=> {
        let displayItem = section.fields.reduce((acc, field) => {
            if (field.fieldGroupType !== undefined) {
                const key = `${field.fieldGroupType}-${field.fieldGroupName}`;
                if (!acc[key]) {
                acc[key] = {
                    fieldName: field.fieldGroupName,
                    type: "radioInput",
                    defaultValue: field.defaultValue,
                    disabled: false,
                    visible: true,
                    infoText: "",
                    grid: "6",
                    fieldList: [],
                    fieldGroupType: field.fieldGroupType  
                };
                }
                acc[key].fieldList.push({
                ...field,
                value: field.fieldName,
                selectedValue: field.fieldName,
                inputValue: field.inputValue,
                inputLabel: field.label,                        
                });
            }else if (field.type === 'select') {
                acc[field.fieldName] = {
                    ...field,
                    value: field.defaultValue,
                };
            } else {
                acc[field.fieldName] = field;
            }
            return acc;
            }, {});
            return Object.values(displayItem);
    }
    if (preferenceSections.length) {
        const section = preferenceSections.find(section => section.id === tabIndex+1);
        const globalsection = preferenceSections.find(section => section.id ===  1);
        globalItem = displayItems(globalsection);
        let Items = displayItems(section);
        activeTabMenu = {
            heading: section.sectionLabel,
            items: Items,
            globalItem: globalItem,
        }
    }
    const {heading, items} = activeTabMenu;
    return {heading, items, globalItem, selectedItem};
}
export default usePreferencesTabPanel;