# Changelog

All notable changes to KubeQuest are documented here.

---

## [1.6.0] - 2026-03

### Added
- **System Status screen** (`/status`) — live environment, build time, DB health check, stack info
- **Version badge** (`v1.6.0`) in header and About screen
- **GitHub repo link** in About screen
- **Incident Mode** added to burger menu for quick access

### Fixed
- Hebrew explanation text rendering — `dir="auto"` on mixed RTL/LTR content prevents bidi display issues

### DevOps
- `Dockerfile` — multi-stage build (Node 20 → nginx:alpine), ~25MB final image
- `nginx.conf` — SPA routing, static asset caching, security headers
- `vercel.json` — SPA rewrites + HTTP security headers
- `k8s/` — production Kubernetes manifests: Namespace, Deployment, Service, Ingress, HPA
- GitHub Actions: CI build check, Docker build & push to GHCR, Security scan (npm audit + Trivy + CodeQL)
- Dependabot: weekly dependency and GitHub Actions version updates
- Mermaid architecture diagram in README

---

## [1.5.0] - 2026-03

### Added
- **Incident Mode** — multi-step real-world Kubernetes failure scenarios with step-by-step diagnosis, scoring, and timer
- **Incident Mode in burger menu** — quick access from anywhere in the app
- **Kubernetes Guide** — built-in cheatsheet organized into 8 sections (Core Objects, Networking, Scheduling, Configuration, Storage, Security, Troubleshooting, kubectl CLI)
- **Quiz resume** — automatically saves in-progress quiz state; resumes after refresh or navigation
- **History navigation** — review and retry previous questions within a quiz session without score impact
- **Weak Area card** — surfaces the topic with the lowest accuracy on the home screen

### Improved
- Explanation readability for Hebrew (`dir="auto"` on mixed RTL/LTR content)
- Incident Mode prompts reformatted — kubectl commands now render in monospace, surrounding context in regular text
- Storage and Troubleshooting quiz explanations rewritten for Kubernetes beginners
- Guide section reorganized from documentation-style into a practical cheatsheet format

---

## [1.0.0] - 2026-01

### Initial release
- 5 quiz topics: Workloads, Networking, Config & Security, Storage & Helm, Troubleshooting
- 3 difficulty levels per topic (Easy → Medium → Hard), progressively unlocked
- Mixed Quiz — 10 random questions across all topics
- Daily Challenge — 5 fresh questions every day
- Interview Mode — mandatory timer, hints disabled
- Leaderboard with global top scores
- Achievements system
- Guest mode (localStorage) + full auth via Supabase
- Hebrew / English with RTL support
- Roadmap view — visual learning path
