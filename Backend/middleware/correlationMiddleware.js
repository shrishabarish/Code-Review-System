const { v4: uuidv4 } = require("uuid");
const structuredLogger = require("../utils/structuredLogger");

function correlationMiddleware(req, res, next) {
  const requestId = req.headers["x-request-id"] || `req-${uuidv4()}`;
  const correlationId = req.headers["x-correlation-id"] || requestId;

  req.id = requestId;
  req.correlationId = correlationId;
  req._startTime = Date.now();

  res.setHeader("X-Request-ID", requestId);
  res.setHeader("X-Correlation-ID", correlationId);

  res.on("finish", () => {
    const duration = Date.now() - req._startTime;
    const isError = res.statusCode >= 400;

    structuredLogger.log({
      level: res.statusCode >= 500 ? "ERROR" : isError ? "WARN" : "INFO",
      event: "HTTP_REQUEST_COMPLETED",
      module: "HTTP",
      action: `${req.method} ${req.originalUrl}`,
      userId: req.user?.tokenId || req.user?.userId || "ANONYMOUS",
      requestId: req.id,
      correlationId: req.correlationId,
      latencyMs: duration,
      errorType: isError ? `HTTP_${res.statusCode}` : null,
      errorMessage: isError ? res.statusMessage : null,
      details: {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        ip: req.ip,
      },
    });
  });

  next();
}

module.exports = correlationMiddleware;
