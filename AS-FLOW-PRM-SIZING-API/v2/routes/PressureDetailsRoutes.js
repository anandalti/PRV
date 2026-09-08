
    const express = require('express');
    const PressureDetailsController = require('../controllers/PressureDetailsController');
    const router = express.Router();
    router.get('/', PressureDetailsController.getAllPressureDetails);
    router.get('/:id', PressureDetailsController.getPressureDetails);
    router.post('/', PressureDetailsController.createPressureDetails);
    router.put('/:id', PressureDetailsController.updatePressureDetails);
    router.delete('/:id', PressureDetailsController.deletePressureDetails);
    module.exports = router;
    