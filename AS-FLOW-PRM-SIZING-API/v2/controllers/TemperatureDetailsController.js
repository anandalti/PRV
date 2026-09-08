
    const TemperatureDetails = require('../models/TemperatureDetails');
    const getAllTemperatureDetails = async (req, res) => {
    const data = await TemperatureDetails.getAllTemperatureDetails();
    res.json(data);
    };
    const getTemperatureDetails = async (req, res) => {
    const data = await TemperatureDetails.getTemperatureDetailsById(req.params.id);
    res.json(data);
    };
    const createTemperatureDetails = async (req, res) => {
    const data = new TemperatureDetails(req.body);
    const newTemperatureDetails = await TemperatureDetails.createTemperatureDetails(data);
    res.json(newTemperatureDetails);
    };
    const updateTemperatureDetails = async (req, res) => {
    const data = new TemperatureDetails(req.body);
    const updatedTemperatureDetails = await TemperatureDetails.updateTemperatureDetails(req.params.id, data);
    res.json(updatedTemperatureDetails);
    };
    const deleteTemperatureDetails = async (req, res) => {
    const deletedTemperatureDetails = await TemperatureDetails.deleteTemperatureDetails(req.params.id);
    res.json(deletedTemperatureDetails);
    };
    module.exports = {
    getAllTemperatureDetails,
    getTemperatureDetails,
    createTemperatureDetails,
    updateTemperatureDetails,
    deleteTemperatureDetails
    };
    