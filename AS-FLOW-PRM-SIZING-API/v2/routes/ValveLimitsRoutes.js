
    const express = require('express');
    const ValveLimitsController = require('../controllers/ValveLimitsController');
    const router = express.Router();
    router.get('/', ValveLimitsController.getAllValveLimits);
    router.get('/:id', ValveLimitsController.getValveLimits);
    router.post('/', ValveLimitsController.createValveLimits);
    router.put('/:id', ValveLimitsController.updateValveLimits);
    router.delete('/:id', ValveLimitsController.deleteValveLimits);
    module.exports = router;
    