console.log("Submissions route file loaded");
const express = require("express");
const router = express.Router();
const submissionController = require("../controllers/submissionController");
const authMiddleware = require("../middleware/authMiddleware");

// Protect this route
router.post("/", authMiddleware, submissionController.createSubmission);

router.get("/:id/analysis", authMiddleware, submissionController.getAnalysis);

module.exports = router;
