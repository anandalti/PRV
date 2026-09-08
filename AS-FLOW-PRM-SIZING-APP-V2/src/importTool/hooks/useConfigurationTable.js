import { useState } from 'react';

export const useConfigurationTable = () => {
    const [expandedTags, setExpandedTags] = useState(new Set());

    const toggleTag = (tagId) => {
        setExpandedTags(prev => {
            const next = new Set(prev);
            next.has(tagId) ? next.delete(tagId) : next.add(tagId);
            return next;
        });
    };

    return {
        expandedTags,
        toggleTag
    };
};
