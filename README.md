# ☸️ KubeQuest

**A Kubernetes learning and interview practice game for DevOps engineers.**

Practice real-world Kubernetes scenarios, sharpen your troubleshooting skills, and prepare for CKA-level interviews - through interactive quizzes, incident simulations, and daily challenges.

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

[kubequest.online](https://www.kubequest.online/) - no registration required, works instantly in guest mode.

---

## Demo

![KubeQuest Demo](public/GIF-Demo-README.gif)

---

## How It Works

1. **Pick a topic** - Workloads, Networking, Config & Security, Storage & Helm, or Troubleshooting
2. **Choose a difficulty** - Easy, Medium, or Hard (levels unlock as you progress)
3. **Answer questions** - multiple choice with instant feedback and detailed explanations
4. **Practice incidents** - step through multi-step real-world failure scenarios (CrashLoopBackOff, ImagePullBackOff, misconfigured NetworkPolicy, and more)
5. **Track your progress** - score, accuracy, streaks, weak areas, and achievements

---

## Features

- **🚨 Incident Mode** - multi-step Kubernetes failure scenarios with step-by-step diagnosis and scoring
- **🧠 Topic Quizzes** - 5 topics × 3 difficulty levels, progressively unlocked
- **🔥 Daily Challenge** - 5 fresh questions every day
- **🎲 Mixed Quiz** - random questions across all topics
- **🎯 Interview Mode** - mandatory timer, hints disabled, exam pressure
- **📖 Kubernetes Guide** - built-in cheatsheet for quick lookup while practicing
- **🗺️ Roadmap View** - visual learning path through all topics and levels
- **📉 Weak Area Card** - surfaces your lowest-accuracy topic automatically
- **↩️ Quiz Resume** - continue where you left off after refresh or navigation
- **🏆 Leaderboard** - global top scores
- **🏅 Achievements** - milestone-based reward system
- **🌐 Hebrew / English** - full bilingual support with RTL layout
- **👤 Guest Mode** - no account needed; sign up to sync progress across devices
- **📊 Real-Time Monitoring** - live system status page with service health checks, uptime history, and incident tracking ([docs](docs/monitoring.md))

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | [React 18](https://react.dev) + [Vite 5](https://vitejs.dev) |
| Auth & Database | [Supabase](https://supabase.com) (PostgreSQL + Auth) |
| Deployment | Vercel |

---

## Architecture

### Runtime

```mermaid
flowchart TB
    USER([User])

    subgraph Frontend["Frontend"]
        SPA["React SPA (Vercel)"]
        PWA["PWA Service Worker<br/>Offline Cache"]
    end

    subgraph Backend["Supabase Backend"]
        AUTH["Authentication"]
        API["API / Data Access"]
        EDGE["Edge Functions<br/>Health Checks"]
    end

    subgraph Database["Database"]
        DB[("PostgreSQL")]
    end

    USER -->|HTTPS| SPA
    SPA --> PWA
    SPA --> AUTH
    SPA --> API
    API --> DB
    EDGE --> AUTH
    EDGE --> API

    style Frontend fill:#111827,stroke:#00D4FF,stroke-width:2px,color:#ffffff
    style Backend fill:#111827,stroke:#A855F7,stroke-width:2px,color:#ffffff
    style Database fill:#111827,stroke:#F59E0B,stroke-width:2px,color:#ffffff
```

### CI/CD Pipeline

```mermaid
flowchart LR
    PUSH["git push"] --> CI["CI Check"] --> BUILD["Build Image"] --> SCAN["Trivy Scan"]
    SCAN --> PUSH_IMG["Push to GHCR"] --> ATTEST["SBOM +<br/>Provenance"] --> SIGN["Cosign Sign"] --> VERIFY["Verify"]
    BOT["Dependabot"] -.->|weekly PRs| CI

    style PUSH fill:#1a1a2e,stroke:#00D4FF,stroke-width:2px,color:#fff
    style CI fill:#1a1a2e,stroke:#A855F7,stroke-width:2px,color:#fff
    style BUILD fill:#1a1a2e,stroke:#A855F7,stroke-width:2px,color:#fff
    style SCAN fill:#1a1a2e,stroke:#EF4444,stroke-width:2px,color:#fff
    style PUSH_IMG fill:#1a1a2e,stroke:#F59E0B,stroke-width:2px,color:#fff
    style ATTEST fill:#1a1a2e,stroke:#F59E0B,stroke-width:2px,color:#fff
    style SIGN fill:#1a1a2e,stroke:#10B981,stroke-width:2px,color:#fff
    style VERIFY fill:#1a1a2e,stroke:#10B981,stroke-width:2px,color:#fff
    style BOT fill:#1a1a2e,stroke:#00D4FF,stroke-dasharray:5 5,color:#fff
```

**Dependabot** runs weekly and opens PRs automatically when newer versions are available for npm packages, the Dockerfile base image, or GitHub Actions - keeping dependencies up to date and patching known vulnerabilities.

> **Production** runs on Vercel + Supabase. The `k8s/` manifests and Docker image on GHCR enable self-hosting on any Kubernetes cluster.

### Stack Layers

**Frontend** - React single-page application built with Vite, deployed on Vercel. Includes a manual service worker for offline caching and a PWA manifest for installability. All routing is handled client-side.

**Platform** - Vercel Edge Network serves static assets and runs Edge Middleware for request validation, host header verification, and automated scanner blocking. Security headers (CSP, HSTS, COOP, CORP) are enforced via `vercel.json`.

**Backend** - Supabase provides authentication, real-time subscriptions, and a PostgreSQL database. All sensitive operations (answer validation, score updates) run through `SECURITY DEFINER` RPC functions that enforce server-side logic. A Supabase Edge Function runs periodic health checks across all services.

---

## Security Model

```mermaid
flowchart TB
    USER([User])

    EDGE["Edge Security<br/>HTTPS / HSTS"]
    APP["Application Security<br/>Strict CSP · No Inline Scripts"]
    API["API Validation<br/>RPC Validation · Rate Limiting"]
    DB[("Database Security<br/>PostgreSQL · Row Level Security")]

    USER -->|HTTPS| EDGE
    EDGE --> APP
    APP --> API
    API --> DB

    style EDGE fill:#111827,stroke:#EF4444,stroke-width:2px,color:#ffffff
    style APP fill:#111827,stroke:#00D4FF,stroke-width:2px,color:#ffffff
    style API fill:#111827,stroke:#A855F7,stroke-width:2px,color:#ffffff
    style DB fill:#111827,stroke:#F59E0B,stroke-width:2px,color:#ffffff
```

### Security Highlights

- HTTPS enforced with HSTS and strict Content Security Policy (no inline scripts)
- Edge protection and request filtering at the platform layer
- Strict CORS policy restricting cross-origin access
- Backend validation through controlled RPC endpoints
- Rate limiting applied to answer verification operations
- PostgreSQL protected with Row Level Security (RLS)
- Container images signed with Cosign and published with SBOM attestations
- Automated vulnerability scanning (Trivy, npm audit, CodeQL)

---

## Local Development

### Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) account _(optional - guest mode works without it)_

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

KubeQuest is a **Single Page Application (SPA)** - React handles all navigation client-side from a single `index.html` file. The web server must serve `index.html` for every URL so React can take over routing.

The Dockerfile uses a **multi-stage build** to keep the production image small and clean:

```
Stage 1 - Builder  (node:20-alpine)
  npm ci              → install dependencies
  npm run build       → compile React source → static HTML/CSS/JS in /dist

Stage 2 - Runner   (nginx:alpine)
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
| `user_id` | `uuid` - unique, references `auth.users` |
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

## CI/CD & Supply Chain Security

### Container Pipeline

Every push to `main` or a version tag (`v*.*.*`) triggers the [Docker Build & Push](.github/workflows/docker.yml) workflow:

```
Build image → Trivy scan → Push to GHCR → Attach SBOM & provenance → Sign with Cosign → Verify signature
```

The workflow uses concurrency control - rapid pushes to the same ref cancel older in-progress runs. On completion, the immutable image reference (`ghcr.io/or-carmeli/kubequest@sha256:...`) is printed for use in deployments.

### Image Tags

| Trigger | Tag | Example |
|---------|-----|---------|
| Push to `main` | `latest` + `sha-<commit>` | `latest`, `sha-a1b2c3d` |
| Git tag `v1.2.0` | Semver + `sha-<commit>` | `1.2.0`, `sha-a1b2c3d` |
| Manual dispatch | `sha-<commit>` | `sha-a1b2c3d` |

### Security Measures

- **Vulnerability scanning** - [Trivy](https://trivy.dev/) scans the image before push; the workflow fails on HIGH and CRITICAL vulnerabilities (unfixed CVEs excluded)
- **SBOM** - Software Bill of Materials attached to every published image
- **Provenance** - build provenance attestation (`mode=max`) provides cryptographic proof of build origin
- **Keyless signing** - [Cosign](https://docs.sigstore.dev/cosign/overview/) signs images by digest using GitHub OIDC; no secret keys to manage or rotate
- **In-pipeline verification** - the signature is verified in CI before the workflow completes

### Verify Locally

```bash
cosign verify \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp "github\.com/or-carmeli/KubeQuest" \
  ghcr.io/or-carmeli/kubequest:latest
```

### Deploying by Digest

Every workflow run outputs an immutable image reference by digest. Use it in Kubernetes manifests, Helm values, or ArgoCD application specs to pin the exact image that was built, scanned, and signed:

```yaml
image: ghcr.io/or-carmeli/kubequest@sha256:<digest>
```

---

## Project Structure

```
src/
  App.jsx              # Main application (UI + state)
  api/
    quiz.js            # Quiz, daily, incident, leaderboard RPCs
    monitoring.js      # System status monitoring RPCs
  content/
    topics.js          # Quiz questions by topic and level
    incidents.js       # Incident Mode scenarios
    dailyQuestions.js  # Daily Challenge question pool
  components/
    RoadmapView.jsx
    WeakAreaCard.jsx
  utils/
    quizPersistence.js # localStorage helpers for quiz resume
supabase/
  migrations/          # Database schema and RPCs
  functions/
    health-check/      # Edge Function - real-time service health checks
docs/
  monitoring.md        # Monitoring system documentation
```

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full release history.

---

## Contributing

Contributions are welcome - new questions, bug fixes, UI improvements.
See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions and question format guidelines.

---

## Disclaimer

KubeQuest is an independent learning project and is not affiliated with any company or organization.
Kubernetes is a registered trademark of the Cloud Native Computing Foundation.

---

## License

[MIT](LICENSE) © 2026 Or Carmeli
