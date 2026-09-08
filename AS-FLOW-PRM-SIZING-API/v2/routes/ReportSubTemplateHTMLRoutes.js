
    const express = require('express');
    const ReportSubTemplateHTMLController = require('../controllers/ReportSubTemplateHTMLController');
    const router = express.Router();
    router.get('/', ReportSubTemplateHTMLController.getAllReportSubTemplateHTML);
    router.get('/:id', ReportSubTemplateHTMLController.getReportSubTemplateHTML);
    router.post('/', ReportSubTemplateHTMLController.createReportSubTemplateHTML);
    router.put('/:id', ReportSubTemplateHTMLController.updateReportSubTemplateHTML);
    router.delete('/:id', ReportSubTemplateHTMLController.deleteReportSubTemplateHTML);
    module.exports = router;
    