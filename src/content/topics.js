export const ACHIEVEMENTS = [
  {
    id: "first",
    icon: "🌱",
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
        theory: "Pods ו-Deployments הם ליבת Kubernetes.\n🔹 Pod – יחידת הריצה הקטנה ביותר, מכיל קונטיינר אחד או יותר\n🔹 Pods זמניים – Pod מנוהל (Deployment/ReplicaSet) שמת, נוצר חדש עם IP חדש. Pod עצמאי שמת - נשאר מת\n🔹 Deployment מנהל קבוצת Pods זהים ומבטיח שהמספר הרצוי תמיד רץ\n🔹 replicas – עותקים זהים של ה-Pod שרצים במקביל\nCODE:\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: my-app",
        theoryEn: "Pods and Deployments are the core of Kubernetes.\n🔹 Pod – the smallest unit of execution, contains one or more containers\n🔹 Pods are ephemeral – a managed Pod (Deployment/ReplicaSet) that dies gets replaced with a new one and a new IP. A standalone Pod that dies stays dead\n🔹 Deployment manages a group of identical Pods and ensures the desired count is running\n🔹 replicas – identical copies of the Pod running in parallel\nCODE:\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: my-app",
        questions: [
            {
              q: "מה הוא Pod ב-Kubernetes?",
              options: [
              "אובייקט שמנהל גישה לרשת בין Nodes",
              "יחידת הריצה הקטנה ביותר, מכיל קונטיינר אחד או יותר",
              "קונטרולר שאחראי על rolling updates של Deployments",
              "ממשק שמנהל volumes ו-PersistentClaims בין Pods",
              ],
              answer: 1,
              explanation:
                "Pod הוא יחידת הריצה הבסיסית ב-Kubernetes. כל קונטיינרי ה-Pod חולקים כתובת IP אחת, network namespace, ו-volumes. Kubernetes מנהל Pods, לא קונטיינרים ישירות.",
            },
            {
              q: "מה Deployment עושה?",
              options: [
              "מנהל IP addresses ומאפשר גישה חיצונית לאפליקציות מחוץ לCluster",
              "מנהל קבוצת Pods זהים ושומר על מספרם",
              "מנהל הרשאות גישה לSecrets ו-ConfigMaps בין Namespaces",
              "מנהל אחסון מתמיד עבור StatefulSets ו-Databases",
              ],
              answer: 1,
              explanation:
                "ה-Deployment מנהל קבוצת Pods זהים דרך ReplicaSet. הוא מבטיח שמספר ה-replicas הרצוי רץ תמיד, ומספק rolling updates ו-rollback מובנים. אם Pod נמחק, Deployment יוצר אחד חדש אוטומטית.",
            },
            {
              q: "מה liveness probe עושה?",
              options: [
              "בודק שהPod מחובר לService המתאים ומקבל traffic",
              "בודק שהקונטיינר חי – אם נכשל, Kubernetes מפעיל אותו מחדש",
              "בודק שקבצי הקונפיגורציה נטענו בהצלחה בהפעלת הPod",
              "בודק שגישה ל-API server עדיין תקינה מתוך הקונטיינר",
              ],
              answer: 1,
              explanation:
                "Liveness probe הוא בדיקת בריאות תקופתית שKubernetes מריץ על הקונטיינר. אם הבדיקה נכשלת מספר פעמים ברצף, Kubernetes מניח שהקונטיינר תקוע (למשל deadlock) וממית ומפעיל אותו מחדש אוטומטית. סוגי בדיקות נפוצים: HTTP GET לendpoint בריאות, חיבור TCP socket, או פקודת shell שחייבת לסיים עם exit code 0.",
            },
            {
              q: "מה readiness probe עושה?",
              options: [
              "בודק שהPod מוכן לקבל traffic",
              "מאתחל מחדש את הPod לאחר שינוי ב-ConfigMap",
              "מגדיר את כמות הזיכרון המינימלית שהקונטיינר צריך להפעלה",
              "מוחק Pods ישנים כשגרסה חדשה עוברת rolling update",
              ],
              answer: 0,
              explanation:
                "Readiness probe בודק שהקונטיינר מוכן לקבל בקשות. Pods שלא עוברים readiness נוסרים מה-Service endpoints ולא מקבלים traffic. בשונה מ-liveness probe שממית את הקונטיינר בכישלון, readiness probe רק מפסיק לנתב אליו traffic עד שהוא מוכן שוב.",
            },
            {
              q: "מה ברירת המחדל של restartPolicy ב-Pod?",
              options: [
              "Never – Kubernetes לא מפעיל מחדש קונטיינר שנפסק",
              "OnFailure – Kubernetes מפעיל מחדש רק אם exit code שגוי",
              "Always – Kubernetes תמיד מפעיל מחדש קונטיינר שנפסק",
              "OnSuccess – Kubernetes מפעיל מחדש רק כשהקונטיינר יוצא תקין עם exit code 0",
              ],
              answer: 2,
              explanation:
                "restartPolicy קובע מתי Kubernetes מפעיל מחדש קונטיינר שנפסק. Always (ברירת המחדל) מפעיל מחדש תמיד, בין אם הקונטיינר קרס או יצא תקין. OnFailure מפעיל מחדש רק כש-exit code שונה מ-0. Never לא מפעיל מחדש בכלל. OnSuccess לא קיים ב-Kubernetes.",
            },
            {
              q: "מה ההבדל בין Job ל-CronJob?",
              options: [
              "Job ו-CronJob זהים אבל CronJob נתמך רק בגרסאות Kubernetes חדשות",
              "Job רץ פעם אחת עד להשלמה, CronJob מתזמן Jobs לפי לוח זמנים",
              "CronJob רץ מהר יותר כי הוא שומר containers בcache בין הרצות",
              "Job מיועד לproduction בלבד, CronJob מיועד לסביבות פיתוח",
              ],
              answer: 1,
              explanation:
                "Job מריץ משימה עד שהיא מסתיימת בהצלחה. אם הקונטיינר נכשל, Job יוצר Pod חדש ומנסה שוב (לפי backoffLimit). CronJob מתזמן Jobs לפי cron schedule — לדוגמה: גיבוי לילי, ניקוי נתונים ישנים, או שליחת דוחות. CronJob יוצר Job חדש בכל הרצה.",
            },
            {
              q: "מה resource requests ב-Pod?",
              options: [
              "כמות משאבים מקסימלית שהקונטיינר רשאי לצרוך לפני OOMKill",
              "כמות משאבים מינימלית שהPod צריך לקבל מה-Scheduler",
              "גודל ה-container image שמוריד מה-registry לפני הפעלה",
              "מגבלת קצב הרשת שהPod מקבל מה-CNI plugin",
              ],
              answer: 1,
              explanation:
                "requests מגדיר כמה CPU/Memory ה-Pod צריך. ה-Scheduler משתמש בזה לבחור Node מתאים.",
            },
            {
              q: "מה מטרת Namespace ב-Kubernetes?",
              options: [
              "בידוד לוגי של משאבים לסביבות, צוותים, ופרויקטים",
              "שכבת רשת וירטואלית שמבדילה בין Pods בNodeים שונים",
              "מנגנון לאחסון logs ומטריקות של Pods לטווח ארוך",
              "סוג מיוחד של Service שמאפשר גישה בין Clusters",
              ],
              answer: 0,
              explanation:
                "Namespace מספק הפרדה לוגית בתוך Cluster. משאבים ב-Namespace שונה לא 'רואים' זה את זה כברירת מחדל. שימושי להפרדת סביבות (dev/staging/prod), צוותים, או לקוחות. ניתן להגדיר ResourceQuota ו-LimitRange לכל Namespace כדי להגביל צריכת משאבים.",
            },
        ],
        questionsEn: [
            {
              q: "What is a Pod in Kubernetes?",
              options: [
              "An object that manages network routing between Nodes in the cluster",
              "The smallest unit of execution, containing one or more containers",
              "A controller responsible for managing rolling updates of Deployments",
              "An interface that manages volumes and PersistentClaims between Pods",
              ],
              answer: 1,
              explanation:
                "A Pod is Kubernetes' basic deployable unit - think of it as a wrapper that holds one or more containers that always run together on the same machine. All containers inside a Pod share the same network address (IP) and can share storage volumes. Kubernetes schedules and manages Pods, not individual containers directly.",
            },
            {
              q: "What does a Deployment do?",
              options: [
              "Manages IP addresses and enables external access to applications outside the cluster",
              "Manages a group of identical Pods and maintains their count",
              "Manages access permissions to Secrets and ConfigMaps across Namespaces",
              "Manages persistent storage volumes for StatefulSets and databases",
              ],
              answer: 1,
              explanation:
                "A Deployment is the standard way to run a stateless application in Kubernetes. It manages a group of identical Pods via an internal ReplicaSet and ensures the desired number of Pods are always running. If a Pod crashes, the Deployment automatically creates a replacement. It also handles rolling updates (deploy a new version with zero downtime) and rollbacks to a previous version.",
            },
            {
              q: "What does a liveness probe do?",
              options: [
              "Checks that the Pod is connected to the correct Service and receiving traffic",
              "Checks the container is alive - if it fails, Kubernetes restarts it",
              "Checks that configuration files loaded successfully at Pod startup",
              "Verifies that API server connectivity is still valid from within the container",
              ],
              answer: 1,
              explanation:
                "A liveness probe is a periodic health check Kubernetes runs against your container. If the probe fails more than a configured number of times in a row, Kubernetes assumes the container is stuck (e.g. frozen due to a deadlock) and automatically kills and restarts it. Common probe types: HTTP GET request to a health endpoint, TCP socket connection, or a shell command that must exit with code 0.",
            },
            {
              q: "What does a readiness probe do?",
              options: [
              "Checks the Pod is ready to receive traffic",
              "Reinitialises the Pod after a ConfigMap change",
              "Sets the minimum memory the container needs before it can start",
              "Removes old Pods when a new version rolls out",
              ],
              answer: 0,
              explanation:
                "A readiness probe checks whether the container is ready to serve requests. Pods that fail readiness are removed from Service endpoints and stop receiving traffic. Unlike a liveness probe, which kills the container on failure, a readiness probe only stops routing traffic to it until it passes again.",
            },
            {
              q: "What is the default restartPolicy for a Pod?",
              options: [
              "Never - Kubernetes never restarts a stopped container",
              "OnFailure - Kubernetes restarts only if the exit code is non-zero",
              "Always - Kubernetes always restarts a stopped container",
              "OnSuccess - Kubernetes restarts the container only when it exits cleanly with code 0",
              ],
              answer: 2,
              explanation:
                "restartPolicy controls when Kubernetes restarts a stopped container. 'Always' (the default) restarts the container no matter what - whether it crashed or exited cleanly. 'OnFailure' restarts only on a non-zero exit code (error). 'Never' never restarts it. Most long-running apps (web servers, APIs) use the default 'Always'.",
            },
            {
              q: "What is the difference between a Job and a CronJob?",
              options: [
              "A Job and CronJob are identical but CronJob is only supported in newer Kubernetes versions",
              "A Job runs once until completion; a CronJob schedules Jobs on a recurring basis",
              "CronJob runs faster because it caches containers between runs",
              "Job is for production workloads only; CronJob is intended for development environments",
              ],
              answer: 1,
              explanation:
                "A Job runs a task until it completes successfully. If the container fails, the Job creates a new Pod and retries (up to backoffLimit). A CronJob schedules Jobs on a recurring basis using a cron expression — for example: nightly backups, data cleanup, or report generation. Each scheduled run creates a new Job.",
            },
            {
              q: "What are resource requests in a Pod?",
              options: [
              "Maximum resources the container may consume before receiving OOMKill",
              "Minimum resources the Pod needs, used by the Scheduler to pick a Node",
              "Size of the container image downloaded from the registry before startup",
              "Network rate limit assigned to the Pod by the CNI plugin",
              ],
              answer: 1,
              explanation:
                "requests tells Kubernetes the minimum CPU and memory your container needs to run properly. The Scheduler uses this value when deciding which Node to place the Pod on - it only considers Nodes that have at least that much free capacity. Setting requests too low can cause performance problems; setting them too high wastes cluster resources. Note: requests are a scheduling hint - the container can still use more (up to its limit). The hard cap is set separately via limits.",
            },
            {
              q: "What is the purpose of a Namespace in Kubernetes?",
              options: [
              "Logical isolation of resources for environments, teams, and projects",
              "A virtual network layer separating Pods across different Nodes",
              "A mechanism for storing long-term logs and metrics from workloads",
              "A special Service type that enables cross-cluster communication",
              ],
              answer: 0,
              explanation:
                "Namespaces provide logical separation. Resources in different Namespaces are isolated. Commonly used for: dev/staging/prod, different teams, or multi-tenant clusters.",
            },
        ],
      },
      medium: {
        theory: "Rolling Updates, Rollback, ו-StatefulSets.\n🔹 Rolling Update מעדכן Pod אחד בכל פעם – zero downtime\n🔹 kubectl rollout undo – חוזר לגרסה קודמת\n🔹 StatefulSet כמו Deployment אבל Pods מקבלים שמות קבועים ו-storage משלהם\n🔹 מתאים ל: databases, Kafka, ZooKeeper\nCODE:\nkubectl set image deployment/my-app web=my-app:v2\nkubectl rollout undo deployment/my-app\n# StatefulSet: pod-0, pod-1, pod-2",
        theoryEn: "Rolling Updates, Rollback, and StatefulSets.\n🔹 Rolling Update updates one Pod at a time – zero downtime\n🔹 kubectl rollout undo – reverts to the previous version\n🔹 StatefulSet is like Deployment but Pods get fixed names and their own storage\n🔹 Suitable for: databases, Kafka, ZooKeeper\nCODE:\nkubectl set image deployment/my-app web=my-app:v2\nkubectl rollout undo deployment/my-app\n# StatefulSet: pod-0, pod-1, pod-2",
        questions: [
            {
              q: "מה היתרון של Rolling Update?",
              options: [
              "מעדכן את כל הPods בבת אחת לחיסכון בזמן הפריסה",
              "Zero downtime בזמן עדכון",
              "מאפשר לחזור לגרסה קודמת ללא שמירת revisions",
              "מגביל את מספר הPods המחוברים ל-Service בזמן עדכון",
              ],
              answer: 1,
              explanation:
                "תהליך Rolling Update מחליף Pods בהדרגה - Pod חדש עולה ורק אז Pod ישן יורד. כך תמיד יש Pods זמינים ואין downtime. בשונה מ-Recreate שמוחק הכל ואז יוצר מחדש ויגרום לdowntime.",
            },
            {
              q: "כיצד מבצעים rollback?",
              options: [
              "kubectl delete deployment my-app ואז kubectl apply מחדש עם YAML קודם",
              "kubectl rollout undo deployment/my-app",
              "kubectl scale deployment my-app --replicas=0 ואז להגדיל מחדש",
              "kubectl patch deployment my-app --type=json -p '[{\"op\":\"replace\"}]'",
              ],
              answer: 1,
              explanation:
                "הפקודה kubectl rollout undo deployment/my-app מחזיר את ה-Deployment ל-revision הקודם באמצעות יצירת ReplicaSet חדש עם ה-image הקודם. ניתן גם לציין revision ספציפי: kubectl rollout undo deployment/my-app --to-revision=2.",
            },
            {
              q: "מה ההבדל בין StatefulSet ל-Deployment?",
              options: [
              "StatefulSet מתזמן Pods מהר יותר כי הוא שומר cache של הnode selection",
              "Pods ב-StatefulSet מקבלים שמות קבועים ואחסון קבוע",
              "StatefulSet לא תומך ב-rolling updates ומצריך manual restart",
              "StatefulSet תומך רק בcloud providers ולא ב-on-premise clusters",
              ],
              answer: 1,
              explanation:
                "ב-StatefulSet לכל Pod יש שם קבוע ורציף (pod-0, pod-1, pod-2) ו-PVC ייחודי משלו. Pods עולים בסדר, Pod-0 ראשון. בשונה מ-Deployment, Pods ב-StatefulSet אינם זהים לחלוטין - לכל אחד זהות קבועה גם לאחר restart.",
            },
            {
              q: "מה PodDisruptionBudget עושה?",
              options: [
              "מגביל את כמות ה-CPU שDeployment יכול לצרוך בזמן rolling update",
              "מגדיר מינימום Pods זמינים בזמן disruptions מתוכננות",
              "מנהל את ה-scaling האוטומטי לפי מדדי CPU ו-Memory",
              "מגביל תנועת רשת נכנסת לPods בזמן maintenance",
              ],
              answer: 1,
              explanation:
                "PodDisruptionBudget מגדיר כמה Pods חייבים להיות זמינים בזמן disruptions מתוכננות כמו kubectl drain. עם minAvailable: 2 ו-3 replicas, ניתן לגרש מקסימום Pod אחד בו-זמנית. זה מגן על הזמינות של אפליקציות חשובות בזמן maintenance.",
            },
            {
              q: "מה resource limits?",
              options: [
              "כמות משאבים מינימלית שה-Scheduler מבטיח לPod לפני תזמון",
              "כמות משאבים מקסימלית שקונטיינר רשאי להשתמש",
              "גודל ה-container image שנשמר ב-Node cache",
              "מגבלת ports נכנסים שה-Service מאפשר לPod",
              ],
              answer: 1,
              explanation:
                "limits מגדיר את הגבול המקסימלי שקונטיינר יכול לצרוך. חריגה מ-memory limit גורמת ל-OOMKill מיידי (exit code 137). חריגה מ-CPU limit גורמת ל-throttling - ה-CPU של הקונטיינר מוגבל אבל הוא לא מסתיים. להבדיל מ-requests שמשמשים לתזמון.",
            },
            {
              q: "מה taints ו-tolerations פותרים?",
              options: [
              "בעיות DNS שנגרמות מNodeים שמשתמשים ב-CoreDNS ישן",
              "שליטה על איזה Pods מותרים לרוץ על Nodes מסוימים",
              "בעיות TLS certificates שפגו ב-ingress controllers",
              "בעיות storage כשPVCs לא מצליחים להתחבר ל-Nodes",
              ],
              answer: 1,
              explanation:
                "Taint על Node הוא כמו שלט 'כניסה אסורה' שחוסם Pods שלא מגדירים Toleration תואם. Toleration ב-Pod spec 'מתיר' לPod להתעלם מה-taint ולרוץ על ה-Node. משמש לייחוד Nodes ל-workloads מסוימים כמו GPU workloads או spot instances.",
            },
            {
              q: "מה שלוש קלאסות QoS של Pod?",
              options: [
              "Low, Medium, High – לפי מספר ה-replicas שהוגדרו",
              "Guaranteed, Burstable, BestEffort – לפי יחס בין requests ל-limits",
              "Bronze, Silver, Gold – לפי עדיפות PriorityClass שהוגדרה",
              "Fast, Normal, Slow – לפי זמן תגובת readiness probe",
              ],
              answer: 1,
              explanation:
                "ה-QoS class נקבע אוטומטית לפי requests ו-limits: Guaranteed כשrequests=limits עבור CPU ו-Memory בכל הקונטיינרים (הכי מוגן), Burstable כשלפחות קונטיינר אחד מגדיר requests או limits אבל לא עומד בתנאי Guaranteed, BestEffort כשאין requests/limits כלל (ראשון להיגרש). Guaranteed Pods הם האחרונים להיגרש בMemoryPressure.",
            },
            {
              q: "מה ephemeral container ב-Kubernetes?",
              options: [
              "Pod זמני שנוצר אוטומטית כש-Deployment מתזמן על Node חדש",
              "קונטיינר שמוסיפים לPod רץ לdebug ללא restart של ה-Pod",
              "init container שמוגדר עם ttl קצוב לניקוי אוטומטי",
              "גרסה מוקטנת של Pod שמשמשת לbatch jobs קצרים",
              ],
              answer: 1,
              explanation:
                "Ephemeral containers מוספים לPod רץ דרך kubectl debug ומאפשרים חקירת בעיות בזמן אמת. שימושי כשה-image הראשי הוא distroless או חסר כלי debug כמו shell או curl. בניגוד ל-init containers, הם לא מופיעים ב-Pod spec ולא מאותחלים מחדש — הם נועדו לשימוש חד-פעמי בלבד.",
            },
        ],
        questionsEn: [
            {
              q: "What is the advantage of a Rolling Update?",
              options: [
              "Updates all Pods simultaneously to minimise total deployment time",
              "Zero downtime during update",
              "Guarantees data consistency by pausing until all Pods write their state to etcd",
              "Prevents the Service from routing to unhealthy Pods during upgrade",
              ],
              answer: 1,
              explanation:
                "A Rolling Update replaces Pods gradually - a new Pod starts and only then does an old Pod stop. This means there are always running Pods serving traffic and the update causes zero downtime.",
            },
            {
              q: "How do you perform a rollback?",
              options: [
              "kubectl delete deployment my-app and re-apply the previous YAML manifest",
              "kubectl rollout undo deployment/my-app",
              "kubectl scale deployment my-app --replicas=0 then scale back up",
              "kubectl patch deployment my-app to restore the previous image tag",
              ],
              answer: 1,
              explanation:
                "kubectl rollout undo deployment/my-app rolls back to the previous revision by activating the previous ReplicaSet. Use kubectl rollout history deployment/my-app first to see available revisions.",
            },
            {
              q: "What is the main difference between StatefulSet and Deployment?",
              options: [
              "StatefulSet schedules Pods faster by caching node selection decisions",
              "Pods in StatefulSet get fixed names and their own storage",
              "StatefulSet does not support rolling updates and requires manual restarts",
              "StatefulSet only works with cloud providers and not on-premise clusters",
              ],
              answer: 1,
              explanation:
                "In a StatefulSet, each Pod gets a stable, predictable name (pod-0, pod-1, pod-2) and its own dedicated PersistentVolumeClaim. Pods start in order and the identity is preserved across restarts, unlike Deployment Pods which are interchangeable.",
            },
            {
              q: "What does a PodDisruptionBudget do?",
              options: [
              "Limits the total CPU a Deployment can consume during a rolling update",
              "Defines minimum available Pods during a planned disruption",
              "Manages automatic scaling based on CPU and memory metrics",
              "Restricts inbound network traffic to Pods during maintenance windows",
              ],
              answer: 1,
              explanation:
                "A PodDisruptionBudget (PDB) protects your application during planned maintenance. When an operator runs kubectl drain to safely remove all Pods from a Node (for example to upgrade the Node's OS or decommission it), the PDB tells Kubernetes how many of your Pods must stay Running at all times. Example: with minAvailable: 2 and 3 replicas, the drain can only evict one Pod at a time - ensuring at least 2 replicas are always serving traffic.",
            },
            {
              q: "What are resource limits?",
              options: [
              "Minimum resources the Scheduler guarantees to the Pod before placing it",
              "Maximum resources a container is allowed to use",
              "Size of the container image cached on the Node",
              "Maximum number of ports the Service exposes for the Pod",
              ],
              answer: 1,
              explanation:
                "limits is the hard ceiling on resources a container can use. Memory: if a container exceeds its memory limit, the Linux kernel immediately kills it - this is called OOMKill (Out Of Memory Kill), visible as exit code 137 in kubectl describe pod. CPU: if a container exceeds its CPU limit, it is throttled (slowed down) - the process keeps running but gets less CPU time. Unlike memory, exceeding the CPU limit never kills the container.",
            },
            {
              q: "What problem do taints and tolerations solve?",
              options: [
              "DNS resolution failures caused by Nodes running outdated CoreDNS versions",
              "Controlling which Pods are allowed to run on specific Nodes",
              "TLS certificate expiry issues on ingress controllers",
              "Storage binding failures when PVCs cannot attach to specific Nodes",
              ],
              answer: 1,
              explanation:
                "Think of a taint as a 'No entry' sign on a Node - by default, no Pod can be scheduled there. A toleration in the Pod spec is the Pod's pass that lets it ignore a specific taint and land on that Node. This lets you reserve expensive or specialized Nodes (like GPU machines) exclusively for the workloads that need them, keeping them free from unrelated Pods.",
            },
            {
              q: "What are the three Pod QoS classes?",
              options: [
              "Low, Medium, High - based on the number of configured replicas",
              "Guaranteed, Burstable, BestEffort - based on the relationship between requests and limits",
              "Bronze, Silver, Gold - based on the assigned PriorityClass value",
              "Fast, Normal, Slow - based on the readiness probe response time",
              ],
              answer: 1,
              explanation:
                "Kubernetes automatically assigns each Pod a Quality of Service class based on its resource settings. Guaranteed (safest): every container sets requests equal to limits for both CPU and memory - these Pods are last to be evicted. Burstable: at least one container sets requests or limits but doesn't qualify for Guaranteed - can burst above its request when resources are available. BestEffort (riskiest): no requests or limits set at all - these are the first to be evicted when a Node runs low on memory. Setting proper requests and limits is important for production workloads.",
            },
            {
              q: "What is an ephemeral container in Kubernetes?",
              options: [
              "A temporary Pod automatically created when a Deployment targets a new Node",
              "A container added to a running Pod for debugging without restarting it",
              "An init container configured with a TTL for automatic cleanup",
              "A stripped-down Pod variant used for short-lived batch jobs",
              ],
              answer: 1,
              explanation:
                "Ephemeral containers are injected into a running Pod via kubectl debug, allowing real-time troubleshooting. Useful when the main image is distroless or lacks debugging tools like a shell or curl. Unlike init containers, ephemeral containers don't appear in the Pod spec and are never restarted — they are designed for one-time diagnostic use only.",
            },
        ],
      },
      hard: {
        theory: "DaemonSets, HPA, ומצבי כשל.\n🔹 DaemonSet – Pod אחד על כל Node (logging, monitoring, CNI)\n🔹 HPA – Horizontal Pod Autoscaler, מגדיל/מקטין replicas לפי CPU/Memory\n🔹 CrashLoopBackOff – קונטיינר קורס שוב ושוב\n🔹 OOMKilled – חרגנו ממגבלת הזיכרון\nCODE:\nkubectl autoscale deployment my-app --cpu-percent=50 --min=2 --max=10\napiVersion: apps/v1\nkind: DaemonSet",
        theoryEn: "DaemonSets, HPA, and failure states.\n🔹 DaemonSet – one Pod per Node (logging, monitoring, CNI)\n🔹 HPA – Horizontal Pod Autoscaler, scales replicas by CPU/Memory\n🔹 CrashLoopBackOff – container crashes repeatedly\n🔹 OOMKilled – container exceeded memory limit\nCODE:\nkubectl autoscale deployment my-app --cpu-percent=50 --min=2 --max=10\napiVersion: apps/v1\nkind: DaemonSet",
        questions: [
            {
              q: "מה DaemonSet מבטיח?",
              options: [
              "שPod מסוים רץ פעם אחת בלבד ולא מופעל מחדש לאחר השלמה",
              "שPod רץ על כל Node ב-Cluster, ומתווסף אוטומטית לNodeים חדשים",
              "שPod רץ רק על Node ספציפי שמסומן עם label מתאים",
              "שPod מופעל מחדש כל דקה לפי לוח הזמנים המוגדר",
              ],
              answer: 1,
              explanation:
                "DaemonSet מבטיח שעותק אחד של ה-Pod רץ על כל Node ב-Cluster. כשNode חדש מצטרף — Pod נוסף אליו אוטומטית. כשNode מוסר — ה-Pod נמחק. שימושי לכלי תשתית שחייבים לרוץ בכל מקום: אוספי logs (כמו Fluentd), agents לmonitoring (כמו Prometheus node-exporter), או plugins לרשת (CNI).",
            },
            {
              q: "מה תפקיד ה-HPA ב-Kubernetes?",
              options: [
              "High Performance App – תצורת Pod מותאמת לביצועים גבוהים",
              "Horizontal Pod Autoscaler – מגדיל/מקטין Pods לפי עומס",
              "Host Port Assignment – מקצה ports ב-Node לPods",
              "Helm Package Archive – פורמט שמירה של Helm charts",
              ],
              answer: 1,
              explanation:
                "ה-HPA (Horizontal Pod Autoscaler) עוקב אחרי מדדים כמו CPU ו-Memory ומשנה את מספר ה-replicas אוטומטית. כשהעומס עולה - הוא מוסיף Pods; כשיורד - הוא מסיר. דורש metrics-server מותקן ב-Cluster.",
            },
            {
              q: "מה המשמעות של OOMKilled ב-Kubernetes?",
              options: [
              "שגיאת רשת שנגרמת כשה-Pod מנסה לגשת לכתובת IP חסומה",
              "הקונטיינר חרג ממגבלת הזיכרון שהוגדרה ב-limits.memory",
              "הדיסק של ה-Node מלא ו-kubelet לא יכול ליצור קבצים",
              "שגיאת הרשאות שמונעת מהקונטיינר לגשת ל-volume",
              ],
              answer: 1,
              explanation:
                "שגיאת OOMKilled (exit code 137) אומר שה-Linux kernel הרג את הקונטיינר כי חרג ממגבלת ה-memory שהוגדרה ב-resources.limits.memory. הפתרון: הגדל את ה-memory limit, או חפש memory leak בקוד.",
            },
            {
              q: "מה התפקיד של topologySpreadConstraints בתזמון Pods ב-Kubernetes?",
              options: [
              "מגדיר כללי affinity שמחייבים Pods לרוץ על Node ספציפי לפי label",
              "מפזר Pods באופן אחיד בין failure domains כמו Nodes או Zones כדי לשפר זמינות",
              "מגביל את מספר ה-Pods שה-scheduler יכול למקם בו-זמנית במהלך rolling update",
              "קובע סדר עדיפויות לפינוי Pods כאשר Node נכנס למצב NotReady",
              ],
              answer: 1,
              explanation:
                "topologySpreadConstraints מורה ל-scheduler לפזר Pods באופן אחיד בין failure domains — אזורי תשתית כמו Nodes, Zones, או Regions שעלולים לכשול יחד. ללא פיזור, כל ה-Pods עלולים לרוץ על Node אחד; אם הוא קורס — כל השירות נופל. הפיזור מבטיח שגם אם Node או Zone שלם נכשל, חלק מה-Pods ממשיכים לרוץ במקומות אחרים.",
            },
            {
              q: "Pod נשאר במצב Pending.\nהפלט של kubectl describe pod מראה את האירוע הבא:\n\n```\nEvents:\n  Warning  FailedScheduling  0/3 nodes are available:\n    3 node(s) had untolerated taint {dedicated=gpu}\n```\n\nמה הפתרון הנכון?",
              options: [
              "להוסיף Node חדש ל-Cluster ללא taint",
              "להקטין את ה-CPU request כדי שה-Pod יתאים ל-Node קטן יותר",
              "להוסיף toleration מתאים ל-Pod spec שיתאים ל-taint",
              "להעביר את ה-Pod ל-Namespace ייעודי לעבודות GPU",
              ],
              answer: 2,
              explanation:
                "שורש הבעיה:\nכל 3 ה-Nodes מסומנים עם taint בשם dedicated=gpu.\nה-Pod לא מגדיר toleration תואם — ולכן ה-Scheduler לא יכול לשבץ אותו לאף Node.\n\nמה זה Taint ו-Toleration?\n• Taint — סימון על Node שאומר: \"אל תשבצו עליי Pods, אלא אם יש להם אישור מתאים.\"\n• Toleration — הצהרה ב-Pod spec שאומרת: \"אני מודע ל-taint הזה ומוכן לרוץ על Node שמסומן בו.\"\n\nהפתרון — להוסיף toleration ל-Pod spec:\n```yaml\ntolerations:\n- key: \"dedicated\"\n  operator: \"Equal\"\n  value: \"gpu\"\n  effect: \"NoSchedule\"\n```\n\nלמה שאר התשובות שגויות:\n• Node חדש ללא taint — פתרון עוקף שלא מטפל בשורש הבעיה ומבזבז משאבים.\n• הקטנת CPU request — הבעיה היא taint ולא חוסר במשאבים.\n• שינוי Namespace — ל-Namespace אין קשר ל-taints. שיבוץ Pods נקבע לפי tolerations בלבד.",
            },
            {
              q: "StatefulSet עם 3 replicas רץ ב-Cluster.\nPod-0 לא במצב Ready, ו-Pod-1 נשאר במצב Pending.\n\nמה הסיבה הסבירה ביותר?",
              options: [
              "ה-PVC של Pod-1 מלא ואין אפשרות להקצות לו אחסון חדש",
              "Pod-0 לא Ready — לכן StatefulSet לא ממשיך ליצור את Pod-1",
              "ה-Namespace quota הגיע למגבלה ולא ניתן ליצור Pods חדשים",
              "ה-imagePullSecret שגוי ומונע הורדת ה-Image עבור Pod-1",
              ],
              answer: 1,
              explanation:
                "שורש הבעיה:\nStatefulSet יוצר Pods בסדר עוקב לפי מספר ordinal — קודם Pod-0, אחר כך Pod-1, ואז Pod-2.\n\nהתנהגות ברירת המחדל:\nכאשר podManagementPolicy מוגדר כ-OrderedReady (ברירת המחדל), Pod-0 חייב להגיע למצב Ready לפני ש-Pod-1 נוצר בכלל.\nלכן אם Pod-0 תקוע — כל ה-Pods שאחריו ימתינו.\n\nהחלופה:\nאם מגדירים podManagementPolicy: Parallel, כל ה-Pods עולים במקביל ללא תלות בסדר.\n\nלמה שאר התשובות שגויות:\n• PVC מלא — Pod-1 לא נוצר בכלל, הבעיה היא בסדר היצירה ולא באחסון.\n• Namespace quota — אם ה-quota היה מלא, גם Pod-0 לא היה עולה.\n• imagePullSecret שגוי — היה גורם לשגיאת ImagePullBackOff, לא למצב Pending.",
            },
            {
              q: "עדכון Rolling update נתקע.\n\nkubectl rollout status מציג:\nWaiting for rollout to finish: 3 out of 5 new replicas have been updated...\nה-YAML מגדיר maxUnavailable: 0.\n\nמה הסיבה?",
              options: [
              "ה-Namespace quota מלא ולא ניתן ליצור Pods נוספים",
              "Pods החדשים לא עוברים readiness probe, ו-maxUnavailable:0 מונע הורדת ישנים",
              "ה-image שגוי ו-kubelet לא מצליח להוריד אותו מה-registry",
              "ה-TLS certificate שגוי ב-admission webhook שבודק את ה-Pod spec",
              ],
              answer: 1,
              explanation:
                "maxUnavailable:0 אומר שאסור להוריד Pod ישן עד שhחדש עובר readiness probe. כשPods חדשים נכשלים בreadiness, K8s לא מקדם את ה-rollout ולא מוריד ישנים – ה-update נתקע. בדוק kubectl logs לPod החדש לגלות למה הreadiness probe נכשלת.",
            },
            {
              q: "ה-Deployment לא מנהל Pods. kubectl get pods --show-labels מראה: app=backend-v2.\n\nה-Deployment spec:\nspec:\n  selector:\n    matchLabels:\n      app: backend\n\nמה הבעיה?",
              options: [
              "ה-Namespace של ה-Pods שונה מה-Namespace של ה-Deployment",
              "selector לא תואם labels של Pods – 'backend' ≠ 'backend-v2'",
              "ה-image שגוי וה-Pods לא יכולים לעלות",
              "ה-Service חסר ולכן ה-Deployment לא מזהה את ה-Pods",
              ],
              answer: 1,
              explanation:
                "Deployment מוצא את הPods שלו לפי selector.matchLabels. כשselector הוא 'app: backend' אבל ה-Pods מתויגים 'app: backend-v2', ה-Deployment לא שולט בהם כלל. יש לסנכרן בין selector לtemplate.metadata.labels.",
            },
        ],
        questionsEn: [
            {
              q: "What does a DaemonSet guarantee?",
              options: [
              "A specific Pod runs once and is never restarted after completion",
              "Pod runs on every Node in the cluster, added automatically to new Nodes",
              "A Pod runs only on a Node with a matching label selector",
              "A Pod runs on a fixed schedule every minute via the kubelet",
              ],
              answer: 1,
              explanation:
                "A DaemonSet is a 'run everywhere' guarantee - Kubernetes automatically creates exactly one copy of the Pod on each Node in the cluster. When a new Node joins, the DaemonSet Pod is added to it without any manual action. When a Node is removed, its DaemonSet Pod is garbage-collected. This is ideal for infrastructure tools that must run on every machine: log collectors (e.g. Fluentd), monitoring agents (e.g. Prometheus node-exporter), or network plugins (CNI).",
            },
            {
              q: "What is HPA?",
              options: [
              "High Performance App - a Pod configuration optimised for compute-intensive tasks",
              "Horizontal Pod Autoscaler - scales Pods automatically based on CPU/Memory",
              "Host Port Assignment - allocates host ports on Nodes for Pod services",
              "Helm Package Archive - the storage format for packaged Helm charts",
              ],
              answer: 1,
              explanation:
                "HPA (Horizontal Pod Autoscaler) watches metrics like CPU and Memory usage and automatically adjusts the replica count. When load increases it adds Pods; when load drops it removes them. Requires metrics-server to be installed in the cluster.",
            },
            {
              q: "What is OOMKilled?",
              options: [
              "A network error triggered when the Pod attempts to reach a blocked IP address",
              "Container exceeded its memory limit defined in limits.memory",
              "The Node's disk became full and kubelet could not create container files",
              "A permissions error preventing the container from mounting the required volume",
              ],
              answer: 1,
              explanation:
                "OOMKilled stands for 'Out Of Memory Killed'. When a container uses more memory than its limits.memory value, the Linux kernel's OOM Killer forcibly terminates the process. In Kubernetes you'll see exit code 137 in kubectl describe pod. To fix: check actual usage with kubectl top pod, then increase limits.memory (e.g. from 128Mi to 256Mi). If memory usage keeps growing over time, the application likely has a memory leak.",
            },
            {
              q: "What is the role of topologySpreadConstraints in Kubernetes scheduling?",
              options: [
              "Defines affinity rules that force Pods to run on a specific Node based on its labels",
              "Spreads Pods evenly across failure domains such as Nodes or Zones to improve availability",
              "Limits the number of Pods the scheduler can place concurrently during a rolling update",
              "Sets eviction priority for Pods when a Node enters NotReady state",
              ],
              answer: 1,
              explanation:
                "topologySpreadConstraints tells the scheduler to distribute Pods evenly across failure domains — infrastructure boundaries such as Nodes, Zones, or Regions that can fail together. Without spreading, all Pods may land on a single Node; if that Node goes down, the entire service is lost. By enforcing even distribution, the constraint ensures that even if an entire Node or Zone fails, a portion of the Pods continue running elsewhere, improving overall resilience.",
            },
            {
              q: "A Pod remains in Pending state.\nThe output of kubectl describe pod shows the following event:\n\n```\nEvents:\n  Warning  FailedScheduling  0/3 nodes are available:\n    3 node(s) had untolerated taint {dedicated=gpu}\n```\n\nWhat is the correct fix?",
              options: [
              "Add a new Node to the cluster without any taints",
              "Reduce the CPU request so the Pod fits on a smaller Node",
              "Add a matching toleration to the Pod spec for the taint",
              "Move the Pod to a Namespace dedicated to GPU workloads",
              ],
              answer: 2,
              explanation:
                "Root cause:\nAll 3 Nodes are tainted with dedicated=gpu.\nThe Pod does not declare a matching toleration, so the Scheduler cannot place it on any Node.\n\nWhat are Taints and Tolerations?\n• Taint — a label on a Node that says: \"Do not schedule Pods here unless they have explicit permission.\"\n• Toleration — a declaration in the Pod spec that says: \"I am aware of this taint and willing to run on a Node that has it.\"\n\nThe fix — add a toleration to the Pod spec:\n```yaml\ntolerations:\n- key: \"dedicated\"\n  operator: \"Equal\"\n  value: \"gpu\"\n  effect: \"NoSchedule\"\n```\n\nWhy the other answers are wrong:\n• New untainted Node — a workaround that doesn't address the root cause and wastes resources.\n• Reduce CPU request — the issue is a taint, not insufficient resources.\n• Change Namespace — Namespaces have no relation to taints. Pod scheduling is determined by tolerations only.",
            },
            {
              q: "A StatefulSet with 3 replicas is running in the cluster.\nPod-0 is not Ready, and Pod-1 remains in Pending state.\n\nWhat is the most likely reason?",
              options: [
              "The PVC for Pod-1 is full and no additional storage can be allocated",
              "Pod-0 is not Ready — StatefulSet will not create Pod-1 until Pod-0 is Ready",
              "The Namespace quota has been reached and no new Pods can be created",
              "The imagePullSecret is incorrect, preventing the image pull for Pod-1",
              ],
              answer: 1,
              explanation:
                "Root cause:\nStatefulSet creates Pods sequentially by ordinal number — first Pod-0, then Pod-1, then Pod-2.\n\nDefault behavior:\nWith podManagementPolicy: OrderedReady (the default), Pod-0 must reach Ready state before Pod-1 is created at all.\nIf Pod-0 is stuck, all subsequent Pods will wait.\n\nAlternative:\nSetting podManagementPolicy: Parallel allows all Pods to start simultaneously without waiting for order.\n\nWhy the other answers are wrong:\n• PVC full — Pod-1 was never created; the issue is creation order, not storage.\n• Namespace quota — if the quota were full, Pod-0 would not have been created either.\n• imagePullSecret — a wrong secret would cause ImagePullBackOff, not Pending.",
            },
            {
              q: "A rolling update is stuck.\n\nkubectl rollout status shows:\nWaiting for rollout to finish: 3 out of 5 new replicas updated...\nThe YAML sets maxUnavailable: 0.\n\nWhat is the cause?",
              options: [
              "The Namespace quota is full and new Pods cannot be created",
              "New Pods are failing readiness probes, and maxUnavailable:0 prevents removing old ones",
              "The container image is incorrect and kubelet cannot pull it from the registry",
              "An admission webhook TLS certificate is invalid and rejecting new Pod specs",
              ],
              answer: 1,
              explanation:
                "maxUnavailable:0 means Kubernetes cannot remove an old Pod until a new one becomes Ready. If new Pods fail their readiness probe, the rollout permanently stalls - old Pods stay up but new ones never get promoted. Check kubectl logs on a new Pod to find the readiness failure.",
            },
            {
              q: "A Deployment does not manage its Pods. kubectl get pods --show-labels shows: app=backend-v2.\n\nThe Deployment spec reads:\nspec:\n  selector:\n    matchLabels:\n      app: backend\n\nWhat is wrong?",
              options: [
              "The Pods are in a different Namespace than the Deployment",
              "selector doesn't match Pod labels - 'backend' ≠ 'backend-v2'",
              "The container image is wrong and Pods cannot start successfully",
              "The Service is missing so the Deployment cannot discover its Pods",
              ],
              answer: 1,
              explanation:
                "A Deployment discovers its Pods using selector.matchLabels. When the selector is 'app: backend' but Pods are labeled 'app: backend-v2', the Deployment has zero matching Pods and cannot manage them. Align the selector with template.metadata.labels.",
            },
        ],
      },
    },
  },
  {
    id: "networking",
    icon: "🌐",
    name: "Networking & Service Exposure",
    color: "#A855F7",
    description: "Services · Ingress · NetworkPolicy · DNS",
    descriptionEn: "Services · Ingress · NetworkPolicy · DNS",
    levels: {
      easy: {
        theory: "Services מספקים כתובת IP יציבה לגישה ל-Pods.\n🔹 ClusterIP – גישה פנימית בלבד (ברירת מחדל)\n🔹 NodePort – חשיפה על port בכל Node\n🔹 LoadBalancer – IP חיצוני ב-cloud\n🔹 Service מוצא Pods לפי labels ו-selector\nCODE:\napiVersion: v1\nkind: Service\nspec:\n  selector:\n    app: my-app\n  ports:\n  - port: 80\n    targetPort: 8080",
        theoryEn: "Services provide a stable IP for accessing Pods.\n🔹 ClusterIP – internal access only (default)\n🔹 NodePort – exposes on a port on each Node\n🔹 LoadBalancer – external IP in the cloud\n🔹 Service finds Pods by labels and selector\nCODE:\napiVersion: v1\nkind: Service\nspec:\n  selector:\n    app: my-app\n  ports:\n  - port: 80\n    targetPort: 8080",
        questions: [
            {
              q: "למה צריך Service?",
              options: [
              "כדי לחסוך עלויות cloud על ידי שיתוף IP בין מספר Pods",
              "IP של Pod משתנה, Service נותן IP יציב שנשמר בין יצירת Pods",
              "כדי להצפין תנועה בין Pods שרצים ב-Namespaces שונים",
              "כדי לגבות קונפיגורציה של Pod לפני מחיקה",
              ],
              answer: 1,
              explanation:
                "כל Pod ב-Kubernetes מקבל IP דינמי שמשתנה בכל פעם שהוא נוצר מחדש. Service מספק IP וירטואלי (ClusterIP) קבוע שלא משתנה, ו-kube-proxy מנתב את ה-traffic לאחד מה-Pods הבריאים מאחוריו.",
            },
            {
              q: "איזה Service מתאים לגישה חיצונית ב-cloud?",
              options: [
              "ClusterIP – מספק IP פנימי שנגיש מכל Node ב-Cluster",
              "NodePort – חושף port על כל Node לגישה ממחשבים חיצוניים",
              "LoadBalancer – יוצר Load Balancer ב-cloud ומקצה IP חיצוני",
              "ExternalName – ממפה ל-DNS חיצוני ומאפשר גישה דרך CNAME",
              ],
              answer: 2,
              explanation:
                "ה-Service מסוג LoadBalancer מבקש מה-cloud provider (AWS, GCP, Azure) ליצור Load Balancer חיצוני ולהקצות לו IP ציבורי. ה-LB מנתב traffic לכל ה-Nodes ב-Cluster דרך NodePort. מתאים לייצור (production) כשצריך גישה חיצונית ישירה.",
            },
            {
              q: "מה Service מסוג ClusterIP?",
              options: [
              "חשיפה חיצונית עם IP קבוע שמנתב תנועה ל-Nodes ב-cloud",
              "גישה פנימית בלבד בתוך הCluster – ברירת המחדל של Service",
              "DNS חיצוני שמאפשר לPods לגשת לשירותים מחוץ לCluster",
              "VPN שמחבר Pods ב-Clusters שונים לתקשורת מאובטחת",
              ],
              answer: 1,
              explanation:
                "שירות ClusterIP הוא סוג ה-Service הדיפולטי - מקצה IP וירטואלי פנימי שנגיש רק מתוך ה-Cluster. Pods אחרים יכולים לגשת אליו לפי שם ב-DNS (my-service.my-ns.svc.cluster.local). אינו נגיש מחוץ לCluster ללא Ingress או port-forward.",
            },
            {
              q: "כיצד Service מוצא את ה-Pods שלו?",
              options: [
              "לפי שם ה-Pod שמוגדר ב-spec של ה-Service",
              "לפי labels ו-selector שמוגדרים ב-Service spec",
              "לפי כתובת IP שמוגדרת ידנית ב-Endpoints object",
              "לפי port שה-Pod מאזין עליו ו-Service מתאים",
              ],
              answer: 1,
              explanation:
                "ה-Service מגדיר selector עם key-value labels. ה-Endpoints controller מוצא את כל ה-Pods שמתאימים ל-selector ומוסיף את ה-IPs שלהם לאובייקט Endpoints. kube-proxy מנתב traffic לאחד מה-Endpoints האלה.",
            },
            {
              q: "מה ההבדל בין port ל-targetPort ב-Service?",
              options: [
              "אין הבדל, שניהם מגדירים את הפורט שהService מאזין עליו",
              "port הוא הפורט של ה-Service, targetPort הוא הפורט של הקונטיינר",
              "targetPort משמש לHTTP בלבד, port משמש לכל הפרוטוקולים",
              "port הוא לתנועה חיצונית, targetPort לתנועה פנימית בין Services",
              ],
              answer: 1,
              explanation:
                "port הוא הפורט שה-Service חושף. targetPort הוא הפורט שהקונטיינר מאזין עליו. הם יכולים להיות שונים.",
            },
            {
              q: "מה kube-dns/CoreDNS ב-Kubernetes?",
              options: [
              "Firewall שמסנן תנועה DNS ומונע גישה לdomains זדוניים",
              "שרת DNS פנימי שמתרגם שמות Services ל-IPs",
              "Load balancer שמנתב בקשות DNS בין Nodes",
              "Certificate manager שמנפיק TLS certs לServices",
              ],
              answer: 1,
              explanation:
                "CoreDNS רץ כ-Pod ומספק DNS פנימי לCluster. כל Service מקבל שם DNS אוטומטי.",
            },
            {
              q: "מה מטרת Ingress ב-Kubernetes?",
              options: [
              "Service פנימי שמספק load balancing בין Pods ב-Namespace",
              "ניתוב HTTP/HTTPS לפי path/hostname לServices שונים דרך כניסה אחת",
              "סוג Pod מיוחד שאחראי על ניהול חיבורי HTTPS",
              "storage manager שמנהל PVCs מסוג network storage",
              ],
              answer: 1,
              explanation:
                "Ingress חושף Services HTTP/HTTPS לחוץ עם ניתוב לפי path (/api, /web) או hostname (api.example.com). חוסך LoadBalancer לכל Service.",
            },
            {
              q: "מה NetworkPolicy בKubernetes?",
              options: [
              "DNS server פנימי שמנהל name resolution בין Pods",
              "חוק firewall ברמת Pod שמגדיר מי מורשה לתקשר עם מי",
              "סוג Service שמגביל גישה לפי Namespace",
              "storage class שמגביל גישה לPVs לפי Pod labels",
              ],
              answer: 1,
              explanation:
                "NetworkPolicy מגדירה חוקי גישה: ingress (מי מורשה להגיע לPod) ו-egress (לאן Pod מורשה לשלוח). דורשת CNI plugin תומך.",
            },
        ],
        questionsEn: [
            {
              q: "Why do we need a Service?",
              options: [
              "To reduce cloud costs by sharing one IP address across multiple Pods in the cluster",
              "A Pod's IP address changes every time it restarts; a Service provides a stable IP that always routes to healthy Pods",
              "To encrypt traffic between Pods running in different Namespaces",
              "To back up Pod configuration before the Pod is deleted",
              ],
              answer: 1,
              explanation:
                "A Pod is the smallest unit running your application in Kubernetes. Every time a Pod restarts, it gets a brand-new IP address - so you can't reliably connect to it directly. A Service provides a permanent, stable IP address (called ClusterIP) that never changes. Kubernetes automatically routes traffic from the Service to whichever Pods are currently healthy and running.",
            },
            {
              q: "Which Service type is for cloud external access?",
              options: [
              "ClusterIP – provides an internal cluster IP reachable from every Node in the cluster",
              "NodePort – exposes a port on every Node allowing access from external machines",
              "LoadBalancer – creates a cloud Load Balancer and assigns an external IP address",
              "ExternalName – maps to an external DNS name allowing access via a CNAME record",
              ],
              answer: 2,
              explanation:
                "A LoadBalancer Service asks your cloud provider (AWS, GCP, Azure) to automatically create a managed load balancer with a public IP address. Traffic from the internet hits that IP, and the cloud load balancer forwards it into your cluster. This is the standard production approach for external access, though each LoadBalancer Service provisions one cloud load balancer (which incurs additional cost).",
            },
            {
              q: "What is a ClusterIP Service?",
              options: [
              "External exposure that assigns a fixed IP reachable from outside the cluster via cloud DNS",
              "Internal-only access within the Cluster",
              "An external DNS record that maps a hostname to Pod IPs for cross-cluster routing",
              "A VPN tunnel connecting Pods in different Clusters for secure communication",
              ],
              answer: 1,
              explanation:
                "ClusterIP is the default Service type - it assigns a virtual internal IP reachable only from within the Cluster. Other Pods can reach it by DNS name (my-service.my-ns.svc.cluster.local). It is not reachable from outside the Cluster without an Ingress or port-forward.",
            },
            {
              q: "How does a Service find its Pods?",
              options: [
              "By the Pod name defined in the Service spec's targetRef field",
              "By labels and selector",
              "By a manually configured IP address in the Endpoints object",
              "By the port the Pod listens on, matched against the Service's targetPort",
              ],
              answer: 1,
              explanation:
                "A Service defines a label selector (key-value pairs). The Endpoints controller continuously watches for Pods matching the selector and adds their IPs to the Endpoints object. kube-proxy then routes traffic to one of those endpoints.",
            },
            {
              q: "What is the difference between port and targetPort in a Service?",
              options: [
              "There is no difference - both define the same port the Service listens and forwards on",
              "port is the Service port; targetPort is the container port",
              "targetPort is used for HTTP traffic only while port handles all other protocols",
              "port governs external traffic routing while targetPort governs internal Service-to-Service traffic",
              ],
              answer: 1,
              explanation:
                "port is the port that the Service exposes to the rest of the cluster (e.g., 80). targetPort is the port the container inside the Pod is actually listening on (e.g., 8080). They can be different - for example, your application might listen on port 8080, but you expose it as port 80 via the Service so callers use the conventional HTTP port.",
            },
            {
              q: "What is CoreDNS in Kubernetes?",
              options: [
              "A firewall Pod that filters DNS queries and blocks access to malicious external domains",
              "An internal DNS server that resolves Service names to IPs",
              "A load balancer Pod that routes DNS-based requests between Nodes in the cluster",
              "A certificate manager Pod that issues TLS certificates for Services",
              ],
              answer: 1,
              explanation:
                "CoreDNS runs as a Pod and provides internal cluster DNS. Every Service automatically gets a DNS name.",
            },
            {
              q: "What is the purpose of an Ingress in Kubernetes?",
              options: [
              "An internal Service that provides load balancing between Pods within the same Namespace",
              "Routes HTTP/HTTPS by path or hostname to different Services through one entry point",
              "A special Pod type responsible for managing HTTPS connections to the API server",
              "A storage manager that provisions network-attached storage for Pods",
              ],
              answer: 1,
              explanation:
                "An Ingress is an HTTP/HTTPS router at the edge of your cluster. Instead of creating a separate cloud load balancer for every Service, you define routing rules in one Ingress resource: send requests for /api to service-api, and /web to service-web. A component called the Ingress Controller (e.g., nginx) reads these rules and performs the actual routing. This lets many Services share a single external IP, saving cost.",
            },
            {
              q: "What is a NetworkPolicy in Kubernetes?",
              options: [
              "An internal DNS server that manages name resolution between Pods in a Namespace",
              "A Pod-level firewall rule defining who can communicate with whom",
              "A Service subtype that restricts access to specific Namespaces only",
              "A StorageClass that restricts PV access based on Pod labels",
              ],
              answer: 1,
              explanation:
                "A NetworkPolicy acts like a firewall at the Pod level. By default in Kubernetes, all Pods can freely talk to all other Pods. A NetworkPolicy lets you lock that down: you can control which Pods or IP ranges are allowed to send traffic to a Pod (ingress rules), and where a Pod is allowed to send traffic (egress rules). Important: NetworkPolicy only works if your cluster uses a CNI networking plugin that enforces it, such as Calico or Cilium. Plugins like Flannel do not enforce NetworkPolicies.",
            },
        ],
      },
      medium: {
        theory: "DNS ו-Ingress.\n🔹 כל Service מקבל DNS אוטומטי: service.namespace.svc.cluster.local\n🔹 Ingress מנתב HTTP/HTTPS לפי path או hostname\n🔹 Ingress חוסך LoadBalancers – כניסה אחת לכל ה-services\n🔹 דורש Ingress Controller (nginx, traefik)\nCODE:\napiVersion: networking.k8s.io/v1\nkind: Ingress\nspec:\n  rules:\n  - host: app.example.com\n    http:\n      paths:\n      - path: /api\n        backend:\n          service:\n            name: api-svc\n            port:\n              number: 80",
        theoryEn: "DNS and Ingress.\n🔹 Every Service gets automatic DNS: service.namespace.svc.cluster.local\n🔹 Ingress routes HTTP/HTTPS by path or hostname\n🔹 Ingress saves LoadBalancers – one entry point for all services\n🔹 Requires an Ingress Controller (nginx, traefik)\nCODE:\napiVersion: networking.k8s.io/v1\nkind: Ingress\nspec:\n  rules:\n  - host: app.example.com\n    http:\n      paths:\n      - path: /api\n        backend:\n          service:\n            name: api-svc\n            port:\n              number: 80",
        questions: [
            {
              q: "מה ה-DNS name של service בשם 'api' ב-namespace 'prod'?",
              options: [
              "api.prod",
              "api.prod.svc",
              "api.prod.svc.cluster.local",
              "prod.api.local",
              ],
              answer: 2,
              explanation:
                "ה-FQDN המלא הוא service.namespace.svc.cluster.local. CoreDNS מפתח שמות אלו ל-ClusterIP של ה-Service. בתוך אותו Namespace אפשר להשתמש בשם קצר (api בלבד) - CoreDNS מוסיף אוטומטית את הסיומת. api.prod הוא שם קצר שעובד מ-Namespace אחר.",
            },
            {
              q: "מה היתרון של Ingress על פני LoadBalancer?",
              options: [
              "מהיר יותר כי הוא מבצע פחות hop routing בין Pods",
              "כניסה אחת לכל ה-services",
              "זול יותר כי הוא מחליף SSL certificates אוטומטית",
              "יותר מאובטח כי הוא מצפין תנועה ב-mTLS בין Services",
              ],
              answer: 1,
              explanation:
                "ה-Ingress מאפשר לנהל ניתוב HTTP/S חכם (לפי host, path) דרך נקודת כניסה אחת. במקום LoadBalancer נפרד לכל Service (עלות גבוהה ב-cloud), Ingress מנתב מה-IP אחד לשירותים שונים. תומך גם ב-TLS termination ב-מקום אחד.",
            },
            {
              q: "כיצד מגדירים TLS ב-Ingress?",
              options: [
              "דרך ConfigMap שמכיל את ה-certificate ומוסיפים אותו ל-Ingress annotations",
              "דרך Secret מסוג TLS וציון שמות hosts ב-Ingress",
              "דרך Service מסוג ClusterIP שמגדיר TLS termination פנימי",
              "דרך NodePort שמגדיר TLS certificate לport ספציפי",
              ],
              answer: 1,
              explanation:
                "מגדירים Secret מסוג kubernetes.io/tls עם tls.crt ו-tls.key, ומפנים אליו ב-Ingress spec.tls.",
            },
            {
              q: "מה path-based routing ב-Ingress?",
              options: [
              "ניתוב לפי IP המקור של הבקשה לService ספציפי",
              "ניתוב בקשות HTTP לפי URL path לServices שונים",
              "ניתוב לפי HTTP header כמו X-User-Type לService שונה",
              "ניתוב לפי Namespace שממנו הבקשה נשלחת",
              ],
              answer: 1,
              explanation:
                "ניתוב מבוסס path מאפשר להגדיר ב-Ingress אחד כללי ניתוב לפי הנתיב ב-URL. לדוגמה, בקשות לנתיב /api יופנו ל-service-api ובקשות לנתיב /web יופנו ל-service-web. כך אפשר לחשוף מספר Services תחת דומיין אחד.",
            },
            {
              q: "מה egress NetworkPolicy?",
              options: [
              "מגביל תנועה נכנסת לPod לפי labels של Pod המקור",
              "מגביל תנועה יוצאת מPods",
              "מנהל DNS resolution עבור Pods ב-Namespace",
              "מגביל bandwidth של Pod לפי annotations",
              ],
              answer: 1,
              explanation:
                "כלל ה-NetworkPolicy עם policyTypes: [Egress] מגדיר לאיזה יעדים Pod מורשה לשלוח תנועה. ללא egress rules, כל היציאות חסומות. שימוש נפוץ: לאפשר יציאה רק ל-DNS (port 53) ולDB ספציפי, וחסום את כל השאר.",
            },
            {
              q: "כיצד Ingress מנתב לפי hostname?",
              options: [
              "לפי port שעליו מגיעה הבקשה, ממופה בשדה ports בהגדרת ה-Ingress",
              "בשדה host בתוך כל rule מגדירים hostname ספציפי שמנתב ל-Service מתאים",
              "שדה host בשורש ה-Ingress מגדיר hostname בודד לכל ה-rules",
              "דרך ConfigMap שמגדיר מיפוי של hostnames ל-Services",
              ],
              answer: 1,
              explanation:
                "כל rule ב-Ingress מכיל שדה host שמגדיר את ה-hostname. לדוגמה, אפשר להגדיר שבקשות ל-api.example.com ינותבו ל-Service אחד ובקשות ל-web.example.com ינותבו ל-Service אחר. כך Ingress אחד יכול לשרת מספר דומיינים.",
            },
            {
              q: "מה ExternalTrafficPolicy:Local לעומת Cluster?",
              options: [
              "Local מהיר יותר תמיד כי הוא מדלג על ה-NAT layer של kube-proxy",
              "Local שומר IP מקורי אבל רק Nodes עם Pod פעיל מקבלים תנועה; Cluster עושה SNAT",
              "Cluster מיועד לענן בלבד, Local ל-on-premise deployments",
              "אין הבדל מעשי בין השניים – רק שם שונה לאותו מנגנון",
              ],
              answer: 1,
              explanation:
                "Local: source IP נשמר ותנועה לא יוצאת מה-Node, אבל Nodes ללא Pod פעיל לא יקבלו תנועה ויגרמו לאי-איזון. Cluster: SNAT מאזן לכל Nodes אבל מאבד source IP.",
            },
            {
              q: "איך בודקים למה Service לא מגיע לPods?",
              options: [
              "kubectl logs service/<name> כדי לראות את logs של ה-Service",
              "בדוק kubectl get endpoints <service> – אם ריק, selector לא תואם labels",
              "kubectl describe service/<name> --show-pods מציג Pods מחוברים",
              "kubectl exec -it service/<name> -- netstat מציג חיבורים פעילים",
              ],
              answer: 1,
              explanation:
                "kubectl get endpoints <svc> מציג את ה-Pod IPs שה-Service מנתב אליהם. רשימה ריקה = בעיית selector/labels. בדוק kubectl get pods --show-labels.",
            },
        ],
        questionsEn: [
            {
              q: "What is the DNS name of service 'api' in namespace 'prod'?",
              options: [
              "api.prod",
              "api.prod.svc",
              "api.prod.svc.cluster.local",
              "prod.api.local",
              ],
              answer: 2,
              explanation:
                "The full FQDN is service.namespace.svc.cluster.local. CoreDNS resolves this to the Service's ClusterIP. Within the same Namespace ('prod') you can use just the short name 'api' - CoreDNS automatically appends the namespace and domain suffix. From a different Namespace, use at least 'api.prod' or the full FQDN 'api.prod.svc.cluster.local'.",
            },
            {
              q: "What is the advantage of Ingress over LoadBalancer?",
              options: [
              "Faster because it performs fewer routing hops between Pods",
              "One entry point for all services",
              "Always cheaper because it auto-renews SSL certificates at no extra cost",
              "More secure because it enforces mTLS between all backend Services",
              ],
              answer: 1,
              explanation:
                "In cloud environments, each LoadBalancer Service provisions a separate cloud load balancer with its own IP address and billing cost. An Ingress uses a single entry point (typically one load balancer or NodePort) and routes HTTP/HTTPS traffic to different backend Services based on the URL path (e.g., /api → api-service) or hostname (e.g., api.example.com → api-service). Many Services share one external IP, reducing cost and simplifying DNS management.",
            },
            {
              q: "How do you configure TLS in an Ingress?",
              options: [
              "Via a ConfigMap containing the certificate, referenced in Ingress annotations",
              "Via a TLS Secret and specifying hosts in the Ingress",
              "Via a ClusterIP Service that performs TLS termination internally",
              "Via a NodePort that specifies a TLS certificate for a specific port",
              ],
              answer: 1,
              explanation:
                "Create a kubernetes.io/tls Secret with tls.crt and tls.key, then reference it in Ingress spec.tls.",
            },
            {
              q: "What is path-based routing in Ingress?",
              options: [
              "Routing by the source IP address of the request to a specific Service",
              "Routing HTTP requests by URL path to different Services",
              "Routing by an HTTP header such as X-User-Type to reach a specific Service",
              "Routing based on the Namespace the request originates from",
              ],
              answer: 1,
              explanation:
                "Path-based routing allows /api → service-api, /web → service-web through one Ingress.",
            },
            {
              q: "What is an egress NetworkPolicy?",
              options: [
              "Restricts inbound traffic to Pods based on labels of the source Pod",
              "Restricts outbound traffic from Pods",
              "Manages DNS resolution for Pods within the Namespace",
              "Limits the bandwidth a Pod can use based on annotations",
              ],
              answer: 1,
              explanation:
                "An egress NetworkPolicy controls where a Pod is allowed to send traffic. When you add Egress to policyTypes, all outbound traffic from the selected Pods is blocked by default - only destinations you explicitly list in the egress rules are permitted. A common beginner mistake: forgetting to allow port 53 (UDP/TCP) for DNS. Without it, Pods can't resolve any hostnames, even if other egress rules are correct.",
            },
            {
              q: "How does Ingress route by hostname?",
              options: [
              "By the port on which the request arrives, mapped in the ports field of the Ingress",
              "Each rule defines a host field with a specific hostname that routes to the matching Service",
              "A single host field at the root of the Ingress spec applies one hostname to all rules",
              "Via a ConfigMap that maps hostname entries to backend Service names",
              ],
              answer: 1,
              explanation:
                "Each rule in an Ingress contains a host field that specifies the hostname. For example, requests to api.example.com can route to one Service while requests to web.example.com route to another. This lets a single Ingress serve multiple domains.",
            },
            {
              q: "What is ExternalTrafficPolicy:Local vs Cluster?",
              options: [
              "Local is always faster because it completely bypasses the kube-proxy NAT layer",
              "Local preserves the source IP but only Nodes with an active Pod receive traffic; Cluster SNATs traffic",
              "Cluster mode is for cloud deployments only while Local is for on-premises environments",
              "There is no practical difference between the two modes - only the naming differs",
              ],
              answer: 1,
              explanation:
                "Local: source IP preserved and traffic stays on the same Node, but Nodes without an active Pod receive no traffic which can cause imbalance. Cluster: SNAT balances across all Nodes but loses source IP.",
            },
            {
              q: "How do you debug why a Service is not reaching its Pods?",
              options: [
              "kubectl logs service/<name> to view connection logs from the Service",
              "Check kubectl get endpoints <service> - if empty, selector doesn't match labels",
              "kubectl describe service/<name> --show-pods to list all attached Pods",
              "kubectl exec -it service/<name> -- netstat to view active connections",
              ],
              answer: 1,
              explanation:
                "kubectl get endpoints <svc> shows the Pod IPs the Service routes to. An empty list means a selector/label mismatch. Check kubectl get pods --show-labels.",
            },
        ],
      },
      hard: {
        theory: "Network Policies ו-Namespaces.\n🔹 ברירת מחדל: כל Pod יכול לדבר עם כל Pod (allow-all)\n🔹 NetworkPolicy מגביל תנועה בין Pods\n🔹 דורש CNI plugin תומך (Calico, Cilium)\n🔹 Namespaces – בידוד לוגי: dev/staging/production\nCODE:\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nspec:\n  podSelector: {}\n  policyTypes:\n  - Ingress\n  - Egress",
        theoryEn: "Network Policies and Namespaces.\n🔹 Default: every Pod can talk to every Pod (allow-all)\n🔹 NetworkPolicy restricts traffic between Pods\n🔹 Requires a supporting CNI plugin (Calico, Cilium)\n🔹 Namespaces – logical isolation: dev/staging/production\nCODE:\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nspec:\n  podSelector: {}\n  policyTypes:\n  - Ingress\n  - Egress",
        questions: [
            {
              q: "מה קורה ללא NetworkPolicy?",
              options: [
              "כל תנועה חסומה ו-Pods לא מצליחים לתקשר עד שמגדירים allow rules",
              "כל Pod יכול לדבר עם כל Pod",
              "רק Pods באותו Namespace מדברים אחד עם השני",
              "רק תנועת HTTPS מותרת ותנועת HTTP נחסמת",
              ],
              answer: 1,
              explanation:
                "כשאין NetworkPolicy ב-Namespace, ה-default הוא allow-all - כל Pod יכול לדבר עם כל Pod ב-Cluster. ברגע שמוסיפים NetworkPolicy שמכסה Pod מסוים, כל traffic שלא מורשה במפורש - חסום.",
            },
            {
              q: "מה נדרש כדי ש-NetworkPolicy יעבוד?",
              options: [
              "גרסת Kubernetes 1.28 ומעלה עם feature gate מוגדר",
              "CNI plugin תומך כמו Calico או Cilium",
              "הפעלת firewall ברמת OS על כל Node",
              "cloud provider מיוחד שתומך ב-Network Policy API",
              ],
              answer: 1,
              explanation:
                "כלל ה-NetworkPolicy היא רק spec - יישום בפועל תלוי ב-CNI plugin. Calico, Cilium, ו-Weave תומכים בה. Flannel ו-kubenet לא מממשים NetworkPolicies - ה-policies יוצרות אבל לא נאכפות.",
            },
            {
              q: "מה היתרון של IPVS על iptables בkube-proxy?",
              options: [
              "יותר מאובטח כי הוא מצפין את כל התנועה ברמת kernel",
              "ביצועים טובים יותר בCluster גדול עם Hashing",
              "זול יותר כי הוא דורש פחות משאבי CPU מ-Node",
              "פשוט יותר להגדרה ולא דורש קונפיגורציה ב-kube-proxy",
              ],
              answer: 1,
              explanation:
                "IPVS משתמש ב-hash tables במקום iptables linear chains – ביצועים טובים יותר עם אלפי Services.",
            },
            {
              q: "ה-Service לא מנתב תנועה ל-Pods.\n\nהפלט של kubectl get endpoints מציג:\n\n```\nNAME      ENDPOINTS\napp-svc   <none>\n```\n\nה-Pod רץ עם label:\n`app: App` (A גדולה).\n\nה-Service מגדיר:\n```yaml\nspec:\n  selector:\n    app: app\n```\n\nמה הבעיה?",
              options: [
              "ה-Service port לא תואם את ה-targetPort של הקונטיינר",
              "ה-selector לא תואם — labels ב-Kubernetes הם case-sensitive",
              "ה-Pod לא במצב Ready ולכן לא נכלל ב-Endpoints",
              "ה-Pod וה-Service נמצאים ב-Namespaces שונים",
              ],
              answer: 1,
              explanation:
                "שורש הבעיה:\nLabels ב-Kubernetes הם case-sensitive.\nה-Pod מסומן עם app: App, אבל ה-Service מחפש app: app.\nמכיוון שהערכים לא זהים, ה-Endpoints ריקים ולא מנותבת תנועה.\n\nמה זה Endpoints?\nכאשר Service מוצא Pods שתואמים ל-selector שלו, הוא מוסיף את כתובות ה-IP שלהם לאובייקט Endpoints.\nרשימת Endpoints ריקה (<none>) אומרת שאף Pod לא תואם.\n\nהפתרון:\nלתקן את ה-selector ל-app: App כדי שיתאים ל-label של ה-Pod.\n\nכדי לאתר את הבעיה:\n```\nkubectl get endpoints app-svc\nkubectl get pods --show-labels\n```\n\nלמה שאר התשובות שגויות:\n• port שגוי — היה גורם לשגיאת חיבור, לא ל-Endpoints ריקים.\n• Pod לא Ready — Pod שאינו Ready מוסר מ-Endpoints, אבל כאן הבעיה היא בהתאמת labels.\n• Namespace שונה — Service מחפש Pods רק באותו Namespace, אבל הבעיה כאן היא case-sensitivity.",
            },
            {
              q: "כלל ה-NetworkPolicy חוסמת DNS. Pods לא מצליחים לפתור שמות.\n\nNetworkPolicy:\nspec:\n  podSelector: {}\n  policyTypes: [Egress]\n  egress:\n  - ports:\n    - port: 443\n\nמה חסר?",
              options: [
              "ingress rule",
              "egress rule לport 53 (DNS) לCoreDNS",
              "TLS certificate",
              "namespaceSelector",
              ],
              answer: 1,
              explanation:
                "כשמגדירים policyTypes: [Egress], כל יציאה שלא מוגדרת מפורשות נחסמת - כולל DNS. מכיוון שDNS עובד על port 53 (UDP ו-TCP) לכיוון CoreDNS, צריך להוסיף egress rule ל-port 53. port 443 בלבד לא מספיק.",
            },
            {
              q: "ה-Ingress מחזיר שגיאת 503.\n\nהפלט של kubectl describe ingress מציג:\n\n```\nBackend: api-svc:80 (<error: endpoints not found>)\n```\n\nמה הבעיה?",
              options: [
              "ה-Ingress Controller לא מותקן ב-Cluster",
              "ה-Service קיים אבל ה-selector לא מתאים לאף Pod",
              "תעודת ה-TLS שגויה וחוסמת חיבורים נכנסים",
              "ה-Ingress וה-Service נמצאים ב-Namespaces שונים",
              ],
              answer: 1,
              explanation:
                "שורש הבעיה:\nהשגיאה endpoints not found אומרת שה-Service api-svc קיים, אבל אין Pods שתואמים ל-selector שלו.\nכתוצאה מכך, רשימת ה-Endpoints ריקה וה-Ingress Controller לא יכול לנתב תנועה — ומחזיר 503.\n\nמה זה 503?\nקוד שגיאה HTTP שמשמעותו \"Service Unavailable\" — אין backend זמין לטפל בבקשה.\n\nכיצד לאתר את הבעיה:\n```\nkubectl get endpoints api-svc\nkubectl get pods --show-labels\n```\nהשוו את ה-labels על ה-Pods לבין ה-selector שמוגדר ב-Service.\n\nלמה שאר התשובות שגויות:\n• Ingress Controller לא מותקן — אם לא היה מותקן, ה-Ingress לא היה מגיב בכלל (לא 503).\n• TLS שגוי — היה גורם לשגיאת 4xx או בעיית SSL, לא 503 עם endpoints not found.\n• Namespace שונה — Ingress ו-Service חייבים להיות באותו Namespace, אבל השגיאה מצביעה על endpoints ריקים ולא על Service חסר.",
            },
            {
              q: "ה-Pod מנסה לגשת ל-api-svc.backend.cluster.local ולא מצליח. מה ה-FQDN הנכון של Service בשם api-svc ב-Namespace backend?",
              options: [
              "api-svc.backend הוא ה-FQDN המלא",
              "api-svc.backend.svc.cluster.local",
              "api-svc.backend.cluster.local",
              "api-svc.svc.cluster.local",
              ],
              answer: 1,
              explanation:
                "FQDN מלא: <service>.<namespace>.svc.cluster.local. api-svc.backend.cluster.local לא יפעל כי חסר .svc. api-svc.backend עובד בזכות search domains בתוך ה-Cluster, אבל אינו FQDN.",
            },
            {
              q: "ה-Pod לא מצליח להגיע לאינטרנט.\n\nkubectl exec -- curl https://google.com מחזיר timeout.\n\nNetworkPolicy:\nspec:\n  podSelector: {matchLabels: {app: worker}}\n  policyTypes: [Egress]\n  egress:\n  - to:\n    - podSelector: {}\n\nמה חסר?",
              options: [
              "ingress rule לאפשר תגובות נכנסות",
              "egress rule עם ipBlock: cidr: 0.0.0.0/0 לאפשר גישה ל-IPs חיצוניים",
              "Service מסוג LoadBalancer ב-Namespace",
              "הגדרת hostNetwork: true ב-Pod spec",
              ],
              answer: 1,
              explanation:
                "podSelector:{} מאפשר תנועה רק לPods בCluster, אבל IPs חיצוניים (כמו Google) אינם Pods. כדי לאפשר גישה לאינטרנט צריך להוסיף egress rule עם ipBlock: {cidr: '0.0.0.0/0'}. כמו כן, port 53 לDNS חייב להיות מוגדר כדי שname resolution יעבוד.",
            },
        ],
        questionsEn: [
            {
              q: "What happens without a NetworkPolicy?",
              options: [
              "All traffic is blocked and Pods cannot communicate until allow rules are defined",
              "Every Pod can talk to every Pod",
              "Only Pods within the same Namespace can communicate with each other",
              "Only HTTPS traffic is allowed while HTTP is blocked by default",
              ],
              answer: 1,
              explanation:
                "Without any NetworkPolicy, the default is allow-all - every Pod can talk to every other Pod in the Cluster. Once you apply a NetworkPolicy selecting a Pod, all traffic not explicitly allowed is blocked for that Pod.",
            },
            {
              q: "What is required for NetworkPolicy to work?",
              options: [
              "Kubernetes version 1.28 or newer with the feature gate enabled",
              "A supporting CNI plugin like Calico or Cilium",
              "Enabling an OS-level firewall on every Node in the cluster",
              "A special cloud provider that supports the Network Policy API",
              ],
              answer: 1,
              explanation:
                "A NetworkPolicy resource is just a declaration - Kubernetes itself does not enforce it. Enforcement is done by the CNI (Container Network Interface) plugin responsible for Pod networking. Calico, Cilium, and Weave Net all support NetworkPolicy enforcement. Flannel and kubenet do not - if you apply a NetworkPolicy on a Flannel cluster, the resource is created but completely ignored. Always verify your CNI plugin supports NetworkPolicy before relying on it for security.",
            },
            {
              q: "What is the advantage of IPVS over iptables in kube-proxy?",
              options: [
              "More secure because it encrypts all traffic at the kernel level",
              "Better performance in large clusters using hashing",
              "Cheaper because it requires less CPU from Nodes to maintain rules",
              "Simpler to configure and requires no extra kube-proxy configuration",
              ],
              answer: 1,
              explanation:
                "IPVS uses hash tables instead of iptables linear chains - much better performance with thousands of Services.",
            },
            {
              q: "A Service is not routing traffic to its Pods.\n\nThe output of kubectl get endpoints shows:\n\n```\nNAME      ENDPOINTS\napp-svc   <none>\n```\n\nThe Pod runs with label:\n`app: App` (capital A).\n\nThe Service spec reads:\n```yaml\nspec:\n  selector:\n    app: app\n```\n\nWhat is the problem?",
              options: [
              "The Service port does not match the container's targetPort",
              "The selector does not match — labels in Kubernetes are case-sensitive",
              "The Pod is not Ready and therefore excluded from Endpoints",
              "The Pod and Service are in different Namespaces",
              ],
              answer: 1,
              explanation:
                "Root cause:\nLabels in Kubernetes are case-sensitive.\nThe Pod is labeled app: App, but the Service selector looks for app: app.\nSince the values don't match, the Endpoints list is empty and no traffic is routed.\n\nWhat are Endpoints?\nWhen a Service finds Pods matching its selector, it adds their IP addresses to an Endpoints object.\nAn empty Endpoints list (<none>) means no Pods match the selector.\n\nThe fix:\nChange the selector to app: App so it matches the Pod label.\n\nTo debug:\n```\nkubectl get endpoints app-svc\nkubectl get pods --show-labels\n```\n\nWhy the other answers are wrong:\n• Wrong port — would cause connection errors, not empty Endpoints.\n• Pod not Ready — an unready Pod is removed from Endpoints, but here the issue is label matching.\n• Different Namespace — a Service only selects Pods in its own Namespace, but the issue here is case-sensitivity.",
            },
            {
              q: "A NetworkPolicy blocks DNS. Pods cannot resolve names.\n\nThe policy:\nspec:\n  podSelector: {}\n  policyTypes: [Egress]\n  egress:\n  - ports:\n    - port: 443\n\nWhat is missing?",
              options: [
              "An ingress rule",
              "An egress rule for port 53 (DNS) to CoreDNS",
              "A TLS certificate",
              "A namespaceSelector",
              ],
              answer: 1,
              explanation:
                "When policyTypes includes Egress, all outbound traffic not explicitly allowed is blocked - including DNS on port 53. Without a rule permitting port 53 UDP and TCP to CoreDNS, Pod name resolution fails entirely. Only permitting port 443 is not enough.",
            },
            {
              q: "An Ingress returns a 503 error.\n\nThe output of kubectl describe ingress shows:\n\n```\nBackend: api-svc:80 (<error: endpoints not found>)\n```\n\nWhat is the problem?",
              options: [
              "The Ingress Controller is not installed in the cluster",
              "The Service exists but its selector does not match any Pods",
              "The TLS certificate is invalid and blocking incoming connections",
              "The Ingress and Service are in different Namespaces",
              ],
              answer: 1,
              explanation:
                "Root cause:\nThe error endpoints not found means the Service api-svc exists, but no Pods match its selector.\nAs a result, the Endpoints list is empty and the Ingress Controller has nowhere to route traffic — returning 503.\n\nWhat is 503?\nAn HTTP status code meaning \"Service Unavailable\" — no backend is available to handle the request.\n\nHow to debug:\n```\nkubectl get endpoints api-svc\nkubectl get pods --show-labels\n```\nCompare the Pod labels with the selector defined in the Service.\n\nWhy the other answers are wrong:\n• Ingress Controller not installed — if it weren't installed, the Ingress would not respond at all (not a 503).\n• Wrong TLS — would cause a 4xx or SSL error, not a 503 with endpoints not found.\n• Different Namespace — Ingress and Service must be in the same Namespace, but the error points to empty endpoints, not a missing Service.",
            },
            {
              q: "A Pod tries to access api-svc.backend.cluster.local and fails. What is the correct FQDN for Service api-svc in Namespace backend?",
              options: [
              "api-svc.backend is the full FQDN",
              "api-svc.backend.svc.cluster.local",
              "api-svc.backend.cluster.local",
              "api-svc.svc.cluster.local",
              ],
              answer: 1,
              explanation:
                "The full FQDN is <service>.<namespace>.svc.cluster.local. api-svc.backend.cluster.local is missing the 'svc' segment and won't resolve. The short form api-svc.backend works via CoreDNS search domains but is not a FQDN.",
            },
            {
              q: "A Pod cannot reach the internet.\n\nkubectl exec -- curl https://google.com times out.\n\nNetworkPolicy:\nspec:\n  podSelector: {matchLabels: {app: worker}}\n  policyTypes: [Egress]\n  egress:\n  - to:\n    - podSelector: {}\n\nWhat is missing?",
              options: [
              "An ingress rule to allow response traffic",
              "An egress rule with ipBlock: cidr: 0.0.0.0/0 to allow external IPs",
              "A LoadBalancer Service in the Namespace",
              "Setting hostNetwork: true in the Pod spec",
              ],
              answer: 1,
              explanation:
                "podSelector:{} allows traffic only to other Pods inside the cluster. External IP addresses (like google.com) are not Pods, so that traffic is blocked. To allow internet access add an ipBlock rule for 0.0.0.0/0. Also add a port 53 egress rule so DNS resolution works.",
            },
        ],
      },
    },
  },
  {
    id: "config",
    icon: "🔐",
    name: "Configuration & Security",
    color: "#F59E0B",
    description: "ConfigMaps · Secrets · RBAC · ServiceAccounts",
    descriptionEn: "ConfigMaps · Secrets · RBAC · ServiceAccounts",
    levels: {
      easy: {
        theory: "ConfigMap ו-Secret מפרידים קוד מקונפיגורציה.\n🔹 ConfigMap – הגדרות רגילות (DB_URL, timeout)\n🔹 Secret – נתונים רגישים (passwords, tokens)\n🔹 Secrets מקודדים ב-base64 (לא מוצפנים לחלוטין!)\n🔹 שניהם: env variables או volume\nCODE:\napiVersion: v1\nkind: ConfigMap\ndata:\n  DB_URL: postgres://db:5432\n  MAX_CONN: \"100\"",
        theoryEn: "ConfigMap and Secret separate code from configuration.\n🔹 ConfigMap – regular settings (DB_URL, timeout)\n🔹 Secret – sensitive data (passwords, tokens)\n🔹 Secrets are base64 encoded (not fully encrypted by default!)\n🔹 Both: env variables or volume\nCODE:\napiVersion: v1\nkind: ConfigMap\ndata:\n  DB_URL: postgres://db:5432\n  MAX_CONN: \"100\"",
        questions: [
            {
              q: "מה ההבדל בין ConfigMap ל-Secret?",
              options: [
              "אין הבדל – שניהם מאחסנים key-value data בצורה זהה ב-etcd",
              "Secret מיועד לנתונים רגישים",
              "ConfigMap מהיר יותר לגישה כי הוא לא עובר base64 encoding",
              "Secret מיועד רק לpasswords ולא לסוגי sensitive data אחרים",
              ],
              answer: 1,
              explanation:
                "ה-Secret מיועד לנתונים רגישים (סיסמאות, tokens, TLS keys) ומאוחסן ב-etcd כ-base64 (ניתן להצפין Encryption at Rest). ConfigMap לקונפיגורציה רגילה שאין בה מידע רגיש. שניהם ניתנים להזרקה כ-env variables או volume.",
            },
            {
              q: "האם Secrets מוצפנים לחלוטין?",
              options: [
              "כן, Kubernetes מצפין את כל ה-Secrets תמיד ב-AES-256 כברירת מחדל",
              "לא, רק מקודדים ב-base64 כברירת מחדל",
              "תלוי בגרסת Kubernetes – מגרסה 1.25 מוצפנים אוטומטית",
              "כן, עם AES-256 שמוגדר אוטומטית בעת התקנת הCluster",
              ],
              answer: 1,
              explanation:
                "Secrets מקודדים ב-base64 בלבד – לא מוצפנים! לאבטחה אמיתית: הפעל Encryption at Rest ב-etcd, או השתמש ב-Sealed Secrets / external secrets manager.",
            },
            {
              q: "כיצד משתמשים ב-ConfigMap ב-Pod?",
              options: [
              "רק כקובץ – מוסיפים דרך volume ואין דרך אחרת לגשת לנתונים",
              "רק כenv variables ישירות ב-containers spec ולא בצורות אחרות",
              "כenv variables או כvolume files",
              "לא ניתן – Pod ניגש ל-ConfigMap רק דרך Kubernetes API call",
              ],
              answer: 2,
              explanation:
                "ישנן שלוש דרכים לצרוך ConfigMap ב-Pod: 1) envFrom/env - טוען values כ-env variables. 2) volumeMounts - מאונט ConfigMap כספרייה, כל key הופך לקובץ. 3) דרך Kubernetes API ישירות מהקוד. שינוי ב-volume יתעדכן אוטומטית (עם השהייה), שינוי ב-env מצריך restart.",
            },
            {
              q: "מה ה-ServiceAccount הברירת מחדל?",
              options: [
              "admin – ServiceAccount שנוצר עם הרשאות admin בכל Namespace",
              "default",
              "kubernetes – ServiceAccount שנקרא על שם הCluster",
              "root – ServiceAccount שמריץ Pods עם הרשאות root",
              ],
              answer: 1,
              explanation:
                "ServiceAccount הוא זהות עבור Pod - מאפשר לו להזדהות מול ה-Kubernetes API server. כל Namespace מכיל ServiceAccount בשם 'default', ו-Pods שלא מציינים ServiceAccount מקבלים אותו אוטומטית. best practice: ליצור ServiceAccount ייעודי לכל workload עם ההרשאות המינימליות הנדרשות.",
            },
            {
              q: "מה ראשי התיבות RBAC?",
              options: [
              "Role Based Access Control",
              "Resource Based Auth Configuration – מנגנון הרשאות מבוסס ענן",
              "Runtime Binary Access Control – אבטחת binaries בזמן ריצה",
              "Recursive Binding Access Control – ניהול bindings היררכיים",
              ],
              answer: 0,
              explanation:
                "RBAC = Role Based Access Control – מנגנון הרשאות ב-Kubernetes. עובד עם שלושה אבני בניין: Roles (מגדירים אילו פעולות מותרות על אילו resources), Subjects (מי מורשה - Users, Groups, או ServiceAccounts), ו-Bindings (מחברים Role ל-Subject). לדוגמה, אפשר לאפשר למפתח לצפות ב-Pods אך לא למחוק אותם.",
            },
            {
              q: "מה LimitRange עושה ב-Namespace?",
              options: [
              "מגביל את מספר ה-Nodes שPods ב-Namespace יכולים לרוץ עליהם",
              "מגדיר ברירות מחדל ומגבלות לCPU/Memory לPods וcontainers בNamespace",
              "מנטר logs ושולח alerts כשצריכת CPU עולה על threshold",
              "מגביל DNS queries מ-Pods ב-Namespace",
              ],
              answer: 1,
              explanation:
                "LimitRange פועל ברמת Namespace ומגדיר ברירות מחדל ומגבלות per-Container ל-CPU ו-Memory. אם container לא מציין requests/limits, LimitRange מזריק ערכי default. בנוסף מאכף min/max - מונע container מלבקש יותר מדי או מעט מדי resources. ללא LimitRange, מפתחים עלולים לשכוח limits ו-Pod אחד יכול לצרוך את כל משאבי ה-Node.",
            },
            {
              q: "מה securityContext.runAsNonRoot: true עושה?",
              options: [
              "מגביל CPU usage של הקונטיינר לערך שנקבע ב-limits",
              "מונע הפעלת קונטיינר כuser 0 (root)",
              "מגביל גישת רשת של הקונטיינר לaddresses ספציפיות",
              "מצפין את כל ה-filesystem של הקונטיינר",
              ],
              answer: 1,
              explanation:
                "ב-Linux, משתמש root (UID 0) מחזיק בהרשאות מלאות על המערכת. אם קונטיינר רץ כ-root ותוקף מנצל פרצת container escape, הוא עלול לקבל גישת root על ה-Node. runAsNonRoot: true מורה ל-Kubernetes לסרב להפעיל קונטיינר אם ה-image מוגדר לרוץ כ-root, ובכך מצמצם את רדיוס הפגיעה של כל פריצה.",
            },
            {
              q: "מה ההבדל בין resource requests ל-limits?",
              options: [
              "אין הבדל",
              "requests – הכמות המינימלית שהScheduler מבטיח; limits – הכמות המקסימלית שהקונטיינר יכול להשתמש",
              "requests לCPU, limits לmemory",
              "requests לproduction, limits לdev",
              ],
              answer: 1,
              explanation:
                "requests קובעים את ה-scheduling של ה-Scheduler - Node נבחר רק אם יש בו מספיק resources פנויים. limits קובעים את המקסימום – חריגה מ-limits.memory = OOMKill, חריגה מ-limits.cpu = throttling.",
            },
        ],
        questionsEn: [
            {
              q: "What is the difference between ConfigMap and Secret?",
              options: [
              "No difference - both store key-value data identically in etcd",
              "Secret is intended for sensitive data",
              "ConfigMap is faster because it skips base64 encoding",
              "Secret is only for passwords and not for other sensitive data types",
              ],
              answer: 1,
              explanation:
                "Both ConfigMap and Secret store key-value data, but they serve different purposes. ConfigMap is for non-sensitive configuration (like a database URL or timeout value). Secret is for sensitive data (passwords, API tokens, TLS certificates). Secret values are base64-encoded in storage - not encrypted by default, but Kubernetes applies stricter access control to them. Both can be used in Pods as environment variables or mounted as files.",
            },
            {
              q: "Are Secrets fully encrypted by default?",
              options: [
              "Yes, Kubernetes always encrypts Secrets at rest with AES-256 by default",
              "No, only base64 encoded by default",
              "Depends on the Kubernetes version - encrypted automatically from v1.25 onwards",
              "Yes, with AES-256 configured automatically during cluster installation",
              ],
              answer: 1,
              explanation:
                "Secrets are only base64-encoded by default - not encrypted! For real security: enable Encryption at Rest for etcd, or use Sealed Secrets / an external secrets manager.",
            },
            {
              q: "How can a ConfigMap be used in a Pod?",
              options: [
              "Only as a file mounted via a volume - no other access method is supported",
              "Only as env variables injected directly in the containers spec",
              "As env variables or volume files",
              "Not possible - a Pod accesses ConfigMap data only via Kubernetes API calls",
              ],
              answer: 2,
              explanation:
                "A ConfigMap can reach a Pod in two main ways. As environment variables: each key becomes an env var the application reads at startup (e.g., DB_URL=postgres://...). As mounted files: the ConfigMap is mounted as a directory inside the container, and each key becomes a file whose content is the value. Changes to a ConfigMap mounted as a volume are automatically reflected in running Pods (with a short delay). Changes to env variables only take effect after the Pod is restarted.",
            },
            {
              q: "What is the default ServiceAccount?",
              options: [
              "admin - a ServiceAccount with full admin permissions in every Namespace",
              "default",
              "kubernetes - a ServiceAccount named after the cluster itself",
              "root - a ServiceAccount that runs Pods with root privileges",
              ],
              answer: 1,
              explanation:
                "A ServiceAccount is an identity for a Pod - it lets the Pod authenticate to the Kubernetes API server (for example, a monitoring agent that needs to list all Pods). Every Namespace automatically gets a ServiceAccount named 'default', and Pods that don't explicitly specify a ServiceAccount are assigned it automatically. The default ServiceAccount has minimal permissions, but best practice is to create dedicated ServiceAccounts with only the permissions each workload needs.",
            },
            {
              q: "What does RBAC stand for?",
              options: [
              "Role Based Access Control",
              "Resource Based Auth Configuration - a cloud-level permission mechanism",
              "Runtime Binary Access Control - runtime security for binaries",
              "Recursive Binding Access Control - hierarchical binding management",
              ],
              answer: 0,
              explanation:
                "RBAC = Role Based Access Control - Kubernetes' system for controlling who can do what. For example, RBAC can allow a developer to list and view Pods but not delete them, or let a monitoring tool read all resources without modifying anything. It works through three building blocks: Roles (define which actions are allowed on which resources), Subjects (who is allowed - users, groups, or ServiceAccounts), and Bindings (connect a Role to a Subject).",
            },
            {
              q: "What does LimitRange do in a Namespace?",
              options: [
              "Limits the number of Nodes that Pods in the Namespace can run on",
              "Sets default and maximum CPU/Memory for Pods and containers in a Namespace",
              "Monitors logs and sends alerts when CPU exceeds a threshold",
              "Limits DNS queries from Pods within the Namespace",
              ],
              answer: 1,
              explanation:
                "In Kubernetes, resource requests (how much CPU/memory a container needs) and limits (the maximum it can use) should be set on every container. LimitRange enforces this at the Namespace level: it can automatically apply default requests and limits to containers that don't specify them, and enforce minimum/maximum boundaries. Without LimitRange, developers might forget to set limits, allowing a single Pod to consume all resources on a Node and starve other Pods.",
            },
            {
              q: "What does securityContext.runAsNonRoot: true do?",
              options: [
              "Limits the container's CPU usage to the value set in limits",
              "Prevents the container from running as user 0 (root)",
              "Limits the container's network access to specific IP addresses",
              "Encrypts the entire container filesystem",
              ],
              answer: 1,
              explanation:
                "In Linux, the root user (UID 0) has unlimited system-wide privileges. If a container runs as root and an attacker exploits a container escape vulnerability, they could gain root access on the underlying Node - a serious breach. runAsNonRoot: true tells Kubernetes to refuse to start the container if the image's default user is root (UID 0). This forces you to build images that run as a non-privileged user account, limiting the blast radius of any compromise.",
            },
            {
              q: "What is the difference between resource requests and limits?",
              options: [
              "No difference - requests and limits are always set to the same value",
              "requests - the minimum the Scheduler guarantees; limits - the maximum the container can use",
              "requests define CPU only while limits define memory only",
              "requests are for production workloads; limits are for dev and staging",
              ],
              answer: 1,
              explanation:
                "requests tell the Kubernetes Scheduler how much CPU/memory to reserve on a Node for a container - a Node is chosen only if it has enough free capacity. limits cap what the container can actually consume at runtime. If a container exceeds its memory limit, the Linux kernel forcibly kills it (OOMKill = Out-Of-Memory Kill) and Kubernetes restarts it. If it exceeds its CPU limit, it is throttled (slowed down) but not killed. Always set both so one misbehaving Pod can't starve others on the same Node.",
            },
        ],
      },
      medium: {
        theory: "RBAC – Role-Based Access Control.\n🔹 Role – הרשאות בNamespace אחד\n🔹 ClusterRole – הרשאות לכל הCluster\n🔹 RoleBinding – קושר Role למשתמש/ServiceAccount\n🔹 ServiceAccount – זהות לPod בתוך הCluster\nCODE:\napiVersion: rbac.authorization.k8s.io/v1\nkind: Role\nrules:\n- apiGroups: [\"\"]\n  resources: [\"pods\"]\n  verbs: [\"get\",\"list\",\"watch\"]",
        theoryEn: "RBAC – Role-Based Access Control.\n🔹 Role – permissions in one Namespace\n🔹 ClusterRole – permissions across the whole Cluster\n🔹 RoleBinding – binds a Role to a user/ServiceAccount\n🔹 ServiceAccount – identity for a Pod within the Cluster\nCODE:\napiVersion: rbac.authorization.k8s.io/v1\nkind: Role\nrules:\n- apiGroups: [\"\"]\n  resources: [\"pods\"]\n  verbs: [\"get\",\"list\",\"watch\"]",
        questions: [
            {
              q: "מה ההבדל בין Role ל-ClusterRole?",
              options: [
              "אין הבדל",
              "Role מוגבל לNamespace, ClusterRole לכל הCluster",
              "ClusterRole חזק יותר תמיד",
              "Role לusers בלבד",
              ],
              answer: 1,
              explanation:
                "Role מגדיר הרשאות (כמו list, get, delete על Pods) בתוך Namespace ספציפי בלבד - Role ב-prod לא מעניק גישה ב-staging. ClusterRole מגדיר הרשאות ברמת כל ה-Cluster, כולל resources ברמת Cluster כמו Nodes ו-PersistentVolumes. ניתן גם לקשור ClusterRole ל-Namespace בודד באמצעות RoleBinding - pattern נפוץ לשיתוף הרשאות זהות בין Namespaces.",
            },
            {
              q: "מה תפקיד RoleBinding?",
              options: [
              "יצירת Role חדש",
              "חיבור בין Role למשתמש/ServiceAccount",
              "העתקת Role",
              "מחיקת Role",
              ],
              answer: 1,
              explanation:
                "ה-RoleBinding קושר Role (רשימת הרשאות) ל-subject: User, Group, או ServiceAccount - בתוך Namespace מסוים. לגישה בכל ה-Cluster משתמשים ב-ClusterRoleBinding. בלי RoleBinding, ה-Role לא נאכף על אף ישות.",
            },
            {
              q: "מה תפקיד ServiceAccount ב-Kubernetes?",
              options: [
              "חשבון למשתמש אנושי",
              "זהות לPod/תהליך בתוך הCluster",
              "שם לService",
              "חשבון billing",
              ],
              answer: 1,
              explanation:
                "ה-ServiceAccount הוא זהות מכונה (machine identity) עבור Pods - לא למשתמשים אנושיים. Kubernetes מזריק token אוטומטית לכל Pod, שבאמצעותו הPod יכול לאמת את עצמו מול ה-API server ולקבל הרשאות לפי RBAC. לכל Namespace יש ServiceAccount בשם 'default'.",
            },
            {
              q: "מה תפקיד Pod Security Admission?",
              options: [
              "Firewall לPods",
              "מנגנון Kubernetes (beta מ-1.23, GA מ-1.25) שאוכף Pod Security Standards (privileged/baseline/restricted)",
              "Plugin לאימות",
              "Network policy",
              ],
              answer: 1,
              explanation:
                "Pod Security Admission (PSA) הוא controller מובנה ב-Kubernetes שאוכף תקני אבטחה על Pods לפני שהם מורשים לרוץ. מפעילים אותו על ידי הוספת label ל-Namespace (כמו pod-security.kubernetes.io/enforce=restricted), ו-Kubernetes דוחה אוטומטית כל Pod שלא עומד ברמה הנדרשת. מחליף את PodSecurityPolicy שהוסר ב-v1.25.",
            },
            {
              q: "מה תפקיד admission webhook ב-Kubernetes?",
              options: [
              "Webhook לgit",
              "HTTP callback שמופעל לפני שמירת resource ב-etcd, לאימות או לשינוי",
              "Service account",
              "Plugin לlogging",
              ],
              answer: 1,
              explanation:
                "Admission webhook מיירט כל בקשת create/update/delete ל-API server לפני שהשינוי נשמר ב-etcd. שני סוגים: Validating webhook בודק resource ודוחה אותו (למשל, חוסם images ממקורות לא מאושרים). Mutating webhook משנה resource לפני שמירה (למשל, מזריק sidecar אוטומטית לכל Pod). כלים כמו OPA Gatekeeper ו-Kyverno עובדים כ-admission webhooks.",
            },
            {
              q: "מה LimitRange לעומת ResourceQuota?",
              options: [
              "אין הבדל",
              "LimitRange – ברירות מחדל ומגבלות per-container. ResourceQuota – מגבלות aggregate לכל ה-Namespace",
              "ResourceQuota לCPU, LimitRange לmemory",
              "LimitRange לproduction בלבד",
              ],
              answer: 1,
              explanation:
                "LimitRange פועל ברמת container בודד - מגדיר default requests/limits ואוכף min/max per-container. ResourceQuota פועל ברמת Namespace שלם - מגביל את סך כל ה-resources (למשל, מקסימום 20 Pods, סה\"כ 8 CPU, 16Gi Memory). LimitRange מונע container בודד מלבקש יותר מדי, ResourceQuota מונע צוות שלם מלצרוך יותר מהמוקצה.",
            },
            {
              q: "מה seccomp profile עושה?",
              options: [
              "מגביל CPU",
              "מגביל את syscalls שקונטיינר יכול לבצע – מצמצם attack surface",
              "מצפין traffic",
              "מגביל DNS",
              ],
              answer: 1,
              explanation:
                "seccomp (secure computing mode) מגביל אילו system calls קונטיינר יכול לבצע. ל-Linux יש 300+ syscalls, אך רוב הקונטיינרים צריכים רק חלק קטן. חסימת syscalls מיותרות מצמצמת את attack surface - אם תוקף מנצל פרצה, הוא לא יכול להשתמש ב-syscalls מסוכנות להסלמת הרשאות. הגדרת seccompProfile.type: RuntimeDefault ב-Pod spec מיישמת את פרופיל ה-baseline המומלץ.",
            },
            {
              q: "כיצד מסנכרנים Secret מ-AWS Secrets Manager?",
              options: [
              "kubectl sync secret",
              "External Secrets Operator – SecretStore + ExternalSecret CR",
              "aws-cli secret inject",
              "kubectl aws-secret",
              ],
              answer: 1,
              explanation:
                "External Secrets Operator (ESO) מסנכרן secrets מmanagers חיצוניים (AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault) אל Kubernetes Secrets. יוצרים SecretStore (מגדיר חיבור ל-provider), ואז ExternalSecret (מציין אילו secrets לסנכרן ולאיפה ב-K8s). ה-operator יוצר ומעדכן K8s Secret אוטומטית - כך הsecrets לא מנוהלים ידנית ולא נשמרים ב-git.",
            },
        ],
        questionsEn: [
            {
              q: "What is the difference between Role and ClusterRole?",
              options: [
              "No difference",
              "Role is Namespace-scoped, ClusterRole is cluster-wide",
              "ClusterRole is always stronger",
              "Role for users only",
              ],
              answer: 1,
              explanation:
                "A Role is a set of permissions (e.g., 'can list and get Pods') that applies only within a specific Namespace - a Role in 'prod' grants no access in 'staging'. A ClusterRole defines permissions that apply across the entire cluster, including cluster-scoped resources like Nodes, PersistentVolumes, and Namespaces themselves. A ClusterRole can also be bound within a single Namespace via a RoleBinding - a useful pattern for sharing a common permission set across many Namespaces.",
            },
            {
              q: "What is a RoleBinding?",
              options: [
              "Creating a new Role",
              "Binding a Role to a user/ServiceAccount",
              "Copying a Role",
              "Deleting a Role",
              ],
              answer: 1,
              explanation:
                "RoleBinding binds a Role (a list of permissions) to a subject - User, Group, or ServiceAccount - within a specific Namespace. For cluster-wide access, use ClusterRoleBinding. Without a RoleBinding, a Role has no effect on any identity.",
            },
            {
              q: "What is a ServiceAccount?",
              options: [
              "Account for a human user",
              "Identity for a Pod/process within the Cluster",
              "Name for a Service",
              "Billing account",
              ],
              answer: 1,
              explanation:
                "A ServiceAccount is a machine identity - not for human users, but for applications running inside Pods. When a Pod needs to interact with the Kubernetes API (e.g., a monitoring tool listing all Pods, or an operator creating other resources), it authenticates using its ServiceAccount's token, which Kubernetes automatically mounts into every Pod. RBAC then controls what actions that ServiceAccount is permitted to perform.",
            },
            {
              q: "What is Pod Security Admission?",
              options: [
              "A Pod firewall",
              "A Kubernetes mechanism (beta v1.23, GA v1.25) enforcing Pod Security Standards (privileged/baseline/restricted)",
              "An auth plugin",
              "A network policy",
              ],
              answer: 1,
              explanation:
                "Pod Security Admission (PSA) is a built-in Kubernetes controller that enforces security standards on Pods before allowing them to run. You activate it by adding a label to a Namespace (e.g., pod-security.kubernetes.io/enforce=restricted), and Kubernetes automatically rejects any Pod that doesn't meet the required security level. It replaced the older PodSecurityPolicy (PSP), which was removed in v1.25. The three levels - privileged (no restrictions), baseline (blocks known bad practices), restricted (strict production hardening) - cover most security needs.",
            },
            {
              q: "What is an admission webhook?",
              options: [
              "A git webhook",
              "An HTTP callback triggered before a resource is persisted to etcd, for validation or mutation",
              "A service account",
              "A logging plugin",
              ],
              answer: 1,
              explanation:
                "An admission webhook intercepts every create/update/delete request to the Kubernetes API server before the change is saved to etcd (the cluster's database). There are two kinds: a Validating webhook can inspect a resource and reject it outright (e.g., block Pods with images from unapproved registries). A Mutating webhook can modify a resource before saving (e.g., automatically inject a sidecar container into every Pod). Tools like OPA Gatekeeper and Kyverno work as admission webhooks.",
            },
            {
              q: "What is the difference between LimitRange and ResourceQuota?",
              options: [
              "No difference",
              "LimitRange sets per-container defaults and limits; ResourceQuota sets aggregate limits for the whole Namespace",
              "ResourceQuota for CPU, LimitRange for memory",
              "LimitRange for production only",
              ],
              answer: 1,
              explanation:
                "LimitRange operates at the individual container level - it sets default requests/limits and enforces min/max per container. ResourceQuota operates at the entire Namespace level - it caps the total resources consumed (e.g., max 20 Pods, total 8 CPU, 16Gi Memory across all workloads). LimitRange prevents a single container from requesting too much; ResourceQuota prevents a whole team from exceeding their allocation.",
            },
            {
              q: "What does a seccomp profile do?",
              options: [
              "Limits CPU",
              "Restricts syscalls a container can make - reduces the attack surface",
              "Encrypts traffic",
              "Limits DNS",
              ],
              answer: 1,
              explanation:
                "System calls (syscalls) are how programs ask the OS kernel to do privileged things - open files, create network connections, fork new processes. Linux has 300+ syscalls, but most containers only need a small subset. seccomp (secure computing mode) lets you block all syscalls the container doesn't need. If an attacker exploits a vulnerability inside the container, they cannot use dangerous syscalls to escalate privileges or escape. Setting seccompProfile.type: RuntimeDefault in the Pod spec applies the container runtime's recommended safe baseline profile.",
            },
            {
              q: "How do you sync a Secret from AWS Secrets Manager?",
              options: [
              "kubectl sync secret",
              "External Secrets Operator - SecretStore + ExternalSecret CR",
              "aws-cli secret inject",
              "kubectl aws-secret",
              ],
              answer: 1,
              explanation:
                "External Secrets Operator (ESO) synchronizes secrets from external managers (AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault) into Kubernetes Secrets. You create a SecretStore (defines the connection to the provider) and an ExternalSecret (specifies which secrets to sync and where to store them in K8s). The operator automatically creates and refreshes the K8s Secret - so secrets are never managed manually or stored in git.",
            },
        ],
      },
      hard: {
        theory: "אבטחה מתקדמת.\n🔹 Least Privilege – רק ההרשאות הנחוצות\n🔹 External Secrets Operator – מסנכרן מ-AWS/GCP/Azure\n🔹 Sealed Secrets – מצפין secrets בgit\n🔹 Encryption at Rest – הצפנת etcd\nCODE:\napiVersion: external-secrets.io/v1beta1\nkind: ExternalSecret\nspec:\n  secretStoreRef:\n    name: aws-secretsmanager\n  target:\n    name: my-k8s-secret",
        theoryEn: "Advanced security.\n🔹 Least Privilege – only necessary permissions\n🔹 External Secrets Operator – syncs from AWS/GCP/Azure\n🔹 Sealed Secrets – encrypts secrets in git\n🔹 Encryption at Rest – encrypting etcd\nCODE:\napiVersion: external-secrets.io/v1beta1\nkind: ExternalSecret\nspec:\n  secretStoreRef:\n    name: aws-secretsmanager\n  target:\n    name: my-k8s-secret",
        questions: [
            {
              q: "מה עיקרון Least Privilege?",
              options: [
              "לתת admin לכולם",
              "לתת רק את ההרשאות המינימליות הנחוצות",
              "לא לתת הרשאות בכלל",
              "הרשאות לפי שם",
              ],
              answer: 1,
              explanation:
                "עיקרון Least Privilege (הרשאות מינימליות) - כל ישות (Pod, ServiceAccount, משתמש) מקבלת רק את ההרשאות הנדרשות לה בדיוק, ולא יותר. ב-Kubernetes: לא לתת cluster-admin כשמספיק Role ב-Namespace אחד.",
            },
            {
              q: "מה Encryption at Rest?",
              options: [
              "הצפנת תנועת רשת",
              "הצפנת etcd database שמאחסן secrets",
              "הצפנת קבצי log",
              "הצפנת images",
              ],
              answer: 1,
              explanation:
                "ב-Kubernetes, Secrets מאוחסנים ב-etcd כ-base64 - לא מוצפנים כברירת מחדל. Encryption at Rest מפעיל הצפנת AES-GCM על הנתונים לפני שמירה ב-etcd, כך שגם מי שגונב את מסד ה-etcd לא יוכל לקרוא את ה-Secrets.",
            },
            {
              q: "מה Sealed Secrets מאפשר?",
              options: [
              "הצפנת תעבורת רשת",
              "שמירת secrets מוצפנים ב-git בבטחה",
              "יצירת secrets אוטומטית",
              "שיתוף בין clusters",
              ],
              answer: 1,
              explanation:
                "כלי Sealed Secrets (של Bitnami) מצפין Secret רגיל ל-SealedSecret עם המפתח הציבורי של ה-Cluster. ה-SealedSecret המוצפן בטוח לשמירה ב-git repo. רק ה-controller בתוך ה-Cluster שמחזיק את המפתח הפרטי יכול לפענח ולצור את ה-Secret האמיתי.",
            },
            {
              q: "מה שלוש רמות Pod Security Standards?",
              options: [
              "low/medium/high",
              "privileged/baseline/restricted",
              "none/basic/full",
              "open/limited/closed",
              ],
              answer: 1,
              explanation:
                "שלוש הרמות של Pod Security Standards: privileged – ללא הגבלות כלל, מאפשר הכל כולל hostNetwork ו-privileged containers. baseline – חוסם שימושים מסוכנים ידועים כמו hostPID, hostNetwork, ו-privileged mode, אך לא דורש הגדרות אבטחה מפורשות. restricted – הרמה המחמירה ביותר, דורשת runAsNonRoot, drop ALL capabilities, seccomp profile, ועוד. best practice ל-production.",
            },
            {
              q: "מה תפקיד OPA/Gatekeeper ב-Kubernetes?",
              options: [
              "Open Port Authority",
              "Open Policy Agent – מנגנון policy כ-code לK8s",
              "Optional Pod Allocator",
              "Object Permission Abstraction",
              ],
              answer: 1,
              explanation:
                "OPA (Open Policy Agent) Gatekeeper הוא admission webhook שאוכף policies מותאמות אישית על כל resource שנוצר ב-Cluster. הpolicies נכתבות ב-Rego, שפת כללים דקלרטיבית. בניגוד ל-PSA (שמציע רמות קבועות), Gatekeeper מאפשר כללים שרירותיים - למשל: כל image חייב להגיע מ-registry מאושר, כל Pod חייב להגדיר limits, או אסור ליצור Service מסוג LoadBalancer. Kyverno הוא אלטרנטיבה עם תחביר YAML.",
            },
            {
              q: "ה-Pod מקבל את השגיאה הבאה:\n\n```\nError: pods is forbidden:\nUser 'system:serviceaccount:default:my-sa'\ncannot list resource 'pods' in namespace 'prod'\n```\n\nמה הפתרון הנכון?",
              options: [
              "למחוק את ה-ServiceAccount וליצור חדש במקומו",
              "ליצור Role עם הרשאת list pods ולקשור אותו ל-my-sa",
              "להוסיף ClusterRoleBinding עם הרשאת cluster-admin",
              "לעבור ל-default ServiceAccount במקום my-sa",
              ],
              answer: 1,
              explanation:
                "שורש הבעיה:\nל-ServiceAccount בשם my-sa אין הרשאת list על Pods ב-namespace prod.\nב-Kubernetes, כל גישה ל-API חייבת להיות מאושרת במפורש דרך RBAC.\n\nהפתרון — ליצור Role ו-RoleBinding:\n```yaml\nkind: Role\nmetadata:\n  namespace: prod\nrules:\n- apiGroups: [\"\"]\n  resources: [\"pods\"]\n  verbs: [\"list\"]\n---\nkind: RoleBinding\nsubjects:\n- kind: ServiceAccount\n  name: my-sa\n  namespace: default\nroleRef:\n  kind: Role\n  name: pod-reader\n```\n\nלמה שאר התשובות שגויות:\n• מחיקת ServiceAccount — לא פותרת את חוסר ההרשאות, רק מסירה את הזהות.\n• cluster-admin — מעניק הרשאות מלאות על כל ה-Cluster, מהווה סיכון אבטחי חמור.\n• default ServiceAccount — גם לו אין הרשאות ל-list pods כברירת מחדל.",
            },
            {
              q: "ניסיון לפרוס Deployment נכשל עם השגיאה:\n\n```\nError from server: admission webhook 'validate.kyverno.svc'\ndenied the request:\nContainer image must come from 'gcr.io/'\n```\n\nמה קורה?",
              options: [
              "ה-Kubernetes API server קרס ולא מגיב לבקשות",
              "Admission webhook חסם את ה-image כי הוא לא מ-registry מאושר",
              "הרשאות RBAC חוסמות יצירת Deployment ב-Namespace",
              "ה-Namespace שצוין ב-Deployment לא קיים ב-Cluster",
              ],
              answer: 1,
              explanation:
                "שורש הבעיה:\nKyverno (כלי policy-as-code) מותקן ב-Cluster כ-ValidatingAdmissionWebhook.\nהוא אוכף policy שמאפשרת רק images מ-gcr.io/ — וחוסם כל image ממקור אחר.\n\nמה זה Admission Webhook?\nשכבת validation שרצה לפני ש-Kubernetes מאשר יצירת resource.\nכל בקשת create/update עוברת דרכו לפני שמירה ב-etcd.\n\nהפתרון:\nלשנות את ה-image ב-Deployment ל-image מ-gcr.io/, או לעדכן את ה-policy ב-Kyverno.\n\nלמה שאר התשובות שגויות:\n• API server קרס — אם הוא היה קורס, לא הייתם מקבלים הודעת שגיאה מסודרת.\n• RBAC — הודעת RBAC נראית שונה (\"forbidden\"), לא \"admission webhook denied\".\n• Namespace לא קיים — השגיאה הייתה \"namespace not found\", לא admission webhook.",
            },
            {
              q: "ה-PSA מוגדר עם enforce=restricted. Deployment נדחה:\n\nPod violates PodSecurity 'restricted:latest': allowPrivilegeEscalation != false\n\nמה מוסיפים ל-container spec?",
              options: [
              "privileged: true",
              "securityContext: {allowPrivilegeEscalation: false, runAsNonRoot: true, seccompProfile: {type: RuntimeDefault}}",
              "namespace label שינוי",
              "serviceAccount שינוי",
              ],
              answer: 1,
              explanation:
                "רמת restricted ב-Pod Security Admission דורשת מספר הגדרות אבטחה מפורשות. יש להוסיף לcontainer securityContext: allowPrivilegeEscalation: false, runAsNonRoot: true, ו-seccompProfile: {type: RuntimeDefault}. הגדרת privileged: true היא ההפך הגמור ותחמיר את הבעיה.",
            },
        ],
        questionsEn: [
            {
              q: "What is the Least Privilege principle?",
              options: [
              "Give admin to everyone",
              "Give only the minimum necessary permissions",
              "Give no permissions",
              "Permissions by name",
              ],
              answer: 1,
              explanation:
                "Least Privilege means every entity (Pod, ServiceAccount, user) gets only the exact permissions it requires - nothing more. In Kubernetes: prefer a scoped Role in one Namespace over cluster-admin. If compromised, a low-privilege account limits the blast radius.",
            },
            {
              q: "What is Encryption at Rest?",
              options: [
              "Encrypting network traffic",
              "Encrypting the etcd database that stores secrets",
              "Encrypting log files",
              "Encrypting images",
              ],
              answer: 1,
              explanation:
                "etcd is the distributed key-value database that stores all Kubernetes cluster state, including Secrets. By default, Secrets are stored in etcd as plain base64-encoded text - anyone with filesystem access to the etcd data can decode them in seconds. Encryption at Rest adds an AES-GCM encryption layer: data is encrypted before being written to the etcd disk using a key from a separate EncryptionConfiguration file on the control plane. Even if an attacker exfiltrates the etcd data files, the Secret values remain unreadable without that key.",
            },
            {
              q: "What does Sealed Secrets allow?",
              options: [
              "Encrypting network traffic",
              "Storing encrypted secrets in git safely",
              "Auto-creating secrets",
              "Sharing between clusters",
              ],
              answer: 1,
              explanation:
                "GitOps stores all cluster configuration in git, but you can't commit plaintext Kubernetes Secrets - anyone with repo access would read your passwords. Sealed Secrets (by Bitnami) solves this with asymmetric encryption: a controller in your cluster generates a unique key pair. You use the public key to encrypt your Secret into a SealedSecret resource, which is safe to commit. Only the controller in that specific cluster - which holds the matching private key - can decrypt it and create the real Kubernetes Secret. A SealedSecret from Cluster A cannot be decrypted by Cluster B.",
            },
            {
              q: "What are the three Pod Security Standard levels?",
              options: [
              "low/medium/high",
              "privileged/baseline/restricted",
              "none/basic/full",
              "open/limited/closed",
              ],
              answer: 1,
              explanation:
                "The three Pod Security Standard levels: privileged - no restrictions at all, allows everything including hostNetwork and privileged containers. baseline - blocks known dangerous practices like hostPID, hostNetwork, and privileged mode, but doesn't require explicit security settings. restricted - the strictest level, requires runAsNonRoot, drop ALL capabilities, seccomp profile, and more. This is the production best practice.",
            },
            {
              q: "What is OPA/Gatekeeper?",
              options: [
              "Open Port Authority",
              "Open Policy Agent - policy-as-code enforcement for Kubernetes",
              "Optional Pod Allocator",
              "Object Permission Abstraction",
              ],
              answer: 1,
              explanation:
                "OPA (Open Policy Agent) Gatekeeper is an admission webhook that enforces custom policies on every resource created in the cluster. Policies are written in Rego, a declarative rule language. Unlike Pod Security Admission (which uses fixed built-in levels), OPA Gatekeeper lets you define arbitrary rules tailored to your organization - for example: all container images must come from gcr.io/, all Pods must have resource limits, or no Service of type LoadBalancer is allowed. Kyverno is an alternative tool that serves the same purpose with a YAML-based policy syntax.",
            },
            {
              q: "A Pod receives the following error:\n\n```\nError: pods is forbidden:\nUser 'system:serviceaccount:default:my-sa'\ncannot list resource 'pods' in namespace 'prod'\n```\n\nWhat is the correct fix?",
              options: [
              "Delete the ServiceAccount and create a new one",
              "Create a Role with list pods permission and bind it to my-sa",
              "Add a ClusterRoleBinding with cluster-admin permissions",
              "Switch to the default ServiceAccount instead of my-sa",
              ],
              answer: 1,
              explanation:
                "Root cause:\nThe ServiceAccount my-sa lacks the list permission on Pods in namespace prod.\nIn Kubernetes, every API access must be explicitly authorized through RBAC.\n\nThe fix — create a Role and RoleBinding:\n```yaml\nkind: Role\nmetadata:\n  namespace: prod\nrules:\n- apiGroups: [\"\"]\n  resources: [\"pods\"]\n  verbs: [\"list\"]\n---\nkind: RoleBinding\nsubjects:\n- kind: ServiceAccount\n  name: my-sa\n  namespace: default\nroleRef:\n  kind: Role\n  name: pod-reader\n```\n\nWhy the other answers are wrong:\n• Delete ServiceAccount — doesn't fix the missing permissions, just removes the identity.\n• cluster-admin — grants full permissions across the entire Cluster, a serious security risk.\n• default ServiceAccount — also has no list pods permissions by default.",
            },
            {
              q: "A Deployment fails to deploy with the error:\n\n```\nError from server: admission webhook 'validate.kyverno.svc'\ndenied the request:\nContainer image must come from 'gcr.io/'\n```\n\nWhat is happening?",
              options: [
              "The Kubernetes API server has crashed and is not responding",
              "An Admission webhook blocked the image because it is not from an approved registry",
              "RBAC permissions prevent creating a Deployment in this Namespace",
              "The Namespace specified in the Deployment does not exist in the Cluster",
              ],
              answer: 1,
              explanation:
                "Root cause:\nKyverno (a policy-as-code tool) is installed in the Cluster as a ValidatingAdmissionWebhook.\nIt enforces a policy that only allows container images from gcr.io/ — blocking all other sources.\n\nWhat is an Admission Webhook?\nA validation layer that runs before Kubernetes accepts any resource creation.\nEvery create/update request passes through it before being saved to etcd.\n\nThe fix:\nChange the container image in the Deployment to one hosted on gcr.io/, or update the Kyverno policy.\n\nWhy the other answers are wrong:\n• API server crashed — if it had crashed, you would not receive a structured error message.\n• RBAC — an RBAC error says \"forbidden\", not \"admission webhook denied\".\n• Namespace not found — the error would say \"namespace not found\", not admission webhook.",
            },
            {
              q: "PSA is set to enforce=restricted. A Deployment is rejected:\n\nPod violates PodSecurity 'restricted:latest': allowPrivilegeEscalation != false\n\nWhat must you add to the container spec?",
              options: [
              "privileged: true",
              "securityContext: {allowPrivilegeEscalation: false, runAsNonRoot: true, seccompProfile: {type: RuntimeDefault}}",
              "Change the namespace label",
              "Change the serviceAccount",
              ],
              answer: 1,
              explanation:
                "The restricted Pod Security Standard mandates explicit hardening fields in the container securityContext. You must set allowPrivilegeEscalation: false, runAsNonRoot: true, and seccompProfile: {type: RuntimeDefault}. Setting privileged: true is the opposite - it would further violate the policy.",
            },
        ],
      },
    },
  },
  {
    id: "storage",
    icon: "💾",
    name: "Storage & Package Management",
    color: "#10B981",
    description: "PersistentVolumes · StorageClass · Helm · Operators",
    descriptionEn: "PersistentVolumes · StorageClass · Helm · Operators",
    levels: {
      easy: {
        theory: "PersistentVolumes ו-Helm בסיסי.\n🔹 PV – יחידת אחסון בCluster (admin מגדיר)\n🔹 PVC – בקשה לאחסון מ-Pod\n🔹 Helm Chart – חבילה של Kubernetes manifests עם templates\n🔹 helm install – מתקין Chart ויוצר Release\nCODE:\napiVersion: v1\nkind: PersistentVolumeClaim\nspec:\n  accessModes: [ReadWriteOnce]\n  resources:\n    requests:\n      storage: 10Gi",
        theoryEn: "PersistentVolumes and basic Helm.\n🔹 PV – a storage unit in the Cluster (defined by admin)\n🔹 PVC – a request for storage by a Pod\n🔹 Helm Chart – a package of K8s manifests with templates\n🔹 helm install – installs a Chart and creates a Release\nCODE:\napiVersion: v1\nkind: PersistentVolumeClaim\nspec:\n  accessModes: [ReadWriteOnce]\n  resources:\n    requests:\n      storage: 10Gi",
        questions: [
            {
              q: "מה ההבדל בין PV ל-PVC?",
              options: [
              "אין הבדל",
              "PV הוא האחסון, PVC הוא הבקשה לאחסון",
              "PVC לproduction, PV לdev",
              "PV לLinux, PVC לWindows",
              ],
              answer: 1,
              explanation:
                "ה-PersistentVolume (PV) הוא יחידת אחסון שה-admin מגדיר מראש - גודל, access modes, ו-storage backend (EBS, NFS, GCS). PersistentVolumeClaim (PVC) היא הבקשה של ה-Pod לאחסון. ה-K8s matcher מחבר בין PVC ל-PV שמתאים לדרישות.",
            },
            {
              q: "מה AccessMode ReadWriteOnce?",
              options: [
              "קריאה בלבד",
              "כתיבה מNode אחד בלבד",
              "קריאה וכתיבה מnode אחד בו-זמנית",
              "קריאה מכל הNodes",
              ],
              answer: 2,
              explanation:
                "מצב ReadWriteOnce (RWO) מאפשר mount לקריאה וכתיבה על ידי Node אחד בלבד בו-זמנית. מתאים לרוב ה-databases. ReadWriteMany (RWX) מאפשר כמה Nodes במקביל - נדרש NFS/EFS. ReadOnlyMany (ROX) קריאה בלבד ממספר Nodes.",
            },
            {
              q: "מה תפקיד Helm Chart?",
              options: [
              "Docker image",
              "חבילה של Kubernetes manifests עם templates",
              "רשת Kubernetes",
              "גרסה של kubectl",
              ],
              answer: 1,
              explanation:
                "Helm הוא package manager ל-Kubernetes - כמו apt או npm, אבל לאפליקציות Kubernetes. Helm Chart הוא חבילה המכילה קבצי YAML עם templates (Deployments, Services, ConfigMaps), ערכי ברירת מחדל (values.yaml), ומטה-נתונים. במקום לנהל עשרות קבצי YAML, מתקינים Chart אחד ומגדירים אותו עם values.",
            },
            {
              q: "מה הפקודה להתקנת Helm Chart?",
              options: [
              "helm deploy",
              "helm install",
              "helm run",
              "helm apply",
              ],
              answer: 1,
              explanation:
                "הכלי helm install [release-name] [chart] מתקין Chart ויוצר Release. Helm עוקב אחרי ה-Release ב-Cluster (כ-Secret) לניהול upgrades ו-rollbacks. ניתן להוסיף --set key=value לעקוף ערכים ב-values.yaml, או -f myvalues.yaml לקובץ ערכים מותאם.",
            },
            {
              q: "מה Volume מסוג emptyDir?",
              options: [
              "Volume ריק שנמחק עם ה-Pod",
              "Volume קבוע",
              "Volume לקבצי logs",
              "Volume לDB",
              ],
              answer: 0,
              explanation:
                "emptyDir הוא volume זמני שנוצר ריק כשPod מתזמן על Node ונמחק לחלוטין כשה-Pod עצמו מוחק. שימושים נפוצים: שיתוף קבצים זמניים בין קונטיינרים באותו Pod (למשל, app שכותב logs ו-sidecar ששולח אותם). ניתן להשתמש ב-emptyDir.medium: Memory כדי ליצור tmpfs בRAM לביצועים גבוהים.",
            },
            {
              q: "מה תפקיד StorageClass ב-Kubernetes?",
              options: [
              "סוג Pod",
              "הגדרת provisioner לדיסקים דינמיים",
              "סוג Service",
              "קטגוריית log",
              ],
              answer: 1,
              explanation:
                "StorageClass הוא תבנית שמגדירה ל-Kubernetes כיצד ליצור דיסקים באופן דינמי. מגדיר provisioner (כמו aws-ebs, gcp-pd), reclaim policy (Delete או Retain), ופרמטרים (כמו סוג דיסק gp3/io2). כש-PVC מציין storageClassName, ה-provisioner יוצר PV ודיסק אמיתי אוטומטית - ללא צורך ב-admin.",
            },
            {
              q: "מה קורה לנתונים ב-emptyDir כש-Pod נמחק?",
              options: [
              "נשמרים לתמיד",
              "נמחקים",
              "מגובים אוטומטית",
              "מועברים לPV",
              ],
              answer: 1,
              explanation:
                "emptyDir נשאר חי כל עוד ה-Pod קיים - כולל בין restarts של קונטיינרים. אבל נמחק לחלוטין כשה-Pod עצמו מוחק או מועבר ל-Node אחר.",
            },
            {
              q: "מה תפקיד values.yaml ב-Helm Chart?",
              options: [
              "קובץ logs",
              "קובץ ברירות מחדל עבור templates של Chart",
              "קובץ RBAC",
              "קובץ secrets",
              ],
              answer: 1,
              explanation:
                "values.yaml הוא קובץ הקונפיגורציה המרכזי של Helm Chart. מכיל ברירות מחדל לכל ה-template variables (כמו replicaCount, image tag, resource limits). בזמן התקנה או upgrade, ניתן לעקוף ערכים עם --set key=value מה-CLI, או להחליף קובץ שלם עם -f my-values.yaml. כך Chart אחד משרת סביבות שונות (dev, staging, production) עם values שונים.",
            },
        ],
        questionsEn: [
            {
              q: "What is the difference between PV and PVC?",
              options: [
              "No difference",
              "PV is the storage, PVC is the request",
              "PVC for production, PV for dev",
              "PV for Linux, PVC for Windows",
              ],
              answer: 1,
              explanation:
                "A PersistentVolume (PV) is a piece of real storage provisioned in the cluster - it could be a cloud disk (AWS EBS, GCP PD), an NFS share, or a local drive. A PersistentVolumeClaim (PVC) is a request submitted by an application (Pod) asking for a certain amount of storage with specific access requirements. Kubernetes automatically matches a PVC to a suitable PV - similar to how a parking request gets matched to an available space.",
            },
            {
              q: "What is AccessMode ReadWriteOnce?",
              options: [
              "Read-only",
              "Write from one Node only",
              "Read and write from one node at a time",
              "Read from all Nodes",
              ],
              answer: 2,
              explanation:
                "ReadWriteOnce (RWO) allows the volume to be mounted for read/write by a single Node at a time. It is the most common mode and suitable for most databases. ReadWriteMany (RWX) allows multiple Nodes to mount simultaneously - requires a shared filesystem like NFS or AWS EFS. ReadOnlyMany (ROX) allows read-only access from multiple Nodes.",
            },
            {
              q: "What is a Helm Chart?",
              options: [
              "A Docker image",
              "A package of K8s manifests with templates",
              "A Kubernetes network",
              "A version of kubectl",
              ],
              answer: 1,
              explanation:
                "Helm is Kubernetes' package manager - think of it like apt or npm, but for Kubernetes applications. A Helm Chart is a bundle of Kubernetes YAML files (Deployments, Services, ConfigMaps, etc.) packaged with templates and configurable values. Instead of writing and maintaining dozens of separate YAML files, you install one Chart with a single command and configure it by passing values. This makes it easy to deploy complex applications consistently across different environments.",
            },
            {
              q: "What command installs a Helm Chart?",
              options: [
              "helm deploy",
              "helm install",
              "helm run",
              "helm apply",
              ],
              answer: 1,
              explanation:
                "helm install [release-name] [chart] installs a Chart and creates a new Release. Helm tracks the Release in the cluster (stored as a Secret) for managing upgrades and rollbacks. You can add --set key=value to override specific values from values.yaml, or -f myvalues.yaml for a custom values file.",
            },
            {
              q: "What is emptyDir?",
              options: [
              "An empty Volume deleted with the Pod",
              "A persistent Volume",
              "A volume for log files",
              "A volume for databases",
              ],
              answer: 0,
              explanation:
                "emptyDir is a temporary volume created empty when a Pod is scheduled to a Node, and deleted entirely when the Pod is removed. Common uses: sharing files between containers in the same Pod (e.g., an app writes logs and a sidecar ships them), or caching data. You can set emptyDir.medium: Memory to create a tmpfs backed by RAM for higher performance.",
            },
            {
              q: "What is a StorageClass?",
              options: [
              "A Pod type",
              "Defines a provisioner for dynamic disk creation",
              "A Service type",
              "A log category",
              ],
              answer: 1,
              explanation:
                "A StorageClass is a blueprint that tells Kubernetes how to create storage on demand. It names a provisioner - a plugin that knows how to talk to a specific storage system (e.g., the AWS EBS plugin creates EBS disks, the GCP plugin creates Persistent Disks). When a Pod requests storage via a PVC that references a StorageClass, the provisioner automatically creates a real disk and a PV for it. Without StorageClass, an admin would have to manually create every PV before a Pod could use it.",
            },
            {
              q: "What happens to emptyDir data when a Pod is deleted?",
              options: [
              "Persisted forever on the Node",
              "Deleted permanently (but survives container restarts within the same Pod)",
              "Automatically backed up to object storage",
              "Moved to a PV for reuse",
              ],
              answer: 1,
              explanation:
                "emptyDir is tied to the Pod lifecycle: it survives container restarts within the same Pod, but is deleted entirely when the Pod itself is deleted or rescheduled to another Node.",
            },
            {
              q: "What is helm values.yaml?",
              options: [
              "A log file",
              "The default values file for Chart templates",
              "An RBAC file",
              "A secrets file",
              ],
              answer: 1,
              explanation:
                "values.yaml is the central configuration file of a Helm Chart. It contains default values for all template variables (such as replicaCount, image tag, resource limits). During install or upgrade, you can override values with --set key=value from the CLI, or supply an entirely different values file with -f my-values.yaml. This lets a single Chart serve multiple environments (dev, staging, production) with different configurations.",
            },
        ],
      },
      medium: {
        theory: "StorageClass ו-Helm Values.\n🔹 StorageClass – מגדיר סוג אחסון וprovisioner\n🔹 Dynamic Provisioning – PV נוצר אוטומטית עם PVC\n🔹 Reclaim Policy Delete – מוחק PV כשPVC נמחק\n🔹 helm upgrade / --set – עדכון ושינוי values\nCODE:\nhelm install my-app ./chart --set replicaCount=3\nhelm upgrade my-app ./chart -f prod-values.yaml\nhelm rollback my-app 1",
        theoryEn: "StorageClass and Helm Values.\n🔹 StorageClass – defines storage type and provisioner\n🔹 Dynamic Provisioning – PV created automatically with PVC\n🔹 Reclaim Policy Delete – deletes PV when PVC is deleted\n🔹 helm upgrade / --set – update and change values\nCODE:\nhelm install my-app ./chart --set replicaCount=3\nhelm upgrade my-app ./chart -f prod-values.yaml\nhelm rollback my-app 1",
        questions: [
            {
              q: "מה משמעות Dynamic Provisioning ב-Kubernetes?",
              options: [
              "הקצאת CPU",
              "PV נוצר אוטומטית כשנוצר PVC",
              "שינוי גודל אוטומטי",
              "migration",
              ],
              answer: 1,
              explanation:
                "ללא Dynamic Provisioning, admin חייב ליצור PV ידנית לפני כל PVC - לא סקיילבילי. Dynamic Provisioning הופך את התהליך לאוטומטי: כש-PVC נוצר עם StorageClass, ה-provisioner יוצר PV ודיסק אמיתי (EBS, GCP PD) אוטומטית. כשה-PVC נמחק, הדיסק מנוקה לפי Reclaim Policy. זו הגישה הסטנדרטית בכל Cluster ענן.",
            },
            {
              q: "מה Reclaim Policy Delete?",
              options: [
              "מוחק רק PVC",
              "מוחק PV ואחסון פיזי כשPVC נמחק",
              "שומר נתונים",
              "מעביר לbackup",
              ],
              answer: 1,
              explanation:
                "מדיניות Reclaim Policy: Delete אומרת שכאשר ה-PVC נמחק, ה-PV ואחסון ה-cloud הפיזי (EBS volume, GCS disk) נמחקים אוטומטית. מתאים ל-non-persistent workloads. להבדיל מ-Retain שמשמר את הנתונים גם אחרי מחיקת ה-PVC.",
            },
            {
              q: "איך משנים Helm value מה-command line?",
              options: [
              "helm change",
              "helm --override",
              "helm install --set key=value",
              "helm config",
              ],
              answer: 2,
              explanation:
                "--set key=value עוקף ערכים מ-values.yaml בזמן install/upgrade. מאפשר לשנות הגדרות ספציפיות בלי לערוך קבצים. לשינויים מרובים: השתמש ב--values (-f) עם קובץ YAML מותאם. ערכי --set עוקפים ערכי -f.",
            },
            {
              q: "כיצד מרחיבים PVC?",
              options: [
              "מוחקים ויוצרים מחדש",
              "מגדירים allowVolumeExpansion: true ב-StorageClass ואז מגדילים spec.resources.requests.storage",
              "אי אפשר להגדיל PVC",
              "רק דרך GUI",
              ],
              answer: 1,
              explanation:
                "כדי להרחיב PVC, ה-StorageClass חייב להגדיר allowVolumeExpansion: true. לאחר מכן משנים את spec.resources.requests.storage ב-PVC לגודל גדול יותר, וה-provisioner מרחיב את הדיסק הפיזי. שים לב: הקטנה (shrink) לא נתמכת, ובחלק מהstorage backends הPod צריך restart כדי שהFS יתרחב.",
            },
            {
              q: "מה helm template עושה?",
              options: [
              "יוצר Template חדש",
              "מרנדר את ה-Chart ל-YAML בלי להתקין אותו – לbuild pipelines ו-dry-run",
              "שומר template",
              "מעדכן values",
              ],
              answer: 1,
              explanation:
                "helm template מרנדר את ה-Chart עם values ומפיק YAML גולמי בלי להתקין שום דבר בCluster. שימושי ל: CI/CD pipelines שמשתמשים ב-kubectl apply במקום helm install, debug כדי לראות מה בדיוק Helm יפרוס, ו-GitOps workflows שדורשים YAML מפורש ב-git.",
            },
            {
              q: "מה עושה helm rollback?",
              options: [
              "מוחק Release",
              "מחזיר Release לrevision קודמת",
              "reset values",
              "שינוי Chart version",
              ],
              answer: 1,
              explanation:
                "helm rollback [release] [revision] מחזיר Release לrevision ספציפי. Helm שומר היסטוריה של כל upgrade כ-revision ממוספר. helm history my-release מציג את כל ה-revisions עם תאריכים וסטטוסים. rollback הוא למעשה upgrade חדש עם הmanifests של revision ישנה - כך שנוצר revision חדש.",
            },
            {
              q: "מה אומר PVC בסטטוס Pending?",
              options: [
              "PVC מחכה לbackup",
              "PV תואם לא נמצא – בגלל AccessMode שגוי, storage מקסימום, או StorageClass שגוי",
              "PVC לא יוצר",
              "Helm failure",
              ],
              answer: 1,
              explanation:
                "PVC Pending = לא נמצא PV מתאים. בדוק: kubectl describe pvc לראות מה חסר. נפוץ: StorageClass לא קיים, AccessMode לא תואם, capacity לא מספיק.",
            },
            {
              q: "כיצד PV ו-PVC מתחברים?",
              options: [
              "לפי שם בלבד",
              "לפי accessMode, storage capacity, ו-storageClassName תואמים",
              "לפי Namespace",
              "לפי Node",
              ],
              answer: 1,
              explanation:
                "K8s מחבר PVC ל-PV תואם לפי: storageClassName, accessModes, capacity (PV >= PVC). לאחר binding – הם קשורים עד שאחד נמחק.",
            },
        ],
        questionsEn: [
            {
              q: "What is Dynamic Provisioning?",
              options: [
              "CPU allocation",
              "PV created automatically when PVC is created",
              "Auto resize",
              "Migration",
              ],
              answer: 1,
              explanation:
                "Without Dynamic Provisioning, an admin must manually create a PV before any Pod can claim storage - this doesn't scale well. Dynamic Provisioning automates this: when a Pod creates a PVC that references a StorageClass, Kubernetes automatically creates a matching PV (and the real underlying disk on AWS/GCP/Azure) on demand. When the PVC is deleted, the disk is cleaned up according to the Reclaim Policy. This is the standard approach for all cloud-hosted Kubernetes clusters today.",
            },
            {
              q: "What does Reclaim Policy Delete do?",
              options: [
              "Deletes only PVC",
              "Deletes PV and physical storage when PVC is deleted",
              "Keeps data",
              "Moves to backup",
              ],
              answer: 1,
              explanation:
                "Reclaim Policy Delete means that when a PVC is deleted, Kubernetes automatically deletes both the PV object and the underlying physical disk (e.g., the AWS EBS volume or GCP Persistent Disk). This is the default for dynamically provisioned volumes and is convenient for ephemeral workloads. However, it permanently destroys all data - if you delete the PVC of a production database, the data is gone. For databases and anything important, use Reclaim Policy Retain instead, which preserves the data after PVC deletion.",
            },
            {
              q: "How do you change a Helm value from the CLI?",
              options: [
              "helm change",
              "helm --override",
              "helm install --set key=value",
              "helm config",
              ],
              answer: 2,
              explanation:
                "--set key=value overrides specific values from values.yaml at install/upgrade time. For multiple overrides, use --values (-f) with a custom YAML file. Values from --set take precedence over -f files.",
            },
            {
              q: "How do you expand a PVC?",
              options: [
              "Delete and recreate it",
              "Set allowVolumeExpansion: true in the StorageClass then increase spec.resources.requests.storage",
              "PVCs cannot be expanded",
              "Only via GUI",
              ],
              answer: 1,
              explanation:
                "To expand a PVC, the StorageClass must have allowVolumeExpansion: true. Then update spec.resources.requests.storage in the PVC to a larger value, and the provisioner resizes the underlying disk. Note: shrinking is not supported, and some storage backends require a Pod restart for the filesystem to expand.",
            },
            {
              q: "What does helm template do?",
              options: [
              "Creates a new Template",
              "Renders the Chart to YAML without installing - for pipelines and dry-runs",
              "Saves the template",
              "Updates values",
              ],
              answer: 1,
              explanation:
                "helm template renders the Chart with values and outputs raw YAML without installing anything to the cluster. Useful for: CI/CD pipelines that use kubectl apply instead of helm install, debugging to see exactly what Helm would deploy, and GitOps workflows that require explicit YAML committed to git.",
            },
            {
              q: "What does helm rollback do?",
              options: [
              "Deletes the Release",
              "Reverts a Release to a previous revision",
              "Resets values",
              "Changes Chart version",
              ],
              answer: 1,
              explanation:
                "helm rollback [release] [revision] reverts a Release to a specific revision. Helm stores a numbered history of every upgrade. helm history my-release lists all revisions with timestamps and statuses. A rollback is technically a new upgrade using the manifests from an old revision - so it creates a new revision number.",
            },
            {
              q: "What does a PVC in Pending status mean?",
              options: [
              "PVC awaiting backup",
              "No matching PV found - due to wrong AccessMode, insufficient storage, or wrong StorageClass",
              "PVC not created",
              "Helm failure",
              ],
              answer: 1,
              explanation:
                "PVC Pending = no matching PV was found. Run kubectl describe pvc to see what's missing. Common causes: StorageClass doesn't exist, AccessMode mismatch, or insufficient capacity.",
            },
            {
              q: "How do a PV and PVC bind?",
              options: [
              "By name only",
              "By matching accessMode, storage capacity, and storageClassName",
              "By Namespace",
              "By Node",
              ],
              answer: 1,
              explanation:
                "K8s binds a PVC to a PV with matching: storageClassName, accessModes, and capacity (PV >= PVC). After binding they are locked together until one is deleted.",
            },
        ],
      },
      hard: {
        theory: "אחסון ו-Helm מתקדם.\n🔹 ReadWriteMany (RWX) – קריאה/כתיבה ממספר Nodes (NFS, EFS)\n🔹 CSI – Container Storage Interface, סטנדרט לdrivers\n🔹 VolumeSnapshot – גיבוי נקודתי\n🔹 Helm Hooks – פעולות בשלבים: pre-install, post-upgrade\nCODE:\napiVersion: snapshot.storage.k8s.io/v1\nkind: VolumeSnapshot\nspec:\n  source:\n    persistentVolumeClaimName: my-pvc",
        theoryEn: "Advanced Storage and Helm.\n🔹 ReadWriteMany (RWX) – read/write from multiple Nodes (NFS, EFS)\n🔹 CSI – Container Storage Interface, standard for drivers\n🔹 VolumeSnapshot – point-in-time backup\n🔹 Helm Hooks – actions at lifecycle points: pre-install, post-upgrade\nCODE:\napiVersion: snapshot.storage.k8s.io/v1\nkind: VolumeSnapshot\nspec:\n  source:\n    persistentVolumeClaimName: my-pvc",
        questions: [
            {
              q: "מה תפקיד CSI ב-Kubernetes?",
              options: [
              "Container Security Interface",
              "Container Storage Interface – סטנדרט לdrivers",
              "Cloud Storage Integration",
              "Cluster Sync",
              ],
              answer: 1,
              explanation:
                "תקן CSI (Container Storage Interface) הוא סטנדרט פתוח שמאפשר ל-vendors לכתוב storage drivers עבור Kubernetes (ו-Mesos, Nomad). כל vendor כותב CSI driver משלו (AWS EBS, Azure Disk, GCS, Ceph) שנפרס כ-DaemonSet/Deployment ב-Cluster.",
            },
            {
              q: "מה תפקיד Helm Hook?",
              options: [
              "כלי debug",
              "פעולה שרצה בשלב מסוים במחזור חיי Release",
              "type של Chart",
              "חלופה לRollback",
              ],
              answer: 1,
              explanation:
                "Helm Hooks הם resources מיוחדים (בדרך כלל Jobs) שרצים בשלבי מחזור חיים ספציפיים של Release: pre-install (לפני יצירת resources), post-install, pre-upgrade, post-upgrade, pre-delete, ו-post-rollback. שימושים נפוצים: הרצת DB migrations לפני upgrade, או שליחת התראת Slack אחרי deploy.",
            },
            {
              q: "מה תפקיד VolumeSnapshot?",
              options: [
              "גיבוי הCluster כולו",
              "גיבוי נקודתי של PersistentVolume",
              "snapshot של Pod",
              "גיבוי ConfigMap",
              ],
              answer: 1,
              explanation:
                "תהליך VolumeSnapshot יוצר גיבוי נקודתי (point-in-time) של PersistentVolume. ניתן לשחזר ממנו PVC חדש עם הנתונים מאותה נקודה - שימושי לפני upgrade של DB. דורש CSI driver עם תמיכת snapshot ו-snapshot-controller מותקן.",
            },
            {
              q: "כיצד StatefulSet מנהל storage?",
              options: [
              "Pods חולקים PVC אחד",
              "כל Pod מקבל PVC משלו דרך volumeClaimTemplates",
              "אין storage ב-StatefulSet",
              "רק emptyDir",
              ],
              answer: 1,
              explanation:
                "volumeClaimTemplates ב-StatefulSet spec יוצר PVC ייחודי לכל Pod replica. Pod-0 מקבל data-myapp-0, Pod-1 מקבל data-myapp-1. כל PVC נשאר קשור ל-Pod שלו גם אחרי restart - כך databases כמו MySQL, PostgreSQL שומרים על נתונים persistent. Scale down לא מוחק PVCs; scale up מחדש מקשר את ה-PVCs הישנים.",
            },
            {
              q: "מה volume binding mode WaitForFirstConsumer?",
              options: [
              "מחכה לAdmin לאשר",
              "מחכה ש-Pod יתזמן לפני יצירת PV – ליצירת PV באותה Zone כמו ה-Pod",
              "מחכה לreplication",
              "מחכה לbackup",
              ],
              answer: 1,
              explanation:
                "ברירת המחדל (Immediate) יוצרת PV ברגע שנוצר PVC - אך ה-PV עלול להיווצר ב-Zone שונה מה-Pod, ואז ה-Pod לא יוכל להשתמש בו. WaitForFirstConsumer מעכב את יצירת ה-PV עד שPod שמשתמש ב-PVC מתזמן ל-Node ספציפי, ורק אז יוצר PV באותה Zone כמו ה-Node. קריטי בסביבות multi-AZ.",
            },
            {
              q: "ה-PVC נשאר במצב Pending.\n\nהפלט של kubectl describe pvc מציג:\n\n```\nEvents:\n  Warning  ProvisioningFailed\n  storageclass.storage.k8s.io 'fast-ssd' not found\n```\n\nמה הבעיה?",
              options: [
              "ה-PVC מבקש נפח אחסון גדול מדי עבור ה-Cluster",
              "ה-StorageClass בשם fast-ssd לא קיים ב-Cluster",
              "ה-Node שה-Pod רץ עליו מלא ואין בו מקום לדיסק",
              "ה-PVC וה-Pod נמצאים ב-Namespaces שונים",
              ],
              answer: 1,
              explanation:
                "שורש הבעיה:\nה-PVC מפנה ל-StorageClass בשם fast-ssd, אבל StorageClass כזה לא קיים ב-Cluster.\nללא StorageClass, ה-provisioner לא יודע כיצד ליצור PV וה-PVC נשאר Pending.\n\nמה זה StorageClass?\nתבנית שמגדירה ל-Kubernetes כיצד ליצור דיסקים באופן דינמי.\nכל StorageClass כולל provisioner (כמו aws-ebs), סוג דיסק, ו-reclaim policy.\n\nכיצד לאתר ולתקן:\n```\nkubectl get storageclass\n```\nבדקו אילו StorageClasses קיימים ועדכנו את storageClassName ב-PVC לשם נכון.\n\nלמה שאר התשובות שגויות:\n• PVC גדול מדי — השגיאה הייתה על capacity, לא על storageclass not found.\n• Node מלא — Node disk לא קשור ל-StorageClass provisioning.\n• Namespace שונה — PVC ו-Pod חייבים להיות באותו Namespace, אבל השגיאה מצביעה על StorageClass חסר.",
            },
            {
              q: "הפקודה helm upgrade כשל באמצע. Release ב-status 'failed'. ה-ConfigMap מחצית עודכן. מה הצעד הבא?",
              options: [
              "מחק ה-Release",
              "helm rollback my-release [last-good-revision] להחזיר למצב עקבי",
              "helm upgrade שוב",
              "מחק ConfigMap",
              ],
              answer: 1,
              explanation:
                "כש-helm upgrade נכשל, ה-Release נשאר בסטטוס 'failed' עם resources שעודכנו חלקית. helm rollback my-release [revision] מחזיר את כל ה-resources ל-revision תקין קודם. ראשית הרץ helm history my-release כדי לראות את מספרי ה-revision הזמינים.",
            },
            {
              q: "Pod עם PVC ב-AWS EKS.\nה-Pod עבר ל-Node ב-Availability Zone אחרת.\nה-PVC מראה סטטוס Bound, אבל ה-Pod לא מצליח לעלות.\n\nמה הסיבה?",
              options: [
              "ה-PVC נמחק ונוצר מחדש עם ID שונה",
              "ה-EBS Volume נמצא ב-AZ אחרת מה-Node — EBS הוא single-AZ",
              "NetworkPolicy חוסמת גישה מה-Node החדש ל-storage",
              "ה-StorageClass שגוי ולא תומך ב-multi-AZ",
              ],
              answer: 1,
              explanation:
                "שורש הבעיה:\nAWS EBS Volumes הם single-AZ — הם יכולים להיות מחוברים רק ל-Node שנמצא באותה Availability Zone.\nכאשר ה-Pod מתזמן מחדש ל-Node ב-AZ אחרת, ה-EBS לא יכול לעקוב אחריו.\n\nלמה ה-PVC מראה Bound?\nכי ה-PV עדיין קיים וקשור ל-PVC — הבעיה היא ב-attach ולא ב-binding.\n\nהפתרון:\nלהשתמש ב-StorageClass עם volumeBindingMode: WaitForFirstConsumer.\nזה מבטיח שה-PV נוצר באותה AZ כמו ה-Node שעליו ה-Pod מתוזמן.\nבנוסף, להוסיף nodeAffinity כדי לשמור Pod ו-Volume באותה AZ.\n\nלמה שאר התשובות שגויות:\n• PVC נמחק — ה-PVC מראה Bound, כלומר הוא קיים ותקין.\n• NetworkPolicy — לא משפיעה על storage attachment.\n• StorageClass שגוי — ה-StorageClass עובד, הבעיה היא מיקום גיאוגרפי.",
            },
        ],
        questionsEn: [
            {
              q: "What is CSI?",
              options: [
              "Container Security Interface",
              "Container Storage Interface – standard for drivers",
              "Cloud Storage Integration",
              "Cluster Sync",
              ],
              answer: 1,
              explanation:
                "CSI (Container Storage Interface) is an open standard that defines how storage vendors write drivers for Kubernetes (and other orchestrators). Before CSI, storage drivers were built directly into the Kubernetes source code ('in-tree' plugins), which meant adding or updating a driver required a Kubernetes release. CSI moves drivers out-of-tree: each vendor (AWS, GCP, Ceph, NetApp, etc.) ships their own CSI driver as a separate Deployment/DaemonSet in the cluster. This lets storage vendors release driver updates independently of Kubernetes itself.",
            },
            {
              q: "What is a Helm Hook?",
              options: [
              "A debug tool",
              "An action at a specific lifecycle point",
              "A Chart type",
              "Alternative to Rollback",
              ],
              answer: 1,
              explanation:
                "Helm Hooks are special resources (Jobs/Pods) that run at specific lifecycle points: pre-install (before Chart resources are created), post-install, pre-upgrade, post-upgrade, pre-delete, and post-rollback. Common use cases: running DB migrations before upgrade or sending a Slack notification after deploy.",
            },
            {
              q: "What is a VolumeSnapshot?",
              options: [
              "Backup of the whole Cluster",
              "Point-in-time backup of a PersistentVolume",
              "Pod snapshot",
              "ConfigMap backup",
              ],
              answer: 1,
              explanation:
                "A VolumeSnapshot is a point-in-time copy of a PersistentVolume's data - similar to a database snapshot or a VM disk checkpoint. It lets you capture the current state of a disk so you can restore it later (e.g., before running a risky database migration). From a snapshot you can create a new PVC pre-populated with that data. VolumeSnapshots require two things to work: a snapshot-controller running in the cluster, and a CSI driver that supports snapshot operations. Not all storage backends support this feature.",
            },
            {
              q: "How does a StatefulSet manage storage?",
              options: [
              "All Pods share one PVC",
              "Each Pod gets its own PVC via volumeClaimTemplates",
              "No storage in StatefulSet",
              "Only emptyDir",
              ],
              answer: 1,
              explanation:
                "volumeClaimTemplates in a StatefulSet spec creates a unique PVC for each Pod replica. Pod-0 gets data-myapp-0, Pod-1 gets data-myapp-1. Each PVC remains bound to its Pod even after restarts - this is how stateful databases like MySQL and PostgreSQL maintain persistent data. Scaling down does not delete the PVCs; scaling back up reconnects the existing PVCs.",
            },
            {
              q: "What does volume binding mode WaitForFirstConsumer do?",
              options: [
              "Waits for Admin approval",
              "Waits for a Pod to be scheduled before creating the PV - ensuring the PV is in the same Zone as the Pod",
              "Waits for replication",
              "Waits for backup",
              ],
              answer: 1,
              explanation:
                "The default binding mode (Immediate) creates a PV as soon as a PVC is created - but the PV might be provisioned in a different Zone than where the Pod ends up, causing attachment failures. WaitForFirstConsumer delays PV creation until a Pod using the PVC is scheduled to a specific Node, then creates the PV in the same Zone. This is critical in multi-AZ environments like AWS EKS.",
            },
            {
              q: "A PVC stays in Pending state.\n\nThe output of kubectl describe pvc shows:\n\n```\nEvents:\n  Warning  ProvisioningFailed\n  storageclass.storage.k8s.io 'fast-ssd' not found\n```\n\nWhat is wrong?",
              options: [
              "The PVC requests more storage than the Cluster can provide",
              "The StorageClass named fast-ssd does not exist in the Cluster",
              "The Node the Pod runs on is full and has no room for a disk",
              "The PVC and Pod are in different Namespaces",
              ],
              answer: 1,
              explanation:
                "Root cause:\nThe PVC references a StorageClass named fast-ssd, but no such StorageClass exists in the Cluster.\nWithout a StorageClass, the provisioner doesn't know how to create a PV and the PVC stays Pending.\n\nWhat is a StorageClass?\nA blueprint that tells Kubernetes how to dynamically create disks.\nEach StorageClass includes a provisioner (e.g., aws-ebs), disk type, and reclaim policy.\n\nHow to debug and fix:\n```\nkubectl get storageclass\n```\nCheck which StorageClasses exist and update storageClassName in the PVC to a valid name.\n\nWhy the other answers are wrong:\n• PVC too large — the error would mention capacity, not storageclass not found.\n• Node full — Node disk space is unrelated to StorageClass provisioning.\n• Different Namespace — PVC and Pod must be in the same Namespace, but the error points to a missing StorageClass.",
            },
            {
              q: "helm upgrade failed midway. The Release is in 'failed' status. A ConfigMap is half-updated. What is the next step?",
              options: [
              "Delete the Release",
              "helm rollback my-release [last-good-revision] to return to a consistent state",
              "Run helm upgrade again",
              "Delete the ConfigMap",
              ],
              answer: 1,
              explanation:
                "When a helm upgrade fails partway through, resources may be in an inconsistent state. helm rollback my-release [revision] restores all resources to a previously known good state. Run helm history my-release first to see available revision numbers.",
            },
            {
              q: "A Pod with a PVC on AWS EKS.\nThe Pod moved to a Node in a different Availability Zone.\nThe PVC shows Bound status, but the Pod fails to start.\n\nWhat is the cause?",
              options: [
              "The PVC was deleted and recreated with a different ID",
              "The EBS Volume is in a different AZ than the Node — EBS is single-AZ",
              "A NetworkPolicy is blocking access from the new Node to storage",
              "The StorageClass is wrong and does not support multi-AZ",
              ],
              answer: 1,
              explanation:
                "Root cause:\nAWS EBS Volumes are single-AZ — they can only be attached to a Node in the same Availability Zone.\nWhen the Pod reschedules to a Node in a different AZ, the EBS volume cannot follow.\n\nWhy does the PVC show Bound?\nBecause the PV still exists and is bound to the PVC — the issue is attachment, not binding.\n\nThe fix:\nUse a StorageClass with volumeBindingMode: WaitForFirstConsumer.\nThis ensures the PV is created in the same AZ as the Node where the Pod is scheduled.\nAlso add nodeAffinity to keep the Pod and Volume in the same AZ.\n\nWhy the other answers are wrong:\n• PVC deleted — the PVC shows Bound, meaning it exists and is intact.\n• NetworkPolicy — does not affect storage attachment.\n• Wrong StorageClass — the StorageClass works, the issue is geographic location.",
            },
        ],
      },
    },
  },
  {
    id: "troubleshooting",
    icon: "🔧",
    name: "Cluster Operations & Troubleshooting",
    color: "#F97316",
    description: "Debugging · Observability · אבחון · כלים",
    descriptionEn: "Debugging · Observability · Diagnosis · Tools",
    levels: {
      easy: {
        theory: "פקודות Debug בסיסיות.\n🔹 kubectl describe – events ומידע מפורט על resource\n🔹 kubectl logs – לוגים של קונטיינר\n🔹 kubectl exec – מריץ פקודה בתוך Pod\n🔹 kubectl get pods -A – כל הPods בכל הNamespaces\nCODE:\nkubectl describe pod my-pod\nkubectl logs my-pod\nkubectl logs my-pod -c my-container\nkubectl exec -it my-pod -- bash\nkubectl get pods -A",
        theoryEn: "Basic Debug Commands.\n🔹 kubectl describe – events and detailed info about a resource\n🔹 kubectl logs – container logs\n🔹 kubectl exec – runs a command inside a Pod\n🔹 kubectl get pods -A – all Pods in all Namespaces\nCODE:\nkubectl describe pod my-pod\nkubectl logs my-pod\nkubectl logs my-pod -c my-container\nkubectl exec -it my-pod -- bash\nkubectl get pods -A",
        questions: [
            {
              q: "ה-Pod 'web-server' לא מגיב ואתה לא יודע למה. איזו פקודה תיתן לך events ומצב מפורט כדי להתחיל לאבחן?",
              options: [
              "kubectl status pod web-server",
              "kubectl describe pod web-server",
              "kubectl get pod web-server",
              "kubectl inspect pod web-server",
              ],
              answer: 1,
              explanation:
                "kubectl describe pod מציג events, conditions, ומידע מפורט – זה הכלי הראשי לאבחון בעיות. ה-Events בתחתית הפלט הם לרוב הסיבה הישירה לבעיה.",
            },
            {
              q: "ה-Pod 'api-service' נמצא ב-Running אבל האפליקציה מחזירה שגיאות 500. מה הפקודה הראשונה שתריץ?",
              options: [
              "kubectl events api-service",
              "kubectl logs api-service",
              "kubectl describe pod api-service",
              "kubectl top pod api-service",
              ],
              answer: 1,
              explanation:
                "kubectl logs מציג את ה-stdout/stderr של הקונטיינר – המקום הראשון לחפש שגיאות אפליקציה בזמן שה-Pod רץ. השתמש ב--follow לעקוב בזמן אמת.",
            },
            {
              q: "מה kubectl get events מציג?",
              options: [
              "רק שגיאות",
              "אירועים מה-Namespace הנוכחי – Pod scheduling, image pull, probe failures",
              "רק Pod logs",
              "רק Node events",
              ],
              answer: 1,
              explanation:
                "kubectl get events מציג את כל האירועים שנרשמו ב-Namespace הנוכחי, ממוינים לפי זמן. Events הם הדרך של Kubernetes לתאר מה קרה: 'Pod תוזמן ל-node-1', 'Image נמשך בהצלחה', 'Liveness probe נכשל', 'OOMKilled'. בניגוד ל-logs (שמגיעים מהאפליקציה), events מגיעים מ-Kubernetes עצמו. הוסף --sort-by=.metadata.creationTimestamp לסדר לפי זמן.",
            },
            {
              q: "מה ההבדל בין Running ל-Ready?",
              options: [
              "אין הבדל",
              "Running – קונטיינר פועל. Ready – Pod עבר readiness probe ומוכן לקבל traffic",
              "Ready – רק ב-production",
              "Running – לפני deploy",
              ],
              answer: 1,
              explanation:
                "Running אומר שתהליך הקונטיינר עלה - אך זה לא אומר שהוא מוכן לקבל בקשות. readiness probe היא בדיקת בריאות (למשל HTTP GET ל-/health) שKubernetes מריץ כדי לקבוע אם Pod מוכן לtraffic. Pod שהוא Running אבל נכשל ב-readiness probe יוצג כ-0/1 Ready ויוסר אוטומטית מEndpoints של ה-Service. זה מונע שליחת traffic ל-Pod שטרם סיים לעלות או עמוס זמנית.",
            },
            {
              q: "כיצד רואים לוגים של קונטיינר שקרס?",
              options: [
              "kubectl logs pod-name",
              "kubectl logs pod-name --previous",
              "kubectl get logs --crashed",
              "kubectl describe pod-name --logs",
              ],
              answer: 1,
              explanation:
                "כשקונטיינר קורס (למשל CrashLoopBackOff), Kubernetes מפעיל instance חדש אוטומטית. kubectl logs ללא flags מציג את ה-logs של ה-instance החדש - שעלול להיות כמעט ריק אם קרס מיד. הflag --previous שולף את ה-logs מה-instance שקרס, שזה בדיוק מה שצריך כדי לאבחן את הסיבה לcrash.",
            },
            {
              q: "מה kubectl top nodes מציג?",
              options: [
              "רשימת Nodes",
              "שימוש בCPU/Memory של כל Node בזמן אמת (דורש metrics-server)",
              "Nodes עם בעיות",
              "Nodes logs",
              ],
              answer: 1,
              explanation:
                "kubectl top nodes מציג צריכת CPU ו-Memory בזמן אמת של כל Node ב-Cluster, כולל אחוז ניצול מסך ה-capacity. שימושי לזיהוי Nodes עמוסים או חוסר resources. דורש metrics-server מותקן בCluster. kubectl top pods מציג את אותו מידע ברמת Pod.",
            },
            {
              q: "כיצד בודקים health של ה-API server?",
              options: [
              "kubectl check apiserver",
              "kubectl get --raw='/healthz' (מחזיר ok אם בריא)",
              "kubectl describe apiserver",
              "kubectl status cluster",
              ],
              answer: 1,
              explanation:
                "kubectl get --raw='/healthz' מחזיר ok אם API server בריא. שים לב: kubectl get componentstatuses הייתה deprecated מ-K8s 1.19 והוסרה ב-1.26. השתמש ב-/healthz, /readyz, /livez במקום.",
            },
            {
              q: "מה kubectl config get-contexts עושה?",
              options: [
              "מציג contexts של Docker",
              "מציג כל ה-kubeconfig contexts – אשכולות ומשתמשים מוגדרים",
              "מציג Namespaces",
              "מציג Node contexts",
              ],
              answer: 1,
              explanation:
                "kubectl config get-contexts מציג את כל ה-contexts המוגדרים ב-kubeconfig - כל context מכיל cluster, user, ו-namespace. הcontext הנוכחי מסומן בכוכבית (*). kubectl config use-context prod-cluster מחליף לcontext אחר, ו-kubectl config set-context --current --namespace=dev משנה namespace ברירת מחדל.",
            },
        ],
        questionsEn: [
            {
              q: "Pod 'web-server' is not responding and you don't know why. Which command gives you events and detailed state to start diagnosing?",
              options: [
              "kubectl status pod web-server",
              "kubectl describe pod web-server",
              "kubectl get pod web-server",
              "kubectl inspect pod web-server",
              ],
              answer: 1,
              explanation:
                "kubectl describe pod shows events, conditions, and detailed info - it's the primary diagnostic tool. The Events section at the bottom usually reveals the direct cause of the problem.",
            },
            {
              q: "Pod 'api-service' is Running but the app returns 500 errors. What is the first command you run?",
              options: [
              "kubectl events api-service",
              "kubectl logs api-service",
              "kubectl describe pod api-service",
              "kubectl top pod api-service",
              ],
              answer: 1,
              explanation:
                "kubectl logs shows the container's stdout/stderr - the first place to look for application errors while the pod is running. Use --follow to stream logs in real time.",
            },
            {
              q: "What does kubectl get events show?",
              options: [
              "Only errors",
              "Namespace events - Pod scheduling, image pulls, probe failures",
              "Only Pod logs",
              "Only Node events",
              ],
              answer: 1,
              explanation:
                "kubectl get events lists all events recorded in the current Namespace, sorted by timestamp. Events are Kubernetes' way of narrating what happened: 'Pod was scheduled to node-1', 'Successfully pulled image', 'Liveness probe failed', 'OOMKilled'. Unlike logs (which come from your application), events come from Kubernetes itself and describe the lifecycle and problems of your resources. Add --sort-by=.metadata.creationTimestamp to always see the most recent events first.",
            },
            {
              q: "What is the difference between Running and Ready?",
              options: [
              "No difference",
              "Running - container is active. Ready - Pod passed readiness probe and can receive traffic",
              "Ready - production only",
              "Running - before deploy",
              ],
              answer: 1,
              explanation:
                "Running means the container process has started - but that doesn't mean it can serve requests yet. A readiness probe is a health check Kubernetes runs against the Pod (e.g., an HTTP GET to /health) to decide whether it is ready to receive traffic. A Pod that is Running but failing its readiness probe is shown as 0/1 Ready and is automatically removed from the Service's load balancer until it passes. This prevents live traffic from hitting a Pod that hasn't finished starting up, is overloaded, or is temporarily unhealthy.",
            },
            {
              q: "How do you view logs from a crashed container?",
              options: [
              "kubectl logs pod-name",
              "kubectl logs pod-name --previous",
              "kubectl get logs --crashed",
              "kubectl describe pod-name --logs",
              ],
              answer: 1,
              explanation:
                "When a container crashes (e.g., in CrashLoopBackOff), Kubernetes automatically starts a new container instance to replace it. The new instance is now 'current', so kubectl logs (without any flag) shows the new instance's logs - which may be nearly empty if it crashed immediately. The --previous flag fetches the logs from the container run that just crashed, which is exactly what you need to diagnose the root cause. Without --previous you'll often see no useful output.",
            },
            {
              q: "What does kubectl top nodes show?",
              options: [
              "List of Nodes",
              "Real-time CPU/Memory usage for each Node (requires metrics-server)",
              "Nodes with issues",
              "Node logs",
              ],
              answer: 1,
              explanation:
                "kubectl top nodes shows real-time CPU and Memory consumption for every Node in the cluster, including utilization percentage of total capacity. Useful for identifying overloaded Nodes or resource shortages. Requires metrics-server installed in the cluster. kubectl top pods shows the same information at the Pod level.",
            },
            {
              q: "How do you check the health of the API server?",
              options: [
              "kubectl check apiserver",
              "kubectl get --raw='/healthz' (returns ok when healthy)",
              "kubectl describe apiserver",
              "kubectl status cluster",
              ],
              answer: 1,
              explanation:
                "kubectl get --raw='/healthz' returns 'ok' if the API server is healthy. Note: kubectl get componentstatuses was deprecated in K8s 1.19 and removed in 1.26. Use /healthz, /readyz, or /livez endpoints instead.",
            },
            {
              q: "What does kubectl config get-contexts do?",
              options: [
              "Shows Docker contexts",
              "Lists all kubeconfig contexts - configured clusters and users",
              "Shows Namespaces",
              "Shows Node contexts",
              ],
              answer: 1,
              explanation:
                "kubectl config get-contexts lists all contexts defined in kubeconfig - each context bundles a cluster, user, and default namespace. The current context is marked with an asterisk (*). kubectl config use-context prod-cluster switches to a different context, and kubectl config set-context --current --namespace=dev changes the default namespace.",
            },
        ],
      },
      medium: {
        theory: "שגיאות נפוצות ב-Pods.\n🔹 CrashLoopBackOff – קונטיינר קורס שוב ושוב\n🔹 ImagePullBackOff – לא ניתן להוריד image (שם שגוי/credentials)\n🔹 OOMKilled – חרגנו ממגבלת הזיכרון\n🔹 Pending – אין Node פנוי (resources / nodeSelector)\nCODE:\nkubectl describe pod my-pod   # בדוק Events\nkubectl logs my-pod --previous  # לוגים לפני crash\nkubectl top pod                 # CPU/Memory",
        theoryEn: "Common Pod errors.\n🔹 CrashLoopBackOff – container crashes repeatedly\n🔹 ImagePullBackOff – cannot pull image (wrong name/credentials)\n🔹 OOMKilled – exceeded memory limit\n🔹 Pending – no available Node (resources / nodeSelector)\nCODE:\nkubectl describe pod my-pod   # check Events\nkubectl logs my-pod --previous  # logs before crash\nkubectl top pod                 # CPU/Memory",
        questions: [
            {
              q: "פרסמת גרסה חדשה. ה-Pod עולה, קורס מיד, ו-Kubernetes מפעיל אותו שוב ושוב. איזה סטטוס תראה ב-kubectl get pods?",
              options: [
              "Terminating",
              "CrashLoopBackOff",
              "OOMKilled",
              "ErrImagePull",
              ],
              answer: 1,
              explanation:
                "CrashLoopBackOff מציין שהקונטיינר מנסה לעלות, קורס מיד, וKubernetes ממשיך לנסות עם המתנה גוברת בין ניסיונות. ה-flag --previous ב-kubectl logs מאפשר לראות את הlogs של ה-crash האחרון לפני ה-restart.",
            },
            {
              q: "ה-Pod נמצא ב-ImagePullBackOff. מה שתי הסיבות הנפוצות ביותר?",
              options: [
              "resource limits שגויים + Namespace חסר",
              "שם image שגוי/tag שגוי, או imagePullSecret חסר עבור registry פרטי",
              "Node חסר disk + Port שגוי",
              "הרשאות RBAC + ConfigMap חסר",
              ],
              answer: 1,
              explanation:
                "ImagePullBackOff אומר שKubernetes לא מצליח להוריד את ה-image, ומחכה יותר ויותר בין כל ניסיון. שתי הסיבות הכי נפוצות הן: שגיאת הקלדה בשם ה-image או ה-tag, או היעדר imagePullSecrets לאימות מול registry פרטי.",
            },
            {
              q: "ה-Pod רץ שעות, ואז מסתיים לפתע. kubectl describe מראה 'Reason: OOMKilled'. מה קרה ומה הפתרון?",
              options: [
              "ה-Pod פונה בגלל disk מלא; הוסף storage",
              "הקונטיינר חרג ממגבלת הזיכרון שלו; הגדל את limits.memory או אופטימיזציה לאפליקציה",
              "ה-liveness probe נכשל; תקן את ה-probe",
              "ה-Pod פונה ע\"י Pod עם עדיפות גבוהה יותר",
              ],
              answer: 1,
              explanation:
                "OOMKilled (Out Of Memory Killed) קורה כשהקונטיינר צורך יותר זיכרון מה-limits.memory שהוגדר לו, וה-Linux kernel ממית אותו עם exit code 137. הגדל את limits.memory, או בדוק אם יש memory leak באפליקציה באמצעות kubectl top pod.",
            },
            {
              q: "ה-Pod נשאר ב-Pending. kubectl describe מראה: '0/3 nodes are available: 3 Insufficient cpu'. מה הגורם השורשי?",
              options: [
              "ה-image של הקונטיינר גדול מדי",
              "ה-Namespace של ה-Pod לא קיים",
              "ה-Pod מבקש יותר CPU ממה שקיים ב-Nodes הפנויים",
              "NetworkPolicy חוסמת את ה-Pod",
              ],
              answer: 2,
              explanation:
                "כש-Scheduler מדווח 'Insufficient cpu' על כל ה-Nodes, משמעות הדבר שה-CPU request של ה-Pod (requests.cpu) גדול מהcapacity הפנוי בכל Node. הקטן את ה-cpu request לפי actual usage, או הוסף Nodes עם capacity פנוי.",
            },
            {
              q: "מה קורה כשliveness probe נכשל?",
              options: [
              "Pod מוגדר NotReady",
              "K8s ממית ומפעיל מחדש את הקונטיינר",
              "Pod נמחק לצמיתות",
              "Event נרשם בלבד",
              ],
              answer: 1,
              explanation:
                "liveness probe בודק האם הקונטיינר עדיין \"חי\" ומגיב. כשהוא נכשל failureThreshold פעמים ברציפות, Kubernetes ממית את הקונטיינר ומפעיל אותו מחדש לפי ה-restartPolicy. readiness probe לעומת זאת מסיר את ה-Pod מה-Service Endpoints ללא restart.",
            },
            {
              q: "ה-Pod נמצא ב-ContainerCreating זמן רב. מה הסיבות האפשריות?",
              options: [
              "הimage גדול בלבד",
              "PVC שלא נמצא, Secret חסר, image pull איטי, או בעיה ב-CNI",
              "רק network בעיה",
              "רק disk מלא",
              ],
              answer: 1,
              explanation:
                "ContainerCreating הוא שלב נורמלי, אבל כשהוא נמשך זמן רב מציין בעיה. הסיבות הנפוצות הן: PVC שעדיין לא Bound, Secret או ConfigMap שמוזכרים ב-spec אבל לא קיימים, image גדול שנמשך להורדה, או בעיה ב-CNI שלא מצליח להגדיר network interface.",
            },
            {
              q: "ה-Pod מצב Terminating ולא נמחק. אפילו kubectl delete pod my-pod --grace-period=0 --force לא עוזר. מה הסיבה?",
              options: [
              "Namespace נעול",
              "Pod יש finalizer שלא נוקה – יש לבדוק ולהסיר ידנית",
              "RBAC חוסם",
              "Node נפל",
              ],
              answer: 1,
              explanation:
                "Finalizer הוא שדה ב-metadata שמונע מחיקת resource עד שlogic חיצוני מנקה אותו (בד\"כ controller). אפילו --grace-period=0 --force לא יעזור כשיש finalizer פעיל. כשה-controller לא זמין, ה-Pod תקוע ב-Terminating. כדי לפתור: kubectl patch pod my-pod -p '{\"metadata\":{\"finalizers\":null}}' מסיר את כל ה-finalizers ידנית.",
            },
            {
              q: "ה-Node ב-DiskPressure.\n\nkubectl describe node מציג:\nConditions:\n  DiskPressure True\n\nמה הסיבות הנפוצות?",
              options: [
              "RAM מלא",
              "logs שצברו מקום, images ישנים, או disk של Node מלא",
              "CPU גבוה",
              "Network congestion",
              ],
              answer: 1,
              explanation:
                "DiskPressure מופיע כש-kubelet מזהה שה-disk של ה-Node מגיע לסף מלאות. הסיבות הנפוצות הן: logs שהצטברו, container images ישנים שלא נוקו, ו-emptyDir volumes גדולים. נקה עם docker image prune וjournalctl --vacuum-time=2d, או הרחב את הdisk.",
            },
        ],
        questionsEn: [
            {
              q: "You deployed a new version. The pod starts, immediately crashes, and Kubernetes keeps restarting it. What status do you see in kubectl get pods?",
              options: [
              "Terminating",
              "CrashLoopBackOff",
              "OOMKilled",
              "ErrImagePull",
              ],
              answer: 1,
              explanation:
                "CrashLoopBackOff means the container starts, crashes immediately, and Kubernetes retries with an exponentially increasing back-off delay. The --previous flag on kubectl logs retrieves logs from the last crashed container instance, which is essential for diagnosing the cause.",
            },
            {
              q: "A pod is stuck in ImagePullBackOff. What are the two most common causes?",
              options: [
              "Wrong resource limits and missing namespace",
              "Wrong image name/tag, or missing imagePullSecret for a private registry",
              "Node out of disk space and wrong port",
              "RBAC permissions and missing ConfigMap",
              ],
              answer: 1,
              explanation:
                "ImagePullBackOff means Kubernetes failed to pull the container image and is waiting with an increasing delay before retrying. The two most common causes are a typo in the image name or tag, and missing imagePullSecrets credentials for a private registry.",
            },
            {
              q: "A pod ran fine for hours then suddenly terminated. kubectl describe shows 'Reason: OOMKilled'. What happened and what is the fix?",
              options: [
              "Pod evicted due to low disk; add more storage",
              "Container exceeded its memory limit; increase limits.memory or optimize the app",
              "Liveness probe failed; fix the probe config",
              "Pod preempted by higher-priority pod; adjust PriorityClass",
              ],
              answer: 1,
              explanation:
                "OOMKilled (Out Of Memory Killed) happens when a container exceeds its limits.memory setting - the Linux kernel terminates it with exit code 137 (SIGKILL). Increase the memory limit in the Pod spec, or use kubectl top pod to identify a memory leak in the application.",
            },
            {
              q: "A pod stays Pending. kubectl describe shows: '0/3 nodes are available: 3 Insufficient cpu'. What is the root cause?",
              options: [
              "The container image is too large",
              "The pod namespace does not exist",
              "The pod requests more CPU than any available node can provide",
              "A NetworkPolicy is blocking the pod",
              ],
              answer: 2,
              explanation:
                "When the Scheduler reports Insufficient cpu on every Node, the cluster has no available CPU capacity to place the Pod. Lower requests.cpu in the Pod spec to what the workload actually needs (use kubectl top pods to measure), or expand the cluster with more Nodes.",
            },
            {
              q: "What happens when a liveness probe fails?",
              options: [
              "Pod is set to NotReady",
              "K8s kills and restarts the container",
              "Pod is permanently deleted",
              "Only an event is recorded",
              ],
              answer: 1,
              explanation:
                "A liveness probe tells Kubernetes whether the container is still alive and responsive. When the probe fails consecutively for failureThreshold times, Kubernetes kills the container and restarts it following the Pod's restartPolicy. Unlike a readiness probe failure, a liveness failure triggers a full container restart.",
            },
            {
              q: "A Pod is in ContainerCreating for a long time. What are the likely causes?",
              options: [
              "Large image only",
              "Unbound PVC, missing Secret, slow image pull, or CNI issue",
              "Network issue only",
              "Full disk only",
              ],
              answer: 1,
              explanation:
                "ContainerCreating is normal briefly, but when prolonged it indicates a blocker. Common causes are: a PVC that is still Pending, a Secret or ConfigMap referenced in the spec that does not exist, a large image still downloading, or a CNI plugin failing to configure the Pod's network interface.",
            },
            {
              q: "A Pod is stuck in Terminating and even kubectl delete pod my-pod --grace-period=0 --force doesn't help. What is the cause?",
              options: [
              "Namespace is locked",
              "The Pod has a finalizer that was not cleared - must be removed manually",
              "RBAC is blocking",
              "Node is down",
              ],
              answer: 1,
              explanation:
                "A finalizer is a field in metadata that blocks deletion of a resource until an external controller removes it. Even --grace-period=0 --force cannot bypass an active finalizer. If that controller is unavailable, the Pod stays stuck in Terminating indefinitely. To force removal: kubectl patch pod my-pod -p '{\"metadata\":{\"finalizers\":null}}' clears all finalizers and lets deletion proceed.",
            },
            {
              q: "A Node shows DiskPressure.\n\nkubectl describe node shows:\nConditions:\n  DiskPressure True\n\nWhat are the common causes?",
              options: [
              "RAM is full",
              "Accumulated logs, old images, or a full Node disk",
              "High CPU",
              "Network congestion",
              ],
              answer: 1,
              explanation:
                "DiskPressure is set by kubelet when the Node disk usage crosses a threshold. The most common culprits are accumulated container logs, stale container images, and large emptyDir volumes. Clean up with docker image prune and journalctl --vacuum-time=2d, or expand the Node disk.",
            },
        ],
      },
      hard: {
        theory: "Debug מתקדם.\n🔹 kubectl port-forward – מנתב port מ-Pod לlocal machine\n🔹 kubectl cp – מעתיק קבצים מ/ל-Pod\n🔹 kubectl top – CPU/Memory usage בזמן אמת\n🔹 Pod ב-Terminating לא נמחק – בגלל finalizer\nCODE:\nkubectl port-forward pod/my-pod 8080:80\nkubectl cp my-pod:/app/log.txt ./log.txt\nkubectl top pod --sort-by=memory\nkubectl patch pod my-pod -p '{\"metadata\":{\"finalizers\":null}}'",
        theoryEn: "Advanced debugging.\n🔹 kubectl port-forward – routes a port from Pod to local machine\n🔹 kubectl cp – copies files from/to a Pod\n🔹 kubectl top – real-time CPU/Memory usage\n🔹 Pod stuck in Terminating – blocked by a finalizer\nCODE:\nkubectl port-forward pod/my-pod 8080:80\nkubectl cp my-pod:/app/log.txt ./log.txt\nkubectl top pod --sort-by=memory\nkubectl patch pod my-pod -p '{\"metadata\":{\"finalizers\":null}}'",
        questions: [
            {
              q: "לאחר Deployment, ה-Pods החדשים ב-CrashLoopBackOff. הגרסה הקודמת עבדה מצוין. מה שתי פעולות ה-debug הראשונות שלך לפני שמחליטים מה לעשות?",
              options: [
              "Scale down ל-0 ו-redeploy מחדש",
              "kubectl rollout undo מיד לגרסה הקודמת",
              "kubectl logs <new-pod> --previous ו-kubectl describe pod <new-pod>",
              "מחק את כל ה-Pods ותן ל-Kubernetes ליצור אותם מחדש",
              ],
              answer: 2,
              explanation:
                "לפני rollback חשוב להבין מה שתשתנה. kubectl logs <new-pod> --previous מציג את הoutput של ה-crash, וkubectl describe pod מציג את ה-Events שהובילו לו. רק אחרי שמבינים את הסיבה מחליטים - לתקן את הcode ולדחוף גרסה חדשה, או לבצע rollout undo לגרסה הקודמת.",
            },
            {
              q: "ה-Node מראה NotReady ב-kubectl get nodes. Pods מפונים ממנו. מה שתי הפעולות הראשונות שלך?",
              options: [
              "מחק את ה-Node ותן לו להצטרף מחדש",
              "Restart את כל ה-Pods על ה-Node",
              "kubectl describe node <name> לבדוק Conditions ו-Events; ואז SSH לNode ולהריץ systemctl status kubelet",
              "Scale down את כל ה-Deployments ל-0",
              ],
              answer: 2,
              explanation:
                "kubectl describe node <name> מציג את ה-Conditions (MemoryPressure, DiskPressure, Ready) ואת ה-Events האחרונים - המקום הראשון לחפש. לאחר מכן SSH ל-Node ו-systemctl status kubelet לוודא שהתהליך רץ. הסיבות הנפוצות ל-NotReady: kubelet נפל, תעודת TLS פגה, או disk/memory pressure.",
            },
            {
              q: "מה kubectl drain עושה ומתי משתמשים בו?",
              options: [
              "מוחק Node",
              "מפנה Pods מNode בצורה graceful לפני maintenance (node upgrade, reboot)",
              "Scale down",
              "מנתק Node מNetwork",
              ],
              answer: 1,
              explanation:
                "kubectl drain מפנה את כל ה-Pods מ-Node בצורה graceful ומסמן אותו כunschedulable. הוא מכבד PodDisruptionBudgets ומחכה שה-Pods יעלו במקום אחר לפני שממשיך. משתמשים בו לפני maintenance (upgrade, reboot) כדי למנוע downtime.",
            },
            {
              q: "כיצד מאבחנים בעיות DNS ב-Kubernetes?",
              options: [
              "kubectl dns check",
              "kubectl exec pod -- nslookup kubernetes.default + בדיקת CoreDNS Pod logs",
              "kubectl describe dns",
              "kubectl get dns",
              ],
              answer: 1,
              explanation:
                "לבדיקת DNS מתוך Pod: kubectl exec <pod> -- nslookup kubernetes.default מוודא שCoreDNS מגיב. אם נכשל, בדוק kubectl get pods -n kube-system לוודא שCoreDNS Pods רצים ובדוק kubectl logs <coredns-pod> -n kube-system לשגיאות.",
            },
            {
              q: "מה הפקודה לגיבוי etcd?",
              options: [
              "kubectl backup etcd",
              "etcdctl snapshot save backup.db --endpoints=...",
              "kubectl export etcd",
              "etcd backup --all",
              ],
              answer: 1,
              explanation:
                "etcdctl snapshot save backup.db מייצר snapshot מלא של etcd - ה-database שמכיל את כל מצב הCluster. זהו הכלי הראשי ל-Disaster Recovery. חייבים לציין --endpoints, --cacert, --cert, ו--key לאימות מול ה-etcd cluster.",
            },
            {
              q: "ה-Pod רץ, אבל ה-liveness probe נכשל שוב ושוב.\n\nהפלט של kubectl describe pod מציג:\n\n```\nLiveness probe failed:\nHTTP probe failed with statuscode: 404\n```\n\nמה בודקים?",
              options: [
              "בעיית DNS שמונעת מה-probe להגיע ל-Pod",
              "ה-probe path שגוי — האפליקציה לא חושפת את ה-endpoint הזה",
              "ה-container image שגוי ולא מכיל את האפליקציה",
              "הרשאות RBAC מונעות מ-kubelet לבצע את ה-probe",
              ],
              answer: 1,
              explanation:
                "שורש הבעיה:\nקוד 404 אומר שה-path שמוגדר ב-livenessProbe.httpGet.path לא קיים באפליקציה.\nה-Pod עצמו רץ ומגיב — רק ה-endpoint הספציפי לא נמצא.\n\nמה זה Liveness Probe?\nבדיקה ש-Kubernetes מריץ באופן קבוע כדי לוודא שהקונטיינר \"חי\".\nאם היא נכשלת failureThreshold פעמים ברצף — Kubernetes ממית את הקונטיינר ומפעיל אותו מחדש.\n\nהפתרון:\nלבדוק בקוד או בתיעוד של האפליקציה איזה endpoint health היא חושפת (/health, /ping, /livez).\nלעדכן את ה-path ב-Pod spec בהתאם.\n\nלמה שאר התשובות שגויות:\n• DNS — ה-probe רץ מ-kubelet ישירות ל-Pod IP, לא דרך DNS.\n• image שגוי — האפליקציה מגיבה (404 = יש שרת, אין route), כלומר ה-image נכון.\n• RBAC — אין קשר ל-liveness probes, שרצים ברמת kubelet.",
            },
            {
              q: "הפקודה kubectl logs my-pod מחזיר:\n\nError from server (BadRequest): container 'my-container' in pod 'my-pod' is not running\n\nמה עושים?",
              options: [
              "Pod Running בטח",
              "Pod לא Running – בדוק kubectl get pod my-pod לראות סטטוס, ואז kubectl describe pod my-pod לEvents",
              "מחק Pod",
              "הוסף sidecar",
              ],
              answer: 1,
              explanation:
                "Kubernetes לא יכול לקרוא logs מcontainer שלא רץ. בדוק kubectl get pod my-pod לסטטוס: אם CrashLoopBackOff השתמש ב-kubectl logs my-pod --previous ללוגים מה-crash האחרון. אם הסטטוס הוא Init:Error, בדוק kubectl logs my-pod -c <init-container-name>.",
            },
            {
              q: "Cluster חדש הותקן זה עתה.\n\nהפלט של kubectl get nodes מציג:\n\n```\nNAME    STATUS     ROLES           AGE\nmaster  NotReady   control-plane   5m\n```\n\nמה הצעד הראשון?",
              options: [
              "למחוק את ה-Node ולהתקין אותו מחדש",
              "CNI plugin לא מותקן — יש לבדוק ולהתקין Calico או Flannel",
              "ה-API server לא רץ ויש להפעיל אותו ידנית",
              "ה-etcd database כשל ויש לשחזר מגיבוי",
              ],
              answer: 1,
              explanation:
                "שורש הבעיה:\nב-Cluster חדש, Node במצב NotReady כמעט תמיד אומר ש-CNI plugin עדיין לא הותקן.\nKubernetes דורש CNI כדי להגדיר networking ל-Pods.\nללא CNI, ה-Node לא יכול להיות Ready.\n\nמה זה CNI?\nContainer Network Interface — תקן שמגדיר כיצד Pods מקבלים IP ומתקשרים.\nדוגמאות: Calico, Flannel, Cilium.\n\nכיצד לאתר ולתקן:\n```\nkubectl get pods -n kube-system\n```\nCoreDNS Pods יהיו ב-Pending — אות נוסף ל-CNI חסר.\nהתקינו CNI plugin (למשל kubectl apply -f calico.yaml) וה-Node יעבור ל-Ready.\n\nלמה שאר התשובות שגויות:\n• מחיקת Node — לא פותרת את חוסר ה-CNI, הבעיה תחזור.\n• API server לא רץ — אם הוא לא היה רץ, kubectl get nodes לא היה עובד.\n• etcd כשל — אם etcd היה כושל, לא הייתם מקבלים תשובה מה-API.",
            },
        ],
        questionsEn: [
            {
              q: "After a deployment, new pods are in CrashLoopBackOff. The previous version worked fine. What are your first two debugging steps before deciding what to do?",
              options: [
              "Scale down to 0 and redeploy",
              "Run kubectl rollout undo immediately",
              "Run kubectl logs <new-pod> --previous and kubectl describe pod <new-pod>",
              "Delete all pods and wait for recreation",
              ],
              answer: 2,
              explanation:
                "Rolling back without understanding the cause can mask the problem. kubectl logs <new-pod> --previous shows what the container printed before crashing, and kubectl describe pod shows the Events timeline. Only after understanding the cause should you decide whether to fix the code or run kubectl rollout undo.",
            },
            {
              q: "A Node shows NotReady in kubectl get nodes. Pods on it are being evicted. What are your first two steps?",
              options: [
              "Delete the node and let it rejoin",
              "Restart all pods on the node",
              "kubectl describe node <name> to check Conditions and Events, then SSH in and run systemctl status kubelet",
              "Scale down all deployments to 0",
              ],
              answer: 2,
              explanation:
                "kubectl describe node <name> is the first diagnostic step - it shows all Conditions (Ready, MemoryPressure, DiskPressure), recent Events, and allocated resources. Then SSH in and run systemctl status kubelet to check if the kubelet process is running. Common root causes: kubelet crashed, TLS cert expired, or disk/memory pressure.",
            },
            {
              q: "What does kubectl drain do and when is it used?",
              options: [
              "Deletes a Node",
              "Gracefully evicts Pods from a Node before maintenance (upgrade, reboot)",
              "Scale down",
              "Disconnects Node from network",
              ],
              answer: 1,
              explanation:
                "kubectl drain evicts all Pods from a Node gracefully, honoring PodDisruptionBudgets and waiting for each Pod to terminate before proceeding. It also cordons the Node so no new Pods are scheduled during maintenance. Use it before Node upgrades, reboots, or decommissioning.",
            },
            {
              q: "How do you diagnose DNS issues in Kubernetes?",
              options: [
              "kubectl dns check",
              "kubectl exec pod -- nslookup kubernetes.default + check CoreDNS Pod logs",
              "kubectl describe dns",
              "kubectl get dns",
              ],
              answer: 1,
              explanation:
                "To test DNS from inside a Pod: kubectl exec <pod> -- nslookup kubernetes.default verifies that CoreDNS is responding. If that fails, check kubectl get pods -n kube-system to confirm CoreDNS Pods are Running, then kubectl logs <coredns-pod> -n kube-system for error details.",
            },
            {
              q: "What is the command to back up etcd?",
              options: [
              "kubectl backup etcd",
              "etcdctl snapshot save backup.db --endpoints=...",
              "kubectl export etcd",
              "etcd backup --all",
              ],
              answer: 1,
              explanation:
                "etcdctl snapshot save backup.db creates a point-in-time snapshot of etcd, which contains the entire cluster state. This is the standard backup method for disaster recovery. You must provide --endpoints, --cacert, --cert, and --key flags to authenticate with the etcd cluster.",
            },
            {
              q: "A Pod is running, but the liveness probe keeps failing.\n\nThe output of kubectl describe pod shows:\n\n```\nLiveness probe failed:\nHTTP probe failed with statuscode: 404\n```\n\nWhat do you check?",
              options: [
              "A DNS issue preventing the probe from reaching the Pod",
              "The probe path is wrong — the app does not expose this endpoint",
              "The container image is wrong and does not contain the application",
              "RBAC permissions prevent kubelet from performing the probe",
              ],
              answer: 1,
              explanation:
                "Root cause:\nA 404 means the path configured in livenessProbe.httpGet.path does not exist in the application.\nThe Pod is running and responding — only the specific endpoint is missing.\n\nWhat is a Liveness Probe?\nA check Kubernetes runs periodically to verify the container is alive.\nIf it fails failureThreshold times consecutively, Kubernetes kills and restarts the container.\n\nThe fix:\nCheck the application's code or documentation to find which health endpoint it exposes (/health, /ping, /livez).\nUpdate the path in the Pod spec accordingly.\n\nWhy the other answers are wrong:\n• DNS — the probe runs from kubelet directly to the Pod IP, not through DNS.\n• Wrong image — the app is responding (404 = server exists but route is missing), so the image is correct.\n• RBAC — has no relation to liveness probes, which run at the kubelet level.",
            },
            {
              q: "kubectl logs my-pod returns:\n\nError from server (BadRequest): container 'my-container' in pod 'my-pod' is not running\n\nWhat do you do?",
              options: [
              "The Pod is definitely Running",
              "Pod is not Running - check kubectl get pod my-pod for status, then kubectl describe pod my-pod for Events",
              "Delete the Pod",
              "Add a sidecar",
              ],
              answer: 1,
              explanation:
                "Kubernetes can only stream logs from a container that is currently running. The error means the container is not in a running state. Run kubectl get pod my-pod to see the status: if CrashLoopBackOff use kubectl logs my-pod --previous to read the last crashed instance; if the status is Init:Error check the initContainer logs with kubectl logs my-pod -c <init-container-name>.",
            },
            {
              q: "A new cluster was just initialized.\n\nThe output of kubectl get nodes shows:\n\n```\nNAME    STATUS     ROLES           AGE\nmaster  NotReady   control-plane   5m\n```\n\nWhat is the first step?",
              options: [
              "Delete the Node and reinstall it from scratch",
              "CNI plugin is not installed — check and install Calico or Flannel",
              "The API server is not running and must be started manually",
              "The etcd database has failed and must be restored from backup",
              ],
              answer: 1,
              explanation:
                "Root cause:\nOn a freshly initialized cluster, a NotReady Node almost always means the CNI plugin has not been installed yet.\nKubernetes requires CNI to set up networking for Pods.\nWithout CNI, the Node cannot become Ready.\n\nWhat is CNI?\nContainer Network Interface — a standard that defines how Pods get IP addresses and communicate.\nExamples: Calico, Flannel, Cilium.\n\nHow to debug and fix:\n```\nkubectl get pods -n kube-system\n```\nCoreDNS Pods will be in Pending — another sign of a missing CNI.\nInstall a CNI plugin (e.g., kubectl apply -f calico.yaml) and the Node will transition to Ready.\n\nWhy the other answers are wrong:\n• Delete Node — doesn't solve the missing CNI, the problem will recur.\n• API server not running — if it weren't running, kubectl get nodes would not work.\n• etcd failure — if etcd had failed, you would not get a response from the API.",
            },
        ],
      },
    },
  },
];
