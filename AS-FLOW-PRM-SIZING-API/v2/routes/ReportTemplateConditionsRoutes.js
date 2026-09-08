
    const express = require('express');
    const ReportTemplateConditionsController = require('../controllers/ReportTemplateConditionsController');
    const router = express.Router();
    router.get('/', ReportTemplateConditionsController.getAllReportTemplateConditions);
    router.get('/:id', ReportTemplateConditionsController.getReportTemplateConditions);
    router.post('/', ReportTemplateConditionsController.createReportTemplateConditions);
    router.put('/:id', ReportTemplateConditionsController.updateReportTemplateConditions);
    router.delete('/:id', ReportTemplateConditionsController.deleteReportTemplateConditions);
    module.exports = router;
    