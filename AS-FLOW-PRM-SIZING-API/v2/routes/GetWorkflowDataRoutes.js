
    const express = require('express');
    const GetWorkflowDataController = require('../controllers/GetWorkflowDataController');
    const router = express.Router();
    router.get('/', GetWorkflowDataController.getAllGetWorkflowData);
    router.get('/:id', GetWorkflowDataController.getGetWorkflowData);
    module.exports = router;
    