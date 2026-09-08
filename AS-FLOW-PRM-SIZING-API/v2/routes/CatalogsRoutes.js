
    const express = require('express');
    const CatalogsController = require('../controllers/CatalogsController');
    const router = express.Router();
    router.get('/', CatalogsController.getAllCatalogs);
    router.get('/:id', CatalogsController.getCatalogs);
    router.post('/', CatalogsController.createCatalogs);
    router.put('/:id', CatalogsController.updateCatalogs);
    router.delete('/:id', CatalogsController.deleteCatalogs);
    module.exports = router;
    