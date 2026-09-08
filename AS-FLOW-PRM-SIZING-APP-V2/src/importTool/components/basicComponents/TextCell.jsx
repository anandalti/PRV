import React from 'react';

const TextCell = ({ value, fontWeight = 600, fontSize = '11px', color = 'inherit', style = {} }) => (
    <span style={{ fontWeight, fontSize, color, ...style }}>
        {value}
    </span>
);

export default TextCell;
