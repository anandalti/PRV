
    const express = require('express');
    const PhysicalPropertySubreportFieldsController = require('../controllers/PhysicalPropertySubreportFieldsController');
    const router = express.Router();
    router.get('/', PhysicalPropertySubreportFieldsController.getAllPhysicalPropertySubreportFields);
    router.get('/:id', PhysicalPropertySubreportFieldsController.getPhysicalPropertySubreportFields);
    router.post('/', PhysicalPropertySubreportFieldsController.createPhysicalPropertySubreportFields);
    router.put('/:id', PhysicalPropertySubreportFieldsController.updatePhysicalPropertySubreportFields);
    router.delete('/:id', PhysicalPropertySubreportFieldsController.deletePhysicalPropertySubreportFields);
    module.exports = router;
    