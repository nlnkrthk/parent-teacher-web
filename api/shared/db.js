const sql = require('mssql');

let poolPromise;

function getConfig() {
  const {
    SQL_SERVER,
    SQL_DATABASE,
    SQL_USER,
    SQL_PASSWORD
  } = process.env;

  if (!SQL_SERVER || !SQL_DATABASE || !SQL_USER || !SQL_PASSWORD) {
    throw new Error('SQL config missing. Ensure SQL_SERVER, SQL_DATABASE, SQL_USER, SQL_PASSWORD are set.');
  }

  return {
    server: SQL_SERVER,
    database: SQL_DATABASE,
    user: SQL_USER,
    password: SQL_PASSWORD,
    options: {
      encrypt: true
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  };
}

async function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(getConfig());
  }
  return poolPromise;
}

module.exports = { sql, getPool };

