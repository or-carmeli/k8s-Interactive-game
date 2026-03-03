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
};

const ACHIEVEMENTS = [
  { id: "first",    icon: "🌱", name: "ראשית הדרך",   nameEn: "First Steps",     condition: (s) => s.total_answered >= 1 },
  { id: "streak3",  icon: "🔥", name: "שלושה ברצף",   nameEn: "Three in a Row",  condition: (s) => s.max_streak >= 3 },
  { id: "score100", icon: "💯", name: "100 נקודות",    nameEn: "100 Points",      condition: (s) => s.total_score >= 100 },
  { id: "allEasy",  icon: "⭐", name: "כל הנושאים קל", nameEn: "All Topics Easy", condition: (s, c) => Object.keys(c).filter(k => k.endsWith("_easy")).length >= 5 },
  { id: "master",   icon: "🏆", name: "מאסטר K8s",     nameEn: "K8s Master",      condition: (s, c) => Object.keys(c).filter(k => k.endsWith("_hard")).length >= 5 },
];

const TOPICS = [
  { id:"pods", icon:"📦", name:"Pods", color:"#00D4FF",
    description:"יחידת הריצה הבסיסית", descriptionEn:"The basic unit of execution",
    levels:{
      easy:{
        theory:`Pod הוא האובייקט הקטן ביותר ב-Kubernetes.\n🔹 מכיל קונטיינר אחד או יותר\n🔹 כל הקונטיינרים חולקים IP\n🔹 Pods הם זמניים – הם נולדים ומתים\nCODE:\napiVersion: v1\nkind: Pod\nmetadata:\n  name: my-app\nspec:\n  containers:\n  - name: web\n    image: nginx:latest`,
        theoryEn:`A Pod is the smallest object in Kubernetes.\n🔹 Contains one or more containers\n🔹 All containers share an IP address\n🔹 Pods are ephemeral – they are born and die\nCODE:\napiVersion: v1\nkind: Pod\nmetadata:\n  name: my-app\nspec:\n  containers:\n  - name: web\n    image: nginx:latest`,
        questions:[
          {q:"מה הוא Pod ב-Kubernetes?",options:["מסד נתונים","יחידת הריצה הקטנה ביותר","כלי ניהול","רשת וירטואלית"],answer:1,explanation:"Pod הוא יחידת הריצה הבסיסית. מכיל קונטיינר אחד או יותר."},
          {q:"האם קונטיינרים באותו Pod חולקים IP?",options:["לא","כן","לפעמים","תלוי בגרסה"],answer:1,explanation:"כל הקונטיינרים ב-Pod חולקים את אותה כתובת IP ויכולים לתקשר דרך localhost."},
        ],
        questionsEn:[
          {q:"What is a Pod in Kubernetes?",options:["A database","The smallest unit of execution","A management tool","A virtual network"],answer:1,explanation:"A Pod is the basic unit of execution. It contains one or more containers."},
          {q:"Do containers in the same Pod share an IP address?",options:["No","Yes","Sometimes","Depends on version"],answer:1,explanation:"All containers in a Pod share the same IP address and can communicate via localhost."},
        ],
      },
      medium:{
        theory:`Pods מתנהלים במחזור חיים מוגדר.\n🔹 Pending → Running → Succeeded/Failed\n🔹 Pod שמת לא חוזר – נוצר Pod חדש\n🔹 כל Pod מקבל IP חדש בכל יצירה\nCODE:\nkubectl get pods\nkubectl describe pod my-app\nkubectl logs my-app\nkubectl delete pod my-app`,
        theoryEn:`Pods operate in a defined lifecycle.\n🔹 Pending → Running → Succeeded/Failed\n🔹 A dead Pod does not return – a new Pod is created\n🔹 Each Pod gets a new IP on every creation\nCODE:\nkubectl get pods\nkubectl describe pod my-app\nkubectl logs my-app\nkubectl delete pod my-app`,
        questions:[
          {q:"מה קורה כש-Pod מת?",options:["הוא מתאושש לבד","נשמרים הנתונים","Kubernetes יוצר Pod חדש","המערכת קורסת"],answer:2,explanation:"Pods אפמריאלים – כשמתים, Kubernetes יוצר חדש עם IP חדש."},
          {q:"מה הפקודה לראות לוגים של Pod?",options:["kubectl show pod","kubectl logs my-app","kubectl debug pod","kubectl inspect my-app"],answer:1,explanation:"kubectl logs [pod-name] מציג את הלוגים של הקונטיינר ב-Pod."},
        ],
        questionsEn:[
          {q:"What happens when a Pod dies?",options:["It recovers on its own","Data is preserved","Kubernetes creates a new Pod","The system crashes"],answer:2,explanation:"Pods are ephemeral – when they die, Kubernetes creates a new one with a new IP."},
          {q:"What command shows Pod logs?",options:["kubectl show pod","kubectl logs my-app","kubectl debug pod","kubectl inspect my-app"],answer:1,explanation:"kubectl logs [pod-name] displays the logs of the container in the Pod."},
        ],
      },
      hard:{
        theory:`Pod Lifecycle ומתי Pods נכשלים.\n🔹 CrashLoopBackOff – קונטיינר קורס שוב ושוב\n🔹 ImagePullBackOff – לא ניתן להוריד image\n🔹 OOMKilled – חרגנו ממגבלת הזיכרון\nCODE:\nkubectl describe pod my-app\nrestartPolicy: Always\n# Never / OnFailure`,
        theoryEn:`Pod Lifecycle and when Pods fail.\n🔹 CrashLoopBackOff – container crashes repeatedly\n🔹 ImagePullBackOff – cannot pull the image\n🔹 OOMKilled – exceeded memory limit\nCODE:\nkubectl describe pod my-app\nrestartPolicy: Always\n# Never / OnFailure`,
        questions:[
          {q:"מה משמעות CrashLoopBackOff?",options:["הPod הושהה","הקונטיינר קורס שוב ושוב","הרשת נכשלה","אין מספיק זיכרון"],answer:1,explanation:"CrashLoopBackOff אומר שהקונטיינר מנסה לעלות, קורס, ומנסה שוב – בלופ."},
          {q:"מה זה Init Container?",options:["קונטיינר ראשי","קונטיינר שרץ לפני הקונטיינרים הרגילים","קונטיינר לבדיקות","קונטיינר לbackup"],answer:1,explanation:"Init Containers רצים לפני הקונטיינרים הרגילים ומשמשים לאתחול."},
        ],
        questionsEn:[
          {q:"What does CrashLoopBackOff mean?",options:["Pod is paused","Container crashes repeatedly","Network failed","Not enough memory"],answer:1,explanation:"CrashLoopBackOff means the container tries to start, crashes, and tries again – in a loop."},
          {q:"What is an Init Container?",options:["Main container","Container that runs before regular containers","Testing container","Backup container"],answer:1,explanation:"Init Containers run before regular containers and are used for initialization."},
        ],
      },
    }
  },
  { id:"deployments", icon:"🚀", name:"Deployments", color:"#FF6B35",
    description:"ניהול פריסה ועדכון", descriptionEn:"Deployment and update management",
    levels:{
      easy:{
        theory:`Deployment מנהל קבוצת Pods זהים.\n🔹 מגדיר כמה replicas לרוץ\n🔹 מבטיח שהמספר הרצוי תמיד רץ\n🔹 מאפשר rolling updates ללא downtime\nCODE:\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: my-app`,
        theoryEn:`A Deployment manages a group of identical Pods.\n🔹 Defines how many replicas to run\n🔹 Ensures the desired count is always running\n🔹 Enables rolling updates without downtime\nCODE:\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: my-app`,
        questions:[
          {q:"מה Deployment עושה?",options:["מנהל רשת","מנהל קבוצת Pods זהים","מנהל סיסמות","מנהל לוגים"],answer:1,explanation:"Deployment מנהל את מחזור חיי ה-Pods ומבטיח שמספר הרצוי רץ תמיד."},
          {q:"מה זה replicas?",options:["גיבויים","עותקים זהים של ה-Pod","גרסאות ישנות","קבצי לוג"],answer:1,explanation:"Replicas הם עותקים זהים של ה-Pod שרצים במקביל לזמינות גבוהה."},
        ],
        questionsEn:[
          {q:"What does a Deployment do?",options:["Manages networking","Manages a group of identical Pods","Manages passwords","Manages logs"],answer:1,explanation:"A Deployment manages the lifecycle of Pods and ensures the desired count is always running."},
          {q:"What are replicas?",options:["Backups","Identical copies of the Pod","Old versions","Log files"],answer:1,explanation:"Replicas are identical copies of the Pod running in parallel for high availability."},
        ],
      },
      medium:{
        theory:`Rolling Updates ו-Rollback.\n🔹 Rolling Update מעדכן Pod אחד בכל פעם\n🔹 Zero downtime – תמיד יש Pods זמינים\n🔹 ניתן לבצע Rollback לגרסה קודמת\nCODE:\nkubectl set image deployment/my-app web=my-app:v2\nkubectl rollout status deployment/my-app\nkubectl rollout undo deployment/my-app`,
        theoryEn:`Rolling Updates and Rollback.\n🔹 Rolling Update updates one Pod at a time\n🔹 Zero downtime – Pods are always available\n🔹 Can rollback to a previous version\nCODE:\nkubectl set image deployment/my-app web=my-app:v2\nkubectl rollout status deployment/my-app\nkubectl rollout undo deployment/my-app`,
        questions:[
          {q:"מה היתרון של Rolling Update?",options:["מהיר יותר","Zero downtime בזמן עדכון","חוסך כסף","מגן מפני פריצות"],answer:1,explanation:"Rolling Update מעדכן Pod אחד בכל פעם, כך שתמיד יש Pods זמינים."},
          {q:"כיצד מבצעים rollback?",options:["kubectl delete deployment","kubectl rollout undo deployment/my-app","kubectl restart","kubectl revert"],answer:1,explanation:"kubectl rollout undo מחזיר את ה-Deployment לגרסה הקודמת."},
        ],
        questionsEn:[
          {q:"What is the advantage of a Rolling Update?",options:["Faster","Zero downtime during update","Saves money","Prevents intrusions"],answer:1,explanation:"Rolling Update updates one Pod at a time, so Pods are always available."},
          {q:"How do you perform a rollback?",options:["kubectl delete deployment","kubectl rollout undo deployment/my-app","kubectl restart","kubectl revert"],answer:1,explanation:"kubectl rollout undo returns the Deployment to the previous version."},
        ],
      },
      hard:{
        theory:`Deployment Strategies מתקדמות.\n🔹 RollingUpdate – ברירת מחדל, מדורג\n🔹 Recreate – מוחק הכל ואז יוצר מחדש\n🔹 maxSurge – כמה Pods נוספים בזמן update\n🔹 maxUnavailable – כמה Pods יכולים לרדת\nCODE:\nstrategy:\n  type: RollingUpdate\n  rollingUpdate:\n    maxSurge: 1\n    maxUnavailable: 0`,
        theoryEn:`Advanced Deployment Strategies.\n🔹 RollingUpdate – default, gradual\n🔹 Recreate – delete all then recreate\n🔹 maxSurge – extra Pods during update\n🔹 maxUnavailable – how many Pods can go down\nCODE:\nstrategy:\n  type: RollingUpdate\n  rollingUpdate:\n    maxSurge: 1\n    maxUnavailable: 0`,
        questions:[
          {q:"מה עושה maxUnavailable: 0?",options:["מונע כל עדכון","מבטיח שאף Pod לא ירד בזמן update","מגביל replicas","מבטל HPA"],answer:1,explanation:"maxUnavailable: 0 מבטיח שבזמן Rolling Update תמיד כל ה-Pods זמינים."},
          {q:"מה זה HPA?",options:["High Performance App","Horizontal Pod Autoscaler","Host Port Assignment","Helm Package Archive"],answer:1,explanation:"HPA מגדיל/מקטין את מספר ה-Pods אוטומטית לפי עומס CPU/Memory."},
        ],
        questionsEn:[
          {q:"What does maxUnavailable: 0 do?",options:["Prevents all updates","Ensures no Pod goes down during update","Limits replicas","Cancels HPA"],answer:1,explanation:"maxUnavailable: 0 ensures that during a Rolling Update all Pods are always available."},
          {q:"What is HPA?",options:["High Performance App","Horizontal Pod Autoscaler","Host Port Assignment","Helm Package Archive"],answer:1,explanation:"HPA automatically scales the number of Pods based on CPU/Memory load."},
        ],
      },
    }
  },
  { id:"services", icon:"🌐", name:"Services", color:"#A855F7",
    description:"רשת יציבה לגישה ל-Pods", descriptionEn:"Stable network for accessing Pods",
    levels:{
      easy:{
        theory:`Service מספק כתובת IP יציבה לגישה ל-Pods.\n🔹 ClusterIP – גישה פנימית בלבד\n🔹 NodePort – חשיפה על port בכל node\n🔹 LoadBalancer – IP חיצוני ב-cloud\nCODE:\napiVersion: v1\nkind: Service\nmetadata:\n  name: my-service\nspec:\n  selector:\n    app: my-app\n  ports:\n  - port: 80\n    targetPort: 8080`,
        theoryEn:`A Service provides a stable IP address for accessing Pods.\n🔹 ClusterIP – internal access only\n🔹 NodePort – exposes on a port on each node\n🔹 LoadBalancer – external IP in the cloud\nCODE:\napiVersion: v1\nkind: Service\nmetadata:\n  name: my-service\nspec:\n  selector:\n    app: my-app\n  ports:\n  - port: 80\n    targetPort: 8080`,
        questions:[
          {q:"למה צריך Service?",options:["לחיסכון","IP של Pod משתנה, Service נותן IP יציב","לאבטחה","לגיבוי"],answer:1,explanation:"כשPod מת ונוצר מחדש, מקבל IP חדש. Service נותן כתובת קבועה."},
          {q:"איזה Service מתאים לגישה חיצונית ב-cloud?",options:["ClusterIP","NodePort","LoadBalancer","ExternalIP"],answer:2,explanation:"LoadBalancer יוצר אוטומטית Load Balancer ב-cloud ומקצה IP חיצוני."},
        ],
        questionsEn:[
          {q:"Why do we need a Service?",options:["To save money","Pod IP changes, Service gives a stable IP","For security","For backup"],answer:1,explanation:"When a Pod dies and is recreated, it gets a new IP. A Service provides a permanent address."},
          {q:"Which Service type is suitable for external access in the cloud?",options:["ClusterIP","NodePort","LoadBalancer","ExternalIP"],answer:2,explanation:"LoadBalancer automatically creates a Load Balancer in the cloud and assigns an external IP."},
        ],
      },
      medium:{
        theory:`Service Discovery ו-DNS.\n🔹 כל Service מקבל DNS name אוטומטי\n🔹 Format: service-name.namespace.svc.cluster.local\n🔹 Pods יכולים לגשת ל-Services לפי שם\nCODE:\ncurl http://my-service\ncurl http://my-service.default.svc.cluster.local\nkubectl get endpoints my-service`,
        theoryEn:`Service Discovery and DNS.\n🔹 Every Service gets an automatic DNS name\n🔹 Format: service-name.namespace.svc.cluster.local\n🔹 Pods can access Services by name\nCODE:\ncurl http://my-service\ncurl http://my-service.default.svc.cluster.local\nkubectl get endpoints my-service`,
        questions:[
          {q:"מה ה-DNS name של service בשם 'api' ב-namespace 'prod'?",options:["api.prod","api.prod.svc","api.prod.svc.cluster.local","prod.api.local"],answer:2,explanation:"Format: service.namespace.svc.cluster.local – זה ה-FQDN המלא של כל Service."},
          {q:"מה זה Endpoints ב-Kubernetes?",options:["כתובות IP של ה-Nodes","כתובות IP של ה-Pods שה-Service מנתב אליהם","פורטים חיצוניים","כתובות DNS"],answer:1,explanation:"Endpoints הם רשימת IPs של ה-Pods שה-Service מנתב אליהם, מתעדכן אוטומטית."},
        ],
        questionsEn:[
          {q:"What is the DNS name of service 'api' in namespace 'prod'?",options:["api.prod","api.prod.svc","api.prod.svc.cluster.local","prod.api.local"],answer:2,explanation:"Format: service.namespace.svc.cluster.local – this is the full FQDN of every Service."},
          {q:"What are Endpoints in Kubernetes?",options:["IP addresses of the Nodes","IP addresses of the Pods the Service routes to","External ports","DNS addresses"],answer:1,explanation:"Endpoints are the list of IPs of Pods that the Service routes to, updated automatically."},
        ],
      },
      hard:{
        theory:`Ingress – ניהול HTTP traffic.\n🔹 Ingress מנתב HTTP/HTTPS לפי path או hostname\n🔹 דורש Ingress Controller (nginx, traefik)\n🔹 חוסך LoadBalancers – כניסה אחת לכל ה-services\nCODE:\napiVersion: networking.k8s.io/v1\nkind: Ingress\nspec:\n  rules:\n  - host: app.example.com\n    http:\n      paths:\n      - path: /api\n        backend:\n          service:\n            name: api-service\n            port:\n              number: 80`,
        theoryEn:`Ingress – HTTP traffic management.\n🔹 Ingress routes HTTP/HTTPS by path or hostname\n🔹 Requires an Ingress Controller (nginx, traefik)\n🔹 Saves LoadBalancers – one entry point for all services\nCODE:\napiVersion: networking.k8s.io/v1\nkind: Ingress\nspec:\n  rules:\n  - host: app.example.com\n    http:\n      paths:\n      - path: /api\n        backend:\n          service:\n            name: api-service\n            port:\n              number: 80`,
        questions:[
          {q:"מה היתרון של Ingress על פני LoadBalancer?",options:["מהיר יותר","כניסה אחת לכל ה-services במקום LoadBalancer לכל service","זול יותר תמיד","יותר מאובטח"],answer:1,explanation:"Ingress מאפשר ניתוב חכם דרך כניסה אחת, חוסך LoadBalancers רבים."},
          {q:"מה זה Ingress Controller?",options:["Plugin של kubectl","ה-Pod שמממש את הIngress rules","שירות ענן","DNS server"],answer:1,explanation:"Ingress Controller (כמו nginx) הוא ה-Pod שקורא את ה-Ingress resources ומנתב traffic."},
        ],
        questionsEn:[
          {q:"What is the advantage of Ingress over LoadBalancer?",options:["Faster","One entry point for all services instead of a LoadBalancer per service","Always cheaper","More secure"],answer:1,explanation:"Ingress enables smart routing through one entry point, saving multiple LoadBalancers."},
          {q:"What is an Ingress Controller?",options:["A kubectl plugin","The Pod that implements the Ingress rules","A cloud service","A DNS server"],answer:1,explanation:"An Ingress Controller (like nginx) is the Pod that reads Ingress resources and routes traffic."},
        ],
      },
    }
  },
  { id:"configmaps", icon:"⚙️", name:"ConfigMaps & Secrets", color:"#F59E0B",
    description:"קונפיגורציה ומידע רגיש", descriptionEn:"Configuration and sensitive data",
    levels:{
      easy:{
        theory:`ConfigMap ו-Secret מפרידים קוד מקונפיגורציה.\n🔹 ConfigMap – הגדרות רגילות\n🔹 Secret – נתונים רגישים (מוצפן)\n🔹 שניהם ניתן לטעון כenv variables\nCODE:\napiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: app-config\ndata:\n  DB_URL: "postgres://db:5432"\n  MAX_CONN: "100"`,
        theoryEn:`ConfigMap and Secret separate code from configuration.\n🔹 ConfigMap – regular settings\n🔹 Secret – sensitive data (encrypted)\n🔹 Both can be loaded as env variables\nCODE:\napiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: app-config\ndata:\n  DB_URL: "postgres://db:5432"\n  MAX_CONN: "100"`,
        questions:[
          {q:"מה ההבדל בין ConfigMap ל-Secret?",options:["אין הבדל","Secret מוצפן לנתונים רגישים","ConfigMap יותר מהיר","Secret רק לpasswords"],answer:1,explanation:"Secret מוצפן ומיועד לנתונים רגישים. ConfigMap לקונפיגורציה רגילה."},
          {q:"כיצד משתמשים ב-ConfigMap ב-Pod?",options:["רק כקובץ","רק כenv","כenv variables או כvolume files","לא ניתן"],answer:2,explanation:"ConfigMap ניתן לטעון כenv variables, כvolume עם קבצים, או דרך API."},
        ],
        questionsEn:[
          {q:"What is the difference between ConfigMap and Secret?",options:["No difference","Secret is encrypted for sensitive data","ConfigMap is faster","Secret is only for passwords"],answer:1,explanation:"Secret is encrypted and intended for sensitive data. ConfigMap for regular configuration."},
          {q:"How is a ConfigMap used in a Pod?",options:["Only as a file","Only as env","As env variables or volume files","Not possible"],answer:2,explanation:"A ConfigMap can be loaded as env variables, as a volume with files, or via the API."},
        ],
      },
      medium:{
        theory:`שימוש מתקדם ב-Secrets.\n🔹 Secrets מקודדים ב-base64 (לא מוצפנים לחלוטין!)\n🔹 להצפנה אמיתית צריך Sealed Secrets או Vault\n🔹 imagePullSecrets – לגישה ל-private registries\nCODE:\nkubectl create secret generic db-secret \\\n  --from-literal=password=mypassword\nenv:\n- name: DB_PASSWORD\n  valueFrom:\n    secretKeyRef:\n      name: db-secret\n      key: password`,
        theoryEn:`Advanced use of Secrets.\n🔹 Secrets are base64 encoded (not fully encrypted!)\n🔹 For true encryption you need Sealed Secrets or Vault\n🔹 imagePullSecrets – for access to private registries\nCODE:\nkubectl create secret generic db-secret \\\n  --from-literal=password=mypassword\nenv:\n- name: DB_PASSWORD\n  valueFrom:\n    secretKeyRef:\n      name: db-secret\n      key: password`,
        questions:[
          {q:"האם Secrets מוצפנים לחלוטין ב-Kubernetes?",options:["כן, תמיד","לא, רק מקודדים ב-base64 כברירת מחדל","תלוי בגרסה","כן, עם AES-256"],answer:1,explanation:"Secrets מקודדים ב-base64 בלבד כברירת מחדל – לא מוצפנים! צריך Sealed Secrets לאבטחה אמיתית."},
          {q:"מה זה imagePullSecrets?",options:["Secret לDB","Secret לגישה ל-private container registry","Secret לTLS","Secret לSSH"],answer:1,explanation:"imagePullSecrets מאפשר ל-Kubernetes להוריד images מ-private registries כמו ECR או GCR."},
        ],
        questionsEn:[
          {q:"Are Secrets fully encrypted in Kubernetes?",options:["Yes, always","No, only base64 encoded by default","Depends on version","Yes, with AES-256"],answer:1,explanation:"Secrets are only base64 encoded by default – not encrypted! Sealed Secrets are needed for true security."},
          {q:"What is imagePullSecrets?",options:["Secret for DB","Secret for accessing a private container registry","Secret for TLS","Secret for SSH"],answer:1,explanation:"imagePullSecrets allows Kubernetes to pull images from private registries like ECR or GCR."},
        ],
      },
      hard:{
        theory:`External Secrets ו-Vault.\n🔹 External Secrets Operator – מסנכרן מ-AWS/GCP/Azure\n🔹 HashiCorp Vault – ניהול secrets מתקדם\n🔹 Encryption at Rest – הצפנת etcd\nCODE:\napiVersion: external-secrets.io/v1beta1\nkind: ExternalSecret\nspec:\n  secretStoreRef:\n    name: aws-secretsmanager\n  target:\n    name: my-k8s-secret\n  data:\n  - secretKey: password\n    remoteRef:\n      key: prod/db/password`,
        theoryEn:`External Secrets and Vault.\n🔹 External Secrets Operator – syncs from AWS/GCP/Azure\n🔹 HashiCorp Vault – advanced secrets management\n🔹 Encryption at Rest – encrypting etcd\nCODE:\napiVersion: external-secrets.io/v1beta1\nkind: ExternalSecret\nspec:\n  secretStoreRef:\n    name: aws-secretsmanager\n  target:\n    name: my-k8s-secret\n  data:\n  - secretKey: password\n    remoteRef:\n      key: prod/db/password`,
        questions:[
          {q:"מה עושה External Secrets Operator?",options:["מצפין secrets קיימים","מסנכרן secrets מ-cloud providers לK8s","מוחק secrets ישנים","מגבה secrets"],answer:1,explanation:"External Secrets Operator מסנכרן secrets מ-AWS Secrets Manager, GCP, Azure Key Vault לK8s."},
          {q:"מה זה Encryption at Rest?",options:["הצפנת תנועת רשת","הצפנת etcd database שמאחסן את ה-secrets","הצפנת קבצי log","הצפנת images"],answer:1,explanation:"Encryption at Rest מצפין את ה-etcd database שבו K8s שומר את כל ה-secrets."},
        ],
        questionsEn:[
          {q:"What does External Secrets Operator do?",options:["Encrypts existing secrets","Syncs secrets from cloud providers to K8s","Deletes old secrets","Backs up secrets"],answer:1,explanation:"External Secrets Operator syncs secrets from AWS Secrets Manager, GCP, Azure Key Vault to K8s."},
          {q:"What is Encryption at Rest?",options:["Encrypting network traffic","Encrypting the etcd database that stores secrets","Encrypting log files","Encrypting images"],answer:1,explanation:"Encryption at Rest encrypts the etcd database where K8s stores all secrets."},
        ],
      },
    }
  },
  { id:"namespaces", icon:"🏠", name:"Namespaces", color:"#10B981",
    description:"בידוד וארגון משאבים", descriptionEn:"Resource isolation and organization",
    levels:{
      easy:{
        theory:`Namespace הוא בידוד לוגי בתוך Cluster.\n🔹 כמו תיקיות לארגון משאבים\n🔹 הפרדה בין dev, staging, production\n🔹 ברירת מחדל: namespace 'default'\nCODE:\nkubectl create namespace production\nkubectl get pods -n production\nkubectl get pods --all-namespaces`,
        theoryEn:`A Namespace is a logical isolation within a Cluster.\n🔹 Like folders for organizing resources\n🔹 Separation between dev, staging, production\n🔹 Default: namespace 'default'\nCODE:\nkubectl create namespace production\nkubectl get pods -n production\nkubectl get pods --all-namespaces`,
        questions:[
          {q:"מה מטרת Namespace?",options:["אחסון קבצים","בידוד לוגי של משאבים","ניהול passwords","DNS גלובלי"],answer:1,explanation:"Namespaces מספקים בידוד לוגי – הפרדה בין צוותים, פרויקטים, או סביבות."},
          {q:"מה ה-Namespace ברירת המחדל?",options:["kube-system","production","default","main"],answer:2,explanation:"ה-Namespace 'default' הוא ברירת המחדל. kube-system הוא למשאבי המערכת."},
        ],
        questionsEn:[
          {q:"What is the purpose of a Namespace?",options:["File storage","Logical isolation of resources","Password management","Global DNS"],answer:1,explanation:"Namespaces provide logical isolation – separation between teams, projects, or environments."},
          {q:"What is the default Namespace?",options:["kube-system","production","default","main"],answer:2,explanation:"The 'default' Namespace is the default. kube-system is for system resources."},
        ],
      },
      medium:{
        theory:`ResourceQuota ו-LimitRange.\n🔹 ResourceQuota – מגביל משאבים לNamespace\n🔹 LimitRange – מגביל משאבים לPod/Container\n🔹 מניעת Namespace אחד מ"לאכול" את כל ה-Cluster\nCODE:\napiVersion: v1\nkind: ResourceQuota\nmetadata:\n  name: dev-quota\n  namespace: development\nspec:\n  hard:\n    requests.cpu: "4"\n    requests.memory: 4Gi\n    pods: "20"`,
        theoryEn:`ResourceQuota and LimitRange.\n🔹 ResourceQuota – limits resources per Namespace\n🔹 LimitRange – limits resources per Pod/Container\n🔹 Prevents one Namespace from consuming all Cluster resources\nCODE:\napiVersion: v1\nkind: ResourceQuota\nmetadata:\n  name: dev-quota\n  namespace: development\nspec:\n  hard:\n    requests.cpu: "4"\n    requests.memory: 4Gi\n    pods: "20"`,
        questions:[
          {q:"מה ResourceQuota עושה?",options:["מגבב resources","מגביל את סך המשאבים שNamespace יכול להשתמש","מנטר שימוש","מחלק resources שווה"],answer:1,explanation:"ResourceQuota מגביל את סך ה-CPU, Memory, Pods שNamespace יכול לצרוך."},
          {q:"מה ההבדל בין ResourceQuota ל-LimitRange?",options:["אין הבדל","Quota על Namespace, LimitRange על כל Pod/Container","Quota לCPU, LimitRange לMemory","Quota לproduction, LimitRange לdev"],answer:1,explanation:"ResourceQuota – מגביל את כל ה-Namespace. LimitRange – מגביל כל Pod/Container בתוכו."},
        ],
        questionsEn:[
          {q:"What does ResourceQuota do?",options:["Aggregates resources","Limits total resources a Namespace can use","Monitors usage","Distributes resources equally"],answer:1,explanation:"ResourceQuota limits the total CPU, Memory, and Pods a Namespace can consume."},
          {q:"What is the difference between ResourceQuota and LimitRange?",options:["No difference","Quota for Namespace, LimitRange for each Pod/Container","Quota for CPU, LimitRange for Memory","Quota for production, LimitRange for dev"],answer:1,explanation:"ResourceQuota – limits the entire Namespace. LimitRange – limits each Pod/Container within it."},
        ],
      },
      hard:{
        theory:`Network Policies – בידוד רשת.\n🔹 ברירת מחדל: כל Pod יכול לדבר עם כל Pod\n🔹 NetworkPolicy מגביל תנועה בין Pods\n🔹 דורש CNI plugin שתומך (Calico, Cilium)\nCODE:\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: deny-all\nspec:\n  podSelector: {}\n  policyTypes:\n  - Ingress\n  - Egress`,
        theoryEn:`Network Policies – network isolation.\n🔹 Default: every Pod can talk to every Pod\n🔹 NetworkPolicy restricts traffic between Pods\n🔹 Requires a supporting CNI plugin (Calico, Cilium)\nCODE:\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: deny-all\nspec:\n  podSelector: {}\n  policyTypes:\n  - Ingress\n  - Egress`,
        questions:[
          {q:"מה קורה ללא NetworkPolicy?",options:["כל תנועה חסומה","כל Pod יכול לדבר עם כל Pod","רק Pods באותו Namespace מדברים","רק HTTPS מותר"],answer:1,explanation:"ברירת מחדל ב-Kubernetes היא allow-all – כל Pod יכול לתקשר עם כל Pod בכל Namespace."},
          {q:"מה נדרש כדי ש-NetworkPolicy יעבוד?",options:["Kubernetes 1.28+","CNI plugin שתומך כמו Calico או Cilium","הפעלת firewall","cloud provider מיוחד"],answer:1,explanation:"NetworkPolicy דורש CNI plugin תומך. ה-CNI הדיפולטי (kubenet) לא מממש NetworkPolicies!"},
        ],
        questionsEn:[
          {q:"What happens without a NetworkPolicy?",options:["All traffic is blocked","Every Pod can talk to every Pod","Only Pods in the same Namespace communicate","Only HTTPS is allowed"],answer:1,explanation:"By default in Kubernetes it is allow-all – every Pod can communicate with every Pod in any Namespace."},
          {q:"What is required for NetworkPolicy to work?",options:["Kubernetes 1.28+","A supporting CNI plugin like Calico or Cilium","Enabling a firewall","A special cloud provider"],answer:1,explanation:"NetworkPolicy requires a supporting CNI plugin. The default CNI (kubenet) does not implement NetworkPolicies!"},
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
    loadingText: "טוען...",
    saveErrorText: "⚠️ הנתונים לא נשמרו – בדוק חיבור לאינטרנט",
    newAchievement: "הישג חדש!", allRightsReserved: "כל הזכויות שמורות ל",
    optionLabels: ["א","ב","ג","ד"], guestName: "אורח",
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
    loadingText: "Loading...",
    saveErrorText: "⚠️ Data not saved – check your internet connection",
    newAchievement: "New Achievement!", allRightsReserved: "All rights reserved to",
    optionLabels: ["A","B","C","D"], guestName: "Guest",
  },
};

const year = new Date().getFullYear();

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

  const isGuest = user?.id === "guest";
  const achievementsLoaded = useRef(false);

  const getLevelData = (topic, level) => ({
    theory: lang === "en" ? topic.levels[level].theoryEn : topic.levels[level].theory,
    questions: lang === "en" ? topic.levels[level].questionsEn : topic.levels[level].questions,
  });

  const currentLevelData = selectedTopic && selectedLevel ? getLevelData(selectedTopic, selectedLevel) : null;
  const currentQuestions = currentLevelData?.questions || [];

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
      if (session) { setUser(session.user); loadUserData(session.user.id); }
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) { setUser(session.user); loadUserData(session.user.id); }
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

  const loadUserData = async (userId) => {
    const { data } = await supabase.from("user_stats").select("*").eq("user_id", userId).single();
    if (data) {
      setStats(data);
      setCompletedTopics(data.completed_topics || {});
      setUnlockedAchievements(data.achievements || []);
    }
    achievementsLoaded.current = true;
  };

  const saveUserData = async (ns, nc, na) => {
    if (!user || isGuest) return;
    setSaveError("");
    const { error } = await supabase.from("user_stats").upsert({
      user_id: user.id,
      username: user.user_metadata?.username || email.split("@")[0],
      ...ns, completed_topics: nc, achievements: na,
      updated_at: new Date().toISOString(),
    });
    if (error) setSaveError(t("saveErrorText"));
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

  const handleSelectAnswer = (idx) => {
    if (submitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null || submitted) return;
    setSubmitted(true);
    setShowExplanation(true);
    const correct = selectedAnswer === currentQuestions[questionIndex].answer;
    if (correct) {
      topicCorrectRef.current += 1;
      setFlash(true); setTimeout(() => setFlash(false), 600);
    }
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
      saveUserData(newStats, newCompleted, newAch);
      setScreen("topicComplete");
    } else {
      setQuestionIndex(p => p + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
      setShowExplanation(false);
    }
  };

  const startTopic = (topic, level) => {
    const key = `${topic.id}_${level}`;
    isRetryRef.current = !!(completedTopics[key]);
    setSelectedTopic(topic); setSelectedLevel(level); setTopicScreen("theory");
    setQuestionIndex(0); setSelectedAnswer(null); setSubmitted(false);
    setShowExplanation(false);
    topicCorrectRef.current = 0;
    setScreen("topic");
    if (isGuest) achievementsLoaded.current = true;
  };

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
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes shine{0%{background-position:200% center}100%{background-position:-200% center}}@keyframes toast{from{opacity:0;transform:translateX(-50%) translateY(-12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}@keyframes correctFlash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}@keyframes popIn{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}.card-hover{transition:transform 0.2s;cursor:pointer}.card-hover:hover{transform:translateY(-3px)}.opt-btn{transition:all 0.15s;cursor:pointer}.opt-btn:hover{transform:translateX(-2px)}input,button{outline:none;font-family:inherit}`}</style>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(0,212,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.02) 1px,transparent 1px)",backgroundSize:"48px 48px"}}/>
      {flash&&<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:800,background:"radial-gradient(circle at 50% 45%,rgba(16,185,129,0.14) 0%,transparent 60%)",animation:"correctFlash 0.6s ease forwards"}}/>}
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
              <button onClick={handleLogout} style={{padding:"8px 14px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:8,color:"#94a3b8",cursor:"pointer",fontSize:13}}>{t("logout")}</button>
            </div>
          </div>
          {isGuest&&<div style={{background:"rgba(0,212,255,0.05)",border:"1px solid rgba(0,212,255,0.15)",borderRadius:12,padding:"11px 16px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}><span style={{color:"#4a9aba",fontSize:13}}>{t("guestBanner")}</span><button onClick={()=>setUser(null)} style={{padding:"6px 14px",background:"rgba(0,212,255,0.12)",border:"1px solid rgba(0,212,255,0.3)",borderRadius:8,color:"#00D4FF",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>{t("signupNow")}</button></div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:24}}>
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
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {TOPICS.map(topic=>(
              <div key={topic.id} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"16px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                  <div style={{fontSize:24,width:44,height:44,borderRadius:10,background:`${topic.color}14`,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${topic.color}22`,flexShrink:0}}>{topic.icon}</div>
                  <div><div style={{fontWeight:700,color:"#e2e8f0",fontSize:15}}>{topic.name}</div><div style={{color:"#475569",fontSize:12}}>{lang==="en"?topic.descriptionEn:topic.description}</div></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {Object.entries(LEVEL_CONFIG).map(([lvl,cfg])=>{
                    const key=`${topic.id}_${lvl}`;
                    const done=completedTopics[key];
                    return(
                      <div key={lvl} className="card-hover" onClick={()=>startTopic(topic,lvl)}
                        style={{padding:"10px 8px",background:done?`${cfg.color}12`:"rgba(255,255,255,0.03)",border:`1px solid ${done?cfg.color+"44":"rgba(255,255,255,0.07)"}`,borderRadius:10,textAlign:"center"}}>
                        <div style={{fontSize:16}}>{cfg.icon}</div>
                        <div style={{fontSize:12,fontWeight:700,color:done?cfg.color:"#64748b"}}>{lang==="en"?cfg.labelEn:cfg.label}</div>
                        {done&&<div style={{fontSize:10,color:done.correct>0?cfg.color:"#EF4444"}}>
                          {done.correct>0?"✓":""} {done.correct}/{done.total}
                        </div>}
                        <div style={{fontSize:10,color:"#475569"}}>+{cfg.points}{t("pts")}</div>
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
              <button onClick={()=>setTopicScreen("quiz")} style={{width:"100%",padding:15,background:`linear-gradient(135deg,${selectedTopic.color}dd,${selectedTopic.color}77)`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",boxShadow:`0 6px 24px ${selectedTopic.color}44`}}>
                {t("startQuiz")} (+{LEVEL_CONFIG[selectedLevel].points} {t("ptsPerQ")})
              </button>
            </div>
          ):(
            <div>
              <div style={{marginBottom:18}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{color:"#475569",fontSize:12}}>{t("question")} {questionIndex+1} {t("of")} {currentQuestions.length}</span>
                  <span style={{color:stats.current_streak>0?"#FF6B35":"#475569",fontSize:12,fontWeight:700}}>
                    🔥 {stats.current_streak} {t("streakLabel")}
                  </span>
                </div>
                <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:4}}>
                  <div style={{height:"100%",borderRadius:4,
                    width:`${((questionIndex+(submitted?1:0))/currentQuestions.length)*100}%`,
                    background:`linear-gradient(90deg,${selectedTopic.color},${selectedTopic.color}88)`,
                    transition:"width 0.4s ease"}}/>
                </div>
              </div>

              <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:22,marginBottom:14}}>
                <div style={{color:"#e2e8f0",fontSize:16,fontWeight:700,lineHeight:1.65}}>{currentQuestions[questionIndex].q}</div>
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
                      <span style={{flex:1}}>{opt}</span>
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
                  <div style={{background:selectedAnswer===currentQuestions[questionIndex].answer?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.08)",border:`1px solid ${selectedAnswer===currentQuestions[questionIndex].answer?"#10B98130":"#EF444430"}`,borderRadius:12,padding:"14px 16px",marginBottom:12}}>
                    <div style={{fontWeight:800,fontSize:13,marginBottom:6,color:selectedAnswer===currentQuestions[questionIndex].answer?"#10B981":"#EF4444"}}>
                      {selectedAnswer===currentQuestions[questionIndex].answer
                        ?`${t("correct")} +${LEVEL_CONFIG[selectedLevel].points} ${t("pts")}`
                        :t("incorrect")}
                    </div>
                    <div style={{color:"#94a3b8",fontSize:13,lineHeight:1.7}}>{currentQuestions[questionIndex].explanation}</div>
                  </div>
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
              <button onClick={()=>startTopic(selectedTopic,selectedLevel)} style={{padding:13,background:`${selectedTopic.color}18`,border:`1px solid ${selectedTopic.color}40`,borderRadius:12,color:selectedTopic.color,fontSize:14,fontWeight:700,cursor:"pointer"}}>{t("tryAgain")}</button>
              <button onClick={()=>setScreen("home")} style={{padding:13,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:12,color:"#e2e8f0",fontSize:14,fontWeight:700,cursor:"pointer"}}>{t("backToTopics")}</button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
