
    const ConfigurationModels = require('../models/ConfigurationModels');
    const getAllConfigurationModels = async (req, res) => {
    const data = await ConfigurationModels.getAllConfigurationModels();
    res.json(data);
    };
    const getConfigurationModels = async (req, res) => {
    const data = await ConfigurationModels.getConfigurationModelsById(req.params.id);
    res.json(data);
    };
    const createConfigurationModels = async (req, res) => {
    const data = new ConfigurationModels(req.body);
    const newConfigurationModels = await ConfigurationModels.createConfigurationModels(data);
    res.json(newConfigurationModels);
    };
    const updateConfigurationModels = async (req, res) => {
    const data = new ConfigurationModels(req.body);
    const updatedConfigurationModels = await ConfigurationModels.updateConfigurationModels(req.params.id, data);
    res.json(updatedConfigurationModels);
    };
    const deleteConfigurationModels = async (req, res) => {
    const deletedConfigurationModels = await ConfigurationModels.deleteConfigurationModels(req.params.id);
    res.json(deletedConfigurationModels);
    };
    module.exports = {
    getAllConfigurationModels,
    getConfigurationModels,
    createConfigurationModels,
    updateConfigurationModels,
    deleteConfigurationModels
    };
    