
    const ReportTemplateMapping = require('../models/ReportTemplateMapping');
    const getAllReportTemplateMapping = async (req, res) => {
    const data = await ReportTemplateMapping.getAllReportTemplateMapping();
    res.json(data);
    };
    const getReportTemplateMapping = async (req, res) => {
    const data = await ReportTemplateMapping.getReportTemplateMappingById(req.params.id);
    res.json(data);
    };
    const createReportTemplateMapping = async (req, res) => {
    const data = new ReportTemplateMapping(req.body);
    const newReportTemplateMapping = await ReportTemplateMapping.createReportTemplateMapping(data);
    res.json(newReportTemplateMapping);
    };
    const updateReportTemplateMapping = async (req, res) => {
    const data = new ReportTemplateMapping(req.body);
    const updatedReportTemplateMapping = await ReportTemplateMapping.updateReportTemplateMapping(req.params.id, data);
    res.json(updatedReportTemplateMapping);
    };
    const deleteReportTemplateMapping = async (req, res) => {
    const deletedReportTemplateMapping = await ReportTemplateMapping.deleteReportTemplateMapping(req.params.id);
    res.json(deletedReportTemplateMapping);
    };
    module.exports = {
    getAllReportTemplateMapping,
    getReportTemplateMapping,
    createReportTemplateMapping,
    updateReportTemplateMapping,
    deleteReportTemplateMapping
    };
    