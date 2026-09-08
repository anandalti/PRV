export const filterTreeBySelectedTagIds = (data, selectedTagIds) => {
    if (!selectedTagIds || selectedTagIds.size === 0) return data;

    return data.map(company => {
        const matchedProjects = (company.projects || []).map(project => {
            const matchedTags = (project.tags || []).filter(tag =>
                selectedTagIds.has(String(tag.tagId || tag.id))
            );

            if (matchedTags.length > 0) return { ...project, tags: matchedTags };
            return null;
        }).filter(project => project !== null);

        if (matchedProjects.length > 0) return { ...company, projects: matchedProjects };
        return null;
    }).filter(company => company !== null);
};

export const getAllTagIds = (data) => {
    return data.flatMap(company =>
        (company.projects || []).flatMap(project =>
            (project.tags || []).map(tag => String(tag.tagId || tag.id))
        )
    );
};

export const getAllNodeIds = (data) => {
    const ids = [];
    data.forEach(company => {
        ids.push(company.id);
        (company.projects || []).forEach(project => ids.push(project.id));
    });
    return ids;
};

export const filterTreeData = (data, search, selectedTagIds = null) => {
    const sourceData = selectedTagIds && selectedTagIds.size > 0 ? filterTreeBySelectedTagIds(data, selectedTagIds) : data;

    if (!search.trim()) return sourceData;

    return sourceData.map(company => {
        const companyMatches = company.name.toLowerCase().includes(search.toLowerCase());
        if (companyMatches) return company;

        const matchedProjects = (company.projects || []).map(project => {
            const projectMatches = project.name.toLowerCase().includes(search.toLowerCase());
            const matchedTags = (project.tags || []).filter(tag =>
                (tag.tagName || tag.name).toLowerCase().includes(search.toLowerCase())
            );

            if (projectMatches) return project;
            if (matchedTags.length > 0) return { ...project, tags: matchedTags };
            return null;
        }).filter(p => p !== null);

        return matchedProjects.length > 0 ? { ...company, projects: matchedProjects } : null;
    }).filter(c => c !== null);
};

export const getVisibleTagIds = (filteredData, expandedNodes, search) => {
    const ids = [];
    filteredData.forEach(company => {
        const isCompanyOpen = search.trim().length > 0 || expandedNodes.has(company.id);
        if (isCompanyOpen) {
            company.projects.forEach(project => {
                const isProjectOpen = search.trim().length > 0 || expandedNodes.has(project.id);
                if (isProjectOpen) {
                    project.tags.forEach(tag => {
                        ids.push(tag.tagId || tag.id);
                    });
                }
            });
        }
    });
    return ids;
};