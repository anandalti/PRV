
    const ComboCatalogStringLookup = require('../models/ComboCatalogStringLookup');
    const getAllComboCatalogStringLookup = async (req, res) => {
    const data = await ComboCatalogStringLookup.getAllComboCatalogStringLookup();
    res.json(data);
    };
    const getComboCatalogStringLookup = async (req, res) => {
    const data = await ComboCatalogStringLookup.getComboCatalogStringLookupById(req.params.id);
    res.json(data);
    };
    const createComboCatalogStringLookup = async (req, res) => {
    const data = new ComboCatalogStringLookup(req.body);
    const newComboCatalogStringLookup = await ComboCatalogStringLookup.createComboCatalogStringLookup(data);
    res.json(newComboCatalogStringLookup);
    };
    const updateComboCatalogStringLookup = async (req, res) => {
    const data = new ComboCatalogStringLookup(req.body);
    const updatedComboCatalogStringLookup = await ComboCatalogStringLookup.updateComboCatalogStringLookup(req.params.id, data);
    res.json(updatedComboCatalogStringLookup);
    };
    const deleteComboCatalogStringLookup = async (req, res) => {
    const deletedComboCatalogStringLookup = await ComboCatalogStringLookup.deleteComboCatalogStringLookup(req.params.id);
    res.json(deletedComboCatalogStringLookup);
    };
    module.exports = {
    getAllComboCatalogStringLookup,
    getComboCatalogStringLookup,
    createComboCatalogStringLookup,
    updateComboCatalogStringLookup,
    deleteComboCatalogStringLookup
    };
    