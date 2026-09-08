import axios from "../../utils/interceptor";

export const GetGenericData = async (endpoint) => {
    try {
        const response = await axios.get(endpoint);
        return response?.data;
    } catch (error) {
        // Re-throw so the caller's catch block can apply its own fallback.
        // Never return the raw axios error — it contains non-serializable functions
        // (e.g. config.transformRequest) that would end up in Redux state.
        throw error;
    }
}