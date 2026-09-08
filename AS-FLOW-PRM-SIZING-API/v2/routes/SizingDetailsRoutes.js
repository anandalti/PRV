
    const express = require('express');
    const SizingDetailsController = require('../controllers/SizingDetailsController');
    const router = express.Router();
    router.get('/', SizingDetailsController.getAllSizingDetails);
    router.get('/:id', SizingDetailsController.getSizingDetails);
    router.post('/', SizingDetailsController.createSizingDetails);
    router.put('/:id', SizingDetailsController.updateSizingDetails);
    router.delete('/:id', SizingDetailsController.deleteSizingDetails);
    module.exports = router;
    