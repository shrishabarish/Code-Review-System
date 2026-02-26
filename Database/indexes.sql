
CREATE INDEX idx_submission_token
ON CODE_SUBMISSIONS(token_id);

CREATE INDEX idx_review_submission
ON REVIEWS(submission_id);

CREATE INDEX idx_review_token
ON REVIEWS(reviewer_token);

CREATE INDEX idx_audit_time
ON AUDIT_LOG(log_time);