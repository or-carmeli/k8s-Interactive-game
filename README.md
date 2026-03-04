# ☸️ KubeQuest

An interactive Kubernetes learning game built with React and Supabase.
Learn Kubernetes concepts through quizzes, earn points, track your progress, and compete on the leaderboard.

🌐 **Live:** [KubeQuest.vercel.app](https://KubeQuest.vercel.app)

---

## Features

- 5 topics: Workloads, Networking, Config & Security, Storage & Helm, Troubleshooting
- 3 difficulty levels per topic: Easy → Medium → Hard (levels unlock progressively)
- 🎲 Mixed Quiz mode — 10 random questions from all topics
- ⏱ Countdown timer per question (toggleable)
- 🏆 Leaderboard with top scores
- 🏅 Achievements system
- 📋 Question review after each quiz
- Guest mode (no registration required) with localStorage progress
- Full auth (sign up / login) via Supabase with progress saved to DB
- Hebrew / English language support (RTL + LTR)
- Fully responsive

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Auth & DB | Supabase (PostgreSQL + Auth) |
| Hosting | Vercel |
| Styling | Inline React styles |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup

Create a `user_stats` table with the following columns:

| Column | Type |
|--------|------|
| `user_id` | `uuid` (unique, references auth.users) |
| `username` | `text` |
| `total_answered` | `int4` |
| `total_correct` | `int4` |
| `total_score` | `int4` |
| `max_streak` | `int4` |
| `current_streak` | `int4` |
| `completed_topics` | `jsonb` |
| `achievements` | `jsonb` |
| `updated_at` | `timestamptz` |

Enable Row Level Security and add a policy:
```sql
create policy "Users can manage own stats"
on public.user_stats
for all
to public
using (auth.uid() = user_id);
```

---

## Topics

| Topic | Levels |
|-------|--------|
| 🚀 Workloads | Pods, Deployments, StatefulSets, DaemonSets, HPA |
| 🌐 Networking | Services, Ingress, Network Policies, DNS |
| 🔐 Config & Security | ConfigMaps, Secrets, RBAC, ServiceAccounts |
| 💾 Storage & Helm | PersistentVolumes, StorageClass, Helm |
| 🔧 Troubleshooting | Debug commands, common errors, real-world scenarios |

---

## License

© 2026 Or Carmeli. All rights reserved.
