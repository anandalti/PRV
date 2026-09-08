const express = require('express');
const ReportsController = require('../controllers/ReportsController');
const router = express.Router();

router.post('/htmlRouter/getHtmlTableTemplate/:sizingId/:reportType/:configId', ReportsController.getHtmlTableTemplateData);
router.get('/getSizingDetails', ReportsController.getSizingDetails);
router.post('/getConfigDetails', ReportsController.getConfigDetails);
router.post('/getDimensionDetails', ReportsController.getDimensionDetails);
router.post('/performCalculations', ReportsController.performCalculations);

module.exports = router;