
    const WorkflowSelection = require('../models/WorkflowSelection');
    const getAllWorkflowSelection = async (req, res) => {
    const data = await WorkflowSelection.getAllWorkflowSelection();
    res.json(data);
    };
    const getWorkflowSelection = async (req, res) => {
    const data = await WorkflowSelection.getWorkflowSelectionById(req.params.id);
    res.json(data);
    };
    const createWorkflowSelection = async (req, res) => {
    const data = new WorkflowSelection(req.body);
    const newWorkflowSelection = await WorkflowSelection.createWorkflowSelection(data);
    res.json(newWorkflowSelection);
    };
    const updateWorkflowSelection = async (req, res) => {
    const data = new WorkflowSelection(req.body);
    const updatedWorkflowSelection = await WorkflowSelection.updateWorkflowSelection(req.params.id, data);
    res.json(updatedWorkflowSelection);
    };
    const deleteWorkflowSelection = async (req, res) => {
    const deletedWorkflowSelection = await WorkflowSelection.deleteWorkflowSelection(req.params.id);
    res.json(deletedWorkflowSelection);
    };
    module.exports = {
    getAllWorkflowSelection,
    getWorkflowSelection,
    createWorkflowSelection,
    updateWorkflowSelection,
    deleteWorkflowSelection
    };
    