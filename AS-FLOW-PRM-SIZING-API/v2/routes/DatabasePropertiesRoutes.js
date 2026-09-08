
    const express = require('express');
    const DatabasePropertiesController = require('../controllers/DatabasePropertiesController');
    const router = express.Router();
    router.get('/', DatabasePropertiesController.getAllDatabaseProperties);
    router.get('/:id', DatabasePropertiesController.getDatabaseProperties);
    router.post('/', DatabasePropertiesController.createDatabaseProperties);
    router.put('/:id', DatabasePropertiesController.updateDatabaseProperties);
    router.delete('/:id', DatabasePropertiesController.deleteDatabaseProperties);
    module.exports = router;
    