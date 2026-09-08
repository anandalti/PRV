
    const SizingMethodology = require('../models/SizingMethodology');
    const getAllSizingMethodology = async (req, res) => {
    const data = await SizingMethodology.getAllSizingMethodology();
    res.json(data);
    };
    const getSizingMethodology = async (req, res) => {
    const data = await SizingMethodology.getSizingMethodologyById(req.params.id);
    res.json(data);
    };
    const createSizingMethodology = async (req, res) => {
    const data = new SizingMethodology(req.body);
    const newSizingMethodology = await SizingMethodology.createSizingMethodology(data);
    res.json(newSizingMethodology);
    };
    const updateSizingMethodology = async (req, res) => {
    const data = new SizingMethodology(req.body);
    const updatedSizingMethodology = await SizingMethodology.updateSizingMethodology(req.params.id, data);
    res.json(updatedSizingMethodology);
    };
    const deleteSizingMethodology = async (req, res) => {
    const deletedSizingMethodology = await SizingMethodology.deleteSizingMethodology(req.params.id);
    res.json(deletedSizingMethodology);
    };
    module.exports = {
    getAllSizingMethodology,
    getSizingMethodology,
    createSizingMethodology,
    updateSizingMethodology,
    deleteSizingMethodology
    };
    