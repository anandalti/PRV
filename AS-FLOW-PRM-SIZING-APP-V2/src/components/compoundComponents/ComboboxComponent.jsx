import Combobox from "../basicComponents/Combobox";
import FormFieldsInput from "../hoc/FormFieldsInput";
import FormFieldsInputRow from "../hoc/FormFieldsInputRow";
import FormFieldsLabel from "../hoc/FormFieldsLabel";

// Helper function to determine the class name
const getClassName = (props, mandatory) => {
  const { error, popupFields, fieldName } = props;

  let baseClass = "input-field";

  if (error?.length > 0) {
    if (error.find((err) => err?.value?.error?.type === "error")) {
      baseClass = popupFields ? "input-field-popup-error" : "input-field-error";
    } else if (error.find((err) => err?.value?.error?.type === "warning")) {
      baseClass = popupFields ? "input-field-popup-warning" : "input-field-warning";
    } else {
      baseClass = popupFields ? "input-field-popup" : "input-field";
    }
  } else if (mandatory) {
    baseClass = popupFields ? "input-field-popup-mandatory" : "input-field-mandatory";
  } else {
    baseClass = popupFields ? "input-field-popup" : "input-field";
  }

  return fieldName?.length > 1 ? `${baseClass}-multi` : baseClass;
};

const ComboboxComponent = (props) => {
  const {
    fieldName,
    label,
    value: propValue,
    mandatory: propMandatory,
    disabled: propDisabled,
    ...restProps
  } = props;

  if (!fieldName || fieldName.length === 0) return null;

  return (
    <FormFieldsInputRow>
      <FormFieldsLabel>
        <label htmlFor={`combobox-${fieldName}`}>{label}</label>
      </FormFieldsLabel>
      <FormFieldsInput inputType={fieldName.length > 1 ? "multi" : "default"}>
        {fieldName?.map((name, index) => {
          const value = typeof propValue === "object" ? propValue[name] : propValue;
          const mandatory = typeof propMandatory === "object" ? propMandatory[name] : propMandatory;
          const disabled = typeof propDisabled === "object" ? propDisabled[name] : propDisabled;
          const className = getClassName(props, mandatory);

          return (
            <Combobox
              key={index}
              {...restProps}
              fieldName={name}
              value={value}
              className={className}
              disabled={disabled}
              style={{ width: "100%" }}
            />
          );
        })}
      </FormFieldsInput>
    </FormFieldsInputRow>
  );
};

export default ComboboxComponent;



// import Combobox from "../basicComponents/Combobox";
// import FormFieldsInput from "../hoc/FormFieldsInput";
// import FormFieldsInputRow from "../hoc/FormFieldsInputRow";
// import FormFieldsLabel from "../hoc/FormFieldsLabel";

// const ComboboxComponent = (props) => {
//   return (
//     <FormFieldsInputRow>
//       <FormFieldsLabel>
//         <label htmlFor={`combobox-${props?.fieldName}`}>{props?.label}</label>
//       </FormFieldsLabel>
//       <FormFieldsInput inputType={props?.fieldName?.length > 1 ? "multi" : "default"}>
//         {props?.fieldName!=="" && props?.fieldName !==null && props?.fieldName?.length > 0 && props?.fieldName?.map((fieldName, index) => {
//           let value = typeof props?.value === "object" ? props?.value[fieldName] : props?.value;
//           let mandatory =
//             typeof props?.mandatory === "object" ? props?.mandatory[fieldName] : props?.mandatory;
//           let disabled = typeof props?.disabled === "object" ? props?.disabled[fieldName] : props?.disabled;
//           let localclassName=props?.error!==undefined && props?.error!==null && props?.error?.length>0?
//                               props?.error?.find(err => err?.value?.error?.type === 'error')?props?.popupFields===true?"input-field-popup-error":"input-field-error"
//                               :props?.error?.find(err => err?.value?.error?.type === 'warning')?props?.popupFields===true?"input-field-popup-warning":"input-field-warning":props?.popupFields===true?"input-field-popup":"input-field"
//                             :mandatory?props?.popupFields===true?"input-field-popup-mandatory":"input-field-mandatory":props?.popupFields===true?"input-field-popup":"input-field"
//           localclassName = props?.fieldName?.length > 1 ? `${localclassName}-multi` : localclassName;
//           return (
//             <Combobox
//               key={index}
//               {...props}
//               fieldName={fieldName}
//               value={value}
//               className={localclassName}
//               disabled={disabled}
//               // style={props?.grid === 3 ? { width: "11rem" } : {}}
//               style={{ width: "100%" }}
//             />
//           );
//         })}
//       </FormFieldsInput>
//     </FormFieldsInputRow>
//   );
// };

// export default ComboboxComponent;
