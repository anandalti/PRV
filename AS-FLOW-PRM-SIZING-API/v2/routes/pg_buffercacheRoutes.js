
    const express = require('express');
    const pg_buffercacheController = require('../controllers/pg_buffercacheController');
    const router = express.Router();
    router.get('/', pg_buffercacheController.getAllpg_buffercache);
    router.get('/:id', pg_buffercacheController.getpg_buffercache);
    module.exports = router;
    