import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { checkLoginAPI, loginAPI, registerAPI, logoutAPI, refreshTokenAPI } from '../api/auth';
import { saveAuthToken } from '../../utils/helper';

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
    async (data, { rejectWithValue }) => {
        try {
            const response = await loginAPI(data);
            // console.log('login API response >>>>>>>>>>>>>>> ',response)
            return response;
        } catch (error) {
            // Forward the API error body so the UI displays the real message
            // (RTK's miniSerializeError would otherwise strip error.response.data)
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

// ✅ Auto-refresh the access token when expiring
// Called by a middleware/interceptor when token has < 30 seconds remaining
export const refreshAccessToken = createAsyncThunk(
    'auth/refreshAccessToken',
    async (_, { getState, rejectWithValue }) => {
        try {
            console.log('🔄 [Redux Thunk] Requesting token refresh...');
            const response = await refreshTokenAPI();
            console.log('✅ [Redux Thunk] Token refresh successful');
            return response;
        } catch (error) {
            console.error('❌ [Redux Thunk] Token refresh failed:', error.message);
            // Return rejection to trigger logout
            return rejectWithValue(error.message || 'Token refresh failed');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (data, { rejectWithValue }) => {
        try {
            const response = await registerAPI(data);
            // console.log('register API response >>>>>>>>>>>>>>> ',response)
            return response;
        } catch (error) {
            // Forward the API error body so the UI displays the real message
            // (RTK's miniSerializeError would otherwise strip error.response.data)
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

// Calls POST /v2/api/auth/logout to expire httpOnly cookies on the server,
// then resets all auth state regardless of the API result (offline / expired
// token should still clear the local session).
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

const authSlice = createSlice({
    name: 'auth',
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
        expiresAt: null,     // ISO timestamp when token expires
        expiresIn: null,     // milliseconds until expiry
        status: 'idle',
        error: null,
        source: '',
        platform: '',
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
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
            state.expiresAt   = null;
            state.expiresIn   = null;
            state.accessToken = null;
            state.status      = 'idle';
            state.error       = null;
            
            // ✅ Clear stored tokens from storage
            sessionStorage.removeItem('refreshToken');
            localStorage.removeItem('refreshToken');
            sessionStorage.removeItem('authToken');
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
                state.platform = action.payload.platform;
                if(state.platform === 'sizingcore') {
                    state.source = action.payload?.source;
                    state.showLogin = true;
                }else{
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
                // console.log('🔍 Redux login.fulfilled - action.payload:', JSON.stringify(action.payload, null, 2));
                const localUserData= {
                    EmailId: action.payload.data?.user?.Email || action.payload.data?.user?.email || '',
                    Name: action.payload.data?.user?.Name   || action.payload.data?.user?.name   || '',
                    Id: String(action.payload.data?.user?.Id   || action.payload.data?.user?.id   || ''),
                }
                // console.log('🔍 Redux login.fulfilled - localUserData:', JSON.stringify(localUserData, null, 2));
                state.rolesData = action.payload.data?.rolesData || null;
                state.userDetails = localUserData || null;
                
                state.status = 'succeeded';
                state.userData = localUserData;
                state.preferences = action.payload.data?.preferences;
                state.accessToken = action.payload.data?.accessToken || null;  // ← SET accessToken for interceptor
                state.expiresAt = action.payload.data?.expiresAt;  // ✅ ISO timestamp when token expires
                state.expiresIn = action.payload.data?.expiresIn;  // ✅ Milliseconds until expiry
                state.isLoggedIn = true;
                
                // ✅ CRITICAL: Store refreshToken in storage for fallback token refresh
                // The refreshToken is NEVER sent by backend in JSON response (it's HTTP-only cookie)
                // But if cookie fails, we need it from somewhere. Store it from login response if available.
                // NOTE: In production, refreshToken should ONLY be in HTTP-only cookie, never in sessionStorage
                // This is a fallback for when cookies don't work (CORS, port issues, etc.)
                if (action.payload.data?.refreshToken) {
                //   console.log('✅ [Redux login] Storing refreshToken for fallback method');
                  sessionStorage.setItem('refreshToken', action.payload.data.refreshToken);
                  // Also store in localStorage as secondary backup
                  localStorage.setItem('refreshToken', action.payload.data.refreshToken);
                } else {
                  console.warn('⚠️  [Redux login] refreshToken not in response — will rely on HTTP-only cookie');
                }
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            // ✅ Handle token refresh
            .addCase(refreshAccessToken.pending, (state) => {
                // console.log('🔄 [Redux] Token refresh pending...');
                state.status = 'refreshing';
            })
            .addCase(refreshAccessToken.fulfilled, (state, action) => {
                // console.log('✅ [Redux] Token refresh fulfilled - updating state with new tokens');
                state.status = 'succeeded';
                state.accessToken = action.payload.data?.accessToken || null;
                state.expiresAt = action.payload.data?.expiresAt;
                state.expiresIn = action.payload.data?.expiresIn;
                state.error = null;  // Clear any previous errors
                // console.log('✅ [Redux] New expiresAt:', state.expiresAt);
            })
            .addCase(refreshAccessToken.rejected, (state, action) => {
                console.error('❌ [Redux] Token refresh failed:', action.payload);
                state.status = 'failed';
                state.error = action.payload || 'Token refresh failed';
                // Don't clear auth state here — let the interceptor/middleware handle logout
                // This allows the UI to show an error message before forcing a logout
            })
            .addCase(register.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(register.fulfilled, (state) => {
                state.status = 'succeeded';
                // On successful registration, just clear any errors
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
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

export const { setUser, changeEmailInput, logout, updatePreference,setLoginError, 
                setLoginSource, setLoginPlatform, setIsLoggedin, setUserData, setAccessToken } = authSlice.actions;

export default authSlice.reducer;