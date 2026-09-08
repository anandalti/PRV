
    const WorkFlow = require('../models/WorkFlow');
    const getAllWorkFlow = async (req, res) => {
    const data = await WorkFlow.getAllWorkFlow();
    res.json(data);
    };
    const getWorkFlow = async (req, res) => {
    const data = await WorkFlow.getWorkFlowById(req.params.id);
    res.json(data);
    };
    const createWorkFlow = async (req, res) => {
    const data = new WorkFlow(req.body);
    const newWorkFlow = await WorkFlow.createWorkFlow(data);
    res.json(newWorkFlow);
    };
    const updateWorkFlow = async (req, res) => {
    const data = new WorkFlow(req.body);
    const updatedWorkFlow = await WorkFlow.updateWorkFlow(req.params.id, data);
    res.json(updatedWorkFlow);
    };
    const deleteWorkFlow = async (req, res) => {
    const deletedWorkFlow = await WorkFlow.deleteWorkFlow(req.params.id);
    res.json(deletedWorkFlow);
    };
    module.exports = {
    getAllWorkFlow,
    getWorkFlow,
    createWorkFlow,
    updateWorkFlow,
    deleteWorkFlow
    };
    