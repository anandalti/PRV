import axios from '../../utils/interceptor';

const loginAPI = (data) => {
    try {
        return axios.post('/auth/login', {token: data.token});
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }

};

const validateSessionAPI = () => axios.get('/auth/validate');

export { loginAPI, validateSessionAPI };