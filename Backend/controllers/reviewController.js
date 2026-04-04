const db = require("../db/oracle");
const oracledb = require("oracledb");
const logEvent = require("../utils/logger");

exports.createReview = async (req, res) => {
  let connection;
  try {
    const { submission_id, rating, comments } = req.body;

    if (!submission_id || !rating) {
      return res.status(400).json({ message: "submission_id and rating required" });
    }

    const reviewerToken = req.user.tokenId;
    connection = await db.getConnection();

    const result = await connection.execute(
      `INSERT INTO REVIEWS (submission_id, reviewer_token, rating, comments)
       VALUES (:submission_id, :reviewer_token, :rating, :comments)
       RETURNING review_id INTO :review_id`,
      {
        submission_id,
        reviewer_token: reviewerToken,
        rating,
        comments: comments || null,
        review_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: false }
    );

    const reviewId = result.outBinds.review_id[0];

    await connection.execute(
      `BEGIN analyze_submission_consensus(:id); END;`,
      { id: submission_id }
    );

    await connection.execute(
      `UPDATE REVIEW_ASSIGNMENTS
       SET status = 'COMPLETED'
       WHERE submission_id = :sid AND reviewer_token = :token`,
      { sid: submission_id, token: reviewerToken }
    );

    await connection.commit();

    // ✅ 🔥 LOGGING ADDED HERE (AFTER SUCCESS)
    await logEvent({
      userId: reviewerToken,
      action: "ADD_REVIEW",
      module: "REVIEW",
      details: {
        submission_id,
        rating,
        reviewId
      }
    });

    return res.status(201).json({
      message: "Review submitted successfully",
      reviewId
    });

  } catch (err) {
    console.error("CREATE REVIEW ERROR:", err);

    if (connection) {
      try { await connection.rollback(); } catch (e) {}
    }

    // ✅ OPTIONAL: FAILURE LOG (STRONG FEATURE)
    await logEvent({
      userId: req.user?.tokenId || "UNKNOWN",
      action: "ADD_REVIEW_FAILED",
      module: "REVIEW",
      details: {
        submission_id: req.body?.submission_id,
        error: err.message
      }
    });

    if (err.errorNum) {
      return res.status(400).json({ message: err.message });
    }

    return res.status(500).json({ message: "Review failed" });

  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) {}
    }
  }
};


// ================= GET REVIEWABLE SUBMISSIONS =================
exports.getReviewableSubmissions = async (req, res) => {
  let connection;
  try {
    const reviewerToken = req.user.tokenId;
    connection = await db.getConnection();

    const result = await connection.execute(
      `SELECT
          cs.submission_id,
          cs.title,
          cs.language,
          cs.code,
          cs.description,
          cs.created_at,
          cs.status
       FROM CODE_SUBMISSIONS cs
       WHERE cs.token_id != :reviewer_token
         AND cs.submission_id NOT IN (
           SELECT r.submission_id
           FROM REVIEWS r
           WHERE r.reviewer_token = :reviewer_token
         )
       ORDER BY cs.submission_id DESC`,
      { reviewer_token: reviewerToken },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.status(200).json({ submissions: result.rows });

  } catch (err) {
    console.error("GET REVIEWABLE SUBMISSIONS ERROR:", err);
    return res.status(500).json({ message: "Failed to fetch reviewable submissions" });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) {}
    }
  }
};


// ================= GET ASSIGNED REVIEWS =================
exports.getAssignedReviews = async (req, res) => {
  let connection;
  try {
    const reviewerToken = req.user.tokenId;
    connection = await db.getConnection();

    const result = await connection.execute(
      `SELECT
          ra.assignment_id,
          ra.submission_id,
          cs.title,
          cs.language,
          cs.created_at,
          cs.status
       FROM REVIEW_ASSIGNMENTS ra
       JOIN CODE_SUBMISSIONS cs ON ra.submission_id = cs.submission_id
       WHERE ra.reviewer_token = :token
       AND ra.status = 'PENDING'
       ORDER BY ra.assigned_at DESC`,
      { token: reviewerToken },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.status(200).json({ assignedReviews: result.rows });

  } catch (err) {
    console.error("GET ASSIGNED REVIEWS ERROR:", err);
    return res.status(500).json({ message: "Failed to fetch assigned reviews" });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) {}
    }
  }
};