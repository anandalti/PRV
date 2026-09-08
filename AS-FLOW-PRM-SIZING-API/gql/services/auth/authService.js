'use strict';

const authUseCases = require('../../../v2/service/usecases/auth');
const { toAuthUserDTO } = require('../../models/dto/authDTO');
const { AppError, assert } = require('../../utils/errors');

const toAppError = (error) => {
    if (error instanceof AppError) {
        return error;
    }

    return new AppError(error?.message || 'Internal server error', {
        code: error?.statusCode === 400
            ? 'BAD_USER_INPUT'
            : error?.statusCode === 401
                ? 'UNAUTHENTICATED'
                : error?.statusCode === 404
                    ? 'NOT_FOUND'
                    : 'INTERNAL_SERVER_ERROR',
        status: error?.statusCode || 500,
        details: error?.messages ? { messages: error.messages } : null,
    });
};

class AuthGraphQLService {
    async register(input) {
        try {
            const user = await authUseCases.register({
                name: input?.name,
                email: input?.email,
                password: input?.password,
                appType: input?.appType,
            });

            return {
                user: toAuthUserDTO(user),
            };
        } catch (error) {
            throw toAppError(error);
        }
    }

    async login(input) {
        try {
            const result = await authUseCases.login({
                email: input?.email,
                password: input?.password,
            });

            return {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                user: toAuthUserDTO(result.user),
                preferences: result.preferences || {},
            };
        } catch (error) {
            throw toAppError(error);
        }
    }

    async refreshToken(refreshToken) {
        try {
            return authUseCases.refreshToken({ refreshToken });
        } catch (error) {
            throw toAppError(error);
        }
    }

    async updatePassword(input) {
        const oldPassword = input?.oldPassword;
        assert(typeof oldPassword === 'string' && oldPassword.length > 0, 'OldPassword is required');

        try {
            await authUseCases.updatePassword({
                email: input?.email,
                currentPassword: oldPassword,
                newPassword: input?.newPassword,
            });

            return { updated: true };
        } catch (error) {
            throw toAppError(error);
        }
    }
}

module.exports = {
    AuthGraphQLService,
};
