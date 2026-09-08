'use strict';

const mapTransportError = (error, fallbackMessage = 'Internal server error') => {
    const statusCode = error?.statusCode || error?.status || 500;
    const code = statusCode === 400
        ? 'BAD_USER_INPUT'
        : statusCode === 401
            ? 'UNAUTHENTICATED'
            : statusCode === 403
                ? 'FORBIDDEN'
                : statusCode === 404
                    ? 'NOT_FOUND'
                    : 'INTERNAL_SERVER_ERROR';

    return {
        statusCode,
        code,
        message: statusCode < 500 ? (error?.message || fallbackMessage) : fallbackMessage,
        details: error?.details || (error?.messages ? { messages: error.messages } : null),
    };
};

const toRestErrorResponse = (error, fallbackMessage = 'Internal server error') => {
    const mapped = mapTransportError(error, fallbackMessage);
    const body = {
        status: 'error',
        message: mapped.message,
        code: mapped.code,
    };

    if (mapped?.details?.messages) {
        body.messages = mapped.details.messages;
    }

    return {
        statusCode: mapped.statusCode,
        body,
    };
};

module.exports = {
    mapTransportError,
    toRestErrorResponse,
};
