
    const SimpleValves = require('../models/SimpleValves');
    const getAllSimpleValves = async (req, res) => {
    const data = await SimpleValves.getAllSimpleValves();
    res.json(data);
    };
    const getSimpleValves = async (req, res) => {
    const data = await SimpleValves.getSimpleValvesById(req.params.id);
    res.json(data);
    };
    const createSimpleValves = async (req, res) => {
    const data = new SimpleValves(req.body);
    const newSimpleValves = await SimpleValves.createSimpleValves(data);
    res.json(newSimpleValves);
    };
    const updateSimpleValves = async (req, res) => {
    const data = new SimpleValves(req.body);
    const updatedSimpleValves = await SimpleValves.updateSimpleValves(req.params.id, data);
    res.json(updatedSimpleValves);
    };
    const deleteSimpleValves = async (req, res) => {
    const deletedSimpleValves = await SimpleValves.deleteSimpleValves(req.params.id);
    res.json(deletedSimpleValves);
    };
    module.exports = {
    getAllSimpleValves,
    getSimpleValves,
    createSimpleValves,
    updateSimpleValves,
    deleteSimpleValves
    };
    