require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { getConnection } = require("./db/oracle");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());  // Only once — no duplicates

// Test Route
app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

// DB Test Route
app.get("/test-db", async (req, res) => {
  try {
    const connection = await getConnection();

    const result = await connection.execute(
      `SELECT 'Oracle Connected Successfully' AS MESSAGE FROM dual`
    );

    await connection.close();

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auth Routes
app.use("/api/auth", authRoutes);

const submissionRoutes = require("./routes/submissions");
app.use("/api/submissions", submissionRoutes);

const reviewRoutes = require("./routes/reviews");
app.use("/api/reviews", reviewRoutes);


// Start Server (ALWAYS LAST)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});