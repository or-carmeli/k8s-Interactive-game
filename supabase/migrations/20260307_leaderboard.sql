-- ── Leaderboard RPCs ──────────────────────────────────────────────────────────
-- Secure leaderboard access via SECURITY DEFINER functions.
-- No direct SELECT on user_stats is needed — these RPCs bypass RLS.

-- Top N players for the leaderboard modal
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

-- Current user's rank (1-indexed) + score
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

-- ── RLS policies for user_stats ──────────────────────────────────────────────
-- Ensure RLS is enabled (idempotent)
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Users can read only their own row
CREATE POLICY "users_read_own_stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own row
CREATE POLICY "users_insert_own_stats"
  ON user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update only their own row
CREATE POLICY "users_update_own_stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- No DELETE policy — users cannot delete their stats
