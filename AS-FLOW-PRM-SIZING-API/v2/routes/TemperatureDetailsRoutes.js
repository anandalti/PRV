
    const express = require('express');
    const TemperatureDetailsController = require('../controllers/TemperatureDetailsController');
    const router = express.Router();
    router.get('/', TemperatureDetailsController.getAllTemperatureDetails);
    router.get('/:id', TemperatureDetailsController.getTemperatureDetails);
    router.post('/', TemperatureDetailsController.createTemperatureDetails);
    router.put('/:id', TemperatureDetailsController.updateTemperatureDetails);
    router.delete('/:id', TemperatureDetailsController.deleteTemperatureDetails);
    module.exports = router;
    