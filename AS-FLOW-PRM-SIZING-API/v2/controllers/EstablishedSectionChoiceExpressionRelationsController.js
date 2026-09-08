
    const EstablishedSectionChoiceExpressionRelations = require('../models/EstablishedSectionChoiceExpressionRelations');
    const getAllEstablishedSectionChoiceExpressionRelations = async (req, res) => {
    const data = await EstablishedSectionChoiceExpressionRelations.getAllEstablishedSectionChoiceExpressionRelations();
    res.json(data);
    };
    const getEstablishedSectionChoiceExpressionRelations = async (req, res) => {
    const data = await EstablishedSectionChoiceExpressionRelations.getEstablishedSectionChoiceExpressionRelationsById(req.params.id);
    res.json(data);
    };
    const createEstablishedSectionChoiceExpressionRelations = async (req, res) => {
    const data = new EstablishedSectionChoiceExpressionRelations(req.body);
    const newEstablishedSectionChoiceExpressionRelations = await EstablishedSectionChoiceExpressionRelations.createEstablishedSectionChoiceExpressionRelations(data);
    res.json(newEstablishedSectionChoiceExpressionRelations);
    };
    const updateEstablishedSectionChoiceExpressionRelations = async (req, res) => {
    const data = new EstablishedSectionChoiceExpressionRelations(req.body);
    const updatedEstablishedSectionChoiceExpressionRelations = await EstablishedSectionChoiceExpressionRelations.updateEstablishedSectionChoiceExpressionRelations(req.params.id, data);
    res.json(updatedEstablishedSectionChoiceExpressionRelations);
    };
    const deleteEstablishedSectionChoiceExpressionRelations = async (req, res) => {
    const deletedEstablishedSectionChoiceExpressionRelations = await EstablishedSectionChoiceExpressionRelations.deleteEstablishedSectionChoiceExpressionRelations(req.params.id);
    res.json(deletedEstablishedSectionChoiceExpressionRelations);
    };
    module.exports = {
    getAllEstablishedSectionChoiceExpressionRelations,
    getEstablishedSectionChoiceExpressionRelations,
    createEstablishedSectionChoiceExpressionRelations,
    updateEstablishedSectionChoiceExpressionRelations,
    deleteEstablishedSectionChoiceExpressionRelations
    };
    