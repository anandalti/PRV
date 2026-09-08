import { configureStore } from '@reduxjs/toolkit';
import checkAvailabilityReducer from './slices/checkAvailabilitySlice';

export const store = configureStore({
    reducer: {
        checkAvailability: checkAvailabilityReducer,
    },
});
