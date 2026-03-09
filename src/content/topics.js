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
                "Pod הוא יחידת הריצה הבסיסית ב-Kubernetes.\nכל הקונטיינרים ב-Pod חולקים IP, network namespace ו-volumes.\nKubernetes מנהל Pods, לא קונטיינרים בנפרד.",
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
                "Deployment מנהל Pods זהים דרך ReplicaSet ושומר על מספר ה-replicas הרצוי.\nמספק rolling updates, rollback, והחלפה אוטומטית של Pods שקרסו.\nPod שנמחק — Deployment יוצר חדש מיד.",
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
                "Liveness probe הוא בדיקת בריאות תקופתית על הקונטיינר.\nכשלון חוזר → Kubernetes מניח שהקונטיינר תקוע ומפעיל אותו מחדש.\nסוגי בדיקות — HTTP GET, TCP socket, או פקודת shell (exit code 0).",
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
                "Readiness probe בודק שהקונטיינר מוכן לקבל בקשות.\nPod שנכשל ב-readiness מוסר מ-Service endpoints ולא מקבל traffic.\nבשונה מ-liveness (ממית את הקונטיינר), readiness רק מפסיק לנתב traffic.",
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
                "restartPolicy קובע מתי Kubernetes מפעיל מחדש קונטיינר שנפסק.\nAlways (ברירת מחדל) — תמיד. OnFailure — רק בקריסה. Never — לעולם לא.\nOnSuccess לא קיים ב-Kubernetes.",
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
                "Job מריץ משימה חד-פעמית עד הצלחה; CronJob מתזמן Jobs לפי cron schedule.\nJob = run-to-completion. CronJob = תזמון חוזר (גיבוי, ניקוי, דוחות).\nכישלון → Job יוצר Pod חדש ומנסה שוב (עד backoffLimit).",
            },
            {
              q: "מה resource requests ב-Pod?",
              options: [
              "גודל ה-container image שמוריד מה-registry לפני הפעלה",
              "כמות ה-CPU וה-Memory שה-Pod מבקש כדי שה-Scheduler יוכל לבחור Node מתאים",
              "רשימת הפורטים שה-Pod חושף לתעבורת רשת",
              "מגבלת קצב הרשת שה-Pod מקבל מה-CNI plugin",
              ],
              answer: 1,
              explanation:
                "requests מגדיר כמה CPU/Memory ה-Pod מבקש.\nה-Scheduler משתמש בערכים אלה כדי למצוא Node עם מספיק משאבים.\nrequests הוא רמז לתזמון — הקונטיינר יכול לצרוך יותר, עד limits.",
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
                "Namespace מספק הפרדה לוגית של משאבים בתוך Cluster.\nשימושי להפרדת סביבות (dev/staging/prod), צוותים, או לקוחות.\nניתן להגביל צריכת משאבים לכל Namespace עם ResourceQuota ו-LimitRange.",
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
                "A Pod is Kubernetes' smallest deployable unit — one or more containers running together.\nAll containers in a Pod share the same IP, network namespace, and volumes.\nKubernetes manages Pods, not individual containers.",
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
                "A Deployment manages identical Pods via ReplicaSet and keeps the desired replica count running.\nProvides rolling updates, rollback, and automatic Pod replacement on failure.\nStandard way to run stateless apps in Kubernetes.",
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
                "A liveness probe is a periodic health check Kubernetes runs on each container.\nRepeated failures → Kubernetes kills and restarts the stuck container.\nProbe types — HTTP GET, TCP socket, or shell command (exit code 0).",
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
                "Readiness probe checks if the container is ready to serve requests.\nFailing Pods are removed from Service endpoints — no traffic routed to them.\nUnlike liveness (kills container), readiness only pauses traffic routing.",
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
                "restartPolicy controls when Kubernetes restarts a stopped container.\nAlways (default) — always restarts. OnFailure — only on crash. Never — never.\nMost long-running apps use the default Always.",
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
                "Job runs a task once to completion; CronJob schedules Jobs on a recurring cron schedule.\nJob = run-to-completion. CronJob = recurring (backups, cleanup, reports).\nOn failure, Job retries by creating new Pods (up to backoffLimit).",
            },
            {
              q: "What are resource requests in a Pod?",
              options: [
              "Size of the container image downloaded from the registry before startup",
              "The amount of CPU and Memory the Pod asks for so the Scheduler can find a suitable Node",
              "The list of ports the Pod exposes for network traffic",
              "Network rate limit assigned to the Pod by the CNI plugin",
              ],
              answer: 1,
              explanation:
                "requests defines how much CPU and Memory the Pod asks for.\nThe Scheduler uses these values to find a Node with enough resources.\nrequests is a scheduling hint — containers can burst above it, up to limits.",
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
                "Namespaces provide logical isolation of resources within a cluster.\nCommonly used for separating environments (dev/staging/prod), teams, or tenants.\nEnforce resource limits per Namespace with ResourceQuota and LimitRange.",
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
                "Rolling Update מחליף Pods בהדרגה — חדש עולה, רק אז ישן יורד.\nתמיד יש Pods זמינים → zero downtime.\nבשונה מ-Recreate שמוחק הכל ויוצר downtime.",
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
                "kubectl rollout undo מחזיר את ה-Deployment ל-revision הקודם.\nהפקודה מפעילה מחדש את ה-ReplicaSet הקודם עם ה-image הישן.\nאפשר לציין revision ספציפי עם --to-revision=N.",
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
                "ב-StatefulSet לכל Pod שם קבוע (pod-0, pod-1) ו-PVC ייחודי משלו.\nPods עולים בסדר ולכל אחד זהות קבועה גם אחרי restart.\nבשונה מ-Deployment שבו Pods זהים ולא מובחנים.",
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
                "PDB מגדיר מינימום Pods זמינים בזמן disruptions מתוכננות (כמו kubectl drain).\nעם minAvailable: 2 ו-3 replicas — מקסימום Pod אחד נגרש בו-זמנית.\nמגן על זמינות אפליקציות חשובות בזמן maintenance.",
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
                "limits מגדיר תקרת משאבים מקסימלית לקונטיינר.\nחריגת memory → OOMKill (exit code 137). חריגת CPU → throttling בלבד.\nrequests = תזמון. limits = תקרה קשיחה.",
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
                "Taint = שלט \"כניסה אסורה\" על Node. Toleration = אישור ב-Pod spec לרוץ שם.\nPods ללא toleration תואם לא יתוזמנו על Node עם taint.\nמשמש לייחוד Nodes ל-GPU workloads, spot instances וכו׳.",
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
                "QoS class נקבע אוטומטית לפי requests ו-limits.\nGuaranteed (requests=limits) → אחרון להיגרש. Burstable → חלקי. BestEffort (ללא הגדרות) → ראשון להיגרש.\nהגדרת requests=limits לכל הקונטיינרים = Guaranteed = הגנה מקסימלית.",
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
                "Ephemeral containers מוזרקים ל-Pod רץ דרך kubectl debug לחקירה בזמן אמת.\nשימושי כשה-image הראשי הוא distroless וחסר shell או curl.\nחד-פעמי בלבד — לא מופיע ב-Pod spec ולא מאותחל מחדש.",
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
                "Rolling Update replaces Pods gradually — new Pod starts, then old Pod stops.\nThere are always running Pods serving traffic → zero downtime.\nUnlike Recreate strategy, which causes downtime by deleting all Pods first.",
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
                "kubectl rollout undo rolls the Deployment back to its previous revision.\nReactivates the previous ReplicaSet with the old image.\nUse --to-revision=N for a specific revision, rollout history to list them.",
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
                "StatefulSet gives each Pod a stable name (pod-0, pod-1) and its own PVC.\nPods start in order and keep their identity across restarts.\nDeployment Pods are interchangeable; StatefulSet Pods are not.",
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
                "PDB defines minimum available Pods during planned disruptions like kubectl drain.\nWith minAvailable: 2 and 3 replicas, only one Pod can be evicted at a time.\nProtects application availability during Node maintenance.",
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
                "limits is the hard ceiling on resources a container can use.\nExceeding memory limit → OOMKill (exit code 137). Exceeding CPU limit → throttling only.\nrequests = scheduling hint. limits = hard cap.",
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
                "Taint = \"No entry\" sign on a Node. Toleration = Pod's pass to ignore that taint.\nPods without a matching toleration cannot be scheduled on tainted Nodes.\nUsed to reserve specialized Nodes (GPU, spot instances) for specific workloads.",
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
                "QoS class is auto-assigned based on requests and limits settings.\nGuaranteed (requests=limits) → last evicted. Burstable → partial. BestEffort (none set) → first evicted.\nSet requests=limits on all containers for Guaranteed — maximum protection.",
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
                "Ephemeral containers are injected into a running Pod via kubectl debug.\nUseful when the main image is distroless and lacks shell or curl.\nOne-time use only — not in Pod spec, never restarted.",
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
                "DaemonSet מבטיח Pod אחד על כל Node — מתווסף אוטומטית ל-Nodes חדשים.\nNode מצטרף → Pod נוסף. Node מוסר → Pod נמחק.\nשימושי ל-logging (Fluentd), monitoring (node-exporter), ו-CNI plugins.",
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
                "HPA (Horizontal Pod Autoscaler) משנה מספר replicas אוטומטית לפי עומס.\nעומס עולה → מוסיף Pods. עומס יורד → מסיר Pods.\nדורש metrics-server מותקן ב-Cluster.",
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
                "OOMKilled (exit code 137) — הקונטיינר חרג ממגבלת ה-memory שהוגדרה ב-limits.\nה-Linux kernel הורג תהליכים שחורגים ממגבלת הזיכרון.\nהפתרון — הגדל memory limit, או חפש memory leak בקוד.",
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
                "topologySpreadConstraints מפזר Pods באופן אחיד בין failure domains (Nodes, Zones).\nללא פיזור, כל ה-Pods עלולים לרוץ על Node אחד — אם קורס, השירות נופל.\nפיזור מבטיח שחלק מה-Pods ממשיכים לרוץ גם בכשל של Node או Zone.",
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
                "כל 3 ה-Nodes מסומנים עם taint (dedicated=gpu) וה-Pod חסר toleration תואם.\nלהוסיף toleration ל-Pod spec שמתאים ל-taint.\n• Node חדש — עוקף, לא פותר. • CPU request — לא רלוונטי. • Namespace — לא משפיע על taints.\nTaint = \"כניסה אסורה\". Toleration = אישור כניסה ב-Pod spec.",
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
                "StatefulSet יוצר Pods בסדר (OrderedReady) — Pod-0 חייב להיות Ready לפני שPod-1 נוצר.\nלתקן את Pod-0 כדי שיגיע למצב Ready, או להגדיר podManagementPolicy: Parallel.\n• PVC — Pod-1 לא נוצר בכלל. • Quota — גם Pod-0 לא היה עולה. • imagePullSecret — היה גורם ל-ImagePullBackOff.\nבברירת מחדל, StatefulSet יוצר Pods בסדר עוקב ותקיעה ב-Pod מוקדם חוסמת את כל השאר.",
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
                "maxUnavailable:0 מונע הורדת Pod ישן עד שהחדש עובר readiness.\nPods חדשים נכשלים ב-readiness → ה-rollout נתקע. יש לבדוק kubectl logs.\nmaxUnavailable:0 = בטיחות מלאה, אבל readiness כושל = rollout תקוע.",
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
                "selector (app: backend) לא תואם ל-labels של ה-Pods (app: backend-v2).\nלסנכרן בין selector.matchLabels ל-template.metadata.labels.\nDeployment מוצא את ה-Pods שלו אך ורק לפי selector — אי-התאמה = אפס שליטה.",
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
                "DaemonSet guarantees one Pod copy on every Node — added automatically to new Nodes.\nNode joins → Pod added. Node removed → Pod deleted.\nIdeal for logging (Fluentd), monitoring (node-exporter), and CNI plugins.",
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
                "HPA (Horizontal Pod Autoscaler) auto-scales replicas based on CPU/Memory metrics.\nLoad increases → adds Pods. Load drops → removes Pods.\nRequires metrics-server installed in the cluster.",
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
                "OOMKilled (exit code 137) — container exceeded its memory limit.\nThe Linux kernel kills processes that exceed the memory limit set in limits.memory.\nFix by increasing memory limit, or investigate a memory leak in the app.",
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
                "topologySpreadConstraints distributes Pods evenly across failure domains (Nodes, Zones).\nWithout spreading, all Pods may land on one Node — if it fails, the service is down.\nEven distribution ensures partial availability even when a Node or Zone fails.",
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
                "All 3 Nodes have taint dedicated=gpu and the Pod lacks a matching toleration.\nAdd a toleration to the Pod spec matching the taint.\n• New Node — workaround, not a fix. • CPU request — irrelevant. • Namespace — has no effect on taints.\nTaint = \"no entry\". Toleration = Pod's permission to run on that Node.",
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
                "StatefulSet uses OrderedReady — Pod-0 must be Ready before Pod-1 is created.\nFix Pod-0 to become Ready, or set podManagementPolicy: Parallel.\n• PVC — Pod-1 was never created. • Quota — Pod-0 wouldn't exist either. • imagePullSecret — would cause ImagePullBackOff.\nDefault StatefulSet creates Pods sequentially — a stuck Pod blocks all subsequent ones.",
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
                "maxUnavailable:0 prevents removing old Pods until new ones pass readiness.\nNew Pods fail readiness → rollout stalls. Check kubectl logs on new Pods.\nmaxUnavailable:0 = safe but readiness failure = permanent stall.",
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
                "Selector (app: backend) doesn't match Pod labels (app: backend-v2).\nAlign selector.matchLabels with template.metadata.labels.\nA Deployment finds its Pods solely by selector — mismatch = zero control.",
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
                "IP של Pod משתנה בכל פעם שהוא נוצר מחדש.\nService מספק ClusterIP קבוע ו-kube-proxy מנתב traffic ל-Pods בריאים.\nService = כתובת יציבה שנשמרת גם כש-Pods מתחלפים.",
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
                "LoadBalancer מבקש מה-cloud provider ליצור LB חיצוני עם IP ציבורי.\nמנתב traffic מהאינטרנט לכל ה-Nodes דרך NodePort.\nמתאים ל-production כשצריך גישה חיצונית ישירה.",
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
                "ClusterIP הוא ברירת המחדל — IP וירטואלי פנימי שנגיש רק מתוך ה-Cluster.\nPods ניגשים אליו לפי DNS (my-service.my-ns.svc.cluster.local).\nלא נגיש מבחוץ ללא Ingress או port-forward.",
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
                "Service מגדיר selector עם labels, ו-Endpoints controller מוצא Pods תואמים.\nIPs של Pods תואמים נוספים לאובייקט Endpoints.\nkube-proxy מנתב traffic לאחד מה-Endpoints.",
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
                "port = הפורט שה-Service חושף. targetPort = הפורט שהקונטיינר מאזין עליו.\nהם יכולים להיות שונים — Service על 80, קונטיינר על 8080.\nה-Service מתרגם בין port ל-targetPort אוטומטית.",
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
                "CoreDNS רץ כ-Pod ומספק DNS פנימי ל-Cluster.\nכל Service מקבל שם DNS אוטומטי (service.namespace.svc.cluster.local).\nמאפשר ל-Pods למצוא Services לפי שם במקום IP.",
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
                "Ingress חושף Services HTTP/HTTPS לחוץ עם ניתוב לפי path או hostname.\nמנתב /api ל-Service אחד ו-/web לאחר דרך כניסה אחת.\nחוסך LoadBalancer נפרד לכל Service.",
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
                "NetworkPolicy מגדירה חוקי firewall ברמת Pod.\ningress = מי מורשה להגיע ל-Pod. egress = לאן Pod מורשה לשלוח.\nדורשת CNI plugin תומך (Calico, Cilium).",
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
                "A Pod's IP changes every time it restarts — you can't connect to it reliably.\nA Service provides a stable ClusterIP that routes traffic to healthy Pods.\nService = permanent address that survives Pod restarts.",
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
                "LoadBalancer asks the cloud provider to create an external LB with a public IP.\nInternet traffic hits the public IP and is forwarded into the cluster.\nStandard for production external access — each LB Service incurs cloud cost.",
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
                "ClusterIP is the default — assigns a virtual internal IP reachable only within the cluster.\nPods reach it by DNS name (my-service.my-ns.svc.cluster.local).\nNot accessible from outside without Ingress or port-forward.",
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
                "A Service defines a label selector — the Endpoints controller finds matching Pods.\nMatching Pod IPs are added to the Endpoints object automatically.\nkube-proxy routes traffic to one of the healthy endpoints.",
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
                "port = what the Service exposes (e.g., 80). targetPort = what the container listens on (e.g., 8080).\nThey can differ — expose as port 80, container listens on 8080.\nThe Service translates between port and targetPort automatically.",
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
                "CoreDNS runs as a Pod and provides internal cluster DNS.\nEvery Service automatically gets a DNS name (service.namespace.svc.cluster.local).\nEnables Pods to find Services by name instead of IP.",
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
                "Ingress is an HTTP/HTTPS router — routes /api to one Service, /web to another.\nOne entry point for multiple Services instead of a LoadBalancer per Service.\nRequires an Ingress Controller (e.g., nginx) to enforce the routing rules.",
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
                "NetworkPolicy is a Pod-level firewall — by default, all Pods can talk to all Pods.\nControls ingress (who can reach a Pod) and egress (where a Pod can send).\nOnly works with a CNI that enforces it (Calico, Cilium) — not Flannel.",
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
                "FQDN מלא: service.namespace.svc.cluster.local.\nCoreDNS מפנה שמות אלו ל-ClusterIP. באותו Namespace — שם קצר מספיק.\napi.prod עובד מ-Namespace אחר, אבל api.prod.svc.cluster.local הוא ה-FQDN.",
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
                "Ingress מנהל ניתוב HTTP/S חכם (לפי host/path) דרך כניסה אחת.\nבמקום LoadBalancer נפרד לכל Service, Ingress מנתב מ-IP אחד.\nתומך ב-TLS termination במקום אחד — חוסך עלויות cloud.",
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
                "מגדירים Secret מסוג kubernetes.io/tls עם tls.crt ו-tls.key.\nמפנים ל-Secret ב-Ingress spec.tls עם שמות ה-hosts.\nה-Ingress Controller מבצע TLS termination אוטומטית.",
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
                "ניתוב לפי path: /api → service-api, /web → service-web ב-Ingress אחד.\nכל URL path מופנה ל-Service אחר לפי כללי ניתוב.\nמספר Services חולקים דומיין אחד.",
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
                "Egress NetworkPolicy מגדיר לאילו יעדים Pod מורשה לשלוח תנועה.\nעם policyTypes: [Egress], כל יציאה שלא מורשת — חסומה.\nחובה לאפשר port 53 (DNS), אחרת name resolution נכשל.",
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
                "כל rule ב-Ingress מכיל שדה host שמגדיר hostname ספציפי.\napi.example.com → Service אחד, web.example.com → Service אחר.\nIngress אחד יכול לשרת מספר דומיינים.",
            },
            {
              q: "מה ההבדל בין ExternalTrafficPolicy: Local לבין ExternalTrafficPolicy: Cluster ב-Kubernetes Service?",
              options: [
              "Local מעביר תנועה רק ל-Pods שרצים על אותו Node ושומר על ה-IP המקורי של הלקוח; Cluster יכול להעביר תנועה לכל Pod ב-cluster ומבצע SNAT",
              "Local מהיר יותר תמיד כי הוא מדלג לחלוטין על kube-proxy",
              "Cluster מיועד לשימוש בענן בלבד, Local מיועד רק ל-on-premise deployments",
              "אין הבדל מעשי בין השניים – זה רק שם אחר לאותו מנגנון ב-kube-proxy",
              ],
              answer: 0,
              explanation:
                "Local שולח traffic רק ל-Pods על אותו Node ושומר על IP הלקוח. Cluster (ברירת מחדל) שולח לכל Pod ומבצע SNAT.\nLocal = שומר client IP, אבל Nodes ללא Pods לא מקבלים traffic.\nבחר Local כשצריך לזהות IP אמיתי של לקוח (logging, rate limiting).",
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
                "kubectl get endpoints מציג Pod IPs שה-Service מנתב אליהם.\nרשימה ריקה = בעיית selector/labels.\nבדוק kubectl get pods --show-labels והשווה ל-selector של ה-Service.",
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
                "Full FQDN: service.namespace.svc.cluster.local.\nCoreDNS resolves this to ClusterIP. Same Namespace → short name works.\nCross-Namespace → use api.prod or full FQDN api.prod.svc.cluster.local.",
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
                "Ingress provides one entry point for multiple Services instead of a LoadBalancer per Service.\nRoutes HTTP/S by path (/api) or hostname (api.example.com) from a single IP.\nSaves cloud LB costs and simplifies DNS management.",
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
                "Create a kubernetes.io/tls Secret with tls.crt and tls.key.\nReference the Secret in Ingress spec.tls with the host names.\nThe Ingress Controller handles TLS termination automatically.",
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
                "Path-based routing: /api → service-api, /web → service-web in one Ingress.\nEach URL path maps to a different backend Service.\nMultiple Services share a single domain.",
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
                "Egress NetworkPolicy controls where a Pod can send traffic.\nWith policyTypes: [Egress], all outbound is blocked unless explicitly allowed.\nAlways allow port 53 (DNS) — without it, name resolution fails entirely.",
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
                "Each Ingress rule has a host field for hostname-based routing.\napi.example.com → one Service, web.example.com → another.\nA single Ingress can serve multiple domains.",
            },
            {
              q: "What is the difference between ExternalTrafficPolicy: Local and ExternalTrafficPolicy: Cluster in a Kubernetes Service?",
              options: [
              "Local routes traffic only to Pods on the same Node and preserves the original client IP; Cluster can forward traffic to any Pod in the cluster and performs SNAT",
              "Local is always faster because it completely bypasses kube-proxy",
              "Cluster is designed for cloud environments only while Local is for on-premises deployments",
              "There is no practical difference between the two — they are just different names for the same kube-proxy mechanism",
              ],
              answer: 0,
              explanation:
                "Local routes traffic only to Pods on the same Node and preserves client IP. Cluster (default) routes to any Pod with SNAT.\nLocal = real client IP visible. Cluster = Node IP visible (SNAT).\nChoose Local for real client IP (logging, rate limiting). Downside: possible load imbalance.",
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
                "kubectl get endpoints shows Pod IPs the Service routes to.\nEmpty list = selector/label mismatch.\nCompare kubectl get pods --show-labels with the Service selector.",
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
                "ללא NetworkPolicy, ברירת המחדל היא allow-all — כל Pod מדבר עם כל Pod.\nברגע שמוסיפים NetworkPolicy ל-Pod, כל traffic שלא מורשה — חסום.\nNetworkPolicy עובד כ-whitelist — רק מה שמוגדר מותר.",
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
                "NetworkPolicy היא רק spec — האכיפה תלויה ב-CNI plugin.\nCalico, Cilium ו-Weave אוכפים. Flannel ו-kubenet — לא.\nב-Flannel, NetworkPolicy נוצרת אבל לא נאכפת — אפס הגנה.",
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
                "IPVS משתמש ב-hash tables במקום iptables chains.\nביצועים טובים יותר כשיש אלפי Services ב-Cluster.\niptables = O(n) linear. IPVS = O(1) hashing.",
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
                "Labels הם case-sensitive — app: App ≠ app: app → Endpoints ריקים.\nלתקן selector ל-app: App כדי שיתאים ל-label.\n• port שגוי — שגיאת חיבור, לא Endpoints ריקים. • Pod לא Ready — לא הבעיה כאן. • Namespace — לא רלוונטי.\nבדוק kubectl get endpoints ו-kubectl get pods --show-labels.",
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
                "Egress policy מאפשרת רק port 443 — DNS (port 53) חסום.\nלהוסיף egress rule ל-port 53 (UDP+TCP) לאפשר DNS.\nכל egress policy חייבת לכלול port 53, אחרת name resolution נכשל.",
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
                "Service קיים אבל selector לא תואם Pods → Endpoints ריקים → 503.\nלתקן selector או labels כך שה-Pods יתאימו ל-Service.\n• Ingress Controller חסר — לא היה מגיב בכלל. • TLS — שגיאת SSL, לא 503. • Namespace — השגיאה היא endpoints ריקים.\n503 + endpoints not found = בעיית selector/labels.",
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
                "FQDN מלא: service.namespace.svc.cluster.local.\napi-svc.backend.cluster.local חסר .svc ולא יפעל.\napi-svc.backend עובד בזכות search domains אבל אינו FQDN.",
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
                "podSelector:{} מאפשר תנועה רק ל-Pods — IPs חיצוניים חסומים.\nלהוסיף egress rule עם ipBlock: {cidr: '0.0.0.0/0'} + port 53 ל-DNS.\npodSelector מכסה רק Pods בתוך ה-Cluster, לא IPs חיצוניים.",
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
                "Without NetworkPolicy, the default is allow-all — every Pod talks to every Pod.\nOnce you apply a NetworkPolicy to a Pod, all non-allowed traffic is blocked.\nNetworkPolicy works as a whitelist — only explicitly allowed traffic passes.",
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
                "NetworkPolicy is just a spec — enforcement depends on the CNI plugin.\nCalico, Cilium, Weave enforce it. Flannel, kubenet do not.\nOn Flannel, NetworkPolicy is created but completely ignored — zero protection.",
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
                "IPVS uses hash tables instead of iptables linear chains.\nMuch better performance with thousands of Services.\niptables = O(n) linear scan. IPVS = O(1) hash lookup.",
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
                "Labels are case-sensitive — app: App ≠ app: app → empty Endpoints.\nChange selector to app: App to match the Pod label.\n• Wrong port — connection error, not empty Endpoints. • Not Ready — different issue. • Namespace — not relevant here.\nAlways verify with kubectl get endpoints and kubectl get pods --show-labels.",
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
                "Egress policy allows only port 443 — DNS (port 53) is blocked.\nAdd egress rule for port 53 (UDP+TCP) to allow DNS resolution.\nEvery egress policy must include port 53, or name resolution fails.",
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
                "Service exists but selector doesn't match any Pods → empty Endpoints → 503.\nAlign Pod labels with the Service selector.\n• No Ingress Controller — no response at all. • TLS — SSL error, not 503. • Namespace — error says empty endpoints.\n503 + \"endpoints not found\" = selector/label mismatch.",
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
                "Full FQDN: service.namespace.svc.cluster.local.\napi-svc.backend.cluster.local is missing .svc and won't resolve.\napi-svc.backend works via search domains but is not a FQDN.",
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
                "podSelector:{} allows traffic only to Pods — external IPs are blocked.\nAdd egress rule with ipBlock: {cidr: '0.0.0.0/0'} + port 53 for DNS.\npodSelector covers only in-cluster Pods, not external IPs.",
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
                "Secret מיועד לנתונים רגישים (סיסמאות, tokens, TLS keys), מאוחסן כ-base64 ב-etcd.\nConfigMap לקונפיגורציה רגילה. Secret למידע רגיש.\nשניהם ניתנים להזרקה כ-env variables או volume.",
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
                "Secrets מקודדים ב-base64 בלבד — לא מוצפנים!\nbase64 הוא encoding, לא הצפנה — כל אחד יכול לפענח.\nלאבטחה אמיתית: Encryption at Rest, Sealed Secrets, או external manager.",
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
                "ConfigMap נצרך כ-env variables (envFrom) או כ-volume files (volumeMounts).\nשתי הדרכים מאפשרות ל-Pod לגשת לנתוני קונפיגורציה.\nשינוי ב-volume מתעדכן אוטומטית; שינוי ב-env מצריך restart.",
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
                "ServiceAccount הוא זהות ל-Pod — כל Namespace מכיל default שמוקצה אוטומטית.\nPods שלא מציינים ServiceAccount מקבלים את default.\nbest practice — ליצור ServiceAccount ייעודי עם הרשאות מינימליות.",
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
                "RBAC = Role Based Access Control — מנגנון הרשאות ב-Kubernetes.\nשלושה מרכיבים: Roles (מה מותר), Subjects (מי מורשה), Bindings (מחברים ביניהם).\nמאפשר שליטה מדויקת — למשל לצפות ב-Pods אך לא למחוק.",
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
                "LimitRange מגדיר ברירות מחדל ומגבלות CPU/Memory per-container ב-Namespace.\nמזריק default values ואוכף min/max אם container לא מציין requests/limits.\nללא LimitRange, Pod בודד יכול לצרוך את כל משאבי ה-Node.",
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
                "runAsNonRoot: true מונע הפעלת קונטיינר כ-root (UID 0).\nroot בקונטיינר + container escape = גישת root על ה-Node.\nמצמצם blast radius — Kubernetes ידחה קונטיינר שמוגדר לרוץ כ-root.",
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
                "requests = מינימום שה-Scheduler מבטיח. limits = מקסימום שהקונטיינר יכול לצרוך.\nNode נבחר רק אם יש מספיק resources פנויים עבור requests.\nחריגת memory limit = OOMKill. חריגת CPU limit = throttling.",
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
                "Secret is for sensitive data (passwords, tokens, TLS keys), stored as base64 in etcd.\nConfigMap for regular config. Secret for sensitive data.\nBoth can be injected as env variables or volume files.",
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
                "Secrets are only base64-encoded by default — not encrypted!\nbase64 is encoding, not encryption — anyone can decode it.\nFor real security: Encryption at Rest, Sealed Secrets, or external secrets manager.",
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
                "ConfigMap is consumed as env variables (envFrom) or volume files (volumeMounts).\nBoth methods let the Pod access configuration data.\nVolume changes auto-update (with delay); env changes need Pod restart.",
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
                "ServiceAccount is a Pod identity — every Namespace has 'default' assigned automatically.\nPods that don't specify a ServiceAccount get the default one.\nBest practice — create dedicated ServiceAccounts with minimal permissions.",
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
                "RBAC = Role Based Access Control — Kubernetes' permission system.\nThree building blocks: Roles (what's allowed), Subjects (who), Bindings (connect them).\nEnables fine-grained control — e.g., view Pods but not delete them.",
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
                "LimitRange sets default and max CPU/Memory per container in a Namespace.\nAuto-injects defaults and enforces min/max if containers don't specify them.\nWithout LimitRange, a single Pod can consume all Node resources.",
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
                "runAsNonRoot: true prevents the container from running as root (UID 0).\nRoot in container + container escape = root access on the Node.\nReduces blast radius — Kubernetes rejects containers configured to run as root.",
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
                "requests = minimum the Scheduler guarantees. limits = maximum the container can use.\nNode is chosen only if it has enough free resources for the requests.\nExceed memory limit = OOMKill. Exceed CPU limit = throttling only.",
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
                "Role מוגבל ל-Namespace ספציפי. ClusterRole חל על כל ה-Cluster.\nRole ב-prod לא מעניק גישה ב-staging. ClusterRole כולל Nodes, PVs ועוד.\nניתן לקשור ClusterRole ל-Namespace בודד עם RoleBinding.",
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
                "RoleBinding קושר Role ל-subject (User, Group, או ServiceAccount) ב-Namespace.\nללא RoleBinding, ה-Role לא נאכף על אף ישות.\nלגישה ברמת Cluster — ClusterRoleBinding.",
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
                "ServiceAccount הוא זהות מכונה עבור Pods — לא למשתמשים אנושיים.\nKubernetes מזריק token אוטומטית ל-Pod לאימות מול API server.\nלכל Namespace יש ServiceAccount בשם default.",
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
                "PSA הוא controller מובנה שאוכף Pod Security Standards לפני ש-Pods מורשים לרוץ.\nמפעילים ע\"י label על Namespace — Kubernetes דוחה Pods שלא עומדים ברמה.\nמחליף את PodSecurityPolicy שהוסר ב-v1.25.",
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
                "Admission webhook מיירט בקשות ל-API server לפני שמירה ב-etcd.\nValidating — דוחה resources לא תקינים. Mutating — משנה resources לפני שמירה.\nכלים כמו OPA Gatekeeper ו-Kyverno עובדים כ-admission webhooks.",
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
                "LimitRange = per-container defaults ומגבלות. ResourceQuota = מגבלות aggregate ל-Namespace.\nLimitRange מגן מ-container בודד. ResourceQuota מגן מצריכה כוללת.\nLimitRange = מיקרו. ResourceQuota = מאקרו.",
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
                "seccomp מגביל אילו system calls קונטיינר יכול לבצע.\nLinux מציע 300+ syscalls, אבל רוב הקונטיינרים צריכים רק חלק קטן.\nseccompProfile.type: RuntimeDefault מיישם baseline מומלץ — מצמצם attack surface.",
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
                "ESO מסנכרן secrets מ-AWS/GCP/Vault אל K8s Secrets אוטומטית.\nSecretStore = חיבור ל-provider. ExternalSecret = מה לסנכרן.\nSecrets לא מנוהלים ידנית ולא נשמרים ב-git.",
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
                "Role is Namespace-scoped. ClusterRole applies cluster-wide.\nRole in prod grants no access in staging. ClusterRole covers Nodes, PVs, etc.\nClusterRole can be bound to a single Namespace via RoleBinding.",
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
                "RoleBinding connects a Role to a subject (User, Group, or ServiceAccount) in a Namespace.\nWithout RoleBinding, a Role has no effect on any identity.\nFor cluster-wide access, use ClusterRoleBinding.",
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
                "ServiceAccount is a machine identity for Pods — not for human users.\nKubernetes auto-mounts a token for Pod-to-API authentication.\nRBAC controls what actions the ServiceAccount can perform.",
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
                "PSA is a built-in controller enforcing Pod Security Standards before Pods can run.\nActivated via Namespace label — Kubernetes rejects non-compliant Pods.\nReplaced PodSecurityPolicy (removed v1.25). Levels: privileged/baseline/restricted.",
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
                "Admission webhook intercepts API requests before changes are saved to etcd.\nValidating — rejects invalid resources. Mutating — modifies resources before saving.\nTools like OPA Gatekeeper and Kyverno work as admission webhooks.",
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
                "LimitRange = per-container defaults and limits. ResourceQuota = aggregate limits for the Namespace.\nLimitRange protects from one container. ResourceQuota protects from total consumption.\nLimitRange = micro level. ResourceQuota = macro level.",
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
                "seccomp restricts which system calls a container can make.\nLinux has 300+ syscalls but most containers need only a small subset.\nseccompProfile.type: RuntimeDefault applies the recommended baseline — reduces attack surface.",
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
                "ESO syncs secrets from AWS/GCP/Vault into K8s Secrets automatically.\nSecretStore = provider connection. ExternalSecret = what to sync.\nSecrets never managed manually or stored in git.",
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
                "כל ישות מקבלת רק את ההרשאות שהיא צריכה — לא יותר.\nלא לתת cluster-admin כשמספיק Role ב-Namespace אחד.\nאם ישות נפרצת, הרשאות מינימליות מגבילות את הנזק.",
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
                "Secrets מאוחסנים ב-etcd כ-base64 — לא מוצפנים כברירת מחדל.\nEncryption at Rest מפעיל AES-GCM לפני שמירה ב-etcd.\nגם מי שגונב את מסד ה-etcd לא יוכל לקרוא את ה-Secrets.",
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
                "Sealed Secrets מצפין Secret ל-SealedSecret עם המפתח הציבורי של ה-Cluster.\nה-SealedSecret המוצפן בטוח לשמירה ב-git — רק ה-controller עם המפתח הפרטי מפענח.\nSealedSecret מ-Cluster A לא ניתן לפענוח ב-Cluster B.",
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
                "privileged — ללא הגבלות. baseline — חוסם שימושים מסוכנים (hostPID, privileged). restricted — הכי מחמירה.\nשלוש הרמות מסודרות מהכי פתוחה לסגורה ביותר.\nrestricted דורשת runAsNonRoot, drop ALL capabilities, ו-seccomp — best practice ל-production.",
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
                "OPA Gatekeeper הוא admission webhook שאוכף policies מותאמות על כל resource ב-Cluster.\nPolicies נכתבות ב-Rego ומאפשרות כללים שרירותיים — בניגוד ל-PSA עם רמות קבועות.\nKyverno הוא אלטרנטיבה עם תחביר YAML במקום Rego.",
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
                "ל-my-sa אין הרשאת list pods ב-namespace prod — RBAC חוסם.\nליצור Role עם הרשאת list pods ו-RoleBinding שמקשר ל-my-sa.\n• מחיקת SA לא פותרת חוסר הרשאות • cluster-admin סיכון אבטחי • default SA גם ללא הרשאות.\nב-RBAC כל גישה חייבת Role + RoleBinding מפורשים.",
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
                "Kyverno admission webhook חוסם images שלא מ-gcr.io/ — policy-as-code.\nלשנות את ה-image למקור מ-gcr.io/ או לעדכן את ה-policy.\n• API crash = לא הייתה הודעת שגיאה • RBAC = \"forbidden\" לא \"webhook denied\" • Namespace missing = שגיאה אחרת.\nAdmission webhook רץ לפני שמירה ב-etcd ויכול לחסום כל create/update.",
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
                "restricted PSA דורשת הגדרות אבטחה מפורשות בכל container.\nחובה להוסיף allowPrivilegeEscalation: false, runAsNonRoot: true, ו-seccompProfile.\nprivileged: true הוא ההפך — יחמיר את הבעיה במקום לפתור.",
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
                "Every entity gets only the exact permissions it needs — nothing more.\nPrefer a scoped Role in one Namespace over cluster-admin.\nIf compromised, minimal permissions limit the blast radius.",
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
                "Secrets are stored in etcd as base64 — not encrypted by default.\nEncryption at Rest adds AES-GCM encryption before writing to etcd disk.\nEven if an attacker exfiltrates etcd data, Secrets remain unreadable without the encryption key.",
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
                "Sealed Secrets encrypts a Secret into a SealedSecret using the cluster's public key.\nThe SealedSecret is safe to commit to git — only the cluster's controller can decrypt it.\nA SealedSecret from Cluster A cannot be decrypted by Cluster B.",
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
                "privileged — no restrictions. baseline — blocks dangerous practices (hostPID, privileged). restricted — strictest.\nThe three levels go from most permissive to most secure.\nrestricted requires runAsNonRoot, drop ALL capabilities, and seccomp — production best practice.",
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
                "OPA Gatekeeper is an admission webhook that enforces custom policies on every resource.\nPolicies are written in Rego and allow arbitrary rules — unlike PSA's fixed levels.\nKyverno is an alternative with YAML-based policy syntax instead of Rego.",
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
                "my-sa lacks list pods permission in namespace prod — RBAC blocks the request.\nCreate a Role with list pods permission and a RoleBinding to my-sa.\n• Deleting SA doesn't fix missing permissions • cluster-admin is a security risk • default SA also has no permissions.\nIn RBAC, every API access requires explicit Role + RoleBinding.",
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
                "Kyverno admission webhook blocks images not from gcr.io/ — policy-as-code enforcement.\nChange the image to one from gcr.io/ or update the Kyverno policy.\n• API crash = no structured error message • RBAC = \"forbidden\" not \"webhook denied\" • Missing namespace = different error.\nAdmission webhooks run before etcd save and can block any create/update request.",
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
                "restricted PSA mandates explicit security hardening in every container.\nMust set allowPrivilegeEscalation: false, runAsNonRoot: true, and seccompProfile.\nprivileged: true is the opposite — it would further violate the policy.",
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
                "PV הוא יחידת אחסון שה-admin מגדיר — גודל, access modes, ו-storage backend.\nPVC היא הבקשה של ה-Pod לאחסון.\nKubernetes מחבר אוטומטית PVC ל-PV שמתאים לדרישות.",
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
                "RWO מאפשר mount לקריאה וכתיבה מ-Node אחד בלבד — מתאים לרוב ה-databases.\nRWX מאפשר כמה Nodes במקביל (דורש NFS/EFS).\nROX — קריאה בלבד ממספר Nodes.",
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
                "Helm הוא package manager ל-Kubernetes — כמו apt או npm.\nChart הוא חבילה של YAML templates עם ערכי ברירת מחדל ב-values.yaml.\nבמקום לנהל עשרות קבצי YAML, מתקינים Chart אחד ומגדירים עם values.",
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
                "helm install מתקין Chart ויוצר Release שנשמר כ-Secret ב-Cluster.\nאפשר לעקוף ערכים עם --set key=value או -f myvalues.yaml.\nHelm עוקב אחרי כל Release לניהול upgrades ו-rollbacks.",
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
                "emptyDir נוצר ריק כש-Pod מתזמן ל-Node ונמחק לחלוטין עם ה-Pod.\nשימוש נפוץ: שיתוף קבצים זמניים בין קונטיינרים באותו Pod.\nאפשר להגדיר medium: Memory ליצירת tmpfs ב-RAM.",
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
                "StorageClass מגדיר ל-Kubernetes כיצד ליצור דיסקים באופן דינמי.\nכולל provisioner (כמו aws-ebs), reclaim policy, וסוג דיסק.\nכש-PVC מציין storageClassName, נוצר PV ודיסק אמיתי אוטומטית.",
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
                "emptyDir שורד restarts של קונטיינרים בתוך אותו Pod.\nברגע שה-Pod נמחק או מועבר ל-Node אחר — הנתונים נמחקים לחלוטין.",
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
                "values.yaml מכיל ברירות מחדל לכל ה-template variables של Chart.\nאפשר לעקוף ערכים עם --set key=value או להחליף קובץ עם -f my-values.yaml.\nכך Chart אחד משרת סביבות שונות (dev, staging, production).",
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
                "PV is a piece of real storage provisioned in the cluster (EBS, NFS, local drive).\nPVC is a request from a Pod asking for storage with specific access requirements.\nKubernetes automatically matches a PVC to a suitable PV.",
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
                "RWO allows read/write mount from a single Node at a time — suitable for most databases.\nRWX allows multiple Nodes simultaneously (requires NFS or EFS).\nROX — read-only access from multiple Nodes.",
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
                "Helm is Kubernetes' package manager — like apt or npm.\nA Chart bundles YAML templates with configurable defaults in values.yaml.\nInstead of managing dozens of YAML files, install one Chart and configure with values.",
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
                "helm install creates a Release stored as a Secret in the cluster.\nOverride values with --set key=value or -f myvalues.yaml.\nHelm tracks each Release for managing upgrades and rollbacks.",
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
                "emptyDir is created empty when a Pod is scheduled and deleted entirely with the Pod.\nCommon use: sharing temporary files between containers in the same Pod.\nSet medium: Memory to create a RAM-backed tmpfs for higher performance.",
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
                "StorageClass tells Kubernetes how to create storage on demand.\nIt names a provisioner (e.g., AWS EBS, GCP PD) that creates real disks automatically.\nWhen a PVC references a StorageClass, a PV and disk are created without manual admin work.",
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
                "emptyDir survives container restarts within the same Pod.\nOnce the Pod is deleted or rescheduled to another Node, the data is gone permanently.",
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
                "values.yaml contains default values for all Chart template variables.\nOverride with --set key=value or supply a different file with -f my-values.yaml.\nOne Chart can serve multiple environments (dev, staging, production) with different values.",
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
                "כש-PVC נוצר עם StorageClass, ה-provisioner יוצר PV ודיסק אמיתי אוטומטית.\nללא Dynamic Provisioning, admin חייב ליצור כל PV ידנית — לא סקיילבילי.\nזו הגישה הסטנדרטית בכל Cluster ענן.",
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
                "כשה-PVC נמחק, גם ה-PV והדיסק הפיזי (EBS, GCP PD) נמחקים אוטומטית.\nמתאים ל-non-persistent workloads.\nRetain לעומת זאת משמר את הנתונים גם אחרי מחיקת ה-PVC.",
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
                "--set key=value עוקף ערכים מ-values.yaml בזמן install/upgrade.\nלשינויים מרובים עדיף --values (-f) עם קובץ YAML מותאם.\nערכי --set עוקפים ערכי -f.",
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
                "ה-StorageClass חייב להגדיר allowVolumeExpansion: true.\nאז מגדילים spec.resources.requests.storage ב-PVC וה-provisioner מרחיב את הדיסק.\nהקטנה לא נתמכת, ובחלק מה-backends נדרש Pod restart.",
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
                "helm template מרנדר Chart ל-YAML גולמי בלי להתקין שום דבר ב-Cluster.\nשימושי ל-CI/CD pipelines, debug, ו-GitOps שדורש YAML מפורש ב-git.",
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
                "helm rollback מחזיר Release ל-revision ספציפי מתוך ההיסטוריה.\nהרצת helm history מציגה את כל ה-revisions עם תאריכים וסטטוסים.\nrollback הוא למעשה upgrade חדש עם manifests ישנים — נוצר revision חדש.",
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
                "PVC Pending = לא נמצא PV מתאים.\nהרצת kubectl describe pvc תראה מה חסר.\nסיבות נפוצות: StorageClass לא קיים, AccessMode לא תואם, או capacity לא מספיק.",
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
                "K8s מחבר PVC ל-PV לפי storageClassName, accessModes, ו-capacity (PV >= PVC).\nלאחר binding הם קשורים עד שאחד נמחק.",
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
                "When a PVC references a StorageClass, the provisioner creates a PV and real disk automatically.\nWithout Dynamic Provisioning, an admin must create every PV manually — doesn't scale.\nThis is the standard approach in all cloud-hosted Kubernetes clusters.",
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
                "When the PVC is deleted, both the PV and the physical disk (EBS, GCP PD) are deleted automatically.\nThis is the default for dynamically provisioned volumes — convenient but destroys all data.\nFor databases, use Retain instead to preserve data after PVC deletion.",
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
                "--set key=value overrides values from values.yaml at install/upgrade time.\nFor multiple overrides, use --values (-f) with a custom YAML file.\nValues from --set take precedence over -f files.",
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
                "The StorageClass must have allowVolumeExpansion: true.\nThen increase spec.resources.requests.storage in the PVC and the provisioner resizes the disk.\nShrinking is not supported, and some backends require a Pod restart.",
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
                "helm template renders a Chart to raw YAML without installing anything to the cluster.\nUseful for CI/CD pipelines, debugging, and GitOps workflows that need explicit YAML in git.",
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
                "helm rollback reverts a Release to a specific revision from its history.\nhelm history lists all revisions with timestamps and statuses.\nA rollback is technically a new upgrade using old manifests — it creates a new revision number.",
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
                "PVC Pending means no matching PV was found.\nRun kubectl describe pvc to see what's missing.\nCommon causes: StorageClass doesn't exist, AccessMode mismatch, or insufficient capacity.",
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
                "K8s binds a PVC to a PV by matching storageClassName, accessModes, and capacity (PV >= PVC).\nAfter binding they are locked together until one is deleted.",
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
                "CSI הוא סטנדרט פתוח שמאפשר ל-vendors לכתוב storage drivers עבור Kubernetes.\nכל vendor שולח CSI driver משלו (AWS EBS, Azure Disk, Ceph) כ-DaemonSet ב-Cluster.\nזה מאפשר עדכונים ללא תלות בגרסת Kubernetes.",
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
                "Hooks הם Jobs שרצים בשלבי מחזור חיים של Release — pre-install, post-upgrade, pre-delete ועוד.\nשימושים נפוצים: DB migrations לפני upgrade, או התראת Slack אחרי deploy.",
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
                "VolumeSnapshot יוצר גיבוי נקודתי של PersistentVolume.\nאפשר לשחזר ממנו PVC חדש — שימושי לפני upgrade של DB.\nדורש CSI driver עם תמיכת snapshot ו-snapshot-controller.",
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
                "volumeClaimTemplates יוצר PVC ייחודי לכל Pod — Pod-0 מקבל data-myapp-0 וכן הלאה.\nכל PVC נשאר קשור ל-Pod שלו גם אחרי restart — כך databases שומרים נתונים.\nscale down לא מוחק PVCs; scale up מקשר PVCs ישנים מחדש.",
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
                "Immediate יוצר PV מיד — אך הוא עלול להיווצר ב-Zone שונה מה-Pod.\nWaitForFirstConsumer מעכב יצירת PV עד שה-Pod מתזמן ל-Node, ויוצר PV באותה Zone.\nקריטי בסביבות multi-AZ כמו AWS EKS.",
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
                "ה-PVC מפנה ל-StorageClass בשם fast-ssd שלא קיים ב-Cluster.\nללא StorageClass, ה-provisioner לא יודע ליצור PV — הריצו kubectl get storageclass לראות מה קיים.\n• PVC גדול מדי = שגיאה על capacity • Node מלא = לא קשור ל-provisioning • Namespace שונה = שגיאה אחרת.",
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
                "כש-helm upgrade נכשל, resources עלולים להיות במצב לא עקבי.\nhelm rollback מחזיר הכל ל-revision תקין — הריצו helm history קודם לראות מספרי revision.\nupgrade נוסף ללא rollback עלול להחמיר את המצב.",
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
                "EBS Volumes הם single-AZ — אפשר לחבר רק ל-Node באותה Availability Zone.\nה-PVC מראה Bound כי ה-PV קיים, אבל ה-attach נכשל כי ה-Node ב-AZ אחרת.\nהפתרון: StorageClass עם volumeBindingMode: WaitForFirstConsumer שמבטיח PV באותה AZ כמו ה-Pod.",
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
                "CSI is an open standard for writing storage drivers for Kubernetes.\nEach vendor ships their own CSI driver (AWS EBS, Ceph, etc.) as a DaemonSet in the cluster.\nThis lets vendors update drivers independently of Kubernetes releases.",
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
                "Hooks are Jobs that run at specific Release lifecycle points — pre-install, post-upgrade, pre-delete, etc.\nCommon uses: DB migrations before upgrade, or Slack notifications after deploy.",
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
                "VolumeSnapshot creates a point-in-time copy of a PersistentVolume's data.\nYou can restore a new PVC from it — useful before risky DB migrations.\nRequires a snapshot-controller and a CSI driver with snapshot support.",
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
                "volumeClaimTemplates creates a unique PVC per Pod — Pod-0 gets data-myapp-0 and so on.\nEach PVC stays bound to its Pod across restarts — how databases keep persistent data.\nScaling down doesn't delete PVCs; scaling up reconnects the existing ones.",
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
                "Immediate creates a PV right away — but it might end up in a different Zone than the Pod.\nWaitForFirstConsumer delays PV creation until the Pod is scheduled, then creates it in the same Zone.\nCritical in multi-AZ environments like AWS EKS.",
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
                "The PVC references a StorageClass named fast-ssd that doesn't exist in the Cluster.\nWithout a valid StorageClass, the provisioner can't create a PV — run kubectl get storageclass to check.\n• Too large = capacity error • Node full = unrelated to provisioning • Different namespace = different error.",
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
                "When helm upgrade fails midway, resources may be in an inconsistent state.\nhelm rollback restores everything to a known good revision — run helm history first.\nAnother upgrade without rollback risks making things worse.",
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
                "EBS Volumes are single-AZ — they can only attach to a Node in the same Availability Zone.\nThe PVC shows Bound because the PV exists, but the attach fails since the Node is in a different AZ.\nFix: Use a StorageClass with volumeBindingMode: WaitForFirstConsumer to ensure the PV is in the Pod's AZ.",
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
                "kubectl describe pod מציג events, conditions, ומידע מפורט.\nה-Events בתחתית הפלט הם לרוב הסיבה הישירה לבעיה.",
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
                "kubectl logs מציג את ה-stdout/stderr של הקונטיינר.\nהמקום הראשון לחפש שגיאות אפליקציה כשה-Pod רץ.\nהוסף --follow לעקוב בזמן אמת.",
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
                "מציג את כל האירועים ב-Namespace הנוכחי — scheduling, image pull, probe failures.\nEvents מגיעים מ-Kubernetes עצמו, בניגוד ל-logs שמגיעים מהאפליקציה.\nהוסף --sort-by=.metadata.creationTimestamp לסדר לפי זמן.",
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
                "Running = תהליך הקונטיינר עלה. Ready = עבר readiness probe ומוכן לקבל traffic.\nPod שהוא Running אבל נכשל ב-readiness probe יוצג כ-0/1 Ready ויוסר מה-Service.\nזה מונע שליחת traffic ל-Pod שטרם סיים לעלות.",
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
                "כשקונטיינר קורס, Kubernetes מפעיל instance חדש שה-logs שלו כמעט ריקים.\n--previous שולף logs מה-instance שקרס — בדיוק מה שצריך לאבחון.",
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
                "מציג צריכת CPU ו-Memory בזמן אמת של כל Node, כולל אחוז ניצול.\nדורש metrics-server מותקן ב-Cluster.\nkubectl top pods מציג את אותו מידע ברמת Pod.",
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
                "kubectl get --raw='/healthz' מחזיר ok אם ה-API server בריא.\ncomponentstatuses הוסרה ב-K8s 1.26 — השתמשו ב-/healthz, /readyz, /livez במקום.",
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
                "מציג את כל ה-contexts ב-kubeconfig — כל context מכיל cluster, user, ו-namespace.\nהנוכחי מסומן בכוכבית (*). use-context מחליף context, set-context משנה namespace.",
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
                "kubectl describe pod shows events, conditions, and detailed info.\nThe Events section at the bottom usually reveals the direct cause of the problem.",
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
                "kubectl logs shows the container's stdout/stderr.\nFirst place to look for application errors while the Pod is running.\nUse --follow to stream logs in real time.",
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
                "Lists all events in the current Namespace — scheduling, image pulls, probe failures.\nEvents come from Kubernetes itself, unlike logs which come from your app.\nAdd --sort-by=.metadata.creationTimestamp to see the most recent first.",
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
                "Running = the container process started. Ready = passed readiness probe and can receive traffic.\nA Pod that's Running but failing readiness shows 0/1 Ready and is removed from the Service.\nThis prevents traffic hitting a Pod that hasn't finished starting up.",
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
                "When a container crashes, Kubernetes starts a new instance whose logs may be nearly empty.\n--previous fetches logs from the crashed run — exactly what you need to diagnose the cause.",
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
                "Shows real-time CPU and Memory consumption for every Node, including utilization percentage.\nRequires metrics-server installed in the cluster.\nkubectl top pods shows the same at Pod level.",
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
                "kubectl get --raw='/healthz' returns 'ok' if the API server is healthy.\ncomponentstatuses was removed in K8s 1.26 — use /healthz, /readyz, /livez instead.",
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
                "Lists all contexts in kubeconfig — each bundles a cluster, user, and default namespace.\nCurrent context is marked with *. use-context switches context, set-context changes namespace.",
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
                "הקונטיינר עולה, קורס מיד, ו-Kubernetes מנסה שוב עם המתנה גוברת.\nהריצו kubectl logs --previous לראות את ה-logs מה-crash האחרון.",
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
                "Kubernetes לא מצליח להוריד את ה-image ומחכה יותר ויותר בין ניסיונות.\nשתי הסיבות הנפוצות: שגיאה בשם ה-image/tag, או חוסר imagePullSecrets ל-registry פרטי.",
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
                "הקונטיינר חרג מ-limits.memory וה-Linux kernel ממית אותו עם exit code 137.\nהגדילו limits.memory, או בדקו memory leak עם kubectl top pod.",
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
                "ה-CPU request של ה-Pod גדול מה-capacity הפנוי בכל Node.\nהקטינו requests.cpu לפי actual usage, או הוסיפו Nodes עם capacity פנוי.",
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
                "כשה-probe נכשל failureThreshold פעמים ברציפות, Kubernetes ממית ומפעיל מחדש את הקונטיינר.\nreadiness probe לעומת זאת רק מסיר מה-Service Endpoints — ללא restart.",
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
                "שלב נורמלי, אבל כשנמשך זמן רב מציין בעיה.\nסיבות נפוצות: PVC לא Bound, Secret/ConfigMap חסר, image גדול, או בעיה ב-CNI.",
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
                "Finalizer מונע מחיקה עד ש-controller חיצוני מנקה אותו — אפילו --force לא עוזר.\nכשה-controller לא זמין, ה-Pod תקוע.\nפתרון: kubectl patch pod my-pod -p '{\"metadata\":{\"finalizers\":null}}' מסיר finalizers ידנית.",
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
                "kubelet מזהה שה-disk מגיע לסף מלאות.\nסיבות נפוצות: logs שהצטברו, images ישנים, ו-emptyDir volumes גדולים.\nנקו עם docker image prune ו-journalctl --vacuum-time=2d, או הרחיבו את ה-disk.",
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
                "The container starts, crashes immediately, and Kubernetes retries with increasing back-off delay.\nRun kubectl logs --previous to see the logs from the last crash.",
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
                "Kubernetes failed to pull the image and waits with increasing delay before retrying.\nTwo most common causes: typo in image name/tag, or missing imagePullSecrets for a private registry.",
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
                "The container exceeded limits.memory and the Linux kernel killed it with exit code 137.\nIncrease limits.memory, or use kubectl top pod to identify a memory leak.",
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
                "The Pod's CPU request is larger than available capacity on any Node.\nLower requests.cpu to actual usage (check with kubectl top pods), or add more Nodes.",
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
                "When the probe fails failureThreshold times consecutively, Kubernetes kills and restarts the container.\nA readiness probe failure only removes the Pod from Service Endpoints — no restart.",
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
                "Normal briefly, but when prolonged it indicates a blocker.\nCommon causes: PVC still Pending, missing Secret/ConfigMap, large image downloading, or CNI failure.",
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
                "A finalizer blocks deletion until an external controller clears it — even --force can't bypass it.\nIf the controller is unavailable, the Pod stays stuck.\nFix: kubectl patch pod my-pod -p '{\"metadata\":{\"finalizers\":null}}' removes finalizers manually.",
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
                "kubelet sets DiskPressure when the Node disk crosses a usage threshold.\nCommon culprits: accumulated logs, stale images, and large emptyDir volumes.\nClean up with docker image prune and journalctl --vacuum-time=2d, or expand the disk.",
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
                "לפני rollback חשוב להבין מה השתנה.\nlogs --previous מציג output מה-crash, ו-describe pod מציג Events.\nרק אחרי שמבינים את הסיבה — מחליטים לתקן code או לעשות rollout undo.",
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
                "describe node מציג Conditions ו-Events — המקום הראשון לחפש.\nSSH ל-Node ו-systemctl status kubelet לוודא שרץ.\nסיבות נפוצות: kubelet נפל, TLS cert פג, או disk/memory pressure.",
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
                "מפנה Pods מ-Node בצורה graceful ומסמן אותו כ-unschedulable.\nמכבד PodDisruptionBudgets ומחכה שה-Pods יעלו במקום אחר.\nמשתמשים לפני upgrade, reboot, או decommissioning.",
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
                "nslookup kubernetes.default מתוך Pod מוודא ש-CoreDNS מגיב.\nאם נכשל — בדקו שה-CoreDNS Pods רצים ב-kube-system.\nkubectl logs <coredns-pod> -n kube-system יחשוף שגיאות.",
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
                "etcdctl snapshot save יוצר snapshot מלא של etcd — כל מצב ה-Cluster.\nחובה לציין --endpoints, --cacert, --cert, ו--key לאימות.\nזהו הכלי הראשי ל-Disaster Recovery.",
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
                "קוד 404 אומר שה-path ב-livenessProbe.httpGet.path לא קיים באפליקציה — ה-Pod רץ ומגיב.\nבדקו איזה endpoint health האפליקציה חושפת (/health, /ping, /livez) ועדכנו.\n• DNS לא קשור (probe רץ ישירות ל-Pod IP) • image נכון (404 = שרת עונה) • RBAC לא משפיע על probes.",
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
                "Kubernetes לא יכול לקרוא logs מ-container שלא רץ.\nבדקו סטטוס עם kubectl get pod — אם CrashLoopBackOff השתמשו ב---previous.\nאם Init:Error — בדקו logs של ה-init container עם -c <init-name>.",
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
                "ב-Cluster חדש, NotReady כמעט תמיד אומר ש-CNI plugin לא הותקן.\nKubernetes דורש CNI כדי להגדיר networking ל-Pods — בלעדיו Node לא יהיה Ready.\nהתקינו CNI (Calico/Flannel/Cilium) וה-Node יעבור ל-Ready.",
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
                "Before rollback, understand what changed.\nlogs --previous shows the crash output, describe pod shows the Events timeline.\nOnly after understanding the cause — decide to fix code or run rollout undo.",
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
                "describe node shows Conditions and Events — the first place to look.\nSSH in and run systemctl status kubelet to check if it's running.\nCommon causes: kubelet crashed, TLS cert expired, or disk/memory pressure.",
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
                "Gracefully evicts all Pods from a Node and marks it as unschedulable.\nHonors PodDisruptionBudgets and waits for Pods to come up elsewhere.\nUsed before upgrades, reboots, or decommissioning.",
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
                "nslookup kubernetes.default from inside a Pod verifies CoreDNS is responding.\nIf it fails, check that CoreDNS Pods are Running in kube-system.\nkubectl logs <coredns-pod> -n kube-system will reveal errors.",
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
                "etcdctl snapshot save creates a full snapshot of etcd — the entire cluster state.\nMust provide --endpoints, --cacert, --cert, and --key for authentication.\nThis is the standard backup method for disaster recovery.",
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
                "A 404 means the path in livenessProbe.httpGet.path doesn't exist in the app — the Pod is running and responding.\nCheck which health endpoint the app exposes (/health, /ping, /livez) and update the spec.\n• DNS unrelated (probe runs directly to Pod IP) • Image is correct (404 = server responds) • RBAC doesn't affect probes.",
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
                "Kubernetes can't stream logs from a container that isn't running.\nCheck status with kubectl get pod — if CrashLoopBackOff, use --previous.\nIf Init:Error, check init container logs with -c <init-name>.",
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
                "On a fresh cluster, NotReady almost always means the CNI plugin hasn't been installed.\nKubernetes requires CNI for Pod networking — without it, the Node can't become Ready.\nInstall a CNI plugin (Calico/Flannel/Cilium) and the Node will transition to Ready.",
            },
        ],
      },
    },
  },
];
