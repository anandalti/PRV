
import SingleInputDropdown from "./SingleInputDropdown";

const MultiInputDropdownCombo = (props) => {
  
    // console.log('MultiInputDropdownCombo >>>>>>>>>>>>>>>> ',props);
  return (
    <>
        <div className="grid-inputuom-item">
            <div className="inputdoubleuom-container">
                {props?.fieldName?.map((fieldName,index) => {
                    // const localDisabled=typeof props?.disabled==='object'?props?.disabled[fieldName]:props?.disabled?props?.disabled:props?.disabledFields[fieldName]===true?props?.selectedValue===props?.fieldGroup ?false: props?.disabledFields[fieldName]:props?.selectedValue!==props?.fieldGroup;
                    // const localMandatory=props?.mandatory[fieldName]===false?props?.selectedValue===props?.fieldGroup ?true: props?.mandatory[fieldName]:props?.selectedValue===props?.fieldGroup;
                     const localDisabled=props?.selectedValue===props?.fieldGroup? typeof props?.disabled==='object'?props?.disabled[fieldName]:props?.disabled?props?.disabled:props?.disabledFields[fieldName]:props?.selectedValue!==props?.fieldGroup;
                    const localMandatory=typeof props?.mandatory==='object'?props?.mandatory[fieldName]:props?.mandatory?props?.mandatory:false;
                    // console.log('In useUnitConverter :: MultiInputDropdownCombo >>>>>>>>>>>>>>>> ',fieldName,props?.selectedValue,props?.fieldGroup,props?.mandatory[fieldName],localDisabled,localMandatory)
                    return <div key={`${fieldName}`} className={`grid-item-left-${index}`}
                    >
                        <SingleInputDropdown {...props} fieldName={fieldName} 
                                    value={props?.value[fieldName]} 
                                    disabled={localDisabled}
                                    mandatory={localMandatory}
                                    dimensionName={props?.dimensionName} 
                                    uomValue={props?.uomValue[fieldName]}
                                    display={index===props?.fieldName?.length-1}
                                    />
                    </div>
                })}
            </div>
        </div>
        {/* <div className="grid-inputuom-item">
            <DropDown {...props} value={convertedUOM}
                fieldName={`${props?.fieldName}UOM`} 
                onChange={(item) => handleDDSelect(item)}
                width={props?.width}
                disabled={props?.disabled}
                />
        </div> */}
    </>
  )
}

export default MultiInputDropdownCombo