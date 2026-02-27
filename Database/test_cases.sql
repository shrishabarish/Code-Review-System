INSERT INTO USERS_REAL (
    full_name,
    email,
    password_hash,
    role
)
VALUES (
    'Test User',
    'test@example.com',
    'hashed_pw',
    'USER'
);
INSERT INTO USER_TOKENS (
    token_id,
    user_id
)
VALUES (
    'TOKEN123',
    1
);
INSERT INTO CODE_SUBMISSIONS (
    token_id,
    title,
    description,
    language
)
VALUES (
    'TOKEN123',
    'Test Code',
    'Sample Description',
    'Java'
);
commit;
INSERT INTO REVIEWS (
    submission_id,
    reviewer_token,
    rating,
    comments
)
VALUES (
    3,
    'TOKEN123',
    3,
    'Initial review'
);
commit;

INSERT INTO REVIEWS (
    submission_id,
    reviewer_token,
    rating,
    comments
)
VALUES (
    3,
    'TOKEN123',
    4,
    'Second review'
);

INSERT INTO TRUST_SCORES (token_id, trust_score, last_updated)
VALUES ('TEST_DECAY_1', 100, SYSDATE - 10);
SELECT token_id, trust_score, last_updated
FROM TRUST_SCORES;