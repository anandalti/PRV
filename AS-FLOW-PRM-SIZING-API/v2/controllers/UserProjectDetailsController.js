
    const UserProjectDetails = require('../models/UserProjectDetails');
    const getAllUserProjectDetails = async (req, res) => {
    const data = await UserProjectDetails.getAllUserProjectDetails();
    res.json(data);
    };
    const getUserProjectDetails = async (req, res) => {
    const data = await UserProjectDetails.getUserProjectDetailsById(req.params.id);
    res.json(data);
    };
    const createUserProjectDetails = async (req, res) => {
    const data = new UserProjectDetails(req.body);
    const newUserProjectDetails = await UserProjectDetails.createUserProjectDetails(data);
    res.json(newUserProjectDetails);
    };
    const updateUserProjectDetails = async (req, res) => {
    const data = new UserProjectDetails(req.body);
    const updatedUserProjectDetails = await UserProjectDetails.updateUserProjectDetails(req.params.id, data);
    res.json(updatedUserProjectDetails);
    };
    const deleteUserProjectDetails = async (req, res) => {
    const deletedUserProjectDetails = await UserProjectDetails.deleteUserProjectDetails(req.params.id);
    res.json(deletedUserProjectDetails);
    };
    module.exports = {
    getAllUserProjectDetails,
    getUserProjectDetails,
    createUserProjectDetails,
    updateUserProjectDetails,
    deleteUserProjectDetails
    };
    