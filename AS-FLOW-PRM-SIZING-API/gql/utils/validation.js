'use strict';

const { AppError } = require('./errors');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_EMAIL_DOMAIN = '@emerson.com';

const throwValidationError = (messages) => {
    const err = new AppError('Validation failed', {
        code: 'BAD_USER_INPUT',
        status: 400,
        details: { messages },
    });
    throw err;
};

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeNullableString = (value) => {
    const normalized = normalizeString(value);
    return normalized ? normalized : null;
};

const requireNonEmptyString = (value, message) => {
    const normalized = normalizeString(value);
    if (!normalized) {
        throwValidationError([message]);
    }
    return normalized;
};

const validateCorporateEmail = (email) => {
    const normalized = normalizeString(email).toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) {
        throwValidationError(['A valid Email is required']);
    }
    if (!normalized.endsWith(ALLOWED_EMAIL_DOMAIN)) {
        throwValidationError([`Only ${ALLOWED_EMAIL_DOMAIN} email addresses are allowed`]);
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
        throwValidationError(errors);
    }
};

module.exports = {
    normalizeString,
    normalizeNullableString,
    requireNonEmptyString,
    validateCorporateEmail,
    validatePasswordStrength,
    throwValidationError,
};
