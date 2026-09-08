
    const GetWorkFlowSelectionConditions = require('../models/GetWorkFlowSelectionConditions');
    const getAllGetWorkFlowSelectionConditions = async (req, res) => {
    const data = await GetWorkFlowSelectionConditions.getAllGetWorkFlowSelectionConditions();
    res.json(data);
    };
    const getGetWorkFlowSelectionConditions = async (req, res) => {
    const data = await GetWorkFlowSelectionConditions.getGetWorkFlowSelectionConditionsById(req.params.id);
    res.json(data);
    };
    module.exports = {
    getAllGetWorkFlowSelectionConditions,
    getGetWorkFlowSelectionConditions
    };
    