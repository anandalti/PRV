
    const SizingDetails = require('../models/SizingDetails');
    const getAllSizingDetails = async (req, res) => {
    const data = await SizingDetails.getAllSizingDetails();
    res.json(data);
    };
    const getSizingDetails = async (req, res) => {
    const data = await SizingDetails.getSizingDetailsById(req.params.id);
    res.json(data);
    };
    const createSizingDetails = async (req, res) => {
    const data = new SizingDetails(req.body);
    const newSizingDetails = await SizingDetails.createSizingDetails(data);
    res.json(newSizingDetails);
    };
    const updateSizingDetails = async (req, res) => {
    const data = new SizingDetails(req.body);
    const updatedSizingDetails = await SizingDetails.updateSizingDetails(req.params.id, data);
    res.json(updatedSizingDetails);
    };
    const deleteSizingDetails = async (req, res) => {
    const deletedSizingDetails = await SizingDetails.deleteSizingDetails(req.params.id);
    res.json(deletedSizingDetails);
    };
    module.exports = {
    getAllSizingDetails,
    getSizingDetails,
    createSizingDetails,
    updateSizingDetails,
    deleteSizingDetails
    };
    