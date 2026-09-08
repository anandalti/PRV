
    const ReportValidationCheck = require('../models/ReportValidationCheck');
    const getAllReportValidationCheck = async (req, res) => {
    const data = await ReportValidationCheck.getAllReportValidationCheck();
    res.json(data);
    };
    const getReportValidationCheck = async (req, res) => {
    const data = await ReportValidationCheck.getReportValidationCheckById(req.params.id);
    res.json(data);
    };
    const createReportValidationCheck = async (req, res) => {
    const data = new ReportValidationCheck(req.body);
    const newReportValidationCheck = await ReportValidationCheck.createReportValidationCheck(data);
    res.json(newReportValidationCheck);
    };
    const updateReportValidationCheck = async (req, res) => {
    const data = new ReportValidationCheck(req.body);
    const updatedReportValidationCheck = await ReportValidationCheck.updateReportValidationCheck(req.params.id, data);
    res.json(updatedReportValidationCheck);
    };
    const deleteReportValidationCheck = async (req, res) => {
    const deletedReportValidationCheck = await ReportValidationCheck.deleteReportValidationCheck(req.params.id);
    res.json(deletedReportValidationCheck);
    };
    module.exports = {
    getAllReportValidationCheck,
    getReportValidationCheck,
    createReportValidationCheck,
    updateReportValidationCheck,
    deleteReportValidationCheck
    };
    