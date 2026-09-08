import DropDown from "./DropDown";
import TextDisplay from "./TextDisplay";
import FormFieldsInputRow from "../hoc/FormFieldsInputRow";
import FormFieldsLabel from "../hoc/FormFieldsLabel";
import FormFieldsInput from "../hoc/FormFieldsInput";
// import PropTypes from "prop-types";

const LabeledDropdown = (props) => {
  let disabled =
    typeof props?.disabled === "object" && props.disabled !== null
      ? props.disabled[Object.keys(props.disabled)[0]]
      : props.disabled;

  const handleChange = (item) => {
    // console.log('In LabeledDropdown handleChange >>>>>>>>>>> ', item);
    props?.onChange({...item,
        validatefield: props?.isValidationRequired && (props?.validateActionType=='both' || props?.validateActionType=='onChange') ? true : false,
        fieldId:props?.fieldId,
        sectionId:props?.sectionId,
        actionId:props?.actionId,
        isFieldActionRequired:props?.isFieldActionRequired,
    });
  };
  if (props?.smSelection) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexWrap: "wrap",
          justifyContent: "space-between",
          flexGrow: "1",
          margin: "1rem 0 ",
        }}
      >
        <div className="">
          <TextDisplay text={props?.label} sx={{fontWeight:"bold"}} />
        </div>
        <div className="">
          <DropDown
            {...props}
            onChange={(item) => handleChange(item)}
            width={props?.width}
            disabled={disabled}
          />
        </div>
      </div>
    );
  } else if (props?.results) {
    return (
      <div className="results-dropdown-container">
        <div className="">
          <TextDisplay text={props?.label} />
        </div>
        <div className="">
          <DropDown
            {...props}
            onChange={(item) => handleChange(item)}
            width={props?.width}
            disabled={disabled}
          />
        </div>
      </div>
    );
  } else {
    return (
      <FormFieldsInputRow>
        <FormFieldsLabel>
          <TextDisplay text={props?.label} />
        </FormFieldsLabel>
        <FormFieldsInput>
          <DropDown
            {...props}
            onChange={(item) => handleChange(item)}
            width={props?.width}
            disabled={disabled}
          />
        </FormFieldsInput>
      </FormFieldsInputRow>
    );
  }
};

LabeledDropdown.propTypes = {
  ...TextDisplay.propTypes,
  ...DropDown.propTypes,
};

export default LabeledDropdown;
