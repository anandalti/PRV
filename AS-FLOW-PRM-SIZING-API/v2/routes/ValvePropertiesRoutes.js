
    const express = require('express');
    const ValvePropertiesController = require('../controllers/ValvePropertiesController');
    const router = express.Router();
    router.get('/', ValvePropertiesController.getAllValveProperties);
    router.get('/:id', ValvePropertiesController.getValveProperties);
    router.post('/', ValvePropertiesController.createValveProperties);
    router.put('/:id', ValvePropertiesController.updateValveProperties);
    router.delete('/:id', ValvePropertiesController.deleteValveProperties);
    module.exports = router;
    