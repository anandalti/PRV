
    const SystemDetails = require('../models/SystemDetails');
    const getAllSystemDetails = async (req, res) => {
    const data = await SystemDetails.getAllSystemDetails();
    res.json(data);
    };
    const getSystemDetails = async (req, res) => {
    const data = await SystemDetails.getSystemDetailsById(req.params.id);
    res.json(data);
    };
    const createSystemDetails = async (req, res) => {
    const data = new SystemDetails(req.body);
    const newSystemDetails = await SystemDetails.createSystemDetails(data);
    res.json(newSystemDetails);
    };
    const updateSystemDetails = async (req, res) => {
    const data = new SystemDetails(req.body);
    const updatedSystemDetails = await SystemDetails.updateSystemDetails(req.params.id, data);
    res.json(updatedSystemDetails);
    };
    const deleteSystemDetails = async (req, res) => {
    const deletedSystemDetails = await SystemDetails.deleteSystemDetails(req.params.id);
    res.json(deletedSystemDetails);
    };
    module.exports = {
    getAllSystemDetails,
    getSystemDetails,
    createSystemDetails,
    updateSystemDetails,
    deleteSystemDetails
    };
    