import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setViewMode } from '../../store/slices/layoutSlice';

export const AppNavbar = ({ title = "PRV Import Tool" }) => {
    const dispatch = useDispatch();
    const { viewMode } = useSelector(state => state.layout);

    return (
        <nav className="it-navbar">
            <div className="it-navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div className="menu-icon">
                    <div /><div /><div />
                    <div /><div /><div />
                    <div /><div /><div />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                    <span className="brand-emerson">EMERSON</span>
                    <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.5px' }}>
                        {title}
                    </span>
                </div>
            </div>
            
            <div className="it-navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: 'auto' }}>
            <div className="nav-icon-btn" title="Notifications" style={{ cursor: 'pointer', display: 'flex' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
            </div>
            <div className="nav-icon-btn" title="Profile" style={{ cursor: 'pointer', display: 'flex' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            </div>
        </div>
    </nav>
        );
};

export const EmptyState = ({ message, icon: IconPath }) => (
    <div className="it-empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {IconPath || <path d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v6M13 21h8M17 17l4 4m0-4l-4 4" />}
        </svg>
        <p>{message}</p>
    </div>
);

export const TableLayout = ({ rows, children, emptyMessage, emptyIcon }) => {
    if (!rows || rows.length === 0) {
        return <EmptyState message={emptyMessage} icon={emptyIcon} />;
    }
    return (
        <div className="it-table-wrapper" style={{ height: '100%', width: '100%' }}>
            {children}
        </div>
    );
};

export const TreeControls = ({ search, onSearchChange, onExpandCollapse, isAllExpanded, selectAllLabel, onSelectAll, isAllSelected, isAnySelected, disabled }) => (
    <div className={`it-tree-controls ${disabled ? 'disabled' : ''}`}>
        <div className="it-search-row">
            <div className="it-search-field">
                <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={e => !disabled && onSearchChange(e.target.value)}
                    disabled={disabled}
                />
            </div>
        </div>
        <div className="it-controls-row">
            <div className="it-controls-group" style={{ gap: '6px', width: '110px', display: 'flex', alignItems: 'center', opacity: disabled ? 0.5 : 1 }}>
                <button
                    type="button"
                    className="it-search-icon-btn"
                    onClick={e => { if (!disabled) onExpandCollapse(e); }}
                    title={isAllExpanded ? 'Collapse All' : 'Expand All'}
                    disabled={disabled}
                    style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
                >
                    {isAllExpanded ? '−' : '+'}
                </button>
                <span 
                    style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--emerson-teal)', textTransform: 'uppercase', cursor: disabled ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }} 
                    onClick={e => { if (!disabled) onExpandCollapse(e); }}
                >
                    {isAllExpanded ? 'Collapse All' : 'Expand All'}
                </span>
            </div>
            <div className="it-controls-group" style={{ marginLeft: 'auto', width: '110px', display: 'flex', justifyContent: 'flex-start', paddingLeft: '14px', opacity: disabled ? 0.5 : 1 }}>
                <label
                    className="it-checkbox-row"
                    style={{ margin: 0, fontSize: '10px', color: 'var(--emerson-teal)', gap: '4px', whiteSpace: 'nowrap', cursor: disabled ? 'not-allowed' : 'pointer' }}
                    onClick={e => { if (!disabled) onSelectAll(e); }}
                >
                    <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={el => el && (el.indeterminate = isAnySelected && !isAllSelected)}
                        disabled={disabled}
                        readOnly
                    />
                    {selectAllLabel}
                </label>
            </div>
        </div>
    </div>
);
