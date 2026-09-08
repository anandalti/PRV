import React, { useMemo } from 'react';
import ExpandableCell from '../../importTool/components/basicComponents/ExpandableCell';

export const useAvailabilityColumns = (tableData, toggleNode) => {
    return useMemo(() => [
        {
            name: "level",
            label: "Level",
            options: {
                setCellProps: () => ({ style: { width: '80px', minWidth: '80px' } }),
                customBodyRender: (value, tableMeta) => {
                    const rowData = tableData[tableMeta.rowIndex];
                    const indent = rowData.level * 20;
                    
                    if (rowData.isParent) {
                        return (
                            <div style={{ paddingLeft: `${indent}px` }}>
                                <ExpandableCell 
                                    value={value + 1} 
                                    isExpanded={rowData.isExpanded} 
                                    onToggle={() => toggleNode(rowData.id)} 
                                />
                            </div>
                        );
                    }
                    
                    return (
                        <div style={{ paddingLeft: `${indent + 22}px`, fontSize: '11px', fontWeight: 600 }}>
                            {value + 1}
                        </div>
                    );
                }
            }
        },
        {
            name: "itemIdentifier",
            label: "Item",
            options: {
                setCellProps: () => ({ style: { width: '60px', minWidth: '60px' } }),
            }
        },
        {
            name: "materialNumber",
            label: "Material",
            options: {
                setCellProps: () => ({ style: { width: '120px', minWidth: '120px' } }),
            }
        },
        {
            name: "description",
            label: "Description",
            options: {
                setCellProps: () => ({ style: { minWidth: '250px' } }),
            }
        },
        {
            name: "basicMaterial",
            label: "Basic Material",
            options: {
                setCellProps: () => ({ style: { width: '150px', minWidth: '150px' } }),
            }
        },
        {
            name: "isAssembly",
            label: "Assembly?",
            options: {
                setCellProps: () => ({ style: { width: '80px', minWidth: '80px' } }),
            }
        },
        {
            name: "requiredQty",
            label: "Rqd. Qty.",
            options: {
                setCellProps: () => ({ style: { width: '80px', minWidth: '80px' } }),
            }
        },
        {
            name: "uom",
            label: "UOM",
            options: {
                setCellProps: () => ({ style: { width: '60px', minWidth: '60px' } }),
            }
        },
        {
            name: "atpQty",
            label: "ATP Qty",
            options: {
                setCellProps: () => ({ style: { width: '80px', minWidth: '80px' } }),
            }
        },
        {
            name: "isMissing",
            label: "Missing",
            options: {
                setCellProps: () => ({ style: { width: '60px', minWidth: '60px' } }),
                customBodyRender: (value) => value ? 'X' : '-'
            }
        },
        {
            name: "availability",
            label: "Availability",
            options: {
                setCellProps: () => ({ style: { width: '100px', minWidth: '100px' } }),
                customBodyRender: (value) => value || '-'
            }
        },
        {
            name: "weeks",
            label: "Weeks",
            options: {
                setCellProps: () => ({ style: { width: '80px', minWidth: '80px' } }),
                customBodyRender: (value) => value || '-'
            }
        }
    ], [tableData, toggleNode]);
};
