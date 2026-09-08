
    const express = require('express');
    const GetWorkFlowSelectionConditionsController = require('../controllers/GetWorkFlowSelectionConditionsController');
    const router = express.Router();
    router.get('/', GetWorkFlowSelectionConditionsController.getAllGetWorkFlowSelectionConditions);
    router.get('/:id', GetWorkFlowSelectionConditionsController.getGetWorkFlowSelectionConditions);
    module.exports = router;
    