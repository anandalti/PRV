import axios from "axios";

// Lazy store reference — avoids circular dependency:
// interceptor.js ← store.js ← authSlice.js ← api/auth.js ← interceptor.js
// Call injectStore(store) from main.jsx after the store is created.
let _store;
let _logoutUser;
export const injectStore = (store, logoutUser) => {
  _store = store;
  _logoutUser = logoutUser;
};


const REFRESH_URL = `${process.env.VITE_API_URL}/auth/refresh-token`;

// Prevents multiple simultaneous refresh calls when several requests fail at once.
let isRefreshing = false;
// Holds resolve/reject callbacks for requests queued during a refresh.
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

const axiosService = axios.create({
  baseURL: process.env.VITE_API_URL,
  withCredentials: true,
});

// ─── Request interceptor ──────────────────────────────────────────────────────
// Read accessToken from Redux memory state (set after login) and forward as
// Authorization: Bearer <token>. The token is never stored in localStorage,
// sessionStorage, or a JS-readable cookie — only in memory.
axiosService.interceptors.request.use(
  (config) => {
    // const authToken = sessionStorage.getItem('authToken'); // legacy sessionStorage approach
    const accessToken = _store?.getState()?.auth?.accessToken;
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
    if (response.status === 200) {
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
        // Call refresh endpoint using plain axios (not axiosService) to avoid
        // triggering this interceptor again. Browser auto-sends the httpOnly
        // refreshToken cookie because withCredentials: true is set.
        const refreshResponse = await axios.post(REFRESH_URL, {}, { withCredentials: true });

        // Store the new accessToken in Redux memory so the request interceptor
        // can attach it as Authorization: Bearer <token> on retried/future requests.
        const newAccessToken = refreshResponse.data?.data?.accessToken;
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
        processQueue(refreshError);
        if (_store && _logoutUser) _store.dispatch(_logoutUser());
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const serverMessage = error?.response?.data?.error
      || error?.response?.data?.message
      || (Array.isArray(error?.response?.data?.errors) && error.response.data.errors[0])
      || error?.response?.statusText
      || error?.message;

    const apiError = new Error(serverMessage);
    apiError.response = error.response;
    return Promise.reject(apiError);
  }
);

export default axiosService;
