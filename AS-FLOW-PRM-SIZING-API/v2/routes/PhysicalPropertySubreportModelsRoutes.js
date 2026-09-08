
    const express = require('express');
    const PhysicalPropertySubreportModelsController = require('../controllers/PhysicalPropertySubreportModelsController');
    const router = express.Router();
    router.get('/', PhysicalPropertySubreportModelsController.getAllPhysicalPropertySubreportModels);
    router.get('/:id', PhysicalPropertySubreportModelsController.getPhysicalPropertySubreportModels);
    router.post('/', PhysicalPropertySubreportModelsController.createPhysicalPropertySubreportModels);
    router.put('/:id', PhysicalPropertySubreportModelsController.updatePhysicalPropertySubreportModels);
    router.delete('/:id', PhysicalPropertySubreportModelsController.deletePhysicalPropertySubreportModels);
    module.exports = router;
    