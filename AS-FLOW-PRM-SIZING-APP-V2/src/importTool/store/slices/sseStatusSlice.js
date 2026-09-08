import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  jobId: null,
  status: 'idle',
  messages: [],
  lastMessage: null,
  completedAt: null,
};

const sseStatusSlice = createSlice({
  name: 'sseStatus',
  initialState,
  reducers: {
    setSseJobId: (state, action) => {
      state.jobId = action.payload;
    },
    setSseStatus: (state, action) => {
      state.status = action.payload;
      if (action.payload === 'completed' || action.payload === 'success') {
        state.completedAt = Date.now();
      }
    },
    addSseMessage: (state, action) => {
      const messagePayload = action.payload;
      state.messages.push(messagePayload);
      state.lastMessage = messagePayload;
    },
    clearSseStatus: (state) => {
      state.jobId = null;
      state.status = 'idle';
      state.messages = [];
      state.lastMessage = null;
      state.completedAt = null;
    },
  },
});

export const { setSseJobId, setSseStatus, addSseMessage, clearSseStatus } = sseStatusSlice.actions;

export default sseStatusSlice.reducer;
