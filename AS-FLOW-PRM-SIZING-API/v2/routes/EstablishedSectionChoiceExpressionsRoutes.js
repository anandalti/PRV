
    const express = require('express');
    const EstablishedSectionChoiceExpressionsController = require('../controllers/EstablishedSectionChoiceExpressionsController');
    const router = express.Router();
    router.get('/', EstablishedSectionChoiceExpressionsController.getAllEstablishedSectionChoiceExpressions);
    router.get('/:id', EstablishedSectionChoiceExpressionsController.getEstablishedSectionChoiceExpressions);
    router.post('/', EstablishedSectionChoiceExpressionsController.createEstablishedSectionChoiceExpressions);
    router.put('/:id', EstablishedSectionChoiceExpressionsController.updateEstablishedSectionChoiceExpressions);
    router.delete('/:id', EstablishedSectionChoiceExpressionsController.deleteEstablishedSectionChoiceExpressions);
    module.exports = router;
    