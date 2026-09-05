const express = require("express");
const router = express.Router();
const Log = require("../models/LogModel");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { module, action, userId } = req.query;

    let filter = {};
    if (module) filter.module = module;
    if (action) filter.action = action;
    if (userId) filter.userId = userId;

    if (!Log || !Log.find) {
      return res.json([]);
    }

    const logs = await Log.find(filter).sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch logs", error: err.message });
  }
});

module.exports = router;
