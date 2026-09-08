
    const express = require('express');
    const SectionChoiceComboLimitsController = require('../controllers/SectionChoiceComboLimitsController');
    const router = express.Router();
    router.get('/', SectionChoiceComboLimitsController.getAllSectionChoiceComboLimits);
    router.get('/:id', SectionChoiceComboLimitsController.getSectionChoiceComboLimits);
    router.post('/', SectionChoiceComboLimitsController.createSectionChoiceComboLimits);
    router.put('/:id', SectionChoiceComboLimitsController.updateSectionChoiceComboLimits);
    router.delete('/:id', SectionChoiceComboLimitsController.deleteSectionChoiceComboLimits);
    module.exports = router;
    