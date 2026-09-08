
    const ReportType = require('../models/ReportType');
    const getAllReportType = async (req, res) => {
    const data = await ReportType.getAllReportType();
    res.json(data);
    };
    const getReportType = async (req, res) => {
    const data = await ReportType.getReportTypeById(req.params.id);
    res.json(data);
    };
    const createReportType = async (req, res) => {
    const data = new ReportType(req.body);
    const newReportType = await ReportType.createReportType(data);
    res.json(newReportType);
    };
    const updateReportType = async (req, res) => {
    const data = new ReportType(req.body);
    const updatedReportType = await ReportType.updateReportType(req.params.id, data);
    res.json(updatedReportType);
    };
    const deleteReportType = async (req, res) => {
    const deletedReportType = await ReportType.deleteReportType(req.params.id);
    res.json(deletedReportType);
    };
    module.exports = {
    getAllReportType,
    getReportType,
    createReportType,
    updateReportType,
    deleteReportType
    };
    