'use strict';

const AuthService = require('../../authservice/AuthService');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_EMAIL_DOMAIN = '@emerson.com';

const createError = (message, statusCode = 500, extras = {}) => {
    const err = new Error(message);
    err.statusCode = statusCode;
    Object.assign(err, extras);
    return err;
};

const assertObject = (value, message) => {
    if (!value || typeof value !== 'object') {
        throw createError(message, 400);
    }
};

const validateCorporateEmail = (email) => {
    const normalized = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!EMAIL_REGEX.test(normalized)) {
        throw createError('A valid Email is required', 400);
    }
    if (!normalized.endsWith(ALLOWED_EMAIL_DOMAIN)) {
        throw createError(`Only ${ALLOWED_EMAIL_DOMAIN} email addresses are allowed`, 400);
    }
    return normalized;
};

const validatePasswordStrength = (password) => {
    const errors = [];
    if (!password || typeof password !== 'string') {
        errors.push('Password is required');
    } else {
        if (password.length < 10) errors.push('Password must be at least 10 characters');
        if (!/[A-Z]/.test(password)) errors.push('Password must contain at least 1 uppercase letter');
        if (!/[a-z]/.test(password)) errors.push('Password must contain at least 1 lowercase letter');
        if (!/\d/.test(password)) errors.push('Password must contain at least 1 digit');
        if (!/[^A-Za-z0-9]/.test(password)) errors.push('Password must contain at least 1 special character');
    }

    if (errors.length > 0) {
        throw createError('Validation failed', 400, { messages: errors });
    }
};

const register = async (command) => {
    assertObject(command, 'register command must be an object');

    const name = typeof command?.name === 'string' ? command.name.trim() : '';
    if (!name) {
        throw createError('Name is required', 400);
    }

    const email = validateCorporateEmail(command?.email);
    validatePasswordStrength(command?.password);

    return AuthService.registerUser({
        Name: name,
        Email: email,
        Password: command.password,
        AppType: command?.appType,
    });
};

const login = async (command) => {
    assertObject(command, 'login command must be an object');
    const email = validateCorporateEmail(command?.email);
    const password = command?.password;
    if (typeof password !== 'string' || password.length === 0) {
        throw createError('Password is required', 400);
    }

    return AuthService.loginUser({
        Email: email,
        Password: password,
    });
};

const refreshToken = async (command) => {
    assertObject(command, 'refreshToken command must be an object');
    const token = typeof command?.refreshToken === 'string' ? command.refreshToken : null;
    if (!token) {
        throw createError('Unauthorized', 401);
    }

    return AuthService.refreshAccessToken(token);
};

const logout = async () => ({ ok: true });

const updatePassword = async (command) => {
    assertObject(command, 'updatePassword command must be an object');

    const email = validateCorporateEmail(command?.email);
    validatePasswordStrength(command?.newPassword);

    // Keep backward compatibility for REST callers where current password
    // may not be supplied, while allowing GraphQL to enforce old-password checks.
    if (typeof command?.currentPassword === 'string' && command.currentPassword.length > 0) {
        const loginResult = await AuthService.loginUser({
            Email: email,
            Password: command.currentPassword,
        });
        if (!loginResult?.user?.Id && !loginResult?.user?.id) {
            throw createError('Invalid credentials', 401);
        }
    }

    return AuthService.updatePassword({
        Email: email,
        NewPassword: command.newPassword,
    });
};

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    updatePassword,
};
