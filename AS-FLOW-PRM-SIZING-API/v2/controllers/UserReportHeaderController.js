
    const UserReportHeader = require('../models/UserReportHeader');
    const getAllUserReportHeader = async (req, res) => {
    const data = await UserReportHeader.getAllUserReportHeader();
    res.json(data);
    };
    const getUserReportHeader = async (req, res) => {
    const data = await UserReportHeader.getUserReportHeaderById(req.params.id);
    res.json(data);
    };
    const createUserReportHeader = async (req, res) => {
    const data = new UserReportHeader(req.body);
    const newUserReportHeader = await UserReportHeader.createUserReportHeader(data);
    res.json(newUserReportHeader);
    };
    const updateUserReportHeader = async (req, res) => {
    const data = new UserReportHeader(req.body);
    const updatedUserReportHeader = await UserReportHeader.updateUserReportHeader(req.params.id, data);
    res.json(updatedUserReportHeader);
    };
    const deleteUserReportHeader = async (req, res) => {
    const deletedUserReportHeader = await UserReportHeader.deleteUserReportHeader(req.params.id);
    res.json(deletedUserReportHeader);
    };
    module.exports = {
    getAllUserReportHeader,
    getUserReportHeader,
    createUserReportHeader,
    updateUserReportHeader,
    deleteUserReportHeader
    };
    