INSERT INTO USERS_REAL (full_name, email, password_hash, role)
VALUES ('Arjun Kumar', 'arjun@mail.com', 'hash1', 'USER');

INSERT INTO USERS_REAL (full_name, email, password_hash, role)
VALUES ('Meera Nair', 'meera@mail.com', 'hash2', 'REVIEWER');

INSERT INTO USERS_REAL (full_name, email, password_hash, role)
VALUES ('Rahul Iyer', 'rahul@mail.com', 'hash3', 'REVIEWER');

SELECT user_id, full_name FROM USERS_REAL;

INSERT INTO USER_TOKENS (token_id, user_id)
VALUES (
    'TOKEN_A1',
    (SELECT user_id FROM USERS_REAL WHERE email = 'arjun@mail.com')
);

INSERT INTO USER_TOKENS (token_id, user_id)
VALUES (
    'TOKEN_B1',
    (SELECT user_id FROM USERS_REAL WHERE email = 'meera@mail.com')
);

INSERT INTO USER_TOKENS (token_id, user_id)
VALUES (
    'TOKEN_C1',
    (SELECT user_id FROM USERS_REAL WHERE email = 'rahul@mail.com')
);

INSERT INTO CODE_SUBMISSIONS (token_id, title, description, language)
VALUES (
    'TOKEN_A1',
    'Sorting Algorithm',
    'QuickSort implementation',
    'C++'
);

INSERT INTO CODE_SUBMISSIONS (token_id, title, description, language)
VALUES (
    'TOKEN_C1',
    'Database Optimizer', 'Index performance tuning', 'SQL'
);

INSERT INTO CODE_SUBMISSIONS (token_id, title, description, language)
VALUES (
    'TOKEN_B1',
    'REST API Service', 'NodeJS backend service', 'JavaScript'
);

INSERT INTO REVIEWS (submission_id, reviewer_token, rating, comments)
VALUES (
    (SELECT submission_id FROM CODE_SUBMISSIONS WHERE title='Sorting Algorithm'),
    'TOKEN_A1',
    5,
    'Excellent structure'
);
INSERT INTO REVIEWS (submission_id, reviewer_token, rating, comments)
VALUES (
    (SELECT submission_id FROM CODE_SUBMISSIONS WHERE title='REST API Service'),
    'TOKEN_B1',
    4,
    'Good , can be optimized'
);
 INSERT INTO REVIEWS (submission_id, reviewer_token, rating, comments)
VALUES (
    (SELECT submission_id FROM CODE_SUBMISSIONS WHERE title='Database Optimizer'),
    'TOKEN_C1',
    3,
    'Needs Improvement'
);

SELECT * FROM REVIEW_ANALYSIS;
SELECT submission_id, status FROM CODE_SUBMISSIONS;


SELECT log_id, hash_value, previous_hash
FROM AUDIT_LOG
ORDER BY log_id;

BEGIN
    apply_reputation_decay;
END;
/

DROP TRIGGER trg_auto_consensus;
/
SHOW ERRORS TRIGGER trg_auto_consensus;

SELECT * FROM TRUST_SCORES;