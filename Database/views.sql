CREATE OR REPLACE VIEW BLIND_SUBMISSIONS AS
SELECT
    submission_id,
    title,
    description,
    language,
    status,
    created_at
FROM CODE_SUBMISSIONS;