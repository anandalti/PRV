//import axios from "axios";
import axios from '../../utils/interceptor';
export const UPDATE_TAG_PROPERTIES = 'UPDATE_TAG_PROPERTIES';

export const updateTagProperties = (payload) => ({
    type: UPDATE_TAG_PROPERTIES,
    payload,
});

export const FETCH_TAG_PROPERTIES_SUCCESS = "FETCH_TAG_PROPERTIES_SUCCESS";

export const fetchTagPropertiesBySizingId = (sizingId) => async (dispatch) => {
    try {
        const apiUrl = `${process.env.VITE_API_URL}/tagproperty/${sizingId}`;
        const response = await axios.get(apiUrl);
        dispatch({
            type: FETCH_TAG_PROPERTIES_SUCCESS,
            payload: response.data
        });
    } catch (error) {
        console.error("Error fetching tag properties:", error);
    }
};
