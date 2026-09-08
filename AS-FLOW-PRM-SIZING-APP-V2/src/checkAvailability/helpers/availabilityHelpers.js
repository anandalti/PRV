export const processAvailabilityData = (items, expandedNodes) => {
    const tableData = [];
    
    const buildTree = (parentId = null) => {
        const children = items.filter(item => item.parrentmaterialNumber === parentId);
        
        children.forEach(item => {
            const nodeId = item.materialNumber;
            const isExpanded = expandedNodes.has(nodeId);
            const hasChildren = items.some(child => child.parrentmaterialNumber === nodeId);

            tableData.push({
                ...item,
                id: nodeId,
                isParent: hasChildren,
                isExpanded: isExpanded,
            });

            if (isExpanded && hasChildren) {
                buildTree(nodeId);
            }
        });
    };

    // Find root items (those where parrentmaterialNumber is null or not found in the list)
    const roots = items.filter(item => !item.parrentmaterialNumber || !items.some(p => p.materialNumber === item.parrentmaterialNumber));
    
    roots.forEach(root => {
        const nodeId = root.materialNumber;
        const isExpanded = expandedNodes.has(nodeId);
        const hasChildren = items.some(child => child.parrentmaterialNumber === nodeId);

        tableData.push({
            ...root,
            id: nodeId,
            isParent: hasChildren,
            isExpanded: isExpanded,
        });

        if (isExpanded && hasChildren) {
            buildTree(nodeId);
        }
    });

    return tableData;
};
