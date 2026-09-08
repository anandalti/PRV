import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    companies: [],
    selectedTags: [],
};

const updateSelectedTags = (state, ids, isSelected) => {
    const set = new Set(state.selectedTags);
    ids.forEach(id => isSelected ? set.add(id) : set.delete(id));
    state.selectedTags = Array.from(set);
};

const selectionSlice = createSlice({
    name: 'selection',
    initialState,
    reducers: {
        handleTagToggle: (state, { payload: tagId }) => {
            const set = new Set(state.selectedTags);
            set.has(tagId) ? set.delete(tagId) : set.add(tagId);
            state.selectedTags = Array.from(set);
        },
        handleProjectToggle: (state, { payload: { project, isSelected } }) => {
            updateSelectedTags(state, project.tags.map(t => t.tagId || t.id), isSelected);
        },
        handleCompanyToggle: (state, { payload: { company, isSelected } }) => {
            updateSelectedTags(state, company.projects.flatMap(p => p.tags.map(t => t.tagId || t.id)), isSelected);
        },
        handleSelectAll: (state, { payload: ids }) => {
            if (!ids?.length) return;
            const current = new Set(state.selectedTags);
            if (ids.every(id => current.has(id))) {
                state.selectedTags = state.selectedTags.filter(id => !ids.includes(id));
            } else {
                ids.forEach(id => current.add(id));
                state.selectedTags = Array.from(current);
            }
        },
        handleDeselectAll: (state, { payload: ids }) => {
            if (ids?.length) {
                const set = new Set(state.selectedTags);
                ids.forEach(id => set.delete(id));
                state.selectedTags = Array.from(set);
            } else state.selectedTags = [];
        },

    },
    extraReducers: (builder) => {
        builder.addCase('tags/fetchTags/fulfilled', (state, { payload }) => {
            state.companies = payload?.data?.filterData?.companies || [];
        });
    }
});

export const {
    handleTagToggle,
    handleProjectToggle,
    handleCompanyToggle,
    handleSelectAll,
    handleDeselectAll
} = selectionSlice.actions;

export default selectionSlice.reducer;
