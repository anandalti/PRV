const express = require('express');
const router = express.Router();
const OracleOrderStatusController = require('../../controllers/import-tool/OracleOrderStatusController');

// Route to process Oracle Order Status response payload
router.post('/', OracleOrderStatusController.handleOrderStatus);

module.exports = router;
