import React, { useState, useMemo } from 'react';
import CustomTable from './CustomTable';
import { useSelectedPricingRows } from '../hooks/useSelection';
import { pricingOptions } from '../helpers/pricingConfig';
import { processPricingData } from '../helpers/pricingHelpers';
import { usePricingColumns } from '../hooks/usePricingColumns';
import { TableLayout } from './basicComponents/Layout';

const PricingTable = () => {
    const rawRows = useSelectedPricingRows();

    // Map API structure: each tag has `models[]` → map to `PricingData[]` expected by processPricingData
    const rows = useMemo(() => {
        if (!rawRows || rawRows.length === 0) return [];
        return rawRows.map(tag => ({
            ...tag,
            PricingData: Array.isArray(tag.models) ? tag.models : []
        }));
    }, [rawRows]);

    const [expandedTags, setExpandedTags] = useState(new Set());

    const toggleTag = (tagId) => {
        setExpandedTags(prev => {
            const next = new Set(prev);
            next.has(tagId) ? next.delete(tagId) : next.add(tagId);
            return next;
        });
    };

    const tableData = useMemo(() => {
        return processPricingData(rows, expandedTags);
    }, [rows, expandedTags]);

    const columns = usePricingColumns(tableData, toggleTag);

    return (
        <TableLayout 
            rows={rows} 
            emptyMessage="Select tags from the left panel to view pricing data"
            emptyIcon={<path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
        >
            <div style={{ padding: '0', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <CustomTable
                    data={tableData}
                    columns={columns}
                    options={{
                        ...pricingOptions, 
                        filter: false, 
                        search: false,
                        rowHover: false
                    }}
                />
            </div>
        </TableLayout>
    );
};

export default PricingTable;
