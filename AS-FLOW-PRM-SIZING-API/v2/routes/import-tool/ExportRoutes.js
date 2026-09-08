const express = require('express');
const { readTags } = require('../../controllers/import-tool/ExportController');
const authMiddleware = require('../../middlewares/auth/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, readTags);

module.exports = router;
