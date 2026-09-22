import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { checkLoginAPI, loginAPI, logoutAPI } from '../api/auth';
import { saveAuthToken } from '../utils/helper';

export const checkLogin = createAsyncThunk(
    'auth/checkLogin',
    async () => {
        const {platform,source}=saveAuthToken();
        if(platform !=='gos'){
            return {platform,source};
        }
        const response = await checkLoginAPI();
        return {...response,platform};
        // console.log('checkLoginAPI response >>>>>>>>>>>>>>> ',response)
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async (data) => {
        const response = await loginAPI(data);
        // console.log('login API response >>>>>>>>>>>>>>> ',response)
        return response;
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async () => {
        try {
            await logoutAPI();
        } catch {
            // Ignore network / server errors — local session must always be cleared.
        }
    }
);

export const authSlice = createSlice({
    name: "auth",
    initialState: {
        rolesData: null,
        userDetails: null,
        isLoggedIn: false,
        preferences: null,
        showLogin: false,
        oktaLogin: false,
        emailInput: '',
        userData: null,
        accessToken: null,   // stored in memory only — never persisted to storage
        status: 'idle',
        error: null,
        source: '',
        platform: '',
    },
    reducers: {
        login(state) {
            state.isLoggedIn = true;
        },
        logout: (state) => {
            // Gap 4 — reset all auth-related state so ProtectedRoute re-evaluates
            state.user        = null;
            state.userData    = null;
            state.userDetails = null;
            state.rolesData   = null;
            state.preferences = null;
            state.isLoggedIn  = false;
            state.showLogin   = false;
            state.oktaLogin   = false;
            state.accessToken = null;
            state.status      = 'idle';
            state.error       = null;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        changeEmailInput: (state, action) => {
            state.emailInput = action.payload;
        },
        updatePreference: (state, action) => {
            state.preferences = action.payload;
        },
        setLoginError: (state, action) => {
            state.error = action.payload;
        },
        setLoginSource: (state, action) => {
            state.source = action.payload;
        },
        setLoginPlatform: (state, action) => {
            state.platform = action.payload;
        },
        setIsLoggedin : (state, action) => {
            state.isLoggedIn = action.payload;
        },
        setUserData : (state, action) => {
            state.userData = action.payload;
        },
        // Stores the accessToken in Redux memory only — not in localStorage,
        // sessionStorage, or a JS-readable cookie (CWE-1004 compliant).
        setAccessToken: (state, action) => {
            state.accessToken = action.payload;
        },
    },
        extraReducers: (builder) => {
        builder
            .addCase(checkLogin.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(checkLogin.fulfilled, (state, action, ) => {
                state.status = 'succeeded';
                state.isLoggedIn = true;
                state.platform = action.payload.platform;
                if(state.platform === 'sizingcore') {
                    state.source = action.payload?.source;
                    state.showLogin = true;
                } else {
                    state.rolesData = Object.keys(action.payload).reduce((acc, key) => {
                        acc[key] = action.payload[key] === 'null' ? null : action.payload[key];
                        return acc;
                    }, {});
                    state.userDetails = action.payload.userDetails;
                    if(state.userDetails.userMailId !== 'localUser') {
                        state.oktaLogin = true;
                    } else {
                        state.showLogin = true;
                    }
                }
            })
            .addCase(checkLogin.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
                state.rolesData = null;
            })
            .addCase(login.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(login.fulfilled, (state, action) => {
                const localUserData= {
                    EmailId: action.payload.data?.user?.EmailId || '',
                    Name: action.payload.data?.user?.Name || '',
                    Id: action.payload.data?.user?.Id || '',
                }
                state.rolesData = action.payload.data?.rolesData || null;
                state.userDetails = localUserData || null;
                
                state.status = 'succeeded';
                state.userData = localUserData;
                state.preferences = action.payload.data?.preference;
                state.isLoggedIn = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            // logoutUser — clear auth state on both fulfilled and rejected so
            // the local session is always terminated even if the API is unreachable.
            .addCase(logoutUser.fulfilled, (state) => {
                state.user        = null;
                state.userData    = null;
                state.userDetails = null;
                state.rolesData   = null;
                state.preferences = null;
                state.isLoggedIn  = false;
                state.showLogin   = false;
                state.oktaLogin   = false;
                state.status      = 'idle';
                state.error       = null;
            })
            .addCase(logoutUser.rejected, (state) => {
                state.user        = null;
                state.userData    = null;
                state.isLoggedIn  = false;
                state.status      = 'idle';
            })
    }
});

export const {
    setUser,
    changeEmailInput,
    logout,
    updatePreference,
    setLoginError,
    setLoginSource,
    setLoginPlatform,
    setIsLoggedin,
    setUserData,
    setAccessToken,
} = authSlice.actions;

export const authActions = authSlice.actions;

export default authSlice.reducer;