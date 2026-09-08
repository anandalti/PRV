
    const pg_buffercache = require('../models/pg_buffercache');
    const getAllpg_buffercache = async (req, res) => {
    const data = await pg_buffercache.getAllpg_buffercache();
    res.json(data);
    };
    const getpg_buffercache = async (req, res) => {
    const data = await pg_buffercache.getpg_buffercacheById(req.params.id);
    res.json(data);
    };
    module.exports = {
    getAllpg_buffercache,
    getpg_buffercache
    };
    