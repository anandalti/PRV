
    const API2000TankDataAPI521Fire = require('../models/API2000TankDataAPI521Fire');
    const getAllAPI2000TankDataAPI521Fire = async (req, res) => {
    const data = await API2000TankDataAPI521Fire.getAllAPI2000TankDataAPI521Fire();
    res.json(data);
    };
    const getAPI2000TankDataAPI521Fire = async (req, res) => {
    const data = await API2000TankDataAPI521Fire.getAPI2000TankDataAPI521FireById(req.params.id);
    res.json(data);
    };
    const createAPI2000TankDataAPI521Fire = async (req, res) => {
    const data = new API2000TankDataAPI521Fire(req.body);
    const newAPI2000TankDataAPI521Fire = await API2000TankDataAPI521Fire.createAPI2000TankDataAPI521Fire(data);
    res.json(newAPI2000TankDataAPI521Fire);
    };
    const updateAPI2000TankDataAPI521Fire = async (req, res) => {
    const data = new API2000TankDataAPI521Fire(req.body);
    const updatedAPI2000TankDataAPI521Fire = await API2000TankDataAPI521Fire.updateAPI2000TankDataAPI521Fire(req.params.id, data);
    res.json(updatedAPI2000TankDataAPI521Fire);
    };
    const deleteAPI2000TankDataAPI521Fire = async (req, res) => {
    const deletedAPI2000TankDataAPI521Fire = await API2000TankDataAPI521Fire.deleteAPI2000TankDataAPI521Fire(req.params.id);
    res.json(deletedAPI2000TankDataAPI521Fire);
    };
    module.exports = {
    getAllAPI2000TankDataAPI521Fire,
    getAPI2000TankDataAPI521Fire,
    createAPI2000TankDataAPI521Fire,
    updateAPI2000TankDataAPI521Fire,
    deleteAPI2000TankDataAPI521Fire
    };
    