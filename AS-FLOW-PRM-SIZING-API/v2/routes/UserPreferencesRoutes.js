
    const express = require('express');
    const UserPreferencesController = require('../controllers/UserPreferencesController');
    const router = express.Router();
    router.get('/', UserPreferencesController.getAllUserPreferences);
    router.get('/:id', UserPreferencesController.getUserPreferences);
    router.post('/', UserPreferencesController.createUserPreferences);
    router.put('/:id', UserPreferencesController.updateUserPreferences);
    router.delete('/:id', UserPreferencesController.deleteUserPreferences);
    module.exports = router;
    