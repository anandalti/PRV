const express = require('express');
const RestrictedLiftController = require('../controllers/RestrictedLiftController');
const router = express.Router();

router.post('/rl-procs', RestrictedLiftController.saveRestrictedLiftUsingSP);
router.post('/save-data', RestrictedLiftController.saveRestrictedLift);
router.get('/get-data', RestrictedLiftController.getRestrictedLift);

module.exports = router;