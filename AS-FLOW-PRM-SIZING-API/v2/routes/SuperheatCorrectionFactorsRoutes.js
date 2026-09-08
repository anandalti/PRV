
    const express = require('express');
    const SuperheatCorrectionFactorsController = require('../controllers/SuperheatCorrectionFactorsController');
    const router = express.Router();
    router.get('/', SuperheatCorrectionFactorsController.getAllSuperheatCorrectionFactors);
    router.get('/:id', SuperheatCorrectionFactorsController.getSuperheatCorrectionFactors);
    router.post('/', SuperheatCorrectionFactorsController.createSuperheatCorrectionFactors);
    router.put('/:id', SuperheatCorrectionFactorsController.updateSuperheatCorrectionFactors);
    router.delete('/:id', SuperheatCorrectionFactorsController.deleteSuperheatCorrectionFactors);
    module.exports = router;
    