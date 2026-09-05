const db = require("../db");
const structuredLogger = require("../utils/structuredLogger");
const faultController = require("../utils/faultController");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.createReview = async (req, res) => {
  const { submission_id, rating, comments } = req.body;

  if (!submission_id || !rating) {
    return res.status(400).json({ message: "submission_id and rating required" });
  }

  const reviewerToken = req.user.tokenId;

  const timeoutMs = faultController.getDependencyTimeout();
  if (timeoutMs > 0) {
    await sleep(timeoutMs);
  }

  try {
    const result = await db.query(
      `INSERT INTO REVIEWS (submission_id, reviewer_token, rating, comments)
       VALUES ($1, $2, $3, $4)
       RETURNING review_id`,
      [submission_id, reviewerToken, rating, comments || null],
      req
    );

    const reviewId = result.rows[0].review_id;

    await db.query(
      "UPDATE REVIEW_ASSIGNMENTS SET status = 'COMPLETED' WHERE submission_id = $1 AND reviewer_token = $2",
      [submission_id, reviewerToken],
      req
    );

    await structuredLogger.info({
      event: "REVIEW_SUBMITTED",
      module: "REVIEW",
      action: "ADD_REVIEW",
      userId: reviewerToken,
      requestId: req.id,
      correlationId: req.correlationId,
      details: { submission_id, rating, reviewId },
    });

    return res.status(201).json({
      message: "Review submitted successfully",
      reviewId,
    });
  } catch (err) {
    await structuredLogger.error({
      event: "REVIEW_SUBMIT_ERROR",
      module: "REVIEW",
      action: "ADD_REVIEW",
      userId: reviewerToken,
      requestId: req.id,
      correlationId: req.correlationId,
      errorType: err.name,
      errorMessage: err.message,
      isFaultInjected: Boolean(err.isFaultInjected),
      details: { submission_id, rating },
    });

    return res.status(500).json({ message: "Review failed", error: err.message });
  }
};

exports.getReviewableSubmissions = async (req, res) => {
  const reviewerToken = req.user.tokenId;

  try {
    const result = await db.query(
      `SELECT
          cs.submission_id,
          cs.title,
          cs.language,
          cs.code,
          cs.description,
          cs.created_at,
          cs.status
       FROM CODE_SUBMISSIONS cs
       WHERE cs.token_id != $1
         AND cs.submission_id NOT IN (
           SELECT r.submission_id
           FROM REVIEWS r
           WHERE r.reviewer_token = $1
         )
       ORDER BY cs.submission_id DESC`,
      [reviewerToken],
      req
    );

    return res.status(200).json({ submissions: result.rows });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch reviewable submissions", error: err.message });
  }
};

exports.getAssignedReviews = async (req, res) => {
  const reviewerToken = req.user.tokenId;

  try {
    const result = await db.query(
      `SELECT
          ra.assignment_id,
          ra.submission_id,
          cs.title,
          cs.language,
          cs.created_at,
          cs.status
       FROM REVIEW_ASSIGNMENTS ra
       JOIN CODE_SUBMISSIONS cs ON ra.submission_id = cs.submission_id
       WHERE ra.reviewer_token = $1
         AND ra.status = 'PENDING'
       ORDER BY ra.assigned_at DESC`,
      [reviewerToken],
      req
    );

    return res.status(200).json({ assignedReviews: result.rows });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch assigned reviews", error: err.message });
  }
};
