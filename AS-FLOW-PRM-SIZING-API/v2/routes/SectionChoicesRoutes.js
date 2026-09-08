
    const express = require('express');
    const SectionChoicesController = require('../controllers/SectionChoicesController');
    const router = express.Router();
    router.get('/', SectionChoicesController.getAllSectionChoices);
    router.get('/:id', SectionChoicesController.getSectionChoices);
    router.post('/', SectionChoicesController.createSectionChoices);
    router.put('/:id', SectionChoicesController.updateSectionChoices);
    router.delete('/:id', SectionChoicesController.deleteSectionChoices);
    module.exports = router;
    