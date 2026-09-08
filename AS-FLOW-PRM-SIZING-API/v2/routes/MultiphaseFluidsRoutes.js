
    const express = require('express');
    const MultiphaseFluidsController = require('../controllers/MultiphaseFluidsController');
    const router = express.Router();
    router.get('/', MultiphaseFluidsController.getAllMultiphaseFluids);
    router.get('/:id', MultiphaseFluidsController.getMultiphaseFluids);
    router.post('/', MultiphaseFluidsController.createMultiphaseFluids);
    router.put('/:id', MultiphaseFluidsController.updateMultiphaseFluids);
    router.delete('/:id', MultiphaseFluidsController.deleteMultiphaseFluids);
    module.exports = router;
    