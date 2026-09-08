
    const API2000Results = require('../models/API2000Results');
    const getAllAPI2000Results = async (req, res) => {
    const data = await API2000Results.getAllAPI2000Results();
    res.json(data);
    };
    const getAPI2000Results = async (req, res) => {
    const data = await API2000Results.getAPI2000ResultsById(req.params.id);
    res.json(data);
    };
    const createAPI2000Results = async (req, res) => {
    const data = new API2000Results(req.body);
    const newAPI2000Results = await API2000Results.createAPI2000Results(data);
    res.json(newAPI2000Results);
    };
    const updateAPI2000Results = async (req, res) => {
    const data = new API2000Results(req.body);
    const updatedAPI2000Results = await API2000Results.updateAPI2000Results(req.params.id, data);
    res.json(updatedAPI2000Results);
    };
    const deleteAPI2000Results = async (req, res) => {
    const deletedAPI2000Results = await API2000Results.deleteAPI2000Results(req.params.id);
    res.json(deletedAPI2000Results);
    };
    module.exports = {
    getAllAPI2000Results,
    getAPI2000Results,
    createAPI2000Results,
    updateAPI2000Results,
    deleteAPI2000Results
    };
    