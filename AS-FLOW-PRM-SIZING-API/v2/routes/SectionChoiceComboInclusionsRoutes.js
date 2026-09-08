
    const express = require('express');
    const SectionChoiceComboInclusionsController = require('../controllers/SectionChoiceComboInclusionsController');
    const router = express.Router();
    router.get('/', SectionChoiceComboInclusionsController.getAllSectionChoiceComboInclusions);
    router.get('/:id', SectionChoiceComboInclusionsController.getSectionChoiceComboInclusions);
    router.post('/', SectionChoiceComboInclusionsController.createSectionChoiceComboInclusions);
    router.put('/:id', SectionChoiceComboInclusionsController.updateSectionChoiceComboInclusions);
    router.delete('/:id', SectionChoiceComboInclusionsController.deleteSectionChoiceComboInclusions);
    module.exports = router;
    