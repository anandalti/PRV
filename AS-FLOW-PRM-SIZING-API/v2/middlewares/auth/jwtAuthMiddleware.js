'use strict';

const jwt = require('jsonwebtoken');

/**
 * jwtAuthMiddleware
 *
 * Validates the JWT accessToken from HTTP-only cookies.
 * On success: attaches decoded user payload to req.user and calls next().
 * On failure: returns 401 without revealing internal details.
 *
 * Usage on protected routes:
 *   router.get('/protected', jwtAuthMiddleware, controller.handler)
 *
 * NOTE: This middleware is separate from authMiddleware (Okta-based).
 *       Do not confuse the two — they use different secrets and token sources.
 */
// Public routes that do not require a JWT token
const PUBLIC_PATH_PREFIX = '/v2/api/auth/';

async function jwtAuthMiddleware(req, res, next) {
    // Bypass token validation for all /v2/api/auth/* endpoints
    if (req.path.startsWith(PUBLIC_PATH_PREFIX)) {
        return next();
    }

    try {
        // Accept token from Authorization: Bearer <token> header (primary)
        // or fall back to the accessToken cookie (legacy / direct requests)
        let token = null;
        const authHeader = req.headers?.authorization || req.headers?.Authorization || '';
        // console.log('Auth Header: >>>>>> ', authHeader);
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.slice(7);
        } else {
            token = req.cookies?.accessToken;
        }

        if (!token) {
            return res.status(401).json({ status: 'Unauthorized', message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Attach sanitized user info — never the full token payload
        req.user = {
            id:    decoded.id,
            email: decoded.email,
        };

        return next();
    } catch (err) {
        console.log(err)
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ status: 'Token_Expired', message: 'Token expired' });
        }
        // JsonWebTokenError, NotBeforeError, or anything else
        return res.status(401).json({ status: 'Unauthorized', message: 'Unauthorized' });
    }
}

module.exports = jwtAuthMiddleware;
