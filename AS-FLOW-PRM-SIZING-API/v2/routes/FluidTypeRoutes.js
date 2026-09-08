
    const express = require('express');
    const FluidTypeController = require('../controllers/FluidTypeController');
    const router = express.Router();
    router.get('/', FluidTypeController.getAllFluidType);
    router.get('/fluidDetails', FluidTypeController.getFluidDetails);
    router.get('/:id', FluidTypeController.getFluidType);
    router.post('/', FluidTypeController.createFluidType);
    router.put('/:id', FluidTypeController.updateFluidType);
    router.delete('/:id', FluidTypeController.deleteFluidType);
    
    module.exports = router;
    