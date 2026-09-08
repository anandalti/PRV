
    const SectionChoiceComboLimitRelations = require('../models/SectionChoiceComboLimitRelations');
    const getAllSectionChoiceComboLimitRelations = async (req, res) => {
    const data = await SectionChoiceComboLimitRelations.getAllSectionChoiceComboLimitRelations();
    res.json(data);
    };
    const getSectionChoiceComboLimitRelations = async (req, res) => {
    const data = await SectionChoiceComboLimitRelations.getSectionChoiceComboLimitRelationsById(req.params.id);
    res.json(data);
    };
    const createSectionChoiceComboLimitRelations = async (req, res) => {
    const data = new SectionChoiceComboLimitRelations(req.body);
    const newSectionChoiceComboLimitRelations = await SectionChoiceComboLimitRelations.createSectionChoiceComboLimitRelations(data);
    res.json(newSectionChoiceComboLimitRelations);
    };
    const updateSectionChoiceComboLimitRelations = async (req, res) => {
    const data = new SectionChoiceComboLimitRelations(req.body);
    const updatedSectionChoiceComboLimitRelations = await SectionChoiceComboLimitRelations.updateSectionChoiceComboLimitRelations(req.params.id, data);
    res.json(updatedSectionChoiceComboLimitRelations);
    };
    const deleteSectionChoiceComboLimitRelations = async (req, res) => {
    const deletedSectionChoiceComboLimitRelations = await SectionChoiceComboLimitRelations.deleteSectionChoiceComboLimitRelations(req.params.id);
    res.json(deletedSectionChoiceComboLimitRelations);
    };
    module.exports = {
    getAllSectionChoiceComboLimitRelations,
    getSectionChoiceComboLimitRelations,
    createSectionChoiceComboLimitRelations,
    updateSectionChoiceComboLimitRelations,
    deleteSectionChoiceComboLimitRelations
    };
    