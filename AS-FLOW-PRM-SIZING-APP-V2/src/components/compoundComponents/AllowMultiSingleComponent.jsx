import useConfigurationPanel from "../../hooks/useConfigurationPanel";
import AllowMultipleSelectionComponent from "./AllowMultipleSelectionComponent";
import AllowSingleSelectionComponent from "./AllowSingleSelectionComponent";

const AllowMultiSingleComponent = ({SectionData}) => {
  const {updateConfigSelectedData}=useConfigurationPanel();
  return (
    <>
        {
            SectionData?.Visible && SectionData?.IsAccessory && SectionData?.SectionOrder<=0 
            ?
            SectionData?.AllowMultiple?
            <AllowMultipleSelectionComponent SectionData={SectionData} updateAccessoriesSelectedData={updateConfigSelectedData}/>
            :<AllowSingleSelectionComponent SectionData={SectionData} updateAccessoriesSelectedData={updateConfigSelectedData}/>
            :null
        }
    </>
  )
}

export default AllowMultiSingleComponent