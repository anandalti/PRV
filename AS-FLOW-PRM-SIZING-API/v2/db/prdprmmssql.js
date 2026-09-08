require('dotenv').config();
const sql = require('mssql');

// Read env variables
const mssqlUser = process.env.PRM_DB_USER;
const mssqlPass = process.env.PRM_DB_PASS;
const mssqlServer = process.env.PRM_DB_SERVER;
const mssqlDatabase = process.env.PRM_DB_DATABASE;
const mssqlPort = process.env.MSSQL_PORT
  ? parseInt(process.env.MSSQL_PORT, 10)
  : 1433;

const mssqlEncrypt = true;

const mssqlTrust =
  (process.env.MSSQL_TRUST_SERVER_CERT || 'true') === 'true';

if (!mssqlUser || !mssqlPass || !mssqlServer || !mssqlDatabase) {
  console.warn(
    '⚠️ Warning: MSSQL config incomplete. ' +
    'Check MSSQL_USER, MSSQL_PASS, MSSQL_SERVER, MSSQL_DB'
  );
}

// MSSQL config
const config = {
  user: mssqlUser,
  password: mssqlPass,
  server: mssqlServer,
  database: mssqlDatabase,
  port: mssqlPort,

  // Timeouts
  connectionTimeout: 30000,
  requestTimeout: 300000,

  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },

  options: {
    encrypt: mssqlEncrypt,
    trustServerCertificate: mssqlTrust,
    enableArithAbort: true
  }
};

// Create pool
const pool = new sql.ConnectionPool(config);

// Pool error handler
pool.on('error', err => {
  console.error(
    'MSSQL pool emitted error:',
    err?.message,
    err?.code
  );
});

// Connect pool
const poolConnect = pool
  .connect()
  .then(p => {
    // console.log('✅ MSSQL DB Connected');
    // console.log(`✅ Database: ${mssqlDatabase}`);
    return p;
  })
  .catch(err => {
    console.error(
      '❌ MSSQL pool connection error:',
      err?.message
    );

    if (err?.code) {
      console.error('Error code:', err.code);
    }

    console.error(err?.stack);
    return null;
  });

// Self-test when run directly
if (require.main === module) {
  poolConnect
    .then(() => {
      console.log('🎯 MSSQL connection test successful');
      process.exit(0);
    })
    .catch(() => process.exit(1));
}

module.exports = {
  sql,
  pool,
  poolConnect
};