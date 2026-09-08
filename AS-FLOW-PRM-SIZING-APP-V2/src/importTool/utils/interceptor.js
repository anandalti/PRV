import axios from "axios";

const axiosService = axios.create({
  baseURL: process.env.VITE_IMPORT_TOOL_API_URL,
  withCredentials: true
})

const REFRESH_URL = `${process.env.VITE_IMPORT_TOOL_API_URL}/auth/refresh-token`;
// Prevents multiple simultaneous refresh calls when several requests fail at once.
let isRefreshing = false;
// Holds resolve/reject callbacks for requests queued during a refresh.
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

// Add a request interceptor
axiosService.interceptors.request.use(function (config) {
  // get the session auth token and pass in Authorization

  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

// Add a response interceptor
axiosService.interceptors.response.use((response) => {
  // console.log({response});
  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(response.error.message);
  }
}, async (error) => {
 const originalRequest = error.config;
    const status    = error?.response?.status;
    const errStatus = error?.response?.data?.message;

    // Auto-refresh: only on Token_Expired 401, and never retry the retry itself.
    if (status === 401 && errStatus === 'Authorization token missing' && !originalRequest._retry) {
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
        processQueue(null);
        return axiosService(originalRequest);
      } catch (refreshError) {
        // refreshToken is expired or invalid — force logout and redirect to login.
        processQueue(refreshError);
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
});

export default axiosService;