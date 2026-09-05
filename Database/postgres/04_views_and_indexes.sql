CREATE OR REPLACE VIEW BLIND_SUBMISSIONS AS
SELECT
    submission_id,
    title,
    description,
    language,
    status,
    created_at
FROM CODE_SUBMISSIONS;

CREATE INDEX IF NOT EXISTS idx_submission_token ON CODE_SUBMISSIONS(token_id);
CREATE INDEX IF NOT EXISTS idx_review_submission ON REVIEWS(submission_id);
CREATE INDEX IF NOT EXISTS idx_review_token ON REVIEWS(reviewer_token);
CREATE INDEX IF NOT EXISTS idx_audit_time ON AUDIT_LOG(log_time);
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON USER_TOKENS(user_id);
CREATE INDEX IF NOT EXISTS idx_review_assignments_reviewer ON REVIEW_ASSIGNMENTS(reviewer_token, status);
