
    const express = require('express');
    const SpecialRequirementsController = require('../controllers/SpecialRequirementsController');
    const router = express.Router();
    router.get('/', SpecialRequirementsController.getAllSpecialRequirements);
    router.get('/:id', SpecialRequirementsController.getSpecialRequirements);
    router.post('/', SpecialRequirementsController.createSpecialRequirements);
    router.put('/:id', SpecialRequirementsController.updateSpecialRequirements);
    router.delete('/:id', SpecialRequirementsController.deleteSpecialRequirements);
    module.exports = router;
    