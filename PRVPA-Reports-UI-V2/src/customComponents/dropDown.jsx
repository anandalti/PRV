import React from 'react';
import { Form } from 'react-bootstrap';

const DropDown = ({ label, options, value, onChange, defaultValue }) => {
    return (
        <Form.Group style={{ display: 'flex', alignItems: 'center' }}>
            <Form.Label>{label}</Form.Label>
            <Form.Select value={value} onChange={onChange}>
                <option value="">{defaultValue}</option> {/* Default option */}
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </Form.Select>
            
        </Form.Group>
    );
};

export default DropDown;
