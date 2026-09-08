
    const express = require('express');
    const UOMController = require('../controllers/UOMController');
    const router = express.Router();
    router.get('/uomDetails', UOMController.getAllUOMDetails);
    router.get('/', UOMController.getAllUOM);
    router.get('/:id', UOMController.getUOM);
    router.post('/', UOMController.createUOM);
    router.put('/:id', UOMController.updateUOM);
    router.delete('/:id', UOMController.deleteUOM);
    router.post('/conversion', UOMController.convertSameUomValues);
    router.post('/displayunit/conversion', UOMController.displayUnitConversion);
    
    module.exports = router;
    