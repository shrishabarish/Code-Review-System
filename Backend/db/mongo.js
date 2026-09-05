const mongoose = require("mongoose");
const structuredLogger = require("../utils/structuredLogger");

const connectMongo = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/code_review_logs";
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Mongo] Connected: ${conn.connection.host}`);
    structuredLogger.info({
      event: "MONGO_CONNECTED",
      module: "DATABASE",
      details: { host: conn.connection.host },
    });
  } catch (error) {
    console.warn(`[Mongo] Connection unavailable (${error.message}). Continuing in relational-only mode.`);
    structuredLogger.warn({
      event: "MONGO_CONNECTION_FAILED",
      module: "DATABASE",
      errorMessage: error.message,
    });
  }
};

module.exports = connectMongo;
