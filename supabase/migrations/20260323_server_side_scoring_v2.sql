-- ── Server-side scoring v2 ────────────────────────────────────────────────────
-- Re-applies server-authoritative scoring after 20260320 reverted the first
-- attempt. The original 20260318 migration created function OVERLOADS
-- (4-param alongside existing 2-param) which caused PostgREST to fail
-- with "could not choose a best candidate function" errors.
--
-- Fix: DROP the old 2-param functions first, then CREATE replacements with
-- DEFAULT NULL params. This ensures only ONE function per name exists.
--
-- Includes the level-trust fix from 20260319: points are always derived
-- from the question's DB level, never from client-provided p_level.

-- ── 1. Score events table ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS score_events (
  id          SERIAL PRIMARY KEY,
  user_id     UUID NOT NULL,
  question_id INT NOT NULL,
  quiz_run_id TEXT NOT NULL,
  source      TEXT NOT NULL DEFAULT 'quiz',
  points      SMALLINT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id, quiz_run_id)
);

CREATE INDEX IF NOT EXISTS idx_se_user ON score_events (user_id);

ALTER TABLE score_events ENABLE ROW LEVEL SECURITY;

-- ── 2. Replace check_quiz_answer ─────────────────────────────────────────────
-- DROP the old 2-param version first to avoid PostgREST overload ambiguity.

DROP FUNCTION IF EXISTS check_quiz_answer(INT, SMALLINT);

CREATE OR REPLACE FUNCTION check_quiz_answer(
  p_question_id INT,
  p_selected    SMALLINT,
  p_quiz_run_id TEXT DEFAULT NULL
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

  result := json_build_object(
    'correct', is_correct,
    'correct_answer', q_answer,
    'explanation', q_explanation
  );

  -- Server-side scoring: only when quiz_run_id provided and answer correct
  IF is_correct AND p_quiz_run_id IS NOT NULL AND caller_id IS NOT NULL THEN
    -- Points derived entirely from the question's DB level (server-authoritative)
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

-- ── 3. Replace check_daily_answer ────────────────────────────────────────────
-- DROP the old 2-param version first to avoid PostgREST overload ambiguity.

DROP FUNCTION IF EXISTS check_daily_answer(INT, SMALLINT);

CREATE OR REPLACE FUNCTION check_daily_answer(
  p_question_id INT,
  p_selected    SMALLINT,
  p_quiz_run_id TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
AS $$
DECLARE
  result      JSON;
  check_count INT;
  caller_id   UUID;
  q_answer    SMALLINT;
  q_explanation TEXT;
  is_correct  BOOLEAN;
  affected    INT := 0;
BEGIN
  caller_id := auth.uid();

  SELECT COUNT(*) INTO check_count
  FROM answer_check_log
  WHERE user_id = caller_id AND checked_at > now() - interval '1 minute';

  IF check_count > 120 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please slow down.';
  END IF;

  INSERT INTO answer_check_log (user_id) VALUES (caller_id);

  SELECT answer, explanation
  INTO q_answer, q_explanation
  FROM daily_questions
  WHERE id = p_question_id;

  IF q_answer IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  is_correct := (q_answer = p_selected);

  result := json_build_object(
    'correct', is_correct,
    'correct_answer', q_answer,
    'explanation', q_explanation
  );

  -- Server-side scoring: daily = 15 points always
  IF is_correct AND p_quiz_run_id IS NOT NULL AND caller_id IS NOT NULL THEN
    INSERT INTO score_events (user_id, question_id, quiz_run_id, source, points)
    VALUES (caller_id, p_question_id, p_quiz_run_id, 'daily', 15::SMALLINT)
    ON CONFLICT (user_id, question_id, quiz_run_id) DO NOTHING;

    GET DIAGNOSTICS affected = ROW_COUNT;

    IF affected > 0 THEN
      UPDATE user_stats
      SET total_score = total_score + 15,
          updated_at  = now()
      WHERE user_id = caller_id;
    END IF;
  END IF;

  RETURN result;
END;
$$;

-- ── 4. save_user_progress RPC ────────────────────────────────────────────────
-- Does NOT accept total_score - the server owns it via score_events.

CREATE OR REPLACE FUNCTION save_user_progress(
  p_username         TEXT,
  p_best_score       BIGINT,
  p_total_answered   INT,
  p_total_correct    INT,
  p_max_streak       INT,
  p_current_streak   INT,
  p_completed_topics JSONB,
  p_achievements     TEXT[],
  p_topic_stats      JSONB
)
RETURNS VOID
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
AS $$
DECLARE
  caller_id UUID;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE user_stats SET
    username         = p_username,
    best_score       = p_best_score,
    total_answered   = GREATEST(total_answered, p_total_answered),
    total_correct    = GREATEST(total_correct,  p_total_correct),
    max_streak       = GREATEST(max_streak,     p_max_streak),
    current_streak   = p_current_streak,
    completed_topics = p_completed_topics,
    achievements     = p_achievements,
    topic_stats      = p_topic_stats,
    updated_at       = now()
  WHERE user_id = caller_id;
END;
$$;
