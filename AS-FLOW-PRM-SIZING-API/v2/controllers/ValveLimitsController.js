
    const ValveLimits = require('../models/ValveLimits');
    const getAllValveLimits = async (req, res) => {
    const data = await ValveLimits.getAllValveLimits();
    res.json(data);
    };
    const getValveLimits = async (req, res) => {
    const data = await ValveLimits.getValveLimitsById(req.params.id);
    res.json(data);
    };
    const createValveLimits = async (req, res) => {
    const data = new ValveLimits(req.body);
    const newValveLimits = await ValveLimits.createValveLimits(data);
    res.json(newValveLimits);
    };
    const updateValveLimits = async (req, res) => {
    const data = new ValveLimits(req.body);
    const updatedValveLimits = await ValveLimits.updateValveLimits(req.params.id, data);
    res.json(updatedValveLimits);
    };
    const deleteValveLimits = async (req, res) => {
    const deletedValveLimits = await ValveLimits.deleteValveLimits(req.params.id);
    res.json(deletedValveLimits);
    };
    module.exports = {
    getAllValveLimits,
    getValveLimits,
    createValveLimits,
    updateValveLimits,
    deleteValveLimits
    };
    