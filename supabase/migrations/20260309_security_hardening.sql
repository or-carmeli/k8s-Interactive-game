-- ── Security Hardening ──────────────────────────────────────────────────────
-- 1. Rate-limit answer-check RPCs to prevent answer enumeration
-- 2. Clamp p_limit on query RPCs to prevent unbounded result sets

-- ── Answer check rate limiting ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS answer_check_log (
  id          SERIAL PRIMARY KEY,
  user_id     UUID,
  checked_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_acl_user_time ON answer_check_log (user_id, checked_at);

-- Auto-clean old entries (older than 1 hour)
CREATE OR REPLACE FUNCTION clean_old_answer_checks() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM answer_check_log WHERE checked_at < now() - interval '1 hour';
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_clean_answer_checks
  AFTER INSERT ON answer_check_log
  FOR EACH STATEMENT
  EXECUTE FUNCTION clean_old_answer_checks();

-- ── Replace check_quiz_answer with rate-limited version ────────────────────

CREATE OR REPLACE FUNCTION check_quiz_answer(p_question_id INT, p_selected SMALLINT)
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  check_count INT;
  caller_id UUID;
BEGIN
  caller_id := auth.uid();

  -- Rate limit: max 120 checks per minute per user (generous for normal play)
  SELECT COUNT(*) INTO check_count
  FROM answer_check_log
  WHERE user_id = caller_id AND checked_at > now() - interval '1 minute';

  IF check_count > 120 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please slow down.';
  END IF;

  -- Log this check
  INSERT INTO answer_check_log (user_id) VALUES (caller_id);

  SELECT json_build_object(
    'correct', (answer = p_selected),
    'correct_answer', answer,
    'explanation', explanation
  ) INTO result
  FROM quiz_questions
  WHERE id = p_question_id;

  IF result IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  RETURN result;
END;
$$;

-- ── Replace check_daily_answer with rate-limited version ───────────────────

CREATE OR REPLACE FUNCTION check_daily_answer(p_question_id INT, p_selected SMALLINT)
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  check_count INT;
  caller_id UUID;
BEGIN
  caller_id := auth.uid();

  SELECT COUNT(*) INTO check_count
  FROM answer_check_log
  WHERE user_id = caller_id AND checked_at > now() - interval '1 minute';

  IF check_count > 120 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please slow down.';
  END IF;

  INSERT INTO answer_check_log (user_id) VALUES (caller_id);

  SELECT json_build_object(
    'correct', (answer = p_selected),
    'correct_answer', answer,
    'explanation', explanation
  ) INTO result
  FROM daily_questions
  WHERE id = p_question_id;

  IF result IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  RETURN result;
END;
$$;

-- ── Replace check_incident_answer with rate-limited version ────────────────

CREATE OR REPLACE FUNCTION check_incident_answer(p_step_id INT, p_selected SMALLINT)
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  check_count INT;
  caller_id UUID;
BEGIN
  caller_id := auth.uid();

  SELECT COUNT(*) INTO check_count
  FROM answer_check_log
  WHERE user_id = caller_id AND checked_at > now() - interval '1 minute';

  IF check_count > 120 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please slow down.';
  END IF;

  INSERT INTO answer_check_log (user_id) VALUES (caller_id);

  SELECT json_build_object(
    'correct', (answer = p_selected),
    'correct_answer', answer,
    'explanation', explanation,
    'explanation_he', explanation_he
  ) INTO result
  FROM incident_steps
  WHERE id = p_step_id;

  IF result IS NULL THEN
    RAISE EXCEPTION 'Step not found';
  END IF;

  RETURN result;
END;
$$;

-- ── Clamp p_limit on query RPCs ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_mixed_questions(p_lang TEXT, p_limit INT DEFAULT 10)
RETURNS TABLE(id INT, q TEXT, options JSONB)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT id, q, options
  FROM quiz_questions
  WHERE lang = p_lang
  ORDER BY random()
  LIMIT LEAST(GREATEST(p_limit, 1), 50);
$$;

CREATE OR REPLACE FUNCTION get_daily_questions(p_lang TEXT, p_limit INT DEFAULT 10)
RETURNS TABLE(id INT, q TEXT, options JSONB)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT id, q, options
  FROM daily_questions
  WHERE lang = p_lang
  ORDER BY md5(id::TEXT || CURRENT_DATE::TEXT)
  LIMIT LEAST(GREATEST(p_limit, 1), 50);
$$;
