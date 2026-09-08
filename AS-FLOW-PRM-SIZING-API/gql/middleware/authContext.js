'use strict';

const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { AppError } = require('../utils/errors');

const resolveToken = (req) => {
    const authHeader = req.headers?.authorization || req.headers?.Authorization || '';
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }
    return req.cookies?.accessToken || null;
};

const resolveRefreshToken = (req) => req.cookies?.refreshToken || null;

const resolveCorrelationId = (req) => {
    const correlationId = req.headers?.['x-correlation-id'] || req.headers?.['x-request-id'];
    if (typeof correlationId === 'string' && correlationId.trim()) {
        return correlationId.trim();
    }
    return null;
};

const getCurrentUser = (req) => {
    const token = resolveToken(req);
    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, env.accessTokenSecret);
        return {
            id: decoded.id,
            email: decoded.email,
        };
    } catch {
        return null;
    }
};

/**
 * ensureAuthenticated
 *
 * Single shared auth guard used by all GraphQL resolvers.
 * Accepts the decoded currentUser object from the Apollo context
 * (set by getCurrentUser during request context building) and throws
 * UNAUTHENTICATED (HTTP 401) if the email claim is absent — meaning
 * the token is missing, expired, or invalid.
 *
 * Usage in any resolver:
 *   const { ensureAuthenticated } = require('../../middleware/authContext');
 *   ...
 *   myResolver: async (_parent, args, context) => {
 *       ensureAuthenticated(context.currentUser);
 *       // proceed with authenticated logic
 *   }
 *
 * @param {object|null} currentUser - context.currentUser (decoded JWT payload)
 * @returns {string} email — the authenticated user's email
 * @throws {AppError} UNAUTHENTICATED (401) if email claim is absent
 */
const ensureAuthenticated = (currentUser) => {
    if (!currentUser?.email) {
        throw new AppError('Unauthorized', { code: 'UNAUTHENTICATED', status: 401 });
    }
    return currentUser.email;
};

const getActorFromContext = ({ req, currentUser }) => {
    const user = currentUser || getCurrentUser(req);
    return {
        id: user?.id ?? null,
        email: user?.email ?? null,
        isAuthenticated: Boolean(user?.email),
        source: 'GraphQL',
        correlationId: resolveCorrelationId(req),
    };
};

module.exports = {
    resolveToken,
    resolveRefreshToken,
    resolveCorrelationId,
    getCurrentUser,
    ensureAuthenticated,
    getActorFromContext,
};
