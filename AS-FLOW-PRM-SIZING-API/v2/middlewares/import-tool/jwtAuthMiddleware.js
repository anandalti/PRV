const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({
                message: 'Authorization token missing',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, });
    }
};

module.exports = jwtAuthMiddleware;