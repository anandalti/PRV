import React from "react";

const FormFieldsInput = ({ children, inputType = "default" }) => {
  const inputClass =
    inputType === "default" ? "formfields-input-control" : `formfields-input-control-${inputType}`;
  return <div className={inputClass}>{children}</div>;
};

export default FormFieldsInput;
