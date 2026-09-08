
    const DatabaseProperties = require('../models/DatabaseProperties');
    const getAllDatabaseProperties = async (req, res) => {
    const data = await DatabaseProperties.getAllDatabaseProperties();
    res.json(data);
    };
    const getDatabaseProperties = async (req, res) => {
    const data = await DatabaseProperties.getDatabasePropertiesById(req.params.id);
    res.json(data);
    };
    const createDatabaseProperties = async (req, res) => {
    const data = new DatabaseProperties(req.body);
    const newDatabaseProperties = await DatabaseProperties.createDatabaseProperties(data);
    res.json(newDatabaseProperties);
    };
    const updateDatabaseProperties = async (req, res) => {
    const data = new DatabaseProperties(req.body);
    const updatedDatabaseProperties = await DatabaseProperties.updateDatabaseProperties(req.params.id, data);
    res.json(updatedDatabaseProperties);
    };
    const deleteDatabaseProperties = async (req, res) => {
    const deletedDatabaseProperties = await DatabaseProperties.deleteDatabaseProperties(req.params.id);
    res.json(deletedDatabaseProperties);
    };
    module.exports = {
    getAllDatabaseProperties,
    getDatabaseProperties,
    createDatabaseProperties,
    updateDatabaseProperties,
    deleteDatabaseProperties
    };
    