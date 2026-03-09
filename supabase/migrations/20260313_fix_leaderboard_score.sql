-- ── Fix: Leaderboard must use total_score, not total_correct ────────────────
--
-- Root cause: The live get_leaderboard function was returning total_correct
-- aliased as "score", while the game UI uses user_stats.total_score as the
-- actual game score. This caused the leaderboard to show "number of correct
-- answers" instead of the real score, and column-name mismatches with the
-- frontend (which expects "total_score", not "score").
--
-- This migration re-applies the correct definitions from 20260308 to ensure
-- the live database matches the codebase. Both functions use CREATE OR REPLACE
-- so this is safe to run even if the correct version already exists.

-- Top N players — returns total_score (game score), not total_correct
CREATE OR REPLACE FUNCTION get_leaderboard(p_limit INT DEFAULT 10)
RETURNS TABLE(username TEXT, total_score BIGINT, max_streak INT)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    COALESCE(us.username, '') AS username,
    COALESCE(us.total_score, 0)::BIGINT AS total_score,
    COALESCE(us.max_streak, 0)::INT AS max_streak
  FROM user_stats us
  WHERE us.total_score > 0
  ORDER BY us.total_score DESC
  LIMIT p_limit;
$$;

-- Current user's rank — score is total_score, not total_correct
CREATE OR REPLACE FUNCTION get_user_rank(p_user_id UUID)
RETURNS JSON
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'rank',  COALESCE((SELECT COUNT(*) + 1 FROM user_stats WHERE total_score > (
                SELECT COALESCE(total_score, 0) FROM user_stats WHERE user_id = p_user_id
              )), 1),
    'score', COALESCE((SELECT total_score FROM user_stats WHERE user_id = p_user_id), 0)
  );
$$;
