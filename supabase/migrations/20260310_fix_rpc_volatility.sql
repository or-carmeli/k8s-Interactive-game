-- Fix: check_* functions must be VOLATILE (not STABLE) because they INSERT into answer_check_log.
-- PostgREST runs STABLE functions in read-only transactions, causing the INSERT to fail.

CREATE OR REPLACE FUNCTION check_quiz_answer(p_question_id INT, p_selected SMALLINT)
RETURNS JSON
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
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
  FROM quiz_questions
  WHERE id = p_question_id;

  IF result IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION check_daily_answer(p_question_id INT, p_selected SMALLINT)
RETURNS JSON
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
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

CREATE OR REPLACE FUNCTION check_incident_answer(p_step_id INT, p_selected SMALLINT)
RETURNS JSON
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
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
