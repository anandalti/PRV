
    const express = require('express');
    const SaturatedSteamTemperaturesController = require('../controllers/SaturatedSteamTemperaturesController');
    const router = express.Router();
    router.get('/', SaturatedSteamTemperaturesController.getAllSaturatedSteamTemperatures);
    router.get('/:id', SaturatedSteamTemperaturesController.getSaturatedSteamTemperatures);
    router.post('/', SaturatedSteamTemperaturesController.createSaturatedSteamTemperatures);
    router.put('/:id', SaturatedSteamTemperaturesController.updateSaturatedSteamTemperatures);
    router.delete('/:id', SaturatedSteamTemperaturesController.deleteSaturatedSteamTemperatures);
    module.exports = router;
    