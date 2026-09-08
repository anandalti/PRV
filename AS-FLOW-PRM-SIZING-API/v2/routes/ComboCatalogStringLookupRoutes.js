
    const express = require('express');
    const ComboCatalogStringLookupController = require('../controllers/ComboCatalogStringLookupController');
    const router = express.Router();
    router.get('/', ComboCatalogStringLookupController.getAllComboCatalogStringLookup);
    router.get('/:id', ComboCatalogStringLookupController.getComboCatalogStringLookup);
    router.post('/', ComboCatalogStringLookupController.createComboCatalogStringLookup);
    router.put('/:id', ComboCatalogStringLookupController.updateComboCatalogStringLookup);
    router.delete('/:id', ComboCatalogStringLookupController.deleteComboCatalogStringLookup);
    module.exports = router;
    