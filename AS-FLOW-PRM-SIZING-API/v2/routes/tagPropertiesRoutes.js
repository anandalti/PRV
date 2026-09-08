const express = require('express');
const {saveTagProperties, getTagPropertiesBySizingId} = require('../controllers/SaveTagPropertiesController');
const router = express.Router();
router.get('/:sizingId',getTagPropertiesBySizingId);
router.post('/', saveTagProperties);
module.exports = router;