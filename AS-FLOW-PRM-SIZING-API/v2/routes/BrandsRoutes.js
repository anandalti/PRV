
    const express = require('express');
    const BrandsController = require('../controllers/BrandsController');
    const router = express.Router();
    router.get('/', BrandsController.getAllBrands);
    router.get('/:id', BrandsController.getBrands);
    router.post('/', BrandsController.createBrands);
    router.put('/:id', BrandsController.updateBrands);
    router.delete('/:id', BrandsController.deleteBrands);
    module.exports = router;
    