'use strict';

const { env } = require('../../config/env');
const { toGraphQLError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');

const accessCookieOptions = {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'Strict',
    maxAge: env.accessCookieMaxAgeMs,
};

const refreshCookieOptions = {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'Strict',
    maxAge: env.refreshCookieMaxAgeMs,
    path: env.graphQLPath,
};

const mutationSuccess = (message, code = 'OK') => ({
    success: true,
    message,
    code,
    errors: [],
});

const authResolvers = {
    Mutation: {
        register: async (_, { input }, { services }) => {
            try {
                const result = await services.auth.register(input);
                return {
                    ...mutationSuccess('User registered successfully', 'CREATED'),
                    user: result.user,
                };
            } catch (error) {
                logger.error('register mutation failed', { error: error.message });
                throw toGraphQLError(error);
            }
        },

        login: async (_, { input }, { services, res }) => {
            try {
                const result = await services.auth.login(input);

                res.cookie('accessToken', result.accessToken, accessCookieOptions);
                res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);

                return {
                    ...mutationSuccess('Login successful', 'OK'),
                    user: result.user,
                    preferences: result.preferences,
                    accessToken: result.accessToken,
                };
            } catch (error) {
                logger.error('login mutation failed', { error: error.message });
                throw toGraphQLError(error);
            }
        },

        refreshToken: async (_, __, { services, req, res, refreshToken }) => {
            try {
                const cookieRefreshToken = refreshToken || req.cookies?.refreshToken;
                const result = await services.auth.refreshToken(cookieRefreshToken);

                res.cookie('accessToken', result.accessToken, accessCookieOptions);
                res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);

                return {
                    ...mutationSuccess('Token refreshed', 'OK'),
                    accessToken: result.accessToken,
                };
            } catch (error) {
                logger.error('refreshToken mutation failed', { error: error.message });
                throw toGraphQLError(error);
            }
        },

        logout: async (_, __, { res }) => {
            try {
                res.clearCookie('accessToken', {
                    httpOnly: true,
                    secure: env.nodeEnv === 'production',
                    sameSite: 'Strict',
                });
                res.clearCookie('refreshToken', {
                    httpOnly: true,
                    secure: env.nodeEnv === 'production',
                    sameSite: 'Strict',
                    path: env.graphQLPath,
                });

                return mutationSuccess('Logged out successfully', 'OK');
            } catch (error) {
                logger.error('logout mutation failed', { error: error.message });
                throw toGraphQLError(error);
            }
        },

        updatePassword: async (_, { input }, { services }) => {
            try {
                await services.auth.updatePassword(input);
                return mutationSuccess('Password updated successfully', 'OK');
            } catch (error) {
                logger.error('updatePassword mutation failed', { error: error.message });
                throw toGraphQLError(error);
            }
        },
    },
};

module.exports = {
    authResolvers,
};
