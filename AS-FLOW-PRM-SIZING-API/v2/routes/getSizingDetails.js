const express = require('express');
const SizingController = require('../controllers/SizingController');

const router = express.Router();

router.get('/MySizing', SizingController.getMySizing);
router.get('/SizingId', SizingController.getSizingId);

router.get('/SizingDetailsBySizingId', SizingController.getSizingDetailsBySizingId);
router.get('/SizingDetailsOnReports', SizingController.getSizingDetailsOnReports);
module.exports = router;