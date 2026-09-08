const axios = require('axios');

const getOcipHeaders = (requestType) => {
    const subscriptionKey = process.env.OCIP_SUBSCRIPTION_KEY
        || process.env.Ocp_Apim_Subscription_Key;

    const headerConfig = requestType === 'orderStatus'
        ? {
            senderId: process.env.ORDER_STATUS_SENDER_ID || 'PRV001',
            targetId: process.env.ORDER_STATUS_TARGET_ID || 'OGSI',
            businessGroup: process.env.ORDER_STATUS_BUSINESS_GROUP || 'SSOP'
        }
        : {
            senderId: process.env.CUSTOMER_PARTY_SENDER_ID || 'AUTOBOT',
            targetId: process.env.CUSTOMER_PARTY_TARGET_ID || 'OGSI',
            businessGroup: process.env.CUSTOMER_PARTY_BUSINESS_GROUP || 'GRP'
        };

    const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': subscriptionKey
    };

    if (headerConfig.senderId) headers.SenderID = headerConfig.senderId;
    if (headerConfig.targetId) headers.TargetID = headerConfig.targetId;
    if (headerConfig.businessGroup) headers.Businessgroup = headerConfig.businessGroup;

    return { headers, subscriptionKey };
};

const postWithOcipHeaders = async (apiUrl, payload, requestType, errorLabel) => {
    if (!apiUrl) {
        throw new Error(`${errorLabel} API URL is not configured`);
    }

    const { headers, subscriptionKey } = getOcipHeaders(requestType);

    if (!subscriptionKey) {
        throw new Error(`${errorLabel} OCIP subscription key is not configured`);
    }

    try {
        const response = await axios.post(apiUrl, payload, {
            headers,
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
            `${errorLabel} API failed with status ${statusCode}`
        );

        apiError.statusCode = statusCode;
        apiError.responseBody = responseBody;

        throw apiError;
    }
};

const callSalesOrderApi = async (payload) => {
    const apiUrl = process.env.SALES_ORDER_API_URL;
    return postWithOcipHeaders(apiUrl, payload, 'customerParty', 'Sales Order');
};

const callOrderStatusApi = async (payload) => {
    const apiUrl = process.env.ORDER_STATUS_API_URL;
    return postWithOcipHeaders(apiUrl, payload, 'orderStatus', 'Order Status');
};

module.exports = {
    callSalesOrderApi,
    callOrderStatusApi
};