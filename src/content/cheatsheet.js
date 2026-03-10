// ── kubectl Cheat Sheet Data ─────────────────────────────────────────────────
// Redesigned as a practical DevOps quick-reference organised by task.
// Each section has: id, icon, color, title/titleHe, commands[].
// Each command has: cmd (full kubectl command), desc/descHe (one-line purpose).

export const CHEATSHEET = [
  // ── 1. Inspect Resources ──────────────────────────────────────────────────
  {
    id: "inspect", icon: "🔎", color: "#00D4FF",
    title: "Inspect Resources", titleHe: "בדיקת משאבים",
    commands: [
      { cmd: "kubectl get pods -A", desc: "Show pods across all namespaces", descHe: "הצגת Pods בכל ה-namespaces" },
      { cmd: "kubectl get pods -n <ns> -o wide", desc: "List pods with node and IP details", descHe: "רשימת Pods עם פרטי Node ו-IP" },
      { cmd: "kubectl get deploy,svc,ing -n <ns>", desc: "Show deployments, services, and ingresses", descHe: "הצגת Deployments, Services ו-Ingresses" },
      { cmd: "kubectl describe pod <pod> -n <ns>", desc: "Show events and config details for a pod", descHe: "הצגת אירועים ופרטי קונפיגורציה של Pod" },
      { cmd: "kubectl get events -n <ns> --sort-by=.lastTimestamp", desc: "List recent events sorted by time", descHe: "רשימת אירועים אחרונים לפי זמן" },
      { cmd: "kubectl get nodes -o wide", desc: "List all nodes with OS and IP info", descHe: "רשימת Nodes עם פרטי IP ומערכת הפעלה" },
      { cmd: "kubectl top pods -n <ns> --sort-by=memory", desc: "Show pod memory and CPU usage", descHe: "הצגת שימוש ב-CPU וזיכרון של Pods" },
      { cmd: "kubectl top nodes", desc: "Show node resource utilisation", descHe: "הצגת ניצולת משאבים של Nodes" },
    ],
  },

  // ── 2. Namespaces ─────────────────────────────────────────────────────────
  {
    id: "namespaces", icon: "📂", color: "#A855F7",
    title: "Namespaces", titleHe: "Namespaces",
    commands: [
      { cmd: "kubectl get ns", desc: "List all namespaces", descHe: "רשימת כל ה-namespaces" },
      { cmd: "kubectl create ns <name>", desc: "Create a new namespace", descHe: "יצירת namespace חדש" },
      { cmd: "kubectl config set-context --current --namespace=<ns>", desc: "Set default namespace for current context", descHe: "הגדרת namespace ברירת מחדל" },
      { cmd: "kubectl get all -n <ns>", desc: "List all resources in a namespace", descHe: "רשימת כל המשאבים ב-namespace" },
      { cmd: "kubectl delete ns <name>", desc: "Delete a namespace and all its resources", descHe: "מחיקת namespace וכל המשאבים שלו" },
    ],
  },

  // ── 3. Debugging ──────────────────────────────────────────────────────────
  {
    id: "debugging", icon: "🐛", color: "#FF6B35",
    title: "Debugging", titleHe: "דיבוג",
    commands: [
      { cmd: "kubectl describe pod <pod> -n <ns>", desc: "Check events and error reasons for a pod", descHe: "בדיקת אירועים וסיבות שגיאה של Pod" },
      { cmd: "kubectl get pod <pod> -o yaml", desc: "View full pod spec and status", descHe: "הצגת spec וסטטוס מלא של Pod" },
      { cmd: "kubectl get events -n <ns> --field-selector reason=FailedScheduling", desc: "Find scheduling failures", descHe: "מציאת כשלונות תזמון" },
      { cmd: "kubectl describe node <node>", desc: "Check node conditions and pressure", descHe: "בדיקת מצב Node ולחצים" },
      { cmd: "kubectl auth can-i get pods --as=system:serviceaccount:<ns>:<sa>", desc: "Test RBAC permissions for a service account", descHe: "בדיקת הרשאות RBAC של ServiceAccount" },
      { cmd: "kubectl run debug --image=busybox -it --rm -- sh", desc: "Spin up a quick debug container", descHe: "הרצת קונטיינר דיבוג מהיר" },
    ],
  },

  // ── 4. Logs ───────────────────────────────────────────────────────────────
  {
    id: "logs", icon: "📜", color: "#10B981",
    title: "Logs", titleHe: "לוגים",
    commands: [
      { cmd: "kubectl logs <pod> -n <ns>", desc: "Show logs for a pod", descHe: "הצגת לוגים של Pod" },
      { cmd: "kubectl logs <pod> -c <container>", desc: "Show logs for a specific container", descHe: "הצגת לוגים של קונטיינר ספציפי" },
      { cmd: "kubectl logs <pod> --previous", desc: "Show logs from last crashed container", descHe: "הצגת לוגים מקונטיינר שקרס" },
      { cmd: "kubectl logs <pod> -f", desc: "Stream logs in real time", descHe: "הזרמת לוגים בזמן אמת" },
      { cmd: "kubectl logs <pod> --tail=100", desc: "Show last 100 log lines", descHe: "הצגת 100 שורות לוג אחרונות" },
      { cmd: "kubectl logs -l app=<name> -n <ns>", desc: "Show logs for all pods matching a label", descHe: "הצגת לוגים לכל Pods לפי label" },
    ],
  },

  // ── 5. Exec & Port-Forward ────────────────────────────────────────────────
  {
    id: "exec", icon: "💻", color: "#7dd3fc",
    title: "Exec & Port-Forward", titleHe: "Exec ו-Port-Forward",
    commands: [
      { cmd: "kubectl exec -it <pod> -- sh", desc: "Open a shell inside a pod", descHe: "פתיחת shell בתוך Pod" },
      { cmd: "kubectl exec -it <pod> -c <container> -- sh", desc: "Shell into a specific container", descHe: "Shell לקונטיינר ספציפי" },
      { cmd: "kubectl exec <pod> -- cat /etc/config/app.conf", desc: "Read a file inside a pod", descHe: "קריאת קובץ בתוך Pod" },
      { cmd: "kubectl port-forward pod/<pod> 8080:80", desc: "Forward local port 8080 to pod port 80", descHe: "העברת פורט מקומי 8080 לפורט 80 ב-Pod" },
      { cmd: "kubectl port-forward svc/<svc> 3000:80 -n <ns>", desc: "Forward local port to a service", descHe: "העברת פורט מקומי ל-Service" },
      { cmd: "kubectl cp <pod>:/path/file ./local-file", desc: "Copy a file from a pod to local machine", descHe: "העתקת קובץ מ-Pod למכונה מקומית" },
    ],
  },

  // ── 6. Networking ─────────────────────────────────────────────────────────
  {
    id: "networking", icon: "🌐", color: "#F59E0B",
    title: "Networking", titleHe: "רשת",
    commands: [
      { cmd: "kubectl get svc -A", desc: "List all services across namespaces", descHe: "רשימת כל ה-Services בכל ה-namespaces" },
      { cmd: "kubectl get endpoints <svc> -n <ns>", desc: "Check which pods back a service", descHe: "בדיקת אילו Pods מאחורי Service" },
      { cmd: "kubectl get ingress -n <ns>", desc: "List ingress rules in a namespace", descHe: "רשימת חוקי Ingress ב-namespace" },
      { cmd: "kubectl describe ingress <name> -n <ns>", desc: "Show ingress routing details", descHe: "הצגת פרטי ניתוב Ingress" },
      { cmd: "kubectl get networkpolicies -n <ns>", desc: "List network policies", descHe: "רשימת Network Policies" },
      { cmd: "kubectl run tmp --image=curlimages/curl -it --rm -- curl <svc>.<ns>.svc.cluster.local", desc: "Test DNS resolution from inside the cluster", descHe: "בדיקת DNS מתוך הקלאסטר" },
    ],
  },

  // ── 7. Deployments & Rollouts ─────────────────────────────────────────────
  {
    id: "deployments", icon: "⚙️", color: "#6366F1",
    title: "Deployments & Rollouts", titleHe: "Deployments ו-Rollouts",
    commands: [
      { cmd: "kubectl rollout status deploy/<name> -n <ns>", desc: "Watch a deployment rollout progress", descHe: "מעקב אחרי התקדמות rollout" },
      { cmd: "kubectl rollout undo deploy/<name> -n <ns>", desc: "Roll back to the previous revision", descHe: "חזרה לגרסה הקודמת" },
      { cmd: "kubectl rollout history deploy/<name>", desc: "Show deployment revision history", descHe: "הצגת היסטוריית גרסאות" },
      { cmd: "kubectl set image deploy/<name> <container>=<image>:<tag>", desc: "Update container image for a deployment", descHe: "עדכון image של קונטיינר ב-Deployment" },
      { cmd: "kubectl rollout restart deploy/<name> -n <ns>", desc: "Restart all pods in a deployment", descHe: "הפעלה מחדש של כל ה-Pods ב-Deployment" },
      { cmd: "kubectl apply -f manifest.yaml --dry-run=client", desc: "Validate manifest without applying", descHe: "בדיקת manifest ללא החלה" },
      { cmd: "kubectl diff -f manifest.yaml", desc: "Show what would change before applying", descHe: "הצגת שינויים לפני החלה" },
    ],
  },

  // ── 8. Scaling ────────────────────────────────────────────────────────────
  {
    id: "scaling", icon: "📈", color: "#10B981",
    title: "Scaling", titleHe: "סקיילינג",
    commands: [
      { cmd: "kubectl scale deploy/<name> --replicas=3 -n <ns>", desc: "Scale a deployment to 3 replicas", descHe: "שינוי מספר הרפליקות ל-3" },
      { cmd: "kubectl autoscale deploy/<name> --min=2 --max=10 --cpu-percent=80", desc: "Create a horizontal pod autoscaler", descHe: "יצירת HPA עם מינימום 2, מקסימום 10" },
      { cmd: "kubectl get hpa -n <ns>", desc: "List horizontal pod autoscalers", descHe: "רשימת HPAs ב-namespace" },
      { cmd: "kubectl scale statefulset/<name> --replicas=5", desc: "Scale a StatefulSet", descHe: "שינוי מספר רפליקות של StatefulSet" },
    ],
  },

  // ── 9. Cleanup ────────────────────────────────────────────────────────────
  {
    id: "cleanup", icon: "🧹", color: "#EF4444",
    title: "Cleanup", titleHe: "ניקוי",
    commands: [
      { cmd: "kubectl delete pod <pod> -n <ns>", desc: "Delete a specific pod", descHe: "מחיקת Pod ספציפי" },
      { cmd: "kubectl delete pod <pod> --grace-period=0 --force", desc: "Force-delete a stuck pod", descHe: "מחיקת Pod תקוע בכוח" },
      { cmd: "kubectl delete deploy <name> -n <ns>", desc: "Delete a deployment and its pods", descHe: "מחיקת Deployment וה-Pods שלו" },
      { cmd: "kubectl delete -f manifest.yaml", desc: "Delete all resources defined in a file", descHe: "מחיקת משאבים שמוגדרים בקובץ" },
      { cmd: "kubectl delete pods --field-selector=status.phase=Failed -n <ns>", desc: "Delete all failed pods in a namespace", descHe: "מחיקת כל ה-Pods שנכשלו ב-namespace" },
      { cmd: "kubectl drain <node> --ignore-daemonsets --delete-emptydir-data", desc: "Safely evict all pods from a node", descHe: "פינוי בטוח של כל ה-Pods מ-Node" },
      { cmd: "kubectl cordon <node>", desc: "Mark a node as unschedulable", descHe: "סימון Node כלא-ניתן-לתזמון" },
      { cmd: "kubectl uncordon <node>", desc: "Allow scheduling on a node again", descHe: "החזרת Node לתזמון" },
    ],
  },
];
