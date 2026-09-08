
    const express = require('express');
    const ReportTemplateMappingController = require('../controllers/ReportTemplateMappingController');
    const router = express.Router();
    router.get('/', ReportTemplateMappingController.getAllReportTemplateMapping);
    router.get('/:id', ReportTemplateMappingController.getReportTemplateMapping);
    router.post('/', ReportTemplateMappingController.createReportTemplateMapping);
    router.put('/:id', ReportTemplateMappingController.updateReportTemplateMapping);
    router.delete('/:id', ReportTemplateMappingController.deleteReportTemplateMapping);
    module.exports = router;
    