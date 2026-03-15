-- ── Show all incidents (no limit) ─────────────────────────────────────────────
-- The previous get_incidents RPC capped results at 50, hiding older incidents.
-- This new RPC returns every incident, active first, then resolved by date.

CREATE OR REPLACE FUNCTION get_all_incidents()
RETURNS SETOF system_incidents
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT * FROM system_incidents
  ORDER BY
    CASE WHEN status != 'resolved' THEN 0 ELSE 1 END,
    started_at DESC;
$$;
