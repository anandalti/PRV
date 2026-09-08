const jwt = require('jsonwebtoken');
const { getAuthenticationDetails, refreshAccessToken } = require('../../service/import-tool/AuthService');

exports.validateToken = (req, res) => {
    try {
        const token = req.cookies?.accessToken;
        if (!token) {
            return res.status(401).json({ message: 'No access token' });
        }
        if (!process.env.JWT_SECRET_KEY) {
            return res.status(500).json({ message: 'Server misconfiguration' });
        }
        const { userId, email } = jwt.verify(token, process.env.JWT_SECRET_KEY);
        return res.status(200).json({ message: 'Token valid', user: { id: userId, email } });
    } catch (err) {
        const status = err.statusCode || 401;
        return res.status(status).json({ message: err.message || 'Invalid or expired token' });
    }
};

exports.generateRefreshToken = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) {
            const error = new Error('Refresh token is required');
            error.statusCode = 400;
            throw error;
        }
        const { accessToken, refreshToken } = await refreshAccessToken(token);
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 10 * 60 * 1000
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'strict',
            path: '/import-tool/api/auth/refresh-token',
        });
        res.status(200).json({ message: 'Access token refreshed' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.authUser = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }
        const { accessToken, refreshToken, userDetails } = await getAuthenticationDetails(token);
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 10 * 60 * 1000
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'strict',
            path: '/import-tool/api/auth/refresh-token',
        });
        res.status(200).json({ message: 'Authentication successful', user: userDetails });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};