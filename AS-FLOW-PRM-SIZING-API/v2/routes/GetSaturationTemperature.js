const express = require('express');
const CalcSaturatedTempController = require('../controllers/CalcSaturatedTempController');

const router = express.Router();

router.get('',CalcSaturatedTempController.getSaturatedTemperature);
module.exports = router;