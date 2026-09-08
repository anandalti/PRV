
    const PhysicalPropertySubreports = require('../models/PhysicalPropertySubreports');
    const getAllPhysicalPropertySubreports = async (req, res) => {
    const data = await PhysicalPropertySubreports.getAllPhysicalPropertySubreports();
    res.json(data);
    };
    const getPhysicalPropertySubreports = async (req, res) => {
    const data = await PhysicalPropertySubreports.getPhysicalPropertySubreportsById(req.params.id);
    res.json(data);
    };
    const createPhysicalPropertySubreports = async (req, res) => {
    const data = new PhysicalPropertySubreports(req.body);
    const newPhysicalPropertySubreports = await PhysicalPropertySubreports.createPhysicalPropertySubreports(data);
    res.json(newPhysicalPropertySubreports);
    };
    const updatePhysicalPropertySubreports = async (req, res) => {
    const data = new PhysicalPropertySubreports(req.body);
    const updatedPhysicalPropertySubreports = await PhysicalPropertySubreports.updatePhysicalPropertySubreports(req.params.id, data);
    res.json(updatedPhysicalPropertySubreports);
    };
    const deletePhysicalPropertySubreports = async (req, res) => {
    const deletedPhysicalPropertySubreports = await PhysicalPropertySubreports.deletePhysicalPropertySubreports(req.params.id);
    res.json(deletedPhysicalPropertySubreports);
    };
    module.exports = {
    getAllPhysicalPropertySubreports,
    getPhysicalPropertySubreports,
    createPhysicalPropertySubreports,
    updatePhysicalPropertySubreports,
    deletePhysicalPropertySubreports
    };
    