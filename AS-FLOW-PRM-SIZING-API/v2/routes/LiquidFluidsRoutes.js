
    const express = require('express');
    const LiquidFluidsController = require('../controllers/LiquidFluidsController');
    const router = express.Router();
    router.get('/', LiquidFluidsController.getAllLiquidFluids);
    router.get('/:id', LiquidFluidsController.getLiquidFluids);
    router.post('/', LiquidFluidsController.createLiquidFluids);
    router.put('/:id', LiquidFluidsController.updateLiquidFluids);
    router.delete('/:id', LiquidFluidsController.deleteLiquidFluids);
    module.exports = router;
    