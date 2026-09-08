
    const GasFluids = require('../models/GasFluids');
    const getAllGasFluids = async (req, res) => {
    const data = await GasFluids.getAllGasFluids();
    res.json(data);
    };
    const getGasFluids = async (req, res) => {
    const data = await GasFluids.getGasFluidsById(req.params.id);
    res.json(data);
    };
    const createGasFluids = async (req, res) => {
    const data = new GasFluids(req.body);
    const newGasFluids = await GasFluids.createGasFluids(data);
    res.json(newGasFluids);
    };
    const updateGasFluids = async (req, res) => {
    const data = new GasFluids(req.body);
    const updatedGasFluids = await GasFluids.updateGasFluids(req.params.id, data);
    res.json(updatedGasFluids);
    };
    const deleteGasFluids = async (req, res) => {
    const deletedGasFluids = await GasFluids.deleteGasFluids(req.params.id);
    res.json(deletedGasFluids);
    };
    module.exports = {
    getAllGasFluids,
    getGasFluids,
    createGasFluids,
    updateGasFluids,
    deleteGasFluids
    };
    