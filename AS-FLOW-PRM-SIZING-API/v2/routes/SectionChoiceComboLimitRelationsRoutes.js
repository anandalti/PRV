
    const express = require('express');
    const SectionChoiceComboLimitRelationsController = require('../controllers/SectionChoiceComboLimitRelationsController');
    const router = express.Router();
    router.get('/', SectionChoiceComboLimitRelationsController.getAllSectionChoiceComboLimitRelations);
    router.get('/:id', SectionChoiceComboLimitRelationsController.getSectionChoiceComboLimitRelations);
    router.post('/', SectionChoiceComboLimitRelationsController.createSectionChoiceComboLimitRelations);
    router.put('/:id', SectionChoiceComboLimitRelationsController.updateSectionChoiceComboLimitRelations);
    router.delete('/:id', SectionChoiceComboLimitRelationsController.deleteSectionChoiceComboLimitRelations);
    module.exports = router;
    