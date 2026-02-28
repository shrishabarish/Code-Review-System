const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/oracle");
const oracledb = require("oracledb");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET;

/* ============================
   REGISTER
============================ */
exports.register = async (req, res) => {
    try {
        console.log("BODY:", req.body);

        const { full_name, email, password } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const connection = await db.getConnection();

        // Check if email already exists
        const existingUser = await connection.execute(
            `SELECT user_id FROM USERS_REAL WHERE email = :email`,
            { email }
        );

        if (existingUser.rows.length > 0) {
            await connection.close();
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into USERS_REAL
        const result = await connection.execute(
            `INSERT INTO USERS_REAL (full_name, email, password_hash,role)
             VALUES (:full_name, :email, :password_hash,:role)
             RETURNING user_id INTO :user_id`,
            {
                full_name,
                email,
                password_hash: hashedPassword,
                role:"USER",
                user_id: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.NUMBER
                }
            },
            { autoCommit: true }
        );

        const userId = result.outBinds.user_id[0];

        // Generate secure random token_id (64 char hex string)
        const generatedTokenId = crypto.randomBytes(32).toString("hex");

        // Insert into USER_TOKENS
        await connection.execute(
            `INSERT INTO USER_TOKENS (token_id, user_id)
             VALUES (:token_id, :user_id)`,
            {
                token_id: generatedTokenId,
                user_id: userId
            },
            { autoCommit: true }
        );

            // Insert initial trust score
await connection.execute(
    `INSERT INTO TRUST_SCORES (token_id, trust_score, last_updated)
     VALUES (:token_id, :trust_score, SYSTIMESTAMP)`,
    {
        token_id: generatedTokenId,
        trust_score: 1
    },
    { autoCommit: true }
);
        await connection.close();

        // Create JWT
        const jwtToken = jwt.sign(
            { userId, tokenId: generatedTokenId ,role},
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(201).json({
            message: "User registered successfully",
            token: jwtToken
        });

    } catch (err) {
        console.error("REGISTER ERROR:", err);
        return res.status(500).json({ message: "Registration failed" });
    }
};


/* ============================
   LOGIN
============================ */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const connection = await db.getConnection();

        const result = await connection.execute(
            `SELECT user_id, password_hash 
             FROM USERS_REAL 
             WHERE email = :email`,
            { email }
        );

        if (result.rows.length === 0) {
            await connection.close();
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const userId = result.rows[0][0];
        const passwordHash = result.rows[0][1];

        const isMatch = await bcrypt.compare(password, passwordHash);

        if (!isMatch) {
            await connection.close();
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Get token_id
        const tokenResult = await connection.execute(
            `SELECT token_id FROM USER_TOKENS WHERE user_id = :user_id`,
            { user_id: userId }
        );

        await connection.close();

        const tokenId = tokenResult.rows[0][0];

        const jwtToken = jwt.sign(
            { userId, tokenId },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.json({
            message: "Login successful",
            token: jwtToken
        });

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        return res.status(500).json({ message: "Login failed" });
    }
};


