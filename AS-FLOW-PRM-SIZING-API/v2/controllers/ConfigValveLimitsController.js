
    const ConfigValveLimits = require('../models/ConfigValveLimits');
    const getAllConfigValveLimits = async (req, res) => {
    const data = await ConfigValveLimits.getAllConfigValveLimits();
    res.json(data);
    };
    const getConfigValveLimits = async (req, res) => {
    const data = await ConfigValveLimits.getConfigValveLimitsById(req.params.id);
    res.json(data);
    };
    const createConfigValveLimits = async (req, res) => {
    const data = new ConfigValveLimits(req.body);
    const newConfigValveLimits = await ConfigValveLimits.createConfigValveLimits(data);
    res.json(newConfigValveLimits);
    };
    const updateConfigValveLimits = async (req, res) => {
    const data = new ConfigValveLimits(req.body);
    const updatedConfigValveLimits = await ConfigValveLimits.updateConfigValveLimits(req.params.id, data);
    res.json(updatedConfigValveLimits);
    };
    const deleteConfigValveLimits = async (req, res) => {
    const deletedConfigValveLimits = await ConfigValveLimits.deleteConfigValveLimits(req.params.id);
    res.json(deletedConfigValveLimits);
    };
    module.exports = {
    getAllConfigValveLimits,
    getConfigValveLimits,
    createConfigValveLimits,
    updateConfigValveLimits,
    deleteConfigValveLimits
    };
    