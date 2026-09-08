
    const ReportSubTemplateHTML = require('../models/ReportSubTemplateHTML');
    const getAllReportSubTemplateHTML = async (req, res) => {
    const data = await ReportSubTemplateHTML.getAllReportSubTemplateHTML();
    res.json(data);
    };
    const getReportSubTemplateHTML = async (req, res) => {
    const data = await ReportSubTemplateHTML.getReportSubTemplateHTMLById(req.params.id);
    res.json(data);
    };
    const createReportSubTemplateHTML = async (req, res) => {
    const data = new ReportSubTemplateHTML(req.body);
    const newReportSubTemplateHTML = await ReportSubTemplateHTML.createReportSubTemplateHTML(data);
    res.json(newReportSubTemplateHTML);
    };
    const updateReportSubTemplateHTML = async (req, res) => {
    const data = new ReportSubTemplateHTML(req.body);
    const updatedReportSubTemplateHTML = await ReportSubTemplateHTML.updateReportSubTemplateHTML(req.params.id, data);
    res.json(updatedReportSubTemplateHTML);
    };
    const deleteReportSubTemplateHTML = async (req, res) => {
    const deletedReportSubTemplateHTML = await ReportSubTemplateHTML.deleteReportSubTemplateHTML(req.params.id);
    res.json(deletedReportSubTemplateHTML);
    };
    module.exports = {
    getAllReportSubTemplateHTML,
    getReportSubTemplateHTML,
    createReportSubTemplateHTML,
    updateReportSubTemplateHTML,
    deleteReportSubTemplateHTML
    };
    