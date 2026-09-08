
    const SAPModels = require('../models/SAPModels');
    const getAllSAPModels = async (req, res) => {
    const data = await SAPModels.getAllSAPModels();
    res.json(data);
    };
    const getSAPModels = async (req, res) => {
    const data = await SAPModels.getSAPModelsById(req.params.id);
    res.json(data);
    };
    const createSAPModels = async (req, res) => {
    const data = new SAPModels(req.body);
    const newSAPModels = await SAPModels.createSAPModels(data);
    res.json(newSAPModels);
    };
    const updateSAPModels = async (req, res) => {
    const data = new SAPModels(req.body);
    const updatedSAPModels = await SAPModels.updateSAPModels(req.params.id, data);
    res.json(updatedSAPModels);
    };
    const deleteSAPModels = async (req, res) => {
    const deletedSAPModels = await SAPModels.deleteSAPModels(req.params.id);
    res.json(deletedSAPModels);
    };
    module.exports = {
    getAllSAPModels,
    getSAPModels,
    createSAPModels,
    updateSAPModels,
    deleteSAPModels
    };
    