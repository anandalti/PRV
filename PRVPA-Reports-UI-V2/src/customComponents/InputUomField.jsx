import { Form, Col, Row, OverlayTrigger, Tooltip } from 'react-bootstrap';
const InputUomField = ({ label, infoText, uomOptions, defaultValue, onChange, onBlur, onUomChange, isReadOnly, selectedUom, disabled }) => {
    const renderTooltip = (props) => (
        <Tooltip id="tooltip" {...props}>
            {infoText}
        </Tooltip>
    );

    return (
        <Form.Group as={Row} style={{ marginBottom: '15px' }}>
            <Col sm={4} style={{ textAlign: 'right', textWrap: 'nowrap' }}>
                <OverlayTrigger placement="top" overlay={renderTooltip}>
                    <Form.Label>{label}</Form.Label>
                </OverlayTrigger>
            </Col>
            <Col sm={5}>
                <Form.Control
                    type="number"
                    value={defaultValue}
                    disabled={disabled}
                    onChange={onChange}
                    onBlur={onBlur}
                    readOnly={isReadOnly}
                />
            </Col>
            <Col sm={3}>
                <Form.Select value={selectedUom} onChange={onUomChange}  >
                    {uomOptions.map((uom, index) => (
                        <option key={index} value={uom}>{uom}</option>
                    ))}
                </Form.Select>
            </Col>
        </Form.Group>
    );
};

export default InputUomField;

