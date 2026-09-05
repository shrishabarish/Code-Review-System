const Log = require("../models/LogModel");

const structuredLogger = {
  log: async ({
    level = "INFO",
    event,
    module = "APP",
    action = "",
    userId = "ANONYMOUS",
    requestId = "N/A",
    correlationId = "N/A",
    latencyMs = null,
    errorType = null,
    errorMessage = null,
    isFaultInjected = false,
    details = {},
  }) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      service: "code-review-backend",
      environment: process.env.APP_ENV || "local",
      level,
      event,
      module,
      action,
      user_id: userId,
      request_id: requestId,
      correlation_id: correlationId,
      latency_ms: latencyMs,
      error_type: errorType,
      error_message: errorMessage,
      is_fault_injected: isFaultInjected,
      details,
    };

    if (level === "ERROR" || level === "CRITICAL") {
      console.error(JSON.stringify(logEntry));
    } else if (level === "WARN") {
      console.warn(JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }

    try {
      if (Log && Log.create) {
        await Log.create({
          userId: String(userId),
          action: action || event,
          module,
          details: { ...details, requestId, correlationId, errorType, errorMessage, isFaultInjected },
        });
      }
    } catch (err) {}

    return logEntry;
  },

  info: (params) => structuredLogger.log({ ...params, level: "INFO" }),
  warn: (params) => structuredLogger.log({ ...params, level: "WARN" }),
  error: (params) => structuredLogger.log({ ...params, level: "ERROR" }),
};

module.exports = structuredLogger;
