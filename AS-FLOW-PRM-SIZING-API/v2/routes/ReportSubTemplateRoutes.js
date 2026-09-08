
    const express = require('express');
    const ReportSubTemplateController = require('../controllers/ReportSubTemplateController');
    const router = express.Router();
    router.get('/', ReportSubTemplateController.getAllReportSubTemplate);
    router.get('/:id', ReportSubTemplateController.getReportSubTemplate);
    router.post('/', ReportSubTemplateController.createReportSubTemplate);
    router.put('/:id', ReportSubTemplateController.updateReportSubTemplate);
    router.delete('/:id', ReportSubTemplateController.deleteReportSubTemplate);
    module.exports = router;
    