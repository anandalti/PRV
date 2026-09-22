import axios from 'axios';

const axiosService = axios.create({
    baseURL: process.env.VITE_API_URL,
})

axiosService.interceptors.response.use(
    (response) => {
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(response.payload.error);
        }
    },
    (error) => {
        return Promise.reject(error.response?.data?.error ?? error.message);
    }
);

export default axiosService;