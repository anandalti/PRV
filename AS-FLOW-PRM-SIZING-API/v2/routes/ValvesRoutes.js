
    const express = require('express');
    const ValvesController = require('../controllers/ValvesController');
    const router = express.Router();
    router.get('/', ValvesController.getAllValves);
    router.get('/:id', ValvesController.getValves);
    router.post('/', ValvesController.createValves);
    router.put('/:id', ValvesController.updateValves);
    router.delete('/:id', ValvesController.deleteValves);
    module.exports = router;
    