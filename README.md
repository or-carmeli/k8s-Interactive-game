# ☸️ KubeQuest

**A Kubernetes learning and interview practice game for DevOps engineers.**

Practice real-world Kubernetes scenarios, sharpen your troubleshooting skills, and prepare for CKA-level interviews — through interactive quizzes, incident simulations, and daily challenges.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-kubequest.online-00D4FF?style=flat-square&logo=vercel)](https://www.kubequest.online/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)

---

## Live Demo

[kubequest.online](https://www.kubequest.online/) — no registration required, works instantly in guest mode.

---

## Demo

![KubeQuest Demo](public/demo.gif)

## Screenshots

![KubeQuest preview](public/preview.png)

---

## How It Works

1. **Pick a topic** — Workloads, Networking, Config & Security, Storage & Helm, or Troubleshooting
2. **Choose a difficulty** — Easy, Medium, or Hard (levels unlock as you progress)
3. **Answer questions** — multiple choice with instant feedback and detailed explanations
4. **Practice incidents** — step through multi-step real-world failure scenarios (CrashLoopBackOff, ImagePullBackOff, misconfigured NetworkPolicy, and more)
5. **Track your progress** — score, accuracy, streaks, weak areas, and achievements

---

## Features

- **🚨 Incident Mode** — multi-step Kubernetes failure scenarios with step-by-step diagnosis and scoring
- **🧠 Topic Quizzes** — 5 topics × 3 difficulty levels, progressively unlocked
- **🔥 Daily Challenge** — 5 fresh questions every day
- **🎲 Mixed Quiz** — random questions across all topics
- **🎯 Interview Mode** — mandatory timer, hints disabled, exam pressure
- **📖 Kubernetes Guide** — built-in cheatsheet for quick lookup while practicing
- **🗺️ Roadmap View** — visual learning path through all topics and levels
- **📉 Weak Area Card** — surfaces your lowest-accuracy topic automatically
- **↩️ Quiz Resume** — continue where you left off after refresh or navigation
- **🏆 Leaderboard** — global top scores
- **🏅 Achievements** — milestone-based reward system
- **🌐 Hebrew / English** — full bilingual support with RTL layout
- **👤 Guest Mode** — no account needed; sign up to sync progress across devices

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | [React 18](https://react.dev) + [Vite 5](https://vitejs.dev) |
| Auth & Database | [Supabase](https://supabase.com) (PostgreSQL + Auth) |
| Deployment | Vercel |

---

## Local Development

### Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) account _(optional — guest mode works without it)_

### Setup

```bash
git clone https://github.com/or-carmeli/KubeQuest.git
cd KubeQuest
npm install
cp .env.example .env   # add your Supabase credentials
npm run dev            # → http://localhost:5173
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

> Auth, leaderboard, and cross-device sync require a Supabase project. All other features work without credentials.

### Available Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run preview  # preview production build locally
```

---

## Supabase Setup

Create a `user_stats` table:

| Column | Type |
|--------|------|
| `user_id` | `uuid` — unique, references `auth.users` |
| `username` | `text` |
| `total_answered` | `int4` |
| `total_correct` | `int4` |
| `total_score` | `int4` |
| `max_streak` | `int4` |
| `current_streak` | `int4` |
| `completed_topics` | `jsonb` |
| `achievements` | `jsonb` |
| `topic_stats` | `jsonb` |
| `updated_at` | `timestamptz` |

Enable Row Level Security:

```sql
create policy "Users can manage own stats"
on public.user_stats
for all
to public
using (auth.uid() = user_id);
```

---

## Project Structure

```
src/
  App.jsx              # Main application (UI + state)
  topics.js            # Quiz questions by topic and level
  incidents.js         # Incident Mode scenarios
  dailyQuestions.js    # Daily Challenge question pool
  components/
    RoadmapView.jsx
    WeakAreaCard.jsx
  utils/
    quizPersistence.js # localStorage helpers for quiz resume
```

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full release history.

---

## Contributing

Contributions are welcome — new questions, bug fixes, UI improvements.
See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions and question format guidelines.

---

## License

[MIT](LICENSE) © 2026 Or Carmeli
