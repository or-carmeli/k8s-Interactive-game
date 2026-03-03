import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://knzawpdrpahilmohzpbl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuemF3cGRycGFoaWxtb2h6cGJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDA2NzYsImV4cCI6MjA4ODExNjY3Nn0.Vh4vwQkSgIHkyr3LPVAvsktni_l5q1DhP3S3MT97KQ8"
);

const TOPICS = [
  {
    id: "pods", icon: "📦", name: "Pods", color: "#00D4FF",
    description: "יחידת הריצה הבסיסית",
    levels: {
      easy: {
        theory: `Pod הוא האובייקט הקטן ביותר ב-Kubernetes.\n🔹 מכיל קונטיינר אחד או יותר\n🔹 כל הקונטיינרים חולקים IP\n🔹 Pods הם זמניים – הם נולדים ומתים\nCODE:\napiVersion: v1\nkind: Pod\nmetadata:\n  name: my-app\nspec:\n  containers:\n  - name: web\n    image: nginx:latest`,
        questions: [
          { q: "מה הוא Pod ב-Kubernetes?", options: ["מסד נתונים", "יחידת הריצה הקטנה ביותר", "כלי ניהול", "רשת וירטואלית"], answer: 1, explanation: "Pod הוא יחידת הריצה הבסיסית. מכיל קונטיינר אחד או יותר." },
          { q: "האם קונטיינרים באותו Pod חולקים IP?", options: ["לא", "כן", "לפעמים", "תלוי בגרסה"], answer: 1, explanation: "כל הקונטיינרים ב-Pod חולקים את אותה כתובת IP ויכולים לתקשר דרך localhost." },
        ]
      },
      medium: {
        theory: `Pods מתנהלים במחזור חיים מוגדר.\n🔹 Pending → Running → Succeeded/Failed\n🔹 Pod שמת לא חוזר – נוצר Pod חדש\n🔹 כל Pod מקבל IP חדש בכל יצירה\nCODE:\nkubectl get pods\nkubectl describe pod my-app\nkubectl logs my-app\nkubectl delete pod my-app`,
        questions: [
          { q: "מה קורה כש-Pod מת?", options: ["הוא מתאושש לבד", "נשמרים הנתונים", "Kubernetes יוצר Pod חדש", "המערכת קורסת"], answer: 2, explanation: "Pods אפמריאלים – כשמתים, Kubernetes יוצר חדש עם IP חדש." },
          { q: "מה הפקודה לראות לוגים של Pod?", options: ["kubectl show pod", "kubectl logs my-app", "kubectl debug pod", "kubectl inspect my-app"], answer: 1, explanation: "kubectl logs [pod-name] מציג את הלוגים של הקונטיינר ב-Pod." },
        ]
      },
      hard: {
        theory: `Pod Lifecycle ומתי Pods נכשלים.\n🔹 CrashLoopBackOff – קונטיינר קורס שוב ושוב\n🔹 ImagePullBackOff – לא ניתן להוריד image\n🔹 OOMKilled – חרגנו ממגבלת הזיכרון\nCODE:\nkubectl describe pod my-app\nrestartPolicy: Always\n# Never / OnFailure`,
        questions: [
          { q: "מה משמעות CrashLoopBackOff?", options: ["הPod הושהה", "הקונטיינר קורס שוב ושוב", "הרשת נכשלה", "אין מספיק זיכרון"], answer: 1, explanation: "CrashLoopBackOff אומר שהקונטיינר מנסה לעלות, קורס, ומנסה שוב – בלופ." },
          { q: "מה זה Init Container?", options: ["קונטיינר ראשי", "קונטיינר שרץ לפני הקונטיינרים הרגילים", "קונטיינר לבדיקות", "קונטיינר לbackup"], answer: 1, explanation: "Init Containers רצים לפני הקונטיינרים הרגילים ומשמשים לאתחול." },
        ]
      }
    }
  },
  {
    id: "deployments", icon: "🚀", name: "Deployments", color: "#FF6B35",
    description: "ניהול פריסה ועדכון",
    levels: {
      easy: {
        theory: `Deployment מנהל קבוצת Pods זהים.\n🔹 מגדיר כמה replicas לרוץ\n🔹 מבטיח שהמספר הרצוי תמיד רץ\n🔹 מאפשר rolling updates ללא downtime\nCODE:\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: my-app`,
        questions: [
          { q: "מה Deployment עושה?", options: ["מנהל רשת", "מנהל קבוצת Pods זהים", "מנהל סיסמות", "מנהל לוגים"], answer: 1, explanation: "Deployment מנהל את מחזור חיי ה-Pods ומבטיח שמספר הרצוי רץ תמיד." },
          { q: "מה זה replicas?", options: ["גיבויים", "עותקים זהים של ה-Pod", "גרסאות ישנות", "קבצי לוג"], answer: 1, explanation: "Replicas הם עותקים זהים של ה-Pod שרצים במקביל לזמינות גבוהה." },
        ]
      },
      medium: {
        theory: `Rolling Updates ו-Rollback.\n🔹 Rolling Update מעדכן Pod אחד בכל פעם\n🔹 Zero downtime – תמיד יש Pods זמינים\n🔹 ניתן לבצע Rollback לגרסה קודמת\nCODE:\nkubectl set image deployment/my-app web=my-app:v2\nkubectl rollout status deployment/my-app\nkubectl rollout undo deployment/my-app`,
        questions: [
          { q: "מה היתרון של Rolling Update?", options: ["מהיר יותר", "Zero downtime בזמן עדכון", "חוסך כסף", "מגן מפני פריצות"], answer: 1, explanation: "Rolling Update מעדכן Pod אחד בכל פעם, כך שתמיד יש Pods זמינים." },
          { q: "כיצד מבצעים rollback?", options: ["kubectl delete deployment", "kubectl rollout undo deployment/my-app", "kubectl restart", "kubectl revert"], answer: 1, explanation: "kubectl rollout undo מחזיר את ה-Deployment לגרסה הקודמת." },
        ]
      },
      hard: {
        theory: `Deployment Strategies מתקדמות.\n🔹 RollingUpdate – ברירת מחדל, מדורג\n🔹 Recreate – מוחק הכל ואז יוצר מחדש\n🔹 maxSurge – כמה Pods נוספים בזמן update\n🔹 maxUnavailable – כמה Pods יכולים לרדת\nCODE:\nstrategy:\n  type: RollingUpdate\n  rollingUpdate:\n    maxSurge: 1\n    maxUnavailable: 0`,
        questions: [
          { q: "מה עושה maxUnavailable: 0?", options: ["מונע כל עדכון", "מבטיח שאף Pod לא ירד בזמן update", "מגביל replicas", "מבטל HPA"], answer: 1, explanation: "maxUnavailable: 0 מבטיח שבזמן Rolling Update תמיד כל ה-Pods זמינים." },
          { q: "מה זה HPA?", options: ["High Performance App", "Horizontal Pod Autoscaler", "Host Port Assignment", "Helm Package Archive"], answer: 1, explanation: "HPA מגדיל/מקטין את מספר ה-Pods אוטומטית לפי עומס CPU/Memory." },
        ]
      }
    }
  },
  {
    id: "services", icon: "🌐", name: "Services", color: "#A855F7",
    description: "רשת יציבה לגישה ל-Pods",
    levels: {
      easy: {
        theory: `Service מספק כתובת IP יציבה לגישה ל-Pods.\n🔹 ClusterIP – גישה פנימית בלבד\n🔹 NodePort – חשיפה על port בכל node\n🔹 LoadBalancer – IP חיצוני ב-cloud\nCODE:\napiVersion: v1\nkind: Service\nmetadata:\n  name: my-service\nspec:\n  selector:\n    app: my-app\n  ports:\n  - port: 80\n    targetPort: 8080`,
        questions: [
          { q: "למה צריך Service?", options: ["לחיסכון", "IP של Pod משתנה, Service נותן IP יציב", "לאבטחה", "לגיבוי"], answer: 1, explanation: "כשPod מת ונוצר מחדש, מקבל IP חדש. Service נותן כתובת קבועה." },
          { q: "איזה Service מתאים לגישה חיצונית ב-cloud?", options: ["ClusterIP", "NodePort", "LoadBalancer", "ExternalIP"], answer: 2, explanation: "LoadBalancer יוצר אוטומטית Load Balancer ב-cloud ומקצה IP חיצוני." },
        ]
      },
      medium: {
        theory: `Service Discovery ו-DNS.\n🔹 כל Service מקבל DNS name אוטומטי\n🔹 Format: service-name.namespace.svc.cluster.local\n🔹 Pods יכולים לגשת ל-Services לפי שם\nCODE:\ncurl http://my-service\ncurl http://my-service.default.svc.cluster.local\nkubectl get endpoints my-service`,
        questions: [
          { q: "מה ה-DNS name של service בשם 'api' ב-namespace 'prod'?", options: ["api.prod", "api.prod.svc", "api.prod.svc.cluster.local", "prod.api.local"], answer: 2, explanation: "Format: service.namespace.svc.cluster.local – זה ה-FQDN המלא של כל Service." },
          { q: "מה זה Endpoints ב-Kubernetes?", options: ["כתובות IP של ה-Nodes", "כתובות IP של ה-Pods שה-Service מנתב אליהם", "פורטים חיצוניים", "כתובות DNS"], answer: 1, explanation: "Endpoints הם רשימת IPs של ה-Pods שה-Service מנתב אליהם, מתעדכן אוטומטית." },
        ]
      },
      hard: {
        theory: `Ingress – ניהול HTTP traffic.\n🔹 Ingress מנתב HTTP/HTTPS לפי path או hostname\n🔹 דורש Ingress Controller (nginx, traefik)\n🔹 חוסך LoadBalancers – כניסה אחת לכל ה-services\nCODE:\napiVersion: networking.k8s.io/v1\nkind: Ingress\nspec:\n  rules:\n  - host: app.example.com\n    http:\n      paths:\n      - path: /api\n        backend:\n          service:\n            name: api-service\n            port:\n              number: 80`,
        questions: [
          { q: "מה היתרון של Ingress על פני LoadBalancer?", options: ["מהיר יותר", "כניסה אחת לכל ה-services במקום LoadBalancer לכל service", "זול יותר תמיד", "יותר מאובטח"], answer: 1, explanation: "Ingress מאפשר ניתוב חכם דרך כניסה אחת, חוסך LoadBalancers רבים." },
          { q: "מה זה Ingress Controller?", options: ["Plugin של kubectl", "ה-Pod שמממש את הIngress rules", "שירות ענן", "DNS server"], answer: 1, explanation: "Ingress Controller (כמו nginx) הוא ה-Pod שקורא את ה-Ingress resources ומנתב traffic." },
        ]
      }
    }
  },
  {
    id: "configmaps", icon: "⚙️", name: "ConfigMaps & Secrets", color: "#F59E0B",
    description: "קונפיגורציה ומידע רגיש",
    levels: {
      easy: {
        theory: `ConfigMap ו-Secret מפרידים קוד מקונפיגורציה.\n🔹 ConfigMap – הגדרות רגילות\n🔹 Secret – נתונים רגישים (מוצפן)\n🔹 שניהם ניתן לטעון כenv variables\nCODE:\napiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: app-config\ndata:\n  DB_URL: "postgres://db:5432"\n  MAX_CONN: "100"`,
        questions: [
          { q: "מה ההבדל בין ConfigMap ל-Secret?", options: ["אין הבדל", "Secret מוצפן לנתונים רגישים", "ConfigMap יותר מהיר", "Secret רק לpasswords"], answer: 1, explanation: "Secret מוצפן ומיועד לנתונים רגישים. ConfigMap לקונפיגורציה רגילה." },
          { q: "כיצד משתמשים ב-ConfigMap ב-Pod?", options: ["רק כקובץ", "רק כenv", "כenv variables או כvolume files", "לא ניתן"], answer: 2, explanation: "ConfigMap ניתן לטעון כenv variables, כvolume עם קבצים, או דרך API." },
        ]
      },
      medium: {
        theory: `שימוש מתקדם ב-Secrets.\n🔹 Secrets מקודדים ב-base64 (לא מוצפנים לחלוטין!)\n🔹 להצפנה אמיתית צריך Sealed Secrets או Vault\n🔹 imagePullSecrets – לגישה ל-private registries\nCODE:\nkubectl create secret generic db-secret \\\n  --from-literal=password=mypassword\nenv:\n- name: DB_PASSWORD\n  valueFrom:\n    secretKeyRef:\n      name: db-secret\n      key: password`,
        questions: [
          { q: "האם Secrets מוצפנים לחלוטין ב-Kubernetes?", options: ["כן, תמיד", "לא, רק מקודדים ב-base64 כברירת מחדל", "תלוי בגרסה", "כן, עם AES-256"], answer: 1, explanation: "Secrets מקודדים ב-base64 בלבד כברירת מחדל – לא מוצפנים! צריך Sealed Secrets לאבטחה אמיתית." },
          { q: "מה זה imagePullSecrets?", options: ["Secret לDB", "Secret לגישה ל-private container registry", "Secret לTLS", "Secret לSSH"], answer: 1, explanation: "imagePullSecrets מאפשר ל-Kubernetes להוריד images מ-private registries כמו ECR או GCR." },
        ]
      },
      hard: {
        theory: `External Secrets ו-Vault.\n🔹 External Secrets Operator – מסנכרן מ-AWS/GCP/Azure\n🔹 HashiCorp Vault – ניהול secrets מתקדם\n🔹 Encryption at Rest – הצפנת etcd\nCODE:\napiVersion: external-secrets.io/v1beta1\nkind: ExternalSecret\nspec:\n  secretStoreRef:\n    name: aws-secretsmanager\n  target:\n    name: my-k8s-secret\n  data:\n  - secretKey: password\n    remoteRef:\n      key: prod/db/password`,
        questions: [
          { q: "מה עושה External Secrets Operator?", options: ["מצפין secrets קיימים", "מסנכרן secrets מ-cloud providers לK8s", "מוחק secrets ישנים", "מגבה secrets"], answer: 1, explanation: "External Secrets Operator מסנכרן secrets מ-AWS Secrets Manager, GCP, Azure Key Vault לK8s." },
          { q: "מה זה Encryption at Rest?", options: ["הצפנת תנועת רשת", "הצפנת etcd database שמאחסן את ה-secrets", "הצפנת קבצי log", "הצפנת images"], answer: 1, explanation: "Encryption at Rest מצפין את ה-etcd database שבו K8s שומר את כל ה-secrets." },
        ]
      }
    }
  },
  {
    id: "namespaces", icon: "🏠", name: "Namespaces", color: "#10B981",
    description: "בידוד וארגון משאבים",
    levels: {
      easy: {
        theory: `Namespace הוא בידוד לוגי בתוך Cluster.\n🔹 כמו תיקיות לארגון משאבים\n🔹 הפרדה בין dev, staging, production\n🔹 ברירת מחדל: namespace 'default'\nCODE:\nkubectl create namespace production\nkubectl get pods -n production\nkubectl get pods --all-namespaces`,
        questions: [
          { q: "מה מטרת Namespace?", options: ["אחסון קבצים", "בידוד לוגי של משאבים", "ניהול passwords", "DNS גלובלי"], answer: 1, explanation: "Namespaces מספקים בידוד לוגי – הפרדה בין צוותים, פרויקטים, או סביבות." },
          { q: "מה ה-Namespace ברירת המחדל?", options: ["kube-system", "production", "default", "main"], answer: 2, explanation: "ה-Namespace 'default' הוא ברירת המחדל. kube-system הוא למשאבי המערכת." },
        ]
      },
      medium: {
        theory: `ResourceQuota ו-LimitRange.\n🔹 ResourceQuota – מגביל משאבים לNamespace\n🔹 LimitRange – מגביל משאבים לPod/Container\n🔹 מניעת Namespace אחד מ"לאכול" את כל ה-Cluster\nCODE:\napiVersion: v1\nkind: ResourceQuota\nmetadata:\n  name: dev-quota\n  namespace: development\nspec:\n  hard:\n    requests.cpu: "4"\n    requests.memory: 4Gi\n    pods: "20"`,
        questions: [
          { q: "מה ResourceQuota עושה?", options: ["מגבב resources", "מגביל את סך המשאבים שNamespace יכול להשתמש", "מנטר שימוש", "מחלק resources שווה"], answer: 1, explanation: "ResourceQuota מגביל את סך ה-CPU, Memory, Pods שNamespace יכול לצרוך." },
          { q: "מה ההבדל בין ResourceQuota ל-LimitRange?", options: ["אין הבדל", "Quota על Namespace, LimitRange על כל Pod/Container", "Quota לCPU, LimitRange לMemory", "Quota לproduction, LimitRange לdev"], answer: 1, explanation: "ResourceQuota – מגביל את כל ה-Namespace. LimitRange – מגביל כל Pod/Container בתוכו." },
        ]
      },
      hard: {
        theory: `Network Policies – בידוד רשת.\n🔹 ברירת מחדל: כל Pod יכול לדבר עם כל Pod\n🔹 NetworkPolicy מגביל תנועה בין Pods\n🔹 דורש CNI plugin שתומך (Calico, Cilium)\nCODE:\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: deny-all\nspec:\n  podSelector: {}\n  policyTypes:\n  - Ingress\n  - Egress`,
        questions: [
          { q: "מה קורה ללא NetworkPolicy?", options: ["כל תנועה חסומה", "כל Pod יכול לדבר עם כל Pod", "רק Pods באותו Namespace מדברים", "רק HTTPS מותר"], answer: 1, explanation: "ברירת מחדל ב-Kubernetes היא allow-all – כל Pod יכול לתקשר עם כל Pod בכל Namespace." },
          { q: "מה נדרש כדי ש-NetworkPolicy יעבוד?", options: ["Kubernetes 1.28+", "CNI plugin שתומך כמו Calico או Cilium", "הפעלת firewall", "cloud provider מיוחד"], answer: 1, explanation: "NetworkPolicy דורש CNI plugin תומך. ה-CNI הדיפולטי (kubenet) לא מממש NetworkPolicies!" },
        ]
      }
    }
  }
];

const LEVEL_CONFIG = {
  easy:   { label: "קל",     icon: "🌱", color: "#10B981", points: 10 },
  medium: { label: "בינוני", icon: "⚡", color: "#F59E0B", points: 20 },
  hard:   { label: "קשה",   icon: "🔥", color: "#EF4444", points: 30 },
};

const ACHIEVEMENTS = [
  { id: "first",    icon: "🌱", name: "ראשית הדרך",   condition: s => s.total_answered >= 1 },
  { id: "streak3",  icon: "🔥", name: "שלושה ברצף",   condition: s => s.max_streak >= 3 },
  { id: "score100", icon: "💯", name: "100 נקודות",    condition: s => s.total_score >= 100 },
  { id: "allEasy",  icon: "⭐", name: "כל הנושאים קל", condition: s => s.completed_easy >= 5 },
  { id: "master",   icon: "🏆", name: "מאסטר K8s",     condition: s => s.completed_hard >= 5 },
];

export default function K8sQuestApp() {
  const [user, setUser]               = useState(null);
  const [authScreen, setAuthScreen]   = useState("login");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [username, setUsername]       = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError]     = useState("");

  const [screen, setScreen]                   = useState("home");
  const [selectedTopic, setSelectedTopic]     = useState(null);
  const [selectedLevel, setSelectedLevel]     = useState(null);
  const [topicScreen, setTopicScreen]         = useState("theory");
  const [questionIndex, setQuestionIndex]     = useState(0);
  const [selectedAnswer, setSelectedAnswer]   = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [topicCorrect, setTopicCorrect]       = useState(0);
  const [flash, setFlash]                     = useState(false);

  const [stats, setStats] = useState({
    total_answered: 0, total_correct: 0, total_score: 0,
    max_streak: 0, current_streak: 0, completed_easy: 0, completed_hard: 0
  });
  const [completedTopics, setCompletedTopics]           = useState({});
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [newAchievement, setNewAchievement]             = useState(null);
  const [leaderboard, setLeaderboard]                   = useState([]);
  const [showLeaderboard, setShowLeaderboard]           = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setUser(session.user); loadUserData(session.user.id); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) { setUser(session.user); loadUserData(session.user.id); }
      else setUser(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const newOnes = ACHIEVEMENTS.filter(a => !unlockedAchievements.includes(a.id) && a.condition(stats));
    if (newOnes.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...newOnes.map(a => a.id)]);
      setNewAchievement(newOnes[0]);
      setTimeout(() => setNewAchievement(null), 3000);
    }
  }, [stats]);

  const loadUserData = async (userId) => {
    const { data } = await supabase.from("user_stats").select("*").eq("user_id", userId).single();
    if (data) {
      setStats(data);
      setCompletedTopics(data.completed_topics || {});
      setUnlockedAchievements(data.achievements || []);
    }
  };

  const isGuest = user?.id === "guest";

  const saveUserData = async (newStats, newCompleted, newAchievements) => {
    if (!user || isGuest) return;
    await supabase.from("user_stats").upsert({
      user_id: user.id,
      username: user.user_metadata?.username || email.split("@")[0],
      ...newStats,
      completed_topics: newCompleted,
      achievements: newAchievements,
      updated_at: new Date().toISOString()
    });
  };

  const loadLeaderboard = async () => {
    const { data } = await supabase
      .from("user_stats")
      .select("username, total_score, max_streak, completed_hard")
      .order("total_score", { ascending: false })
      .limit(10);
    if (data) setLeaderboard(data);
  };

  const handleSignUp = async () => {
    setAuthLoading(true); setAuthError("");
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { username: username || email.split("@")[0] } }
    });
    if (error) setAuthError(error.message);
    else setAuthError("✅ נשלח אימייל אימות! בדקי את תיבת הדואר.");
    setAuthLoading(false);
  };

  const handleLogin = async () => {
    setAuthLoading(true); setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError("אימייל או סיסמה שגויים");
    setAuthLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); };

  const currentQuestions = selectedTopic && selectedLevel ? selectedTopic.levels[selectedLevel].questions : [];

  const handleAnswer = (idx) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    const correct = idx === currentQuestions[questionIndex].answer;
    const points = correct ? LEVEL_CONFIG[selectedLevel].points : 0;
    if (correct) { setTopicCorrect(p => p + 1); setFlash(true); setTimeout(() => setFlash(false), 600); }
    setStats(prev => {
      const streak = correct ? prev.current_streak + 1 : 0;
      return {
        ...prev,
        total_answered: prev.total_answered + 1,
        total_correct: correct ? prev.total_correct + 1 : prev.total_correct,
        total_score: prev.total_score + points,
        current_streak: streak,
        max_streak: Math.max(prev.max_streak, streak)
      };
    });
  };

  const nextQuestion = () => {
    const isLast = questionIndex >= currentQuestions.length - 1;
    if (isLast) {
      const lastCorrect = selectedAnswer === currentQuestions[questionIndex].answer;
      const finalCorrect = topicCorrect + (lastCorrect ? 1 : 0);
      const key = `${selectedTopic.id}_${selectedLevel}`;
      const newCompleted = { ...completedTopics, [key]: { correct: finalCorrect, total: currentQuestions.length } };
      const newStats = { ...stats };
      if (selectedLevel === "easy") newStats.completed_easy = (newStats.completed_easy || 0) + 1;
      if (selectedLevel === "hard") newStats.completed_hard = (newStats.completed_hard || 0) + 1;
      const newAchievements = [
        ...unlockedAchievements,
        ...ACHIEVEMENTS.filter(a => !unlockedAchievements.includes(a.id) && a.condition(newStats)).map(a => a.id)
      ];
      setCompletedTopics(newCompleted);
      setStats(newStats);
      setUnlockedAchievements(newAchievements);
      saveUserData(newStats, newCompleted, newAchievements);
      setScreen("topicComplete");
    } else {
      setQuestionIndex(p => p + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const startTopic = (topic, level) => {
    setSelectedTopic(topic); setSelectedLevel(level);
    setTopicScreen("theory"); setQuestionIndex(0);
    setSelectedAnswer(null); setShowExplanation(false); setTopicCorrect(0);
    setScreen("topic");
  };

  const renderTheory = (text) => {
    let inCode = false;
    return text.split('\n').map((line, i) => {
      if (line === 'CODE:') { inCode = true; return <div key={i} style={{ color: "#00D4FF", fontSize: 10, fontWeight: 800, marginTop: 14, marginBottom: 4, letterSpacing: 2, opacity: 0.7 }}>YAML / BASH</div>; }
      if (inCode) return <div key={i} style={{ fontFamily: "monospace", fontSize: 11, color: "#7dd3fc", lineHeight: 1.8, whiteSpace: "pre" }}>{line}</div>;
      if (line.startsWith('🔹')) return <div key={i} style={{ color: "#94a3b8", fontSize: 13, marginBottom: 5 }}>{line}</div>;
      if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
      return <div key={i} style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{line}</div>;
    });
  };

  const accuracy = stats.total_answered > 0 ? Math.round(stats.total_correct / stats.total_answered * 100) : 0;
  const displayName = user?.user_metadata?.username || user?.email?.split("@")[0] || "אורח";

  if (!user) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#020817,#0f172a)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Segoe UI, system-ui, sans-serif", direction: "rtl" }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @keyframes shine{0%{background-position:200% center}100%{background-position:-200% center}} input,button{outline:none;font-family:inherit}`}</style>
      <div style={{ width: 380, animation: "fadeIn 0.4s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>☸️</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 4px", background: "linear-gradient(90deg,#00D4FF,#A855F7,#FF6B35,#00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "300% auto", animation: "shine 5s linear infinite" }}>K8s Quest</h1>
          <p style={{ color: "#475569", fontSize: 13, margin: 0 }}>למד Kubernetes בצורה כיפית</p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28 }}>
          <div style={{ display: "flex", marginBottom: 24, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 4 }}>
            {["login","signup"].map(s => (
              <button key={s} onClick={() => { setAuthScreen(s); setAuthError(""); }} style={{ flex: 1, padding: "8px", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 700, background: authScreen === s ? "rgba(0,212,255,0.15)" : "transparent", color: authScreen === s ? "#00D4FF" : "#64748b", transition: "all 0.2s" }}>
                {s === "login" ? "התחברות" : "הרשמה"}
              </button>
            ))}
          </div>
          {authScreen === "signup" && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: "#64748b", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>שם משתמש</label>
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="K8s Hero" style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e2e8f0", fontSize: 14, boxSizing: "border-box" }} />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "#64748b", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>אימייל</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e2e8f0", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: "#64748b", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>סיסמה</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && (authScreen === "login" ? handleLogin() : handleSignUp())} style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e2e8f0", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          {authError && (
            <div style={{ color: authError.startsWith("✅") ? "#10B981" : "#EF4444", fontSize: 13, marginBottom: 14, padding: "8px 12px", background: authError.startsWith("✅") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", borderRadius: 8 }}>{authError}</div>
          )}
          <button onClick={authScreen === "login" ? handleLogin : handleSignUp} disabled={authLoading} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#00D4FFcc,#A855F7cc)", border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", opacity: authLoading ? 0.7 : 1 }}>
            {authLoading ? "⏳ רגע..." : authScreen === "login" ? "התחבר" : "הירשם"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#020817 0%,#0f172a 60%,#020817 100%)", fontFamily: "Segoe UI, system-ui, sans-serif", direction: "rtl", position: "relative" }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shine{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes toast{from{opacity:0;transform:translateX(-50%) translateY(-12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes correctFlash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}
        @keyframes popIn{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
        .card-hover{transition:transform 0.2s,box-shadow 0.2s;cursor:pointer}
        .card-hover:hover{transform:translateY(-3px)}
        .opt-btn{transition:all 0.15s;cursor:pointer}
        .opt-btn:hover{transform:translateX(-2px)}
        input,button{outline:none;font-family:inherit}
      `}</style>

      <div style={{ position:"fixed", inset:0, pointerEvents:"none", backgroundImage:"linear-gradient(rgba(0,212,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.02) 1px,transparent 1px)", backgroundSize:"48px 48px" }} />
      {flash && <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:800, background:"radial-gradient(circle at 50% 45%,rgba(16,185,129,0.14) 0%,transparent 60%)", animation:"correctFlash 0.6s ease forwards" }} />}

      {newAchievement && (
        <div style={{ position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(135deg,#1e293b,#0f172a)", border:"1px solid #00D4FF55", borderRadius:14, padding:"12px 22px", display:"flex", alignItems:"center", gap:12, zIndex:9999, boxShadow:"0 0 40px rgba(0,212,255,0.3)", animation:"toast 0.4s ease" }}>
          <span style={{ fontSize:26 }}>{newAchievement.icon}</span>
          <div>
            <div style={{ color:"#00D4FF", fontWeight:800, fontSize:11, letterSpacing:1 }}>הישג חדש!</div>
            <div style={{ color:"#e2e8f0", fontSize:14, fontWeight:700 }}>{newAchievement.name}</div>
          </div>
        </div>
      )}

      {showLeaderboard && (
        <div onClick={() => setShowLeaderboard(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:5000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background:"#0f172a", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:28, width:340, animation:"fadeIn 0.3s ease" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
              <h3 style={{ margin:0, color:"#e2e8f0", fontSize:18, fontWeight:800 }}>🏆 לוח תוצאות</h3>
              <button onClick={() => setShowLeaderboard(false)} style={{ background:"none", border:"none", color:"#64748b", fontSize:18, cursor:"pointer" }}>✕</button>
            </div>
            {leaderboard.length === 0
              ? <div style={{ color:"#475569", textAlign:"center", padding:"20px 0" }}>אין נתונים עדיין</div>
              : leaderboard.map((entry, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background: i===0 ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)", borderRadius:10, marginBottom:8, border:`1px solid ${i===0 ? "#F59E0B44" : "rgba(255,255,255,0.06)"}` }}>
                  <span style={{ fontSize:18, width:28 }}>{["🥇","🥈","🥉"][i] || `${i+1}.`}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ color:"#e2e8f0", fontWeight:700, fontSize:14 }}>{entry.username || "אנונימי"}</div>
                    <div style={{ color:"#475569", fontSize:11 }}>🔥 {entry.max_streak}</div>
                  </div>
                  <div style={{ color:"#00D4FF", fontWeight:800, fontSize:16 }}>{entry.total_score}</div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {screen === "home" && (
        <div style={{ maxWidth:700, margin:"0 auto", padding:"28px 20px", animation:"fadeIn 0.4s ease" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32 }}>
            <div>
              <h1 style={{ fontSize:28, fontWeight:900, margin:"0 0 2px", background:"linear-gradient(90deg,#00D4FF,#A855F7,#FF6B35,#00D4FF)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundSize:"300% auto", animation:"shine 5s linear infinite" }}>☸️ K8s Quest</h1>
              <p style={{ color:"#475569", fontSize:13, margin:0 }}>שלום, {displayName}! 👋</p>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => { loadLeaderboard(); setShowLeaderboard(true); }} style={{ padding:"8px 14px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:8, color:"#94a3b8", cursor:"pointer", fontSize:13 }}>🏆 טבלה</button>
              <button onClick={handleLogout} style={{ padding:"8px 14px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:8, color:"#94a3b8", cursor:"pointer", fontSize:13 }}>יציאה</button>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:28 }}>
            {[
              { label:"ניקוד",  value:stats.total_score,                    icon:"⭐", color:"#F59E0B" },
              { label:"דיוק",   value:`${accuracy}%`,                       icon:"🎯", color:"#10B981" },
              { label:"רצף",    value:stats.current_streak,                 icon:"🔥", color:"#FF6B35" },
              { label:"הושלמו", value:Object.keys(completedTopics).length,  icon:"📚", color:"#00D4FF" },
            ].map((s,i) => (
              <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"12px 8px", textAlign:"center" }}>
                <div style={{ fontSize:18 }}>{s.icon}</div>
                <div style={{ fontSize:20, fontWeight:800, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:11, color:"#475569" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {TOPICS.map(topic => (
              <div key={topic.id} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"16px 18px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                  <div style={{ fontSize:24, width:44, height:44, borderRadius:10, background:`${topic.color}14`, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${topic.color}22`, flexShrink:0 }}>{topic.icon}</div>
                  <div>
                    <div style={{ fontWeight:700, color:"#e2e8f0", fontSize:15 }}>{topic.name}</div>
                    <div style={{ color:"#475569", fontSize:12 }}>{topic.description}</div>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                  {Object.entries(LEVEL_CONFIG).map(([lvl, cfg]) => {
                    const key = `${topic.id}_${lvl}`;
                    const done = completedTopics[key];
                    return (
                      <div key={lvl} className="card-hover" onClick={() => startTopic(topic, lvl)} style={{ padding:"10px 8px", background: done ? `${cfg.color}12` : "rgba(255,255,255,0.03)", border:`1px solid ${done ? cfg.color+"44" : "rgba(255,255,255,0.07)"}`, borderRadius:10, textAlign:"center" }}>
                        <div style={{ fontSize:16 }}>{cfg.icon}</div>
                        <div style={{ fontSize:12, fontWeight:700, color: done ? cfg.color : "#64748b" }}>{cfg.label}</div>
                        {done && <div style={{ fontSize:10, color:cfg.color }}>{done.correct}/{done.total} ✓</div>}
                        <div style={{ fontSize:10, color:"#475569" }}>+{cfg.points}נק׳</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {unlockedAchievements.length > 0 && (
            <div style={{ marginTop:20, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:12, padding:"14px 18px" }}>
              <div style={{ color:"#475569", fontSize:11, fontWeight:700, marginBottom:10, letterSpacing:1 }}>🏅 הישגים</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {ACHIEVEMENTS.filter(a => unlockedAchievements.includes(a.id)).map(a => (
                  <div key={a.id} style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.04)", borderRadius:20, padding:"5px 12px", fontSize:12, color:"#94a3b8" }}>
                    <span>{a.icon}</span>{a.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {screen === "topic" && selectedTopic && selectedLevel && (
        <div style={{ maxWidth:660, margin:"0 auto", padding:"28px 20px", animation:"fadeIn 0.3s ease" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:22 }}>
            <button onClick={() => setScreen("home")} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", color:"#64748b", padding:"7px 14px", borderRadius:8, cursor:"pointer", fontSize:13 }}>→ חזור</button>
            <span style={{ fontSize:18 }}>{selectedTopic.icon}</span>
            <h2 style={{ margin:0, color:selectedTopic.color, fontSize:17, fontWeight:800 }}>{selectedTopic.name}</h2>
            <span style={{ fontSize:12, color:LEVEL_CONFIG[selectedLevel].color, background:`${LEVEL_CONFIG[selectedLevel].color}18`, padding:"3px 10px", borderRadius:20, fontWeight:700 }}>
              {LEVEL_CONFIG[selectedLevel].icon} {LEVEL_CONFIG[selectedLevel].label}
            </span>
          </div>

          {topicScreen === "theory" ? (
            <div>
              <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:22, marginBottom:18 }}>
                <div style={{ fontSize:11, color:selectedTopic.color, fontWeight:800, marginBottom:16, letterSpacing:1 }}>📖 תיאוריה</div>
                <div style={{ background:"rgba(0,0,0,0.35)", borderRadius:10, padding:"16px 20px" }}>
                  {renderTheory(selectedTopic.levels[selectedLevel].theory)}
                </div>
              </div>
              <button onClick={() => setTopicScreen("quiz")} style={{ width:"100%", padding:15, background:`linear-gradient(135deg,${selectedTopic.color}dd,${selectedTopic.color}77)`, border:"none", borderRadius:12, color:"#fff", fontSize:15, fontWeight:800, cursor:"pointer", boxShadow:`0 6px 24px ${selectedTopic.color}44` }}>
                🎯 התחל חידון! (+{LEVEL_CONFIG[selectedLevel].points} נק׳ לשאלה)
              </button>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom:18 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ color:"#475569", fontSize:12 }}>שאלה {questionIndex+1} / {currentQuestions.length}</span>
                  <span style={{ color: stats.current_streak > 0 ? "#FF6B35" : "#475569", fontSize:12, fontWeight: stats.current_streak > 0 ? 700 : 400 }}>
                    {stats.current_streak > 0 ? `🔥 ${stats.current_streak}` : "רצף: 0"}
                  </span>
                </div>
                <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:4 }}>
                  <div style={{ height:"100%", borderRadius:4, width:`${(questionIndex/currentQuestions.length)*100}%`, background:`linear-gradient(90deg,${selectedTopic.color},${selectedTopic.color}88)`, transition:"width 0.4s ease" }} />
                </div>
              </div>

              <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:22, marginBottom:14 }}>
                <div style={{ color:"#e2e8f0", fontSize:16, fontWeight:700, lineHeight:1.65 }}>{currentQuestions[questionIndex].q}</div>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:9, marginBottom:14 }}>
                {currentQuestions[questionIndex].options.map((opt, i) => {
                  const isCorrect = i === currentQuestions[questionIndex].answer;
                  const isChosen  = i === selectedAnswer;
                  let borderColor = "rgba(255,255,255,0.09)", bg = "rgba(255,255,255,0.02)", color = "#94a3b8";
                  if (selectedAnswer !== null) {
                    if (isCorrect)   { borderColor="#10B981"; bg="rgba(16,185,129,0.1)";  color="#10B981"; }
                    else if(isChosen){ borderColor="#EF4444"; bg="rgba(239,68,68,0.1)";   color="#EF4444"; }
                  }
                  return (
                    <button key={i} className={selectedAnswer===null?"opt-btn":""} onClick={() => handleAnswer(i)}
                      style={{ width:"100%", textAlign:"right", padding:"13px 16px", background:bg, border:`1px solid ${borderColor}`, borderRadius:10, color, fontSize:14, cursor:selectedAnswer!==null?"default":"pointer", lineHeight:1.5, display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ opacity:0.4, fontSize:12, flexShrink:0 }}>{["א","ב","ג","ד"][i]}.</span>
                      <span style={{ flex:1 }}>{opt}</span>
                      {selectedAnswer!==null && isCorrect && <span>✓</span>}
                      {selectedAnswer!==null && isChosen && !isCorrect && <span>✗</span>}
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div style={{ animation:"fadeIn 0.3s ease" }}>
                  <div style={{ background: selectedAnswer===currentQuestions[questionIndex].answer ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", border:`1px solid ${selectedAnswer===currentQuestions[questionIndex].answer ? "#10B98130" : "#EF444430"}`, borderRadius:12, padding:"14px 16px", marginBottom:12 }}>
                    <div style={{ fontWeight:800, fontSize:13, marginBottom:6, color: selectedAnswer===currentQuestions[questionIndex].answer ? "#10B981" : "#EF4444" }}>
                      {selectedAnswer===currentQuestions[questionIndex].answer ? `✅ נכון! +${LEVEL_CONFIG[selectedLevel].points} נק׳` : "❌ לא נכון"}
                    </div>
                    <div style={{ color:"#94a3b8", fontSize:13, lineHeight:1.7 }}>{currentQuestions[questionIndex].explanation}</div>
                  </div>
                  <button onClick={nextQuestion} style={{ width:"100%", padding:14, background:`linear-gradient(135deg,${selectedTopic.color}cc,${selectedTopic.color}77)`, border:"none", borderRadius:12, color:"#fff", fontSize:14, fontWeight:800, cursor:"pointer" }}>
                    {questionIndex >= currentQuestions.length-1 ? "🎉 סיים נושא!" : "שאלה הבאה ←"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {screen === "topicComplete" && selectedTopic && selectedLevel && (() => {
        const key = `${selectedTopic.id}_${selectedLevel}`;
        const result = completedTopics[key];
        const perfect = result?.correct === result?.total;
        return (
          <div style={{ maxWidth:480, margin:"60px auto", padding:"0 20px", textAlign:"center", animation:"fadeIn 0.5s ease" }}>
            <div style={{ fontSize:70, marginBottom:14, animation:"popIn 1s ease" }}>{perfect ? "🌟" : "✅"}</div>
            <h2 style={{ fontSize:26, fontWeight:900, margin:"0 0 8px", color:selectedTopic.color }}>{selectedTopic.name} – {LEVEL_CONFIG[selectedLevel].label}</h2>
            <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:8, background:"rgba(255,255,255,0.04)", borderRadius:30, padding:"8px 20px" }}>
              <span style={{ color:"#e2e8f0", fontSize:16, fontWeight:700 }}>{result?.correct}/{result?.total} נכון</span>
              {perfect && <span style={{ color:"#F59E0B", fontSize:13, fontWeight:700 }}>⭐ מושלם!</span>}
            </div>
            <div style={{ color:"#00D4FF", fontWeight:800, fontSize:18, marginBottom:24 }}>+{(result?.correct||0)*LEVEL_CONFIG[selectedLevel].points} נקודות</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <button onClick={() => startTopic(selectedTopic, selectedLevel)} style={{ padding:13, background:`${selectedTopic.color}18`, border:`1px solid ${selectedTopic.color}40`, borderRadius:12, color:selectedTopic.color, fontSize:14, fontWeight:700, cursor:"pointer" }}>🔄 נסה שוב</button>
              <button onClick={() => setScreen("home")} style={{ padding:13, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:12, color:"#e2e8f0", fontSize:14, fontWeight:700, cursor:"pointer" }}>→ חזור לנושאים</button>
            </div>
          </div>
        );
      })()}

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "24px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: 20 }}>
        <p style={{ color: "#334155", fontSize: 12, margin: 0 }}>
          {"© "}{new Date().getFullYear()}{" כל הזכויות שמורות לـ "}
          <a
            href="https://www.linkedin.com/in/orcarmeli/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#0ea5e9", textDecoration: "none", fontWeight: 600 }}
          >
            Or Carmeli
          </a>
        </p>
      </div>
    </div>
  );
}
