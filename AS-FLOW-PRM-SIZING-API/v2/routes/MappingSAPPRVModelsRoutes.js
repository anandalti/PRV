
    const express = require('express');
    const MappingSAPPRVModelsController = require('../controllers/MappingSAPPRVModelsController');
    const router = express.Router();
    router.get('/', MappingSAPPRVModelsController.getAllMappingSAPPRVModels);
    router.get('/:id', MappingSAPPRVModelsController.getMappingSAPPRVModels);
    router.post('/', MappingSAPPRVModelsController.createMappingSAPPRVModels);
    router.put('/:id', MappingSAPPRVModelsController.updateMappingSAPPRVModels);
    router.delete('/:id', MappingSAPPRVModelsController.deleteMappingSAPPRVModels);
    module.exports = router;
    