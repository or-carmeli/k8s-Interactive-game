import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import WeakAreaCard from "./components/WeakAreaCard";
import RoadmapView from "./components/RoadmapView";
import { DAILY_QUESTIONS } from "./dailyQuestions";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://knzawpdrpahilmohzpbl.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuemF3cGRycGFoaWxtb2h6cGJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDA2NzYsImV4cCI6MjA4ODExNjY3Nn0.Vh4vwQkSgIHkyr3LPVAvsktni_l5q1DhP3S3MT97KQ8";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const GUEST_USER = { id: "guest", email: "guest", user_metadata: { username: "Guest" } };

const LEVEL_CONFIG = {
  easy:   { label: "קל",        labelEn: "Easy",             icon: "🌱", color: "#10B981", points: 10 },
  medium: { label: "בינוני",    labelEn: "Medium",           icon: "⚡", color: "#F59E0B", points: 20 },
  hard:   { label: "קשה",      labelEn: "Hard",             icon: "🔥", color: "#EF4444", points: 30 },
  mixed:  { label: "מיקס",     labelEn: "Mixed",            icon: "🎲", color: "#A855F7", points: 15 },
  daily:  { label: "אתגר יומי", labelEn: "Daily Challenge",  icon: "🔥", color: "#F59E0B", points: 15 },
};

const LEVEL_ORDER = ["easy", "medium", "hard"];

const MIXED_TOPIC = { id: "mixed", icon: "🎲", name: "Mixed Quiz", color: "#A855F7", levels: {} };
const DAILY_TOPIC = { id: "daily", icon: "🔥", name: "Daily Challenge", color: "#F59E0B", levels: {} };

// ── Deterministic daily randomisation ────────────────────────────────────────
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ACHIEVEMENTS = [
  { id: "first",    icon: "🌱", name: "ראשית הדרך",   nameEn: "First Steps",     condition: (s) => s.total_answered >= 1 },
  { id: "streak3",  icon: "🔥", name: "שלושה ברצף",   nameEn: "Three in a Row",  condition: (s) => s.max_streak >= 3 },
  { id: "score100", icon: "💯", name: "100 נקודות",    nameEn: "100 Points",      condition: (s) => s.total_score >= 100 },
  { id: "allEasy",  icon: "⭐", name: "כל הנושאים קל", nameEn: "All Topics Easy", condition: (s, c) => Object.keys(c).filter(k => k.endsWith("_easy")).length >= 5 },
  { id: "master",   icon: "🏆", name: "מאסטר K8s",     nameEn: "K8s Master",      condition: (s, c) => Object.keys(c).filter(k => k.endsWith("_hard")).length >= 5 },
];

const TOPICS = [
  { id:"workloads", icon:"🚀", name:"Workloads & Scheduling", color:"#00D4FF",
    description:"Pods · Deployments · StatefulSets · Scheduling · Resources", descriptionEn:"Pods · Deployments · StatefulSets · Scheduling · Resources",
    levels:{
      easy:{
        theory:`Pods ו-Deployments הם ליבת Kubernetes.\n🔹 Pod – יחידת הריצה הקטנה ביותר, מכיל קונטיינר אחד או יותר\n🔹 Pods זמניים – כשמת, נוצר חדש עם IP חדש\n🔹 Deployment מנהל קבוצת Pods זהים ומבטיח שהמספר הרצוי תמיד רץ\n🔹 replicas – עותקים זהים של ה-Pod שרצים במקביל\nCODE:\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: my-app`,
        theoryEn:`Pods and Deployments are the core of Kubernetes.\n🔹 Pod – the smallest unit of execution, contains one or more containers\n🔹 Pods are ephemeral – when one dies, a new one is created with a new IP\n🔹 Deployment manages a group of identical Pods and ensures the desired count is running\n🔹 replicas – identical copies of the Pod running in parallel\nCODE:\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: my-app`,
        questions:[
          {q:"מה הוא Pod ב-Kubernetes?",options:["מסד נתונים","יחידת הריצה הקטנה ביותר","כלי ניהול","רשת וירטואלית"],answer:1,explanation:"Pod הוא יחידת הריצה הבסיסית. מכיל קונטיינר אחד או יותר שחולקים IP ו-storage."},
          {q:"מה קורה כש-Pod מת?",options:["הוא מתאושש לבד","הנתונים נשמרים","Kubernetes יוצר Pod חדש","המערכת קורסת"],answer:2,explanation:"Pods אפמריאלים – כשמתים, Kubernetes יוצר חדש עם IP חדש."},
          {q:"מה Deployment עושה?",options:["מנהל רשת","מנהל קבוצת Pods זהים ושומר על מספרם","מנהל סיסמות","מנהל לוגים"],answer:1,explanation:"Deployment מנהל את מחזור חיי ה-Pods ומבטיח שמספר הרצוי רץ תמיד."},
          {q:"מה זה replicas?",options:["גיבויים","עותקים זהים של ה-Pod","גרסאות ישנות","קבצי לוג"],answer:1,explanation:"Replicas הם עותקים זהים של ה-Pod שרצים במקביל לזמינות גבוהה."},
          {q:"מה זה init container?",options:["קונטיינר שרץ תמיד","קונטיינר שרץ לפני הקונטיינרים הראשיים ומכין את הסביבה","גרסה בסיסית של Pod","קונטיינר ללוגים"],answer:1,explanation:"Init containers רצים ומסיימים לפני שהקונטיינרים הראשיים עולים. משמשים להגדרת תנאים, migration, והורדת קבצים."},
          {q:"מה liveness probe עושה?",options:["בודק שהPod מחובר לרשת","בודק שהקונטיינר חי – אם נכשל, Kubernetes מפעיל אותו מחדש","מגביל CPU","גיבוי אוטומטי"],answer:1,explanation:"Liveness probe בודק שהקונטיינר עדיין עובד. אם נכשל מספר פעמים, K8s ממית ומפעיל מחדש את הקונטיינר."},
          {q:"מה readiness probe עושה?",options:["בודק שהPod מוכן לקבל traffic","מאתחל את הPod","מגביל זיכרון","מוחק Pods ישנים"],answer:0,explanation:"Readiness probe בודק שהקונטיינר מוכן לקבל בקשות. Pods שלא עוברים readiness נוסרים מה-Service endpoints."},
          {q:"מה ברירת המחדל של restartPolicy ב-Pod?",options:["Never","OnFailure","Always","OnError"],answer:2,explanation:"restartPolicy: Always הוא ברירת המחדל – Kubernetes תמיד מפעיל מחדש קונטיינר שנפסק."},
          {q:"מה ההבדל בין Job ל-CronJob?",options:["אין הבדל","Job רץ פעם אחת, CronJob רץ לפי לוח זמנים","CronJob מהיר יותר","Job לproduction בלבד"],answer:1,explanation:"Job מריץ Task עד שהוא מסיים בהצלחה. CronJob מתזמן Jobs לפי cron schedule."},
          {q:"מה resource requests ב-Pod?",options:["כמות משאבים מקסימלית","כמות משאבים מינימלית שהPod צריך לקבל מה-Scheduler","גודל ה-image","מגבלת רשת"],answer:1,explanation:"requests מגדיר כמה CPU/Memory ה-Pod צריך. ה-Scheduler משתמש בזה לבחור Node מתאים."},
        ],
        questionsEn:[
          {q:"What is a Pod in Kubernetes?",options:["A database","The smallest unit of execution","A management tool","A virtual network"],answer:1,explanation:"A Pod is the basic unit of execution. It contains one or more containers that share an IP and storage."},
          {q:"What happens when a Pod dies?",options:["It recovers on its own","Data is preserved","Kubernetes creates a new Pod","The system crashes"],answer:2,explanation:"Pods are ephemeral – when they die, Kubernetes creates a new one with a new IP."},
          {q:"What does a Deployment do?",options:["Manages networking","Manages a group of identical Pods and maintains their count","Manages passwords","Manages logs"],answer:1,explanation:"A Deployment manages the lifecycle of Pods and ensures the desired count is always running."},
          {q:"What are replicas?",options:["Backups","Identical copies of the Pod","Old versions","Log files"],answer:1,explanation:"Replicas are identical copies of the Pod running in parallel for high availability."},
          {q:"What is an init container?",options:["A container that runs always","A container that runs before main containers to prepare the environment","A basic version of a Pod","A container for logs"],answer:1,explanation:"Init containers run and complete before the main containers start. Used to set preconditions, run migrations, or download files."},
          {q:"What does a liveness probe do?",options:["Checks network connectivity","Checks the container is alive — if it fails, Kubernetes restarts it","Limits CPU usage","Provides automatic backups"],answer:1,explanation:"A liveness probe checks the container is still working. If it fails repeatedly, K8s kills and restarts the container."},
          {q:"What does a readiness probe do?",options:["Checks the Pod is ready to receive traffic","Reinitialises the Pod","Limits memory","Deletes old Pods"],answer:0,explanation:"A readiness probe checks whether the container is ready to serve requests. Pods that fail readiness are removed from Service endpoints."},
          {q:"What is the default restartPolicy for a Pod?",options:["Never","OnFailure","Always","OnError"],answer:2,explanation:"restartPolicy: Always is the default — Kubernetes always restarts a stopped container."},
          {q:"What is the difference between a Job and a CronJob?",options:["No difference","A Job runs once; a CronJob runs on a schedule","CronJob is faster","Job is for production only"],answer:1,explanation:"A Job runs a task until it completes successfully. A CronJob schedules Jobs according to a cron expression."},
          {q:"What are resource requests in a Pod?",options:["Maximum amount of resources","Minimum resources the Pod needs, used by the Scheduler","Image size","Network limit"],answer:1,explanation:"requests defines how much CPU/Memory the Pod needs. The Scheduler uses this to choose a suitable Node."},
        ],
      },
      medium:{
        theory:`Rolling Updates, Rollback, ו-StatefulSets.\n🔹 Rolling Update מעדכן Pod אחד בכל פעם – zero downtime\n🔹 kubectl rollout undo – חוזר לגרסה קודמת\n🔹 StatefulSet כמו Deployment אבל Pods מקבלים שמות קבועים ו-storage משלהם\n🔹 מתאים ל: databases, Kafka, ZooKeeper\nCODE:\nkubectl set image deployment/my-app web=my-app:v2\nkubectl rollout undo deployment/my-app\n# StatefulSet: pod-0, pod-1, pod-2`,
        theoryEn:`Rolling Updates, Rollback, and StatefulSets.\n🔹 Rolling Update updates one Pod at a time – zero downtime\n🔹 kubectl rollout undo – reverts to the previous version\n🔹 StatefulSet is like Deployment but Pods get fixed names and their own storage\n🔹 Suitable for: databases, Kafka, ZooKeeper\nCODE:\nkubectl set image deployment/my-app web=my-app:v2\nkubectl rollout undo deployment/my-app\n# StatefulSet: pod-0, pod-1, pod-2`,
        questions:[
          {q:"מה היתרון של Rolling Update?",options:["מהיר יותר","Zero downtime בזמן עדכון","חוסך כסף","מגן מפני פריצות"],answer:1,explanation:"Rolling Update מעדכן Pod אחד בכל פעם, כך שתמיד יש Pods זמינים."},
          {q:"כיצד מבצעים rollback?",options:["kubectl delete deployment","kubectl rollout undo deployment/my-app","kubectl restart","kubectl revert"],answer:1,explanation:"kubectl rollout undo מחזיר את ה-Deployment לגרסה הקודמת."},
          {q:"מה ההבדל בין StatefulSet ל-Deployment?",options:["StatefulSet מהיר יותר","Pods ב-StatefulSet מקבלים שמות קבועים ואחסון קבוע","StatefulSet לא יכול לעשות scale","StatefulSet לcloud בלבד"],answer:1,explanation:"ב-StatefulSet לכל Pod יש שם קבוע (pod-0,1,2) ואחסון משלו."},
          {q:"לאיזה אפליקציה מתאים StatefulSet?",options:["Web server stateless","Databases ו-message brokers","CI/CD pipelines","Load balancers"],answer:1,explanation:"StatefulSet מתאים לאפליקציות עם מצב כמו MySQL, Kafka שצריכות זהות קבועה."},
          {q:"מה PodDisruptionBudget עושה?",options:["מגביל CPU","מגדיר מינימום Pods זמינים בזמן disruption","מנהל scaling","מגביל רשת"],answer:1,explanation:"PDB מגדיר כמה Pods חייבים להיות זמינים בזמן disruptions מתוכננות כמו node drain."},
          {q:"מה nodeSelector?",options:["בוחר Namespace","מגביל Pod לרוץ רק על Nodes עם labels ספציפיים","מגביל רשת","בוחר StorageClass"],answer:1,explanation:"nodeSelector שדה בPod spec שמגביל את ה-Scheduler לבחור רק Nodes עם labels ספציפיים."},
          {q:"מה ההבדל בין affinity ל-anti-affinity?",options:["אין הבדל","affinity מושך Pods לNode מסוים, anti-affinity דוחה","affinity לCPU, anti-affinity לזיכרון","affinity לProduction בלבד"],answer:1,explanation:"affinity מושך Pods לNodeים מסוימים. anti-affinity מבטיח שPods לא ירוצו ביחד לzones זהות."},
          {q:"מה resource limits?",options:["כמות משאבים מינימלית","כמות משאבים מקסימלית שקונטיינר רשאי להשתמש","גודל image","מגבלת ports"],answer:1,explanation:"limits מגדיר את המקסימום. חריגה מ-memory limit גורמת ל-OOMKill, חריגה מ-CPU throttling."},
          {q:"מה הפקודה לראות rollout history?",options:["kubectl history deploy","kubectl rollout history deployment/myapp","kubectl deploy log","kubectl get rollout"],answer:1,explanation:"kubectl rollout history deployment/myapp מציג את היסטוריית ה-revisions."},
          {q:"מה maxSurge ב-Rolling Update?",options:["זמן המתנה בין Pods","כמות Pods נוספים שמותר ליצור מעל ה-desired count","מספר Pods מינימלי","מגבלת Nodes"],answer:1,explanation:"maxSurge מגדיר כמה Pods נוספים מעל ה-replicas ניתן ליצור בזמן rolling update."},
        ],
        questionsEn:[
          {q:"What is the advantage of a Rolling Update?",options:["Faster","Zero downtime during update","Saves money","Prevents intrusions"],answer:1,explanation:"Rolling Update updates one Pod at a time, so Pods are always available."},
          {q:"How do you perform a rollback?",options:["kubectl delete deployment","kubectl rollout undo deployment/my-app","kubectl restart","kubectl revert"],answer:1,explanation:"kubectl rollout undo returns the Deployment to the previous version."},
          {q:"What is the main difference between StatefulSet and Deployment?",options:["StatefulSet is faster","Pods in StatefulSet get fixed names and their own storage","StatefulSet cannot scale","StatefulSet is cloud-only"],answer:1,explanation:"In StatefulSet, each Pod has a fixed name (pod-0,1,2) and its own storage."},
          {q:"What type of app is StatefulSet suitable for?",options:["Stateless web servers","Databases and message brokers","CI/CD pipelines","Load balancers"],answer:1,explanation:"StatefulSet is suitable for stateful apps like MySQL, Kafka that need a fixed identity."},
          {q:"What does a PodDisruptionBudget do?",options:["Limits CPU","Defines minimum available Pods during a disruption","Manages scaling","Limits network"],answer:1,explanation:"A PDB defines how many Pods must remain available during planned disruptions such as node drains."},
          {q:"What is nodeSelector?",options:["Selects a Namespace","Constrains a Pod to run only on Nodes with specific labels","Limits networking","Selects a StorageClass"],answer:1,explanation:"nodeSelector is a Pod spec field that restricts the Scheduler to choose only Nodes with matching labels."},
          {q:"What is the difference between affinity and anti-affinity?",options:["No difference","Affinity attracts Pods to certain Nodes; anti-affinity repels them","Affinity for CPU, anti-affinity for memory","Affinity for production only"],answer:1,explanation:"Affinity attracts Pods toward specific Nodes. Anti-affinity ensures Pods don't run together on the same zone."},
          {q:"What are resource limits?",options:["Minimum resource amount","Maximum resources a container is allowed to use","Image size","Port limit"],answer:1,explanation:"limits defines the maximum. Exceeding memory limit causes OOMKill; exceeding CPU limit causes throttling."},
          {q:"What command shows rollout history?",options:["kubectl history deploy","kubectl rollout history deployment/myapp","kubectl deploy log","kubectl get rollout"],answer:1,explanation:"kubectl rollout history deployment/myapp shows the revision history."},
          {q:"What is maxSurge in a Rolling Update?",options:["Wait time between Pods","Extra Pods allowed above the desired count","Minimum Pod count","Node limit"],answer:1,explanation:"maxSurge defines how many extra Pods above the replica count can be created during a rolling update."},
        ],
      },
      hard:{
        theory:`DaemonSets, HPA, ומצבי כשל.\n🔹 DaemonSet – Pod אחד על כל Node (logging, monitoring, CNI)\n🔹 HPA – Horizontal Pod Autoscaler, מגדיל/מקטין replicas לפי CPU/Memory\n🔹 CrashLoopBackOff – קונטיינר קורס שוב ושוב\n🔹 OOMKilled – חרגנו ממגבלת הזיכרון\nCODE:\nkubectl autoscale deployment my-app --cpu-percent=50 --min=2 --max=10\napiVersion: apps/v1\nkind: DaemonSet`,
        theoryEn:`DaemonSets, HPA, and failure states.\n🔹 DaemonSet – one Pod per Node (logging, monitoring, CNI)\n🔹 HPA – Horizontal Pod Autoscaler, scales replicas by CPU/Memory\n🔹 CrashLoopBackOff – container crashes repeatedly\n🔹 OOMKilled – container exceeded memory limit\nCODE:\nkubectl autoscale deployment my-app --cpu-percent=50 --min=2 --max=10\napiVersion: apps/v1\nkind: DaemonSet`,
        questions:[
          {q:"מה DaemonSet מבטיח?",options:["שPod רץ פעם אחת","שPod רץ על כל Node","שPod רץ על Node ספציפי","שPod רץ כל דקה"],answer:1,explanation:"DaemonSet מבטיח שעותק אחד של ה-Pod רץ על כל Node. בNode חדש – Pod נוסף אוטומטית."},
          {q:"מה זה HPA?",options:["High Performance App","Horizontal Pod Autoscaler","Host Port Assignment","Helm Package Archive"],answer:1,explanation:"HPA מגדיל/מקטין את מספר ה-Pods אוטומטית לפי עומס CPU/Memory."},
          {q:"מה משמעות CrashLoopBackOff?",options:["הPod הושהה","הקונטיינר קורס שוב ושוב","הרשת נכשלה","אין מספיק זיכרון"],answer:1,explanation:"CrashLoopBackOff – הקונטיינר מנסה לעלות, קורס, ומנסה שוב."},
          {q:"מה זה OOMKilled?",options:["שגיאת רשת","הקונטיינר חרג ממגבלת הזיכרון","הדיסק מלא","שגיאת הרשאות"],answer:1,explanation:"OOMKilled אומר שהקונטיינר צרך יותר זיכרון ממה שהוגדר לו."},
          {q:"מה pod preemption?",options:["מחיקת Pods ישנים","הוצאת Pod ממתין בעדיפות נמוכה כדי לפנות מקום לPod בעדיפות גבוהה","Scale down אוטומטי","restart של Node"],answer:1,explanation:"Preemption – Scheduler מוציא Pods בעדיפות נמוכה כדי שPod בעדיפות גבוהה יוכל להתזמן."},
          {q:"מה topologySpreadConstraints?",options:["מגביל CPU לפי Zone","מפזר Pods בצורה שווה בין Zones/Nodes","מנהל DNS","מגביל traffic"],answer:1,explanation:"topologySpreadConstraints מגדיר כיצד Pods מתפזרים בין failure domains (Zones, Nodes) לזמינות גבוהה."},
          {q:"מה sidecar container?",options:["init container","קונטיינר נוסף בPod שמספק שירות תומך כמו logging או proxy","גרסה backup","Pod ב-Namespace נפרד"],answer:1,explanation:"Sidecar הוא קונטיינר נוסף באותו Pod שרץ לצד האפליקציה הראשית ומספק יכולות כמו log shipping, proxy, או monitoring."},
          {q:"מה Vertical Pod Autoscaler (VPA)?",options:["מגדיל מספר Pods","מגדיל/מקטין CPU וMemory requests של Pod אוטומטית","מנהל Nodes","גרסה של HPA"],answer:1,explanation:"VPA מתאים resources requests/limits אוטומטית לפי שימוש בפועל, להפחתת בזבוז ומניעת OOM."},
          {q:"מה DaemonSet משמש בדרך כלל?",options:["Web servers","Agents כמו log collectors ו-monitoring שצריכים לרוץ על כל Node","Batch jobs","Load balancers"],answer:1,explanation:"DaemonSet שימושי ל-agents שצריכים לרוץ על כל Node: Fluentd, Prometheus node-exporter, CNI plugins."},
          {q:"מה PriorityClass קובע?",options:["ביצועי רשת","עדיפות תזמון וpreemption של Pods","הרשאות RBAC","StorageClass"],answer:1,explanation:"PriorityClass קובע את עדיפות ה-Pod. Pods עם priorityClassName גבוה יוקצו ראשונים ויכולים לגרום לpreemption."},
        ],
        questionsEn:[
          {q:"What does a DaemonSet guarantee?",options:["Pod runs once","Pod runs on every Node","Pod runs on a specific Node","Pod runs every minute"],answer:1,explanation:"A DaemonSet ensures one Pod runs on every Node. On a new Node – Pod is added automatically."},
          {q:"What is HPA?",options:["High Performance App","Horizontal Pod Autoscaler","Host Port Assignment","Helm Package Archive"],answer:1,explanation:"HPA automatically scales the number of Pods based on CPU/Memory load."},
          {q:"What does CrashLoopBackOff mean?",options:["Pod is paused","Container crashes repeatedly","Network failed","Not enough memory"],answer:1,explanation:"CrashLoopBackOff – the container tries to start, crashes, and tries again."},
          {q:"What is OOMKilled?",options:["A network error","Container exceeded its memory limit","Disk is full","Permission error"],answer:1,explanation:"OOMKilled means the container used more memory than its configured limit."},
          {q:"What is pod preemption?",options:["Deleting old Pods","Evicting a lower-priority pending Pod to make room for a higher-priority Pod","Automatic scale-down","Node restart"],answer:1,explanation:"Preemption — the Scheduler evicts lower-priority Pods so a higher-priority Pod can be scheduled."},
          {q:"What does topologySpreadConstraints do?",options:["Limits CPU per Zone","Spreads Pods evenly across Zones/Nodes","Manages DNS","Limits traffic"],answer:1,explanation:"topologySpreadConstraints defines how Pods are spread across failure domains (Zones, Nodes) for high availability."},
          {q:"What is a sidecar container?",options:["An init container","An extra container in a Pod providing a supporting service like logging or a proxy","A backup version","A Pod in a separate Namespace"],answer:1,explanation:"A sidecar is an extra container in the same Pod that runs alongside the main app and provides capabilities like log shipping, proxying, or monitoring."},
          {q:"What is the Vertical Pod Autoscaler (VPA)?",options:["Increases Pod count","Automatically adjusts CPU and memory requests for a Pod","Manages Nodes","A version of HPA"],answer:1,explanation:"VPA automatically adjusts resource requests/limits based on actual usage, reducing waste and preventing OOM."},
          {q:"What is a DaemonSet typically used for?",options:["Web servers","Agents like log collectors and monitoring that need to run on every Node","Batch jobs","Load balancers"],answer:1,explanation:"DaemonSets are used for node-level agents: Fluentd, Prometheus node-exporter, CNI plugins — one per Node."},
          {q:"What does PriorityClass determine?",options:["Network performance","Pod scheduling priority and preemption","RBAC permissions","StorageClass"],answer:1,explanation:"PriorityClass sets a Pod's priority. Pods with a higher priorityClassName are scheduled first and can trigger preemption."},
        ],
      },
    }
  },
  { id:"networking", icon:"🌐", name:"Networking & Service Exposure", color:"#A855F7",
    description:"Services · Ingress · NetworkPolicy · DNS", descriptionEn:"Services · Ingress · NetworkPolicy · DNS",
    levels:{
      easy:{
        theory:`Services מספקים כתובת IP יציבה לגישה ל-Pods.\n🔹 ClusterIP – גישה פנימית בלבד (ברירת מחדל)\n🔹 NodePort – חשיפה על port בכל Node\n🔹 LoadBalancer – IP חיצוני ב-cloud\n🔹 Service מוצא Pods לפי labels ו-selector\nCODE:\napiVersion: v1\nkind: Service\nspec:\n  selector:\n    app: my-app\n  ports:\n  - port: 80\n    targetPort: 8080`,
        theoryEn:`Services provide a stable IP for accessing Pods.\n🔹 ClusterIP – internal access only (default)\n🔹 NodePort – exposes on a port on each Node\n🔹 LoadBalancer – external IP in the cloud\n🔹 Service finds Pods by labels and selector\nCODE:\napiVersion: v1\nkind: Service\nspec:\n  selector:\n    app: my-app\n  ports:\n  - port: 80\n    targetPort: 8080`,
        questions:[
          {q:"למה צריך Service?",options:["לחיסכון","IP של Pod משתנה, Service נותן IP יציב","לאבטחה","לגיבוי"],answer:1,explanation:"כשPod מת ונוצר מחדש מקבל IP חדש. Service נותן כתובת קבועה."},
          {q:"איזה Service מתאים לגישה חיצונית ב-cloud?",options:["ClusterIP","NodePort","LoadBalancer","ExternalName"],answer:2,explanation:"LoadBalancer יוצר Load Balancer ב-cloud ומקצה IP חיצוני."},
          {q:"מה Service מסוג ClusterIP?",options:["חשיפה חיצונית","גישה פנימית בלבד בתוך הCluster","DNS חיצוני","VPN"],answer:1,explanation:"ClusterIP הוא ברירת המחדל – מאפשר גישה רק בתוך הCluster."},
          {q:"כיצד Service מוצא את ה-Pods שלו?",options:["לפי שם","לפי labels ו-selector","לפי IP","לפי port"],answer:1,explanation:"Service משתמש ב-selector כדי למצוא Pods עם labels תואמים."},
          {q:"מה טווח הפורטים של NodePort?",options:["1-1024","8000-9000","30000-32767","1024-65535"],answer:2,explanation:"NodePort מוקצה בטווח 30000-32767 כברירת מחדל. ניתן לשנות בהגדרות ה-API server."},
          {q:"מה ההבדל בין port ל-targetPort ב-Service?",options:["אין הבדל","port הוא הפורט של ה-Service, targetPort הוא הפורט של הקונטיינר","targetPort לHTTP בלבד","port לחיצוני, targetPort לפנימי"],answer:1,explanation:"port הוא הפורט שה-Service חושף. targetPort הוא הפורט שהקונטיינר מאזין עליו. הם יכולים להיות שונים."},
          {q:"מה headless Service?",options:["Service ללא selector","Service עם clusterIP: None – מחזיר ישירות IPs של Pods","Service ללא port","Service רק לIPv6"],answer:1,explanation:"Headless Service (clusterIP: None) לא מספק load balancing – DNS מחזיר ישירות את IPs של הPods. משמש ל-StatefulSets."},
          {q:"מה ExternalName Service?",options:["Service עם IP חיצוני","Service שמפנה לשם DNS חיצוני","LoadBalancer גלובלי","Service לout-of-cluster"],answer:1,explanation:"ExternalName Service מפנה לשם DNS חיצוני (כמו my-db.example.com) ויוצר CNAME בתוך הCluster."},
          {q:"מה kube-dns/CoreDNS ב-Kubernetes?",options:["Firewall","שרת DNS פנימי שמתרגם שמות Services ל-IPs","Load balancer","Certificate manager"],answer:1,explanation:"CoreDNS רץ כ-Pod ומספק DNS פנימי לCluster. כל Service מקבל שם DNS אוטומטי."},
          {q:"כיצד Service מסוג NodePort חושף את האפליקציה?",options:["רק בתוך הCluster","דרך פורט על כל Node ב-Cluster","דרך IP חיצוני","דרך DNS בלבד"],answer:1,explanation:"NodePort פותח פורט (30000-32767) על כל Node. תנועה לNode:Port מנותבת ל-Service ואז לPod."},
        ],
        questionsEn:[
          {q:"Why do we need a Service?",options:["To save money","Pod IP changes, Service gives a stable IP","For security","For backup"],answer:1,explanation:"When a Pod dies and is recreated it gets a new IP. A Service provides a permanent address."},
          {q:"Which Service type is for cloud external access?",options:["ClusterIP","NodePort","LoadBalancer","ExternalName"],answer:2,explanation:"LoadBalancer creates a Load Balancer in the cloud and assigns an external IP."},
          {q:"What is a ClusterIP Service?",options:["External exposure","Internal-only access within the Cluster","External DNS","VPN"],answer:1,explanation:"ClusterIP is the default – allows access only within the Cluster."},
          {q:"How does a Service find its Pods?",options:["By name","By labels and selector","By IP","By port"],answer:1,explanation:"A Service uses a selector to find Pods with matching labels."},
          {q:"What port range does NodePort use?",options:["1-1024","8000-9000","30000-32767","1024-65535"],answer:2,explanation:"NodePort is allocated in the range 30000-32767 by default. This can be changed in API server configuration."},
          {q:"What is the difference between port and targetPort in a Service?",options:["No difference","port is the Service port; targetPort is the container port","targetPort for HTTP only","port is external, targetPort internal"],answer:1,explanation:"port is the port the Service exposes. targetPort is the port the container listens on. They can differ."},
          {q:"What is a headless Service?",options:["A Service with no selector","A Service with clusterIP: None — returns Pod IPs directly","A Service without a port","IPv6-only Service"],answer:1,explanation:"A headless Service (clusterIP: None) provides no load balancing — DNS returns Pod IPs directly. Used with StatefulSets."},
          {q:"What is an ExternalName Service?",options:["A Service with an external IP","A Service that maps to an external DNS name","A global LoadBalancer","A Service outside the cluster"],answer:1,explanation:"An ExternalName Service maps to an external DNS name (e.g. my-db.example.com) by creating a CNAME inside the cluster."},
          {q:"What is CoreDNS in Kubernetes?",options:["A firewall","An internal DNS server that resolves Service names to IPs","A load balancer","A certificate manager"],answer:1,explanation:"CoreDNS runs as a Pod and provides internal cluster DNS. Every Service automatically gets a DNS name."},
          {q:"How does a NodePort Service expose an application?",options:["Only within the cluster","Via a port on every Node in the cluster","Via an external IP","Via DNS only"],answer:1,explanation:"NodePort opens a port (30000-32767) on every Node. Traffic to Node:Port is routed to the Service and then to a Pod."},
        ],
      },
      medium:{
        theory:`DNS ו-Ingress.\n🔹 כל Service מקבל DNS אוטומטי: service.namespace.svc.cluster.local\n🔹 Ingress מנתב HTTP/HTTPS לפי path או hostname\n🔹 Ingress חוסך LoadBalancers – כניסה אחת לכל ה-services\n🔹 דורש Ingress Controller (nginx, traefik)\nCODE:\napiVersion: networking.k8s.io/v1\nkind: Ingress\nspec:\n  rules:\n  - host: app.example.com\n    http:\n      paths:\n      - path: /api\n        backend:\n          service:\n            name: api-svc\n            port:\n              number: 80`,
        theoryEn:`DNS and Ingress.\n🔹 Every Service gets automatic DNS: service.namespace.svc.cluster.local\n🔹 Ingress routes HTTP/HTTPS by path or hostname\n🔹 Ingress saves LoadBalancers – one entry point for all services\n🔹 Requires an Ingress Controller (nginx, traefik)\nCODE:\napiVersion: networking.k8s.io/v1\nkind: Ingress\nspec:\n  rules:\n  - host: app.example.com\n    http:\n      paths:\n      - path: /api\n        backend:\n          service:\n            name: api-svc\n            port:\n              number: 80`,
        questions:[
          {q:"מה ה-DNS name של service בשם 'api' ב-namespace 'prod'?",options:["api.prod","api.prod.svc","api.prod.svc.cluster.local","prod.api.local"],answer:2,explanation:"Format: service.namespace.svc.cluster.local – זה ה-FQDN המלא."},
          {q:"מה היתרון של Ingress על פני LoadBalancer?",options:["מהיר יותר","כניסה אחת לכל ה-services","זול יותר תמיד","יותר מאובטח"],answer:1,explanation:"Ingress מאפשר ניתוב חכם דרך כניסה אחת, חוסך LoadBalancers רבים."},
          {q:"מה זה Ingress Controller?",options:["Plugin של kubectl","ה-Pod שמממש את הIngress rules","שירות ענן","DNS server"],answer:1,explanation:"Ingress Controller (כמו nginx) הוא ה-Pod שקורא את ה-Ingress resources ומנתב traffic."},
          {q:"מה זה Endpoints ב-Kubernetes?",options:["כתובות IP של ה-Nodes","כתובות IP של ה-Pods שה-Service מנתב אליהם","פורטים חיצוניים","כתובות DNS"],answer:1,explanation:"Endpoints הם רשימת IPs של ה-Pods שה-Service מנתב אליהם, מתעדכן אוטומטית."},
          {q:"כיצד מגדירים TLS ב-Ingress?",options:["דרך ConfigMap","דרך Secret מסוג TLS וציון שמות hosts ב-Ingress","דרך Service","דרך NodePort"],answer:1,explanation:"מגדירים Secret מסוג kubernetes.io/tls עם tls.crt ו-tls.key, ומפנים אליו ב-Ingress spec.tls."},
          {q:"מה path-based routing ב-Ingress?",options:["ניתוב לפי IP","ניתוב בקשות HTTP לפי URL path לServices שונים","ניתוב לפי header","ניתוב לפי Namespace"],answer:1,explanation:"path-based routing מאפשר /api → service-api, /web → service-web דרך Ingress אחד."},
          {q:"מה egress NetworkPolicy?",options:["מגביל תנועה נכנסת","מגביל תנועה יוצאת מPods","מנהל DNS","מגביל bandwidth"],answer:1,explanation:"egress NetworkPolicy מגדיר לאיזה יעדים Pod מורשה לשלוח תנועה."},
          {q:"מה service mesh פותר?",options:["Storage management","mTLS, observability, traffic management בין microservices","DNS resolution","RBAC"],answer:1,explanation:"Service mesh (Istio, Linkerd) מספק mTLS אוטומטי, tracing, ו-traffic management בין services."},
          {q:"מה multi-port Service?",options:["Service עם כמה Namespaces","Service שחושף יותר מפורט אחד (כגון HTTP:80 וHTTPS:443)","Service לכמה Clusters","Service עם כמה selectors"],answer:1,explanation:"Multi-port Service מאפשר לחשוף כמה פורטים בService אחד. כל פורט חייב לקבל name."},
          {q:"מה sessionAffinity ב-Service?",options:["מנהל TLS sessions","מנתב בקשות מאותו client לאותו Pod","מגביל מספר sessions","שומר credentials"],answer:1,explanation:"sessionAffinity: ClientIP מבטיח שבקשות מאותו IP תמיד מגיעות לאותו Pod (sticky sessions)."},
        ],
        questionsEn:[
          {q:"What is the DNS name of service 'api' in namespace 'prod'?",options:["api.prod","api.prod.svc","api.prod.svc.cluster.local","prod.api.local"],answer:2,explanation:"Format: service.namespace.svc.cluster.local – this is the full FQDN."},
          {q:"What is the advantage of Ingress over LoadBalancer?",options:["Faster","One entry point for all services","Always cheaper","More secure"],answer:1,explanation:"Ingress enables smart routing through one entry point, saving multiple LoadBalancers."},
          {q:"What is an Ingress Controller?",options:["A kubectl plugin","The Pod that implements the Ingress rules","A cloud service","A DNS server"],answer:1,explanation:"An Ingress Controller (like nginx) is the Pod that reads Ingress resources and routes traffic."},
          {q:"What are Endpoints in Kubernetes?",options:["IP addresses of Nodes","IP addresses of the Pods the Service routes to","External ports","DNS addresses"],answer:1,explanation:"Endpoints are the list of IPs of Pods that the Service routes to, updated automatically."},
          {q:"How do you configure TLS in an Ingress?",options:["Via ConfigMap","Via a TLS Secret and specifying hosts in the Ingress","Via a Service","Via NodePort"],answer:1,explanation:"Create a kubernetes.io/tls Secret with tls.crt and tls.key, then reference it in Ingress spec.tls."},
          {q:"What is path-based routing in Ingress?",options:["Routing by IP","Routing HTTP requests by URL path to different Services","Routing by header","Routing by Namespace"],answer:1,explanation:"Path-based routing allows /api → service-api, /web → service-web through one Ingress."},
          {q:"What is an egress NetworkPolicy?",options:["Restricts inbound traffic","Restricts outbound traffic from Pods","Manages DNS","Limits bandwidth"],answer:1,explanation:"An egress NetworkPolicy defines which destinations a Pod is allowed to send traffic to."},
          {q:"What does a service mesh solve?",options:["Storage management","mTLS, observability, and traffic management between microservices","DNS resolution","RBAC"],answer:1,explanation:"A service mesh (Istio, Linkerd) provides automatic mTLS, distributed tracing, and traffic management between services."},
          {q:"What is a multi-port Service?",options:["A Service covering multiple Namespaces","A Service exposing more than one port (e.g. HTTP:80 and HTTPS:443)","A Service for multiple Clusters","A Service with multiple selectors"],answer:1,explanation:"A multi-port Service exposes several ports in one Service definition. Each port must have a name."},
          {q:"What is sessionAffinity in a Service?",options:["Manages TLS sessions","Routes requests from the same client to the same Pod","Limits session count","Stores credentials"],answer:1,explanation:"sessionAffinity: ClientIP ensures requests from the same IP always reach the same Pod (sticky sessions)."},
        ],
      },
      hard:{
        theory:`Network Policies ו-Namespaces.\n🔹 ברירת מחדל: כל Pod יכול לדבר עם כל Pod (allow-all)\n🔹 NetworkPolicy מגביל תנועה בין Pods\n🔹 דורש CNI plugin תומך (Calico, Cilium)\n🔹 Namespaces – בידוד לוגי: dev/staging/production\nCODE:\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nspec:\n  podSelector: {}\n  policyTypes:\n  - Ingress\n  - Egress`,
        theoryEn:`Network Policies and Namespaces.\n🔹 Default: every Pod can talk to every Pod (allow-all)\n🔹 NetworkPolicy restricts traffic between Pods\n🔹 Requires a supporting CNI plugin (Calico, Cilium)\n🔹 Namespaces – logical isolation: dev/staging/production\nCODE:\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nspec:\n  podSelector: {}\n  policyTypes:\n  - Ingress\n  - Egress`,
        questions:[
          {q:"מה קורה ללא NetworkPolicy?",options:["כל תנועה חסומה","כל Pod יכול לדבר עם כל Pod","רק Pods באותו Namespace מדברים","רק HTTPS מותר"],answer:1,explanation:"ברירת מחדל ב-Kubernetes היא allow-all."},
          {q:"מה נדרש כדי ש-NetworkPolicy יעבוד?",options:["Kubernetes 1.28+","CNI plugin תומך כמו Calico או Cilium","הפעלת firewall","cloud provider מיוחד"],answer:1,explanation:"NetworkPolicy דורש CNI plugin תומך. kubenet לא מממש NetworkPolicies!"},
          {q:"מה מטרת Namespace?",options:["אחסון קבצים","בידוד לוגי של משאבים","ניהול passwords","DNS גלובלי"],answer:1,explanation:"Namespaces מספקים בידוד לוגי – הפרדה בין צוותים, פרויקטים, או סביבות."},
          {q:"מה ResourceQuota עושה?",options:["מגבב resources","מגביל את סך המשאבים שNamespace יכול להשתמש","מנטר שימוש","מחלק resources שווה"],answer:1,explanation:"ResourceQuota מגביל את סך ה-CPU, Memory, Pods שNamespace יכול לצרוך."},
          {q:"מה CNI?",options:["Container Network Interface – סטנדרט לplugins של רשת","Cloud Native Infrastructure","Cluster Node Index","Container Name Interface"],answer:0,explanation:"CNI הוא סטנדרט שמגדיר כיצד plugins מגדירים רשת לPods. Calico, Flannel, Cilium הם CNI plugins."},
          {q:"מה kube-proxy עושה?",options:["Proxy לAPI server","מממש Service networking על ידי ניהול iptables/IPVS rules","DNS resolver","מנהל TLS"],answer:1,explanation:"kube-proxy רץ על כל Node ומתחזק iptables/IPVS rules שמנתבים תנועה ל-Service IPs ל-Pod IPs."},
          {q:"מה היתרון של IPVS על iptables בkube-proxy?",options:["יותר מאובטח","ביצועים טובים יותר בCluster גדול עם Hashing","זול יותר","פשוט יותר להגדרה"],answer:1,explanation:"IPVS משתמש ב-hash tables במקום iptables linear chains – ביצועים טובים יותר עם אלפי Services."},
          {q:"מה Cilium מספק מעבר לCNI רגיל?",options:["DNS בלבד","Network policies מבוססות eBPF עם observability ואבטחה מתקדמת","StorageClass","Ingress controller"],answer:1,explanation:"Cilium משתמש ב-eBPF לאכיפת NetworkPolicy ברמת kernel עם ביצועים גבוהים ו-visibility מלאה."},
          {q:"מה מטרת network namespace ב-Linux?",options:["אחסון קבצים","בידוד ממשקי רשת וrouting tables בין processes","ניהול DNS","הגבלת bandwidth"],answer:1,explanation:"כל Pod ב-Kubernetes מקבל network namespace משלו עם ממשק רשת וrouting table נפרד."},
          {q:"כיצד Pods בNodes שונים מתקשרים?",options:["לא ניתן","דרך overlay network (VXLAN/Geneve) שיוצר ה-CNI plugin","רק דרך Services","דרך LoadBalancer חיצוני"],answer:1,explanation:"CNI plugin יוצר overlay network (VXLAN ב-Flannel, BGP ב-Calico) שמאפשר לכל Pod להגיע לכל Pod ב-Cluster."},
        ],
        questionsEn:[
          {q:"What happens without a NetworkPolicy?",options:["All traffic is blocked","Every Pod can talk to every Pod","Only Pods in the same Namespace communicate","Only HTTPS is allowed"],answer:1,explanation:"By default in Kubernetes it is allow-all."},
          {q:"What is required for NetworkPolicy to work?",options:["Kubernetes 1.28+","A supporting CNI plugin like Calico or Cilium","Enabling a firewall","A special cloud provider"],answer:1,explanation:"NetworkPolicy requires a supporting CNI plugin. kubenet does not implement NetworkPolicies!"},
          {q:"What is the purpose of a Namespace?",options:["File storage","Logical isolation of resources","Password management","Global DNS"],answer:1,explanation:"Namespaces provide logical isolation – separation between teams, projects, or environments."},
          {q:"What does ResourceQuota do?",options:["Aggregates resources","Limits total resources a Namespace can use","Monitors usage","Distributes resources equally"],answer:1,explanation:"ResourceQuota limits the total CPU, Memory, and Pods a Namespace can consume."},
          {q:"What is CNI?",options:["Container Network Interface — standard for networking plugins","Cloud Native Infrastructure","Cluster Node Index","Container Name Interface"],answer:0,explanation:"CNI is a standard defining how plugins configure networking for Pods. Calico, Flannel, and Cilium are CNI plugins."},
          {q:"What does kube-proxy do?",options:["Proxies the API server","Implements Service networking by managing iptables/IPVS rules","Resolves DNS","Manages TLS"],answer:1,explanation:"kube-proxy runs on every Node and maintains iptables/IPVS rules that route Service IPs to Pod IPs."},
          {q:"What is the advantage of IPVS over iptables in kube-proxy?",options:["More secure","Better performance in large clusters using hashing","Cheaper","Simpler to configure"],answer:1,explanation:"IPVS uses hash tables instead of iptables linear chains — much better performance with thousands of Services."},
          {q:"What does Cilium provide beyond standard CNI?",options:["DNS only","eBPF-based network policies with advanced observability and security","StorageClass","Ingress controller"],answer:1,explanation:"Cilium uses eBPF to enforce NetworkPolicy at the kernel level with high performance and full network visibility."},
          {q:"What is the purpose of a Linux network namespace?",options:["File storage","Isolating network interfaces and routing tables between processes","Managing DNS","Limiting bandwidth"],answer:1,explanation:"Every Pod in Kubernetes gets its own network namespace with a separate network interface and routing table."},
          {q:"How do Pods on different Nodes communicate?",options:["They cannot","Via an overlay network (VXLAN/Geneve) created by the CNI plugin","Only via Services","Via an external LoadBalancer"],answer:1,explanation:"The CNI plugin creates an overlay network (VXLAN in Flannel, BGP in Calico) that lets every Pod reach every other Pod in the cluster."},
        ],
      },
    }
  },
  { id:"config", icon:"🔐", name:"Configuration & Security", color:"#F59E0B",
    description:"ConfigMaps · Secrets · RBAC · ServiceAccounts", descriptionEn:"ConfigMaps · Secrets · RBAC · ServiceAccounts",
    levels:{
      easy:{
        theory:`ConfigMap ו-Secret מפרידים קוד מקונפיגורציה.\n🔹 ConfigMap – הגדרות רגילות (DB_URL, timeout)\n🔹 Secret – נתונים רגישים (passwords, tokens)\n🔹 Secrets מקודדים ב-base64 (לא מוצפנים לחלוטין!)\n🔹 שניהם: env variables או volume\nCODE:\napiVersion: v1\nkind: ConfigMap\ndata:\n  DB_URL: postgres://db:5432\n  MAX_CONN: "100"`,
        theoryEn:`ConfigMap and Secret separate code from configuration.\n🔹 ConfigMap – regular settings (DB_URL, timeout)\n🔹 Secret – sensitive data (passwords, tokens)\n🔹 Secrets are base64 encoded (not fully encrypted by default!)\n🔹 Both: env variables or volume\nCODE:\napiVersion: v1\nkind: ConfigMap\ndata:\n  DB_URL: postgres://db:5432\n  MAX_CONN: "100"`,
        questions:[
          {q:"מה ההבדל בין ConfigMap ל-Secret?",options:["אין הבדל","Secret מיועד לנתונים רגישים","ConfigMap יותר מהיר","Secret רק לpasswords"],answer:1,explanation:"Secret מיועד לנתונים רגישים. ConfigMap לקונפיגורציה רגילה."},
          {q:"האם Secrets מוצפנים לחלוטין?",options:["כן, תמיד","לא, רק מקודדים ב-base64 כברירת מחדל","תלוי בגרסה","כן, עם AES-256"],answer:1,explanation:"Secrets מקודדים ב-base64 בלבד – לא מוצפנים! צריך Sealed Secrets לאבטחה אמיתית."},
          {q:"כיצד משתמשים ב-ConfigMap ב-Pod?",options:["רק כקובץ","רק כenv","כenv variables או כvolume files","לא ניתן"],answer:2,explanation:"ConfigMap ניתן לטעון כenv variables, כvolume עם קבצים, או דרך API."},
          {q:"מה זה imagePullSecrets?",options:["Secret לDB","Secret לגישה ל-private container registry","Secret לTLS","Secret לSSH"],answer:1,explanation:"imagePullSecrets מאפשר ל-Kubernetes להוריד images מ-private registries כמו ECR."},
          {q:"כיצד יוצרים ConfigMap מקובץ?",options:["kubectl create configmap my-cm --from-literal=key=value","kubectl create configmap my-cm --from-file=config.properties","kubectl apply configmap","kubectl generate configmap"],answer:1,explanation:"--from-file יוצר ConfigMap שמפתח הוא שם הקובץ והערך הוא תוכנו."},
          {q:"מה ה-ServiceAccount הברירת מחדל?",options:["admin","default","kubernetes","root"],answer:1,explanation:"כל Namespace מכיל ServiceAccount בשם 'default'. Pods שלא מציינים ServiceAccount מקבלים אותו אוטומטית."},
          {q:"מה Secret מסוג Opaque?",options:["Secret מוצפן","Secret כללי – לכל נתון שרירותי","Secret לTLS בלבד","Secret לpasswords בלבד"],answer:1,explanation:"Opaque הוא ה-type הברירת מחדל לSecrets – לכל נתון שרירותי בbase64."},
          {q:"כיצד מזריקים את כל keys של ConfigMap כ-env variables?",options:["envFrom: configMapRef","env: configMapRef","mountEnv: configmap","injectConfig: all"],answer:0,explanation:"envFrom: - configMapRef: name: my-cm מזריק את כל ה-keys בבת אחת כ-environment variables."},
          {q:"מה ראשי התיבות RBAC?",options:["Role Based Access Control","Resource Based Auth Configuration","Runtime Binary Access Control","Recursive Binding Access Control"],answer:0,explanation:"RBAC = Role Based Access Control – מנגנון הרשאות ב-Kubernetes המבוסס על Roles ו-Bindings."},
          {q:"מה הפקודה לבדוק הרשאות של המשתמש הנוכחי?",options:["kubectl check-auth","kubectl auth can-i list pods","kubectl permissions","kubectl whoami"],answer:1,explanation:"kubectl auth can-i [verb] [resource] בודק אם המשתמש הנוכחי יכול לבצע פעולה. --as=user בודק עבור משתמש אחר."},
        ],
        questionsEn:[
          {q:"What is the difference between ConfigMap and Secret?",options:["No difference","Secret is intended for sensitive data","ConfigMap is faster","Secret is only for passwords"],answer:1,explanation:"Secret is intended for sensitive data. ConfigMap is for regular configuration."},
          {q:"Are Secrets fully encrypted by default?",options:["Yes, always","No, only base64 encoded by default","Depends on version","Yes, with AES-256"],answer:1,explanation:"Secrets are only base64 encoded by default – not encrypted! Sealed Secrets needed for true security."},
          {q:"How can a ConfigMap be used in a Pod?",options:["Only as a file","Only as env","As env variables or volume files","Not possible"],answer:2,explanation:"A ConfigMap can be loaded as env variables, as a volume with files, or via the API."},
          {q:"What is imagePullSecrets?",options:["Secret for DB","Secret for accessing a private container registry","Secret for TLS","Secret for SSH"],answer:1,explanation:"imagePullSecrets allows Kubernetes to pull images from private registries like ECR."},
          {q:"How do you create a ConfigMap from a file?",options:["kubectl create configmap my-cm --from-literal=key=value","kubectl create configmap my-cm --from-file=config.properties","kubectl apply configmap","kubectl generate configmap"],answer:1,explanation:"--from-file creates a ConfigMap where the key is the filename and the value is its content."},
          {q:"What is the default ServiceAccount?",options:["admin","default","kubernetes","root"],answer:1,explanation:"Every Namespace contains a ServiceAccount named 'default'. Pods that don't specify a ServiceAccount get it automatically."},
          {q:"What is a Secret of type Opaque?",options:["An encrypted secret","A generic secret for arbitrary data","A TLS-only secret","A password-only secret"],answer:1,explanation:"Opaque is the default Secret type — for any arbitrary base64-encoded data."},
          {q:"How do you inject all ConfigMap keys as environment variables?",options:["envFrom: configMapRef","env: configMapRef","mountEnv: configmap","injectConfig: all"],answer:0,explanation:"envFrom: - configMapRef: name: my-cm injects all keys at once as environment variables."},
          {q:"What does RBAC stand for?",options:["Role Based Access Control","Resource Based Auth Configuration","Runtime Binary Access Control","Recursive Binding Access Control"],answer:0,explanation:"RBAC = Role Based Access Control — Kubernetes' permission mechanism based on Roles and Bindings."},
          {q:"What command checks the current user's permissions?",options:["kubectl check-auth","kubectl auth can-i list pods","kubectl permissions","kubectl whoami"],answer:1,explanation:"kubectl auth can-i [verb] [resource] checks if the current user can perform an action. Use --as=user to check for another user."},
        ],
      },
      medium:{
        theory:`RBAC – Role-Based Access Control.\n🔹 Role – הרשאות בNamespace אחד\n🔹 ClusterRole – הרשאות לכל הCluster\n🔹 RoleBinding – קושר Role למשתמש/ServiceAccount\n🔹 ServiceAccount – זהות לPod בתוך הCluster\nCODE:\napiVersion: rbac.authorization.k8s.io/v1\nkind: Role\nrules:\n- apiGroups: [""]\n  resources: ["pods"]\n  verbs: ["get","list","watch"]`,
        theoryEn:`RBAC – Role-Based Access Control.\n🔹 Role – permissions in one Namespace\n🔹 ClusterRole – permissions across the whole Cluster\n🔹 RoleBinding – binds a Role to a user/ServiceAccount\n🔹 ServiceAccount – identity for a Pod within the Cluster\nCODE:\napiVersion: rbac.authorization.k8s.io/v1\nkind: Role\nrules:\n- apiGroups: [""]\n  resources: ["pods"]\n  verbs: ["get","list","watch"]`,
        questions:[
          {q:"מה ההבדל בין Role ל-ClusterRole?",options:["אין הבדל","Role מוגבל לNamespace, ClusterRole לכל הCluster","ClusterRole חזק יותר תמיד","Role לusers בלבד"],answer:1,explanation:"Role מגדיר הרשאות בNamespace ספציפי. ClusterRole מגדיר הרשאות ברמת הCluster."},
          {q:"מה זה RoleBinding?",options:["יצירת Role חדש","חיבור בין Role למשתמש/ServiceAccount","העתקת Role","מחיקת Role"],answer:1,explanation:"RoleBinding קושר Role למשתמש, group, או ServiceAccount."},
          {q:"מה זה ServiceAccount?",options:["חשבון למשתמש אנושי","זהות לPod/תהליך בתוך הCluster","שם לService","חשבון billing"],answer:1,explanation:"ServiceAccount מספק זהות לPods בתוך הCluster לאימות מול Kubernetes API."},
          {q:"מה verb מאפשר מעקב בזמן אמת?",options:["get","list","watch","monitor"],answer:2,explanation:"verb 'watch' מאפשר stream של שינויים בזמן אמת (כמו kubectl get pods -w)."},
          {q:"מה Pod Security Admission?",options:["Firewall לPods","מנגנון Kubernetes מגרסה 1.25 שאוכף Pod Security Standards (privileged/baseline/restricted)","Plugin לאימות","Network policy"],answer:1,explanation:"Pod Security Admission מחליף PodSecurityPolicy. מוגדר ברמת Namespace עם label pod-security.kubernetes.io/enforce."},
          {q:"מה admission webhook?",options:["Webhook לgit","HTTP callback שמופעל לפני/אחרי יצירת resource ב-API server","Service account","Plugin לlogging"],answer:1,explanation:"Admission webhooks (Validating/Mutating) מאפשרים לogic חיצוני לאמת או לשנות resources לפני שנשמרים ב-etcd."},
          {q:"מה immutable Secret/ConfigMap?",options:["לא ניתן לעדכן","Secret שמוצפן","Secret שניתן לקרוא בלבד","Secret שנמחק אחרי שימוש"],answer:0,explanation:"immutable: true מונע שינויים. יתרון: K8s לא צריך לנטר שינויים, חוסך load על ה-API server."},
          {q:"מה IRSA ב-AWS EKS?",options:["Integrated Role System Architecture","IAM Roles for Service Accounts – מאפשר לPods הרשאות AWS ללא credentials","Internal Route Service Adapter","Image Registry Service Auth"],answer:1,explanation:"IRSA מאפשר לPods ב-EKS לקבל credentials זמניים מ-AWS IAM דרך ServiceAccount annotations."},
          {q:"כיצד מונעים שServiceAccount ימאונט אוטומטית?",options:["לא ניתן","automountServiceAccountToken: false בPod spec","serviceAccount: none","disableMount: true"],answer:1,explanation:"automountServiceAccountToken: false מונע את mount ה-token של ServiceAccount לקונטיינר. מומלץ לPods שלא צריכים API access."},
          {q:"מה ClusterRoleBinding לעומת RoleBinding?",options:["אין הבדל","RoleBinding מגביל ל-Namespace, ClusterRoleBinding תקף לכל ה-Cluster","ClusterRoleBinding לadmins בלבד","RoleBinding לusers, ClusterRoleBinding לServiceAccounts"],answer:1,explanation:"RoleBinding מחיל Role/ClusterRole על Namespace ספציפי. ClusterRoleBinding מחיל ClusterRole על כל ה-Cluster."},
        ],
        questionsEn:[
          {q:"What is the difference between Role and ClusterRole?",options:["No difference","Role is Namespace-scoped, ClusterRole is cluster-wide","ClusterRole is always stronger","Role for users only"],answer:1,explanation:"Role defines permissions in a specific Namespace. ClusterRole defines permissions cluster-wide."},
          {q:"What is a RoleBinding?",options:["Creating a new Role","Binding a Role to a user/ServiceAccount","Copying a Role","Deleting a Role"],answer:1,explanation:"RoleBinding binds a Role to a user, group, or ServiceAccount."},
          {q:"What is a ServiceAccount?",options:["Account for a human user","Identity for a Pod/process within the Cluster","Name for a Service","Billing account"],answer:1,explanation:"ServiceAccount provides identity to Pods for authentication with the Kubernetes API."},
          {q:"What verb allows real-time watching?",options:["get","list","watch","monitor"],answer:2,explanation:"The 'watch' verb allows a stream of real-time changes (like kubectl get pods -w)."},
          {q:"What is Pod Security Admission?",options:["A Pod firewall","A Kubernetes mechanism (v1.25+) enforcing Pod Security Standards (privileged/baseline/restricted)","An auth plugin","A network policy"],answer:1,explanation:"Pod Security Admission replaced PodSecurityPolicy. Configured at Namespace level with label pod-security.kubernetes.io/enforce."},
          {q:"What is an admission webhook?",options:["A git webhook","An HTTP callback triggered before/after resource creation in the API server","A service account","A logging plugin"],answer:1,explanation:"Admission webhooks (Validating/Mutating) allow external logic to validate or modify resources before they're persisted in etcd."},
          {q:"What is an immutable Secret or ConfigMap?",options:["Cannot be updated","An encrypted secret","A read-only secret","A secret deleted after use"],answer:0,explanation:"immutable: true prevents changes. Benefit: K8s doesn't need to watch for changes, reducing load on the API server."},
          {q:"What is IRSA in AWS EKS?",options:["Integrated Role System Architecture","IAM Roles for Service Accounts — gives Pods AWS permissions without static credentials","Internal Route Service Adapter","Image Registry Service Auth"],answer:1,explanation:"IRSA allows Pods in EKS to receive temporary AWS IAM credentials via ServiceAccount annotations."},
          {q:"How do you prevent a ServiceAccount token from being auto-mounted?",options:["Not possible","automountServiceAccountToken: false in the Pod spec","serviceAccount: none","disableMount: true"],answer:1,explanation:"automountServiceAccountToken: false prevents the ServiceAccount token from being mounted into the container. Recommended for Pods that don't need API access."},
          {q:"What is the difference between ClusterRoleBinding and RoleBinding?",options:["No difference","RoleBinding is Namespace-scoped; ClusterRoleBinding applies cluster-wide","ClusterRoleBinding is for admins only","RoleBinding for users, ClusterRoleBinding for ServiceAccounts"],answer:1,explanation:"RoleBinding applies a Role/ClusterRole to a specific Namespace. ClusterRoleBinding applies a ClusterRole across the entire cluster."},
        ],
      },
      hard:{
        theory:`אבטחה מתקדמת.\n🔹 Least Privilege – רק ההרשאות הנחוצות\n🔹 External Secrets Operator – מסנכרן מ-AWS/GCP/Azure\n🔹 Sealed Secrets – מצפין secrets בgit\n🔹 Encryption at Rest – הצפנת etcd\nCODE:\napiVersion: external-secrets.io/v1beta1\nkind: ExternalSecret\nspec:\n  secretStoreRef:\n    name: aws-secretsmanager\n  target:\n    name: my-k8s-secret`,
        theoryEn:`Advanced security.\n🔹 Least Privilege – only necessary permissions\n🔹 External Secrets Operator – syncs from AWS/GCP/Azure\n🔹 Sealed Secrets – encrypts secrets in git\n🔹 Encryption at Rest – encrypting etcd\nCODE:\napiVersion: external-secrets.io/v1beta1\nkind: ExternalSecret\nspec:\n  secretStoreRef:\n    name: aws-secretsmanager\n  target:\n    name: my-k8s-secret`,
        questions:[
          {q:"מה עיקרון Least Privilege?",options:["לתת admin לכולם","לתת רק את ההרשאות המינימליות הנחוצות","לא לתת הרשאות בכלל","הרשאות לפי שם"],answer:1,explanation:"Least Privilege – כל entity מקבל רק את ההרשאות שהוא צריך."},
          {q:"מה External Secrets Operator עושה?",options:["מצפין secrets קיימים","מסנכרן secrets מcloud providers לK8s","מוחק secrets ישנים","מגבה secrets"],answer:1,explanation:"External Secrets Operator מסנכרן secrets מ-AWS Secrets Manager, GCP, Azure Key Vault לK8s."},
          {q:"מה Encryption at Rest?",options:["הצפנת תנועת רשת","הצפנת etcd database שמאחסן secrets","הצפנת קבצי log","הצפנת images"],answer:1,explanation:"Encryption at Rest מצפין את etcd שבו K8s שומר את כל ה-secrets."},
          {q:"מה Sealed Secrets מאפשר?",options:["הצפנת תעבורת רשת","שמירת secrets מוצפנים ב-git בבטחה","יצירת secrets אוטומטית","שיתוף בין clusters"],answer:1,explanation:"Sealed Secrets מצפין secrets כך שניתן לשמור אותם ב-git בבטחה."},
          {q:"מה שלוש רמות Pod Security Standards?",options:["low/medium/high","privileged/baseline/restricted","none/basic/full","open/limited/closed"],answer:1,explanation:"privileged – ללא הגבלות. baseline – מינימום הגנה. restricted – הגבלות מחמירות, best practice לproduction."},
          {q:"כיצד לבדוק מי ניגש ל-Secret ב-Kubernetes?",options:["kubectl logs secret","Audit logs ב-API server + כלים כמו Falco","kubectl describe secret","env vars בPod"],answer:1,explanation:"Kubernetes Audit Logs מתעדים כל גישה ל-API. Falco יכול לזהות גישה לSecrets ב-runtime."},
          {q:"מה OPA/Gatekeeper?",options:["Open Port Authority","Open Policy Agent – מנגנון policy כ-code לK8s","Optional Pod Allocator","Object Permission Abstraction"],answer:1,explanation:"OPA Gatekeeper הוא admission webhook שמאפשר לכתוב policies (Rego) שמונעות deployments שמפרים כללים."},
          {q:"מה workload identity ב-GKE?",options:["שם ל-Workload","מנגנון שמקשר ServiceAccount של K8s לGoogle Service Account להרשאות GCP","Plugin לlogging","מנגנון TLS"],answer:1,explanation:"Workload Identity ב-GKE מאפשר לPods לגשת לשירותי GCP (GCS, Pub/Sub) ללא Service Account keys."},
          {q:"מה kubectl --as עושה?",options:["שינוי context","מריץ פקודה כאילו אתה משתמש אחר – לtest הרשאות","שמירת credentials","switch namespace"],answer:1,explanation:"kubectl --as=someuser מריץ פקודה עם זהות של משתמש אחר. שימושי לtest RBAC permissions."},
          {q:"מה network policy default-deny?",options:["חוסם כל תנועה יוצאת","PolicyRule שחוסם את כל התנועה הנכנסת לNamespace בהיעדר rules ספציפיים","מוחק כל Service","חוסם DNS"],answer:1,explanation:"NetworkPolicy עם podSelector: {} ו-policyTypes: Ingress ללא ingress rules חוסמת כל תנועה נכנסת לכל Pods בNamespace."},
        ],
        questionsEn:[
          {q:"What is the Least Privilege principle?",options:["Give admin to everyone","Give only the minimum necessary permissions","Give no permissions","Permissions by name"],answer:1,explanation:"Least Privilege – each entity receives only the permissions it needs."},
          {q:"What does External Secrets Operator do?",options:["Encrypts existing secrets","Syncs secrets from cloud providers to K8s","Deletes old secrets","Backs up secrets"],answer:1,explanation:"External Secrets Operator syncs secrets from AWS Secrets Manager, GCP, Azure Key Vault to K8s."},
          {q:"What is Encryption at Rest?",options:["Encrypting network traffic","Encrypting the etcd database that stores secrets","Encrypting log files","Encrypting images"],answer:1,explanation:"Encryption at Rest encrypts the etcd database where K8s stores all secrets."},
          {q:"What does Sealed Secrets allow?",options:["Encrypting network traffic","Storing encrypted secrets in git safely","Auto-creating secrets","Sharing between clusters"],answer:1,explanation:"Sealed Secrets encrypts secrets so they can be safely stored in a git repository."},
          {q:"What are the three Pod Security Standard levels?",options:["low/medium/high","privileged/baseline/restricted","none/basic/full","open/limited/closed"],answer:1,explanation:"privileged — no restrictions. baseline — minimal protection. restricted — strict settings, production best practice."},
          {q:"How do you audit who accessed a Secret in Kubernetes?",options:["kubectl logs secret","API server audit logs and tools like Falco","kubectl describe secret","Pod env vars"],answer:1,explanation:"Kubernetes Audit Logs record every API access. Falco can detect runtime Secret access and alert on suspicious activity."},
          {q:"What is OPA/Gatekeeper?",options:["Open Port Authority","Open Policy Agent — policy-as-code enforcement for Kubernetes","Optional Pod Allocator","Object Permission Abstraction"],answer:1,explanation:"OPA Gatekeeper is an admission webhook that lets you write policies (Rego) blocking deployments that violate rules."},
          {q:"What is Workload Identity in GKE?",options:["A name for a workload","Links a K8s ServiceAccount to a Google Service Account for GCP permissions","A logging plugin","A TLS mechanism"],answer:1,explanation:"Workload Identity in GKE lets Pods access GCP services (GCS, Pub/Sub) without Service Account key files."},
          {q:"What does kubectl --as do?",options:["Changes context","Runs a command as a different user — useful for testing permissions","Saves credentials","Switches namespace"],answer:1,explanation:"kubectl --as=someuser runs a command with another user's identity. Useful for testing RBAC permissions."},
          {q:"What is a default-deny NetworkPolicy?",options:["Blocks all outbound traffic","A policy that blocks all inbound traffic to a Namespace when no specific rules exist","Deletes all Services","Blocks DNS"],answer:1,explanation:"A NetworkPolicy with podSelector: {} and policyTypes: Ingress with no ingress rules blocks all inbound traffic to every Pod in the Namespace."},
        ],
      },
    }
  },
  { id:"storage", icon:"💾", name:"Storage & Package Management", color:"#10B981",
    description:"PersistentVolumes · StorageClass · Helm · Operators", descriptionEn:"PersistentVolumes · StorageClass · Helm · Operators",
    levels:{
      easy:{
        theory:`PersistentVolumes ו-Helm בסיסי.\n🔹 PV – יחידת אחסון בCluster (admin מגדיר)\n🔹 PVC – בקשה לאחסון מ-Pod\n🔹 Helm Chart – חבילה של Kubernetes manifests עם templates\n🔹 helm install – מתקין Chart ויוצר Release\nCODE:\napiVersion: v1\nkind: PersistentVolumeClaim\nspec:\n  accessModes: [ReadWriteOnce]\n  resources:\n    requests:\n      storage: 10Gi`,
        theoryEn:`PersistentVolumes and basic Helm.\n🔹 PV – a storage unit in the Cluster (defined by admin)\n🔹 PVC – a request for storage by a Pod\n🔹 Helm Chart – a package of K8s manifests with templates\n🔹 helm install – installs a Chart and creates a Release\nCODE:\napiVersion: v1\nkind: PersistentVolumeClaim\nspec:\n  accessModes: [ReadWriteOnce]\n  resources:\n    requests:\n      storage: 10Gi`,
        questions:[
          {q:"מה ההבדל בין PV ל-PVC?",options:["אין הבדל","PV הוא האחסון, PVC הוא הבקשה לאחסון","PVC לproduction, PV לdev","PV לLinux, PVC לWindows"],answer:1,explanation:"PV הוא יחידת האחסון שה-admin מגדיר. PVC היא הבקשה של האפליקציה לאחסון."},
          {q:"מה AccessMode ReadWriteOnce?",options:["קריאה בלבד","כתיבה מNode אחד בלבד","קריאה וכתיבה מnode אחד בו-זמנית","קריאה מכל הNodes"],answer:2,explanation:"ReadWriteOnce (RWO) – mounted לקריאה וכתיבה על ידי node אחד בלבד."},
          {q:"מה זה Helm Chart?",options:["Docker image","חבילה של Kubernetes manifests עם templates","רשת Kubernetes","גרסה של kubectl"],answer:1,explanation:"Helm Chart הוא חבילה המכילה templates, values, ומטה-נתונים להתקנת אפליקציה."},
          {q:"מה הפקודה להתקנת Helm Chart?",options:["helm deploy","helm install","helm run","helm apply"],answer:1,explanation:"helm install [release-name] [chart] מתקין Chart ויוצר Release חדש."},
          {q:"מה emptyDir?",options:["Volume ריק שנמחק עם ה-Pod","Volume קבוע","Volume לקבצי logs","Volume לDB"],answer:0,explanation:"emptyDir נוצר כשPod מתזמן ונמחק כשה-Pod מוחק. מתאים לshared temp files בין קונטיינרים."},
          {q:"מה hostPath?",options:["Path ל-Helm Chart","Volume שמוסיף תיקיה מה-Node לPod","Secret path","ConfigMap path"],answer:1,explanation:"hostPath מאפשר לPod לגשת לתיקיה ישירות מ-filesystem של ה-Node. שימוש בו מאוד נדיר ב-production."},
          {q:"מה StorageClass?",options:["סוג Pod","הגדרת provisioner לדיסקים דינמיים","סוג Service","קטגוריית log"],answer:1,explanation:"StorageClass מגדיר provisioner (כמו gp2, pd-standard) ו-reclaim policy. ה-PVC מציין StorageClass לקבלת דיסק."},
          {q:"מה helm repo add עושה?",options:["מוסיף Chart חדש","מוסיף Helm repository (מאגר charts) לרשימה המקומית","מוסיף dependency","מעדכן Chart"],answer:1,explanation:"helm repo add [name] [url] מוסיף repository כדי שניתן לחפש ולהתקין Charts ממנו."},
          {q:"מה helm list מציג?",options:["רשימת Charts זמינים","רשימת Releases מותקנים ב-Cluster","רשימת Namespaces","רשימת Nodes"],answer:1,explanation:"helm list (או helm ls) מציג את כל ה-Releases המותקנים עם גרסה, סטטוס, ו-chart שהשתמשו בו."},
          {q:"מה קורה לנתונים ב-emptyDir כש-Pod מאתחל?",options:["נשמרים לתמיד","נמחקים","מגובים אוטומטית","מועברים לPV"],answer:1,explanation:"emptyDir נשאר חי גם אם קונטיינר מתאחל, אבל נמחק לחלוטין כשה-Pod עצמו מוחק."},
        ],
        questionsEn:[
          {q:"What is the difference between PV and PVC?",options:["No difference","PV is the storage, PVC is the request","PVC for production, PV for dev","PV for Linux, PVC for Windows"],answer:1,explanation:"PV is the storage unit defined by the admin. PVC is the application request for storage."},
          {q:"What is AccessMode ReadWriteOnce?",options:["Read-only","Write from one Node only","Read and write from one node at a time","Read from all Nodes"],answer:2,explanation:"ReadWriteOnce (RWO) – can be mounted for read/write by only one node at a time."},
          {q:"What is a Helm Chart?",options:["A Docker image","A package of K8s manifests with templates","A Kubernetes network","A version of kubectl"],answer:1,explanation:"A Helm Chart is a package containing templates, values, and metadata for installing an application."},
          {q:"What command installs a Helm Chart?",options:["helm deploy","helm install","helm run","helm apply"],answer:1,explanation:"helm install [release-name] [chart] installs a Chart and creates a new Release."},
          {q:"What is emptyDir?",options:["An empty Volume deleted with the Pod","A persistent Volume","A volume for log files","A volume for databases"],answer:0,explanation:"emptyDir is created when a Pod is scheduled and deleted when the Pod is removed. Useful for temp files shared between containers."},
          {q:"What is hostPath?",options:["A path for Helm Charts","A Volume that mounts a Node directory into a Pod","A Secret path","A ConfigMap path"],answer:1,explanation:"hostPath mounts a directory from the Node's filesystem into the Pod. Rarely used in production due to portability and security concerns."},
          {q:"What is a StorageClass?",options:["A Pod type","Defines a provisioner for dynamic disk creation","A Service type","A log category"],answer:1,explanation:"StorageClass defines a provisioner (e.g. gp2, pd-standard) and reclaim policy. A PVC specifies a StorageClass to get a disk."},
          {q:"What does helm repo add do?",options:["Adds a new Chart","Adds a Helm repository (chart registry) to the local list","Adds a dependency","Updates a Chart"],answer:1,explanation:"helm repo add [name] [url] registers a repository so you can search and install Charts from it."},
          {q:"What does helm list show?",options:["Available Charts","Installed Releases in the Cluster","Namespaces","Nodes"],answer:1,explanation:"helm list (or helm ls) shows all installed Releases with version, status, and the Chart used."},
          {q:"What happens to emptyDir data when a Pod restarts?",options:["Persisted forever","Deleted when the Pod is removed (survives container restart)","Automatically backed up","Moved to a PV"],answer:1,explanation:"emptyDir survives container restarts within the same Pod, but is deleted entirely when the Pod itself is deleted."},
        ],
      },
      medium:{
        theory:`StorageClass ו-Helm Values.\n🔹 StorageClass – מגדיר סוג אחסון וprovisioner\n🔹 Dynamic Provisioning – PV נוצר אוטומטית עם PVC\n🔹 Reclaim Policy Delete – מוחק PV כשPVC נמחק\n🔹 helm upgrade / --set – עדכון ושינוי values\nCODE:\nhelm install my-app ./chart --set replicaCount=3\nhelm upgrade my-app ./chart -f prod-values.yaml\nhelm rollback my-app 1`,
        theoryEn:`StorageClass and Helm Values.\n🔹 StorageClass – defines storage type and provisioner\n🔹 Dynamic Provisioning – PV created automatically with PVC\n🔹 Reclaim Policy Delete – deletes PV when PVC is deleted\n🔹 helm upgrade / --set – update and change values\nCODE:\nhelm install my-app ./chart --set replicaCount=3\nhelm upgrade my-app ./chart -f prod-values.yaml\nhelm rollback my-app 1`,
        questions:[
          {q:"מה Dynamic Provisioning?",options:["הקצאת CPU","PV נוצר אוטומטית כשנוצר PVC","שינוי גודל אוטומטי","migration"],answer:1,explanation:"Dynamic Provisioning – כשנוצר PVC עם StorageClass, ה-provisioner יוצר PV אוטומטית."},
          {q:"מה Reclaim Policy Delete?",options:["מוחק רק PVC","מוחק PV ואחסון פיזי כשPVC נמחק","שומר נתונים","מעביר לbackup"],answer:1,explanation:"Reclaim Policy Delete – כשPVC נמחק, ה-PV והדיסק בcloud נמחקים אוטומטית."},
          {q:"איך משנים Helm value מה-command line?",options:["helm change","helm --override","helm install --set key=value","helm config"],answer:2,explanation:"--set key=value עוקף values.yaml בזמן install/upgrade."},
          {q:"מה הפקודה לעדכן Helm Release?",options:["helm update","helm upgrade","helm patch","helm redeploy"],answer:1,explanation:"helm upgrade [release] [chart] מעדכן Release קיים."},
          {q:"מה Reclaim Policy Retain?",options:["מוחק PV","שומר PV גם אחרי מחיקת PVC לתחזוקה ידנית","משחרר PV לPool","מגבה PV"],answer:1,explanation:"Retain שומר את ה-PV ואת הנתונים גם אחרי מחיקת PVC. Admin צריך למחוק ידנית או לשחרר."},
          {q:"כיצד מרחיבים PVC?",options:["מוחקים ויוצרים מחדש","מגדירים allowVolumeExpansion: true ב-StorageClass ואז מגדילים spec.resources.requests.storage","אי אפשר להגדיל PVC","רק דרך GUI"],answer:1,explanation:"StorageClass חייב להגדיר allowVolumeExpansion: true. לאחר מכן שינוי storage request ב-PVC יגרום להרחבת הדיסק."},
          {q:"מה helm template עושה?",options:["יוצר Template חדש","מרנדר את ה-Chart ל-YAML בלי להתקין אותו – לbuild pipelines ו-dry-run","שומר template","מעדכן values"],answer:1,explanation:"helm template מרנדר את ה-Chart עם values ומפיק YAML גולמי. שימושי לCI/CD, debug, ו-kubectl apply."},
          {q:"מה helm rollback?",options:["מוחק Release","מחזיר Release לgrevision קודמת","reset values","שינוי Chart version"],answer:1,explanation:"helm rollback [release] [revision] מחזיר Release לrevision ספציפי. helm history מציג את כל ה-revisions."},
          {q:"מה ConfigMap כ-volume?",options:["ConfigMap לא ניתן כvolume","כל key הופך לקובץ בתיקיה – שימושי לconfig files","מאוחסן בRAM בלבד","מוצפן אוטומטית"],answer:1,explanation:"ConfigMap כvolume מאפשר לPod לקרוא config files ישירות. כל key הופך לקובץ בpath שהגדרת."},
          {q:"מה helm dependency?",options:["תלות ב-Node","Charts אחרים ש-Chart שלך דורש (כמו mysql chart ל-wordpress chart)","גרסת kubectl","תלות רשת"],answer:1,explanation:"helm dependency מגדיר Charts אחרים שהChart שלך צריך. helm dependency update מוריד אותם ל-charts/ directory."},
        ],
        questionsEn:[
          {q:"What is Dynamic Provisioning?",options:["CPU allocation","PV created automatically when PVC is created","Auto resize","Migration"],answer:1,explanation:"Dynamic Provisioning – when a PVC with StorageClass is created, the provisioner auto-creates a PV."},
          {q:"What does Reclaim Policy Delete do?",options:["Deletes only PVC","Deletes PV and physical storage when PVC is deleted","Keeps data","Moves to backup"],answer:1,explanation:"Reclaim Policy Delete – when PVC is deleted, the PV and cloud disk are automatically deleted."},
          {q:"How do you change a Helm value from the CLI?",options:["helm change","helm --override","helm install --set key=value","helm config"],answer:2,explanation:"--set key=value overrides values.yaml at install/upgrade time."},
          {q:"What command updates an existing Helm Release?",options:["helm update","helm upgrade","helm patch","helm redeploy"],answer:1,explanation:"helm upgrade [release] [chart] updates an existing Release."},
          {q:"What is the Retain reclaim policy?",options:["Deletes the PV","Keeps the PV after PVC deletion for manual cleanup","Releases the PV back to the pool","Backs up the PV"],answer:1,explanation:"Retain keeps the PV and its data even after the PVC is deleted. An admin must manually clean up or reassign it."},
          {q:"How do you expand a PVC?",options:["Delete and recreate it","Set allowVolumeExpansion: true in the StorageClass then increase spec.resources.requests.storage","PVCs cannot be expanded","Only via GUI"],answer:1,explanation:"The StorageClass must have allowVolumeExpansion: true. Then changing the PVC storage request triggers disk expansion."},
          {q:"What does helm template do?",options:["Creates a new Template","Renders the Chart to YAML without installing — for pipelines and dry-runs","Saves the template","Updates values"],answer:1,explanation:"helm template renders the Chart with values and outputs raw YAML. Useful for CI/CD, debugging, and kubectl apply workflows."},
          {q:"What does helm rollback do?",options:["Deletes the Release","Reverts a Release to a previous revision","Resets values","Changes Chart version"],answer:1,explanation:"helm rollback [release] [revision] reverts to a specific revision. Use helm history to see all revisions."},
          {q:"What does mounting a ConfigMap as a Volume do?",options:["ConfigMap cannot be a Volume","Each key becomes a file in a directory — useful for config files","Stored in RAM only","Automatically encrypted"],answer:1,explanation:"Mounting a ConfigMap as a Volume lets a Pod read config files directly. Each key becomes a file at the path you define."},
          {q:"What is a helm dependency?",options:["A Node dependency","Other Charts your Chart requires (e.g. a mysql chart for a wordpress chart)","kubectl version requirement","A network dependency"],answer:1,explanation:"helm dependency defines other Charts your Chart needs. helm dependency update downloads them to the charts/ directory."},
        ],
      },
      hard:{
        theory:`אחסון ו-Helm מתקדם.\n🔹 ReadWriteMany (RWX) – קריאה/כתיבה ממספר Nodes (NFS, EFS)\n🔹 CSI – Container Storage Interface, סטנדרט לdrivers\n🔹 VolumeSnapshot – גיבוי נקודתי\n🔹 Helm Hooks – פעולות בשלבים: pre-install, post-upgrade\nCODE:\napiVersion: snapshot.storage.k8s.io/v1\nkind: VolumeSnapshot\nspec:\n  source:\n    persistentVolumeClaimName: my-pvc`,
        theoryEn:`Advanced Storage and Helm.\n🔹 ReadWriteMany (RWX) – read/write from multiple Nodes (NFS, EFS)\n🔹 CSI – Container Storage Interface, standard for drivers\n🔹 VolumeSnapshot – point-in-time backup\n🔹 Helm Hooks – actions at lifecycle points: pre-install, post-upgrade\nCODE:\napiVersion: snapshot.storage.k8s.io/v1\nkind: VolumeSnapshot\nspec:\n  source:\n    persistentVolumeClaimName: my-pvc`,
        questions:[
          {q:"מה ReadWriteMany מאפשר?",options:["קריאה בלבד","כתיבה מNode אחד","קריאה וכתיבה מכמה Nodes בו-זמנית","הגדלה אוטומטית"],answer:2,explanation:"ReadWriteMany (RWX) מאפשר לNodes מרובים לקרוא ולכתוב בו-זמנית. מתאים לNFS/EFS."},
          {q:"מה זה CSI?",options:["Container Security Interface","Container Storage Interface – סטנדרט לdrivers","Cloud Storage Integration","Cluster Sync"],answer:1,explanation:"CSI הוא סטנדרט שמאפשר לvendors לכתוב storage drivers עבור Kubernetes."},
          {q:"מה Helm Hook?",options:["כלי debug","פעולה שרצה בשלב מסוים במחזור חיי Release","type של Chart","חלופה לRollback"],answer:1,explanation:"Helm Hooks מריצים Jobs/Pods בשלבים: pre-install, post-upgrade, pre-delete."},
          {q:"מה VolumeSnapshot?",options:["גיבוי הCluster כולו","גיבוי נקודתי של PersistentVolume","snapshot של Pod","גיבוי ConfigMap"],answer:1,explanation:"VolumeSnapshot יוצר גיבוי נקודתי של PV, מאפשר restore לנקודת זמן."},
          {q:"כיצד StatefulSet מנהל storage?",options:["Pods חולקים PVC אחד","כל Pod מקבל PVC משלו דרך volumeClaimTemplates","אין storage ב-StatefulSet","רק emptyDir"],answer:1,explanation:"volumeClaimTemplates ב-StatefulSet יוצר PVC ייחודי לכל Pod. Pod-0 מקבל pvc-pod-0, Pod-1 מקבל pvc-pod-1."},
          {q:"מה VolumeSnapshotClass?",options:["StorageClass לVolumes","מגדיר driver ו-parameters ליצירת VolumeSnapshots","גרסת Volume API","שם לSnapshot"],answer:1,explanation:"VolumeSnapshotClass כמו StorageClass – מגדיר CSI driver שישתמש בו ליצירת snapshots."},
          {q:"מה subPath ב-Volume?",options:["path לSecret","מאפשר mount של תת-תיקיה ספציפית מVolume לנתיב ספציפי בקונטיינר","מגבלת גודל","Path לNode"],answer:1,explanation:"subPath מאפשר לכמה קונטיינרים בPod לשתף Volume אחד ולכל אחד תת-תיקיה משלו."},
          {q:"מה thin provisioning?",options:["הקצאת דיסק מלא מיד","הקצאת דיסק וירטואלי גדול שמשתמש במקום בפועל בלבד","דיסק לbatch jobs","דיסק לStatefulSets בלבד"],answer:1,explanation:"Thin provisioning מקצה נפח לוגי גדול אבל משתמש בדיסק פיזי רק לפי שימוש בפועל. גמישות גבוהה."},
          {q:"מה volume binding mode WaitForFirstConsumer?",options:["מחכה לAdmin לאשר","מחכה ש-Pod יתזמן לפני יצירת PV – ליצירת PV באותה Zone כמו ה-Pod","מחכה לreplication","מחכה לbackup"],answer:1,explanation:"WaitForFirstConsumer מונע יצירת PV עד ש-Pod יתזמן, כך ש-PV נוצר באותה Zone/Region כמו ה-Pod."},
          {q:"מה Rook-Ceph ב-Kubernetes?",options:["Logging operator","Storage orchestrator שמפעיל Ceph distributed storage כ-Kubernetes operator","Network plugin","Backup solution"],answer:1,explanation:"Rook-Ceph הוא operator שמנהל Ceph cluster בתוך Kubernetes ומספק Block, Object, ו-File storage."},
        ],
        questionsEn:[
          {q:"What does ReadWriteMany allow?",options:["Read-only","Write from one Node","Read and write from multiple Nodes simultaneously","Auto-expansion"],answer:2,explanation:"ReadWriteMany (RWX) allows multiple Nodes to read and write simultaneously. Suitable for NFS/EFS."},
          {q:"What is CSI?",options:["Container Security Interface","Container Storage Interface – standard for drivers","Cloud Storage Integration","Cluster Sync"],answer:1,explanation:"CSI is a standard that allows vendors to write storage drivers for Kubernetes."},
          {q:"What is a Helm Hook?",options:["A debug tool","An action at a specific lifecycle point","A Chart type","Alternative to Rollback"],answer:1,explanation:"Helm Hooks run Jobs/Pods at: pre-install, post-upgrade, pre-delete."},
          {q:"What is a VolumeSnapshot?",options:["Backup of the whole Cluster","Point-in-time backup of a PersistentVolume","Pod snapshot","ConfigMap backup"],answer:1,explanation:"VolumeSnapshot creates a point-in-time backup of a PV, allowing restore to a specific point."},
          {q:"How does a StatefulSet manage storage?",options:["All Pods share one PVC","Each Pod gets its own PVC via volumeClaimTemplates","No storage in StatefulSet","Only emptyDir"],answer:1,explanation:"volumeClaimTemplates in a StatefulSet creates a unique PVC per Pod. Pod-0 gets pvc-pod-0, Pod-1 gets pvc-pod-1."},
          {q:"What is a VolumeSnapshotClass?",options:["A StorageClass for Volumes","Defines the driver and parameters for creating VolumeSnapshots","A Volume API version","A snapshot name"],answer:1,explanation:"VolumeSnapshotClass is like StorageClass — it defines which CSI driver to use when creating snapshots."},
          {q:"What does subPath do in a Volume?",options:["Path to a Secret","Mounts a specific subdirectory from a Volume to a specific container path","Size limit","Path on Node"],answer:1,explanation:"subPath allows multiple containers in a Pod to share one Volume, each with its own subdirectory."},
          {q:"What is thin provisioning?",options:["Allocating the full disk immediately","Allocating a large virtual disk that only uses actual physical space on demand","Disk for batch jobs","Disk for StatefulSets only"],answer:1,explanation:"Thin provisioning allocates a large logical volume but only consumes physical disk space as data is written."},
          {q:"What does volume binding mode WaitForFirstConsumer do?",options:["Waits for Admin approval","Waits for a Pod to be scheduled before creating the PV — ensuring the PV is in the same Zone as the Pod","Waits for replication","Waits for backup"],answer:1,explanation:"WaitForFirstConsumer delays PV creation until a Pod is scheduled, so the PV is created in the same Zone/Region as the Pod."},
          {q:"What is Rook-Ceph in Kubernetes?",options:["A logging operator","A storage orchestrator that runs Ceph distributed storage as a Kubernetes operator","A network plugin","A backup solution"],answer:1,explanation:"Rook-Ceph is an operator that manages a Ceph cluster inside Kubernetes, providing Block, Object, and File storage."},
        ],
      },
    }
  },
  { id:"troubleshooting", icon:"🔧", name:"Cluster Operations & Troubleshooting", color:"#EF4444",
    description:"Debugging · Observability · אבחון · כלים", descriptionEn:"Debugging · Observability · Diagnosis · Tools",
    levels:{
      easy:{
        theory:`פקודות Debug בסיסיות.\n🔹 kubectl describe – events ומידע מפורט על resource\n🔹 kubectl logs – לוגים של קונטיינר\n🔹 kubectl exec – מריץ פקודה בתוך Pod\n🔹 kubectl get pods -A – כל הPods בכל הNamespaces\nCODE:\nkubectl describe pod my-pod\nkubectl logs my-pod\nkubectl logs my-pod -c my-container\nkubectl exec -it my-pod -- bash\nkubectl get pods -A`,
        theoryEn:`Basic Debug Commands.\n🔹 kubectl describe – events and detailed info about a resource\n🔹 kubectl logs – container logs\n🔹 kubectl exec – runs a command inside a Pod\n🔹 kubectl get pods -A – all Pods in all Namespaces\nCODE:\nkubectl describe pod my-pod\nkubectl logs my-pod\nkubectl logs my-pod -c my-container\nkubectl exec -it my-pod -- bash\nkubectl get pods -A`,
        questions:[
          {q:"ה-Pod 'web-server' לא מגיב ואתה לא יודע למה. איזו פקודה תיתן לך events ומצב מפורט כדי להתחיל לאבחן?",options:["kubectl status pod web-server","kubectl describe pod web-server","kubectl get pod web-server","kubectl inspect pod web-server"],answer:1,explanation:"kubectl describe pod מציג events, conditions, ומידע מפורט – זה הכלי הראשי לאבחון בעיות. ה-Events בתחתית הפלט הם לרוב הסיבה הישירה לבעיה."},
          {q:"ה-Pod 'api-service' נמצא ב-Running אבל האפליקציה מחזירה שגיאות 500. מה הפקודה הראשונה שתריץ?",options:["kubectl events api-service","kubectl logs api-service","kubectl describe pod api-service","kubectl top pod api-service"],answer:1,explanation:"kubectl logs מציג את ה-stdout/stderr של הקונטיינר – המקום הראשון לחפש שגיאות אפליקציה בזמן שה-Pod רץ. השתמש ב--follow לעקוב בזמן אמת."},
          {q:"אתה צריך לבדוק אם Pod רץ יכול להגיע לשרת ה-DB בכתובת db:5432. איך תפתח shell בתוך ה-Pod?",options:["kubectl ssh my-pod","kubectl connect my-pod","kubectl attach my-pod","kubectl exec -it my-pod -- bash"],answer:3,explanation:"kubectl exec -it [pod] -- bash פותח shell אינטראקטיבי בתוך הקונטיינר. משם תוכל להריץ curl, nc, או telnet לבדוק קישוריות לשירותים אחרים."},
          {q:"הצוות שלך משתמש ב-Namespaces: dev, staging, prod. אתה רוצה לראות את כל ה-Pods בכולם בפקודה אחת. איזו פקודה?",options:["kubectl get pods -A","kubectl get pods --namespace all","kubectl get all","kubectl get pods -n default"],answer:0,explanation:"kubectl get pods -A (קיצור של --all-namespaces) מציג Pods מכל ה-Namespaces בטבלה אחת. שימושי מאוד לסקירה כללית של בריאות המערכת."},
          {q:"מה kubectl get events מציג?",options:["רק שגיאות","אירועים מהCluster – Pod scheduling, image pull, probe failures","רק Pod logs","רק Node events"],answer:1,explanation:"kubectl get events מציג אירועים שנוצרו ב-Namespace. מסודר בזמן ומציג סיבות לבעיות."},
          {q:"כיצד רואים על איזה Node Pod רץ?",options:["kubectl node pod-name","kubectl get pod pod-name -o wide","kubectl describe node","kubectl pods --node"],answer:1,explanation:"kubectl get pod -o wide מציג עמודות נוספות כמו Node, IP, nominated node."},
          {q:"מה ההבדל בין Running ל-Ready?",options:["אין הבדל","Running – קונטיינר פועל. Ready – Pod עבר readiness probe ומוכן לקבל traffic","Ready – רק ב-production","Running – לפני deploy"],answer:1,explanation:"Pod יכול להיות Running אבל לא Ready אם readiness probe לא עוברת. Service ישלח traffic רק לPods Ready."},
          {q:"כיצד רואים לוגים של קונטיינר שקרס?",options:["kubectl logs pod-name","kubectl logs pod-name --previous","kubectl get logs --crashed","kubectl describe pod-name --logs"],answer:1,explanation:"kubectl logs --previous מציג לוגים מהinstance הקודם של הקונטיינר לפני שקרס."},
          {q:"מה kubectl get pods -o wide מציג?",options:["JSON output","עמודות נוספות: Node, IP, nominated node","רק Pods ב-Running","YAML output"],answer:1,explanation:"-o wide מוסיף עמודות: NODE (איפה רץ), IP (Pod IP), NOMINATED NODE (לpreemption)."},
          {q:"מה kubectl top nodes מציג?",options:["רשימת Nodes","שימוש בCPU/Memory של כל Node בזמן אמת (דורש metrics-server)","Nodes עם בעיות","Nodes logs"],answer:1,explanation:"kubectl top nodes מציג CPU ו-Memory usage של כל Node. דורש metrics-server מותקן."},
        ],
        questionsEn:[
          {q:"Pod 'web-server' is not responding and you don't know why. Which command gives you events and detailed state to start diagnosing?",options:["kubectl status pod web-server","kubectl describe pod web-server","kubectl get pod web-server","kubectl inspect pod web-server"],answer:1,explanation:"kubectl describe pod shows events, conditions, and detailed info — it's the primary diagnostic tool. The Events section at the bottom usually reveals the direct cause of the problem."},
          {q:"Pod 'api-service' is Running but the app returns 500 errors. What is the first command you run?",options:["kubectl events api-service","kubectl logs api-service","kubectl describe pod api-service","kubectl top pod api-service"],answer:1,explanation:"kubectl logs shows the container's stdout/stderr — the first place to look for application errors while the pod is running. Use --follow to stream logs in real time."},
          {q:"You need to check if a running pod can reach the database at db:5432. How do you open a shell inside the pod?",options:["kubectl ssh my-pod","kubectl connect my-pod","kubectl attach my-pod","kubectl exec -it my-pod -- bash"],answer:3,explanation:"kubectl exec -it [pod] -- bash opens an interactive shell inside the container. From there you can run curl, nc, or telnet to test connectivity to other services."},
          {q:"Your team uses namespaces: dev, staging, prod. You want to see all pods across all of them in one command. Which command?",options:["kubectl get pods -A","kubectl get pods --namespace all","kubectl get all","kubectl get pods -n default"],answer:0,explanation:"kubectl get pods -A (short for --all-namespaces) lists pods from every namespace in one table — very useful for a system-wide health check."},
          {q:"What does kubectl get events show?",options:["Only errors","Cluster events — Pod scheduling, image pulls, probe failures","Only Pod logs","Only Node events"],answer:1,explanation:"kubectl get events shows events in the Namespace, sorted by time, indicating reasons for issues."},
          {q:"How do you see which Node a Pod runs on?",options:["kubectl node pod-name","kubectl get pod pod-name -o wide","kubectl describe node","kubectl pods --node"],answer:1,explanation:"kubectl get pod -o wide adds extra columns including the Node name, Pod IP, and nominated node."},
          {q:"What is the difference between Running and Ready?",options:["No difference","Running — container is active. Ready — Pod passed readiness probe and can receive traffic","Ready — production only","Running — before deploy"],answer:1,explanation:"A Pod can be Running but not Ready if the readiness probe fails. A Service only sends traffic to Ready Pods."},
          {q:"How do you view logs from a crashed container?",options:["kubectl logs pod-name","kubectl logs pod-name --previous","kubectl get logs --crashed","kubectl describe pod-name --logs"],answer:1,explanation:"kubectl logs --previous shows logs from the previous instance of the container before it crashed."},
          {q:"What extra info does kubectl get pods -o wide show?",options:["JSON output","Extra columns: Node, IP, nominated node","Only Running pods","YAML output"],answer:1,explanation:"-o wide adds: NODE (where it runs), IP (Pod IP), NOMINATED NODE (for preemption)."},
          {q:"What does kubectl top nodes show?",options:["List of Nodes","Real-time CPU/Memory usage for each Node (requires metrics-server)","Nodes with issues","Node logs"],answer:1,explanation:"kubectl top nodes shows CPU and Memory usage per Node. Requires metrics-server to be installed."},
        ],
      },
      medium:{
        theory:`שגיאות נפוצות ב-Pods.\n🔹 CrashLoopBackOff – קונטיינר קורס שוב ושוב\n🔹 ImagePullBackOff – לא ניתן להוריד image (שם שגוי/credentials)\n🔹 OOMKilled – חרגנו ממגבלת הזיכרון\n🔹 Pending – אין Node פנוי (resources / nodeSelector)\nCODE:\nkubectl describe pod my-pod   # בדוק Events\nkubectl logs my-pod --previous  # לוגים לפני crash\nkubectl top pod                 # CPU/Memory`,
        theoryEn:`Common Pod errors.\n🔹 CrashLoopBackOff – container crashes repeatedly\n🔹 ImagePullBackOff – cannot pull image (wrong name/credentials)\n🔹 OOMKilled – exceeded memory limit\n🔹 Pending – no available Node (resources / nodeSelector)\nCODE:\nkubectl describe pod my-pod   # check Events\nkubectl logs my-pod --previous  # logs before crash\nkubectl top pod                 # CPU/Memory`,
        questions:[
          {q:"פרסמת גרסה חדשה. ה-Pod עולה, קורס מיד, ו-Kubernetes מפעיל אותו שוב ושוב. איזה סטטוס תראה ב-kubectl get pods?",options:["Terminating","CrashLoopBackOff","OOMKilled","ErrImagePull"],answer:1,explanation:"CrashLoopBackOff מציין שהקונטיינר מנסה לעלות, קורס, ו-Kubernetes ממשיך לנסות. השתמש ב-kubectl logs [pod] --previous כדי לראות מה קרה לפני ה-crash."},
          {q:"ה-Pod נמצא ב-ImagePullBackOff. מה שתי הסיבות הנפוצות ביותר?",options:["resource limits שגויים + Namespace חסר","שם image שגוי/tag שגוי, או imagePullSecret חסר עבור registry פרטי","Node חסר disk + Port שגוי","הרשאות RBAC + ConfigMap חסר"],answer:1,explanation:"ImagePullBackOff אומר ש-K8s לא מצליח להוריד את ה-image. הסיבות הכי נפוצות: טעות בשם/tag של ה-image, או credentials חסרים (imagePullSecrets) עבור registry פרטי."},
          {q:"Pod רץ שעות, ואז מסתיים לפתע. kubectl describe מראה 'Reason: OOMKilled'. מה קרה ומה הפתרון?",options:["ה-Pod פונה בגלל disk מלא; הוסף storage","הקונטיינר חרג ממגבלת הזיכרון שלו; הגדל את limits.memory או אופטימיזציה לאפליקציה","ה-liveness probe נכשל; תקן את ה-probe","ה-Pod פונה ע\"י Pod עם עדיפות גבוהה יותר"],answer:1,explanation:"OOMKilled = Out Of Memory Killed. הקונטיינר השתמש ביותר זיכרון ממה שהוגדר ב-limits.memory. הגדל את המגבלה, או בדוק דליפות זיכרון באפליקציה."},
          {q:"Pod נשאר ב-Pending. kubectl describe מראה: '0/3 nodes are available: 3 Insufficient cpu'. מה הגורם השורשי?",options:["ה-image של הקונטיינר גדול מדי","ה-Namespace של ה-Pod לא קיים","ה-Pod מבקש יותר CPU ממה שקיים ב-Nodes הפנויים","NetworkPolicy חוסמת את ה-Pod"],answer:2,explanation:"Pending עם 'Insufficient cpu' אומר שאף Node לא יכול לספק את ה-CPU שה-Pod ביקש ב-requests.cpu. הקטן את ה-cpu request, או הוסף Nodes נוספים לאשכול."},
          {q:"מה ההבדל בין ErrImagePull ל-ImagePullBackOff?",options:["אין הבדל","ErrImagePull – ניסיון ראשון נכשל. ImagePullBackOff – K8s מחכה יותר בין ניסיונות","ErrImagePull לprivate, ImagePullBackOff לpublic","ImagePullBackOff חמור יותר"],answer:1,explanation:"ErrImagePull הוא השגיאה הראשונה. ImagePullBackOff מציין שK8s נמצא ב-backoff לפני ניסיון נוסף. שתיהן אותה בעיה."},
          {q:"מה Pod בסטטוס Evicted?",options:["Pod שהופסק ידנית","Pod שפונה ע״י kubelet בגלל לחץ משאבים (disk/memory)","Pod שקרס","Pod בcooldown"],answer:1,explanation:"Evicted Pod פונה ע״י Node kubelet בגלל disk pressure, memory pressure, או PID pressure. Pod נמחק אבל הObject נשאר לmessage."},
          {q:"מה קורה כשliveness probe נכשל?",options:["Pod מוגדר NotReady","K8s ממית ומפעיל מחדש את הקונטיינר","Pod נמחק לצמיתות","Event נרשם בלבד"],answer:1,explanation:"כשliveness probe נכשל failureThreshold פעמים, K8s ממית את הקונטיינר ומפעיל אותו מחדש לפי restartPolicy."},
          {q:"מה kubectl port-forward משמש לצורך?",options:["פתיחת port ב-firewall","גישה ל-Pod/Service ישירות מה-machine המקומית לbug testing","expose Service","עדכון ports"],answer:1,explanation:"kubectl port-forward pod/mypod 8080:80 מעביר port 8080 מ-local machine ל-port 80 של ה-Pod. מצוין לdebug."},
          {q:"מה RunContainerError אומר?",options:["Pod לא מתזמן","הקונטיינר התחיל אבל נכשל מיד – בד״כ mountPath שגוי, env חסר, או entrypoint שגוי","Image לא נמצא","OOMKilled"],answer:1,explanation:"RunContainerError – הקונטיינר התחיל לרוץ אבל נכשל מיד. בדוק kubectl describe ו-logs לסיבה."},
          {q:"Pod נמצא ב-ContainerCreating זמן רב. מה הסיבות האפשריות?",options:["הimage גדול בלבד","PVC שלא נמצא, Secret חסר, image pull איטי, או בעיה ב-CNI","רק network בעיה","רק disk מלא"],answer:1,explanation:"ContainerCreating לאורך זמן: PVC לא bound, Secret/ConfigMap חסר, image גדול שמוריד, או בעיה ב-CNI network setup."},
        ],
        questionsEn:[
          {q:"You deployed a new version. The pod starts, immediately crashes, and Kubernetes keeps restarting it. What status do you see in kubectl get pods?",options:["Terminating","CrashLoopBackOff","OOMKilled","ErrImagePull"],answer:1,explanation:"CrashLoopBackOff means the container tries to start, crashes, and Kubernetes keeps retrying. Use kubectl logs [pod] --previous to see what happened before the crash."},
          {q:"A pod is stuck in ImagePullBackOff. What are the two most common causes?",options:["Wrong resource limits and missing namespace","Wrong image name/tag, or missing imagePullSecret for a private registry","Node out of disk space and wrong port","RBAC permissions and missing ConfigMap"],answer:1,explanation:"ImagePullBackOff means K8s can't download the image. Most common causes: typo in image name or tag, or missing credentials (imagePullSecrets) for a private registry."},
          {q:"A pod ran fine for hours then suddenly terminated. kubectl describe shows 'Reason: OOMKilled'. What happened and what is the fix?",options:["Pod evicted due to low disk; add more storage","Container exceeded its memory limit; increase limits.memory or optimize the app","Liveness probe failed; fix the probe config","Pod preempted by higher-priority pod; adjust PriorityClass"],answer:1,explanation:"OOMKilled = Out Of Memory Killed. The container used more memory than its limits.memory setting. Increase the limit, or investigate memory leaks in your application."},
          {q:"A pod stays Pending. kubectl describe shows: '0/3 nodes are available: 3 Insufficient cpu'. What is the root cause?",options:["The container image is too large","The pod namespace does not exist","The pod requests more CPU than any available node can provide","A NetworkPolicy is blocking the pod"],answer:2,explanation:"Pending with 'Insufficient cpu' means no node has enough free CPU to satisfy the pod's requests.cpu. Reduce the CPU request in the pod spec, or add more nodes to the cluster."},
          {q:"What is the difference between ErrImagePull and ImagePullBackOff?",options:["No difference","ErrImagePull — first attempt failed. ImagePullBackOff — K8s is waiting in backoff before retrying","ErrImagePull for private, ImagePullBackOff for public","ImagePullBackOff is more severe"],answer:1,explanation:"ErrImagePull is the first failure. ImagePullBackOff means K8s is in backoff before trying again. Both indicate the same underlying problem."},
          {q:"What is an Evicted Pod?",options:["A manually stopped Pod","A Pod evicted by the kubelet due to resource pressure (disk/memory)","A crashed Pod","A Pod in cooldown"],answer:1,explanation:"An evicted Pod was terminated by the Node kubelet due to disk pressure, memory pressure, or PID pressure. The Pod object remains with an eviction message."},
          {q:"What happens when a liveness probe fails?",options:["Pod is set to NotReady","K8s kills and restarts the container","Pod is permanently deleted","Only an event is recorded"],answer:1,explanation:"When a liveness probe fails failureThreshold times, K8s kills the container and restarts it according to the restartPolicy."},
          {q:"What is kubectl port-forward used for?",options:["Opening a firewall port","Accessing a Pod/Service directly from the local machine for debugging","Exposing a Service","Updating ports"],answer:1,explanation:"kubectl port-forward pod/mypod 8080:80 tunnels port 8080 on your local machine to port 80 of the Pod — great for debugging."},
          {q:"What does RunContainerError mean?",options:["Pod is not scheduled","Container started but immediately failed — usually wrong mountPath, missing env var, or wrong entrypoint","Image not found","OOMKilled"],answer:1,explanation:"RunContainerError — the container started but immediately failed. Check kubectl describe and logs for the cause."},
          {q:"A Pod is in ContainerCreating for a long time. What are the likely causes?",options:["Large image only","Unbound PVC, missing Secret, slow image pull, or CNI issue","Network issue only","Full disk only"],answer:1,explanation:"Long ContainerCreating: PVC not bound, missing Secret/ConfigMap, large image downloading, or CNI network setup failure."},
        ],
      },
      hard:{
        theory:`Debug מתקדם.\n🔹 kubectl port-forward – מנתב port מ-Pod לlocal machine\n🔹 kubectl cp – מעתיק קבצים מ/ל-Pod\n🔹 kubectl top – CPU/Memory usage בזמן אמת\n🔹 Pod ב-Terminating לא נמחק – בגלל finalizer\nCODE:\nkubectl port-forward pod/my-pod 8080:80\nkubectl cp my-pod:/app/log.txt ./log.txt\nkubectl top pod --sort-by=memory\nkubectl patch pod my-pod -p '{"metadata":{"finalizers":null}}'`,
        theoryEn:`Advanced debugging.\n🔹 kubectl port-forward – routes a port from Pod to local machine\n🔹 kubectl cp – copies files from/to a Pod\n🔹 kubectl top – real-time CPU/Memory usage\n🔹 Pod stuck in Terminating – blocked by a finalizer\nCODE:\nkubectl port-forward pod/my-pod 8080:80\nkubectl cp my-pod:/app/log.txt ./log.txt\nkubectl top pod --sort-by=memory\nkubectl patch pod my-pod -p '{"metadata":{"finalizers":null}}'`,
        questions:[
          {q:"לאחר Deployment, ה-Pods החדשים ב-CrashLoopBackOff. הגרסה הקודמת עבדה מצוין. מה שתי פעולות ה-debug הראשונות שלך לפני שמחליטים מה לעשות?",options:["Scale down ל-0 ו-redeploy מחדש","kubectl rollout undo מיד לגרסה הקודמת","kubectl logs <new-pod> --previous ו-kubectl describe pod <new-pod>","מחק את כל ה-Pods ותן ל-Kubernetes ליצור אותם מחדש"],answer:2,explanation:"תמיד חוקרים לפני שמחזירים גרסה. kubectl logs --previous מראה מה גרם ל-crash, kubectl describe מראה את ה-events. רק אחרי שמבינים את הסיבה מחליטים – לתקן או rollback."},
          {q:"Deployment Upgrade נעצר: 5 מתוך 10 Pods על v2 ו-5 נשארים על v1. kubectl rollout status מראה 'Waiting for rollout to finish'. מה הסיבה הסבירה ביותר?",options:["ל-Pods החדשים חסר זיכרון; עדכן resource limits","ה-Pods החדשים לא עוברים את ה-readiness probe; תקן את האפליקציה/probe, או הרץ kubectl rollout undo","maxSurge נמוך מדי; הגדל אותו","Namespace quota מלא; מחק Pods ישנים"],answer:1,explanation:"Rolling update נעצר כמעט תמיד בגלל שה-Pods החדשים לא עוברים readiness probe. K8s לא יקדם את ה-rollout עד שהם Ready. תקן את האפליקציה, או הרץ kubectl rollout undo להחזיר לגרסה הקודמת."},
          {q:"Service קיים עם selector 'app: backend'. Pods עם label 'app: backend-api' רצים ובריאים. משתמשים מקבלים connection refused. מה הבעיה?",options:["ה-selector של ה-Service לא תואם ל-labels של ה-Pods – selector הוא 'app: backend' אך Pods הם 'app: backend-api'","ה-Port של ה-Service שגוי","ה-Ingress לא מוגדר","ה-Pods נמצאים ב-Namespace שגוי"],answer:0,explanation:"Classic selector mismatch – ה-Service מחפש Pods עם 'app: backend' אבל ה-Pods מתוייגים 'app: backend-api'. הרץ kubectl describe service ו-kubectl get pods --show-labels להשוואה, ותקן את ה-selector."},
          {q:"Node מראה NotReady ב-kubectl get nodes. Pods מפונים ממנו. מה שתי הפעולות הראשונות שלך?",options:["מחק את ה-Node ותן לו להצטרף מחדש","Restart את כל ה-Pods על ה-Node","kubectl describe node <name> לבדוק Conditions ו-Events; ואז SSH לNode ולהריץ systemctl status kubelet","Scale down את כל ה-Deployments ל-0"],answer:2,explanation:"kubectl describe node מציג memory/disk pressure, שגיאות kubelet, ו-conditions. לאחר מכן SSH ל-Node ובדוק את ה-kubelet – הסיבות הנפוצות הן: kubelet נפל, תעודת SSL פגה, או disk pressure."},
          {q:"מה kubectl drain עושה ומתי משתמשים בו?",options:["מוחק Node","מפנה Pods מNode בצורה graceful לפני maintenance (node upgrade, reboot)","Scale down","מנתק Node מNetwork"],answer:1,explanation:"kubectl drain [node] מפנה Pods בצורה graceful, מכבד PodDisruptionBudgets. משתמשים לפני maintenance על Node."},
          {q:"מה kubectl cordon עושה?",options:["מוחק Node","מסמן Node כ-unschedulable – Pods חדשים לא יתזמנו עליו אבל הקיימים ממשיכים","restarts kubelet","מסנכרן state"],answer:1,explanation:"kubectl cordon [node] מסמן SchedulingDisabled. Pods קיימים ממשיכים לרוץ, רק חדשים לא יתזמנו שם."},
          {q:"מה ephemeral debug container?",options:["Pod זמני","קונטיינר שמוסיפים לPod רץ לdebug ללא restart (kubectl debug -it pod --image=busybox)","init container","sidecar"],answer:1,explanation:"kubectl debug -it [pod] --image=busybox --target=[container] מוסיף קונטיינר debug לPod רץ. שימושי כשlimage חסר כלי debug."},
          {q:"כיצד מאבחנים בעיות DNS ב-Kubernetes?",options:["kubectl dns check","kubectl exec pod -- nslookup kubernetes.default + בדיקת CoreDNS Pod logs","kubectl describe dns","kubectl get dns"],answer:1,explanation:"מריצים nslookup/dig מתוך Pod לבדוק resolution. בודקים CoreDNS Pods ב-kube-system namespace ו-ConfigMap של CoreDNS."},
          {q:"מה הפקודה לגיבוי etcd?",options:["kubectl backup etcd","etcdctl snapshot save backup.db --endpoints=...","kubectl export etcd","etcd backup --all"],answer:1,explanation:"etcdctl snapshot save יוצר snapshot של etcd. חיוני לDR. צריך לציין endpoint, cert, key, cacert."},
          {q:"Service לא מנתב traffic לPods. kubectl get endpoints מציג <none>. מה הגורם הסביר?",options:["ה-Service port שגוי","selector ב-Service לא מתאים לlabels של הPods","Ingress חסר","Namespace שגוי"],answer:1,explanation:"<none> ב-Endpoints אומר שה-Service לא מוצא Pods תואמים. הכי נפוץ: selector mismatch. הרץ kubectl get pods --show-labels והשווה ל-selector של ה-Service."},
        ],
        questionsEn:[
          {q:"After a deployment, new pods are in CrashLoopBackOff. The previous version worked fine. What are your first two debugging steps before deciding what to do?",options:["Scale down to 0 and redeploy","Run kubectl rollout undo immediately","Run kubectl logs <new-pod> --previous and kubectl describe pod <new-pod>","Delete all pods and wait for recreation"],answer:2,explanation:"Always investigate before reverting. kubectl logs --previous shows the crash reason, kubectl describe shows events. Only after you understand the cause do you decide whether to fix it or roll back."},
          {q:"A Deployment upgrade stalled: 5 of 10 pods are on v2 and 5 remain on v1. kubectl rollout status shows 'Waiting for rollout to finish'. What is the most likely cause?",options:["New pods need more memory; update resource limits","New pods are failing readiness probes; fix the app or probe, or run kubectl rollout undo","maxSurge is set too low; increase it","Namespace quota exceeded; delete old pods"],answer:1,explanation:"A stalled rolling update almost always means the new pods are not passing readiness probes. K8s won't advance the rollout until they are Ready. Fix the app/probe config, or run kubectl rollout undo to revert."},
          {q:"A Service has selector 'app: backend'. Pods labeled 'app: backend-api' are Running and healthy. Users get connection refused. What is wrong?",options:["The Service selector does not match Pod labels — selector is 'app: backend' but pods have 'app: backend-api'","The Service port is wrong","The Ingress is misconfigured","The pods are in the wrong namespace"],answer:0,explanation:"Classic selector mismatch — the Service is looking for pods with 'app: backend' but pods are labeled 'app: backend-api'. Run kubectl describe service and kubectl get pods --show-labels to compare, then fix the selector."},
          {q:"A Node shows NotReady in kubectl get nodes. Pods on it are being evicted. What are your first two steps?",options:["Delete the node and let it rejoin","Restart all pods on the node","kubectl describe node <name> to check Conditions and Events, then SSH in and run systemctl status kubelet","Scale down all deployments to 0"],answer:2,explanation:"kubectl describe node shows memory/disk pressure, kubelet errors, and conditions. Then SSH into the node and check kubelet — common causes are: kubelet crashed, SSL cert expired, or disk pressure causing the node to become unresponsive."},
          {q:"What does kubectl drain do and when is it used?",options:["Deletes a Node","Gracefully evicts Pods from a Node before maintenance (upgrade, reboot)","Scale down","Disconnects Node from network"],answer:1,explanation:"kubectl drain [node] gracefully evicts Pods, respecting PodDisruptionBudgets. Used before performing Node maintenance."},
          {q:"What does kubectl cordon do?",options:["Deletes a Node","Marks a Node as unschedulable — no new Pods are scheduled on it but existing ones continue","Restarts kubelet","Syncs state"],answer:1,explanation:"kubectl cordon [node] sets SchedulingDisabled. Existing Pods keep running; only new Pods won't be scheduled there."},
          {q:"What is an ephemeral debug container?",options:["A temporary Pod","A container added to a running Pod for debugging without restart (kubectl debug -it pod --image=busybox)","An init container","A sidecar"],answer:1,explanation:"kubectl debug -it [pod] --image=busybox --target=[container] injects a debug container into a running Pod. Useful when the main image lacks debugging tools."},
          {q:"How do you diagnose DNS issues in Kubernetes?",options:["kubectl dns check","kubectl exec pod -- nslookup kubernetes.default + check CoreDNS Pod logs","kubectl describe dns","kubectl get dns"],answer:1,explanation:"Run nslookup/dig from inside a Pod to test resolution. Check CoreDNS Pods in kube-system and the CoreDNS ConfigMap."},
          {q:"What is the command to back up etcd?",options:["kubectl backup etcd","etcdctl snapshot save backup.db --endpoints=...","kubectl export etcd","etcd backup --all"],answer:1,explanation:"etcdctl snapshot save creates an etcd snapshot — essential for disaster recovery. Specify endpoint, cert, key, and cacert."},
          {q:"A Service routes no traffic to Pods. kubectl get endpoints shows <none>. What is the likely cause?",options:["Wrong Service port","Service selector does not match Pod labels","Missing Ingress","Wrong Namespace"],answer:1,explanation:"<none> in Endpoints means the Service found no matching Pods. Most common cause: selector mismatch. Run kubectl get pods --show-labels and compare to the Service selector."},
        ],
      },
    }
  },
];
const TRANSLATIONS = {
  he: {
    tagline: "למד Kubernetes בצורה כיפית ואינטראקטיבית",
    startPlaying: "🚀 התחל לשחק עכשיו",
    noRegNoPass: "ללא הרשמה · ללא סיסמה · מיידי",
    saveProgress: "רוצה לשמור את ההתקדמות?",
    username: "שם משתמש", email: "אימייל", password: "סיסמה",
    loginTab: "התחברות", signupTab: "הרשמה",
    loginBtn: "התחבר", signupBtn: "הירשם", loading: "⏳ רגע...",
    emailAlreadySent: "✅ אימייל אימות כבר נשלח! בדוק את תיבת הדואר שלך.",
    emailSent: "✅ נשלח אימייל אימות! בדקי את תיבת הדואר.",
    otpExpired: "❌ קישור האימות פג תוקף. אנא הירשם שוב כדי לקבל קישור חדש.",
    wrongCredentials: "אימייל או סיסמה שגויים",
    didntReceive: "לא קיבלת את המייל?", resendBtn: "שלח שוב",
    resendSuccess: "✅ אימייל חדש נשלח! בדוק את תיבת הדואר.",
    resendError: "❌ שגיאה בשליחה מחדש. נסה שוב.",
    greeting: "שלום", playingAsGuest: "· משחק כאורח",
    leaderboardBtn: "🏆 טבלה", logout: "יציאה",
    guestBanner: "💡 הרשם כדי לשמור התקדמות ולהופיע בלוח התוצאות",
    signupNow: "הרשם",
    score: "ניקוד", accuracy: "דיוק", streak: "רצף", completed: "הושלמו",
    pts: "נק׳",
    achievementsTitle: "🏅 הישגים",
    leaderboardTitle: "🏆 לוח תוצאות", noData: "אין נתונים עדיין", anonymous: "אנונימי",
    back: "→ חזור", theory: "📖 תיאוריה",
    startQuiz: "🎯 התחל חידון!", ptsPerQ: "נק׳ לשאלה",
    question: "שאלה", of: "/", streakLabel: "רצף",
    confirmAnswer: "✔ אשר תשובה",
    correct: "✅ נכון!", incorrect: "❌ לא נכון",
    finishTopic: "🎉 סיים נושא!", nextQuestion: "שאלה הבאה ←",
    correctCount: "נכון", perfect: "⭐ מושלם!", points: "נקודות",
    guestSaveHint: "💡 הרשם כדי לשמור את הניקוד!", signupLink: "הרשם עכשיו",
    tryAgain: "🔄 נסה שוב", backToTopics: "→ חזור לנושאים",
    nextLevelBtn: "🚀 המשך לרמה הבאה", locked: "🔒 נעול",
    skipTheory: "⚡ דלג לחידון",
    timerOn: "⏱ כבה טיימר", timerOff: "⏱ הפעל טיימר", timeUp: "⏰ הזמן נגמר!",
    reviewBtn: "📋 צפה בסקירה", hideReview: "הסתר סקירה", reviewTitle: "סקירת שאלות",
    loadingText: "טוען...",
    saveErrorText: "⚠️ הנתונים לא נשמרו – בדוק חיבור לאינטרנט",
    newAchievement: "הישג חדש!", allRightsReserved: "כל הזכויות שמורות ל",
    optionLabels: ["א","ב","ג","ד"], guestName: "אורח",
    resetProgress: "אפס התקדמות", resetConfirm: "האם אתה בטוח? פעולה זו תמחק את כל ההתקדמות ולא ניתן לבטלה.",
    resetTopic: "אפס נושא", resetTopicConfirm: "לאפס את ההתקדמות בנושא זה?",
    mixedQuizBtn: "🎲 חידון מיקס", mixedQuizDesc: "10 שאלות אקראיות מכל הנושאים",
    tabTopics: "📚 נושאים", tabRoadmap: "🗺️ מסלול",
    interviewMode: "🎯 מצב ראיון", interviewModeHint: "רמזים כבויים, יש טיימר לכל שאלה",
    dailyChallengeTitle: "אתגר יומי", dailyChallengeNew: "חדש היום",
    dailyChallengeDesc: "10 שאלות מכל הנושאים · מתחלף כל יום",
    roadmapTitle: "ההתקדמות במסלול",
    roadmapAllDone: "🎉 השלמת את כל השלבים!",
    roadmapStage: "את בשלב", roadmapStageOf: "מתוך",
    roadmapCompletedPct: "הושלם",
    roadmapContinue: "🚀 המשיכי לשלב הבא",
    roadmapLocked: "🔒 נפתח אחרי השלמת השלב הקודם",
    roadmapDone: "✅ הושלם",
    roadmapContinueHere: "▶ המשיכי מכאן",
    weakAreaTitle: "📉 האזור החלש שלך",
    weakAreaEmpty: "עדיין אין מספיק נתונים, התחילי לענות כדי שנמליץ מה לחזק.",
    allPerfectTitle: "🔥 הכל בשליטה",
    allPerfectMsg: "כל הנושאים עם דיוק מלא. רוצה להמשיך לאתגר הבא?",
    advancedPractice: "לתרגול מתקדם",
    accuracyLabel: "דיוק",
    goBackToTopic: "חזרי לנושא הזה",
    // Male-form overrides (used when gender === "m")
    roadmapStage_m: "אתה בשלב",
    roadmapContinue_m: "🚀 המשך לשלב הבא",
    roadmapContinueHere_m: "▶ המשך מכאן",
    weakAreaEmpty_m: "עדיין אין מספיק נתונים, התחל לענות כדי שנמליץ מה לחזק.",
    goBackToTopic_m: "חזור לנושא הזה",
  },
  en: {
    tagline: "Learn Kubernetes in a fun and interactive way",
    startPlaying: "🚀 Start Playing Now",
    noRegNoPass: "No registration · No password · Instant",
    saveProgress: "Want to save your progress?",
    username: "Username", email: "Email", password: "Password",
    loginTab: "Login", signupTab: "Sign Up",
    loginBtn: "Sign In", signupBtn: "Register", loading: "⏳ Loading...",
    emailAlreadySent: "✅ Verification email already sent! Check your inbox.",
    emailSent: "✅ Verification email sent! Check your inbox.",
    otpExpired: "❌ Verification link has expired. Please sign up again to receive a new link.",
    wrongCredentials: "Incorrect email or password",
    didntReceive: "Didn't receive the email?", resendBtn: "Resend",
    resendSuccess: "✅ New email sent! Check your inbox.",
    resendError: "❌ Failed to resend. Please try again.",
    greeting: "Hello", playingAsGuest: "· Playing as guest",
    leaderboardBtn: "🏆 Leaderboard", logout: "Logout",
    guestBanner: "💡 Sign up to save progress and appear on the leaderboard",
    signupNow: "Sign Up",
    score: "Score", accuracy: "Accuracy", streak: "Streak", completed: "Completed",
    pts: "pts",
    achievementsTitle: "🏅 Achievements",
    leaderboardTitle: "🏆 Leaderboard", noData: "No data yet", anonymous: "Anonymous",
    back: "← Back", theory: "📖 Theory",
    startQuiz: "🎯 Start Quiz!", ptsPerQ: "pts per question",
    question: "Question", of: "/", streakLabel: "Streak",
    confirmAnswer: "✔ Confirm Answer",
    correct: "✅ Correct!", incorrect: "❌ Incorrect",
    finishTopic: "🎉 Finish Topic!", nextQuestion: "Next Question →",
    correctCount: "correct", perfect: "⭐ Perfect!", points: "points",
    guestSaveHint: "💡 Sign up to save your score!", signupLink: "Sign up now",
    tryAgain: "🔄 Try Again", backToTopics: "← Back to Topics",
    nextLevelBtn: "🚀 Next Level", locked: "🔒 Locked",
    skipTheory: "⚡ Skip to Quiz",
    timerOn: "⏱ Timer On", timerOff: "⏱ Timer Off", timeUp: "⏰ Time's Up!",
    reviewBtn: "📋 View Review", hideReview: "Hide Review", reviewTitle: "Question Review",
    loadingText: "Loading...",
    saveErrorText: "⚠️ Data not saved – check your internet connection",
    newAchievement: "New Achievement!", allRightsReserved: "All rights reserved to",
    optionLabels: ["A","B","C","D"], guestName: "Guest",
    resetProgress: "Reset Progress", resetConfirm: "Are you sure? This will erase all your progress and cannot be undone.",
    resetTopic: "Reset Topic", resetTopicConfirm: "Reset progress for this topic?",
    mixedQuizBtn: "🎲 Mixed Quiz", mixedQuizDesc: "10 random questions from all topics",
    roadmapTitle: "Roadmap Progress",
    roadmapAllDone: "🎉 You completed all stages!",
    roadmapStage: "You're on stage", roadmapStageOf: "of",
    roadmapCompletedPct: "completed",
    roadmapContinue: "🚀 Continue to Next Stage",
    roadmapLocked: "🔒 Unlocks after completing the previous stage",
    roadmapDone: "✅ Completed",
    roadmapContinueHere: "▶ Continue from here",
    weakAreaTitle: "📉 Your Weak Area",
    weakAreaEmpty: "Not enough data yet, start answering to get recommendations.",
    allPerfectTitle: "🔥 All Under Control",
    allPerfectMsg: "All topics at 100% accuracy. Ready for the next challenge?",
    advancedPractice: "Advanced Practice",
    accuracyLabel: "accuracy",
    goBackToTopic: "Go back to this topic",
    tabTopics: "📚 Topics", tabRoadmap: "🗺️ Roadmap",
    interviewMode: "🎯 Interview Mode", interviewModeHint: "Hints off, timer on for every question",
    dailyChallengeTitle: "Daily Challenge", dailyChallengeNew: "NEW DAILY",
    dailyChallengeDesc: "10 mixed questions · resets every day",
  },
};

const year = new Date().getFullYear();
const TIMER_SECONDS = 30;
const INTERVIEW_DURATIONS = { easy: 20, medium: 30, hard: 40 };

function Confetti() {
  const colors = ["#00D4FF","#A855F7","#FF6B35","#10B981","#F59E0B","#EC4899"];
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9000,overflow:"hidden"}}>
      {Array.from({length:60},(_,i)=>{
        const color=colors[i%colors.length];
        const left=Math.round(Math.random()*100);
        const delay=(Math.random()*2).toFixed(2);
        const size=6+Math.round(Math.random()*8);
        const dur=(2+Math.random()*2).toFixed(2);
        const isCircle=Math.random()>0.5;
        return <div key={i} style={{position:"absolute",left:`${left}%`,top:"-20px",width:size,height:size,background:color,borderRadius:isCircle?"50%":"2px",animation:`confettiFall ${dur}s ${delay}s ease-in both`}}/>;
      })}
    </div>
  );
}

function LangSwitcher({ lang, setLang }) {
  return (
    <select value={lang} onChange={e => setLang(e.target.value)}
      style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,color:"#94a3b8",padding:"6px 10px",fontSize:13,cursor:"pointer",direction:"ltr"}}>
      <option value="he">🇮🇱 עברית</option>
      <option value="en">🇺🇸 English</option>
    </select>
  );
}

function GenderToggle({ gender, setGender }) {
  return (
    <div style={{display:"flex",gap:3,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:2}}>
      {[{v:"f",label:"♀"},{v:"m",label:"♂"}].map(({v,label}) => (
        <button key={v} onClick={()=>setGender(v)}
          style={{padding:"4px 9px",border:"none",borderRadius:6,cursor:"pointer",fontSize:13,
            background:gender===v?"rgba(0,212,255,0.15)":"transparent",
            color:gender===v?"#00D4FF":"#64748b",fontWeight:gender===v?700:400}}>
          {label}
        </button>
      ))}
    </div>
  );
}

function Footer({ lang }) {
  const txt = TRANSLATIONS[lang] || TRANSLATIONS.he;
  return (
    <div style={{textAlign:"center",marginTop:28,paddingTop:18,borderTop:"1px solid rgba(255,255,255,0.05)"}}>
      <p style={{color:"#475569",fontSize:12,margin:0}}>
        © {year} {txt.allRightsReserved}{" "}
        <a href="https://www.linkedin.com/in/orcarmeli/" target="_blank" rel="noopener noreferrer"
          style={{color:"#0ea5e9",textDecoration:"none",fontWeight:600}}>Or Carmeli</a>
      </p>
    </div>
  );
}

export default function K8sQuestApp() {
  const [lang, setLang]                   = useState("he");
  const [gender, setGender]               = useState(() => localStorage.getItem("gender_v1") || "f");
  const handleSetGender = (g) => { setGender(g); localStorage.setItem("gender_v1", g); };
  const t = (key) => {
    if (lang === "he" && gender === "m" && TRANSLATIONS.he[key + "_m"]) return TRANSLATIONS.he[key + "_m"];
    return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.he[key] ?? key;
  };
  const dir = lang === "he" ? "rtl" : "ltr";

  const [authChecked, setAuthChecked]     = useState(false);
  const [user, setUser]                   = useState(null);
  const [authScreen, setAuthScreen]       = useState("login");
  const authFormRef                       = useRef(null);
  const [authLoading, setAuthLoading]     = useState(false);
  const [authError, setAuthError]         = useState("");
  const [saveError, setSaveError]         = useState("");

  const [screen, setScreen]               = useState("home");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [topicScreen, setTopicScreen]     = useState("theory");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted]         = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [flash, setFlash]                 = useState(false);

  const topicCorrectRef = useRef(0);
  const isRetryRef = useRef(false);

  const [stats, setStats] = useState({
    total_answered:0, total_correct:0, total_score:0, max_streak:0, current_streak:0,
  });
  const [topicStats, setTopicStats] = useState(() => {
    try { return JSON.parse(localStorage.getItem("topicStats_v1")) || {}; } catch { return {}; }
  });
  const [highlightTopic, setHighlightTopic]             = useState(null);
  const [completedTopics, setCompletedTopics]           = useState({});
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [newAchievement, setNewAchievement]             = useState(null);
  const [leaderboard, setLeaderboard]                   = useState([]);
  const [showLeaderboard, setShowLeaderboard]           = useState(false);
  const [quizHistory, setQuizHistory]                   = useState([]);
  const [showReview, setShowReview]                     = useState(false);
  const [timerEnabled, setTimerEnabled]                 = useState(true);
  const [timeLeft, setTimeLeft]                         = useState(TIMER_SECONDS);
  const [isInterviewMode, setIsInterviewMode]           = useState(() => localStorage.getItem("isInterviewMode_v1") === "true");
  const [homeTab, setHomeTab]                           = useState("roadmap");
  const [showConfetti, setShowConfetti]                 = useState(false);
  const [mixedQuestions, setMixedQuestions]             = useState([]);

  const isGuest = user?.id === "guest";
  const achievementsLoaded = useRef(false);

  const getLevelData = (topic, level) => ({
    theory: lang === "en" ? topic.levels[level].theoryEn : topic.levels[level].theory,
    questions: lang === "en" ? topic.levels[level].questionsEn : topic.levels[level].questions,
  });

  const isLevelLocked = (topicId, level) => {
    const idx = LEVEL_ORDER.indexOf(level);
    if (idx === 0) return false;
    const prevResult = completedTopics[`${topicId}_${LEVEL_ORDER[idx - 1]}`];
    return !prevResult || prevResult.correct < prevResult.total;
  };

  const getNextLevel = (level) => {
    const idx = LEVEL_ORDER.indexOf(level);
    return idx < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[idx + 1] : null;
  };

  const isFreeMode = (id) => id === "mixed" || id === "daily";

  // Derive total_score canonically from completedTopics so it can never be gamed.
  // Each topic/level key is "topicId_level" (e.g. "workloads_easy").
  const computeScore = (completed) =>
    Object.entries(completed).reduce((sum, [key, res]) => {
      const lvl = key.split("_").slice(-1)[0];
      return sum + (res.correct * (LEVEL_CONFIG[lvl]?.points ?? 0));
    }, 0);
  const currentLevelData = selectedTopic && selectedLevel && !isFreeMode(selectedTopic.id) ? getLevelData(selectedTopic, selectedLevel) : null;
  const currentQuestions = isFreeMode(selectedTopic?.id) ? mixedQuestions : (currentLevelData?.questions || []);

  useEffect(() => {
    // Detect Supabase error params redirected back via URL hash (e.g. expired confirmation link)
    const hash = window.location.hash;
    if (hash && hash.includes("error=")) {
      const params = new URLSearchParams(hash.slice(1));
      const code = params.get("error_code");
      if (code === "otp_expired" || code === "access_denied") {
        setAuthError(TRANSLATIONS[lang]?.otpExpired || TRANSLATIONS.he.otpExpired);
        setAuthScreen("signup");
      }
      window.history.replaceState(null, "", window.location.pathname);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setUser(session.user); loadUserData(session.user.id, session.user); }
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          loadUserData(session.user.id, session.user);
        }
      }
      setAuthChecked(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!achievementsLoaded.current) return;
    const newOnes = ACHIEVEMENTS.filter(
      a => !unlockedAchievements.includes(a.id) && a.condition(stats, completedTopics)
    );
    if (newOnes.length > 0) {
      setUnlockedAchievements(p => [...p, ...newOnes.map(a => a.id)]);
      setNewAchievement(newOnes[0]);
      setTimeout(() => setNewAchievement(null), 3000);
    }
  }, [stats, completedTopics]);

  // Load guest progress from localStorage
  useEffect(() => {
    if (!isGuest) return;
    try {
      const saved = localStorage.getItem("k8s_quest_guest");
      if (saved) {
        const { stats: s, completedTopics: c, unlockedAchievements: u } = JSON.parse(saved);
        if (c) setCompletedTopics(c);
        if (s) setStats({ ...s, total_score: computeScore(c || {}) });
        if (u) setUnlockedAchievements(u);
      }
    } catch {}
    achievementsLoaded.current = true;
  }, [isGuest]);

  // Save guest progress to localStorage
  useEffect(() => {
    if (!isGuest) return;
    try {
      localStorage.setItem("k8s_quest_guest", JSON.stringify({ stats, completedTopics, unlockedAchievements }));
    } catch {}
  }, [isGuest, stats, completedTopics, unlockedAchievements]);

  useEffect(() => {
    try { localStorage.setItem("topicStats_v1", JSON.stringify(topicStats)); } catch {}
  }, [topicStats]);

  useEffect(() => {
    localStorage.setItem("isInterviewMode_v1", isInterviewMode);
  }, [isInterviewMode]);

  const loadUserData = async (userId, sessionUser) => {
    const { data } = await supabase.from("user_stats").select("*").eq("user_id", userId).single();

    // Merge any guest progress from localStorage
    let guestSaved = null;
    try {
      const raw = localStorage.getItem("k8s_quest_guest");
      if (raw) guestSaved = JSON.parse(raw);
    } catch {}

    const base = data || {};
    const gs = guestSaved?.stats || {};
    const gc = guestSaved?.completedTopics || {};
    const ga = guestSaved?.unlockedAchievements || [];

    const mergedCompleted = { ...(base.completed_topics || {}) };
    Object.entries(gc).forEach(([key, val]) => {
      if (!mergedCompleted[key] || val.correct > mergedCompleted[key].correct)
        mergedCompleted[key] = val;
    });

    const mergedAch = [...new Set([...(base.achievements || []), ...ga])];

    const mergedStats = {
      total_answered: (base.total_answered || 0) + (gs.total_answered || 0),
      total_correct:  (base.total_correct  || 0) + (gs.total_correct  || 0),
      // Always recompute from mergedCompleted — single source of truth, fixes any legacy drift
      total_score:    computeScore(mergedCompleted),
      max_streak:     Math.max(base.max_streak || 0, gs.max_streak || 0),
      current_streak: Math.max(base.current_streak || 0, gs.current_streak || 0),
    };

    setStats(mergedStats);
    setCompletedTopics(mergedCompleted);
    setUnlockedAchievements(mergedAch);

    // Persist merged data to Supabase and clear guest localStorage
    if (guestSaved) {
      const username = sessionUser?.user_metadata?.username || sessionUser?.email?.split("@")[0];
      await supabase.from("user_stats").upsert({
        user_id: userId, username,
        ...mergedStats, completed_topics: mergedCompleted, achievements: mergedAch,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      try { localStorage.removeItem("k8s_quest_guest"); } catch {}
    }

    achievementsLoaded.current = true;
  };

  const saveUserData = async (ns, nc, na) => {
    if (!user || isGuest) return;
    setSaveError("");
    const { error } = await supabase.from("user_stats").upsert({
      user_id: user.id,
      username: user.user_metadata?.username || user.email?.split("@")[0] || "",
      ...ns, completed_topics: nc, achievements: na,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (error) {
      setSaveError(t("saveErrorText"));
    }
  };

  const loadLeaderboard = async () => {
    const { data } = await supabase.from("user_stats")
      .select("username,total_score,max_streak")
      .order("total_score", { ascending: false }).limit(10);
    if (data) setLeaderboard(data);
  };

  const getFormValues = () => {
    const els = authFormRef.current?.elements;
    return {
      emailVal:    els?.email?.value    || "",
      passwordVal: els?.password?.value || "",
      usernameVal: els?.username?.value || "",
    };
  };

  const handleSignUp = async () => {
    setAuthLoading(true); setAuthError("");
    const { emailVal, passwordVal, usernameVal } = getFormValues();
    const { error } = await supabase.auth.signUp({
      email: emailVal, password: passwordVal, options: {
        data: { username: usernameVal || emailVal.split("@")[0] },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("invalid") || msg.includes("already registered") || msg.includes("already been registered"))
        setAuthError(t("emailAlreadySent"));
      else
        setAuthError(error.message);
    } else setAuthError(t("emailSent"));
    setAuthLoading(false);
  };

  const handleLogin = async () => {
    setAuthLoading(true); setAuthError("");
    const { emailVal, passwordVal } = getFormValues();
    const { error } = await supabase.auth.signInWithPassword({ email: emailVal, password: passwordVal });
    if (error) {
      setAuthError(t("wrongCredentials"));
    } else if (window.PasswordCredential) {
      try {
        const cred = new window.PasswordCredential({ id: emailVal, password: passwordVal });
        await navigator.credentials.store(cred);
      } catch {}
    }
    setAuthLoading(false);
  };

  const handleResend = async () => {
    setAuthLoading(true);
    const { emailVal } = getFormValues();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: emailVal,
      options: { emailRedirectTo: window.location.origin },
    });
    setAuthError(error ? t("resendError") : t("resendSuccess"));
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    if (isGuest) {
      setUser(null);
      setStats({ total_answered:0, total_correct:0, total_score:0, max_streak:0, current_streak:0 });
      setCompletedTopics({}); setUnlockedAchievements([]);
      achievementsLoaded.current = false;
      return;
    }
    await supabase.auth.signOut(); setUser(null);
    achievementsLoaded.current = false;
  };

  const handleResetProgress = async () => {
    if (!window.confirm(t("resetConfirm"))) return;
    const emptyStats = { total_answered:0, total_correct:0, total_score:0, max_streak:0, current_streak:0 };
    setStats(emptyStats);
    setCompletedTopics({});
    setUnlockedAchievements([]);
    setTopicStats({});
    try { localStorage.removeItem("topicStats_v1"); } catch {}
    if (isGuest) {
      try { localStorage.removeItem("k8s_quest_guest"); } catch {}
    } else if (user) {
      await supabase.from("user_stats").upsert({
        user_id: user.id,
        username: user.user_metadata?.username || user.email?.split("@")[0] || "",
        ...emptyStats, completed_topics: {}, achievements: [],
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }
  };

  const handleResetTopic = async (topicId) => {
    if (!window.confirm(t("resetTopicConfirm"))) return;
    const newCompleted = { ...completedTopics };
    LEVEL_ORDER.forEach(lvl => delete newCompleted[`${topicId}_${lvl}`]);
    const newScore = computeScore(newCompleted);
    const newStats = { ...stats, total_score: newScore };
    setCompletedTopics(newCompleted);
    setStats(newStats);
    if (!isGuest && user) {
      await supabase.from("user_stats").upsert({
        user_id: user.id,
        username: user.user_metadata?.username || user.email?.split("@")[0] || "",
        ...newStats, completed_topics: newCompleted, achievements: unlockedAchievements,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }
  };


  const handleSelectAnswer = (idx) => {
    if (submitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null || submitted) return;
    setSubmitted(true);
    setShowExplanation(true);
    const q = currentQuestions[questionIndex];
    const correct = selectedAnswer === q.answer;
    if (correct) {
      topicCorrectRef.current += 1;
      setFlash(true); setTimeout(() => setFlash(false), 600);
    }
    setQuizHistory(prev => [...prev, { q: q.q, options: q.options, answer: q.answer, chosen: selectedAnswer, explanation: q.explanation }]);
    if (!isRetryRef.current) {
      setStats(prev => {
        const streak = correct ? prev.current_streak + 1 : 0;
        return {
          ...prev,
          total_answered: prev.total_answered + 1,
          total_correct:  correct ? prev.total_correct + 1 : prev.total_correct,
          // total_score is NOT updated here — it is derived from completedTopics at quiz end
          current_streak: streak,
          max_streak:     Math.max(prev.max_streak, streak),
        };
      });
      if (!isFreeMode(selectedTopic.id)) {
        setTopicStats(prev => {
          const curr = prev[selectedTopic.id] || { answered: 0, correct: 0 };
          return { ...prev, [selectedTopic.id]: { answered: curr.answered + 1, correct: curr.correct + (correct ? 1 : 0) } };
        });
      }
    }
  };

  const nextQuestion = () => {
    const isLast = questionIndex >= currentQuestions.length - 1;
    if (isLast) {
      const finalCorrect = topicCorrectRef.current;
      const key = `${selectedTopic.id}_${selectedLevel}`;
      const prevResult = completedTopics[key];
      const bestCorrect = prevResult ? Math.min(Math.max(prevResult.correct, finalCorrect), currentQuestions.length) : Math.min(finalCorrect, currentQuestions.length);
      const newCompleted = { ...completedTopics, [key]: { correct: bestCorrect, total: currentQuestions.length } };
      // Recompute score from the full completedTopics snapshot — single source of truth
      const newStats = { ...stats, total_score: computeScore(newCompleted) };
      const newAch = [
        ...unlockedAchievements,
        ...ACHIEVEMENTS.filter(a => !unlockedAchievements.includes(a.id) && a.condition(newStats, newCompleted)).map(a => a.id),
      ];
      setCompletedTopics(newCompleted); setStats(newStats); setUnlockedAchievements(newAch);
      if (!isFreeMode(selectedTopic.id)) {
        saveUserData(newStats, newCompleted, newAch);
        const allPerfect = LEVEL_ORDER.every(lvl => {
          const r = newCompleted[`${selectedTopic.id}_${lvl}`];
          return r && r.correct === r.total;
        });
        if (allPerfect) { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 4000); }
      }
      setScreen("topicComplete");
    } else {
      setQuestionIndex(p => p + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
      setShowExplanation(false);
      if (timerEnabled || isInterviewMode) setTimeLeft(isInterviewMode ? (INTERVIEW_DURATIONS[selectedLevel] || 25) : TIMER_SECONDS);
    }
  };

  const startTopic = (topic, level) => {
    const key = `${topic.id}_${level}`;
    isRetryRef.current = !!(completedTopics[key]);
    setSelectedTopic(topic); setSelectedLevel(level); setTopicScreen("theory");
    setQuestionIndex(0); setSelectedAnswer(null); setSubmitted(false);
    setShowExplanation(false);
    topicCorrectRef.current = 0;
    setQuizHistory([]); setShowReview(false); setShowConfetti(false);
    if (timerEnabled || isInterviewMode) setTimeLeft(isInterviewMode ? (INTERVIEW_DURATIONS[level] || 25) : TIMER_SECONDS);
    setScreen("topic");
    if (isGuest) achievementsLoaded.current = true;
  };

  const startMixedQuiz = () => {
    const all = [];
    TOPICS.forEach(topic => {
      LEVEL_ORDER.forEach(level => {
        const qs = lang === "en" ? topic.levels[level].questionsEn : topic.levels[level].questions;
        qs.forEach(q => all.push(q));
      });
    });
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    setMixedQuestions(all.slice(0, 10));
    isRetryRef.current = false;
    setSelectedTopic(MIXED_TOPIC); setSelectedLevel("mixed"); setTopicScreen("quiz");
    setQuestionIndex(0); setSelectedAnswer(null); setSubmitted(false);
    setShowExplanation(false);
    topicCorrectRef.current = 0;
    setQuizHistory([]); setShowReview(false); setShowConfetti(false);
    if (timerEnabled || isInterviewMode) setTimeLeft(isInterviewMode ? 25 : TIMER_SECONDS);
    setScreen("topic");
  };

  const startDailyChallenge = () => {
    const pool = lang === "en" ? DAILY_QUESTIONS.en : DAILY_QUESTIONS.he;
    // Shuffle once per year with a fixed annual seed (same order for all users)
    const annualSeed = new Date().getFullYear() * 31337;
    const annualRng = mulberry32(annualSeed);
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(annualRng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Pick a non-overlapping window by day-of-year — no repeats until full pool cycles
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    const numWindows = Math.floor(shuffled.length / 10);
    const startIdx = (dayOfYear % numWindows) * 10;
    setMixedQuestions(shuffled.slice(startIdx, startIdx + 10));
    isRetryRef.current = false;
    setSelectedTopic(DAILY_TOPIC); setSelectedLevel("daily"); setTopicScreen("quiz");
    setQuestionIndex(0); setSelectedAnswer(null); setSubmitted(false);
    setShowExplanation(false);
    topicCorrectRef.current = 0;
    setQuizHistory([]); setShowReview(false); setShowConfetti(false);
    if (timerEnabled || isInterviewMode) setTimeLeft(isInterviewMode ? 25 : TIMER_SECONDS);
    setScreen("topic");
  };

  // Keyboard shortcuts: 1-4 to pick answer, Enter to confirm/next
  useEffect(() => {
    if (screen !== "topic" || topicScreen !== "quiz") return;
    const handler = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!submitted) { handleSubmit(); } else { nextQuestion(); }
        return;
      }
      const idx = ["1","2","3","4"].indexOf(e.key);
      if (!submitted && idx !== -1 && currentQuestions[questionIndex] && idx < currentQuestions[questionIndex].options.length) {
        setSelectedAnswer(idx);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [screen, topicScreen, submitted, selectedAnswer, questionIndex]);

  // Timer countdown
  useEffect(() => {
    if (screen !== "topic" || topicScreen !== "quiz" || !timerEnabled || submitted || timeLeft <= 0) return;
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [screen, topicScreen, timerEnabled, submitted, timeLeft]);

  // Timer expired – force-submit as missed
  useEffect(() => {
    if (timeLeft !== 0 || submitted || screen !== "topic" || topicScreen !== "quiz" || !timerEnabled) return;
    const q = currentQuestions[questionIndex];
    setSubmitted(true);
    setShowExplanation(true);
    setQuizHistory(prev => [...prev, { q: q.q, options: q.options, answer: q.answer, chosen: -1, explanation: q.explanation }]);
    if (!isRetryRef.current) {
      setStats(prev => ({ ...prev, total_answered: prev.total_answered + 1, current_streak: 0 }));
    }
  }, [timeLeft]);

  const renderTheory = (text) => {
    let inCode = false;
    return text.split('\n').map((line, i) => {
      if (line === 'CODE:') {
        inCode = true;
        return <div key={i} style={{color:"#00D4FF",fontSize:10,fontWeight:800,marginTop:14,marginBottom:4,letterSpacing:2,opacity:0.7}}>YAML / BASH</div>;
      }
      if (inCode) return (
        <div key={i} style={{fontFamily:"monospace",fontSize:11,color:"#7dd3fc",lineHeight:1.8,
          whiteSpace:"pre",direction:"ltr",textAlign:"left"}}>  {line}</div>
      );
      if (line.startsWith('🔹')) return <div key={i} style={{color:"#94a3b8",fontSize:13,marginBottom:5}}>{line}</div>;
      if (!line.trim()) return <div key={i} style={{height:6}}/>;
      return <div key={i} style={{color:"#e2e8f0",fontSize:15,fontWeight:700,marginBottom:8}}>{line}</div>;
    });
  };

const displayName = isGuest ? t("guestName") : (user?.user_metadata?.username || user?.email?.split("@")[0] || t("guestName"));

  if (!authChecked) return (
    <div style={{minHeight:"100vh",background:"#020817",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <svg width="52" height="52" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
          style={{animation:"spin 1.4s linear infinite",display:"block",margin:"0 auto 14px"}}>
          <style>{"@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>
          <defs><linearGradient id="slg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00D4FF"/><stop offset="100%" stopColor="#A855F7"/></linearGradient></defs>
          <circle cx="50" cy="50" r="44" fill="none" stroke="url(#slg)" strokeWidth="5" opacity="0.8"/>
          <circle cx="50" cy="50" r="6" fill="#00D4FF"/>
        </svg>
        <div style={{color:"#475569",fontSize:13}}>{t("loadingText")}</div>
      </div>
    </div>
  );

  const accuracy = stats.total_answered > 0 ? Math.round(stats.total_correct / stats.total_answered * 100) : 0;

  if (!user) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#020817,#0f172a)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Segoe UI, system-ui, sans-serif",direction:dir,padding:"20px"}}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes shine{0%{background-position:200% center}100%{background-position:-200% center}}@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,212,255,0.2)}70%{box-shadow:0 0 0 14px rgba(0,212,255,0)}}input,button{outline:none;font-family:inherit}.gbtn:hover{background:rgba(0,212,255,0.13)!important;border-color:rgba(0,212,255,0.5)!important;color:#00D4FF!important;transform:translateY(-2px)}`}</style>
      <div style={{width:"100%",maxWidth:400,animation:"fadeIn 0.4s ease"}}>
        {/* Language switcher */}
        <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",direction:"ltr",marginBottom:12,gap:8}}>
          {lang==="he"&&<GenderToggle gender={gender} setGender={handleSetGender}/>}
          <LangSwitcher lang={lang} setLang={setLang}/>
        </div>

        <div style={{textAlign:"center",marginBottom:34}}>
          <svg width="64" height="64" viewBox="0 0 100 100" style={{marginBottom:10}} xmlns="http://www.w3.org/2000/svg">
            <defs><radialGradient id="ibg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#0f172a"/><stop offset="100%" stopColor="#020817"/></radialGradient><linearGradient id="igr" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00D4FF"/><stop offset="50%" stopColor="#A855F7"/><stop offset="100%" stopColor="#FF6B35"/></linearGradient></defs>
            <circle cx="50" cy="50" r="50" fill="url(#ibg)"/>
            <circle cx="50" cy="50" r="44" fill="none" stroke="url(#igr)" strokeWidth="4" opacity="0.9"/>
            <g transform="translate(50,50)" stroke="url(#igr)" strokeWidth="2.8" strokeLinecap="round">
              {[0,51.4,102.8,154.2,205.7,257.1,308.5].map((deg,i)=><line key={i} x1="0" y1="-18" x2="0" y2="-34" transform={`rotate(${deg})`}/>)}
            </g>
            <circle cx="50" cy="50" r="10" fill="none" stroke="url(#igr)" strokeWidth="3"/>
            <circle cx="50" cy="50" r="5" fill="#00D4FF"/>
            {[["#00D4FF",0],["#7B9FF7",51.4],["#A855F7",102.8],["#CC60CC",154.2],["#FF6B35",205.7],["#FF8C35",257.1],["#44AAEE",308.5]].map(([c,deg],i)=><circle key={i} cx="50" cy="16" r="3.5" fill={c} transform={deg?`rotate(${deg},50,50)`:""}/>)}
          </svg>
          <h1 style={{fontSize:33,fontWeight:900,margin:"0 0 6px",background:"linear-gradient(90deg,#00D4FF,#A855F7,#FF6B35,#00D4FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundSize:"300% auto",animation:"shine 5s linear infinite"}}>K8s Quest</h1>
          <p style={{color:"#94a3b8",fontSize:14,margin:0}}>{t("tagline")}</p>
        </div>

        <button className="gbtn" onClick={()=>setUser(GUEST_USER)}
          style={{width:"100%",padding:"18px",background:"rgba(0,212,255,0.07)",border:"2px solid rgba(0,212,255,0.3)",borderRadius:14,color:"#7dd3fc",fontSize:17,fontWeight:800,cursor:"pointer",marginBottom:6,transition:"all 0.2s",animation:"pulse 2.8s infinite"}}>
          {t("startPlaying")}
        </button>
        <p style={{textAlign:"center",color:"#7dd3fc",opacity:0.75,fontSize:12,margin:"0 0 26px"}}>{t("noRegNoPass")}</p>

        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,0.1)"}}/>
          <span style={{color:"#94a3b8",fontSize:12,whiteSpace:"nowrap"}}>{t("saveProgress")}</span>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,0.1)"}}/>
        </div>

        <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:14,padding:"18px 20px"}}>
          <div style={{display:"flex",marginBottom:16,background:"rgba(255,255,255,0.04)",borderRadius:9,padding:3}}>
            {["login","signup"].map(s=>(
              <button key={s}
                onClick={()=>{ setAuthScreen(s); setAuthError(""); }}
                style={{flex:1,padding:"7px",border:"none",borderRadius:7,cursor:"pointer",fontSize:13,fontWeight:700,
                  background:authScreen===s?"rgba(0,212,255,0.12)":"transparent",
                  color:authScreen===s?"#00D4FF":"#475569",transition:"all 0.2s"}}>
                {s==="login"?t("loginTab"):t("signupTab")}
              </button>
            ))}
          </div>
          <form ref={authFormRef} onSubmit={e=>{e.preventDefault();authScreen==="login"?handleLogin():handleSignUp();}} autoComplete="on">
          {authScreen==="signup"&&(
            <div style={{marginBottom:11}}>
              <label style={{color:"#475569",fontSize:12,fontWeight:600,display:"block",marginBottom:5}}>{t("username")}</label>
              <input name="username" autoComplete="username" defaultValue="" placeholder="K8s Hero"
                style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:8,color:"#e2e8f0",fontSize:14,boxSizing:"border-box"}}/>
            </div>
          )}
          <div style={{marginBottom:11}}>
            <label style={{color:"#475569",fontSize:12,fontWeight:600,display:"block",marginBottom:5}}>{t("email")}</label>
            <input type="email" name="email" autoComplete={authScreen==="login"?"username":"email"} defaultValue="" placeholder="you@example.com"
              style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:8,color:"#e2e8f0",fontSize:14,boxSizing:"border-box",direction:"ltr"}}/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{color:"#475569",fontSize:12,fontWeight:600,display:"block",marginBottom:5}}>{t("password")}</label>
            <input type="password" name="password" autoComplete={authScreen==="login"?"current-password":"new-password"} defaultValue="" placeholder="••••••••"
              style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:8,color:"#e2e8f0",fontSize:14,boxSizing:"border-box",direction:"ltr"}}/>
          </div>
          {authError&&<div style={{marginBottom:12}}>
            <div style={{color:authError.startsWith("✅")?"#10B981":"#EF4444",fontSize:12,padding:"8px 12px",background:authError.startsWith("✅")?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.08)",borderRadius:8}}>{authError}</div>
            {authScreen==="signup"&&authError.startsWith("✅")&&<div style={{textAlign:"center",marginTop:8,fontSize:12,color:"#475569"}}>
              {t("didntReceive")}{" "}
              <button type="button" onClick={handleResend} disabled={authLoading}
                style={{background:"none",border:"none",color:"#00D4FF",fontWeight:700,cursor:"pointer",fontSize:12,padding:0,textDecoration:"underline"}}>
                {t("resendBtn")}
              </button>
            </div>}
          </div>}
          <button type="submit" disabled={authLoading}
            style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,#00D4FF88,#A855F788)",border:"none",borderRadius:10,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",opacity:authLoading?0.7:1}}>
            {authLoading?t("loading"):authScreen==="login"?t("loginBtn"):t("signupBtn")}
          </button>
          </form>
        </div>
        <p style={{textAlign:"center",color:"#475569",fontSize:11,marginTop:22}}>
          © {year} {t("allRightsReserved")}{" "}
          <a href="https://www.linkedin.com/in/orcarmeli/" target="_blank" rel="noopener noreferrer" style={{color:"#0ea5e9",textDecoration:"none",fontWeight:600}}>Or Carmeli</a>
        </p>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#020817 0%,#0f172a 60%,#020817 100%)",fontFamily:"Segoe UI, system-ui, sans-serif",direction:dir,position:"relative",overflowX:"hidden"}}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes shine{0%{background-position:200% center}100%{background-position:-200% center}}@keyframes toast{from{opacity:0;transform:translateX(-50%) translateY(-12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}@keyframes correctFlash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}@keyframes popIn{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}@keyframes confettiFall{from{top:-20px;transform:rotate(0deg);opacity:1}to{top:100vh;transform:rotate(720deg);opacity:0}}@keyframes pulseHighlight{0%{box-shadow:0 0 0 0 rgba(239,68,68,0)}60%{box-shadow:0 0 0 8px rgba(239,68,68,0.2)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}}.pulseHighlight{animation:pulseHighlight 0.5s ease 3;border-color:rgba(239,68,68,0.45)!important}.card-hover{transition:transform 0.2s;cursor:pointer}.card-hover:hover{transform:translateY(-3px)}.opt-btn{transition:all 0.15s;cursor:pointer}.opt-btn:hover{transform:translateX(-2px)}input,button{outline:none;font-family:inherit}@media(max-width:600px){.stats-grid{grid-template-columns:repeat(2,1fr)!important}.page-pad{padding:16px 12px!important}.quiz-bar-right{flex-wrap:wrap!important;gap:6px!important}}`}</style>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(0,212,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.02) 1px,transparent 1px)",backgroundSize:"48px 48px"}}/>
      {flash&&<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:800,background:"radial-gradient(circle at 50% 45%,rgba(16,185,129,0.14) 0%,transparent 60%)",animation:"correctFlash 0.6s ease forwards"}}/>}
      {showConfetti&&<Confetti/>}
      {newAchievement&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#1e293b,#0f172a)",border:"1px solid #00D4FF55",borderRadius:14,padding:"12px 22px",display:"flex",alignItems:"center",gap:12,zIndex:9999,boxShadow:"0 0 40px rgba(0,212,255,0.3)",animation:"toast 0.4s ease",direction:"ltr"}}><span style={{fontSize:26}}>{newAchievement.icon}</span><div><div style={{color:"#00D4FF",fontWeight:800,fontSize:11,letterSpacing:1}}>{t("newAchievement")}</div><div style={{color:"#e2e8f0",fontSize:14,fontWeight:700}}>{lang==="en"?newAchievement.nameEn:newAchievement.name}</div></div></div>}
      {saveError&&<div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:"rgba(239,68,68,0.12)",border:"1px solid #EF444455",borderRadius:10,padding:"10px 18px",color:"#EF4444",fontSize:13,zIndex:9999}}>{saveError}</div>}

      {showLeaderboard&&<div onClick={()=>setShowLeaderboard(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:5000,display:"flex",alignItems:"center",justifyContent:"center"}}><div onClick={e=>e.stopPropagation()} style={{background:"#0f172a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,padding:20,width:"min(360px,calc(100vw - 32px))",animation:"fadeIn 0.3s ease",direction:"ltr"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}><h3 style={{margin:0,color:"#e2e8f0",fontSize:18,fontWeight:800}}>{t("leaderboardTitle")}</h3><button onClick={()=>setShowLeaderboard(false)} style={{background:"none",border:"none",color:"#64748b",fontSize:18,cursor:"pointer"}}>✕</button></div>{leaderboard.length===0?<div style={{color:"#475569",textAlign:"center",padding:"20px 0"}}>{t("noData")}</div>:leaderboard.map((entry,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:i===0?"rgba(245,158,11,0.1)":"rgba(255,255,255,0.03)",borderRadius:10,marginBottom:8,border:`1px solid ${i===0?"#F59E0B44":"rgba(255,255,255,0.06)"}`}}><span style={{fontSize:18,width:28}}>{["🥇","🥈","🥉"][i]||`${i+1}.`}</span><div style={{flex:1}}><div style={{color:"#e2e8f0",fontWeight:700,fontSize:14}}>{entry.username||t("anonymous")}</div><div style={{color:"#475569",fontSize:11}}>🔥 {entry.max_streak}</div></div><div style={{color:"#00D4FF",fontWeight:800,fontSize:16}}>{entry.total_score}</div></div>)}</div></div>}

      {/* HOME */}
      {screen==="home"&&(
        <div style={{maxWidth:700,margin:"0 auto",padding:"20px 14px",animation:"fadeIn 0.4s ease"}}>
          <div style={{marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
              <h1 style={{fontSize:26,fontWeight:900,margin:0,background:"linear-gradient(90deg,#00D4FF,#A855F7,#FF6B35,#00D4FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundSize:"300% auto",animation:"shine 5s linear infinite"}}>☸️ K8s Quest</h1>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {lang==="he"&&<GenderToggle gender={gender} setGender={handleSetGender}/>}
                <LangSwitcher lang={lang} setLang={setLang}/>
              </div>
            </div>
            <p style={{color:"#475569",fontSize:13,margin:"4px 0 10px"}}>{t("greeting")}, {displayName}! 👋 {isGuest&&<span style={{color:"#475569"}}>{t("playingAsGuest")}</span>}</p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {!isGuest&&<button onClick={()=>{loadLeaderboard();setShowLeaderboard(true);}} style={{padding:"7px 12px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:8,color:"#94a3b8",cursor:"pointer",fontSize:13}}>{t("leaderboardBtn")}</button>}
              <button onClick={()=>setIsInterviewMode(p=>!p)} style={{padding:"7px 12px",background:isInterviewMode?"rgba(168,85,247,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${isInterviewMode?"rgba(168,85,247,0.4)":"rgba(255,255,255,0.09)"}`,borderRadius:8,color:isInterviewMode?"#A855F7":"#94a3b8",cursor:"pointer",fontSize:13,fontWeight:isInterviewMode?700:400}}>{t("interviewMode")}</button>
              <button onClick={handleResetProgress} style={{padding:"7px 12px",background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:8,color:"#EF4444",cursor:"pointer",fontSize:13}}>{t("resetProgress")}</button>
              <button onClick={handleLogout} style={{padding:"7px 12px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:8,color:"#94a3b8",cursor:"pointer",fontSize:13}}>{t("logout")}</button>
            </div>
            {isInterviewMode&&<p style={{color:"#64748b",fontSize:11,margin:"6px 0 0",direction:dir}}>{t("interviewModeHint")}</p>}
          </div>
          {isGuest&&<div style={{background:"rgba(0,212,255,0.05)",border:"1px solid rgba(0,212,255,0.15)",borderRadius:12,padding:"11px 16px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}><span style={{color:"#4a9aba",fontSize:13}}>{t("guestBanner")}</span><button onClick={()=>setUser(null)} style={{padding:"6px 14px",background:"rgba(0,212,255,0.12)",border:"1px solid rgba(0,212,255,0.3)",borderRadius:8,color:"#00D4FF",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>{t("signupNow")}</button></div>}
          <div style={{display:"flex",gap:6,marginBottom:16,background:"rgba(255,255,255,0.03)",borderRadius:10,padding:3}}>
            {[{key:"categories",label:t("tabTopics")},{key:"roadmap",label:t("tabRoadmap")}].map(tab=>(
              <button key={tab.key} onClick={()=>setHomeTab(tab.key)} style={{flex:1,padding:"8px",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700,background:homeTab===tab.key?"rgba(0,212,255,0.12)":"transparent",color:homeTab===tab.key?"#00D4FF":"#475569",transition:"all 0.2s"}}>{tab.label}</button>
            ))}
          </div>
          {homeTab==="categories"&&(<>
          <div className="stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:24}}>
            {[
              {label:t("score"),value:stats.total_score,icon:"⭐",color:"#F59E0B"},
              {label:t("accuracy"),value:`${accuracy}%`,icon:"🎯",color:"#10B981"},
              {label:t("streak"),value:stats.current_streak,icon:"🔥",color:"#FF6B35"},
              {label:t("completed"),value:Object.keys(completedTopics).length,icon:"📚",color:"#00D4FF"},
            ].map((s,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"12px 8px",textAlign:"center"}}>
                <div style={{fontSize:18}}>{s.icon}</div>
                <div style={{fontSize:20,fontWeight:800,color:s.color}}>{s.value}</div>
                <div style={{fontSize:12,color:"#475569"}}>{s.label}</div>
              </div>
            ))}
          </div>
          <WeakAreaCard topicStats={topicStats} t={t} dir={dir} onGoToTopic={(id) => {
            const el = document.getElementById(`topic-card-${id}`);
            if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); setHighlightTopic(id); setTimeout(() => setHighlightTopic(null), 1500); }
          }}/>
          <button onClick={startDailyChallenge} style={{width:"100%",marginBottom:10,padding:"16px 20px",background:"linear-gradient(135deg,rgba(245,158,11,0.12),rgba(239,68,68,0.08))",border:"1px solid rgba(245,158,11,0.35)",borderRadius:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"transform 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:28}}>🔥</span>
              <div style={{textAlign:"start"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{color:"#F59E0B",fontWeight:800,fontSize:15}}>{t("dailyChallengeTitle")}</span>
                  <span style={{background:"rgba(245,158,11,0.2)",color:"#F59E0B",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20,letterSpacing:0.5}}>{t("dailyChallengeNew")}</span>
                </div>
                <div style={{color:"#64748b",fontSize:12,marginTop:2}}>{t("dailyChallengeDesc")}</div>
              </div>
            </div>
            <span style={{color:"#F59E0B",fontSize:20}}>→</span>
          </button>
          <button onClick={startMixedQuiz} style={{width:"100%",marginBottom:16,padding:"16px 20px",background:"linear-gradient(135deg,#A855F722,#7C3AED22)",border:"1px solid #A855F755",borderRadius:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"transform 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:28}}>🎲</span>
              <div style={{textAlign:"start"}}>
                <div style={{color:"#A855F7",fontWeight:800,fontSize:15}}>{t("mixedQuizBtn")}</div>
                <div style={{color:"#64748b",fontSize:12,marginTop:2}}>{t("mixedQuizDesc")}</div>
              </div>
            </div>
            <span style={{color:"#A855F7",fontSize:20}}>→</span>
          </button>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {TOPICS.map(topic=>(
              <div key={topic.id} id={`topic-card-${topic.id}`} className={highlightTopic===topic.id?"pulseHighlight":undefined} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"16px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                  <div style={{fontSize:24,width:44,height:44,borderRadius:10,background:`${topic.color}14`,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${topic.color}22`,flexShrink:0}}>{topic.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,color:"#e2e8f0",fontSize:15}}>{topic.name}</div>
                    <div style={{color:"#475569",fontSize:12}}>{lang==="en"?topic.descriptionEn:topic.description}</div>
                  </div>
                  {(()=>{const done=LEVEL_ORDER.filter(lvl=>completedTopics[`${topic.id}_${lvl}`]).length;return done>0&&<div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{fontSize:11,color:topic.color,fontWeight:700,whiteSpace:"nowrap"}}>{done}/3</div>
                    <button onClick={e=>{e.stopPropagation();handleResetTopic(topic.id);}} title={t("resetTopic")} style={{background:"none",border:"none",color:"#475569",fontSize:13,cursor:"pointer",padding:"2px 4px",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.color="#EF4444"} onMouseLeave={e=>e.currentTarget.style.color="#475569"}>↺</button>
                  </div>})()}
                </div>
                {(()=>{const done=LEVEL_ORDER.filter(lvl=>completedTopics[`${topic.id}_${lvl}`]).length;return(<div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,marginBottom:10}}><div style={{height:"100%",borderRadius:2,width:`${(done/3)*100}%`,background:`linear-gradient(90deg,${topic.color},${topic.color}88)`,transition:"width 0.5s ease"}}/></div>);})()}
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {Object.entries(LEVEL_CONFIG).filter(([lvl])=>lvl!=="mixed"&&lvl!=="daily").map(([lvl,cfg])=>{
                    const key=`${topic.id}_${lvl}`;
                    const done=completedTopics[key];
                    const locked=isLevelLocked(topic.id,lvl);
                    return(
                      <div key={lvl} className={locked?"":"card-hover"}
                        onClick={()=>!locked&&startTopic(topic,lvl)}
                        style={{padding:"10px 8px",
                          background:locked?"rgba(255,255,255,0.01)":done?`${cfg.color}12`:"rgba(255,255,255,0.03)",
                          border:`1px solid ${locked?"rgba(255,255,255,0.04)":done?cfg.color+"44":"rgba(255,255,255,0.07)"}`,
                          borderRadius:10,textAlign:"center",opacity:locked?0.45:1,cursor:locked?"not-allowed":"pointer"}}>
                        <div style={{fontSize:16}}>{locked?"🔒":cfg.icon}</div>
                        <div style={{fontSize:12,fontWeight:700,color:locked?"#334155":done?cfg.color:"#64748b"}}>{lang==="en"?cfg.labelEn:cfg.label}</div>
                        {done&&!locked&&<div style={{fontSize:10,color:done.correct>0?cfg.color:"#EF4444"}}>
                          {done.correct>0?"✓":""} {done.correct}/{done.total}
                        </div>}
                        <div style={{fontSize:10,color:locked?"#1e293b":"#475569"}}>+{cfg.points}{t("pts")}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {unlockedAchievements.length>0&&<div style={{marginTop:18,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:12,padding:"14px 18px"}}><div style={{color:"#94a3b8",fontSize:11,fontWeight:700,marginBottom:10,letterSpacing:1}}>{t("achievementsTitle")}</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{ACHIEVEMENTS.filter(a=>unlockedAchievements.includes(a.id)).map(a=><div key={a.id} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.04)",borderRadius:20,padding:"5px 12px",fontSize:12,color:"#94a3b8"}}><span>{a.icon}</span>{lang==="en"?a.nameEn:a.name}</div>)}</div></div>}
          </>)}
          {homeTab==="roadmap"&&<RoadmapView topics={TOPICS} levelConfig={LEVEL_CONFIG} completedTopics={completedTopics} isLevelLocked={isLevelLocked} startTopic={startTopic} startMixedQuiz={startMixedQuiz} lang={lang} t={t} dir={dir}/>}
          <Footer lang={lang}/>
        </div>
      )}

      {/* TOPIC */}
      {screen==="topic"&&selectedTopic&&selectedLevel&&(
        <div className="page-pad" style={{maxWidth:660,margin:"0 auto",padding:"24px 20px",animation:"fadeIn 0.3s ease"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:22}}>
            <button onClick={()=>setScreen("home")} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",color:"#64748b",padding:"7px 14px",borderRadius:8,cursor:"pointer",fontSize:13}}>{t("back")}</button>
            <span style={{fontSize:18}}>{selectedTopic.icon}</span>
            <h2 style={{margin:0,color:selectedTopic.color,fontSize:17,fontWeight:800}}>{selectedTopic.name}</h2>
            <span style={{fontSize:12,color:LEVEL_CONFIG[selectedLevel].color,background:`${LEVEL_CONFIG[selectedLevel].color}18`,padding:"3px 10px",borderRadius:20,fontWeight:700}}>{LEVEL_CONFIG[selectedLevel].icon} {lang==="en"?LEVEL_CONFIG[selectedLevel].labelEn:LEVEL_CONFIG[selectedLevel].label}</span>
          </div>

          {topicScreen==="theory"?(
            <div>
              <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:22,marginBottom:18}}>
                <div style={{fontSize:11,color:selectedTopic.color,fontWeight:800,marginBottom:16,letterSpacing:1}}>{t("theory")}</div>
                <div style={{background:"rgba(0,0,0,0.35)",borderRadius:10,padding:"16px 20px"}}>{renderTheory(currentLevelData.theory)}</div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:0}}>
                <button onClick={()=>{setTopicScreen("quiz");if(timerEnabled||isInterviewMode)setTimeLeft(isInterviewMode?(INTERVIEW_DURATIONS[selectedLevel]||25):TIMER_SECONDS);}} style={{flex:3,padding:15,background:`linear-gradient(135deg,${selectedTopic.color}dd,${selectedTopic.color}77)`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",boxShadow:`0 6px 24px ${selectedTopic.color}44`}}>
                  {t("startQuiz")} (+{LEVEL_CONFIG[selectedLevel].points} {t("ptsPerQ")})
                </button>
                <button onClick={()=>{setTopicScreen("quiz");if(timerEnabled||isInterviewMode)setTimeLeft(isInterviewMode?(INTERVIEW_DURATIONS[selectedLevel]||25):TIMER_SECONDS);}} style={{flex:1,padding:15,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:12,color:"#94a3b8",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                  {t("skipTheory")}
                </button>
              </div>
              {!isInterviewMode&&<div style={{display:"flex",justifyContent:"center",marginTop:10}}>
                <button onClick={()=>setTimerEnabled(p=>!p)} style={{background:"none",border:"none",color:timerEnabled?"#F59E0B":"#475569",fontSize:12,cursor:"pointer",fontWeight:timerEnabled?700:400}}>
                  {timerEnabled?t("timerOn"):t("timerOff")}
                </button>
              </div>}
            </div>
          ):(
            <div>
              <div style={{marginBottom:18}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <button onClick={()=>setScreen("home")} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",color:"#64748b",padding:"7px 12px",borderRadius:7,cursor:"pointer",fontSize:13}}>{t("back")}</button>
                    <span style={{color:"#475569",fontSize:13}}>{t("question")} {questionIndex+1} {t("of")} {currentQuestions.length}</span>
                  </div>
                  <div className="quiz-bar-right" style={{display:"flex",gap:10,alignItems:"center"}}>
                    {(timerEnabled||isInterviewMode)&&<span style={{display:"inline-block",color:(!isInterviewMode&&timeLeft<=10)?"#EF4444":"#F59E0B",fontSize:13,fontWeight:(isInterviewMode&&timeLeft<=5)?900:800,transform:(isInterviewMode&&timeLeft<=5)?"scale(1.05)":"none",transition:"transform 0.3s ease",minWidth:28,textAlign:"center",direction:"ltr"}}>⏱ {timeLeft}</span>}
                    {!isInterviewMode&&<button onClick={()=>setTimerEnabled(p=>!p)} style={{background:"none",border:"none",color:timerEnabled?"#F59E0B":"#475569",fontSize:12,cursor:"pointer",fontWeight:timerEnabled?700:400,padding:0}}>
                      {timerEnabled?t("timerOn"):t("timerOff")}
                    </button>}
                    <span style={{color:stats.current_streak>0?"#FF6B35":"#475569",fontSize:12,fontWeight:700}}>
                      🔥 {stats.current_streak} {t("streakLabel")}
                    </span>
                    <span style={{color:"#A855F7",fontSize:12,fontWeight:700,direction:"ltr"}}>
                      ⭐ {stats.total_score} {t("pts")}
                    </span>
                  </div>
                </div>
                <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:4}}>
                  <div style={{height:"100%",borderRadius:4,
                    width:`${((questionIndex+(submitted?1:0))/currentQuestions.length)*100}%`,
                    background:`linear-gradient(90deg,${selectedTopic.color},${selectedTopic.color}88)`,
                    transition:"width 0.4s ease"}}/>
                </div>
              </div>

              <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:22,marginBottom:14}}>
                <div dir={dir} style={{color:"#e2e8f0",fontSize:16,fontWeight:700,lineHeight:1.65,wordBreak:"break-word"}}>{currentQuestions[questionIndex].q}</div>
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:14}}>
                {currentQuestions[questionIndex].options.map((opt,i)=>{
                  const isCorrect = i===currentQuestions[questionIndex].answer;
                  const isChosen  = i===selectedAnswer;
                  let borderColor = "rgba(255,255,255,0.09)", bg = "rgba(255,255,255,0.02)", color = "#94a3b8";
                  if (isChosen && !submitted)  { borderColor = "#00D4FF66"; bg = "rgba(0,212,255,0.06)"; color = "#7dd3fc"; }
                  if (submitted) {
                    if (isCorrect)             { borderColor = "#10B981"; bg = "rgba(16,185,129,0.1)";  color = "#10B981"; }
                    else if (isChosen)          { borderColor = "#EF4444"; bg = "rgba(239,68,68,0.1)";   color = "#EF4444"; }
                  }
                  return (
                    <button key={i} className="opt-btn"
                      onClick={()=>handleSelectAnswer(i)}
                      style={{width:"100%",textAlign:dir==="rtl"?"right":"left",padding:"15px 16px",background:bg,border:`1px solid ${borderColor}`,borderRadius:10,color,fontSize:14,cursor:submitted?"default":"pointer",lineHeight:1.5,display:"flex",alignItems:"center",gap:10,transition:"all 0.15s"}}>
                      <span style={{opacity:0.4,fontSize:12,flexShrink:0}}>{t("optionLabels")[i]}.</span>
                      <span dir={dir} style={{flex:1}}>{opt}</span>
                      {submitted&&isCorrect&&<span>✓</span>}
                      {submitted&&isChosen&&!isCorrect&&<span>✗</span>}
                    </button>
                  );
                })}
              </div>

              {!submitted&&selectedAnswer!==null&&(
                <button onClick={handleSubmit}
                  style={{width:"100%",padding:"15px",background:`linear-gradient(135deg,${selectedTopic.color}dd,${selectedTopic.color}77)`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",marginBottom:10,boxShadow:`0 4px 16px ${selectedTopic.color}44`}}>
                  {t("confirmAnswer")}
                </button>
              )}

              {showExplanation&&(
                <div style={{animation:"fadeIn 0.3s ease"}}>
                  {(()=>{
                    const q = currentQuestions[questionIndex];
                    const timedOut = selectedAnswer === null;
                    const isCorrect = !timedOut && selectedAnswer === q.answer;
                    return (
                      <div style={{background:isCorrect?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.08)",border:`1px solid ${isCorrect?"#10B98130":"#EF444430"}`,borderRadius:12,padding:"14px 16px",marginBottom:12}}>
                        <div style={{fontWeight:800,fontSize:13,marginBottom:6,color:isCorrect?"#10B981":"#EF4444"}}>
                          {isCorrect
                            ?`${t("correct")} +${LEVEL_CONFIG[selectedLevel].points} ${t("pts")}`
                            :timedOut
                              ?`${t("timeUp")} ${lang==="he"?"התשובה הנכונה היא":"The correct answer is"}: ${q.options[q.answer]}`
                              :t("incorrect")}
                        </div>
                        {!isInterviewMode&&<div style={{color:"#94a3b8",fontSize:13,lineHeight:1.7}}>{q.explanation}</div>}
                      </div>
                    );
                  })()}
                  {isInterviewMode&&(()=>{
                    const q = currentQuestions[questionIndex];
                    return (
                      <div style={{background:"rgba(168,85,247,0.06)",border:"1px solid rgba(168,85,247,0.22)",borderRadius:12,padding:"14px 16px",marginBottom:12,direction:"rtl",animation:"fadeIn 0.3s ease"}}>
                        <div style={{fontSize:11,fontWeight:700,color:"#A855F7",marginBottom:8,letterSpacing:0.5}}>תשובה אידיאלית</div>
                        <div style={{color:"#e2e8f0",fontWeight:700,fontSize:14,marginBottom:6}}>{q.options[q.answer]}</div>
                        <div style={{color:"#94a3b8",fontSize:13,lineHeight:1.7}}>{q.explanation}</div>
                      </div>
                    );
                  })()}
                  <button onClick={nextQuestion} style={{width:"100%",padding:15,background:`linear-gradient(135deg,${selectedTopic.color}cc,${selectedTopic.color}77)`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer"}}>
                    {questionIndex>=currentQuestions.length-1?t("finishTopic"):t("nextQuestion")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* COMPLETE */}
      {screen==="topicComplete"&&selectedTopic&&selectedLevel&&(()=>{
        const key=`${selectedTopic.id}_${selectedLevel}`;
        const result=completedTopics[key];
        const allCorrect = result?.correct === result?.total;
        const anyCorrect = result?.correct > 0;
        return(
          <div style={{maxWidth:480,margin:"30px auto",padding:"0 14px",textAlign:"center",animation:"fadeIn 0.5s ease"}}>
            <div style={{fontSize:52,marginBottom:10,animation:"popIn 1s ease"}}>
              {allCorrect?"🌟":anyCorrect?"👍":"💪"}
            </div>
            <h2 style={{fontSize:22,fontWeight:900,margin:"0 0 8px",color:selectedTopic.color,wordBreak:"break-word"}}>{selectedTopic.name} – {lang==="en"?LEVEL_CONFIG[selectedLevel].labelEn:LEVEL_CONFIG[selectedLevel].label}</h2>
            <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:8,background:"rgba(255,255,255,0.04)",borderRadius:30,padding:"8px 20px"}}>
              <span style={{color:"#e2e8f0",fontSize:16,fontWeight:700}}>{result?.correct}/{result?.total} {t("correctCount")}</span>
              {allCorrect&&<span style={{color:"#F59E0B",fontSize:13,fontWeight:700}}>{t("perfect")}</span>}
            </div>
            <div style={{color:"#00D4FF",fontWeight:800,fontSize:18,marginBottom:20}}>
              +{(result?.correct||0)*LEVEL_CONFIG[selectedLevel].points} {t("points")}
            </div>
            {isGuest&&<div style={{background:"rgba(0,212,255,0.05)",border:"1px solid rgba(0,212,255,0.15)",borderRadius:12,padding:"11px 16px",marginBottom:16,fontSize:13,color:"#4a9aba"}}>
              {t("guestSaveHint")}{" "}
              <button onClick={()=>setUser(null)} style={{background:"none",border:"none",color:"#00D4FF",fontWeight:700,cursor:"pointer",fontSize:13,textDecoration:"underline"}}>{t("signupLink")}</button>
            </div>}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {selectedTopic.id!=="mixed"&&allCorrect&&getNextLevel(selectedLevel)&&(()=>{
                const nextLvl=getNextLevel(selectedLevel);
                const nextCfg=LEVEL_CONFIG[nextLvl];
                return(
                  <button onClick={()=>startTopic(selectedTopic,nextLvl)}
                    style={{padding:14,background:`linear-gradient(135deg,${nextCfg.color}ee,${nextCfg.color}88)`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",boxShadow:`0 4px 20px ${nextCfg.color}55`}}>
                    {t("nextLevelBtn")} {nextCfg.icon} {lang==="en"?nextCfg.labelEn:nextCfg.label}
                  </button>
                );
              })()}
              {quizHistory.length>0&&<button onClick={()=>setShowReview(p=>!p)} style={{padding:13,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:12,color:"#94a3b8",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                {showReview?t("hideReview"):t("reviewBtn")}
              </button>}
              <button onClick={()=>selectedTopic.id==="mixed"?startMixedQuiz():selectedTopic.id==="daily"?startDailyChallenge():startTopic(selectedTopic,selectedLevel)} style={{padding:13,background:`${selectedTopic.color}18`,border:`1px solid ${selectedTopic.color}40`,borderRadius:12,color:selectedTopic.color,fontSize:14,fontWeight:700,cursor:"pointer"}}>{t("tryAgain")}</button>
              <button onClick={()=>setScreen("home")} style={{padding:13,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:12,color:"#e2e8f0",fontSize:14,fontWeight:700,cursor:"pointer"}}>{t("backToTopics")}</button>
            </div>
            {showReview&&quizHistory.length>0&&(
              <div style={{marginTop:20,textAlign:dir==="rtl"?"right":"left",animation:"fadeIn 0.3s ease"}}>
                <div style={{color:"#94a3b8",fontSize:12,fontWeight:700,marginBottom:12,letterSpacing:1}}>{t("reviewTitle")}</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {quizHistory.map((h,i)=>{
                    const wasCorrect=h.chosen===h.answer;
                    const timedOut=h.chosen===-1;
                    return(
                      <div key={i} style={{background:wasCorrect?"rgba(16,185,129,0.06)":"rgba(239,68,68,0.06)",border:`1px solid ${wasCorrect?"#10B98130":"#EF444430"}`,borderRadius:12,padding:"12px 14px"}}>
                        <div style={{fontWeight:700,fontSize:13,color:wasCorrect?"#10B981":"#EF4444",marginBottom:4}}>
                          {wasCorrect?"✅":"❌"} {t("question")} {i+1}
                        </div>
                        <div style={{color:"#e2e8f0",fontSize:13,marginBottom:6}}>{h.q}</div>
                        {timedOut?<div style={{fontSize:13,color:"#F59E0B"}}>{t("timeUp")}</div>:(
                          <div style={{fontSize:13,color:wasCorrect?"#10B981":"#EF4444",marginBottom:4}}>
                            {lang==="en"?t("optionLabels")[h.chosen]:t("optionLabels")[h.chosen]}. {h.options[h.chosen]}
                          </div>
                        )}
                        {!wasCorrect&&<div style={{fontSize:13,color:"#10B981"}}>✓ {h.options[h.answer]}</div>}
                        <div style={{fontSize:12,color:"#64748b",marginTop:4,lineHeight:1.6}}>{h.explanation}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
