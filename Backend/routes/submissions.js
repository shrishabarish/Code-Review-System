const express = require("express");
const router = express.Router();
const submissionController = require("../controllers/submissionController");
const authMiddleware = require("../middleware/authMiddleware");

// Protect this route
router.post("/", authMiddleware, submissionController.createSubmission);

module.exports = router;