let oracledb;
try {
  oracledb = require("oracledb");
} catch (e) {}

async function getConnection() {
  if (!oracledb) {
    throw new Error("oracledb module is not installed or available.");
  }
  return await oracledb.getConnection({
    user: process.env.ORACLE_USER || process.env.DB_USER,
    password: process.env.ORACLE_PASSWORD || process.env.DB_PASSWORD,
    connectString: process.env.ORACLE_CONNECT_STRING || process.env.DB_CONNECT_STRING,
  });
}

module.exports = { getConnection };
