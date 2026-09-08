import axios from "axios";

const axiosService = axios.create({
  baseURL: process.env.VITE_CA_URL + '/api',
})


axiosService.interceptors.request.use(function (config) {
    // get the session auth token and pass in Authorization
    const authToken = sessionStorage.getItem('authToken');
    if (authToken) {
      config.headers.Authorization = 'Bearer ' + authToken;
    }
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });

axiosService.interceptors.response.use(function (response) {
  // console.log({response});
    if(response.status === 200) {
      return response.data;
    } else {
      throw new Error(response.error.message);
    }
  }, function (error) {
    console.log({error});
    return Promise.reject(error);
  });


export default axiosService;