CREATE OR REPLACE FUNCTION detect_bias_and_adjust_trust(p_submission_id INT)
RETURNS VOID AS $$
DECLARE
    v_weighted_score NUMERIC(5, 2);
    v_deviation NUMERIC(5, 2);
    rec RECORD;
BEGIN
    SELECT weighted_score INTO v_weighted_score
    FROM REVIEW_ANALYSIS
    WHERE submission_id = p_submission_id;

    IF v_weighted_score IS NULL THEN
        RETURN;
    END IF;

    FOR rec IN 
        SELECT reviewer_token, rating 
        FROM REVIEWS 
        WHERE submission_id = p_submission_id
    LOOP
        v_deviation := ABS(rec.rating - v_weighted_score);
        IF v_deviation <= 0.5 THEN
            UPDATE TRUST_SCORES 
            SET trust_score = trust_score * 1.05, last_updated = CURRENT_TIMESTAMP
            WHERE token_id = rec.reviewer_token;
        ELSIF v_deviation > 1.5 THEN
            UPDATE TRUST_SCORES 
            SET trust_score = trust_score * 0.90, last_updated = CURRENT_TIMESTAMP
            WHERE token_id = rec.reviewer_token;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION analyze_submission_consensus(p_submission_id INT)
RETURNS VOID AS $$
DECLARE
    v_avg_rating NUMERIC(5, 2);
    v_stddev_rating NUMERIC(5, 2);
    v_weighted_sum NUMERIC(10, 4);
    v_total_weight NUMERIC(10, 4);
    v_weighted_score NUMERIC(5, 2);
    v_status VARCHAR(30);
    v_review_count INT;
    v_locked BOOLEAN := FALSE;
BEGIN
    SELECT COUNT(*) INTO v_review_count 
    FROM REVIEWS 
    WHERE submission_id = p_submission_id;

    IF v_review_count < 2 THEN
        RETURN;
    END IF;

    SELECT AVG(rating), COALESCE(STDDEV_SAMP(rating), 0)
    INTO v_avg_rating, v_stddev_rating
    FROM REVIEWS
    WHERE submission_id = p_submission_id;

    SELECT SUM(r.rating * COALESCE(t.trust_score, 1.0)), SUM(COALESCE(t.trust_score, 1.0))
    INTO v_weighted_sum, v_total_weight
    FROM REVIEWS r
    LEFT JOIN TRUST_SCORES t ON r.reviewer_token = t.token_id
    WHERE r.submission_id = p_submission_id;

    IF v_total_weight > 0 THEN
        v_weighted_score := v_weighted_sum / v_total_weight;
    ELSE
        v_weighted_score := v_avg_rating;
    END IF;

    IF v_stddev_rating <= 1.0 THEN
        v_status := 'CONSENSUS';
    ELSE
        v_status := 'CONFLICT';
    END IF;

    INSERT INTO REVIEW_ANALYSIS (
        submission_id, avg_rating, rating_stddev, weighted_score, consensus_status, analyzed_at
    )
    VALUES (
        p_submission_id, v_avg_rating, v_stddev_rating, v_weighted_score, v_status, CURRENT_TIMESTAMP
    )
    ON CONFLICT (submission_id) DO UPDATE SET
        avg_rating = EXCLUDED.avg_rating,
        rating_stddev = EXCLUDED.rating_stddev,
        weighted_score = EXCLUDED.weighted_score,
        consensus_status = EXCLUDED.consensus_status,
        analyzed_at = CURRENT_TIMESTAMP;

    IF v_status = 'CONFLICT' THEN
        INSERT INTO CONFLICT_ESCALATION (submission_id, escalation_level, status, escalated_at)
        VALUES (p_submission_id, 1, 'PENDING', CURRENT_TIMESTAMP)
        ON CONFLICT (escalation_id) DO NOTHING;

        UPDATE CONFLICT_ESCALATION
        SET escalation_level = escalation_level + 1, escalated_at = CURRENT_TIMESTAMP
        WHERE submission_id = p_submission_id;
    ELSE
        DELETE FROM CONFLICT_ESCALATION WHERE submission_id = p_submission_id;
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM CONFLICT_ESCALATION
        WHERE submission_id = p_submission_id AND escalation_level >= 3
    ) INTO v_locked;

    IF v_locked THEN
        UPDATE CODE_SUBMISSIONS SET status = 'LOCKED' WHERE submission_id = p_submission_id;
    ELSE
        UPDATE CODE_SUBMISSIONS SET status = v_status WHERE submission_id = p_submission_id;
        PERFORM detect_bias_and_adjust_trust(p_submission_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION resolve_conflict(p_submission_id INT)
RETURNS VOID AS $$
BEGIN
    UPDATE CONFLICT_ESCALATION
    SET status = 'RESOLVED', resolved_at = CURRENT_TIMESTAMP
    WHERE submission_id = p_submission_id;

    UPDATE CODE_SUBMISSIONS
    SET status = 'RESOLVED'
    WHERE submission_id = p_submission_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION apply_reputation_decay()
RETURNS VOID AS $$
DECLARE
    v_lambda CONSTANT NUMERIC := 0.02;
BEGIN
    UPDATE TRUST_SCORES
    SET trust_score = trust_score * EXP(-v_lambda * EXTRACT(DAY FROM (CURRENT_TIMESTAMP - last_updated))),
        last_updated = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;
