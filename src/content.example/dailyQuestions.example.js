// ── Example Daily Challenge Questions ────────────────────────────────────────
// This file demonstrates the expected data shape for src/content/dailyQuestions.js.
// Copy to src/content/dailyQuestions.js and populate with your own content.
//
// The daily seeded shuffle picks 10 questions from this pool each day.
// Question shape: { q: string, options: string[4], answer: 0|1|2|3, explanation: string }

export const DAILY_QUESTIONS = {
  he: [
    {
      q: "Pod בשם api-server מציג סטטוס CrashLoopBackOff. מה הצעד הראשון לאבחון?",
      options: [
        "kubectl delete pod api-server",
        "kubectl logs api-server --previous",
        "kubectl edit pod api-server",
        "kubectl drain node",
      ],
      answer: 1,
      explanation:
        "--previous מציג לוגים מהריצה שקרסה. זה תמיד הצעד הראשון כשיש CrashLoopBackOff.",
    },
  ],
  en: [
    {
      q: "A pod named api-server shows CrashLoopBackOff status. What is the first diagnostic step?",
      options: [
        "kubectl delete pod api-server",
        "kubectl logs api-server --previous",
        "kubectl edit pod api-server",
        "kubectl drain node",
      ],
      answer: 1,
      explanation:
        "--previous shows logs from the crashed run. This is always the first step for CrashLoopBackOff.",
    },
  ],
};
