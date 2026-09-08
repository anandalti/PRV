import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    factory: 'Stafford (SAP, 1101)',
    customerId: '',
    quoteId: '',
};

const headerSlice = createSlice({
    name: 'header',
    initialState,
    reducers: {
        setFactory: (state, action) => {
            state.factory = action.payload;
        },
        setCustomerId: (state, action) => {
            state.customerId = action.payload;
        },
        setQuoteId: (state, action) => {
            state.quoteId = action.payload;
        },
    }
});

export const {
    setFactory,
    setCustomerId,
    setQuoteId,
} = headerSlice.actions;

export default headerSlice.reducer;
