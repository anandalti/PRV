
    const SelectedValve = require('../models/SelectedValve');
    const getAllSelectedValve = async (req, res) => {
    const data = await SelectedValve.getAllSelectedValve();
    res.json(data);
    };
    const getSelectedValve = async (req, res) => {
    const data = await SelectedValve.getSelectedValveById(req.params.id);
    res.json(data);
    };
    const createSelectedValve = async (req, res) => {
    const data = new SelectedValve(req.body);
    const newSelectedValve = await SelectedValve.createSelectedValve(data);
    res.json(newSelectedValve);
    };
    const updateSelectedValve = async (req, res) => {
    const data = new SelectedValve(req.body);
    const updatedSelectedValve = await SelectedValve.updateSelectedValve(req.params.id, data);
    res.json(updatedSelectedValve);
    };
    const deleteSelectedValve = async (req, res) => {
    const deletedSelectedValve = await SelectedValve.deleteSelectedValve(req.params.id);
    res.json(deletedSelectedValve);
    };
    module.exports = {
    getAllSelectedValve,
    getSelectedValve,
    createSelectedValve,
    updateSelectedValve,
    deleteSelectedValve
    };
    