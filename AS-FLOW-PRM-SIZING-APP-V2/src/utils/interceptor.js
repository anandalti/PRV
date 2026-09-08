import axios from "axios";
import { USE_GRAPHQL, REST_API_BASE } from "../store/api/apiConfig";
import { graphqlClient } from "./graphqlClient";
import { REFRESH_TOKEN_MUTATION } from "../store/api/graphql/queries";

// Lazy store reference — avoids circular dependency:
// interceptor.js ← store.js ← authSlice.js ← api/auth.js ← interceptor.js
// Call injectStore(store) from main.jsx after the store is created.
let _store;
let _logoutUser;
export const injectStore = (store, logoutUser) => {
  _store = store;
  _logoutUser = logoutUser;
};

// REFRESH_URL: Use REST prefix when in REST mode; GraphQL mode uses Apollo Client
const REFRESH_URL = USE_GRAPHQL
  ? null // GraphQL uses Apollo Client for token refresh
  : `${import.meta.env.VITE_API_URL}/v2/api/auth/refresh-token`; // REST mode with /v2/api prefix

// Prevents multiple simultaneous refresh calls when several requests fail at once.
let isRefreshing = false;
// Holds resolve/reject callbacks for requests queued during a refresh.
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

const axiosService = axios.create({
  baseURL: REST_API_BASE,
  withCredentials: true,
});

// DEBUG: Log axios configuration
if (typeof window !== 'undefined') {
  console.log('🔍 DEBUG interceptor.js - Axios baseURL:', REST_API_BASE);
  console.log('🔍 DEBUG interceptor.js - REFRESH_URL:', REFRESH_URL);
}

// ─── Request interceptor ──────────────────────────────────────────────────────
// Read accessToken from Redux memory state (set after login) and forward as
// Authorization: Bearer <token>. The token is never stored in localStorage,
// sessionStorage, or a JS-readable cookie — only in memory.
// 
// Also checks if token has expired before sending request. If expired, triggers
// refresh to avoid 401 errors.
axiosService.interceptors.request.use(
  (config) => {
    // const authToken = sessionStorage.getItem('authToken'); // legacy sessionStorage approach
    const authState = _store?.getState()?.auth;
    const accessToken = authState?.accessToken;
    const expiresAt = authState?.expiresAt;  // ISO timestamp
    
    // ✅ Proactive check: if token already expired, log warning
    if (accessToken && expiresAt) {
      const now = new Date();
      const expiration = new Date(expiresAt);
      
      if (now >= expiration) {
        console.warn('⚠️ Token already expired at', expiresAt, '- Response interceptor will trigger refresh');
      }
    }
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ─────────────────────────────────────────────────────
axiosService.interceptors.response.use(
  (response) => {
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    throw new Error(response.error?.message);
  },
  async (error) => {
    const originalRequest = error.config;
    const status    = error?.response?.status;
    const errStatus = error?.response?.data?.status;

    // Auto-refresh: only on Token_Expired 401, and never retry the retry itself.
    if (status === 401 && errStatus === 'Token_Expired' && !originalRequest._retry) {
      if (isRefreshing) {
        // Another refresh is already in flight — queue this request and wait.
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosService(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        let refreshResponse;

        if (USE_GRAPHQL) {
          // GraphQL Mode: Use Apollo Client mutation for token refresh
          console.log('🟢 GraphQL Mode: Refreshing token via REFRESH_TOKEN_MUTATION');
          try {
            const result = await graphqlClient.mutate({
              mutation: REFRESH_TOKEN_MUTATION,
            });
            refreshResponse = {
              data: result.data.refreshToken,
            };
          } catch (graphqlError) {
            console.error('🔴 GraphQL token refresh failed:', graphqlError.message);
            throw graphqlError;
          }
        } else {
          // REST Mode: Use plain axios to avoid triggering this interceptor again.
          // Browser auto-sends the httpOnly refreshToken cookie because
          // withCredentials: true is set.
          console.log('🟢 REST Mode: Refreshing token via POST /v2/api/auth/refresh-token');
          refreshResponse = await axios.post(
            REFRESH_URL,
            {},
            { withCredentials: true }
          );
        }

        // Store the new accessToken in Redux memory so the request interceptor
        // can attach it as Authorization: Bearer <token> on retried/future requests.
        // GraphQL refresh: refreshResponse.data = { success, message, code, accessToken, errors }
        // REST refresh:    refreshResponse.data = { status, message, data: { accessToken, ... } }
        const newAccessToken = refreshResponse.data?.accessToken          // GraphQL path
                            || refreshResponse.data?.data?.accessToken    // REST path
                            || refreshResponse.data?.token;               // legacy fallback
        if (_store && newAccessToken) {
          // Dispatch via plain action object — avoids a dynamic import of authSlice
          // which would conflict with the static imports in the rest of the app.
          _store.dispatch({ type: 'auth/setAccessToken', payload: newAccessToken });
        }

        // Unblock the queue.
        processQueue(null);
        return axiosService(originalRequest);
      } catch (refreshError) {
        // refreshToken is expired or invalid — force logout and redirect to login.
        console.error('🔴 Token refresh failed:', refreshError.message);
        processQueue(refreshError);
        if (_store && _logoutUser) _store.dispatch(_logoutUser());
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosService;
