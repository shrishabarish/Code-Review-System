const express = require("express");
const router  = express.Router();

const reviewController = require("../controllers/reviewController");
const authMiddleware   = require("../middleware/authMiddleware");

router.get("/reviewable", authMiddleware, reviewController.getReviewableSubmissions);

router.get("/assigned", authMiddleware, reviewController.getAssignedReviews);

router.post("/", authMiddleware, reviewController.createReview);

module.exports = router;