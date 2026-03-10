-- ── Fix Inflated total_score Values (HISTORICAL) ────────────────────────────
-- ⚠  NOTE: This migration was a one-time fix applied during early development.
-- The scoring model has since been finalized:
--   total_score = accumulated per correct answer (monotonic, never decreases)
--   best_score  = canonical best-topic metric (internal only, see 20260315)
-- total_score is NO LONGER derived from completed_topics.
-- Do NOT re-run this migration — it would overwrite accumulated scores.
--
-- Original bug: per-answer total_score accumulation double-counted on replays.
-- This migration recalculated total_score from completed_topics as a one-time
-- repair. The subsequent 20260315 migration added best_score as the separate
-- canonical field, allowing total_score to remain purely accumulated.

-- Step 1: Diagnostic — show affected users (run SELECT first to verify)
-- Uncomment the SELECT below to preview changes before applying:
--
-- SELECT
--   us.user_id,
--   us.username,
--   us.total_score AS stored_score,
--   COALESCE(
--     (SELECT SUM(
--       GREATEST((entry.value->>'correct')::INT, 0) *
--       CASE reverse(split_part(reverse(entry.key), '_', 1))
--         WHEN 'easy'   THEN 10
--         WHEN 'medium' THEN 20
--         WHEN 'hard'   THEN 30
--         ELSE 0
--       END
--     )
--     FROM jsonb_each(us.completed_topics) AS entry
--     WHERE regexp_replace(entry.key, '_[^_]+$', '') NOT IN ('mixed', 'daily', 'bookmarks')
--     ), 0
--   ) AS canonical_score,
--   us.total_score - COALESCE(
--     (SELECT SUM(
--       GREATEST((entry.value->>'correct')::INT, 0) *
--       CASE reverse(split_part(reverse(entry.key), '_', 1))
--         WHEN 'easy'   THEN 10
--         WHEN 'medium' THEN 20
--         WHEN 'hard'   THEN 30
--         ELSE 0
--       END
--     )
--     FROM jsonb_each(us.completed_topics) AS entry
--     WHERE regexp_replace(entry.key, '_[^_]+$', '') NOT IN ('mixed', 'daily', 'bookmarks')
--     ), 0
--   ) AS inflation
-- FROM user_stats us
-- WHERE us.total_score != COALESCE(
--     (SELECT SUM(
--       GREATEST((entry.value->>'correct')::INT, 0) *
--       CASE reverse(split_part(reverse(entry.key), '_', 1))
--         WHEN 'easy'   THEN 10
--         WHEN 'medium' THEN 20
--         WHEN 'hard'   THEN 30
--         ELSE 0
--       END
--     )
--     FROM jsonb_each(us.completed_topics) AS entry
--     WHERE regexp_replace(entry.key, '_[^_]+$', '') NOT IN ('mixed', 'daily', 'bookmarks')
--     ), 0
--   )
-- ORDER BY inflation DESC;

-- Step 2: Repair — recalculate total_score from completed_topics for all users
UPDATE user_stats us
SET total_score = COALESCE(
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
),
updated_at = now();
