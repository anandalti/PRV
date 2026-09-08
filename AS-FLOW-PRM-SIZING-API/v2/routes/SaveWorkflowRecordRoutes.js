const express = require('express');
const SaveWorkflowRecordController = require('../controllers/SaveWorkflowRecordController');
const router = express.Router();

router.post('/callprocs', SaveWorkflowRecordController.saveWorkflowRecordUsingSP);

module.exports = router;