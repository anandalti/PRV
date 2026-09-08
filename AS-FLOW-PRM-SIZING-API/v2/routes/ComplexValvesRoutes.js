
    const express = require('express');
    const ComplexValvesController = require('../controllers/ComplexValvesController');
    const router = express.Router();
    router.get('/', ComplexValvesController.getAllComplexValves);
    router.get('/:id', ComplexValvesController.getComplexValves);
    router.post('/', ComplexValvesController.createComplexValves);
    router.put('/:id', ComplexValvesController.updateComplexValves);
    router.delete('/:id', ComplexValvesController.deleteComplexValves);
    module.exports = router;
    