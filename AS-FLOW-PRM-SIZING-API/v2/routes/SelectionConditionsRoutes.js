
    const express = require('express');
    const SelectionConditionsController = require('../controllers/SelectionConditionsController');
    const router = express.Router();
    router.get('/', SelectionConditionsController.getAllSelectionConditions);
    router.get('/:id', SelectionConditionsController.getSelectionConditions);
    router.post('/', SelectionConditionsController.createSelectionConditions);
    router.put('/:id', SelectionConditionsController.updateSelectionConditions);
    router.delete('/:id', SelectionConditionsController.deleteSelectionConditions);
    module.exports = router;
    