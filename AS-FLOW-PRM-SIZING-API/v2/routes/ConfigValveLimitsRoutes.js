
    const express = require('express');
    const ConfigValveLimitsController = require('../controllers/ConfigValveLimitsController');
    const router = express.Router();
    router.get('/', ConfigValveLimitsController.getAllConfigValveLimits);
    router.get('/:id', ConfigValveLimitsController.getConfigValveLimits);
    router.post('/', ConfigValveLimitsController.createConfigValveLimits);
    router.put('/:id', ConfigValveLimitsController.updateConfigValveLimits);
    router.delete('/:id', ConfigValveLimitsController.deleteConfigValveLimits);
    module.exports = router;
    