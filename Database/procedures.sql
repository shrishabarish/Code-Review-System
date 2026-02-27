CREATE OR REPLACE PROCEDURE analyze_submission_consensus (
    p_submission_id IN NUMBER
)
IS
    v_avg_rating     NUMBER;
    v_stddev_rating  NUMBER;
    v_weighted_score NUMBER;
    v_status         VARCHAR2(30);
    v_review_count   NUMBER;
BEGIN
    -- Count reviews
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

    -- Calculate AVG and STDDEV
    SELECT AVG(rating), STDDEV(rating)
    INTO v_avg_rating, v_stddev_rating
    FROM REVIEWS
    WHERE submission_id = p_submission_id;

    -- Weighted score (for now = average)
    v_weighted_score := v_avg_rating;

    -- Classification Logic
    IF v_stddev_rating <= 1 THEN
        v_status := 'CONSENSUS';
    ELSE
        v_status := 'CONFLICT';
    END IF;

    -- MERGE into REVIEW_ANALYSIS
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

    -- Update submission status
    UPDATE CODE_SUBMISSIONS
    SET status = v_status
    WHERE submission_id = p_submission_id;

END;
/