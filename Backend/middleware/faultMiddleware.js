const faultController = require("../utils/faultController");
const structuredLogger = require("../utils/structuredLogger");

function faultMiddleware(req, res, next) {
  const errorConfig = faultController.getApiError(req.baseUrl + req.path) || faultController.getApiError(req.baseUrl);

  if (errorConfig) {
    structuredLogger.error({
      event: "FAULT_INJECTED_API_ERROR",
      module: "FAULT_INJECTION",
      action: `${req.method} ${req.originalUrl}`,
      requestId: req.id,
      correlationId: req.correlationId,
      errorType: "SimulatedApiFault",
      errorMessage: errorConfig.message,
      isFaultInjected: true,
      details: { statusCode: errorConfig.statusCode },
    });

    return res.status(errorConfig.statusCode).json({
      error: "InternalServerError",
      message: errorConfig.message,
      is_fault_injected: true,
      requestId: req.id,
    });
  }

  next();
}

module.exports = faultMiddleware;
