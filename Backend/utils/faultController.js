class FaultController {
  constructor() {
    this.enabled = process.env.FAULT_INJECTION_ENABLED === "true";
    this.state = {
      dbDisconnect: false,
      dbLatencyMs: 0,
      apiErrors: {},
      dependencyTimeoutMs: 0,
      serviceUnhealthy: false,
    };
  }

  getStatus() {
    return {
      injectionEnabled: this.enabled,
      activeFaults: this.state,
      timestamp: new Date().toISOString(),
    };
  }

  inject(type, payload = {}) {
    switch (type) {
      case "db_disconnect":
        this.state.dbDisconnect = Boolean(payload.enabled !== false);
        break;
      case "db_latency":
        this.state.dbLatencyMs = Number(payload.delayMs) || 0;
        break;
      case "api_error":
        if (payload.endpoint) {
          if (payload.enabled === false) {
            delete this.state.apiErrors[payload.endpoint];
          } else {
            this.state.apiErrors[payload.endpoint] = {
              statusCode: Number(payload.statusCode) || 500,
              message: payload.message || "Simulated API Internal Server Error (Fault Injected)",
            };
          }
        }
        break;
      case "dependency_timeout":
        this.state.dependencyTimeoutMs = Number(payload.delayMs) || 0;
        break;
      case "service_unhealthy":
        this.state.serviceUnhealthy = Boolean(payload.enabled !== false);
        break;
      default:
        throw new Error(`Unknown fault type: ${type}`);
    }
    return this.getStatus();
  }

  reset() {
    this.state = {
      dbDisconnect: false,
      dbLatencyMs: 0,
      apiErrors: {},
      dependencyTimeoutMs: 0,
      serviceUnhealthy: false,
    };
    return this.getStatus();
  }

  isDbDisconnected() {
    return this.enabled && this.state.dbDisconnect;
  }

  getDbLatency() {
    return this.enabled ? this.state.dbLatencyMs : 0;
  }

  getApiError(endpoint) {
    if (!this.enabled) return null;
    return this.state.apiErrors[endpoint] || null;
  }

  getDependencyTimeout() {
    return this.enabled ? this.state.dependencyTimeoutMs : 0;
  }

  isServiceUnhealthy() {
    return this.enabled && this.state.serviceUnhealthy;
  }
}

const instance = new FaultController();
module.exports = instance;
