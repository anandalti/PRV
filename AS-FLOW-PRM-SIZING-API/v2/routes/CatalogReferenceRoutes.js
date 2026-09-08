
    const express = require('express');
    const CatalogReferenceController = require('../controllers/CatalogReferenceController');
    const router = express.Router();
    router.get('/', CatalogReferenceController.getAllCatalogReference);
    router.get('/:id', CatalogReferenceController.getCatalogReference);
    router.post('/', CatalogReferenceController.createCatalogReference);
    router.put('/:id', CatalogReferenceController.updateCatalogReference);
    router.delete('/:id', CatalogReferenceController.deleteCatalogReference);
    module.exports = router;
    