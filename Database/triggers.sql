CREATE OR REPLACE TRIGGER prevent_review_update
BEFORE UPDATE ON REVIEWS
FOR EACH ROW
BEGIN
    RAISE_APPLICATION_ERROR(-20001, 'Reviews are immutable and cannot be modified.');
END;

CREATE OR REPLACE TRIGGER trg_prevent_review_update
BEFORE UPDATE ON REVIEWS
FOR EACH ROW
BEGIN
    RAISE_APPLICATION_ERROR(
        -20001,
        'Reviews are immutable and cannot be modified.'
    );
END;

CREATE OR REPLACE TRIGGER trg_prevent_review_delete
BEFORE DELETE ON REVIEWS
FOR EACH ROW
BEGIN
    RAISE_APPLICATION_ERROR(
        -20002,
        'Reviews cannot be deleted.'
    );
END;
