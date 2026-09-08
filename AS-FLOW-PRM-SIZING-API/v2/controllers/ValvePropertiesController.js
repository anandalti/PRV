
    const ValveProperties = require('../models/ValveProperties');
    const getAllValveProperties = async (req, res) => {
    const data = await ValveProperties.getAllValveProperties();
    res.json(data);
    };
    const getValveProperties = async (req, res) => {
    const data = await ValveProperties.getValvePropertiesById(req.params.id);
    res.json(data);
    };
    const createValveProperties = async (req, res) => {
    const data = new ValveProperties(req.body);
    const newValveProperties = await ValveProperties.createValveProperties(data);
    res.json(newValveProperties);
    };
    const updateValveProperties = async (req, res) => {
    const data = new ValveProperties(req.body);
    const updatedValveProperties = await ValveProperties.updateValveProperties(req.params.id, data);
    res.json(updatedValveProperties);
    };
    const deleteValveProperties = async (req, res) => {
    const deletedValveProperties = await ValveProperties.deleteValveProperties(req.params.id);
    res.json(deletedValveProperties);
    };
    module.exports = {
    getAllValveProperties,
    getValveProperties,
    createValveProperties,
    updateValveProperties,
    deleteValveProperties
    };
    