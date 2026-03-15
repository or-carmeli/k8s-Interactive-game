-- ── Return level in mixed questions ──────────────────────────────────────────
-- After 20260319 removed client trust for p_level, the server scores mixed
-- questions by their intrinsic DB level (easy=10, medium=20, hard=30) instead
-- of the old flat 15. The client needs the level field to compute matching
-- local display points. This is metadata only - no scoring logic changes.

-- DROP first: CREATE OR REPLACE cannot change return type of existing function
DROP FUNCTION IF EXISTS get_mixed_questions(TEXT, INT);

CREATE OR REPLACE FUNCTION get_mixed_questions(p_lang TEXT, p_limit INT DEFAULT 10)
RETURNS TABLE(id INT, q TEXT, options JSONB, level TEXT)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT id, q, options, level
  FROM quiz_questions
  WHERE lang = p_lang
  ORDER BY random()
  LIMIT LEAST(GREATEST(p_limit, 1), 50);
$$;
