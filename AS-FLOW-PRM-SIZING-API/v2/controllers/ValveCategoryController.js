
    const ValveCategory = require('../models/ValveCategory');
    const getAllValveCategory = async (req, res) => {
    const data = await ValveCategory.getAllValveCategory();
    res.json(data);
    };
    const getValveCategory = async (req, res) => {
    const data = await ValveCategory.getValveCategoryById(req.params.id);
    res.json(data);
    };
    const createValveCategory = async (req, res) => {
    const data = new ValveCategory(req.body);
    const newValveCategory = await ValveCategory.createValveCategory(data);
    res.json(newValveCategory);
    };
    const updateValveCategory = async (req, res) => {
    const data = new ValveCategory(req.body);
    const updatedValveCategory = await ValveCategory.updateValveCategory(req.params.id, data);
    res.json(updatedValveCategory);
    };
    const deleteValveCategory = async (req, res) => {
    const deletedValveCategory = await ValveCategory.deleteValveCategory(req.params.id);
    res.json(deletedValveCategory);
    };
    module.exports = {
    getAllValveCategory,
    getValveCategory,
    createValveCategory,
    updateValveCategory,
    deleteValveCategory
    };
    