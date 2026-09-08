
    const ReportTemplate = require('../models/ReportTemplate');
    const getAllReportTemplate = async (req, res) => {
    const data = await ReportTemplate.getAllReportTemplate();
    res.json(data);
    };
    const getReportTemplate = async (req, res) => {
    const data = await ReportTemplate.getReportTemplateById(req.params.id);
    res.json(data);
    };
    const createReportTemplate = async (req, res) => {
    const data = new ReportTemplate(req.body);
    const newReportTemplate = await ReportTemplate.createReportTemplate(data);
    res.json(newReportTemplate);
    };
    const updateReportTemplate = async (req, res) => {
    const data = new ReportTemplate(req.body);
    const updatedReportTemplate = await ReportTemplate.updateReportTemplate(req.params.id, data);
    res.json(updatedReportTemplate);
    };
    const deleteReportTemplate = async (req, res) => {
    const deletedReportTemplate = await ReportTemplate.deleteReportTemplate(req.params.id);
    res.json(deletedReportTemplate);
    };
    module.exports = {
    getAllReportTemplate,
    getReportTemplate,
    createReportTemplate,
    updateReportTemplate,
    deleteReportTemplate
    };
    