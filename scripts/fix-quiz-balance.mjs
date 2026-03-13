#!/usr/bin/env node
// Fix quiz answer balance:
// 1. Improve distractors for identified problematic questions
// 2. Shuffle answer positions across ALL questions (~25% per index)

import { readFileSync, writeFileSync } from "fs";

const FILE = new URL("../src/content/topics.js", import.meta.url).pathname;
let src = readFileSync(FILE, "utf-8");

// ── Content fixes: map from question substring → [newOptions, correctIndex] ──
// The correct answer is at the given index BEFORE shuffling.
const FIXES = {
  // config/easy — Default ServiceAccount (HE)
  'מה ה-ServiceAccount הברירת מחדל': [
    ["admin – ServiceAccount עם הרשאות cluster-admin מובנות",
     "default – ServiceAccount שנוצר אוטומטית בכל Namespace",
     "system:node – ServiceAccount שמשמש את ה-kubelet בכל Node",
     "kube-proxy – ServiceAccount של רכיב הProxy ברשת"],
    1],
  // config/easy — Default ServiceAccount (EN)
  'What is the default ServiceAccount': [
    ["admin - a ServiceAccount with built-in cluster-admin permissions",
     "default - a ServiceAccount auto-created in every Namespace",
     "system:node - a ServiceAccount used by the kubelet on each Node",
     "kube-proxy - a ServiceAccount for the kube-proxy network component"],
    1],
  // config/easy — requests vs limits (HE)
  'מה ההבדל בין resource requests ל-limits': [
    ["requests וlimits מגדירים את אותם ערכים – הם תמיד שווים",
     "requests – הכמות המינימלית שהScheduler מבטיח; limits – הכמות המקסימלית שהקונטיינר יכול להשתמש",
     "requests מגדירים כמות CPU ו-memory שמוקצית בעת יצירת ה-Node",
     "limits קובעים עדיפות Scheduling; requests קובעים QoS class בלבד"],
    1],
  // config/easy — requests vs limits (EN)
  'What is the difference between resource requests and limits': [
    ["requests and limits define the same values - they are always set equally",
     "requests - the minimum the Scheduler guarantees; limits - the maximum the container can use",
     "requests define CPU and memory allocated when the Node is provisioned",
     "limits determine Scheduling priority; requests determine QoS class only"],
    1],
  // config/medium — RoleBinding (HE)
  'מה תפקיד RoleBinding': [
    ["הגדרת כללי RBAC חדשים בתוך Namespace",
     "חיבור בין Role למשתמש או ServiceAccount בתוך Namespace",
     "שכפול הרשאות Role אחד ל-Namespace אחר",
     "הסלמת הרשאות Role קיים לרמת ClusterRole"],
    1],
  // config/medium — RoleBinding (EN)
  'What is a RoleBinding': [
    ["Defining new RBAC rules within a Namespace",
     "Binding a Role to a user/ServiceAccount within a Namespace",
     "Replicating one Role's permissions to another Namespace",
     "Escalating a Role's permissions to ClusterRole level"],
    1],
  // config/medium — ServiceAccount role (HE)
  'מה תפקיד ServiceAccount ב-Kubernetes': [
    ["זהות למשתמש אנושי שמתחבר דרך kubectl",
     "זהות ל-Pod או תהליך בתוך ה-Cluster לאימות מול API server",
     "שם DNS פנימי שה-Service מקבל בתוך ה-Namespace",
     "token חד-פעמי שנוצר בעת Deployment חדש"],
    1],
  // config/medium — ServiceAccount role (EN)
  'What is a ServiceAccount': [
    ["An identity for a human user connecting via kubectl",
     "An identity for a Pod/process within the Cluster to authenticate with the API server",
     "An internal DNS name assigned to a Service within a Namespace",
     "A one-time token generated during a new Deployment rollout"],
    1],
  // config/medium — Pod Security Admission (HE)
  'מה תפקיד Pod Security Admission': [
    ["controller שאוכף NetworkPolicy על תנועת רשת בין Pods",
     "controller מובנה שאוכף Pod Security Standards לפי label על ה-Namespace",
     "plugin שמנהל TLS certificates עבור Pods ב-Service Mesh",
     "admission webhook שמאמת image signatures לפני הרצת Pod"],
    1],
  // config/medium — Pod Security Admission (EN)
  'What is Pod Security Admission': [
    ["A controller that enforces NetworkPolicy on traffic between Pods",
     "A built-in controller enforcing Pod Security Standards via Namespace labels",
     "A plugin that manages TLS certificates for Pods in a Service Mesh",
     "An admission webhook that validates image signatures before running Pods"],
    1],
  // config/medium — admission webhook (HE)
  'מה תפקיד admission webhook ב-Kubernetes': [
    ["HTTP endpoint שמסנכרן resources בין Clusters שונים",
     "HTTP callback שמופעל לפני שמירת resource ב-etcd, לאימות או לשינוי",
     "HTTP handler שמנהל certificate rotation עבור ה-API server",
     "HTTP service שמבצע health checks על Pods לפני שמירתם ב-etcd"],
    1],
  // config/medium — admission webhook (EN)
  'What is an admission webhook': [
    ["An HTTP endpoint that syncs resources between different Clusters",
     "An HTTP callback triggered before a resource is persisted to etcd, for validation or mutation",
     "An HTTP handler that manages certificate rotation for the API server",
     "An HTTP service that performs health checks on Pods before persisting to etcd"],
    1],
  // config/medium — LimitRange vs ResourceQuota (HE)
  'מה LimitRange לעומת ResourceQuota': [
    ["LimitRange מגדיר CPU quota לNode; ResourceQuota מגדיר memory quota לCluster",
     "LimitRange – ברירות מחדל ומגבלות per-container; ResourceQuota – מגבלות aggregate לכל ה-Namespace",
     "LimitRange מגביל מספר Pods בNamespace; ResourceQuota מגביל מספר Nodes בCluster",
     "LimitRange חל רק על Pods חדשים; ResourceQuota חל רק על Pods קיימים"],
    1],
  // config/medium — LimitRange vs ResourceQuota (EN)
  'What is the difference between LimitRange and ResourceQuota': [
    ["LimitRange sets CPU quotas per Node; ResourceQuota sets memory quotas per Cluster",
     "LimitRange sets per-container defaults and limits; ResourceQuota sets aggregate limits for the whole Namespace",
     "LimitRange limits the number of Pods in a Namespace; ResourceQuota limits the number of Nodes in a Cluster",
     "LimitRange applies only to new Pods; ResourceQuota applies only to existing Pods"],
    1],
  // config/medium — seccomp (HE)
  'מה seccomp profile עושה': [
    ["מגביל את כמות ה-CPU שקונטיינר יכול לצרוך בכל Node",
     "מגביל את ה-syscalls שקונטיינר יכול לבצע – מצמצם attack surface",
     "מצפין את התעבורה בין קונטיינרים באותו Pod דרך localhost",
     "מגביל את ה-DNS queries שקונטיינר יכול לשלוח ל-CoreDNS"],
    1],
  // config/medium — seccomp (EN)
  'What does a seccomp profile do': [
    ["Limits the amount of CPU a container can consume on each Node",
     "Restricts the syscalls a container can make - reduces the attack surface",
     "Encrypts traffic between containers in the same Pod via localhost",
     "Limits the DNS queries a container can send to CoreDNS"],
    1],
  // config/medium — External Secrets (HE)
  'כיצד מסנכרנים Secret מ-AWS Secrets Manager': [
    ["Sealed Secrets controller – מצפין Secrets ושומר אותם ב-Git",
     "External Secrets Operator – SecretStore + ExternalSecret CR",
     "Vault Agent Injector – sidecar שמזריק secrets ישירות ל-Pod",
     "SOPS operator – מפענח קבצי YAML מוצפנים ויוצר K8s Secrets"],
    1],
  // config/medium — External Secrets (EN)
  'How do you sync a Secret from AWS Secrets Manager': [
    ["Sealed Secrets controller - encrypts Secrets and stores them in Git",
     "External Secrets Operator - SecretStore + ExternalSecret CR",
     "Vault Agent Injector - a sidecar that injects secrets directly into Pods",
     "SOPS operator - decrypts encrypted YAML files and creates K8s Secrets"],
    1],
  // config/hard — Least Privilege (HE)
  'מה עיקרון Least Privilege': [
    ["לתת הרשאות ClusterRole לכל ServiceAccount כברירת מחדל",
     "לתת רק את ההרשאות המינימליות הנחוצות לכל role",
     "לחסום כל תעבורת רשת בין Namespaces כברירת מחדל",
     "להשתמש ב-Pod Security Standards ברמת restricted בלבד"],
    1],
  // config/hard — Least Privilege (EN)
  'What is the Least Privilege principle': [
    ["Grant ClusterRole permissions to every ServiceAccount by default",
     "Grant only the minimum necessary permissions for each role",
     "Block all network traffic between Namespaces by default",
     "Use Pod Security Standards at the restricted level only"],
    1],
  // config/hard — Encryption at Rest (HE)
  'מה Encryption at Rest': [
    ["הצפנת תעבורת רשת בין Pods דרך mTLS אוטומטי",
     "הצפנת נתוני etcd ששומר secrets ו-resources על הדיסק",
     "הצפנת container images ב-Registry לפני deployment",
     "הצפנת קבצי log שנשמרים ב-Persistent Volumes"],
    1],
  // config/hard — Encryption at Rest (EN)
  'What is Encryption at Rest': [
    ["Encrypting network traffic between Pods via automatic mTLS",
     "Encrypting etcd data that stores secrets and resources on disk",
     "Encrypting container images in the Registry before deployment",
     "Encrypting log files stored on Persistent Volumes"],
    1],
  // config/hard — OPA/Gatekeeper (HE)
  'מה תפקיד OPA/Gatekeeper ב-Kubernetes': [
    ["controller שמנהל Pod autoscaling לפי custom metrics",
     "Open Policy Agent – מנגנון policy-as-code לאכיפת כללים ב-K8s",
     "operator שמנהל certificate lifecycle עבור Ingress resources",
     "admission controller מובנה שמאמת resource quotas לפני יצירה"],
    1],
  // config/hard — OPA/Gatekeeper (EN)
  'What is OPA/Gatekeeper': [
    ["A controller that manages Pod autoscaling based on custom metrics",
     "Open Policy Agent - policy-as-code enforcement for Kubernetes",
     "An operator that manages certificate lifecycle for Ingress resources",
     "A built-in admission controller that validates resource quotas before creation"],
    1],
  // config/hard — PSA restricted fix (HE)
  'PSA מוגדר עם enforce=restricted': [
    ["securityContext: {privileged: true, runAsUser: 0, capabilities: {add: [NET_ADMIN]}}",
     "securityContext: {allowPrivilegeEscalation: false, runAsNonRoot: true, seccompProfile: {type: RuntimeDefault}}",
     "securityContext: {readOnlyRootFilesystem: true, runAsUser: 1000, hostNetwork: true}",
     "securityContext: {capabilities: {drop: [ALL]}, runAsGroup: 0, privileged: false}"],
    1],
  // config/hard — PSA restricted fix (EN)
  'PSA is set to enforce=restricted': [
    ["securityContext: {privileged: true, runAsUser: 0, capabilities: {add: [NET_ADMIN]}}",
     "securityContext: {allowPrivilegeEscalation: false, runAsNonRoot: true, seccompProfile: {type: RuntimeDefault}}",
     "securityContext: {readOnlyRootFilesystem: true, runAsUser: 1000, hostNetwork: true}",
     "securityContext: {capabilities: {drop: [ALL]}, runAsGroup: 0, privileged: false}"],
    1],
  // storage/easy — PV vs PVC (HE)
  'מה ההבדל בין PV ל-PVC': [
    ["PV הוא volume זמני שנמחק כשה-Pod נגמר; PVC הוא volume קבוע",
     "PV הוא משאב אחסון בCluster; PVC הוא בקשה לאחסון מPod",
     "PV נוצר אוטומטית ע״י kubelet; PVC נוצר ע״י ה-Scheduler",
     "PV מוגדר בתוך Pod spec; PVC מוגדר ברמת Namespace"],
    1],
  // storage/easy — PV vs PVC (EN)
  'What is the difference between PV and PVC': [
    ["PV is a temporary volume deleted when the Pod ends; PVC is a permanent volume",
     "PV is a storage resource in the Cluster; PVC is a request for storage from a Pod",
     "PV is auto-created by the kubelet; PVC is created by the Scheduler",
     "PV is defined inside the Pod spec; PVC is defined at the Namespace level"],
    1],
  // storage/medium — PVC expand (HE)
  'כיצד מרחיבים PVC': [
    ["מוחקים את ה-PVC ויוצרים חדש עם גודל גדול יותר באותו StorageClass",
     "מגדירים allowVolumeExpansion: true ב-StorageClass ומגדילים spec.resources.requests.storage",
     "משנים את ה-PV הקיים ישירות ומעדכנים את capacity.storage בו",
     "יוצרים PVC שני ומשתמשים ב-kubectl merge-pvc לאיחוד הנפחים"],
    1],
  // storage/medium — PVC expand (EN)
  'How do you expand a PVC': [
    ["Delete the PVC and recreate it with a larger size in the same StorageClass",
     "Set allowVolumeExpansion: true in the StorageClass then increase spec.resources.requests.storage",
     "Edit the existing PV directly and update its capacity.storage field",
     "Create a second PVC and use kubectl merge-pvc to combine the volumes"],
    1],
  // storage/medium — helm template (HE)
  'מה helm template עושה': [
    ["יוצר Helm Chart חדש מתוך תבנית scaffold מובנית",
     "מרנדר את ה-Chart ל-YAML בלי להתקין אותו – לpipelines ו-dry-run",
     "שומר snapshot של ה-Chart הנוכחי לצורך rollback עתידי",
     "מעדכן את ה-values.yaml של Chart קיים מ-remote repository"],
    1],
  // storage/medium — helm template (EN)
  'What does helm template do': [
    ["Creates a new Helm Chart from a built-in scaffold template",
     "Renders the Chart to YAML without installing - for pipelines and dry-runs",
     "Saves a snapshot of the current Chart for future rollback",
     "Updates the values.yaml of an existing Chart from a remote repository"],
    1],
  // storage/medium — PVC Pending (HE)
  'מה אומר PVC בסטטוס Pending': [
    ["ה-PVC ממתין לסיום backup של Volume קיים לפני mount",
     "PV תואם לא נמצא – בגלל AccessMode שגוי, storage לא מספיק, או StorageClass שגוי",
     "ה-PVC נמצא בתהליך הצפנה לפני שהוא זמין לPod",
     "ה-StorageClass מבצע replication ל-Zone משני לפני binding"],
    1],
  // storage/medium — PVC Pending (EN)
  'What does a PVC in Pending status mean': [
    ["The PVC is waiting for an existing Volume backup to complete before mounting",
     "No matching PV found - due to wrong AccessMode, insufficient storage, or wrong StorageClass",
     "The PVC is being encrypted before it becomes available to a Pod",
     "The StorageClass is replicating to a secondary Zone before binding"],
    1],
  // storage/hard — WaitForFirstConsumer (HE)
  'מה volume binding mode WaitForFirstConsumer': [
    ["ממתין לאישור Admin ב-RBAC לפני יצירת PV חדש",
     "ממתין ש-Pod יתזמן לפני יצירת PV – כדי ליצור PV באותה Zone כמו ה-Pod",
     "ממתין לסיום replication בין Zones לפני binding של ה-PVC",
     "ממתין שה-StorageClass יסיים health check לפני הקצאת Volume"],
    1],
  // storage/hard — WaitForFirstConsumer (EN)
  'What does volume binding mode WaitForFirstConsumer do': [
    ["Waits for Admin RBAC approval before creating a new PV",
     "Waits for a Pod to be scheduled before creating the PV - ensuring the PV is in the same Zone as the Pod",
     "Waits for cross-Zone replication to complete before binding the PVC",
     "Waits for the StorageClass to finish a health check before allocating a Volume"],
    1],
  // troubleshooting/medium — ContainerCreating (HE)
  'נמצא ב-ContainerCreating זמן רב': [
    ["Image pull איטי בגלל registry עמוס, או חוסר bandwidth ב-Node",
     "PVC שלא נמצא, Secret חסר, image pull איטי, או בעיה ב-CNI",
     "Node עם disk pressure שמונע mount של Volumes חדשים",
     "Init container שנתקע בלופ ומעכב את הפעלת הcontainer הראשי"],
    1],
  // troubleshooting/medium — ContainerCreating (EN)
  'A Pod is in ContainerCreating for a long time': [
    ["Slow image pull due to overloaded registry or insufficient Node bandwidth",
     "Unbound PVC, missing Secret, slow image pull, or CNI issue",
     "Node with disk pressure preventing new Volume mounts",
     "Init container stuck in a loop delaying the main container startup"],
    1],
  // troubleshooting/hard — NotReady Node (HE)
  'Node מראה NotReady': [
    ["kubectl drain <name> --force להעביר Pods ואז למחוק ולהצטרף מחדש",
     "kubectl cordon <name> ואז לבדוק kubelet status דרך systemctl על ה-Node",
     "kubectl describe node <name> לבדוק Conditions ו-Events, ואז SSH ל-Node ולהריץ systemctl status kubelet",
     "kubectl delete node <name> ולתת ל-cluster autoscaler להפעיל Node חדש"],
    2],
  // troubleshooting/hard — NotReady Node (EN)
  'A Node shows NotReady': [
    ["kubectl drain <name> --force to move Pods then delete and rejoin the Node",
     "kubectl cordon <name> then check kubelet status via systemctl on the Node",
     "kubectl describe node <name> to check Conditions and Events, then SSH in and run systemctl status kubelet",
     "kubectl delete node <name> and let the cluster autoscaler provision a new Node"],
    2],
  // troubleshooting/hard — DNS (HE)
  'כיצד מאבחנים בעיות DNS ב-Kubernetes': [
    ["kubectl logs -n kube-system coredns-xxx ולבדוק config של Corefile",
     "kubectl exec pod -- nslookup kubernetes.default + בדיקת CoreDNS Pod logs",
     "kubectl get endpoints -n kube-system kube-dns ולוודא שה-IP תקין",
     "kubectl describe svc kube-dns -n kube-system ולחפש Selector mismatch"],
    1],
  // troubleshooting/hard — DNS (EN)
  'How do you diagnose DNS issues in Kubernetes': [
    ["kubectl logs -n kube-system coredns-xxx and check the Corefile config",
     "kubectl exec pod -- nslookup kubernetes.default + check CoreDNS Pod logs",
     "kubectl get endpoints -n kube-system kube-dns and verify the IP is correct",
     "kubectl describe svc kube-dns -n kube-system and look for Selector mismatch"],
    1],
  // troubleshooting/hard — etcd backup (HE)
  'מה הפקודה לגיבוי etcd': [
    ["etcdctl member backup --data-dir=/var/lib/etcd --output=backup.db",
     "etcdctl snapshot save backup.db --endpoints=...",
     "etcdctl export --all-keys --snapshot-dir=/backup/etcd-data.db",
     "etcdctl backup create --name=backup.db --cacert=... --cert=..."],
    1],
  // troubleshooting/hard — etcd backup (EN)
  'What is the command to back up etcd': [
    ["etcdctl member backup --data-dir=/var/lib/etcd --output=backup.db",
     "etcdctl snapshot save backup.db --endpoints=...",
     "etcdctl export --all-keys --snapshot-dir=/backup/etcd-data.db",
     "etcdctl backup create --name=backup.db --cacert=... --cert=..."],
    1],
  // networking/medium — ExternalTrafficPolicy (HE)
  'מה ההבדל בין ExternalTrafficPolicy: Local לבין': [
    ["Local מעביר תנועה רק ל-Pods על אותו Node ושומר client IP; Cluster מעביר לכל Pod ומבצע SNAT",
     "Local שומר על session affinity אוטומטי; Cluster דורש הגדרת sessionAffinity: ClientIP",
     "Cluster מפזר עומס שווה בין כל ה-Pods; Local שולח תנועה רק ל-Pod הקרוב ביותר",
     "Local דורש externalIPs מוגדרים; Cluster עובד עם כל סוגי Service כולל ClusterIP"],
    0],
  // networking/medium — ExternalTrafficPolicy (EN)
  'What is the difference between ExternalTrafficPolicy: Local': [
    ["Local routes traffic only to Pods on the same Node and preserves client IP; Cluster forwards to any Pod and performs SNAT",
     "Local maintains automatic session affinity; Cluster requires explicit sessionAffinity: ClientIP",
     "Cluster distributes load equally across all Pods; Local sends traffic only to the nearest Pod",
     "Local requires configured externalIPs; Cluster works with all Service types including ClusterIP"],
    0],
};

// ── Apply content fixes ──────────────────────────────────────────────────────
let fixCount = 0;
for (const [qSubstr, [newOpts, correctIdx]] of Object.entries(FIXES)) {
  // Find the question in the file
  const qPos = src.indexOf(qSubstr);
  if (qPos === -1) {
    console.warn(`⚠ Question not found: "${qSubstr.slice(0,50)}..."`);
    continue;
  }

  // Find the options block after this question
  const optStart = src.indexOf("options: [", qPos);
  if (optStart === -1 || optStart - qPos > 400) continue;
  const optEnd = src.indexOf("],", optStart);
  if (optEnd === -1) continue;

  // Find the answer line
  const answerMatch = src.slice(optEnd, optEnd + 60).match(/answer:\s*(\d+)/);
  if (!answerMatch) continue;

  // Detect indentation from the options block
  const beforeOpt = src.slice(optStart - 20, optStart);
  const indentMatch = beforeOpt.match(/\n(\s+)$/);
  const indent = indentMatch ? indentMatch[1] : "              ";

  // Build new options block
  const optLines = newOpts.map(o => `${indent}"${o.replace(/"/g, '\\"')}",`).join("\n");
  const newOptBlock = `options: [\n${optLines}\n${indent}]`;

  // Replace options block
  src = src.slice(0, optStart) + newOptBlock + src.slice(optEnd + 1);

  // Re-find and update answer (position may have shifted)
  const newOptEnd = src.indexOf("],", optStart);
  const ansArea = src.slice(newOptEnd, newOptEnd + 60);
  const ansMatch2 = ansArea.match(/answer:\s*\d+/);
  if (ansMatch2) {
    const ansPos = newOptEnd + ansMatch2.index;
    src = src.slice(0, ansPos) + `answer: ${correctIdx}` + src.slice(ansPos + ansMatch2[0].length);
  }

  fixCount++;
}
console.log(`Applied ${fixCount} content fixes.`);

// ── Shuffle answer positions ─────────────────────────────────────────────────
// Seeded PRNG based on question text for deterministic results
function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return function() {
    h = (h ^ (h << 13)) | 0;
    h = (h ^ (h >> 17)) | 0;
    h = (h ^ (h << 5)) | 0;
    return ((h >>> 0) / 4294967296);
  };
}

function shuffle(arr, rng) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Find all question blocks and shuffle their options
const optionsRe = /options:\s*\[\n([\s\S]*?)\],/g;
let shuffleCount = 0;
const newAnswerPositions = [0, 0, 0, 0]; // track distribution

src = src.replace(optionsRe, (fullMatch, inner, offset) => {
  // Extract individual options
  const optLines = inner.split("\n").map(l => l.trim()).filter(l => l.startsWith('"') || l.startsWith("'"));
  if (optLines.length !== 4) return fullMatch; // skip non-4-option blocks

  // Clean option strings (remove trailing comma)
  const opts = optLines.map(l => l.replace(/,\s*$/, ""));

  // Find the answer line after this block
  const afterBlock = src.slice(offset + fullMatch.length, offset + fullMatch.length + 60);
  const ansMatch = afterBlock.match(/answer:\s*(\d+)/);
  if (!ansMatch) return fullMatch;

  const currentAnswer = parseInt(ansMatch[1]);
  const correctOpt = opts[currentAnswer];

  // Get the question text before this block for seeding
  const before = src.slice(Math.max(0, offset - 300), offset);
  const qMatch = before.match(/q:\s*"([^"]+)"/);
  const seed = qMatch ? qMatch[1] : `q${offset}`;

  // Shuffle
  const rng = seededRandom(seed + "_v2");
  const indices = shuffle([0, 1, 2, 3], rng);
  const shuffledOpts = indices.map(i => opts[i]);
  const newAnswerIdx = shuffledOpts.indexOf(correctOpt);

  // Detect indentation
  const indentMatch = inner.match(/^(\s+)/);
  const indent = indentMatch ? indentMatch[1] : "              ";

  // Update answer in src
  const ansPos = offset + fullMatch.length + ansMatch.index;
  const ansEnd = ansPos + ansMatch[0].length;
  // We need to defer this — mark for replacement
  // Actually, we can't modify src inside replace callback easily.
  // Instead, store the mapping and do a second pass.

  newAnswerPositions[newAnswerIdx]++;
  shuffleCount++;

  // Return shuffled options block
  const newInner = shuffledOpts.map(o => `${indent}${o},`).join("\n");
  return `options: [\n${newInner}\n${indent.replace(/  $/, "")}],`;
});

// Second pass: update answer indices
// Re-find all options+answer blocks and update answers based on shuffled positions
let finalSrc = src;
const blockRe = /options:\s*\[\n([\s\S]*?)\],\s*\n\s*answer:\s*(\d+)/g;
let match;
const replacements = [];

while ((match = blockRe.exec(src)) !== null) {
  const inner = match[1];
  const oldAnswer = parseInt(match[2]);
  const offset = match.index;

  // Extract options
  const optLines = inner.split("\n").map(l => l.trim()).filter(l => l.startsWith('"') || l.startsWith("'"));
  if (optLines.length !== 4) continue;

  const opts = optLines.map(l => l.replace(/,\s*$/, ""));

  // Get the question text
  const before = src.slice(Math.max(0, offset - 300), offset);
  const qMatch = before.match(/q:\s*"([^"]+)"/);
  const seed = qMatch ? qMatch[1] : `q${offset}`;

  // Re-derive the shuffle to find correct new index
  // The options are ALREADY shuffled in the text from the first pass.
  // We need to find where the correct answer ended up.
  // Problem: we already shuffled the options in place, so we can't easily
  // know which was the original correct answer.
  // Solution: we need to track this differently.
}

// Actually, let me redo this with a cleaner approach.
// Reset and do a single pass that handles both options and answer together.

console.log("Reshuffling with answer tracking...");

// Re-read the content-fixed file (before any shuffle)
// Actually we already modified src with the options shuffle above but the answer indices weren't updated.
// Let me start fresh from the content-fixed state.

// Write content-fixed version first, then do shuffle in a second script run
// OR better: redo everything cleanly.

// Let me re-read the original file and redo properly.
src = readFileSync(FILE, "utf-8");

// Re-apply content fixes
for (const [qSubstr, [newOpts, correctIdx]] of Object.entries(FIXES)) {
  const qPos = src.indexOf(qSubstr);
  if (qPos === -1) continue;
  const optStart = src.indexOf("options: [", qPos);
  if (optStart === -1 || optStart - qPos > 400) continue;
  const optEnd = src.indexOf("],", optStart);
  if (optEnd === -1) continue;
  const beforeOpt = src.slice(optStart - 20, optStart);
  const indentMatch = beforeOpt.match(/\n(\s+)$/);
  const indent = indentMatch ? indentMatch[1] : "              ";
  const optLines = newOpts.map(o => `${indent}"${o.replace(/"/g, '\\"')}",`).join("\n");
  const newOptBlock = `options: [\n${optLines}\n${indent}]`;
  src = src.slice(0, optStart) + newOptBlock + src.slice(optEnd + 1);
  const newOptEnd = src.indexOf("],", optStart);
  const ansArea = src.slice(newOptEnd, newOptEnd + 60);
  const ansMatch2 = ansArea.match(/answer:\s*\d+/);
  if (ansMatch2) {
    const ansPos = newOptEnd + ansMatch2.index;
    src = src.slice(0, ansPos) + `answer: ${correctIdx}` + src.slice(ansPos + ansMatch2[0].length);
  }
}

// Now do the shuffle - find all blocks with options + answer together
const fullBlockRe = /(options:\s*\[\n)([\s\S]*?)(\],\s*\n\s*)(answer:\s*)(\d+)/g;
let shuffled = 0;
const dist = [0, 0, 0, 0];

src = src.replace(fullBlockRe, (full, prefix, inner, middle, ansPrefix, ansIdx) => {
  const oldAnswer = parseInt(ansIdx);

  // Extract options
  const lines = inner.split("\n").map(l => l.trim()).filter(l => l.startsWith('"') || l.startsWith("'"));
  if (lines.length !== 4) return full;

  const opts = lines.map(l => l.replace(/,\s*$/, ""));
  const correctOpt = opts[oldAnswer];

  // Detect indentation
  const indentMatch = inner.match(/^(\s+)/);
  const indent = indentMatch ? indentMatch[1] : "              ";

  // Get seed from question text nearby
  const pos = src.indexOf(full);
  const before = src.slice(Math.max(0, pos - 500), pos);
  const qMatch = before.match(/q:\s*"([^"]*?)"/);
  // Use a simpler seed: the correct option text itself (unique per question)
  const seed = correctOpt + "_shuffle_v3";

  const rng = seededRandom(seed);
  const indices = shuffle([0, 1, 2, 3], rng);
  const shuffledOpts = indices.map(i => opts[i]);
  const newAnswerIdx = shuffledOpts.indexOf(correctOpt);

  dist[newAnswerIdx]++;
  shuffled++;

  const newInner = shuffledOpts.map(o => `${indent}${o},`).join("\n") + "\n";
  return `${prefix}${newInner}${middle}${ansPrefix}${newAnswerIdx}`;
});

console.log(`Shuffled ${shuffled} questions.`);
console.log(`Answer distribution: [${dist.join(", ")}] (idx 0,1,2,3)`);

writeFileSync(FILE, src, "utf-8");
console.log("File written successfully.");
