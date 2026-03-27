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
    v_prev_hash VARCHAR2(64);
    v_new_hash  VARCHAR2(64);
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

    -- Generate SHA256 using SQL function
    SELECT STANDARD_HASH(
        :NEW.review_id ||
        :NEW.submission_id ||
        :NEW.reviewer_token ||
        v_prev_hash,
        'SHA256'
    )
    INTO v_new_hash
    FROM dual;

    -- Insert audit record
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
BEGIN
    FOR rec IN (
        SELECT DISTINCT submission_id
        FROM REVIEWS
        WHERE submission_id IS NOT NULL
    )
    LOOP
        analyze_submission_consensus(rec.submission_id);
    END LOOP;
END;
/

CREATE OR REPLACE TRIGGER trg_prevent_review_on_locked
BEFORE INSERT ON REVIEWS
FOR EACH ROW
DECLARE
    v_status VARCHAR2(30);
    v_submission_token VARCHAR2(64);
    v_count NUMBER;
BEGIN
    -- 1. Check submission exists + get status + owner token
    BEGIN
        SELECT status, token_id
        INTO v_status, v_submission_token
        FROM CODE_SUBMISSIONS
        WHERE submission_id = :NEW.submission_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(
                -20011,
                'Submission does not exist.'
            );
    END;

    -- 2. Prevent self-review
    IF v_submission_token = :NEW.reviewer_token THEN
        RAISE_APPLICATION_ERROR(
            -20012,
            'You cannot review your own submission.'
        );
    END IF;

    -- 3. Check reviewer assignment (bias prevention)
    SELECT COUNT(*)
    INTO v_count
    FROM REVIEW_ASSIGNMENTS
    WHERE submission_id = :NEW.submission_id
    AND reviewer_token = :NEW.reviewer_token
    AND status = 'PENDING';

    IF v_count = 0 THEN
        RAISE_APPLICATION_ERROR(
            -20013,
            'You are not assigned to review this submission.'
        );
    END IF;

    -- 4. Prevent review if submission is locked
    IF v_status = 'LOCKED' THEN
        RAISE_APPLICATION_ERROR(
            -20010,
            'Submission is locked due to repeated conflicts.'
        );
    END IF;

END;
/

CREATE OR REPLACE TRIGGER trg_auto_consensus
AFTER INSERT ON REVIEWS
FOR EACH ROW
BEGIN
    analyze_submission_consensus(:NEW.submission_id);
END;
/
