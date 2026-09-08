import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import CustomTable from './CustomTable';
import { useSelectedTagRows } from '../hooks/useSelection';
import { tagDetailsOptions } from '../helpers/tagDetailsConfig';
import { useTagDetailsColumns } from '../hooks/useTagDetailsColumns.js';
import { updateTagNameThunk } from '../store/slices/tagsSlice';
import { setHasUnsavedChanges } from '../store/slices/layoutSlice';

import { TableLayout } from './basicComponents/Layout';
import { useSelector } from 'react-redux';

const TagDetailsTable = () => {
    const dispatch = useDispatch();
    const { tagDetailsColumns } = useSelector(state => state.tags);
    const rows = useSelectedTagRows();
    const [localChanges, setLocalChanges] = useState({});

    const onTagNumberChange = (tagId, newNumber) => {
        setLocalChanges(prev => ({ ...prev, [tagId]: newNumber }));
    };

    const hasChanges = React.useMemo(() => {
        return Object.keys(localChanges).some(id => {
            const row = rows.find(r => (r.TagId == id || r.tagId == id || r.id == id));
            if (!row) return false;
            const original = row?.TagNumber || row?.tagNumber || '';
            return localChanges[id] !== undefined && localChanges[id] !== original;
        });
    }, [localChanges, rows]);

    React.useEffect(() => {
        dispatch(setHasUnsavedChanges(hasChanges));
        // Clean up on unmount just in case
        return () => dispatch(setHasUnsavedChanges(false));
    }, [hasChanges, dispatch]);

    const handleSave = () => {
        const rowById = new Map();
        for (const row of rows || []) {
            const key = row.TagId ?? row.tagId ?? row.id;
            if (key != null) {
                rowById.set(String(key), row);
            }
        }
        const updates = [];
        for (const id in localChanges) {
            if (!Object.prototype.hasOwnProperty.call(localChanges, id)) continue;

            const newName = localChanges[id];
            if (newName === undefined) continue;

            const row = rowById.get(String(id));
            const original = row?.TagNumber ?? row?.tagNumber ?? '';

            if (newName !== original) {
                updates.push({ TagId: id, TagNumber: newName });
            }
        }

        if (updates.length > 0) {
            dispatch(updateTagNameThunk(updates));
        }

        setLocalChanges({});
        dispatch(setHasUnsavedChanges(false));
    };

    const hasErrors = Object.keys(localChanges).some(id => localChanges[id] === '');

    const columns = useTagDetailsColumns(tagDetailsColumns, rows, onTagNumberChange, localChanges);

    return (
        <TableLayout
            rows={rows}
            emptyMessage="Select tags from the left panel to view details"
        >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flex: 1, minHeight: 0 }}>
                    <CustomTable
                        data={rows}
                        columns={columns}
                        options={tagDetailsOptions}
                    />
                </div>

                {hasChanges && (
                    <div className="it-footer-actions" style={{
                        padding: '12px 24px',
                        borderTop: '1px solid var(--gray-200)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#f8fafc'
                    }}>
                        <div style={{ color: '#c53030', fontSize: '11px', fontWeight: 600 }}>
                            {hasErrors
                                ? '* Error: Tag Number cannot be empty.'
                                : '* You have unsaved changes. Click Save to reflect the changes in the system.'
                            }
                        </div>
                        <button
                            className={`it-btn-teal ${hasErrors ? 'disabled' : ''}`}
                            onClick={hasErrors ? undefined : handleSave}
                            disabled={hasErrors}
                            style={{
                                width: '120px',
                                opacity: hasErrors ? 0.5 : 1,
                                cursor: hasErrors ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Save Changes
                        </button>
                    </div>
                )}
            </div>
        </TableLayout>
    );
};

export default TagDetailsTable;
