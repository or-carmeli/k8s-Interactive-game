// ── Example Topic Content ────────────────────────────────────────────────────
// This file demonstrates the expected data shape for src/content/topics.js.
// Copy this file to src/content/topics.js and populate with your own content.
//
// Each topic must match an entry in TOPIC_META (src/topicMeta.js) by `id`.
// Each level (easy, medium, hard) contains:
//   - theory / theoryEn     — learning material shown before the quiz
//   - questions / questionsEn — array of quiz questions
//
// Question shape:
//   { q: string, options: string[4], answer: 0|1|2|3, explanation: string }

export const ACHIEVEMENTS = [
  {
    id: "first",
    icon: "🌱",
    name: "ראשית הדרך",
    nameEn: "First Steps",
    condition: (s) => s.total_answered >= 1,
  },
];

export const TOPICS = [
  {
    id: "workloads",
    icon: "🚀",
    name: "Workloads & Scheduling",
    color: "#00D4FF",
    description: "Pods · Deployments · StatefulSets · Scheduling · Resources",
    descriptionEn: "Pods · Deployments · StatefulSets · Scheduling · Resources",
    levels: {
      easy: {
        theory: "Pod הוא יחידת הריצה הקטנה ביותר ב-Kubernetes.",
        theoryEn: "A Pod is the smallest deployable unit in Kubernetes.",
        questions: [
          {
            q: "מה הוא Pod ב-Kubernetes?",
            options: [
              "אובייקט שמנהל גישה לרשת בין Nodes",
              "יחידת הריצה הקטנה ביותר, מכיל קונטיינר אחד או יותר",
              "קונטרולר שאחראי על rolling updates",
              "ממשק שמנהל volumes בין Pods",
            ],
            answer: 1,
            explanation: "Pod הוא יחידת הריצה הבסיסית ב-Kubernetes.",
          },
        ],
        questionsEn: [
          {
            q: "What is a Pod in Kubernetes?",
            options: [
              "An object that manages network access between Nodes",
              "The smallest unit of execution, containing one or more containers",
              "A controller responsible for rolling updates",
              "An interface that manages volumes between Pods",
            ],
            answer: 1,
            explanation: "A Pod is the basic unit of execution in Kubernetes.",
          },
        ],
      },
      medium: {
        theory: "Deployment מנהל קבוצת Pods זהים.",
        theoryEn: "A Deployment manages a group of identical Pods.",
        questions: [],
        questionsEn: [],
      },
      hard: {
        theory: "Scheduling מתקדם כולל taints, tolerations ו-affinity.",
        theoryEn: "Advanced scheduling includes taints, tolerations, and affinity.",
        questions: [],
        questionsEn: [],
      },
    },
  },
  // Add more topics here matching TOPIC_META ids:
  // "networking", "config", "storage", "troubleshooting"
];
