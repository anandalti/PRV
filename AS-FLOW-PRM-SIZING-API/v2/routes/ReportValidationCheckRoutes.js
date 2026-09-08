
    const express = require('express');
    const ReportValidationCheckController = require('../controllers/ReportValidationCheckController');
    const router = express.Router();
    router.get('/', ReportValidationCheckController.getAllReportValidationCheck);
    router.get('/:id', ReportValidationCheckController.getReportValidationCheck);
    router.post('/', ReportValidationCheckController.createReportValidationCheck);
    router.put('/:id', ReportValidationCheckController.updateReportValidationCheck);
    router.delete('/:id', ReportValidationCheckController.deleteReportValidationCheck);
    module.exports = router;
    