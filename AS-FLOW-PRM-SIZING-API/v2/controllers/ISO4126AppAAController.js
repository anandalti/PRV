
    const ISO4126AppAA = require('../models/ISO4126AppAA');
    const getAllISO4126AppAA = async (req, res) => {
    const data = await ISO4126AppAA.getAllISO4126AppAA();
    res.json(data);
    };
    const getISO4126AppAA = async (req, res) => {
    const data = await ISO4126AppAA.getISO4126AppAAById(req.params.id);
    res.json(data);
    };
    const createISO4126AppAA = async (req, res) => {
    const data = new ISO4126AppAA(req.body);
    const newISO4126AppAA = await ISO4126AppAA.createISO4126AppAA(data);
    res.json(newISO4126AppAA);
    };
    const updateISO4126AppAA = async (req, res) => {
    const data = new ISO4126AppAA(req.body);
    const updatedISO4126AppAA = await ISO4126AppAA.updateISO4126AppAA(req.params.id, data);
    res.json(updatedISO4126AppAA);
    };
    const deleteISO4126AppAA = async (req, res) => {
    const deletedISO4126AppAA = await ISO4126AppAA.deleteISO4126AppAA(req.params.id);
    res.json(deletedISO4126AppAA);
    };
    module.exports = {
    getAllISO4126AppAA,
    getISO4126AppAA,
    createISO4126AppAA,
    updateISO4126AppAA,
    deleteISO4126AppAA
    };
    