import axios from "../../utils/interceptor";

const fetchPayloadAPI = async (fileUploadID) => {
    try {
        // backend expects { fileUploadID }
        const resp = await axios.post('/payload', { fileUploadID });
        return resp;
    } catch (error) {
        console.error('Error fetching payload for fileUploadID:', fileUploadID, error);
        throw error;
    }
};

export { fetchPayloadAPI };
