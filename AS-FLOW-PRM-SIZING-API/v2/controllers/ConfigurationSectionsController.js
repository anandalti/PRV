
    const ConfigurationSections = require('../models/ConfigurationSections');
    const getAllConfigurationSections = async (req, res) => {
    const data = await ConfigurationSections.getAllConfigurationSections();
    res.json(data);
    };
    const getConfigurationSections = async (req, res) => {
    const data = await ConfigurationSections.getConfigurationSectionsById(req.params.id);
    res.json(data);
    };
    const createConfigurationSections = async (req, res) => {
    const data = new ConfigurationSections(req.body);
    const newConfigurationSections = await ConfigurationSections.createConfigurationSections(data);
    res.json(newConfigurationSections);
    };
    const updateConfigurationSections = async (req, res) => {
    const data = new ConfigurationSections(req.body);
    const updatedConfigurationSections = await ConfigurationSections.updateConfigurationSections(req.params.id, data);
    res.json(updatedConfigurationSections);
    };
    const deleteConfigurationSections = async (req, res) => {
    const deletedConfigurationSections = await ConfigurationSections.deleteConfigurationSections(req.params.id);
    res.json(deletedConfigurationSections);
    };
    module.exports = {
    getAllConfigurationSections,
    getConfigurationSections,
    createConfigurationSections,
    updateConfigurationSections,
    deleteConfigurationSections
    };
    