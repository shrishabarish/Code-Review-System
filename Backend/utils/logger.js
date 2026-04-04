const Log = require("../models/LogModel");

const logEvent = async ({ userId, action, module, details = {} }) => {
  try {
    await Log.create({
      userId,
      action,
      module,
      details
    });
  } catch (error) {
    console.error("Log error:", error.message);
  }
};

module.exports = logEvent;