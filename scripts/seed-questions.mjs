#!/usr/bin/env node
// ── Seed Script ─────────────────────────────────────────────────────────────
// Reads the current content JS files and inserts into Supabase tables.
//
// Prerequisites:
//   1. Run the SQL migration first (supabase/migrations/20260307_quiz_content.sql)
//   2. Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY env vars
//      (use the SERVICE ROLE key, not the anon key, to bypass RLS)
//
// Usage:
//   node scripts/seed-questions.mjs

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY; // service role key!

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_KEY env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Load content from JS files ──────────────────────────────────────────────
const { TOPICS } = await import("../src/content/topics.js");
const { DAILY_QUESTIONS } = await import("../src/content/dailyQuestions.js");
const { INCIDENTS } = await import("../src/content/incidents.js");

// ── Seed quiz questions + theories ──────────────────────────────────────────
console.log("Seeding quiz questions and theories...");

const questionRows = [];
const theoryRows = [];

for (const topic of TOPICS) {
  for (const [level, data] of Object.entries(topic.levels)) {
    // Hebrew questions
    if (data.questions) {
      for (const q of data.questions) {
        questionRows.push({
          topic_id: topic.id,
          level,
          lang: "he",
          q: q.q,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
        });
      }
    }
    // English questions
    if (data.questionsEn) {
      for (const q of data.questionsEn) {
        questionRows.push({
          topic_id: topic.id,
          level,
          lang: "en",
          q: q.q,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
        });
      }
    }
    // Theory
    if (data.theory) {
      theoryRows.push({ topic_id: topic.id, level, lang: "he", content: data.theory });
    }
    if (data.theoryEn) {
      theoryRows.push({ topic_id: topic.id, level, lang: "en", content: data.theoryEn });
    }
  }
}

// Insert in batches of 100
for (let i = 0; i < questionRows.length; i += 100) {
  const batch = questionRows.slice(i, i + 100);
  const { error } = await supabase.from("quiz_questions").insert(batch);
  if (error) { console.error("Error inserting questions batch:", error); process.exit(1); }
  console.log(`  Questions: ${Math.min(i + 100, questionRows.length)}/${questionRows.length}`);
}

if (theoryRows.length > 0) {
  const { error } = await supabase.from("quiz_theories").insert(theoryRows);
  if (error) { console.error("Error inserting theories:", error); process.exit(1); }
  console.log(`  Theories: ${theoryRows.length}`);
}

// ── Seed daily questions ────────────────────────────────────────────────────
console.log("Seeding daily questions...");

const dailyRows = [];
for (const [lang, questions] of Object.entries(DAILY_QUESTIONS)) {
  for (const q of questions) {
    dailyRows.push({
      lang,
      q: q.q,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
    });
  }
}

for (let i = 0; i < dailyRows.length; i += 100) {
  const batch = dailyRows.slice(i, i + 100);
  const { error } = await supabase.from("daily_questions").insert(batch);
  if (error) { console.error("Error inserting daily questions:", error); process.exit(1); }
  console.log(`  Daily: ${Math.min(i + 100, dailyRows.length)}/${dailyRows.length}`);
}

// ── Seed incidents ──────────────────────────────────────────────────────────
console.log("Seeding incidents...");

for (const incident of INCIDENTS) {
  const { error: incError } = await supabase.from("incidents").insert({
    id: incident.id,
    icon: incident.icon,
    title: incident.title,
    title_he: incident.titleHe,
    description: incident.description,
    description_he: incident.descriptionHe,
    difficulty: incident.difficulty,
    estimated_time: incident.estimatedTime,
  });
  if (incError) { console.error("Error inserting incident:", incError); process.exit(1); }

  const stepRows = incident.steps.map((step, idx) => ({
    incident_id: incident.id,
    step_order: idx,
    prompt: step.prompt,
    prompt_he: step.promptHe,
    options: step.options,
    options_he: step.optionsHe,
    answer: step.answer,
    explanation: step.explanation,
    explanation_he: step.explanationHe,
  }));

  const { error: stepError } = await supabase.from("incident_steps").insert(stepRows);
  if (stepError) { console.error("Error inserting incident steps:", stepError); process.exit(1); }
  console.log(`  Incident "${incident.id}": ${stepRows.length} steps`);
}

console.log("\nDone! Seeded:");
console.log(`  ${questionRows.length} quiz questions`);
console.log(`  ${theoryRows.length} theory snippets`);
console.log(`  ${dailyRows.length} daily questions`);
console.log(`  ${INCIDENTS.length} incidents`);
