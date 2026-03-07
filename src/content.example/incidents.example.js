// ── Example Incident Scenarios ───────────────────────────────────────────────
// This file demonstrates the expected data shape for src/content/incidents.js.
// Copy to src/content/incidents.js and populate with your own content.
//
// Each incident simulates a real production troubleshooting workflow.
// Steps are linear. Each step has:
//   prompt/promptHe      — what you observe (may include terminal output)
//   options/optionsHe    — 4 possible actions
//   answer               — index of the correct option (0-3)
//   explanation/explanationHe — why the correct answer is right

export const INCIDENTS = [
  {
    id: "example-incident",
    icon: "💥",
    title: "Production API: Endless Restarts Under Load",
    titleHe: "API בפרודקשן: ריסטארטים אינסופיים תחת עומס",
    description: "A critical API pod keeps restarting every 2 minutes under load",
    descriptionHe: "Pod של API קריטי מתאפס כל 2 דקות תחת עומס",
    difficulty: "medium",
    estimatedTime: "5-7 min",
    steps: [
      {
        prompt:
          "🚨 PagerDuty alert: `api-server` pod in namespace `production` is restarting every 2 minutes. What is your first action?",
        promptHe:
          "🚨 התראת PagerDuty: ה-Pod של `api-server` ב-namespace `production` מתאפס כל 2 דקות. מה הצעד הראשון שלך?",
        options: [
          "kubectl get pods -n production",
          "kubectl delete pod api-server -n production",
          "kubectl scale deployment api-server --replicas=0 -n production",
          "Immediately reboot the node hosting the pod",
        ],
        optionsHe: [
          "kubectl get pods -n production",
          "kubectl delete pod api-server -n production",
          "kubectl scale deployment api-server --replicas=0 -n production",
          "לאתחל מיידית את ה-Node שמריץ את ה-Pod",
        ],
        answer: 0,
        explanation:
          "`kubectl get pods` gives you the current state without causing any disruption.",
        explanationHe:
          "`kubectl get pods` מציג את המצב הנוכחי מבלי לגרום להפרעה כלשהי.",
      },
    ],
  },
];
