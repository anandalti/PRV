
    const SpecialRequirements = require('../models/SpecialRequirements');
    const getAllSpecialRequirements = async (req, res) => {
    const data = await SpecialRequirements.getAllSpecialRequirements();
    res.json(data);
    };
    const getSpecialRequirements = async (req, res) => {
    const data = await SpecialRequirements.getSpecialRequirementsById(req.params.id);
    res.json(data);
    };
    const createSpecialRequirements = async (req, res) => {
    const data = new SpecialRequirements(req.body);
    const newSpecialRequirements = await SpecialRequirements.createSpecialRequirements(data);
    res.json(newSpecialRequirements);
    };
    const updateSpecialRequirements = async (req, res) => {
    const data = new SpecialRequirements(req.body);
    const updatedSpecialRequirements = await SpecialRequirements.updateSpecialRequirements(req.params.id, data);
    res.json(updatedSpecialRequirements);
    };
    const deleteSpecialRequirements = async (req, res) => {
    const deletedSpecialRequirements = await SpecialRequirements.deleteSpecialRequirements(req.params.id);
    res.json(deletedSpecialRequirements);
    };
    module.exports = {
    getAllSpecialRequirements,
    getSpecialRequirements,
    createSpecialRequirements,
    updateSpecialRequirements,
    deleteSpecialRequirements
    };
    