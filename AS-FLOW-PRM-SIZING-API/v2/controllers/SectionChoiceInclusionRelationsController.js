
    const SectionChoiceInclusionRelations = require('../models/SectionChoiceInclusionRelations');
    const getAllSectionChoiceInclusionRelations = async (req, res) => {
    const data = await SectionChoiceInclusionRelations.getAllSectionChoiceInclusionRelations();
    res.json(data);
    };
    const getSectionChoiceInclusionRelations = async (req, res) => {
    const data = await SectionChoiceInclusionRelations.getSectionChoiceInclusionRelationsById(req.params.id);
    res.json(data);
    };
    const createSectionChoiceInclusionRelations = async (req, res) => {
    const data = new SectionChoiceInclusionRelations(req.body);
    const newSectionChoiceInclusionRelations = await SectionChoiceInclusionRelations.createSectionChoiceInclusionRelations(data);
    res.json(newSectionChoiceInclusionRelations);
    };
    const updateSectionChoiceInclusionRelations = async (req, res) => {
    const data = new SectionChoiceInclusionRelations(req.body);
    const updatedSectionChoiceInclusionRelations = await SectionChoiceInclusionRelations.updateSectionChoiceInclusionRelations(req.params.id, data);
    res.json(updatedSectionChoiceInclusionRelations);
    };
    const deleteSectionChoiceInclusionRelations = async (req, res) => {
    const deletedSectionChoiceInclusionRelations = await SectionChoiceInclusionRelations.deleteSectionChoiceInclusionRelations(req.params.id);
    res.json(deletedSectionChoiceInclusionRelations);
    };
    module.exports = {
    getAllSectionChoiceInclusionRelations,
    getSectionChoiceInclusionRelations,
    createSectionChoiceInclusionRelations,
    updateSectionChoiceInclusionRelations,
    deleteSectionChoiceInclusionRelations
    };
    