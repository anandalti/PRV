const express = require('express');
const ConfigurationController = require('../controllers/ConfigurationController');

const router = express.Router();


router.get('/modelConfig', ConfigurationController.getModelConfigurationDetails);

module.exports = router;