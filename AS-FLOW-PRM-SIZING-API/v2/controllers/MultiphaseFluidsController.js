
    const MultiphaseFluids = require('../models/MultiphaseFluids');
    const getAllMultiphaseFluids = async (req, res) => {
    const data = await MultiphaseFluids.getAllMultiphaseFluids();
    res.json(data);
    };
    const getMultiphaseFluids = async (req, res) => {
    const data = await MultiphaseFluids.getMultiphaseFluidsById(req.params.id);
    res.json(data);
    };
    const createMultiphaseFluids = async (req, res) => {
    const data = new MultiphaseFluids(req.body);
    const newMultiphaseFluids = await MultiphaseFluids.createMultiphaseFluids(data);
    res.json(newMultiphaseFluids);
    };
    const updateMultiphaseFluids = async (req, res) => {
    const data = new MultiphaseFluids(req.body);
    const updatedMultiphaseFluids = await MultiphaseFluids.updateMultiphaseFluids(req.params.id, data);
    res.json(updatedMultiphaseFluids);
    };
    const deleteMultiphaseFluids = async (req, res) => {
    const deletedMultiphaseFluids = await MultiphaseFluids.deleteMultiphaseFluids(req.params.id);
    res.json(deletedMultiphaseFluids);
    };
    module.exports = {
    getAllMultiphaseFluids,
    getMultiphaseFluids,
    createMultiphaseFluids,
    updateMultiphaseFluids,
    deleteMultiphaseFluids
    };
    