const structuredLogger = require("./structuredLogger");

const logEvent = async ({ userId, action, module, details = {}, req = null }) => {
  return await structuredLogger.info({
    userId,
    action,
    module,
    event: action,
    requestId: req?.id || "N/A",
    correlationId: req?.correlationId || "N/A",
    details,
  });
};

module.exports = logEvent;
