CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS USERS_REAL (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) DEFAULT 'USER' CHECK (role IN ('USER', 'REVIEWER', 'ADMIN')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS USER_TOKENS (
    token_id VARCHAR(64) PRIMARY KEY,
    user_id INT NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active_flag CHAR(1) DEFAULT 'Y' CHECK (active_flag IN ('Y', 'N')),
    CONSTRAINT fk_token_user FOREIGN KEY (user_id) REFERENCES USERS_REAL(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CODE_SUBMISSIONS (
    submission_id SERIAL PRIMARY KEY,
    token_id VARCHAR(64) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    language VARCHAR(50),
    code TEXT,
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONSENSUS', 'CONFLICT', 'RESOLVED', 'LOCKED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_submission_token FOREIGN KEY (token_id) REFERENCES USER_TOKENS(token_id)
);

CREATE TABLE IF NOT EXISTS SUBMISSION_FILES (
    file_id SERIAL PRIMARY KEY,
    submission_id INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_file_submission FOREIGN KEY (submission_id) REFERENCES CODE_SUBMISSIONS(submission_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS REVIEWS (
    review_id SERIAL PRIMARY KEY,
    submission_id INT NOT NULL,
    reviewer_token VARCHAR(64) NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    review_hash VARCHAR(64),
    bias_flag VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_submission FOREIGN KEY (submission_id) REFERENCES CODE_SUBMISSIONS(submission_id) ON DELETE CASCADE,
    CONSTRAINT fk_review_token FOREIGN KEY (reviewer_token) REFERENCES USER_TOKENS(token_id)
);

CREATE TABLE IF NOT EXISTS REVIEW_ASSIGNMENTS (
    assignment_id SERIAL PRIMARY KEY,
    submission_id INT NOT NULL,
    reviewer_token VARCHAR(64) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED')),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assign_submission FOREIGN KEY (submission_id) REFERENCES CODE_SUBMISSIONS(submission_id) ON DELETE CASCADE,
    CONSTRAINT fk_assign_token FOREIGN KEY (reviewer_token) REFERENCES USER_TOKENS(token_id)
);

CREATE TABLE IF NOT EXISTS TRUST_SCORES (
    token_id VARCHAR(64) PRIMARY KEY,
    trust_score NUMERIC(10, 4) DEFAULT 1.0000,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_trust_token FOREIGN KEY (token_id) REFERENCES USER_TOKENS(token_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS REVIEW_ANALYSIS (
    submission_id INT PRIMARY KEY,
    avg_rating NUMERIC(5, 2),
    rating_stddev NUMERIC(5, 2),
    weighted_score NUMERIC(5, 2),
    consensus_status VARCHAR(30),
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_analysis_submission FOREIGN KEY (submission_id) REFERENCES CODE_SUBMISSIONS(submission_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CONFLICT_ESCALATION (
    escalation_id SERIAL PRIMARY KEY,
    submission_id INT NOT NULL,
    escalation_level INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'PENDING',
    escalated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    CONSTRAINT fk_escalation_submission FOREIGN KEY (submission_id) REFERENCES CODE_SUBMISSIONS(submission_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS AUDIT_LOG (
    log_id SERIAL PRIMARY KEY,
    actor_token VARCHAR(64),
    action_type VARCHAR(50),
    target_id INT,
    encrypted_payload BYTEA,
    hash_value VARCHAR(64),
    previous_hash VARCHAR(64),
    log_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
