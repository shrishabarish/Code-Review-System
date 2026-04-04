const express = require("express");
const router = express.Router();
const multer = require("multer");

const submissionController = require("../controllers/submissionController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/trust-scores", authMiddleware, submissionController.getTrustScores);

router.get("/my-stats", authMiddleware, submissionController.getMyStats);

router.get("/", authMiddleware, submissionController.getAllSubmissions);

router.get("/:id/analysis", authMiddleware, submissionController.getAnalysis);

router.get("/:id", authMiddleware, submissionController.getSubmissionById);

router.post(
  "/:id/resolve",
  authMiddleware,
  roleMiddleware("ADMIN"),
  submissionController.resolveConflict
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.post(
  "/",
  authMiddleware,
  upload.array("files"),
  submissionController.createSubmission
);

module.exports = router;