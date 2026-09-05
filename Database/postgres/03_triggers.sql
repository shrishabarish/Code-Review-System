CREATE OR REPLACE FUNCTION trg_fn_prevent_review_update()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Reviews are immutable and cannot be modified.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_review_update ON REVIEWS;
CREATE TRIGGER trg_prevent_review_update
BEFORE UPDATE ON REVIEWS
FOR EACH ROW
EXECUTE FUNCTION trg_fn_prevent_review_update();

CREATE OR REPLACE FUNCTION trg_fn_prevent_review_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Reviews cannot be deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_review_delete ON REVIEWS;
CREATE TRIGGER trg_prevent_review_delete
BEFORE DELETE ON REVIEWS
FOR EACH ROW
EXECUTE FUNCTION trg_fn_prevent_review_delete();

CREATE OR REPLACE FUNCTION trg_fn_prevent_review_on_locked()
RETURNS TRIGGER AS $$
DECLARE
    v_status VARCHAR(30);
    v_submission_token VARCHAR(64);
BEGIN
    SELECT status, token_id INTO v_status, v_submission_token 
    FROM CODE_SUBMISSIONS
    WHERE submission_id = NEW.submission_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission % does not exist.', NEW.submission_id;
    END IF;

    IF v_submission_token = NEW.reviewer_token THEN
        RAISE EXCEPTION 'You cannot review your own submission.';
    END IF;

    IF v_status = 'LOCKED' THEN
        RAISE EXCEPTION 'Submission is locked due to repeated conflicts.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_review_on_locked ON REVIEWS;
CREATE TRIGGER trg_prevent_review_on_locked
BEFORE INSERT ON REVIEWS
FOR EACH ROW
EXECUTE FUNCTION trg_fn_prevent_review_on_locked();

CREATE OR REPLACE FUNCTION trg_fn_review_after_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_prev_hash VARCHAR(64);
    v_new_hash VARCHAR(64);
    v_raw_text TEXT;
BEGIN
    SELECT hash_value INTO v_prev_hash
    FROM AUDIT_LOG
    ORDER BY log_id DESC
    LIMIT 1;

    IF v_prev_hash IS NULL THEN
        v_prev_hash := 'GENESIS';
    END IF;

    v_raw_text := NEW.review_id || ':' || NEW.submission_id || ':' || NEW.reviewer_token || ':' || v_prev_hash;
    v_new_hash := encode(digest(v_raw_text, 'sha256'), 'hex');

    INSERT INTO AUDIT_LOG (actor_token, action_type, target_id, hash_value, previous_hash)
    VALUES (NEW.reviewer_token, 'INSERT_REVIEW', NEW.review_id, v_new_hash, v_prev_hash);

    PERFORM analyze_submission_consensus(NEW.submission_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_review_after_insert ON REVIEWS;
CREATE TRIGGER trg_review_after_insert
AFTER INSERT ON REVIEWS
FOR EACH ROW
EXECUTE FUNCTION trg_fn_review_after_insert();
