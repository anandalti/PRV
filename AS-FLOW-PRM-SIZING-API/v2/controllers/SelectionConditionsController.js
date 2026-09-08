
    const SelectionConditions = require('../models/SelectionConditions');
    const getAllSelectionConditions = async (req, res) => {
    const data = await SelectionConditions.getAllSelectionConditions();
    res.json(data);
    };
    const getSelectionConditions = async (req, res) => {
    const data = await SelectionConditions.getSelectionConditionsById(req.params.id);
    res.json(data);
    };
    const createSelectionConditions = async (req, res) => {
    const data = new SelectionConditions(req.body);
    const newSelectionConditions = await SelectionConditions.createSelectionConditions(data);
    res.json(newSelectionConditions);
    };
    const updateSelectionConditions = async (req, res) => {
    const data = new SelectionConditions(req.body);
    const updatedSelectionConditions = await SelectionConditions.updateSelectionConditions(req.params.id, data);
    res.json(updatedSelectionConditions);
    };
    const deleteSelectionConditions = async (req, res) => {
    const deletedSelectionConditions = await SelectionConditions.deleteSelectionConditions(req.params.id);
    res.json(deletedSelectionConditions);
    };
    module.exports = {
    getAllSelectionConditions,
    getSelectionConditions,
    createSelectionConditions,
    updateSelectionConditions,
    deleteSelectionConditions
    };
    