import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://knzawpdrpahilmohzpbl.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuemF3cGRycGFoaWxtb2h6cGJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDA2NzYsImV4cCI6MjA4ODExNjY3Nn0.Vh4vwQkSgIHkyr3LPVAvsktni_l5q1DhP3S3MT97KQ8";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const GUEST_USER = { id: "guest", email: "guest", user_metadata: { username: "Guest" } };

const LEVEL_CONFIG = {
  easy:   { label: "קל",     labelEn: "Easy",   icon: "🌱", color: "#10B981", points: 10 },
  medium: { label: "בינוני", labelEn: "Medium", icon: "⚡", color: "#F59E0B", points: 20 },
  hard:   { label: "קשה",   labelEn: "Hard",   icon: "🔥", color: "#EF4444", points: 30 },
  mixed:  { label: "מיקס",  labelEn: "Mixed",  icon: "🎲", color: "#A855F7", points: 15 },
};

const LEVEL_ORDER = ["easy", "medium", "hard"];

const MIXED_TOPIC = { id: "mixed", icon: "🎲", name: "Mixed Quiz", color: "#A855F7", levels: {} };

const ACHIEVEMENTS = [
  { id: "first",    icon: "🌱", name: "ראשית הדרך",   nameEn: "First Steps",     condition: (s) => s.total_answered >= 1 },
  { id: "streak3",  icon: "🔥", name: "שלושה ברצף",   nameEn: "Three in a Row",  condition: (s) => s.max_streak >= 3 },
  { id: "score100", icon: "💯", name: "100 נקודות",    nameEn: "100 Points",      condition: (s) => s.total_score >= 100 },
  { id: "allEasy",  icon: "⭐", name: "כל הנושאים קל", nameEn: "All Topics Easy", condition: (s, c) => Object.keys(c).filter(k => k.endsWith("_easy")).length >= 5 },
  { id: "master",   icon: "🏆", name: "מאסטר K8s",     nameEn: "K8s Master",      condition: (s, c) => Object.keys(c).filter(k => k.endsWith("_hard")).length >= 5 },
];

const TOPICS = [
  { id:"workloads", icon:"🚀", name:"Workloads", color:"#00D4FF",
    description:"Pods · Deployments · StatefulSets · DaemonSets", descriptionEn:"Pods · Deployments · StatefulSets · DaemonSets",
    levels:{
      easy:{
        theory:`Pods ו-Deployments הם ליבת Kubernetes.\n🔹 Pod – יחידת הריצה הקטנה ביותר, מכיל קונטיינר אחד או יותר\n🔹 Pods זמניים – כשמת, נוצר חדש עם IP חדש\n🔹 Deployment מנהל קבוצת Pods זהים ומבטיח שהמספר הרצוי תמיד רץ\n🔹 replicas – עותקים זהים של ה-Pod שרצים במקביל\nCODE:\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: my-app`,
        theoryEn:`Pods and Deployments are the core of Kubernetes.\n🔹 Pod – the smallest unit of execution, contains one or more containers\n🔹 Pods are ephemeral – when one dies, a new one is created with a new IP\n🔹 Deployment manages a group of identical Pods and ensures the desired count is running\n🔹 replicas – identical copies of the Pod running in parallel\nCODE:\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: my-app`,
        questions:[
          {q:"מה הוא Pod ב-Kubernetes?",options:["מסד נתונים","יחידת הריצה הקטנה ביותר","כלי ניהול","רשת וירטואלית"],answer:1,explanation:"Pod הוא יחידת הריצה הבסיסית. מכיל קונטיינר אחד או יותר שחולקים IP ו-storage."},
          {q:"מה קורה כש-Pod מת?",options:["הוא מתאושש לבד","הנתונים נשמרים","Kubernetes יוצר Pod חדש","המערכת קורסת"],answer:2,explanation:"Pods אפמריאלים – כשמתים, Kubernetes יוצר חדש עם IP חדש."},
          {q:"מה Deployment עושה?",options:["מנהל רשת","מנהל קבוצת Pods זהים ושומר על מספרם","מנהל סיסמות","מנהל לוגים"],answer:1,explanation:"Deployment מנהל את מחזור חיי ה-Pods ומבטיח שמספר הרצוי רץ תמיד."},
          {q:"מה זה replicas?",options:["גיבויים","עותקים זהים של ה-Pod","גרסאות ישנות","קבצי לוג"],answer:1,explanation:"Replicas הם עותקים זהים של ה-Pod שרצים במקביל לזמינות גבוהה."},
        ],
        questionsEn:[
          {q:"What is a Pod in Kubernetes?",options:["A database","The smallest unit of execution","A management tool","A virtual network"],answer:1,explanation:"A Pod is the basic unit of execution. It contains one or more containers that share an IP and storage."},
          {q:"What happens when a Pod dies?",options:["It recovers on its own","Data is preserved","Kubernetes creates a new Pod","The system crashes"],answer:2,explanation:"Pods are ephemeral – when they die, Kubernetes creates a new one with a new IP."},
          {q:"What does a Deployment do?",options:["Manages networking","Manages a group of identical Pods and maintains their count","Manages passwords","Manages logs"],answer:1,explanation:"A Deployment manages the lifecycle of Pods and ensures the desired count is always running."},
          {q:"What are replicas?",options:["Backups","Identical copies of the Pod","Old versions","Log files"],answer:1,explanation:"Replicas are identical copies of the Pod running in parallel for high availability."},
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
        ],
        questionsEn:[
          {q:"What is the advantage of a Rolling Update?",options:["Faster","Zero downtime during update","Saves money","Prevents intrusions"],answer:1,explanation:"Rolling Update updates one Pod at a time, so Pods are always available."},
          {q:"How do you perform a rollback?",options:["kubectl delete deployment","kubectl rollout undo deployment/my-app","kubectl restart","kubectl revert"],answer:1,explanation:"kubectl rollout undo returns the Deployment to the previous version."},
          {q:"What is the main difference between StatefulSet and Deployment?",options:["StatefulSet is faster","Pods in StatefulSet get fixed names and their own storage","StatefulSet cannot scale","StatefulSet is cloud-only"],answer:1,explanation:"In StatefulSet, each Pod has a fixed name (pod-0,1,2) and its own storage."},
          {q:"What type of app is StatefulSet suitable for?",options:["Stateless web servers","Databases and message brokers","CI/CD pipelines","Load balancers"],answer:1,explanation:"StatefulSet is suitable for stateful apps like MySQL, Kafka that need a fixed identity."},
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
        ],
        questionsEn:[
          {q:"What does a DaemonSet guarantee?",options:["Pod runs once","Pod runs on every Node","Pod runs on a specific Node","Pod runs every minute"],answer:1,explanation:"A DaemonSet ensures one Pod runs on every Node. On a new Node – Pod is added automatically."},
          {q:"What is HPA?",options:["High Performance App","Horizontal Pod Autoscaler","Host Port Assignment","Helm Package Archive"],answer:1,explanation:"HPA automatically scales the number of Pods based on CPU/Memory load."},
          {q:"What does CrashLoopBackOff mean?",options:["Pod is paused","Container crashes repeatedly","Network failed","Not enough memory"],answer:1,explanation:"CrashLoopBackOff – the container tries to start, crashes, and tries again."},
          {q:"What is OOMKilled?",options:["A network error","Container exceeded its memory limit","Disk is full","Permission error"],answer:1,explanation:"OOMKilled means the container used more memory than its configured limit."},
        ],
      },
    }
  },
  { id:"networking", icon:"🌐", name:"Networking", color:"#A855F7",
    description:"Services · Ingress · Network Policies", descriptionEn:"Services · Ingress · Network Policies",
    levels:{
      easy:{
        theory:`Services מספקים כתובת IP יציבה לגישה ל-Pods.\n🔹 ClusterIP – גישה פנימית בלבד (ברירת מחדל)\n🔹 NodePort – חשיפה על port בכל Node\n🔹 LoadBalancer – IP חיצוני ב-cloud\n🔹 Service מוצא Pods לפי labels ו-selector\nCODE:\napiVersion: v1\nkind: Service\nspec:\n  selector:\n    app: my-app\n  ports:\n  - port: 80\n    targetPort: 8080`,
        theoryEn:`Services provide a stable IP for accessing Pods.\n🔹 ClusterIP – internal access only (default)\n🔹 NodePort – exposes on a port on each Node\n🔹 LoadBalancer – external IP in the cloud\n🔹 Service finds Pods by labels and selector\nCODE:\napiVersion: v1\nkind: Service\nspec:\n  selector:\n    app: my-app\n  ports:\n  - port: 80\n    targetPort: 8080`,
        questions:[
          {q:"למה צריך Service?",options:["לחיסכון","IP של Pod משתנה, Service נותן IP יציב","לאבטחה","לגיבוי"],answer:1,explanation:"כשPod מת ונוצר מחדש מקבל IP חדש. Service נותן כתובת קבועה."},
          {q:"איזה Service מתאים לגישה חיצונית ב-cloud?",options:["ClusterIP","NodePort","LoadBalancer","ExternalName"],answer:2,explanation:"LoadBalancer יוצר Load Balancer ב-cloud ומקצה IP חיצוני."},
          {q:"מה Service מסוג ClusterIP?",options:["חשיפה חיצונית","גישה פנימית בלבד בתוך הCluster","DNS חיצוני","VPN"],answer:1,explanation:"ClusterIP הוא ברירת המחדל – מאפשר גישה רק בתוך הCluster."},
          {q:"כיצד Service מוצא את ה-Pods שלו?",options:["לפי שם","לפי labels ו-selector","לפי IP","לפי port"],answer:1,explanation:"Service משתמש ב-selector כדי למצוא Pods עם labels תואמים."},
        ],
        questionsEn:[
          {q:"Why do we need a Service?",options:["To save money","Pod IP changes, Service gives a stable IP","For security","For backup"],answer:1,explanation:"When a Pod dies and is recreated it gets a new IP. A Service provides a permanent address."},
          {q:"Which Service type is for cloud external access?",options:["ClusterIP","NodePort","LoadBalancer","ExternalName"],answer:2,explanation:"LoadBalancer creates a Load Balancer in the cloud and assigns an external IP."},
          {q:"What is a ClusterIP Service?",options:["External exposure","Internal-only access within the Cluster","External DNS","VPN"],answer:1,explanation:"ClusterIP is the default – allows access only within the Cluster."},
          {q:"How does a Service find its Pods?",options:["By name","By labels and selector","By IP","By port"],answer:1,explanation:"A Service uses a selector to find Pods with matching labels."},
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
        ],
        questionsEn:[
          {q:"What is the DNS name of service 'api' in namespace 'prod'?",options:["api.prod","api.prod.svc","api.prod.svc.cluster.local","prod.api.local"],answer:2,explanation:"Format: service.namespace.svc.cluster.local – this is the full FQDN."},
          {q:"What is the advantage of Ingress over LoadBalancer?",options:["Faster","One entry point for all services","Always cheaper","More secure"],answer:1,explanation:"Ingress enables smart routing through one entry point, saving multiple LoadBalancers."},
          {q:"What is an Ingress Controller?",options:["A kubectl plugin","The Pod that implements the Ingress rules","A cloud service","A DNS server"],answer:1,explanation:"An Ingress Controller (like nginx) is the Pod that reads Ingress resources and routes traffic."},
          {q:"What are Endpoints in Kubernetes?",options:["IP addresses of Nodes","IP addresses of the Pods the Service routes to","External ports","DNS addresses"],answer:1,explanation:"Endpoints are the list of IPs of Pods that the Service routes to, updated automatically."},
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
        ],
        questionsEn:[
          {q:"What happens without a NetworkPolicy?",options:["All traffic is blocked","Every Pod can talk to every Pod","Only Pods in the same Namespace communicate","Only HTTPS is allowed"],answer:1,explanation:"By default in Kubernetes it is allow-all."},
          {q:"What is required for NetworkPolicy to work?",options:["Kubernetes 1.28+","A supporting CNI plugin like Calico or Cilium","Enabling a firewall","A special cloud provider"],answer:1,explanation:"NetworkPolicy requires a supporting CNI plugin. kubenet does not implement NetworkPolicies!"},
          {q:"What is the purpose of a Namespace?",options:["File storage","Logical isolation of resources","Password management","Global DNS"],answer:1,explanation:"Namespaces provide logical isolation – separation between teams, projects, or environments."},
          {q:"What does ResourceQuota do?",options:["Aggregates resources","Limits total resources a Namespace can use","Monitors usage","Distributes resources equally"],answer:1,explanation:"ResourceQuota limits the total CPU, Memory, and Pods a Namespace can consume."},
        ],
      },
    }
  },
  { id:"config", icon:"🔐", name:"Config & Security", color:"#F59E0B",
    description:"ConfigMaps · Secrets · RBAC", descriptionEn:"ConfigMaps · Secrets · RBAC",
    levels:{
      easy:{
        theory:`ConfigMap ו-Secret מפרידים קוד מקונפיגורציה.\n🔹 ConfigMap – הגדרות רגילות (DB_URL, timeout)\n🔹 Secret – נתונים רגישים (passwords, tokens)\n🔹 Secrets מקודדים ב-base64 (לא מוצפנים לחלוטין!)\n🔹 שניהם: env variables או volume\nCODE:\napiVersion: v1\nkind: ConfigMap\ndata:\n  DB_URL: postgres://db:5432\n  MAX_CONN: "100"`,
        theoryEn:`ConfigMap and Secret separate code from configuration.\n🔹 ConfigMap – regular settings (DB_URL, timeout)\n🔹 Secret – sensitive data (passwords, tokens)\n🔹 Secrets are base64 encoded (not fully encrypted by default!)\n🔹 Both: env variables or volume\nCODE:\napiVersion: v1\nkind: ConfigMap\ndata:\n  DB_URL: postgres://db:5432\n  MAX_CONN: "100"`,
        questions:[
          {q:"מה ההבדל בין ConfigMap ל-Secret?",options:["אין הבדל","Secret מיועד לנתונים רגישים","ConfigMap יותר מהיר","Secret רק לpasswords"],answer:1,explanation:"Secret מיועד לנתונים רגישים. ConfigMap לקונפיגורציה רגילה."},
          {q:"האם Secrets מוצפנים לחלוטין?",options:["כן, תמיד","לא, רק מקודדים ב-base64 כברירת מחדל","תלוי בגרסה","כן, עם AES-256"],answer:1,explanation:"Secrets מקודדים ב-base64 בלבד – לא מוצפנים! צריך Sealed Secrets לאבטחה אמיתית."},
          {q:"כיצד משתמשים ב-ConfigMap ב-Pod?",options:["רק כקובץ","רק כenv","כenv variables או כvolume files","לא ניתן"],answer:2,explanation:"ConfigMap ניתן לטעון כenv variables, כvolume עם קבצים, או דרך API."},
          {q:"מה זה imagePullSecrets?",options:["Secret לDB","Secret לגישה ל-private container registry","Secret לTLS","Secret לSSH"],answer:1,explanation:"imagePullSecrets מאפשר ל-Kubernetes להוריד images מ-private registries כמו ECR."},
        ],
        questionsEn:[
          {q:"What is the difference between ConfigMap and Secret?",options:["No difference","Secret is intended for sensitive data","ConfigMap is faster","Secret is only for passwords"],answer:1,explanation:"Secret is intended for sensitive data. ConfigMap is for regular configuration."},
          {q:"Are Secrets fully encrypted by default?",options:["Yes, always","No, only base64 encoded by default","Depends on version","Yes, with AES-256"],answer:1,explanation:"Secrets are only base64 encoded by default – not encrypted! Sealed Secrets needed for true security."},
          {q:"How can a ConfigMap be used in a Pod?",options:["Only as a file","Only as env","As env variables or volume files","Not possible"],answer:2,explanation:"A ConfigMap can be loaded as env variables, as a volume with files, or via the API."},
          {q:"What is imagePullSecrets?",options:["Secret for DB","Secret for accessing a private container registry","Secret for TLS","Secret for SSH"],answer:1,explanation:"imagePullSecrets allows Kubernetes to pull images from private registries like ECR."},
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
        ],
        questionsEn:[
          {q:"What is the difference between Role and ClusterRole?",options:["No difference","Role is Namespace-scoped, ClusterRole is cluster-wide","ClusterRole is always stronger","Role for users only"],answer:1,explanation:"Role defines permissions in a specific Namespace. ClusterRole defines permissions cluster-wide."},
          {q:"What is a RoleBinding?",options:["Creating a new Role","Binding a Role to a user/ServiceAccount","Copying a Role","Deleting a Role"],answer:1,explanation:"RoleBinding binds a Role to a user, group, or ServiceAccount."},
          {q:"What is a ServiceAccount?",options:["Account for a human user","Identity for a Pod/process within the Cluster","Name for a Service","Billing account"],answer:1,explanation:"ServiceAccount provides identity to Pods for authentication with the Kubernetes API."},
          {q:"What verb allows real-time watching?",options:["get","list","watch","monitor"],answer:2,explanation:"The 'watch' verb allows a stream of real-time changes (like kubectl get pods -w)."},
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
        ],
        questionsEn:[
          {q:"What is the Least Privilege principle?",options:["Give admin to everyone","Give only the minimum necessary permissions","Give no permissions","Permissions by name"],answer:1,explanation:"Least Privilege – each entity receives only the permissions it needs."},
          {q:"What does External Secrets Operator do?",options:["Encrypts existing secrets","Syncs secrets from cloud providers to K8s","Deletes old secrets","Backs up secrets"],answer:1,explanation:"External Secrets Operator syncs secrets from AWS Secrets Manager, GCP, Azure Key Vault to K8s."},
          {q:"What is Encryption at Rest?",options:["Encrypting network traffic","Encrypting the etcd database that stores secrets","Encrypting log files","Encrypting images"],answer:1,explanation:"Encryption at Rest encrypts the etcd database where K8s stores all secrets."},
          {q:"What does Sealed Secrets allow?",options:["Encrypting network traffic","Storing encrypted secrets in git safely","Auto-creating secrets","Sharing between clusters"],answer:1,explanation:"Sealed Secrets encrypts secrets so they can be safely stored in a git repository."},
        ],
      },
    }
  },
  { id:"storage", icon:"💾", name:"Storage & Helm", color:"#10B981",
    description:"PersistentVolumes · StorageClass · Helm", descriptionEn:"PersistentVolumes · StorageClass · Helm",
    levels:{
      easy:{
        theory:`PersistentVolumes ו-Helm בסיסי.\n🔹 PV – יחידת אחסון בCluster (admin מגדיר)\n🔹 PVC – בקשה לאחסון מ-Pod\n🔹 Helm Chart – חבילה של Kubernetes manifests עם templates\n🔹 helm install – מתקין Chart ויוצר Release\nCODE:\napiVersion: v1\nkind: PersistentVolumeClaim\nspec:\n  accessModes: [ReadWriteOnce]\n  resources:\n    requests:\n      storage: 10Gi`,
        theoryEn:`PersistentVolumes and basic Helm.\n🔹 PV – a storage unit in the Cluster (defined by admin)\n🔹 PVC – a request for storage by a Pod\n🔹 Helm Chart – a package of K8s manifests with templates\n🔹 helm install – installs a Chart and creates a Release\nCODE:\napiVersion: v1\nkind: PersistentVolumeClaim\nspec:\n  accessModes: [ReadWriteOnce]\n  resources:\n    requests:\n      storage: 10Gi`,
        questions:[
          {q:"מה ההבדל בין PV ל-PVC?",options:["אין הבדל","PV הוא האחסון, PVC הוא הבקשה לאחסון","PVC לproduction, PV לdev","PV לLinux, PVC לWindows"],answer:1,explanation:"PV הוא יחידת האחסון שה-admin מגדיר. PVC היא הבקשה של האפליקציה לאחסון."},
          {q:"מה AccessMode ReadWriteOnce?",options:["קריאה בלבד","כתיבה מNode אחד בלבד","קריאה וכתיבה מnode אחד בו-זמנית","קריאה מכל הNodes"],answer:2,explanation:"ReadWriteOnce (RWO) – mounted לקריאה וכתיבה על ידי node אחד בלבד."},
          {q:"מה זה Helm Chart?",options:["Docker image","חבילה של Kubernetes manifests עם templates","רשת Kubernetes","גרסה של kubectl"],answer:1,explanation:"Helm Chart הוא חבילה המכילה templates, values, ומטה-נתונים להתקנת אפליקציה."},
          {q:"מה הפקודה להתקנת Helm Chart?",options:["helm deploy","helm install","helm run","helm apply"],answer:1,explanation:"helm install [release-name] [chart] מתקין Chart ויוצר Release חדש."},
        ],
        questionsEn:[
          {q:"What is the difference between PV and PVC?",options:["No difference","PV is the storage, PVC is the request","PVC for production, PV for dev","PV for Linux, PVC for Windows"],answer:1,explanation:"PV is the storage unit defined by the admin. PVC is the application request for storage."},
          {q:"What is AccessMode ReadWriteOnce?",options:["Read-only","Write from one Node only","Read and write from one node at a time","Read from all Nodes"],answer:2,explanation:"ReadWriteOnce (RWO) – can be mounted for read/write by only one node at a time."},
          {q:"What is a Helm Chart?",options:["A Docker image","A package of K8s manifests with templates","A Kubernetes network","A version of kubectl"],answer:1,explanation:"A Helm Chart is a package containing templates, values, and metadata for installing an application."},
          {q:"What command installs a Helm Chart?",options:["helm deploy","helm install","helm run","helm apply"],answer:1,explanation:"helm install [release-name] [chart] installs a Chart and creates a new Release."},
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
        ],
        questionsEn:[
          {q:"What is Dynamic Provisioning?",options:["CPU allocation","PV created automatically when PVC is created","Auto resize","Migration"],answer:1,explanation:"Dynamic Provisioning – when a PVC with StorageClass is created, the provisioner auto-creates a PV."},
          {q:"What does Reclaim Policy Delete do?",options:["Deletes only PVC","Deletes PV and physical storage when PVC is deleted","Keeps data","Moves to backup"],answer:1,explanation:"Reclaim Policy Delete – when PVC is deleted, the PV and cloud disk are automatically deleted."},
          {q:"How do you change a Helm value from the CLI?",options:["helm change","helm --override","helm install --set key=value","helm config"],answer:2,explanation:"--set key=value overrides values.yaml at install/upgrade time."},
          {q:"What command updates an existing Helm Release?",options:["helm update","helm upgrade","helm patch","helm redeploy"],answer:1,explanation:"helm upgrade [release] [chart] updates an existing Release."},
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
        ],
        questionsEn:[
          {q:"What does ReadWriteMany allow?",options:["Read-only","Write from one Node","Read and write from multiple Nodes simultaneously","Auto-expansion"],answer:2,explanation:"ReadWriteMany (RWX) allows multiple Nodes to read and write simultaneously. Suitable for NFS/EFS."},
          {q:"What is CSI?",options:["Container Security Interface","Container Storage Interface – standard for drivers","Cloud Storage Integration","Cluster Sync"],answer:1,explanation:"CSI is a standard that allows vendors to write storage drivers for Kubernetes."},
          {q:"What is a Helm Hook?",options:["A debug tool","An action at a specific lifecycle point","A Chart type","Alternative to Rollback"],answer:1,explanation:"Helm Hooks run Jobs/Pods at: pre-install, post-upgrade, pre-delete."},
          {q:"What is a VolumeSnapshot?",options:["Backup of the whole Cluster","Point-in-time backup of a PersistentVolume","Pod snapshot","ConfigMap backup"],answer:1,explanation:"VolumeSnapshot creates a point-in-time backup of a PV, allowing restore to a specific point."},
        ],
      },
    }
  },
  { id:"troubleshooting", icon:"🔧", name:"Troubleshooting", color:"#EF4444",
    description:"Debugging · שגיאות נפוצות · כלים", descriptionEn:"Debugging · Common Errors · Tools",
    levels:{
      easy:{
        theory:`פקודות Debug בסיסיות.\n🔹 kubectl describe – events ומידע מפורט על resource\n🔹 kubectl logs – לוגים של קונטיינר\n🔹 kubectl exec – מריץ פקודה בתוך Pod\n🔹 kubectl get pods -A – כל הPods בכל הNamespaces\nCODE:\nkubectl describe pod my-pod\nkubectl logs my-pod\nkubectl logs my-pod -c my-container\nkubectl exec -it my-pod -- bash\nkubectl get pods -A`,
        theoryEn:`Basic Debug Commands.\n🔹 kubectl describe – events and detailed info about a resource\n🔹 kubectl logs – container logs\n🔹 kubectl exec – runs a command inside a Pod\n🔹 kubectl get pods -A – all Pods in all Namespaces\nCODE:\nkubectl describe pod my-pod\nkubectl logs my-pod\nkubectl logs my-pod -c my-container\nkubectl exec -it my-pod -- bash\nkubectl get pods -A`,
        questions:[
          {q:"מה הפקודה להצגת events ומידע מפורט של Pod?",options:["kubectl info pod","kubectl describe pod","kubectl show pod","kubectl inspect pod"],answer:1,explanation:"kubectl describe pod מציג את כל המידע כולל events – הכלי הראשי לאבחון בעיות."},
          {q:"מה הפקודה לראות לוגים של Pod?",options:["kubectl show pod","kubectl logs","kubectl debug pod","kubectl inspect"],answer:1,explanation:"kubectl logs [pod-name] מציג את הלוגים של הקונטיינר."},
          {q:"כיצד מריצים פקודה בתוך Pod?",options:["kubectl run","kubectl enter","kubectl exec -it pod -- bash","kubectl ssh pod"],answer:2,explanation:"kubectl exec -it [pod] -- bash פותח shell אינטראקטיבי בתוך הקונטיינר."},
          {q:"מה הפקודה לראות כל הPods בכל הNamespaces?",options:["kubectl get pods","kubectl get all","kubectl get pods -A","kubectl get pods --all"],answer:2,explanation:"kubectl get pods -A (או --all-namespaces) מציג את כל הPods בכל הNamespaces."},
        ],
        questionsEn:[
          {q:"What command shows detailed events and info of a Pod?",options:["kubectl info pod","kubectl describe pod","kubectl show pod","kubectl inspect pod"],answer:1,explanation:"kubectl describe pod shows all info including events – the primary tool for diagnosing issues."},
          {q:"What command shows Pod logs?",options:["kubectl show pod","kubectl logs","kubectl debug pod","kubectl inspect"],answer:1,explanation:"kubectl logs [pod-name] displays the container logs."},
          {q:"How do you run a command inside a Pod?",options:["kubectl run","kubectl enter","kubectl exec -it pod -- bash","kubectl ssh pod"],answer:2,explanation:"kubectl exec -it [pod] -- bash opens an interactive shell inside the container."},
          {q:"What command shows all Pods in all Namespaces?",options:["kubectl get pods","kubectl get all","kubectl get pods -A","kubectl get pods --all"],answer:2,explanation:"kubectl get pods -A (or --all-namespaces) shows all Pods across all Namespaces."},
        ],
      },
      medium:{
        theory:`שגיאות נפוצות ב-Pods.\n🔹 CrashLoopBackOff – קונטיינר קורס שוב ושוב\n🔹 ImagePullBackOff – לא ניתן להוריד image (שם שגוי/credentials)\n🔹 OOMKilled – חרגנו ממגבלת הזיכרון\n🔹 Pending – אין Node פנוי (resources / nodeSelector)\nCODE:\nkubectl describe pod my-pod   # בדוק Events\nkubectl logs my-pod --previous  # לוגים לפני crash\nkubectl top pod                 # CPU/Memory`,
        theoryEn:`Common Pod errors.\n🔹 CrashLoopBackOff – container crashes repeatedly\n🔹 ImagePullBackOff – cannot pull image (wrong name/credentials)\n🔹 OOMKilled – exceeded memory limit\n🔹 Pending – no available Node (resources / nodeSelector)\nCODE:\nkubectl describe pod my-pod   # check Events\nkubectl logs my-pod --previous  # logs before crash\nkubectl top pod                 # CPU/Memory`,
        questions:[
          {q:"מה משמעות CrashLoopBackOff?",options:["הPod הושהה","הקונטיינר קורס שוב ושוב","הרשת נכשלה","אין זיכרון"],answer:1,explanation:"CrashLoopBackOff – הקונטיינר מנסה לעלות, קורס, ומנסה שוב. בדוק logs ו-describe."},
          {q:"מה גורם ל-ImagePullBackOff?",options:["מעט זיכרון","שם image שגוי או credentials חסרים לregistry","הPod גדול","Namespace לא קיים"],answer:1,explanation:"ImagePullBackOff – K8s לא מצליח להוריד image. בדוק שם ו-imagePullSecrets."},
          {q:"Pod ב-Pending מה בדרך כלל הסיבה?",options:["שגיאת קוד","אין Node עם resources מספיקים","הNetwork מנותקת","הLogs מלאים"],answer:1,explanation:"Pod ב-Pending לרוב אומר אין Node שיכול לקבל אותו – בדוק resource requests."},
          {q:"איך רואים לוגים של קונטיינר שקרס?",options:["kubectl logs pod","kubectl logs pod --previous","kubectl describe pod","kubectl debug pod"],answer:1,explanation:"kubectl logs [pod] --previous מציג לוגים של הinstance הקודם לפני ה-crash."},
        ],
        questionsEn:[
          {q:"What does CrashLoopBackOff mean?",options:["Pod is paused","Container crashes repeatedly","Network failed","Not enough memory"],answer:1,explanation:"CrashLoopBackOff – the container tries to start, crashes, and tries again. Check logs and describe."},
          {q:"What causes ImagePullBackOff?",options:["Low memory","Wrong image name or missing registry credentials","Pod is too large","Namespace not found"],answer:1,explanation:"ImagePullBackOff – K8s can not pull the image. Check image name and imagePullSecrets."},
          {q:"What does a Pending Pod usually indicate?",options:["Code error","No Node with sufficient resources","Network disconnected","Logs full"],answer:1,explanation:"A Pending Pod usually means no Node can accept it – check resource requests and nodeSelector."},
          {q:"How do you see logs of a crashed container?",options:["kubectl logs pod","kubectl logs pod --previous","kubectl describe pod","kubectl debug pod"],answer:1,explanation:"kubectl logs [pod] --previous shows logs of the previous container instance before the crash."},
        ],
      },
      hard:{
        theory:`Debug מתקדם.\n🔹 kubectl port-forward – מנתב port מ-Pod לlocal machine\n🔹 kubectl cp – מעתיק קבצים מ/ל-Pod\n🔹 kubectl top – CPU/Memory usage בזמן אמת\n🔹 Pod ב-Terminating לא נמחק – בגלל finalizer\nCODE:\nkubectl port-forward pod/my-pod 8080:80\nkubectl cp my-pod:/app/log.txt ./log.txt\nkubectl top pod --sort-by=memory\nkubectl patch pod my-pod -p '{"metadata":{"finalizers":null}}'`,
        theoryEn:`Advanced debugging.\n🔹 kubectl port-forward – routes a port from Pod to local machine\n🔹 kubectl cp – copies files from/to a Pod\n🔹 kubectl top – real-time CPU/Memory usage\n🔹 Pod stuck in Terminating – blocked by a finalizer\nCODE:\nkubectl port-forward pod/my-pod 8080:80\nkubectl cp my-pod:/app/log.txt ./log.txt\nkubectl top pod --sort-by=memory\nkubectl patch pod my-pod -p '{"metadata":{"finalizers":null}}'`,
        questions:[
          {q:"Pod נתקע ב-CrashLoopBackOff – מה הצעד הראשון לדיבאג?",options:["הגדל memory limits","הרץ kubectl logs [pod] --previous ו-kubectl describe pod","מחק ובנה מחדש את ה-Pod","הפעל מחדש את ה-Deployment"],answer:1,explanation:"הצעד הראשון הוא kubectl logs --previous לראות מה גרם ל-crash, ו-kubectl describe לראות את ה-events."},
          {q:"Deployment נעצר באמצע Rolling Update – 50% Pods ב-v1, 50% ב-v2. מה עושים?",options:["מחק את כל ה-Pods ידנית","kubectl rollout undo deployment/my-app","הגדל את מספר ה-replicas","kubectl rollout pause"],answer:1,explanation:"kubectl rollout undo מחזיר לגרסה הקודמת באופן מסודר ומבטיח שכל ה-Pods חוזרים ל-v1."},
          {q:"Service לא מגיע ל-Pods שלו – מה הסיבה הנפוצה ביותר?",options:["Port שגוי ב-Service","selector labels לא תואמים ל-labels של ה-Pods","Namespace שגוי","אין Ingress מוגדר"],answer:1,explanation:"הטעות הנפוצה ביותר היא selector/labels mismatch – ה-Service מחפש Pods עם labels שלא קיימים. בדוק עם kubectl describe service."},
          {q:"Node נמצא ב-NotReady – מה הפעולה הראשונה?",options:["מחק את ה-Node","kubectl describe node [name] לבדוק events ו-conditions","Restart כל ה-Pods ב-Node","Scale down את ה-Deployment"],answer:1,explanation:"kubectl describe node מציג את ה-conditions וה-events – לרוב תראה שגיאות ב-kubelet, disk pressure, או memory pressure."},
        ],
        questionsEn:[
          {q:"A Pod is stuck in CrashLoopBackOff. What is the first debugging step?",options:["Increase memory limits","Run kubectl logs [pod] --previous and kubectl describe pod","Delete and recreate the Pod","Restart the Deployment"],answer:1,explanation:"The first step is kubectl logs --previous to see what caused the crash, and kubectl describe to see the events."},
          {q:"A Deployment stalled mid Rolling Update – 50% pods on v1, 50% on v2. What do you do?",options:["Delete all Pods manually","kubectl rollout undo deployment/my-app","Increase the replica count","kubectl rollout pause"],answer:1,explanation:"kubectl rollout undo rolls back to the previous version in an orderly way and ensures all Pods return to v1."},
          {q:"A Service is not reaching its Pods. What is the most common cause?",options:["Wrong port on Service","Selector labels don't match the Pod labels","Wrong namespace","No Ingress defined"],answer:1,explanation:"The most common mistake is a selector/labels mismatch – the Service is looking for Pods with labels that don't exist. Check with kubectl describe service."},
          {q:"A Node is in NotReady state. What is the first action?",options:["Delete the Node","kubectl describe node [name] to check events and conditions","Restart all Pods on the Node","Scale down the Deployment"],answer:1,explanation:"kubectl describe node shows conditions and events – you'll typically see kubelet errors, disk pressure, or memory pressure."},
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
    mixedQuizBtn: "🎲 חידון מיקס", mixedQuizDesc: "10 שאלות אקראיות מכל הנושאים",
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
    mixedQuizBtn: "🎲 Mixed Quiz", mixedQuizDesc: "10 random questions from all topics",
  },
};

const year = new Date().getFullYear();
const TIMER_SECONDS = 30;

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
  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.he[key] ?? key;
  const dir = lang === "he" ? "rtl" : "ltr";

  const [authChecked, setAuthChecked]     = useState(false);
  const [user, setUser]                   = useState(null);
  const [authScreen, setAuthScreen]       = useState("login");
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [username, setUsername]           = useState("");
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
  const [completedTopics, setCompletedTopics]           = useState({});
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [newAchievement, setNewAchievement]             = useState(null);
  const [leaderboard, setLeaderboard]                   = useState([]);
  const [showLeaderboard, setShowLeaderboard]           = useState(false);
  const [quizHistory, setQuizHistory]                   = useState([]);
  const [showReview, setShowReview]                     = useState(false);
  const [timerEnabled, setTimerEnabled]                 = useState(true);
  const [timeLeft, setTimeLeft]                         = useState(TIMER_SECONDS);
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

  const currentLevelData = selectedTopic && selectedLevel && selectedTopic.id !== "mixed" ? getLevelData(selectedTopic, selectedLevel) : null;
  const currentQuestions = selectedTopic?.id === "mixed" ? mixedQuestions : (currentLevelData?.questions || []);

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
        if (s) setStats(s);
        if (c) setCompletedTopics(c);
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

    const mergedStats = {
      total_answered: (base.total_answered || 0) + (gs.total_answered || 0),
      total_correct:  (base.total_correct  || 0) + (gs.total_correct  || 0),
      total_score:    (base.total_score    || 0) + (gs.total_score    || 0),
      max_streak:     Math.max(base.max_streak || 0, gs.max_streak || 0),
      current_streak: Math.max(base.current_streak || 0, gs.current_streak || 0),
    };

    const mergedCompleted = { ...(base.completed_topics || {}) };
    Object.entries(gc).forEach(([key, val]) => {
      if (!mergedCompleted[key] || val.correct > mergedCompleted[key].correct)
        mergedCompleted[key] = val;
    });

    const mergedAch = [...new Set([...(base.achievements || []), ...ga])];

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

  const handleSignUp = async () => {
    setAuthLoading(true); setAuthError("");
    const { error } = await supabase.auth.signUp({
      email, password, options: {
        data: { username: username || email.split("@")[0] },
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(t("wrongCredentials"));
    setAuthLoading(false);
  };

  const handleResend = async () => {
    setAuthLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
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
          total_score:    prev.total_score + (correct ? LEVEL_CONFIG[selectedLevel].points : 0),
          current_streak: streak,
          max_streak:     Math.max(prev.max_streak, streak),
        };
      });
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
      const newStats = { ...stats };
      const newAch = [
        ...unlockedAchievements,
        ...ACHIEVEMENTS.filter(a => !unlockedAchievements.includes(a.id) && a.condition(newStats, newCompleted)).map(a => a.id),
      ];
      setCompletedTopics(newCompleted); setStats(newStats); setUnlockedAchievements(newAch);
      if (selectedTopic.id !== "mixed") {
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
      if (timerEnabled) setTimeLeft(TIMER_SECONDS);
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
    if (timerEnabled) setTimeLeft(TIMER_SECONDS);
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
    if (timerEnabled) setTimeLeft(TIMER_SECONDS);
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

  const accuracy = stats.total_answered > 0 ? Math.round(stats.total_correct / stats.total_answered * 100) : 0;
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

  if (!user) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#020817,#0f172a)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Segoe UI, system-ui, sans-serif",direction:dir,padding:"20px"}}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes shine{0%{background-position:200% center}100%{background-position:-200% center}}@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,212,255,0.2)}70%{box-shadow:0 0 0 14px rgba(0,212,255,0)}}input,button{outline:none;font-family:inherit}.gbtn:hover{background:rgba(0,212,255,0.13)!important;border-color:rgba(0,212,255,0.5)!important;color:#00D4FF!important;transform:translateY(-2px)}`}</style>
      <div style={{width:400,animation:"fadeIn 0.4s ease"}}>
        {/* Language switcher */}
        <div style={{display:"flex",justifyContent:"flex-end",direction:"ltr",marginBottom:12}}>
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
          {authScreen==="signup"&&(
            <div style={{marginBottom:11}}>
              <label style={{color:"#475569",fontSize:11,fontWeight:600,display:"block",marginBottom:5}}>{t("username")}</label>
              <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="K8s Hero"
                style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:8,color:"#e2e8f0",fontSize:13,boxSizing:"border-box"}}/>
            </div>
          )}
          <div style={{marginBottom:11}}>
            <label style={{color:"#475569",fontSize:11,fontWeight:600,display:"block",marginBottom:5}}>{t("email")}</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"
              style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:8,color:"#e2e8f0",fontSize:13,boxSizing:"border-box",direction:"ltr"}}/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{color:"#475569",fontSize:11,fontWeight:600,display:"block",marginBottom:5}}>{t("password")}</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
              onKeyDown={e=>e.key==="Enter"&&(authScreen==="login"?handleLogin():handleSignUp())}
              style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:8,color:"#e2e8f0",fontSize:13,boxSizing:"border-box",direction:"ltr"}}/>
          </div>
          {authError&&<div style={{marginBottom:12}}>
            <div style={{color:authError.startsWith("✅")?"#10B981":"#EF4444",fontSize:12,padding:"8px 12px",background:authError.startsWith("✅")?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.08)",borderRadius:8}}>{authError}</div>
            {authScreen==="signup"&&authError.startsWith("✅")&&<div style={{textAlign:"center",marginTop:8,fontSize:12,color:"#475569"}}>
              {t("didntReceive")}{" "}
              <button onClick={handleResend} disabled={authLoading}
                style={{background:"none",border:"none",color:"#00D4FF",fontWeight:700,cursor:"pointer",fontSize:12,padding:0,textDecoration:"underline"}}>
                {t("resendBtn")}
              </button>
            </div>}
          </div>}
          <button onClick={authScreen==="login"?handleLogin:handleSignUp} disabled={authLoading}
            style={{width:"100%",padding:"11px",background:"linear-gradient(135deg,#00D4FF88,#A855F788)",border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",opacity:authLoading?0.7:1}}>
            {authLoading?t("loading"):authScreen==="login"?t("loginBtn"):t("signupBtn")}
          </button>
        </div>
        <p style={{textAlign:"center",color:"#475569",fontSize:11,marginTop:22}}>
          © {year} {t("allRightsReserved")}{" "}
          <a href="https://www.linkedin.com/in/orcarmeli/" target="_blank" rel="noopener noreferrer" style={{color:"#0ea5e9",textDecoration:"none",fontWeight:600}}>Or Carmeli</a>
        </p>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#020817 0%,#0f172a 60%,#020817 100%)",fontFamily:"Segoe UI, system-ui, sans-serif",direction:dir,position:"relative"}}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes shine{0%{background-position:200% center}100%{background-position:-200% center}}@keyframes toast{from{opacity:0;transform:translateX(-50%) translateY(-12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}@keyframes correctFlash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}@keyframes popIn{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}@keyframes confettiFall{from{top:-20px;transform:rotate(0deg);opacity:1}to{top:100vh;transform:rotate(720deg);opacity:0}}.card-hover{transition:transform 0.2s;cursor:pointer}.card-hover:hover{transform:translateY(-3px)}.opt-btn{transition:all 0.15s;cursor:pointer}.opt-btn:hover{transform:translateX(-2px)}input,button{outline:none;font-family:inherit}@media(max-width:520px){.stats-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(0,212,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.02) 1px,transparent 1px)",backgroundSize:"48px 48px"}}/>
      {flash&&<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:800,background:"radial-gradient(circle at 50% 45%,rgba(16,185,129,0.14) 0%,transparent 60%)",animation:"correctFlash 0.6s ease forwards"}}/>}
      {showConfetti&&<Confetti/>}
      {newAchievement&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#1e293b,#0f172a)",border:"1px solid #00D4FF55",borderRadius:14,padding:"12px 22px",display:"flex",alignItems:"center",gap:12,zIndex:9999,boxShadow:"0 0 40px rgba(0,212,255,0.3)",animation:"toast 0.4s ease",direction:"ltr"}}><span style={{fontSize:26}}>{newAchievement.icon}</span><div><div style={{color:"#00D4FF",fontWeight:800,fontSize:11,letterSpacing:1}}>{t("newAchievement")}</div><div style={{color:"#e2e8f0",fontSize:14,fontWeight:700}}>{lang==="en"?newAchievement.nameEn:newAchievement.name}</div></div></div>}
      {saveError&&<div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:"rgba(239,68,68,0.12)",border:"1px solid #EF444455",borderRadius:10,padding:"10px 18px",color:"#EF4444",fontSize:13,zIndex:9999}}>{saveError}</div>}

      {showLeaderboard&&<div onClick={()=>setShowLeaderboard(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:5000,display:"flex",alignItems:"center",justifyContent:"center"}}><div onClick={e=>e.stopPropagation()} style={{background:"#0f172a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,padding:28,width:340,animation:"fadeIn 0.3s ease",direction:"ltr"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}><h3 style={{margin:0,color:"#e2e8f0",fontSize:18,fontWeight:800}}>{t("leaderboardTitle")}</h3><button onClick={()=>setShowLeaderboard(false)} style={{background:"none",border:"none",color:"#64748b",fontSize:18,cursor:"pointer"}}>✕</button></div>{leaderboard.length===0?<div style={{color:"#475569",textAlign:"center",padding:"20px 0"}}>{t("noData")}</div>:leaderboard.map((entry,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:i===0?"rgba(245,158,11,0.1)":"rgba(255,255,255,0.03)",borderRadius:10,marginBottom:8,border:`1px solid ${i===0?"#F59E0B44":"rgba(255,255,255,0.06)"}`}}><span style={{fontSize:18,width:28}}>{["🥇","🥈","🥉"][i]||`${i+1}.`}</span><div style={{flex:1}}><div style={{color:"#e2e8f0",fontWeight:700,fontSize:14}}>{entry.username||t("anonymous")}</div><div style={{color:"#475569",fontSize:11}}>🔥 {entry.max_streak}</div></div><div style={{color:"#00D4FF",fontWeight:800,fontSize:16}}>{entry.total_score}</div></div>)}</div></div>}

      {/* HOME */}
      {screen==="home"&&(
        <div style={{maxWidth:700,margin:"0 auto",padding:"28px 20px",animation:"fadeIn 0.4s ease"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
            <div>
              <h1 style={{fontSize:28,fontWeight:900,margin:"0 0 2px",background:"linear-gradient(90deg,#00D4FF,#A855F7,#FF6B35,#00D4FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundSize:"300% auto",animation:"shine 5s linear infinite"}}>☸️ K8s Quest</h1>
              <p style={{color:"#475569",fontSize:13,margin:0}}>{t("greeting")}, {displayName}! 👋 {isGuest&&<span style={{color:"#475569"}}>{t("playingAsGuest")}</span>}</p>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <LangSwitcher lang={lang} setLang={setLang}/>
              {!isGuest&&<button onClick={()=>{loadLeaderboard();setShowLeaderboard(true);}} style={{padding:"8px 14px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:8,color:"#94a3b8",cursor:"pointer",fontSize:13}}>{t("leaderboardBtn")}</button>}
              <button onClick={handleResetProgress} style={{padding:"8px 14px",background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:8,color:"#EF4444",cursor:"pointer",fontSize:13}}>{t("resetProgress")}</button>
              <button onClick={handleLogout} style={{padding:"8px 14px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:8,color:"#94a3b8",cursor:"pointer",fontSize:13}}>{t("logout")}</button>
            </div>
          </div>
          {isGuest&&<div style={{background:"rgba(0,212,255,0.05)",border:"1px solid rgba(0,212,255,0.15)",borderRadius:12,padding:"11px 16px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}><span style={{color:"#4a9aba",fontSize:13}}>{t("guestBanner")}</span><button onClick={()=>setUser(null)} style={{padding:"6px 14px",background:"rgba(0,212,255,0.12)",border:"1px solid rgba(0,212,255,0.3)",borderRadius:8,color:"#00D4FF",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>{t("signupNow")}</button></div>}
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
                <div style={{fontSize:11,color:"#475569"}}>{s.label}</div>
              </div>
            ))}
          </div>
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
              <div key={topic.id} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"16px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                  <div style={{fontSize:24,width:44,height:44,borderRadius:10,background:`${topic.color}14`,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${topic.color}22`,flexShrink:0}}>{topic.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,color:"#e2e8f0",fontSize:15}}>{topic.name}</div>
                    <div style={{color:"#475569",fontSize:12}}>{lang==="en"?topic.descriptionEn:topic.description}</div>
                  </div>
                  {(()=>{const done=LEVEL_ORDER.filter(lvl=>completedTopics[`${topic.id}_${lvl}`]).length;return done>0&&<div style={{fontSize:11,color:topic.color,fontWeight:700,whiteSpace:"nowrap"}}>{done}/3</div>})()}
                </div>
                {(()=>{const done=LEVEL_ORDER.filter(lvl=>completedTopics[`${topic.id}_${lvl}`]).length;return(<div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,marginBottom:10}}><div style={{height:"100%",borderRadius:2,width:`${(done/3)*100}%`,background:`linear-gradient(90deg,${topic.color},${topic.color}88)`,transition:"width 0.5s ease"}}/></div>);})()}
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {Object.entries(LEVEL_CONFIG).map(([lvl,cfg])=>{
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
          <Footer lang={lang}/>
        </div>
      )}

      {/* TOPIC */}
      {screen==="topic"&&selectedTopic&&selectedLevel&&(
        <div style={{maxWidth:660,margin:"0 auto",padding:"28px 20px",animation:"fadeIn 0.3s ease"}}>
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
                <button onClick={()=>{setTopicScreen("quiz");if(timerEnabled)setTimeLeft(TIMER_SECONDS);}} style={{flex:3,padding:15,background:`linear-gradient(135deg,${selectedTopic.color}dd,${selectedTopic.color}77)`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",boxShadow:`0 6px 24px ${selectedTopic.color}44`}}>
                  {t("startQuiz")} (+{LEVEL_CONFIG[selectedLevel].points} {t("ptsPerQ")})
                </button>
                <button onClick={()=>{setTopicScreen("quiz");if(timerEnabled)setTimeLeft(TIMER_SECONDS);}} style={{flex:1,padding:15,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:12,color:"#94a3b8",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                  {t("skipTheory")}
                </button>
              </div>
              <div style={{display:"flex",justifyContent:"center",marginTop:10}}>
                <button onClick={()=>setTimerEnabled(p=>!p)} style={{background:"none",border:"none",color:timerEnabled?"#F59E0B":"#475569",fontSize:12,cursor:"pointer",fontWeight:timerEnabled?700:400}}>
                  {timerEnabled?t("timerOn"):t("timerOff")}
                </button>
              </div>
            </div>
          ):(
            <div>
              <div style={{marginBottom:18}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <button onClick={()=>setScreen("home")} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",color:"#64748b",padding:"4px 10px",borderRadius:7,cursor:"pointer",fontSize:12}}>{t("back")}</button>
                    <span style={{color:"#475569",fontSize:12}}>{t("question")} {questionIndex+1} {t("of")} {currentQuestions.length}</span>
                  </div>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    {timerEnabled&&<span style={{color:timeLeft<=10?"#EF4444":"#F59E0B",fontSize:13,fontWeight:800,minWidth:28,textAlign:"center",direction:"ltr"}}>⏱ {timeLeft}</span>}
                    <button onClick={()=>setTimerEnabled(p=>!p)} style={{background:"none",border:"none",color:timerEnabled?"#F59E0B":"#475569",fontSize:12,cursor:"pointer",fontWeight:timerEnabled?700:400,padding:0}}>
                      {timerEnabled?t("timerOn"):t("timerOff")}
                    </button>
                    <span style={{color:stats.current_streak>0?"#FF6B35":"#475569",fontSize:12,fontWeight:700}}>
                      🔥 {stats.current_streak} {t("streakLabel")}
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
                <div dir={dir} style={{color:"#e2e8f0",fontSize:16,fontWeight:700,lineHeight:1.65}}>{currentQuestions[questionIndex].q}</div>
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
                      style={{width:"100%",textAlign:dir==="rtl"?"right":"left",padding:"13px 16px",background:bg,border:`1px solid ${borderColor}`,borderRadius:10,color,fontSize:14,cursor:submitted?"default":"pointer",lineHeight:1.5,display:"flex",alignItems:"center",gap:10,transition:"all 0.15s"}}>
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
                  style={{width:"100%",padding:"13px",background:`linear-gradient(135deg,${selectedTopic.color}dd,${selectedTopic.color}77)`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",marginBottom:10,boxShadow:`0 4px 16px ${selectedTopic.color}44`}}>
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
                        <div style={{color:"#94a3b8",fontSize:13,lineHeight:1.7}}>{q.explanation}</div>
                      </div>
                    );
                  })()}
                  <button onClick={nextQuestion} style={{width:"100%",padding:14,background:`linear-gradient(135deg,${selectedTopic.color}cc,${selectedTopic.color}77)`,border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer"}}>
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
          <div style={{maxWidth:480,margin:"60px auto",padding:"0 20px",textAlign:"center",animation:"fadeIn 0.5s ease"}}>
            <div style={{fontSize:70,marginBottom:14,animation:"popIn 1s ease"}}>
              {allCorrect?"🌟":anyCorrect?"👍":"💪"}
            </div>
            <h2 style={{fontSize:26,fontWeight:900,margin:"0 0 8px",color:selectedTopic.color}}>{selectedTopic.name} – {lang==="en"?LEVEL_CONFIG[selectedLevel].labelEn:LEVEL_CONFIG[selectedLevel].label}</h2>
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
              <button onClick={()=>selectedTopic.id==="mixed"?startMixedQuiz():startTopic(selectedTopic,selectedLevel)} style={{padding:13,background:`${selectedTopic.color}18`,border:`1px solid ${selectedTopic.color}40`,borderRadius:12,color:selectedTopic.color,fontSize:14,fontWeight:700,cursor:"pointer"}}>{t("tryAgain")}</button>
              <button onClick={()=>setScreen("home")} style={{padding:13,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:12,color:"#e2e8f0",fontSize:14,fontWeight:700,cursor:"pointer"}}>{t("backToTopics")}</button>
            </div>
            {showReview&&quizHistory.length>0&&(
              <div style={{marginTop:20,textAlign:dir==="rtl"?"right":"left",animation:"fadeIn 0.3s ease"}}>
                <div style={{color:"#94a3b8",fontSize:11,fontWeight:700,marginBottom:12,letterSpacing:1}}>{t("reviewTitle")}</div>
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
                        {timedOut?<div style={{fontSize:12,color:"#F59E0B"}}>{t("timeUp")}</div>:(
                          <div style={{fontSize:12,color:wasCorrect?"#10B981":"#EF4444",marginBottom:4}}>
                            {lang==="en"?t("optionLabels")[h.chosen]:t("optionLabels")[h.chosen]}. {h.options[h.chosen]}
                          </div>
                        )}
                        {!wasCorrect&&<div style={{fontSize:12,color:"#10B981"}}>✓ {h.options[h.answer]}</div>}
                        <div style={{fontSize:11,color:"#64748b",marginTop:4,lineHeight:1.5}}>{h.explanation}</div>
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
