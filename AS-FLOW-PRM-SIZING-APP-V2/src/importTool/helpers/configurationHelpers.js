export const processConfigurationData = (rows, expandedTags) => {
    const tableData = [];
    rows.forEach(tag => {
        const models = tag.models || [];
        const tagId = tag.tagId || tag.TagId || tag.id;

        if (tag.isFailed) {
            tableData.push({
                tagId: `${tagId}-failed`,
                baseTagId: tagId,
                tagName: tag.tagName || tag.name || tag.TagNumber || '',
                model: 'BOM is not available for this tag',
                isParent: true,
                isExpanded: false,
                canExpand: false
            });
            return;
        }

        if (models.length === 0) {
            tableData.push({
                tagId: `${tagId}-empty`,
                baseTagId: tagId,
                tagName: tag.tagName || tag.name,
                model: 'No Configuration',
                isParent: true,
                isExpanded: false,
                canExpand: false
            });
            return;
        }

        models.forEach((modelObj, index) => {
            // Exact implementation of the dynamic rest operator pattern as requested
            const { modelId: apiModelId, modelNumber, selectedValveId, ...rest } = modelObj;

            // Extract the dynamic array (e.g., configItems, bomItems, products, sectionChoices)
            const items = Object.values(rest)[0];
            if (!items || !Array.isArray(items)) return;

            const modelId = `${tagId}-model${index}`;
            const isExpanded = expandedTags.has(modelId);

            const modelLabel = modelObj.modelNumber ? `${modelObj.modelNumber}` : `${index}`;

            tableData.push({
                tagId: modelId,
                baseTagId: tagId,
                tagName: index === 0 ? (tag.tagName || tag.name) : '',
                model: modelLabel,
                isParent: true,
                isExpanded
            });

            if (isExpanded) {
                items.forEach((item) => {
                    tableData.push({
                        ...item, // Dynamically spread all properties from the API item
                        tagId: modelId,
                        baseTagId: tagId,
                        tagName: '',
                        model: '',
                        isChild: true
                    });
                });
            }
        });
    });
    return tableData;
};
