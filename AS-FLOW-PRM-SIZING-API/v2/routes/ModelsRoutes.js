
    const express = require('express');
    const ModelsController = require('../controllers/ModelsController');
    const router = express.Router();
    router.get('/', ModelsController.getAllModels);
    router.get('/:id', ModelsController.getModels);
    router.post('/', ModelsController.createModels);
    router.put('/:id', ModelsController.updateModels);
    router.delete('/:id', ModelsController.deleteModels);
    module.exports = router;
    