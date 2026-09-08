import { useState, useMemo } from 'react';
import { filterTreeData, getVisibleTagIds } from '../helpers/treeHelpers';

export const useLeftPanel = (data, selectedTagIds) => {
    const [expandedNodes, setExpandedNodes] = useState(() => {
        const ids = new Set();
        data.forEach(company => {
            ids.add(company.id);
            company.projects.forEach(project => {
                ids.add(project.id);
            });
        });
        return ids;
    });
    const [search, setSearch] = useState('');

    const toggleExpand = (nodeId) => {
        setExpandedNodes(prev => {
            const next = new Set(prev);
            next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
            return next;
        });
    };

    const allNodeIds = useMemo(() => {
        const ids = new Set();
        data.forEach(company => {
            ids.add(company.id);
            company.projects.forEach(project => {
                ids.add(project.id);
            });
        });
        return ids;
    }, [data]);

    const isAllExpanded = expandedNodes.size === allNodeIds.size && allNodeIds.size > 0;
    const expandAll = () => setExpandedNodes(new Set(allNodeIds));
    const collapseAll = () => setExpandedNodes(new Set());
    const handleExpandCollapse = () => (isAllExpanded ? collapseAll() : expandAll());

    /* Filter tree by search term */
    const filteredData = useMemo(() => filterTreeData(data, search), [data, search]);

    const visibleTagIds = useMemo(() => getVisibleTagIds(filteredData, expandedNodes, search), [filteredData, expandedNodes, search]);

    const visibleSelectedCount = useMemo(() => {
        return visibleTagIds.filter(id => selectedTagIds.has(id)).length;
    }, [visibleTagIds, selectedTagIds]);

    const isVisibleAllSelected = visibleTagIds.length > 0 && visibleSelectedCount === visibleTagIds.length;
    const isVisibleAnySelected = visibleSelectedCount > 0;

    return {
        expandedNodes,
        search, setSearch,
        toggleExpand,
        isAllExpanded,
        handleExpandCollapse,
        filteredData,
        visibleTagIds,
        isVisibleAllSelected,
        isVisibleAnySelected
    };
};
