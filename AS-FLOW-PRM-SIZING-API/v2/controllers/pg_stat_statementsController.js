
    const pg_stat_statements = require('../models/pg_stat_statements');
    const getAllpg_stat_statements = async (req, res) => {
    const data = await pg_stat_statements.getAllpg_stat_statements();
    res.json(data);
    };
    const getpg_stat_statements = async (req, res) => {
    const data = await pg_stat_statements.getpg_stat_statementsById(req.params.id);
    res.json(data);
    };
    module.exports = {
    getAllpg_stat_statements,
    getpg_stat_statements
    };
    