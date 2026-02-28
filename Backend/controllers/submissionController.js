const db = require("../db/oracle");
const oracledb = require("oracledb");

exports.createSubmission = async (req, res) => {
    try {
        const { title, description, language } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const tokenId = req.user.tokenId;

        const connection = await db.getConnection();

        const result = await connection.execute(
            `INSERT INTO CODE_SUBMISSIONS 
             (token_id, title, description, language)
             VALUES (:token_id, :title, :description, :language)
             RETURNING submission_id INTO :submission_id`,
            {
                token_id: tokenId,
                title,
                description,
                language,
                submission_id: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.NUMBER
                }
            },
            { autoCommit: true }
        );

        const submissionId = result.outBinds.submission_id[0];

        await connection.close();

        return res.status(201).json({
            message: "Submission created successfully",
            submissionId
        });

    } catch (err) {
        console.error("CREATE SUBMISSION ERROR:", err);
        return res.status(500).json({ message: "Submission failed" });
    }
};

exports.getAnalysis = async (req, res) => {
    const submissionId = req.params.id;

    try {
        const connection = await db.getConnection();

        const result = await connection.execute(
            `SELECT 
                submission_id,
                avg_rating,
                rating_stddev,
                weighted_score,
                consensus_status,
                analyzed_at
             FROM REVIEW_ANALYSIS
             WHERE submission_id = :id`,
            { id: submissionId }
        );

        await connection.close();

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "No analysis available yet"
            });
        }

        const row = result.rows[0];

        res.json({
            submission_id: row[0],
            avg_rating: row[1],
            rating_stddev: row[2],
            weighted_score: row[3],
            consensus_status: row[4],
            analyzed_at: row[5]
        });

    } catch (err) {
        console.error("GET ANALYSIS ERROR:", err);
        res.status(500).json({ message: "Failed to fetch analysis" });
    }
};

exports.getAllSubmissions = async (req, res) => {
    try {
        const connection = await db.getConnection();

        const result = await connection.execute(
            `SELECT 
                s.submission_id,
                s.title,
                s.status,
                ra.avg_rating,
                ra.consensus_status
             FROM CODE_SUBMISSIONS s
             LEFT JOIN REVIEW_ANALYSIS ra
               ON s.submission_id = ra.submission_id
             ORDER BY s.submission_id DESC`
        );

        await connection.close();

        const submissions = result.rows.map(row => ({
            submission_id: row[0],
            title: row[1],
            status: row[2],
            avg_rating: row[3],
            consensus_status: row[4]
        }));

        res.json(submissions);

    } catch (err) {
        console.error("GET SUBMISSIONS ERROR:", err);
        res.status(500).json({ message: "Failed to fetch submissions" });
    }
};

exports.resolveConflict = async (req, res) => {
    const submissionId = req.params.id;

    try {
        const connection = await db.getConnection();

        await connection.execute(
            `BEGIN
                resolve_conflict(:id);
             END;`,
            { id: submissionId },
            { autoCommit: true }
        );

        await connection.close();

        res.json({
            message: "Conflict resolved successfully",
            submission_id: submissionId
        });

    } catch (err) {
        console.error("RESOLVE ERROR:", err);
        res.status(500).json({ message: "Failed to resolve conflict" });
    }
};

exports.getTrustScores = async (req, res) => {
    try {
        const connection = await db.getConnection();

        const result = await connection.execute(
            `SELECT 
                token_id,
                trust_score,
                last_updated
             FROM TRUST_SCORES
             ORDER BY trust_score DESC`
        );

        await connection.close();

        const scores = result.rows.map(row => ({
            token_id: row[0],
            trust_score: row[1],
            last_updated: row[2]
        }));

        res.json(scores);

    } catch (err) {
        console.error("GET TRUST SCORES ERROR:", err);
        res.status(500).json({ message: "Failed to fetch trust scores" });
    }
};

