
const express = require('express');
const SAPSizingController = require('../controllers/SAPSizingController');
const router = express.Router();
router.get('/:sizingId', SAPSizingController.sizingDetails);
router.get('/:sizingId/:itemNumber', SAPSizingController.sizingDetails);
router.post('/copy', SAPSizingController.copy);
module.exports = router;
