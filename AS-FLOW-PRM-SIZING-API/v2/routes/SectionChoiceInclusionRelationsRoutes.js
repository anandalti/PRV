
    const express = require('express');
    const SectionChoiceInclusionRelationsController = require('../controllers/SectionChoiceInclusionRelationsController');
    const router = express.Router();
    router.get('/', SectionChoiceInclusionRelationsController.getAllSectionChoiceInclusionRelations);
    router.get('/:id', SectionChoiceInclusionRelationsController.getSectionChoiceInclusionRelations);
    router.post('/', SectionChoiceInclusionRelationsController.createSectionChoiceInclusionRelations);
    router.put('/:id', SectionChoiceInclusionRelationsController.updateSectionChoiceInclusionRelations);
    router.delete('/:id', SectionChoiceInclusionRelationsController.deleteSectionChoiceInclusionRelations);
    module.exports = router;
    