# ☸️ KubeQuest

**A Kubernetes learning and interview practice game for DevOps engineers.**

Practice real-world Kubernetes scenarios, sharpen your troubleshooting skills, and prepare for CKA-level interviews — through interactive quizzes, incident simulations, and daily challenges.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-kubequest.online-00D4FF?style=flat-square&logo=vercel)](https://www.kubequest.online/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/or-carmeli/KubeQuest/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/or-carmeli/KubeQuest/actions/workflows/ci.yml)
[![Security](https://img.shields.io/github/actions/workflow/status/or-carmeli/KubeQuest/security.yml?branch=main&style=flat-square&label=security)](https://github.com/or-carmeli/KubeQuest/actions/workflows/security.yml)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Docker](https://img.shields.io/badge/Docker-ghcr.io-2496ED?style=flat-square&logo=docker)](https://github.com/or-carmeli/KubeQuest/pkgs/container/kubequest)

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

## Architecture

### CI/CD Pipeline

```mermaid
flowchart LR
    DEV(["👩‍💻 Developer"])

    subgraph GH["GitHub"]
        REPO[("main / dev / feat/*")]
        CI["CI\nBuild Check"]
        DOCK["Docker\nBuild & Push"]
        SEC["Security Scan\nnpm audit · Trivy · CodeQL"]
        BOT["Dependabot\nweekly updates"]
    end

    GHCR["📦 GHCR\nghcr.io/or-carmeli/kubequest"]
    VERCEL["🚀 Vercel\nAuto Deploy"]

    DEV -->|git push| REPO
    REPO -->|on PR| CI
    REPO -->|push to main| DOCK
    REPO -->|push to main| SEC
    REPO -->|push to main| VERCEL
    BOT -.->|opens PRs| REPO
    DOCK --> GHCR
```

### Runtime Architecture

```mermaid
flowchart TD
    USER(["👤 User"])

    subgraph VERCEL["Vercel Edge Network"]
        SPA["React SPA"]
    end

    subgraph SB["Supabase"]
        AUTH["Auth Service"]
        DB[("PostgreSQL")]
    end

    subgraph K8S["Kubernetes — Optional"]
        ING["Ingress + TLS"] --> SVC["ClusterIP Service"] --> PODS["Pods ×2-10"]
        HPA["HPA"] -.->|autoscales| PODS
    end

    GHCR["📦 GHCR"] -.->|kubectl apply| K8S

    USER -->|HTTPS| SPA
    SPA -->|auth| AUTH
    SPA -->|read / write| DB
```

> **Production** runs on Vercel + Supabase. The `k8s/` manifests and Docker image on GHCR enable self-hosting on any Kubernetes cluster.

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

### Docker

KubeQuest is a **Single Page Application (SPA)** — React handles all navigation client-side from a single `index.html` file. The web server must serve `index.html` for every URL so React can take over routing.

The Dockerfile uses a **multi-stage build** to keep the production image small and clean:

```
Stage 1 — Builder  (node:20-alpine)
  npm ci              → install dependencies
  npm run build       → compile React source → static HTML/CSS/JS in /dist

Stage 2 — Runner   (nginx:alpine)
  copies /dist        → only the built output (no Node.js, no source code)
  serves via nginx    → fast, lightweight web server with SPA routing
```

Final image size: ~25MB (vs ~500MB if Node.js were included).

```bash
docker build -t kubequest .
docker run -p 8080:80 kubequest
# → http://localhost:8080
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

## Kubernetes Deployment

The `k8s/` directory contains production-ready manifests to deploy KubeQuest on any Kubernetes cluster.

```
k8s/
  namespace.yaml    # Isolated namespace: kubequest
  deployment.yaml   # 2 replicas, resource limits, liveness & readiness probes
  service.yaml      # ClusterIP service (internal traffic only)
  ingress.yaml      # Nginx Ingress with TLS via cert-manager + HTTP→HTTPS redirect
  hpa.yaml          # HorizontalPodAutoscaler: scale 2→10 pods at 70% CPU
```

```bash
# Deploy to a cluster
kubectl apply -f k8s/
```

> Requires: nginx ingress controller + cert-manager installed in the cluster.

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
