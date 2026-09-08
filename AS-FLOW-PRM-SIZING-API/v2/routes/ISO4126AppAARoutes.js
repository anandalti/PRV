
    const express = require('express');
    const ISO4126AppAAController = require('../controllers/ISO4126AppAAController');
    const router = express.Router();
    router.get('/', ISO4126AppAAController.getAllISO4126AppAA);
    router.get('/:id', ISO4126AppAAController.getISO4126AppAA);
    router.post('/', ISO4126AppAAController.createISO4126AppAA);
    router.put('/:id', ISO4126AppAAController.updateISO4126AppAA);
    router.delete('/:id', ISO4126AppAAController.deleteISO4126AppAA);
    module.exports = router;
    