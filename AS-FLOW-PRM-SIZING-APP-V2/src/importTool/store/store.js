import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import filteredTagReducer from './slices/filteredTagSlice';
import tagsReducer from './slices/tagsSlice';
import layoutReducer from './slices/layoutSlice';
import selectionReducer from './slices/selectionSlice';
import headerReducer from './slices/headerSlice';
import sseStatusReducer from './slices/sseStatusSlice';
// #added import
import logger from 'redux-logger';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    filteredTags: filteredTagReducer,
    layout: layoutReducer,
    tags: tagsReducer,
    selection: selectionReducer,
    header: headerReducer,
    sseStatus: sseStatusReducer,
  },
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware();
    if (process.env.NODE_ENV === 'development') {
      middleware.push(logger);
    }
    return middleware;
  },
});