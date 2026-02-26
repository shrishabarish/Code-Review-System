CREATE OR REPLACE TRIGGER prevent_review_update
BEFORE UPDATE ON REVIEWS
FOR EACH ROW
BEGIN
    RAISE_APPLICATION_ERROR(-20001, 'Reviews are immutable and cannot be modified.');
END;
