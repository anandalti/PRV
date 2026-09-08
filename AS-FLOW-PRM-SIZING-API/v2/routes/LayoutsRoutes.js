const express = require('express');
const LayoutController = require('../controllers/LayoutController');
const router = express.Router();

router.get('/workflow', LayoutController.getWorkflowLayout);
router.get('/popup', LayoutController.getWorkflowPopupLayout);
router.get('/restrictedLiftPopup', LayoutController.getRestrictedLiftPopupLayout);
router.get('/preferences', LayoutController.getPreferencesLayout);

router.get('/workflow/create', LayoutController.createWorkflowLayout);
router.delete('/workflow/delete', LayoutController.deleteWorkflowLayout);
router.get('/workflow/file/update', LayoutController.updateWorkflowLayout);
router.get('/popup/create', LayoutController.createPopupLayout);
router.get('/datafiles/create', LayoutController.createRequiredDataFile);

module.exports = router;