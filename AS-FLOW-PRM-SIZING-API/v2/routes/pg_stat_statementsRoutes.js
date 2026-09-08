
    const express = require('express');
    const pg_stat_statementsController = require('../controllers/pg_stat_statementsController');
    const router = express.Router();
    router.get('/', pg_stat_statementsController.getAllpg_stat_statements);
    router.get('/:id', pg_stat_statementsController.getpg_stat_statements);
    module.exports = router;
    