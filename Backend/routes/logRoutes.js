const express = require("express");
const router = express.Router();
const Log = require("../models/LogModel");
router.get("/", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ message: "Access denied" });
    }
    const { module, action, userId } = req.query;
    let filter = {};
    if (module) filter.module = module;
    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    const logs = await Log.find(filter)
      .sort({ timestamp: -1 })
      .limit(100);
    if (userId) {
      const failedLogins = await Log.countDocuments({
        userId,
        action: "LOGIN_FAILED",
        timestamp: { $gte: new Date(Date.now() - 10 * 60 * 1000) }
      });
      if (failedLogins > 5) {
        console.log(`🚨 Suspicious activity detected for user: ${userId}`);
      }
    }
    res.json(logs);
  } catch (err) {
    console.error("LOG FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

module.exports = router;
