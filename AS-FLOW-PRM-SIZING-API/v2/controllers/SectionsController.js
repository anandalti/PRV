
    const Sections = require('../models/Sections');
    const getAllSections = async (req, res) => {
    const data = await Sections.getAllSections();
    res.json(data);
    };
    const getSections = async (req, res) => {
        const data = await Sections.getSectionsById(req.params.id);
        res.json(data);
    };
    const createSections = async (req, res) => {
        const data = new Sections(req.body);
        const newSections = await Sections.createSections(data);
        res.json(newSections);
    };
    const updateSections = async (req, res) => {
        const data = new Sections(req.body);
        const updatedSections = await Sections.updateSections(req.params.id, data);
        res.json(updatedSections);
    };
    const deleteSections = async (req, res) => {
        const deletedSections = await Sections.deleteSections(req.params.id);
        res.json(deletedSections);
    };
    module.exports = {
    getAllSections,
    getSections,
    createSections,
    updateSections,
    deleteSections
    };
    