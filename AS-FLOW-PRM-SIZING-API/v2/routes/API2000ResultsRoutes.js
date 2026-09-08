
    const express = require('express');
    const API2000ResultsController = require('../controllers/API2000ResultsController');
    const router = express.Router();
    router.get('/', API2000ResultsController.getAllAPI2000Results);
    router.get('/:id', API2000ResultsController.getAPI2000Results);
    router.post('/', API2000ResultsController.createAPI2000Results);
    router.put('/:id', API2000ResultsController.updateAPI2000Results);
    router.delete('/:id', API2000ResultsController.deleteAPI2000Results);
    module.exports = router;
    