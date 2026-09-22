import axios from '../utils/interceptor';

export const fetchUOMAPI = async () => {
    const response = await axios({
        method: "GET",
        url: `${process.env.VITE_API_URL}/uom`,
        headers: { 'Content-Type': 'application/json' }
    });
    return response;
}

export const fetchSizingDetailsAPI = async (sizingId) => {
    const response = await axios({
        method: "GET",
        url: `${process.env.VITE_API_URL}/reports/getSizingDetails?sizingId=${sizingId}`,
        headers: { 'Content-Type': 'application/json' }
    });
    return response;
}

export const fetchConfigDetailsAPI = async (data) => {
    const response = await axios({
        data,
        method: "POST",
        url: `${process.env.VITE_API_URL}/reports/getConfigDetails`,
        headers: { 'Content-Type': 'application/json' }
    });
    return response;
}

export const fetchDimensionDetailsAPI = async (data) => {
    const response = await axios({
        data,
        method: "POST",
        url: `${process.env.VITE_API_URL}/reports/getDimensionDetails`,
        headers: { 'Content-Type': 'application/json' }
    });
    return response;
}

export const performCalculationsAPI = async (payload) => {
    const response = await axios({
        method: "POST",
        url: `${process.env.VITE_API_URL}/reports/performCalculations`,
        data: payload,
        headers: { 'Content-Type': 'application/json' }
    });
    return response;
}

export const fetchTemplateData = async (sizingId, reportType, configId) => {
    const response = await axios({
        method: 'POST',
        url: `${process.env.VITE_API_URL}/reports/htmlRouter/getHtmlTableTemplate/${sizingId}/${reportType}/${configId}`,
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response;
}

export const updateTagRevisionsAPI = async (payload) => {
    const response = await axios({
        method: "POST",
        url: `${process.env.VITE_API_URL}/TagRevisions/update`,
        data: payload,
        headers: { 'Content-Type': 'application/json' }
    });
    return response;
}

export const addProjectDetailsAPI = async (data) => {
    const response = await axios({
        method: "POST",
        url: `${process.env.VITE_API_URL}/project/`,
        data,
        headers: { 'Content-Type': 'application/json' }
    });
    return data[0];
}

export const updateTagPropertyAPI = async (data) => {
    const response = await axios({
        method: "POST",
        url: `${process.env.VITE_API_URL}/tagproperty/`,
        data,
        headers: { 'Content-Type': 'application/json' }
    });
    return data[0];
};

export const fetchTagPropertiesBySizingIdAPI = async (sizingId) => {
    const response = await axios({
        method: "GET",
        url: `${process.env.VITE_API_URL}/tagproperty/${sizingId}`,
        headers: { 'Content-Type': 'application/json' }
    });
    return response;
}