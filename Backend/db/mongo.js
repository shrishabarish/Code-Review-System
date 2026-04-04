const mongoose = require("mongoose");
const connectMongo = async () => {
  try {
    const conn = await mongoose.connect("mongodb://127.0.0.1:27017/code_review_logs");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};
module.exports = connectMongo;
