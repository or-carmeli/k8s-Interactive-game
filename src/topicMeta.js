// ── Public Topic Metadata & Achievements ────────────────────────────────────
// This file is intentionally public. It contains only topic shells (no questions,
// answers, or explanations) and achievement threshold definitions.
// Proprietary content lives in src/content/ (git-ignored).

export const ACHIEVEMENTS = [
  {
    id: "first",
    icon: "⚡",
    name: "ראשית הדרך",
    nameEn: "First Steps",
    condition: (s) => s.total_answered >= 1,
  },
  {
    id: "streak3",
    icon: "🔥",
    name: "שלושה ברצף",
    nameEn: "Three in a Row",
    condition: (s) => s.max_streak >= 3,
  },
  {
    id: "score100",
    icon: "💯",
    name: "100 נקודות",
    nameEn: "100 Points",
    condition: (s) => s.total_score >= 100,
  },
  {
    id: "allEasy",
    icon: "⭐",
    name: "כל הנושאים קל",
    nameEn: "All Topics Easy",
    condition: (s, c) => Object.keys(c).filter((k) => k.endsWith("_easy")).length >= 5,
  },
  {
    id: "master",
    icon: "🏆",
    name: "מאסטר K8s",
    nameEn: "K8s Master",
    condition: (s, c) => Object.keys(c).filter((k) => k.endsWith("_hard")).length >= 5,
  },
];

// Topic shells — used for home screen rendering, roadmap, and navigation.
// The full topic objects (with levels.questions, theory, etc.) are loaded
// from src/content/topics.js at build time.
export const TOPIC_META = [
  {
    id: "workloads",
    icon: "⚙️",
    name: "Workloads & Scheduling",
    color: "#00D4FF",
    description: "Pods · Deployments · StatefulSets · Scheduling · Resources",
    descriptionEn: "Pods · Deployments · StatefulSets · Scheduling · Resources",
  },
  {
    id: "networking",
    icon: "🌐",
    name: "Networking & Service Exposure",
    color: "#A855F7",
    description: "Services · Ingress · NetworkPolicy · DNS",
    descriptionEn: "Services · Ingress · NetworkPolicy · DNS",
  },
  {
    id: "config",
    icon: "🔐",
    name: "Configuration & Security",
    color: "#F59E0B",
    description: "ConfigMaps · Secrets · RBAC · ServiceAccounts",
    descriptionEn: "ConfigMaps · Secrets · RBAC · ServiceAccounts",
  },
  {
    id: "storage",
    icon: "💾",
    name: "Storage & Package Management",
    color: "#10B981",
    description: "PersistentVolumes · StorageClass · Helm · Operators",
    descriptionEn: "PersistentVolumes · StorageClass · Helm · Operators",
  },
  {
    id: "troubleshooting",
    icon: "🔧",
    name: "Cluster Operations & Troubleshooting",
    color: "#F97316",
    description: "Debugging · Observability · אבחון · כלים",
    descriptionEn: "Debugging · Observability · Diagnosis · Tools",
  },
];
