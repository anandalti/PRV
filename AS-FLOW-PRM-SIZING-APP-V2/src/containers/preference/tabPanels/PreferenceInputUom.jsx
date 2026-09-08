import DropDown from "../../../components/basicComponents/DropDown"
import Input from "../../../components/basicComponents/Input"
import InputDropDownCombo from "./InputDropDownCombo";
import TextDisplay from "../../../components/basicComponents/TextDisplay"

const InputUom = (props) => {
    
    return (
        <div className="grid-inputuom-container">
            <div className="inputuom-container">
                <div className="grid-inputuom-item-end">
                    <TextDisplay text={props.label}  infoText={props?.infoText}/>
                </div>
                <InputDropDownCombo {...props} width="8rem"/>
            </div>
        </div>
    )    
}

InputUom.propTypes = {
    ...TextDisplay.propTypes,
    ...Input.propTypes,
    ...DropDown.propTypes
}

export default InputUom;
