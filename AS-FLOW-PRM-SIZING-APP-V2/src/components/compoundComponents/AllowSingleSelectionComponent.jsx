import React, { useState } from 'react'
import Radio from '../basicComponents/Radio';

const AllowSingleSelectionComponent = ({SectionData}) => {

    const [selectedValue, setSelectedValue] = useState(null);
    const handleRadioChange = (fieldName,label) => {
        // console.log('In RadioLabel >>>>>>>>>>>> ',props)
        setSelectedValue(fieldName);
        // onChange({name: props?.fieldName, value: fieldName,label:label,type:props?.type});
    };

  return (
    <fieldset className="accessories_item">
        <legend>{SectionData?.Name}</legend>
        {
            SectionData?.SectionChoices?.map((choice, index) => (
                <div key={`AllowSingleSelectionComponentSectionChoices${index}`} >
                    <Radio
                            fontSize={12}
                            lastValueFlag={SectionData?.SectionChoices.length-1===index}
                            option={{fieldName:choice.fieldName,fieldGroupName:SectionData?.Name,value:choice.value,inputLabel:choice.label,grid:4}}
                            selectedValue={selectedValue}
                            handleRadioChange={handleRadioChange}
                        />
                    
                </div>
            ))
        }
    </fieldset>
  )
}

export default AllowSingleSelectionComponent