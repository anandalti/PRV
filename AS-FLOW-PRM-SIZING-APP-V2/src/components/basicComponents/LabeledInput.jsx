import PropTypes from "prop-types";
import TextDisplay from "./TextDisplay";
import Input from "./Input";
import { validateNaN } from "../../utils/utility";
import FormFieldsInputRow from "../hoc/FormFieldsInputRow";
import FormFieldsLabel from "../hoc/FormFieldsLabel";
import FormFieldsInput from "../hoc/FormFieldsInput";

const LabeledInput = (props) => {
  // console.log('LabelInput >> props >>>>>>>>> ',props)
  // console.log("In LabeledInput >>>>>>>>. ", props);
  return (
    <>
      <FormFieldsInputRow style={props.style}>
        <FormFieldsLabel>
          <TextDisplay text={props?.label} {...props} />
        </FormFieldsLabel>
        <FormFieldsInput
          inputType={
            typeof props?.fieldName === "object" && props?.fieldName?.length > 1 ? "multi" : "default"
          }
        >
          {Array.isArray(props?.fieldName) ? (
            props?.fieldName?.map((fieldName, index) => {
              let error;
              if (props?.error !== null && props?.error !== undefined) {
                if (Array.isArray(props?.error) && props?.error.length > 0) {
                  error = props?.error?.filter((item) => item.name === fieldName);
                  if (error?.length === 0) {
                    error = null;
                  }
                } else if (typeof props?.error === "object") {
                  error = props?.error[fieldName];
                }
              }
              // console.log('In LabeledInput:: error >>>>>>. ',fieldName,error)
              let value = typeof props?.value === "object" ? props?.value[fieldName] : props?.value;
              let mandatory =
                typeof props?.mandatory === "object" ? props?.mandatory[fieldName] : props?.mandatory;
              let disabled =
                typeof props?.disabled === "object" ? props?.disabled[fieldName] : props?.disabled;

              //let localclassName=error!==undefined && error!==null?"input-field-error":mandatory?"input-field-mandatory":"input-field"
              let localclassName =
                error !== undefined
                  ? error?.[0]?.value?.error?.type === "error"
                    ? "input-field-error"
                    : error?.[0]?.value?.error?.type === "warning"
                    ? "input-field-warning"
                    : "input-field"
                  : mandatory
                  ? "input-field-mandatory"
                  : "input-field";

              localclassName = props?.fieldName?.length > 1 ? `${localclassName}-multi` : localclassName;
              // console.log('In LabeledInput >>>>>>. ',fieldName,value,props?.value,mandatory,disabled,localclassName)
              //props?.fieldName?.length>1?{width:"70%"}:{}
              return (
                <>
                  {" "}
                  <Input
                    key={index}
                    {...props}
                    fieldName={fieldName}
                    value={value}
                    className={localclassName}
                    type={props?.type === "inputUom" ? "number" : props?.type}
                    mandatory={mandatory}
                    disabled={disabled}
                    displayValue={props?.type === "number" ? validateNaN(value, fieldName) : value}
                    style={props?.grid === 3 ? { width: "87%" } : props?.grid == 5 ? { width: "73%" } : {}}
                  />
                  {/* <CopyButton/> */}
                </>
              );
            })
          ) : (
            <Input
              {...props}
              type={props?.type === "inputUom" ? "number" : props?.type}
              fieldName={props?.fieldName}
              value={props?.value}
              displayValue={
                props?.type === "number" ? validateNaN(props?.value, props?.fieldName) : props?.value
              }
            />
          )}
        </FormFieldsInput>
      </FormFieldsInputRow>
    </>
  );
};

LabeledInput.propTypes = {
  grid: PropTypes.number,
  label: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool || PropTypes.object,
};

export default LabeledInput;
