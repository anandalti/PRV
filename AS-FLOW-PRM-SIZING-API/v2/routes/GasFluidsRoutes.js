
    const express = require('express');
    const GasFluidsController = require('../controllers/GasFluidsController');
    const router = express.Router();
    router.get('/', GasFluidsController.getAllGasFluids);
    router.get('/:id', GasFluidsController.getGasFluids);
    router.post('/', GasFluidsController.createGasFluids);
    router.put('/:id', GasFluidsController.updateGasFluids);
    router.delete('/:id', GasFluidsController.deleteGasFluids);
    module.exports = router;
    