
    const ReportTemplateConditions = require('../models/ReportTemplateConditions');
    const getAllReportTemplateConditions = async (req, res) => {
    const data = await ReportTemplateConditions.getAllReportTemplateConditions();
    res.json(data);
    };
    const getReportTemplateConditions = async (req, res) => {
    const data = await ReportTemplateConditions.getReportTemplateConditionsById(req.params.id);
    res.json(data);
    };
    const createReportTemplateConditions = async (req, res) => {
    const data = new ReportTemplateConditions(req.body);
    const newReportTemplateConditions = await ReportTemplateConditions.createReportTemplateConditions(data);
    res.json(newReportTemplateConditions);
    };
    const updateReportTemplateConditions = async (req, res) => {
    const data = new ReportTemplateConditions(req.body);
    const updatedReportTemplateConditions = await ReportTemplateConditions.updateReportTemplateConditions(req.params.id, data);
    res.json(updatedReportTemplateConditions);
    };
    const deleteReportTemplateConditions = async (req, res) => {
    const deletedReportTemplateConditions = await ReportTemplateConditions.deleteReportTemplateConditions(req.params.id);
    res.json(deletedReportTemplateConditions);
    };
    module.exports = {
    getAllReportTemplateConditions,
    getReportTemplateConditions,
    createReportTemplateConditions,
    updateReportTemplateConditions,
    deleteReportTemplateConditions
    };
    