CREATE OR REPLACE PROCEDURE analyze_submission_consensus (
    p_submission_id IN NUMBER
)
IS
    v_avg_rating      NUMBER;
    v_stddev_rating   NUMBER;
    v_weighted_sum    NUMBER;
    v_total_weight    NUMBER;
    v_weighted_score  NUMBER;
    v_status          VARCHAR2(30);
    v_review_count    NUMBER;
BEGIN
    --------------------------------------------------
    -- 1. Ensure enough reviews
    --------------------------------------------------
    SELECT COUNT(*)
    INTO v_review_count
    FROM REVIEWS
    WHERE submission_id = p_submission_id;

    IF v_review_count < 2 THEN
        RETURN;
    END IF;

    --------------------------------------------------
    -- 2. Normal statistics
    --------------------------------------------------
    SELECT AVG(r.rating),
           STDDEV(r.rating)
    INTO v_avg_rating, v_stddev_rating
    FROM REVIEWS r
    WHERE r.submission_id = p_submission_id;

    -- Fix: STDDEV can be NULL if all ratings identical
    v_stddev_rating := NVL(v_stddev_rating, 0);

    --------------------------------------------------
    -- 3. Trust-weighted calculation
    --------------------------------------------------
    SELECT SUM(r.rating * NVL(t.trust_score, 0)),
           SUM(NVL(t.trust_score, 0))
    INTO v_weighted_sum, v_total_weight
    FROM REVIEWS r
    LEFT JOIN TRUST_SCORES t
        ON r.reviewer_token = t.token_id
    WHERE r.submission_id = p_submission_id;

    IF v_total_weight > 0 THEN
        v_weighted_score := v_weighted_sum / v_total_weight;
    ELSE
        v_weighted_score := v_avg_rating;
    END IF;

    --------------------------------------------------
    -- 4. Determine consensus
    --------------------------------------------------
    IF v_stddev_rating <= 1 THEN
        v_status := 'CONSENSUS';
    ELSE
        v_status := 'CONFLICT';
    END IF;

    --------------------------------------------------
    -- 5. Update REVIEW_ANALYSIS
    --------------------------------------------------
    MERGE INTO REVIEW_ANALYSIS ra
    USING (SELECT p_submission_id AS submission_id FROM dual) src
    ON (ra.submission_id = src.submission_id)
    WHEN MATCHED THEN
        UPDATE SET
            avg_rating       = v_avg_rating,
            rating_stddev    = v_stddev_rating,
            weighted_score   = v_weighted_score,
            consensus_status = v_status,
            analyzed_at      = SYSTIMESTAMP
    WHEN NOT MATCHED THEN
        INSERT (
            submission_id,
            avg_rating,
            rating_stddev,
            weighted_score,
            consensus_status,
            analyzed_at
        )
        VALUES (
            p_submission_id,
            v_avg_rating,
            v_stddev_rating,
            v_weighted_score,
            v_status,
            SYSTIMESTAMP
        );

    --------------------------------------------------
    -- 6. Escalation Logic
    --------------------------------------------------
    IF v_status = 'CONFLICT' THEN

        MERGE INTO CONFLICT_ESCALATION ce
        USING (SELECT p_submission_id AS submission_id FROM dual) src
        ON (ce.submission_id = src.submission_id)
        WHEN MATCHED THEN
            UPDATE SET
                escalation_level = escalation_level + 1,
                escalated_at     = SYSTIMESTAMP
        WHEN NOT MATCHED THEN
            INSERT (
                submission_id,
                escalation_level,
                status,
                escalated_at
            )
            VALUES (
                p_submission_id,
                1,
                'PENDING',
                SYSTIMESTAMP
            );

    ELSE
        -- Reset escalation if consensus achieved
        DELETE FROM CONFLICT_ESCALATION
        WHERE submission_id = p_submission_id;

    END IF;

    --------------------------------------------------
    -- 7. Update Submission Status Safely
    --------------------------------------------------
    UPDATE CODE_SUBMISSIONS
    SET status =
        CASE
            WHEN EXISTS (
                SELECT 1
                FROM CONFLICT_ESCALATION
                WHERE submission_id = p_submission_id
                AND escalation_level >= 3
            )
            THEN 'LOCKED'
            ELSE v_status
        END
    WHERE submission_id = p_submission_id;

    --------------------------------------------------
    -- 8. Bias Detection (only if not locked)
    --------------------------------------------------
    IF v_status != 'LOCKED' THEN
        detect_bias_and_adjust_trust(p_submission_id);
    END IF;

END;
/

CREATE OR REPLACE PROCEDURE apply_reputation_decay
IS
    v_lambda CONSTANT NUMBER := 0.02;
BEGIN
    UPDATE TRUST_SCORES
    SET trust_score =
        trust_score * EXP(
            -v_lambda *
            (SYSDATE - CAST(last_updated AS DATE))
        ),
        last_updated = SYSTIMESTAMP;

END;
/

CREATE OR REPLACE PROCEDURE detect_bias_and_adjust_trust (
    p_submission_id IN NUMBER
)
IS
    v_weighted_score NUMBER;
    v_deviation      NUMBER;
BEGIN
    SELECT weighted_score
    INTO v_weighted_score
    FROM REVIEW_ANALYSIS
    WHERE submission_id = p_submission_id;

    FOR rec IN (
        SELECT reviewer_token, rating
        FROM REVIEWS
        WHERE submission_id = p_submission_id
    )
    LOOP
        v_deviation := ABS(rec.rating - v_weighted_score);

        IF v_deviation <= 0.5 THEN

            UPDATE TRUST_SCORES
            SET trust_score = trust_score * 1.05,
                last_updated = SYSTIMESTAMP
            WHERE token_id = rec.reviewer_token;

        ELSIF v_deviation > 1.5 THEN

            UPDATE TRUST_SCORES
            SET trust_score = trust_score * 0.9,
                last_updated = SYSTIMESTAMP
            WHERE token_id = rec.reviewer_token;

        END IF;

    END LOOP;

END;
/

CREATE OR REPLACE PROCEDURE resolve_conflict (
    p_submission_id IN NUMBER
)
IS
BEGIN
    UPDATE CONFLICT_ESCALATION
    SET status = 'RESOLVED',
        resolved_at = SYSTIMESTAMP
    WHERE submission_id = p_submission_id;

    UPDATE CODE_SUBMISSIONS
    SET status = 'RESOLVED'
    WHERE submission_id = p_submission_id;
END;
/