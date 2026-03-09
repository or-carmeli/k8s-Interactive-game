// ── Kubernetes Cheat Sheet Data ──────────────────────────────────────────────
// Each section has: id, icon, color, title/titleHe, concepts[], and optional tip/tipHe.
// Each concept has: n (name), nHe? (Hebrew name), d (desc EN), dHe (desc HE), c? (commands).

export const CHEATSHEET = [
  // ── 1. Core Objects ────────────────────────────────────────────────────────
  {
    id: "core", icon: "🧩", color: "#00D4FF",
    title: "Core Objects", titleHe: "אובייקטים מרכזיים",
    concepts: [
      { n: "Pod", d: "Smallest deployable unit. 1+ containers sharing network & storage.", dHe: "היחידה הקטנה ביותר. 1+ קונטיינרים עם רשת ואחסון משותפים.", c: "kubectl get pods -A\nkubectl describe pod <name>\nkubectl logs <pod> --previous" },
      { n: "Deployment", d: "Manages identical Pods. Rolling updates & rollbacks. Stateless apps.", dHe: "מנהל Pods זהים. rolling update ו-rollback. לאפליקציות stateless.", c: "kubectl rollout status deploy/<name>\nkubectl rollout undo deploy/<name>\nkubectl scale deploy/<name> --replicas=3" },
      { n: "StatefulSet", d: "Stable identity (pod-0, pod-1) + own PVC per Pod. For databases.", dHe: "זהות יציבה (pod-0, pod-1) + PVC ייחודי. לבסיסי נתונים.", c: "kubectl get statefulsets" },
      { n: "DaemonSet", d: "Exactly one Pod per Node. Log collectors, monitoring, CNI.", dHe: "Pod אחד על כל Node. ניטור, לוגים, CNI.", c: "kubectl get daemonsets" },
      { n: "Job / CronJob", d: "Job runs to completion. CronJob runs on cron schedule.", dHe: "Job: רץ עד סיום. CronJob: לפי לוח זמנים.", c: "kubectl get jobs\nkubectl get cronjobs" },
      { n: "restartPolicy", d: "Always (default) · OnFailure (Jobs) · Never", dHe: "Always (ברירת מחדל) · OnFailure · Never" },
    ],
  },

  // ── 2. Networking ──────────────────────────────────────────────────────────
  {
    id: "networking", icon: "🌐", color: "#10B981",
    title: "Networking", titleHe: "רשת",
    concepts: [
      { n: "ClusterIP", d: "Internal-only Service. Default type. Not reachable from outside.", dHe: "Service פנימי בלבד. סוג ברירת מחדל." },
      { n: "NodePort", d: "External access via <NodeIP>:<30000–32767>. For dev/testing.", dHe: "גישה חיצונית דרך פורט (30000–32767). לפיתוח." },
      { n: "LoadBalancer", d: "Cloud provider creates external LB. Standard for production.", dHe: "ספק ענן יוצר LB חיצוני. סטנדרט לפרודקשן." },
      { n: "Headless", d: "clusterIP: None — DNS returns Pod IPs. Used by StatefulSets.", dHe: "clusterIP: None — DNS מחזיר IPs של Pods ישירות." },
      { n: "Port fields", nHe: "שדות פורט", d: "port (cluster) · targetPort (container) · nodePort (external, 30000–32767)", dHe: "port (קלאסטר) · targetPort (קונטיינר) · nodePort (חיצוני)" },
      { n: "DNS", d: "Same ns: http://my-svc · Cross: my-svc.other-ns.svc.cluster.local", dHe: "אותו ns: http://my-svc · אחר: my-svc.other-ns.svc.cluster.local" },
      { n: "Ingress", d: "Routes HTTP/S from outside to Services. Needs Ingress Controller.", dHe: "מנתב HTTP/S חיצוני ל-Services. דורש Ingress Controller.", c: "kubectl get ingress\nkubectl describe ingress <name>" },
      { n: "NetworkPolicy", d: "No policy = all allowed. Apply deny-all first, then explicit allows.", dHe: "ללא policy = הכל מותר. deny-all ואז allows ספציפיים.", c: "kubectl get networkpolicies -n <ns>" },
    ],
    tip: "kubectl get endpoints <svc>  → empty list = selector mismatch",
    tipHe: "kubectl get endpoints <svc> → רשימה ריקה = selector לא תואם",
  },

  // ── 3. Scheduling ──────────────────────────────────────────────────────────
  {
    id: "scheduling", icon: "⚙️", color: "#F59E0B",
    title: "Scheduling", titleHe: "תזמון",
    concepts: [
      { n: "nodeSelector", d: "Simple label match. Pod runs only on Nodes with that label.", dHe: "התאמת label פשוטה." },
      { n: "nodeAffinity", d: "Like nodeSelector with required/preferred rules and richer expressions.", dHe: "כמו nodeSelector עם כללים required/preferred מתקדמים." },
      { n: "Taint", d: "Marks Node to repel Pods. NoSchedule / PreferNoSchedule / NoExecute.", dHe: "מסמן Node לדחיית Pods. NoSchedule / PreferNoSchedule / NoExecute.", c: "kubectl taint nodes <node> key=val:NoSchedule\nkubectl taint nodes <node> key=val:NoSchedule-" },
      { n: "Toleration", d: "Added to Pod spec to allow scheduling on tainted Node.", dHe: "מתווסף ל-Pod לאפשר תזמון על Node עם Taint." },
      { n: "requests", d: "Minimum reserved. Scheduler uses this to pick a Node.", dHe: "מינימום שמור. Scheduler בוחר Node לפי זה." },
      { n: "limits", d: "Maximum allowed. Memory exceeded → OOMKilled (137). CPU → throttled.", dHe: "מקסימום. חריגת memory → OOMKilled. חריגת CPU → throttling." },
      { n: "livenessProbe", d: "Fail → container restarted.", dHe: "כשלון → Kubernetes מאתחל את הקונטיינר." },
      { n: "readinessProbe", d: "Fail → Pod removed from Service endpoints.", dHe: "כשלון → Pod מוסר מה-Service." },
      { n: "startupProbe", d: "Delays liveness/readiness until app finishes starting.", dHe: "משהה liveness/readiness עד שהאפליקציה סיימה לעלות." },
      { n: "QoS Classes", nHe: "מחלקות QoS", d: "Guaranteed (req=lim) · Burstable (req<lim) · BestEffort (none). Evicted: BestEffort first.", dHe: "Guaranteed (req=lim) · Burstable (req<lim) · BestEffort (ללא). פינוי: BestEffort ראשון." },
    ],
    tip: "kubectl top pods --sort-by=memory  ·  kubectl describe pod → Events",
    tipHe: "kubectl top pods --sort-by=memory · kubectl describe pod → Events",
  },

  // ── 4. Configuration ───────────────────────────────────────────────────────
  {
    id: "configuration", icon: "🔧", color: "#A855F7",
    title: "Configuration", titleHe: "קונפיגורציה",
    concepts: [
      { n: "ConfigMap", d: "Non-sensitive config. Volume mount auto-updates; env vars need Pod restart.", dHe: "קונפיגורציה. כ-volume מתעדכן; כ-env var דורש restart.", c: "kubectl get cm\nkubectl create cm <name> --from-literal=key=val" },
      { n: "Secret", d: "Like ConfigMap for sensitive data. Base64-encoded, NOT encrypted by default.", dHe: "לנתונים רגישים. base64, לא מוצפן כברירת מחדל.", c: "kubectl get secret -n <ns>\nkubectl get secret <name> -o jsonpath='{.data.key}' | base64 -d" },
      { n: "env.valueFrom", d: "configMapKeyRef / secretKeyRef → one key as env var.", dHe: "configMapKeyRef/secretKeyRef → מפתח אחד כ-env var." },
      { n: "envFrom", d: "configMapRef / secretRef → inject ALL keys as env vars.", dHe: "configMapRef/secretRef → כל המפתחות כ-env vars." },
      { n: "volumeMount", d: "Each key becomes a file. ConfigMap volumes auto-update, env vars don't.", dHe: "כל מפתח = קובץ. volume מתעדכן; env var לא." },
    ],
    tip: "kubectl rollout restart deploy/<name>  → pick up ConfigMap changes",
    tipHe: "kubectl rollout restart deploy/<name> → קליטת שינויי ConfigMap",
  },

  // ── 5. Storage ─────────────────────────────────────────────────────────────
  {
    id: "storage", icon: "💾", color: "#6366F1",
    title: "Storage", titleHe: "אחסון",
    concepts: [
      { n: "emptyDir", d: "Lives with the Pod. Shared by containers. Gone when Pod deleted.", dHe: "חי עם ה-Pod. משותף לקונטיינרים. נמחק עם ה-Pod." },
      { n: "hostPath", d: "Mounts Node directory into Pod. Avoid in production.", dHe: "תיקיה מה-Node. יש להימנע ב-production." },
      { n: "PV / PVC", d: "PV = real storage. PVC = Pod's request. K8s binds matching PV to PVC.", dHe: "PV = אחסון אמיתי. PVC = בקשה. K8s מחבר PV ל-PVC.", c: "kubectl get pv\nkubectl get pvc -n <ns>\nkubectl describe pvc <name>" },
      { n: "StorageClass", d: "Dynamic provisioning blueprint. Names provisioner (EBS, GCP PD, Ceph…).", dHe: "תבנית dynamic provisioning. מגדיר provisioner.", c: "kubectl get storageclass" },
      { n: "Access Modes", nHe: "מצבי גישה", d: "RWO (1 Node r/w) · RWX (many Nodes r/w, NFS/EFS) · ROX (many read-only)", dHe: "RWO (Node אחד) · RWX (מספר Nodes, NFS/EFS) · ROX (קריאה בלבד)" },
      { n: "Reclaim Policy", nHe: "שחרור", d: "Retain = data preserved, manual cleanup. Delete = PV + disk gone with PVC.", dHe: "Retain = נתונים נשמרים. Delete = PV + דיסק נמחקים עם PVC." },
    ],
  },

  // ── 6. Security ────────────────────────────────────────────────────────────
  {
    id: "security", icon: "🔒", color: "#EF4444",
    title: "Security", titleHe: "אבטחה",
    concepts: [
      { n: "Role / ClusterRole", d: "Role = one namespace. ClusterRole = cluster-wide permissions.", dHe: "Role = namespace אחד. ClusterRole = כל הקלאסטר.", c: "kubectl get role,rolebinding -n <ns>\nkubectl get clusterrole,clusterrolebinding" },
      { n: "RoleBinding", d: "Attaches Role/ClusterRole to User, Group, or ServiceAccount.", dHe: "מקשר Role לנושא בתוך namespace." },
      { n: "ServiceAccount", d: "Pod identity for K8s API. Default SA auto-mounted. Use least privilege.", dHe: "זהות ל-Pods מול ה-API. SA 'default' מוזרק אוטומטית.", c: "kubectl auth can-i get pods --as=system:serviceaccount:<ns>:<sa>" },
      { n: "Pod Security", nHe: "אבטחת Pod", d: "runAsNonRoot · readOnlyRootFilesystem · allowPrivilegeEscalation: false", dHe: "runAsNonRoot · readOnlyRootFilesystem · allowPrivilegeEscalation: false" },
      { n: "RBAC Verbs", nHe: "פעלים", d: "get/list/watch (read) · create/update/patch (write) · delete · * (all — avoid)", dHe: "get/list/watch (קריאה) · create/update/patch (כתיבה) · delete · * (הכל — יש להימנע)" },
    ],
  },

  // ── 7. Troubleshooting ─────────────────────────────────────────────────────
  {
    id: "troubleshooting", icon: "🔍", color: "#FF6B35",
    title: "Troubleshooting", titleHe: "פתרון בעיות",
    concepts: [
      { n: "CrashLoopBackOff", d: "Container crashes repeatedly with exponential backoff delay.", dHe: "קונטיינר קורס שוב ושוב עם השהייה גדלה.", c: "kubectl logs <pod> --previous" },
      { n: "ImagePullBackOff", d: "Can't pull image — typo, wrong tag, or missing imagePullSecret.", dHe: "לא ניתן למשוך image — שם/tag שגוי או secret חסר.", c: "kubectl describe pod <name>  # → Events" },
      { n: "Pending Pod", nHe: "Pod תקוע", d: "No Node fits — CPU/memory, nodeSelector, toleration, or unbound PVC.", dHe: "אין Node מתאים — CPU/memory, nodeSelector, toleration, PVC.", c: "kubectl describe pod <name>  # → FailedScheduling" },
      { n: "OOMKilled", d: "Exceeded memory limit. Exit code 137. Increase limits.memory.", dHe: "חריגת memory. קוד 137. הגדל limits.memory.", c: "kubectl top pod --sort-by=memory" },
      { n: "Node NotReady", d: "kubelet stopped — crashed, TLS expired, disk/memory pressure.", dHe: "kubelet הפסיק לדווח — קרס, TLS פג, לחץ disk.", c: "kubectl describe node <name>\n# SSH → systemctl status kubelet" },
    ],
    tip: "Always start: kubectl describe pod <name> → scroll to Events",
    tipHe: "תמיד התחל: kubectl describe pod <name> → גלול ל-Events",
  },

  // ── 8. kubectl Quick Reference ─────────────────────────────────────────────
  {
    id: "kubectl", icon: "⌨️", color: "#7dd3fc",
    title: "kubectl Quick Ref", titleHe: "kubectl שליף",
    concepts: [
      { n: "-n <ns>", d: "Target specific namespace", dHe: "Namespace ספציפי" },
      { n: "-A", d: "All namespaces", dHe: "כל ה-namespaces" },
      { n: "-o wide / yaml", d: "Extra columns / full resource spec", dHe: "עמודות נוספות / spec מלא" },
      { n: "--dry-run=client", d: "Preview without applying", dHe: "סימולציה ללא שינוי" },
      { n: "-w (--watch)", d: "Stream updates in real time", dHe: "עדכונים בזמן אמת" },
      { n: "--previous", d: "Logs from last crashed container", dHe: "לוגים מה-crash האחרון" },
    ],
    tip: "kubectl exec -it <pod> -- sh  ·  kubectl port-forward pod/<name> 8080:80",
    tipHe: "kubectl exec -it <pod> -- sh  ·  kubectl port-forward pod/<name> 8080:80",
  },
];
