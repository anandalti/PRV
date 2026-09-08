const express = require('express');
const router = express.Router();
const ConfigitBomSolveController = require('../../controllers/import-tool/ConfigitBomSolveController');

router.post('/', ConfigitBomSolveController.bomSolve);

module.exports = router;