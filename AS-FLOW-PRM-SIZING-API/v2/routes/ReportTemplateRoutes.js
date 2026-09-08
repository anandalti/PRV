
    const express = require('express');
    const ReportTemplateController = require('../controllers/ReportTemplateController');
    const router = express.Router();
    router.get('/', ReportTemplateController.getAllReportTemplate);
    router.get('/:id', ReportTemplateController.getReportTemplate);
    router.post('/', ReportTemplateController.createReportTemplate);
    router.put('/:id', ReportTemplateController.updateReportTemplate);
    router.delete('/:id', ReportTemplateController.deleteReportTemplate);
    module.exports = router;
    