-- Rewrite explanation for question 1719 (Rolling update stuck).
-- Shorter sentences, better RTL readability, clearer structure.
-- Question, options, and answer unchanged.

UPDATE quiz_questions
SET explanation = 'maxUnavailable: 0 מונע הורדת Pod ישן עד שהחדש עובר readiness.
אם Pods חדשים נכשלים ב-readiness, ה-rollout נתקע.
יש לבדוק:
kubectl logs <pod-name>
kubectl describe pod <pod-name>
maxUnavailable: 0 = בטיחות מלאה, אבל readiness כושל = rollout תקוע.'
WHERE id = 1719;
