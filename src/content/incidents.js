// ── Kubernetes Incident Mode Scenarios ───────────────────────────────────────
// Each incident simulates a real production troubleshooting workflow.
// Steps are linear (v1). Each step has:
//   prompt - structured: Title / • Facts / Question (English)
//   promptHe - Hebrew version of prompt
//   options[4] - possible actions (English)
//   optionsHe - Hebrew version of options
//   answer - index of the correct option (0-3)
//   explanation- structured: ✓ correct / → verifies / ✗ others (English)
//   explanationHe - Hebrew explanation

export const INCIDENTS = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. OOMKilled - memory limits too low
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "oom-killed",
    icon: "💥",
    title: "Production API: Endless Restarts Under Load",
    titleHe: "API בפרודקשן: ריסטארטים אינסופיים תחת עומס",
    description: "A critical API pod keeps restarting every 2 minutes under load",
    descriptionHe: "Pod של API קריטי מתאפס כל 2 דקות תחת עומס",
    difficulty: "intermediate",
    estimatedTime: "5-7 min",
    steps: [
      {
        prompt:
          "Restarting Pod: 503 Errors in Production\n\n• `api-server` pod in namespace `production` restarts every 2 minutes\n• Users are reporting intermittent 503 errors\n\nWhat is your first action?",
        promptHe:
          "Pod מתאפס: שגיאות 503 בפרודקשן\n\n• ה-Pod `api-server` ב-namespace `production` מתאפס כל 2 דקות\n• משתמשים מדווחים על שגיאות 503\n\nמה הצעד הראשון שלך?",
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
          "✓ `kubectl get pods` shows current state without causing disruption.\n✗ Deleting the pod or scaling to 0 worsens the outage. Rebooting a node is too drastic before knowing the cause.",
        explanationHe:
          "✓ `kubectl get pods` מציג את המצב הנוכחי מבלי לגרום להפרעה.\n✗ מחיקת Pod או הקטנה ל-0 מחמירה את הנפילה. אתחול Node קיצוני מדי לפני שמבינים את הסיבה.",
      },
      {
        prompt:
          "OOMKilled Status Detected\n\n• Pod `api-server-xyz` shows status `OOMKilled`\n• Restart count: 14\n• Pod age: 2 hours\n\nNAME            READY   STATUS      RESTARTS   AGE\napi-server-xyz  0/1     OOMKilled   14         2h\n\nWhat does OOMKilled mean, and which command gives the most detail?",
        promptHe:
          "זוהה סטטוס OOMKilled\n\n• Pod `api-server-xyz` מציג סטטוס `OOMKilled`\n• מספר אתחולים: 14\n• גיל Pod: שעתיים\n\nNAME            READY   STATUS      RESTARTS   AGE\napi-server-xyz  0/1     OOMKilled   14         2h\n\nמה המשמעות של OOMKilled, ואיזו פקודה תיתן את המידע המפורט ביותר?",
        options: [
          "OOMKilled is a liveness probe failure - check probe config with kubectl edit deployment",
          "OOMKilled means the container exceeded its memory limit - run kubectl describe pod api-server-xyz -n production",
          "OOMKilled means a network timeout - check NetworkPolicy rules",
          "OOMKilled is caused by a bad Docker image - re-pull the image",
        ],
        optionsHe: [
          "OOMKilled = כשל liveness probe, בדוק probe עם kubectl edit deployment",
          "OOMKilled = קונטיינר עבר מגבלת זיכרון, kubectl describe pod api-server-xyz -n production",
          "OOMKilled = timeout ברשת, בדוק NetworkPolicy",
          "OOMKilled = image פגום, משוך מחדש",
        ],
        answer: 1,
        explanation:
          "✓ OOMKilled = Out Of Memory Killed. The Linux kernel terminates the container for exceeding its memory limit.\n→ `kubectl describe pod` shows the exact memory limit, termination reason, and recent events.\n✗ Not a probe failure, network issue, or bad image.",
        explanationHe:
          "✓ OOMKilled = Out Of Memory Killed. ליבת לינוקס ממיתה את הקונטיינר על חריגת מגבלת זיכרון.\n`kubectl describe pod` מציג מגבלת זיכרון, סיבת סיום ואירועים אחרונים.\n✗ לא כשל probe, לא בעיית רשת, לא image פגום.",
      },
      {
        prompt:
          "Memory Limit Too Low\n\n• Container memory limit: 256Mi\n• Exit code: 137 (OOMKilled)\n• Pod keeps crashing under load\n\nHow do you determine the right memory limit?",
        promptHe:
          "מגבלת זיכרון נמוכה מדי\n\n• מגבלת זיכרון קונטיינר: 256Mi\n• קוד יציאה: 137 (OOMKilled)\n• ה-Pod ממשיך לקרוס תחת עומס\n\nכיצד קובעים את מגבלת הזיכרון הנכונה?",
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
          "✓ `kubectl top pod` shows real-time memory consumption. Compare actual usage vs the 256Mi limit.\n→ This tells you exactly how much headroom the pod needs.\n✗ Logs help find leaks, not current usage. Node memory ≠ per-pod usage. HPA controls replica count, not memory.",
        explanationHe:
          "✓ `kubectl top pod` מציג צריכת זיכרון בזמן אמת. השווה שימוש בפועל מול מגבלת 256Mi.\nזה מראה בדיוק כמה מרווח ה-Pod צריך.\n✗ לוגים עוזרים לזהות דליפות, לא שימוש נוכחי. זיכרון Node ≠ שימוש per-pod. HPA שולט ברפליקות, לא בזיכרון.",
      },
      {
        prompt:
          "Choosing the Right Memory Limit\n\n• Idle memory usage: ~240Mi\n• Under load: spikes to 320Mi\n• Current limit: 256Mi. Too low for spikes\n\nWhat is the correct fix?",
        promptHe:
          "בחירת מגבלת הזיכרון הנכונה\n\n• שימוש זיכרון במנוחה: ~240Mi\n• תחת עומס: עולה ל-320Mi\n• מגבלה נוכחית: 256Mi. נמוכה מדי לקפיצות\n\nמה התיקון הנכון?",
        options: [
          "Delete the pod - Kubernetes will recreate it and somehow the memory issue will go away",
          "Increase the memory limit to 512Mi and set request to 256Mi in the Deployment spec",
          "Add a NetworkPolicy to throttle incoming requests",
          "Restart the kubelet on the affected node",
        ],
        optionsHe: [
          "למחוק את ה-Pod. Kubernetes ייצור מחדש, הבעיה תיפתר מאליה",
          "להגדיל את מגבלת הזיכרון ל-512Mi ולהגדיר request ל-256Mi ב-Deployment spec",
          "להוסיף NetworkPolicy לצמצום בקשות נכנסות",
          "לאתחל את ה-kubelet ב-Node המושפע",
        ],
        answer: 1,
        explanation:
          "✓ Set limit=512Mi (ceiling), request=256Mi (guaranteed). Gives headroom for traffic spikes.\n→ Follows K8s best practice: limit ≥ request, Burstable QoS class.\n✗ Deleting pod or restarting kubelet doesn't change limits. NetworkPolicy controls traffic, not memory.",
        explanationHe:
          "✓ הגדר limit=512Mi (תקרה), request=256Mi (מובטח). מאפשר מרווח לקפיצות.\nעומד בנוהלי K8s: limit ≥ request, QoS class Burstable.\n✗ מחיקת Pod או אתחול kubelet לא משנים מגבלות. NetworkPolicy שולטת בתעבורה, לא בזיכרון.",
      },
      {
        prompt:
          "Verifying the Rolling Update\n\n• Deployment patched with new memory limits\n• New limit: 512Mi, request: 256Mi\n• Rolling update in progress\n\nHow do you verify the update succeeded?",
        promptHe:
          "אימות ה-Rolling Update\n\n• ה-Deployment עודכן עם מגבלות זיכרון חדשות\n• מגבלה חדשה: 512Mi, request: 256Mi\n• Rolling update בתהליך\n\nכיצד מוודאים שהעדכון הצליח?",
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
          "כל האמור לעיל: סטטוס rollout + מעקב Pods + Events יחד",
        ],
        answer: 3,
        explanation:
          "✓ All three together give full confidence:\n→ `rollout status` confirms completion. Watch pods confirms Ready. Events reveals scheduling issues.\n✗ Any single command alone misses potential failure modes.",
        explanationHe:
          "✓ כל שלושתם יחד נותנים ביטחון מלא:\n`rollout status` מאשר סיום. מעקב Pods מאשר Ready. Events חושף בעיות תזמון.\n✗ כל פקודה בודדת לבדה מפספסת אופני כשל אפשריים.",
      },
      {
        prompt:
          "Post-Incident: Preventing Recurrence\n\n• Fix applied: memory limit increased to 512Mi\n• Pod stable for 15 minutes, no more OOMKills\n• Incident resolved\n\nWhat should you do before closing the incident?",
        promptHe:
          "לאחר האירוע: מניעת הישנות\n\n• תיקון הוחל: מגבלת זיכרון הוגדלה ל-512Mi\n• Pod יציב 15 דקות, אין עוד OOMKills\n• האירוע נפתר\n\nמה עליך לעשות לפני סגירת האירוע?",
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
          "אין צורך בפעולה: האירוע נפתר",
        ],
        answer: 1,
        explanation:
          "✓ Add memory-usage alert (>80%) + audit all workloads → catches future OOM pressure before outage.\n✗ Unlimited limits removes safety, risks starving other pods. Closing without action guarantees recurrence.",
        explanationHe:
          "✓ הוסף התראת זיכרון (>80%) + בדוק כל עומסי העבודה. כך מאתרים לחץ OOM עתידי לפני השבתה.\n✗ מגבלות ללא הגבלה מסירות רשת ביטחון, מסכנות Pods אחרים. סגירה ללא פעולה מבטיחה הישנות.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. CrashLoopBackOff - missing ConfigMap / env var
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
          "CrashLoopBackOff After New Release\n\n• `payment-service` in namespace `staging` entered CrashLoopBackOff\n• Started 10 minutes after a new release was deployed\n\nWhere do you start?",
        promptHe:
          "CrashLoopBackOff אחרי גרסה חדשה\n\n• `payment-service` ב-namespace `staging` נכנס ל-CrashLoopBackOff\n• התחיל 10 דקות אחרי שגרסה חדשה הוצבה\n\nמאיפה מתחילים?",
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
          "✓ `kubectl get pods` assesses the situation before taking action.\n✗ Rollback without understanding root cause is premature. Same bug may exist on previous version. Deleting namespace = total data loss. Re-applying same YAML won't fix config issues.",
        explanationHe:
          "✓ `kubectl get pods` מעריך את המצב לפני פעולה.\n✗ Rollback ללא הבנת סיבה שורשית הוא מוקדם מדי. אותו באג עלול להיות בגרסה הקודמת. מחיקת namespace = אובדן נתונים מוחלט. החלה מחדש של אותו YAML לא תתקן בעיית config.",
      },
      {
        prompt:
          "Pod Stuck in Crash Loop\n\n• Status: CrashLoopBackOff\n• Restart count: 9\n\nNAME                         STATUS             RESTARTS\npayment-service-7d4b9-abc12  CrashLoopBackOff   9\n\nWhat command reveals the application error?",
        promptHe:
          "Pod תקוע בלולאת קריסה\n\n• סטטוס: CrashLoopBackOff\n• מספר אתחולים: 9\n\nNAME                         STATUS             RESTARTS\npayment-service-7d4b9-abc12  CrashLoopBackOff   9\n\nאיזו פקודה חושפת את שגיאת האפליקציה?",
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
          "✓ `kubectl logs --previous` shows logs from the last crashed container - the startup error.\n→ This is the only way to see what the app printed before crashing.\n✗ `exec` fails on CrashLoopBackOff (exits too fast). `describe` shows events, not app logs. Events are useful but secondary.",
        explanationHe:
          "✓ `kubectl logs --previous` מציג לוגים מהקונטיינר שקרס, את שגיאת ההפעלה.\nזו הדרך היחידה לראות מה האפליקציה הדפיסה לפני הקריסה.\n✗ `exec` נכשל על CrashLoopBackOff (יוצא מהר). `describe` מציג Events, לא לוגים. Events שימושיים אך משניים.",
      },
      {
        prompt:
          "Missing Config File on Startup\n\n• Logs show: `FATAL config file '/etc/app/config.yaml' not found`\n• App expects a mounted config file that doesn't exist\n\nWhat do you check?",
        promptHe:
          "קובץ Config חסר בהפעלה\n\n• לוגים מציגים: `FATAL config file '/etc/app/config.yaml' not found`\n• האפליקציה מצפה לקובץ config שלא קיים\n\nמה בודקים?",
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
          "✓ You need two pieces of info: what the pod spec expects (`describe pod`) and what exists (`get configmap`).\n→ Comparing both reveals the mismatch.\n✗ Either alone is insufficient - you need the expected name AND the actual list.",
        explanationHe:
          "✓ נדרשים שני מקורות: מה ה-pod spec מצפה (`describe pod`) ומה קיים (`get configmap`).\nהשוואת שניהם חושפת את אי-ההתאמה.\n✗ כל אחד לבדו אינו מספיק, צריך את השם המצופה וגם את הרשימה בפועל.",
      },
      {
        prompt:
          "ConfigMap Not Found in Namespace\n\n• Pod spec expects ConfigMap `payment-config`\n• Only ConfigMap in namespace: `app-settings`\n• `payment-config` does not exist here\n\nWhat most likely happened?",
        promptHe:
          "ConfigMap לא נמצא ב-Namespace\n\n• Pod spec מצפה ל-ConfigMap `payment-config`\n• ConfigMap יחיד ב-namespace: `app-settings`\n• `payment-config` לא קיים כאן\n\nמה כנראה קרה?",
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
          "כל האמור לעיל: ה-ConfigMap פשוט אינו קיים ב-namespace הזה",
        ],
        answer: 3,
        explanation:
          "✓ ConfigMaps are namespace-scoped. All three causes are equally valid.\n→ The fix is the same regardless: create `payment-config` in staging.\n✗ You can't determine the exact cause from this info alone, but you can fix it.",
        explanationHe:
          "✓ ConfigMaps מוגדרים לפי namespace. שלוש הסיבות תקפות באותה מידה.\nהתיקון זהה בכל מקרה: צור `payment-config` ב-staging.\n✗ לא ניתן לקבוע את הסיבה המדויקת מהמידע הזה בלבד, אך ניתן לתקן.",
      },
      {
        prompt:
          "Restoring the Missing ConfigMap\n\n• ConfigMap `payment-config` missing in staging\n• Same ConfigMap exists in production\n• Pod needs it to start\n\nWhat is the safest approach?",
        promptHe:
          "שחזור ה-ConfigMap החסר\n\n• ConfigMap `payment-config` חסר ב-staging\n• אותו ConfigMap קיים ב-production\n• ה-Pod צריך אותו כדי לעלות\n\nמה הגישה הבטוחה ביותר?",
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
          "✓ Export from production → replace namespace → apply to staging. Clean and safe.\n→ Gives staging its own copy without affecting production.\n✗ `kubectl cp` is for files inside pods, not K8s objects. Pods can't reference ConfigMaps from other namespaces. Restarting changes nothing.",
        explanationHe:
          "✓ ייצוא מ-production, החלפת namespace, והחלה ב-staging. נקי ובטוח.\nנותן ל-staging עותק משלו בלי להשפיע על production.\n✗ `kubectl cp` לקבצים בתוך Pods, לא לאובייקטי K8s. Pods לא יכולים להפנות ל-ConfigMaps מ-namespace אחר. אתחול לא משנה דבר.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. ImagePullBackOff - private registry auth
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "imagepull-auth",
    icon: "🖼️",
    title: "New Microservice: All Pods Stuck at Startup",
    titleHe: "מיקרו-שירות חדש: כל הפודים תקועים בהפעלה",
    description: "A new Deployment is stuck - pods can't pull the container image",
    descriptionHe: "דיפלוימנט חדש תקוע: פודים לא מצליחים למשוך את הקונטיינר",
    difficulty: "easy",
    estimatedTime: "4-5 min",
    steps: [
      {
        prompt:
          "All Pods Stuck in ImagePullBackOff\n\n• A newly deployed microservice has all pods in `ImagePullBackOff`\n• Other services on the same cluster are healthy\n\nWhat is your first diagnostic step?",
        promptHe:
          "כל ה-Pods תקועים ב-ImagePullBackOff\n\n• מיקרו-שירות חדש, כל ה-Pods במצב `ImagePullBackOff`\n• שירותים אחרים באותו cluster תקינים\n\nמה הצעד האבחוני הראשון?",
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
          "✓ `kubectl describe pod` shows the Events section with the exact pull failure message.\n→ Tells you if it's a missing tag, auth failure, or unreachable registry.\n✗ Only one deployment affected, so nodes are fine. Rebuilding wastes time without knowing the cause.",
        explanationHe:
          "✓ `kubectl describe pod` מציג את חלק ה-Events עם הודעת כשל המשיכה המדויקת.\nמראה אם זה tag חסר, כשל אימות, או registry לא נגיש.\n✗ רק Deployment אחד מושפע, Nodes תקינים. בנייה מחדש מבזבזת זמן ללא ידיעת הסיבה.",
      },
      {
        prompt:
          "Unauthorized Error from Registry\n\n• Image: `registry.company.com/myapp:v2.1`\n• Error: `unauthorized: authentication required`\n• Pod cannot pull the image\n\nWhat does this error indicate?",
        promptHe:
          "שגיאת Unauthorized מה-Registry\n\n• Image: `registry.company.com/myapp:v2.1`\n• שגיאה: `unauthorized: authentication required`\n• ה-Pod לא מצליח למשוך את ה-image\n\nמה מציינת שגיאה זו?",
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
          "✓ `unauthorized: authentication required` = registry is reachable but needs credentials.\n→ The registry responded - it's up and the tag exists.\n✗ Wrong tag → 'not found'. Unreachable → 'connection timeout'. No internet → 'no route to host'.",
        explanationHe:
          "✓ `unauthorized: authentication required` = ה-registry נגיש אך דורש אישורים.\nה-registry הגיב, הוא פעיל וה-tag קיים.\n✗ tag שגוי מחזיר 'not found'. לא נגיש מחזיר 'connection timeout'. אין אינטרנט מחזיר 'no route to host'.",
      },
      {
        prompt:
          "Private Registry Requires Authentication\n\n• Registry: `registry.company.com`\n• Needs username/password to pull images\n• No credentials configured on the cluster\n\nWhat Kubernetes resource holds registry credentials?",
        promptHe:
          "Registry פרטי דורש אימות\n\n• Registry: `registry.company.com`\n• דורש username/password למשיכת images\n• אין אישורים מוגדרים על הקלאסטר\n\nאיזה משאב Kubernetes מיועד לאישורי registry?",
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
          "✓ Registry credentials go in a `kubernetes.io/dockerconfigjson` Secret.\n→ This is the dedicated K8s resource type for container registry auth.\n✗ ConfigMaps aren't for sensitive data. SA tokens authenticate to the K8s API, not registries. RBAC controls K8s permissions.",
        explanationHe:
          "✓ אישורי registry שמורים ב-Secret מסוג `kubernetes.io/dockerconfigjson`.\nזה משאב K8s ייעודי לאימות מול registry.\n✗ ConfigMaps לא לנתונים רגישים. SA tokens מאמתים מול K8s API, לא registries. RBAC שולט בהרשאות K8s.",
      },
      {
        prompt:
          "No Registry Secret in Namespace\n\n• `kubectl get secret -n default` shows no registry-related Secret\n• Need credentials for `registry.company.com`\n\nHow do you create one correctly?",
        promptHe:
          "אין Secret של Registry ב-Namespace\n\n• `kubectl get secret -n default` לא מציג Secret קשור ל-registry\n• צריך אישורים ל-`registry.company.com`\n\nכיצד יוצרים אחד נכון?",
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
          "✓ `kubectl create secret docker-registry` creates a Secret with the correct type and `.dockerconfigjson` format.\n→ This is the official command for registry auth secrets.\n✗ Never store credentials in ConfigMaps or env vars. Secrets are namespace-scoped - can't reference kube-system from default.",
        explanationHe:
          "✓ `kubectl create secret docker-registry` יוצר Secret עם הסוג הנכון ופורמט `.dockerconfigjson`.\nזו הפקודה הרשמית ליצירת secret אימות registry.\n✗ לעולם אל תאחסנו אישורים ב-ConfigMaps או env vars. Secrets מוגדרים לפי namespace, לא ניתן להפנות ל-kube-system מ-default.",
      },
      {
        prompt:
          "Secret Created but Pull Still Fails\n\n• Secret `regcred` created in namespace\n• Deployment still shows ImagePullBackOff\n• Secret exists but isn't being used\n\nWhat critical step did you miss?",
        promptHe:
          "Secret נוצר אך המשיכה עדיין נכשלת\n\n• Secret `regcred` נוצר ב-namespace\n• ה-Deployment עדיין מציג ImagePullBackOff\n• ה-Secret קיים אך לא בשימוש\n\nאיזה צעד קריטי החמצת?",
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
          "✓ K8s does NOT auto-use pull Secrets. You must add `imagePullSecrets: [{name: regcred}]` to the pod spec.\n→ Without this reference, the pod ignores the Secret entirely.\n✗ `create secret docker-registry` already handles base64. Secrets are namespace-scoped, not node-scoped.",
        explanationHe:
          "✓ K8s לא משתמש אוטומטית ב-pull Secrets. חובה להוסיף `imagePullSecrets: [{name: regcred}]` ל-pod spec.\nבלי הפניה זו, ה-Pod מתעלם מה-Secret לחלוטין.\n✗ `create secret docker-registry` כבר מטפל ב-base64. Secrets מוגדרים לפי namespace, לא per-node.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Service unreachable - wrong selector / port mismatch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "service-no-endpoints",
    icon: "🔌",
    title: "Frontend to Backend: Connection Refused",
    titleHe: "פרונטאנד לבאקאנד: חיבור נדחה",
    description: "Frontend gets 'connection refused' calling the backend - pods look healthy",
    descriptionHe: "הפרונטאנד מקבל 'connection refused' מהבאקאנד, פודים נראים תקינים",
    difficulty: "intermediate",
    estimatedTime: "5-7 min",
    steps: [
      {
        prompt:
          "Connection Refused - Backend Unreachable\n\n• Frontend cannot reach backend API - 'connection refused'\n• Both frontend and backend pods: Running/Ready\n• Error started after a recent deployment\n\nWhere do you start?",
        promptHe:
          "חיבור נדחה: Backend לא נגיש\n\n• הפרונטאנד לא מצליח להגיע ל-API הבאקאנד: 'connection refused'\n• Pods של frontend ו-backend: Running/Ready\n• השגיאה התחילה אחרי דיפלוימנט אחרון\n\nמאיפה מתחילים?",
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
          "✓ Pods healthy + Service unreachable → issue is in Service config (selector, port, targetPort).\n→ Inspect the Service first, before any destructive action.\n✗ Restarting or deleting won't fix a misconfigured Service. Nodes are irrelevant if pods are Running.",
        explanationHe:
          "✓ Pods תקינים + Service לא נגיש: הבעיה בהגדרת Service (selector, port, targetPort).\nבדוק את ה-Service קודם, לפני כל פעולה הרסנית.\n✗ אתחול או מחיקה לא יתקנו Service שגוי. Nodes לא רלוונטיים אם Pods רצים.",
      },
      {
        prompt:
          "Service Exists but Traffic Fails\n\n• Service exists with ClusterIP\n• Port 80 exposed\n• Pods are Running\n\nWhat is the single most diagnostic command?",
        promptHe:
          "Service קיים אך התעבורה נכשלת\n\n• Service קיים עם ClusterIP\n• פורט 80 חשוף\n• Pods רצים\n\nמהי הפקודה האבחונית ביותר?",
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
          "✓ `kubectl get endpoints` shows if the Service matched any pods.\n→ Empty endpoints (`<none>`) = selector mismatch - the #1 cause of 'connection refused' when pods are healthy.\n✗ Ingress, nodes, and PVCs are unrelated to Service→Pod routing.",
        explanationHe:
          "✓ `kubectl get endpoints` מראה אם ה-Service התאים ל-Pods כלשהם.\nEndpoints ריקים (`<none>`) = אי-התאמת selector, הסיבה #1 ל-'connection refused' כשה-Pods תקינים.\n✗ Ingress, Nodes ו-PVCs לא קשורים לניתוב בין Service ל-Pod.",
      },
      {
        prompt:
          "Endpoints Are Empty\n\n• Endpoints: `<none>`\n• Service exists, pods exist, but they're not connected\n\nWhat do you do next?",
        promptHe:
          "Endpoints ריקים\n\n• Endpoints: `<none>`\n• Service קיים, Pods קיימים, אך לא מחוברים\n\nמה הצעד הבא?",
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
          "✓ Compare what the Service expects (`describe svc` → Selector) with actual pod labels (`--show-labels`).\n→ Side-by-side comparison reveals the mismatch instantly.\n✗ Neither alone is sufficient - you need both the expected and actual values.",
        explanationHe:
          "✓ השווה מה ה-Service מצפה (`describe svc`: Selector) ל-labels בפועל (`--show-labels`).\nהשוואה זה לצד זה חושפת את אי-ההתאמה מיידית.\n✗ אף אחד לבדו אינו מספיק, צריך גם את הערך המצופה וגם את הערך בפועל.",
      },
      {
        prompt:
          "Selector Mismatch Found\n\n• Service selector: `app=backend`\n• Actual pod labels: `app=backend-v2`\n• Label was changed in last deployment, Service not updated\n\nWhat is the fix?",
        promptHe:
          "נמצאה אי-התאמת Selector\n\n• Selector של Service: `app=backend`\n• Labels בפועל על Pods: `app=backend-v2`\n• ה-label שונה בדיפלוימנט האחרון, ה-Service לא עודכן\n\nמה התיקון?",
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
          "✓ `kubectl patch svc` atomically updates the selector - zero downtime.\n→ Immediately connects the Service to the correct pods.\n✗ Manual pod labels are fragile (new pods won't have them). Delete+recreate causes downtime. Annotations don't affect routing.",
        explanationHe:
          "✓ `kubectl patch svc` מעדכן אטומית את ה-selector, ללא השבתה.\nמחבר מיידית את ה-Service ל-Pods הנכונים.\n✗ Labels ידניים שבריריים (Pods חדשים לא יכילו אותם). מחיקה+יצירה גורמת להשבתה. Annotations לא משפיעים על ניתוב.",
      },
      {
        prompt:
          "Verifying the Selector Patch\n\n• Selector updated to `app=backend-v2`\n• Need to confirm traffic flows end-to-end\n\nHow do you verify?",
        promptHe:
          "אימות עדכון ה-Selector\n\n• Selector עודכן ל-`app=backend-v2`\n• צריך לאשר שהתעבורה זורמת מקצה לקצה\n\nכיצד מאשרים?",
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
          "✓ Endpoints populated proves selector matches. Live `curl` proves traffic actually reaches the backend.\n→ Both together confirm the full fix - endpoints can exist but a NetworkPolicy could still block.\n✗ Pod status alone doesn't prove connectivity.",
        explanationHe:
          "✓ Endpoints מאוכלסים מוכיח ש-selector תואם. `curl` חי מוכיח שתעבורה מגיעה לבאקאנד.\nשניהם יחד מאשרים תיקון מלא, endpoints יכולים להיות מאוכלסים אך NetworkPolicy עלולה לחסום.\n✗ סטטוס Pod לבדו לא מוכיח קישוריות.",
      },
      {
        prompt:
          "Post-Incident: Preventing Selector Drift\n\n• Traffic restored, incident resolved\n• Root cause: selector mismatch (label changed, Service not updated)\n\nWhat prevents this from reaching production again?",
        promptHe:
          "לאחר האירוע: מניעת סטיית Selector\n\n• תעבורה שוחזרה, אירוע נפתר\n• סיבה שורשית: אי-התאמת selector (label שונה, Service לא עודכן)\n\nמה ימנע את זה מלהגיע ל-production שוב?",
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
          "✓ Helm/Kustomize keeps labels and selectors in sync (single source of truth). Endpoint-ready alert catches issues instantly.\n✗ Manual checks and comments are error-prone. NodePort doesn't address selector matching.",
        explanationHe:
          "✓ Helm/Kustomize שומר labels ו-selectors מסונכרנים (מקור אמת אחד). התראת endpoint-ready מאתרת בעיות מיידית.\n✗ בדיקות ידניות והערות נוטות לשגיאה. NodePort לא פותר התאמת selector.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. DNS resolution failures - CoreDNS OOMKilled
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "dns-coredns",
    icon: "🌐",
    title: "Cascading Failures: Services Can't Find Each Other",
    titleHe: "כשלים מדורגים: שירותים לא מוצאים אחד את השני",
    description: "Multiple services can't resolve each other by hostname - widespread outage",
    descriptionHe: "שירותים מרובים לא מצליחים לפתור שמות, השבתה נרחבת",
    difficulty: "hard",
    estimatedTime: "7-9 min",
    steps: [
      {
        prompt:
          "Cluster-Wide DNS Failure\n\n• Multiple apps log 'no such host' errors\n• DNS appears broken across the entire cluster\n\nHow do you confirm the DNS issue?",
        promptHe:
          "כשל DNS ברחבי הקלאסטר\n\n• אפליקציות מרובות מתעדות 'no such host'\n• ה-DNS נראה שבור בכל הקלאסטר\n\nכיצד מאשרים את בעיית ה-DNS?",
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
          "✓ `nslookup kubernetes.default` tests the most fundamental in-cluster DNS entry.\n→ Confirms the problem is cluster DNS, not individual app configs.\n✗ Cloud DNS (Route53) handles external names, not K8s service discovery. Restarting all pods = massive downtime.",
        explanationHe:
          "✓ `nslookup kubernetes.default` בודק את רשומת ה-DNS הפנימית הבסיסית ביותר.\nמאשר שהבעיה היא DNS קלאסטרי, לא הגדרות אפליקציה.\n✗ Cloud DNS (Route53) לשמות חיצוניים, לא לגילוי שירותים. אתחול כל ה-Pods = השבתה מסיבית.",
      },
      {
        prompt:
          "DNS Resolution Returns NXDOMAIN\n\n• `nslookup kubernetes.default` returns NXDOMAIN\n• Cluster DNS confirmed non-functional\n\nWhere does Kubernetes cluster DNS run?",
        promptHe:
          "פתרון DNS מחזיר NXDOMAIN\n\n• `nslookup kubernetes.default` מחזיר NXDOMAIN\n• DNS קלאסטרי אושר כלא-פעיל\n\nהיכן רץ ה-DNS של cluster Kubernetes?",
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
          "✓ CoreDNS pods in `kube-system` handle all in-cluster service discovery.\n→ If they're unhealthy, all DNS resolution fails cluster-wide.\n✗ It's not a node daemon, not in etcd, and not a sidecar.",
        explanationHe:
          "✓ Pods של CoreDNS ב-`kube-system` מטפלים בכל גילוי השירותים הפנימי.\nאם הם לא תקינים, כל פתרון ה-DNS נכשל בכל הקלאסטר.\n✗ זה לא daemon של Node, לא ב-etcd, ולא sidecar.",
      },
      {
        prompt:
          "CoreDNS Pods Crashing - OOMKilled\n\n• Both CoreDNS pods show status OOMKilled\n• Each has restarted 7 times\n\nNAME              STATUS      RESTARTS\ncoredns-abc12     OOMKilled   7\ncoredns-def34     OOMKilled   7\n\nWhat should you do before changing anything?",
        promptHe:
          "Pods של CoreDNS קורסים: OOMKilled\n\n• שני Pods של CoreDNS מציגים סטטוס OOMKilled\n• כל אחד אותחל 7 פעמים\n\nNAME              STATUS      RESTARTS\ncoredns-abc12     OOMKilled   7\ncoredns-def34     OOMKilled   7\n\nמה יש לעשות לפני שמשנים דבר?",
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
          "✓ Check both the limit (`describe`) and actual usage (`top`) to decide the new limit.\n→ Data-driven decisions prevent setting incorrect limits.\n✗ Deleting pods restarts them into the same OOMKill cycle immediately.",
        explanationHe:
          "✓ בדוק גם את המגבלה (`describe`) וגם את השימוש בפועל (`top`) כדי להחליט על מגבלה חדשה.\nהחלטות מבוססות-נתונים מונעות הגדרת מגבלות שגויות.\n✗ מחיקת Pods מאתחלת אותם למחזור OOMKill זהה מיידית.",
      },
      {
        prompt:
          "CoreDNS Memory at 99% of Limit\n\n• Memory limit: 170Mi\n• Current usage: 168Mi (99% of limit)\n• Cluster recently scaled from 20 to 80 nodes\n\nWhat is the likely root cause?",
        promptHe:
          "זיכרון CoreDNS ב-99% מהמגבלה\n\n• מגבלת זיכרון: 170Mi\n• שימוש נוכחי: 168Mi (99% מהמגבלה)\n• הקלאסטר גדל לאחרונה מ-20 ל-80 Nodes\n\nמה הסיבה השורשית הסבירה?",
        options: [
          "A memory leak in the CoreDNS binary - upgrade CoreDNS immediately",
          "The cluster grew significantly; CoreDNS caches DNS records for many more Services and Pods now, requiring more memory",
          "The CoreDNS ConfigMap is corrupt - restore it from backup",
          "The underlying node is overloaded and swapping memory",
        ],
        optionsHe: [
          "דליפת זיכרון בבינארי של CoreDNS, שדרג CoreDNS מיידית",
          "הקלאסטר גדל פי 4, CoreDNS צריך יותר זיכרון לשמירת רשומות עבור Services ו-Pods הנוספים",
          "ה-ConfigMap של CoreDNS פגום, שחזר מגיבוי",
          "ה-Node הבסיסי עמוס ומחליף זיכרון (swapping)",
        ],
        answer: 1,
        explanation:
          "✓ CoreDNS memory scales with cluster size - more Services/Pods = larger DNS cache.\n→ At 4× cluster size, 170Mi is no longer enough.\n✗ Corrupt config → errors, not gradual memory growth. Node swap affects all pods equally, not just CoreDNS.",
        explanationHe:
          "✓ זיכרון CoreDNS גדל עם גודל הקלאסטר, יותר Services/Pods = cache DNS גדול יותר.\nבגודל קלאסטר פי 4, 170Mi כבר לא מספיק.\n✗ קונפיגורציה פגומה גורמת לשגיאות, לא גדילת זיכרון הדרגתית. swap ב-Node משפיע על כל ה-Pods בשווה.",
      },
      {
        prompt:
          "Increasing CoreDNS Memory Safely\n\n• Root cause: cluster growth outgrew memory limit\n• Need to increase limit without DNS blackout\n• CoreDNS is a critical system component\n\nHow do you do this safely?",
        promptHe:
          "הגדלת זיכרון CoreDNS בבטחה\n\n• סיבה שורשית: הקלאסטר גדל מעבר למגבלת הזיכרון\n• צריך להגדיל מגבלה ללא השבתת DNS\n• CoreDNS הוא רכיב מערכת קריטי\n\nכיצד עושים זאת בבטחה?",
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
          "✓ `kubectl edit deployment` triggers a rolling update - one pod restarts at a time, DNS stays available.\n→ Safe, zero-downtime approach for system-critical pods.\n✗ Deleting the deployment = total DNS outage. More nodes doesn't fix per-pod memory limits.",
        explanationHe:
          "✓ `kubectl edit deployment` מפעיל rolling update, Pod אחד בכל פעם, DNS נשאר זמין.\nגישה בטוחה ללא השבתה עבור Pods קריטיים למערכת.\n✗ מחיקת Deployment = השבתת DNS מוחלטת. יותר Nodes לא מתקן מגבלת זיכרון per-pod.",
      },
      {
        prompt:
          "Verifying DNS Restoration\n\n• CoreDNS memory limit increased to 512Mi\n• Pods show Running status\n• Need to confirm DNS is fully functional\n\nHow do you verify DNS is fully restored?",
        promptHe:
          "אימות שחזור DNS\n\n• מגבלת זיכרון CoreDNS הוגדלה ל-512Mi\n• Pods מציגים סטטוס Running\n• צריך לאשר ש-DNS פעיל לחלוטין\n\nכיצד מאמתים ש-DNS שוחזר לחלוטין?",
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
          "כל האמור לעיל: Pods תקינים + אין שגיאות בלוג + בדיקת פתרון DNS הצליחה",
        ],
        answer: 3,
        explanation:
          "✓ Full DNS health check: Running pods + clean logs + successful resolution test.\n→ A pod can be Running but serve degraded results if cache is corrupted.\n✗ Any single check alone can miss failure modes.",
        explanationHe:
          "✓ בדיקת DNS מלאה: Pods רצים + לוגים נקיים + בדיקת פתרון מוצלחת.\nPod יכול להיות Running אך לשרת תוצאות מדורדרות אם ה-cache פגום.\n✗ כל בדיקה בודדת יכולה לפספס אופני כשל.",
      },
      {
        prompt:
          "Post-Incident: DNS Monitoring Strategy\n\n• DNS restored and stable\n• Root cause: cluster growth outgrew CoreDNS memory limit\n\nWhat monitoring prevents this from happening silently again?",
        promptHe:
          "לאחר האירוע: אסטרטגיית ניטור DNS\n\n• DNS שוחזר ויציב\n• סיבה שורשית: גדילת קלאסטר חרגה ממגבלת זיכרון CoreDNS\n\nאיזה ניטור ימנע את זה מלהיכשל שוב בשקט?",
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
          "כל שלושתם: לחץ זיכרון, אתחולים ועיכוב כולם מעידים על ירידה בבריאות DNS",
        ],
        answer: 3,
        explanation:
          "✓ All three signals together: memory approaching limit, pod restarts, and query latency.\n→ Monitoring only one leaves you blind to other failure modes.\n✗ This incident showed that memory can degrade silently without restarts initially.",
        explanationHe:
          "✓ כל שלושת האותות יחד: זיכרון מתקרב למגבלה, אתחולי Pod ועיכוב שאילתא.\nניטור אות אחד בלבד משאיר עיוור לאופני כשל אחרים.\n✗ אירוע זה הדגים שזיכרון יכול להתדרדר בשקט בלי אתחולים בהתחלה.",
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
          "Silent Timeouts After Security Update\n\n• Frontend-to-backend calls silently time out\n• Security team just applied new NetworkPolicies\n• Both frontend and backend pods: Running/Ready\n\nWhat do you check first?",
        promptHe:
          "Timeout שקט אחרי עדכון אבטחה\n\n• קריאות מ-frontend ל-backend מסתיימות ב-timeout בשקט\n• צוות אבטחה החיל NetworkPolicies חדשות\n• Pods של frontend ו-backend: Running/Ready\n\nמה בודקים קודם?",
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
          "✓ Incident correlates with a NetworkPolicy change - inspect the policies first.\n✗ Removing all policies (`--all`) eliminates security posture. Rolling back backend won't fix a network-layer issue. Pod health already confirmed.",
        explanationHe:
          "✓ האירוע מתואם לשינוי NetworkPolicy, בדוק את המדיניות קודם.\n✗ הסרת כל המדיניות (`--all`) מסירה את עמדת האבטחה. Rollback לבאקאנד לא יתקן בעיית שכבת רשת. תקינות Pods כבר אושרה.",
      },
      {
        prompt:
          "Inspecting NetworkPolicy Rules\n\n• Policies found: `deny-all-ingress`, `allow-frontend`\n• Need to understand what each policy permits\n\nHow do you inspect the rules?",
        promptHe:
          "בדיקת כללי NetworkPolicy\n\n• Policies שנמצאו: `deny-all-ingress`, `allow-frontend`\n• צריך להבין מה כל policy מתירה\n\nכיצד בודקים את הכללים?",
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
          "✓ `kubectl describe networkpolicy` shows podSelector and ingress/egress rules in readable format.\n→ This is the fastest way to read what each policy permits.\n✗ NetworkPolicy controllers don't expose user logs. Events lack rule details. iptables requires root and is hard to interpret.",
        explanationHe:
          "✓ `kubectl describe networkpolicy` מציג podSelector וכללי ingress/egress בפורמט קריא.\nזו הדרך המהירה ביותר לקרוא מה כל policy מתירה.\n✗ בקרי NetworkPolicy לא חושפים לוגים. Events חסרי פרטי כללים. iptables דורש root ומורכב לפרשנות.",
      },
      {
        prompt:
          "Suspect Label Mismatch in Policy\n\n• `allow-frontend` targets backend pods, allows ingress from `role=frontend`\n• `deny-all-ingress` blocks all other traffic\n\nWhat must you check?",
        promptHe:
          "חשד לאי-התאמת Labels ב-Policy\n\n• `allow-frontend` מטרגטת Pods של backend, מתירה ingress מ-`role=frontend`\n• `deny-all-ingress` חוסמת כל תעבורה אחרת\n\nמה חייבים לבדוק?",
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
          "✓ NetworkPolicies match pods by labels. If frontend pods lack `role=frontend`, the allow rule won't match them.\n→ Verify actual pod labels before modifying any policy.\n✗ Deleting deny-all weakens security. Services and deployment details won't reveal the label mismatch.",
        explanationHe:
          "✓ NetworkPolicies מתאימים Pods לפי labels. אם Pods של frontend חסרים `role=frontend`, כלל ה-allow לא יתאים.\nאמת labels בפועל לפני שינוי מדיניות.\n✗ מחיקת deny-all מחלישה אבטחה. Services ופרטי Deployment לא יחשפו אי-התאמת labels.",
      },
      {
        prompt:
          "Label Mismatch Confirmed\n\n• Policy expects: `role=frontend`\n• Actual pod labels: `app=frontend`\n• Frontend traffic blocked by deny-all\n\nWhat is the correct fix?",
        promptHe:
          "אי-התאמת Labels אושרה\n\n• Policy מצפה ל: `role=frontend`\n• Labels בפועל: `app=frontend`\n• תעבורת frontend חסומה על ידי deny-all\n\nמה התיקון הנכון?",
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
          "✓ `kubectl patch networkpolicy` updates the from-selector to match actual labels (`app=frontend`).\n→ Immediate fix, no rollout needed.\n✗ Manual pod labels are fragile. Deleting deny-all weakens security. Adding Deployment labels requires a rollout.",
        explanationHe:
          "✓ `kubectl patch networkpolicy` מעדכן את ה-from-selector להתאים ל-labels בפועל (`app=frontend`).\nתיקון מיידי, ללא צורך ב-rollout.\n✗ Labels ידניים שבריריים. מחיקת deny-all מחלישה אבטחה. הוספת labels ל-Deployment דורשת rollout.",
      },
      {
        prompt:
          "Verifying the Policy Patch\n\n• from-selector updated to `app=frontend`\n• Need to confirm traffic flows before declaring resolved\n\nHow do you verify?",
        promptHe:
          "אימות עדכון ה-Policy\n\n• from-selector עודכן ל-`app=frontend`\n• צריך לאשר שהתעבורה זורמת לפני הכרזת פתרון\n\nכיצד מאמתים?",
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
          "✓ A temporary curl pod sends real traffic along the exact broken path - true end-to-end test.\n→ This is the only test that proves traffic actually flows through the policy.\n✗ Waiting risks continued impact. Endpoints and describe are read-only - can't prove traffic flows.",
        explanationHe:
          "✓ Pod curl זמני שולח תעבורה בפועל לאורך הנתיב שהיה שבור, בדיקת end-to-end אמיתית.\nזו הבדיקה היחידה שמוכיחה שתעבורה עוברת דרך ה-policy.\n✗ המתנה מסכנת המשך השפעה. Endpoints ו-describe לקריאה בלבד, לא מוכיחים תעבורה.",
      },
      {
        prompt:
          "Post-Incident: Preventing Policy Drift\n\n• Traffic restored\n• Root cause: label mismatch in NetworkPolicy\n\nHow do you ensure this cannot silently reach production again?",
        promptHe:
          "לאחר האירוע: מניעת סטיית Policy\n\n• תעבורה שוחזרה\n• סיבה שורשית: אי-התאמת labels ב-NetworkPolicy\n\nכיצד מבטיחים שזה לא יגיע ל-production שוב בשקט?",
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
          "✓ GitOps = version-controlled + auditable. CI linter catches mismatches before merge. Staging validates runtime.\n→ Automated checks eliminate human error.\n✗ Manual checks and comments are error-prone. Disabling NetworkPolicy removes security entirely.",
        explanationHe:
          "✓ GitOps = ניהול גרסאות + ביקורתיות. Linter ב-CI מאתר אי-התאמות לפני מיזוג. Staging מאמת runtime.\nבדיקות אוטומטיות מבטלות טעויות אנוש.\n✗ בדיקות ידניות נוטות לשגיאה. השבתת NetworkPolicy מסירה אבטחה לחלוטין.",
      },
      {
        prompt:
          "Security Team Question: Validating Policies Safely\n\n• A new NetworkPolicy needs to be deployed\n• Must enforce exactly what's intended\n• Cannot cause outages\n\nHow do you validate a new NetworkPolicy without causing outages?",
        promptHe:
          "שאלת צוות אבטחה: אימות Policies בבטחה\n\n• NetworkPolicy חדשה צריכה להיות מוצבת\n• חייבת לאכוף בדיוק את המיועד\n• לא יכולה לגרום להשבתות\n\nכיצד מאמתים ש-NetworkPolicy חדשה אוכפת בדיוק את המיועד, ללא השבתות?",
        options: [
          "Apply in production and monitor; roll back if issues appear",
          "Read the YAML carefully and trust it is correct",
          "In staging: apply deny-all baseline, add each allow rule incrementally, and verify only intended traffic passes after each rule",
          "Use kubectl dry-run to preview changes",
        ],
        optionsHe: [
          "להחיל ב-production ולנטר; לבצע rollback אם מופיעות בעיות",
          "לקרוא את ה-YAML בקפידה ולבטוח שהוא נכון",
          "ב-staging: התחל עם deny-all, הוסף כל כלל allow, ואמת שרק התעבורה המיועדת עוברת",
          "להשתמש ב-kubectl dry-run לתצוגה מקדימה של שינויים",
        ],
        answer: 2,
        explanation:
          "✓ Zero-trust testing in staging: deny-all → add each allow → test that only expected traffic passes.\n→ Proves enforcement, not just syntax.\n✗ `dry-run` only checks API validity. Production-first risks user impact. Reading YAML doesn't prove enforcement.",
        explanationHe:
          "✓ בדיקת zero-trust ב-staging: התחל עם deny-all, הוסף כל allow, ובדוק שרק התעבורה המצופה עוברת.\nמוכיח אכיפה, לא רק תחביר.\n✗ `dry-run` בודק תקפות API בלבד. Production-first מסכן משתמשים. קריאת YAML לא מוכיחה אכיפה.",
      },
    ],
  },
];
