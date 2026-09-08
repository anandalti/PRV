import { createSlice } from '@reduxjs/toolkit';

const layoutSlice = createSlice({
    name: 'layout',
    initialState: {
        tabs: [
            { id: 'tagDetails', label: 'Tag Details' },
            { id: 'sizing', label: 'Sizing' },
            { id: 'configuration', label: 'Configuration' },
            { id: 'pricing', label: 'Pricing' },
            { id: 'bom', label: 'BOM' },
        ],
        activeTab: 'tagDetails',
        isLeftPanelVisible: true,
        hasUnsavedChanges: false,
        viewMode: 'standard', // 'standard' or 'import'
        isImportModalOpen: false,
        showOrderSheetTab: false,
        isOrderMapped: false,
    },
    reducers: {
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        },
        toggleLeftPanel: (state) => {
            state.isLeftPanelVisible = !state.isLeftPanelVisible;
        },
        setHasUnsavedChanges: (state, action) => {
            state.hasUnsavedChanges = action.payload;
        },
        setViewMode: (state, action) => {
            state.viewMode = action.payload;
        },
        setImportModalOpen: (state, action) => {
            state.isImportModalOpen = action.payload;
        },
        setLeftPanelVisible: (state, action) => {
            state.isLeftPanelVisible = action.payload;
        },
        setShowOrderSheetTab: (state, action) => {
            state.showOrderSheetTab = action.payload;
        },
        setIsOrderMapped: (state, action) => {
            state.isOrderMapped = action.payload;
        }
    },
});

export const { setActiveTab, toggleLeftPanel, setHasUnsavedChanges, setViewMode, setImportModalOpen, setLeftPanelVisible, setShowOrderSheetTab, setIsOrderMapped } = layoutSlice.actions;
export default layoutSlice.reducer;