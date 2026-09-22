import ProjectPropertiesTab from "./ProjectPropertiesTab";
import ReportTypes from "./ReportType";
import TagPropertiesTab from "./TagPropertiesTab";
import ValveCalculationTab from "./ValveCalculationTab";
import RevisionsTab from "./RevisionsTab"
import TagNotesTab from "./TagNotesTab";

export const TabPanel = ({ selectedMenu }) => {
    return (
        <>
            {selectedMenu?.id === 1 && <ProjectPropertiesTab />}
            {selectedMenu?.id === 2 && <TagPropertiesTab />}
            {selectedMenu?.id === 3 && <TagNotesTab />}
            {selectedMenu?.id === 4 && <RevisionsTab />}
            {selectedMenu?.id === 5 && <ValveCalculationTab />}
            {selectedMenu?.id === 6 && <ReportTypes />}
        </>
    )
}

