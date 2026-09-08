
    const express = require('express');
    const WorkflowSelectionController = require('../controllers/WorkflowSelectionController');
    const router = express.Router();
    router.get('/', WorkflowSelectionController.getAllWorkflowSelection);
    router.get('/:id', WorkflowSelectionController.getWorkflowSelection);
    router.post('/', WorkflowSelectionController.createWorkflowSelection);
    router.put('/:id', WorkflowSelectionController.updateWorkflowSelection);
    router.delete('/:id', WorkflowSelectionController.deleteWorkflowSelection);
    module.exports = router;
    