
INSERT INTO REVIEWS (submission_id, reviewer_token, rating) VALUES (63, 'invalid _token', 4);

INSERT INTO REVIEWS (submission_id, reviewer_token, rating) VALUES (9999, 'token123', 3);

UPDATE REVIEWS SET rating = 5  WHERE review_id = 81;

DELETE FROM REVIEWS  WHERE review_id = 67;

select * from REVIEWS;

INSERT INTO REVIEWS (submission_id, reviewer_token, rating) VALUES (64,'90f9dd02e5c8a36445e4d5315b798cac623c6974a961533e23cc4af456c8f2c2', 4);

select * from AUDIT_LOG;

select * from REVIEW_ASSIGNMENTS;