
    const API521FlowRateReq = require('../models/API521FlowRateReq');
    const getAllAPI521FlowRateReq = async (req, res) => {
    const data = await API521FlowRateReq.getAllAPI521FlowRateReq();
    res.json(data);
    };
    const getAPI521FlowRateReq = async (req, res) => {
    const data = await API521FlowRateReq.getAPI521FlowRateReqById(req.params.id);
    res.json(data);
    };
    const createAPI521FlowRateReq = async (req, res) => {
    const data = new API521FlowRateReq(req.body);
    const newAPI521FlowRateReq = await API521FlowRateReq.createAPI521FlowRateReq(data);
    res.json(newAPI521FlowRateReq);
    };
    const updateAPI521FlowRateReq = async (req, res) => {
    const data = new API521FlowRateReq(req.body);
    const updatedAPI521FlowRateReq = await API521FlowRateReq.updateAPI521FlowRateReq(req.params.id, data);
    res.json(updatedAPI521FlowRateReq);
    };
    const deleteAPI521FlowRateReq = async (req, res) => {
    const deletedAPI521FlowRateReq = await API521FlowRateReq.deleteAPI521FlowRateReq(req.params.id);
    res.json(deletedAPI521FlowRateReq);
    };
    module.exports = {
    getAllAPI521FlowRateReq,
    getAPI521FlowRateReq,
    createAPI521FlowRateReq,
    updateAPI521FlowRateReq,
    deleteAPI521FlowRateReq
    };
    