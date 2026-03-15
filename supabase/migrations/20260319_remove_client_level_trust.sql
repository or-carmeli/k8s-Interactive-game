-- ── Remove client trust for score calculation ───────────────────────────────
-- The previous check_quiz_answer accepted p_level from the client and used it
-- to award 15 flat points when p_level = 'mixed' or 'daily'. A user could
-- send p_level='mixed' for an easy question and get 15 instead of 10.
--
-- Fix: always derive points from the question's own level column in the DB.
-- p_level is kept in the signature (DEFAULT NULL) for backward compatibility
-- but is now completely ignored for scoring.
--
-- Behavioral change for mixed-mode quizzes: questions now score based on
-- their intrinsic difficulty (easy=10, medium=20, hard=30) instead of a
-- flat 15. This is more fair and eliminates the client trust surface.

CREATE OR REPLACE FUNCTION check_quiz_answer(
  p_question_id INT,
  p_selected    SMALLINT,
  p_quiz_run_id TEXT DEFAULT NULL,
  p_level       TEXT DEFAULT NULL   -- kept for backward compat, ignored for scoring
)
RETURNS JSON
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
AS $$
DECLARE
  result      JSON;
  check_count INT;
  caller_id   UUID;
  q_answer    SMALLINT;
  q_level     TEXT;
  q_explanation TEXT;
  is_correct  BOOLEAN;
  pts         SMALLINT;
  affected    INT := 0;
BEGIN
  caller_id := auth.uid();

  -- Rate limit: max 120 checks per minute per user
  SELECT COUNT(*) INTO check_count
  FROM answer_check_log
  WHERE user_id = caller_id AND checked_at > now() - interval '1 minute';

  IF check_count > 120 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please slow down.';
  END IF;

  INSERT INTO answer_check_log (user_id) VALUES (caller_id);

  -- Look up the question
  SELECT answer, level, explanation
  INTO q_answer, q_level, q_explanation
  FROM quiz_questions
  WHERE id = p_question_id;

  IF q_answer IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  is_correct := (q_answer = p_selected);

  -- Build result JSON (same shape as before)
  result := json_build_object(
    'correct', is_correct,
    'correct_answer', q_answer,
    'explanation', q_explanation
  );

  -- Server-side scoring: only when quiz_run_id provided and answer correct
  IF is_correct AND p_quiz_run_id IS NOT NULL AND caller_id IS NOT NULL THEN
    -- Points derived entirely from the question's DB level.
    -- p_level is intentionally ignored - the server does not trust it.
    pts := CASE q_level
      WHEN 'easy'   THEN 10
      WHEN 'medium' THEN 20
      WHEN 'hard'   THEN 30
      ELSE 0
    END::SMALLINT;

    -- Idempotent insert - ON CONFLICT DO NOTHING prevents double scoring
    INSERT INTO score_events (user_id, question_id, quiz_run_id, source, points)
    VALUES (caller_id, p_question_id, p_quiz_run_id, 'quiz', pts)
    ON CONFLICT (user_id, question_id, quiz_run_id) DO NOTHING;

    GET DIAGNOSTICS affected = ROW_COUNT;

    -- Only increment total_score if this was a genuinely new score event
    IF affected > 0 THEN
      UPDATE user_stats
      SET total_score = total_score + pts,
          updated_at  = now()
      WHERE user_id = caller_id;
    END IF;
  END IF;

  RETURN result;
END;
$$;
