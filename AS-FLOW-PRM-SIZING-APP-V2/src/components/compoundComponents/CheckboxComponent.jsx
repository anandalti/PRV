import Checkbox from "../basicComponents/Checkbox";
import FormFieldsInput from "../hoc/FormFieldsInput";
import FormFieldsInputRow from "../hoc/FormFieldsInputRow";
import FormFieldsLabel from "../hoc/FormFieldsLabel";

const CheckboxComponent = (props) => {
  return (
    <FormFieldsInputRow>
      <FormFieldsLabel />
      <FormFieldsInput inputType={props?.fieldName?.length > 1 ? "checkbox" : ""}>
        {props?.fieldName?.length >= 1 && props?.fieldName?.map((fieldName, index) => {
          let value = typeof props?.value === "object" ? props?.value[fieldName] : props?.value;
          return <Checkbox {...props} fieldName={fieldName} label={props?.label[index]} value={value} />;
        })}
      </FormFieldsInput>
    </FormFieldsInputRow>
  );
};

export default CheckboxComponent;
