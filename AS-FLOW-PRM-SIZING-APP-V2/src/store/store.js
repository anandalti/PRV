import { configureStore } from '@reduxjs/toolkit';
import authSliceReducer from './slices/authSlice';
import layoutSliceReducer from './slices/layoutSlice';
import navigationReducer from './slices/navigationSlice';
import preferenceReducer from './slices/preferenceSlice';
import workflowSliceReducer from './slices/workflowSlice';
import workflowPayloadSliceReducer from './slices/workflowPayloadSlice';
import uomSliceReducer from './slices/uomSlice';
import genericSliceReducer from './slices/genericSlice';
import genericValveSizingSliceReducer from './slices/genericValveSizingSlice';
import configurationSliceReducer from './slices/configurationSlice';

export const store = configureStore({
  reducer: {
    auth: authSliceReducer,
    layout: layoutSliceReducer,
    navigation: navigationReducer,
    workflow: workflowSliceReducer,
    workflowPayload: workflowPayloadSliceReducer,
    preference: preferenceReducer,
    uom: uomSliceReducer,
    generic: genericSliceReducer,
    genericValveSizing: genericValveSizingSliceReducer,
    configuration: configurationSliceReducer,
  },
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware();
    return middleware;
  },
});