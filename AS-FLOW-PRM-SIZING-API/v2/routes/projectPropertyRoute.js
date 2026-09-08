const express = require('express');
const {saveProjectProperties} = require('../controllers/saveProjectPropertiesController');
const router = express.Router();
router.post('/', saveProjectProperties);
module.exports = router;