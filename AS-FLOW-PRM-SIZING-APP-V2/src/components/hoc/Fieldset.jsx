import { useSelector } from "react-redux";
import FormFields from "../compoundComponents/FormFields";

const Fieldset = ({
  legend,
  fields = [],
  formProps: { handleChange, handleBlur, handleFocusedFieldName, focusedFieldName },
}) => {
  const { selectedFields, error } = useSelector((state) => state.workflow);
  const { payloadData } = useSelector((state) => state.workflowPayload);
  return (
    <fieldset style={{ borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
      {legend && <legend style={{fontWeight:"bold"}}>{legend}</legend>}
      <FormFields
        fields={fields}
        selectedFields={selectedFields}
        selectedData={payloadData}
        error={error}
        focusedFieldName={focusedFieldName}
        handleChange={handleChange}
        handleBlur={handleBlur}
        handleFocusedFieldName={handleFocusedFieldName}
      />
    </fieldset>
  );
};

export default Fieldset;
