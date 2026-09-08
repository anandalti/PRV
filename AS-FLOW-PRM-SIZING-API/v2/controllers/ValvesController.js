
    const Valves = require('../models/Valves');
    const getAllValves = async (req, res) => {
    const data = await Valves.getAllValves();
    res.json(data);
    };
    const getValves = async (req, res) => {
    const data = await Valves.getValvesById(req.params.id);
    res.json(data);
    };
    const createValves = async (req, res) => {
    const data = new Valves(req.body);
    const newValves = await Valves.createValves(data);
    res.json(newValves);
    };
    const updateValves = async (req, res) => {
    const data = new Valves(req.body);
    const updatedValves = await Valves.updateValves(req.params.id, data);
    res.json(updatedValves);
    };
    const deleteValves = async (req, res) => {
    const deletedValves = await Valves.deleteValves(req.params.id);
    res.json(deletedValves);
    };
    module.exports = {
    getAllValves,
    getValves,
    createValves,
    updateValves,
    deleteValves
    };
    