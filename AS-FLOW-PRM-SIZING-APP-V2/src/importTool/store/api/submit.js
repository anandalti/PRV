import axios from "../../utils/interceptor";

const submitToOracleAPI = async (payload) => {
    try {
        // Submit the sale order payload directly to the backend submit endpoint
        const resp = await axios.post('/payload/submitSalesOrder', payload);
        return resp;
    } catch (error) {
        console.error('Error submitting payload to Oracle:', error);
        throw error;
    }
};

export { submitToOracleAPI };
