const express = require('express');
const authMiddleware = require('../../middlewares/auth/authMiddleware');
const router = express.Router();
const { generateLaunchToken } = require('../../controllers/import-tool/TokenController');

router.post('/launch', authMiddleware, generateLaunchToken);

module.exports = router;