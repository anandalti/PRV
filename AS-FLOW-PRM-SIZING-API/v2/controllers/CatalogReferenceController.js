
    const CatalogReference = require('../models/CatalogReference');
    const getAllCatalogReference = async (req, res) => {
    const data = await CatalogReference.getAllCatalogReference();
    res.json(data);
    };
    const getCatalogReference = async (req, res) => {
    const data = await CatalogReference.getCatalogReferenceById(req.params.id);
    res.json(data);
    };
    const createCatalogReference = async (req, res) => {
    const data = new CatalogReference(req.body);
    const newCatalogReference = await CatalogReference.createCatalogReference(data);
    res.json(newCatalogReference);
    };
    const updateCatalogReference = async (req, res) => {
    const data = new CatalogReference(req.body);
    const updatedCatalogReference = await CatalogReference.updateCatalogReference(req.params.id, data);
    res.json(updatedCatalogReference);
    };
    const deleteCatalogReference = async (req, res) => {
    const deletedCatalogReference = await CatalogReference.deleteCatalogReference(req.params.id);
    res.json(deletedCatalogReference);
    };
    module.exports = {
    getAllCatalogReference,
    getCatalogReference,
    createCatalogReference,
    updateCatalogReference,
    deleteCatalogReference
    };
    