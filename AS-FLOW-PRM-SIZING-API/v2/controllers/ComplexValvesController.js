
    const ComplexValves = require('../models/ComplexValves');
    const getAllComplexValves = async (req, res) => {
    const data = await ComplexValves.getAllComplexValves();
    res.json(data);
    };
    const getComplexValves = async (req, res) => {
    const data = await ComplexValves.getComplexValvesById(req.params.id);
    res.json(data);
    };
    const createComplexValves = async (req, res) => {
    const data = new ComplexValves(req.body);
    const newComplexValves = await ComplexValves.createComplexValves(data);
    res.json(newComplexValves);
    };
    const updateComplexValves = async (req, res) => {
    const data = new ComplexValves(req.body);
    const updatedComplexValves = await ComplexValves.updateComplexValves(req.params.id, data);
    res.json(updatedComplexValves);
    };
    const deleteComplexValves = async (req, res) => {
    const deletedComplexValves = await ComplexValves.deleteComplexValves(req.params.id);
    res.json(deletedComplexValves);
    };
    module.exports = {
    getAllComplexValves,
    getComplexValves,
    createComplexValves,
    updateComplexValves,
    deleteComplexValves
    };
    