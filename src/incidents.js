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
    title: "API Service OOMKilled in Production",
    titleHe: "שירות API — OOMKilled בפרודקשן",
    description: "A critical API pod keeps restarting every 2 minutes under load",
    descriptionHe: "Pod של API קריטי מתאפס כל 2 דקות תחת עומס",
    difficulty: "medium",
    estimatedTime: "5-7 min",
    steps: [
      {
        prompt:
          "🚨 PagerDuty alert: `api-server` pod in namespace `production` is restarting every 2 minutes. End users are seeing 503 errors. What is your first action?",
        promptHe:
          "🚨 התראת PagerDuty: ה-Pod של `api-server` ב-namespace `production` מתאפס כל 2 דקות. משתמשים מקבלים שגיאות 503. מה הצעד הראשון שלך?",
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
          "`kubectl get pods` מציג את המצב הנוכחי מבלי לגרום להפרעה כלשהי. מחיקת ה-Pod או הקטנה ל-0 תחמיר את הנפילה. אתחול Node הוא צעד קיצוני בהרבה לפני שמבינים את הסיבה.",
      },
      {
        prompt:
          "kubectl get pods -n production returns:\n\nNAME            READY   STATUS      RESTARTS   AGE\napi-server-xyz  0/1     OOMKilled   14         2h\n\nWhat does OOMKilled specifically mean and what command gives you the most detail?",
        promptHe:
          "kubectl get pods -n production מחזיר:\n\nNAME            READY   STATUS      RESTARTS   AGE\napi-server-xyz  0/1     OOMKilled   14         2h\n\nמה המשמעות של OOMKilled ואיזה פקודה מספקת את המידע המלא ביותר?",
        options: [
          "OOMKilled is a liveness probe failure — check probe config with kubectl edit deployment",
          "OOMKilled means the container exceeded its memory limit — run kubectl describe pod api-server-xyz -n production",
          "OOMKilled means a network timeout — check NetworkPolicy rules",
          "OOMKilled is caused by a bad Docker image — re-pull the image",
        ],
        optionsHe: [
          "OOMKilled הוא כשל של liveness probe — בדוק הגדרות probe עם kubectl edit deployment",
          "OOMKilled אומר שהקונטיינר עבר את מגבלת הזיכרון — הרץ kubectl describe pod api-server-xyz -n production",
          "OOMKilled פירושו timeout ברשת — בדוק כללי NetworkPolicy",
          "OOMKilled נגרם מ-image פגום — משוך מחדש את ה-image",
        ],
        answer: 1,
        explanation:
          "OOMKilled (Out Of Memory Killed) is set by the Linux kernel when a container breaches its memory limit. `kubectl describe pod` reveals the exact memory limit, the OOMKilled termination reason, and recent events — everything needed for diagnosis.",
        explanationHe:
          "OOMKilled (Out Of Memory Killed) מוגדר על ידי ליבת לינוקס כאשר קונטיינר עובר את מגבלת הזיכרון שלו. `kubectl describe pod` מציג את מגבלת הזיכרון המדויקת, סיבת הסיום OOMKilled ואירועים אחרונים — כל מה שנדרש לאבחון.",
      },
      {
        prompt:
          "kubectl describe pod api-server-xyz -n production shows:\n\n  Limits:\n    memory: 256Mi\n  Last State:\n    Reason: OOMKilled\n    Exit Code: 137\n\nHow do you determine the right memory limit to set?",
        promptHe:
          "kubectl describe pod api-server-xyz -n production מציג:\n\n  Limits:\n    memory: 256Mi\n  Last State:\n    Reason: OOMKilled\n    Exit Code: 137\n\nכיצד קובעים את מגבלת הזיכרון הנכונה להגדיר?",
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
          "`kubectl top pod` shows real-time memory consumption. You need to compare actual usage against the 256Mi limit to set a realistic new limit. Logs help find leaks but not current memory levels. Node capacity and HPA are secondary concerns.",
        explanationHe:
          "`kubectl top pod` מציג צריכת זיכרון בזמן אמת. יש להשוות שימוש בפועל מול מגבלת 256Mi כדי לקבוע מגבלה ריאלית חדשה. לוגים עוזרים לזהות דליפות אך לא את רמות הזיכרון הנוכחיות. קיבולת Node ו-HPA הם שיקולים משניים.",
      },
      {
        prompt:
          "kubectl top pod shows `api-server-xyz` using ~240Mi at idle, spiking to 320Mi under load. The current limit is 256Mi. What is the correct fix?",
        promptHe:
          "kubectl top pod מראה שהשימוש של `api-server-xyz` הוא כ-240Mi במצב מנוחה, ועולה ל-320Mi תחת עומס. המגבלה הנוכחית היא 256Mi. מה התיקון הנכון?",
        options: [
          "Delete the pod — Kubernetes will recreate it and somehow the memory issue will go away",
          "Increase the memory limit to 512Mi and set request to 256Mi in the Deployment spec",
          "Add a NetworkPolicy to throttle incoming requests",
          "Restart the kubelet on the affected node",
        ],
        optionsHe: [
          "למחוק את ה-Pod — Kubernetes ייצור אותו מחדש ובאיזשהו אופן בעיית הזיכרון תיעלם",
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
          "You patch the Deployment with the new memory limits. How do you verify the rolling update succeeds and the pod no longer OOMKills?",
        promptHe:
          "עדכנת את ה-Deployment עם מגבלות הזיכרון החדשות. כיצד מאמתים שה-rolling update הצליח וה-Pod אינו עוד מקבל OOMKill?",
        options: [
          "kubectl rollout status deployment/api-server -n production",
          "kubectl get pods -n production -w  (watch pod restarts)",
          "kubectl get events -n production --sort-by=.metadata.creationTimestamp",
          "All of the above — rollout status + watching pods + events together",
        ],
        optionsHe: [
          "kubectl rollout status deployment/api-server -n production",
          "kubectl get pods -n production -w  (עקוב אחר אתחולי Pod)",
          "kubectl get events -n production --sort-by=.metadata.creationTimestamp",
          "כל האמור לעיל — סטטוס rollout + מעקב Pods + Events יחד",
        ],
        answer: 3,
        explanation:
          "`kubectl rollout status` confirms the rollout completes. Watching pods shows the new pod becomes Ready. Events reveal any scheduling or startup issues. Using all three gives full confidence the fix worked.",
        explanationHe:
          "`kubectl rollout status` מאשר שה-rollout הושלם. מעקב ה-Pods מציג שה-Pod החדש הפך ל-Ready. Events חושפים כל בעיית תזמון או הפעלה. שימוש בשלושתם יחד מספק ביטחון מלא שהתיקון עבד.",
      },
      {
        prompt:
          "The new pod has been stable for 15 minutes. What should you do before closing the incident to prevent recurrence?",
        promptHe:
          "ה-Pod החדש יציב כבר 15 דקות. מה עליך לעשות לפני סגירת האירוע כדי למנוע הישנות?",
        options: [
          "Increase all node sizes immediately as a precaution",
          "Add a Prometheus alert on memory usage > 80% of limit, and audit resource limits on all other Deployments",
          "Set memory limit to unlimited so it never OOMKills again",
          "No action needed — the incident is resolved",
        ],
        optionsHe: [
          "להגדיל את גודל כל ה-Nodes מיידית כאמצעי זהירות",
          "להוסיף התראת Prometheus על שימוש בזיכרון > 80% מהמגבלה, ולבדוק מגבלות משאבים בכל ה-Deployments האחרים",
          "להגדיר מגבלת זיכרון ללא הגבלה כדי שלא יהיה יותר OOMKill",
          "אין צורך בפעולה — האירוע נפתר",
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
    title: "CrashLoopBackOff: Missing Configuration",
    titleHe: "CrashLoopBackOff: קונפיגורציה חסרה",
    description: "A payment service crashes immediately after a new deployment shipped",
    descriptionHe: "שירות תשלומים קורס מיידית אחרי דיפלוימנט חדש",
    difficulty: "easy",
    estimatedTime: "4-5 min",
    steps: [
      {
        prompt:
          "🚨 Alert: `payment-service` in namespace `staging` entered CrashLoopBackOff 10 minutes after a new release was deployed. The on-call engineer asks for a quick diagnosis. Where do you start?",
        promptHe:
          "🚨 התראה: `payment-service` ב-namespace `staging` נכנס ל-CrashLoopBackOff 10 דקות אחרי שגרסה חדשה הוצבה. המהנדס התורן מבקש אבחון מהיר. מאיפה מתחילים?",
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
          "Start by assessing the situation with `kubectl get pods`. Rolling back without understanding the root cause is premature — the same bug may exist on the previous version too. Deleting the namespace causes total data loss. Re-applying the same YAML won't fix an unfound config issue.",
        explanationHe:
          "התחל בהערכת המצב עם `kubectl get pods`. rollback ללא הבנת הסיבה השורשית הוא צעד מוקדם מדי — אותו באג עלול להתקיים גם בגרסה הקודמת. מחיקת ה-namespace גורמת לאובדן נתונים מוחלט. החלה מחדש של אותו YAML לא תתקן בעיית קונפיגורציה שלא אותרה.",
      },
      {
        prompt:
          "kubectl get pods -n staging:\n\nNAME                         STATUS             RESTARTS\npayment-service-7d4b9-abc12  CrashLoopBackOff   9\n\nThe pod is crashing repeatedly. What command reveals the application error?",
        promptHe:
          "kubectl get pods -n staging:\n\nNAME                         STATUS             RESTARTS\npayment-service-7d4b9-abc12  CrashLoopBackOff   9\n\nה-Pod קורס שוב ושוב. איזו פקודה חושפת את שגיאת האפליקציה?",
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
          "`kubectl logs --previous` shows logs from the last crashed container — exactly what you need to see the startup error. `exec` doesn't work on a CrashLoopBackOff pod (it exits too fast). `describe` shows events but not application-level log output. Events are useful but secondary.",
        explanationHe:
          "`kubectl logs --previous` מציג לוגים מהקונטיינר שקרס לאחרונה — בדיוק מה שצריך לראות שגיאת ההפעלה. `exec` לא עובד על Pod ב-CrashLoopBackOff (הוא יוצא מהר מדי). `describe` מציג Events אך לא פלט לוגים ברמת האפליקציה. Events שימושיים אך משניים.",
      },
      {
        prompt:
          "Previous logs show:\n\nFATAL  config file '/etc/app/config.yaml' not found\nError: no such file or directory\n\nThe app is missing a config file it expects to be mounted. What do you check?",
        promptHe:
          "הלוגים הקודמים מראים:\n\nFATAL  config file '/etc/app/config.yaml' not found\nError: no such file or directory\n\nלאפליקציה חסר קובץ קונפיגורציה שהיא מצפה שיהיה מוצמד. מה בודקים?",
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
          "kubectl describe pod shows a volumeMount referencing ConfigMap `payment-config`. kubectl get configmap -n staging shows:\n\nNAME              DATA   AGE\napp-settings      3      5d\n\nNo `payment-config` exists. What most likely happened?",
        promptHe:
          "kubectl describe pod מציג volumeMount המפנה ל-ConfigMap `payment-config`. kubectl get configmap -n staging מציג:\n\nNAME              DATA   AGE\napp-settings      3      5d\n\n`payment-config` אינו קיים. מה כנראה קרה?",
        options: [
          "The ConfigMap was created in a different namespace (e.g., production) but not in staging",
          "The ConfigMap was accidentally deleted from staging",
          "A new environment was added to the deployment but the ConfigMap was never created for it",
          "Any of the above — the ConfigMap is simply absent from this namespace",
        ],
        optionsHe: [
          "ה-ConfigMap נוצר ב-namespace אחר (למשל production) אך לא ב-staging",
          "ה-ConfigMap נמחק בטעות מ-staging",
          "סביבה חדשה נוספה ל-Deployment אך ה-ConfigMap מעולם לא נוצר עבורה",
          "כל האמור לעיל — ה-ConfigMap פשוט אינו קיים ב-namespace הזה",
        ],
        answer: 3,
        explanation:
          "ConfigMaps are namespace-scoped. The ConfigMap can be absent because it only exists in another namespace, was accidentally deleted, or was never created for this environment. All three are equally valid root causes; the fix is the same: create it in staging.",
        explanationHe:
          "ConfigMaps מוגדרים לפי namespace. ה-ConfigMap יכול להיות חסר כי הוא קיים רק ב-namespace אחר, נמחק בטעות, או מעולם לא נוצר לסביבה זו. שלושתם סיבות שורשיות תקפות באותה מידה; התיקון זהה: ליצור אותו ב-staging.",
      },
      {
        prompt:
          "You need to create `payment-config` in staging using the production version as a reference. What is the safest approach?",
        promptHe:
          "יש ליצור את `payment-config` ב-staging תוך שימוש בגרסת production כהפניה. מה הגישה הבטוחה ביותר?",
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
          "Export the ConfigMap from production, replace the namespace field, and apply to staging. `kubectl cp` is for files inside pods, not Kubernetes objects. Pods cannot reference ConfigMaps from other namespaces — they're namespace-scoped. Restarting without providing the resource changes nothing.",
        explanationHe:
          "ייצא את ה-ConfigMap מ-production, החלף את שדה ה-namespace, והחל ב-staging. `kubectl cp` מיועד לקבצים בתוך Pods, לא לאובייקטי Kubernetes. Pods לא יכולים להפנות ל-ConfigMaps ממרחבי שמות אחרים — הם מוגדרים לפי namespace. אתחול מבלי לספק את המשאב לא משנה דבר.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. ImagePullBackOff – private registry auth
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "imagepull-auth",
    icon: "🖼️",
    title: "ImagePullBackOff: Registry Authentication",
    titleHe: "ImagePullBackOff: אימות ל-Registry נכשל",
    description: "A new Deployment is stuck — pods can't pull the container image",
    descriptionHe: "דיפלוימנט חדש תקוע — פודים לא מצליחים למשוך את הקונטיינר",
    difficulty: "easy",
    estimatedTime: "4-5 min",
    steps: [
      {
        prompt:
          "🚨 A newly deployed microservice has all pods in `ImagePullBackOff`. Other services on the same cluster are healthy. What is your first diagnostic step?",
        promptHe:
          "🚨 מיקרו-שירות שהוצב לאחרונה מציג כל ה-Pods שלו במצב `ImagePullBackOff`. שירותים אחרים באותו קלאסטר תקינים. מה הצעד האבחוני הראשון שלך?",
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
          "`kubectl describe pod` shows the Events section which contains the exact pull failure message — whether it's a missing tag, auth failure, or unreachable registry. Checking nodes is unlikely to help since only one deployment is affected. Rebuilding without knowing the cause wastes time.",
        explanationHe:
          "`kubectl describe pod` מציג את חלק ה-Events שמכיל את הודעת כשל המשיכה המדויקת — בין אם זה tag חסר, כשל אימות, או registry לא נגיש. בדיקת Nodes לא צפויה לעזור מכיוון שרק Deployment אחד מושפע. בנייה מחדש ללא ידיעת הסיבה מבזבזת זמן.",
      },
      {
        prompt:
          "kubectl describe pod shows:\n\n  Events:\n    Failed to pull image 'registry.company.com/myapp:v2.1':\n    rpc error: code = Unknown\n    unauthorized: authentication required\n\nWhat does this error specifically indicate?",
        promptHe:
          "kubectl describe pod מציג:\n\n  Events:\n    Failed to pull image 'registry.company.com/myapp:v2.1':\n    rpc error: code = Unknown\n    unauthorized: authentication required\n\nמה מציינת שגיאה זו באופן ספציפי?",
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
          "Your registry `registry.company.com` requires a username/password to pull images. What Kubernetes resource is designed to hold registry credentials?",
        promptHe:
          "ה-registry `registry.company.com` שלך דורש שם משתמש/סיסמה למשיכת images. איזה משאב Kubernetes מיועד להחזיק אישורי registry?",
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
          "Registry credentials are stored in a `kubernetes.io/dockerconfigjson` Secret (or the legacy `kubernetes.io/dockercfg` type). ConfigMaps are not suitable for sensitive data. ServiceAccount tokens authenticate to the Kubernetes API — not to container registries.",
        explanationHe:
          "אישורי registry מאוחסנים ב-Secret מסוג `kubernetes.io/dockerconfigjson` (או הסוג הישן `kubernetes.io/dockercfg`). ConfigMaps לא מתאימים לנתונים רגישים. Tokens של ServiceAccount מאמתים מול Kubernetes API — לא מול registry קונטיינרים.",
      },
      {
        prompt:
          "kubectl get secret -n default | grep registry returns nothing. The pull Secret doesn't exist. How do you create it correctly?",
        promptHe:
          "kubectl get secret -n default | grep registry לא מחזיר דבר. ה-pull Secret לא קיים. כיצד יוצרים אותו נכון?",
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
          "`kubectl create secret docker-registry` creates a Secret with the correct type and `.dockerconfigjson` format. Never store credentials in plain ConfigMaps or env vars — they're not encrypted at rest. Secrets are namespace-scoped; you can't reference one from kube-system in default namespace.",
        explanationHe:
          "`kubectl create secret docker-registry` יוצר Secret עם הסוג הנכון ופורמט `.dockerconfigjson`. לעולם אל תאחסן אישורים ב-ConfigMaps פשוטים או ב-env vars — הם אינם מוצפנים במנוחה. Secrets מוגדרים לפי namespace; לא ניתן להפנות לאחד מ-kube-system ב-default namespace.",
      },
      {
        prompt:
          "You created the `regcred` Secret. The deployment still fails to pull. What critical step did you miss?",
        promptHe:
          "יצרת את ה-Secret `regcred`. ה-Deployment עדיין נכשל במשיכה. איזה צעד קריטי החמצת?",
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
          "Kubernetes אינו משתמש אוטומטית ב-pull Secrets זמינים. יש להפנות מפורשות ל-Secret ב-Deployment תחת `spec.template.spec.imagePullSecrets: [{name: regcred}]`. ללא הפניה זו ה-Pod לעולם לא ישתמש באישור, גם אם ה-Secret קיים באותו namespace.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Service unreachable – wrong selector / port mismatch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "service-no-endpoints",
    icon: "🔌",
    title: "Service Returns No Endpoints",
    titleHe: "שירות ללא Endpoints — חיבור נדחה",
    description: "Frontend gets 'connection refused' calling the backend — pods look healthy",
    descriptionHe: "הפרונטאנד מקבל 'connection refused' מהבאקאנד — פודים נראים תקינים",
    difficulty: "medium",
    estimatedTime: "5-7 min",
    steps: [
      {
        prompt:
          "🚨 Users report 'connection refused' when the frontend calls the backend API. Pod status for both frontend and backend shows Running/Ready. Where do you start?",
        promptHe:
          "🚨 משתמשים מדווחים על 'connection refused' כשהפרונטאנד קורא ל-API הבאקאנד. סטטוס ה-Pod של שניהם מציג Running/Ready. מאיפה מתחילים?",
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
          "kubectl get svc backend-svc -n production shows the Service exists with ClusterIP and port 80. What is the single most diagnostic command to run next?",
        promptHe:
          "kubectl get svc backend-svc -n production מציג שה-Service קיים עם ClusterIP ופורט 80. מהי הפקודה האחת האבחונית ביותר להריץ כעת?",
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
          "`kubectl get endpoints` tells you whether the Service has successfully matched any pods. If ENDPOINTS shows `<none>`, no pods match the Service selector — the most common cause of 'connection refused' when pods are healthy.",
        explanationHe:
          "`kubectl get endpoints` מציין אם ה-Service התאים בהצלחה ל-Pods כלשהם. אם ENDPOINTS מציג `<none>`, אף Pod לא תואם ל-selector של ה-Service — הסיבה הנפוצה ביותר ל-'connection refused' כאשר ה-Pods תקינים.",
      },
      {
        prompt:
          "kubectl get endpoints backend-svc -n production:\n\nNAME          ENDPOINTS   AGE\nbackend-svc   <none>      3d\n\n`<none>` — the Service has no matching pods. What do you do next?",
        promptHe:
          "kubectl get endpoints backend-svc -n production:\n\nNAME          ENDPOINTS   AGE\nbackend-svc   <none>      3d\n\n`<none>` — ל-Service אין Pods תואמים. מה הצעד הבא?",
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
          "kubectl describe svc shows:  Selector: app=backend\nkubectl get pods --show-labels shows pods labelled: app=backend-v2\n\nThe label was changed in the last deployment but the Service was not updated. What is the fix?",
        promptHe:
          "kubectl describe svc מציג: Selector: app=backend\nkubectl get pods --show-labels מציג Pods עם label: app=backend-v2\n\nה-label שונה בדיפלוימנט האחרון אך ה-Service לא עודכן. מה התיקון?",
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
          "`kubectl patch svc` atomically updates the selector with zero downtime. Labelling individual pods is fragile — new pods from the Deployment won't have it. Deleting and recreating the Service causes unnecessary downtime. Annotations don't influence selector-based routing.",
        explanationHe:
          "`kubectl patch svc` מעדכן אטומית את ה-selector ללא זמן השבתה. הוספת labels ל-Pods בודדים שברירית — Pods חדשים מה-Deployment לא יכילו אותם. מחיקה ויצירה מחדש של ה-Service גורמת להשבתה מיותרת. Annotations לא משפיעים על ניתוב מבוסס-selector.",
      },
      {
        prompt:
          "You've patched the Service selector. How do you confirm traffic is flowing end-to-end?",
        promptHe:
          "עדכנת את ה-selector של ה-Service. כיצד מאשרים שהתעבורה זורמת מקצה לקצה?",
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
          "Endpoints being populated proves the selector matches. A live `curl` test proves actual network traffic reaches the backend. Both together confirm the full fix — endpoints can be populated but a NetworkPolicy could still silently block traffic.",
        explanationHe:
          "אכלוס ה-endpoints מוכיח שה-selector תואם. בדיקת `curl` חיה מוכיחה שתעבורת רשת בפועל מגיעה לבאקאנד. שניהם יחד מאשרים את התיקון המלא — ה-endpoints יכולים להיות מאוכלסים אך NetworkPolicy עלולה עדיין לחסום תעבורה בשקט.",
      },
      {
        prompt:
          "Traffic is restored. What process change prevents selector mismatches from reaching production again?",
        promptHe:
          "התעבורה שוחזרה. איזה שינוי תהליך ימנע אי-התאמות selector מלהגיע לproduction שוב?",
        options: [
          "Manually double-check Service selectors after every deployment",
          "Use Helm/Kustomize to derive both the Service selector and Deployment pod labels from a single shared value, and alert on kube_endpoint_ready == 0",
          "Switch all Services from ClusterIP to NodePort",
          "Add a comment in the YAML reminding engineers to update the selector",
        ],
        optionsHe: [
          "לבדוק ידנית selectors של Service אחרי כל דיפלוימנט",
          "להשתמש ב-Helm/Kustomize כדי לגזור גם את ה-selector של ה-Service וגם ה-labels של Pod מ-Deployment ממשתנה משותף יחיד, ולהתריע על kube_endpoint_ready == 0",
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
    title: "Cluster DNS Resolution Failing",
    titleHe: "כשל ב-DNS הפנימי של הקלאסטר",
    description: "Multiple services can't resolve each other by hostname — widespread outage",
    descriptionHe: "שירותים מרובים לא מצליחים לפתור שמות — השבתה נרחבת",
    difficulty: "hard",
    estimatedTime: "7-9 min",
    steps: [
      {
        prompt:
          "🚨 Multiple applications log 'no such host' and 'dial tcp: lookup svc-name: no such host'. DNS seems broken cluster-wide. How do you confirm the DNS issue before investigating infrastructure?",
        promptHe:
          "🚨 אפליקציות מרובות מתעדות 'no such host' ו-'dial tcp: lookup svc-name: no such host'. DNS נראה שבור בכל הקלאסטר. כיצד מאשרים את בעיית ה-DNS לפני בדיקת תשתית?",
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
          "`nslookup kubernetes.default` מהיר מתוך הקלאסטר בודק את רשומת ה-DNS הפנימית הבסיסית ביותר. זה מאשר שהבעיה היא DNS ולא הגדרות אפליקציות בודדות. Cloud DNS (Route53) מטפל בשמות חיצוניים, לא בגילוי שירותים פנימי של Kubernetes. אתחול כל ה-Pods גורם להשבתה מסיבית ללא אישור הסיבה השורשית.",
      },
      {
        prompt:
          "nslookup kubernetes.default fails: 'server can't find kubernetes.default: NXDOMAIN'. DNS is broken. Where does Kubernetes cluster DNS run?",
        promptHe:
          "nslookup kubernetes.default נכשל: 'server can't find kubernetes.default: NXDOMAIN'. ה-DNS שבור. היכן רץ ה-DNS של קלאסטר Kubernetes?",
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
          "DNS של קלאסטר Kubernetes מסופק על ידי Pods של CoreDNS ב-namespace של `kube-system`. Pods אלה מטפלים בכל גילוי השירותים הפנימי באמצעות דומיין הקלאסטר (למשל `svc.cluster.local`). אם הם לא תקינים, כל פתרון ה-DNS נכשל בכל הקלאסטר.",
      },
      {
        prompt:
          "kubectl get pods -n kube-system -l k8s-app=kube-dns:\n\nNAME              STATUS      RESTARTS\ncoredns-abc12     OOMKilled   7\ncoredns-def34     OOMKilled   7\n\nBoth CoreDNS pods are OOMKilling. What should you do before changing anything?",
        promptHe:
          "kubectl get pods -n kube-system -l k8s-app=kube-dns:\n\nNAME              STATUS      RESTARTS\ncoredns-abc12     OOMKilled   7\ncoredns-def34     OOMKilled   7\n\nשני Pods של CoreDNS מקבלים OOMKill. מה יש לעשות לפני שמשנים דבר?",
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
          "kubectl describe shows CoreDNS memory limit is 170Mi. kubectl top shows CoreDNS consuming 168Mi — nearly at the limit. The cluster recently scaled from 20 to 80 nodes. What is the likely root cause?",
        promptHe:
          "kubectl describe מציג שמגבלת זיכרון CoreDNS היא 170Mi. kubectl top מציג שCoreDNS צורך 168Mi — כמעט בתקרה. הקלאסטר גדל לאחרונה מ-20 ל-80 Nodes. מה הסיבה השורשית הסבירה?",
        options: [
          "A memory leak in the CoreDNS binary — upgrade CoreDNS immediately",
          "The cluster grew significantly; CoreDNS caches DNS records for many more Services and Pods now, requiring more memory",
          "The CoreDNS ConfigMap is corrupt — restore it from backup",
          "The underlying node is overloaded and swapping memory",
        ],
        optionsHe: [
          "דליפת זיכרון בבינארי של CoreDNS — שדרג CoreDNS מיידית",
          "הקלאסטר גדל משמעותית; CoreDNS שומר רשומות DNS עבור הרבה יותר Services ו-Pods כעת, מה שדורש יותר זיכרון",
          "ה-ConfigMap של CoreDNS פגום — שחזר מגיבוי",
          "ה-Node הבסיסי עמוס ומחליף זיכרון (swapping)",
        ],
        answer: 1,
        explanation:
          "CoreDNS memory usage scales with cluster size — more Services, Endpoints, and Pods means a larger DNS cache. At 4× cluster size, the original 170Mi limit is no longer adequate. A corrupt config would cause crashes with errors, not gradual memory exhaustion. Node swapping would affect all pods equally.",
        explanationHe:
          "שימוש הזיכרון של CoreDNS גדל עם גודל הקלאסטר — יותר Services, Endpoints ו-Pods פירושו cache DNS גדול יותר. בגודל קלאסטר פי 4, מגבלת 170Mi המקורית כבר אינה מספיקה. קונפיגורציה פגומה תגרום לקריסות עם שגיאות, לא לאיפוס זיכרון הדרגתי. swap ב-Node ישפיע על כל ה-Pods בשווה.",
      },
      {
        prompt:
          "How do you safely increase CoreDNS memory limits without causing a total DNS blackout?",
        promptHe:
          "כיצד מגדילים בבטחה מגבלות זיכרון של CoreDNS ללא גרימת השבתת DNS מוחלטת?",
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
          "`kubectl edit deployment coredns -n kube-system` triggers a rolling update — only one CoreDNS pod restarts at a time, keeping DNS available throughout. Deleting the deployment creates a total DNS outage during recreation. Adding nodes doesn't address the per-pod memory limit.",
        explanationHe:
          "`kubectl edit deployment coredns -n kube-system` מפעיל rolling update — רק Pod אחד של CoreDNS מתאפס בכל פעם, תוך שמירת DNS זמין לאורך כל התהליך. מחיקת ה-Deployment יוצרת השבתת DNS מוחלטת במהלך היצירה מחדש. הוספת Nodes לא פותרת את מגבלת הזיכרון לכל Pod.",
      },
      {
        prompt:
          "After increasing memory to 512Mi, the CoreDNS pods are Running. How do you verify DNS is fully restored?",
        promptHe:
          "לאחר הגדלת הזיכרון ל-512Mi, Pods של CoreDNS פועלים. כיצד מאמתים ש-DNS שוחזר לחלוטין?",
        options: [
          "kubectl run dns-verify --image=busybox:1.28 --rm -it --restart=Never -- nslookup kubernetes.default.svc.cluster.local",
          "kubectl get pods -n kube-system  (confirm Running status)",
          "kubectl logs -n kube-system -l k8s-app=kube-dns --tail=30  (check for errors)",
          "All of the above — pods healthy + no log errors + successful DNS resolution test",
        ],
        optionsHe: [
          "kubectl run dns-verify --image=busybox:1.28 --rm -it --restart=Never -- nslookup kubernetes.default.svc.cluster.local",
          "kubectl get pods -n kube-system  (אשר סטטוס Running)",
          "kubectl logs -n kube-system -l k8s-app=kube-dns --tail=30  (בדוק שגיאות)",
          "כל האמור לעיל — Pods תקינים + אין שגיאות בלוג + בדיקת פתרון DNS הצליחה",
        ],
        answer: 3,
        explanation:
          "A complete DNS health check requires all three: pods must be Running (no more OOMKill), logs must show no errors, and an actual resolution test must succeed. A pod can be Running but still serving degraded results if there are configuration or cache issues.",
        explanationHe:
          "בדיקת בריאות DNS מלאה דורשת את שלושתם: Pods חייבים להיות Running (אין יותר OOMKill), לוגים חייבים להראות ללא שגיאות, ובדיקת פתרון בפועל חייבת להצליח. Pod יכול להיות Running אך עדיין לשרת תוצאות מדורדרות אם יש בעיות קונפיגורציה או cache.",
      },
      {
        prompt:
          "DNS is stable. What monitoring should you add so this never silently fails again?",
        promptHe:
          "ה-DNS יציב. איזו ניטור יש להוסיף כדי שזה לא ייכשל שוב בשקט?",
        options: [
          "Alert when CoreDNS pod memory usage exceeds 80% of its limit",
          "Alert on CoreDNS pod restart count > 0 in 5 minutes",
          "Alert on CoreDNS P99 DNS query latency > 100ms",
          "All three — memory pressure, restarts, and latency all indicate DNS health degrading",
        ],
        optionsHe: [
          "להתריע כאשר שימוש הזיכרון של Pod CoreDNS עולה על 80% ממגבלתו",
          "להתריע על ספירת אתחולי Pod CoreDNS > 0 תוך 5 דקות",
          "להתריע על זמן אחזור DNS P99 של CoreDNS > 100ms",
          "כל שלושתם — לחץ זיכרון, אתחולים ועיכוב כולם מעידים על ירידה בבריאות DNS",
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
    title: "NetworkPolicy Silently Blocking Traffic",
    titleHe: "NetworkPolicy חוסמת תעבורה בשקט",
    description: "Service calls time out after the security team applied new NetworkPolicies",
    descriptionHe: "קריאות לשירות מסתיימות ב-timeout אחרי עדכון מדיניות אבטחה",
    difficulty: "hard",
    estimatedTime: "7-9 min",
    steps: [
      {
        prompt:
          "🚨 After the security team applied new NetworkPolicies to the `production` namespace, frontend-to-backend calls silently time out. Both sets of pods show Running/Ready. What do you check first?",
        promptHe:
          "🚨 לאחר שצוות האבטחה החיל NetworkPolicies חדשות על namespace `production`, קריאות מהפרונטאנד לבאקאנד מסתיימות ב-timeout בשקט. שני קבוצות Pods מציגות Running/Ready. מה בודקים קודם?",
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
          "Since the incident correlates directly with a NetworkPolicy change, inspect the policies first. Removing all policies (`--all`) eliminates the security posture — a serious risk. Rolling back the backend deployment won't fix a network-layer issue. Pod status is already confirmed healthy.",
        explanationHe:
          "מכיוון שהאירוע מתואם ישירות לשינוי NetworkPolicy, בדוק את המדיניות קודם. הסרת כל המדיניות (`--all`) מסירה את עמדת האבטחה — סיכון רציני. rollback ל-Deployment של הבאקאנד לא יתקן בעיית שכבת רשת. סטטוס Pod כבר אושר כתקין.",
      },
      {
        prompt:
          "kubectl get networkpolicy -n production lists several policies including `deny-all-ingress` and `allow-frontend`. How do you see what each policy actually permits?",
        promptHe:
          "kubectl get networkpolicy -n production מציג מספר מדיניות כולל `deny-all-ingress` ו-`allow-frontend`. כיצד רואים מה כל מדיניות בפועל מתירה?",
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
          "`kubectl describe networkpolicy -n production` מדפיס את ה-podSelector וכללי ingress/egress של כל מדיניות בפורמט קריא. בקרי NetworkPolicy אינם חושפים לוגים נגישים למשתמש. Events לא יציגו פרטי כללי מדיניות. בדיקת iptables דורשת גישת root ל-Node ומורכבת לפרשנות.",
      },
      {
        prompt:
          "kubectl describe shows:\n  Policy: allow-frontend\n  PodSelector: role=frontend  (targets backend pods)\n  Ingress from: podSelector role=frontend\n\nBut `deny-all-ingress` blocks everything else. You suspect a label mismatch. What must you check?",
        promptHe:
          "kubectl describe מציג:\n  Policy: allow-frontend\n  PodSelector: role=frontend  (מטרגט Pods של באקאנד)\n  Ingress from: podSelector role=frontend\n\nאך `deny-all-ingress` חוסמת את כל השאר. אתה חושד באי-התאמת label. מה חייבים לבדוק?",
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
          "NetworkPolicies match pods by their labels. If frontend pods don't carry the label `role=frontend`, the allow-frontend policy won't select them — their traffic is blocked by deny-all. You must verify actual pod labels before modifying any policy.",
        explanationHe:
          "NetworkPolicies מתאימות Pods לפי ה-labels שלהם. אם Pods של פרונטאנד לא נושאות את ה-label `role=frontend`, מדיניות allow-frontend לא תבחר בהם — התעבורה שלהם חסומה על ידי deny-all. חובה לאמת labels בפועל של Pods לפני שינוי מדיניות כלשהי.",
      },
      {
        prompt:
          "kubectl get pods -n production --show-labels shows frontend pods have label `app=frontend`, NOT `role=frontend`. The `allow-frontend` policy's `from` podSelector specifies `role=frontend`. What is the correct fix?",
        promptHe:
          "kubectl get pods -n production --show-labels מציג של-Pods של פרונטאנד יש label `app=frontend`, לא `role=frontend`. ה-podSelector `from` של מדיניות `allow-frontend` מציין `role=frontend`. מה התיקון הנכון?",
        options: [
          "kubectl label pod <each-frontend-pod> role=frontend  (relabel individual pods)",
          "kubectl patch networkpolicy allow-frontend -n production -p to update the from-selector to `app=frontend`",
          "kubectl delete networkpolicy deny-all-ingress  (remove the default-deny)",
          "Add `role=frontend` to the frontend Deployment's pod template labels",
        ],
        optionsHe: [
          "kubectl label pod <כל-pod-פרונטאנד> role=frontend  (תייג מחדש Pods בודדים)",
          "kubectl patch networkpolicy allow-frontend -n production -p לעדכן את from-selector ל-`app=frontend`",
          "kubectl delete networkpolicy deny-all-ingress  (הסר את ה-default-deny)",
          "הוסף `role=frontend` ל-labels של pod template של Deployment הפרונטאנד",
        ],
        answer: 1,
        explanation:
          "Fix the NetworkPolicy's `from` podSelector to match the actual pod labels (`app=frontend`) using `kubectl patch` or `kubectl edit`. Labelling individual pods is fragile — new Deployment pods won't have it. Deleting deny-all weakens the security posture. Adding the label to Deployment template is also valid but requires a rollout.",
        explanationHe:
          "תקן את ה-podSelector `from` של NetworkPolicy כדי להתאים ל-labels בפועל של Pods (`app=frontend`) באמצעות `kubectl patch` או `kubectl edit`. תיוג Pods בודדים שברירי — Pods חדשים מה-Deployment לא יכילו אותו. מחיקת deny-all מחלישה את עמדת האבטחה. הוספת ה-label ל-template של Deployment תקפה גם כן אך דורשת rollout.",
      },
      {
        prompt:
          "After patching the NetworkPolicy, how do you confirm traffic actually flows before declaring the incident resolved?",
        promptHe:
          "לאחר עדכון ה-NetworkPolicy, כיצד מאשרים שהתעבורה אכן זורמת לפני הכרזת פתרון האירוע?",
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
          "A temporary curl pod inside the same namespace sends actual traffic along the exact path that was broken. This is the only true end-to-end test. Waiting for user traffic risks continued impact. Endpoints check and policy describe are read-only — they can't prove traffic actually flows.",
        explanationHe:
          "Pod curl זמני בתוך אותו namespace שולח תעבורה בפועל לאורך הנתיב המדויק שהיה שבור. זוהי הבדיקה היחידה מקצה לקצה האמיתית. המתנה לתעבורת משתמשים מסכנת המשך השפעה. בדיקת endpoints ותיאור מדיניות הם לקריאה בלבד — הם לא יכולים להוכיח שהתעבורה אכן זורמת.",
      },
      {
        prompt:
          "Traffic is restored. How do you ensure this label-vs-selector mismatch cannot silently reach production again?",
        promptHe:
          "התעבורה שוחזרה. כיצד מבטיחים שאי-התאמה זו של label מול selector לא תוכל להגיע לproduction שוב בשקט?",
        options: [
          "Ask engineers to manually verify NetworkPolicy selectors after every deployment",
          "Store NetworkPolicies in Git (GitOps), run a policy linter (e.g., Kube-linter) in CI, and validate in staging before production",
          "Disable NetworkPolicy on the cluster",
          "Only apply NetworkPolicies during maintenance windows",
        ],
        optionsHe: [
          "לבקש ממהנדסים לאמת ידנית selectors של NetworkPolicy אחרי כל דיפלוימנט",
          "לאחסן NetworkPolicies ב-Git (GitOps), להריץ linter מדיניות (למשל Kube-linter) ב-CI, ולאמת ב-staging לפני production",
          "להשבית NetworkPolicy על הקלאסטר",
          "להחיל NetworkPolicies רק במהלך חלונות תחזוקה",
        ],
        answer: 1,
        explanation:
          "GitOps ensures policies are version-controlled and auditable. A CI linter catches selector mismatches before merging. Staging validation catches runtime issues. Manual checks, disabling NetworkPolicy, or limiting application windows all trade reliability and security for convenience.",
        explanationHe:
          "GitOps מבטיח שמדיניות מנוהלות בגרסאות וניתנות לביקורת. linter ב-CI מאתר אי-התאמות selector לפני מיזוג. אימות ב-staging מאתר בעיות runtime. בדיקות ידניות, השבתת NetworkPolicy, או הגבלת חלונות יישום כולם מסחרים אמינות ואבטחה לנוחות.",
      },
      {
        prompt:
          "The security team asks: how do you validate that a new NetworkPolicy enforces exactly what's intended without causing outages?",
        promptHe:
          "צוות האבטחה שואל: כיצד מאמתים שNetworkPolicy חדשה אוכפת בדיוק את המיועד ללא גרימת השבתות?",
        options: [
          "Apply in production and monitor; roll back if issues appear",
          "Read the YAML carefully and trust it is correct",
          "In staging: apply deny-all baseline, add each allow rule incrementally, and verify only intended traffic passes after each rule",
          "Use kubectl dry-run to preview changes",
        ],
        optionsHe: [
          "להחיל ב-production ולנטר; לבצע rollback אם מופיעות בעיות",
          "לקרוא את ה-YAML בקפידה ולבטוח שהוא נכון",
          "ב-staging: להחיל deny-all כבסיס, להוסיף כל כלל allow בצורה מצטברת, ולאמת שרק התעבורה המיועדת עוברת אחרי כל כלל",
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
