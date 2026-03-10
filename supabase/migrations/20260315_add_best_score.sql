-- ── Add best_score column ────────────────────────────────────────────────────
-- Scoring model (current):
--   total_score = accumulated per correct answer, never decreases, user-visible.
--                 Used for leaderboard ranking (get_leaderboard ORDER BY total_score DESC).
--   best_score  = canonical best-topic metric, derived from completed_topics JSONB.
--                 Internal only — never shown in UI, never used for ranking.
--                 Exists as a tamper-proof audit baseline.
--
-- ⚠  Do NOT use best_score for leaderboard or user-facing display.
-- ⚠  Do NOT derive total_score from completed_topics — it is purely accumulated.

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
