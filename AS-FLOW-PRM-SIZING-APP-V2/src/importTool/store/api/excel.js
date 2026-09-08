import axios from "../../utils/interceptor";

const uploadExcelAPI = async (payload) => {
    // payload: { sourceFileBase64: string }
    try {
        const response = await axios.post('/excel', payload);
        return response;
    } catch (error) {
        console.error('Error uploading excel file:', error);
        throw error;
    }
};

export { uploadExcelAPI };
