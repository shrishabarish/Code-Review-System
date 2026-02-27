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
        RAISE_APPLICATION_ERROR(
            -20020,
            'Not enough reviews to analyze consensus.'
        );
    END IF;

    --------------------------------------------------
    -- 2. Normal statistics
    --------------------------------------------------
    SELECT AVG(r.rating),
           STDDEV(r.rating)
    INTO v_avg_rating, v_stddev_rating
    FROM REVIEWS r
    WHERE r.submission_id = p_submission_id;

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
    -- 4. Classification logic
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
    -- 6. Update submission status
    --------------------------------------------------
    UPDATE CODE_SUBMISSIONS
    SET status = v_status
    WHERE submission_id = p_submission_id;

END;
/