
    const express = require('express');
    const SystemDetailsController = require('../controllers/SystemDetailsController');
    const router = express.Router();
    router.get('/', SystemDetailsController.getAllSystemDetails);
    router.get('/:id', SystemDetailsController.getSystemDetails);
    router.post('/', SystemDetailsController.createSystemDetails);
    router.put('/:id', SystemDetailsController.updateSystemDetails);
    router.delete('/:id', SystemDetailsController.deleteSystemDetails);
    module.exports = router;
    