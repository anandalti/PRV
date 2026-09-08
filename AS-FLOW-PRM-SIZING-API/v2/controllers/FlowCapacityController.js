
    const FlowCapacity = require('../models/FlowCapacity');
    const getAllFlowCapacity = async (req, res) => {
    const data = await FlowCapacity.getAllFlowCapacity();
    res.json(data);
    };
    const getFlowCapacity = async (req, res) => {
    const data = await FlowCapacity.getFlowCapacityById(req.params.id);
    res.json(data);
    };
    const createFlowCapacity = async (req, res) => {
    const data = new FlowCapacity(req.body);
    const newFlowCapacity = await FlowCapacity.createFlowCapacity(data);
    res.json(newFlowCapacity);
    };
    const updateFlowCapacity = async (req, res) => {
    const data = new FlowCapacity(req.body);
    const updatedFlowCapacity = await FlowCapacity.updateFlowCapacity(req.params.id, data);
    res.json(updatedFlowCapacity);
    };
    const deleteFlowCapacity = async (req, res) => {
    const deletedFlowCapacity = await FlowCapacity.deleteFlowCapacity(req.params.id);
    res.json(deletedFlowCapacity);
    };
    module.exports = {
    getAllFlowCapacity,
    getFlowCapacity,
    createFlowCapacity,
    updateFlowCapacity,
    deleteFlowCapacity
    };
    