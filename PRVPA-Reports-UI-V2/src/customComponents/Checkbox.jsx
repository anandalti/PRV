import { Form, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';

const CheckboxField = ({ label, infoText, checked, onChange, grid, disabled }) => {
    const renderTooltip = (props) => (
        <Tooltip id={`tooltip-${label}`} {...props}>
            {infoText}
        </Tooltip>
    );

    return (
        <Form.Group as={Row} style={{ marginBottom: '10px' }}>
            <Col sm={4} style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
                <OverlayTrigger placement="top" overlay={renderTooltip}>
                    <Form.Check
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={onChange}
                        label={label}
                        style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    />
                </OverlayTrigger>
            </Col>
        </Form.Group>
    );
};

export default CheckboxField;
