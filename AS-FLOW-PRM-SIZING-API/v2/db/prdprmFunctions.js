const { sql, pool, poolConnect } = require('./prdprmmssql');

async function executeQuery(query, params = []) {
    await poolConnect; // ensures pool is connected
    try {
      const request = pool.request();
      // Add parameters if any
      params.forEach(p => request.input(p.name, p.type, p.value));
      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      throw err;
    }
  }

  module.exports = {
    executeQuery,
  };

  