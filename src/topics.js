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
        theory: `Pods ו-Deployments הם ליבת Kubernetes.\n🔹 Pod – יחידת הריצה הקטנה ביותר, מכיל קונטיינר אחד או יותר\n🔹 Pods זמניים – כשמת, נוצר חדש עם IP חדש\n🔹 Deployment מנהל קבוצת Pods זהים ומבטיח שהמספר הרצוי תמיד רץ\n🔹 replicas – עותקים זהים של ה-Pod שרצים במקביל\nCODE:\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: my-app`,
        theoryEn: `Pods and Deployments are the core of Kubernetes.\n🔹 Pod – the smallest unit of execution, contains one or more containers\n🔹 Pods are ephemeral – when one dies, a new one is created with a new IP\n🔹 Deployment manages a group of identical Pods and ensures the desired count is running\n🔹 replicas – identical copies of the Pod running in parallel\nCODE:\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: my-app`,
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
              "Pod הוא יחידת הריצה הבסיסית. מכיל קונטיינר אחד או יותר שחולקים IP ו-storage.",
          },
          {
            q: "מה קורה כש-Pod מת?",
            options: [
              "הוא ממשיך לרוץ בזיכרון עד שהנתונים נשמרים לדיסק",
              "הנתונים שלו נשמרים ב-etcd לשחזור עתידי",
              "Kubernetes יוצר Pod חדש עם IP חדש",
              "ה-Service המחובר אליו עובר אוטומטית ל-Pod אחר ב-Namespace",
            ],
            answer: 2,
            explanation: "Pods אפמריאלים – כשמתים, Kubernetes יוצר חדש עם IP חדש.",
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
            explanation: "Deployment מנהל את מחזור חיי ה-Pods ומבטיח שמספר הרצוי רץ תמיד.",
          },
          {
            q: "מה זה replicas?",
            options: [
              "גרסאות קודמות של ה-Pod ששמורות לrollback",
              "עותקים זהים של ה-Pod שרצים במקביל",
              "קבצי הגדרה שמגדירים את תצורת ה-Deployment",
              "volumes שמשותפים בין Pods שונים באותו Namespace",
            ],
            answer: 1,
            explanation: "Replicas הם עותקים זהים של ה-Pod שרצים במקביל לזמינות גבוהה.",
          },
          {
            q: "מה זה init container?",
            options: [
              "קונטיינר שרץ ברקע ומספק שירות monitoring לכל הPods",
              "קונטיינר שרץ לפני הקונטיינרים הראשיים ומכין את הסביבה",
              "קונטיינר שאחראי על ניהול לוגים ושליחתם לשרת מרוחק",
              "קונטיינר שמנהל תקשורת בין Pod לService ב-Cluster",
            ],
            answer: 1,
            explanation:
              "Init containers רצים ומסיימים לפני שהקונטיינרים הראשיים עולים. משמשים להגדרת תנאים, migration, והורדת קבצים.",
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
              "Liveness probe בודק שהקונטיינר עדיין עובד. אם נכשל מספר פעמים, K8s ממית ומפעיל מחדש את הקונטיינר.",
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
              "Readiness probe בודק שהקונטיינר מוכן לקבל בקשות. Pods שלא עוברים readiness נוסרים מה-Service endpoints.",
          },
          {
            q: "מה ברירת המחדל של restartPolicy ב-Pod?",
            options: [
              "Never – Kubernetes לא מפעיל מחדש קונטיינר שנפסק",
              "OnFailure – Kubernetes מפעיל מחדש רק אם exit code שגוי",
              "Always – Kubernetes תמיד מפעיל מחדש קונטיינר שנפסק",
              "OnError – Kubernetes מפעיל מחדש רק בשגיאות runtime",
            ],
            answer: 2,
            explanation:
              "restartPolicy: Always הוא ברירת המחדל – Kubernetes תמיד מפעיל מחדש קונטיינר שנפסק.",
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
              "Job מריץ Task עד שהוא מסיים בהצלחה. CronJob מתזמן Jobs לפי cron schedule.",
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
            q: "מה הוא ReplicaSet?",
            options: [
              "אובייקט שמגבה את ה-etcd ושומר snapshot של כל הPods",
              "חיבור בין Pods לService שמאפשר load balancing מתקדם",
              "קונטרולר שמבטיח מספר Pods מסוים רץ בכל עת",
              "בסיס נתונים פנימי שמאחסן את state של כל ה-Deployments",
            ],
            answer: 2,
            explanation:
              "ReplicaSet מבטיח שמספר ספציפי של Pods זהים רץ תמיד. Deployment מנהל ReplicaSets ומוסיף יכולות rolling updates ו-rollback.",
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
              "Namespace מאפשר הפרדה לוגית. משאבים ב-Namespace שונה לא 'רואים' זה את זה. שימושי ל: dev/staging/prod, צוותים שונים.",
          },
          {
            q: "מה ההבדל בין Label ל-Annotation?",
            options: [
              "Label מוצפן ב-etcd, Annotation מאוחסן ב-ConfigMap",
              "Annotation ניתן לשימוש ב-selector, Label הוא metadata בלבד",
              "Label ניתן לשינוי רק ב-creation time, Annotation ניתן לעדכון בכל עת",
              "Label לתיוג ובחירה (selector), Annotation למטא-דטה שלא משמש לselector",
            ],
            answer: 3,
            explanation:
              "Labels הם key-value לתיוג וסינון ב-selectors. Annotations שומרים metadata נוסף (URLs, owners) – לא ניתן להשתמש בהם ב-selectors.",
          },
          {
            q: "מה ההבדל בין kubectl apply ל-kubectl create?",
            options: [
              "אין הבדל תפקודי, kubectl apply מהיר יותר ב-Clusters גדולים",
              "apply מעדכן resource קיים; create נכשל אם resource קיים",
              "kubectl create בטוח יותר כי הוא לא מוחק שדות שלא צוינו ב-YAML",
              "kubectl apply מחייב גרסת apiVersion ספציפית לכל סוג resource",
            ],
            answer: 1,
            explanation:
              "kubectl create נכשל אם resource קיים. kubectl apply יוצר אם לא קיים, או מעדכן אם קיים (idempotent). מומלץ apply ב-CI/CD.",
          },
          {
            q: "מה imagePullPolicy: Always גורם ל-Kubernetes לעשות?",
            options: [
              "משתמש תמיד בimage מה-cache המקומי של ה-Node ומדלג על registry",
              "לא מוריד image אם הTag הוא latest ומשאיר את הגרסה הקיימת",
              "מוריד image מה-registry בכל פעם שPod מתזמן",
              "מוריד image חדש רק אם ה-digest של ה-image השתנה ב-registry",
            ],
            answer: 2,
            explanation:
              "imagePullPolicy: Always מאלץ את kubelet למשוך image מה-registry בכל הפעלה. IfNotPresent (ברירת מחדל) מוריד רק אם לא קיים מקומית.",
          },
          {
            q: "מה שלבי ה-Pod האפשריים ב-Kubernetes?",
            options: [
              "Pending, Running, Succeeded, Failed, Unknown",
              "Starting, Active, Done, Error, Terminated",
              "Init, Running, Stopped, Crashed, Evicted",
              "Created, Scheduled, Running, Completed, Deleted",
            ],
            answer: 0,
            explanation:
              "חמשת שלבי Pod: Pending (מתזמן/מוריד image), Running (קונטיינר רץ), Succeeded (כולם יצאו 0), Failed (אחד נכשל), Unknown (Node לא מדווח).",
          },
          {
            q: "מה terminationGracePeriodSeconds מגדיר?",
            options: [
              "זמן בין בדיקות של liveness probe לפני שמסומן כנכשל",
              "זמן מקסימלי שreadiness probe מחכה לתגובה מהקונטיינר",
              "timeout לפני שJob מסומן כנכשל ולא ינוסה שוב",
              "זמן שK8s ממתין אחרי SIGTERM לפני שליחת SIGKILL",
            ],
            answer: 3,
            explanation:
              "כשPod נמחק, K8s שולח SIGTERM ומחכה terminationGracePeriodSeconds (ברירת מחדל: 30s) לפני SIGKILL. מאפשר סגירת connections graceful.",
          },
          {
            q: "מה מאפיין Pod עם מספר קונטיינרים?",
            options: [
              "כל קונטיינר מקבל IP נפרד ויכול להיות מנוהל ב-Service נפרד",
              "הקונטיינרים חולקים IP, network namespace, ו-volumes",
              "לא ניתן להשתמש בliveness probes ב-Pods עם מספר קונטיינרים",
              "כל קונטיינר מתוזמן על Node שונה לאיזון עומסים",
            ],
            answer: 1,
            explanation:
              "קונטיינרים באותו Pod חולקים IP, network namespace, ו-volumes. הם תקשרים ישירות דרך localhost. דפוס נפוץ: main app + sidecar.",
          },
          {
            q: "לאיזה מטרה משמש kubectl get pod <name> -o yaml?",
            options: [
              "מוחק את ה-Pod ומייצא את ה-spec שלו לקובץ YAML מקומי",
              "מראה רק שגיאות ו-warnings שנרשמו ב-events של ה-Pod",
              "מציג את המפרט המלא כ-YAML לdebug וייצוא",
              "מפעיל Pod מחדש תוך שמירה על אותו IP וVolumes",
            ],
            answer: 2,
            explanation:
              "-o yaml מציג את ה-Pod spec המלא כולל status, הגדרות, ו-metadata. שימושי לחקירת הגדרות, ייצוא, ויצירת משאב דומה.",
          },
          {
            q: "מה ההבדל בין קונטיינר ל-Pod ב-Kubernetes?",
            options: [
              "Pod הוא wrapper שמכיל קונטיינר אחד+ עם רשת, storage, ומחזור חיים משותף",
              "Pod הוא קונטיינר מוקטן שרץ ללא filesystem משלו",
              "Pod מיועד לproduction, קונטיינר מיועד לסביבת פיתוח בלבד",
              "Pod הוא ה-image שמאוחסן ב-registry, קונטיינר הוא ה-instance הרץ",
            ],
            answer: 0,
            explanation:
              "קונטיינר הוא יחידת ריצה מבודדת. Pod הוא abstraction של K8s שמנהל קונטיינר אחד+ עם IP משותף, storage, ומחזור חיים.",
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
              "A Pod is the basic unit of execution. It contains one or more containers that share an IP and storage.",
          },
          {
            q: "What happens when a Pod dies?",
            options: [
              "It keeps running in memory until its data is flushed to disk",
              "Data is preserved in etcd and restored to the replacement Pod automatically",
              "Kubernetes creates a new Pod with a new IP",
              "The Service connected to it automatically reroutes to another Pod in the Namespace",
            ],
            answer: 2,
            explanation:
              "Pods are ephemeral – when they die, Kubernetes creates a new one with a new IP.",
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
              "A Deployment manages the lifecycle of Pods and ensures the desired count is always running.",
          },
          {
            q: "What are replicas?",
            options: [
              "Previous versions of the Pod saved for rollback",
              "Identical copies of the Pod running in parallel",
              "Configuration files that define Deployment settings",
              "Volumes shared between Pods in the same Namespace",
            ],
            answer: 1,
            explanation:
              "Replicas are identical copies of the Pod running in parallel for high availability.",
          },
          {
            q: "What is an init container?",
            options: [
              "A container that runs in the background providing monitoring for all Pods",
              "A container that runs before main containers to prepare the environment",
              "A container responsible for log management and forwarding to a remote server",
              "A container that manages communication between a Pod and a Service",
            ],
            answer: 1,
            explanation:
              "Init containers run and complete before the main containers start. Used to set preconditions, run migrations, or download files.",
          },
          {
            q: "What does a liveness probe do?",
            options: [
              "Checks that the Pod is connected to the correct Service and receiving traffic",
              "Checks the container is alive — if it fails, Kubernetes restarts it",
              "Checks that configuration files loaded successfully at Pod startup",
              "Verifies that API server connectivity is still valid from within the container",
            ],
            answer: 1,
            explanation:
              "A liveness probe checks the container is still working. If it fails repeatedly, K8s kills and restarts the container.",
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
              "A readiness probe checks whether the container is ready to serve requests. Pods that fail readiness are removed from Service endpoints.",
          },
          {
            q: "What is the default restartPolicy for a Pod?",
            options: [
              "Never — Kubernetes never restarts a stopped container",
              "OnFailure — Kubernetes restarts only if the exit code is non-zero",
              "Always — Kubernetes always restarts a stopped container",
              "OnError — Kubernetes restarts only on runtime errors",
            ],
            answer: 2,
            explanation:
              "restartPolicy: Always is the default — Kubernetes always restarts a stopped container.",
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
              "A Job runs a task until it completes successfully. A CronJob schedules Jobs according to a cron expression.",
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
              "requests defines how much CPU/Memory the Pod needs. The Scheduler uses this to choose a suitable Node.",
          },
          {
            q: "What is a ReplicaSet in Kubernetes?",
            options: [
              "An object that backs up etcd and stores snapshots of all Pods",
              "A connector between Pods and Services that enables advanced load balancing",
              "A controller ensuring a specified number of identical Pods always run",
              "An internal database storing the desired state of all Deployments",
            ],
            answer: 2,
            explanation:
              "A ReplicaSet ensures a specific number of Pod replicas run at all times. A Deployment manages ReplicaSets and adds rolling update and rollback capabilities.",
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
          {
            q: "What is the difference between a Label and an Annotation?",
            options: [
              "Labels are encrypted in etcd; Annotations are stored in a ConfigMap",
              "Only Annotations can be used in selectors; Labels are metadata only",
              "Labels can only be set at creation time; Annotations can be updated anytime",
              "Labels are for tagging and selection via selectors; Annotations store metadata not used in selectors",
            ],
            answer: 3,
            explanation:
              "Labels are key-value pairs for tagging and filtering via selectors (Services, Deployments). Annotations store extra metadata (URLs, owners, build IDs) — not usable in selectors.",
          },
          {
            q: "What is the difference between kubectl apply and kubectl create?",
            options: [
              "No functional difference; kubectl apply is faster in large clusters",
              "apply updates an existing resource; create fails if the resource already exists",
              "kubectl create is safer because it does not remove fields absent from the YAML",
              "kubectl apply requires a specific apiVersion for each resource type",
            ],
            answer: 1,
            explanation:
              "kubectl create fails if the resource already exists. kubectl apply creates or updates the resource (idempotent). Apply is the recommended approach in CI/CD pipelines.",
          },
          {
            q: "What does imagePullPolicy: Always cause Kubernetes to do?",
            options: [
              "Always use the locally cached image on the Node and skip the registry",
              "Skip pulling if the image tag already exists on the Node",
              "Pull the image from the registry every time a Pod is scheduled",
              "Pull a new image only if the digest has changed in the registry",
            ],
            answer: 2,
            explanation:
              "imagePullPolicy: Always forces kubelet to pull the image from the registry on every container start. IfNotPresent (default) only pulls if the image isn't cached locally.",
          },
          {
            q: "What are the possible Pod phases in Kubernetes?",
            options: [
              "Pending, Running, Succeeded, Failed, Unknown",
              "Starting, Active, Done, Error, Terminated",
              "Init, Running, Stopped, Crashed, Evicted",
              "Created, Scheduled, Running, Completed, Deleted",
            ],
            answer: 0,
            explanation:
              "The five Pod phases: Pending (scheduling/pulling), Running (container active), Succeeded (all exited 0), Failed (at least one non-zero exit), Unknown (node not reporting).",
          },
          {
            q: "What does terminationGracePeriodSeconds define?",
            options: [
              "Time between liveness probe checks before the container is marked failed",
              "Maximum time a readiness probe waits for a response from the container",
              "Timeout before a Job is marked as failed and stops retrying",
              "Time Kubernetes waits after SIGTERM before sending SIGKILL",
            ],
            answer: 3,
            explanation:
              "When a Pod is deleted, K8s sends SIGTERM and waits terminationGracePeriodSeconds (default 30s) before SIGKILL, allowing the app to close connections gracefully.",
          },
          {
            q: "What characterises a multi-container Pod?",
            options: [
              "Each container gets a separate IP and can be managed by its own Service",
              "Containers share IP, network namespace, and volumes",
              "Liveness probes cannot be used in Pods with multiple containers",
              "Each container is scheduled on a different Node for load balancing",
            ],
            answer: 1,
            explanation:
              "Containers in the same Pod share: IP address, network namespace (localhost), and Volumes. No Service needed to communicate. Common pattern: main app + sidecar.",
          },
          {
            q: "What is kubectl get pod <name> -o yaml used for?",
            options: [
              "Deletes the Pod and exports its spec to a local YAML file",
              "Shows only errors and warnings recorded in the Pod's events",
              "Displays the full Pod spec as YAML — useful for debugging and export",
              "Restarts the Pod while preserving its IP and volumes",
            ],
            answer: 2,
            explanation:
              "-o yaml outputs the complete Pod specification including status, settings, and metadata. Useful for inspecting config, exporting, or creating a similar resource.",
          },
          {
            q: "What is the difference between a container and a Pod in Kubernetes?",
            options: [
              "A Pod wraps one or more containers with a shared network, storage, and lifecycle",
              "A Pod is a stripped-down container that runs without its own filesystem",
              "Pod is for production environments; container is for development only",
              "Pod is the image stored in the registry; container is the running instance",
            ],
            answer: 0,
            explanation:
              "A container is an isolated runtime unit. A Pod is a Kubernetes abstraction grouping one or more containers that share an IP, volumes, and lifecycle.",
          },
        ],
      },
      medium: {
        theory: `Rolling Updates, Rollback, ו-StatefulSets.\n🔹 Rolling Update מעדכן Pod אחד בכל פעם – zero downtime\n🔹 kubectl rollout undo – חוזר לגרסה קודמת\n🔹 StatefulSet כמו Deployment אבל Pods מקבלים שמות קבועים ו-storage משלהם\n🔹 מתאים ל: databases, Kafka, ZooKeeper\nCODE:\nkubectl set image deployment/my-app web=my-app:v2\nkubectl rollout undo deployment/my-app\n# StatefulSet: pod-0, pod-1, pod-2`,
        theoryEn: `Rolling Updates, Rollback, and StatefulSets.\n🔹 Rolling Update updates one Pod at a time – zero downtime\n🔹 kubectl rollout undo – reverts to the previous version\n🔹 StatefulSet is like Deployment but Pods get fixed names and their own storage\n🔹 Suitable for: databases, Kafka, ZooKeeper\nCODE:\nkubectl set image deployment/my-app web=my-app:v2\nkubectl rollout undo deployment/my-app\n# StatefulSet: pod-0, pod-1, pod-2`,
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
            explanation: "Rolling Update מעדכן Pod אחד בכל פעם, כך שתמיד יש Pods זמינים.",
          },
          {
            q: "כיצד מבצעים rollback?",
            options: [
              "kubectl delete deployment my-app ואז kubectl apply מחדש עם YAML קודם",
              "kubectl rollout undo deployment/my-app",
              "kubectl scale deployment my-app --replicas=0 ואז להגדיל מחדש",
              'kubectl patch deployment my-app --type=json -p \'[{"op":"replace"}]\'',
            ],
            answer: 1,
            explanation: "kubectl rollout undo מחזיר את ה-Deployment לגרסה הקודמת.",
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
            explanation: "ב-StatefulSet לכל Pod יש שם קבוע (pod-0,1,2) ואחסון משלו.",
          },
          {
            q: "לאיזה אפליקציה מתאים StatefulSet?",
            options: [
              "Web servers stateless שדורשים rolling updates מהירים",
              "Databases ו-message brokers שצריכות זהות ואחסון קבועים",
              "CI/CD pipelines שמריצים builds ב-Pods זמניים",
              "Load balancers שמנהלים traffic בין Namespaces",
            ],
            answer: 1,
            explanation: "StatefulSet מתאים לאפליקציות עם מצב כמו MySQL, Kafka שצריכות זהות קבועה.",
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
              "PDB מגדיר כמה Pods חייבים להיות זמינים בזמן disruptions מתוכננות כמו node drain.",
          },
          {
            q: "מה nodeSelector?",
            options: [
              "שדה שבוחר באיזה Namespace ה-Pod יתזמן",
              "מגביל Pod לרוץ רק על Nodes עם labels ספציפיים",
              "שדה שמגביל את קצב הרשת של ה-Pod לפי Node",
              "שדה שבוחר אילו StorageClasses זמינים ל-Pod",
            ],
            answer: 1,
            explanation:
              "nodeSelector שדה בPod spec שמגביל את ה-Scheduler לבחור רק Nodes עם labels ספציפיים.",
          },
          {
            q: "מה ההבדל בין affinity ל-anti-affinity?",
            options: [
              "affinity ו-anti-affinity זהים אבל עם syntax שונה ב-Pod spec",
              "affinity מושך Pods לNode מסוים, anti-affinity דוחה Pods מNodeים מסוימים",
              "affinity מבוסס על CPU usage, anti-affinity מבוסס על זיכרון פנוי",
              "affinity מיועד לProduction, anti-affinity מיועד לסביבות test",
            ],
            answer: 1,
            explanation:
              "affinity מושך Pods לNodeים מסוימים. anti-affinity מבטיח שPods לא ירוצו ביחד לzones זהות.",
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
              "limits מגדיר את המקסימום. חריגה מ-memory limit גורמת ל-OOMKill, חריגה מ-CPU throttling.",
          },
          {
            q: "מה הפקודה לראות rollout history?",
            options: [
              "kubectl get history deployment/myapp --all-revisions",
              "kubectl rollout history deployment/myapp",
              "kubectl describe deployment myapp --show-revisions",
              "kubectl get rollout deployment/myapp -o revisions",
            ],
            answer: 1,
            explanation: "kubectl rollout history deployment/myapp מציג את היסטוריית ה-revisions.",
          },
          {
            q: "מה maxSurge ב-Rolling Update?",
            options: [
              "זמן ההמתנה בשניות בין יצירת Pods חדשים בזמן update",
              "כמות Pods נוספים שמותר ליצור מעל ה-desired count",
              "מספר Pods מינימלי שחייב להיות זמין בכל שלב",
              "מגבלת מספר ה-Nodes שאפשר להשתמש בהם ב-update",
            ],
            answer: 1,
            explanation:
              "maxSurge מגדיר כמה Pods נוספים מעל ה-replicas ניתן ליצור בזמן rolling update.",
          },
          {
            q: "מה strategy: Recreate עושה ב-Deployment?",
            options: [
              "מעדכן Pod אחד בכל פעם תוך שמירה על זמינות מלאה",
              "מוחק את כל ה-Pods הישנים לפני שיוצר Pods חדשים – גורם לdowntime",
              "יוצר Namespace חדש לכל גרסה ומעביר traffic בהדרגה",
              "יוצר clone של ה-Deployment עם גרסה חדשה לboth בו-זמנית",
            ],
            answer: 1,
            explanation:
              "Recreate מוחק את כל ה-Pods הישנים לפני שיוצר חדשים. מאפיין: downtime קצר. RollingUpdate מחליף בהדרגה ללא downtime.",
          },
          {
            q: "מה maxUnavailable מגדיר ב-Rolling Update?",
            options: [
              "מקסימום Nodes שמותרים לכשל בזמן cluster upgrade",
              "כמות Pods שמותרים להיות לא זמינים בו-זמנית בזמן עדכון",
              "מגבלת זיכרון כוללת לכל ה-Pods בזמן rolling update",
              "מקסימום replicas שניתן להגיע אליהם עם HPA בזמן עדכון",
            ],
            answer: 1,
            explanation:
              "maxUnavailable מגדיר כמה Pods יכולים להיות unavailable בו-זמנית בזמן rolling update. 0 אומר אפס downtime.",
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
              "Taint על Node מונע תזמון Pods שלא מגדירים Toleration תואם. משמש לייחוד Nodes ל-workloads מסוימים (GPU, spot instances).",
          },
          {
            q: "מה ההבדל בין requiredDuringScheduling ל-preferredDuringScheduling ב-affinity?",
            options: [
              "אין הבדל תפקודי, רק שינוי ב-syntax של ה-Pod spec",
              "required חייב להתמלא אחרת Pod לא מתזמן; preferred מנסה אבל לא חייב",
              "preferred מיועד לproduction בלבד ומפעיל preemption אוטומטי",
              "required מיועד לCPU affinity, preferred מיועד לzonal memory",
            ],
            answer: 1,
            explanation:
              "requiredDuringSchedulingIgnoredDuringExecution: Pod לא יתזמן אם התנאי לא מתמלא (hard rule). preferredDuring...: מנסה למלא אבל לא חובה (soft rule).",
          },
          {
            q: "מה CronJob concurrencyPolicy: Forbid אומר?",
            options: [
              "Job לא יוצר בכלל עד שAdministrator מאשר ידנית",
              "אם Job קודם עדיין רץ, Job חדש לא נוצר עד שהוא מסיים",
              "כל ה-Pods ב-CronJob יכולים לרוץ במקביל ללא הגבלה",
              "Job שמסתיים עם שגיאה נמחק אוטומטית מה-Namespace",
            ],
            answer: 1,
            explanation:
              "Forbid: אם Job קודם עדיין רץ, ה-CronJob מדלג על הריצה הבאה. Allow (ברירת מחדל): Jobs מקבילים. Replace: Job ישן נמחק ונוצר חדש.",
          },
          {
            q: "מה Job backoffLimit מגדיר?",
            options: [
              "זמן מקסימלי בשניות שJob רשאי לרוץ לפני timeout",
              "מספר ניסיונות חוזרים לפני שJob מסומן כנכשל",
              "מספר Pods מקסימלי שיכולים לרוץ במקביל ב-Job",
              "זמן ההמתנה בין ניסיון כושל לניסיון הבא",
            ],
            answer: 1,
            explanation:
              "backoffLimit מגדיר כמה פעמים Kubernetes ינסה מחדש לפני שJob מסומן Failed. ברירת מחדל: 6.",
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
              "Guaranteed: requests=limits. Burstable: requests<limits. BestEffort: ללא requests/limits. בלחץ זיכרון, BestEffort מפונה ראשון.",
          },
          {
            q: "מה kubectl rollout pause עושה?",
            options: [
              "מוחק את ה-Deployment ומשמר את ה-ReplicaSet הנוכחי",
              "עוצר rolling update בשלב נוכחי – שימושי לCanary deploys",
              "מחזיר ל-Deployment לגרסה הקודמת ללא שמירת revision חדש",
              "עוצר את כל ה-Pods מלקבל traffic דרך ה-Service",
            ],
            answer: 1,
            explanation:
              "kubectl rollout pause מאפשר להקפיא rollout באמצע. ניתן לשנות הגדרות נוספות ואז להמשיך עם kubectl rollout resume.",
          },
          {
            q: "מה podAntiAffinity משמש לצורך?",
            options: [
              "מושך Pods לNode ספציפי שמכיל כבר משאבים משותפים",
              "מבטיח שPods לא יתוזמנו ביחד על אותו Node/Zone לזמינות גבוהה",
              "מגביל את ה-traffic בין Pods שרצים באותו Namespace",
              "מנהל רזולוציית DNS בין Pods ב-Namespaces שונים",
            ],
            answer: 1,
            explanation:
              "podAntiAffinity מונע מPods זהים לרוץ על אותו Node/Zone. שימושי לHA – פיזור replicas בין failure domains.",
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
              "Ephemeral containers מוספים לPod רץ דרך kubectl debug. שימושי כשה-image הראשי חסר כלי debug. אינם מאותחלים מחדש ולא מופיעים בspec.",
          },
        ],
        questionsEn: [
          {
            q: "What is the advantage of a Rolling Update?",
            options: [
              "Updates all Pods simultaneously to minimise total deployment time",
              "Zero downtime during update",
              "Automatically rolls back if readiness probes fail on new Pods",
              "Prevents the Service from routing to unhealthy Pods during upgrade",
            ],
            answer: 1,
            explanation: "Rolling Update updates one Pod at a time, so Pods are always available.",
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
            explanation: "kubectl rollout undo returns the Deployment to the previous version.",
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
              "In StatefulSet, each Pod has a fixed name (pod-0,1,2) and its own storage.",
          },
          {
            q: "What type of app is StatefulSet suitable for?",
            options: [
              "Stateless web servers that require fast rolling updates",
              "Databases and message brokers that need persistent identity and storage",
              "CI/CD pipelines running ephemeral build Pods",
              "Load balancers managing traffic routing across Namespaces",
            ],
            answer: 1,
            explanation:
              "StatefulSet is suitable for stateful apps like MySQL, Kafka that need a fixed identity.",
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
              "A PDB defines how many Pods must remain available during planned disruptions such as node drains.",
          },
          {
            q: "What is nodeSelector?",
            options: [
              "A field that selects which Namespace the Pod is scheduled into",
              "Constrains a Pod to run only on Nodes with specific labels",
              "A field that limits the Pod's network bandwidth based on Node type",
              "A field that selects which StorageClasses are available to the Pod",
            ],
            answer: 1,
            explanation:
              "nodeSelector is a Pod spec field that restricts the Scheduler to choose only Nodes with matching labels.",
          },
          {
            q: "What is the difference between affinity and anti-affinity?",
            options: [
              "Affinity and anti-affinity are identical but use different syntax in the Pod spec",
              "Affinity attracts Pods to certain Nodes; anti-affinity repels Pods from certain Nodes",
              "Affinity is based on CPU usage; anti-affinity is based on available memory",
              "Affinity is for production workloads; anti-affinity is for test environments",
            ],
            answer: 1,
            explanation:
              "Affinity attracts Pods toward specific Nodes. Anti-affinity ensures Pods don't run together on the same zone.",
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
              "limits defines the maximum. Exceeding memory limit causes OOMKill; exceeding CPU limit causes throttling.",
          },
          {
            q: "What command shows rollout history?",
            options: [
              "kubectl get history deployment/myapp --all-revisions",
              "kubectl rollout history deployment/myapp",
              "kubectl describe deployment myapp --show-revisions",
              "kubectl get rollout deployment/myapp -o revisions",
            ],
            answer: 1,
            explanation: "kubectl rollout history deployment/myapp shows the revision history.",
          },
          {
            q: "What is maxSurge in a Rolling Update?",
            options: [
              "The wait time in seconds between creating each new Pod during an update",
              "Extra Pods allowed above the desired count during a rolling update",
              "The minimum number of Pods that must stay available at each update step",
              "The maximum number of Nodes that can be used during an update",
            ],
            answer: 1,
            explanation:
              "maxSurge defines how many extra Pods above the replica count can be created during a rolling update.",
          },
          {
            q: "What does strategy: Recreate do in a Deployment?",
            options: [
              "Updates one Pod at a time while keeping full availability throughout",
              "Deletes all old Pods before creating new ones — causes downtime",
              "Creates a new Namespace for each release and gradually shifts traffic",
              "Runs both old and new Pods simultaneously and switches traffic at the end",
            ],
            answer: 1,
            explanation:
              "Recreate terminates all old Pods before starting new ones. Result: a short downtime window. RollingUpdate replaces gradually with no downtime.",
          },
          {
            q: "What does maxUnavailable define in a Rolling Update?",
            options: [
              "Maximum number of Nodes allowed to be unresponsive during a cluster upgrade",
              "Number of Pods allowed to be unavailable simultaneously during an update",
              "Total memory limit applied to all Pods during a rolling update",
              "Maximum replica count that HPA can scale to during an update",
            ],
            answer: 1,
            explanation:
              "maxUnavailable controls how many Pods can be unavailable at once during a rolling update. Setting it to 0 means zero downtime.",
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
              "A taint on a Node prevents scheduling of Pods that don't declare a matching Toleration. Used to dedicate Nodes for specific workloads (GPUs, spot instances).",
          },
          {
            q: "What is the difference between requiredDuringScheduling and preferredDuringScheduling in affinity?",
            options: [
              "No functional difference; they only differ in syntax within the Pod spec",
              "required must be satisfied or the Pod won't schedule; preferred is a soft preference",
              "preferredDuringScheduling triggers Pod preemption in production clusters only",
              "required is used for CPU affinity rules; preferred is used for zone-based memory rules",
            ],
            answer: 1,
            explanation:
              "requiredDuringSchedulingIgnoredDuringExecution: Pod won't be scheduled if the rule isn't met (hard). preferredDuringScheduling: K8s tries but doesn't enforce (soft).",
          },
          {
            q: "What does CronJob concurrencyPolicy: Forbid mean?",
            options: [
              "The Job is never created until an Administrator manually approves it",
              "If the previous Job is still running, the new scheduled run is skipped",
              "All Pods in the CronJob can run concurrently without any limit",
              "Jobs that fail are automatically deleted from the Namespace",
            ],
            answer: 1,
            explanation:
              "Forbid: if the previous Job is still running, the next scheduled run is skipped. Allow (default): concurrent Jobs permitted. Replace: old Job is deleted and a new one created.",
          },
          {
            q: "What does Job backoffLimit define?",
            options: [
              "Maximum time in seconds a Job is allowed to run before timeout",
              "Number of retries before the Job is marked as Failed",
              "Maximum number of Pods that can run concurrently within the Job",
              "Wait time between a failed attempt and the next retry",
            ],
            answer: 1,
            explanation:
              "backoffLimit sets how many times Kubernetes retries a failed Job before marking it Failed. The default is 6.",
          },
          {
            q: "What are the three Pod QoS classes?",
            options: [
              "Low, Medium, High — based on the number of configured replicas",
              "Guaranteed, Burstable, BestEffort — based on the relationship between requests and limits",
              "Bronze, Silver, Gold — based on the assigned PriorityClass value",
              "Fast, Normal, Slow — based on the readiness probe response time",
            ],
            answer: 1,
            explanation:
              "Guaranteed: requests=limits. Burstable: requests<limits. BestEffort: no requests/limits. Under memory pressure, BestEffort is evicted first.",
          },
          {
            q: "What does kubectl rollout pause do?",
            options: [
              "Deletes the Deployment and preserves the current ReplicaSet state",
              "Freezes the rolling update at the current step — useful for canary deploys",
              "Reverts the Deployment to the previous revision without saving a new revision",
              "Stops all Pods from receiving traffic via the Service until manually resumed",
            ],
            answer: 1,
            explanation:
              "kubectl rollout pause freezes a rollout mid-way. You can make additional changes then resume with kubectl rollout resume.",
          },
          {
            q: "What is podAntiAffinity used for?",
            options: [
              "Attracts Pods to a specific Node that already holds shared resources",
              "Ensures Pods are not co-scheduled on the same Node/Zone for high availability",
              "Limits traffic between Pods running in the same Namespace",
              "Manages DNS resolution between Pods in different Namespaces",
            ],
            answer: 1,
            explanation:
              "podAntiAffinity prevents identical Pods from landing on the same Node or Zone, spreading replicas across failure domains for HA.",
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
              "Ephemeral containers are injected into a running Pod via kubectl debug. Useful when the main image lacks debugging tools. They don't restart and don't appear in the Pod spec.",
          },
        ],
      },
      hard: {
        theory: `DaemonSets, HPA, ומצבי כשל.\n🔹 DaemonSet – Pod אחד על כל Node (logging, monitoring, CNI)\n🔹 HPA – Horizontal Pod Autoscaler, מגדיל/מקטין replicas לפי CPU/Memory\n🔹 CrashLoopBackOff – קונטיינר קורס שוב ושוב\n🔹 OOMKilled – חרגנו ממגבלת הזיכרון\nCODE:\nkubectl autoscale deployment my-app --cpu-percent=50 --min=2 --max=10\napiVersion: apps/v1\nkind: DaemonSet`,
        theoryEn: `DaemonSets, HPA, and failure states.\n🔹 DaemonSet – one Pod per Node (logging, monitoring, CNI)\n🔹 HPA – Horizontal Pod Autoscaler, scales replicas by CPU/Memory\n🔹 CrashLoopBackOff – container crashes repeatedly\n🔹 OOMKilled – container exceeded memory limit\nCODE:\nkubectl autoscale deployment my-app --cpu-percent=50 --min=2 --max=10\napiVersion: apps/v1\nkind: DaemonSet`,
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
              "DaemonSet מבטיח שעותק אחד של ה-Pod רץ על כל Node. בNode חדש – Pod נוסף אוטומטית.",
          },
          {
            q: "מה זה HPA?",
            options: [
              "High Performance App – תצורת Pod מותאמת לביצועים גבוהים",
              "Horizontal Pod Autoscaler – מגדיל/מקטין Pods לפי עומס",
              "Host Port Assignment – מקצה ports ב-Node לPods",
              "Helm Package Archive – פורמט שמירה של Helm charts",
            ],
            answer: 1,
            explanation: "HPA מגדיל/מקטין את מספר ה-Pods אוטומטית לפי עומס CPU/Memory.",
          },
          {
            q: "מה משמעות CrashLoopBackOff?",
            options: [
              "הPod הושהה ידנית ומחכה לאישור מנהל לחדש את הריצה",
              "הקונטיינר קורס שוב ושוב וKubernetes מגדיל את ההמתנה בין ניסיונות",
              "הרשת של ה-Pod נכשלה וה-CNI לא מצליח להקצות IP",
              "אין מספיק זיכרון פנוי ב-Node לתזמון הPod",
            ],
            answer: 1,
            explanation: "CrashLoopBackOff – הקונטיינר מנסה לעלות, קורס, ומנסה שוב.",
          },
          {
            q: "מה זה OOMKilled?",
            options: [
              "שגיאת רשת שנגרמת כשה-Pod מנסה לגשת לכתובת IP חסומה",
              "הקונטיינר חרג ממגבלת הזיכרון שהוגדרה ב-limits.memory",
              "הדיסק של ה-Node מלא ו-kubelet לא יכול ליצור קבצים",
              "שגיאת הרשאות שמונעת מהקונטיינר לגשת ל-volume",
            ],
            answer: 1,
            explanation: "OOMKilled אומר שהקונטיינר צרך יותר זיכרון ממה שהוגדר לו.",
          },
          {
            q: "מה pod preemption?",
            options: [
              "מחיקת Pods ישנים שחרגו מזמן הריצה המוגדר ב-activeDeadlineSeconds",
              "הוצאת Pod ממתין בעדיפות נמוכה כדי לפנות מקום לPod בעדיפות גבוהה",
              "Scale down אוטומטי של Pods כשהCPU יורד מתחת לסף מוגדר",
              "restart של Node לאחר ש-kubelet מזהה DiskPressure",
            ],
            answer: 1,
            explanation:
              "Preemption – Scheduler מוציא Pods בעדיפות נמוכה כדי שPod בעדיפות גבוהה יוכל להתזמן.",
          },
          {
            q: "מה topologySpreadConstraints?",
            options: [
              "מגביל את השימוש בCPU של Pods שרצים ב-Zone מסוים",
              "מפזר Pods בצורה שווה בין Zones/Nodes לזמינות גבוהה",
              "מנהל רזולוציית DNS בין Pods שרצים ב-Namespaces שונים",
              "מגביל תנועת רשת בין Pods שרצים ב-Zones שונים",
            ],
            answer: 1,
            explanation:
              "topologySpreadConstraints מגדיר כיצד Pods מתפזרים בין failure domains (Zones, Nodes) לזמינות גבוהה.",
          },
          {
            q: "מה sidecar container?",
            options: [
              "init container שרץ לפני האפליקציה הראשית ומכין את הסביבה",
              "קונטיינר נוסף בPod שמספק שירות תומך כמו logging או proxy",
              "גרסת backup של הקונטיינר הראשי לצורך rollback",
              "Pod נפרד ב-Namespace ייעודי שמספק שירותי platform",
            ],
            answer: 1,
            explanation:
              "Sidecar הוא קונטיינר נוסף באותו Pod שרץ לצד האפליקציה הראשית ומספק יכולות כמו log shipping, proxy, או monitoring.",
          },
          {
            q: "מה Vertical Pod Autoscaler (VPA)?",
            options: [
              "מגדיל את מספר ה-Pods כשהCPU עולה מעל סף מוגדר",
              "מגדיל/מקטין CPU וMemory requests של Pod אוטומטית לפי שימוש",
              "מנהל את ה-scaling של Nodes בCluster לפי עומס",
              "גרסה מתקדמת של HPA שתומכת ב-custom metrics",
            ],
            answer: 1,
            explanation:
              "VPA מתאים resources requests/limits אוטומטית לפי שימוש בפועל, להפחתת בזבוז ומניעת OOM.",
          },
          {
            q: "מה DaemonSet משמש בדרך כלל?",
            options: [
              "Web servers stateless שצריכים replicas גבוהות לזמינות",
              "Agents כמו log collectors ו-monitoring שצריכים לרוץ על כל Node",
              "Batch jobs שצריכים גישה לכל ה-Nodes בו-זמנית",
              "Load balancers שמנהלים traffic ברמת ה-Node",
            ],
            answer: 1,
            explanation:
              "DaemonSet שימושי ל-agents שצריכים לרוץ על כל Node: Fluentd, Prometheus node-exporter, CNI plugins.",
          },
          {
            q: "מה PriorityClass קובע?",
            options: [
              "ביצועי רשת ומגבלת קצב תנועה ל-Pod בהתאם למשאב",
              "עדיפות תזמון וpreemption של Pods ב-Cluster",
              "הרשאות RBAC לPod לגישה ל-Kubernetes API",
              "StorageClass שישמש לPVC של ה-Pod",
            ],
            answer: 1,
            explanation:
              "PriorityClass קובע את עדיפות ה-Pod. Pods עם priorityClassName גבוה יוקצו ראשונים ויכולים לגרום לpreemption.",
          },
          {
            q: "Pod נשאר Pending. kubectl describe מראה:\nEvents:\n  Warning  FailedScheduling  0/3 nodes are available: 3 node(s) had untolerated taint {dedicated:gpu}.\nמה הפתרון?",
            options: [
              "הוסף Node חדש לCluster ללא taint",
              "הקטן את ה-CPU request כדי שה-Pod יתאים לNode קטן יותר",
              "הוסף toleration מתאים לPod spec עם key:'dedicated', value:'gpu'",
              "שנה את ה-Namespace של ה-Pod לNamespace ייעודי ל-GPU",
            ],
            answer: 2,
            explanation:
              "ה-Node מסומן עם taint dedicated=gpu. Pod בלי toleration תואם לא יתוזמן שם. הוסף tolerations: [{key:'dedicated', value:'gpu', effect:'NoSchedule'}] ל-Pod spec.",
          },
          {
            q: "StatefulSet עם 3 replicas. Pod-1 נשאר Pending. מה הסיבה הנפוצה?",
            options: [
              "ה-PVC של pod-1 מלא ולא ניתן להקצות אחסון נוסף",
              "Pod-0 לא Ready – StatefulSet מתזמן Pods בסדר לפי ordinal",
              "ה-Namespace quota הגיע לגבול ולא ניתן ליצור Pod חדש",
              "ה-imagePullSecret שגוי ומונע הורדת image לpod-1",
            ],
            answer: 1,
            explanation:
              "StatefulSet מתזמן Pods בסדר: pod-0 חייב להיות Ready לפני pod-1. בדוק kubectl get pod pod-0 ו-kubectl describe pod pod-0 לגלות מה חוסם.",
          },
          {
            q: "kubectl get hpa מציג:\nNAME    REFERENCE         TARGETS         MINPODS  MAXPODS  REPLICAS\napp-hpa  Deployment/app   <unknown>/50%   2        10       2\nמה הסיבה ל-<unknown>?",
            options: [
              "ה-Deployment שה-HPA מפנה אליו לא קיים בNamespace",
              "metrics-server לא מותקן – HPA לא מקבל מדדי CPU",
              "ה-CPU limit לא מוגדר ב-Pod spec ולכן אין נתון אחוזי",
              "מספר ה-replicas הוא 0 ואין Pods שמדווחים על metrics",
            ],
            answer: 1,
            explanation:
              "<unknown> ב-TARGETS מציין שHPA לא מקבל metrics. הסיבה הנפוצה: metrics-server לא מותקן. בדוק: kubectl get apiservice v1beta1.metrics.k8s.io.",
          },
          {
            q: "Rolling update נתקע. kubectl rollout status מציג:\nWaiting for rollout to finish: 3 out of 5 new replicas have been updated...\nה-YAML מגדיר maxUnavailable: 0. מה הסיבה?",
            options: [
              "ה-Namespace quota מלא ולא ניתן ליצור Pods נוספים",
              "Pods החדשים לא עוברים readiness probe, ו-maxUnavailable:0 מונע הורדת ישנים",
              "ה-image שגוי ו-kubelet לא מצליח להוריד אותו מה-registry",
              "ה-TLS certificate שגוי ב-admission webhook שבודק את ה-Pod spec",
            ],
            answer: 1,
            explanation:
              "עם maxUnavailable:0, K8s לא יכול להוריד Pod ישן עד שחדש Ready. אם readiness probe נכשלת, rollout נתקע. בדוק logs של Pod חדש.",
          },
          {
            q: "DaemonSet לא מופיע על Node חדש. kubectl describe node מראה:\nTaints: node-role.kubernetes.io/control-plane:NoSchedule\nה-DaemonSet spec אינו כולל tolerations. מה הפתרון?",
            options: [
              "מחק ה-Node והוסף אותו מחדש ללא ה-taint",
              "שנה את ה-Namespace של ה-DaemonSet לkube-system",
              "הוסף ל-DaemonSet spec: tolerations: [{key:'node-role.kubernetes.io/control-plane', effect:'NoSchedule'}]",
              "הקטן את ה-resource requests של ה-DaemonSet כך שיתאים לNode",
            ],
            answer: 2,
            explanation:
              "Node עם taint NoSchedule דוחה Pods ללא Toleration תואם. DaemonSets ל-system components כמו logging צריכים לכלול את ה-toleration לcontrol-plane.",
          },
          {
            q: "Pod חוזר ומקבל OOMKilled. kubectl describe pod מראה:\nLast State: Terminated Reason: OOMKilled Exit Code: 137\nContainers: limits: memory: 128Mi\nמה הצעד הראשון?",
            options: [
              "מחק את ה-Pod ויצור אותו מחדש עם RestartPolicy: Never",
              "הגדל limits.memory ל-256Mi+ ובדוק אם האפליקציה דולפת זיכרון",
              "הקטן את מספר ה-replicas כדי לפנות זיכרון ב-Node",
              "הוסף liveness probe לזיהוי מוקדם של צריכת זיכרון חריגה",
            ],
            answer: 1,
            explanation:
              "Exit 137 + OOMKilled = חריגה מlimits.memory. הגדל את הlimit. השתמש בkubectl top pod לראות שימוש אמיתי. בדוק גם memory leak באפליקציה.",
          },
          {
            q: "Job לא הסתיים. kubectl describe job מציג:\nWarning  BackoffLimitExceeded  Job has reached the specified backoff limit\nמה קורה בנגינה?",
            options: [
              "Job ממשיך לרוץ לנצח ומנסה שוב ושוב ללא הגבלה",
              "Job מסומן כFailed – Kubernetes הפסיק לנסות מחדש",
              "כל ה-Pods של ה-Job נמחקים מיד ואוטומטית",
              "Job נמחק אוטומטית מה-Namespace לאחר חריגה מהזמן",
            ],
            answer: 1,
            explanation:
              "BackoffLimitExceeded אומר שJob נכשל backoffLimit פעמים ומסומן Failed. בדוק logs של ה-Pods שנכשלו כדי להבין הסיבה ולתקן.",
          },
          {
            q: "Deployment לא מנהל Pods. kubectl get pods --show-labels מראה: app=backend-v2. ה-Deployment spec:\nspec:\n  selector:\n    matchLabels:\n      app: backend\nמה הבעיה?",
            options: [
              "ה-Namespace של ה-Pods שונה מה-Namespace של ה-Deployment",
              "selector לא תואם labels של Pods – 'backend' ≠ 'backend-v2'",
              "ה-image שגוי וה-Pods לא יכולים לעלות",
              "ה-Service חסר ולכן ה-Deployment לא מזהה את ה-Pods",
            ],
            answer: 1,
            explanation:
              "Deployment.spec.selector.matchLabels חייב להתאים ל-template.metadata.labels. אי-תאימות גורמת ל-Deployment לא לשלוט בPods. שנה selector או label.",
          },
          {
            q: "kubectl rollout status deployment/app מציג:\nWaiting for rollout to finish: 1 old replicas are pending termination...\nזה נמשך 15 דקות. מה בודקים?",
            options: [
              "בודקים אם ה-image של ה-Pod החדש קיים ב-registry",
              "Pod בTerminating בגלל finalizer שלא נוקה, או terminationGracePeriodSeconds גבוה מדי",
              "בודקים DNS resolution מתוך ה-Pod שתקוע",
              "בודקים RBAC permissions של ה-ServiceAccount של ה-Deployment",
            ],
            answer: 1,
            explanation:
              'Pod בTerminating לאורך זמן = finalizer לא נוקה, או grace period ארוך. kubectl describe pod <terminating-pod> לראות finalizers. kubectl patch pod ... -p \'{"metadata":{"finalizers":null}}\' לביטול.',
          },
          {
            q: "VPA ב-Recommendation mode. kubectl describe vpa app-vpa מציג:\nTarget: cpu: 450m, memory: 512Mi\nה-Pod רץ עם requests: cpu: 100m, memory: 128Mi. מה עושים?",
            options: [
              "VPA מעדכן אוטומטית ב-Recommendation mode ואין צורך בפעולה",
              "ה-VPA רק ממליץ – יש לעדכן ידנית את ה-Deployment requests",
              "מוחקים את ה-Pod כדי ש-VPA יוכל ליישם את ההמלצות",
              "מגדילים את מספר ה-replicas כדי לפזר את העומס",
            ],
            answer: 1,
            explanation:
              "VPA Recommendation mode רק מציג המלצות – לא מעדכן. Off/Initial/Auto מעדכנים. יש לעדכן ידנית את ה-Deployment לפי ההמלצה.",
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
              "A DaemonSet ensures one Pod runs on every Node. On a new Node – Pod is added automatically.",
          },
          {
            q: "What is HPA?",
            options: [
              "High Performance App — a Pod configuration optimised for compute-intensive tasks",
              "Horizontal Pod Autoscaler — scales Pods automatically based on CPU/Memory",
              "Host Port Assignment — allocates host ports on Nodes for Pod services",
              "Helm Package Archive — the storage format for packaged Helm charts",
            ],
            answer: 1,
            explanation: "HPA automatically scales the number of Pods based on CPU/Memory load.",
          },
          {
            q: "What does CrashLoopBackOff mean?",
            options: [
              "The Pod has been manually paused and is waiting for administrator approval",
              "Container crashes repeatedly and Kubernetes increases the wait time between restart attempts",
              "The Pod's network interface failed and the CNI cannot assign an IP address",
              "There is insufficient memory on the Node to schedule the Pod",
            ],
            answer: 1,
            explanation:
              "CrashLoopBackOff – the container tries to start, crashes, and tries again.",
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
              "OOMKilled means the container used more memory than its configured limit.",
          },
          {
            q: "What is pod preemption?",
            options: [
              "Deleting Pods that have exceeded their activeDeadlineSeconds time limit",
              "Evicting a lower-priority pending Pod to make room for a higher-priority Pod",
              "Automatic scale-down of Pods when CPU drops below a configured threshold",
              "Restarting a Node after kubelet detects persistent DiskPressure",
            ],
            answer: 1,
            explanation:
              "Preemption — the Scheduler evicts lower-priority Pods so a higher-priority Pod can be scheduled.",
          },
          {
            q: "What does topologySpreadConstraints do?",
            options: [
              "Limits the CPU usage of Pods running in a specific availability Zone",
              "Spreads Pods evenly across Zones/Nodes for high availability",
              "Manages DNS resolution between Pods in different Namespaces",
              "Restricts network traffic between Pods running in different Zones",
            ],
            answer: 1,
            explanation:
              "topologySpreadConstraints defines how Pods are spread across failure domains (Zones, Nodes) for high availability.",
          },
          {
            q: "What is a sidecar container?",
            options: [
              "An init container that runs before the main app and prepares the environment",
              "An extra container in a Pod providing a supporting service like logging or a proxy",
              "A backup version of the main container used for automatic rollback",
              "A separate Pod in a dedicated Namespace providing platform services",
            ],
            answer: 1,
            explanation:
              "A sidecar is an extra container in the same Pod that runs alongside the main app and provides capabilities like log shipping, proxying, or monitoring.",
          },
          {
            q: "What is the Vertical Pod Autoscaler (VPA)?",
            options: [
              "Scales the number of Pods up when CPU exceeds a configured threshold",
              "Automatically adjusts CPU and memory requests for a Pod based on actual usage",
              "Manages Node-level scaling based on cluster-wide resource utilisation",
              "An advanced version of HPA that supports custom metrics and scaling policies",
            ],
            answer: 1,
            explanation:
              "VPA automatically adjusts resource requests/limits based on actual usage, reducing waste and preventing OOM.",
          },
          {
            q: "What is a DaemonSet typically used for?",
            options: [
              "Stateless web servers requiring high replica counts for availability",
              "Agents like log collectors and monitoring tools that need to run on every Node",
              "Batch jobs that require simultaneous access to all Nodes",
              "Load balancers managing traffic routing at the Node level",
            ],
            answer: 1,
            explanation:
              "DaemonSets are used for node-level agents: Fluentd, Prometheus node-exporter, CNI plugins — one per Node.",
          },
          {
            q: "What does PriorityClass determine?",
            options: [
              "Network throughput and traffic rate limits assigned to a Pod",
              "Pod scheduling priority and eligibility for preemption in the cluster",
              "RBAC permissions granted to a Pod's ServiceAccount for API access",
              "StorageClass preference used when the Pod's PVC is dynamically provisioned",
            ],
            answer: 1,
            explanation:
              "PriorityClass sets a Pod's priority. Pods with a higher priorityClassName are scheduled first and can trigger preemption.",
          },
          {
            q: "A Pod stays Pending. kubectl describe shows:\nEvents:\n  Warning  FailedScheduling  0/3 nodes available: 3 node(s) had untolerated taint {dedicated:gpu}.\nWhat is the fix?",
            options: [
              "Add a new untainted Node to the cluster with sufficient resources",
              "Reduce the CPU request so the Pod fits on a smaller available Node",
              "Add a matching toleration to the Pod spec with key:'dedicated', value:'gpu'",
              "Move the Pod to a dedicated Namespace reserved for GPU workloads",
            ],
            answer: 2,
            explanation:
              "The Node has a taint dedicated=gpu. A Pod without a matching Toleration won't be scheduled there. Add tolerations: [{key:'dedicated', value:'gpu', effect:'NoSchedule'}] to the Pod spec.",
          },
          {
            q: "A StatefulSet with 3 replicas: Pod-1 stays Pending. What is the most likely cause?",
            options: [
              "The PVC for pod-1 is full and no additional storage can be allocated",
              "Pod-0 is not Ready — StatefulSet schedules Pods in ordinal order",
              "The Namespace quota has been reached and no new Pod can be created",
              "The imagePullSecret is incorrect and prevents pulling the image for pod-1",
            ],
            answer: 1,
            explanation:
              "StatefulSet schedules Pods sequentially: pod-0 must be Ready before pod-1 starts. Check kubectl get pod pod-0 and kubectl describe pod pod-0 to find the blocker.",
          },
          {
            q: "kubectl get hpa shows:\nNAME    TARGETS         MINPODS  MAXPODS  REPLICAS\napp-hpa  <unknown>/50%   2        10       2\nWhat causes <unknown>?",
            options: [
              "The Deployment the HPA references does not exist in the Namespace",
              "metrics-server is not installed — HPA cannot receive CPU metrics",
              "The CPU limit is not defined in the Pod spec so no percentage can be calculated",
              "The replica count is 0 and there are no Pods reporting metrics",
            ],
            answer: 1,
            explanation:
              "<unknown> in TARGETS means HPA has no metrics. Most common cause: metrics-server is not installed. Check: kubectl get apiservice v1beta1.metrics.k8s.io.",
          },
          {
            q: "A rolling update is stuck. kubectl rollout status shows:\nWaiting for rollout to finish: 3 out of 5 new replicas updated...\nThe YAML sets maxUnavailable: 0. What is the cause?",
            options: [
              "The Namespace quota is full and new Pods cannot be created",
              "New Pods are failing readiness probes, and maxUnavailable:0 prevents removing old ones",
              "The container image is incorrect and kubelet cannot pull it from the registry",
              "An admission webhook TLS certificate is invalid and rejecting new Pod specs",
            ],
            answer: 1,
            explanation:
              "With maxUnavailable:0, K8s can't remove an old Pod until a new one is Ready. If the readiness probe fails, the rollout stalls. Check logs of a new Pod.",
          },
          {
            q: "A DaemonSet Pod is missing from a new Node. kubectl describe node shows:\nTaints: node-role.kubernetes.io/control-plane:NoSchedule\nThe DaemonSet has no tolerations. What is the fix?",
            options: [
              "Delete the Node and re-add it to the cluster without the taint",
              "Change the DaemonSet's Namespace to kube-system where the taint is ignored",
              "Add to DaemonSet spec: tolerations: [{key:'node-role.kubernetes.io/control-plane', effect:'NoSchedule'}]",
              "Reduce the DaemonSet resource requests so they fit within the Node's taint threshold",
            ],
            answer: 2,
            explanation:
              "A NoSchedule taint blocks Pods without a matching Toleration. DaemonSets for system components like logging that need to run on control-plane nodes must include the matching toleration.",
          },
          {
            q: "A Pod keeps getting OOMKilled. kubectl describe shows:\nLast State: Terminated  Reason: OOMKilled  Exit Code: 137\nContainers: limits: memory: 128Mi\nWhat is the first step?",
            options: [
              "Delete the Pod and recreate it with restartPolicy: Never to stop the loop",
              "Increase limits.memory to 256Mi+ and check for memory leaks in the app",
              "Reduce the replica count to free up memory on the Node for the remaining Pod",
              "Add a liveness probe to detect excessive memory consumption before OOMKill",
            ],
            answer: 1,
            explanation:
              "Exit 137 + OOMKilled = limits.memory exceeded. Increase the limit. Use kubectl top pod to see actual usage. Also profile the app for memory leaks.",
          },
          {
            q: "A Job never completed. kubectl describe job shows:\nWarning  BackoffLimitExceeded  Job has reached the specified backoff limit\nWhat happens next?",
            options: [
              "The Job keeps running indefinitely and retries without any limit",
              "Job is marked Failed — Kubernetes stops retrying and the object remains for inspection",
              "All Job Pods are immediately deleted and the Namespace is cleaned up",
              "The Job object is automatically deleted from the Namespace after the failure",
            ],
            answer: 1,
            explanation:
              "BackoffLimitExceeded means the Job failed backoffLimit times and is now marked Failed. Check the failed Pod logs to understand the root cause and fix the issue.",
          },
          {
            q: "A Deployment does not manage its Pods. kubectl get pods --show-labels shows: app=backend-v2. The Deployment spec reads:\nspec:\n  selector:\n    matchLabels:\n      app: backend\nWhat is wrong?",
            options: [
              "The Pods are in a different Namespace than the Deployment",
              "selector doesn't match Pod labels — 'backend' ≠ 'backend-v2'",
              "The container image is wrong and Pods cannot start successfully",
              "The Service is missing so the Deployment cannot discover its Pods",
            ],
            answer: 1,
            explanation:
              "Deployment.spec.selector.matchLabels must match template.metadata.labels. A mismatch means the Deployment doesn't control those Pods. Fix either the selector or the Pod label.",
          },
          {
            q: "kubectl rollout status deployment/app shows:\nWaiting for rollout to finish: 1 old replica pending termination...\nThis has continued for 15 minutes. What do you check?",
            options: [
              "Check whether the container image exists in the registry for the new Pod version",
              "Pod stuck in Terminating due to a finalizer that was not cleared or a high terminationGracePeriodSeconds",
              "Check DNS resolution from within the stuck Pod for any timeout errors",
              "Check RBAC permissions of the Deployment's ServiceAccount for the API calls it needs",
            ],
            answer: 1,
            explanation:
              'A Pod stuck Terminating usually means an uncleared finalizer or a long grace period. kubectl describe pod <terminating-pod> to inspect finalizers. kubectl patch pod ... -p \'{"metadata":{"finalizers":null}}\' to force-clear.',
          },
          {
            q: "VPA is in Recommendation mode. kubectl describe vpa shows:\nTarget: cpu: 450m  memory: 512Mi\nThe Pod runs with requests: cpu: 100m  memory: 128Mi. What must you do?",
            options: [
              "Nothing — VPA updates the Pod's requests automatically in Recommendation mode",
              "VPA only recommends — update the Deployment requests manually to match the target",
              "Delete the Pod so VPA can apply the recommended requests on the next startup",
              "Scale up the replica count so the load is distributed and recommendations become lower",
            ],
            answer: 1,
            explanation:
              "VPA Recommendation mode only shows suggestions — it does not apply them. Only Off/Initial/Auto modes update Pod specs. Update the Deployment requests manually according to the recommendation.",
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
        theory: `Services מספקים כתובת IP יציבה לגישה ל-Pods.\n🔹 ClusterIP – גישה פנימית בלבד (ברירת מחדל)\n🔹 NodePort – חשיפה על port בכל Node\n🔹 LoadBalancer – IP חיצוני ב-cloud\n🔹 Service מוצא Pods לפי labels ו-selector\nCODE:\napiVersion: v1\nkind: Service\nspec:\n  selector:\n    app: my-app\n  ports:\n  - port: 80\n    targetPort: 8080`,
        theoryEn: `Services provide a stable IP for accessing Pods.\n🔹 ClusterIP – internal access only (default)\n🔹 NodePort – exposes on a port on each Node\n🔹 LoadBalancer – external IP in the cloud\n🔹 Service finds Pods by labels and selector\nCODE:\napiVersion: v1\nkind: Service\nspec:\n  selector:\n    app: my-app\n  ports:\n  - port: 80\n    targetPort: 8080`,
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
            explanation: "כשPod מת ונוצר מחדש מקבל IP חדש. Service נותן כתובת קבועה.",
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
            explanation: "LoadBalancer יוצר Load Balancer ב-cloud ומקצה IP חיצוני.",
          },
          {
            q: "מה Service מסוג ClusterIP?",
            options: [
              "חשיפה חיצונית עם IP קבוע שמנתב תנועה לNod ב-cloud",
              "גישה פנימית בלבד בתוך הCluster – ברירת המחדל של Service",
              "DNS חיצוני שמאפשר לPods לגשת לשירותים מחוץ לCluster",
              "VPN שמחבר Pods ב-Clusters שונים לתקשורת מאובטחת",
            ],
            answer: 1,
            explanation: "ClusterIP הוא ברירת המחדל – מאפשר גישה רק בתוך הCluster.",
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
            explanation: "Service משתמש ב-selector כדי למצוא Pods עם labels תואמים.",
          },
          {
            q: "מה טווח הפורטים של NodePort?",
            options: [
              "1-1024 – פורטים מוגדרים לשירותי מערכת",
              "8000-9000 – טווח ייעודי לאפליקציות web",
              "30000-32767 – ברירת המחדל, ניתן לשינוי ב-API server",
              "1024-65535 – כל הפורטים הלא-privileged",
            ],
            answer: 2,
            explanation:
              "NodePort מוקצה בטווח 30000-32767 כברירת מחדל. ניתן לשנות בהגדרות ה-API server.",
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
            q: "מה headless Service?",
            options: [
              "Service ללא selector שמאפשר ניהול Endpoints ידני",
              "Service עם clusterIP: None – מחזיר ישירות IPs של Pods ב-DNS",
              "Service ללא port שמשמש לtunneling בין Namespaces",
              "Service שתומך רק ב-IPv6 ולא ב-IPv4",
            ],
            answer: 1,
            explanation:
              "Headless Service (clusterIP: None) לא מספק load balancing – DNS מחזיר ישירות את IPs של הPods. משמש ל-StatefulSets.",
          },
          {
            q: "מה ExternalName Service?",
            options: [
              "Service שמקצה IP חיצוני קבוע לאפליקציה בCluster",
              "Service שמפנה לשם DNS חיצוני ויוצר CNAME בCluster",
              "LoadBalancer גלובלי שמנתב תנועה בין Clusters",
              "Service שמאפשר לPods מחוץ לCluster לגשת לשירותים פנימיים",
            ],
            answer: 1,
            explanation:
              "ExternalName Service מפנה לשם DNS חיצוני (כמו my-db.example.com) ויוצר CNAME בתוך הCluster.",
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
            q: "כיצד Service מסוג NodePort חושף את האפליקציה?",
            options: [
              "רק בתוך הCluster דרך ClusterIP שנוצר אוטומטית",
              "דרך פורט קבוע על כל Node ב-Cluster שמנתב לService",
              "דרך IP חיצוני שמוקצה על ידי cloud provider",
              "דרך DNS record חיצוני שמפנה לIPים של הNodes",
            ],
            answer: 1,
            explanation:
              "NodePort פותח פורט (30000-32767) על כל Node. תנועה לNode:Port מנותבת ל-Service ואז לPod.",
          },
          {
            q: "מה kube-proxy עושה על כל Node?",
            options: [
              "מנהל DNS resolution עבור Pods ב-Node ומעדכן /etc/resolv.conf",
              "מממש Service networking דרך iptables/IPVS rules שמנתבים לPod IPs",
              "מאמת TLS certificates של תנועה נכנסת ל-Node",
              "מנהל את ה-kubelet process ומוודא שהוא רץ כראוי",
            ],
            answer: 1,
            explanation:
              "kube-proxy שומר iptables/IPVS rules שמנתבים תנועה מ-Service ClusterIP לPod IPs. רץ על כל Node.",
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
          {
            q: "מה CNI plugin עושה ב-Kubernetes?",
            options: [
              "מנהל TLS certificates עבור Services ב-Cluster",
              "מספק network interface לPods ומאפשר תקשורת ביניהם",
              "מנהל DNS resolution עבור Services ב-Namespace",
              "מנהל את ה-kubelet ומוודא שPods מתזמנים בצורה נכונה",
            ],
            answer: 1,
            explanation:
              "CNI (Container Network Interface) plugin מקצה IP לPod, מגדיר network interface, ומממש overlay network לתקשורת בין Pods בNodeים שונים.",
          },
          {
            q: "מה ההבדל בין L4 ל-L7 load balancing ב-Kubernetes?",
            options: [
              "L7 מהיר יותר כי הוא עושה פחות inspections על התנועה",
              "L4 מנתב לפי IP/Port; L7 מנתב לפי HTTP headers, path, hostname",
              "L4 מיועד לHTTPS בלבד, L7 לHTTP בלבד",
              "אין הבדל תפקודי, רק ב-implementation של ה-controller",
            ],
            answer: 1,
            explanation:
              "Service (ClusterIP/NodePort/LB) הוא L4 – מנתב לפי IP ו-Port. Ingress הוא L7 – מנתב לפי HTTP path, headers, ו-hostname.",
          },
          {
            q: "מה ExternalTrafficPolicy ב-Service?",
            options: [
              "מדיניות TLS שקובעת אם Service מצפין תנועה חיצונית",
              "שולט אם תנועה חיצונית עוברת SNAT (Cluster) או מגיעה ישירות לNode (Local)",
              "הגבלת ports מורשים לתנועה חיצונית ל-NodePort",
              "DNS policy שמגדיר את ה-TTL לrecords של Services חיצוניים",
            ],
            answer: 1,
            explanation:
              "ExternalTrafficPolicy: Cluster (ברירת מחדל) – NAT ל-IP הפוד אבל מאבד IP המקורי. Local – שומר IP מקורי אבל רק Nodes עם Pod פועל מקבלים תנועה.",
          },
          {
            q: "מה ה-Endpoint Object ב-Kubernetes?",
            options: [
              "כתובת IP חיצונית שמוקצית ל-Service מסוג LoadBalancer",
              "רשימת IPs ו-ports של Pods שה-Service מנתב אליהם, מתעדכנת אוטומטית",
              "DNS record שמשמש ל-Service Discovery בין Namespaces",
              "TLS certificate שמשמש ל-mutual authentication בין Services",
            ],
            answer: 1,
            explanation:
              "Endpoints object מחזיק את ה-IPs של ה-Pods שעברו readiness ותואמים ל-selector של ה-Service. Service controller מעדכן אותו אוטומטית.",
          },
          {
            q: "מה containerPort ב-Pod spec?",
            options: [
              "Port שה-Service חושף לחוץ ומנתב אליו תנועה",
              "Port שהקונטיינר מאזין עליו – בעיקר לdocumentation, לא חוסם/פותח ports",
              "Port שה-Ingress controller משתמש בו לניתוב HTTP",
              "Port שמוקצה אוטומטית ל-NodePort של ה-Service",
            ],
            answer: 1,
            explanation:
              "containerPort הוא הPort שהקונטיינר מאזין עליו. הוא informational בלבד – לא פותח ports ב-firewall. Network policy ו-Service לא תלויים בו.",
          },
          {
            q: "מה ה-DNS search domain ברירת המחדל בPod?",
            options: [
              "cluster.local בלבד, ללא search domains נוספים",
              "<namespace>.svc.cluster.local, svc.cluster.local, cluster.local",
              "localhost ו-127.0.0.1 לגישה לservices מקומיים",
              "example.com ו-cluster.local לפי הגדרת ה-cluster",
            ],
            answer: 1,
            explanation:
              "K8s מוסיף search domains לresolv.conf של ה-Pod. כך ניתן לכתוב רק 'my-svc' במקום ה-FQDN המלא my-svc.namespace.svc.cluster.local.",
          },
          {
            q: "מה EndpointSlice ב-Kubernetes?",
            options: [
              "גרסה ישנה של Endpoint שעדיין נתמכת לתאימות לאחור",
              "תחליף מדרגי יותר לEndpoints – מגביל ל-100 endpoints לslice לביצועים טובים יותר",
              "Ingress rule שמגדיר ניתוב לפי endpoint ספציפי",
              "NetworkPolicy שמגביל גישה לEndpoints לפי labels",
            ],
            answer: 1,
            explanation:
              "EndpointSlices (ברירת מחדל מK8s 1.21) מחליפים Endpoints ומחלקים אותם ל-slices של 100. מדרגיות טובה יותר לCluster עם אלפי Pods.",
          },
        ],
        questionsEn: [
          {
            q: "Why do we need a Service?",
            options: [
              "To reduce cloud costs by sharing one IP address across multiple Pods in the cluster",
              "Pod IP changes, Service gives a stable IP",
              "To encrypt traffic between Pods running in different Namespaces",
              "To back up Pod configuration before the Pod is deleted",
            ],
            answer: 1,
            explanation:
              "When a Pod dies and is recreated it gets a new IP. A Service provides a permanent address.",
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
              "LoadBalancer creates a Load Balancer in the cloud and assigns an external IP.",
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
            explanation: "ClusterIP is the default – allows access only within the Cluster.",
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
            explanation: "A Service uses a selector to find Pods with matching labels.",
          },
          {
            q: "What port range does NodePort use?",
            options: [
              "1–1024 – reserved for privileged system services on every Node",
              "8000–9000 – a dedicated range reserved for web application NodePorts",
              "30000–32767 – the default range, configurable in API server settings",
              "1024–65535 – all non-privileged ports available for NodePort assignment",
            ],
            answer: 2,
            explanation:
              "NodePort is allocated in the range 30000-32767 by default. This can be changed in API server configuration.",
          },
          {
            q: "What is the difference between port and targetPort in a Service?",
            options: [
              "There is no difference — both define the same port the Service listens and forwards on",
              "port is the Service port; targetPort is the container port",
              "targetPort is used for HTTP traffic only while port handles all other protocols",
              "port governs external traffic routing while targetPort governs internal Service-to-Service traffic",
            ],
            answer: 1,
            explanation:
              "port is the port the Service exposes. targetPort is the port the container listens on. They can differ.",
          },
          {
            q: "What is a headless Service?",
            options: [
              "A Service without a selector that allows manual management of the Endpoints object",
              "A Service with clusterIP: None — returns Pod IPs directly",
              "A Service defined without a port that is used for tunneling between Namespaces",
              "A Service that supports only IPv6 and rejects IPv4 connections",
            ],
            answer: 1,
            explanation:
              "A headless Service (clusterIP: None) provides no load balancing — DNS returns Pod IPs directly. Used with StatefulSets.",
          },
          {
            q: "What is an ExternalName Service?",
            options: [
              "A Service that assigns a permanent external IP to an application inside the cluster",
              "A Service that maps to an external DNS name",
              "A global load balancer that routes traffic between multiple Kubernetes clusters",
              "A Service that allows Pods outside the cluster to reach internal cluster services",
            ],
            answer: 1,
            explanation:
              "An ExternalName Service maps to an external DNS name (e.g. my-db.example.com) by creating a CNAME inside the cluster.",
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
            q: "How does a NodePort Service expose an application?",
            options: [
              "Only within the cluster through its automatically created ClusterIP",
              "Via a port on every Node in the cluster",
              "Via an external IP address assigned by the cloud provider's load balancer",
              "Via an external DNS record pointing to the Node IP addresses",
            ],
            answer: 1,
            explanation:
              "NodePort opens a port (30000-32767) on every Node. Traffic to Node:Port is routed to the Service and then to a Pod.",
          },
          {
            q: "What does kube-proxy do on every Node?",
            options: [
              "Manages DNS resolution for Pods on the Node and updates /etc/resolv.conf",
              "Implements Service networking via iptables/IPVS rules",
              "Validates TLS certificates for inbound traffic arriving at the Node",
              "Manages the kubelet process and ensures it stays running correctly",
            ],
            answer: 1,
            explanation:
              "kube-proxy maintains iptables/IPVS rules that route traffic from a Service ClusterIP to Pod IPs. It runs on every Node.",
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
              "Ingress exposes Services over HTTP/HTTPS with routing by path (/api, /web) or hostname (api.example.com). Saves one LoadBalancer per Service.",
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
              "NetworkPolicy defines access rules: ingress (who can reach the Pod) and egress (where the Pod can send traffic). Requires a supporting CNI plugin.",
          },
          {
            q: "What does a CNI plugin do in Kubernetes?",
            options: [
              "Manages TLS certificates and rotates them automatically for Services in the cluster",
              "Provides network interfaces for Pods and enables communication between them",
              "Manages DNS resolution for Services and updates CoreDNS configuration dynamically",
              "Manages the kubelet and ensures Pods are scheduled to the correct Nodes",
            ],
            answer: 1,
            explanation:
              "A CNI (Container Network Interface) plugin assigns IPs to Pods, sets up network interfaces, and implements the overlay network for Pod-to-Pod communication across Nodes.",
          },
          {
            q: "What is the difference between L4 and L7 load balancing in Kubernetes?",
            options: [
              "L7 load balancing is faster because it performs fewer packet inspections than L4",
              "L4 routes by IP/Port; L7 routes by HTTP headers, path, and hostname",
              "L4 is exclusively for HTTPS traffic while L7 handles only unencrypted HTTP",
              "There is no functional difference — only the controller implementation differs",
            ],
            answer: 1,
            explanation:
              "Service (ClusterIP/NodePort/LB) is L4 — routes by IP and Port. Ingress is L7 — routes by HTTP path, headers, and hostname.",
          },
          {
            q: "What is ExternalTrafficPolicy on a Service?",
            options: [
              "A TLS policy that determines whether the Service encrypts traffic from external clients",
              "Controls whether external traffic is SNATed (Cluster) or arrives directly at the Node (Local)",
              "A restriction on which ports are permitted for external NodePort traffic",
              "A DNS policy that sets the TTL for DNS records of external-facing Services",
            ],
            answer: 1,
            explanation:
              "ExternalTrafficPolicy: Cluster (default) — NATed to Pod IP but original client IP is lost. Local — preserves source IP but only Nodes that have a Pod receive traffic.",
          },
          {
            q: "What is an Endpoint object in Kubernetes?",
            options: [
              "An external IP address assigned to a Service of type LoadBalancer by the cloud provider",
              "A list of IPs and ports of Pods the Service routes to, updated automatically",
              "A DNS record used for Service discovery between Pods in different Namespaces",
              "A TLS certificate used for mutual authentication between Services",
            ],
            answer: 1,
            explanation:
              "The Endpoints object holds the IPs of Ready Pods matching the Service selector. The endpoint controller updates it automatically as Pods start or stop.",
          },
          {
            q: "What is containerPort in a Pod spec?",
            options: [
              "The port the Service exposes externally and routes incoming traffic through",
              "Port the container listens on — primarily for documentation, does not open or block ports",
              "The port the Ingress controller uses when routing HTTP requests to the Pod",
              "The port automatically assigned to the NodePort service linked to this Pod",
            ],
            answer: 1,
            explanation:
              "containerPort documents the port the container listens on. It is informational only — it doesn't create firewall rules. Services and NetworkPolicies work independently of it.",
          },
          {
            q: "What is an EndpointSlice in Kubernetes?",
            options: [
              "An older version of Endpoints still supported for backwards compatibility in legacy clusters",
              "A more scalable replacement for Endpoints — limited to 100 endpoints per slice for better performance",
              "An Ingress rule that defines routing to a specific backend endpoint",
              "A NetworkPolicy rule that restricts access to specific Endpoints by label",
            ],
            answer: 1,
            explanation:
              "EndpointSlices (default from K8s 1.21) replace Endpoints by splitting them into slices of up to 100 entries. Much better scalability in large clusters with thousands of Pods.",
          },
          {
            q: "What happens to traffic when a Service has no Ready Pods?",
            options: [
              "Traffic is queued in the Service and delivered when a Pod becomes Ready",
              "Traffic is dropped — the Service's Endpoints list is empty and there are no backends to route to",
              "Traffic is forwarded to a default backend Pod defined in the cluster configuration",
              "Traffic loops back to the originating Pod as a fallback routing mechanism",
            ],
            answer: 1,
            explanation:
              "When all Pods fail readiness probes, the Endpoints list becomes empty. The Service still exists but all connections are refused. Fix the Pods to restore traffic.",
          },
        ],
      },
      medium: {
        theory: `DNS ו-Ingress.\n🔹 כל Service מקבל DNS אוטומטי: service.namespace.svc.cluster.local\n🔹 Ingress מנתב HTTP/HTTPS לפי path או hostname\n🔹 Ingress חוסך LoadBalancers – כניסה אחת לכל ה-services\n🔹 דורש Ingress Controller (nginx, traefik)\nCODE:\napiVersion: networking.k8s.io/v1\nkind: Ingress\nspec:\n  rules:\n  - host: app.example.com\n    http:\n      paths:\n      - path: /api\n        backend:\n          service:\n            name: api-svc\n            port:\n              number: 80`,
        theoryEn: `DNS and Ingress.\n🔹 Every Service gets automatic DNS: service.namespace.svc.cluster.local\n🔹 Ingress routes HTTP/HTTPS by path or hostname\n🔹 Ingress saves LoadBalancers – one entry point for all services\n🔹 Requires an Ingress Controller (nginx, traefik)\nCODE:\napiVersion: networking.k8s.io/v1\nkind: Ingress\nspec:\n  rules:\n  - host: app.example.com\n    http:\n      paths:\n      - path: /api\n        backend:\n          service:\n            name: api-svc\n            port:\n              number: 80`,
        questions: [
          {
            q: "מה ה-DNS name של service בשם 'api' ב-namespace 'prod'?",
            options: ["api.prod", "api.prod.svc", "api.prod.svc.cluster.local", "prod.api.local"],
            answer: 2,
            explanation: "Format: service.namespace.svc.cluster.local – זה ה-FQDN המלא.",
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
            explanation: "Ingress מאפשר ניתוב חכם דרך כניסה אחת, חוסך LoadBalancers רבים.",
          },
          {
            q: "מה זה Ingress Controller?",
            options: [
              "Plugin של kubectl שמוסיף פקודות ניתוב לממשק הפקודות",
              "ה-Pod שמממש את הIngress rules",
              "שירות ענן שמנהל DNS records עבור Ingress resources",
              "DNS server פנימי שמתרגם hostname rules לkube-proxy rules",
            ],
            answer: 1,
            explanation:
              "Ingress Controller (כמו nginx) הוא ה-Pod שקורא את ה-Ingress resources ומנתב traffic.",
          },
          {
            q: "מה זה Endpoints ב-Kubernetes?",
            options: [
              "כתובות IP של ה-Nodes שעליהם NodePort פועל",
              "כתובות IP של ה-Pods שה-Service מנתב אליהם",
              "פורטים חיצוניים שנחשפים דרך NodePort ב-cloud provider",
              "כתובות DNS שמוקצות אוטומטית לכל Service ב-Cluster",
            ],
            answer: 1,
            explanation: "Endpoints הם רשימת IPs של ה-Pods שה-Service מנתב אליהם, מתעדכן אוטומטית.",
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
              "path-based routing מאפשר /api → service-api, /web → service-web דרך Ingress אחד.",
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
            explanation: "egress NetworkPolicy מגדיר לאיזה יעדים Pod מורשה לשלוח תנועה.",
          },
          {
            q: "מה service mesh פותר?",
            options: [
              "ניהול Storage volumes בין microservices ב-Cluster",
              "mTLS, observability, traffic management בין microservices",
              "DNS resolution אוטומטי עבור Services ב-Namespaces שונים",
              "RBAC מורחב שמגדיר הרשאות ברמת Service",
            ],
            answer: 1,
            explanation:
              "Service mesh (Istio, Linkerd) מספק mTLS אוטומטי, tracing, ו-traffic management בין services.",
          },
          {
            q: "מה multi-port Service?",
            options: [
              "Service שמכסה כמה Namespaces ומנתב לפי Namespace המקור",
              "Service שחושף יותר מפורט אחד (כגון HTTP:80 וHTTPS:443)",
              "Service שמנתב לכמה Clusters שונים דרך ExternalName entries",
              "Service שמגדיר כמה selectors שונים לכל port",
            ],
            answer: 1,
            explanation:
              "Multi-port Service מאפשר לחשוף כמה פורטים בService אחד. כל פורט חייב לקבל name.",
          },
          {
            q: "מה sessionAffinity ב-Service?",
            options: [
              "מנהל TLS sessions ומחדש אותן אוטומטית כשתעודה פגה",
              "מנתב בקשות מאותו client לאותו Pod",
              "מגביל את מספר ה-sessions הפעילות ל-Pod בו-זמנית",
              "שומר credentials של חיבור ומשתמש בהם לאימות מחדש",
            ],
            answer: 1,
            explanation:
              "sessionAffinity: ClientIP מבטיח שבקשות מאותו IP תמיד מגיעות לאותו Pod (sticky sessions).",
          },
          {
            q: "מה ההבדל בין NetworkPolicy ingress ל-egress?",
            options: [
              "ingress מוגדר לפרוטוקול HTTP בלבד, egress לפרוטוקול HTTPS בלבד",
              "ingress מגדיר תנועה נכנסת לPod, egress תנועה יוצאת מPod",
              "ingress חל על Nodes ומגביל תנועה ברמת Node, egress חל על Pods בלבד",
              "אין הבדל מעשי – שניהם מגבילים תנועה לפי labels ו-ports",
            ],
            answer: 1,
            explanation:
              "ingress מגדיר מי מורשה לתקשר עם ה-Pod. egress מגדיר לאן ה-Pod מורשה לשלוח. ניתן להגדיר שניהם יחד ב-policyTypes.",
          },
          {
            q: "כיצד Ingress מנתב לפי hostname?",
            options: [
              "לפי port שעליו מגיעה הבקשה, ממופה ב-spec.ports של ה-Ingress",
              "spec.rules[].host: api.example.com – מנתב תנועה לhostname ספציפי לService",
              "spec.host בשורש ה-Ingress spec מגדיר hostname בודד לכל ה-rules",
              "דרך ConfigMap שמגדיר מיפוי של hostnames לServices",
            ],
            answer: 1,
            explanation:
              "בIngress spec: rules: [{host: 'api.example.com', http: {paths: [{backend: ...}]}}] מנתב בקשות לhostname זה לService המוגדר.",
          },
          {
            q: "מה Service ללא selector (manual Endpoints)?",
            options: [
              "Service שנמחק אוטומטית כי selector חסר ו-K8s מזהה אותו כשגיאה",
              "Service שמאפשר לנהל ידנית את Endpoints – שימושי לחיבור ל-DB חיצוני",
              "Service ישן שנוצר בגרסה קודמת ואינו תואם ל-API הנוכחי",
              "Service שמשמש כגיבוי כשה-Service הראשי לא זמין",
            ],
            answer: 1,
            explanation:
              "Service ללא selector לא יוצר Endpoints אוטומטית. יוצרים Endpoints object ידנית עם IPs חיצוניים. שימושי לmigration או external services.",
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
              "Local: source IP נשמר + hop אחד פחות, אבל Nodes ללא Pod מקבלים תנועה שנדחית. Cluster: SNAT מאזן לכל Nodes אבל מאבד source IP.",
          },
          {
            q: "מה ההבדל בין Ingress pathType: Exact ל-Prefix?",
            options: [
              "Exact מיועד לHTTPS בלבד, Prefix לHTTP בלבד",
              "Exact מתאים רק ל-path המדויק; Prefix מתאים לpath ולכל תת-paths שלו",
              "Prefix מהיר יותר כי הוא עושה פחות path comparisons",
              "אין הבדל – שניהם מתאימים לאותו path בצורה זהה",
            ],
            answer: 1,
            explanation:
              "Exact: /api → רק /api. Prefix: /api → /api, /api/v1, /api/users. ImplementationSpecific תלוי ב-controller.",
          },
          {
            q: "מה ההבדל בין kube-proxy iptables ל-IPVS?",
            options: [
              "IPVS מיועד לסביבות ענן בלבד ולא עובד ב-on-premise",
              "iptables linear scan; IPVS hash table – IPVS מהיר הרבה יותר בClusters עם אלפי Services",
              "iptables יציב יותר מ-IPVS ומומלץ לproduction",
              "IPVS דורש גרסת Kubernetes חדשה יותר מ-1.24",
            ],
            answer: 1,
            explanation:
              "עם iptables, כל packet עובר scan לינארי דרך כל הRules. IPVS משתמש בhash tables – O(1) במקום O(n). קריטי בCluster גדול.",
          },
          {
            q: "מה ה-DNS ndots:5 עושה ב-Pod?",
            options: [
              "מגביל את מספר ה-DNS queries ש-Pod יכול לבצע לשנייה",
              "מגדיר שQuery עם פחות מ-5 נקודות תנסה search domains קודם",
              "מגביל את גודל ה-DNS cache לפי מספר הnodes",
              "מגדיר את ה-TTL ל-5 שניות לכל DNS records של Services",
            ],
            answer: 1,
            explanation:
              "ndots:5 (ברירת מחדל) מציין שQuery ללא מינימום 5 נקודות תנסה קודם את search domains המוגדרים (namespace.svc.cluster.local וכו').",
          },
          {
            q: "מה namespaceSelector ב-NetworkPolicy?",
            options: [
              "בוחר Namespace שאליו לפרוס את ה-NetworkPolicy",
              "מאפשר לסנן תנועה לפי Namespace המקור/יעד",
              "בוחר ServiceAccount שה-NetworkPolicy חל עליו",
              "מגדיר DNS policy עבור כל Pods ב-Namespace",
            ],
            answer: 1,
            explanation:
              "namespaceSelector בNetworkPolicy מאפשר לאשר/לחסום תנועה מ-Namespaces ספציפיים. משלב עם podSelector לfine-grained control.",
          },
          {
            q: "מה Ingress annotation nginx.ingress.kubernetes.io/rewrite-target?",
            options: [
              "מגדיר TLS termination ומציין את ה-Secret שמכיל את ה-certificate",
              "מגדיר timeout לבקשות שנשלחות לbackend מה-Ingress",
              "מאפשר לrewrite את ה-URL path לפני שמועבר לbackend",
              "מגדיר rate limit על מספר הבקשות לשנייה",
            ],
            answer: 2,
            explanation:
              "rewrite-target: / גורם לIngress לשלוח /api/v1 → / לbackend. שימושי כשbackend לא מצפה לprefix.",
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
            options: ["api.prod", "api.prod.svc", "api.prod.svc.cluster.local", "prod.api.local"],
            answer: 2,
            explanation: "Format: service.namespace.svc.cluster.local – this is the full FQDN.",
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
              "Ingress enables smart routing through one entry point, saving multiple LoadBalancers.",
          },
          {
            q: "What is an Ingress Controller?",
            options: [
              "A kubectl plugin that adds routing commands to the CLI interface",
              "The Pod that implements the Ingress rules",
              "A cloud-managed service that stores and manages DNS records for Ingress",
              "An internal DNS server that translates Ingress hostname rules to kube-proxy rules",
            ],
            answer: 1,
            explanation:
              "An Ingress Controller (like nginx) is the Pod that reads Ingress resources and routes traffic.",
          },
          {
            q: "What are Endpoints in Kubernetes?",
            options: [
              "IP addresses of Nodes that NodePort traffic can reach in the cluster",
              "IP addresses of the Pods the Service routes to",
              "External ports exposed through NodePort on the cloud provider firewall",
              "DNS addresses automatically assigned to every Service in the cluster",
            ],
            answer: 1,
            explanation:
              "Endpoints are the list of IPs of Pods that the Service routes to, updated automatically.",
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
              "An egress NetworkPolicy defines which destinations a Pod is allowed to send traffic to.",
          },
          {
            q: "What does a service mesh solve?",
            options: [
              "Managing storage volumes shared between microservices in the cluster",
              "mTLS, observability, and traffic management between microservices",
              "Automatic DNS resolution for Services across different Namespaces",
              "Extended RBAC that enforces permissions at the individual Service level",
            ],
            answer: 1,
            explanation:
              "A service mesh (Istio, Linkerd) provides automatic mTLS, distributed tracing, and traffic management between services.",
          },
          {
            q: "What is a multi-port Service?",
            options: [
              "A Service that spans multiple Namespaces and routes based on the source Namespace",
              "A Service exposing more than one port (e.g. HTTP:80 and HTTPS:443)",
              "A Service that routes traffic to multiple different Kubernetes clusters",
              "A Service that defines separate selectors for each port it exposes",
            ],
            answer: 1,
            explanation:
              "A multi-port Service exposes several ports in one Service definition. Each port must have a name.",
          },
          {
            q: "What is sessionAffinity in a Service?",
            options: [
              "Manages TLS sessions and rotates them automatically when the certificate expires",
              "Routes requests from the same client to the same Pod",
              "Limits the number of concurrent sessions allowed per Pod at one time",
              "Stores client credentials and reuses them to re-authenticate future connections",
            ],
            answer: 1,
            explanation:
              "sessionAffinity: ClientIP ensures requests from the same IP always reach the same Pod (sticky sessions).",
          },
          {
            q: "What is the difference between NetworkPolicy ingress and egress?",
            options: [
              "ingress applies to HTTP-only connections while egress applies to HTTPS connections",
              "ingress defines inbound traffic to the Pod; egress defines outbound traffic from the Pod",
              "ingress applies at the Node level while egress applies only at the Pod level",
              "There is no practical difference — both restrict traffic using the same label selectors",
            ],
            answer: 1,
            explanation:
              "ingress defines who is allowed to communicate with the Pod. egress defines where the Pod is allowed to send traffic. Both can be specified together in policyTypes.",
          },
          {
            q: "How does Ingress route by hostname?",
            options: [
              "By the port on which the request arrives, mapped in spec.ports of the Ingress",
              "spec.rules[].host: api.example.com — routes traffic for that hostname to the Service",
              "spec.host at the root of the Ingress spec defines a single hostname for all rules",
              "Via a ConfigMap that maps hostname entries to backend Service names",
            ],
            answer: 1,
            explanation:
              "In Ingress spec: rules: [{host: 'api.example.com', http: {paths: [{backend: ...}]}}] routes requests matching that hostname to the configured Service.",
          },
          {
            q: "What is a Service without a selector (manual Endpoints)?",
            options: [
              "A Service that is automatically deleted because Kubernetes treats a missing selector as an error",
              "A Service that lets you manually manage Endpoints — useful for connecting to external DBs",
              "An outdated Service definition created in an older API version no longer compatible",
              "A backup Service that activates automatically when the primary Service becomes unavailable",
            ],
            answer: 1,
            explanation:
              "A Service without a selector doesn't auto-create Endpoints. You create an Endpoints object manually with external IPs. Useful for migrations or external services.",
          },
          {
            q: "What is ExternalTrafficPolicy:Local vs Cluster?",
            options: [
              "Local is always faster because it completely bypasses the kube-proxy NAT layer",
              "Local preserves the source IP but only Nodes with an active Pod receive traffic; Cluster SNATs traffic",
              "Cluster mode is for cloud deployments only while Local is for on-premises environments",
              "There is no practical difference between the two modes — only the naming differs",
            ],
            answer: 1,
            explanation:
              "Local: source IP preserved + one fewer hop, but Nodes without a Pod drop traffic. Cluster: SNAT balances across all Nodes but loses source IP.",
          },
          {
            q: "What is the difference between Ingress pathType: Exact and Prefix?",
            options: [
              "Exact is for HTTPS-only paths while Prefix is for HTTP-only paths",
              "Exact matches only that exact path; Prefix matches that path and all sub-paths",
              "Prefix performs routing faster because it needs fewer path comparison operations",
              "There is no difference — both types match requests to the same set of paths identically",
            ],
            answer: 1,
            explanation:
              "Exact: /api → only /api. Prefix: /api → /api, /api/v1, /api/users. ImplementationSpecific behavior depends on the controller.",
          },
          {
            q: "What is the difference between kube-proxy iptables and IPVS?",
            options: [
              "IPVS mode is only available in cloud-managed Kubernetes clusters",
              "iptables uses linear scan; IPVS uses hash tables — IPVS is much faster in large clusters",
              "iptables is more stable and recommended over IPVS for production workloads",
              "IPVS requires a Kubernetes version newer than 1.24 to function correctly",
            ],
            answer: 1,
            explanation:
              "With iptables, every packet scans through rules linearly. IPVS uses hash tables — O(1) instead of O(n). Critical in large clusters with thousands of Services.",
          },
          {
            q: "What does DNS ndots:5 do in a Pod?",
            options: [
              "Limits the number of DNS queries a Pod is allowed to make per second",
              "Specifies that queries with fewer than 5 dots try search domains first",
              "Limits the size of the DNS cache based on the number of cluster Nodes",
              "Sets the TTL to 5 seconds for all DNS records belonging to Services",
            ],
            answer: 1,
            explanation:
              "ndots:5 (default) means queries with fewer than 5 dots will try the configured search domains first (e.g., namespace.svc.cluster.local) before the absolute query.",
          },
          {
            q: "What is namespaceSelector in a NetworkPolicy?",
            options: [
              "Selects which Namespace to deploy the NetworkPolicy into",
              "Allows filtering traffic by the source/destination Namespace",
              "Selects the ServiceAccount that the NetworkPolicy applies to",
              "Configures the DNS search domain for all Pods in the Namespace",
            ],
            answer: 1,
            explanation:
              "namespaceSelector in a NetworkPolicy filters traffic from/to specific Namespaces. Combined with podSelector it provides fine-grained access control.",
          },
          {
            q: "What does the Ingress annotation nginx.ingress.kubernetes.io/rewrite-target do?",
            options: [
              "Configures TLS termination and specifies the Secret holding the certificate",
              "Sets a request timeout for connections forwarded from the Ingress to the backend",
              "Rewrites the URL path before forwarding to the backend",
              "Sets rate limiting on the maximum number of requests per second",
            ],
            answer: 2,
            explanation:
              "rewrite-target: / causes the Ingress to send /api/v1 as / to the backend. Useful when the backend doesn't expect the path prefix.",
          },
          {
            q: "How do you debug why a Service is not reaching its Pods?",
            options: [
              "kubectl logs service/<name> to view connection logs from the Service",
              "Check kubectl get endpoints <service> — if empty, selector doesn't match labels",
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
        theory: `Network Policies ו-Namespaces.\n🔹 ברירת מחדל: כל Pod יכול לדבר עם כל Pod (allow-all)\n🔹 NetworkPolicy מגביל תנועה בין Pods\n🔹 דורש CNI plugin תומך (Calico, Cilium)\n🔹 Namespaces – בידוד לוגי: dev/staging/production\nCODE:\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nspec:\n  podSelector: {}\n  policyTypes:\n  - Ingress\n  - Egress`,
        theoryEn: `Network Policies and Namespaces.\n🔹 Default: every Pod can talk to every Pod (allow-all)\n🔹 NetworkPolicy restricts traffic between Pods\n🔹 Requires a supporting CNI plugin (Calico, Cilium)\n🔹 Namespaces – logical isolation: dev/staging/production\nCODE:\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nspec:\n  podSelector: {}\n  policyTypes:\n  - Ingress\n  - Egress`,
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
            explanation: "ברירת מחדל ב-Kubernetes היא allow-all.",
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
            explanation: "NetworkPolicy דורש CNI plugin תומך. kubenet לא מממש NetworkPolicies!",
          },
          {
            q: "מה מטרת Namespace?",
            options: [
              "אחסון קבצים ותיקיות של אפליקציה ב-persistent storage",
              "בידוד לוגי של משאבים",
              "ניהול passwords וcredentials לגישה לשירותים",
              "DNS גלובלי שמשתף names בין כל ה-Clusters",
            ],
            answer: 1,
            explanation: "Namespaces מספקים בידוד לוגי – הפרדה בין צוותים, פרויקטים, או סביבות.",
          },
          {
            q: "מה ResourceQuota עושה?",
            options: [
              "מגבב את כל המשאבים ב-Namespace לדיווח יעיל",
              "מגביל את סך המשאבים שNamespace יכול להשתמש",
              "מנטר שימוש במשאבים ושולח התראות כשמגיעים ל-threshold",
              "מחלק resources שווה בין כל ה-Pods ב-Namespace",
            ],
            answer: 1,
            explanation: "ResourceQuota מגביל את סך ה-CPU, Memory, Pods שNamespace יכול לצרוך.",
          },
          {
            q: "מה CNI?",
            options: [
              "Container Network Interface – סטנדרט לplugins של רשת",
              "Cloud Native Infrastructure – מסגרת לניהול cloud resources",
              "Cluster Node Index – מפתח לזיהוי Nodes ב-Cluster",
              "Container Name Interface – ממשק לניהול שמות Pods",
            ],
            answer: 0,
            explanation:
              "CNI הוא סטנדרט שמגדיר כיצד plugins מגדירים רשת לPods. Calico, Flannel, Cilium הם CNI plugins.",
          },
          {
            q: "מה kube-proxy עושה?",
            options: [
              "משמש כProxy לבקשות לAPI server ומגן מפני עומס",
              "מממש Service networking על ידי ניהול iptables/IPVS rules",
              "משמש כDNS resolver ומתרגם Service names ל-Pod IPs",
              "מנהל TLS certificates ומחדש אותם אוטומטית",
            ],
            answer: 1,
            explanation:
              "kube-proxy רץ על כל Node ומתחזק iptables/IPVS rules שמנתבים תנועה ל-Service IPs ל-Pod IPs.",
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
            q: "מה Cilium מספק מעבר לCNI רגיל?",
            options: [
              "DNS resolution בלבד עם cache מהיר יותר מ-CoreDNS",
              "Network policies מבוססות eBPF עם observability ואבטחה מתקדמת",
              "StorageClass דינמי לPVs מבוסס eBPF",
              "Ingress controller עם TLS termination מובנה",
            ],
            answer: 1,
            explanation:
              "Cilium משתמש ב-eBPF לאכיפת NetworkPolicy ברמת kernel עם ביצועים גבוהים ו-visibility מלאה.",
          },
          {
            q: "מה מטרת network namespace ב-Linux?",
            options: [
              "אחסון קבצים ותיקיות של process ב-isolation sandbox",
              "בידוד ממשקי רשת וrouting tables בין processes",
              "ניהול DNS resolution עבור processes ספציפיים",
              "הגבלת bandwidth ושליטה ב-QoS ברמת process",
            ],
            answer: 1,
            explanation:
              "כל Pod ב-Kubernetes מקבל network namespace משלו עם ממשק רשת וrouting table נפרד.",
          },
          {
            q: "כיצד Pods בNodes שונים מתקשרים?",
            options: [
              "לא ניתן – Pods חייבים להיות על אותו Node לתקשורת ישירה",
              "דרך overlay network (VXLAN/Geneve) שיוצר ה-CNI plugin",
              "רק דרך Services – תקשורת ישירה בין Pod IPs חסומה",
              "דרך LoadBalancer חיצוני שמנתב תנועה בין Nodes",
            ],
            answer: 1,
            explanation:
              "CNI plugin יוצר overlay network (VXLAN ב-Flannel, BGP ב-Calico) שמאפשר לכל Pod להגיע לכל Pod ב-Cluster.",
          },
          {
            q: "Service לא מנתב תנועה לPods. kubectl get endpoints app-svc מציג:\nNAME      ENDPOINTS\napp-svc   <none>\nה-Pod רץ עם label: app=App (A גדולה). ה-Service:\nspec:\n  selector:\n    app: app\nמה הבעיה?",
            options: [
              "Service port שגוי",
              "selector לא תואם – 'app: app' ≠ 'app: App' (רגישות לrcase)",
              "Pod לא Ready",
              "Namespace שגוי",
            ],
            answer: 1,
            explanation:
              "Kubernetes labels רגישים לrcase. 'app' ≠ 'App'. Service selector חייב לתאים בדיוק ל-Pod labels. תקן את ה-selector ל-app: App.",
          },
          {
            q: "NetworkPolicy חוסמת DNS. Pods לא מצליחים לפתור שמות. NetworkPolicy:\nspec:\n  podSelector: {}\n  policyTypes: [Egress]\n  egress:\n  - ports:\n    - port: 443\nמה חסר?",
            options: [
              "ingress rule",
              "egress rule לport 53 (DNS) לCoreDNS",
              "TLS certificate",
              "namespaceSelector",
            ],
            answer: 1,
            explanation:
              "NetworkPolicy שמגדירה egress חייבת לכלול port 53 TCP+UDP לCoreDNS. ללא זה, DNS queries נחסמות. הוסף egress: [{ports: [{port:53,protocol:UDP},{port:53,protocol:TCP}]}].",
          },
          {
            q: "Ingress מחזיר 503. kubectl describe ingress מציג:\nBackend: api-svc:80 (<error: endpoints not found>)\nמה הבעיה?",
            options: [
              "Ingress Controller לא מותקן",
              "Service api-svc לא קיים או selector לא מתאים לPods",
              "TLS שגוי",
              "Namespace שגוי",
            ],
            answer: 1,
            explanation:
              "<error: endpoints not found> אומר ש-Service קיים אבל Endpoints ריקים (Pods לא תואמים). בדוק kubectl get endpoints api-svc ו-kubectl get pods --show-labels.",
          },
          {
            q: "Pod מנסה לגשת ל-api-svc.backend.svc.cluster.local ולא מצליח, אך api-svc.backend עובד. מה השם הנכון?",
            options: [
              "api-svc.backend הוא הFQDN",
              "FQDN מלא הוא api-svc.backend.svc.cluster.local",
              "FQDN מלא הוא api-svc.backend.cluster.local",
              "שם ה-DNS חייב להיות IP",
            ],
            answer: 1,
            explanation:
              "FQDN מלא: <service>.<namespace>.svc.cluster.local. api-svc.backend עובד בזכות search domains. api-svc.backend.cluster.local (ללא svc) לא יפעל.",
          },
          {
            q: "Service עם ExternalTrafficPolicy:Local. בקשות חיצוניות נדחות לסירוגין. kubectl get pods -o wide מציג שPods רצים רק ב-node-1 ו-node-2. מה הסיבה?",
            options: [
              "Service לא מוגדר נכון",
              "Nodes ללא Pod (node-3) מקבלים תנועה ולא מנתבים – node-3 דוחה תנועה",
              "TLS שגוי",
              "Load Balancer שגוי",
            ],
            answer: 1,
            explanation:
              "ExternalTrafficPolicy:Local מנתב רק לNode שמכיל Pod. עם LB/NodePort, תנועה ל-Node ללא Pod מוחזרת עם connection refused. צריך health check מה-LB לדעת אילו Nodes פעילים.",
          },
          {
            q: "kubectl get ingress מציג:\nNAME      CLASS    HOSTS   ADDRESS\napp-ing   <none>   *       \nIngress לא עובד. מה הסיבה הסבירה?",
            options: [
              "TLS שגוי",
              "ingressClassName לא מוגדר והIngress Controller לא מטפל ב-Ingresses ללא class",
              "Service חסר",
              "Namespace שגוי",
            ],
            answer: 1,
            explanation:
              "מגרסת K8s 1.18+ Ingress Controller מחפש ingressClassName. ללא הגדרה, Controller לא יטפל ב-Ingress. הוסף: spec: ingressClassName: nginx.",
          },
          {
            q: "NetworkPolicy:\nspec:\n  podSelector:\n    matchLabels:\n      app: frontend\n  ingress:\n  - from:\n    - namespaceSelector:\n        matchLabels:\n          team: backend\nPod backend רץ ב-namespace עם label team:backend. הוא לא מצליח לגשת ל-frontend. מה בודקים?",
            options: [
              "port חסר",
              "ה-Namespace אכן מכיל label team:backend – בדוק kubectl get namespace <ns> --show-labels",
              "Pod לא Ready",
              "ingress חסר TLS",
            ],
            answer: 1,
            explanation:
              "namespaceSelector מחפש label על ה-Namespace עצמו. בדוק kubectl get namespace <ns> --show-labels. אם label חסר, הוסף: kubectl label namespace <ns> team=backend.",
          },
          {
            q: "Pod לא מצליח להגיע לאינטרנט. kubectl exec -- curl https://google.com מחזיר timeout. NetworkPolicy:\nspec:\n  podSelector: {matchLabels: {app: worker}}\n  policyTypes: [Egress]\n  egress:\n  - to:\n    - podSelector: {}\nמה חסר?",
            options: [
              "ingress rule",
              "egress ל-0.0.0.0/0 (כל IPs) חסר – NetworkPolicy חוסמת תנועה לChיצון",
              "DNS port",
              "Service חסר",
            ],
            answer: 1,
            explanation:
              "egress: [{podSelector:{}}] מאפשר רק לPods בCluster. תנועה לIPs חיצוניים חסומה. הוסף: egress: [{to:[{ipBlock:{cidr:'0.0.0.0/0'}}]}] וכן port 53 לDNS.",
          },
          {
            q: "Pod מנסה להגיע ל-Service ב-Namespace אחר בשם 'db-svc' ב-namespace 'data'. הוא מנסה: curl db-svc. זה נכשל. מה הפתרון?",
            options: [
              "הוסף NetworkPolicy",
              "השתמש בFQDN: curl db-svc.data.svc.cluster.local",
              "שנה Namespace",
              "הוסף Service ב-namespace הנוכחי",
            ],
            answer: 1,
            explanation:
              "search domains עובדים רק בNamespace הנוכחי. לגישה לService בNamespace אחר חייבים להשתמש בFQDN: db-svc.data.svc.cluster.local.",
          },
          {
            q: "Ingress Controller nginx רץ. בקשות ל-/api מחזירות 404 מה-backend. ה-Ingress:\npath: /api\nbackend: api-svc:8080\nה-backend מאזין על /. מה חסר?",
            options: [
              "TLS certificate",
              "annotation rewrite-target: / – ללא זה backend מקבל /api ולא /",
              "Service חסר",
              "pathType שגוי",
            ],
            answer: 1,
            explanation:
              "ללא rewrite-target, nginx מעביר /api ישירות לbackend. אם הbackend מאזין על / ולא /api, הוא יחזיר 404. הוסף: nginx.ingress.kubernetes.io/rewrite-target: /",
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
            explanation: "By default in Kubernetes it is allow-all.",
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
              "NetworkPolicy requires a supporting CNI plugin. kubenet does not implement NetworkPolicies!",
          },
          {
            q: "What is the purpose of a Namespace?",
            options: [
              "Storing application files and directories in persistent cluster storage",
              "Logical isolation of resources",
              "Managing passwords and credentials for access to external services",
              "Global DNS that shares names across all clusters in the organization",
            ],
            answer: 1,
            explanation:
              "Namespaces provide logical isolation – separation between teams, projects, or environments.",
          },
          {
            q: "What does ResourceQuota do?",
            options: [
              "Aggregates all resources in a Namespace for efficient reporting",
              "Limits total resources a Namespace can use",
              "Monitors resource usage and sends alerts when thresholds are reached",
              "Distributes resources equally among all Pods in the Namespace",
            ],
            answer: 1,
            explanation:
              "ResourceQuota limits the total CPU, Memory, and Pods a Namespace can consume.",
          },
          {
            q: "What is CNI?",
            options: [
              "Container Network Interface — standard for networking plugins",
              "Cloud Native Infrastructure — a framework for managing cloud resources",
              "Cluster Node Index — a key used to identify Nodes in the cluster",
              "Container Name Interface — an interface for managing Pod names",
            ],
            answer: 0,
            explanation:
              "CNI is a standard defining how plugins configure networking for Pods. Calico, Flannel, and Cilium are CNI plugins.",
          },
          {
            q: "What does kube-proxy do?",
            options: [
              "Acts as a proxy for API server requests to protect it from overload",
              "Implements Service networking by managing iptables/IPVS rules",
              "Resolves DNS and translates Service names to Pod IPs",
              "Manages TLS certificates and renews them automatically on every Node",
            ],
            answer: 1,
            explanation:
              "kube-proxy runs on every Node and maintains iptables/IPVS rules that route Service IPs to Pod IPs.",
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
              "IPVS uses hash tables instead of iptables linear chains — much better performance with thousands of Services.",
          },
          {
            q: "What does Cilium provide beyond standard CNI?",
            options: [
              "Faster DNS resolution only, using a cache faster than CoreDNS",
              "eBPF-based network policies with advanced observability and security",
              "Dynamic StorageClass provisioning for PVs using eBPF",
              "An Ingress controller with built-in TLS termination support",
            ],
            answer: 1,
            explanation:
              "Cilium uses eBPF to enforce NetworkPolicy at the kernel level with high performance and full network visibility.",
          },
          {
            q: "What is the purpose of a Linux network namespace?",
            options: [
              "Storing files and directories of a process in an isolation sandbox",
              "Isolating network interfaces and routing tables between processes",
              "Managing DNS resolution for specific processes only",
              "Limiting bandwidth and controlling QoS at the process level",
            ],
            answer: 1,
            explanation:
              "Every Pod in Kubernetes gets its own network namespace with a separate network interface and routing table.",
          },
          {
            q: "How do Pods on different Nodes communicate?",
            options: [
              "They cannot — Pods must be on the same Node for direct communication",
              "Via an overlay network (VXLAN/Geneve) created by the CNI plugin",
              "Only via Services — direct Pod-to-Pod IP communication is blocked",
              "Via an external LoadBalancer that routes traffic between Nodes",
            ],
            answer: 1,
            explanation:
              "The CNI plugin creates an overlay network (VXLAN in Flannel, BGP in Calico) that lets every Pod reach every other Pod in the cluster.",
          },
          {
            q: "A Service returns no traffic. kubectl get endpoints app-svc shows:\nNAME      ENDPOINTS\napp-svc   <none>\nThe Pod runs with label: app=App (capital A). The Service:\nspec:\n  selector:\n    app: app\nWhat is the problem?",
            options: [
              "Wrong Service port",
              "Selector mismatch — 'app: app' ≠ 'app: App' (case sensitive)",
              "Pod not Ready",
              "Wrong Namespace",
            ],
            answer: 1,
            explanation:
              "Kubernetes labels are case sensitive. 'app' ≠ 'App'. The Service selector must match Pod labels exactly. Fix the selector to app: App.",
          },
          {
            q: "A NetworkPolicy blocks DNS. Pods cannot resolve names. The policy:\nspec:\n  podSelector: {}\n  policyTypes: [Egress]\n  egress:\n  - ports:\n    - port: 443\nWhat is missing?",
            options: [
              "An ingress rule",
              "An egress rule for port 53 (DNS) to CoreDNS",
              "A TLS certificate",
              "A namespaceSelector",
            ],
            answer: 1,
            explanation:
              "An egress-only NetworkPolicy must include port 53 TCP+UDP for CoreDNS. Without it, DNS queries are blocked. Add: egress: [{ports: [{port:53,protocol:UDP},{port:53,protocol:TCP}]}].",
          },
          {
            q: "Ingress returns 503. kubectl describe ingress shows:\nBackend: api-svc:80 (<error: endpoints not found>)\nWhat is wrong?",
            options: [
              "Ingress Controller not installed",
              "Service api-svc exists but selector doesn't match Pods",
              "Wrong TLS",
              "Wrong Namespace",
            ],
            answer: 1,
            explanation:
              "<error: endpoints not found> means the Service exists but Endpoints are empty (no matching Pods). Check kubectl get endpoints api-svc and kubectl get pods --show-labels.",
          },
          {
            q: "A Pod tries to access api-svc.backend.svc.cluster.local and fails, but api-svc.backend works. What is the correct FQDN?",
            options: [
              "api-svc.backend is the FQDN",
              "The full FQDN is api-svc.backend.svc.cluster.local",
              "The full FQDN is api-svc.backend.cluster.local",
              "DNS names must be IPs",
            ],
            answer: 1,
            explanation:
              "Full FQDN: <service>.<namespace>.svc.cluster.local. api-svc.backend works because of search domain expansion. api-svc.backend.cluster.local (missing 'svc') will not resolve.",
          },
          {
            q: "A Service has ExternalTrafficPolicy:Local. External requests are intermittently dropped. kubectl get pods -o wide shows Pods run only on node-1 and node-2. What is happening?",
            options: [
              "Service misconfigured",
              "Nodes without a Pod (node-3) receive traffic but can't route it — node-3 drops connections",
              "Wrong TLS",
              "Load Balancer misconfigured",
            ],
            answer: 1,
            explanation:
              "ExternalTrafficPolicy:Local only routes traffic to Nodes that have a Pod. Traffic hitting a Node without a Pod is rejected. The load balancer must use health checks to only send traffic to Nodes with a running Pod.",
          },
          {
            q: "kubectl get ingress shows:\nNAME      CLASS    HOSTS   ADDRESS\napp-ing   <none>   *\nIngress is not working. What is the likely cause?",
            options: [
              "Wrong TLS",
              "ingressClassName is not set and the Ingress Controller ignores Ingresses without a class",
              "Missing Service",
              "Wrong Namespace",
            ],
            answer: 1,
            explanation:
              "From K8s 1.18+, Ingress Controllers look for ingressClassName. Without it, the controller may ignore the Ingress. Add: spec: ingressClassName: nginx.",
          },
          {
            q: "A NetworkPolicy:\nspec:\n  podSelector:\n    matchLabels:\n      app: frontend\n  ingress:\n  - from:\n    - namespaceSelector:\n        matchLabels:\n          team: backend\nA backend Pod runs in a namespace labeled team:backend but cannot reach frontend. What do you check?",
            options: [
              "Missing port",
              "Verify the Namespace actually has the label team:backend — run kubectl get namespace <ns> --show-labels",
              "Pod not Ready",
              "Missing TLS on ingress",
            ],
            answer: 1,
            explanation:
              "namespaceSelector matches labels on the Namespace object itself. Run kubectl get namespace <ns> --show-labels. If the label is missing, add it: kubectl label namespace <ns> team=backend.",
          },
          {
            q: "A Pod cannot reach the internet. kubectl exec -- curl https://google.com times out. NetworkPolicy:\nspec:\n  podSelector: {matchLabels: {app: worker}}\n  policyTypes: [Egress]\n  egress:\n  - to:\n    - podSelector: {}\nWhat is missing?",
            options: [
              "An ingress rule",
              "An egress rule to 0.0.0.0/0 is missing — the policy blocks external traffic",
              "DNS port",
              "A missing Service",
            ],
            answer: 1,
            explanation:
              "egress: [{podSelector:{}}] only permits traffic to cluster Pods. External IP traffic is blocked. Add: egress: [{to:[{ipBlock:{cidr:'0.0.0.0/0'}}]}] and also port 53 for DNS.",
          },
          {
            q: "A Pod tries to reach a Service 'db-svc' in namespace 'data' using: curl db-svc. It fails. What is the fix?",
            options: [
              "Add a NetworkPolicy",
              "Use the FQDN: curl db-svc.data.svc.cluster.local",
              "Change Namespace",
              "Add a Service in the current namespace",
            ],
            answer: 1,
            explanation:
              "DNS search domains only expand within the current Namespace. To reach a Service in another Namespace you must use the FQDN: db-svc.data.svc.cluster.local.",
          },
          {
            q: "The nginx Ingress Controller is running. Requests to /api return 404 from the backend. The Ingress:\npath: /api\nbackend: api-svc:8080\nThe backend listens at /. What is missing?",
            options: [
              "A TLS certificate",
              "The annotation rewrite-target: / — without it the backend receives /api instead of /",
              "Missing Service",
              "Wrong pathType",
            ],
            answer: 1,
            explanation:
              "Without rewrite-target, nginx forwards /api unchanged to the backend. If the backend listens at / not /api, it returns 404. Add: nginx.ingress.kubernetes.io/rewrite-target: /",
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
        theory: `ConfigMap ו-Secret מפרידים קוד מקונפיגורציה.\n🔹 ConfigMap – הגדרות רגילות (DB_URL, timeout)\n🔹 Secret – נתונים רגישים (passwords, tokens)\n🔹 Secrets מקודדים ב-base64 (לא מוצפנים לחלוטין!)\n🔹 שניהם: env variables או volume\nCODE:\napiVersion: v1\nkind: ConfigMap\ndata:\n  DB_URL: postgres://db:5432\n  MAX_CONN: "100"`,
        theoryEn: `ConfigMap and Secret separate code from configuration.\n🔹 ConfigMap – regular settings (DB_URL, timeout)\n🔹 Secret – sensitive data (passwords, tokens)\n🔹 Secrets are base64 encoded (not fully encrypted by default!)\n🔹 Both: env variables or volume\nCODE:\napiVersion: v1\nkind: ConfigMap\ndata:\n  DB_URL: postgres://db:5432\n  MAX_CONN: "100"`,
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
            explanation: "Secret מיועד לנתונים רגישים. ConfigMap לקונפיגורציה רגילה.",
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
              "Secrets מקודדים ב-base64 בלבד – לא מוצפנים! צריך Sealed Secrets לאבטחה אמיתית.",
          },
          {
            q: "כיצד משתמשים ב-ConfigMap ב-Pod?",
            options: [
              "רק כקובץ – מוסיפים דרך volume ואין דרך אחרת לגשת לnתונים",
              "רק כenv variables ישירות ב-containers spec ולא בצורות אחרות",
              "כenv variables או כvolume files",
              "לא ניתן – Pod ניגש ל-ConfigMap רק דרך Kubernetes API call",
            ],
            answer: 2,
            explanation: "ConfigMap ניתן לטעון כenv variables, כvolume עם קבצים, או דרך API.",
          },
          {
            q: "מה זה imagePullSecrets?",
            options: [
              "Secret שמאחסן connection string לdatabase בCluster",
              "Secret לגישה ל-private container registry",
              "Secret שמאחסן TLS certificate לIngress controller",
              "Secret שמאחסן SSH keys לגישה לgit repositories",
            ],
            answer: 1,
            explanation:
              "imagePullSecrets מאפשר ל-Kubernetes להוריד images מ-private registries כמו ECR.",
          },
          {
            q: "כיצד יוצרים ConfigMap מקובץ?",
            options: [
              "kubectl create configmap my-cm --from-literal=key=value שבו שם הקובץ הוא ה-value",
              "kubectl create configmap my-cm --from-file=config.properties",
              "kubectl apply configmap my-cm --source=config.properties",
              "kubectl generate configmap my-cm --input=config.properties",
            ],
            answer: 1,
            explanation: "--from-file יוצר ConfigMap שמפתח הוא שם הקובץ והערך הוא תוכנו.",
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
              "כל Namespace מכיל ServiceAccount בשם 'default'. Pods שלא מציינים ServiceAccount מקבלים אותו אוטומטית.",
          },
          {
            q: "מה Secret מסוג Opaque?",
            options: [
              "Secret שמוצפן עם כלי חיצוני לפני שמירה ב-etcd",
              "Secret כללי – לכל נתון שרירותי",
              "Secret שמיועד לTLS certificates בלבד",
              "Secret שמיועד לpasswords בלבד ולא לסוגי data אחרים",
            ],
            answer: 1,
            explanation: "Opaque הוא ה-type הברירת מחדל לSecrets – לכל נתון שרירותי בbase64.",
          },
          {
            q: "כיצד מזריקים את כל keys של ConfigMap כ-env variables?",
            options: [
              "envFrom: configMapRef",
              "env: configMapRef בcontainer spec",
              "mountEnv: configmap בvolumes section",
              "injectConfig: all ב-Pod annotations",
            ],
            answer: 0,
            explanation:
              "envFrom: - configMapRef: name: my-cm מזריק את כל ה-keys בבת אחת כ-environment variables.",
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
              "RBAC = Role Based Access Control – מנגנון הרשאות ב-Kubernetes המבוסס על Roles ו-Bindings.",
          },
          {
            q: "מה הפקודה לבדוק הרשאות של המשתמש הנוכחי?",
            options: [
              "kubectl check-auth --show-all-permissions",
              "kubectl auth can-i list pods",
              "kubectl permissions --user=current",
              "kubectl whoami --show-rbac-roles",
            ],
            answer: 1,
            explanation:
              "kubectl auth can-i [verb] [resource] בודק אם המשתמש הנוכחי יכול לבצע פעולה. --as=user בודק עבור משתמש אחר.",
          },
          {
            q: "כיצד יוצרים Secret מסוג generic מ-command line?",
            options: [
              "kubectl create secret generic my-secret --from-literal=key=val",
              "kubectl apply secret my-secret --type=generic --key=key=val",
              "kubectl new secret generic my-secret --value=key=val",
              "kubectl secret create --name=my-secret --data=key=val",
            ],
            answer: 0,
            explanation:
              "kubectl create secret generic my-secret --from-literal=password=abc123 יוצר Secret. ניתן גם --from-file=./secret.txt. ב-base64 אוטומטית.",
          },
          {
            q: "מה Secret מסוג kubernetes.io/tls?",
            options: [
              "Secret לאחסון TLS certificates לתקשורת פנימית בין Pods בלבד",
              "Secret מובנה לאחסון TLS certificate ו-key – tls.crt ו-tls.key",
              "Secret לאחסון SSH private keys לגישה לgit repositories",
              "Secret לpasswords בלבד שמוגן עם hashing מיוחד",
            ],
            answer: 1,
            explanation:
              "kubernetes.io/tls Secret מכיל tls.crt (certificate) ו-tls.key (private key). משמש ב-Ingress ו-admission webhooks לTLS.",
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
              "LimitRange מגדיר: default requests/limits לcontainers שלא מגדירים, ומגבלות min/max לresources. מונע Pods ללא limits.",
          },
          {
            q: "האם ConfigMap ב-Namespace אחד נגיש לPod ב-Namespace אחר?",
            options: [
              "כן, כברירת מחדל – כל ConfigMap גלוי לכל ה-Pods ב-Cluster",
              "לא – ConfigMap שייך לNamespace ספציפי",
              "כן, עם ClusterRole שנותן גישת get על configmaps",
              "כן, עם label מיוחד על ConfigMap שפותח גישה cross-namespace",
            ],
            answer: 1,
            explanation:
              "ConfigMaps (וSecrets) הם Namespaced objects. Pod יכול לגשת רק לConfigMaps בNamespace שלו.",
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
              "runAsNonRoot: true גורם לKubernetes לסרב להפעיל קונטיינר אם ה-image ריץ root (UID 0). עוזר למנוע privilege escalation.",
          },
          {
            q: "מה readOnlyRootFilesystem: true עושה ב-securityContext?",
            options: [
              "מגביל קריאת environment variables מ-Secrets בזמן ריצה",
              "מונע כתיבה ל-root filesystem של הקונטיינר",
              "מצפין את ה-volumes המחוברים לקונטיינר",
              "מגביל DNS queries מהקונטיינר",
            ],
            answer: 1,
            explanation:
              "readOnlyRootFilesystem: true הופך את ה-filesystem של הקונטיינר לread-only. האפליקציה יכולה לכתוב רק ל-volumes מוגדרים.",
          },
          {
            q: "מה volume projection?",
            options: [
              "גיבוי של volume ל-snapshot בנקודת זמן נתונה",
              "שילוב מספר מקורות (Secret, ConfigMap, ServiceAccount token) ל-volume אחד",
              "יצירת snapshot של volume לrestore עתידי",
              "replication של volume לכמה Nodes לavailability",
            ],
            answer: 1,
            explanation:
              "projected volume מאפשר לשלב Secret, ConfigMap, ו-ServiceAccountToken ל-volume יחיד. שימושי לapplications שצריכות כמה מקורות.",
          },
          {
            q: "מה הפקודה לראות את כל ConfigMaps ב-Namespace?",
            options: [
              "kubectl show configmaps --all",
              "kubectl get configmaps",
              "kubectl list configmaps --namespace current",
              "kubectl describe configmaps --names-only",
            ],
            answer: 1,
            explanation:
              "kubectl get configmaps (קיצור: kubectl get cm) מציג כל ConfigMaps בNamespace הנוכחי. הוסף -n לNamespace אחר.",
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
              "requests קובעים את הscaling של ה-Scheduler (מה מובטח). limits קובעים את המקסימום – חריגה מlimits.memory = OOMKill, חריגה מlimits.cpu = throttling.",
          },
          {
            q: "מה subjectAccessReview ב-Kubernetes?",
            options: [
              "בדיקת DNS",
              "API call שבודק אם subject (user/SA) יכול לבצע פעולה על resource",
              "סוג Role",
              "סוג Binding",
            ],
            answer: 1,
            explanation:
              "SubjectAccessReview הוא API שמאפשר לבדוק הרשאות programmatically. kubectl auth can-i משתמש בו מאחורי הקלעים.",
          },
        ],
        questionsEn: [
          {
            q: "What is the difference between ConfigMap and Secret?",
            options: [
              "No difference — both store key-value data identically in etcd",
              "Secret is intended for sensitive data",
              "ConfigMap is faster because it skips base64 encoding",
              "Secret is only for passwords and not for other sensitive data types",
            ],
            answer: 1,
            explanation:
              "Secret is intended for sensitive data. ConfigMap is for regular configuration.",
          },
          {
            q: "Are Secrets fully encrypted by default?",
            options: [
              "Yes, Kubernetes always encrypts Secrets at rest with AES-256 by default",
              "No, only base64 encoded by default",
              "Depends on the Kubernetes version — encrypted automatically from v1.25 onwards",
              "Yes, with AES-256 configured automatically during cluster installation",
            ],
            answer: 1,
            explanation:
              "Secrets are only base64 encoded by default – not encrypted! Sealed Secrets needed for true security.",
          },
          {
            q: "How can a ConfigMap be used in a Pod?",
            options: [
              "Only as a file mounted via a volume — no other access method is supported",
              "Only as env variables injected directly in the containers spec",
              "As env variables or volume files",
              "Not possible — a Pod accesses ConfigMap data only via Kubernetes API calls",
            ],
            answer: 2,
            explanation:
              "A ConfigMap can be loaded as env variables, as a volume with files, or via the API.",
          },
          {
            q: "What is imagePullSecrets?",
            options: [
              "A Secret that stores a database connection string in the cluster",
              "Secret for accessing a private container registry",
              "A Secret that stores a TLS certificate for the Ingress controller",
              "A Secret that stores SSH keys for accessing git repositories",
            ],
            answer: 1,
            explanation:
              "imagePullSecrets allows Kubernetes to pull images from private registries like ECR.",
          },
          {
            q: "How do you create a ConfigMap from a file?",
            options: [
              "kubectl create configmap my-cm --from-literal=key=value where the filename is the value",
              "kubectl create configmap my-cm --from-file=config.properties",
              "kubectl apply configmap my-cm --source=config.properties",
              "kubectl generate configmap my-cm --input=config.properties",
            ],
            answer: 1,
            explanation:
              "--from-file creates a ConfigMap where the key is the filename and the value is its content.",
          },
          {
            q: "What is the default ServiceAccount?",
            options: [
              "admin — a ServiceAccount with full admin permissions in every Namespace",
              "default",
              "kubernetes — a ServiceAccount named after the cluster itself",
              "root — a ServiceAccount that runs Pods with root privileges",
            ],
            answer: 1,
            explanation:
              "Every Namespace contains a ServiceAccount named 'default'. Pods that don't specify a ServiceAccount get it automatically.",
          },
          {
            q: "What is a Secret of type Opaque?",
            options: [
              "A Secret encrypted with an external tool before being stored in etcd",
              "A generic secret for arbitrary data",
              "A Secret exclusively for TLS certificates and nothing else",
              "A Secret for passwords only, not other types of sensitive data",
            ],
            answer: 1,
            explanation:
              "Opaque is the default Secret type — for any arbitrary base64-encoded data.",
          },
          {
            q: "How do you inject all ConfigMap keys as environment variables?",
            options: [
              "envFrom: configMapRef",
              "env: configMapRef in the container spec",
              "mountEnv: configmap in the volumes section",
              "injectConfig: all in Pod annotations",
            ],
            answer: 0,
            explanation:
              "envFrom: - configMapRef: name: my-cm injects all keys at once as environment variables.",
          },
          {
            q: "What does RBAC stand for?",
            options: [
              "Role Based Access Control",
              "Resource Based Auth Configuration — a cloud-level permission mechanism",
              "Runtime Binary Access Control — runtime security for binaries",
              "Recursive Binding Access Control — hierarchical binding management",
            ],
            answer: 0,
            explanation:
              "RBAC = Role Based Access Control — Kubernetes' permission mechanism based on Roles and Bindings.",
          },
          {
            q: "What command checks the current user's permissions?",
            options: [
              "kubectl check-auth --show-all-permissions",
              "kubectl auth can-i list pods",
              "kubectl permissions --current-user",
              "kubectl whoami --show-rbac-roles",
            ],
            answer: 1,
            explanation:
              "kubectl auth can-i [verb] [resource] checks if the current user can perform an action. Use --as=user to check for another user.",
          },
          {
            q: "How do you create a generic Secret from the command line?",
            options: [
              "kubectl create secret generic my-secret --from-literal=key=val",
              "kubectl apply secret my-secret --type=generic --key=key=val",
              "kubectl new secret generic my-secret --value=key=val",
              "kubectl secret create --name=my-secret --data=key=val",
            ],
            answer: 0,
            explanation:
              "kubectl create secret generic my-secret --from-literal=password=abc123 creates a Secret. You can also use --from-file=./secret.txt. Values are automatically base64 encoded.",
          },
          {
            q: "What is a Secret of type kubernetes.io/tls?",
            options: [
              "A TLS Secret for Pod-to-Pod internal communication only",
              "A built-in Secret for storing a TLS certificate and key — tls.crt and tls.key",
              "A Secret for storing SSH private keys for git repository access",
              "A Secret for passwords only, protected with a special hashing algorithm",
            ],
            answer: 1,
            explanation:
              "kubernetes.io/tls Secrets store tls.crt (certificate) and tls.key (private key). Used by Ingress and admission webhooks for TLS termination.",
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
              "LimitRange sets default requests/limits for containers that don't specify them, and enforces min/max constraints. Prevents Pods from running without resource limits.",
          },
          {
            q: "Is a ConfigMap in one Namespace accessible from a Pod in a different Namespace?",
            options: [
              "Yes, by default — all ConfigMaps are visible to every Pod in the cluster",
              "No — ConfigMaps are Namespace-scoped",
              "Yes, with a ClusterRole that grants get on configmaps",
              "Yes, with a special label on the ConfigMap that enables cross-namespace access",
            ],
            answer: 1,
            explanation:
              "ConfigMaps (and Secrets) are Namespace-scoped objects. A Pod can only access ConfigMaps in its own Namespace.",
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
              "runAsNonRoot: true causes Kubernetes to refuse to start the container if the image runs as root (UID 0). Helps prevent privilege escalation.",
          },
          {
            q: "What does readOnlyRootFilesystem: true do in a securityContext?",
            options: [
              "Restricts reading environment variables from Secrets at runtime",
              "Prevents writing to the container's root filesystem",
              "Encrypts the volumes attached to the container",
              "Limits DNS queries from within the container",
            ],
            answer: 1,
            explanation:
              "readOnlyRootFilesystem: true makes the container's filesystem read-only. The application can only write to explicitly mounted volumes.",
          },
          {
            q: "What is a projected volume?",
            options: [
              "A point-in-time backup of a volume to a snapshot",
              "Combining multiple sources (Secret, ConfigMap, ServiceAccount token) into a single volume",
              "Creating a volume snapshot for future restore operations",
              "Replicating a volume to multiple Nodes for high availability",
            ],
            answer: 1,
            explanation:
              "A projected volume merges Secret, ConfigMap, and ServiceAccountToken into one mount point. Useful for applications that need multiple sources.",
          },
          {
            q: "What command lists all ConfigMaps in a Namespace?",
            options: [
              "kubectl show configmaps --all",
              "kubectl get configmaps",
              "kubectl list configmaps --namespace current",
              "kubectl describe configmaps --names-only",
            ],
            answer: 1,
            explanation:
              "kubectl get configmaps (short: kubectl get cm) lists all ConfigMaps in the current Namespace. Add -n to target another Namespace.",
          },
          {
            q: "What is the difference between resource requests and limits?",
            options: [
              "No difference — requests and limits are always set to the same value",
              "requests — the minimum the Scheduler guarantees; limits — the maximum the container can use",
              "requests define CPU only while limits define memory only",
              "requests are for production workloads; limits are for dev and staging",
            ],
            answer: 1,
            explanation:
              "requests define the Scheduler's allocation guarantee. limits define the maximum — exceeding limits.memory causes OOMKill; exceeding limits.cpu causes CPU throttling.",
          },
          {
            q: "What is a SubjectAccessReview in Kubernetes?",
            options: [
              "A DNS resolution check for a Service in the Namespace",
              "An API call that checks if a subject (user/SA) can perform an action on a resource",
              "A type of Role that defines permissions for multiple subjects",
              "A type of Binding that links a Role to multiple subjects at once",
            ],
            answer: 1,
            explanation:
              "SubjectAccessReview is an API that allows programmatic permission checks. kubectl auth can-i uses it behind the scenes.",
          },
        ],
      },
      medium: {
        theory: `RBAC – Role-Based Access Control.\n🔹 Role – הרשאות בNamespace אחד\n🔹 ClusterRole – הרשאות לכל הCluster\n🔹 RoleBinding – קושר Role למשתמש/ServiceAccount\n🔹 ServiceAccount – זהות לPod בתוך הCluster\nCODE:\napiVersion: rbac.authorization.k8s.io/v1\nkind: Role\nrules:\n- apiGroups: [""]\n  resources: ["pods"]\n  verbs: ["get","list","watch"]`,
        theoryEn: `RBAC – Role-Based Access Control.\n🔹 Role – permissions in one Namespace\n🔹 ClusterRole – permissions across the whole Cluster\n🔹 RoleBinding – binds a Role to a user/ServiceAccount\n🔹 ServiceAccount – identity for a Pod within the Cluster\nCODE:\napiVersion: rbac.authorization.k8s.io/v1\nkind: Role\nrules:\n- apiGroups: [""]\n  resources: ["pods"]\n  verbs: ["get","list","watch"]`,
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
              "Role מגדיר הרשאות בNamespace ספציפי. ClusterRole מגדיר הרשאות ברמת הCluster.",
          },
          {
            q: "מה זה RoleBinding?",
            options: [
              "יצירת Role חדש",
              "חיבור בין Role למשתמש/ServiceAccount",
              "העתקת Role",
              "מחיקת Role",
            ],
            answer: 1,
            explanation: "RoleBinding קושר Role למשתמש, group, או ServiceAccount.",
          },
          {
            q: "מה זה ServiceAccount?",
            options: [
              "חשבון למשתמש אנושי",
              "זהות לPod/תהליך בתוך הCluster",
              "שם לService",
              "חשבון billing",
            ],
            answer: 1,
            explanation: "ServiceAccount מספק זהות לPods בתוך הCluster לאימות מול Kubernetes API.",
          },
          {
            q: "מה verb מאפשר מעקב בזמן אמת?",
            options: ["get", "list", "watch", "monitor"],
            answer: 2,
            explanation: "verb 'watch' מאפשר stream של שינויים בזמן אמת (כמו kubectl get pods -w).",
          },
          {
            q: "מה Pod Security Admission?",
            options: [
              "Firewall לPods",
              "מנגנון Kubernetes מגרסה 1.25 שאוכף Pod Security Standards (privileged/baseline/restricted)",
              "Plugin לאימות",
              "Network policy",
            ],
            answer: 1,
            explanation:
              "Pod Security Admission מחליף PodSecurityPolicy. מוגדר ברמת Namespace עם label pod-security.kubernetes.io/enforce.",
          },
          {
            q: "מה admission webhook?",
            options: [
              "Webhook לgit",
              "HTTP callback שמופעל לפני/אחרי יצירת resource ב-API server",
              "Service account",
              "Plugin לlogging",
            ],
            answer: 1,
            explanation:
              "Admission webhooks (Validating/Mutating) מאפשרים לogic חיצוני לאמת או לשנות resources לפני שנשמרים ב-etcd.",
          },
          {
            q: "מה immutable Secret/ConfigMap?",
            options: [
              "לא ניתן לעדכן",
              "Secret שמוצפן",
              "Secret שניתן לקרוא בלבד",
              "Secret שנמחק אחרי שימוש",
            ],
            answer: 0,
            explanation:
              "immutable: true מונע שינויים. יתרון: K8s לא צריך לנטר שינויים, חוסך load על ה-API server.",
          },
          {
            q: "מה IRSA ב-AWS EKS?",
            options: [
              "Integrated Role System Architecture",
              "IAM Roles for Service Accounts – מאפשר לPods הרשאות AWS ללא credentials",
              "Internal Route Service Adapter",
              "Image Registry Service Auth",
            ],
            answer: 1,
            explanation:
              "IRSA מאפשר לPods ב-EKS לקבל credentials זמניים מ-AWS IAM דרך ServiceAccount annotations.",
          },
          {
            q: "כיצד מונעים שServiceAccount ימאונט אוטומטית?",
            options: [
              "לא ניתן",
              "automountServiceAccountToken: false בPod spec",
              "serviceAccount: none",
              "disableMount: true",
            ],
            answer: 1,
            explanation:
              "automountServiceAccountToken: false מונע את mount ה-token של ServiceAccount לקונטיינר. מומלץ לPods שלא צריכים API access.",
          },
          {
            q: "מה ClusterRoleBinding לעומת RoleBinding?",
            options: [
              "אין הבדל",
              "RoleBinding מגביל ל-Namespace, ClusterRoleBinding תקף לכל ה-Cluster",
              "ClusterRoleBinding לadmins בלבד",
              "RoleBinding לusers, ClusterRoleBinding לServiceAccounts",
            ],
            answer: 1,
            explanation:
              "RoleBinding מחיל Role/ClusterRole על Namespace ספציפי. ClusterRoleBinding מחיל ClusterRole על כל ה-Cluster.",
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
              "LimitRange מגדיר ברירות מחדל ומגבלות per-Pod/Container. ResourceQuota מגדיר מגבלות aggregate לNamespace (מקסימום סך-Pods, CPU, Memory).",
          },
          {
            q: "מה PSA label pod-security.kubernetes.io/enforce?",
            options: [
              "מגדיר DNS policy",
              "מגדיר את רמת Pod Security Standards לNamespace",
              "מגביל replica count",
              "מגדיר StorageClass",
            ],
            answer: 1,
            explanation:
              "הוסף לNamespace: kubectl label ns my-ns pod-security.kubernetes.io/enforce=restricted. K8s ידחה Pods שמפרים את הstandard. רמות: privileged, baseline, restricted.",
          },
          {
            q: "מה ClusterRole aggregation?",
            options: [
              "מיזוג שני Clusters",
              "שילוב כמה ClusterRoles לאחד גדול דרך aggregationRule ו-labels",
              "copy של ClusterRole",
              "ClusterRole לכמה Namespaces",
            ],
            answer: 1,
            explanation:
              "aggregationRule מאפשר ליצור ClusterRole מצטבר. כל ClusterRole עם label מסוים מתווסף אוטומטית. משמש לadmin roles composite.",
          },
          {
            q: "מה kubectl auth can-i --list עושה?",
            options: [
              "מציג רשימת users",
              "מציג את כל הפעולות שהמשתמש הנוכחי מורשה לבצע בNamespace",
              "מציג ClusterRoles",
              "מציג ServiceAccounts",
            ],
            answer: 1,
            explanation:
              "kubectl auth can-i --list מציג רשימה מלאה של resources ופעולות שהמשתמש הנוכחי יכול לבצע. עם --namespace לsScope.",
          },
          {
            q: "מה bound service account token?",
            options: [
              "Token שקשור ל-Secret",
              "Token שקשור לPod ספציפי, מוגבל בזמן, ומחייב audience – מאובטח יותר מtoken ישן",
              "Token בלתי מוגבל",
              "Token לadmin בלבד",
            ],
            answer: 1,
            explanation:
              "מגרסת K8s 1.21+ tokens הם bounded – מוגבלים בזמן, Pod, ו-audience. לא ניתן להשתמש בhם מחוץ לPod. מאובטח הרבה יותר מstatic ServiceAccount secrets.",
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
              "seccomp (secure computing mode) מגביל את system calls. Pod spec: securityContext.seccompProfile.type: RuntimeDefault מיישם הגנה מפני syscalls מסוכנות.",
          },
          {
            q: "מה AppArmor ב-Kubernetes?",
            options: [
              "Firewall plugin",
              "Linux security module שמגביל פעולות process, מוגדר כannotation על Pod",
              "DNS security",
              "Network policy",
            ],
            answer: 1,
            explanation:
              "AppArmor profile מגביל מה process יכול לעשות. ב-K8s: annotation container.apparmor.security.beta.kubernetes.io/<container>: runtime/default.",
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
              "External Secrets Operator: יוצרים SecretStore (מגדיר access לAWS) ו-ExternalSecret (מגדיר מה לסנכרן ולאיפה). K8s Secret נוצר אוטומטית.",
          },
          {
            q: "מה allow-all NetworkPolicy?",
            options: [
              "NetworkPolicy שנוצרת אוטומטית",
              "אין כזה – K8s allow-all הוא ברירת המחדל; כדי לפתוח שוב אחרי deny יוצרים policy עם ingress: [{}]",
              "חסימה כוללת",
              "רק לnamespace אחד",
            ],
            answer: 1,
            explanation:
              "לאחר default-deny, כדי לאפשר כל תנועה נכנסת: ingress: [{}] (רשימה עם אלמנט ריק = allow all). לא NetworkPolicy מיוחד.",
          },
          {
            q: "מה Namespace label pod-security.kubernetes.io/warn?",
            options: [
              "מגביל תנועה",
              "מציג אזהרה אבל לא חוסם Pods שמפרים PSA standard",
              "מגדיר DNS",
              "מגדיר TLS",
            ],
            answer: 1,
            explanation:
              "warn mode מוסיף warning בcreation/update אבל לא דוחה Pods. שימושי לtest PSA לפני enforce mode.",
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
              "Role defines permissions in a specific Namespace. ClusterRole defines permissions cluster-wide.",
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
            explanation: "RoleBinding binds a Role to a user, group, or ServiceAccount.",
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
              "ServiceAccount provides identity to Pods for authentication with the Kubernetes API.",
          },
          {
            q: "What verb allows real-time watching?",
            options: ["get", "list", "watch", "monitor"],
            answer: 2,
            explanation:
              "The 'watch' verb allows a stream of real-time changes (like kubectl get pods -w).",
          },
          {
            q: "What is Pod Security Admission?",
            options: [
              "A Pod firewall",
              "A Kubernetes mechanism (v1.25+) enforcing Pod Security Standards (privileged/baseline/restricted)",
              "An auth plugin",
              "A network policy",
            ],
            answer: 1,
            explanation:
              "Pod Security Admission replaced PodSecurityPolicy. Configured at Namespace level with label pod-security.kubernetes.io/enforce.",
          },
          {
            q: "What is an admission webhook?",
            options: [
              "A git webhook",
              "An HTTP callback triggered before/after resource creation in the API server",
              "A service account",
              "A logging plugin",
            ],
            answer: 1,
            explanation:
              "Admission webhooks (Validating/Mutating) allow external logic to validate or modify resources before they're persisted in etcd.",
          },
          {
            q: "What is an immutable Secret or ConfigMap?",
            options: [
              "Cannot be updated",
              "An encrypted secret",
              "A read-only secret",
              "A secret deleted after use",
            ],
            answer: 0,
            explanation:
              "immutable: true prevents changes. Benefit: K8s doesn't need to watch for changes, reducing load on the API server.",
          },
          {
            q: "What is IRSA in AWS EKS?",
            options: [
              "Integrated Role System Architecture",
              "IAM Roles for Service Accounts — gives Pods AWS permissions without static credentials",
              "Internal Route Service Adapter",
              "Image Registry Service Auth",
            ],
            answer: 1,
            explanation:
              "IRSA allows Pods in EKS to receive temporary AWS IAM credentials via ServiceAccount annotations.",
          },
          {
            q: "How do you prevent a ServiceAccount token from being auto-mounted?",
            options: [
              "Not possible",
              "automountServiceAccountToken: false in the Pod spec",
              "serviceAccount: none",
              "disableMount: true",
            ],
            answer: 1,
            explanation:
              "automountServiceAccountToken: false prevents the ServiceAccount token from being mounted into the container. Recommended for Pods that don't need API access.",
          },
          {
            q: "What is the difference between ClusterRoleBinding and RoleBinding?",
            options: [
              "No difference",
              "RoleBinding is Namespace-scoped; ClusterRoleBinding applies cluster-wide",
              "ClusterRoleBinding is for admins only",
              "RoleBinding for users, ClusterRoleBinding for ServiceAccounts",
            ],
            answer: 1,
            explanation:
              "RoleBinding applies a Role/ClusterRole to a specific Namespace. ClusterRoleBinding applies a ClusterRole across the entire cluster.",
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
              "LimitRange sets per-Pod/Container defaults and constraints. ResourceQuota sets aggregate limits for a Namespace (total Pods, CPU, Memory across all workloads).",
          },
          {
            q: "What does the PSA label pod-security.kubernetes.io/enforce do?",
            options: [
              "Sets DNS policy",
              "Sets the Pod Security Standard enforcement level for a Namespace",
              "Limits replica count",
              "Sets StorageClass",
            ],
            answer: 1,
            explanation:
              "Add to a Namespace: kubectl label ns my-ns pod-security.kubernetes.io/enforce=restricted. K8s will reject Pods that violate the standard. Levels: privileged, baseline, restricted.",
          },
          {
            q: "What is ClusterRole aggregation?",
            options: [
              "Merging two Clusters",
              "Combining multiple ClusterRoles into one via aggregationRule and labels",
              "Copying a ClusterRole",
              "A ClusterRole for multiple Namespaces",
            ],
            answer: 1,
            explanation:
              "aggregationRule creates a composite ClusterRole. Any ClusterRole with a matching label is automatically merged in. Used for building composite admin roles.",
          },
          {
            q: "What does kubectl auth can-i --list do?",
            options: [
              "Lists users",
              "Lists all actions the current user is allowed to perform in the Namespace",
              "Lists ClusterRoles",
              "Lists ServiceAccounts",
            ],
            answer: 1,
            explanation:
              "kubectl auth can-i --list shows every resource and verb the current user can access. Add --namespace to scope to a specific Namespace.",
          },
          {
            q: "What is a bound ServiceAccount token?",
            options: [
              "A token tied to a Secret",
              "A token tied to a specific Pod, time-limited, and audience-scoped — much more secure than legacy tokens",
              "An unlimited token",
              "An admin-only token",
            ],
            answer: 1,
            explanation:
              "From K8s 1.21+, tokens are bounded — they expire, are scoped to the Pod, and require a specific audience. They cannot be used outside the Pod. Far more secure than static ServiceAccount Secrets.",
          },
          {
            q: "What does a seccomp profile do?",
            options: [
              "Limits CPU",
              "Restricts syscalls a container can make — reduces the attack surface",
              "Encrypts traffic",
              "Limits DNS",
            ],
            answer: 1,
            explanation:
              "seccomp (secure computing mode) restricts which system calls a process can make. Set in Pod spec: securityContext.seccompProfile.type: RuntimeDefault for baseline protection.",
          },
          {
            q: "What is AppArmor in Kubernetes?",
            options: [
              "A firewall plugin",
              "A Linux security module restricting process actions, configured as a Pod annotation",
              "DNS security",
              "A network policy",
            ],
            answer: 1,
            explanation:
              "AppArmor profiles restrict what a process can do. In K8s: annotation container.apparmor.security.beta.kubernetes.io/<container>: runtime/default on the Pod.",
          },
          {
            q: "How do you sync a Secret from AWS Secrets Manager?",
            options: [
              "kubectl sync secret",
              "External Secrets Operator — SecretStore + ExternalSecret CR",
              "aws-cli secret inject",
              "kubectl aws-secret",
            ],
            answer: 1,
            explanation:
              "External Secrets Operator: create a SecretStore (defines AWS access) and an ExternalSecret (defines what to sync). A K8s Secret is created and kept in sync automatically.",
          },
          {
            q: "What is an allow-all NetworkPolicy?",
            options: [
              "A policy auto-created by K8s",
              "There isn't one — allow-all is the K8s default; to re-open after a deny, create a policy with ingress: [{}]",
              "A total block",
              "Namespace-scoped only",
            ],
            answer: 1,
            explanation:
              "After a default-deny, to allow all inbound traffic again: ingress: [{}] (list with an empty element = allow all sources). This is not a special policy type.",
          },
          {
            q: "What does the Namespace label pod-security.kubernetes.io/warn do?",
            options: [
              "Restricts traffic",
              "Shows a warning but does not block Pods that violate the PSA standard",
              "Sets DNS policy",
              "Sets TLS",
            ],
            answer: 1,
            explanation:
              "warn mode adds a warning on creation/update but doesn't reject Pods. Useful for testing PSA compliance before switching to enforce mode.",
          },
        ],
      },
      hard: {
        theory: `אבטחה מתקדמת.\n🔹 Least Privilege – רק ההרשאות הנחוצות\n🔹 External Secrets Operator – מסנכרן מ-AWS/GCP/Azure\n🔹 Sealed Secrets – מצפין secrets בgit\n🔹 Encryption at Rest – הצפנת etcd\nCODE:\napiVersion: external-secrets.io/v1beta1\nkind: ExternalSecret\nspec:\n  secretStoreRef:\n    name: aws-secretsmanager\n  target:\n    name: my-k8s-secret`,
        theoryEn: `Advanced security.\n🔹 Least Privilege – only necessary permissions\n🔹 External Secrets Operator – syncs from AWS/GCP/Azure\n🔹 Sealed Secrets – encrypts secrets in git\n🔹 Encryption at Rest – encrypting etcd\nCODE:\napiVersion: external-secrets.io/v1beta1\nkind: ExternalSecret\nspec:\n  secretStoreRef:\n    name: aws-secretsmanager\n  target:\n    name: my-k8s-secret`,
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
            explanation: "Least Privilege – כל entity מקבל רק את ההרשאות שהוא צריך.",
          },
          {
            q: "מה External Secrets Operator עושה?",
            options: [
              "מצפין secrets קיימים",
              "מסנכרן secrets מcloud providers לK8s",
              "מוחק secrets ישנים",
              "מגבה secrets",
            ],
            answer: 1,
            explanation:
              "External Secrets Operator מסנכרן secrets מ-AWS Secrets Manager, GCP, Azure Key Vault לK8s.",
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
            explanation: "Encryption at Rest מצפין את etcd שבו K8s שומר את כל ה-secrets.",
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
            explanation: "Sealed Secrets מצפין secrets כך שניתן לשמור אותם ב-git בבטחה.",
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
              "privileged – ללא הגבלות. baseline – מינימום הגנה. restricted – הגבלות מחמירות, best practice לproduction.",
          },
          {
            q: "כיצד לבדוק מי ניגש ל-Secret ב-Kubernetes?",
            options: [
              "kubectl logs secret",
              "Audit logs ב-API server + כלים כמו Falco",
              "kubectl describe secret",
              "env vars בPod",
            ],
            answer: 1,
            explanation:
              "Kubernetes Audit Logs מתעדים כל גישה ל-API. Falco יכול לזהות גישה לSecrets ב-runtime.",
          },
          {
            q: "מה OPA/Gatekeeper?",
            options: [
              "Open Port Authority",
              "Open Policy Agent – מנגנון policy כ-code לK8s",
              "Optional Pod Allocator",
              "Object Permission Abstraction",
            ],
            answer: 1,
            explanation:
              "OPA Gatekeeper הוא admission webhook שמאפשר לכתוב policies (Rego) שמונעות deployments שמפרים כללים.",
          },
          {
            q: "מה workload identity ב-GKE?",
            options: [
              "שם ל-Workload",
              "מנגנון שמקשר ServiceAccount של K8s לGoogle Service Account להרשאות GCP",
              "Plugin לlogging",
              "מנגנון TLS",
            ],
            answer: 1,
            explanation:
              "Workload Identity ב-GKE מאפשר לPods לגשת לשירותי GCP (GCS, Pub/Sub) ללא Service Account keys.",
          },
          {
            q: "מה kubectl --as עושה?",
            options: [
              "שינוי context",
              "מריץ פקודה כאילו אתה משתמש אחר – לtest הרשאות",
              "שמירת credentials",
              "switch namespace",
            ],
            answer: 1,
            explanation:
              "kubectl --as=someuser מריץ פקודה עם זהות של משתמש אחר. שימושי לtest RBAC permissions.",
          },
          {
            q: "מה network policy default-deny?",
            options: [
              "חוסם כל תנועה יוצאת",
              "PolicyRule שחוסם את כל התנועה הנכנסת לNamespace בהיעדר rules ספציפיים",
              "מוחק כל Service",
              "חוסם DNS",
            ],
            answer: 1,
            explanation:
              "NetworkPolicy עם podSelector: {} ו-policyTypes: Ingress ללא ingress rules חוסמת כל תנועה נכנסת לכל Pods בNamespace.",
          },
          {
            q: "Pod מקבל שגיאה:\nError: pods is forbidden: User 'system:serviceaccount:default:my-sa' cannot list resource 'pods' in API group '' in the namespace 'prod'\nמה הפתרון?",
            options: [
              "מחק את ה-ServiceAccount",
              "צור Role עם list pods + RoleBinding לmy-sa ב-namespace prod",
              "הוסף cluster-admin ClusterRoleBinding",
              "שנה ל-default ServiceAccount",
            ],
            answer: 1,
            explanation:
              "השגיאה מציינת שServiceAccount my-sa אין הרשאת list pods ב-prod. יש ליצור Role: rules:[{apiGroups:[''],resources:['pods'],verbs:['list']}] ו-RoleBinding.",
          },
          {
            q: "kubectl auth can-i get secrets --as=system:serviceaccount:prod:app-sa -n prod מחזיר 'no'. Pod בproduction צריך לקרוא Secrets. מה עושים?",
            options: [
              "מוסיפים ClusterAdmin",
              "יוצרים Role עם get secrets + RoleBinding ל-app-sa ב-prod",
              "משנים ל-default ServiceAccount",
              "מוסיפים Secret כenv",
            ],
            answer: 1,
            explanation:
              "kubectl auth can-i עם --as מאמת עבור ServiceAccount ספציפי. הפתרון: Role עם verbs:[get,list] על secrets ו-RoleBinding שמקשר ל-app-sa.",
          },
          {
            q: "Admission webhook מחזיר:\nError from server: error when creating 'deploy.yaml': admission webhook 'validate.kyverno.svc' denied the request: Container image must come from 'gcr.io/'\nמה קורה?",
            options: [
              "Kubernetes API server נפל",
              "ValidatingAdmissionWebhook חסם את ה-Deployment כי ה-image לא מ-approved registry",
              "RBAC חסם",
              "Namespace לא קיים",
            ],
            answer: 1,
            explanation:
              "ValidatingAdmissionWebhook (Kyverno/OPA/Gatekeeper) חסם את היצירה לפי policy שמאשרת רק images מ-gcr.io/. שנה את ה-image לreg מאושר.",
          },
          {
            q: "Pod ב-EKS לא מצליח לגשת ל-S3. ה-IAM policy נכונה. Pod spec:\napiVersion: v1\nkind: Pod\nspec:\n  serviceAccountName: app-sa\nה-ServiceAccount:\nannotations:\n  eks.amazonaws.com/role-arn: arn:aws:iam::123:role/app-role\nמה הבעיה הנפוצה ב-IRSA?",
            options: [
              "IAM policy שגויה",
              "OIDC provider לא מוגדר ב-EKS Cluster או trust policy לא מכוון לcorrect namespace:serviceaccount",
              "S3 bucket בregion אחר",
              "Pod לא Running",
            ],
            answer: 1,
            explanation:
              "IRSA דורש: 1) OIDC Provider מוגדר ב-EKS. 2) Trust Policy ב-IAM Role מכוון ל-'system:serviceaccount:<namespace>:<sa-name>'. שגיאה נפוצה: namespace שגוי ב-trust policy.",
          },
          {
            q: "PSA מוגדר עם enforce=restricted. Deployment נדחה:\nPod violates PodSecurity 'restricted:latest': allowPrivilegeEscalation != false\nמה מוסיפים ל-container spec?",
            options: [
              "privileged: true",
              "securityContext: {allowPrivilegeEscalation: false, runAsNonRoot: true, seccompProfile: {type: RuntimeDefault}}",
              "namespace label שינוי",
              "serviceAccount שינוי",
            ],
            answer: 1,
            explanation:
              "restricted PSA דורש: allowPrivilegeEscalation: false, runAsNonRoot: true, seccompProfile מוגדר. הוסף את כולם ל-container securityContext.",
          },
          {
            q: "Secret ב-K8s עם value:\napiVersion: v1\nkind: Secret\ndata:\n  password: dGVzdDEyMw==\nמה הvalue האמיתי?",
            options: ["dGVzdDEyMw==", "test123 – base64 decoded", "בלתי ניתן לפענוח", "PASSWORD"],
            answer: 1,
            explanation:
              "base64 decode של 'dGVzdDEyMw==' = 'test123'. Secrets רק מקודדים בbase64 – לא מוצפנים! echo 'dGVzdDEyMw==' | base64 -d = test123.",
          },
          {
            q: "OPA Gatekeeper דוחה Deployment:\nviolation: container 'app' has no resource limits\nמה הפתרון?",
            options: [
              "מוחק את ה-OPA policy",
              "מוסיף resources: limits: cpu ו-memory לcontainer spec",
              "מוסיף priorityClass",
              "משנה Namespace",
            ],
            answer: 1,
            explanation:
              "ה-OPA policy דורשת resource limits. הוסף לkcontainer spec: resources: {limits: {cpu: '500m', memory: '256Mi'}}. שינוי ה-policy מצריך cluster-admin.",
          },
          {
            q: "Sealed Secret הוצפן ב-Cluster A. מנסים להשתמש בו ב-Cluster B ומקבלים שגיאה. למה?",
            options: [
              "Sealed Secrets גלובליים",
              "כל Cluster מכיל keypair ייחודי. SealedSecret מוצפן ב-public key של Cluster A ורק controller שלו יכול לפתוח",
              "namespace שגוי",
              "version שגוי",
            ],
            answer: 1,
            explanation:
              "Sealed Secrets controller ב-Cluster A מחזיק את ה-private key. ה-SealedSecret מוצפן לpublic key של Cluster A בלבד – לא ניתן לפתוח ב-Cluster B ללא ה-keypair.",
          },
          {
            q: 'Kubernetes Audit Log מציג:\n{"verb":"get","resource":"secrets","user":{"username":"system:serviceaccount:default:compromised-sa"}}\nמה המשמעות?',
            options: [
              "Log תקין",
              "ServiceAccount 'compromised-sa' גישה לSecret – ייתכן unauthorized access, צריך לחקור ולבטל הרשאות",
              "log של restart",
              "log של backup",
            ],
            answer: 1,
            explanation:
              "Audit log מתעד כל גישה לAPI. ServiceAccount שמגיש לSecrets ללא צורך = potential breach. בדוק RBAC, הגבל הרשאות, שקול rotation של Secrets.",
          },
          {
            q: "Deployment נדחה:\nForbidden: unable to validate against any security policy\nCluster עם PSP ישן. מה הצעד הנכון ב-K8s 1.25+?",
            options: [
              "הוסף cluster-admin",
              "PSP הוסר ב-1.25. עבור ל-Pod Security Admission (PSA) עם labels על ה-Namespace",
              "שנה Namespace",
              "הוסף NetworkPolicy",
            ],
            answer: 1,
            explanation:
              "PodSecurityPolicy הוסר ב-K8s 1.25. הפתרון: Pod Security Admission + labels. או Kyverno/OPA Gatekeeper להרחבות מתקדמות.",
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
            explanation: "Least Privilege – each entity receives only the permissions it needs.",
          },
          {
            q: "What does External Secrets Operator do?",
            options: [
              "Encrypts existing secrets",
              "Syncs secrets from cloud providers to K8s",
              "Deletes old secrets",
              "Backs up secrets",
            ],
            answer: 1,
            explanation:
              "External Secrets Operator syncs secrets from AWS Secrets Manager, GCP, Azure Key Vault to K8s.",
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
              "Encryption at Rest encrypts the etcd database where K8s stores all secrets.",
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
              "Sealed Secrets encrypts secrets so they can be safely stored in a git repository.",
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
              "privileged — no restrictions. baseline — minimal protection. restricted — strict settings, production best practice.",
          },
          {
            q: "How do you audit who accessed a Secret in Kubernetes?",
            options: [
              "kubectl logs secret",
              "API server audit logs and tools like Falco",
              "kubectl describe secret",
              "Pod env vars",
            ],
            answer: 1,
            explanation:
              "Kubernetes Audit Logs record every API access. Falco can detect runtime Secret access and alert on suspicious activity.",
          },
          {
            q: "What is OPA/Gatekeeper?",
            options: [
              "Open Port Authority",
              "Open Policy Agent — policy-as-code enforcement for Kubernetes",
              "Optional Pod Allocator",
              "Object Permission Abstraction",
            ],
            answer: 1,
            explanation:
              "OPA Gatekeeper is an admission webhook that lets you write policies (Rego) blocking deployments that violate rules.",
          },
          {
            q: "What is Workload Identity in GKE?",
            options: [
              "A name for a workload",
              "Links a K8s ServiceAccount to a Google Service Account for GCP permissions",
              "A logging plugin",
              "A TLS mechanism",
            ],
            answer: 1,
            explanation:
              "Workload Identity in GKE lets Pods access GCP services (GCS, Pub/Sub) without Service Account key files.",
          },
          {
            q: "What does kubectl --as do?",
            options: [
              "Changes context",
              "Runs a command as a different user — useful for testing permissions",
              "Saves credentials",
              "Switches namespace",
            ],
            answer: 1,
            explanation:
              "kubectl --as=someuser runs a command with another user's identity. Useful for testing RBAC permissions.",
          },
          {
            q: "What is a default-deny NetworkPolicy?",
            options: [
              "Blocks all outbound traffic",
              "A policy that blocks all inbound traffic to a Namespace when no specific rules exist",
              "Deletes all Services",
              "Blocks DNS",
            ],
            answer: 1,
            explanation:
              "A NetworkPolicy with podSelector: {} and policyTypes: Ingress with no ingress rules blocks all inbound traffic to every Pod in the Namespace.",
          },
          {
            q: "A Pod receives:\nError: pods is forbidden: User 'system:serviceaccount:default:my-sa' cannot list resource 'pods' in namespace 'prod'\nWhat is the fix?",
            options: [
              "Delete the ServiceAccount",
              "Create a Role with list pods + a RoleBinding to my-sa in namespace prod",
              "Add a cluster-admin ClusterRoleBinding",
              "Switch to the default ServiceAccount",
            ],
            answer: 1,
            explanation:
              "The error shows my-sa has no list pods permission in prod. Create a Role: rules:[{apiGroups:[''],resources:['pods'],verbs:['list']}] and a RoleBinding for my-sa.",
          },
          {
            q: "kubectl auth can-i get secrets --as=system:serviceaccount:prod:app-sa -n prod returns 'no'. A production Pod needs to read Secrets. What do you do?",
            options: [
              "Add cluster-admin",
              "Create a Role with get secrets + a RoleBinding for app-sa in prod",
              "Switch to default ServiceAccount",
              "Add Secret as env var",
            ],
            answer: 1,
            explanation:
              "kubectl auth can-i with --as validates for a specific ServiceAccount. Fix: create a Role with verbs:[get,list] on secrets and a RoleBinding pointing to app-sa.",
          },
          {
            q: "An admission webhook returns:\nError: admission webhook 'validate.kyverno.svc' denied the request: Container image must come from 'gcr.io/'\nWhat is happening?",
            options: [
              "The Kubernetes API server crashed",
              "A ValidatingAdmissionWebhook blocked the Deployment because the image is not from an approved registry",
              "RBAC blocked it",
              "Namespace does not exist",
            ],
            answer: 1,
            explanation:
              "A ValidatingAdmissionWebhook (Kyverno/OPA/Gatekeeper) enforces a policy requiring images from gcr.io/. Change the image source to the approved registry.",
          },
          {
            q: "An EKS Pod cannot access S3. The IAM policy is correct. The ServiceAccount has:\nannotations:\n  eks.amazonaws.com/role-arn: arn:aws:iam::123:role/app-role\nWhat is the most common IRSA misconfiguration?",
            options: [
              "Wrong IAM policy",
              "OIDC provider not configured on the EKS Cluster, or the trust policy points to the wrong namespace:serviceaccount",
              "S3 bucket in a different region",
              "Pod not Running",
            ],
            answer: 1,
            explanation:
              "IRSA requires: 1) An OIDC Provider configured on the EKS Cluster. 2) A trust policy in the IAM Role targeting 'system:serviceaccount:<namespace>:<sa-name>'. The most common error is a wrong namespace in the trust policy.",
          },
          {
            q: "PSA is set to enforce=restricted. A Deployment is rejected:\nPod violates PodSecurity 'restricted:latest': allowPrivilegeEscalation != false\nWhat must you add to the container spec?",
            options: [
              "privileged: true",
              "securityContext: {allowPrivilegeEscalation: false, runAsNonRoot: true, seccompProfile: {type: RuntimeDefault}}",
              "Change the namespace label",
              "Change the serviceAccount",
            ],
            answer: 1,
            explanation:
              "The restricted PSA level requires: allowPrivilegeEscalation: false, runAsNonRoot: true, and a defined seccompProfile. Add all three to the container securityContext.",
          },
          {
            q: "A K8s Secret contains:\napiVersion: v1\nkind: Secret\ndata:\n  password: dGVzdDEyMw==\nWhat is the actual value?",
            options: ["dGVzdDEyMw==", "test123 — base64 decoded", "Undecipherable", "PASSWORD"],
            answer: 1,
            explanation:
              "base64 decoding 'dGVzdDEyMw==' = 'test123'. Secrets are only base64 encoded — not encrypted! echo 'dGVzdDEyMw==' | base64 -d = test123.",
          },
          {
            q: "OPA Gatekeeper rejects a Deployment:\nviolation: container 'app' has no resource limits\nWhat is the fix?",
            options: [
              "Delete the OPA policy",
              "Add resources: limits: cpu and memory to the container spec",
              "Add a priorityClass",
              "Change the Namespace",
            ],
            answer: 1,
            explanation:
              "The OPA policy requires resource limits on all containers. Add to container spec: resources: {limits: {cpu: '500m', memory: '256Mi'}}. Changing the policy itself requires cluster-admin access.",
          },
          {
            q: "A SealedSecret was encrypted in Cluster A. Using it in Cluster B fails. Why?",
            options: [
              "SealedSecrets are global",
              "Each cluster has a unique keypair. The SealedSecret is encrypted with Cluster A's public key — only its controller can decrypt it",
              "Wrong namespace",
              "Wrong version",
            ],
            answer: 1,
            explanation:
              "The Sealed Secrets controller in Cluster A holds the private key. The SealedSecret is encrypted to Cluster A's public key only — it cannot be decrypted in Cluster B without importing the keypair.",
          },
          {
            q: 'A Kubernetes Audit Log shows:\n{"verb":"get","resource":"secrets","user":{"username":"system:serviceaccount:default:compromised-sa"}}\nWhat does this mean?',
            options: [
              "A normal log entry",
              "ServiceAccount 'compromised-sa' accessed a Secret — possible unauthorized access, investigate and revoke permissions",
              "A restart log",
              "A backup log",
            ],
            answer: 1,
            explanation:
              "Audit logs record every API access. A ServiceAccount accessing Secrets unexpectedly is a potential breach indicator. Audit the RBAC, restrict permissions, and consider rotating Secrets.",
          },
          {
            q: "A Deployment is rejected:\nForbidden: unable to validate against any security policy\nThe cluster runs K8s 1.25+. What is the correct approach?",
            options: [
              "Add cluster-admin",
              "PSP was removed in K8s 1.25. Migrate to Pod Security Admission (PSA) with Namespace labels",
              "Change the Namespace",
              "Add a NetworkPolicy",
            ],
            answer: 1,
            explanation:
              "PodSecurityPolicy was removed in K8s 1.25. The replacement is Pod Security Admission + Namespace labels (pod-security.kubernetes.io/enforce). Kyverno/OPA Gatekeeper provide more advanced alternatives.",
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
        theory: `PersistentVolumes ו-Helm בסיסי.\n🔹 PV – יחידת אחסון בCluster (admin מגדיר)\n🔹 PVC – בקשה לאחסון מ-Pod\n🔹 Helm Chart – חבילה של Kubernetes manifests עם templates\n🔹 helm install – מתקין Chart ויוצר Release\nCODE:\napiVersion: v1\nkind: PersistentVolumeClaim\nspec:\n  accessModes: [ReadWriteOnce]\n  resources:\n    requests:\n      storage: 10Gi`,
        theoryEn: `PersistentVolumes and basic Helm.\n🔹 PV – a storage unit in the Cluster (defined by admin)\n🔹 PVC – a request for storage by a Pod\n🔹 Helm Chart – a package of K8s manifests with templates\n🔹 helm install – installs a Chart and creates a Release\nCODE:\napiVersion: v1\nkind: PersistentVolumeClaim\nspec:\n  accessModes: [ReadWriteOnce]\n  resources:\n    requests:\n      storage: 10Gi`,
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
            explanation: "PV הוא יחידת האחסון שה-admin מגדיר. PVC היא הבקשה של האפליקציה לאחסון.",
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
            explanation: "ReadWriteOnce (RWO) – mounted לקריאה וכתיבה על ידי node אחד בלבד.",
          },
          {
            q: "מה זה Helm Chart?",
            options: [
              "Docker image",
              "חבילה של Kubernetes manifests עם templates",
              "רשת Kubernetes",
              "גרסה של kubectl",
            ],
            answer: 1,
            explanation:
              "Helm Chart הוא חבילה המכילה templates, values, ומטה-נתונים להתקנת אפליקציה.",
          },
          {
            q: "מה הפקודה להתקנת Helm Chart?",
            options: ["helm deploy", "helm install", "helm run", "helm apply"],
            answer: 1,
            explanation: "helm install [release-name] [chart] מתקין Chart ויוצר Release חדש.",
          },
          {
            q: "מה emptyDir?",
            options: [
              "Volume ריק שנמחק עם ה-Pod",
              "Volume קבוע",
              "Volume לקבצי logs",
              "Volume לDB",
            ],
            answer: 0,
            explanation:
              "emptyDir נוצר כשPod מתזמן ונמחק כשה-Pod מוחק. מתאים לshared temp files בין קונטיינרים.",
          },
          {
            q: "מה hostPath?",
            options: [
              "Path ל-Helm Chart",
              "Volume שמוסיף תיקיה מה-Node לPod",
              "Secret path",
              "ConfigMap path",
            ],
            answer: 1,
            explanation:
              "hostPath מאפשר לPod לגשת לתיקיה ישירות מ-filesystem של ה-Node. שימוש בו מאוד נדיר ב-production.",
          },
          {
            q: "מה StorageClass?",
            options: [
              "סוג Pod",
              "הגדרת provisioner לדיסקים דינמיים",
              "סוג Service",
              "קטגוריית log",
            ],
            answer: 1,
            explanation:
              "StorageClass מגדיר provisioner (כמו gp2, pd-standard) ו-reclaim policy. ה-PVC מציין StorageClass לקבלת דיסק.",
          },
          {
            q: "מה helm repo add עושה?",
            options: [
              "מוסיף Chart חדש",
              "מוסיף Helm repository (מאגר charts) לרשימה המקומית",
              "מוסיף dependency",
              "מעדכן Chart",
            ],
            answer: 1,
            explanation:
              "helm repo add [name] [url] מוסיף repository כדי שניתן לחפש ולהתקין Charts ממנו.",
          },
          {
            q: "מה helm list מציג?",
            options: [
              "רשימת Charts זמינים",
              "רשימת Releases מותקנים ב-Cluster",
              "רשימת Namespaces",
              "רשימת Nodes",
            ],
            answer: 1,
            explanation:
              "helm list (או helm ls) מציג את כל ה-Releases המותקנים עם גרסה, סטטוס, ו-chart שהשתמשו בו.",
          },
          {
            q: "מה קורה לנתונים ב-emptyDir כש-Pod מאתחל?",
            options: ["נשמרים לתמיד", "נמחקים", "מגובים אוטומטית", "מועברים לPV"],
            answer: 1,
            explanation:
              "emptyDir נשאר חי גם אם קונטיינר מתאחל, אבל נמחק לחלוטין כשה-Pod עצמו מוחק.",
          },
          {
            q: "מה AccessMode ReadWriteMany (RWX) מאפשר?",
            options: [
              "קריאה בלבד ממספר Nodes",
              "קריאה וכתיבה ממספר Nodes בו-זמנית",
              "כתיבה רק מNode אחד",
              "גישה מכל העולם",
            ],
            answer: 1,
            explanation:
              "ReadWriteMany מאפשר לכמה Nodes לקרוא ולכתוב בו-זמנית. מתאים לNFS, AWS EFS. לא כל storage providers תומכים בRWX.",
          },
          {
            q: "מה Reclaim Policy Retain?",
            options: [
              "מוחק PV אוטומטית",
              "שומר PV לאחר מחיקת PVC לצורך תחזוקה ידנית",
              "מעביר PV לpool",
              "מגבה PV",
            ],
            answer: 1,
            explanation:
              "Retain – ה-PV ממשיך להתקיים אחרי מחיקת PVC. הנתונים נשמרים. Admin חייב לנקות ידנית. מתאים לDB production.",
          },
          {
            q: "מה helm upgrade --dry-run עושה?",
            options: [
              "מתקין בגרסת test",
              "מסמלץ upgrade ומראה מה ישתנה ללא שינוי בפועל",
              "מנקה resources",
              "rollback אוטומטי",
            ],
            answer: 1,
            explanation:
              "--dry-run + --debug מראה את ה-YAML שייוצר ללא יצירה בפועל. שימושי לvalidation לפני production upgrade.",
          },
          {
            q: "מה PVC accessMode ReadOnlyMany?",
            options: [
              "כתיבה מnode אחד בלבד",
              "גישת קריאה בלבד ממספר Nodes בו-זמנית",
              "גישה רק בHTTPS",
              "גישה לadmin בלבד",
            ],
            answer: 1,
            explanation:
              "ReadOnlyMany (ROX) מאפשר לכמה Nodes לקרוא בו-זמנית. לא ניתן לכתוב. מתאים לcontent static שמשותף בין Pods.",
          },
          {
            q: "מה הפקודה לראות את היסטוריית גרסאות של Helm Release?",
            options: ["helm versions", "helm history my-release", "helm revisions", "helm get all"],
            answer: 1,
            explanation:
              "helm history my-release מציג את כל revisions: מספר, תאריך, סטטוס, ותיאור chart. משמש לזיהוי revision לrollback.",
          },
          {
            q: "מה PVC volumeMode: Block?",
            options: [
              "Block access לPVC",
              "מגדיר PVC כraw block device ללא filesystem – לapplications שמנהלות storage עצמן",
              "Block כל כתיבה",
              "Block synchronization",
            ],
            answer: 1,
            explanation:
              "volumeMode: Block חושף storage כraw block device ללא filesystem. שימושי לdatabases כמו Cassandra שמנהלות I/O ישירות.",
          },
          {
            q: "מה helm values.yaml?",
            options: [
              "קובץ logs",
              "קובץ ברירות מחדל עבור templates של Chart",
              "קובץ RBAC",
              "קובץ secrets",
            ],
            answer: 1,
            explanation:
              "values.yaml מגדיר ברירות מחדל לall template variables. --set מ-CLI עוקף ערכים ספציפיים. -f my-values.yaml מחליף קובץ ברירות מחדל.",
          },
          {
            q: "מה ה-StorageClass annotation storageclass.kubernetes.io/is-default-class?",
            options: [
              "מגדיר backup policy",
              "מסמן StorageClass כברירת מחדל – PVCs ללא storageClassName יקבלו אותו",
              "מגדיר retention",
              "מגדיר access mode",
            ],
            answer: 1,
            explanation:
              "StorageClass עם annotation is-default-class: 'true' ישמש לPVCs שלא מציינים storageClassName. רק StorageClass אחד יכול להיות default.",
          },
          {
            q: "מה volumeMount.mountPropagation?",
            options: [
              "גודל volume",
              "מגדיר כיצד mounts בHost ו-Container מתפשטים זה לזה",
              "גיבוי אוטומטי",
              "הצפנה",
            ],
            answer: 1,
            explanation:
              "mountPropagation: None (default)/HostToContainer/Bidirectional מגדיר אם bind mounts חדשים בHost מופיעים בContainer ולהיפך. חיוני לcertain storage plugins.",
          },
          {
            q: "מה ה-Reclaim Policy Recycle?",
            options: [
              "מחק PV",
              "מנקה PV ומחזיר אותו לAvailable – deprecated, הוסר ב-K8s 1.21",
              "מגבה PV",
              "משחרר PV לPool",
            ],
            answer: 1,
            explanation:
              "Recycle ניקה (rm -rf /thevolume/*) ואז השאיר PV כAvailable לPVC חדש. Deprecated ב-1.7 והוסר. פתרון מודרני: Dynamic Provisioning.",
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
              "PV is the storage unit defined by the admin. PVC is the application request for storage.",
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
              "ReadWriteOnce (RWO) – can be mounted for read/write by only one node at a time.",
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
              "A Helm Chart is a package containing templates, values, and metadata for installing an application.",
          },
          {
            q: "What command installs a Helm Chart?",
            options: ["helm deploy", "helm install", "helm run", "helm apply"],
            answer: 1,
            explanation:
              "helm install [release-name] [chart] installs a Chart and creates a new Release.",
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
              "emptyDir is created when a Pod is scheduled and deleted when the Pod is removed. Useful for temp files shared between containers.",
          },
          {
            q: "What is hostPath?",
            options: [
              "A path for Helm Charts",
              "A Volume that mounts a Node directory into a Pod",
              "A Secret path",
              "A ConfigMap path",
            ],
            answer: 1,
            explanation:
              "hostPath mounts a directory from the Node's filesystem into the Pod. Rarely used in production due to portability and security concerns.",
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
              "StorageClass defines a provisioner (e.g. gp2, pd-standard) and reclaim policy. A PVC specifies a StorageClass to get a disk.",
          },
          {
            q: "What does helm repo add do?",
            options: [
              "Adds a new Chart",
              "Adds a Helm repository (chart registry) to the local list",
              "Adds a dependency",
              "Updates a Chart",
            ],
            answer: 1,
            explanation:
              "helm repo add [name] [url] registers a repository so you can search and install Charts from it.",
          },
          {
            q: "What does helm list show?",
            options: [
              "Available Charts",
              "Installed Releases in the Cluster",
              "Namespaces",
              "Nodes",
            ],
            answer: 1,
            explanation:
              "helm list (or helm ls) shows all installed Releases with version, status, and the Chart used.",
          },
          {
            q: "What happens to emptyDir data when a Pod restarts?",
            options: [
              "Persisted forever",
              "Deleted when the Pod is removed (survives container restart)",
              "Automatically backed up",
              "Moved to a PV",
            ],
            answer: 1,
            explanation:
              "emptyDir survives container restarts within the same Pod, but is deleted entirely when the Pod itself is deleted.",
          },
          {
            q: "What does AccessMode ReadWriteMany (RWX) allow?",
            options: [
              "Read-only from multiple Nodes",
              "Read and write from multiple Nodes simultaneously",
              "Write from one Node only",
              "Global public access",
            ],
            answer: 1,
            explanation:
              "ReadWriteMany allows multiple Nodes to read and write simultaneously. Suitable for NFS and AWS EFS. Not all storage providers support RWX.",
          },
          {
            q: "What is the Retain reclaim policy?",
            options: [
              "Deletes PV automatically",
              "Preserves PV after PVC deletion for manual cleanup",
              "Returns PV to the pool",
              "Backs up PV",
            ],
            answer: 1,
            explanation:
              "Retain keeps the PV alive after the PVC is deleted. Data is preserved. An admin must clean up manually. Suitable for production databases.",
          },
          {
            q: "What does helm upgrade --dry-run do?",
            options: [
              "Installs in test mode",
              "Simulates the upgrade and shows what would change without applying it",
              "Cleans up resources",
              "Auto-rollback",
            ],
            answer: 1,
            explanation:
              "--dry-run with --debug shows the YAML that would be generated without creating anything. Useful for validation before a production upgrade.",
          },
          {
            q: "What is PVC accessMode ReadOnlyMany?",
            options: [
              "Write from one Node only",
              "Read-only access from multiple Nodes simultaneously",
              "HTTPS access only",
              "Admin-only access",
            ],
            answer: 1,
            explanation:
              "ReadOnlyMany (ROX) allows multiple Nodes to read simultaneously but disallows writes. Suitable for static content shared across Pods.",
          },
          {
            q: "What command shows the version history of a Helm Release?",
            options: ["helm versions", "helm history my-release", "helm revisions", "helm get all"],
            answer: 1,
            explanation:
              "helm history my-release lists all revisions: number, date, status, and chart description. Used to identify the revision to roll back to.",
          },
          {
            q: "What does PVC volumeMode: Block do?",
            options: [
              "Blocks PVC access",
              "Exposes storage as a raw block device without a filesystem — for apps that manage storage directly",
              "Blocks all writes",
              "Blocks synchronization",
            ],
            answer: 1,
            explanation:
              "volumeMode: Block exposes storage as a raw block device without a filesystem. Used by databases like Cassandra that manage their own I/O directly.",
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
              "values.yaml sets defaults for all template variables. --set from the CLI overrides specific values. -f my-values.yaml replaces the entire defaults file.",
          },
          {
            q: "What does the StorageClass annotation storageclass.kubernetes.io/is-default-class do?",
            options: [
              "Defines a backup policy",
              "Marks the StorageClass as the default — PVCs without storageClassName will use it",
              "Sets retention",
              "Sets access mode",
            ],
            answer: 1,
            explanation:
              "A StorageClass with annotation is-default-class: 'true' is used by PVCs that don't specify a storageClassName. Only one StorageClass should be the default.",
          },
          {
            q: "What is volumeMount.mountPropagation?",
            options: [
              "Volume size",
              "Defines how mounts propagate between Host and Container",
              "Auto-backup",
              "Encryption",
            ],
            answer: 1,
            explanation:
              "mountPropagation: None (default)/HostToContainer/Bidirectional controls whether new bind mounts in the Host appear in the Container and vice versa. Critical for certain storage plugins.",
          },
          {
            q: "What was the Reclaim Policy Recycle?",
            options: [
              "Deletes the PV",
              "Cleaned the PV and returned it to Available — deprecated and removed in K8s 1.21",
              "Backs up the PV",
              "Returns the PV to a pool",
            ],
            answer: 1,
            explanation:
              "Recycle wiped the volume (rm -rf /thevolume/*) and made it Available for a new PVC. Deprecated in 1.7 and removed. The modern solution is Dynamic Provisioning.",
          },
        ],
      },
      medium: {
        theory: `StorageClass ו-Helm Values.\n🔹 StorageClass – מגדיר סוג אחסון וprovisioner\n🔹 Dynamic Provisioning – PV נוצר אוטומטית עם PVC\n🔹 Reclaim Policy Delete – מוחק PV כשPVC נמחק\n🔹 helm upgrade / --set – עדכון ושינוי values\nCODE:\nhelm install my-app ./chart --set replicaCount=3\nhelm upgrade my-app ./chart -f prod-values.yaml\nhelm rollback my-app 1`,
        theoryEn: `StorageClass and Helm Values.\n🔹 StorageClass – defines storage type and provisioner\n🔹 Dynamic Provisioning – PV created automatically with PVC\n🔹 Reclaim Policy Delete – deletes PV when PVC is deleted\n🔹 helm upgrade / --set – update and change values\nCODE:\nhelm install my-app ./chart --set replicaCount=3\nhelm upgrade my-app ./chart -f prod-values.yaml\nhelm rollback my-app 1`,
        questions: [
          {
            q: "מה Dynamic Provisioning?",
            options: [
              "הקצאת CPU",
              "PV נוצר אוטומטית כשנוצר PVC",
              "שינוי גודל אוטומטי",
              "migration",
            ],
            answer: 1,
            explanation:
              "Dynamic Provisioning – כשנוצר PVC עם StorageClass, ה-provisioner יוצר PV אוטומטית.",
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
            explanation: "Reclaim Policy Delete – כשPVC נמחק, ה-PV והדיסק בcloud נמחקים אוטומטית.",
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
            explanation: "--set key=value עוקף values.yaml בזמן install/upgrade.",
          },
          {
            q: "מה הפקודה לעדכן Helm Release?",
            options: ["helm update", "helm upgrade", "helm patch", "helm redeploy"],
            answer: 1,
            explanation: "helm upgrade [release] [chart] מעדכן Release קיים.",
          },
          {
            q: "מה Reclaim Policy Retain?",
            options: [
              "מוחק PV",
              "שומר PV גם אחרי מחיקת PVC לתחזוקה ידנית",
              "משחרר PV לPool",
              "מגבה PV",
            ],
            answer: 1,
            explanation:
              "Retain שומר את ה-PV ואת הנתונים גם אחרי מחיקת PVC. Admin צריך למחוק ידנית או לשחרר.",
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
              "StorageClass חייב להגדיר allowVolumeExpansion: true. לאחר מכן שינוי storage request ב-PVC יגרום להרחבת הדיסק.",
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
              "helm template מרנדר את ה-Chart עם values ומפיק YAML גולמי. שימושי לCI/CD, debug, ו-kubectl apply.",
          },
          {
            q: "מה helm rollback?",
            options: [
              "מוחק Release",
              "מחזיר Release לgrevision קודמת",
              "reset values",
              "שינוי Chart version",
            ],
            answer: 1,
            explanation:
              "helm rollback [release] [revision] מחזיר Release לrevision ספציפי. helm history מציג את כל ה-revisions.",
          },
          {
            q: "מה ConfigMap כ-volume?",
            options: [
              "ConfigMap לא ניתן כvolume",
              "כל key הופך לקובץ בתיקיה – שימושי לconfig files",
              "מאוחסן בRAM בלבד",
              "מוצפן אוטומטית",
            ],
            answer: 1,
            explanation:
              "ConfigMap כvolume מאפשר לPod לקרוא config files ישירות. כל key הופך לקובץ בpath שהגדרת.",
          },
          {
            q: "מה helm dependency?",
            options: [
              "תלות ב-Node",
              "Charts אחרים ש-Chart שלך דורש (כמו mysql chart ל-wordpress chart)",
              "גרסת kubectl",
              "תלות רשת",
            ],
            answer: 1,
            explanation:
              "helm dependency מגדיר Charts אחרים שהChart שלך צריך. helm dependency update מוריד אותם ל-charts/ directory.",
          },
          {
            q: "מה helm lint עושה?",
            options: [
              "מוחק Chart שגוי",
              "בודק Chart לשגיאות syntax ו-best practices ללא התקנה",
              "מריץ test",
              "משווה גרסאות",
            ],
            answer: 1,
            explanation:
              "helm lint ./my-chart מריץ בדיקות static analysis על ה-Chart: YAML valid, values referenced exist, required fields present. מומלץ ב-CI pipeline.",
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
            q: "StatefulSet מגדיר volumeClaimTemplates. מה קורה ל-PVC כשה-Pod נמחק?",
            options: [
              "PVC נמחק אוטומטית",
              "PVC נשמר! – StatefulSet לא מוחק PVCs בעצמו; נתוני הDB נשארים",
              "PVC מועבר לPool",
              "PVC נמחק בwחרי 5 דקות",
            ],
            answer: 1,
            explanation:
              "בניגוד ל-Deployments, StatefulSet לא מוחק PVCs כשPod נמחק. נתונים נשמרים. יש למחוק PVCs ידנית אם רוצים לנקות.",
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
          {
            q: "מה helm get values my-release עושה?",
            options: [
              "מציג Chart manifest",
              "מציג ה-values שהשתמשו להתקנת Release (מה שנשלח ב-install/upgrade)",
              "מציג history",
              "מציג templates",
            ],
            answer: 1,
            explanation:
              "helm get values my-release מציג את ה-user-supplied values מה-install/upgrade האחרון. --revision N מציג values מrevision ספציפי.",
          },
          {
            q: "PVC מוגדר עם storageClassName: ''. מה זה אומר?",
            options: [
              "יוצג כDefault StorageClass",
              "מגדיר שלא להשתמש ב-dynamic provisioning – PVC יחפש PV ידני קיים בלבד",
              "שגיאה",
              "ייוצר PV חדש",
            ],
            answer: 1,
            explanation:
              "storageClassName: '' (מחרוזת ריקה) מגדיר שה-PVC לא ישתמש ב-StorageClass. יחפש רק PV קיים ידני שאין לו storageClass. שונה מ-storageClassName לא מוגדר.",
          },
          {
            q: "מה helm test עושה?",
            options: [
              "מריץ unit tests של K8s",
              "מריץ Pod מוגדר ב-Chart כ-test hook לאימות Release פועל נכון",
              "מבצע dry run",
              "בודק YAML",
            ],
            answer: 1,
            explanation:
              "helm test my-release מריץ Pod שמוגדר ב-templates/ עם annotation helm.sh/hook: test. ה-Pod מריץ בדיקות ומחזיר exit code. נפוץ ב-CI/CD.",
          },
          {
            q: "מה volumeClaimTemplates בStatefulSet לעומת volume רגיל?",
            options: [
              "אין הבדל",
              "volumeClaimTemplates יוצר PVC ייחודי per-Pod אוטומטית. volume רגיל יוצר PVC אחד משותף לכל הPods",
              "volumeClaimTemplates לdynamic בלבד",
              "volume רגיל מהיר יותר",
            ],
            answer: 1,
            explanation:
              "volumeClaimTemplates יוצר PVC נפרד לכל instance של StatefulSet (app-0, app-1, app-2). זה קריטי לdatabases שכל instance צריך storage נפרד.",
          },
          {
            q: "מה ב-helm Chart הקובץ NOTES.txt?",
            options: [
              "README",
              "פלט שמוצג למשתמש לאחר helm install – הוראות גישה, URLs, next steps",
              "קובץ test",
              "קובץ values",
            ],
            answer: 1,
            explanation:
              "NOTES.txt מתרנדר לאחר helm install/upgrade ומציג הוראות: URL לגישה לאפליקציה, פקודות נוספות, credentials. תמיד כדאי לכלול.",
          },
          {
            q: "מה ה-Helm repository index.yaml?",
            options: [
              "קובץ values",
              "קובץ שמכיל metadata על כל ה-Charts בrepository – גרסאות, תיאורים, checksums",
              "קובץ RBAC",
              "קובץ secrets",
            ],
            answer: 1,
            explanation:
              "כל Helm repository מכיל index.yaml שמאפשר ל-Helm לגלות Charts. helm repo update מוריד index.yaml עדכני.",
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
              "Dynamic Provisioning – when a PVC with StorageClass is created, the provisioner auto-creates a PV.",
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
              "Reclaim Policy Delete – when PVC is deleted, the PV and cloud disk are automatically deleted.",
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
            explanation: "--set key=value overrides values.yaml at install/upgrade time.",
          },
          {
            q: "What command updates an existing Helm Release?",
            options: ["helm update", "helm upgrade", "helm patch", "helm redeploy"],
            answer: 1,
            explanation: "helm upgrade [release] [chart] updates an existing Release.",
          },
          {
            q: "What is the Retain reclaim policy?",
            options: [
              "Deletes the PV",
              "Keeps the PV after PVC deletion for manual cleanup",
              "Releases the PV back to the pool",
              "Backs up the PV",
            ],
            answer: 1,
            explanation:
              "Retain keeps the PV and its data even after the PVC is deleted. An admin must manually clean up or reassign it.",
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
              "The StorageClass must have allowVolumeExpansion: true. Then changing the PVC storage request triggers disk expansion.",
          },
          {
            q: "What does helm template do?",
            options: [
              "Creates a new Template",
              "Renders the Chart to YAML without installing — for pipelines and dry-runs",
              "Saves the template",
              "Updates values",
            ],
            answer: 1,
            explanation:
              "helm template renders the Chart with values and outputs raw YAML. Useful for CI/CD, debugging, and kubectl apply workflows.",
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
              "helm rollback [release] [revision] reverts to a specific revision. Use helm history to see all revisions.",
          },
          {
            q: "What does mounting a ConfigMap as a Volume do?",
            options: [
              "ConfigMap cannot be a Volume",
              "Each key becomes a file in a directory — useful for config files",
              "Stored in RAM only",
              "Automatically encrypted",
            ],
            answer: 1,
            explanation:
              "Mounting a ConfigMap as a Volume lets a Pod read config files directly. Each key becomes a file at the path you define.",
          },
          {
            q: "What is a helm dependency?",
            options: [
              "A Node dependency",
              "Other Charts your Chart requires (e.g. a mysql chart for a wordpress chart)",
              "kubectl version requirement",
              "A network dependency",
            ],
            answer: 1,
            explanation:
              "helm dependency defines other Charts your Chart needs. helm dependency update downloads them to the charts/ directory.",
          },
          {
            q: "What does helm lint do?",
            options: [
              "Deletes a broken Chart",
              "Checks the Chart for syntax errors and best practices without installing",
              "Runs tests",
              "Compares versions",
            ],
            answer: 1,
            explanation:
              "helm lint ./my-chart runs static analysis: validates YAML, checks referenced values exist, and verifies required fields. Recommended in CI pipelines.",
          },
          {
            q: "What does a PVC in Pending status mean?",
            options: [
              "PVC awaiting backup",
              "No matching PV found — due to wrong AccessMode, insufficient storage, or wrong StorageClass",
              "PVC not created",
              "Helm failure",
            ],
            answer: 1,
            explanation:
              "PVC Pending = no matching PV was found. Run kubectl describe pvc to see what's missing. Common causes: StorageClass doesn't exist, AccessMode mismatch, or insufficient capacity.",
          },
          {
            q: "A StatefulSet uses volumeClaimTemplates. What happens to the PVC when the Pod is deleted?",
            options: [
              "PVC is deleted automatically",
              "PVC is retained — StatefulSet does not delete PVCs; DB data is preserved",
              "PVC is returned to the pool",
              "PVC is deleted after 5 minutes",
            ],
            answer: 1,
            explanation:
              "Unlike Deployments, StatefulSet does not delete PVCs when a Pod is removed. Data persists. PVCs must be manually deleted if you want to clean up.",
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
          {
            q: "What does helm get values my-release do?",
            options: [
              "Shows the Chart manifest",
              "Shows the values used to install the Release (what was passed at install/upgrade)",
              "Shows history",
              "Shows templates",
            ],
            answer: 1,
            explanation:
              "helm get values my-release shows the user-supplied values from the last install/upgrade. --revision N shows values from a specific revision.",
          },
          {
            q: "A PVC sets storageClassName: ''. What does this mean?",
            options: [
              "Uses the default StorageClass",
              "Opts out of dynamic provisioning — PVC will only match a manually created PV with no storageClass",
              "An error",
              "Creates a new PV",
            ],
            answer: 1,
            explanation:
              "storageClassName: '' (empty string) means the PVC won't use any StorageClass. It only matches manually created PVs with no storageClass. Different from leaving storageClassName unset.",
          },
          {
            q: "What does helm test do?",
            options: [
              "Runs K8s unit tests",
              "Runs a Pod defined in the Chart as a test hook to verify the Release works correctly",
              "Performs a dry run",
              "Validates YAML",
            ],
            answer: 1,
            explanation:
              "helm test my-release runs Pods defined in templates/ with the annotation helm.sh/hook: test. The Pod runs checks and returns an exit code. Common in CI/CD pipelines.",
          },
          {
            q: "What is the difference between volumeClaimTemplates in a StatefulSet and a regular volume?",
            options: [
              "No difference",
              "volumeClaimTemplates creates a unique PVC per Pod automatically; a regular volume creates one shared PVC for all Pods",
              "volumeClaimTemplates for dynamic provisioning only",
              "Regular volumes are faster",
            ],
            answer: 1,
            explanation:
              "volumeClaimTemplates creates a separate PVC for each StatefulSet instance (app-0, app-1, app-2). Critical for databases where each instance needs isolated storage.",
          },
          {
            q: "What is the NOTES.txt file in a Helm Chart?",
            options: [
              "A README",
              "Text rendered to the user after helm install — access instructions, URLs, next steps",
              "A test file",
              "A values file",
            ],
            answer: 1,
            explanation:
              "NOTES.txt is rendered after helm install/upgrade and displays instructions: app URL, commands to run, credentials. Always good practice to include.",
          },
          {
            q: "What is a Helm repository index.yaml?",
            options: [
              "A values file",
              "A file containing metadata about all Charts in the repository — versions, descriptions, checksums",
              "An RBAC file",
              "A secrets file",
            ],
            answer: 1,
            explanation:
              "Every Helm repository contains an index.yaml that lets Helm discover Charts. helm repo update downloads a fresh copy of the index.",
          },
        ],
      },
      hard: {
        theory: `אחסון ו-Helm מתקדם.\n🔹 ReadWriteMany (RWX) – קריאה/כתיבה ממספר Nodes (NFS, EFS)\n🔹 CSI – Container Storage Interface, סטנדרט לdrivers\n🔹 VolumeSnapshot – גיבוי נקודתי\n🔹 Helm Hooks – פעולות בשלבים: pre-install, post-upgrade\nCODE:\napiVersion: snapshot.storage.k8s.io/v1\nkind: VolumeSnapshot\nspec:\n  source:\n    persistentVolumeClaimName: my-pvc`,
        theoryEn: `Advanced Storage and Helm.\n🔹 ReadWriteMany (RWX) – read/write from multiple Nodes (NFS, EFS)\n🔹 CSI – Container Storage Interface, standard for drivers\n🔹 VolumeSnapshot – point-in-time backup\n🔹 Helm Hooks – actions at lifecycle points: pre-install, post-upgrade\nCODE:\napiVersion: snapshot.storage.k8s.io/v1\nkind: VolumeSnapshot\nspec:\n  source:\n    persistentVolumeClaimName: my-pvc`,
        questions: [
          {
            q: "מה ReadWriteMany מאפשר?",
            options: [
              "קריאה בלבד",
              "כתיבה מNode אחד",
              "קריאה וכתיבה מכמה Nodes בו-זמנית",
              "הגדלה אוטומטית",
            ],
            answer: 2,
            explanation:
              "ReadWriteMany (RWX) מאפשר לNodes מרובים לקרוא ולכתוב בו-זמנית. מתאים לNFS/EFS.",
          },
          {
            q: "מה זה CSI?",
            options: [
              "Container Security Interface",
              "Container Storage Interface – סטנדרט לdrivers",
              "Cloud Storage Integration",
              "Cluster Sync",
            ],
            answer: 1,
            explanation: "CSI הוא סטנדרט שמאפשר לvendors לכתוב storage drivers עבור Kubernetes.",
          },
          {
            q: "מה Helm Hook?",
            options: [
              "כלי debug",
              "פעולה שרצה בשלב מסוים במחזור חיי Release",
              "type של Chart",
              "חלופה לRollback",
            ],
            answer: 1,
            explanation:
              "Helm Hooks מריצים Jobs/Pods בשלבים: pre-install, post-upgrade, pre-delete.",
          },
          {
            q: "מה VolumeSnapshot?",
            options: [
              "גיבוי הCluster כולו",
              "גיבוי נקודתי של PersistentVolume",
              "snapshot של Pod",
              "גיבוי ConfigMap",
            ],
            answer: 1,
            explanation: "VolumeSnapshot יוצר גיבוי נקודתי של PV, מאפשר restore לנקודת זמן.",
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
              "volumeClaimTemplates ב-StatefulSet יוצר PVC ייחודי לכל Pod. Pod-0 מקבל pvc-pod-0, Pod-1 מקבל pvc-pod-1.",
          },
          {
            q: "מה VolumeSnapshotClass?",
            options: [
              "StorageClass לVolumes",
              "מגדיר driver ו-parameters ליצירת VolumeSnapshots",
              "גרסת Volume API",
              "שם לSnapshot",
            ],
            answer: 1,
            explanation:
              "VolumeSnapshotClass כמו StorageClass – מגדיר CSI driver שישתמש בו ליצירת snapshots.",
          },
          {
            q: "מה subPath ב-Volume?",
            options: [
              "path לSecret",
              "מאפשר mount של תת-תיקיה ספציפית מVolume לנתיב ספציפי בקונטיינר",
              "מגבלת גודל",
              "Path לNode",
            ],
            answer: 1,
            explanation:
              "subPath מאפשר לכמה קונטיינרים בPod לשתף Volume אחד ולכל אחד תת-תיקיה משלו.",
          },
          {
            q: "מה thin provisioning?",
            options: [
              "הקצאת דיסק מלא מיד",
              "הקצאת דיסק וירטואלי גדול שמשתמש במקום בפועל בלבד",
              "דיסק לbatch jobs",
              "דיסק לStatefulSets בלבד",
            ],
            answer: 1,
            explanation:
              "Thin provisioning מקצה נפח לוגי גדול אבל משתמש בדיסק פיזי רק לפי שימוש בפועל. גמישות גבוהה.",
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
              "WaitForFirstConsumer מונע יצירת PV עד ש-Pod יתזמן, כך ש-PV נוצר באותה Zone/Region כמו ה-Pod.",
          },
          {
            q: "מה Rook-Ceph ב-Kubernetes?",
            options: [
              "Logging operator",
              "Storage orchestrator שמפעיל Ceph distributed storage כ-Kubernetes operator",
              "Network plugin",
              "Backup solution",
            ],
            answer: 1,
            explanation:
              "Rook-Ceph הוא operator שמנהל Ceph cluster בתוך Kubernetes ומספק Block, Object, ו-File storage.",
          },
          {
            q: "PVC נשאר Pending. kubectl describe pvc מציג:\nEvents:\n  Warning  ProvisioningFailed  storageclass.storage.k8s.io 'fast-ssd' not found\nמה הבעיה?",
            options: [
              "PVC גדול מדי",
              "StorageClass 'fast-ssd' לא קיים בCluster – שגיאת הגדרה",
              "Node מלא",
              "Namespace שגוי",
            ],
            answer: 1,
            explanation:
              "ה-PVC מבקש StorageClass שלא קיים. בדוק kubectl get storageclass לרשימת StorageClasses קיימים. תקן את storageClassName ב-PVC לשם נכון.",
          },
          {
            q: "StatefulSet DB. לאחר helm uninstall, ה-PVCs נשארים. הCluster מלא. מה הפקודה הנכונה?",
            options: [
              "kubectl delete pvc --all",
              "kubectl delete pvc -l app=my-db -n production (לאחר אימות שנתונים גובו)",
              "helm delete pvcs",
              "kubectl drain node",
            ],
            answer: 1,
            explanation:
              "StatefulSet PVCs לא נמחקים אוטומטית. כדי לנקות: kubectl delete pvc -l selector=value. תמיד אמת שגיבוי נעשה לפני מחיקה!",
          },
          {
            q: "helm upgrade כשל באמצע. Release ב-status 'failed'. ה-ConfigMap מחצית עודכן. מה הצעד הבא?",
            options: [
              "מחק ה-Release",
              "helm rollback my-release [last-good-revision] להחזיר למצב עקבי",
              "helm upgrade שוב",
              "מחק ConfigMap",
            ],
            answer: 1,
            explanation:
              "helm rollback מחזיר ל-revision תקין. helm history לראות revisions. helm rollback my-release 2 מחזיר ל-revision 2.",
          },
          {
            q: "PVC מוגדר עם storageClassName: standard. kubectl get pvc מציג Pending. kubectl get storageclass מציג:\nNAME       PROVISIONER\nfast       ebs.csi.aws.com\nמה הבעיה?",
            options: [
              "PVC גדול מדי",
              "StorageClass 'standard' לא קיים – PVC מבקש class שאינו בCluster",
              "Namespace שגוי",
              "PV קיים כבר",
            ],
            answer: 1,
            explanation:
              "StorageClass 'standard' לא קיים – רק 'fast'. תקן PVC לשימוש ב-storageClassName: fast, או צור StorageClass בשם standard.",
          },
          {
            q: "VolumeSnapshot לא נוצר. kubectl describe volumesnapshot מציג:\nready-to-use: false\nerror: rpc error: code = Unimplemented\nמה הסיבה הנפוצה?",
            options: [
              "Namespace שגוי",
              "CSI driver לא תומך ב-snapshot capability – צריך לבדוק אם snapshot-controller ו-CSI driver תומכים",
              "PVC לא קיים",
              "Capacity חרגה",
            ],
            answer: 1,
            explanation:
              "VolumeSnapshot דורש CSI driver עם snapshot capability ו-snapshot-controller מותקן. 'Unimplemented' = ה-driver לא תומך בsnapshotting.",
          },
          {
            q: "Pod לא יכול לכתוב לvolume. kubectl logs מציג:\nError: read-only file system: /data\nmountPath: /data\nה-Pod spec:\nvolumeMounts:\n- mountPath: /data\n  readOnly: true\nמה הפתרון?",
            options: [
              "הגדל PVC",
              "שנה readOnly: false ב-volumeMount",
              "הוסף securityContext",
              "שנה StorageClass",
            ],
            answer: 2,
            explanation:
              "volumeMount.readOnly: true מוסיף את ה-volume כread-only לcontainer. שנה ל-readOnly: false (או הסר את ה-field) כדי לאפשר כתיבה.",
          },
          {
            q: "helm upgrade כשל ונרשם:\nError: UPGRADE FAILED: cannot patch 'my-configmap' with kind ConfigMap: ConfigMap.data is immutable\nמה הפתרון?",
            options: [
              "rollback מיד",
              "הסר immutable: true מה-ConfigMap לפני upgrade, או מחק ויצור מחדש",
              "שנה Helm version",
              "שנה Namespace",
            ],
            answer: 1,
            explanation:
              "ConfigMap עם immutable: true לא ניתן לשינוי. יש למחוק אותו: kubectl delete cm my-configmap ואז helm upgrade. שים לב שData ב-immutable ConfigMap אבד.",
          },
          {
            q: "Pod עם PVC ב-AWS EKS. Pod עבר לNode אחר. PVC לא נמצא. kubectl get pvc מציג Bound. מה הסיבה?",
            options: [
              "PVC נמחק",
              "EBS Volume ב-AZ אחרת מה-Node החדש – EBS Volumes הם single-AZ",
              "NetworkPolicy חוסם",
              "StorageClass שגוי",
            ],
            answer: 1,
            explanation:
              "EBS Volumes קשורים ל-AZ. אם Pod עבר ל-Node ב-AZ אחרת, EBS לא יכול להיות attached. פתרון: הוסף topologySpreadConstraints או nodeAffinity לאותה AZ.",
          },
          {
            q: "Helm Chart מכיל Secret. מה הדרך הנכונה לנהל secrets ב-Helm ב-production?",
            options: [
              "לשים secrets ישירות ב-values.yaml",
              "להשתמש ב-helm-secrets plugin (SOPS), או לא לשים secrets בChart ולהשתמש בExternal Secrets Operator",
              "להצפין base64 בvalues.yaml",
              "לשים ב-configmap",
            ],
            answer: 1,
            explanation:
              "secrets ב-values.yaml גלויים ב-git! הדרכים הנכונות: 1) helm-secrets עם SOPS מצפין. 2) External Secrets Operator מושך מ-Vault/AWS. 3) sealed-secrets.",
          },
          {
            q: "kubectl describe pv data-pv מציג:\nStatus: Released\nClaimRef: prod/data-pvc\nReclaim Policy: Retain\nמה זה אומר וכיצד לנצל מחדש?",
            options: [
              "PV פנוי אוטומטית",
              'PV הוחזק לאחר מחיקת PVC. ל-reuse: מחק ClaimRef: kubectl patch pv data-pv -p \'{"spec":{"claimRef":null}}\'',
              "PV נמחק",
              "PV נעול לצמיתות",
            ],
            answer: 1,
            explanation:
              'Released = PV היה bound לPVC שנמחק, עם Retain policy. הנתונים שמורים. ל-reuse: kubectl patch pv data-pv -p \'{"spec":{"claimRef":null}}\' → הPV חוזר לAvailable ויכול לbind לPVC חדש.',
          },
        ],
        questionsEn: [
          {
            q: "What does ReadWriteMany allow?",
            options: [
              "Read-only",
              "Write from one Node",
              "Read and write from multiple Nodes simultaneously",
              "Auto-expansion",
            ],
            answer: 2,
            explanation:
              "ReadWriteMany (RWX) allows multiple Nodes to read and write simultaneously. Suitable for NFS/EFS.",
          },
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
              "CSI is a standard that allows vendors to write storage drivers for Kubernetes.",
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
            explanation: "Helm Hooks run Jobs/Pods at: pre-install, post-upgrade, pre-delete.",
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
              "VolumeSnapshot creates a point-in-time backup of a PV, allowing restore to a specific point.",
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
              "volumeClaimTemplates in a StatefulSet creates a unique PVC per Pod. Pod-0 gets pvc-pod-0, Pod-1 gets pvc-pod-1.",
          },
          {
            q: "What is a VolumeSnapshotClass?",
            options: [
              "A StorageClass for Volumes",
              "Defines the driver and parameters for creating VolumeSnapshots",
              "A Volume API version",
              "A snapshot name",
            ],
            answer: 1,
            explanation:
              "VolumeSnapshotClass is like StorageClass — it defines which CSI driver to use when creating snapshots.",
          },
          {
            q: "What does subPath do in a Volume?",
            options: [
              "Path to a Secret",
              "Mounts a specific subdirectory from a Volume to a specific container path",
              "Size limit",
              "Path on Node",
            ],
            answer: 1,
            explanation:
              "subPath allows multiple containers in a Pod to share one Volume, each with its own subdirectory.",
          },
          {
            q: "What is thin provisioning?",
            options: [
              "Allocating the full disk immediately",
              "Allocating a large virtual disk that only uses actual physical space on demand",
              "Disk for batch jobs",
              "Disk for StatefulSets only",
            ],
            answer: 1,
            explanation:
              "Thin provisioning allocates a large logical volume but only consumes physical disk space as data is written.",
          },
          {
            q: "What does volume binding mode WaitForFirstConsumer do?",
            options: [
              "Waits for Admin approval",
              "Waits for a Pod to be scheduled before creating the PV — ensuring the PV is in the same Zone as the Pod",
              "Waits for replication",
              "Waits for backup",
            ],
            answer: 1,
            explanation:
              "WaitForFirstConsumer delays PV creation until a Pod is scheduled, so the PV is created in the same Zone/Region as the Pod.",
          },
          {
            q: "What is Rook-Ceph in Kubernetes?",
            options: [
              "A logging operator",
              "A storage orchestrator that runs Ceph distributed storage as a Kubernetes operator",
              "A network plugin",
              "A backup solution",
            ],
            answer: 1,
            explanation:
              "Rook-Ceph is an operator that manages a Ceph cluster inside Kubernetes, providing Block, Object, and File storage.",
          },
          {
            q: "A PVC stays Pending. kubectl describe pvc shows:\nEvents:\n  Warning  ProvisioningFailed  storageclass.storage.k8s.io 'fast-ssd' not found\nWhat is wrong?",
            options: [
              "PVC is too large",
              "StorageClass 'fast-ssd' does not exist in the cluster — configuration error",
              "Node is full",
              "Wrong Namespace",
            ],
            answer: 1,
            explanation:
              "The PVC requests a StorageClass that doesn't exist. Run kubectl get storageclass to list available classes. Update storageClassName in the PVC to the correct name.",
          },
          {
            q: "A StatefulSet DB. After helm uninstall, PVCs remain and the cluster is running out of space. What is the correct command?",
            options: [
              "kubectl delete pvc --all",
              "kubectl delete pvc -l app=my-db -n production (after confirming data is backed up)",
              "helm delete pvcs",
              "kubectl drain node",
            ],
            answer: 1,
            explanation:
              "StatefulSet PVCs are not deleted automatically. To clean up: kubectl delete pvc -l selector=value. Always verify that backups exist before deleting!",
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
              "helm rollback restores the last good revision. Use helm history to find revision numbers. helm rollback my-release 2 returns to revision 2.",
          },
          {
            q: "A PVC sets storageClassName: standard. kubectl get pvc shows Pending. kubectl get storageclass shows:\nNAME    PROVISIONER\nfast    ebs.csi.aws.com\nWhat is wrong?",
            options: [
              "PVC is too large",
              "StorageClass 'standard' does not exist — PVC requests a class not in the cluster",
              "Wrong Namespace",
              "PV already exists",
            ],
            answer: 1,
            explanation:
              "StorageClass 'standard' doesn't exist — only 'fast'. Fix: update the PVC to storageClassName: fast, or create a StorageClass named standard.",
          },
          {
            q: "A VolumeSnapshot is not created. kubectl describe volumesnapshot shows:\nready-to-use: false\nerror: rpc error: code = Unimplemented\nWhat is the likely cause?",
            options: [
              "Wrong Namespace",
              "CSI driver does not support snapshot capability — check if snapshot-controller and CSI driver support it",
              "PVC does not exist",
              "Capacity exceeded",
            ],
            answer: 1,
            explanation:
              "VolumeSnapshot requires a CSI driver with snapshot capability and a snapshot-controller installed. 'Unimplemented' = the driver doesn't support snapshotting.",
          },
          {
            q: "A Pod cannot write to a volume. kubectl logs shows:\nError: read-only file system: /data\nThe Pod spec has:\nvolumeMounts:\n- mountPath: /data\n  readOnly: true\nWhat is the fix?",
            options: [
              "Increase the PVC size",
              "Change readOnly: false in the volumeMount",
              "Add a securityContext",
              "Change StorageClass",
            ],
            answer: 1,
            explanation:
              "volumeMount.readOnly: true mounts the volume as read-only inside the container. Change to readOnly: false (or remove the field) to allow writes.",
          },
          {
            q: "helm upgrade fails with:\nError: UPGRADE FAILED: cannot patch 'my-configmap': ConfigMap.data is immutable\nWhat is the fix?",
            options: [
              "Rollback immediately",
              "Remove immutable: true from the ConfigMap before upgrading, or delete and recreate it",
              "Downgrade Helm",
              "Change the Namespace",
            ],
            answer: 1,
            explanation:
              "A ConfigMap with immutable: true cannot be changed. Delete it first: kubectl delete cm my-configmap, then run helm upgrade. Note that deleting an immutable ConfigMap loses its data.",
          },
          {
            q: "A Pod with a PVC on AWS EKS. The Pod moved to a different Node. The PVC is Bound but the Pod can't start. What is happening?",
            options: [
              "PVC was deleted",
              "EBS Volume is in a different AZ than the new Node — EBS Volumes are single-AZ",
              "NetworkPolicy is blocking",
              "Wrong StorageClass",
            ],
            answer: 1,
            explanation:
              "EBS Volumes are AZ-bound. If the Pod moves to a Node in a different AZ, the EBS volume cannot attach. Fix: add topologySpreadConstraints or nodeAffinity to pin the Pod to the correct AZ.",
          },
          {
            q: "A Helm Chart contains a Secret. What is the correct way to manage secrets in Helm for production?",
            options: [
              "Put secrets directly in values.yaml",
              "Use the helm-secrets plugin (SOPS), or keep secrets out of the Chart and use the External Secrets Operator",
              "Encode in base64 in values.yaml",
              "Put in a ConfigMap",
            ],
            answer: 1,
            explanation:
              "Secrets in values.yaml are visible in git! Correct approaches: 1) helm-secrets with SOPS encryption. 2) External Secrets Operator pulling from Vault/AWS. 3) Sealed Secrets.",
          },
          {
            q: "kubectl describe pv data-pv shows:\nStatus: Released\nClaimRef: prod/data-pvc\nReclaim Policy: Retain\nWhat does this mean and how do you reuse it?",
            options: [
              "PV is automatically freed",
              'PV was retained after PVC deletion. To reuse: clear the ClaimRef: kubectl patch pv data-pv -p \'{"spec":{"claimRef":null}}\'',
              "PV is deleted",
              "PV is permanently locked",
            ],
            answer: 1,
            explanation:
              'Released = the PV was bound to a deleted PVC and was kept by the Retain policy. Data is preserved. To reuse: kubectl patch pv data-pv -p \'{"spec":{"claimRef":null}}\' — PV returns to Available and can bind to a new PVC.',
          },
        ],
      },
    },
  },
  {
    id: "troubleshooting",
    icon: "🔧",
    name: "Cluster Operations & Troubleshooting",
    color: "#EF4444",
    description: "Debugging · Observability · אבחון · כלים",
    descriptionEn: "Debugging · Observability · Diagnosis · Tools",
    levels: {
      easy: {
        theory: `פקודות Debug בסיסיות.\n🔹 kubectl describe – events ומידע מפורט על resource\n🔹 kubectl logs – לוגים של קונטיינר\n🔹 kubectl exec – מריץ פקודה בתוך Pod\n🔹 kubectl get pods -A – כל הPods בכל הNamespaces\nCODE:\nkubectl describe pod my-pod\nkubectl logs my-pod\nkubectl logs my-pod -c my-container\nkubectl exec -it my-pod -- bash\nkubectl get pods -A`,
        theoryEn: `Basic Debug Commands.\n🔹 kubectl describe – events and detailed info about a resource\n🔹 kubectl logs – container logs\n🔹 kubectl exec – runs a command inside a Pod\n🔹 kubectl get pods -A – all Pods in all Namespaces\nCODE:\nkubectl describe pod my-pod\nkubectl logs my-pod\nkubectl logs my-pod -c my-container\nkubectl exec -it my-pod -- bash\nkubectl get pods -A`,
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
            q: "אתה צריך לבדוק אם Pod רץ יכול להגיע לשרת ה-DB בכתובת db:5432. איך תפתח shell בתוך ה-Pod?",
            options: [
              "kubectl ssh my-pod",
              "kubectl connect my-pod",
              "kubectl attach my-pod",
              "kubectl exec -it my-pod -- bash",
            ],
            answer: 3,
            explanation:
              "kubectl exec -it [pod] -- bash פותח shell אינטראקטיבי בתוך הקונטיינר. משם תוכל להריץ curl, nc, או telnet לבדוק קישוריות לשירותים אחרים.",
          },
          {
            q: "הצוות שלך משתמש ב-Namespaces: dev, staging, prod. אתה רוצה לראות את כל ה-Pods בכולם בפקודה אחת. איזו פקודה?",
            options: [
              "kubectl get pods -A",
              "kubectl get pods --namespace all",
              "kubectl get all",
              "kubectl get pods -n default",
            ],
            answer: 0,
            explanation:
              "kubectl get pods -A (קיצור של --all-namespaces) מציג Pods מכל ה-Namespaces בטבלה אחת. שימושי מאוד לסקירה כללית של בריאות המערכת.",
          },
          {
            q: "מה kubectl get events מציג?",
            options: [
              "רק שגיאות",
              "אירועים מהCluster – Pod scheduling, image pull, probe failures",
              "רק Pod logs",
              "רק Node events",
            ],
            answer: 1,
            explanation:
              "kubectl get events מציג אירועים שנוצרו ב-Namespace. מסודר בזמן ומציג סיבות לבעיות.",
          },
          {
            q: "כיצד רואים על איזה Node Pod רץ?",
            options: [
              "kubectl node pod-name",
              "kubectl get pod pod-name -o wide",
              "kubectl describe node",
              "kubectl pods --node",
            ],
            answer: 1,
            explanation: "kubectl get pod -o wide מציג עמודות נוספות כמו Node, IP, nominated node.",
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
              "Pod יכול להיות Running אבל לא Ready אם readiness probe לא עוברת. Service ישלח traffic רק לPods Ready.",
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
              "kubectl logs --previous מציג לוגים מהinstance הקודם של הקונטיינר לפני שקרס.",
          },
          {
            q: "מה kubectl get pods -o wide מציג?",
            options: [
              "JSON output",
              "עמודות נוספות: Node, IP, nominated node",
              "רק Pods ב-Running",
              "YAML output",
            ],
            answer: 1,
            explanation:
              "-o wide מוסיף עמודות: NODE (איפה רץ), IP (Pod IP), NOMINATED NODE (לpreemption).",
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
              "kubectl top nodes מציג CPU ו-Memory usage של כל Node. דורש metrics-server מותקן.",
          },
          {
            q: "מה kubectl diff עושה?",
            options: [
              "מציג הבדלים בין namespaces",
              "מציג הבדלים בין YAML מקומי לstate הנוכחי בCluster לפני apply",
              "משווה gרסאות K8s",
              "משווה Nodes",
            ],
            answer: 1,
            explanation:
              "kubectl diff -f manifest.yaml מציג מה ישתנה לפני kubectl apply. מאפשר review לפני שינוי. כמו git diff לK8s.",
          },
          {
            q: "מה kubectl rollout history deployment/app מציג?",
            options: [
              "כל הCommits של ה-code",
              "רשימת revisions של ה-Deployment עם change-cause annotations",
              "רשימת Pods",
              "Helm history",
            ],
            answer: 1,
            explanation:
              "rollout history מציג revisions. כדי לראות YAML של revision ספציפי: kubectl rollout history deployment/app --revision=2.",
          },
          {
            q: "מה kubectl get pod -o jsonpath='{.items[*].metadata.name}' עושה?",
            options: [
              "מציג YAML",
              "מחלץ ערך ספציפי מJSON output – במקרה זה שמות כל ה-Pods",
              "מציג IPs",
              "מציג labels",
            ],
            answer: 1,
            explanation:
              "jsonpath מאפשר לחלץ שדות ספציפיים מoutput JSON של kubectl. שימושי לscripting ואוטומציה.",
          },
          {
            q: "מה kubectl apply --server-side עושה?",
            options: [
              "מריץ על Server בלבד",
              "מבצע apply ב-API server עם Server-Side Apply – מטפל טוב יותר בconflicts עם כמה managers",
              "מריץ ב-dry-run",
              "מריץ בbackground",
            ],
            answer: 1,
            explanation:
              "Server-Side Apply (SSA) מבצע merge ב-API server ומנהל field ownership. מתאים לCI/CD systems שמנהלים resources שאחרים גם נוגעים בהם.",
          },
          {
            q: "מה kubectl wait עושה?",
            options: [
              "מחכה 5 שניות",
              "מחכה עד שcondition ספציפית מתקיימת – כמו Pod=Ready",
              "מחכה לUser input",
              "מחכה לNetwork",
            ],
            answer: 1,
            explanation:
              "kubectl wait --for=condition=Ready pod/my-pod --timeout=60s מחכה עד שה-Pod מגיע לReady. שימושי ב-scripts וCI/CD pipelines.",
          },
          {
            q: "מה kubectl label node worker-1 env=production עושה?",
            options: [
              "מגדיר Namespace",
              "מוסיף label לNode – לשימוש ב-nodeSelector ו-nodeAffinity",
              "מגדיר taint",
              "מגדיר StorageClass",
            ],
            answer: 1,
            explanation:
              "kubectl label node <node> key=value מוסיף label לNode. Pods יכולים לבחור Node לפי label דרך nodeSelector: {env: production}.",
          },
          {
            q: "מה kubectl taint nodes node1 key=val:NoSchedule עושה?",
            options: [
              "מגדיר label",
              "מסמן Node כ-Tainted – Pods ללא toleration תואם לא יתוזמנו שם",
              "מוחק Node",
              "מגדיר resource quota",
            ],
            answer: 1,
            explanation:
              "taint מסמן Node לדחיית Pods. NoSchedule = Pods חדשים לא יתוזמנו. NoExecute = Pods קיימים גם יורחקו. PreferNoSchedule = מועדף שלא.",
          },
          {
            q: "כיצד בודקים health של ה-API server?",
            options: [
              "kubectl check apiserver",
              "kubectl get --raw='/healthz' ו-kubectl get componentstatuses",
              "kubectl describe apiserver",
              "kubectl status cluster",
            ],
            answer: 1,
            explanation:
              "kubectl get --raw='/healthz' מחזיר ok אם API server בריא. kubectl get componentstatuses מציג controller-manager, scheduler, etcd.",
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
              "kubectl config get-contexts מציג את כל ה-contexts בkubeconfig. kubectl config use-context prod-cluster מחליף לcontext אחר.",
          },
          {
            q: "מה kubectl debug node/node-name עושה?",
            options: [
              "מוחק Node",
              "מריץ Pod privileged על Node לdebug בעיות OS ו-kernel",
              "מגדיר taint",
              "מציג logs",
            ],
            answer: 1,
            explanation:
              "kubectl debug node/<name> מריץ Pod privileged עם גישה לhost filesystem, network, ו-pid. שימושי לdebug בעיות ב-Node ישירות.",
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
              "kubectl describe pod shows events, conditions, and detailed info — it's the primary diagnostic tool. The Events section at the bottom usually reveals the direct cause of the problem.",
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
              "kubectl logs shows the container's stdout/stderr — the first place to look for application errors while the pod is running. Use --follow to stream logs in real time.",
          },
          {
            q: "You need to check if a running pod can reach the database at db:5432. How do you open a shell inside the pod?",
            options: [
              "kubectl ssh my-pod",
              "kubectl connect my-pod",
              "kubectl attach my-pod",
              "kubectl exec -it my-pod -- bash",
            ],
            answer: 3,
            explanation:
              "kubectl exec -it [pod] -- bash opens an interactive shell inside the container. From there you can run curl, nc, or telnet to test connectivity to other services.",
          },
          {
            q: "Your team uses namespaces: dev, staging, prod. You want to see all pods across all of them in one command. Which command?",
            options: [
              "kubectl get pods -A",
              "kubectl get pods --namespace all",
              "kubectl get all",
              "kubectl get pods -n default",
            ],
            answer: 0,
            explanation:
              "kubectl get pods -A (short for --all-namespaces) lists pods from every namespace in one table — very useful for a system-wide health check.",
          },
          {
            q: "What does kubectl get events show?",
            options: [
              "Only errors",
              "Cluster events — Pod scheduling, image pulls, probe failures",
              "Only Pod logs",
              "Only Node events",
            ],
            answer: 1,
            explanation:
              "kubectl get events shows events in the Namespace, sorted by time, indicating reasons for issues.",
          },
          {
            q: "How do you see which Node a Pod runs on?",
            options: [
              "kubectl node pod-name",
              "kubectl get pod pod-name -o wide",
              "kubectl describe node",
              "kubectl pods --node",
            ],
            answer: 1,
            explanation:
              "kubectl get pod -o wide adds extra columns including the Node name, Pod IP, and nominated node.",
          },
          {
            q: "What is the difference between Running and Ready?",
            options: [
              "No difference",
              "Running — container is active. Ready — Pod passed readiness probe and can receive traffic",
              "Ready — production only",
              "Running — before deploy",
            ],
            answer: 1,
            explanation:
              "A Pod can be Running but not Ready if the readiness probe fails. A Service only sends traffic to Ready Pods.",
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
              "kubectl logs --previous shows logs from the previous instance of the container before it crashed.",
          },
          {
            q: "What extra info does kubectl get pods -o wide show?",
            options: [
              "JSON output",
              "Extra columns: Node, IP, nominated node",
              "Only Running pods",
              "YAML output",
            ],
            answer: 1,
            explanation:
              "-o wide adds: NODE (where it runs), IP (Pod IP), NOMINATED NODE (for preemption).",
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
              "kubectl top nodes shows CPU and Memory usage per Node. Requires metrics-server to be installed.",
          },
          {
            q: "What does kubectl diff do?",
            options: [
              "Shows differences between Namespaces",
              "Shows differences between local YAML and current cluster state before applying",
              "Compares K8s versions",
              "Compares Nodes",
            ],
            answer: 1,
            explanation:
              "kubectl diff -f manifest.yaml shows what would change before kubectl apply. Enables review before modifying the cluster — like git diff for Kubernetes.",
          },
          {
            q: "What does kubectl rollout history deployment/app show?",
            options: [
              "All code commits",
              "A list of Deployment revisions with change-cause annotations",
              "A list of Pods",
              "Helm history",
            ],
            answer: 1,
            explanation:
              "rollout history lists revisions. To see the YAML of a specific revision: kubectl rollout history deployment/app --revision=2.",
          },
          {
            q: "What does kubectl get pod -o jsonpath='{.items[*].metadata.name}' do?",
            options: [
              "Shows YAML",
              "Extracts a specific value from JSON output — in this case all Pod names",
              "Shows IPs",
              "Shows labels",
            ],
            answer: 1,
            explanation:
              "jsonpath extracts specific fields from kubectl JSON output. Very useful for scripting and automation pipelines.",
          },
          {
            q: "What does kubectl apply --server-side do?",
            options: [
              "Runs on the server only",
              "Performs apply at the API server with Server-Side Apply — better conflict handling with multiple managers",
              "Runs as dry-run",
              "Runs in background",
            ],
            answer: 1,
            explanation:
              "Server-Side Apply (SSA) does merging at the API server and manages field ownership. Suitable for CI/CD systems that manage resources other tools also touch.",
          },
          {
            q: "What does kubectl wait do?",
            options: [
              "Waits 5 seconds",
              "Waits until a specific condition is met — e.g. Pod=Ready",
              "Waits for user input",
              "Waits for network",
            ],
            answer: 1,
            explanation:
              "kubectl wait --for=condition=Ready pod/my-pod --timeout=60s waits until the Pod reaches Ready. Useful in scripts and CI/CD pipelines.",
          },
          {
            q: "What does kubectl label node worker-1 env=production do?",
            options: [
              "Sets a Namespace",
              "Adds a label to the Node — used with nodeSelector and nodeAffinity",
              "Sets a taint",
              "Sets a StorageClass",
            ],
            answer: 1,
            explanation:
              "kubectl label node <node> key=value adds a label to the Node. Pods can target the Node via nodeSelector: {env: production}.",
          },
          {
            q: "What does kubectl taint nodes node1 key=val:NoSchedule do?",
            options: [
              "Sets a label",
              "Marks the Node as tainted — Pods without a matching toleration won't be scheduled there",
              "Deletes the Node",
              "Sets a resource quota",
            ],
            answer: 1,
            explanation:
              "A taint marks a Node to repel Pods. NoSchedule = new Pods won't be scheduled. NoExecute = existing Pods are also evicted. PreferNoSchedule = scheduling is discouraged but allowed.",
          },
          {
            q: "How do you check the health of the API server?",
            options: [
              "kubectl check apiserver",
              "kubectl get --raw='/healthz' and kubectl get componentstatuses",
              "kubectl describe apiserver",
              "kubectl status cluster",
            ],
            answer: 1,
            explanation:
              "kubectl get --raw='/healthz' returns 'ok' if the API server is healthy. kubectl get componentstatuses shows controller-manager, scheduler, and etcd health.",
          },
          {
            q: "What does kubectl config get-contexts do?",
            options: [
              "Shows Docker contexts",
              "Lists all kubeconfig contexts — configured clusters and users",
              "Shows Namespaces",
              "Shows Node contexts",
            ],
            answer: 1,
            explanation:
              "kubectl config get-contexts lists all contexts in kubeconfig. kubectl config use-context prod-cluster switches to a different context.",
          },
          {
            q: "What does kubectl debug node/node-name do?",
            options: [
              "Deletes the Node",
              "Runs a privileged Pod on the Node for OS and kernel debugging",
              "Sets a taint",
              "Shows logs",
            ],
            answer: 1,
            explanation:
              "kubectl debug node/<name> runs a privileged Pod with access to the host filesystem, network, and PID namespace. Useful for diagnosing Node-level issues directly.",
          },
        ],
      },
      medium: {
        theory: `שגיאות נפוצות ב-Pods.\n🔹 CrashLoopBackOff – קונטיינר קורס שוב ושוב\n🔹 ImagePullBackOff – לא ניתן להוריד image (שם שגוי/credentials)\n🔹 OOMKilled – חרגנו ממגבלת הזיכרון\n🔹 Pending – אין Node פנוי (resources / nodeSelector)\nCODE:\nkubectl describe pod my-pod   # בדוק Events\nkubectl logs my-pod --previous  # לוגים לפני crash\nkubectl top pod                 # CPU/Memory`,
        theoryEn: `Common Pod errors.\n🔹 CrashLoopBackOff – container crashes repeatedly\n🔹 ImagePullBackOff – cannot pull image (wrong name/credentials)\n🔹 OOMKilled – exceeded memory limit\n🔹 Pending – no available Node (resources / nodeSelector)\nCODE:\nkubectl describe pod my-pod   # check Events\nkubectl logs my-pod --previous  # logs before crash\nkubectl top pod                 # CPU/Memory`,
        questions: [
          {
            q: "פרסמת גרסה חדשה. ה-Pod עולה, קורס מיד, ו-Kubernetes מפעיל אותו שוב ושוב. איזה סטטוס תראה ב-kubectl get pods?",
            options: ["Terminating", "CrashLoopBackOff", "OOMKilled", "ErrImagePull"],
            answer: 1,
            explanation:
              "CrashLoopBackOff מציין שהקונטיינר מנסה לעלות, קורס, ו-Kubernetes ממשיך לנסות. השתמש ב-kubectl logs [pod] --previous כדי לראות מה קרה לפני ה-crash.",
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
              "ImagePullBackOff אומר ש-K8s לא מצליח להוריד את ה-image. הסיבות הכי נפוצות: טעות בשם/tag של ה-image, או credentials חסרים (imagePullSecrets) עבור registry פרטי.",
          },
          {
            q: "Pod רץ שעות, ואז מסתיים לפתע. kubectl describe מראה 'Reason: OOMKilled'. מה קרה ומה הפתרון?",
            options: [
              "ה-Pod פונה בגלל disk מלא; הוסף storage",
              "הקונטיינר חרג ממגבלת הזיכרון שלו; הגדל את limits.memory או אופטימיזציה לאפליקציה",
              "ה-liveness probe נכשל; תקן את ה-probe",
              'ה-Pod פונה ע"י Pod עם עדיפות גבוהה יותר',
            ],
            answer: 1,
            explanation:
              "OOMKilled = Out Of Memory Killed. הקונטיינר השתמש ביותר זיכרון ממה שהוגדר ב-limits.memory. הגדל את המגבלה, או בדוק דליפות זיכרון באפליקציה.",
          },
          {
            q: "Pod נשאר ב-Pending. kubectl describe מראה: '0/3 nodes are available: 3 Insufficient cpu'. מה הגורם השורשי?",
            options: [
              "ה-image של הקונטיינר גדול מדי",
              "ה-Namespace של ה-Pod לא קיים",
              "ה-Pod מבקש יותר CPU ממה שקיים ב-Nodes הפנויים",
              "NetworkPolicy חוסמת את ה-Pod",
            ],
            answer: 2,
            explanation:
              "Pending עם 'Insufficient cpu' אומר שאף Node לא יכול לספק את ה-CPU שה-Pod ביקש ב-requests.cpu. הקטן את ה-cpu request, או הוסף Nodes נוספים לאשכול.",
          },
          {
            q: "מה ההבדל בין ErrImagePull ל-ImagePullBackOff?",
            options: [
              "אין הבדל",
              "ErrImagePull – ניסיון ראשון נכשל. ImagePullBackOff – K8s מחכה יותר בין ניסיונות",
              "ErrImagePull לprivate, ImagePullBackOff לpublic",
              "ImagePullBackOff חמור יותר",
            ],
            answer: 1,
            explanation:
              "ErrImagePull הוא השגיאה הראשונה. ImagePullBackOff מציין שK8s נמצא ב-backoff לפני ניסיון נוסף. שתיהן אותה בעיה.",
          },
          {
            q: "מה Pod בסטטוס Evicted?",
            options: [
              "Pod שהופסק ידנית",
              "Pod שפונה ע״י kubelet בגלל לחץ משאבים (disk/memory)",
              "Pod שקרס",
              "Pod בcooldown",
            ],
            answer: 1,
            explanation:
              "Evicted Pod פונה ע״י Node kubelet בגלל disk pressure, memory pressure, או PID pressure. Pod נמחק אבל הObject נשאר לmessage.",
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
              "כשliveness probe נכשל failureThreshold פעמים, K8s ממית את הקונטיינר ומפעיל אותו מחדש לפי restartPolicy.",
          },
          {
            q: "מה kubectl port-forward משמש לצורך?",
            options: [
              "פתיחת port ב-firewall",
              "גישה ל-Pod/Service ישירות מה-machine המקומית לbug testing",
              "expose Service",
              "עדכון ports",
            ],
            answer: 1,
            explanation:
              "kubectl port-forward pod/mypod 8080:80 מעביר port 8080 מ-local machine ל-port 80 של ה-Pod. מצוין לdebug.",
          },
          {
            q: "מה RunContainerError אומר?",
            options: [
              "Pod לא מתזמן",
              "הקונטיינר התחיל אבל נכשל מיד – בד״כ mountPath שגוי, env חסר, או entrypoint שגוי",
              "Image לא נמצא",
              "OOMKilled",
            ],
            answer: 1,
            explanation:
              "RunContainerError – הקונטיינר התחיל לרוץ אבל נכשל מיד. בדוק kubectl describe ו-logs לסיבה.",
          },
          {
            q: "Pod נמצא ב-ContainerCreating זמן רב. מה הסיבות האפשריות?",
            options: [
              "הimage גדול בלבד",
              "PVC שלא נמצא, Secret חסר, image pull איטי, או בעיה ב-CNI",
              "רק network בעיה",
              "רק disk מלא",
            ],
            answer: 1,
            explanation:
              "ContainerCreating לאורך זמן: PVC לא bound, Secret/ConfigMap חסר, image גדול שמוריד, או בעיה ב-CNI network setup.",
          },
          {
            q: "Pod מצב Terminating ולא נמחק. kubectl delete pod my-pod --grace-period=0 לא עוזר. מה הסיבה?",
            options: [
              "Namespace נעול",
              "Pod יש finalizer שלא נוקה – יש לבדוק ולהסיר ידנית",
              "RBAC חוסם",
              "Node נפל",
            ],
            answer: 1,
            explanation:
              'finalizer מונע מחיקת Pod עד שlogic חיצוני מנקה אותו. kubectl patch pod my-pod -p \'{"metadata":{"finalizers":null}}\' יסיר ידנית.',
          },
          {
            q: "Pod CrashLoopBackOff. kubectl logs מציג:\nError: ECONNREFUSED 10.96.5.21:5432\nמה ניתן להסיק?",
            options: [
              "DNS שגוי",
              "האפליקציה לא יכולה להתחבר לDB שב-IP 10.96.5.21:5432 – Service או DB לא זמין",
              "OOMKill",
              "CPU throttle",
            ],
            answer: 1,
            explanation:
              "ECONNREFUSED = connection נדחית. IP 10.96.5.21 הוא ClusterIP של Service. בדוק: kubectl get svc, kubectl get endpoints, האם DB Pod רץ.",
          },
          {
            q: "Pod ב-Error. kubectl describe מציג:\nEvents: Warning Failed: Failed to create pod sandbox: ... cni plugin not initialized\nמה הבעיה?",
            options: [
              "image שגוי",
              "CNI plugin לא מוגדר נכון או לא רץ על ה-Node",
              "Storage מלא",
              "RBAC",
            ],
            answer: 1,
            explanation:
              "CNI plugin אחראי להגדרת רשת ל-Pod. אם Plugin לא אותחל, Pod לא יכול לקבל IP. בדוק את ה-CNI DaemonSet ב-kube-system namespace.",
          },
          {
            q: "Node ב-DiskPressure. kubectl describe node מציג:\nConditions:\n  DiskPressure True\nמה הסיבות הנפוצות?",
            options: [
              "RAM מלא",
              "logs שצברו מקום, images ישנים, או disk של Node מלא",
              "CPU גבוה",
              "Network congestion",
            ],
            answer: 1,
            explanation:
              "DiskPressure = disk בNode מלא. בדוק: df -h על ה-Node. נקה images: docker image prune. logs ישנים: journalctl --vacuum-time=2d. ייתכן שPVC מלא.",
          },
          {
            q: "Pod לא מתזמן. kubectl describe pod מציג:\nWarning  FailedScheduling  0/3 nodes: 1 node(s) Insufficient memory, 2 node(s) had taint {node.kubernetes.io/not-ready}\nמה הבעיה?",
            options: [
              "image שגוי",
              "רק Node אחד עם מספיק memory אבל הוא NotReady; 2 Nodes ב-not-ready",
              "Network Policy",
              "Namespace חסר",
            ],
            answer: 1,
            explanation:
              "Scheduler מדווח: 1 Node לא pass בגלל memory, 2 Nodes ב-not-ready taint. צריך לתקן את Nodes הNotReady או להוסיף Node עם מספיק memory.",
          },
          {
            q: "Deployment עם 5 replicas. כולם ב-Pending. kubectl describe pod מציג:\nInsufficientCPU: 500m requested, 200m available\nמה הפתרון הטוב ביותר לlong-term?",
            options: [
              "מחק Pods",
              "הוסף Nodes לCluster, או הקטן CPU requests לפי actual usage (kubectl top pods)",
              "השתמש ב-hostNetwork",
              "הסר resource requests",
            ],
            answer: 1,
            explanation:
              "Pending עם InsufficientCPU = Cluster מלא. Short-term: הקטן requests. Long-term: הוסף Nodes (cluster autoscaler), או השתמש ב-VPA לoptimize requests.",
          },
          {
            q: "Pod עם initContainer. kubectl get pods מציג:\nNAME    READY  STATUS\napp-1   0/1    Init:0/1\nמה זה אומר?",
            options: [
              "Main container crashed",
              "initContainer ראשון עדיין לא סיים – Pod לא יתקדם לmain container עד שכל initContainers יסיימו",
              "Namespace שגוי",
              "image שגוי",
            ],
            answer: 1,
            explanation:
              "Init:0/1 = initContainer ראשון מהסך הכולל עדיין לא הסתיים. בדוק: kubectl logs app-1 -c init-container-name לראות מה הinitContainer עושה.",
          },
          {
            q: "Service חדש לא עובד. kubectl run test-pod --image=busybox -- wget -qO- http://my-service מחזיר timeout. מה בודקים?",
            options: [
              "kubectl delete service",
              "kubectl get endpoints my-service – אם ריק, selector לא מתאים; אם לא ריק, בדוק Pod ports",
              "kubectl describe namespace",
              "kubectl get nodes",
            ],
            answer: 1,
            explanation:
              "timeout בגישה לService: 1) בדוק endpoints – ריק = selector mismatch. 2) בדוק Pod ports תואמים targetPort. 3) בדוק NetworkPolicy. 4) בדוק service port.",
          },
          {
            q: "Node ב-MemoryPressure. Pods מפונים. מה kubelet עושה?",
            options: [
              "מפסיק scheduling בלבד",
              "מגרש Pods לפי QoS – BestEffort ראשון, ואז Burstable, ולבסוף Guaranteed",
              "מפעיל מחדש את כל Pods",
              "מוחק Services",
            ],
            answer: 1,
            explanation:
              "MemoryPressure גורם לkubelet לגרש Pods לפי סדר QoS: 1. BestEffort (ללא requests/limits). 2. Burstable (requests < limits). 3. Guaranteed (requests=limits) – אחרונים להיגרש.",
          },
          {
            q: "מה kubectl top pod --sort-by=memory עושה?",
            options: [
              "מציג Pods בסדר אלפביתי",
              "מציג Pods ממוינים לפי שימוש בmemory – שימושי לזיהוי Pods בעייתיים",
              "מציג רק Pods ב-OOMKilled",
              "מציג Nodes",
            ],
            answer: 1,
            explanation:
              "kubectl top pod --sort-by=memory (או cpu) מציג Pods לפי שימוש במשאבים. שימושי לזיהוי Pods שצורכים הכי הרבה resources ועלולים לגרום לבעיות.",
          },
        ],
        questionsEn: [
          {
            q: "You deployed a new version. The pod starts, immediately crashes, and Kubernetes keeps restarting it. What status do you see in kubectl get pods?",
            options: ["Terminating", "CrashLoopBackOff", "OOMKilled", "ErrImagePull"],
            answer: 1,
            explanation:
              "CrashLoopBackOff means the container tries to start, crashes, and Kubernetes keeps retrying. Use kubectl logs [pod] --previous to see what happened before the crash.",
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
              "ImagePullBackOff means K8s can't download the image. Most common causes: typo in image name or tag, or missing credentials (imagePullSecrets) for a private registry.",
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
              "OOMKilled = Out Of Memory Killed. The container used more memory than its limits.memory setting. Increase the limit, or investigate memory leaks in your application.",
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
              "Pending with 'Insufficient cpu' means no node has enough free CPU to satisfy the pod's requests.cpu. Reduce the CPU request in the pod spec, or add more nodes to the cluster.",
          },
          {
            q: "What is the difference between ErrImagePull and ImagePullBackOff?",
            options: [
              "No difference",
              "ErrImagePull — first attempt failed. ImagePullBackOff — K8s is waiting in backoff before retrying",
              "ErrImagePull for private, ImagePullBackOff for public",
              "ImagePullBackOff is more severe",
            ],
            answer: 1,
            explanation:
              "ErrImagePull is the first failure. ImagePullBackOff means K8s is in backoff before trying again. Both indicate the same underlying problem.",
          },
          {
            q: "What is an Evicted Pod?",
            options: [
              "A manually stopped Pod",
              "A Pod evicted by the kubelet due to resource pressure (disk/memory)",
              "A crashed Pod",
              "A Pod in cooldown",
            ],
            answer: 1,
            explanation:
              "An evicted Pod was terminated by the Node kubelet due to disk pressure, memory pressure, or PID pressure. The Pod object remains with an eviction message.",
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
              "When a liveness probe fails failureThreshold times, K8s kills the container and restarts it according to the restartPolicy.",
          },
          {
            q: "What is kubectl port-forward used for?",
            options: [
              "Opening a firewall port",
              "Accessing a Pod/Service directly from the local machine for debugging",
              "Exposing a Service",
              "Updating ports",
            ],
            answer: 1,
            explanation:
              "kubectl port-forward pod/mypod 8080:80 tunnels port 8080 on your local machine to port 80 of the Pod — great for debugging.",
          },
          {
            q: "What does RunContainerError mean?",
            options: [
              "Pod is not scheduled",
              "Container started but immediately failed — usually wrong mountPath, missing env var, or wrong entrypoint",
              "Image not found",
              "OOMKilled",
            ],
            answer: 1,
            explanation:
              "RunContainerError — the container started but immediately failed. Check kubectl describe and logs for the cause.",
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
              "Long ContainerCreating: PVC not bound, missing Secret/ConfigMap, large image downloading, or CNI network setup failure.",
          },
          {
            q: "A Pod is stuck in Terminating and kubectl delete pod my-pod --grace-period=0 doesn't help. What is the cause?",
            options: [
              "Namespace is locked",
              "The Pod has a finalizer that was not cleared — must be removed manually",
              "RBAC is blocking",
              "Node is down",
            ],
            answer: 1,
            explanation:
              'A finalizer prevents Pod deletion until external logic clears it. kubectl patch pod my-pod -p \'{"metadata":{"finalizers":null}}\' removes it manually.',
          },
          {
            q: "A Pod is in CrashLoopBackOff. kubectl logs shows:\nError: ECONNREFUSED 10.96.5.21:5432\nWhat can you infer?",
            options: [
              "DNS misconfiguration",
              "The app cannot connect to the DB at IP 10.96.5.21:5432 — Service or DB Pod is unavailable",
              "OOMKill",
              "CPU throttling",
            ],
            answer: 1,
            explanation:
              "ECONNREFUSED = connection refused. 10.96.5.21 is a ClusterIP. Check: kubectl get svc, kubectl get endpoints, and whether the DB Pod is Running and Ready.",
          },
          {
            q: "A Pod is in Error. kubectl describe shows:\nEvents: Warning Failed: Failed to create pod sandbox: ... cni plugin not initialized\nWhat is the problem?",
            options: [
              "Wrong image",
              "CNI plugin is misconfigured or not running on the Node",
              "Storage is full",
              "RBAC",
            ],
            answer: 1,
            explanation:
              "The CNI plugin is responsible for setting up network for the Pod. If not initialized the Pod can't get an IP. Check the CNI DaemonSet in the kube-system namespace.",
          },
          {
            q: "A Node shows DiskPressure. kubectl describe node shows:\nConditions:\n  DiskPressure True\nWhat are the common causes?",
            options: [
              "RAM is full",
              "Accumulated logs, old images, or a full Node disk",
              "High CPU",
              "Network congestion",
            ],
            answer: 1,
            explanation:
              "DiskPressure = disk on the Node is full. Check: df -h on the Node. Clean images: docker image prune. Old logs: journalctl --vacuum-time=2d. A full PVC may also be the cause.",
          },
          {
            q: "A Pod won't schedule. kubectl describe pod shows:\nWarning  FailedScheduling  0/3 nodes: 1 Insufficient memory, 2 had taint {node.kubernetes.io/not-ready}\nWhat is happening?",
            options: [
              "Wrong image",
              "Only one Node has enough memory but it is NotReady; 2 Nodes have the not-ready taint",
              "NetworkPolicy",
              "Missing Namespace",
            ],
            answer: 1,
            explanation:
              "The Scheduler reports: 1 Node fails on memory, 2 Nodes have the not-ready taint. Fix the NotReady Nodes, or add a Node with sufficient memory.",
          },
          {
            q: "A Deployment with 5 replicas — all Pending. kubectl describe pod shows:\nInsufficientCPU: 500m requested, 200m available\nWhat is the best long-term fix?",
            options: [
              "Delete Pods",
              "Add Nodes to the cluster, or reduce CPU requests based on actual usage (kubectl top pods)",
              "Use hostNetwork",
              "Remove resource requests",
            ],
            answer: 1,
            explanation:
              "Pending with InsufficientCPU = cluster is full. Short-term: reduce requests. Long-term: add Nodes (cluster autoscaler) or use VPA to optimize requests automatically.",
          },
          {
            q: "A Pod with an initContainer. kubectl get pods shows:\nNAME    READY  STATUS\napp-1   0/1    Init:0/1\nWhat does this mean?",
            options: [
              "Main container crashed",
              "The first initContainer has not finished yet — the Pod won't start the main container until all initContainers complete",
              "Wrong Namespace",
              "Wrong image",
            ],
            answer: 1,
            explanation:
              "Init:0/1 = the first initContainer of one total has not finished. Run kubectl logs app-1 -c init-container-name to see what the initContainer is doing.",
          },
          {
            q: "A new Service is not working. kubectl run test-pod --image=busybox -- wget -qO- http://my-service returns a timeout. What do you check?",
            options: [
              "kubectl delete service",
              "kubectl get endpoints my-service — if empty the selector doesn't match; if populated check Pod ports",
              "kubectl describe namespace",
              "kubectl get nodes",
            ],
            answer: 1,
            explanation:
              "Service timeout: 1) Check endpoints — empty = selector mismatch. 2) Check Pod ports match targetPort. 3) Check NetworkPolicy. 4) Check service port mapping.",
          },
          {
            q: "A Node has MemoryPressure. Pods are being evicted. What order does the kubelet evict them?",
            options: [
              "Stops scheduling only",
              "Evicts Pods by QoS — BestEffort first, then Burstable, then Guaranteed last",
              "Restarts all Pods",
              "Deletes Services",
            ],
            answer: 1,
            explanation:
              "MemoryPressure causes the kubelet to evict Pods by QoS: 1. BestEffort (no requests/limits). 2. Burstable (requests < limits). 3. Guaranteed (requests=limits) — last to be evicted.",
          },
          {
            q: "What does kubectl top pod --sort-by=memory do?",
            options: [
              "Lists Pods alphabetically",
              "Lists Pods sorted by memory usage — useful for identifying resource-hungry Pods",
              "Shows only OOMKilled Pods",
              "Shows Nodes",
            ],
            answer: 1,
            explanation:
              "kubectl top pod --sort-by=memory (or cpu) lists Pods ordered by resource consumption. Useful for quickly identifying Pods that are using the most resources and may be causing issues.",
          },
        ],
      },
      hard: {
        theory: `Debug מתקדם.\n🔹 kubectl port-forward – מנתב port מ-Pod לlocal machine\n🔹 kubectl cp – מעתיק קבצים מ/ל-Pod\n🔹 kubectl top – CPU/Memory usage בזמן אמת\n🔹 Pod ב-Terminating לא נמחק – בגלל finalizer\nCODE:\nkubectl port-forward pod/my-pod 8080:80\nkubectl cp my-pod:/app/log.txt ./log.txt\nkubectl top pod --sort-by=memory\nkubectl patch pod my-pod -p '{"metadata":{"finalizers":null}}'`,
        theoryEn: `Advanced debugging.\n🔹 kubectl port-forward – routes a port from Pod to local machine\n🔹 kubectl cp – copies files from/to a Pod\n🔹 kubectl top – real-time CPU/Memory usage\n🔹 Pod stuck in Terminating – blocked by a finalizer\nCODE:\nkubectl port-forward pod/my-pod 8080:80\nkubectl cp my-pod:/app/log.txt ./log.txt\nkubectl top pod --sort-by=memory\nkubectl patch pod my-pod -p '{"metadata":{"finalizers":null}}'`,
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
              "תמיד חוקרים לפני שמחזירים גרסה. kubectl logs --previous מראה מה גרם ל-crash, kubectl describe מראה את ה-events. רק אחרי שמבינים את הסיבה מחליטים – לתקן או rollback.",
          },
          {
            q: "Deployment Upgrade נעצר: 5 מתוך 10 Pods על v2 ו-5 נשארים על v1. kubectl rollout status מראה 'Waiting for rollout to finish'. מה הסיבה הסבירה ביותר?",
            options: [
              "ל-Pods החדשים חסר זיכרון; עדכן resource limits",
              "ה-Pods החדשים לא עוברים את ה-readiness probe; תקן את האפליקציה/probe, או הרץ kubectl rollout undo",
              "maxSurge נמוך מדי; הגדל אותו",
              "Namespace quota מלא; מחק Pods ישנים",
            ],
            answer: 1,
            explanation:
              "Rolling update נעצר כמעט תמיד בגלל שה-Pods החדשים לא עוברים readiness probe. K8s לא יקדם את ה-rollout עד שהם Ready. תקן את האפליקציה, או הרץ kubectl rollout undo להחזיר לגרסה הקודמת.",
          },
          {
            q: "Service קיים עם selector 'app: backend'. Pods עם label 'app: backend-api' רצים ובריאים. משתמשים מקבלים connection refused. מה הבעיה?",
            options: [
              "ה-selector של ה-Service לא תואם ל-labels של ה-Pods – selector הוא 'app: backend' אך Pods הם 'app: backend-api'",
              "ה-Port של ה-Service שגוי",
              "ה-Ingress לא מוגדר",
              "ה-Pods נמצאים ב-Namespace שגוי",
            ],
            answer: 0,
            explanation:
              "Classic selector mismatch – ה-Service מחפש Pods עם 'app: backend' אבל ה-Pods מתוייגים 'app: backend-api'. הרץ kubectl describe service ו-kubectl get pods --show-labels להשוואה, ותקן את ה-selector.",
          },
          {
            q: "Node מראה NotReady ב-kubectl get nodes. Pods מפונים ממנו. מה שתי הפעולות הראשונות שלך?",
            options: [
              "מחק את ה-Node ותן לו להצטרף מחדש",
              "Restart את כל ה-Pods על ה-Node",
              "kubectl describe node <name> לבדוק Conditions ו-Events; ואז SSH לNode ולהריץ systemctl status kubelet",
              "Scale down את כל ה-Deployments ל-0",
            ],
            answer: 2,
            explanation:
              "kubectl describe node מציג memory/disk pressure, שגיאות kubelet, ו-conditions. לאחר מכן SSH ל-Node ובדוק את ה-kubelet – הסיבות הנפוצות הן: kubelet נפל, תעודת SSL פגה, או disk pressure.",
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
              "kubectl drain [node] מפנה Pods בצורה graceful, מכבד PodDisruptionBudgets. משתמשים לפני maintenance על Node.",
          },
          {
            q: "מה kubectl cordon עושה?",
            options: [
              "מוחק Node",
              "מסמן Node כ-unschedulable – Pods חדשים לא יתזמנו עליו אבל הקיימים ממשיכים",
              "restarts kubelet",
              "מסנכרן state",
            ],
            answer: 1,
            explanation:
              "kubectl cordon [node] מסמן SchedulingDisabled. Pods קיימים ממשיכים לרוץ, רק חדשים לא יתזמנו שם.",
          },
          {
            q: "מה ephemeral debug container?",
            options: [
              "Pod זמני",
              "קונטיינר שמוסיפים לPod רץ לdebug ללא restart (kubectl debug -it pod --image=busybox)",
              "init container",
              "sidecar",
            ],
            answer: 1,
            explanation:
              "kubectl debug -it [pod] --image=busybox --target=[container] מוסיף קונטיינר debug לPod רץ. שימושי כשlimage חסר כלי debug.",
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
              "מריצים nslookup/dig מתוך Pod לבדוק resolution. בודקים CoreDNS Pods ב-kube-system namespace ו-ConfigMap של CoreDNS.",
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
              "etcdctl snapshot save יוצר snapshot של etcd. חיוני לDR. צריך לציין endpoint, cert, key, cacert.",
          },
          {
            q: "Service לא מנתב traffic לPods. kubectl get endpoints מציג <none>. מה הגורם הסביר?",
            options: [
              "ה-Service port שגוי",
              "selector ב-Service לא מתאים לlabels של הPods",
              "Ingress חסר",
              "Namespace שגוי",
            ],
            answer: 1,
            explanation:
              "<none> ב-Endpoints אומר שה-Service לא מוצא Pods תואמים. הכי נפוץ: selector mismatch. הרץ kubectl get pods --show-labels והשווה ל-selector של ה-Service.",
          },
          {
            q: "kubectl apply נכשל עם:\nerror: error validating 'deployment.yaml': error validating data: ValidationError(Deployment.spec.template.spec.containers[0]): unknown field 'resoruces'\nמה הבעיה?",
            options: [
              "RBAC שגוי",
              "שגיאת typo ב-YAML – 'resoruces' במקום 'resources' – Kubernetes דוחה fields לא מוכרים",
              "Namespace שגוי",
              "version שגוי",
            ],
            answer: 1,
            explanation:
              "K8s validation דוחה fields לא מוכרים. טעויות typo כמו 'resoruces' גורמות לValidationError. השתמש ב-kubectl apply --dry-run=client לgotcha לפני apply.",
          },
          {
            q: "Pod רץ אבל ה-liveness probe נכשל כל הזמן. kubectl describe מציג:\nLiveness probe failed: HTTP probe failed with statuscode: 404\nמה בודקים?",
            options: [
              "DNS שגוי",
              "ה-probe path שגוי – /healthz שגוי, בדוק איזה endpoint האפליקציה חושפת",
              "image שגוי",
              "RBAC",
            ],
            answer: 1,
            explanation:
              "HTTP liveness probe עם 404 = ה-path שגוי. בדוק ב-code/docs איזה health endpoint חושפת האפליקציה (/health, /ping, /ready). עדכן livenessProbe.httpGet.path.",
          },
          {
            q: "kubectl exec -it my-pod -- bash מחזיר:\nError from server: container not found ('bash')\nמה הפתרון?",
            options: [
              "Pod לא Running",
              "הimage לא מכיל bash – נסה /bin/sh או kubectl debug עם image busybox",
              "Namespace שגוי",
              "RBAC",
            ],
            answer: 1,
            explanation:
              "containers מינימליים כמו Alpine אין להם bash. נסה: kubectl exec -it my-pod -- /bin/sh. אם גם זה נכשל, השתמש ב-kubectl debug -it my-pod --image=busybox.",
          },
          {
            q: "PodDisruptionBudget מוגדר עם minAvailable: 3. Cluster יש 3 replicas. kubectl drain נכשל:\nerror: cannot evict pod as it would violate the pod's disruption budget\nמה עושים?",
            options: [
              "מוחקים PDB",
              "הוסף replica לפחות אחד (scale to 4) לפני kubectl drain, ואז drain",
              "מוחקים Pod ידנית",
              "משנים Namespace",
            ],
            answer: 1,
            explanation:
              "PDB עם minAvailable:3 ו-3 replicas = לא ניתן לגרש אף Pod. הוסף replica: kubectl scale deployment app --replicas=4. עכשיו ניתן לגרש Pod אחד ועדיין עומדים ב-minAvailable:3.",
          },
          {
            q: "kubectl logs my-pod מחזיר:\nError from server (BadRequest): container 'my-container' in pod 'my-pod' is not running\nמה עושים?",
            options: [
              "Pod Running בטח",
              "Pod לא Running – בדוק kubectl get pod my-pod לראות סטטוס, ואז kubectl describe pod my-pod לEvents",
              "מחק Pod",
              "הוסף sidecar",
            ],
            answer: 1,
            explanation:
              "לא ניתן לקרוא logs מcontainer שלא רץ. בדוק סטטוס: kubectl get pod. אם Pod ב-CrashLoopBackOff, השתמש ב--previous. אם Init:Error, בדוק initContainer logs.",
          },
          {
            q: "Cluster חדש. kubectl get nodes מחזיר:\nNAME    STATUS   ROLES   AGE\nmaster  NotReady  control-plane  5m\nמה הצעד הראשון?",
            options: [
              "מחק Node",
              "CNI plugin עדיין לא מותקן – בדוק kubectl get pods -n kube-system ואז התקן CNI (Calico/Flannel)",
              "API server לא רץ",
              "etcd כשל",
            ],
            answer: 1,
            explanation:
              "Node חדש NotReady בדרך כלל = CNI plugin לא מותקן. ב-kube-system תראה CoreDNS ב-Pending. התקן CNI: kubectl apply -f https://raw.githubusercontent.com/.../calico.yaml.",
          },
          {
            q: "Helm upgrade כשל באמצע. Pods על גרסה ישנה. Release ב-failed. kubectl get pods מציג Pods ישנים עדיין רצים. מה הסטטוס של ה-Release?",
            options: [
              "מוחק אוטומטית",
              "Release ב-status FAILED – ניתן לrollback לrevision קודם עם helm rollback my-release",
              "Release מחכה",
              "Release מוחק Pods",
            ],
            answer: 1,
            explanation:
              "helm upgrade שכשל משאיר Release ב-FAILED. Pods הישנים ממשיכים לרוץ (K8s לא מוחק deployment שעובד). השתמש ב-helm rollback my-release N לחזרה למצב תקין.",
          },
          {
            q: "Pod רץ עם ENV VAR מ-ConfigMap. שינית את ConfigMap. ה-Pod עדיין משתמש בערך ישן. מה הסיבה?",
            options: [
              "ConfigMap לא עודכן",
              "env vars מConfigMap נטענים בעת הפעלת Pod בלבד – שינוי ConfigMap לא מריסטרט Pods. יש לrollout restart",
              "Cache של K8s",
              "DNS cache",
            ],
            answer: 1,
            explanation:
              "env vars מוזרקים ב-Pod creation. שינוי ConfigMap לא מעדכן Pods רצים. פתרון: kubectl rollout restart deployment/my-app יגרום ל-Pods חדשים לטעון ערכים חדשים.",
          },
          {
            q: "Pod לא עולה. kubectl describe מציג:\nWarning  Failed  Error: failed to create containerd task: ... no such file or directory: /var/lib/kubelet/pods/.../volumes/.../my-secret\nמה הסיבה?",
            options: [
              "image שגוי",
              "Secret 'my-secret' לא קיים ב-Namespace – Pod לא יכול ל-mount volume של Secret שלא קיים",
              "Node מלא",
              "RBAC",
            ],
            answer: 1,
            explanation:
              "Pod מנסה לmount Secret שלא קיים. K8s נכשל ב-container creation. בדוק: kubectl get secret my-secret -n <namespace>. אם לא קיים – צור אותו.",
          },
          {
            q: "kubectl get pods מציג Pod ב-Terminating 20 דקות. Node שבו רץ ה-Pod NotReady. מה עושים?",
            options: [
              "מחכים",
              "kubectl delete pod my-pod --grace-period=0 --force – Node NotReady אומר שkubelet לא מדווח, Pod לא יצא gracefully",
              "kubectl drain Node",
              "מחדשים cluster",
            ],
            answer: 1,
            explanation:
              "כש-Node NotReady, kubelet לא מבצע graceful termination. --force --grace-period=0 מאלץ מחיקה מה-API server. K8s יודע שה-Pod לא רץ יותר.",
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
              "Always investigate before reverting. kubectl logs --previous shows the crash reason, kubectl describe shows events. Only after you understand the cause do you decide whether to fix it or roll back.",
          },
          {
            q: "A Deployment upgrade stalled: 5 of 10 pods are on v2 and 5 remain on v1. kubectl rollout status shows 'Waiting for rollout to finish'. What is the most likely cause?",
            options: [
              "New pods need more memory; update resource limits",
              "New pods are failing readiness probes; fix the app or probe, or run kubectl rollout undo",
              "maxSurge is set too low; increase it",
              "Namespace quota exceeded; delete old pods",
            ],
            answer: 1,
            explanation:
              "A stalled rolling update almost always means the new pods are not passing readiness probes. K8s won't advance the rollout until they are Ready. Fix the app/probe config, or run kubectl rollout undo to revert.",
          },
          {
            q: "A Service has selector 'app: backend'. Pods labeled 'app: backend-api' are Running and healthy. Users get connection refused. What is wrong?",
            options: [
              "The Service selector does not match Pod labels — selector is 'app: backend' but pods have 'app: backend-api'",
              "The Service port is wrong",
              "The Ingress is misconfigured",
              "The pods are in the wrong namespace",
            ],
            answer: 0,
            explanation:
              "Classic selector mismatch — the Service is looking for pods with 'app: backend' but pods are labeled 'app: backend-api'. Run kubectl describe service and kubectl get pods --show-labels to compare, then fix the selector.",
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
              "kubectl describe node shows memory/disk pressure, kubelet errors, and conditions. Then SSH into the node and check kubelet — common causes are: kubelet crashed, SSL cert expired, or disk pressure causing the node to become unresponsive.",
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
              "kubectl drain [node] gracefully evicts Pods, respecting PodDisruptionBudgets. Used before performing Node maintenance.",
          },
          {
            q: "What does kubectl cordon do?",
            options: [
              "Deletes a Node",
              "Marks a Node as unschedulable — no new Pods are scheduled on it but existing ones continue",
              "Restarts kubelet",
              "Syncs state",
            ],
            answer: 1,
            explanation:
              "kubectl cordon [node] sets SchedulingDisabled. Existing Pods keep running; only new Pods won't be scheduled there.",
          },
          {
            q: "What is an ephemeral debug container?",
            options: [
              "A temporary Pod",
              "A container added to a running Pod for debugging without restart (kubectl debug -it pod --image=busybox)",
              "An init container",
              "A sidecar",
            ],
            answer: 1,
            explanation:
              "kubectl debug -it [pod] --image=busybox --target=[container] injects a debug container into a running Pod. Useful when the main image lacks debugging tools.",
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
              "Run nslookup/dig from inside a Pod to test resolution. Check CoreDNS Pods in kube-system and the CoreDNS ConfigMap.",
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
              "etcdctl snapshot save creates an etcd snapshot — essential for disaster recovery. Specify endpoint, cert, key, and cacert.",
          },
          {
            q: "A Service routes no traffic to Pods. kubectl get endpoints shows <none>. What is the likely cause?",
            options: [
              "Wrong Service port",
              "Service selector does not match Pod labels",
              "Missing Ingress",
              "Wrong Namespace",
            ],
            answer: 1,
            explanation:
              "<none> in Endpoints means the Service found no matching Pods. Most common cause: selector mismatch. Run kubectl get pods --show-labels and compare to the Service selector.",
          },
          {
            q: "kubectl apply fails with:\nerror: error validating 'deployment.yaml': unknown field 'resoruces'\nWhat is wrong?",
            options: [
              "Wrong RBAC",
              "Typo in YAML — 'resoruces' instead of 'resources' — Kubernetes rejects unknown fields",
              "Wrong Namespace",
              "Wrong API version",
            ],
            answer: 1,
            explanation:
              "K8s strict validation rejects unknown fields. Typos like 'resoruces' cause ValidationError. Use kubectl apply --dry-run=client to catch mistakes before applying.",
          },
          {
            q: "A Pod is running but the liveness probe keeps failing. kubectl describe shows:\nLiveness probe failed: HTTP probe failed with statuscode: 404\nWhat do you check?",
            options: [
              "DNS misconfiguration",
              "Wrong probe path — /healthz is incorrect, find which endpoint the app actually exposes",
              "Wrong image",
              "RBAC",
            ],
            answer: 1,
            explanation:
              "HTTP liveness probe returning 404 = wrong path. Check the app's docs or code to find the real health endpoint (/health, /ping, /ready). Update livenessProbe.httpGet.path.",
          },
          {
            q: "kubectl exec -it my-pod -- bash returns:\nError from server: container not found ('bash')\nWhat is the fix?",
            options: [
              "Pod not Running",
              "The image has no bash — try /bin/sh or kubectl debug with a busybox image",
              "Wrong Namespace",
              "RBAC issue",
            ],
            answer: 1,
            explanation:
              "Minimal images like Alpine don't include bash. Try: kubectl exec -it my-pod -- /bin/sh. If that also fails, use kubectl debug -it my-pod --image=busybox to inject a debug container.",
          },
          {
            q: "A PodDisruptionBudget sets minAvailable: 3. The cluster has 3 replicas. kubectl drain fails:\nerror: cannot evict pod as it would violate the pod's disruption budget\nWhat do you do?",
            options: [
              "Delete the PDB",
              "Scale to at least 4 replicas first, then kubectl drain",
              "Delete the Pod manually",
              "Change the Namespace",
            ],
            answer: 1,
            explanation:
              "PDB with minAvailable:3 and 3 replicas = no Pod can be evicted. Scale up: kubectl scale deployment app --replicas=4. Now one Pod can be evicted while still satisfying minAvailable:3.",
          },
          {
            q: "kubectl logs my-pod returns:\nError from server (BadRequest): container 'my-container' in pod 'my-pod' is not running\nWhat do you do?",
            options: [
              "The Pod is definitely Running",
              "Pod is not Running — check kubectl get pod my-pod for status, then kubectl describe pod my-pod for Events",
              "Delete the Pod",
              "Add a sidecar",
            ],
            answer: 1,
            explanation:
              "Logs cannot be read from a non-running container. Check status: kubectl get pod. If in CrashLoopBackOff, use --previous. If Init:Error, check initContainer logs.",
          },
          {
            q: "A new cluster. kubectl get nodes shows:\nNAME    STATUS    ROLES\nmaster  NotReady  control-plane\nWhat is the first step?",
            options: [
              "Delete the Node",
              "CNI plugin is not yet installed — check kubectl get pods -n kube-system then install a CNI (Calico/Flannel)",
              "API server not running",
              "etcd failure",
            ],
            answer: 1,
            explanation:
              "A newly created node NotReady usually means CNI is not installed. CoreDNS will also be Pending in kube-system. Install CNI: kubectl apply -f calico.yaml or equivalent.",
          },
          {
            q: "helm upgrade failed midway. Release is in 'failed' status. Old Pods are still running. What is the state of the Release?",
            options: [
              "Auto-deleted",
              "Release is in FAILED status — roll back to a previous revision with helm rollback my-release",
              "Release is waiting",
              "Release is deleting Pods",
            ],
            answer: 1,
            explanation:
              "A failed helm upgrade leaves the Release in FAILED state. Old Pods keep running (K8s preserves working deployments). Use helm rollback my-release N to return to a good state.",
          },
          {
            q: "A Pod uses an env var from a ConfigMap. You updated the ConfigMap. The Pod still uses the old value. Why?",
            options: [
              "ConfigMap was not updated",
              "env vars from ConfigMaps are injected at Pod creation — changing the ConfigMap doesn't restart Pods; run rollout restart",
              "K8s cache",
              "DNS cache",
            ],
            answer: 1,
            explanation:
              "env vars are injected at Pod creation time. Changing a ConfigMap doesn't update running Pods. Fix: kubectl rollout restart deployment/my-app — new Pods will pick up the new values.",
          },
          {
            q: " A Pod won't start. kubectl describe shows:\nWarning  Failed  Error: failed to create containerd task: ... no such file or directory: .../volumes/.../my-secret\nWhat is the cause?",
            options: [
              "Wrong image",
              "Secret 'my-secret' does not exist in the Namespace — Pod cannot mount a missing Secret volume",
              "Node is full",
              "RBAC",
            ],
            answer: 1,
            explanation:
              "The Pod is trying to mount a Secret that doesn't exist. K8s fails at container creation. Check: kubectl get secret my-secret -n <namespace>. If missing — create it.",
          },
          {
            q: " kubectl get pods shows a Pod stuck in Terminating for 20 minutes. The Node it ran on is NotReady. What do you do?",
            options: [
              "Wait it out",
              "kubectl delete pod my-pod --grace-period=0 --force — a NotReady Node means kubelet is not reporting, graceful termination won't happen",
              "kubectl drain the Node",
              "Restart the cluster",
            ],
            answer: 1,
            explanation:
              "When a Node is NotReady, the kubelet cannot perform graceful termination. --force --grace-period=0 removes the Pod object from the API server. K8s knows the Pod is no longer running.",
          },
        ],
      },
    },
  },
];
