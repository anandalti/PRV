
    const express = require('express');
    const ExceptionsandInclusionsController = require('../controllers/ExceptionsandInclusionsController');
    const router = express.Router();
    router.get('/', ExceptionsandInclusionsController.getAllExceptionsandInclusions);
    router.get('/:id', ExceptionsandInclusionsController.getExceptionsandInclusions);
    router.post('/', ExceptionsandInclusionsController.createExceptionsandInclusions);
    router.put('/:id', ExceptionsandInclusionsController.updateExceptionsandInclusions);
    router.delete('/:id', ExceptionsandInclusionsController.deleteExceptionsandInclusions);
    module.exports = router;
    