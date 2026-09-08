
    const express = require('express');
    const PhysicalPropertySubreportsController = require('../controllers/PhysicalPropertySubreportsController');
    const router = express.Router();
    router.get('/', PhysicalPropertySubreportsController.getAllPhysicalPropertySubreports);
    router.get('/:id', PhysicalPropertySubreportsController.getPhysicalPropertySubreports);
    router.post('/', PhysicalPropertySubreportsController.createPhysicalPropertySubreports);
    router.put('/:id', PhysicalPropertySubreportsController.updatePhysicalPropertySubreports);
    router.delete('/:id', PhysicalPropertySubreportsController.deletePhysicalPropertySubreports);
    module.exports = router;
    