-- ── Add best_score column ────────────────────────────────────────────────────
-- Scoring model change: total_score is now accumulated (permanent, monotonic).
-- best_score tracks the canonical best-topic score separately.
-- Leaderboard can rank by either field.

ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS best_score BIGINT DEFAULT 0;

-- Backfill best_score from completed_topics for all existing users
UPDATE user_stats us
SET best_score = COALESCE(
  (SELECT SUM(
    GREATEST((entry.value->>'correct')::INT, 0) *
    CASE reverse(split_part(reverse(entry.key), '_', 1))
      WHEN 'easy'   THEN 10
      WHEN 'medium' THEN 20
      WHEN 'hard'   THEN 30
      ELSE 0
    END
  )
  FROM jsonb_each(us.completed_topics) AS entry
  WHERE regexp_replace(entry.key, '_[^_]+$', '') NOT IN ('mixed', 'daily', 'bookmarks')
  ), 0
);
