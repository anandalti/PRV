
    const SectionChoiceComboLimits = require('../models/SectionChoiceComboLimits');
    const getAllSectionChoiceComboLimits = async (req, res) => {
    const data = await SectionChoiceComboLimits.getAllSectionChoiceComboLimits();
    res.json(data);
    };
    const getSectionChoiceComboLimits = async (req, res) => {
    const data = await SectionChoiceComboLimits.getSectionChoiceComboLimitsById(req.params.id);
    res.json(data);
    };
    const createSectionChoiceComboLimits = async (req, res) => {
    const data = new SectionChoiceComboLimits(req.body);
    const newSectionChoiceComboLimits = await SectionChoiceComboLimits.createSectionChoiceComboLimits(data);
    res.json(newSectionChoiceComboLimits);
    };
    const updateSectionChoiceComboLimits = async (req, res) => {
    const data = new SectionChoiceComboLimits(req.body);
    const updatedSectionChoiceComboLimits = await SectionChoiceComboLimits.updateSectionChoiceComboLimits(req.params.id, data);
    res.json(updatedSectionChoiceComboLimits);
    };
    const deleteSectionChoiceComboLimits = async (req, res) => {
    const deletedSectionChoiceComboLimits = await SectionChoiceComboLimits.deleteSectionChoiceComboLimits(req.params.id);
    res.json(deletedSectionChoiceComboLimits);
    };
    module.exports = {
    getAllSectionChoiceComboLimits,
    getSectionChoiceComboLimits,
    createSectionChoiceComboLimits,
    updateSectionChoiceComboLimits,
    deleteSectionChoiceComboLimits
    };
    