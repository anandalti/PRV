import React, { useState } from "react";
import PropTypes from "prop-types";
import { Form, Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";

const NumberedTextArea = ({
  fieldName,
  value = "",
  label = "Label",
  isNumbered = false,
  className = "",
  style = {},
  rows = 5,
  placeholder = "",
  onChange,
  onBlur,
  mandatory,
  onchangevalidation,
  infoText = "",
}) => {
  const [notes, setNotes] = useState(value.split("\n"));

  const handleTextAreaChange = (e) => {
    const inputValue = e.target.value;

    const updatedNotes = inputValue
      .split("\n")
      .filter((note) => !/^\d+\.\s*$/.test(note)) // Filter out blank numbered lines
      .map((note, index) => {
        if (isNumbered) {
          const trimmedNote = note.replace(/^\d+\.\s*/, ""); // Remove existing numbering
          return `${index + 1}. ${trimmedNote}`;
        }
        return note;
      });

    setNotes(updatedNotes);

    onChange?.(e);
  };

  const handleTextAreaBlur = () => {
    onBlur?.({
      name: fieldName,
      value: notes.join("\n"),
      mandatory,
    });
  };

  const renderTooltip = (props) => (
    <Tooltip id={`tooltip-${fieldName}`} {...props}>
      {infoText}
    </Tooltip>
  );

  return (
    <Form.Group as={Row} style={{ marginBottom: "10px", ...style }}>
      <Col sm={12}>
        <OverlayTrigger placement="top" overlay={renderTooltip}>
          <Form.Label htmlFor={fieldName}>{label}</Form.Label>
        </OverlayTrigger>
      </Col>
      <Col sm={12}>
        <Form.Control
          as="textarea"
          id={fieldName}
          name={fieldName}
          value={notes.join("\n")}
          onChange={handleTextAreaChange}
          onBlur={handleTextAreaBlur}
          rows={rows}
          className={className}
          placeholder={placeholder}
          style={{ whiteSpace: "pre" }}
        />
      </Col>
    </Form.Group>
  );
};

NumberedTextArea.propTypes = {
  fieldName: PropTypes.string,
  value: PropTypes.string,
  label: PropTypes.string,
  isNumbered: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  rows: PropTypes.number,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  mandatory: PropTypes.bool,
  onchangevalidation: PropTypes.bool,
  infoText: PropTypes.string,
};

export default NumberedTextArea;