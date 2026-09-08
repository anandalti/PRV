
    const EstablishedSectionChoiceExpressions = require('../models/EstablishedSectionChoiceExpressions');
    const getAllEstablishedSectionChoiceExpressions = async (req, res) => {
    const data = await EstablishedSectionChoiceExpressions.getAllEstablishedSectionChoiceExpressions();
    res.json(data);
    };
    const getEstablishedSectionChoiceExpressions = async (req, res) => {
    const data = await EstablishedSectionChoiceExpressions.getEstablishedSectionChoiceExpressionsById(req.params.id);
    res.json(data);
    };
    const createEstablishedSectionChoiceExpressions = async (req, res) => {
    const data = new EstablishedSectionChoiceExpressions(req.body);
    const newEstablishedSectionChoiceExpressions = await EstablishedSectionChoiceExpressions.createEstablishedSectionChoiceExpressions(data);
    res.json(newEstablishedSectionChoiceExpressions);
    };
    const updateEstablishedSectionChoiceExpressions = async (req, res) => {
    const data = new EstablishedSectionChoiceExpressions(req.body);
    const updatedEstablishedSectionChoiceExpressions = await EstablishedSectionChoiceExpressions.updateEstablishedSectionChoiceExpressions(req.params.id, data);
    res.json(updatedEstablishedSectionChoiceExpressions);
    };
    const deleteEstablishedSectionChoiceExpressions = async (req, res) => {
    const deletedEstablishedSectionChoiceExpressions = await EstablishedSectionChoiceExpressions.deleteEstablishedSectionChoiceExpressions(req.params.id);
    res.json(deletedEstablishedSectionChoiceExpressions);
    };
    module.exports = {
    getAllEstablishedSectionChoiceExpressions,
    getEstablishedSectionChoiceExpressions,
    createEstablishedSectionChoiceExpressions,
    updateEstablishedSectionChoiceExpressions,
    deleteEstablishedSectionChoiceExpressions
    };
    