require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectMongo = require("./db/mongo");
const correlationMiddleware = require("./middleware/correlationMiddleware");
const faultMiddleware = require("./middleware/faultMiddleware");

const authRoutes = require("./routes/auth");
const submissionRoutes = require("./routes/submissions");
const reviewRoutes = require("./routes/reviews");
const logRoutes = require("./routes/logRoutes");
const faultRoutes = require("./routes/faultRoutes");
const healthRoutes = require("./routes/healthRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

connectMongo();

app.use(cors());
app.use(express.json());
app.use(correlationMiddleware);
app.use(faultMiddleware);

app.use("/health", healthRoutes);
app.use("/api/health", healthRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Code Review System Cloud Backend is Running",
    environment: process.env.APP_ENV || "local",
    health_url: "/health",
    api_docs: "/api/submissions, /api/reviews, /api/auth, /api/fault",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/fault", faultRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled Application Exception:", err);
  res.status(500).json({
    error: "InternalServerError",
    message: err.message || "An unexpected error occurred",
    requestId: req.id,
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Code Review Backend running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.APP_ENV || 'local'}`);
  console.log(`📊 DB Dialect:  ${process.env.DB_DIALECT || 'postgres'}`);
  console.log(`💉 Fault Injection: ${process.env.FAULT_INJECTION_ENABLED === 'true' ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🩺 Health Probes: http://localhost:${PORT}/health`);
  console.log(`=======================================================`);
});
