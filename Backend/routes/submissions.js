const express = require("express");
const router = express.Router();

const submissionController = require("../controllers/submissionController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Anyone logged in can see trust scores
router.get("/trust-scores",
    authMiddleware,
    submissionController.getTrustScores
);

// Anyone logged in can see submissions
router.get("/",
    authMiddleware,
    submissionController.getAllSubmissions
);

// Anyone logged in can view analysis
router.get("/:id/analysis",
    authMiddleware,
    submissionController.getAnalysis
);

// Only ADMIN can resolve conflicts
router.post("/:id/resolve",
    authMiddleware,
    roleMiddleware("ADMIN"),
    submissionController.resolveConflict
);

// Anyone logged in can create submission
router.post("/",
    authMiddleware,
    submissionController.createSubmission
);

module.exports = router;