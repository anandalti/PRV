
    const express = require('express');
    const MaterialGroupsController = require('../controllers/MaterialGroupsController');
    const router = express.Router();
    router.get('/', MaterialGroupsController.getAllMaterialGroups);
    router.get('/:id', MaterialGroupsController.getMaterialGroups);
    router.post('/', MaterialGroupsController.createMaterialGroups);
    router.put('/:id', MaterialGroupsController.updateMaterialGroups);
    router.delete('/:id', MaterialGroupsController.deleteMaterialGroups);
    module.exports = router;
    