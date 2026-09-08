
    const SaturatedSteamTemperatures = require('../models/SaturatedSteamTemperatures');
    const getAllSaturatedSteamTemperatures = async (req, res) => {
    const data = await SaturatedSteamTemperatures.getAllSaturatedSteamTemperatures();
    res.json(data);
    };
    const getSaturatedSteamTemperatures = async (req, res) => {
    const data = await SaturatedSteamTemperatures.getSaturatedSteamTemperaturesById(req.params.id);
    res.json(data);
    };
    const createSaturatedSteamTemperatures = async (req, res) => {
    const data = new SaturatedSteamTemperatures(req.body);
    const newSaturatedSteamTemperatures = await SaturatedSteamTemperatures.createSaturatedSteamTemperatures(data);
    res.json(newSaturatedSteamTemperatures);
    };
    const updateSaturatedSteamTemperatures = async (req, res) => {
    const data = new SaturatedSteamTemperatures(req.body);
    const updatedSaturatedSteamTemperatures = await SaturatedSteamTemperatures.updateSaturatedSteamTemperatures(req.params.id, data);
    res.json(updatedSaturatedSteamTemperatures);
    };
    const deleteSaturatedSteamTemperatures = async (req, res) => {
    const deletedSaturatedSteamTemperatures = await SaturatedSteamTemperatures.deleteSaturatedSteamTemperatures(req.params.id);
    res.json(deletedSaturatedSteamTemperatures);
    };
    module.exports = {
    getAllSaturatedSteamTemperatures,
    getSaturatedSteamTemperatures,
    createSaturatedSteamTemperatures,
    updateSaturatedSteamTemperatures,
    deleteSaturatedSteamTemperatures
    };
    