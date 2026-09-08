
    const API2000FlowRateReq = require('../models/API2000FlowRateReq');
    const getAllAPI2000FlowRateReq = async (req, res) => {
    const data = await API2000FlowRateReq.getAllAPI2000FlowRateReq();
    res.json(data);
    };
    const getAPI2000FlowRateReq = async (req, res) => {
    const data = await API2000FlowRateReq.getAPI2000FlowRateReqById(req.params.id);
    res.json(data);
    };
    const createAPI2000FlowRateReq = async (req, res) => {
    const data = new API2000FlowRateReq(req.body);
    const newAPI2000FlowRateReq = await API2000FlowRateReq.createAPI2000FlowRateReq(data);
    res.json(newAPI2000FlowRateReq);
    };
    const updateAPI2000FlowRateReq = async (req, res) => {
    const data = new API2000FlowRateReq(req.body);
    const updatedAPI2000FlowRateReq = await API2000FlowRateReq.updateAPI2000FlowRateReq(req.params.id, data);
    res.json(updatedAPI2000FlowRateReq);
    };
    const deleteAPI2000FlowRateReq = async (req, res) => {
    const deletedAPI2000FlowRateReq = await API2000FlowRateReq.deleteAPI2000FlowRateReq(req.params.id);
    res.json(deletedAPI2000FlowRateReq);
    };
    module.exports = {
    getAllAPI2000FlowRateReq,
    getAPI2000FlowRateReq,
    createAPI2000FlowRateReq,
    updateAPI2000FlowRateReq,
    deleteAPI2000FlowRateReq
    };
    