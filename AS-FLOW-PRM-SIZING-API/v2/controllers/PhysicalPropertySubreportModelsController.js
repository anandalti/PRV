
    const PhysicalPropertySubreportModels = require('../models/PhysicalPropertySubreportModels');
    const getAllPhysicalPropertySubreportModels = async (req, res) => {
    const data = await PhysicalPropertySubreportModels.getAllPhysicalPropertySubreportModels();
    res.json(data);
    };
    const getPhysicalPropertySubreportModels = async (req, res) => {
    const data = await PhysicalPropertySubreportModels.getPhysicalPropertySubreportModelsById(req.params.id);
    res.json(data);
    };
    const createPhysicalPropertySubreportModels = async (req, res) => {
    const data = new PhysicalPropertySubreportModels(req.body);
    const newPhysicalPropertySubreportModels = await PhysicalPropertySubreportModels.createPhysicalPropertySubreportModels(data);
    res.json(newPhysicalPropertySubreportModels);
    };
    const updatePhysicalPropertySubreportModels = async (req, res) => {
    const data = new PhysicalPropertySubreportModels(req.body);
    const updatedPhysicalPropertySubreportModels = await PhysicalPropertySubreportModels.updatePhysicalPropertySubreportModels(req.params.id, data);
    res.json(updatedPhysicalPropertySubreportModels);
    };
    const deletePhysicalPropertySubreportModels = async (req, res) => {
    const deletedPhysicalPropertySubreportModels = await PhysicalPropertySubreportModels.deletePhysicalPropertySubreportModels(req.params.id);
    res.json(deletedPhysicalPropertySubreportModels);
    };
    module.exports = {
    getAllPhysicalPropertySubreportModels,
    getPhysicalPropertySubreportModels,
    createPhysicalPropertySubreportModels,
    updatePhysicalPropertySubreportModels,
    deletePhysicalPropertySubreportModels
    };
    