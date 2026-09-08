
    const express = require('express');
    const GenericValveSizingController = require('../controllers/GenericValveSizingController');
    const router = express.Router();
    router.get('/', GenericValveSizingController.getAllGenericValveSizing);
    router.get('/:id', GenericValveSizingController.getGenericValveSizing);
    router.post('/', GenericValveSizingController.createGenericValveSizing);
    router.put('/:id', GenericValveSizingController.updateGenericValveSizing);
    router.delete('/:id', GenericValveSizingController.deleteGenericValveSizing);
    module.exports = router;
    