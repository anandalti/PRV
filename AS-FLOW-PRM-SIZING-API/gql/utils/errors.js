'use strict';

const { GraphQLError } = require('graphql');

class AppError extends Error {
    constructor(message, { code = 'INTERNAL_SERVER_ERROR', status = 500, details = null } = {}) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.status = status;
        this.details = details;
    }
}

const normalizeErrorDetails = (appError) => {
    if (appError?.details?.messages && Array.isArray(appError.details.messages)) {
        return appError.details;
    }

    if (appError?.code === 'BAD_USER_INPUT') {
        return {
            ...(appError.details || {}),
            messages: [appError.message],
        };
    }

    return appError?.details || null;
};

const mapTransportError = (error, fallbackMessage = 'Internal server error') => {
    if (error instanceof AppError) {
        return error;
    }

    const status = error?.status || error?.statusCode || 500;
    const code = status === 400
        ? 'BAD_USER_INPUT'
        : status === 401
            ? 'UNAUTHENTICATED'
            : status === 403
                ? 'FORBIDDEN'
                : status === 404
                    ? 'NOT_FOUND'
                    : 'INTERNAL_SERVER_ERROR';

    return new AppError(error?.message || fallbackMessage, {
        code,
        status,
        details: error?.details || (error?.messages ? { messages: error.messages } : null),
    });
};

const toRestErrorResponse = (error) => {
    const appError = mapTransportError(error);
    const normalizedDetails = normalizeErrorDetails(appError);
    const payload = {
        status: 'error',
        message: appError.message,
    };

    if (normalizedDetails?.messages) {
        payload.messages = normalizedDetails.messages;
    }

    return {
        statusCode: appError.status,
        body: payload,
    };
};

const toGraphQLErrorPayload = (error) => {
    const appError = mapTransportError(error);
    const normalizedDetails = normalizeErrorDetails(appError);
    return {
        code: appError.code,
        http: { status: appError.status },
        details: normalizedDetails,
    };
};

const toGraphQLError = (error, fallbackMessage = 'Internal server error') => {
    if (error instanceof GraphQLError) {
        return error;
    }

    const appError = mapTransportError(error, fallbackMessage);

    return new GraphQLError(appError.message, {
        extensions: toGraphQLErrorPayload(appError),
    });
};

const assert = (condition, message, options = {}) => {
    if (!condition) {
        throw new AppError(message, { code: 'BAD_USER_INPUT', status: 400, ...options });
    }
};

module.exports = {
    AppError,
    mapTransportError,
    toRestErrorResponse,
    toGraphQLErrorPayload,
    toGraphQLError,
    assert,
};
