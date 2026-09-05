const db = require("../db");
const structuredLogger = require("../utils/structuredLogger");

exports.createSubmission = async (req, res) => {
  const { title, description, language, code } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  const tokenId = req.user.tokenId;

  try {
    const result = await db.query(
      `INSERT INTO CODE_SUBMISSIONS (token_id, title, description, language, code)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING submission_id`,
      [tokenId, title, description || null, language || null, code && code.trim() !== "" ? code : "/* No code provided */"],
      req
    );

    const submissionId = result.rows[0].submission_id;

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await db.query(
          "INSERT INTO SUBMISSION_FILES (submission_id, file_path) VALUES ($1, $2)",
          [submissionId, file.path],
          req
        );
      }
    }

    await structuredLogger.info({
      event: "SUBMISSION_CREATED",
      module: "SUBMISSION",
      action: "CREATE_SUBMISSION",
      userId: tokenId,
      requestId: req.id,
      correlationId: req.correlationId,
      details: { submissionId, title, language },
    });

    return res.status(201).json({
      message: "Submission created successfully",
      submissionId,
    });
  } catch (err) {
    await structuredLogger.error({
      event: "SUBMISSION_CREATE_ERROR",
      module: "SUBMISSION",
      action: "CREATE_SUBMISSION",
      userId: tokenId,
      requestId: req.id,
      correlationId: req.correlationId,
      errorType: err.name,
      errorMessage: err.message,
      isFaultInjected: Boolean(err.isFaultInjected),
      details: { title },
    });

    return res.status(500).json({ message: "Submission failed", error: err.message });
  }
};

exports.getAnalysis = async (req, res) => {
  const submissionId = req.params.id;

  try {
    const result = await db.query(
      `SELECT submission_id, avg_rating, rating_stddev, weighted_score, consensus_status, analyzed_at
       FROM REVIEW_ANALYSIS
       WHERE submission_id = $1`,
      [submissionId],
      req
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No analysis available yet" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch analysis", error: err.message });
  }
};

exports.getSubmissionById = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const result = await db.query(
      `SELECT submission_id, title, description, language, code, created_at, status
       FROM CODE_SUBMISSIONS
       WHERE submission_id = $1`,
      [id],
      req
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const row = result.rows[0];
    return res.json({
      SUBMISSION_ID: row.submission_id,
      TITLE: row.title,
      DESCRIPTION: row.description || "",
      LANGUAGE: row.language || "",
      CODE: row.code || "",
      STATUS: row.status,
      CREATED_AT: row.created_at,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch submission", error: err.message });
  }
};

exports.resolveConflict = async (req, res) => {
  const submissionId = req.params.id;

  try {
    await db.query("SELECT resolve_conflict($1)", [submissionId], req);

    await structuredLogger.info({
      event: "CONFLICT_RESOLVED",
      module: "SUBMISSION",
      action: "RESOLVE_CONFLICT",
      userId: req.user?.tokenId || "ADMIN",
      requestId: req.id,
      correlationId: req.correlationId,
      details: { submissionId },
    });

    return res.json({
      message: "Conflict resolved successfully",
      submission_id: submissionId,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to resolve conflict", error: err.message });
  }
};

exports.getTrustScores = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT token_id, trust_score, last_updated FROM TRUST_SCORES ORDER BY trust_score DESC",
      [],
      req
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch trust scores", error: err.message });
  }
};

exports.getMyStats = async (req, res) => {
  const tokenId = req.user.tokenId;

  try {
    const tsResult = await db.query(
      "SELECT trust_score FROM TRUST_SCORES WHERE token_id = $1",
      [tokenId],
      req
    );

    const rvResult = await db.query(
      "SELECT COUNT(*) AS total_reviews FROM REVIEWS WHERE reviewer_token = $1",
      [tokenId],
      req
    );

    const subResult = await db.query(
      `SELECT cs.status, ra.consensus_status
       FROM CODE_SUBMISSIONS cs
       LEFT JOIN REVIEW_ANALYSIS ra ON cs.submission_id = ra.submission_id
       WHERE cs.token_id = $1
       ORDER BY cs.submission_id DESC
       LIMIT 1`,
      [tokenId],
      req
    );

    return res.json({
      trustScore: parseFloat(tsResult.rows[0]?.trust_score ?? 1.0),
      totalReviews: parseInt(rvResult.rows[0]?.total_reviews ?? 0, 10),
      latestStatus: subResult.rows[0]?.consensus_status || subResult.rows[0]?.status || "N/A",
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
};

exports.getAllSubmissions = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT submission_id, title, status, language, created_at FROM CODE_SUBMISSIONS ORDER BY submission_id DESC",
      [],
      req
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch submissions", error: err.message });
  }
};
