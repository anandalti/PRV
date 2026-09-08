
    const express = require('express');
    const ConfigurationModelsController = require('../controllers/ConfigurationModelsController');
    const router = express.Router();
    router.get('/', ConfigurationModelsController.getAllConfigurationModels);
    router.get('/:id', ConfigurationModelsController.getConfigurationModels);
    router.post('/', ConfigurationModelsController.createConfigurationModels);
    router.put('/:id', ConfigurationModelsController.updateConfigurationModels);
    router.delete('/:id', ConfigurationModelsController.deleteConfigurationModels);
    module.exports = router;
    