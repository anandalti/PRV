
    const GenericValveSizing = require('../models/GenericValveSizing');
    const getAllGenericValveSizing = async (req, res) => {
    const data = await GenericValveSizing.getAllGenericValveSizing();
    res.json(data);
    };
    const getGenericValveSizing = async (req, res) => {
    const data = await GenericValveSizing.getGenericValveSizingById(req.params.id);
    res.json(data);
    };
    const createGenericValveSizing = async (req, res) => {
    const data = new GenericValveSizing(req.body);
    const newGenericValveSizing = await GenericValveSizing.createGenericValveSizing(data);
    res.json(newGenericValveSizing);
    };
    const updateGenericValveSizing = async (req, res) => {
    const data = new GenericValveSizing(req.body);
    const updatedGenericValveSizing = await GenericValveSizing.updateGenericValveSizing(req.params.id, data);
    res.json(updatedGenericValveSizing);
    };
    const deleteGenericValveSizing = async (req, res) => {
    const deletedGenericValveSizing = await GenericValveSizing.deleteGenericValveSizing(req.params.id);
    res.json(deletedGenericValveSizing);
    };
    module.exports = {
    getAllGenericValveSizing,
    getGenericValveSizing,
    createGenericValveSizing,
    updateGenericValveSizing,
    deleteGenericValveSizing
    };
    