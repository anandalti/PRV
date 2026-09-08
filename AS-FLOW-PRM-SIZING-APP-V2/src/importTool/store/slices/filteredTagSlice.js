import { createSlice } from '@reduxjs/toolkit';

const filteredTagSlice = createSlice({
    name: 'filteredTags',
    initialState: {
        filteredTags: [],
        selectedCompanies: [],
        selectedProjects: [],
        expandedCompanies: [],
        expandedProjects: [],
    },
    reducers: {
        setFilteredTags: (state, action) => {
            state.filteredTags = action.payload;
        },
        setSelectedCompanies: (state, action) => {
            state.selectedCompanies = action.payload;
        },
        setSelectedProjects: (state, action) => {
            state.selectedProjects = action.payload;
        },
        setExpandedCompanies: (state, action) => {
            state.expandedCompanies = action.payload;
        },
        setExpandedProjects: (state, action) => {
            state.expandedProjects = action.payload;
        },
        onSelectDeselectAll: (state, action) => {
            const { selectAll, companies, projects } = action.payload;
            if(selectAll) {
                state.selectedCompanies = companies;
                state.selectedProjects = projects;
                state.filteredTags = tags; // Clear filtered tags when selecting all
            } else {
                state.selectedCompanies = [];
                state.selectedProjects = [];
                state.filteredTags = []; // Clear filtered tags when deselecting all
            }
        },
        onExpandCollapseAll: (state, action) => {
            const { expandAll, companies, projects } = action.payload;
            if(expandAll) {
                state.expandedCompanies = companies;
                state.expandedProjects = projects;
            } else {
                state.expandedCompanies = [];
                state.expandedProjects = [];
            }
        }
    }
});

export const { setFilteredTags, setExpandedCompanies, setExpandedProjects } = filteredTagSlice.actions;
export default filteredTagSlice.reducer;
