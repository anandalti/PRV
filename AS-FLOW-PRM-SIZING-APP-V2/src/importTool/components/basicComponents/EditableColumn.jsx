import React from 'react';

/**
 * Simplified editable column component for direct input.
 * Shows a persistent input field and highlights changes in lite red.
 */
const EditableColumn = ({ value, isError, onChange }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%', maxWidth: '140px' }}>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    padding: '4px 8px',
                    border: `1px solid ${isError ? '#c53030' : '#cbd5e0'}`,
                    borderRadius: '2px',
                    fontSize: '11px',
                    width: '100%',
                    backgroundColor: isError ? '#fff5f5' : '#fff',
                    color: 'inherit',
                    transition: 'all 0.2s ease',
                    outline: isError ? 'none' : undefined
                }}
            />
        </div>
    );
};

export default EditableColumn;
