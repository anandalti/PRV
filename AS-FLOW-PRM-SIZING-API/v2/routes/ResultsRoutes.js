const express = require('express');
const ResultsController = require('../controllers/ResultsController');
const router = express.Router();

router.post('', ResultsController.getResults);
router.post('/calculations', ResultsController.getResultsCalculations);
router.post('/multivalve/selection', ResultsController.getMultiValveSection);
router.post('/multivalve/selection/addRow', ResultsController.getMultiValveSelectionDetails);
router.post('/multivalve/selection/removeRow', ResultsController.deleteRowFromMultiValves);
router.post('/multivalve/selection/validateRow', ResultsController.validateMultiValveSelection);
router.post('/filters', ResultsController.getResultsFilter);

module.exports = router;