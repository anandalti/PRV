
    const User = require('../models/User');
    const getAllUser = async (req, res) => {
    const data = await User.getAllUser();
    res.json(data);
    };
    const getUser = async (req, res) => {
    const data = await User.getUserById(req.params.id);
    res.json(data);
    };
    const createUser = async (req, res) => {
    const data = new User(req.body);
    const newUser = await User.createUser(data);
    res.json(newUser);
    };
    const updateUser = async (req, res) => {
    const data = new User(req.body);
    const updatedUser = await User.updateUser(req.params.id, data);
    res.json(updatedUser);
    };
    const deleteUser = async (req, res) => {
    const deletedUser = await User.deleteUser(req.params.id);
    res.json(deletedUser);
    };
    module.exports = {
    getAllUser,
    getUser,
    createUser,
    updateUser,
    deleteUser
    };
    