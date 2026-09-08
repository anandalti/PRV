
    const ExceptionsandInclusions = require('../models/ExceptionsandInclusions');
    const getAllExceptionsandInclusions = async (req, res) => {
    const data = await ExceptionsandInclusions.getAllExceptionsandInclusions();
    res.json(data);
    };
    const getExceptionsandInclusions = async (req, res) => {
    const data = await ExceptionsandInclusions.getExceptionsandInclusionsById(req.params.id);
    res.json(data);
    };
    const createExceptionsandInclusions = async (req, res) => {
    const data = new ExceptionsandInclusions(req.body);
    const newExceptionsandInclusions = await ExceptionsandInclusions.createExceptionsandInclusions(data);
    res.json(newExceptionsandInclusions);
    };
    const updateExceptionsandInclusions = async (req, res) => {
    const data = new ExceptionsandInclusions(req.body);
    const updatedExceptionsandInclusions = await ExceptionsandInclusions.updateExceptionsandInclusions(req.params.id, data);
    res.json(updatedExceptionsandInclusions);
    };
    const deleteExceptionsandInclusions = async (req, res) => {
    const deletedExceptionsandInclusions = await ExceptionsandInclusions.deleteExceptionsandInclusions(req.params.id);
    res.json(deletedExceptionsandInclusions);
    };
    module.exports = {
    getAllExceptionsandInclusions,
    getExceptionsandInclusions,
    createExceptionsandInclusions,
    updateExceptionsandInclusions,
    deleteExceptionsandInclusions
    };
    