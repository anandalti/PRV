import React, { useEffect, useState, useMemo } from 'react';
import Node, { TreeProvider } from './basicComponents/Node';
import { useSelection } from '../hooks/useSelection';
import { filterTreeData, getVisibleTagIds, getAllTagIds, getAllNodeIds } from '../helpers/treeHelpers';
import { TreeControls } from './basicComponents/Layout';
import { useSelector, useDispatch } from 'react-redux';
import { toggleLeftPanel, setImportModalOpen } from '../store/slices/layoutSlice';

const useLeftPanel = (data, selectedTagIds, isOrderMapped) => {
    const [expandedNodes, setExpandedNodes] = useState(() => new Set());
    const [search, setSearch] = useState('');

    const toggleExpand = (nodeId) => {
        setExpandedNodes(prev => {
            const next = new Set(prev);
            next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
            return next;
        });
    };

    const filteredData = useMemo(() => filterTreeData(data, search, isOrderMapped ? selectedTagIds : null), [data, search, selectedTagIds, isOrderMapped]);
    const filteredNodeIds = useMemo(() => getAllNodeIds(filteredData), [filteredData]);
    const filteredTagIds = useMemo(() => getAllTagIds(filteredData), [filteredData]);

    useEffect(() => {
        if (isOrderMapped && filteredNodeIds.length > 0) {
            setExpandedNodes(new Set(filteredNodeIds));
        }
    }, [isOrderMapped, filteredNodeIds]);

    const isAllExpanded = filteredNodeIds.length > 0 && filteredNodeIds.every(id => expandedNodes.has(id));
    const handleExpandCollapse = () => setExpandedNodes(isAllExpanded ? new Set() : new Set(filteredNodeIds));

    const visibleTagIds = useMemo(() => getVisibleTagIds(filteredData, expandedNodes, search), [filteredData, expandedNodes, search]);

    const visibleSelectedCount = useMemo(() => visibleTagIds.filter(id => selectedTagIds.has(String(id))).length, [visibleTagIds, selectedTagIds]);
    const isVisibleAllSelected = visibleTagIds.length > 0 && visibleSelectedCount === visibleTagIds.length;
    const isVisibleAnySelected = visibleSelectedCount > 0;

    return {
        expandedNodes, search, setSearch, toggleExpand, handleExpandCollapse, isAllExpanded,
        filteredData, visibleTagIds, isVisibleAllSelected, isVisibleAnySelected, filteredTagIds
    };
};

const LeftPanel = () => {
    const dispatch = useDispatch();
    const { isLeftPanelVisible, viewMode, isOrderMapped, showOrderSheetTab, isImportModalOpen } = useSelector(state => state.layout);
    const data = useSelector(state => state.tags?.filterData?.companies) || [];

    const {
        selectedTagIds,
        handleTagToggle,
        handleProjectToggle,
        handleCompanyToggle,
        handleSelectAll,
    } = useSelection();

    const {
        expandedNodes,
        search,
        setSearch,
        toggleExpand,
        handleExpandCollapse,
        isAllExpanded,
        filteredData,
        visibleTagIds,
        isVisibleAllSelected,
        isVisibleAnySelected,
        filteredTagIds,
    } = useLeftPanel(data, selectedTagIds, isOrderMapped);

    const searchActive = search.trim().length > 0;

    // Transform data into a generic tree structure compatible with Node.jsx
    const treeData = useMemo(() => {
        const buildNode = (item, type) => ({
            id: item.id || item.tagId,
            name: item.name || item.tagName,
            type,
            nodes: type === 'company'
                ? (item.projects || []).map(p => buildNode(p, 'project'))
                : type === 'project'
                    ? (item.tags || []).map(t => buildNode(t, 'tag'))
                    : [],
            raw: item
        });

        return filteredData.map(c => buildNode(c, 'company'));
    }, [filteredData]);

    const allTagIds = useMemo(() => filteredTagIds, [filteredTagIds]);

    const isAllSelected = allTagIds.length > 0 && allTagIds.every(id => selectedTagIds.has(String(id)));
    const isAnySelected = allTagIds.some(id => selectedTagIds.has(String(id)));

    const handleToggleSelect = (raw, type, isChecked) => {
        if (type === 'company') {
            handleCompanyToggle?.(raw, isChecked);
        } else if (type === 'project') {
            handleProjectToggle?.(raw, isChecked);
        } else if (type === 'tag') {
            handleTagToggle?.(raw.tagId || raw.id);
        }
    };

    const hasTabs = viewMode === 'standard';

    return (
        <div className={`it-left-column ${!isLeftPanelVisible ? 'collapsed' : ''}`}>
            <div className={`it-left-panel ${hasTabs ? 'has-tabs' : ''}`}>
                <div className="it-left-nav">
                    <button
                        className="it-left-nav-btn it-btn-lightblue"
                        onClick={() => dispatch(setImportModalOpen(true))}
                        style={{ justifyContent: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                    >
                        {showOrderSheetTab ? 'Upload Again' : 'Import File'}
                    </button>
                </div>

                {isLeftPanelVisible && viewMode === 'standard' && !isImportModalOpen && (!showOrderSheetTab || isOrderMapped) && (
                    <>
                        <TreeControls
                            search={search}
                            onSearchChange={setSearch}
                            onExpandCollapse={handleExpandCollapse}
                            isAllExpanded={isAllExpanded}
                            selectAllLabel={(visibleTagIds.length > 0 ? isVisibleAllSelected : isAllSelected) ? 'DESELECT ALL' : 'SELECT ALL'}
                            onSelectAll={() => handleSelectAll?.(visibleTagIds.length > 0 ? visibleTagIds : null, allTagIds)}
                            isAllSelected={visibleTagIds.length > 0 ? isVisibleAllSelected : isAllSelected}
                            isAnySelected={visibleTagIds.length > 0 ? isVisibleAnySelected : isAnySelected}
                            disabled={isOrderMapped}
                        />

                        <div className="it-tree">
                            {treeData.length === 0 ? (
                                <div style={{ padding: 12, color: '#999', fontSize: 12 }}>No results found</div>
                            ) : (
                                <TreeProvider
                                    expandedNodes={searchActive ? new Set(visibleTagIds.concat(Array.from(expandedNodes))) : expandedNodes}
                                    selectedTagIds={selectedTagIds}
                                    onToggleExpand={toggleExpand}
                                    onToggleSelect={handleToggleSelect}
                                    disabled={isOrderMapped}
                                >
                                    {treeData.map(node => (
                                        <Node key={node.id} {...node} level={0} />
                                    ))}
                                </TreeProvider>
                            )}
                        </div>
                    </>
                )}

                {!isImportModalOpen && (
                    <div className="it-left-panel-header" style={{ justifyContent: isLeftPanelVisible ? 'space-between' : 'center' }}>
                        {isLeftPanelVisible && <span style={{ whiteSpace: 'nowrap' }}>collapse panel</span>}
                        <button
                            className="it-collapse-btn"
                            onClick={() => dispatch(toggleLeftPanel())}
                            title={isLeftPanelVisible ? "Collapse panel" : "Expand panel"}
                        >
                            {isLeftPanelVisible ? '\u00AB' : '\u00BB'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeftPanel;
