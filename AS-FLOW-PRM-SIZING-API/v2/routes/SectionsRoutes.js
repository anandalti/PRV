
    const express = require('express');
    const SectionsController = require('../controllers/SectionsController');
    const router = express.Router();
    router.get('/', SectionsController.getAllSections);
    router.get('/:id', SectionsController.getSections);
    router.post('/', SectionsController.createSections);
    router.put('/:id', SectionsController.updateSections);
    router.delete('/:id', SectionsController.deleteSections);
    module.exports = router;
    