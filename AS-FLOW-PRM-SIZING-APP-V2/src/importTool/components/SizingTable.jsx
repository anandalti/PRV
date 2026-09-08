import React from 'react';
import { useSelector } from 'react-redux';
import CustomTable from './CustomTable';
import { useSelectedSizingRows } from '../hooks/useSelection';
import { sizingOptions } from '../helpers/sizingConfig';

import { TableLayout } from './basicComponents/Layout';

const SizingTable = () => {
    const rows = useSelectedSizingRows();
    const dynamicColumns = useSelector(state => state.tags.sizingColumns) || [];

    const tableRows = (rows || []).map(tag => {
        return {
            ...tag,
            id: tag.tagId || tag.id || tag.tagName,
        };
    });

    return (
        <TableLayout rows={rows} emptyMessage="Select tags from the left panel to view sizing data">
            <CustomTable
                data={tableRows}
                columns={dynamicColumns}
                options={sizingOptions}
            />
        </TableLayout>
    );
};

export default SizingTable;
