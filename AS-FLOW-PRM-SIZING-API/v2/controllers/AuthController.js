'use strict';

const authUseCases = require('../service/usecases/auth');
const { toRestErrorResponse } = require('../utils/transportErrors');

// Cookie options — httpOnly: true so the accessToken cookie is not accessible to JS.
// The token is also returned in the response body so the frontend can store it
// in Redux memory and send it as Authorization: Bearer <token> in request headers.
// refreshToken remains httpOnly: true (never read by JS, only sent to refresh endpoint).
const ACCESS_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 10 * 60 * 1000,  // 10 minutes in ms
};

// refreshToken scoped strictly to the refresh endpoint
const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 24 * 60 * 60 * 1000, // 1 day in ms
    path: '/v2/api/auth/refresh-token',
};

// ─── Input validation helpers ─────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_EMAIL_DOMAIN = '@emerson.com';

const validateRegisterInput = ({ Name, Email, Password }) => {
    const errors = [];
    if (!Name  || typeof Name  !== 'string' || !Name.trim())  errors.push('Name is required');
    if (!Email || typeof Email !== 'string' || !EMAIL_REGEX.test(Email.trim())) {
        errors.push('A valid Email is required');
    } else if (!Email.trim().toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN)) {
        errors.push(`Only ${ALLOWED_EMAIL_DOMAIN} email addresses are allowed`);
    }
    if (!Password || typeof Password !== 'string') {
        errors.push('Password is required');
    } else {
        if (Password.length < 10)            errors.push('Password must be at least 10 characters');
        if (!/[A-Z]/.test(Password))         errors.push('Password must contain at least 1 uppercase letter');
        if (!/[a-z]/.test(Password))         errors.push('Password must contain at least 1 lowercase letter');
        if (!/\d/.test(Password))            errors.push('Password must contain at least 1 digit');
        if (!/[^A-Za-z0-9]/.test(Password)) errors.push('Password must contain at least 1 special character');
    }
    return errors;
};

const validateLoginInput = ({ Email, Password }) => {
    const errors = [];
    if (!Email || typeof Email !== 'string') {
        errors.push('Email is required');
    } else if (!Email.trim().toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN)) {
        errors.push(`Only ${ALLOWED_EMAIL_DOMAIN} email addresses are allowed`);
    }
    if (!Password || typeof Password !== 'string') errors.push('Password is required');
    return errors;
};

const validateUpdatePasswordInput = ({ Email, OldPassword, NewPassword }) => {

    const errors = [];
    if (!Email || typeof Email !== 'string') {
        errors.push('Email is required');
    } else if (!Email.trim().toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN)) {
        errors.push(`Only ${ALLOWED_EMAIL_DOMAIN} email addresses are allowed`);
    }
    if (!OldPassword || typeof OldPassword !== 'string' || !OldPassword.trim()) {
        errors.push('OldPassword is required');
    }
    if (!NewPassword || typeof NewPassword !== 'string') {
        errors.push('Password is required');
    } else {
        if (NewPassword.length < 10)            errors.push('Password must be at least 10 characters');
        if (!/[A-Z]/.test(NewPassword))         errors.push('Password must contain at least 1 uppercase letter');
        if (!/[a-z]/.test(NewPassword))         errors.push('Password must contain at least 1 lowercase letter');
        if (!/\d/.test(NewPassword))            errors.push('Password must contain at least 1 digit');
        if (!/[^A-Za-z0-9]/.test(NewPassword)) errors.push('Password must contain at least 1 special character');
    }
    return errors;
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

const register = async (req, res) => {
    try {
        // Normalise to string at the HTTP boundary — prevents CWE-1287 (improper
        // type validation) where req.body fields could be any JSON type (object,
        // array, number …) and a blind .trim() call would throw or return undefined.
        const body     = req.body || {};
        const Name     = typeof body.name     === 'string' ? body.name     : typeof body.Name     === 'string' ? body.Name     : '';
        const Email    = typeof body.email    === 'string' ? body.email    : typeof body.Email    === 'string' ? body.Email    : '';
        const Password = typeof body.password === 'string' ? body.password : typeof body.Password === 'string' ? body.Password : '';
        const AppType  = body?.AppType;

        const errors = validateRegisterInput({ Name, Email, Password });
        if (errors.length) {
            return res.status(400).json({
                status: 'error',
                code: 'BAD_USER_INPUT',
                message: 'Validation failed',
                messages: errors,
            });
        }

        const user = await authUseCases.register({
            name: Name,
            email: Email,
            password: Password,
            appType: AppType,
        });

        return res.status(201).json({ status: 'success', message: 'User registered successfully', data: user });
    } catch (err) {
        const { statusCode, body } = toRestErrorResponse(err);
        if (statusCode >= 500) console.error('[AuthController.register]', err);
        return res.status(statusCode).json(body);
    }
};

const login = async (req, res) => {
    try {
        const body     = req.body || {};
        const Email    = typeof body.email    === 'string' ? body.email    : typeof body.Email    === 'string' ? body.Email    : '';
        const Password = typeof body.password === 'string' ? body.password : typeof body.Password === 'string' ? body.Password : '';
        
        const errors = validateLoginInput({ Email, Password });
        if (errors.length) {
            return res.status(400).json({
                status: 'error',
                code: 'BAD_USER_INPUT',
                message: 'Validation failed',
                messages: errors,
            });
        }

        const { accessToken, refreshToken, user,preferences } = await authUseCases.login({
            email: Email,
            password: Password,
        });

        
        res.cookie('accessToken',  accessToken,  ACCESS_COOKIE_OPTIONS);
        res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
        // CWE-200: never log tokens or credentials
        console.info('[AuthController.login] User logged in successfully:', user?.Id);
        // accessToken is also returned in the response body so the frontend can
        // store it in Redux memory and attach it as Authorization: Bearer <token>.
        // The httpOnly cookie is kept for the refresh endpoint flow.
        return res.status(200).json({ status: 'success', message: 'Login successful', data: { user, preferences, accessToken } });
    } catch (err) {
        const { statusCode, body } = toRestErrorResponse(err);
        if (statusCode >= 500) console.error('[AuthController.login]', err);
        return res.status(statusCode).json(body);
    }
};

const refreshToken = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;
        const { accessToken, refreshToken: newRefreshToken } = await authUseCases.refreshToken({ refreshToken: token });

        res.cookie('accessToken',  accessToken,    ACCESS_COOKIE_OPTIONS);
        res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

        // Return new accessToken in body so the frontend can update Redux memory.
        return res.status(200).json({ status: 'success', message: 'Token refreshed', data: { accessToken } });
    } catch (err) {
        const { statusCode, body } = toRestErrorResponse(err);
        if (statusCode >= 500) console.error('[AuthController.refreshToken]', err);
        return res.status(statusCode).json(body);
    }
};

// Clear both tokens — expires the cookies immediately so the browser discards them.
const logout = (req, res) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    });
    // refreshToken is scoped to its own path, so the path must match exactly.
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        path: '/v2/api/auth/refresh-token',
    });
    return res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

const updatePassword = async (req, res) => {
    try {
        const body = req.body || {};
        const Email = typeof body.Email === 'string' ? body.Email : '';
        const OldPassword = typeof body.OldPassword === 'string' ? body.OldPassword : '';
        const NewPassword = typeof body.NewPassword === 'string' ? body.NewPassword : '';

        const errors = validateUpdatePasswordInput({ Email, OldPassword, NewPassword });
        if (errors.length) {
            return res.status(400).json({
                status: 'error',
                code: 'BAD_USER_INPUT',
                message: 'Validation failed',
                messages: errors,
            });
        }

        await authUseCases.updatePassword({
            email: Email,
            currentPassword: OldPassword,
            newPassword: NewPassword,
        });
        return res.status(200).json({ status: 'success', message: 'Password updated successfully' });
    } catch (err) {
        const { statusCode, body } = toRestErrorResponse(err);
        if (statusCode >= 500) console.error('[AuthController.updatePassword]', err);
        return res.status(statusCode).json(body);
    }
};

module.exports = { register, login, refreshToken, logout, updatePassword };


