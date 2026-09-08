
    const express = require('express');
    const SectionChoiceExclusionRelationsController = require('../controllers/SectionChoiceExclusionRelationsController');
    const router = express.Router();
    router.get('/', SectionChoiceExclusionRelationsController.getAllSectionChoiceExclusionRelations);
    router.get('/:id', SectionChoiceExclusionRelationsController.getSectionChoiceExclusionRelations);
    router.post('/', SectionChoiceExclusionRelationsController.createSectionChoiceExclusionRelations);
    router.put('/:id', SectionChoiceExclusionRelationsController.updateSectionChoiceExclusionRelations);
    router.delete('/:id', SectionChoiceExclusionRelationsController.deleteSectionChoiceExclusionRelations);
    module.exports = router;
    