
    const MappingSAPPRVModels = require('../models/MappingSAPPRVModels');
    const getAllMappingSAPPRVModels = async (req, res) => {
    const data = await MappingSAPPRVModels.getAllMappingSAPPRVModels();
    res.json(data);
    };
    const getMappingSAPPRVModels = async (req, res) => {
    const data = await MappingSAPPRVModels.getMappingSAPPRVModelsById(req.params.id);
    res.json(data);
    };
    const createMappingSAPPRVModels = async (req, res) => {
    const data = new MappingSAPPRVModels(req.body);
    const newMappingSAPPRVModels = await MappingSAPPRVModels.createMappingSAPPRVModels(data);
    res.json(newMappingSAPPRVModels);
    };
    const updateMappingSAPPRVModels = async (req, res) => {
    const data = new MappingSAPPRVModels(req.body);
    const updatedMappingSAPPRVModels = await MappingSAPPRVModels.updateMappingSAPPRVModels(req.params.id, data);
    res.json(updatedMappingSAPPRVModels);
    };
    const deleteMappingSAPPRVModels = async (req, res) => {
    const deletedMappingSAPPRVModels = await MappingSAPPRVModels.deleteMappingSAPPRVModels(req.params.id);
    res.json(deletedMappingSAPPRVModels);
    };
    module.exports = {
    getAllMappingSAPPRVModels,
    getMappingSAPPRVModels,
    createMappingSAPPRVModels,
    updateMappingSAPPRVModels,
    deleteMappingSAPPRVModels
    };
    