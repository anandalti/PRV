const express = require('express');
const router = express.Router();
const { generateOraclePayload, submitSalesOrder } = require('../../controllers/import-tool/OracleAPIController');

router.post('/', generateOraclePayload);
router.post('/submitSalesOrder', submitSalesOrder)

module.exports = router;