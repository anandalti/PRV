
    const express = require('express');
    const SectionChoiceComboRestrictionsController = require('../controllers/SectionChoiceComboRestrictionsController');
    const router = express.Router();
    router.get('/', SectionChoiceComboRestrictionsController.getAllSectionChoiceComboRestrictions);
    router.get('/:id', SectionChoiceComboRestrictionsController.getSectionChoiceComboRestrictions);
    router.post('/', SectionChoiceComboRestrictionsController.createSectionChoiceComboRestrictions);
    router.put('/:id', SectionChoiceComboRestrictionsController.updateSectionChoiceComboRestrictions);
    router.delete('/:id', SectionChoiceComboRestrictionsController.deleteSectionChoiceComboRestrictions);
    module.exports = router;
    