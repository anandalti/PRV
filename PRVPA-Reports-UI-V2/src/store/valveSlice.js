import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    sizingData: null,
};

export const valveSlice = createSlice({
    name: 'valveSlice',
    initialState,
    reducers: {
        updateSizingData(state, action) {
            state.sizingData = action.payload;
        },
    },
});

export const valveActions = valveSlice.actions;
