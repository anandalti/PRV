import React from 'react';

const StatusBadge = ({ status }) => {
    if (!status || status === 'pending') return <span style={{ color: '#999', fontSize: 11 }}>—</span>;
    if (status === 'completed') return <span className="it-status sent">Sent</span>;
    return <span className="it-status">{status}</span>;
};

export default StatusBadge;