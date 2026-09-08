
    const SteamEnthalpies = require('../models/SteamEnthalpies');
    const getAllSteamEnthalpies = async (req, res) => {
    const data = await SteamEnthalpies.getAllSteamEnthalpies();
    res.json(data);
    };
    const getSteamEnthalpies = async (req, res) => {
    const data = await SteamEnthalpies.getSteamEnthalpiesById(req.params.id);
    res.json(data);
    };
    const createSteamEnthalpies = async (req, res) => {
    const data = new SteamEnthalpies(req.body);
    const newSteamEnthalpies = await SteamEnthalpies.createSteamEnthalpies(data);
    res.json(newSteamEnthalpies);
    };
    const updateSteamEnthalpies = async (req, res) => {
    const data = new SteamEnthalpies(req.body);
    const updatedSteamEnthalpies = await SteamEnthalpies.updateSteamEnthalpies(req.params.id, data);
    res.json(updatedSteamEnthalpies);
    };
    const deleteSteamEnthalpies = async (req, res) => {
    const deletedSteamEnthalpies = await SteamEnthalpies.deleteSteamEnthalpies(req.params.id);
    res.json(deletedSteamEnthalpies);
    };
    module.exports = {
    getAllSteamEnthalpies,
    getSteamEnthalpies,
    createSteamEnthalpies,
    updateSteamEnthalpies,
    deleteSteamEnthalpies
    };
    