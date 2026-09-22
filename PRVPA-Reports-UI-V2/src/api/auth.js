import axios from "../utils/interceptor";
import plainAxios from 'axios';

const API_BASE = process.env.VITE_API_URL;

export const checkLoginAPI = () => {
    return axios.get("/role");
}

export const loginAPI = (data) => {
    return axios.post("/login", data);
}

// Uses plain axios so the httpOnly cookie is sent and the 200 response is not
// intercepted/transformed by the custom axiosService interceptor.
export const logoutAPI = () => {
    return plainAxios.post(
        `${API_BASE}/auth/logout`,
        {},
        { withCredentials: true }
    );
}