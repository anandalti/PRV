import React, { useMemo } from 'react';
import ExpandableCell from '../components/basicComponents/ExpandableCell';
import TextCell from '../components/basicComponents/TextCell';

export const useConfigurationColumns = (dynamicColumns, tableData, toggleTag) => {
    const layoutColumns = useMemo(() => [
        {
            name: "tagName",
            label: "Tag Name",
            options: {
                setCellProps: () => ({ style: { width: '180px', minWidth: '180px' } }),
                customBodyRender: (value, tableMeta) => {
                    const rowData = tableData[tableMeta.rowIndex];
                    if (!rowData || !rowData.isParent) return null;
                    return React.createElement(TextCell, { value: value });
                }
            }
        },
        {
            name: "model",
            label: "Model",
            options: {
                sort: false,
                setCellProps: () => ({ style: { width: '180px', minWidth: '180px' } }),
                customBodyRender: (value, tableMeta) => {
                    const rowData = tableData[tableMeta.rowIndex];
                    if (!rowData || !rowData.isParent) return null;

                    return React.createElement(ExpandableCell, {
                        value: value,
                        isExpanded: rowData.isExpanded,
                        onToggle: () => toggleTag(rowData.tagId),
                        canExpand: rowData.canExpand !== false
                    });
                }
            }
        }
    ], [tableData, toggleTag]);

    const finalColumns = useMemo(() => {
        if (!dynamicColumns || dynamicColumns.length === 0) return layoutColumns;

        const dataCols = dynamicColumns
            .filter(col => col.name !== 'tagName' && col.name !== 'model')
            .map(col => ({
                name: col.name,
                label: col.label,
                options: {
                    sort: false,
                    customBodyRender: (value, tableMeta) => {
                        const rowData = tableData[tableMeta.rowIndex];
                        if (rowData && rowData.isParent) return null; // Only show data on child rows
                        
                        return value !== null && value !== undefined ? String(value) : '';
                    }
                }
            }));

        return [...layoutColumns, ...dataCols];
    }, [layoutColumns, dynamicColumns, tableData]);

    return finalColumns;
};
