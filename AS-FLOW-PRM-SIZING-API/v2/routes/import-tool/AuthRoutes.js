const express = require('express');
const router = express.Router();
const { authUser, generateRefreshToken, validateToken } = require('../../controllers/import-tool/AuthController');

router.get('/validate', validateToken);
router.post('/login', authUser);

router.post('/refresh-token', generateRefreshToken);

module.exports = router;