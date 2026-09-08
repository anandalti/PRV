import usepreferenceUnitConvertor from "../../../hooks/usepreferenceUnitConvertor";
import DropDown from "../../../components/basicComponents/DropDown";
import Input from "../../../components/basicComponents/Input";


const InputDropDownCombo = (props) => {
    console.log({props});
    //const { value: convertedValue, uom:convertedUOM, setUom, setValue } = usepreferenceUnitConvertor(props?.value,props?.fieldName, props?.dimensionName,props?.uomValue,props?.options, props?.UomFieldName);
    const handleInputChange = (item) => {
        //setValue(item.value);
        props.onChange(item)
    }
    const handleDDSelect = (item) => {
        // console.log('InputUom::handleDDSelect >>>> ', item);
       // setUom(item.value);
        props.onChange({name:item.name,value:item.value})
    }
    // console.log('In InputDropDownCombo:: >>>>>>>>> ',props?.value,props?.fieldName, props?.dimensionName,props?.uomValue,convertedValue,convertedUOM,props?.options)
  return (
    <>
        <div className="grid-inputuom-item">
            <Input {...props} type="number" value={props.value} 
                onChange={( item) => handleInputChange(item)}
            />
        </div>
        <div className="grid-inputuom-item"> 
            <DropDown {...props} value={props.uomValue}
                    fieldName={props?.UomFieldName} 
                    onChange={(item) => handleDDSelect({name:props?.UomFieldName, value:item.value})}
                    width={props?.width}
                    />
        </div>
    </>
  )
}

export default InputDropDownCombo