const express = require('express');
const { validateExpressions } = require('../controllers/ValidateController');
const router = express.Router();

router.post('/', validateExpressions);

module.exports = router;