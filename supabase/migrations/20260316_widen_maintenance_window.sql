-- Widen the maintenance window RPC from 7 days to 30 days lookahead
CREATE OR REPLACE FUNCTION get_active_maintenance()
RETURNS SETOF maintenance_windows
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT * FROM maintenance_windows
  WHERE ends_at > now()
    AND starts_at < now() + INTERVAL '30 days'
  ORDER BY starts_at ASC;
$$;
