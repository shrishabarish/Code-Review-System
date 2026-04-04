const db = require("../db/oracle");
const oracledb = require("oracledb");
const logEvent = require("../utils/logger");

// ================= CREATE SUBMISSION =================
const createSubmission = async (req, res) => {
  let connection;
  try {
    const { title, description, language, code } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const tokenId = req.user.tokenId;
    connection = await db.getConnection();

    const result = await connection.execute(
      `INSERT INTO CODE_SUBMISSIONS (token_id, title, description, language, code)
       VALUES (:token_id, :title, :description, :language, :code)
       RETURNING submission_id INTO :submission_id`,
      {
        token_id: tokenId,
        title,
        description: description || null,
        language: language || null,
        code: code && code.trim() !== "" ? code : "/* No code provided */",
        submission_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: false }
    );

    const submissionId = result.outBinds.submission_id[0];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await connection.execute(
          `INSERT INTO SUBMISSION_FILES (submission_id, file_path)
           VALUES (:sid, :path)`,
          { sid: submissionId, path: file.path }
        );
      }
    }

    await connection.commit();

    // ✅ 🔥 LOGGING ADDED HERE (AFTER SUCCESS)
    await logEvent({
      userId: tokenId,
      action: "CREATE_SUBMISSION",
      module: "SUBMISSION",
      details: {
        submissionId,
        title
      }
    });

    return res.status(201).json({
      message: "Submission created successfully",
      submissionId,
    });

  } catch (err) {
    console.error("CREATE SUBMISSION ERROR:", err);

    if (connection) await connection.rollback();

    // ✅ 🔥 FAILURE LOG (ADVANCED)
    await logEvent({
      userId: req.user?.tokenId || "UNKNOWN",
      action: "CREATE_SUBMISSION_FAILED",
      module: "SUBMISSION",
      details: {
        title: req.body?.title,
        error: err.message
      }
    });

    return res.status(500).json({ message: "Submission failed" });

  } finally {
    if (connection) await connection.close();
  }
};

// ================= GET ANALYSIS =================
const getAnalysis = async (req, res) => {
  let connection;
  try {
    const submissionId = req.params.id;
    connection = await db.getConnection();

    const result = await connection.execute(
      `SELECT submission_id, avg_rating, rating_stddev,
              weighted_score, consensus_status, analyzed_at
       FROM REVIEW_ANALYSIS
       WHERE submission_id = :id`,
      { id: submissionId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No analysis available yet" });
    }

    return res.json(result.rows[0]);

  } catch (err) {
    console.error("GET ANALYSIS ERROR:", err);
    return res.status(500).json({ message: "Failed to fetch analysis" });

  } finally {
    if (connection) await connection.close();
  }
};

// ================= GET SUBMISSION BY ID (CRITICAL FIX) =================
const getSubmissionById = async (req, res) => {
  let connection;

  try {
    const id = parseInt(req.params.id, 10);
    connection = await db.getConnection();

    const result = await connection.execute(
      `SELECT submission_id, title, description, language, code, created_at
       FROM CODE_SUBMISSIONS
       WHERE submission_id = :id`,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const row = result.rows[0];

    let codeData = "";

    if (row.CODE) {
      if (typeof row.CODE === "string") {
        codeData = row.CODE;
      } else {
        codeData = await new Promise((resolve, reject) => {
          let chunks = [];

          row.CODE.on("data", (chunk) => {
            chunks.push(chunk);
          });

          row.CODE.on("end", () => {
            resolve(Buffer.concat(chunks).toString("utf8"));
          });

          row.CODE.on("error", (err) => {
            reject(err);
          });
        });
      }
    }

    return res.json({
      SUBMISSION_ID: row.SUBMISSION_ID,
      TITLE: row.TITLE,
      DESCRIPTION: row.DESCRIPTION ? String(row.DESCRIPTION) : "",
      LANGUAGE: row.LANGUAGE || "",
      CODE: codeData || "",
      CREATED_AT: row.CREATED_AT
    });

  } catch (err) {
    console.error("❌ FINAL ERROR:", err);
    return res.status(500).json({ message: err.message });

  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) {}
    }
  }
};

// ================= RESOLVE CONFLICT =================
const resolveConflict = async (req, res) => {
  let connection;
  try {
    const submissionId = req.params.id;
    connection = await db.getConnection();

    await connection.execute(
      `BEGIN resolve_conflict(:id); END;`,
      { id: submissionId },
      { autoCommit: true }
    );

    return res.json({
      message: "Conflict resolved successfully",
      submission_id: submissionId,
    });

  } catch (err) {
    console.error("RESOLVE ERROR:", err);
    return res.status(500).json({ message: "Failed to resolve conflict" });

  } finally {
    if (connection) await connection.close();
  }
};

// ================= TRUST SCORES =================
const getTrustScores = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();

    const result = await connection.execute(
      `SELECT token_id, trust_score, last_updated
       FROM TRUST_SCORES
       ORDER BY trust_score DESC`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.json(result.rows);

  } catch (err) {
    console.error("GET TRUST SCORES ERROR:", err);
    return res.status(500).json({ message: "Failed to fetch trust scores" });

  } finally {
    if (connection) await connection.close();
  }
};

// ================= USER STATS =================
const getMyStats = async (req, res) => {
  let connection;
  try {
    const tokenId = req.user.tokenId;
    connection = await db.getConnection();

    const tsResult = await connection.execute(
      `SELECT trust_score FROM TRUST_SCORES WHERE token_id = :token_id`,
      { token_id: tokenId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rvResult = await connection.execute(
      `SELECT COUNT(*) AS total_reviews FROM REVIEWS WHERE reviewer_token = :token_id`,
      { token_id: tokenId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const subResult = await connection.execute(
      `SELECT cs.status, ra.consensus_status
       FROM CODE_SUBMISSIONS cs
       LEFT JOIN REVIEW_ANALYSIS ra
       ON cs.submission_id = ra.submission_id
       WHERE cs.token_id = :token_id
       ORDER BY cs.submission_id DESC
       FETCH FIRST 1 ROWS ONLY`,
      { token_id: tokenId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.json({
      trustScore: tsResult.rows[0]?.TRUST_SCORE ?? 0,
      totalReviews: rvResult.rows[0]?.TOTAL_REVIEWS ?? 0,
      latestStatus:
        subResult.rows[0]?.CONSENSUS_STATUS ||
        subResult.rows[0]?.STATUS ||
        "N/A",
    });

  } catch (err) {
    console.error("GET MY STATS ERROR:", err);
    return res.status(500).json({ message: "Failed to fetch stats" });

  } finally {
    if (connection) await connection.close();
  }
};

const getAllSubmissions = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();

    const result = await connection.execute(
      `SELECT submission_id, title, status
       FROM CODE_SUBMISSIONS
       ORDER BY submission_id DESC`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.json(result.rows);

  } catch (err) {
    console.error("GET ALL SUBMISSIONS ERROR:", err);
    return res.status(500).json({ message: "Failed to fetch submissions" });

  } finally {
    if (connection) await connection.close();
  }
};

module.exports = {
  createSubmission,
  getAnalysis,
  getSubmissionById,
  resolveConflict,
  getTrustScores,
  getMyStats,
  getAllSubmissions
};
