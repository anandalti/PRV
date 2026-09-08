
    const express = require('express');
    const FluidDetailsController = require('../controllers/FluidDetailsController');
    const router = express.Router();
    router.get('/', FluidDetailsController.getAllFluidDetails);
    router.get('/:id', FluidDetailsController.getFluidDetails);
    router.post('/', FluidDetailsController.createFluidDetails);
    router.put('/:id', FluidDetailsController.updateFluidDetails);
    router.delete('/:id', FluidDetailsController.deleteFluidDetails);
    module.exports = router;
    