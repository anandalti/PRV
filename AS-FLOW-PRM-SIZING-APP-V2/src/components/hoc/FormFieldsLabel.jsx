import React from "react";

const FormFieldsLabel = ({ children, radio = false }) => {
  const labelClass = radio ? "formfields-input-label-radio" : "formfields-input-label";
  return <div className={labelClass}>{children}</div>;
};

export default FormFieldsLabel;
