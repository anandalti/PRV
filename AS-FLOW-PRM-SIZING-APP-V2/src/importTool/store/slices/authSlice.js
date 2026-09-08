import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loginAPI, validateSessionAPI } from '../api/auth';

export const login = createAsyncThunk(
    'auth/login',
    async (data, { rejectWithValue }) => {
        try {
            const response = await loginAPI(data);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const validateSession = createAsyncThunk(
    'auth/validateSession',
    async (_, { rejectWithValue }) => {
        try {
            const response = await validateSessionAPI();
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        isLoading: false,
        isLoggedIn: false, // Legacy field, keeping for compatibility
        isAuthorized: !!sessionStorage.getItem('authToken'), // Initialize from storage
        error: null,
        emailInput: '',
    },
    reducers: {
        setEmailInput: (state, action) => {
            state.emailInput = action.payload;
        },
        restoreSession: (state) => {
            const token = sessionStorage.getItem('authToken');
            if (token) {
                state.isAuthorized = true;
                state.error = null;
            }
        },
        setUnAuthorized: (state) => {
            state.isAuthorized = false;
            state.error = 'Unauthorized access';
            sessionStorage.removeItem('authToken');
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(validateSession.fulfilled, (state, action) => {
                state.isAuthorized = true;
                state.isLoading = false;
                state.error = null;
                state.user = action.payload.user || null;
            })
            .addCase(validateSession.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(validateSession.rejected, (state) => {
                state.isLoading = false;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isAuthorized = true;
                state.error = null;
                state.user = action.payload.user || null;
                state.isLoading = false;
            })
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                console.error('Login API Rejected:', action.error);
                state.isLoading = false;
                state.isAuthorized = false;
                state.error = action.error?.message || 'Unauthorized access';
                sessionStorage.removeItem('authToken');
            });
    },
});

export const { setEmailInput, setUnAuthorized, restoreSession } = authSlice.actions;
export default authSlice.reducer;