
    const GetReportHTMLData = require('../models/GetReportHTMLData');
    const getAllGetReportHTMLData = async (req, res) => {
    const data = await GetReportHTMLData.getAllGetReportHTMLData();
    res.json(data);
    };
    const getGetReportHTMLData = async (req, res) => {
    const data = await GetReportHTMLData.getGetReportHTMLDataById(req.params.id);
    res.json(data);
    };
    module.exports = {
    getAllGetReportHTMLData,
    getGetReportHTMLData
    };
    