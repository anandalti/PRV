import React, { useMemo } from 'react';
import StatusBadge from '../components/basicComponents/StatusBadge';
import EditableColumn from '../components/basicComponents/EditableColumn';
import TextCell from '../components/basicComponents/TextCell';

const formatDate = iso =>
    iso ? new Date(iso).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '';

export const useTagDetailsColumns = (baseColumns, tableRows, onTagNumberChange, localChanges = {}) => {
    return useMemo(() => {
        if (!baseColumns || baseColumns.length === 0) return [];

        return baseColumns.map(col => {
            const { name, label } = col;

            // 1. Tag Number (Editable Input)
            if (name === 'TagNumber' || name === 'tagNumber') {
                return {
                    name,
                    label,
                    options: {
                        customBodyRender: (value, tableMeta) => {
                            const rowData = tableRows[tableMeta.rowIndex];
                            if (!rowData) return value;
                            const id = rowData.TagId || rowData.tagId || rowData.id;
                            const currentVal = localChanges[id] !== undefined ? localChanges[id] : value;
                            return React.createElement(EditableColumn, {
                                value: currentVal || '',
                                isError: currentVal === '',
                                onChange: (newValue) => onTagNumberChange(id, newValue)
                            });
                        }
                    }
                };
            }

            // 2. Status (Badge)
            if (name === 'Status' || name === 'status') {
                return {
                    name,
                    label,
                    options: {
                        customBodyRender: (value) => React.createElement(StatusBadge, { status: value })
                    }
                };
            }

            // 3. Tag Name (Highlight if changed)
            if (name === 'Prv2SizeTagName' || name === 'tagName') {
                return {
                    name,
                    label,
                    options: {
                        customBodyRender: (value, tableMeta) => {
                            const rowData = tableRows[tableMeta.rowIndex];
                            if (!rowData) return value;
                            const id = rowData.TagId || rowData.tagId || rowData.id;
                            const isChanged = localChanges[id] !== undefined && localChanges[id] !== rowData.TagNumber;
                            
                            return React.createElement(TextCell, { 
                                value: value,
                                style: isChanged ? { color: '#c53030', fontWeight: 700 } : {}
                            });
                        }
                    }
                };
            }

            // 4. Fallback (Text with Date Formatting)
            return {
                name,
                label,
                options: {
                    customBodyRender: (value) => {
                        if (typeof value === 'string' && value.includes('T') && !isNaN(Date.parse(value))) {
                            return formatDate(value);
                        }
                        return React.createElement(TextCell, { value: value });
                    }
                }
            };
        });
    }, [baseColumns, tableRows, onTagNumberChange, localChanges]);
};
