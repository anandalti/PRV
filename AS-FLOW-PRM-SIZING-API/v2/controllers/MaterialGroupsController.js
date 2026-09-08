
    const MaterialGroups = require('../models/MaterialGroups');
    const getAllMaterialGroups = async (req, res) => {
    const data = await MaterialGroups.getAllMaterialGroups();
    res.json(data);
    };
    const getMaterialGroups = async (req, res) => {
    const data = await MaterialGroups.getMaterialGroupsById(req.params.id);
    res.json(data);
    };
    const createMaterialGroups = async (req, res) => {
    const data = new MaterialGroups(req.body);
    const newMaterialGroups = await MaterialGroups.createMaterialGroups(data);
    res.json(newMaterialGroups);
    };
    const updateMaterialGroups = async (req, res) => {
    const data = new MaterialGroups(req.body);
    const updatedMaterialGroups = await MaterialGroups.updateMaterialGroups(req.params.id, data);
    res.json(updatedMaterialGroups);
    };
    const deleteMaterialGroups = async (req, res) => {
    const deletedMaterialGroups = await MaterialGroups.deleteMaterialGroups(req.params.id);
    res.json(deletedMaterialGroups);
    };
    module.exports = {
    getAllMaterialGroups,
    getMaterialGroups,
    createMaterialGroups,
    updateMaterialGroups,
    deleteMaterialGroups
    };
    