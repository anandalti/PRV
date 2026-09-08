
    const express = require('express');
    const EstablishedSectionChoiceExpressionRelationsController = require('../controllers/EstablishedSectionChoiceExpressionRelationsController');
    const router = express.Router();
    router.get('/', EstablishedSectionChoiceExpressionRelationsController.getAllEstablishedSectionChoiceExpressionRelations);
    router.get('/:id', EstablishedSectionChoiceExpressionRelationsController.getEstablishedSectionChoiceExpressionRelations);
    router.post('/', EstablishedSectionChoiceExpressionRelationsController.createEstablishedSectionChoiceExpressionRelations);
    router.put('/:id', EstablishedSectionChoiceExpressionRelationsController.updateEstablishedSectionChoiceExpressionRelations);
    router.delete('/:id', EstablishedSectionChoiceExpressionRelationsController.deleteEstablishedSectionChoiceExpressionRelations);
    module.exports = router;
    