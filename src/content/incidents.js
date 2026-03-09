// ── Kubernetes Incident Mode Scenarios ───────────────────────────────────────
// Each incident simulates a real production troubleshooting workflow.
// Steps are linear (v1). Each step has:
//   prompt     – what you observe (may include terminal output)
//   promptHe   – Hebrew version of prompt
//   options[4] – possible actions (English)
//   optionsHe  – Hebrew version of options
//   answer     – index of the correct option (0-3)
//   explanation– why the correct answer is right (English)
//   explanationHe – Hebrew explanation

export const INCIDENTS = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. OOMKilled – memory limits too low
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "oom-killed",
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
          "🚨 PagerDuty alert:\n`api-server` pod in namespace `production` is restarting every 2 minutes.\nEnd users are seeing 503 errors.\n\nWhat is your first action?",
        promptHe:
          "🚨 התראת PagerDuty:\nה-Pod של `api-server` ב-namespace `production` מתאפס כל 2 דקות.\nמשתמשים מקבלים שגיאות 503.\n\nמה הצעד הראשון שלך?",
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
          "`kubectl get pods` gives you the current state without causing any disruption. Deleting the pod or scaling to 0 worsens the outage. Rebooting a node is far too drastic without even knowing the cause.",
        explanationHe:
          "הפקודה `kubectl get pods` מציגה את המצב הנוכחי מבלי לגרום להפרעה כלשהי. מחיקת ה-Pod או הקטנה ל-0 תחמיר את הנפילה. אתחול Node הוא צעד קיצוני בהרבה לפני שמבינים את הסיבה.",
      },
      {
        prompt:
          "You ran kubectl get pods -n production:\n\nNAME            READY   STATUS      RESTARTS   AGE\napi-server-xyz  0/1     OOMKilled   14         2h\n\nWhat does OOMKilled mean?\nWhich command gives you the most detail?",
        promptHe:
          "הרצת kubectl get pods -n production:\n\nNAME            READY   STATUS      RESTARTS   AGE\napi-server-xyz  0/1     OOMKilled   14         2h\n\nמה המשמעות של OOMKilled?\nאיזו פקודה תיתן את המידע המפורט ביותר?",
        options: [
          "OOMKilled is a liveness probe failure - check probe config with kubectl edit deployment",
          "OOMKilled means the container exceeded its memory limit - run kubectl describe pod api-server-xyz -n production",
          "OOMKilled means a network timeout - check NetworkPolicy rules",
          "OOMKilled is caused by a bad Docker image - re-pull the image",
        ],
        optionsHe: [
          "OOMKilled = כשל liveness probe - בדוק probe עם kubectl edit deployment",
          "OOMKilled = קונטיינר עבר מגבלת זיכרון - kubectl describe pod api-server-xyz -n production",
          "OOMKilled = timeout ברשת - בדוק NetworkPolicy",
          "OOMKilled = image פגום - משוך מחדש",
        ],
        answer: 1,
        explanation:
          "OOMKilled (Out Of Memory Killed) is set by the Linux kernel when a container breaches its memory limit. `kubectl describe pod` reveals the exact memory limit, the OOMKilled termination reason, and recent events - everything needed for diagnosis.",
        explanationHe:
          "מצב OOMKilled (Out Of Memory Killed) מוגדר על ידי ליבת לינוקס כאשר קונטיינר עובר את מגבלת הזיכרון שלו. הפקודה `kubectl describe pod` מציגה את מגבלת הזיכרון המדויקת, סיבת הסיום OOMKilled ואירועים אחרונים - כל מה שנדרש לאבחון.",
      },
      {
        prompt:
          "kubectl describe pod api-server-xyz -n production shows:\n\n  Limits:\n    memory: 256Mi\n  Last State:\n    Reason: OOMKilled\n    Exit Code: 137\n\nHow do you determine the right memory limit?",
        promptHe:
          "kubectl describe pod api-server-xyz -n production מציג:\n\n  Limits:\n    memory: 256Mi\n  Last State:\n    Reason: OOMKilled\n    Exit Code: 137\n\nכיצד קובעים את מגבלת הזיכרון הנכונה?",
        options: [
          "kubectl top pod api-server-xyz -n production  (see actual memory usage)",
          "kubectl logs api-server-xyz -n production --previous  (scan logs for errors)",
          "kubectl get node  (check node total memory)",
          "kubectl get hpa -n production  (check autoscaler settings)",
        ],
        optionsHe: [
          "kubectl top pod api-server-xyz -n production  (צפה בשימוש זיכרון בפועל)",
          "kubectl logs api-server-xyz -n production --previous  (סרוק לוגים לשגיאות)",
          "kubectl get node  (בדוק כמות זיכרון כוללת ב-Node)",
          "kubectl get hpa -n production  (בדוק הגדרות auto-scaler)",
        ],
        answer: 0,
        explanation:
          "`kubectl top pod` shows real-time memory consumption. You need to compare actual usage against the 256Mi limit to set a realistic new limit. Logs help find leaks but not current memory levels. `kubectl get node` shows total node capacity - not per-pod usage. `kubectl get hpa` controls replica count - it has nothing to do with per-pod memory allocation.",
        explanationHe:
          "הפקודה `kubectl top pod` מציגה צריכת זיכרון בזמן אמת. יש להשוות שימוש בפועל מול מגבלת 256Mi כדי לקבוע מגבלה ריאלית חדשה. לוגים עוזרים לזהות דליפות אך לא את רמות הזיכרון הנוכחיות. הפקודה `kubectl get node` מציגה קיבולת Node כוללת - לא שימוש זיכרון לכל Pod. הפקודה `kubectl get hpa` שולטת במספר הרפליקות - היא לא קשורה להקצאת זיכרון לכל Pod.",
      },
      {
        prompt:
          "kubectl top pod shows:\n`api-server-xyz` — ~240Mi at idle, spikes to 320Mi under load.\nCurrent memory limit: 256Mi.\n\nWhat is the correct fix?",
        promptHe:
          "kubectl top pod מציג:\n`api-server-xyz` — כ-240Mi במנוחה, עולה ל-320Mi תחת עומס.\nמגבלת זיכרון נוכחית: 256Mi.\n\nמה התיקון הנכון?",
        options: [
          "Delete the pod - Kubernetes will recreate it and somehow the memory issue will go away",
          "Increase the memory limit to 512Mi and set request to 256Mi in the Deployment spec",
          "Add a NetworkPolicy to throttle incoming requests",
          "Restart the kubelet on the affected node",
        ],
        optionsHe: [
          "למחוק את ה-Pod - Kubernetes ייצור מחדש, הבעיה תיפתר מאליה",
          "להגדיל את מגבלת הזיכרון ל-512Mi ולהגדיר request ל-256Mi ב-Deployment spec",
          "להוסיף NetworkPolicy לצמצום בקשות נכנסות",
          "לאתחל את ה-kubelet ב-Node המושפע",
        ],
        answer: 1,
        explanation:
          "Set the limit (ceiling) to 512Mi and the request (guaranteed reservation) to 256Mi. This gives headroom for traffic spikes while following K8s best practice (limit ≥ request, burstable QoS class). Deleting the pod or restarting kubelet changes nothing about the limit.",
        explanationHe:
          "הגדר את המגבלה (תקרה) ל-512Mi ואת ה-request (הקצאה מובטחת) ל-256Mi. זה מאפשר מרווח לקפיצות בתעבורה תוך עמידה בנוהלי K8s (limit ≥ request, QoS class burstable). מחיקת ה-Pod או אתחול kubelet לא משנה דבר לגבי המגבלה.",
      },
      {
        prompt:
          "You patched the Deployment with new memory limits.\nThe rolling update is in progress.\n\nHow do you verify the update succeeded and the pod no longer OOMKills?",
        promptHe:
          "עדכנת את ה-Deployment עם מגבלות זיכרון חדשות.\nה-rolling update בתהליך.\n\nכיצד מוודאים שהעדכון הצליח וה-Pod לא מקבל OOMKill?",
        options: [
          "kubectl rollout status deployment/api-server -n production",
          "kubectl get pods -n production -w  (watch pod restarts)",
          "kubectl get events -n production --sort-by=.metadata.creationTimestamp",
          "All of the above - rollout status + watching pods + events together",
        ],
        optionsHe: [
          "kubectl rollout status deployment/api-server -n production",
          "kubectl get pods -n production -w  (עקוב אחר אתחולי Pod)",
          "kubectl get events -n production --sort-by=.metadata.creationTimestamp",
          "כל האמור לעיל - סטטוס rollout + מעקב Pods + Events יחד",
        ],
        answer: 3,
        explanation:
          "`kubectl rollout status` confirms the rollout completes. Watching pods shows the new pod becomes Ready. Events reveal any scheduling or startup issues. Using all three gives full confidence the fix worked.",
        explanationHe:
          "הפקודה `kubectl rollout status` מאשרת שה-rollout הושלם. מעקב ה-Pods מציג שה-Pod החדש הפך ל-Ready. Events חושפים כל בעיית תזמון או הפעלה. שימוש בשלושתם יחד מספק ביטחון מלא שהתיקון עבד.",
      },
      {
        prompt:
          "The new pod has been stable for 15 minutes.\n\nWhat should you do before closing the incident to prevent recurrence?",
        promptHe:
          "ה-Pod החדש יציב כבר 15 דקות.\n\nמה עליך לעשות לפני סגירת האירוע כדי למנוע הישנות?",
        options: [
          "Increase all node sizes immediately as a precaution",
          "Add a Prometheus alert on memory usage > 80% of limit, and audit resource limits on all other Deployments",
          "Set memory limit to unlimited so it never OOMKills again",
          "No action needed - the incident is resolved",
        ],
        optionsHe: [
          "להגדיל את גודל כל ה-Nodes מיידית כאמצעי זהירות",
          "להוסיף התראת Prometheus על שימוש בזיכרון > 80% מהמגבלה, ולבדוק מגבלות משאבים בכל ה-Deployments האחרים",
          "להגדיר מגבלת זיכרון ללא הגבלה כדי שלא יהיה יותר OOMKill",
          "אין צורך בפעולה - האירוע נפתר",
        ],
        answer: 1,
        explanation:
          "Setting limits to unlimited removes the safety net and risks starving other pods. Auditing all workloads and adding a memory-usage alert catches future OOM pressure before it causes an outage. Simply closing without action guarantees the same incident reoccurs.",
        explanationHe:
          "הגדרת מגבלות ללא הגבלה מסירה את רשת הביטחון ומסכנת Pods אחרים. בדיקת כל עומסי העבודה והוספת התראת זיכרון מאתרת לחץ OOM עתידי לפני שיגרום להשבתה. סגירה ללא פעולה מבטיחה שאותו אירוע יחזור.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. CrashLoopBackOff – missing ConfigMap / env var
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "crashloop-config",
    icon: "🔄",
    title: "New Release: Payment Service Refuses to Start",
    titleHe: "גרסה חדשה: שירות התשלומים סירב לעלות",
    description: "A payment service crashes immediately after a new deployment shipped",
    descriptionHe: "שירות תשלומים קורס מיידית אחרי דיפלוימנט חדש",
    difficulty: "easy",
    estimatedTime: "4-5 min",
    steps: [
      {
        prompt:
          "🚨 Alert:\n`payment-service` in namespace `staging` entered CrashLoopBackOff.\nThis started 10 minutes after a new release was deployed.\n\nThe on-call engineer asks for a quick diagnosis.\nWhere do you start?",
        promptHe:
          "🚨 התראה:\n`payment-service` ב-namespace `staging` נכנס ל-CrashLoopBackOff.\nזה התחיל 10 דקות אחרי שגרסה חדשה הוצבה.\n\nהמהנדס התורן מבקש אבחון מהיר.\nמאיפה מתחילים?",
        options: [
          "kubectl get pods -n staging",
          "kubectl rollout undo deployment/payment-service -n staging  (roll back immediately)",
          "kubectl delete namespace staging  (clean slate)",
          "Re-apply the deployment YAML without changes",
        ],
        optionsHe: [
          "kubectl get pods -n staging",
          "kubectl rollout undo deployment/payment-service -n staging  (rollback מיידי)",
          "kubectl delete namespace staging  (ניקוי מלא)",
          "להחיל מחדש את ה-YAML של ה-Deployment ללא שינויים",
        ],
        answer: 0,
        explanation:
          "Start by assessing the situation with `kubectl get pods`. Rolling back without understanding the root cause is premature - the same bug may exist on the previous version too. Deleting the namespace causes total data loss. Re-applying the same YAML won't fix an unfound config issue.",
        explanationHe:
          "התחל בהערכת המצב עם `kubectl get pods`. rollback ללא הבנת הסיבה השורשית הוא צעד מוקדם מדי - אותו באג עלול להתקיים גם בגרסה הקודמת. מחיקת ה-namespace גורמת לאובדן נתונים מוחלט. החלה מחדש של אותו YAML לא תתקן בעיית קונפיגורציה שלא אותרה.",
      },
      {
        prompt:
          "kubectl get pods -n staging:\n\nNAME                         STATUS             RESTARTS\npayment-service-7d4b9-abc12  CrashLoopBackOff   9\n\nThe pod is crashing repeatedly.\nWhat command reveals the application error?",
        promptHe:
          "kubectl get pods -n staging:\n\nNAME                         STATUS             RESTARTS\npayment-service-7d4b9-abc12  CrashLoopBackOff   9\n\nה-Pod קורס שוב ושוב.\nאיזו פקודה חושפת את שגיאת האפליקציה?",
        options: [
          "kubectl describe pod payment-service-7d4b9-abc12 -n staging",
          "kubectl logs payment-service-7d4b9-abc12 -n staging --previous",
          "kubectl exec -it payment-service-7d4b9-abc12 -n staging -- /bin/sh",
          "kubectl get events -n staging --sort-by=.metadata.creationTimestamp",
        ],
        optionsHe: [
          "kubectl describe pod payment-service-7d4b9-abc12 -n staging",
          "kubectl logs payment-service-7d4b9-abc12 -n staging --previous",
          "kubectl exec -it payment-service-7d4b9-abc12 -n staging -- /bin/sh",
          "kubectl get events -n staging --sort-by=.metadata.creationTimestamp",
        ],
        answer: 1,
        explanation:
          "`kubectl logs --previous` shows logs from the last crashed container - exactly what you need to see the startup error. `exec` doesn't work on a CrashLoopBackOff pod (it exits too fast). `describe` shows events but not application-level log output. Events are useful but secondary.",
        explanationHe:
          "הפקודה `kubectl logs --previous` מציגה לוגים מהקונטיינר שקרס לאחרונה - בדיוק מה שצריך לראות שגיאת ההפעלה. הפקודה `exec` לא עובדת על Pod ב-CrashLoopBackOff (הוא יוצא מהר מדי). הפקודה `describe` מציגה Events אך לא פלט לוגים ברמת האפליקציה. Events שימושיים אך משניים.",
      },
      {
        prompt:
          "Previous logs show:\n\nFATAL  config file '/etc/app/config.yaml' not found\nError: no such file or directory\n\nThe app expects a mounted config file that doesn't exist.\n\nWhat do you check?",
        promptHe:
          "הלוגים הקודמים מראים:\n\nFATAL  config file '/etc/app/config.yaml' not found\nError: no such file or directory\n\nהאפליקציה מצפה לקובץ config שלא קיים.\n\nמה בודקים?",
        options: [
          "kubectl describe pod payment-service-7d4b9-abc12 -n staging  (check volumes and mounts)",
          "kubectl get configmap -n staging  (list available ConfigMaps)",
          "kubectl get secret -n staging  (list Secrets)",
          "Both A and B: inspect the pod spec for the expected mount AND list existing ConfigMaps",
        ],
        optionsHe: [
          "kubectl describe pod payment-service-7d4b9-abc12 -n staging  (בדוק volumes ו-mounts)",
          "kubectl get configmap -n staging  (רשימת ConfigMaps זמינים)",
          "kubectl get secret -n staging  (רשימת Secrets)",
          "גם A וגם B: בדוק ה-pod spec עבור ה-mount המצופה וגם רשימת ConfigMaps קיימים",
        ],
        answer: 3,
        explanation:
          "You need two pieces of information: what the pod spec says should be mounted (`describe pod`) and what actually exists in the namespace (`get configmap`). Only by comparing both can you find the mismatch.",
        explanationHe:
          "נדרשים שני מקורות מידע: מה ה-pod spec אומר שצריך להיות מוצמד (`describe pod`) ומה באמת קיים ב-namespace (`get configmap`). רק על ידי השוואת שניהם ניתן למצוא את אי-ההתאמה.",
      },
      {
        prompt:
          "The pod spec has a volumeMount expecting ConfigMap `payment-config`.\n\nkubectl get configmap -n staging:\n\nNAME              DATA   AGE\napp-settings      3      5d\n\nConfigMap `payment-config` does not exist in this namespace.\n\nWhat most likely happened?",
        promptHe:
          "ה-Pod spec מכיל volumeMount שמצפה ל-ConfigMap בשם `payment-config`.\n\nkubectl get configmap -n staging:\n\nNAME              DATA   AGE\napp-settings      3      5d\n\nה-ConfigMap `payment-config` לא קיים ב-namespace הזה.\n\nמה כנראה קרה?",
        options: [
          "The ConfigMap was created in a different namespace (e.g., production) but not in staging",
          "The ConfigMap was accidentally deleted from staging",
          "A new environment was added to the deployment but the ConfigMap was never created for it",
          "Any of the above - the ConfigMap is simply absent from this namespace",
        ],
        optionsHe: [
          "ה-ConfigMap נוצר ב-namespace אחר (למשל production) אך לא ב-staging",
          "ה-ConfigMap נמחק בטעות מ-staging",
          "סביבה חדשה נוספה ל-Deployment אך ה-ConfigMap מעולם לא נוצר עבורה",
          "כל האמור לעיל - ה-ConfigMap פשוט אינו קיים ב-namespace הזה",
        ],
        answer: 3,
        explanation:
          "ConfigMaps are namespace-scoped. The ConfigMap can be absent because it only exists in another namespace, was accidentally deleted, or was never created for this environment. All three are equally valid root causes; the fix is the same: create it in staging.",
        explanationHe:
          "משאבי ConfigMaps מוגדרים לפי namespace. ה-ConfigMap יכול להיות חסר כי הוא קיים רק ב-namespace אחר, נמחק בטעות, או מעולם לא נוצר לסביבה זו. שלושתם סיבות שורשיות תקפות באותה מידה; התיקון זהה: ליצור אותו ב-staging.",
      },
      {
        prompt:
          "You need to create `payment-config` in staging.\nThe production version can serve as a reference.\n\nWhat is the safest approach?",
        promptHe:
          "צריך ליצור `payment-config` ב-staging.\nהגרסה ב-production יכולה לשמש כהפניה.\n\nמה הגישה הבטוחה ביותר?",
        options: [
          "kubectl get configmap payment-config -n production -o yaml | sed 's/namespace: production/namespace: staging/' | kubectl apply -f -",
          "kubectl cp payment-config -n production staging/",
          "Edit the Deployment to point to the production namespace ConfigMap directly",
          "Restart the pod and hope the ConfigMap appears",
        ],
        optionsHe: [
          "kubectl get configmap payment-config -n production -o yaml | sed 's/namespace: production/namespace: staging/' | kubectl apply -f -",
          "kubectl cp payment-config -n production staging/",
          "לערוך את ה-Deployment כדי שיפנה ל-ConfigMap ב-namespace של production ישירות",
          "לאתחל את ה-Pod ולקוות שה-ConfigMap יופיע",
        ],
        answer: 0,
        explanation:
          "Export the ConfigMap from production, replace the namespace field, and apply to staging. `kubectl cp` is for files inside pods, not Kubernetes objects. Pods cannot reference ConfigMaps from other namespaces - they're namespace-scoped. Restarting without providing the resource changes nothing.",
        explanationHe:
          "ייצא את ה-ConfigMap מ-production, החלף את שדה ה-namespace, והחל ב-staging. `kubectl cp` מיועד לקבצים בתוך Pods, לא לאובייקטי Kubernetes. Pods לא יכולים להפנות ל-ConfigMaps ממרחבי שמות אחרים - הם מוגדרים לפי namespace. אתחול מבלי לספק את המשאב לא משנה דבר.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. ImagePullBackOff – private registry auth
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "imagepull-auth",
    icon: "🖼️",
    title: "New Microservice: All Pods Stuck at Startup",
    titleHe: "מיקרו-שירות חדש: כל הפודים תקועים בהפעלה",
    description: "A new Deployment is stuck - pods can't pull the container image",
    descriptionHe: "דיפלוימנט חדש תקוע - פודים לא מצליחים למשוך את הקונטיינר",
    difficulty: "easy",
    estimatedTime: "4-5 min",
    steps: [
      {
        prompt:
          "🚨 A newly deployed microservice has all pods in `ImagePullBackOff`.\nOther services on the same cluster are healthy.\n\nWhat is your first diagnostic step?",
        promptHe:
          "🚨 מיקרו-שירות חדש שהוצב — כל ה-Pods במצב `ImagePullBackOff`.\nשירותים אחרים באותו cluster תקינים.\n\nמה הצעד האבחוני הראשון?",
        options: [
          "kubectl describe pod <pod-name> -n default",
          "kubectl delete deployment myapp  (tear it down and redeploy)",
          "kubectl get nodes  (check if a node is down)",
          "Rebuild the Docker image locally and push again",
        ],
        optionsHe: [
          "kubectl describe pod <pod-name> -n default",
          "kubectl delete deployment myapp  (פירוק ופריסה מחדש)",
          "kubectl get nodes  (בדוק אם Node כלשהו ירד)",
          "לבנות מחדש את ה-Docker image מקומית ולדחוף שוב",
        ],
        answer: 0,
        explanation:
          "`kubectl describe pod` shows the Events section which contains the exact pull failure message - whether it's a missing tag, auth failure, or unreachable registry. Checking nodes is unlikely to help since only one deployment is affected. Rebuilding without knowing the cause wastes time.",
        explanationHe:
          "הפקודה `kubectl describe pod` מציגה את חלק ה-Events שמכיל את הודעת כשל המשיכה המדויקת - בין אם זה tag חסר, כשל אימות, או registry לא נגיש. בדיקת Nodes לא צפויה לעזור מכיוון שרק Deployment אחד מושפע. בנייה מחדש ללא ידיעת הסיבה מבזבזת זמן.",
      },
      {
        prompt:
          "kubectl describe pod shows:\n\n  Events:\n    Failed to pull image 'registry.company.com/myapp:v2.1':\n    rpc error: code = Unknown\n    unauthorized: authentication required\n\nWhat does this error indicate?",
        promptHe:
          "kubectl describe pod מציג:\n\n  Events:\n    Failed to pull image 'registry.company.com/myapp:v2.1':\n    rpc error: code = Unknown\n    unauthorized: authentication required\n\nמה מציינת שגיאה זו?",
        options: [
          "The image tag `v2.1` does not exist in the registry",
          "The registry requires credentials but the pod has none configured",
          "The registry server is down or unreachable",
          "The node has no internet access",
        ],
        optionsHe: [
          "ה-tag `v2.1` לא קיים ב-registry",
          "ה-registry דורש אישורים אך ל-Pod אין אישורים מוגדרים",
          "שרת ה-registry ירד או לא נגיש",
          "ל-Node אין גישה לאינטרנט",
        ],
        answer: 1,
        explanation:
          "'unauthorized: authentication required' means the registry exists and is reachable, but valid credentials are required. If the tag was wrong you'd see 'not found'. If the registry was unreachable you'd see a connection timeout or 'no route to host'.",
        explanationHe:
          "'unauthorized: authentication required' אומר שה-registry קיים ונגיש, אך נדרשים אישורים תקפים. אם ה-tag היה שגוי היית רואה 'not found'. אם ה-registry לא היה נגיש היית רואה connection timeout או 'no route to host'.",
      },
      {
        prompt:
          "The registry `registry.company.com` requires username/password to pull images.\n\nWhat Kubernetes resource is designed to hold registry credentials?",
        promptHe:
          "ה-registry `registry.company.com` דורש username/password למשיכת images.\n\nאיזה משאב Kubernetes מיועד להחזיק אישורי registry?",
        options: [
          "A ConfigMap with base64-encoded credentials",
          "A Secret of type `kubernetes.io/dockerconfigjson`",
          "A ServiceAccount token",
          "An RBAC ClusterRoleBinding",
        ],
        optionsHe: [
          "ConfigMap עם אישורים מקודדים ב-base64",
          "Secret מסוג `kubernetes.io/dockerconfigjson`",
          "Token של ServiceAccount",
          "RBAC ClusterRoleBinding",
        ],
        answer: 1,
        explanation:
          "Registry credentials are stored in a `kubernetes.io/dockerconfigjson` Secret (or the legacy `kubernetes.io/dockercfg` type). ConfigMaps are not suitable for sensitive data. ServiceAccount tokens authenticate to the Kubernetes API - not to container registries.",
        explanationHe:
          "אישורי registry מאוחסנים ב-Secret מסוג `kubernetes.io/dockerconfigjson` (או הסוג הישן `kubernetes.io/dockercfg`). ConfigMaps לא מתאימים לנתונים רגישים. Tokens של ServiceAccount מאמתים מול Kubernetes API - לא מול registry קונטיינרים.",
      },
      {
        prompt:
          "You ran:\n\nkubectl get secret -n default\n\nNo registry-related Secret exists in the namespace.\n\nHow do you create one correctly?",
        promptHe:
          "הרצת:\n\nkubectl get secret -n default\n\nלא קיים Secret הקשור ל-registry ב-namespace.\n\nכיצד יוצרים אחד נכון?",
        options: [
          "kubectl create secret docker-registry regcred --docker-server=registry.company.com --docker-username=user --docker-password=pass -n default",
          "kubectl create configmap registry-auth --from-literal=password=mypassword",
          "Add the password as an environment variable in the Deployment spec",
          "Copy the Secret from the kube-system namespace",
        ],
        optionsHe: [
          "kubectl create secret docker-registry regcred --docker-server=registry.company.com --docker-username=user --docker-password=pass -n default",
          "kubectl create configmap registry-auth --from-literal=password=mypassword",
          "להוסיף את הסיסמה כמשתנה סביבה ב-Deployment spec",
          "להעתיק את ה-Secret מ-namespace של kube-system",
        ],
        answer: 0,
        explanation:
          "`kubectl create secret docker-registry` creates a Secret with the correct type and `.dockerconfigjson` format. Never store credentials in plain ConfigMaps or env vars - they're not encrypted at rest. Secrets are namespace-scoped; you can't reference one from kube-system in default namespace.",
        explanationHe:
          "הפקודה `kubectl create secret docker-registry` יוצרת Secret עם הסוג הנכון ופורמט `.dockerconfigjson`. לעולם אל תאחסנו אישורים ב-ConfigMaps פשוטים או ב-env vars - הם אינם מוצפנים במנוחה. משאבי Secrets מוגדרים לפי namespace; לא ניתן להפנות לאחד מ-kube-system ב-default namespace.",
      },
      {
        prompt:
          "You created the `regcred` Secret.\nThe Deployment still fails to pull the image.\n\nWhat critical step did you miss?",
        promptHe:
          "יצרת את ה-Secret `regcred`.\nה-Deployment עדיין נכשל במשיכת ה-image.\n\nאיזה צעד קריטי החמצת?",
        options: [
          "The Secret value needs to be base64-encoded again manually",
          "The Deployment spec must reference the Secret under `imagePullSecrets`",
          "The Secret must be attached to the node, not the namespace",
          "You need to delete and recreate the Deployment for it to pick up the Secret",
        ],
        optionsHe: [
          "ערך ה-Secret צריך להיות מקודד ב-base64 שוב ידנית",
          "ה-Deployment spec חייב להפנות ל-Secret תחת `imagePullSecrets`",
          "ה-Secret חייב להיות מצורף ל-Node, לא ל-namespace",
          "צריך למחוק ולהפעיל מחדש את ה-Deployment כדי שיזהה את ה-Secret",
        ],
        answer: 1,
        explanation:
          "Kubernetes does NOT automatically use available pull Secrets. You must explicitly reference the Secret in the Deployment under `spec.template.spec.imagePullSecrets: [{name: regcred}]`. Without this reference the pod will never use the credential, even if the Secret exists in the same namespace.",
        explanationHe:
          "מערכת Kubernetes אינה משתמשת אוטומטית ב-pull Secrets זמינים. יש להפנות מפורשות ל-Secret ב-Deployment תחת `spec.template.spec.imagePullSecrets: [{name: regcred}]`. ללא הפניה זו ה-Pod לעולם לא ישתמש באישור, גם אם ה-Secret קיים באותו namespace.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Service unreachable – wrong selector / port mismatch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "service-no-endpoints",
    icon: "🔌",
    title: "Frontend to Backend: Connection Refused",
    titleHe: "פרונטאנד לבאקאנד: חיבור נדחה",
    description: "Frontend gets 'connection refused' calling the backend - pods look healthy",
    descriptionHe: "הפרונטאנד מקבל 'connection refused' מהבאקאנד - פודים נראים תקינים",
    difficulty: "medium",
    estimatedTime: "5-7 min",
    steps: [
      {
        prompt:
          "🚨 Users report 'connection refused' when the frontend calls the backend API.\nPod status for both frontend and backend: Running/Ready.\n\nWhere do you start?",
        promptHe:
          "🚨 משתמשים מדווחים על 'connection refused' כשהפרונטאנד קורא ל-API הבאקאנד.\nסטטוס Pods — frontend ו-backend: Running/Ready.\n\nמאיפה מתחילים?",
        options: [
          "kubectl get svc backend-svc -n production  (inspect the Service)",
          "kubectl restart pod backend -n production",
          "kubectl delete svc backend-svc -n production  (recreate it)",
          "kubectl get nodes  (check node health)",
        ],
        optionsHe: [
          "kubectl get svc backend-svc -n production  (בדוק את ה-Service)",
          "kubectl restart pod backend -n production",
          "kubectl delete svc backend-svc -n production  (צור מחדש)",
          "kubectl get nodes  (בדוק תקינות Node)",
        ],
        answer: 0,
        explanation:
          "When pods are healthy but a Service is unreachable, the issue is almost always in the Service configuration (selector, port, targetPort). Start by inspecting the Service before taking any destructive action.",
        explanationHe:
          "כאשר Pods תקינים אך Service לא נגיש, הבעיה כמעט תמיד נמצאת בהגדרת ה-Service (selector, port, targetPort). התחל בבדיקת ה-Service לפני כל פעולה הרסנית.",
      },
      {
        prompt:
          "kubectl get svc backend-svc -n production:\nService exists with ClusterIP and port 80.\n\nWhat is the single most diagnostic command to run next?",
        promptHe:
          "kubectl get svc backend-svc -n production:\nה-Service קיים עם ClusterIP ופורט 80.\n\nמהי הפקודה האבחונית ביותר להריץ כעת?",
        options: [
          "kubectl get endpoints backend-svc -n production",
          "kubectl get ingress -n production",
          "kubectl describe node",
          "kubectl get pvc -n production",
        ],
        optionsHe: [
          "kubectl get endpoints backend-svc -n production",
          "kubectl get ingress -n production",
          "kubectl describe node",
          "kubectl get pvc -n production",
        ],
        answer: 0,
        explanation:
          "`kubectl get endpoints` tells you whether the Service has successfully matched any pods. If ENDPOINTS shows `<none>`, no pods match the Service selector - the most common cause of 'connection refused' when pods are healthy.",
        explanationHe:
          "הפקודה `kubectl get endpoints` מראה אם ה-Service התאים בהצלחה ל-Pods כלשהם. אם ENDPOINTS מציג `<none>`, אף Pod לא תואם ל-selector של ה-Service - הסיבה הנפוצה ביותר ל-'connection refused' כאשר ה-Pods תקינים.",
      },
      {
        prompt:
          "kubectl get endpoints backend-svc -n production:\n\nNAME          ENDPOINTS   AGE\nbackend-svc   <none>      3d\n\nEndpoints: `<none>` — the Service has no matching pods.\n\nWhat do you do next?",
        promptHe:
          "kubectl get endpoints backend-svc -n production:\n\nNAME          ENDPOINTS   AGE\nbackend-svc   <none>      3d\n\nEndpoints: `<none>` — ל-Service אין Pods תואמים.\n\nמה הצעד הבא?",
        options: [
          "kubectl get pods -n production --show-labels  (see actual pod labels)",
          "kubectl describe svc backend-svc -n production  (see the selector the Service uses)",
          "kubectl get pods -n production  (check pod count)",
          "Both A and B: compare pod labels to Service selector simultaneously",
        ],
        optionsHe: [
          "kubectl get pods -n production --show-labels  (ראה labels בפועל על ה-Pods)",
          "kubectl describe svc backend-svc -n production  (ראה את ה-selector שה-Service משתמש בו)",
          "kubectl get pods -n production  (בדוק מספר Pods)",
          "גם A וגם B: השווה labels של Pods ל-selector של Service בו-זמנית",
        ],
        answer: 3,
        explanation:
          "You need to compare what the Service expects (`describe svc` → Selector field) with what the pods actually have (`--show-labels`). Running both commands gives you the mismatch side-by-side. Neither alone is sufficient.",
        explanationHe:
          "יש להשוות מה ה-Service מצפה (`describe svc` → שדה Selector) עם מה שה-Pods בפועל מכילים (`--show-labels`). הרצת שתי הפקודות יחד מציגה את אי-ההתאמה זה לצד זה. אף אחת מהן לבדה אינה מספיקה.",
      },
      {
        prompt:
          "Here is what you found:\n\nkubectl describe svc backend-svc -n production\n  Selector: app=backend\n\nkubectl get pods -n production --show-labels\n  Pod labels: app=backend-v2\n\nThe label was updated in the last deployment.\nThe Service selector was not updated.\n\nWhat is the fix?",
        promptHe:
          "הנה מה שמצאת:\n\nkubectl describe svc backend-svc -n production\n  Selector: app=backend\n\nkubectl get pods -n production --show-labels\n  Pod labels: app=backend-v2\n\nה-label עודכן ב-Deployment האחרון.\nה-selector של ה-Service לא עודכן.\n\nמה התיקון?",
        options: [
          "Manually add label `app=backend` to every running pod with kubectl label",
          "kubectl patch svc backend-svc -n production -p '{\"spec\":{\"selector\":{\"app\":\"backend-v2\"}}}'",
          "Delete the Service and recreate it with the correct selector",
          "Add an annotation to the Service to bypass label matching",
        ],
        optionsHe: [
          "להוסיף ידנית label `app=backend` לכל Pod פעיל עם kubectl label",
          "kubectl patch svc backend-svc -n production -p '{\"spec\":{\"selector\":{\"app\":\"backend-v2\"}}}'",
          "למחוק את ה-Service וליצור אותו מחדש עם ה-selector הנכון",
          "להוסיף annotation ל-Service כדי לעקוף התאמת labels",
        ],
        answer: 1,
        explanation:
          "`kubectl patch svc` atomically updates the selector with zero downtime. Labelling individual pods is fragile - new pods from the Deployment won't have it. Deleting and recreating the Service causes unnecessary downtime. Annotations don't influence selector-based routing.",
        explanationHe:
          "הפקודה `kubectl patch svc` מעדכנת אטומית את ה-selector ללא זמן השבתה. הוספת labels ל-Pods בודדים שברירית - Pods חדשים מה-Deployment לא יכילו אותם. מחיקה ויצירה מחדש של ה-Service גורמת להשבתה מיותרת. Annotations לא משפיעים על ניתוב מבוסס-selector.",
      },
      {
        prompt:
          "You patched the Service selector to match `app=backend-v2`.\n\nHow do you confirm traffic is flowing end-to-end?",
        promptHe:
          "עדכנת את ה-selector של ה-Service ל-`app=backend-v2`.\n\nכיצד מאשרים שהתעבורה זורמת מקצה לקצה?",
        options: [
          "kubectl get endpoints backend-svc -n production  (verify pod IPs appear)",
          "kubectl run curl-test --image=curlimages/curl --rm -it --restart=Never -n production -- curl backend-svc/health",
          "kubectl get pods -n production  (check pod status)",
          "Both A and B: verify endpoints are populated AND do a live connectivity test",
        ],
        optionsHe: [
          "kubectl get endpoints backend-svc -n production  (אמת שכתובות IP של Pods מופיעות)",
          "kubectl run curl-test --image=curlimages/curl --rm -it --restart=Never -n production -- curl backend-svc/health",
          "kubectl get pods -n production  (בדוק סטטוס Pods)",
          "גם A וגם B: אמת שה-endpoints מאוכלסים וגם בצע בדיקת קישוריות חיה",
        ],
        answer: 3,
        explanation:
          "Endpoints being populated proves the selector matches. A live `curl` test proves actual network traffic reaches the backend. Both together confirm the full fix - endpoints can be populated but a NetworkPolicy could still silently block traffic.",
        explanationHe:
          "אכלוס ה-endpoints מוכיח שה-selector תואם. בדיקת `curl` חיה מוכיחה שתעבורת רשת בפועל מגיעה לבאקאנד. שניהם יחד מאשרים את התיקון המלא - ה-endpoints יכולים להיות מאוכלסים אך NetworkPolicy עלולה עדיין לחסום תעבורה בשקט.",
      },
      {
        prompt:
          "Traffic is restored.\n\nWhat process change prevents selector mismatches from reaching production again?",
        promptHe:
          "התעבורה שוחזרה.\n\nאיזה שינוי תהליך ימנע אי-התאמות selector מלהגיע ל-production שוב?",
        options: [
          "Manually double-check Service selectors after every deployment",
          "Use Helm/Kustomize to derive both the Service selector and Deployment pod labels from a single shared value, and alert on kube_endpoint_ready == 0",
          "Switch all Services from ClusterIP to NodePort",
          "Add a comment in the YAML reminding engineers to update the selector",
        ],
        optionsHe: [
          "לבדוק ידנית selectors של Service אחרי כל דיפלוימנט",
          "Helm/Kustomize: גזור labels ו-selector מאותו משתנה, והתרע על kube_endpoint_ready == 0",
          "לעבור עם כל ה-Services מ-ClusterIP ל-NodePort",
          "להוסיף הערה ב-YAML שמזכירה למהנדסים לעדכן את ה-selector",
        ],
        answer: 1,
        explanation:
          "Templating (Helm/Kustomize) ensures labels and selectors are always in sync because they reference the same variable. An endpoint-ready alert catches the issue immediately if it slips through. Comments and manual checks are error-prone. NodePort doesn't address selector matching.",
        explanationHe:
          "תבניות (Helm/Kustomize) מבטיחות ש-labels ו-selectors תמיד מסונכרנים כי הם מפנים לאותו משתנה. התראה על endpoint-ready מאתרת את הבעיה מיידית אם היא עוברת. הערות ובדיקות ידניות נוטות לשגיאה. NodePort לא פותר התאמת selector.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. DNS resolution failures – CoreDNS OOMKilled
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "dns-coredns",
    icon: "🌐",
    title: "Cascading Failures: Services Can't Find Each Other",
    titleHe: "כשלים מדורגים: שירותים לא מוצאים אחד את השני",
    description: "Multiple services can't resolve each other by hostname - widespread outage",
    descriptionHe: "שירותים מרובים לא מצליחים לפתור שמות - השבתה נרחבת",
    difficulty: "hard",
    estimatedTime: "7-9 min",
    steps: [
      {
        prompt:
          "🚨 Multiple applications log:\n'no such host'\n'dial tcp: lookup svc-name: no such host'\n\nDNS appears broken cluster-wide.\n\nHow do you confirm the DNS issue before investigating infrastructure?",
        promptHe:
          "🚨 אפליקציות מרובות מתעדות:\n'no such host'\n'dial tcp: lookup svc-name: no such host'\n\nה-DNS נראה שבור בכל ה-cluster.\n\nכיצד מאשרים את בעיית ה-DNS לפני בדיקת תשתית?",
        options: [
          "kubectl run dns-test --image=busybox:1.28 --rm -it --restart=Never -- nslookup kubernetes.default",
          "Restart all pods in all namespaces",
          "Check AWS Route53 or your cloud DNS settings",
          "kubectl get nodes  (check if nodes are down)",
        ],
        optionsHe: [
          "kubectl run dns-test --image=busybox:1.28 --rm -it --restart=Never -- nslookup kubernetes.default",
          "לאתחל את כל ה-Pods בכל ה-namespaces",
          "לבדוק AWS Route53 או הגדרות DNS של ה-Cloud שלך",
          "kubectl get nodes  (בדוק אם Nodes ירדו)",
        ],
        answer: 0,
        explanation:
          "A quick `nslookup kubernetes.default` from inside the cluster tests the most fundamental in-cluster DNS entry. This confirms the problem is DNS and not individual app configs. Cloud DNS (Route53) handles external names, not internal Kubernetes service discovery. Restarting all pods causes massive downtime without confirming root cause.",
        explanationHe:
          "הפקודה `nslookup kubernetes.default` בודקת במהירות מתוך הקלאסטר את רשומת ה-DNS הפנימית הבסיסית ביותר. זה מאשר שהבעיה היא DNS ולא הגדרות אפליקציות בודדות. Cloud DNS (Route53) מטפל בשמות חיצוניים, לא בגילוי שירותים פנימי של Kubernetes. אתחול כל ה-Pods גורם להשבתה מסיבית ללא אישור הסיבה השורשית.",
      },
      {
        prompt:
          "nslookup kubernetes.default fails:\n'server can't find kubernetes.default: NXDOMAIN'\n\nDNS is confirmed broken.\n\nWhere does Kubernetes cluster DNS run?",
        promptHe:
          "nslookup kubernetes.default נכשל:\n'server can't find kubernetes.default: NXDOMAIN'\n\nה-DNS אושר כשבור.\n\nהיכן רץ ה-DNS של cluster Kubernetes?",
        options: [
          "On every node as a system daemon (systemd-resolved)",
          "As CoreDNS pods in the kube-system namespace",
          "Inside etcd as part of the control plane",
          "In every application namespace as a sidecar",
        ],
        optionsHe: [
          "על כל Node כ-daemon של המערכת (systemd-resolved)",
          "כ-Pods של CoreDNS ב-namespace של kube-system",
          "בתוך etcd כחלק מה-control plane",
          "בכל namespace של אפליקציה כ-sidecar",
        ],
        answer: 1,
        explanation:
          "Kubernetes cluster DNS is served by CoreDNS pods in the `kube-system` namespace. These pods handle all in-cluster service discovery via the cluster domain (e.g., `svc.cluster.local`). If they're unhealthy, all DNS resolution fails cluster-wide.",
        explanationHe:
          "שירות ה-DNS של קלאסטר Kubernetes מסופק על ידי Pods של CoreDNS ב-namespace של `kube-system`. Pods אלה מטפלים בכל גילוי השירותים הפנימי באמצעות דומיין הקלאסטר (למשל `svc.cluster.local`). אם הם לא תקינים, כל פתרון ה-DNS נכשל בכל הקלאסטר.",
      },
      {
        prompt:
          "kubectl get pods -n kube-system -l k8s-app=kube-dns:\n\nNAME              STATUS      RESTARTS\ncoredns-abc12     OOMKilled   7\ncoredns-def34     OOMKilled   7\n\nBoth CoreDNS pods are OOMKilling.\n\nWhat should you do before changing anything?",
        promptHe:
          "kubectl get pods -n kube-system -l k8s-app=kube-dns:\n\nNAME              STATUS      RESTARTS\ncoredns-abc12     OOMKilled   7\ncoredns-def34     OOMKilled   7\n\nשני Pods של CoreDNS מקבלים OOMKill.\n\nמה יש לעשות לפני שמשנים דבר?",
        options: [
          "kubectl delete pods -n kube-system -l k8s-app=kube-dns  (force restart)",
          "kubectl describe pod coredns-abc12 -n kube-system  (check memory limit)",
          "kubectl top pod -n kube-system  (check actual memory usage)",
          "Both B and C: check the configured limit AND actual consumption before acting",
        ],
        optionsHe: [
          "kubectl delete pods -n kube-system -l k8s-app=kube-dns  (כפה אתחול מחדש)",
          "kubectl describe pod coredns-abc12 -n kube-system  (בדוק מגבלת זיכרון)",
          "kubectl top pod -n kube-system  (בדוק שימוש זיכרון בפועל)",
          "גם B וגם C: בדוק את המגבלה המוגדרת וגם את הצריכה בפועל לפני פעולה",
        ],
        answer: 3,
        explanation:
          "You need both the memory limit (`describe pod`) and actual usage (`top pod`) to decide the new limit. Deleting pods without understanding the cause restarts them into the same OOMKill cycle immediately. Acting without data leads to setting incorrect limits.",
        explanationHe:
          "נדרשים גם מגבלת הזיכרון (`describe pod`) וגם השימוש בפועל (`top pod`) כדי להחליט על המגבלה החדשה. מחיקת Pods ללא הבנת הסיבה מאתחלת אותם למחזור OOMKill זהה מיידית. פעולה ללא נתונים מובילה להגדרת מגבלות שגויות.",
      },
      {
        prompt:
          "Results from describe and top:\n\nkubectl describe pod coredns-abc12 -n kube-system\n  Memory limit: 170Mi\n\nkubectl top pod coredns-abc12 -n kube-system\n  Current usage: 168Mi (99% of limit)\n\nThe cluster recently scaled from 20 to 80 nodes.\n\nWhat is the likely root cause?",
        promptHe:
          "תוצאות describe ו-top:\n\nkubectl describe pod coredns-abc12 -n kube-system\n  Memory limit: 170Mi\n\nkubectl top pod coredns-abc12 -n kube-system\n  Current usage: 168Mi (99% of limit)\n\nה-cluster גדל לאחרונה מ-20 ל-80 Nodes.\n\nמה הסיבה השורשית הסבירה?",
        options: [
          "A memory leak in the CoreDNS binary - upgrade CoreDNS immediately",
          "The cluster grew significantly; CoreDNS caches DNS records for many more Services and Pods now, requiring more memory",
          "The CoreDNS ConfigMap is corrupt - restore it from backup",
          "The underlying node is overloaded and swapping memory",
        ],
        optionsHe: [
          "דליפת זיכרון בבינארי של CoreDNS - שדרג CoreDNS מיידית",
          "הקלאסטר גדל פי 4 - CoreDNS צריך יותר זיכרון לשמירת רשומות עבור Services ו-Pods הנוספים",
          "ה-ConfigMap של CoreDNS פגום - שחזר מגיבוי",
          "ה-Node הבסיסי עמוס ומחליף זיכרון (swapping)",
        ],
        answer: 1,
        explanation:
          "CoreDNS memory usage scales with cluster size - more Services, Endpoints, and Pods means a larger DNS cache. At 4× cluster size, the original 170Mi limit is no longer adequate. A corrupt config would cause crashes with errors, not gradual memory exhaustion. Node swapping would affect all pods equally.",
        explanationHe:
          "שימוש הזיכרון של CoreDNS גדל עם גודל הקלאסטר - יותר Services, Endpoints ו-Pods פירושו cache DNS גדול יותר. בגודל קלאסטר פי 4, מגבלת 170Mi המקורית כבר אינה מספיקה. קונפיגורציה פגומה תגרום לקריסות עם שגיאות, לא לאיפוס זיכרון הדרגתי. swap ב-Node ישפיע על כל ה-Pods בשווה.",
      },
      {
        prompt:
          "CoreDNS needs more memory.\n\nHow do you safely increase the limits without causing a total DNS blackout?",
        promptHe:
          "CoreDNS צריך יותר זיכרון.\n\nכיצד מגדילים את המגבלות בבטחה ללא השבתת DNS מוחלטת?",
        options: [
          "kubectl edit deployment coredns -n kube-system  (increase memory limit, triggers rolling update)",
          "kubectl delete deployment coredns -n kube-system  (delete and recreate)",
          "Restart all control-plane components",
          "Add more nodes to the cluster",
        ],
        optionsHe: [
          "kubectl edit deployment coredns -n kube-system  (הגדל מגבלת זיכרון, מפעיל rolling update)",
          "kubectl delete deployment coredns -n kube-system  (מחק וצור מחדש)",
          "לאתחל את כל רכיבי ה-control plane",
          "להוסיף עוד Nodes לקלאסטר",
        ],
        answer: 0,
        explanation:
          "`kubectl edit deployment coredns -n kube-system` triggers a rolling update - only one CoreDNS pod restarts at a time, keeping DNS available throughout. Deleting the deployment creates a total DNS outage during recreation. Adding nodes doesn't address the per-pod memory limit.",
        explanationHe:
          "הפקודה `kubectl edit deployment coredns -n kube-system` מפעילה rolling update - רק Pod אחד של CoreDNS מתאפס בכל פעם, תוך שמירת DNS זמין לאורך כל התהליך. מחיקת ה-Deployment יוצרת השבתת DNS מוחלטת במהלך היצירה מחדש. הוספת Nodes לא פותרת את מגבלת הזיכרון לכל Pod.",
      },
      {
        prompt:
          "Memory increased to 512Mi.\nCoreDNS pods are now Running.\n\nHow do you verify DNS is fully restored?",
        promptHe:
          "הזיכרון הוגדל ל-512Mi.\nה-Pods של CoreDNS כעת Running.\n\nכיצד מאמתים ש-DNS שוחזר לחלוטין?",
        options: [
          "kubectl run dns-verify --image=busybox:1.28 --rm -it --restart=Never -- nslookup kubernetes.default.svc.cluster.local",
          "kubectl get pods -n kube-system  (confirm Running status)",
          "kubectl logs -n kube-system -l k8s-app=kube-dns --tail=30  (check for errors)",
          "All of the above - pods healthy + no log errors + successful DNS resolution test",
        ],
        optionsHe: [
          "kubectl run dns-verify --image=busybox:1.28 --rm -it --restart=Never -- nslookup kubernetes.default.svc.cluster.local",
          "kubectl get pods -n kube-system  (אשר סטטוס Running)",
          "kubectl logs -n kube-system -l k8s-app=kube-dns --tail=30  (בדוק שגיאות)",
          "כל האמור לעיל - Pods תקינים + אין שגיאות בלוג + בדיקת פתרון DNS הצליחה",
        ],
        answer: 3,
        explanation:
          "A complete DNS health check requires all three: pods must be Running (no more OOMKill), logs must show no errors, and an actual resolution test must succeed. A pod can be Running but still serving degraded results if there are configuration or cache issues.",
        explanationHe:
          "בדיקת בריאות DNS מלאה דורשת את שלושתם: Pods חייבים להיות Running (אין יותר OOMKill), לוגים חייבים להראות ללא שגיאות, ובדיקת פתרון בפועל חייבת להצליח. Pod יכול להיות Running אך עדיין לשרת תוצאות מדורדרות אם יש בעיות קונפיגורציה או cache.",
      },
      {
        prompt:
          "DNS is stable.\n\nWhat monitoring should you add so this never silently fails again?",
        promptHe:
          "ה-DNS יציב.\n\nאיזה ניטור יש להוסיף כדי שזה לא ייכשל שוב בשקט?",
        options: [
          "Alert when CoreDNS pod memory usage exceeds 80% of its limit",
          "Alert on CoreDNS pod restart count > 0 in 5 minutes",
          "Alert on CoreDNS P99 DNS query latency > 100ms",
          "All three - memory pressure, restarts, and latency all indicate DNS health degrading",
        ],
        optionsHe: [
          "להתריע כאשר שימוש הזיכרון של Pod CoreDNS עולה על 80% ממגבלתו",
          "להתריע על ספירת אתחולי Pod CoreDNS > 0 תוך 5 דקות",
          "להתריע על זמן אחזור DNS P99 של CoreDNS > 100ms",
          "כל שלושתם - לחץ זיכרון, אתחולים ועיכוב כולם מעידים על ירידה בבריאות DNS",
        ],
        answer: 3,
        explanation:
          "Comprehensive DNS monitoring needs all three signals: memory approaching limit (capacity warning before OOMKill), restarts (stability), and query latency (performance). Monitoring only one signal leaves you blind to other failure modes, as this incident demonstrated.",
        explanationHe:
          "ניטור DNS מקיף דורש את שלושת האותות: זיכרון שמתקרב למגבלה (אזהרת קיבולת לפני OOMKill), אתחולים (יציבות) ועיכוב שאילתא (ביצועים). ניטור אות אחד בלבד משאיר אותך עיוור לאופני כשל אחרים, כפי שאירוע זה הדגים.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. NetworkPolicy blocks traffic after security update
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "networkpolicy-block",
    icon: "🚧",
    title: "Post-Security-Update: Silent Request Timeouts",
    titleHe: "אחרי עדכון אבטחה: Timeout שקט על כל הבקשות",
    description: "Service calls time out after the security team applied new NetworkPolicies",
    descriptionHe: "קריאות לשירות מסתיימות ב-timeout אחרי עדכון מדיניות אבטחה",
    difficulty: "hard",
    estimatedTime: "7-9 min",
    steps: [
      {
        prompt:
          "🚨 The security team applied new NetworkPolicies to namespace `production`.\nFrontend-to-backend calls now silently time out.\nBoth sets of pods show Running/Ready.\n\nWhat do you check first?",
        promptHe:
          "🚨 צוות האבטחה החיל NetworkPolicies חדשות על namespace `production`.\nקריאות frontend → backend מסתיימות ב-timeout בשקט.\nשתי קבוצות ה-Pods מציגות Running/Ready.\n\nמה בודקים קודם?",
        options: [
          "kubectl get networkpolicy -n production  (list all policies in the namespace)",
          "kubectl rollout undo deployment/backend -n production  (roll back backend)",
          "kubectl delete networkpolicy --all -n production  (remove all policies)",
          "kubectl get pods -n production  (verify pod health again)",
        ],
        optionsHe: [
          "kubectl get networkpolicy -n production  (רשום את כל המדיניות ב-namespace)",
          "kubectl rollout undo deployment/backend -n production  (rollback לבאקאנד)",
          "kubectl delete networkpolicy --all -n production  (הסר את כל המדיניות)",
          "kubectl get pods -n production  (אמת שוב תקינות Pods)",
        ],
        answer: 0,
        explanation:
          "Since the incident correlates directly with a NetworkPolicy change, inspect the policies first. Removing all policies (`--all`) eliminates the security posture - a serious risk. Rolling back the backend deployment won't fix a network-layer issue. Pod status is already confirmed healthy.",
        explanationHe:
          "מכיוון שהאירוע מתואם ישירות לשינוי NetworkPolicy, בדוק את המדיניות קודם. הסרת כל המדיניות (`--all`) מסירה את עמדת האבטחה - סיכון רציני. rollback ל-Deployment של הבאקאנד לא יתקן בעיית שכבת רשת. סטטוס Pod כבר אושר כתקין.",
      },
      {
        prompt:
          "You ran:\n\nkubectl get networkpolicy -n production\n\nSeveral policies are listed, including:\n- deny-all-ingress\n- allow-frontend\n\nHow do you inspect what each policy actually permits?",
        promptHe:
          "הרצת:\n\nkubectl get networkpolicy -n production\n\nמספר policies מופיעות, כולל:\n- deny-all-ingress\n- allow-frontend\n\nכיצד בודקים מה כל policy בפועל מתירה?",
        options: [
          "kubectl describe networkpolicy -n production  (shows selectors and rules for all policies)",
          "kubectl logs networkpolicy-controller -n kube-system",
          "kubectl get events -n production",
          "kubectl exec into a pod and inspect iptables rules",
        ],
        optionsHe: [
          "kubectl describe networkpolicy -n production  (מציג selectors וכללים לכל המדיניות)",
          "kubectl logs networkpolicy-controller -n kube-system",
          "kubectl get events -n production",
          "kubectl exec לתוך Pod ובדוק כללי iptables",
        ],
        answer: 0,
        explanation:
          "`kubectl describe networkpolicy -n production` prints each policy's podSelector and ingress/egress rules in readable format. NetworkPolicy controllers don't expose user-accessible logs. Events won't show policy rule details. iptables inspection requires node root access and is complex to interpret.",
        explanationHe:
          "הפקודה `kubectl describe networkpolicy -n production` מדפיסה את ה-podSelector וכללי ingress/egress של כל מדיניות בפורמט קריא. בקרי NetworkPolicy אינם חושפים לוגים נגישים למשתמש. Events לא יציגו פרטי כללי מדיניות. בדיקת iptables דורשת גישת root ל-Node ומורכבת לפרשנות.",
      },
      {
        prompt:
          "kubectl describe shows:\n\n  Policy: allow-frontend\n  PodSelector: role=frontend  (targets backend pods)\n  Ingress from: podSelector role=frontend\n\n`deny-all-ingress` blocks everything else.\nYou suspect a label mismatch.\n\nWhat must you check?",
        promptHe:
          "kubectl describe מציג:\n\n  Policy: allow-frontend\n  PodSelector: role=frontend  (מטרגט Pods של באקאנד)\n  Ingress from: podSelector role=frontend\n\n`deny-all-ingress` חוסמת את כל השאר.\nאתה חושד באי-התאמת labels.\n\nמה חייבים לבדוק?",
        options: [
          "kubectl get pods -n production --show-labels  (check actual labels on frontend pods)",
          "kubectl delete networkpolicy deny-all-ingress -n production",
          "kubectl get svc -n production",
          "kubectl describe deployment frontend -n production",
        ],
        optionsHe: [
          "kubectl get pods -n production --show-labels  (בדוק labels בפועל על Pods של פרונטאנד)",
          "kubectl delete networkpolicy deny-all-ingress -n production",
          "kubectl get svc -n production",
          "kubectl describe deployment frontend -n production",
        ],
        answer: 0,
        explanation:
          "NetworkPolicies match pods by their labels. If frontend pods don't carry the label `role=frontend`, the allow-frontend policy won't select them - their traffic is blocked by deny-all. You must verify actual pod labels before modifying any policy.",
        explanationHe:
          "כללי NetworkPolicies מתאימים Pods לפי ה-labels שלהם. אם Pods של פרונטאנד לא נושאים את ה-label `role=frontend`, מדיניות allow-frontend לא תבחר בהם - התעבורה שלהם חסומה על ידי deny-all. חובה לאמת labels בפועל של Pods לפני שינוי מדיניות כלשהי.",
      },
      {
        prompt:
          "You ran:\n\nkubectl get pods -n production --show-labels\n  frontend pods: app=frontend (NOT role=frontend)\n\nThe allow-frontend policy's from-selector expects: role=frontend.\nActual frontend pod labels: app=frontend.\n\nWhat is the correct fix?",
        promptHe:
          "הרצת:\n\nkubectl get pods -n production --show-labels\n  frontend pods: app=frontend (לא role=frontend)\n\nה-from-selector של allow-frontend מצפה ל: role=frontend.\nה-labels בפועל על ה-Pods: app=frontend.\n\nמה התיקון הנכון?",
        options: [
          "kubectl label pod <each-frontend-pod> role=frontend  (relabel individual pods)",
          "kubectl patch networkpolicy allow-frontend -n production -p to update the from-selector to `app=frontend`",
          "kubectl delete networkpolicy deny-all-ingress  (remove the default-deny)",
          "Add `role=frontend` to the frontend Deployment's pod template labels",
        ],
        optionsHe: [
          "kubectl label pod <כל-pod-פרונטאנד> role=frontend  (תייג מחדש Pods בודדים)",
          "kubectl patch networkpolicy allow-frontend -n production  (עדכן from-selector ל-`app=frontend`)",
          "kubectl delete networkpolicy deny-all-ingress  (הסר את ה-default-deny)",
          "הוסף `role=frontend` ל-labels של pod template של Deployment הפרונטאנד",
        ],
        answer: 1,
        explanation:
          "Fix the NetworkPolicy's `from` podSelector to match the actual pod labels (`app=frontend`) using `kubectl patch` or `kubectl edit`. Labelling individual pods is fragile - new Deployment pods won't have it. Deleting deny-all weakens the security posture. Adding the label to Deployment template is also valid but requires a rollout.",
        explanationHe:
          "תקן את ה-podSelector `from` של NetworkPolicy כדי להתאים ל-labels בפועל של Pods (`app=frontend`) באמצעות `kubectl patch` או `kubectl edit`. תיוג Pods בודדים שברירי - Pods חדשים מה-Deployment לא יכילו אותו. מחיקת deny-all מחלישה את עמדת האבטחה. הוספת ה-label ל-template של Deployment תקפה גם כן אך דורשת rollout.",
      },
      {
        prompt:
          "You patched the NetworkPolicy.\n\nHow do you confirm traffic actually flows before declaring the incident resolved?",
        promptHe:
          "עדכנת את ה-NetworkPolicy.\n\nכיצד מאשרים שהתעבורה אכן זורמת לפני הכרזת פתרון האירוע?",
        options: [
          "kubectl run curl-test --image=curlimages/curl -n production --rm -it --restart=Never -- curl backend-svc:8080/health",
          "Wait for real user traffic and monitor error rates",
          "kubectl get endpoints backend-svc -n production",
          "kubectl describe networkpolicy allow-frontend -n production  (read the updated policy)",
        ],
        optionsHe: [
          "kubectl run curl-test --image=curlimages/curl -n production --rm -it --restart=Never -- curl backend-svc:8080/health",
          "להמתין לתעבורת משתמשים אמיתית ולנטר שיעורי שגיאות",
          "kubectl get endpoints backend-svc -n production",
          "kubectl describe networkpolicy allow-frontend -n production  (קרא את המדיניות המעודכנת)",
        ],
        answer: 0,
        explanation:
          "A temporary curl pod inside the same namespace sends actual traffic along the exact path that was broken. This is the only true end-to-end test. Waiting for user traffic risks continued impact. Endpoints check and policy describe are read-only - they can't prove traffic actually flows.",
        explanationHe:
          "הרצת Pod curl זמני בתוך אותו namespace שולחת תעבורה בפועל לאורך הנתיב המדויק שהיה שבור. זוהי הבדיקה היחידה מקצה לקצה האמיתית. המתנה לתעבורת משתמשים מסכנת המשך השפעה. בדיקת endpoints ותיאור מדיניות הם לקריאה בלבד - הם לא יכולים להוכיח שהתעבורה אכן זורמת.",
      },
      {
        prompt:
          "Traffic is restored.\n\nHow do you ensure this label-vs-selector mismatch cannot silently reach production again?",
        promptHe:
          "התעבורה שוחזרה.\n\nכיצד מבטיחים שאי-התאמת label מול selector לא תגיע ל-production שוב בשקט?",
        options: [
          "Ask engineers to manually verify NetworkPolicy selectors after every deployment",
          "Store NetworkPolicies in Git (GitOps), run a policy linter (e.g., Kube-linter) in CI, and validate in staging before production",
          "Disable NetworkPolicy on the cluster",
          "Only apply NetworkPolicies during maintenance windows",
        ],
        optionsHe: [
          "לבקש ממהנדסים לאמת ידנית selectors של NetworkPolicy אחרי כל דיפלוימנט",
          "GitOps לניהול NetworkPolicies, linter (Kube-linter) ב-CI, ואימות ב-staging לפני production",
          "להשבית NetworkPolicy על הקלאסטר",
          "להחיל NetworkPolicies רק במהלך חלונות תחזוקה",
        ],
        answer: 1,
        explanation:
          "GitOps ensures policies are version-controlled and auditable. A CI linter catches selector mismatches before merging. Staging validation catches runtime issues. Manual checks, disabling NetworkPolicy, or limiting application windows all trade reliability and security for convenience.",
        explanationHe:
          "גישת GitOps מבטיחה שמדיניות מנוהלות בגרסאות וניתנות לביקורת. linter ב-CI מאתר אי-התאמות selector לפני מיזוג. אימות ב-staging מאתר בעיות runtime. בדיקות ידניות, השבתת NetworkPolicy, או הגבלת חלונות יישום כולם מסחרים אמינות ואבטחה לנוחות.",
      },
      {
        prompt:
          "The security team asks:\nHow do you validate a new NetworkPolicy enforces exactly what's intended — without causing outages?",
        promptHe:
          "צוות האבטחה שואל:\nכיצד מאמתים ש-NetworkPolicy חדשה אוכפת בדיוק את המיועד — ללא גרימת השבתות?",
        options: [
          "Apply in production and monitor; roll back if issues appear",
          "Read the YAML carefully and trust it is correct",
          "In staging: apply deny-all baseline, add each allow rule incrementally, and verify only intended traffic passes after each rule",
          "Use kubectl dry-run to preview changes",
        ],
        optionsHe: [
          "להחיל ב-production ולנטר; לבצע rollback אם מופיעות בעיות",
          "לקרוא את ה-YAML בקפידה ולבטוח שהוא נכון",
          "ב-staging: deny-all כבסיס ← הוסף כל כלל allow ← אמת שרק התעבורה המיועדת עוברת",
          "להשתמש ב-kubectl dry-run לתצוגה מקדימה של שינויים",
        ],
        answer: 2,
        explanation:
          "The correct validation approach is zero-trust testing in staging: start from deny-all, then add each allow rule and test that only the expected traffic passes. `kubectl dry-run` only checks API validity, not enforcement semantics. Applying in production first risks user impact. Reading YAML doesn't prove enforcement.",
        explanationHe:
          "גישת האימות הנכונה היא בדיקת zero-trust ב-staging: התחל מ-deny-all, הוסף כל כלל allow ובדוק שרק התעבורה המצופה עוברת. `kubectl dry-run` בודק תקפות API בלבד, לא סמנטיקת אכיפה. החלה ב-production תחילה מסכנת השפעה על משתמשים. קריאת YAML לא מוכיחה אכיפה.",
      },
    ],
  },
];
