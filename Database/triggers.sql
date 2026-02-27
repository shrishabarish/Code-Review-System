CREATE OR REPLACE TRIGGER prevent_review_update
BEFORE UPDATE ON REVIEWS
FOR EACH ROW
BEGIN
    RAISE_APPLICATION_ERROR(-20001, 'Reviews are immutable and cannot be modified.');
END;
/
CREATE OR REPLACE TRIGGER trg_prevent_review_update
BEFORE UPDATE ON REVIEWS
FOR EACH ROW
BEGIN
    RAISE_APPLICATION_ERROR(
        -20001,
        'Reviews are immutable and cannot be modified.'
    );
END;
/
CREATE OR REPLACE TRIGGER trg_prevent_review_delete
BEFORE DELETE ON REVIEWS
FOR EACH ROW
BEGIN
    RAISE_APPLICATION_ERROR(
        -20002,
        'Reviews cannot be deleted.'
    );
END;
/

CREATE OR REPLACE TRIGGER trg_review_audit
AFTER INSERT ON REVIEWS
FOR EACH ROW
BEGIN
    INSERT INTO AUDIT_LOG (
        actor_token,
        action_type,
        target_id,
        encrypted_payload,
        hash_value,
        previous_hash,
        log_time
    )
    VALUES (
        :NEW.reviewer_token,
        'REVIEW_SUBMITTED',
        :NEW.submission_id,
        NULL,
        NULL,
        NULL,
        CURRENT_TIMESTAMP
    );
END;
/
