
    const SuperheatCorrectionFactors = require('../models/SuperheatCorrectionFactors');
    const getAllSuperheatCorrectionFactors = async (req, res) => {
    const data = await SuperheatCorrectionFactors.getAllSuperheatCorrectionFactors();
    res.json(data);
    };
    const getSuperheatCorrectionFactors = async (req, res) => {
    const data = await SuperheatCorrectionFactors.getSuperheatCorrectionFactorsById(req.params.id);
    res.json(data);
    };
    const createSuperheatCorrectionFactors = async (req, res) => {
    const data = new SuperheatCorrectionFactors(req.body);
    const newSuperheatCorrectionFactors = await SuperheatCorrectionFactors.createSuperheatCorrectionFactors(data);
    res.json(newSuperheatCorrectionFactors);
    };
    const updateSuperheatCorrectionFactors = async (req, res) => {
    const data = new SuperheatCorrectionFactors(req.body);
    const updatedSuperheatCorrectionFactors = await SuperheatCorrectionFactors.updateSuperheatCorrectionFactors(req.params.id, data);
    res.json(updatedSuperheatCorrectionFactors);
    };
    const deleteSuperheatCorrectionFactors = async (req, res) => {
    const deletedSuperheatCorrectionFactors = await SuperheatCorrectionFactors.deleteSuperheatCorrectionFactors(req.params.id);
    res.json(deletedSuperheatCorrectionFactors);
    };
    module.exports = {
    getAllSuperheatCorrectionFactors,
    getSuperheatCorrectionFactors,
    createSuperheatCorrectionFactors,
    updateSuperheatCorrectionFactors,
    deleteSuperheatCorrectionFactors
    };
    