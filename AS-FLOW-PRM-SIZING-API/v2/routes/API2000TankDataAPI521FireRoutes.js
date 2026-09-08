
    const express = require('express');
    const API2000TankDataAPI521FireController = require('../controllers/API2000TankDataAPI521FireController');
    const router = express.Router();
    router.get('/', API2000TankDataAPI521FireController.getAllAPI2000TankDataAPI521Fire);
    router.get('/:id', API2000TankDataAPI521FireController.getAPI2000TankDataAPI521Fire);
    router.post('/', API2000TankDataAPI521FireController.createAPI2000TankDataAPI521Fire);
    router.put('/:id', API2000TankDataAPI521FireController.updateAPI2000TankDataAPI521Fire);
    router.delete('/:id', API2000TankDataAPI521FireController.deleteAPI2000TankDataAPI521Fire);
    module.exports = router;
    