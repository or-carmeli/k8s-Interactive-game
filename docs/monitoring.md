# System Status Monitoring

KubeQuest includes a real-time monitoring system that tracks service health, uptime history, and incidents — all powered by Supabase.

## Architecture

```
pg_cron (every 60s)
    |
    v
Supabase Edge Function (health-check)
    |
    |-- Database:       SELECT on user_stats
    |-- Content API:    get_mixed_questions RPC
    |-- Quiz Engine:    check_quiz_answer RPC
    |-- Leaderboard:    get_leaderboard RPC
    |-- Authentication: GoTrue /auth/v1/health
    |
    v
Writes to PostgreSQL
    |
    |-- system_status_current   (latest status per service)
    |-- system_status_history   (append-only log for uptime)
    |-- system_incidents        (auto-detected + manual)
    |
    v
Frontend polls every 30s --> renders live status page
```

## Database Schema

### `system_status_current`

One row per service, upserted on each health check.

| Column | Type | Description |
|--------|------|-------------|
| `service_name` | `TEXT` (PK) | Service identifier |
| `status` | `TEXT` | `operational`, `degraded`, `down`, or `maintenance` |
| `latency_ms` | `INT` | Response time of the health check |
| `last_checked` | `TIMESTAMPTZ` | When the last check ran |
| `details` | `JSONB` | Additional context (row counts, versions, errors) |

### `system_status_history`

Append-only log — one row per service per check. Used to compute daily uptime percentages.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `SERIAL` (PK) | Auto-increment |
| `service_name` | `TEXT` | Service identifier |
| `status` | `TEXT` | Status at time of check |
| `latency_ms` | `INT` | Response time |
| `checked_at` | `TIMESTAMPTZ` | Timestamp of check |

### `system_incidents`

Stores incidents — created automatically or manually.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `SERIAL` (PK) | Auto-increment |
| `title` | `TEXT` | Incident title |
| `severity` | `TEXT` | `low`, `medium`, `high`, or `critical` |
| `status` | `TEXT` | `investigating`, `identified`, `monitoring`, or `resolved` |
| `started_at` | `TIMESTAMPTZ` | When the incident began |
| `resolved_at` | `TIMESTAMPTZ` | When it was resolved (null if active) |
| `affected_services` | `TEXT[]` | Array of affected service names |
| `impact` | `TEXT` | User-facing impact description |
| `root_cause` | `TEXT` | Technical root cause |
| `resolution` | `TEXT` | How it was fixed |
| `prevention` | `TEXT` | Steps to prevent recurrence |

## RPC Functions

### Read (STABLE) — called by the frontend

| Function | Returns | Description |
|----------|---------|-------------|
| `get_system_status()` | `SETOF system_status_current` | Current status of all services |
| `get_uptime_history(p_days)` | `TABLE(service_name, day, total_checks, ok_checks, uptime_pct)` | Daily uptime aggregation |
| `get_incidents(p_limit)` | `SETOF system_incidents` | Active incidents first, then recent resolved |

### Write (VOLATILE) — called by the Edge Function

| Function | Returns | Description |
|----------|---------|-------------|
| `upsert_service_status(...)` | `VOID` | Upserts current status + appends to history |
| `manage_incident(...)` | `INT` | Creates or updates an incident, returns ID |
| `purge_old_status_history(p_days)` | `INT` | Deletes history older than N days (default 90) |

## Health Check Edge Function

**Location:** `supabase/functions/health-check/index.ts`

Each check validates the **actual production path** used by the app:

| Service | Check Method | Success Criteria |
|---------|-------------|-----------------|
| Database | `SELECT` on `user_stats` table | Query completes without error |
| Content API | `get_mixed_questions` RPC (1 question, English) | Returns at least 1 question |
| Quiz Engine | `check_quiz_answer` with invalid ID (-1) | Returns "Question not found" error (proves RPC is running) |
| Leaderboard | `get_leaderboard` RPC (1 entry) | Query completes without error |
| Authentication | `GET /auth/v1/health` on GoTrue | HTTP 200 response |

### Status determination

- **operational** — check passed, latency < 2000ms
- **degraded** — check passed, latency > 2000ms
- **down** — check threw an error or failed

### Auto-incident detection

If a service has **3 consecutive "down"** entries in `system_status_history`, the function automatically creates an incident in `system_incidents` with severity "high" and status "investigating".

## Cron Scheduling

The health check runs every 60 seconds via `pg_cron` + `pg_net`:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule (run in Supabase SQL Editor — not in a migration file)
SELECT cron.schedule(
  'health-check-worker',
  '* * * * *',
  $$
  SELECT net.http_post(
    url    := 'https://<project-ref>.supabase.co/functions/v1/health-check',
    headers := jsonb_build_object(
      'Authorization', 'Bearer <service-role-key>',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

> **Important:** Run this SQL directly in the Supabase SQL Editor — do not put the service role key in a migration file.

### Useful cron queries

```sql
-- List scheduled jobs
SELECT * FROM cron.job;

-- Check recent executions
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- Unschedule
SELECT cron.unschedule('health-check-worker');
```

## Frontend

**API layer:** `src/api/monitoring.js` — 3 functions wrapping the read RPCs.

**Status page behavior:**
1. On open: fetches all 3 endpoints in parallel
2. Polls every 30 seconds with `setInterval`
3. Cleans up the interval on navigation away

**Rendered sections:**
- **Global status banner** — derived from service statuses (all operational / degraded / major outage)
- **Service health table** — real status + per-service latency
- **Uptime bars (30 days)** — daily bars from history (>99% green, >90% yellow, <90% red, no data = dim)
- **Performance metrics** — avg latency, max latency, overall uptime %, active incident count
- **Incident history** — dynamically rendered from `system_incidents` with structured post-mortem fields

## Row-Level Security

- All 3 tables have RLS enabled
- **Public read** — the status page is visible to everyone (no auth required)
- **No direct writes** — all writes go through SECURITY DEFINER RPCs (called only by the Edge Function with the service role key)

## Maintenance

### Purge old history

The `system_status_history` table grows by ~5 rows per minute (5 services). To clean up:

```sql
-- Delete entries older than 90 days (returns count of deleted rows)
SELECT purge_old_status_history(90);
```

Consider scheduling this as a weekly cron job:

```sql
SELECT cron.schedule(
  'purge-old-monitoring',
  '0 3 * * 0',  -- every Sunday at 3 AM
  $$ SELECT purge_old_status_history(90); $$
);
```

### Deploy the Edge Function

```bash
supabase functions deploy health-check
```

## Files

```
supabase/
  migrations/
    20260311_monitoring.sql       # Tables, RLS, RPCs, seed data
  functions/
    health-check/
      index.ts                    # Edge Function — 5 real health checks
src/
  api/
    monitoring.js                 # Frontend API layer (3 read functions)
  App.jsx                         # Status page rendering (lines ~3203-3440)
docs/
  monitoring.md                   # This file
```
