const express = require('express');
const { CheckApiAction } = require('../controllers/ApiActionController');
const router = express.Router();

router.post('',CheckApiAction);

module.exports = router;