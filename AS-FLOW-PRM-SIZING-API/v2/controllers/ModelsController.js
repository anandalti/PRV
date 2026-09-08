
    const Models = require('../models/Models');
    const getAllModels = async (req, res) => {
    const data = await Models.getAllModels();
    res.json(data);
    };
    const getModels = async (req, res) => {
    const data = await Models.getModelsById(req.params.id);
    res.json(data);
    };
    const createModels = async (req, res) => {
    const data = new Models(req.body);
    const newModels = await Models.createModels(data);
    res.json(newModels);
    };
    const updateModels = async (req, res) => {
    const data = new Models(req.body);
    const updatedModels = await Models.updateModels(req.params.id, data);
    res.json(updatedModels);
    };
    const deleteModels = async (req, res) => {
    const deletedModels = await Models.deleteModels(req.params.id);
    res.json(deletedModels);
    };
    module.exports = {
    getAllModels,
    getModels,
    createModels,
    updateModels,
    deleteModels
    };
    