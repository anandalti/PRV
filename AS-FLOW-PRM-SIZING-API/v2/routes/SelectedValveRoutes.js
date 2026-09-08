
    const express = require('express');
    const SelectedValveController = require('../controllers/SelectedValveController');
    const router = express.Router();
    router.get('/', SelectedValveController.getAllSelectedValve);
    router.get('/:id', SelectedValveController.getSelectedValve);
    router.post('/', SelectedValveController.createSelectedValve);
    router.put('/:id', SelectedValveController.updateSelectedValve);
    router.delete('/:id', SelectedValveController.deleteSelectedValve);
    module.exports = router;
    