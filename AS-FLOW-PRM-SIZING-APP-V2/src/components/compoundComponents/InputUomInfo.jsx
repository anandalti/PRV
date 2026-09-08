import DropDown from "../basicComponents/DropDown";
import Input from "../basicComponents/Input";
import InputDropDownCombo from "../basicComponents/InputDropDownCombo";
import TextDisplay from "../basicComponents/TextDisplay";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ToolTip from "../basicComponents/ToolTip";
import FormFieldsInputRow from "../hoc/FormFieldsInputRow";
import FormFieldsLabel from "../hoc/FormFieldsLabel";
import FormFieldsInput from "../hoc/FormFieldsInput";

const InputUomInfo = (props) => {
  // console.log(' >>>>>>>>> ',props?.value)

  return (
    <>
      <FormFieldsInputRow>
        <FormFieldsLabel>
          <div className="grid-inputuom-item-end">
            <div style={{ marginTop: "0.5rem", marginRight: "0.5rem" }}>
              <ToolTip infoText={props?.iconInfoText}>
                <InfoOutlinedIcon color="primary" />
              </ToolTip>
            </div>
            <ToolTip infoText={props?.infoText}>
              <TextDisplay text={props.label} />
            </ToolTip>
          </div>
        </FormFieldsLabel>
        <FormFieldsInput inputType="uom">
          <InputDropDownCombo {...props} width="100%" />
        </FormFieldsInput>
      </FormFieldsInputRow>
      {/* <div className="grid-inputuom-container">
        <div className="inputuom-container">
          <div className="grid-inputuom-item-end">
            <div style={{ marginTop: "0.5rem", marginRight: "0.5rem" }}>
              <ToolTip infoText={props?.iconInfoText}>
                <InfoOutlinedIcon color="primary" />
              </ToolTip>
            </div>
            <ToolTip infoText={props?.infoText}>
              <TextDisplay text={props.label} />
            </ToolTip>
          </div>
          <InputDropDownCombo {...props} width="8rem" />
        </div>
      </div> */}
    </>
  );
};

InputUomInfo.propTypes = {
  ...ToolTip.propTypes,
  ...TextDisplay.propTypes,
  ...Input.propTypes,
  ...DropDown.propTypes,
};

export default InputUomInfo;
