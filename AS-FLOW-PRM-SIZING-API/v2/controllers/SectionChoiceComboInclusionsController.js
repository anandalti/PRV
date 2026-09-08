
    const SectionChoiceComboInclusions = require('../models/SectionChoiceComboInclusions');
    const getAllSectionChoiceComboInclusions = async (req, res) => {
    const data = await SectionChoiceComboInclusions.getAllSectionChoiceComboInclusions();
    res.json(data);
    };
    const getSectionChoiceComboInclusions = async (req, res) => {
    const data = await SectionChoiceComboInclusions.getSectionChoiceComboInclusionsById(req.params.id);
    res.json(data);
    };
    const createSectionChoiceComboInclusions = async (req, res) => {
    const data = new SectionChoiceComboInclusions(req.body);
    const newSectionChoiceComboInclusions = await SectionChoiceComboInclusions.createSectionChoiceComboInclusions(data);
    res.json(newSectionChoiceComboInclusions);
    };
    const updateSectionChoiceComboInclusions = async (req, res) => {
    const data = new SectionChoiceComboInclusions(req.body);
    const updatedSectionChoiceComboInclusions = await SectionChoiceComboInclusions.updateSectionChoiceComboInclusions(req.params.id, data);
    res.json(updatedSectionChoiceComboInclusions);
    };
    const deleteSectionChoiceComboInclusions = async (req, res) => {
    const deletedSectionChoiceComboInclusions = await SectionChoiceComboInclusions.deleteSectionChoiceComboInclusions(req.params.id);
    res.json(deletedSectionChoiceComboInclusions);
    };
    module.exports = {
    getAllSectionChoiceComboInclusions,
    getSectionChoiceComboInclusions,
    createSectionChoiceComboInclusions,
    updateSectionChoiceComboInclusions,
    deleteSectionChoiceComboInclusions
    };
    