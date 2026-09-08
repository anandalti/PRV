const jwt = require('jsonwebtoken');
const { pool } = require('../../db/pgsqldb.js');

if (!process.env.JWT_SECRET_KEY) throw new Error('JWT_SECRET_KEY environment variable is not configured');
const throwErr = (message, statusCode) => { const e = new Error(message); e.statusCode = statusCode; throw e; };
const signTokens = (payload) => ({
    accessToken: jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '10m' }),
    refreshToken: jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1d' }),
});

const getAuthenticationDetails = async (token) => {
    try {
        if (!token) throwErr('OTP is required', 400);
        const { rows } = await pool.query(
            `DELETE FROM it."OTP" WHERE "GeneratedOTP" = $1::uuid AND "ExpiresAt" > NOW() RETURNING "UserID", "Email"`,
            [token]
        );
        if (rows.length === 0) {
            await pool.query(`DELETE FROM it."OTP" WHERE "GeneratedOTP" = $1::uuid`, [token]);
            throwErr('Invalid or expired OTP', 400);
        }
        const { UserID: userId, Email: userEmail } = rows[0];
        if ((process.env.PRICING_CHECK || '').toLowerCase() === 'true') {
            const { rows: access } = await pool.query(
                `SELECT 1 FROM it."PricingAccess" WHERE "UserID" = $1 LIMIT 1`, [userId]
            );
            if (access.length === 0) throwErr('Access denied: pricing access not granted for this user.', 403);
        }
        return { userDetails: { id: userId, email: userEmail }, ...signTokens({ userId, email: userEmail }) };
    } catch (err) {
        const error = new Error(err.message || 'Failed to authenticate user');
        error.statusCode = err.statusCode || 500;
        throw error;
    }
};

const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) throwErr('Unauthorized', 401);
    try {
        const { userId, email } = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
        return signTokens({ userId, email });
    } catch (err) {
        const error = new Error('Failed to refresh access token');
        error.statusCode = err.statusCode || 500;
        throw error;
    }
};

module.exports = { getAuthenticationDetails, refreshAccessToken };
