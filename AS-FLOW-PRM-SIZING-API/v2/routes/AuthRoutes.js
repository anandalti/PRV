'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

// Rate limiter: max 15 requests per 5 minutes per IP on auth endpoints
const authRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many requests, please try again later after some time.' },
});

router.post('/register',      authRateLimiter, AuthController.register);
router.post('/login',         authRateLimiter, AuthController.login);
router.post('/refresh-token',                  AuthController.refreshToken);
router.post('/logout',                         AuthController.logout);
router.post('/updatePassword',                 AuthController.updatePassword);

module.exports = router;
