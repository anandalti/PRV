
    const express = require('express');
    const SAPModelsController = require('../controllers/SAPModelsController');
    const router = express.Router();
    router.get('/', SAPModelsController.getAllSAPModels);
    router.get('/:id', SAPModelsController.getSAPModels);
    router.post('/', SAPModelsController.createSAPModels);
    router.put('/:id', SAPModelsController.updateSAPModels);
    router.delete('/:id', SAPModelsController.deleteSAPModels);
    module.exports = router;
    