import React, { useState, useMemo } from 'react';
import CustomTable from './CustomTable';
import { useSelector } from 'react-redux';
import { useSelectedConfigRows, useSelectedPricingRows, useSelectedBomRows } from '../hooks/useSelection';
import { processConfigurationData } from '../helpers/configurationHelpers';
import { configurationOptions } from '../helpers/configurationConfig';
import { bomOptions } from '../helpers/bomConfig';
import { useConfigurationColumns } from '../hooks/useConfigurationColumns.js';

import { TableLayout } from './basicComponents/Layout';

const ConfigurationTable = ({ type = 'config', customRows, customColumns }) => {
    const isBOM = type === 'bom';
    const configRows = useSelectedConfigRows();
    const bomRows = useSelectedBomRows();
    
    const rows = customRows || (isBOM ? bomRows : configRows);
    
    const stateConfigColumns = useSelector(state => state.tags.configColumns);
    const stateBomColumns = useSelector(state => state.tags.bomColumns);
    const dynamicColumns = customColumns || (isBOM ? stateBomColumns : stateConfigColumns) || [];

    const [expandedTags, setExpandedTags] = useState(new Set());

    const toggleTag = (tagId) => {
        setExpandedTags(prev => {
            const next = new Set(prev);
            next.has(tagId) ? next.delete(tagId) : next.add(tagId);
            return next;
        });
    };

    const tableData = useMemo(() => {
        return processConfigurationData(rows || [], expandedTags);
    }, [rows, expandedTags]);

    const columns = useConfigurationColumns(dynamicColumns, tableData, toggleTag);

    return (
        <TableLayout 
            rows={rows} 
            emptyMessage={isBOM ? "Select tags from the left panel to view BOM data" : "Select tags from the left panel to view configuration data"}
        >
            <div style={{ padding: isBOM ? '0 24px' : '0', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <CustomTable
                    data={tableData}
                    columns={columns}
                    options={isBOM ? bomOptions : configurationOptions}
                />
            </div>
        </TableLayout>
    );
};

export default ConfigurationTable;
