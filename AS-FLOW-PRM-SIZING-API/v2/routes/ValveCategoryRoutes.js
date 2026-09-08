
    const express = require('express');
    const ValveCategoryController = require('../controllers/ValveCategoryController');
    const router = express.Router();
    router.get('/', ValveCategoryController.getAllValveCategory);
    router.get('/:id', ValveCategoryController.getValveCategory);
    router.post('/', ValveCategoryController.createValveCategory);
    router.put('/:id', ValveCategoryController.updateValveCategory);
    router.delete('/:id', ValveCategoryController.deleteValveCategory);
    module.exports = router;
    