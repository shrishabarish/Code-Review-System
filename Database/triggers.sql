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

CREATE OR REPLACE TRIGGER trg_review_audit_insert
AFTER INSERT ON REVIEWS
FOR EACH ROW
DECLARE
    v_prev_hash   VARCHAR2(64);
    v_raw_hash    RAW(32);
    v_new_hash    VARCHAR2(64);
BEGIN
    -- Get previous hash
    BEGIN
        SELECT hash_value
        INTO v_prev_hash
        FROM (
            SELECT hash_value
            FROM AUDIT_LOG
            ORDER BY log_id DESC
        )
        WHERE ROWNUM = 1;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            v_prev_hash := 'GENESIS';
    END;

    -- Generate SHA256 hash using DBMS_CRYPTO
    v_raw_hash := DBMS_CRYPTO.HASH(
        UTL_RAW.CAST_TO_RAW(
            :NEW.review_id ||
            :NEW.submission_id ||
            :NEW.reviewer_token ||
            v_prev_hash
        ),
        DBMS_CRYPTO.HASH_SH256
    );

    v_new_hash := RAWTOHEX(v_raw_hash);

    -- Insert into audit log
    INSERT INTO AUDIT_LOG (
        actor_token,
        action_type,
        target_id,
        hash_value,
        previous_hash
    )
    VALUES (
        :NEW.reviewer_token,
        'INSERT_REVIEW',
        :NEW.review_id,
        v_new_hash,
        v_prev_hash
    );

END;
/

CREATE OR REPLACE TRIGGER trg_auto_consensus
AFTER INSERT ON REVIEWS
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    -- Check if at least 2 reviews exist
    SELECT COUNT(*)
    INTO v_count
    FROM REVIEWS
    WHERE submission_id = :NEW.submission_id;

    IF v_count >= 2 THEN
        analyze_submission_consensus(:NEW.submission_id);
    END IF;
END;
/