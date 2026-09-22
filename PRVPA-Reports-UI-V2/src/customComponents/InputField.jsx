
import { Form, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';

const InputField = ({ label, infoText, value, onChange, type, grid, disabled, regex, error }) => { 
    const renderTooltip = (props) => (
        <Tooltip id="tooltip" {...props}>
            {infoText}
        </Tooltip>
    );

    const handleKeyPress = (event) => {
        if (type === 'number' && regex !== 'NOT_ALLOW_NEGATIVE' && (event.key === '-' || event.key === '+' || event.key.toLowerCase() === 'e')) {
            event.preventDefault();
        }
    };
    
    const handleInput = (event) => {
        if (type === 'number') {
            event.target.value = Number(event.target.value);
            if (regex === 'NOT_ALLOW_NEGATIVE' && event.target.value <= 0) {
                event.target.value = 0;
            }
        }
    }

    return (
        <Form.Group as={Row} style={{ marginBottom: '10px' }}>
            <Col sm={4} style={{ textAlign: 'right', textWrap: 'nowrap' }}>
                <OverlayTrigger placement="top" overlay={renderTooltip}>
                    <Form.Label>{label}</Form.Label>
                </OverlayTrigger>
            </Col>
            <Col sm={6}>
                <Form.Control type={type} value={value} disabled={disabled} onChange={onChange} onKeyDown={handleKeyPress} onInput={handleInput} isInvalid={!!error} style={{width:'340px'}}/>
                {error && (
                    <div style={{ color: 'red', marginTop: '4px', fontSize: '0.9em' }}>{error}</div>
                )}
            </Col>
        </Form.Group>
    );
};

export default InputField;

