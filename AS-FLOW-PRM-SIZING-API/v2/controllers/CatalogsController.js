
    const Catalogs = require('../models/Catalogs');
    const getAllCatalogs = async (req, res) => {
    const data = await Catalogs.getAllCatalogs();
    res.json(data);
    };
    const getCatalogs = async (req, res) => {
    const data = await Catalogs.getCatalogsById(req.params.id);
    res.json(data);
    };
    const createCatalogs = async (req, res) => {
    const data = new Catalogs(req.body);
    const newCatalogs = await Catalogs.createCatalogs(data);
    res.json(newCatalogs);
    };
    const updateCatalogs = async (req, res) => {
    const data = new Catalogs(req.body);
    const updatedCatalogs = await Catalogs.updateCatalogs(req.params.id, data);
    res.json(updatedCatalogs);
    };
    const deleteCatalogs = async (req, res) => {
    const deletedCatalogs = await Catalogs.deleteCatalogs(req.params.id);
    res.json(deletedCatalogs);
    };
    module.exports = {
    getAllCatalogs,
    getCatalogs,
    createCatalogs,
    updateCatalogs,
    deleteCatalogs
    };
    