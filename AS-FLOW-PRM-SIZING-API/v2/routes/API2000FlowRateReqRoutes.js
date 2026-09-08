
    const express = require('express');
    const API2000FlowRateReqController = require('../controllers/API2000FlowRateReqController');
    const router = express.Router();
    router.get('/', API2000FlowRateReqController.getAllAPI2000FlowRateReq);
    router.get('/:id', API2000FlowRateReqController.getAPI2000FlowRateReq);
    router.post('/', API2000FlowRateReqController.createAPI2000FlowRateReq);
    router.put('/:id', API2000FlowRateReqController.updateAPI2000FlowRateReq);
    router.delete('/:id', API2000FlowRateReqController.deleteAPI2000FlowRateReq);
    module.exports = router;
    