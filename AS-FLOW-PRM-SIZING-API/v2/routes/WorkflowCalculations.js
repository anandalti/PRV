const express = require('express');
const WorkflowCalcController = require('../controllers/WorkflowCalcController');
const router = express.Router();

router.get('/saturatedsteam', WorkflowCalcController.getSaturatedSteamValue);

module.exports = router;