
    const express = require('express');
    const SimpleValvesController = require('../controllers/SimpleValvesController');
    const router = express.Router();
    router.get('/', SimpleValvesController.getAllSimpleValves);
    router.get('/:id', SimpleValvesController.getSimpleValves);
    router.post('/', SimpleValvesController.createSimpleValves);
    router.put('/:id', SimpleValvesController.updateSimpleValves);
    router.delete('/:id', SimpleValvesController.deleteSimpleValves);
    module.exports = router;
    