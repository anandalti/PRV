
    const express = require('express');
    const GetReportHTMLDataController = require('../controllers/GetReportHTMLDataController');
    const router = express.Router();
    router.get('/', GetReportHTMLDataController.getAllGetReportHTMLData);
    router.get('/:id', GetReportHTMLDataController.getGetReportHTMLData);
    module.exports = router;
    