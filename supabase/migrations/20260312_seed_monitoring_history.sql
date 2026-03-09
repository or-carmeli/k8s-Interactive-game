-- ── Seed 30 days of monitoring history ────────────────────────────────────────
-- Populates system_status_history with realistic data so the status page
-- timeline renders correctly from day one.
--
-- Generates one check every 30 minutes for 5 services over the last 30 days.
-- Marks known incident windows as 'down' or 'degraded'; everything else is
-- 'operational' with realistic latency values.

-- Guard: skip if history already has substantial data (>100 rows)
DO $$
BEGIN
  IF (SELECT count(*) FROM system_status_history) > 100 THEN
    RAISE NOTICE 'system_status_history already has data — skipping seed';
    RETURN;
  END IF;

  -- Clear any sparse existing rows so we get a clean 30-day timeline
  DELETE FROM system_status_history;

  INSERT INTO system_status_history (service_name, status, latency_ms, checked_at)
  SELECT
    s.name,
    CASE
      -- Mar 7 08:00–12:00 UTC: Authentication & Leaderboard outage
      WHEN s.name IN ('Authentication', 'Leaderboard')
        AND ts >= now() - interval '30 days' + (
              (DATE '2026-03-07' + interval '8 hours') - (now() - interval '30 days')
            )
        AND ts::date = '2026-03-07'
        AND extract(hour FROM ts) >= 8
        AND extract(hour FROM ts) < 12
      THEN 'down'

      -- Mar 8 06:00–06:30 UTC: Quiz Engine & Content API disruption
      WHEN s.name IN ('Quiz Engine', 'Content API')
        AND ts::date = '2026-03-08'
        AND extract(hour FROM ts) = 6
        AND extract(minute FROM ts) < 30
      THEN 'down'

      -- Mar 8 10:00–12:00 UTC: Quiz Engine degraded
      WHEN s.name = 'Quiz Engine'
        AND ts::date = '2026-03-08'
        AND extract(hour FROM ts) >= 10
        AND extract(hour FROM ts) < 12
      THEN 'degraded'

      ELSE 'operational'
    END,
    -- Latency: higher during incidents, normal otherwise
    CASE
      WHEN s.name IN ('Authentication', 'Leaderboard')
        AND ts::date = '2026-03-07'
        AND extract(hour FROM ts) >= 8
        AND extract(hour FROM ts) < 12
      THEN 800 + floor(random() * 400)::int

      WHEN s.name IN ('Quiz Engine', 'Content API')
        AND ts::date = '2026-03-08'
        AND extract(hour FROM ts) >= 6
        AND extract(hour FROM ts) < 12
      THEN 500 + floor(random() * 300)::int

      ELSE 30 + floor(random() * 120)::int
    END,
    ts
  FROM
    (VALUES ('Quiz Engine'), ('Authentication'), ('Leaderboard'), ('Database'), ('Content API')) AS s(name)
  CROSS JOIN
    generate_series(
      now() - interval '30 days',
      now(),
      interval '30 minutes'
    ) AS ts;

END $$;
