const { getPostgresPool } = require("./postgres");
const { getConnection: getOracleConnection } = require("./oracle");
const faultController = require("../utils/faultController");
const structuredLogger = require("../utils/structuredLogger");

const DIALECT = (process.env.DB_DIALECT || "postgres").toLowerCase();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const db = {
  dialect: DIALECT,

  async query(text, params = [], req = null) {
    const startTime = Date.now();

    if (faultController.isDbDisconnected()) {
      const err = new Error("Simulated Database Connection Failure: Connection refused (RCA Fault Injection)");
      err.code = "ECONNREFUSED";
      err.isFaultInjected = true;

      structuredLogger.error({
        event: "DATABASE_CONNECTION_ERROR",
        module: "DATABASE",
        requestId: req?.id || "N/A",
        correlationId: req?.correlationId || "N/A",
        errorType: "DatabaseConnectionError",
        errorMessage: err.message,
        isFaultInjected: true,
        details: { query: text.substring(0, 100) },
      });

      throw err;
    }

    const latency = faultController.getDbLatency();
    if (latency > 0) {
      await sleep(latency);
    }

    try {
      if (DIALECT === "postgres") {
        const pool = getPostgresPool();
        const res = await pool.query(text, params);
        const duration = Date.now() - startTime;

        if (latency > 0) {
          structuredLogger.warn({
            event: "DATABASE_HIGH_LATENCY",
            module: "DATABASE",
            requestId: req?.id || "N/A",
            latencyMs: duration,
            isFaultInjected: true,
            details: { injectedDelayMs: latency },
          });
        }

        return {
          rows: res.rows,
          rowCount: res.rowCount,
        };
      } else {
        const connection = await getOracleConnection();
        try {
          const res = await connection.execute(text, params, { autoCommit: true });
          return {
            rows: res.rows || [],
            rowCount: res.rowsAffected || 0,
            outBinds: res.outBinds,
          };
        } finally {
          await connection.close();
        }
      }
    } catch (err) {
      const duration = Date.now() - startTime;
      structuredLogger.error({
        event: "DATABASE_QUERY_ERROR",
        module: "DATABASE",
        requestId: req?.id || "N/A",
        correlationId: req?.correlationId || "N/A",
        latencyMs: duration,
        errorType: err.name || "DatabaseError",
        errorMessage: err.message,
        isFaultInjected: Boolean(err.isFaultInjected),
        details: { query: text.substring(0, 100) },
      });
      throw err;
    }
  },

  async getClient() {
    if (faultController.isDbDisconnected()) {
      const err = new Error("Simulated Database Connection Failure (RCA Fault Injection)");
      err.code = "ECONNREFUSED";
      err.isFaultInjected = true;
      throw err;
    }

    if (DIALECT === "postgres") {
      const pool = getPostgresPool();
      return await pool.connect();
    } else {
      return await getOracleConnection();
    }
  },

  async testConnection() {
    if (faultController.isDbDisconnected()) {
      return { ok: false, error: "Simulated Database Connection Outage" };
    }
    try {
      if (DIALECT === "postgres") {
        const pool = getPostgresPool();
        const res = await pool.query("SELECT 1 AS alive");
        return { ok: true, dialect: "postgres", result: res.rows[0] };
      } else {
        const conn = await getOracleConnection();
        await conn.execute("SELECT 1 FROM dual");
        await conn.close();
        return { ok: true, dialect: "oracle" };
      }
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },
};

module.exports = db;
