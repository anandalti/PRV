import React, { createContext, useContext, useCallback } from 'react';
import { IconChevronRight, IconChevronDown, IconFolder, IconTag } from './Icons';

const TreeContext = createContext();

export const TreeProvider = ({ 
    children, 
    expandedNodes, 
    selectedTagIds, 
    onToggleExpand, 
    onToggleSelect,
    disabled
}) => {
    
    const getSelectionState = useCallback((node) => {
        if (node.type === 'tag') {
            return {
                isChecked: selectedTagIds.has(String(node.id || node.tagId)),
                isIndeterminate: false
            };
        }

        const nodeTagIds = [];
        const findTags = (n) => {
            if (n.type === 'tag') nodeTagIds.push(String(n.id || n.tagId));
            if (n.nodes) n.nodes.forEach(findTags);
        };
        findTags(node);

        const selectedCount = nodeTagIds.filter(id => selectedTagIds.has(id)).length;
        
        return {
            isChecked: selectedCount === nodeTagIds.length && nodeTagIds.length > 0,
            isIndeterminate: selectedCount > 0 && selectedCount < nodeTagIds.length
        };
    }, [selectedTagIds]);

    const value = {
        expandedNodes,
        getSelectionState,
        onToggleExpand,
        onToggleSelect,
        disabled
    };

    return React.createElement(TreeContext.Provider, { value }, children);
};

export const useTree = () => {
    const context = useContext(TreeContext);
    if (!context) {
        throw new Error('useTree must be used within a TreeProvider');
    }
    return context;
};

/**
 * Generic recursive tree node.
 */
const Node = (props) => {
    const { id, name, type, nodes = [], level = 0 } = props;
    const { expandedNodes, getSelectionState, onToggleExpand, onToggleSelect, disabled } = useTree();
    
    const hasChildren = Array.isArray(nodes) && nodes.length > 0;
    const isOpen = expandedNodes.has(id);
    const { isChecked, isIndeterminate } = getSelectionState(props);
    const Icon = type === 'tag' ? IconTag : IconFolder;

    // Recursive symmetry: root=0px, Level 1 = 16px, Level 2 = 32px...
    // Some customers/projects require root items to align flush left, so only apply the base offset after level 0.
    const nodePaddingLeft = `${level * 12}px`;

    return (
        <div className={`it-node-container it-level-${level}`}>
            {/* Node UI Component */}
            <div
                className={`it-tree-node it-tree-${type} it-node-level-${level} ${isChecked ? 'selected' : ''}`}
                onClick={() => !disabled && hasChildren && onToggleExpand?.(id)}
                style={{ paddingLeft: nodePaddingLeft, opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
                role="treeitem"
                aria-expanded={hasChildren ? isOpen : undefined}
            >
                <span className="it-tree-toggle">
                    {hasChildren ? (isOpen ? <IconChevronDown /> : <IconChevronRight />) : null}
                </span>

                <Icon open={isOpen && hasChildren} />

                <span className="it-tree-label">
                    <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={disabled}
                        ref={el => el && (el.indeterminate = isIndeterminate)}
                        onChange={e => {
                            e.stopPropagation();
                            if (!disabled) onToggleSelect?.(props.raw || props, type, !isChecked);
                        }}
                        onClick={e => e.stopPropagation()}
                    />
                    {name}
                </span>
            </div>

            {/* Node Children Container */}
            {isOpen && hasChildren && (
                <div className="it-node-children">
                    {nodes.map(child => (
                        <Node 
                            key={child.id} 
                            {...child} 
                            level={level + 1} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Node;