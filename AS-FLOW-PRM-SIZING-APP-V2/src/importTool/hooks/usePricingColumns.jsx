import React, { useMemo } from 'react';
import ExpandableCell from '../components/basicComponents/ExpandableCell';
import TextCell from '../components/basicComponents/TextCell';

const GREY_BORDER = '1px solid #cbd5e1';

const sectionCellStyle = {
    background: 'transparent',
    borderTop: GREY_BORDER,
    borderBottom: GREY_BORDER,
    paddingTop: 0,
    paddingBottom: 0,
    minHeight: 0,
    height: 6
};

export const usePricingColumns = (tableData, toggleTag) => {
    return useMemo(() => [
        {
            name: "tagName",
            label: "Tag Name",
            options: {
                setCellProps: (value, tableMeta) => {
                    const rowData = tableMeta?.rowIndex != null ? tableData[tableMeta.rowIndex] : undefined;
                    if (rowData?.isSection) {
                        return {
                            style: {
                                width: '150px',
                                minWidth: '150px',
                                padding: '12px 14px',
                                ...sectionCellStyle
                            }
                        };
                    }
                    return { style: { width: '150px', minWidth: '150px' } };
                },
                customBodyRender: (value, tableMeta) => {
                    const rowData = tableData[tableMeta.rowIndex];
                    if (!rowData) return null;
                    if (rowData.isSection) return null;
                    if (!rowData.isParent) return null;
                    return React.createElement(TextCell, { value: value });
                }
            }
        },
        {
            name: "model",
            label: "Plant Name",
            options: {
                sort: false,
                setCellProps: (value, tableMeta) => {
                    const rowData = tableMeta?.rowIndex != null ? tableData[tableMeta.rowIndex] : undefined;
                    if (rowData?.isSection) {
                        return {
                            style: {
                                width: '200px',
                                minWidth: '200px',
                                ...sectionCellStyle
                            }
                        };
                    }
                    return { style: { width: '200px', minWidth: '200px' } };
                },
                customBodyRender: (value, tableMeta) => {
                    const rowData = tableData[tableMeta.rowIndex];
                    if (!rowData || rowData.isSection || !rowData.isParent) return null;

                    return React.createElement(ExpandableCell, {
                        value: value,
                        isExpanded: rowData.isExpanded,
                        onToggle: () => toggleTag(rowData.tagId)
                    });
                }
            }
        },
        {
            name: "DeliveryTime",
            label: "Delivery Time / Category",
            options: {
                sort: false,
                setCellProps: (value, tableMeta) => {
                    const rowData = tableMeta?.rowIndex != null ? tableData[tableMeta.rowIndex] : undefined;
                    if (rowData?.isSection) {
                        return { style: sectionCellStyle };
                    }
                    return undefined;
                },
                customBodyRender: (value, tableMeta) => {
                    const rowData = tableData[tableMeta.rowIndex];
                    if (!rowData) return null;
                    if (rowData.isSection) return null;
                    return rowData.isParent ? (
                        <span style={{ fontWeight: '500' }}>{rowData.DeliveryTime}</span>
                    ) : (rowData.isChild ? (
                        <span style={{ fontWeight: '600', color: '#475569', fontSize: '12px' }}>{rowData.Category}</span>
                    ) : null);
                }
            }
        },
        {
            name: "BacklogTime",
            label: "Backlog Time / Details",
            options: {
                sort: false,
                setCellProps: (value, tableMeta) => {
                    const rowData = tableMeta?.rowIndex != null ? tableData[tableMeta.rowIndex] : undefined;
                    if (rowData?.isSection) {
                        return { style: sectionCellStyle };
                    }
                    return undefined;
                },
                customBodyRender: (value, tableMeta) => {
                    const rowData = tableData[tableMeta.rowIndex];
                    if (!rowData) return null;
                    if (rowData.isSection) return null;
                    return rowData.isParent ? rowData.BacklogTime : (rowData.isChild ? (
                        <span style={{ fontSize: '11px', color: '#1e293b' }}>{rowData.Detail1}</span>
                    ) : null);
                }
            }
        },
        {
            name: "Tariffs",
            label: "Tariffs / Type",
            options: {
                sort: false,
                setCellProps: (value, tableMeta) => {
                    const rowData = tableMeta?.rowIndex != null ? tableData[tableMeta.rowIndex] : undefined;
                    if (rowData?.isSection) {
                        return { style: sectionCellStyle };
                    }
                    return undefined;
                },
                customBodyRender: (value, tableMeta) => {
                    const rowData = tableData[tableMeta.rowIndex];
                    if (!rowData) return null;
                    if (rowData.isSection) return null;
                    return rowData.isParent ? (
                        <span style={{ color: '#0369a1', fontWeight: '500' }}>{rowData.Tariffs}</span>
                    ) : (rowData.isChild ? (
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{rowData.Detail2}</span>
                    ) : null);
                }
            }
        },
        {
            name: "Indicators",
            label: "Indicators / Value",
            options: {
                sort: false,
                setCellProps: (value, tableMeta) => {
                    const rowData = tableMeta?.rowIndex != null ? tableData[tableMeta.rowIndex] : undefined;
                    if (rowData?.isSection) {
                        return { style: sectionCellStyle };
                    }
                    return undefined;
                },
                customBodyRender: (value, tableMeta) => {
                    const rowData = tableData[tableMeta.rowIndex];
                    if (!rowData) return null;
                    if (rowData.isSection) return null;
                    if (rowData.isParent && rowData.Indicators) {
                        const ind = rowData.Indicators;
                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '9px', lineHeight: '1.2' }}>
                                <span style={{ color: ind.PricingSeen ? '#16a34a' : '#dc2626' }}>Seen: {ind.PricingSeen ? 'Y' : 'N'}</span>
                                <span style={{ color: ind.CustomerLoaded ? '#16a34a' : '#dc2626' }}>Cust: {ind.CustomerLoaded ? 'Y' : 'N'}</span>
                                <span style={{ color: ind.TransferLoaded ? '#16a34a' : '#dc2626' }}>Trans: {ind.TransferLoaded ? 'Y' : 'N'}</span>
                                <span style={{ color: ind.SurchargeLoaded ? '#16a34a' : '#dc2626' }}>Surch: {ind.SurchargeLoaded ? 'Y' : 'N'}</span>
                                <span style={{ color: ind.DeliveryOverridden ? '#dc2626' : '#16a34a' }}>Del Ovr: {ind.DeliveryOverridden ? 'Y' : 'N'}</span>
                            </div>
                        );
                    }
                    if (rowData.isChild) {
                        return <span style={{ fontWeight: '600', color: '#0f172a' }}>{rowData.Detail3}</span>;
                    }
                    return null;
                }
            }
        },
        {
            name: "Detail4",
            label: "Extra / Note Type",
            options: {
                sort: false,
                setCellProps: (value, tableMeta) => {
                    const rowData = tableMeta?.rowIndex != null ? tableData[tableMeta.rowIndex] : undefined;
                    if (rowData?.isSection) {
                        return { style: sectionCellStyle };
                    }
                    return undefined;
                },
                customBodyRender: (value, tableMeta) => {
                    const rowData = tableData[tableMeta.rowIndex];
                    if (!rowData) return null;
                    if (rowData.isSection) return null;
                    return rowData.isParent ? null : (rowData.isChild ? (
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{rowData.Detail4}</span>
                    ) : null);
                }
            }
        }
    ], [tableData, toggleTag]);
};
