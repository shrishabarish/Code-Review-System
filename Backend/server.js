require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const { getConnection } = require("./db/oracle");

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