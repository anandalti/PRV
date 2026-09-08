import React from "react";

const FormFieldsInputRow = ({ children, style }) => {
  return (
    <div className="formfields-input-row" style={style}>
      {children}
    </div>
  );
};

export default FormFieldsInputRow;
