import React from 'react';

export const IconChevronRight = () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
        <path d="M3 2l4 3-4 3V2z" />
    </svg>
);

export const IconChevronDown = () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
        <path d="M2 3l3 4 3-4H2z" />
    </svg>
);

export const IconFolder = ({ open }) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill={open ? '#00877A' : '#7a8a9a'}>
        {open
            ? <path d="M1 4h12v8H1V4zm0-2h4l1 2H1V2z" />
            : <path d="M1 3h4l1 2H1V3zm0 3h12v6H1V6z" />
        }
    </svg>
);

export const IconTag = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="#5a8059">
        <path d="M1 1h5l5 5-5 5-5-5V1zm2.5 2a1 1 0 100 2 1 1 0 000-2z" />
    </svg>
);

export const IconSearch = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

export const IconFilter = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

export const IconSortUp = ({ size = 10 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
);

export const IconSortDown = ({ size = 10 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
);

export const IconSortDouble = ({ size = 10 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="dimmed">
        <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
    </svg>
);