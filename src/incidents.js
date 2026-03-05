// ── Kubernetes Incident Mode Scenarios ───────────────────────────────────────
// Each incident simulates a real production troubleshooting workflow.
// Steps are linear (v1). Each step has:
//   prompt     – what you observe (may include terminal output)
//   options[4] – possible actions
//   answer     – index of the correct option (0-3)
//   explanation– why the correct answer is right, and why others are wrong

export const INCIDENTS = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. OOMKilled – memory limits too low
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "oom-killed",
    icon: "💥",
    title: "API Service OOMKilled in Production",
    titleHe: "שירות API — OOMKilled בפרודקשן",
    description: "A critical API pod keeps restarting every 2 minutes under load",
    descriptionHe: "Pod של API קריטי מתאפס כל 2 דקות תחת עומס",
    difficulty: "medium",
    estimatedTime: "5-7 min",
    steps: [
      {
        prompt:
          "🚨 PagerDuty alert: `api-server` pod in namespace `production` is restarting every 2 minutes. End users are seeing 503 errors. What is your first action?",
        options: [
          "kubectl get pods -n production",
          "kubectl delete pod api-server -n production",
          "kubectl scale deployment api-server --replicas=0 -n production",
          "Immediately reboot the node hosting the pod",
        ],
        answer: 0,
        explanation:
          "`kubectl get pods` gives you the current state without causing any disruption. Deleting the pod or scaling to 0 worsens the outage. Rebooting a node is far too drastic without even knowing the cause.",
      },
      {
        prompt:
          "kubectl get pods -n production returns:\n\nNAME            READY   STATUS      RESTARTS   AGE\napi-server-xyz  0/1     OOMKilled   14         2h\n\nWhat does OOMKilled specifically mean and what command gives you the most detail?",
        options: [
          "OOMKilled is a liveness probe failure — check probe config with kubectl edit deployment",
          "OOMKilled means the container exceeded its memory limit — run kubectl describe pod api-server-xyz -n production",
          "OOMKilled means a network timeout — check NetworkPolicy rules",
          "OOMKilled is caused by a bad Docker image — re-pull the image",
        ],
        answer: 1,
        explanation:
          "OOMKilled (Out Of Memory Killed) is set by the Linux kernel when a container breaches its memory limit. `kubectl describe pod` reveals the exact memory limit, the OOMKilled termination reason, and recent events — everything needed for diagnosis.",
      },
      {
        prompt:
          "kubectl describe pod api-server-xyz -n production shows:\n\n  Limits:\n    memory: 256Mi\n  Last State:\n    Reason: OOMKilled\n    Exit Code: 137\n\nHow do you determine the right memory limit to set?",
        options: [
          "kubectl top pod api-server-xyz -n production  (see actual memory usage)",
          "kubectl logs api-server-xyz -n production --previous  (scan logs for errors)",
          "kubectl get node  (check node total memory)",
          "kubectl get hpa -n production  (check autoscaler settings)",
        ],
        answer: 0,
        explanation:
          "`kubectl top pod` shows real-time memory consumption. You need to compare actual usage against the 256Mi limit to set a realistic new limit. Logs help find leaks but not current memory levels. Node capacity and HPA are secondary concerns.",
      },
      {
        prompt:
          "kubectl top pod shows `api-server-xyz` using ~240Mi at idle, spiking to 320Mi under load. The current limit is 256Mi. What is the correct fix?",
        options: [
          "Delete the pod — Kubernetes will recreate it and somehow the memory issue will go away",
          "Increase the memory limit to 512Mi and set request to 256Mi in the Deployment spec",
          "Add a NetworkPolicy to throttle incoming requests",
          "Restart the kubelet on the affected node",
        ],
        answer: 1,
        explanation:
          "Set the limit (ceiling) to 512Mi and the request (guaranteed reservation) to 256Mi. This gives headroom for traffic spikes while following K8s best practice (limit ≥ request, burstable QoS class). Deleting the pod or restarting kubelet changes nothing about the limit.",
      },
      {
        prompt:
          "You patch the Deployment with the new memory limits. How do you verify the rolling update succeeds and the pod no longer OOMKills?",
        options: [
          "kubectl rollout status deployment/api-server -n production",
          "kubectl get pods -n production -w  (watch pod restarts)",
          "kubectl get events -n production --sort-by=.metadata.creationTimestamp",
          "All of the above — rollout status + watching pods + events together",
        ],
        answer: 3,
        explanation:
          "`kubectl rollout status` confirms the rollout completes. Watching pods shows the new pod becomes Ready. Events reveal any scheduling or startup issues. Using all three gives full confidence the fix worked.",
      },
      {
        prompt:
          "The new pod has been stable for 15 minutes. What should you do before closing the incident to prevent recurrence?",
        options: [
          "Increase all node sizes immediately as a precaution",
          "Add a Prometheus alert on memory usage > 80% of limit, and audit resource limits on all other Deployments",
          "Set memory limit to unlimited so it never OOMKills again",
          "No action needed — the incident is resolved",
        ],
        answer: 1,
        explanation:
          "Setting limits to unlimited removes the safety net and risks starving other pods. Auditing all workloads and adding a memory-usage alert catches future OOM pressure before it causes an outage. Simply closing without action guarantees the same incident reoccurs.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. CrashLoopBackOff – missing ConfigMap / env var
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "crashloop-config",
    icon: "🔄",
    title: "CrashLoopBackOff: Missing Configuration",
    titleHe: "CrashLoopBackOff: קונפיגורציה חסרה",
    description: "A payment service crashes immediately after a new deployment shipped",
    descriptionHe: "שירות תשלומים קורס מיידית אחרי דיפלוימנט חדש",
    difficulty: "easy",
    estimatedTime: "4-5 min",
    steps: [
      {
        prompt:
          "🚨 Alert: `payment-service` in namespace `staging` entered CrashLoopBackOff 10 minutes after a new release was deployed. The on-call engineer asks for a quick diagnosis. Where do you start?",
        options: [
          "kubectl get pods -n staging",
          "kubectl rollout undo deployment/payment-service -n staging  (roll back immediately)",
          "kubectl delete namespace staging  (clean slate)",
          "Re-apply the deployment YAML without changes",
        ],
        answer: 0,
        explanation:
          "Start by assessing the situation with `kubectl get pods`. Rolling back without understanding the root cause is premature — the same bug may exist on the previous version too. Deleting the namespace causes total data loss. Re-applying the same YAML won't fix an unfound config issue.",
      },
      {
        prompt:
          "kubectl get pods -n staging:\n\nNAME                         STATUS             RESTARTS\npayment-service-7d4b9-abc12  CrashLoopBackOff   9\n\nThe pod is crashing repeatedly. What command reveals the application error?",
        options: [
          "kubectl describe pod payment-service-7d4b9-abc12 -n staging",
          "kubectl logs payment-service-7d4b9-abc12 -n staging --previous",
          "kubectl exec -it payment-service-7d4b9-abc12 -n staging -- /bin/sh",
          "kubectl get events -n staging --sort-by=.metadata.creationTimestamp",
        ],
        answer: 1,
        explanation:
          "`kubectl logs --previous` shows logs from the last crashed container — exactly what you need to see the startup error. `exec` doesn't work on a CrashLoopBackOff pod (it exits too fast). `describe` shows events but not application-level log output. Events are useful but secondary.",
      },
      {
        prompt:
          "Previous logs show:\n\nFATAL  config file '/etc/app/config.yaml' not found\nError: no such file or directory\n\nThe app is missing a config file it expects to be mounted. What do you check?",
        options: [
          "kubectl describe pod payment-service-7d4b9-abc12 -n staging  (check volumes and mounts)",
          "kubectl get configmap -n staging  (list available ConfigMaps)",
          "kubectl get secret -n staging  (list Secrets)",
          "Both A and B: inspect the pod spec for the expected mount AND list existing ConfigMaps",
        ],
        answer: 3,
        explanation:
          "You need two pieces of information: what the pod spec says should be mounted (`describe pod`) and what actually exists in the namespace (`get configmap`). Only by comparing both can you find the mismatch.",
      },
      {
        prompt:
          "kubectl describe pod shows a volumeMount referencing ConfigMap `payment-config`. kubectl get configmap -n staging shows:\n\nNAME              DATA   AGE\napp-settings      3      5d\n\nNo `payment-config` exists. What most likely happened?",
        options: [
          "The ConfigMap was created in a different namespace (e.g., production) but not in staging",
          "The ConfigMap was accidentally deleted from staging",
          "A new environment was added to the deployment but the ConfigMap was never created for it",
          "Any of the above — the ConfigMap is simply absent from this namespace",
        ],
        answer: 3,
        explanation:
          "ConfigMaps are namespace-scoped. The ConfigMap can be absent because it only exists in another namespace, was accidentally deleted, or was never created for this environment. All three are equally valid root causes; the fix is the same: create it in staging.",
      },
      {
        prompt:
          "You need to create `payment-config` in staging using the production version as a reference. What is the safest approach?",
        options: [
          "kubectl get configmap payment-config -n production -o yaml | sed 's/namespace: production/namespace: staging/' | kubectl apply -f -",
          "kubectl cp payment-config -n production staging/",
          "Edit the Deployment to point to the production namespace ConfigMap directly",
          "Restart the pod and hope the ConfigMap appears",
        ],
        answer: 0,
        explanation:
          "Export the ConfigMap from production, replace the namespace field, and apply to staging. `kubectl cp` is for files inside pods, not Kubernetes objects. Pods cannot reference ConfigMaps from other namespaces — they're namespace-scoped. Restarting without providing the resource changes nothing.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. ImagePullBackOff – private registry auth
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "imagepull-auth",
    icon: "🖼️",
    title: "ImagePullBackOff: Registry Authentication",
    titleHe: "ImagePullBackOff: אימות ל-Registry נכשל",
    description: "A new Deployment is stuck — pods can't pull the container image",
    descriptionHe: "דיפלוימנט חדש תקוע — פודים לא מצליחים למשוך את הקונטיינר",
    difficulty: "easy",
    estimatedTime: "4-5 min",
    steps: [
      {
        prompt:
          "🚨 A newly deployed microservice has all pods in `ImagePullBackOff`. Other services on the same cluster are healthy. What is your first diagnostic step?",
        options: [
          "kubectl describe pod <pod-name> -n default",
          "kubectl delete deployment myapp  (tear it down and redeploy)",
          "kubectl get nodes  (check if a node is down)",
          "Rebuild the Docker image locally and push again",
        ],
        answer: 0,
        explanation:
          "`kubectl describe pod` shows the Events section which contains the exact pull failure message — whether it's a missing tag, auth failure, or unreachable registry. Checking nodes is unlikely to help since only one deployment is affected. Rebuilding without knowing the cause wastes time.",
      },
      {
        prompt:
          "kubectl describe pod shows:\n\n  Events:\n    Failed to pull image 'registry.company.com/myapp:v2.1':\n    rpc error: code = Unknown\n    unauthorized: authentication required\n\nWhat does this error specifically indicate?",
        options: [
          "The image tag `v2.1` does not exist in the registry",
          "The registry requires credentials but the pod has none configured",
          "The registry server is down or unreachable",
          "The node has no internet access",
        ],
        answer: 1,
        explanation:
          "'unauthorized: authentication required' means the registry exists and is reachable, but valid credentials are required. If the tag was wrong you'd see 'not found'. If the registry was unreachable you'd see a connection timeout or 'no route to host'.",
      },
      {
        prompt:
          "Your registry `registry.company.com` requires a username/password to pull images. What Kubernetes resource is designed to hold registry credentials?",
        options: [
          "A ConfigMap with base64-encoded credentials",
          "A Secret of type `kubernetes.io/dockerconfigjson`",
          "A ServiceAccount token",
          "An RBAC ClusterRoleBinding",
        ],
        answer: 1,
        explanation:
          "Registry credentials are stored in a `kubernetes.io/dockerconfigjson` Secret (or the legacy `kubernetes.io/dockercfg` type). ConfigMaps are not suitable for sensitive data. ServiceAccount tokens authenticate to the Kubernetes API — not to container registries.",
      },
      {
        prompt:
          "kubectl get secret -n default | grep registry returns nothing. The pull Secret doesn't exist. How do you create it correctly?",
        options: [
          "kubectl create secret docker-registry regcred --docker-server=registry.company.com --docker-username=user --docker-password=pass -n default",
          "kubectl create configmap registry-auth --from-literal=password=mypassword",
          "Add the password as an environment variable in the Deployment spec",
          "Copy the Secret from the kube-system namespace",
        ],
        answer: 0,
        explanation:
          "`kubectl create secret docker-registry` creates a Secret with the correct type and `.dockerconfigjson` format. Never store credentials in plain ConfigMaps or env vars — they're not encrypted at rest. Secrets are namespace-scoped; you can't reference one from kube-system in default namespace.",
      },
      {
        prompt:
          "You created the `regcred` Secret. The deployment still fails to pull. What critical step did you miss?",
        options: [
          "The Secret value needs to be base64-encoded again manually",
          "The Deployment spec must reference the Secret under `imagePullSecrets`",
          "The Secret must be attached to the node, not the namespace",
          "You need to delete and recreate the Deployment for it to pick up the Secret",
        ],
        answer: 1,
        explanation:
          "Kubernetes does NOT automatically use available pull Secrets. You must explicitly reference the Secret in the Deployment under `spec.template.spec.imagePullSecrets: [{name: regcred}]`. Without this reference the pod will never use the credential, even if the Secret exists in the same namespace.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Service unreachable – wrong selector / port mismatch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "service-no-endpoints",
    icon: "🔌",
    title: "Service Returns No Endpoints",
    titleHe: "שירות ללא Endpoints — חיבור נדחה",
    description: "Frontend gets 'connection refused' calling the backend — pods look healthy",
    descriptionHe: "הפרונטאנד מקבל 'connection refused' מהבאקאנד — פודים נראים תקינים",
    difficulty: "medium",
    estimatedTime: "5-7 min",
    steps: [
      {
        prompt:
          "🚨 Users report 'connection refused' when the frontend calls the backend API. Pod status for both frontend and backend shows Running/Ready. Where do you start?",
        options: [
          "kubectl get svc backend-svc -n production  (inspect the Service)",
          "kubectl restart pod backend -n production",
          "kubectl delete svc backend-svc -n production  (recreate it)",
          "kubectl get nodes  (check node health)",
        ],
        answer: 0,
        explanation:
          "When pods are healthy but a Service is unreachable, the issue is almost always in the Service configuration (selector, port, targetPort). Start by inspecting the Service before taking any destructive action.",
      },
      {
        prompt:
          "kubectl get svc backend-svc -n production shows the Service exists with ClusterIP and port 80. What is the single most diagnostic command to run next?",
        options: [
          "kubectl get endpoints backend-svc -n production",
          "kubectl get ingress -n production",
          "kubectl describe node",
          "kubectl get pvc -n production",
        ],
        answer: 0,
        explanation:
          "`kubectl get endpoints` tells you whether the Service has successfully matched any pods. If ENDPOINTS shows `<none>`, no pods match the Service selector — the most common cause of 'connection refused' when pods are healthy.",
      },
      {
        prompt:
          "kubectl get endpoints backend-svc -n production:\n\nNAME          ENDPOINTS   AGE\nbackend-svc   <none>      3d\n\n`<none>` — the Service has no matching pods. What do you do next?",
        options: [
          "kubectl get pods -n production --show-labels  (see actual pod labels)",
          "kubectl describe svc backend-svc -n production  (see the selector the Service uses)",
          "kubectl get pods -n production  (check pod count)",
          "Both A and B: compare pod labels to Service selector simultaneously",
        ],
        answer: 3,
        explanation:
          "You need to compare what the Service expects (`describe svc` → Selector field) with what the pods actually have (`--show-labels`). Running both commands gives you the mismatch side-by-side. Neither alone is sufficient.",
      },
      {
        prompt:
          "kubectl describe svc shows:  Selector: app=backend\nkubectl get pods --show-labels shows pods labelled: app=backend-v2\n\nThe label was changed in the last deployment but the Service was not updated. What is the fix?",
        options: [
          "Manually add label `app=backend` to every running pod with kubectl label",
          "kubectl patch svc backend-svc -n production -p '{\"spec\":{\"selector\":{\"app\":\"backend-v2\"}}}'",
          "Delete the Service and recreate it with the correct selector",
          "Add an annotation to the Service to bypass label matching",
        ],
        answer: 1,
        explanation:
          "`kubectl patch svc` atomically updates the selector with zero downtime. Labelling individual pods is fragile — new pods from the Deployment won't have it. Deleting and recreating the Service causes unnecessary downtime. Annotations don't influence selector-based routing.",
      },
      {
        prompt:
          "You've patched the Service selector. How do you confirm traffic is flowing end-to-end?",
        options: [
          "kubectl get endpoints backend-svc -n production  (verify pod IPs appear)",
          "kubectl run curl-test --image=curlimages/curl --rm -it --restart=Never -n production -- curl backend-svc/health",
          "kubectl get pods -n production  (check pod status)",
          "Both A and B: verify endpoints are populated AND do a live connectivity test",
        ],
        answer: 3,
        explanation:
          "Endpoints being populated proves the selector matches. A live `curl` test proves actual network traffic reaches the backend. Both together confirm the full fix — endpoints can be populated but a NetworkPolicy could still silently block traffic.",
      },
      {
        prompt:
          "Traffic is restored. What process change prevents selector mismatches from reaching production again?",
        options: [
          "Manually double-check Service selectors after every deployment",
          "Use Helm/Kustomize to derive both the Service selector and Deployment pod labels from a single shared value, and alert on kube_endpoint_ready == 0",
          "Switch all Services from ClusterIP to NodePort",
          "Add a comment in the YAML reminding engineers to update the selector",
        ],
        answer: 1,
        explanation:
          "Templating (Helm/Kustomize) ensures labels and selectors are always in sync because they reference the same variable. An endpoint-ready alert catches the issue immediately if it slips through. Comments and manual checks are error-prone. NodePort doesn't address selector matching.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. DNS resolution failures – CoreDNS OOMKilled
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "dns-coredns",
    icon: "🌐",
    title: "Cluster DNS Resolution Failing",
    titleHe: "כשל ב-DNS הפנימי של הקלאסטר",
    description: "Multiple services can't resolve each other by hostname — widespread outage",
    descriptionHe: "שירותים מרובים לא מצליחים לפתור שמות — השבתה נרחבת",
    difficulty: "hard",
    estimatedTime: "7-9 min",
    steps: [
      {
        prompt:
          "🚨 Multiple applications log 'no such host' and 'dial tcp: lookup svc-name: no such host'. DNS seems broken cluster-wide. How do you confirm the DNS issue before investigating infrastructure?",
        options: [
          "kubectl run dns-test --image=busybox:1.28 --rm -it --restart=Never -- nslookup kubernetes.default",
          "Restart all pods in all namespaces",
          "Check AWS Route53 or your cloud DNS settings",
          "kubectl get nodes  (check if nodes are down)",
        ],
        answer: 0,
        explanation:
          "A quick `nslookup kubernetes.default` from inside the cluster tests the most fundamental in-cluster DNS entry. This confirms the problem is DNS and not individual app configs. Cloud DNS (Route53) handles external names, not internal Kubernetes service discovery. Restarting all pods causes massive downtime without confirming root cause.",
      },
      {
        prompt:
          "nslookup kubernetes.default fails: 'server can't find kubernetes.default: NXDOMAIN'. DNS is broken. Where does Kubernetes cluster DNS run?",
        options: [
          "On every node as a system daemon (systemd-resolved)",
          "As CoreDNS pods in the kube-system namespace",
          "Inside etcd as part of the control plane",
          "In every application namespace as a sidecar",
        ],
        answer: 1,
        explanation:
          "Kubernetes cluster DNS is served by CoreDNS pods in the `kube-system` namespace. These pods handle all in-cluster service discovery via the cluster domain (e.g., `svc.cluster.local`). If they're unhealthy, all DNS resolution fails cluster-wide.",
      },
      {
        prompt:
          "kubectl get pods -n kube-system -l k8s-app=kube-dns:\n\nNAME              STATUS      RESTARTS\ncoredns-abc12     OOMKilled   7\ncoredns-def34     OOMKilled   7\n\nBoth CoreDNS pods are OOMKilling. What should you do before changing anything?",
        options: [
          "kubectl delete pods -n kube-system -l k8s-app=kube-dns  (force restart)",
          "kubectl describe pod coredns-abc12 -n kube-system  (check memory limit)",
          "kubectl top pod -n kube-system  (check actual memory usage)",
          "Both B and C: check the configured limit AND actual consumption before acting",
        ],
        answer: 3,
        explanation:
          "You need both the memory limit (`describe pod`) and actual usage (`top pod`) to decide the new limit. Deleting pods without understanding the cause restarts them into the same OOMKill cycle immediately. Acting without data leads to setting incorrect limits.",
      },
      {
        prompt:
          "kubectl describe shows CoreDNS memory limit is 170Mi. kubectl top shows CoreDNS consuming 168Mi — nearly at the limit. The cluster recently scaled from 20 to 80 nodes. What is the likely root cause?",
        options: [
          "A memory leak in the CoreDNS binary — upgrade CoreDNS immediately",
          "The cluster grew significantly; CoreDNS caches DNS records for many more Services and Pods now, requiring more memory",
          "The CoreDNS ConfigMap is corrupt — restore it from backup",
          "The underlying node is overloaded and swapping memory",
        ],
        answer: 1,
        explanation:
          "CoreDNS memory usage scales with cluster size — more Services, Endpoints, and Pods means a larger DNS cache. At 4× cluster size, the original 170Mi limit is no longer adequate. A corrupt config would cause crashes with errors, not gradual memory exhaustion. Node swapping would affect all pods equally.",
      },
      {
        prompt:
          "How do you safely increase CoreDNS memory limits without causing a total DNS blackout?",
        options: [
          "kubectl edit deployment coredns -n kube-system  (increase memory limit, triggers rolling update)",
          "kubectl delete deployment coredns -n kube-system  (delete and recreate)",
          "Restart all control-plane components",
          "Add more nodes to the cluster",
        ],
        answer: 0,
        explanation:
          "`kubectl edit deployment coredns -n kube-system` triggers a rolling update — only one CoreDNS pod restarts at a time, keeping DNS available throughout. Deleting the deployment creates a total DNS outage during recreation. Adding nodes doesn't address the per-pod memory limit.",
      },
      {
        prompt:
          "After increasing memory to 512Mi, the CoreDNS pods are Running. How do you verify DNS is fully restored?",
        options: [
          "kubectl run dns-verify --image=busybox:1.28 --rm -it --restart=Never -- nslookup kubernetes.default.svc.cluster.local",
          "kubectl get pods -n kube-system  (confirm Running status)",
          "kubectl logs -n kube-system -l k8s-app=kube-dns --tail=30  (check for errors)",
          "All of the above — pods healthy + no log errors + successful DNS resolution test",
        ],
        answer: 3,
        explanation:
          "A complete DNS health check requires all three: pods must be Running (no more OOMKill), logs must show no errors, and an actual resolution test must succeed. A pod can be Running but still serving degraded results if there are configuration or cache issues.",
      },
      {
        prompt:
          "DNS is stable. What monitoring should you add so this never silently fails again?",
        options: [
          "Alert when CoreDNS pod memory usage exceeds 80% of its limit",
          "Alert on CoreDNS pod restart count > 0 in 5 minutes",
          "Alert on CoreDNS P99 DNS query latency > 100ms",
          "All three — memory pressure, restarts, and latency all indicate DNS health degrading",
        ],
        answer: 3,
        explanation:
          "Comprehensive DNS monitoring needs all three signals: memory approaching limit (capacity warning before OOMKill), restarts (stability), and query latency (performance). Monitoring only one signal leaves you blind to other failure modes, as this incident demonstrated.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. NetworkPolicy blocks traffic after security update
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "networkpolicy-block",
    icon: "🚧",
    title: "NetworkPolicy Silently Blocking Traffic",
    titleHe: "NetworkPolicy חוסמת תעבורה בשקט",
    description: "Service calls time out after the security team applied new NetworkPolicies",
    descriptionHe: "קריאות לשירות מסתיימות ב-timeout אחרי עדכון מדיניות אבטחה",
    difficulty: "hard",
    estimatedTime: "7-9 min",
    steps: [
      {
        prompt:
          "🚨 After the security team applied new NetworkPolicies to the `production` namespace, frontend-to-backend calls silently time out. Both sets of pods show Running/Ready. What do you check first?",
        options: [
          "kubectl get networkpolicy -n production  (list all policies in the namespace)",
          "kubectl rollout undo deployment/backend -n production  (roll back backend)",
          "kubectl delete networkpolicy --all -n production  (remove all policies)",
          "kubectl get pods -n production  (verify pod health again)",
        ],
        answer: 0,
        explanation:
          "Since the incident correlates directly with a NetworkPolicy change, inspect the policies first. Removing all policies (`--all`) eliminates the security posture — a serious risk. Rolling back the backend deployment won't fix a network-layer issue. Pod status is already confirmed healthy.",
      },
      {
        prompt:
          "kubectl get networkpolicy -n production lists several policies including `deny-all-ingress` and `allow-frontend`. How do you see what each policy actually permits?",
        options: [
          "kubectl describe networkpolicy -n production  (shows selectors and rules for all policies)",
          "kubectl logs networkpolicy-controller -n kube-system",
          "kubectl get events -n production",
          "kubectl exec into a pod and inspect iptables rules",
        ],
        answer: 0,
        explanation:
          "`kubectl describe networkpolicy -n production` prints each policy's podSelector and ingress/egress rules in readable format. NetworkPolicy controllers don't expose user-accessible logs. Events won't show policy rule details. iptables inspection requires node root access and is complex to interpret.",
      },
      {
        prompt:
          "kubectl describe shows:\n  Policy: allow-frontend\n  PodSelector: role=frontend  (targets backend pods)\n  Ingress from: podSelector role=frontend\n\nBut `deny-all-ingress` blocks everything else. You suspect a label mismatch. What must you check?",
        options: [
          "kubectl get pods -n production --show-labels  (check actual labels on frontend pods)",
          "kubectl delete networkpolicy deny-all-ingress -n production",
          "kubectl get svc -n production",
          "kubectl describe deployment frontend -n production",
        ],
        answer: 0,
        explanation:
          "NetworkPolicies match pods by their labels. If frontend pods don't carry the label `role=frontend`, the allow-frontend policy won't select them — their traffic is blocked by deny-all. You must verify actual pod labels before modifying any policy.",
      },
      {
        prompt:
          "kubectl get pods -n production --show-labels shows frontend pods have label `app=frontend`, NOT `role=frontend`. The `allow-frontend` policy's `from` podSelector specifies `role=frontend`. What is the correct fix?",
        options: [
          "kubectl label pod <each-frontend-pod> role=frontend  (relabel individual pods)",
          "kubectl patch networkpolicy allow-frontend -n production -p to update the from-selector to `app=frontend`",
          "kubectl delete networkpolicy deny-all-ingress  (remove the default-deny)",
          "Add `role=frontend` to the frontend Deployment's pod template labels",
        ],
        answer: 1,
        explanation:
          "Fix the NetworkPolicy's `from` podSelector to match the actual pod labels (`app=frontend`) using `kubectl patch` or `kubectl edit`. Labelling individual pods is fragile — new Deployment pods won't have it. Deleting deny-all weakens the security posture. Adding the label to Deployment template is also valid but requires a rollout.",
      },
      {
        prompt:
          "After patching the NetworkPolicy, how do you confirm traffic actually flows before declaring the incident resolved?",
        options: [
          "kubectl run curl-test --image=curlimages/curl -n production --rm -it --restart=Never -- curl backend-svc:8080/health",
          "Wait for real user traffic and monitor error rates",
          "kubectl get endpoints backend-svc -n production",
          "kubectl describe networkpolicy allow-frontend -n production  (read the updated policy)",
        ],
        answer: 0,
        explanation:
          "A temporary curl pod inside the same namespace sends actual traffic along the exact path that was broken. This is the only true end-to-end test. Waiting for user traffic risks continued impact. Endpoints check and policy describe are read-only — they can't prove traffic actually flows.",
      },
      {
        prompt:
          "Traffic is restored. How do you ensure this label-vs-selector mismatch cannot silently reach production again?",
        options: [
          "Ask engineers to manually verify NetworkPolicy selectors after every deployment",
          "Store NetworkPolicies in Git (GitOps), run a policy linter (e.g., Kube-linter) in CI, and validate in staging before production",
          "Disable NetworkPolicy on the cluster",
          "Only apply NetworkPolicies during maintenance windows",
        ],
        answer: 1,
        explanation:
          "GitOps ensures policies are version-controlled and auditable. A CI linter catches selector mismatches before merging. Staging validation catches runtime issues. Manual checks, disabling NetworkPolicy, or limiting application windows all trade reliability and security for convenience.",
      },
      {
        prompt:
          "The security team asks: how do you validate that a new NetworkPolicy enforces exactly what's intended without causing outages?",
        options: [
          "Apply in production and monitor; roll back if issues appear",
          "Read the YAML carefully and trust it is correct",
          "In staging: apply deny-all baseline, add each allow rule incrementally, and verify only intended traffic passes after each rule",
          "Use kubectl dry-run to preview changes",
        ],
        answer: 2,
        explanation:
          "The correct validation approach is zero-trust testing in staging: start from deny-all, then add each allow rule and test that only the expected traffic passes. `kubectl dry-run` only checks API validity, not enforcement semantics. Applying in production first risks user impact. Reading YAML doesn't prove enforcement.",
      },
    ],
  },
];
