import Checkbox from "../basicComponents/Checkbox"

const AllowMultipleSelectionComponent = ({SectionData,updateAccessoriesSelectedData}) => {

    // const updateAccessoriesSelectedData = (item) => {
    //     console.log(item)
    // }
  return (
    
    <fieldset className="accessories_item">
        <legend>{SectionData?.Name}</legend>
        {
            SectionData?.SectionChoices?.map((choice, index) => (
                <div key={`AllowMultipleSelectionComponentSectionChoices${index}`} style={{marginLeft:"1.5rem"}}>
                    
                    <Checkbox
                        fontSize={12}
                        fieldName={SectionData?.Name}
                        label={choice.label}
                        value={choice?.isSelected}
                        disabled={false}
                        onChange={updateAccessoriesSelectedData}
                    />
                </div>
            ))
        }
    </fieldset>
   
  )
}

export default AllowMultipleSelectionComponent