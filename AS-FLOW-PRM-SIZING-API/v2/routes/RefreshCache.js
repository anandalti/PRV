const express = require('express');
const RefreshCacheController = require('../controllers/RefreshCacheController');

const router = express.Router();

router.get('',RefreshCacheController.RefreshCache);
module.exports = router;