const UIRequest = require("../models/UIRequest");

const logUIRequest = (payload) => {
    
    try {
        const createUIRequest = UIRequest.createUIRequest(payload);
        console.log('UI Request logged successfully:', createUIRequest);
    } catch (error) {
        console.error('Error logging UI request:', error);
    } 
};

module.exports = { logUIRequest };