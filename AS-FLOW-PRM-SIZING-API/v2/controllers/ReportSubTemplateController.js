
    const ReportSubTemplate = require('../models/ReportSubTemplate');
    const getAllReportSubTemplate = async (req, res) => {
    const data = await ReportSubTemplate.getAllReportSubTemplate();
    res.json(data);
    };
    const getReportSubTemplate = async (req, res) => {
    const data = await ReportSubTemplate.getReportSubTemplateById(req.params.id);
    res.json(data);
    };
    const createReportSubTemplate = async (req, res) => {
    const data = new ReportSubTemplate(req.body);
    const newReportSubTemplate = await ReportSubTemplate.createReportSubTemplate(data);
    res.json(newReportSubTemplate);
    };
    const updateReportSubTemplate = async (req, res) => {
    const data = new ReportSubTemplate(req.body);
    const updatedReportSubTemplate = await ReportSubTemplate.updateReportSubTemplate(req.params.id, data);
    res.json(updatedReportSubTemplate);
    };
    const deleteReportSubTemplate = async (req, res) => {
    const deletedReportSubTemplate = await ReportSubTemplate.deleteReportSubTemplate(req.params.id);
    res.json(deletedReportSubTemplate);
    };
    module.exports = {
    getAllReportSubTemplate,
    getReportSubTemplate,
    createReportSubTemplate,
    updateReportSubTemplate,
    deleteReportSubTemplate
    };
    