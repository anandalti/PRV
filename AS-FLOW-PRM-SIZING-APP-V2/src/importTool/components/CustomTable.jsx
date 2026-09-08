import React, { useState, useMemo, useRef, useEffect } from 'react';
import { IconSearch, IconFilter, IconSortUp, IconSortDown, IconSortDouble } from './basicComponents/Icons';

const useCustomTable = (data, columns, onSort, externalSortField, externalSortDirection) => {
    const [internalSortField, setInternalSortField] = useState(null);
    const [internalSortDirection, setInternalSortDirection] = useState('asc');
    const [searchText, setSearchText] = useState('');
    const [activeFilters, setActiveFilters] = useState({});
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    
    const sortField = onSort ? externalSortField : internalSortField;
    const sortDirection = onSort ? externalSortDirection : internalSortDirection;

    const handleSort = (field, sortable) => {
        if (sortable === false) return;
        if (onSort) {
            onSort(field, (sortField === field && sortDirection === 'asc') ? 'desc' : 'asc');
        } else {
            if (internalSortField === field) setInternalSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
            else { setInternalSortField(field); setInternalSortDirection('asc'); }
        }
    };

    const toggleFilterValue = (colName, value) => {
        setActiveFilters(prev => {
            const next = { ...prev };
            const currentSet = new Set(next[colName] || []);
            currentSet.has(value) ? currentSet.delete(value) : currentSet.add(value);
            currentSet.size === 0 ? delete next[colName] : next[colName] = Array.from(currentSet);
            return next;
        });
    };

    const filterableColumns = useMemo(() => columns.filter(col => col.options?.filter !== false), [columns]);

    const columnUniqueValues = useMemo(() => {
        const unique = {};
        filterableColumns.forEach(col => {
            unique[col.name] = Array.from(new Set(data.map(row => String(row[col.name] || '—')))).sort();
        });
        return unique;
    }, [data, filterableColumns]);

    const sortedData = useMemo(() => {
        let result = data;
        if (searchText) {
            const lowSearch = searchText.toLowerCase();
            result = result.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(lowSearch)));
        }
        Object.entries(activeFilters).forEach(([col, vals]) => {
            result = result.filter(row => vals.includes(String(row[col] || '—')));
        });

        if (onSort || !sortField) return result;
        return [...result].sort((a, b) => {
            let aV = a[sortField] ?? '', bV = b[sortField] ?? '';
            const nA = parseFloat(aV), nB = parseFloat(bV);
            if (!isNaN(nA) && !isNaN(nB)) return sortDirection === 'asc' ? nA - nB : nB - nA;
            return sortDirection === 'asc' ? String(aV).localeCompare(String(bV)) : String(bV).localeCompare(String(aV));
        });
    }, [data, searchText, activeFilters, sortField, sortDirection, onSort]);

    return {
        searchText, setSearchText, activeFilters, setActiveFilters, showFilterMenu, setShowFilterMenu,
        sortField, sortDirection, handleSort, toggleFilterValue, filterableColumns, columnUniqueValues, sortedData
    };
};

const CustomTable = (props) => {
    const { data, columns, onSort, externalSortField, externalSortDirection, options, variant = 'standard', customToolbar } = props;
    const isExcel = variant === 'excel';

    const {
        searchText, setSearchText, activeFilters, setActiveFilters, showFilterMenu, setShowFilterMenu,
        sortField, sortDirection, handleSort, toggleFilterValue, filterableColumns, columnUniqueValues, sortedData
    } = useCustomTable(data, columns, onSort, externalSortField, externalSortDirection);

    const filterMenuRef = useRef(null);
    const filterBtnRef = useRef(null);

    useEffect(() => {
        const onClick = (e) => {
            if (showFilterMenu && filterMenuRef.current && !filterMenuRef.current.contains(e.target) && !filterBtnRef.current?.contains(e.target)) {
                setShowFilterMenu(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [showFilterMenu]);

    const totalFilters = Object.keys(activeFilters).length;

    return (
        <div className={`it-custom-table-container ${isExcel ? 'it-excel-view' : ''}`}>
            <div className="it-table-header-actions">
                <div className="it-header-tools-left">
                    {isExcel && <span className="it-excel-badge">Excel Grid View</span>}
                </div>
                <div className="it-header-tools-right">
                    {customToolbar}
                    {options?.search !== false && (
                        <div className="it-search-wrapper">
                            <IconSearch />
                            <input type="text" placeholder="Search..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                        </div>
                    )}

                    {options?.filter !== false && filterableColumns.length > 0 && (
                        <button ref={filterBtnRef} className={`it-filter-btn ${totalFilters > 0 ? 'active' : ''}`} onClick={() => setShowFilterMenu(!showFilterMenu)}>
                            <IconFilter />
                            <span>Filter</span>
                            {totalFilters > 0 && <span className="it-filter-count">{totalFilters}</span>}
                        </button>
                    )}

                    {showFilterMenu && (
                        <div className="it-central-filter-menu" ref={filterMenuRef}>
                            <div className="filter-menu-header">
                                <span>Table Filters</span>
                                <button className="clear-all-btn" onClick={() => setActiveFilters({})}>Clear All</button>
                            </div>
                            <div className="filter-menu-body">
                                {filterableColumns.map(col => (
                                    <div key={col.name} className="filter-group">
                                        <div className="filter-group-label">{col.label}</div>
                                        <div className="filter-group-options">
                                            {columnUniqueValues[col.name]?.map(val => (
                                                <label key={val} className="filter-item">
                                                    <input type="checkbox" checked={new Set(activeFilters[col.name]).has(val)} onChange={() => toggleFilterValue(col.name, val)} />
                                                    <span>{val}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="it-custom-table-wrapper">
                <table className={`it-custom-table ${isExcel ? 'it-excel-grid' : ''}`}>
                    <thead>
                        <tr>
                            {isExcel && <th className="it-row-num-col">#</th>}
                            {columns.map((col) => {
                                const isSortable = col.options?.sort !== false;
                                const headerProps = col.options?.setCellProps?.();
                                return (
                                    <th key={col.name} className={`${sortField === col.name ? `sorted-${sortDirection}` : ''} ${isSortable ? 'sortable' : ''}`} style={headerProps?.style}>
                                        <div className="th-content" onClick={() => handleSort(col.name, isSortable)}>
                                            <span className="th-label">{col.label}</span>
                                            {isSortable && (
                                                <span className="sort-icon-wrapper">
                                                    {sortField === col.name 
                                                        ? (sortDirection === 'asc' ? <IconSortUp /> : <IconSortDown />)
                                                        : <IconSortDouble />
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.length > 0 ? sortedData.map((row, idx) => (
                            <tr
                                key={row.id || idx}
                                style={row?.isSectionEnd ? {
                                    borderBottom: '1.50px solid #8d97a8'
                                } : row?.isGroup ? {
                                    background: '#e2e8f0',
                                    color: '#0f172a'
                                } : undefined}
                            >
                                {isExcel && <td className="it-row-num-cell">{idx + 1}</td>}
                                {columns.map((col) => {
                                    const cellProps = col.options?.setCellProps?.();
                                    return (
                                        <td key={col.name} style={cellProps?.style}>
                                            {col.options?.customBodyRender ? col.options.customBodyRender(row[col.name], { rowIndex: idx, rowData: row }) : row[col.name]}
                                        </td>
                                    );
                                })}
                            </tr>
                        )) : (
                            <tr><td colSpan={columns.length + (isExcel ? 1 : 0)} className="no-match">No records found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomTable;
