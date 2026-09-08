import { useSelector } from "react-redux";
import usePreferencesTabPanel from "../../../hooks/usePreferencesTabPanel";
import PreferenceBottomNavigation from "../navigation/PreferenceBottomNavigation";
import PreferenceFormFields from "./PreferenceFormFields";
import { useEffect, useState } from "react";
import usePreferenceFormFields from "../../../hooks/usePreferenceFormFields";
const PreferenceTabPanel = () => {
    const { activePreferenceMenu } = useSelector(state => state.preference);
    const { selectedPreferences } = useSelector(state => state.preference);
    const { heading, items, globalItem } = usePreferencesTabPanel(activePreferenceMenu);
    const { createFields } = usePreferenceFormFields();
    const formGlobalfields = createFields(globalItem)
    const formFields = createFields(items)
    return (
        <>
            <h2 className="menu_header">{ }</h2>
            {
                <PreferenceFormFields fields={formGlobalfields} selectedFields={selectedPreferences} />
            }
            <h2 className="menu_header">{heading}</h2>
            {
                <PreferenceFormFields fields={formFields} selectedFields={selectedPreferences} />
            }
            <PreferenceBottomNavigation />
        </>
    )
}

export default PreferenceTabPanel;