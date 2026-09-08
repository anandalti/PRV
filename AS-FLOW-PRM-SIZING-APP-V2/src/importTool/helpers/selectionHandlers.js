const extractTagIds = (entity) => {
    if (!entity) return [];
    if (Array.isArray(entity.tags)) return entity.tags.map(tag => String(tag.tagId || tag.id));
    if (Array.isArray(entity.projects)) {
        return entity.projects.flatMap(project => project.tags.map(tag => String(tag.tagId || tag.id)));
    }
    return [];
};

const withSetUpdate = (setSelectedTags, updater) => {
    setSelectedTags(prev => {
        const next = new Set(prev);
        updater(next);
        return next;
    });
};

const applyTagIds = (setSelectedTags, tagIds, shouldSelect) => {
    withSetUpdate(setSelectedTags, next => {
        tagIds.forEach(id => {
            const strId = String(id);
            if (shouldSelect) {
                next.add(strId);
            } else {
                next.delete(strId);
            }
        });
    });
};

export const createHandleTagToggle = (setSelectedTags) => (tagIdOrIds) => {
    withSetUpdate(setSelectedTags, next => {
        // Handle single ID
        if (typeof tagIdOrIds === 'string' || typeof tagIdOrIds === 'number') {
            const strId = String(tagIdOrIds);
            if (next.has(strId)) {
                next.delete(strId);
            } else {
                next.add(strId);
            }
        }
    });
};

export const createHandleProjectToggle = (setSelectedTags) => (project, isSelected) => {
    const tagIds = extractTagIds(project);
    applyTagIds(setSelectedTags, tagIds, isSelected);
};

export const createHandleCompanyToggle = (setSelectedTags) => (company, isSelected) => {
    const tagIds = extractTagIds(company);
    applyTagIds(setSelectedTags, tagIds, isSelected);
};

export const createHandleSelectAll = (setSelectedTags, allTagIds, selectedTags) => (idsToSelect) => {
    const rawTargetIds = (idsToSelect && idsToSelect.length > 0) ? idsToSelect : allTagIds;
    const targetIds = rawTargetIds.map(String);
    if (targetIds.length === 0) return;

    // Check if every target ID is present as a string in selectedTags
    const allTargetSelected = targetIds.every(id => selectedTags.has(id));

    withSetUpdate(setSelectedTags, next => {
        targetIds.forEach(id => {
            if (allTargetSelected) {
                next.delete(id);
            } else {
                next.add(id);
            }
        });
    });
};

export const createHandleDeselectAll = (setSelectedTags) => (idsToDeselect) => {
    if (idsToDeselect && idsToDeselect.length > 0) {
        withSetUpdate(setSelectedTags, next => {
            idsToDeselect.forEach(id => next.delete(String(id)));
        });
    } else {
        setSelectedTags(new Set());
    }
};
