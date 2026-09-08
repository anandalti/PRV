const axios = require('axios');

const callSalesOrderApi = async (payload) => {
    const apiUrl = process.env.SALES_ORDER_API_URL;
    const subscriptionKey = process.env.SALES_ORDER_SUBSCRIPTION_KEY;

    if (!apiUrl) {
        throw new Error('SALES_ORDER_API_URL is not configured');
    }

    if (!subscriptionKey) {
        throw new Error('SALES_ORDER_SUBSCRIPTION_KEY is not configured');
    }

    try {
        const response = await axios.post(apiUrl, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Ocp-Apim-Subscription-Key': subscriptionKey
            },
            timeout: 60000
        });

        return {
            statusCode: response.status,
            responseBody: response.data
        };
    } catch (error) {
        const statusCode = error.response?.status || 500;
        const responseBody = error.response?.data || null;

        const apiError = new Error(
            `Sales Order API failed with status ${statusCode}`
        );

        apiError.statusCode = statusCode;
        apiError.responseBody = responseBody;

        throw apiError;
    }
};

const callCustomerPartyApi = async (queryParams) => {
    const apiUrl = process.env.CUSTOMER_PARTY_API_URL;
    const subscriptionKey = process.env.CUSTOMER_PARTY_SUBSCRIPTION_KEY;

    if (!apiUrl) {
        throw new Error('CUSTOMER_PARTY_API_URL is not configured');
    }

    if (!subscriptionKey) {
        throw new Error('CUSTOMER_PARTY_SUBSCRIPTION_KEY is not configured');
    }

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'Ocp-Apim-Subscription-Key': subscriptionKey
            },
            params: queryParams,
            timeout: 60000
        });

        return {
            statusCode: response.status,
            responseBody: response.data
        };
    } catch (error) {
        const statusCode = error.response?.status || 500;
        const responseBody = error.response?.data || null;

        const apiError = new Error(
            `Customer Party API failed with status ${statusCode}`
        );

        apiError.statusCode = statusCode;
        apiError.responseBody = responseBody;

        throw apiError;
    }
}

module.exports = {
    callSalesOrderApi,
    callCustomerPartyApi
};