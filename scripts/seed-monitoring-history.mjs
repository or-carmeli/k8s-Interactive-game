#!/usr/bin/env node
// Seeds 30 days of system_status_history via Supabase API.
// Usage: VITE_SUPABASE_URL=... VITE_SUPABASE_SERVICE_KEY=... node scripts/seed-monitoring-history.mjs

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Check if already seeded
const { count } = await supabase.from("system_status_history").select("*", { count: "exact", head: true });
if (count > 100) {
  console.log(`Already has ${count} rows — skipping seed.`);
  process.exit(0);
}

// Clear sparse existing rows
await supabase.from("system_status_history").delete().neq("id", 0);
console.log("Cleared existing history rows.");

const services = ["Quiz Engine", "Authentication", "Leaderboard", "Database", "Content API"];
const now = Date.now();
const rows = [];

for (const svc of services) {
  for (let i = 30 * 48; i >= 0; i--) {
    const ts = new Date(now - i * 30 * 60 * 1000); // every 30 min
    const day = ts.toISOString().slice(0, 10);
    const hour = ts.getUTCHours();
    const min = ts.getUTCMinutes();

    let status = "operational";
    let latency = 30 + Math.floor(Math.random() * 120);

    // Mar 7 08:00–12:00 UTC: Auth & Leaderboard outage
    if ((svc === "Authentication" || svc === "Leaderboard") && day === "2026-03-07" && hour >= 8 && hour < 12) {
      status = "down";
      latency = 800 + Math.floor(Math.random() * 400);
    }
    // Mar 8 06:00–06:30 UTC: Quiz Engine & Content API down
    if ((svc === "Quiz Engine" || svc === "Content API") && day === "2026-03-08" && hour === 6 && min < 30) {
      status = "down";
      latency = 500 + Math.floor(Math.random() * 300);
    }
    // Mar 8 10:00–12:00 UTC: Quiz Engine degraded
    if (svc === "Quiz Engine" && day === "2026-03-08" && hour >= 10 && hour < 12) {
      status = "degraded";
      latency = 500 + Math.floor(Math.random() * 300);
    }

    rows.push({ service_name: svc, status, latency_ms: latency, checked_at: ts.toISOString() });
  }
}

console.log(`Inserting ${rows.length} rows...`);

// Insert in batches of 500
for (let i = 0; i < rows.length; i += 500) {
  const batch = rows.slice(i, i + 500);
  const { error } = await supabase.from("system_status_history").insert(batch);
  if (error) { console.error("Insert error:", error); process.exit(1); }
  console.log(`  ${Math.min(i + 500, rows.length)}/${rows.length}`);
}

console.log("Done! 30 days of monitoring history seeded.");
