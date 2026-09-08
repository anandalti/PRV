
    const SectionChoiceComboRestrictions = require('../models/SectionChoiceComboRestrictions');
    const getAllSectionChoiceComboRestrictions = async (req, res) => {
    const data = await SectionChoiceComboRestrictions.getAllSectionChoiceComboRestrictions();
    res.json(data);
    };
    const getSectionChoiceComboRestrictions = async (req, res) => {
    const data = await SectionChoiceComboRestrictions.getSectionChoiceComboRestrictionsById(req.params.id);
    res.json(data);
    };
    const createSectionChoiceComboRestrictions = async (req, res) => {
    const data = new SectionChoiceComboRestrictions(req.body);
    const newSectionChoiceComboRestrictions = await SectionChoiceComboRestrictions.createSectionChoiceComboRestrictions(data);
    res.json(newSectionChoiceComboRestrictions);
    };
    const updateSectionChoiceComboRestrictions = async (req, res) => {
    const data = new SectionChoiceComboRestrictions(req.body);
    const updatedSectionChoiceComboRestrictions = await SectionChoiceComboRestrictions.updateSectionChoiceComboRestrictions(req.params.id, data);
    res.json(updatedSectionChoiceComboRestrictions);
    };
    const deleteSectionChoiceComboRestrictions = async (req, res) => {
    const deletedSectionChoiceComboRestrictions = await SectionChoiceComboRestrictions.deleteSectionChoiceComboRestrictions(req.params.id);
    res.json(deletedSectionChoiceComboRestrictions);
    };
    module.exports = {
    getAllSectionChoiceComboRestrictions,
    getSectionChoiceComboRestrictions,
    createSectionChoiceComboRestrictions,
    updateSectionChoiceComboRestrictions,
    deleteSectionChoiceComboRestrictions
    };
    