
    const express = require('express');
    const WorkFlowController = require('../controllers/WorkFlowController');
    const router = express.Router();
    router.get('/', WorkFlowController.getAllWorkFlow);
    router.get('/:id', WorkFlowController.getWorkFlow);
    router.post('/', WorkFlowController.createWorkFlow);
    router.put('/:id', WorkFlowController.updateWorkFlow);
    router.delete('/:id', WorkFlowController.deleteWorkFlow);
    module.exports = router;
    