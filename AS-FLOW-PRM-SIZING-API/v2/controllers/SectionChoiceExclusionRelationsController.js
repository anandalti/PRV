
    const SectionChoiceExclusionRelations = require('../models/SectionChoiceExclusionRelations');
    const getAllSectionChoiceExclusionRelations = async (req, res) => {
    const data = await SectionChoiceExclusionRelations.getAllSectionChoiceExclusionRelations();
    res.json(data);
    };
    const getSectionChoiceExclusionRelations = async (req, res) => {
    const data = await SectionChoiceExclusionRelations.getSectionChoiceExclusionRelationsById(req.params.id);
    res.json(data);
    };
    const createSectionChoiceExclusionRelations = async (req, res) => {
    const data = new SectionChoiceExclusionRelations(req.body);
    const newSectionChoiceExclusionRelations = await SectionChoiceExclusionRelations.createSectionChoiceExclusionRelations(data);
    res.json(newSectionChoiceExclusionRelations);
    };
    const updateSectionChoiceExclusionRelations = async (req, res) => {
    const data = new SectionChoiceExclusionRelations(req.body);
    const updatedSectionChoiceExclusionRelations = await SectionChoiceExclusionRelations.updateSectionChoiceExclusionRelations(req.params.id, data);
    res.json(updatedSectionChoiceExclusionRelations);
    };
    const deleteSectionChoiceExclusionRelations = async (req, res) => {
    const deletedSectionChoiceExclusionRelations = await SectionChoiceExclusionRelations.deleteSectionChoiceExclusionRelations(req.params.id);
    res.json(deletedSectionChoiceExclusionRelations);
    };
    module.exports = {
    getAllSectionChoiceExclusionRelations,
    getSectionChoiceExclusionRelations,
    createSectionChoiceExclusionRelations,
    updateSectionChoiceExclusionRelations,
    deleteSectionChoiceExclusionRelations
    };
    