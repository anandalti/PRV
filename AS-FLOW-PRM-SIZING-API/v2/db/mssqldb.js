
const { sql, pool, poolConnect } = require('./mssqlpool');

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

async function executeProcedure(procName, params = []) {
  await poolConnect;
  try {
    const request = pool.request();
    params.forEach(p => request.input(p.name, p.type, p.value));
    const result = await request.execute(procName);
    return result.recordset;
  } catch (err) {
    throw err;
  }
}

async function executeProcedureXML(procName, name,value) {
  await poolConnect;
  try {
    const request = pool.request();
    request.input(name, sql.Xml, value);
    // console.log(request)
    const result = await request.execute(procName);
    // console.log(result)
    return result.recordset;
  } catch (err) {
    throw err;
  }
}

// Function to call SP_GetPRV2SIZE_ADS_Backlog with ADS_Request_Id
async function executeGetProcedureXML(procName, name,value) {
  await poolConnect;
  try {
    const request = pool.request();
    request.input(name, sql.NVarChar, value);
    const result = await request.execute(procName);
    // console.log(result)
    return result.recordset;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  sql,
  pool,
  executeQuery,
  executeProcedure,
  executeProcedureXML,
  executeGetProcedureXML
};


