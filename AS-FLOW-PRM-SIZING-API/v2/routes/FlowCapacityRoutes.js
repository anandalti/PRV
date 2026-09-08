
    const express = require('express');
    const FlowCapacityController = require('../controllers/FlowCapacityController');
    const router = express.Router();
    router.get('/', FlowCapacityController.getAllFlowCapacity);
    router.get('/:id', FlowCapacityController.getFlowCapacity);
    router.post('/', FlowCapacityController.createFlowCapacity);
    router.put('/:id', FlowCapacityController.updateFlowCapacity);
    router.delete('/:id', FlowCapacityController.deleteFlowCapacity);
    module.exports = router;
    