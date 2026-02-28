const db = require("../db/oracle");
const oracledb = require("oracledb");

exports.createReview = async (req, res) => {
    try {
        const { submission_id, rating, comments } = req.body;

        if (!submission_id || !rating) {
            return res.status(400).json({ message: "submission_id and rating required" });
        }

        const reviewerToken = req.user.tokenId;

        const connection = await db.getConnection();

        const result = await connection.execute(
            `INSERT INTO REVIEWS 
             (submission_id, reviewer_token, rating, comments)
             VALUES (:submission_id, :reviewer_token, :rating, :comments)
             RETURNING review_id INTO :review_id`,
            {
                submission_id,
                reviewer_token: reviewerToken,
                rating,
                comments,
                review_id: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.NUMBER
                }
            },
            { autoCommit: true }
        );

        const reviewId = result.outBinds.review_id[0];

        await connection.close();

        return res.status(201).json({
            message: "Review submitted successfully",
            reviewId
        });

    } catch (err) {
        console.error("CREATE REVIEW ERROR:", err);
        return res.status(500).json({ message: "Review failed" });
    }
};