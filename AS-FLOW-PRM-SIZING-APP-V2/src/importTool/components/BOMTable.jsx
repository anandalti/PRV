import React, { useMemo, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSelectedBomRows, useSelection } from '../hooks/useSelection';
import ConfigurationTable from './ConfigurationTable';
import { bomSolve, fetchTags } from '../store/slices/tagsSlice';

const BOMTable = () => {
    const dispatch = useDispatch();
    const bomRows = useSelectedBomRows();
    const { selectedTagIds, selectedTagIdsArray } = useSelection();
    const importedOrderData = useSelector(state => state.tags.importedOrderData);
    const tagDetails = useSelector(state => state.tags.tagDetails) || [];
    const bomDetails = useSelector(state => state.tags.bomDetails) || [];
    const isLoading = useSelector(state => state.tags.isLoading);
    const attemptedTagIdsRef = useRef(new Set());

    useEffect(() => {
        if (isLoading || selectedTagIdsArray.length === 0) return;
        const existingBomIdsSet = new Set(bomDetails.map(item => String(item.tagId || item.TagId || item.id)));
        const missingBomIds = selectedTagIdsArray.filter(id => 
            !existingBomIdsSet.has(String(id)) && !attemptedTagIdsRef.current.has(Number(id))
        );
        
        if (missingBomIds.length > 0) {
            missingBomIds.forEach(id => attemptedTagIdsRef.current.add(Number(id)));
            const payload = { tagIds: missingBomIds.map(id => Number(id)) };
            dispatch(bomSolve(payload))
                .unwrap()
                .then(() => {
                    dispatch(fetchTags());
                })
                .catch((error) => {
                    console.error('Failed to solve BOM:', error);
                });
        }
    }, [selectedTagIdsArray, bomDetails, isLoading, dispatch]);

    const normalizeValue = (value) => {
        if (value === null || value === undefined) return '';
        return String(value).trim().toLowerCase();
    };

    const getColVal = (row, possibleKeys) => {
        const keys = Object.keys(row);
        for (const pk of possibleKeys) {
            const match = keys.find(k => k.trim().toLowerCase() === pk.toLowerCase());
            if (match && row[match] !== undefined && row[match] !== null) return String(row[match]);
        }
        return '';
    };

    const getTagMatchValue = (tag) => {
        const candidates = [
            tag.PRV2SIZETAGNAME,
            tag.Prv2SizeTagName,
            tag.tagName,
            tag.TagName,
            tag.name,
            tag.TagNumber,
            tag.tagNumber,
            tag.TagId,
            tag.tagId
        ];
        return candidates.map(normalizeValue).find(v => v) || '';
    };

    const getCatalogMatchValue = (tag) => {
        const candidates = [
            tag.CATALOGCODE,
            tag.catalogCode,
            tag.CatalogCode,
            tag.catalogNumber,
            tag.CatalogNumber,
            tag.catalogNumber,
            tag.ERPCode,
            tag.erpCode,
            tag.Code
        ];
        return candidates.map(normalizeValue).find(v => v) || '';
    };

    const bomFallbackData = useMemo(() => {
        if (bomRows.length > 0) return [];
        if (!importedOrderData?.itemDetails?.data?.length || selectedTagIds.size === 0) return [];

        const orderRows = importedOrderData.itemDetails.data;
        const selectedIds = new Set(Array.from(selectedTagIds, id => String(id)));
        const selectedTags = tagDetails.filter(tag => selectedIds.has(String(tag.id || tag.tagId || tag.TagId)));

        return selectedTags.map(tag => {
            const tagValue = getTagMatchValue(tag);
            const catalogValue = getCatalogMatchValue(tag);

            const matchedItems = orderRows.filter(item => {
                const itemTag = normalizeValue(getColVal(item, ["TAG #", "Tag Number", "TagNumber", "Tag", "Tag No", "TagNo"]));
                const itemCatalog = normalizeValue(getColVal(item, ["PRODUCT NUMBER", "Catalog Code", "CatalogCode", "Product Number", "PRODUCT NO", "Catalog No", "CatalogNo", "Product #"]));
                if (tagValue && itemTag === tagValue) return true;
                if (catalogValue && itemCatalog === catalogValue) return true;
                return false;
            });

            const bomItems = matchedItems.length ? matchedItems.map(item => ({
                Item: getColVal(item, ["Item", "ITEM", "item"]),
                ProductNumber: getColVal(item, ["PRODUCT NUMBER", "Catalog Code", "CatalogCode", "Product Number", "PRODUCT NO", "Catalog No", "CatalogNo", "Product #"]),
                Qty: getColVal(item, ["Qty", "QTY", "Quantity"]),
                Description: getColVal(item, ["Description", "DESCRIPTION"])
            })) : [{
                Item: '',
                ProductNumber: catalogValue || '',
                Qty: '1',
                Description: 'BOMs are empty or not available'
            }];

            return {
                tagId: tag.id || tag.tagId || tag.TagId,
                tagName: tag.tagName || tag.name || tag.TagNumber || '',
                models: [{
                    modelNumber: catalogValue || 'Product',
                    bomItems
                }]
            };
        });
    }, [bomRows, importedOrderData, selectedTagIds, tagDetails]);

    const customColumns = useMemo(() => {
        if (!bomFallbackData.length) return undefined;
        const firstItem = bomFallbackData[0]?.models?.[0]?.bomItems?.[0];
        if (!firstItem) return undefined;
        return Object.keys(firstItem).map(key => ({ name: key, label: key }));
    }, [bomFallbackData]);

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 0', marginTop: '40px' }}>
                <div className="it-loading-spinner" style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid rgba(0, 74, 153, 0.1)',
                    borderTopColor: 'var(--brand-blue)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px'
                }} />
                <h3 style={{ color: 'var(--gray-700)', fontSize: '18px' }}>Fetching BOM Details...</h3>
                <p style={{ color: 'var(--gray-500)' }}>Please wait while we retrieve the latest BOM data.</p>
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return React.createElement(ConfigurationTable, {
        type: 'bom',
        customRows: bomRows.length > 0 ? bomRows : bomFallbackData,
        customColumns: bomRows.length > 0 ? undefined : customColumns
    });
};

export default BOMTable;
