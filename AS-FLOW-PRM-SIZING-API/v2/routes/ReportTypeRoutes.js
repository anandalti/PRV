
    const express = require('express');
    const ReportTypeController = require('../controllers/ReportTypeController');
    const router = express.Router();
    router.get('/', ReportTypeController.getAllReportType);
    router.get('/:id', ReportTypeController.getReportType);
    router.post('/', ReportTypeController.createReportType);
    router.put('/:id', ReportTypeController.updateReportType);
    router.delete('/:id', ReportTypeController.deleteReportType);
    module.exports = router;
    