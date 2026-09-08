import React from 'react';

const ExpandableCell = ({ value, isExpanded, onToggle, canExpand = true }) => (
    <div 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: canExpand ? 'pointer' : 'default' }}
        onClick={(e) => {
            e.stopPropagation();
            if (canExpand) onToggle();
        }}
    >
        {canExpand && (
            <div
                title={isExpanded ? 'Collapse' : 'Expand'}
                style={{
                    width: '14px',
                    height: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #718096',
                    background: '#fff',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: 0,
                    lineHeight: '1',
                    flexShrink: 0
                }}
            >
                {isExpanded ? '-' : '+'}
            </div>
        )}
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#2d3748' }}>{value}</span>
    </div>
);

export default ExpandableCell;
