import { WF_BACKEND_CONFIGURATION_FLAG } from "../../utils/constants";
import axios from "../../utils/interceptor";
import { USE_GRAPHQL } from "./apiConfig";
import { graphqlClient } from "../../utils/graphqlClient";
import { GET_SIZING_DETAILS_BY_SIZING_ID_QUERY } from "./graphql/queries";

/**
 * Fetch workflow data - REST only (Phase 1: GraphQL for auth endpoints only)
 */
export const fetchWorkflowsAPI = async () => {
    try {
        const response = await axios.get("/GetWorkflowData");
        return response;
    } catch (error) {
        console.error('fetchWorkflowsAPI error:', error);
        return error;
    }
}
export const updateUserPreferenceAPI = async (id, payload) => {
    try {
        console.log(payload, 'payload updateUserPreferenceAPI')
        const response = await axios.put(`/UserPreferences/${id}`, payload);
        return response;
    } catch (error) {
        console.error('updateUserPreferenceAPI error:', error);
        return error;
    }
}
export const fetchUomAPI = async (userId) => {
    try {
        let url = null;
        if(WF_BACKEND_CONFIGURATION_FLAG){
            url = `/uom/uomDetails?userId=${userId}`;
        } else {
            url = '/uom';
        }
        const response = await axios.get(url);
        return response;
    } catch (error) {
        console.error('fetchUomAPI error:', error);
        return error;
    }
}
export const getSizingDetailsAPI = async (id) => {
    try {
        let response = null;
        if(WF_BACKEND_CONFIGURATION_FLAG){
            response = await axios.get(`/getSizing/SizingId?Id=${id}`);
            return response;
        }
        response = await axios.get(`/getSizing/SizingId?Id=${id}`);
        return response;
    } catch (error) {
        console.error('getSizingDetailsAPI error:', error);
        return error;
    }
}

export const getMySizingAPI = async (userId) => {
    try{
        let url = null;
        if(WF_BACKEND_CONFIGURATION_FLAG){
            url = `/getSizing/MySizing?userId=${userId}`;
        } else {
            url = '/getSizing/MySizing';
        }
        const response = await axios.get(url);
        return response;
    } catch (error) {
        console.error('getMySizingAPI error:', error);
        return error;
    }
}

export const getRestrictedLiftPopupDetailsAPI = async (url) => {
    try {
        if (!url) throw new Error('Restricted lift popup URL is undefined');
        const localURL= url.split('{baseURL}')
        const response = await axios.get(localURL[1]);
        return response;
    } catch (error) {
        throw error;
    }
}

export const searchSizingBySizingIdAPI = async (sizingId) => {
    if (USE_GRAPHQL) {
        try {
            const gqlResponse = await graphqlClient.query({
                query: GET_SIZING_DETAILS_BY_SIZING_ID_QUERY,
                variables: { sizingId: String(sizingId) },
                fetchPolicy: 'network-only',
            });
            if (gqlResponse.errors?.length > 0) throw new Error(gqlResponse.errors[0].message);
            // return gqlResponse.data.sizingDetailsBySizingId.data;
            return gqlResponse.data.sizingDetailsBySizingId;
        } catch (error) {
            console.error('[GraphQL] searchSizingBySizingIdAPI fallback to REST:', error.message);
        }
    }
    try{
        const response = await axios.get(`/getSizing/SizingDetailsBySizingId?SizingId=${sizingId}`);
        return response;
    } catch (error) {
        return error;
    }
}

export const searchAPI521PopupDetailsBySizingId = async (sizingId) => {
    try{
        const response = await axios.get(`/API521FlowRateReq/sizingid/${sizingId}`);
        return response;
    } catch (error) {
        return error;
    }
}

export const fetchBrands = async () => {
    try {
        const response = await axios.get("/Brands");
        return response;
    } catch (error) {
        return error;
    }
}

export const fetchModels = async () => {
    try {
        const response = await axios.get("/Models");
        return response;
    } catch (error) {
        return error;
    }
}

export const fetchOrifice = async () => {
    try {
        const response = await axios.get("/Valves");
        return response;
    } catch (error) {
        return error;
    }
}

export const fetchGenericValves = async (config) => {
  try {
    const response = await axios.post("/genericValves", config);
    return response;
  } catch (error) {
    return error;
  }
};