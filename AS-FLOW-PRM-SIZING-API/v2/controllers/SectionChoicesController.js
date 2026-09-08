
    const SectionChoices = require('../models/SectionChoices');
    const getAllSectionChoices = async (req, res) => {
    const data = await SectionChoices.getAllSectionChoices();
    res.json(data);
    };
    const getSectionChoices = async (req, res) => {
    const data = await SectionChoices.getSectionChoicesById(req.params.id);
    res.json(data);
    };
    const createSectionChoices = async (req, res) => {
    const data = new SectionChoices(req.body);
    const newSectionChoices = await SectionChoices.createSectionChoices(data);
    res.json(newSectionChoices);
    };
    const updateSectionChoices = async (req, res) => {
    const data = new SectionChoices(req.body);
    const updatedSectionChoices = await SectionChoices.updateSectionChoices(req.params.id, data);
    res.json(updatedSectionChoices);
    };
    const deleteSectionChoices = async (req, res) => {
    const deletedSectionChoices = await SectionChoices.deleteSectionChoices(req.params.id);
    res.json(deletedSectionChoices);
    };
    module.exports = {
    getAllSectionChoices,
    getSectionChoices,
    createSectionChoices,
    updateSectionChoices,
    deleteSectionChoices
    };
    