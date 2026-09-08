
    const express = require('express');
    const MappingSAPModelSpecialRequirementsController = require('../controllers/MappingSAPModelSpecialRequirementsController');
    const router = express.Router();
    router.get('/', MappingSAPModelSpecialRequirementsController.getAllMappingSAPModelSpecialRequirements);
    router.get('/:id', MappingSAPModelSpecialRequirementsController.getMappingSAPModelSpecialRequirements);
    router.post('/', MappingSAPModelSpecialRequirementsController.createMappingSAPModelSpecialRequirements);
    router.put('/:id', MappingSAPModelSpecialRequirementsController.updateMappingSAPModelSpecialRequirements);
    router.delete('/:id', MappingSAPModelSpecialRequirementsController.deleteMappingSAPModelSpecialRequirements);
    module.exports = router;
    