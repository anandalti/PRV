
    const express = require('express');
    const SteamEnthalpiesController = require('../controllers/SteamEnthalpiesController');
    const router = express.Router();
    router.get('/', SteamEnthalpiesController.getAllSteamEnthalpies);
    router.get('/:id', SteamEnthalpiesController.getSteamEnthalpies);
    router.post('/', SteamEnthalpiesController.createSteamEnthalpies);
    router.put('/:id', SteamEnthalpiesController.updateSteamEnthalpies);
    router.delete('/:id', SteamEnthalpiesController.deleteSteamEnthalpies);
    module.exports = router;
    