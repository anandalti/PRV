
    const UserPreferences = require('../models/UserPreferences');
    const UserReportHeader = require('../models/UserReportHeader');
    const getAllUserPreferences = async (req, res) => {
    const data = await UserPreferences.getAllUserPreferences();
    res.json(data);
    };
    const getUserPreferences = async (req, res) => {
    const data = await UserPreferences.getUserPreferencesById(req.params.id);
    res.json(data);
    };
    const createUserPreferences = async (req, res) => {
    const data = new UserPreferences(req.body);
    const newUserPreferences = await UserPreferences.createUserPreferences(data);
    res.json(newUserPreferences);
    };
    const updateUserPreferences = async (req, res) => {
    const preferenceData = new UserPreferences(req.body);
    const { Id, UserId, ...preferenceUpdateData } = preferenceData;
    const reportsHeaderData = new UserReportHeader(req.body);
    const { Id: reportsId, UserId: reposrtsUserId, ...reportsHeaderUpdateData } = reportsHeaderData;

    const updatedUserPreferences = await UserPreferences.updateUserPreferences(req.params.id, preferenceUpdateData);
    const updatedReportsHeader = await UserReportHeader.updateUserReportHeader(req.params.id, reportsHeaderUpdateData);
    
    res.json({...updatedUserPreferences, ...updatedReportsHeader});
    };
    const deleteUserPreferences = async (req, res) => {
    const deletedUserPreferences = await UserPreferences.deleteUserPreferences(req.params.id);
    res.json(deletedUserPreferences);
    };
    module.exports = {
    getAllUserPreferences,
    getUserPreferences,
    createUserPreferences,
    updateUserPreferences,
    deleteUserPreferences
    };
    