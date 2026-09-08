import axios from "../../utils/interceptor";

const fetchTagsAPI = async () => {
    try {
        const response = await axios.get('/tags/list');
        console.log('list tag data:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching tags:', error);
        throw error;
    }
};

const bomSolveAPI = async (payload) => {
    console.log('Incoming request:', payload);
    try {
        const response = await axios.post('/bom-solve', payload);
        return response.data;
    } catch (error) {
        console.error('Error in bom-solve:', error);
        throw error;
    }
};

const updateTagNameAPI = async (payload) => {
    // payload: [{ id, newName }]
    const response = await axios.patch('/tags/tagNumbers', payload);
    return response;
};

export { fetchTagsAPI, updateTagNameAPI, bomSolveAPI };
