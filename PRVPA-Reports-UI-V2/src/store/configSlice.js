import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    configData: null,
};

export const configSlice = createSlice({
    name: 'configSlice',
    initialState,
    reducers: {
        updateConfigData(state, action) {
            state.configData = action.payload;
        },
    },
});

export const configActions = configSlice.actions;
