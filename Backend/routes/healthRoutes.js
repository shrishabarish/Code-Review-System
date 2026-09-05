const express = require("express");
const router = express.Router();
const db = require("../db");
const faultController = require("../utils/faultController");

router.get("/", async (req, res) => {
  const dbHealth = await db.testConnection();
  const isUnhealthy = faultController.isServiceUnhealthy();

  const isDegraded = !dbHealth.ok || isUnhealthy;

  const payload = {
    status: isDegraded ? "DEGRADED" : "HEALTHY",
    service: "code-review-backend",
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      dialect: db.dialect,
      connected: dbHealth.ok,
      error: dbHealth.error || null,
    },
    active_faults: faultController.getStatus().activeFaults,
  };

  if (isDegraded) {
    return res.status(503).json(payload);
  }

  return res.status(200).json(payload);
});

module.exports = router;
