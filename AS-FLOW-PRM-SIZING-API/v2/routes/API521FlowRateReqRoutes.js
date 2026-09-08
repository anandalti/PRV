
    const express = require('express');
    const API521FlowRateReqController = require('../controllers/API521FlowRateReqController');
    const router = express.Router();
    router.get('/', API521FlowRateReqController.getAllAPI521FlowRateReq);
    router.get('/:id', API521FlowRateReqController.getAPI521FlowRateReq);
    router.post('/', API521FlowRateReqController.createAPI521FlowRateReq);
    router.put('/:id', API521FlowRateReqController.updateAPI521FlowRateReq);
    router.delete('/:id', API521FlowRateReqController.deleteAPI521FlowRateReq);
    module.exports = router;
    