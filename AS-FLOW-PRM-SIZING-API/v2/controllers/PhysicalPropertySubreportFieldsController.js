
    const PhysicalPropertySubreportFields = require('../models/PhysicalPropertySubreportFields');
    const getAllPhysicalPropertySubreportFields = async (req, res) => {
    const data = await PhysicalPropertySubreportFields.getAllPhysicalPropertySubreportFields();
    res.json(data);
    };
    const getPhysicalPropertySubreportFields = async (req, res) => {
    const data = await PhysicalPropertySubreportFields.getPhysicalPropertySubreportFieldsById(req.params.id);
    res.json(data);
    };
    const createPhysicalPropertySubreportFields = async (req, res) => {
    const data = new PhysicalPropertySubreportFields(req.body);
    const newPhysicalPropertySubreportFields = await PhysicalPropertySubreportFields.createPhysicalPropertySubreportFields(data);
    res.json(newPhysicalPropertySubreportFields);
    };
    const updatePhysicalPropertySubreportFields = async (req, res) => {
    const data = new PhysicalPropertySubreportFields(req.body);
    const updatedPhysicalPropertySubreportFields = await PhysicalPropertySubreportFields.updatePhysicalPropertySubreportFields(req.params.id, data);
    res.json(updatedPhysicalPropertySubreportFields);
    };
    const deletePhysicalPropertySubreportFields = async (req, res) => {
    const deletedPhysicalPropertySubreportFields = await PhysicalPropertySubreportFields.deletePhysicalPropertySubreportFields(req.params.id);
    res.json(deletedPhysicalPropertySubreportFields);
    };
    module.exports = {
    getAllPhysicalPropertySubreportFields,
    getPhysicalPropertySubreportFields,
    createPhysicalPropertySubreportFields,
    updatePhysicalPropertySubreportFields,
    deletePhysicalPropertySubreportFields
    };
    