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
select * from users_real;
select * from USER_TOKENS;
select * from CODE_SUBMISSIONS;
select * from REVIEWS;


SELECT submission_id from CODE_SUBMISSIONS;
select review_id,rating from reviews;
update REVIEWS set RATING=5 where REVIEW_ID=6;



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
select * from AUDIT_LOG;

BEGIN
    analyze_submission_consensus(3);
END;
/
SELECT submission_id, status FROM CODE_SUBMISSIONS;