'use strict';

const makePayload = (message, data, code = 'OK') => ({
    success: true,
    message,
    code,
    data,
    errors: [],
});

module.exports = {
    makePayload,
};
