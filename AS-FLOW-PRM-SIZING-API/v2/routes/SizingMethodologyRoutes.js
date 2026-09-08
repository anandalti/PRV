
    const express = require('express');
    const SizingMethodologyController = require('../controllers/SizingMethodologyController');
    const router = express.Router();
    router.get('/', SizingMethodologyController.getAllSizingMethodology);
    router.get('/:id', SizingMethodologyController.getSizingMethodology);
    router.post('/', SizingMethodologyController.createSizingMethodology);
    router.put('/:id', SizingMethodologyController.updateSizingMethodology);
    router.delete('/:id', SizingMethodologyController.deleteSizingMethodology);
    module.exports = router;
    