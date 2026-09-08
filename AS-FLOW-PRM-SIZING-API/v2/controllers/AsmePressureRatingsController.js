
    const AsmePressureRatings = require('../models/AsmePressureRatings');
    const getAllAsmePressureRatings = async (req, res) => {
    const data = await AsmePressureRatings.getAllAsmePressureRatings();
    res.json(data);
    };
    const getAsmePressureRatings = async (req, res) => {
    const data = await AsmePressureRatings.getAsmePressureRatingsById(req.params.id);
    res.json(data);
    };
    const createAsmePressureRatings = async (req, res) => {
    const data = new AsmePressureRatings(req.body);
    const newAsmePressureRatings = await AsmePressureRatings.createAsmePressureRatings(data);
    res.json(newAsmePressureRatings);
    };
    const updateAsmePressureRatings = async (req, res) => {
    const data = new AsmePressureRatings(req.body);
    const updatedAsmePressureRatings = await AsmePressureRatings.updateAsmePressureRatings(req.params.id, data);
    res.json(updatedAsmePressureRatings);
    };
    const deleteAsmePressureRatings = async (req, res) => {
    const deletedAsmePressureRatings = await AsmePressureRatings.deleteAsmePressureRatings(req.params.id);
    res.json(deletedAsmePressureRatings);
    };
    module.exports = {
    getAllAsmePressureRatings,
    getAsmePressureRatings,
    createAsmePressureRatings,
    updateAsmePressureRatings,
    deleteAsmePressureRatings
    };
    