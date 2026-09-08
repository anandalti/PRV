
    const PressureDetails = require('../models/PressureDetails');
    const getAllPressureDetails = async (req, res) => {
    const data = await PressureDetails.getAllPressureDetails();
    res.json(data);
    };
    const getPressureDetails = async (req, res) => {
    const data = await PressureDetails.getPressureDetailsById(req.params.id);
    res.json(data);
    };
    const createPressureDetails = async (req, res) => {
    const data = new PressureDetails(req.body);
    const newPressureDetails = await PressureDetails.createPressureDetails(data);
    res.json(newPressureDetails);
    };
    const updatePressureDetails = async (req, res) => {
    const data = new PressureDetails(req.body);
    const updatedPressureDetails = await PressureDetails.updatePressureDetails(req.params.id, data);
    res.json(updatedPressureDetails);
    };
    const deletePressureDetails = async (req, res) => {
    const deletedPressureDetails = await PressureDetails.deletePressureDetails(req.params.id);
    res.json(deletedPressureDetails);
    };
    module.exports = {
    getAllPressureDetails,
    getPressureDetails,
    createPressureDetails,
    updatePressureDetails,
    deletePressureDetails
    };
    