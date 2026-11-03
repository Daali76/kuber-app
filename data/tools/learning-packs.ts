import type {
  DiagramFlow,
  Lab,
  LabStep,
  LocalizedString,
  QuizQuestion,
  TroubleshootingScenario,
} from "@/lib/types";
import {
  kindCleanup,
  kindSetupBasic,
  kindSetupNoCni,
  minikubeAlt,
} from "@data/labs/kind";

export type ToolId =
  | "kubernetes"
  | "containerd"
  | "coredns"
  | "cilium"
  | "istio"
  | "prometheus"
  | "grafana"
  | "opentelemetry"
  | "fluent-bit"
  | "argo-cd"
  | "helm"
  | "cert-manager"
  | "falco"
  | "kyverno"
  | "rook";

export interface LearningPack {
  whyItExists: string;
  analogy: string;
  howItWorks: string[];
  prerequisiteLessons: string[];
  levels: { beginner: string; intermediate: string; advanced: string };
  flows: DiagramFlow[];
  lab: Lab;
  quiz: QuizQuestion[];
  troubleshooting: TroubleshootingScenario[];
}

function q(
  id: string,
  prompt: LocalizedString,
  choices: LocalizedString[],
  correctIndex: number,
  explanation: LocalizedString,
): QuizQuestion {
  return { id, prompt, choices, correctIndex, explanation };
}

function labStep(
  id: string,
  title: LocalizedString,
  snippet: { language: "bash" | "yaml"; title: string; code: string },
  expectedOutput: string,
  whatHappened: LocalizedString,
  diagramComponentIds?: string[],
  diagramConnectionIds?: string[],
): LabStep {
  return {
    id,
    title,
    command: snippet,
    expectedOutput,
    whatHappened,
    diagramComponentIds,
    diagramConnectionIds,
  };
}

function basicLab(steps: LabStep[], exercise: Lab["exercise"]): Lab {
  return {
    kindSetup: kindSetupBasic,
    minikubeAlt,
    steps,
    exercise,
    cleanup: kindCleanup,
  };
}

function ciliumKindLab(steps: LabStep[], exercise: Lab["exercise"]): Lab {
  return {
    kindSetup: kindSetupNoCni,
    minikubeAlt,
    steps,
    exercise,
    cleanup: kindCleanup,
  };
}

function troubleshoot(
  id: string,
  symptom: LocalizedString,
  choices: TroubleshootingScenario["choices"],
  diagnosticCommands: TroubleshootingScenario["diagnosticCommands"],
  cause: LocalizedString,
  fix: LocalizedString,
): TroubleshootingScenario {
  return { id, symptom, choices, diagnosticCommands, cause, fix };
}

const kubernetesPack: LearningPack = {
  whyItExists:
    "Running many containers across machines needs scheduling, healing, and a shared API so teams can declare desired state instead of babysitting processes.",
  analogy:
    "Kubernetes is an air-traffic control tower: pilots (workloads) file flight plans (manifests); the tower assigns gates and runways (nodes) and reroutes when something fails.",
  howItWorks: [
    "You write declarative objects (Pods, Deployments, Services) to the API server over HTTPS.",
    "etcd stores object state; controllers reconcile desired vs actual; the scheduler binds Pods to Nodes.",
    "Each kubelet on a node pulls images via the container runtime (CRI) and reports status back to the API.",
    "Services and DNS give stable names to ephemeral Pods; Ingress/Gateway routes HTTP from outside.",
  ],
  prerequisiteLessons: [
    "container-image",
    "pod",
    "node-kubelet",
    "control-plane",
    "deployment-replicaset",
    "service-dns",
  ],
  levels: {
    beginner:
      "At the beginner level you treat Kubernetes as a remote API: kubectl apply creates Deployments that keep Pods running, and Services expose them inside the cluster. You learn to read Pod phases, use kubectl describe and logs, and understand that the control plane—not you—restarts failed containers. Local clusters (kind or minikube) are enough to practice the loop: manifest → apply → observe → fix typos.",
    intermediate:
      "Intermediate work connects real applications: ConfigMaps and Secrets for config, Namespaces for isolation, RBAC for who can change what, and Ingress or Gateway for north-south traffic. You reason about rollouts (maxUnavailable, maxSurge), probes (liveness/readiness), and resource requests/limits so the scheduler can place work safely. You also learn which components live in kube-system and how CoreDNS, CNI, and your runtime fit around the core API.",
    advanced:
      "Advanced operators extend the platform: CRDs and controllers encode domain logic; admission webhooks enforce policy; scheduling plugins and taints/tolerations shape placement. You design multi-team clusters (quotas, network policy, audit logs), plan upgrades and API deprecations, and understand failure domains—etcd backups, control-plane HA, and node drain/eviction during maintenance.",
  },
  flows: [
    {
      id: "k8s-declare-schedule",
      title: {
        en: "From manifest to running Pod",
        fa: "از manifest تا Pod در حال اجرا",
      },
      steps: [
        {
          caption: {
            en: "kubectl sends the Deployment to the API server.",
            fa: "kubectl Deployment را به API server می‌فرستد.",
          },
          connectionIds: ["users-api"],
          componentIds: ["users", "apiserver"],
        },
        {
          caption: {
            en: "The scheduler binds a new Pod to a Node.",
            fa: "scheduler یک Pod جدید را به Node متصل می‌کند.",
          },
          connectionIds: ["sched-api"],
          componentIds: ["scheduler", "apiserver"],
        },
        {
          caption: {
            en: "kubelet starts containers via the runtime on that Node.",
            fa: "kubelet از طریق runtime کانتینرها را روی همان Node اجرا می‌کند.",
          },
          connectionIds: ["kubelet-api", "kubelet-runtime", "runtime-pod"],
          componentIds: ["kubelet", "runtime", "app-pod"],
        },
      ],
    },
  ],
  lab: basicLab(
    [
      labStep(
        "verify-nodes",
        { en: "Verify cluster health", fa: "بررسی سلامت کلاستر" },
        {
          language: "bash",
          title: "Nodes and system pods",
          code: `kubectl get nodes
kubectl get pods -n kube-system`,
        },
        `NAME                 STATUS   ROLES           AGE   VERSION
cna-lab-control-plane  Ready    control-plane   2m    v1.xx.x
NAME                                   READY   STATUS    RESTARTS   AGE
coredns-xxxx                           1/1     Running   0          90s
kube-proxy-xxxx                        1/1     Running   0          90s`,
        {
          en: "Nodes report Ready when the CNI and kubelet are healthy; core add-ons run in kube-system.",
          fa: "وقتی CNI و kubelet سالم باشند Nodeها Ready می‌شوند؛ افزونه‌های اصلی در kube-system اجرا می‌شوند.",
        },
        ["apiserver", "kubelet"],
        ["kubelet-api"],
      ),
      labStep(
        "deploy-web",
        { en: "Deploy and expose nginx", fa: "استقرار و expose کردن nginx" },
        {
          language: "yaml",
          title: "web.yaml",
          code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 2
  selector:
    matchLabels: { app: web }
  template:
    metadata:
      labels: { app: web }
    spec:
      containers:
        - name: web
          image: nginx:1.27-alpine
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  selector: { app: web }
  ports:
    - port: 80
      targetPort: 80`,
        },
        `deployment.apps/web created
service/web created`,
        {
          en: "The Deployment controller creates ReplicaSets and Pods; the Service gets a ClusterIP and Endpoints.",
          fa: "کنترلر Deployment، ReplicaSet و Pod می‌سازد؛ Service یک ClusterIP و Endpoints می‌گیرد.",
        },
        ["app-pod", "svc", "controller-manager"],
        ["svc-pod", "cm-api"],
      ),
      labStep(
        "test-web",
        { en: "Test the Service", fa: "تست Service" },
        {
          language: "bash",
          title: "Rollout and port-forward",
          code: `kubectl rollout status deploy/web
kubectl port-forward svc/web 8080:80 &
curl -sI http://127.0.0.1:8080 | head -3`,
        },
        `deployment "web" successfully rolled out
HTTP/1.1 200 OK
Server: nginx/1.27.x`,
        {
          en: "Port-forward tunnels Service traffic to your laptop for a quick smoke test.",
          fa: "port-forward ترافیک Service را برای تست سریع به لپ‌تاپ شما می‌آورد.",
        },
        ["svc", "app-pod", "users"],
        ["users-api", "svc-pod"],
      ),
    ],
    {
      prompt: {
        en: "Scale web to 3 replicas and confirm with kubectl get pods.",
        fa: "web را به ۳ replica scale کنید و با kubectl get pods تأیید کنید.",
      },
      solution: {
        language: "bash",
        title: "Scale",
        code: `kubectl scale deploy/web --replicas=3
kubectl get pods -l app=web`,
      },
    },
  ),
  quiz: [
    q(
      "k8s-q1",
      {
        en: "Which component stores Kubernetes object data?",
        fa: "کدام جزء دادهٔ آبجکت‌های Kubernetes را نگه می‌دارد؟",
      },
      [
        { en: "kubelet", fa: "kubelet" },
        { en: "etcd", fa: "etcd" },
        { en: "kube-proxy", fa: "kube-proxy" },
      ],
      1,
      {
        en: "The API server persists state in etcd; kubelets only report node-local status.",
        fa: "API server وضعیت را در etcd ذخیره می‌کند؛ kubelet فقط وضعیت محلی Node را گزارش می‌دهد.",
      },
    ),
    q(
      "k8s-q2",
      {
        en: "What is the smallest schedulable unit in Kubernetes?",
        fa: "کوچک‌ترین واحد قابل زمان‌بندی در Kubernetes چیست؟",
      },
      [
        { en: "Container", fa: "Container" },
        { en: "Pod", fa: "Pod" },
        { en: "Deployment", fa: "Deployment" },
      ],
      1,
      {
        en: "Pods wrap one or more containers sharing network/storage; Deployments manage Pod templates.",
        fa: "Pod یک یا چند کانتینر با شبکه/ذخیره مشترک را در بر می‌گیرد؛ Deployment قالب Pod را مدیریت می‌کند.",
      },
    ),
    q(
      "k8s-q3",
      {
        en: "Who assigns a Pod to a Node?",
        fa: "Pod را به کدام Node اختصاص می‌دهد؟",
      },
      [
        { en: "kube-scheduler", fa: "kube-scheduler" },
        { en: "kube-proxy", fa: "kube-proxy" },
        { en: "CoreDNS", fa: "CoreDNS" },
      ],
      0,
      {
        en: "The scheduler watches unbound Pods and writes nodeName via the API.",
        fa: "scheduler Podهای بدون node را watch می‌کند و nodeName را از API می‌نویسد.",
      },
    ),
  ],
  troubleshooting: [
    troubleshoot(
      "k8s-pending",
      {
        en: "Pods stay Pending; events mention insufficient cpu or no nodes.",
        fa: "Podها Pending می‌مانند؛ رویدادها کمبود cpu یا نبود Node می‌گویند.",
      },
      [
        {
          label: {
            en: "Check node capacity and Pod resource requests",
            fa: "ظرفیت Node و resource requestهای Pod را بررسی کنید",
          },
          correct: true,
          feedback: {
            en: "Right—Pending often means scheduling cannot fit requests or no Ready nodes exist.",
            fa: "درست—Pending اغلب یعنی scheduler نمی‌تواند requestها را جا دهد یا Node Ready نیست.",
          },
        },
        {
          label: {
            en: "Restart etcd to fix scheduling",
            fa: "etcd را ری‌استارت کنید تا scheduling درست شود",
          },
          correct: false,
          feedback: {
            en: "etcd issues affect the whole API; Pending is usually scheduling/resources.",
            fa: "مشکل etcd کل API را تحت تأثیر می‌گذارد؛ Pending معمولاً scheduling/منابع است.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "Describe Pod",
          code: `kubectl describe pod <name>
kubectl get nodes -o wide
kubectl describe nodes | grep -A5 "Allocated resources"`,
        },
      ],
      {
        en: "Requests exceed free capacity, taints block placement, or no worker is Ready.",
        fa: "requestها از ظرفیت آزاد بیشترند، taint مانع placement است، یا worker Ready نیست.",
      },
      {
        en: "Add nodes, lower requests, add tolerations, or fix NotReady nodes/CNI.",
        fa: "Node اضافه کنید، request کم کنید، toleration بگذارید، یا Node/CNI NotReady را درست کنید.",
      },
    ),
    troubleshoot(
      "k8s-crashloop",
      {
        en: "Pod is CrashLoopBackOff after apply.",
        fa: "Pod بعد از apply در CrashLoopBackOff است.",
      },
      [
        {
          label: {
            en: "Read container logs and the last termination message",
            fa: "لاگ کانتینر و پیام آخرین termination را بخوانید",
          },
          correct: true,
          feedback: {
            en: "Correct—the app or command usually exits with an error visible in logs.",
            fa: "درست—اپ یا دستور معمولاً با خطایی در لاگ خارج می‌شود.",
          },
        },
        {
          label: {
            en: "Delete the Deployment to reset etcd",
            fa: "Deployment را حذف کنید تا etcd ریست شود",
          },
          correct: false,
          feedback: {
            en: "Deleting hides the symptom; logs and describe explain the crash.",
            fa: "حذف فقط علامت را پنهان می‌کند؛ logs و describe علت crash را نشان می‌دهند.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "Logs",
          code: `kubectl logs <pod> --previous
kubectl describe pod <pod> | tail -20`,
        },
      ],
      {
        en: "Bad command, missing config, or failing readiness/liveness causing restarts.",
        fa: "دستور اشتباه، پیکربندی گم‌شده، یا probe ناموفق باعث restart می‌شود.",
      },
      {
        en: "Fix the image command/env, mount required Secrets, or adjust probes.",
        fa: "دستور/env image را درست کنید، Secret لازم mount کنید، یا probeها را تنظیم کنید.",
      },
    ),
  ],
};

const containerdPack: LearningPack = {
  whyItExists:
    "Kubernetes nodes need a CRI-compatible runtime to pull images, create containers, and manage lifecycle without bundling a full Docker Engine on every node.",
  analogy:
    "containerd is the kitchen that actually cooks: Kubernetes (kubelet) sends orders; containerd pulls ingredients (images) and plates dishes (containers).",
  howItWorks: [
    "kubelet talks to containerd through the CRI plugin over a local gRPC socket.",
    "containerd uses containerd-shim processes so kubelet can restart without killing running containers.",
    "Images are stored in content-addressable layers; snapshots provide the container root filesystem.",
    "ctr and nerdctl are CLIs for debugging the same daemon kubelet uses.",
  ],
  prerequisiteLessons: ["container-image", "pod", "node-kubelet"],
  levels: {
    beginner:
      "Beginners learn that containerd—not kubectl—runs containers on the node. You verify the socket, list images with crictl, and map Pod specs to running containers. On kind/minikube the runtime is already configured; your job is to recognize CRI errors in kubelet logs when pulls fail.",
    intermediate:
      "Intermediate topics cover image pull secrets, registry mirrors, snapshotters (overlayfs vs native), and garbage collection of unused images. You debug ImagePullBackOff by inspecting crictl pull on the node and understand how pause containers hold the Pod network namespace.",
    advanced:
      "Advanced users tune runtime classes, use custom snapshotters for specialized storage, integrate with NRI (Node Resource Interface), and harden the daemon (rootless where supported, TLS for remote registries, audit of ctr operations in multi-tenant nodes).",
  },
  flows: [
    {
      id: "cri-pull-run",
      title: { en: "CRI pull and run", fa: "pull و run از مسیر CRI" },
      steps: [
        {
          caption: {
            en: "kubelet receives PodSpec from the API server.",
            fa: "kubelet PodSpec را از API server می‌گیرد.",
          },
          connectionIds: ["kubelet-api"],
          componentIds: ["kubelet", "apiserver"],
        },
        {
          caption: {
            en: "kubelet calls containerd over CRI to pull the image.",
            fa: "kubelet از CRI برای pull image به containerd درخواست می‌دهد.",
          },
          connectionIds: ["kubelet-runtime"],
          componentIds: ["kubelet", "runtime"],
        },
        {
          caption: {
            en: "containerd starts the workload container in the Pod.",
            fa: "containerd کانتینر workload را در Pod اجرا می‌کند.",
          },
          connectionIds: ["runtime-pod"],
          componentIds: ["runtime", "app-pod"],
        },
      ],
    },
  ],
  lab: basicLab(
    [
      labStep(
        "crictl-images",
        { en: "Inspect runtime images", fa: "بررسی imageهای runtime" },
        {
          language: "bash",
          title: "crictl on kind node",
          code: `docker exec cna-lab-control-plane crictl images | head -5
kubectl run demo --image=nginx:1.27-alpine --restart=Never
kubectl wait --for=condition=Ready pod/demo --timeout=60s
docker exec cna-lab-control-plane crictl ps | grep demo`,
        },
        `IMAGE                                     TAG                 IMAGE ID
registry.k8s.io/pause:3.9                  3.9                 ...
docker.io/library/nginx                    1.27-alpine         ...
demo                                       0                   Running             ...`,
        {
          en: "crictl lists what the kubelet's CRI runtime sees—images and running sandboxes/containers.",
          fa: "crictl آنچه runtime CRI kubelet می‌بیند—imageها و sandbox/کانتینر در حال اجرا—را لیست می‌کند.",
        },
        ["runtime", "kubelet", "app-pod"],
        ["kubelet-runtime", "runtime-pod"],
      ),
    ],
    {
      prompt: {
        en: "Delete pod demo and confirm the container disappears from crictl ps.",
        fa: "pod demo را حذف کنید و ناپدید شدن کانتینر از crictl ps را تأیید کنید.",
      },
      solution: {
        language: "bash",
        title: "Delete pod",
        code: `kubectl delete pod demo --wait=true
docker exec cna-lab-control-plane crictl ps -a | grep demo || echo "gone"`,
      },
    },
  ),
  quiz: [
    q(
      "ctd-q1",
      { en: "Which protocol does kubelet use to talk to containerd?", fa: "kubelet با containerd با کدام پروتکل صحبت می‌کند؟" },
      [{ en: "CRI (gRPC)", fa: "CRI (gRPC)" }, { en: "SSH", fa: "SSH" }, { en: "SNMP", fa: "SNMP" }],
      0,
      { en: "The Container Runtime Interface is the supported kubelet ↔ runtime API.", fa: "CRI API رسمی بین kubelet و runtime است." },
    ),
    q(
      "ctd-q2",
      { en: "Which CLI is designed for the Kubernetes CRI?", fa: "کدام CLI برای CRI Kubernetes طراحی شده؟" },
      [{ en: "docker", fa: "docker" }, { en: "crictl", fa: "crictl" }, { en: "kubectl", fa: "kubectl" }],
      1,
      { en: "crictl talks to any CRI runtime; docker CLI talks to Docker Engine.", fa: "crictl با هر runtime CRI کار می‌کند؛ docker CLI با Docker Engine." },
    ),
    q(
      "ctd-q3",
      { en: "Where do containers actually execute?", fa: "کانتینرها واقعاً کجا اجرا می‌شوند؟" },
      [{ en: "On the control plane only", fa: "فقط روی control plane" }, { en: "On worker nodes via the runtime", fa: "روی worker از طریق runtime" }, { en: "Inside etcd", fa: "داخل etcd" }],
      1,
      { en: "Workloads run on nodes; the control plane orchestrates.", fa: "workload روی Nodeها اجرا می‌شود؛ control plane هماهنگ می‌کند." },
    ),
  ],
  troubleshooting: [
    troubleshoot(
      "ctd-imagepull",
      { en: "Pod events: Failed to pull image / ImagePullBackOff.", fa: "رویداد Pod: Failed to pull image / ImagePullBackOff." },
      [
        { label: { en: "Verify image name, tag, and registry auth on the node", fa: "نام image، tag و auth رجیستری روی Node را بررسی کنید" }, correct: true, feedback: { en: "Yes—CRI pull errors are usually typo, missing tag, or secret.", fa: "بله—خطای pull CRI معمولاً typo، tag یا secret است." } },
        { label: { en: "Reinstall Kubernetes to fix containerd", fa: "Kubernetes را دوباره نصب کنید" }, correct: false, feedback: { en: "Rarely needed; fix pull path and credentials first.", fa: "به‌ندرت لازم است؛ اول مسیر pull و credential را درست کنید." } },
      ],
      [{ language: "bash", title: "Events", code: `kubectl describe pod <name> | grep -A3 Events\nkubectl get events --field-selector involvedObject.name=<name>` }],
      { en: "Wrong reference, private registry without imagePullSecret, or network/DNS blocking registry.", fa: "ارجاع اشتباه، رجیستری خصوصی بدون imagePullSecret، یا شبکه/DNS مانع رجیستری." },
      { en: "Fix image string, add imagePullSecret, or test crictl pull on the node.", fa: "رشته image را درست کنید، imagePullSecret اضافه کنید، یا crictl pull روی Node تست کنید." },
    ),
    troubleshoot(
      "ctd-sandbox",
      { en: "Pod stuck in ContainerCreating; CRI sandbox errors in kubelet log.", fa: "Pod در ContainerCreating گیر کرده؛ خطای sandbox CRI در لاگ kubelet." },
      [
        { label: { en: "Check kubelet and containerd logs on the node", fa: "لاگ kubelet و containerd روی Node را ببینید" }, correct: true, feedback: { en: "Correct—sandbox creation failures show in runtime/kubelet logs.", fa: "درست—شکست ساخت sandbox در لاگ runtime/kubelet دیده می‌شود." } },
        { label: { en: "Scale the Deployment to zero", fa: "Deployment را به صفر scale کنید" }, correct: false, feedback: { en: "That avoids the workload but does not diagnose CRI.", fa: "workload را حذف می‌کند ولی CRI را تشخیص نمی‌دهد." } },
      ],
      [{ language: "bash", title: "Node logs", code: `journalctl -u kubelet -n 50\njournalctl -u containerd -n 50` }],
      { en: "Corrupt snapshot, full disk, or containerd not running on the node.", fa: "snapshot خراب، دیسک پر، یا containerd روی Node اجرا نیست." },
      { en: "Free disk space, restart containerd/kubelet, remove stale sandboxes with crictl.", fa: "فضای دیسک آزاد کنید، containerd/kubelet را restart کنید، sandboxهای کهنه را با crictl پاک کنید." },
    ),
  ],
};

const corednsPack: LearningPack = {
  whyItExists:
    "Pods and Services need stable DNS names inside the cluster; CoreDNS implements the Kubernetes DNS spec so apps can discover each other without hard-coded IPs.",
  analogy:
    "CoreDNS is the cluster phone book: when you dial my-svc.my-ns.svc.cluster.local, it looks up the current Pod IPs behind the Service.",
  howItWorks: [
    "kubelet configures Pods to use the cluster DNS Service IP (kube-dns in kube-system).",
    "CoreDNS pods run as a Deployment; the kube-dns Service load-balances queries to them.",
    "The Corefile chains plugins: kubernetes for cluster.local, forward for upstream, health for probes.",
    "DNS records for Services and Pods come from the API via the kubernetes plugin.",
  ],
  prerequisiteLessons: ["service-dns", "pod", "deployment-replicaset"],
  levels: {
    beginner:
      "Beginners confirm CoreDNS is Running in kube-system, run nslookup from a debug Pod, and learn the naming pattern service.namespace.svc.cluster.local. You treat DNS failures as either CoreDNS down or wrong Service name/namespace.",
    intermediate:
      "Intermediate admins edit the Corefile ConfigMap (custom stub domains, upstream forwarders), scale CoreDNS for QPS, and correlate NetworkPolicy drops to DNS timeouts. You understand headless vs ClusterIP Services and how records differ.",
    advanced:
      "Advanced setups run NodeLocal DNSCache, split horizon (internal vs external resolvers), expose DNS metrics, and debug plugin chains (rewrite, template, hosts) for multi-cluster or service-mesh stub domains.",
  },
  flows: [
    {
      id: "dns-query",
      title: { en: "In-cluster DNS lookup", fa: "جستجوی DNS داخل کلاستر" },
      steps: [
        {
          caption: { en: "App Pod sends a query to the kube-dns ClusterIP.", fa: "Pod اپ کوئری را به ClusterIP kube-dns می‌فرستد." },
          connectionIds: ["pod-coredns"],
          componentIds: ["app-pod", "coredns-svc"],
        },
        {
          caption: { en: "CoreDNS answers using Kubernetes Service/Endpoint data.", fa: "CoreDNS با داده Service/Endpoint پاسخ می‌دهد." },
          connectionIds: ["coredns-api", "coredns-svc-pods"],
          componentIds: ["coredns", "apiserver", "svc"],
        },
      ],
    },
  ],
  lab: basicLab(
    [
      labStep(
        "coredns-check",
        { en: "Confirm CoreDNS", fa: "تأیید CoreDNS" },
        { language: "bash", title: "kube-system DNS", code: `kubectl -n kube-system get deploy coredns
kubectl -n kube-system get svc kube-dns
kubectl -n kube-system get pods -l k8s-app=kube-dns` },
        `NAME      READY   UP-TO-DATE   AVAILABLE
coredns     2/2     2            2
NAME       TYPE        CLUSTER-IP   PORT(S)
kube-dns   ClusterIP   10.96.0.10   53/UDP,53/TCP
coredns-...   1/1   Running`,
        { en: "CoreDNS backs the kube-dns Service; Pods use the ClusterIP as nameserver.", fa: "CoreDNS پشت Service kube-dns است؛ Podها ClusterIP را nameserver می‌گیرند." },
        ["coredns", "coredns-svc"],
      ),
      labStep(
        "dns-lookup",
        { en: "Resolve kubernetes.default", fa: "resolve کردن kubernetes.default" },
        { language: "bash", title: "nslookup", code: `kubectl run -it --rm dns-test --image=busybox:1.36 --restart=Never -- \\
  nslookup kubernetes.default.svc.cluster.local` },
        `Server:    10.96.0.10
Address 1: 10.96.0.10 kube-dns.kube-system.svc.cluster.local
Name:      kubernetes.default.svc.cluster.local
Address 1: 10.96.0.1`,
        { en: "The cluster DNS Service IP answers; kubernetes.default points at the API Service.", fa: "ClusterIP DNS پاسخ می‌دهد؛ kubernetes.default به Service API اشاره می‌کند." },
        ["app-pod", "coredns", "svc"],
        ["pod-coredns"],
      ),
    ],
    {
      prompt: { en: "Expose a Deployment and nslookup its full DNS name.", fa: "یک Deployment را expose کنید و نام DNS کامل آن را nslookup کنید." },
      solution: {
        language: "bash",
        title: "Service DNS",
        code: `kubectl create deploy dns-demo --image=nginx:1.27-alpine
kubectl expose deploy dns-demo --port=80
kubectl run -it --rm dns-test2 --image=busybox:1.36 --restart=Never -- \\
  nslookup dns-demo.default.svc.cluster.local`,
      },
    },
  ),
  quiz: [
    q("dns-q1", { en: "Default cluster DNS domain suffix?", fa: "پسوند پیش‌فرض دامنه DNS کلاستر؟" }, [{ en: "cluster.local", fa: "cluster.local" }, { en: "kubernetes.io", fa: "kubernetes.io" }, { en: "svc.local", fa: "svc.local" }], 0, { en: "Service FQDNs end in .svc.cluster.local by default.", fa: "FQDN Serviceها به‌طور پیش‌فرض با .svc.cluster.local تمام می‌شود." }),
    q("dns-q2", { en: "Where is CoreDNS config stored?", fa: "پیکربندی CoreDNS کجا ذخیره می‌شود؟" }, [{ en: "ConfigMap coredns", fa: "ConfigMap coredns" }, { en: "Secret etcd", fa: "Secret etcd" }, { en: "kubelet config", fa: "پیکربندی kubelet" }], 0, { en: "The Corefile lives in the coredns ConfigMap.", fa: "Corefile در ConfigMap coredns است." }),
    q("dns-q3", { en: "Which object provides the DNS server IP to Pods?", fa: "کدام آبجکت IP سرور DNS را به Pod می‌دهد؟" }, [{ en: "kube-dns Service", fa: "Service kube-dns" }, { en: "Ingress", fa: "Ingress" }, { en: "PersistentVolume", fa: "PersistentVolume" }], 0, { en: "kubelet sets resolv.conf to the kube-dns ClusterIP.", fa: "kubelet resolv.conf را روی ClusterIP kube-dns تنظیم می‌کند." }),
  ],
  troubleshooting: [
    troubleshoot(
      "dns-timeout",
      { en: "Apps report dial tcp: lookup foo: i/o timeout.", fa: "اپ‌ها dial tcp: lookup foo: i/o timeout گزارش می‌کنند." },
      [
        { label: { en: "Test DNS from a debug Pod and check CoreDNS pods", fa: "DNS را از Pod دیباگ تست کنید و Podهای CoreDNS را ببینید" }, correct: true, feedback: { en: "Good—separates app bug from cluster DNS outage.", fa: "خوب—باگ اپ را از outage DNS جدا می‌کند." } },
        { label: { en: "Recreate all Deployments", fa: "همه Deploymentها را دوباره بسازید" }, correct: false, feedback: { en: "Unlikely to fix DNS infrastructure.", fa: "احتمالاً زیرساخت DNS را درست نمی‌کند." } },
      ],
      [{ language: "bash", title: "DNS debug", code: `kubectl -n kube-system logs -l k8s-app=kube-dns --tail=30\nkubectl run -it --rm dbg --image=busybox:1.36 --restart=Never -- nslookup kubernetes.default` }],
      { en: "CoreDNS down, NetworkPolicy blocking UDP/53, or broken Corefile forward.", fa: "CoreDNS down، NetworkPolicy مانع UDP/53، یا forward شکسته در Corefile." },
      { en: "Restore CoreDNS pods, fix policies, validate Corefile with kubectl edit configmap coredns.", fa: "Podهای CoreDNS را برگردانید، policy را درست کنید، Corefile را با edit configmap coredns اعتبارسنجی کنید." },
    ),
    troubleshoot(
      "dns-nxdomain",
      { en: "Valid Service name returns NXDOMAIN.", fa: "نام Service معتبر NXDOMAIN برمی‌گرداند." },
      [
        { label: { en: "Verify namespace and use the full FQDN", fa: "namespace را چک کنید و FQDN کامل بزنید" }, correct: true, feedback: { en: "Short names depend on search domains; typos cause NXDOMAIN.", fa: "نام کوتاه به search domain وابسته است؛ typo باعث NXDOMAIN می‌شود." } },
        { label: { en: "Restart etcd", fa: "etcd را restart کنید" }, correct: false, feedback: { en: "etcd does not serve application DNS records directly.", fa: "etcd مستقیماً رکورد DNS اپ را سرو نمی‌دهد." } },
      ],
      [{ language: "bash", title: "Service check", code: `kubectl get svc -A | grep <name>\nkubectl get endpoints <name> -n <ns>` }],
      { en: "Wrong name/namespace or Service without selectors/endpoints.", fa: "نام/namespace اشتباه یا Service بدون selector/endpoints." },
      { en: "Fix Service selector; ensure Endpoints exist; query svc.ns.svc.cluster.local.", fa: "selector Service را درست کنید؛ Endpoints باشد؛ svc.ns.svc.cluster.local را بزنید." },
    ),
  ],
};

const ciliumPack: LearningPack = {
  whyItExists:
    "Clusters need a CNI for pod networking, scalable kube-proxy replacement, identity-aware policy, and observability—Cilium delivers these with eBPF in the Linux kernel.",
  analogy:
    "Cilium is a smart border patrol with X-ray vision (eBPF): it sees every packet by identity (labels), not just IP addresses, and stamps passports (policies) at wire speed.",
  howItWorks: [
    "cilium-agent runs on each node as a DaemonSet and loads eBPF programs for routing, NAT, and policy.",
    "cilium-operator reconciles cluster-wide CRDs and IPAM pools via the Kubernetes API.",
    "CiliumNetworkPolicy selects endpoints by labels and enforces L3-L7 rules in the datapath.",
    "Hubble (optional) observes flows derived from the same eBPF maps.",
  ],
  prerequisiteLessons: ["pod", "service-dns", "node-kubelet", "daemonset"],
  levels: {
    beginner:
      "Beginners install Cilium as the sole CNI on a test cluster (often kind without default CNI), wait for nodes Ready, and apply a simple allow/deny policy between labeled Pods. You use cilium status and kubectl get ds -n kube-system.",
    intermediate:
      "Intermediate users enable Hubble, write CiliumNetworkPolicy with toPorts and HTTP rules, replace kube-proxy with eBPF masquerading, and debug policy drops with hubble observe. You understand security identities and DNS-aware policy.",
    advanced:
      "Advanced platforms enable cluster mesh, Gateway API, WireGuard encryption, BGP, and bandwidth management. You tune BPF maps, kernel requirements, and upgrade paths without dual CNI conflicts.",
  },
  flows: [
    {
      id: "cilium-policy",
      title: { en: "Policy enforced in eBPF", fa: "اعمال policy در eBPF" },
      steps: [
        {
          caption: { en: "You apply a CiliumNetworkPolicy to the API server.", fa: "CiliumNetworkPolicy را به API server اعمال می‌کنید." },
          componentIds: ["cilium-crd", "apiserver", "users"],
          connectionIds: ["users-api"],
        },
        {
          caption: { en: "Agents watch policies and compile them into eBPF on each node.", fa: "agentها policy را watch و در eBPF هر Node compile می‌کنند." },
          componentIds: ["cilium-agent", "cilium-crd"],
          connectionIds: ["agent-api", "operator-api"],
        },
        {
          caption: { en: "Traffic to Pods is allowed or dropped at the datapath.", fa: "ترافیک به Podها در datapath مجاز یا drop می‌شود." },
          componentIds: ["cilium-agent", "app-pod"],
          connectionIds: ["agent-pod"],
        },
      ],
    },
  ],
  lab: ciliumKindLab(
    [
      labStep(
        "install-cilium",
        { en: "Install Cilium with Helm", fa: "نصب Cilium با Helm" },
        { language: "bash", title: "Helm", code: `helm repo add cilium https://helm.cilium.io/
helm repo update
helm install cilium cilium/cilium --namespace kube-system \\
  --set operator.replicas=1
kubectl -n kube-system rollout status ds/cilium --timeout=120s
kubectl get nodes` },
        `STATUS: Deployed
cilium   2/2   2   2   60s
NAME                       STATUS   ROLES           AGE
cna-cilium-control-plane   Ready    control-plane   3m
cna-cilium-worker          Ready    <none>          3m`,
        { en: "Helm installs agent DaemonSet and operator; nodes become Ready once the CNI is up.", fa: "Helm agent DaemonSet و operator نصب می‌کند؛ با بالا آمدن CNI Nodeها Ready می‌شوند." },
        ["cilium-agent", "cilium-operator"],
        ["agent-api"],
      ),
      labStep(
        "cilium-status",
        { en: "Verify Cilium", fa: "تأیید Cilium" },
        { language: "bash", title: "cilium status", code: `cilium status --wait
kubectl -n kube-system get pods -l k8s-app=cilium` },
        `OK   Cilium:         OK
OK   Cluster Pods:   2/2 managed by Cilium
cilium-xxxxx   1/1   Running`,
        { en: "cilium CLI confirms datapath health from a machine with kubeconfig access.", fa: "CLI cilium سلامت datapath را با دسترسی kubeconfig تأیید می‌کند." },
        ["cilium-agent"],
      ),
    ],
    {
      prompt: { en: "Run cilium connectivity test (lab) after install.", fa: "بعد از نصب cilium connectivity test را اجرا کنید." },
      solution: { language: "bash", title: "Connectivity", code: `cilium connectivity test` },
    },
  ),
  quiz: [
    q("cil-q1", { en: "Why use kind with disableDefaultCNI for Cilium labs?", fa: "چرا kind با disableDefaultCNI برای لاب Cilium؟" }, [{ en: "Avoid two CNIs fighting", fa: "جلوگیری از تداخل دو CNI" }, { en: "Disable Kubernetes", fa: "غیرفعال کردن Kubernetes" }, { en: "Skip etcd", fa: "رد شدن از etcd" }], 0, { en: "Only one CNI should manage pod networking.", fa: "فقط یک CNI باید شبکه Pod را مدیریت کند." }),
    q("cil-q2", { en: "Cilium agent runs as which controller type?", fa: "agent Cilium به‌صورت کدام نوع controller اجرا می‌شود؟" }, [{ en: "DaemonSet", fa: "DaemonSet" }, { en: "CronJob", fa: "CronJob" }, { en: "StatefulSet only", fa: "فقط StatefulSet" }], 0, { en: "Every node needs a local agent.", fa: "هر Node به agent محلی نیاز دارد." }),
    q("cil-q3", { en: "CiliumNetworkPolicy is which API kind?", fa: "CiliumNetworkPolicy چه نوع API است؟" }, [{ en: "Cilium CRD", fa: "CRD Cilium" }, { en: "Built-in Ingress", fa: "Ingress داخلی" }, { en: "Pod spec field", fa: "فیلد spec Pod" }], 0, { en: "Policy is a custom resource under cilium.io.", fa: "policy یک custom resource تحت cilium.io است." }),
  ],
  troubleshooting: [
    troubleshoot(
      "cil-notready",
      { en: "Nodes stay NotReady after kind create with disableDefaultCNI.", fa: "Nodeها بعد از kind با disableDefaultCNI NotReady می‌مانند." },
      [
        { label: { en: "Install Cilium (or another CNI) before expecting Ready", fa: "قبل از Ready انتظار، Cilium (یا CNI دیگر) نصب کنید" }, correct: true, feedback: { en: "Expected until a CNI is installed.", fa: "تا نصب CNI طبیعی است." } },
        { label: { en: "Increase etcd quota", fa: "سهمیه etcd را زیاد کنید" }, correct: false, feedback: { en: "Not related to CNI readiness.", fa: "به Ready بودن CNI ربطی ندارد." } },
      ],
      [{ language: "bash", title: "CNI check", code: `kubectl get nodes\nkubectl -n kube-system get ds cilium` }],
      { en: "No CNI installed yet or cilium-agent crash looping.", fa: "هنوز CNI نصب نشده یا cilium-agent crash loop دارد." },
      { en: "Complete Helm install; check agent logs and kernel/eBPF support.", fa: "نصب Helm را کامل کنید؛ لاگ agent و پشتیبانی kernel/eBPF را ببینید." },
    ),
    troubleshoot(
      "cil-policy-drop",
      { en: "Pod A cannot reach Pod B after applying a policy.", fa: "Pod A بعد از policy به Pod B نمی‌رسد." },
      [
        { label: { en: "Verify labels match endpointSelector and default deny", fa: "labelها با endpointSelector و default deny را چک کنید" }, correct: true, feedback: { en: "Policies are label-driven; missing allow rules drop traffic.", fa: "policy برچسب‌محور است؛ allow نبود ترافیک drop می‌شود." } },
        { label: { en: "Delete kube-apiserver", fa: "kube-apiserver را حذف کنید" }, correct: false, feedback: { en: "Never—fix policy instead.", fa: "هرگز—policy را درست کنید." } },
      ],
      [{ language: "bash", title: "Hubble/policy", code: `kubectl get ciliumnetworkpolicy\nhubble observe --pod <pod-a> --follow` }],
      { en: "Selector mismatch, port/protocol typo, or implicit deny in Cilium.", fa: "selector نمی‌خواند، port/protocol اشتباه، یا deny ضمنی در Cilium." },
      { en: "Fix labels/ports; use hubble observe to see VERDICT DROPPED.", fa: "label/port را درست کنید؛ hubble observe برای VERDICT DROPPED." },
    ),
  ],
};

const istioPack: LearningPack = {
  whyItExists:
    "Microservices need mutual TLS, traffic shaping, and deep L7 observability without rewriting every app—Istio injects Envoy sidecars and a control plane (istiod) to manage mesh behavior.",
  analogy:
    "Istio is a concierge on every floor (sidecar): guests (apps) speak locally to the concierge, and the concierge handles secure calls, routing, and receipts (telemetry) to other floors.",
  howItWorks: [
    "istiod pushes configuration (xDS) to Envoy proxies in each injected Pod.",
    "Sidecars intercept inbound/outbound traffic via iptables or eBPF redirection (depends on mode/profile).",
    "VirtualService and DestinationRule define routing, subsets, and load-balancing.",
    "PeerAuthentication and AuthorizationPolicy enforce mTLS and L7 authz.",
  ],
  prerequisiteLessons: ["service-dns", "sidecar", "ingress", "deployment-replicaset"],
  levels: {
    beginner:
      "Beginners install istiod with istioctl, label a namespace for injection, and confirm 2/2 containers (app + istio-proxy). You apply a simple VirtualService split and use istioctl proxy-status to see sync.",
    intermediate:
      "Intermediate mesh users configure mTLS STRICT, fault injection, retries/timeouts, Gateway for ingress, and export metrics/traces to Prometheus/Jaeger. You debug 503s with istioctl analyze and access logs.",
    advanced:
      "Advanced teams adopt ambient mode or multi-cluster, canary with Argo Rollouts, WASM extensions, and fine-grained AuthorizationPolicy. You plan revision-based upgrades and minimal-privilege sidecar resources.",
  },
  flows: [
    {
      id: "istio-traffic",
      title: { en: "Sidecar mediates traffic", fa: "sidecar واسط ترافیک" },
      steps: [
        {
          caption: { en: "istiod watches Istio CRs and pushes config to proxies.", fa: "istiod CRهای Istio را watch و config به proxy می‌فرستد." },
          componentIds: ["istiod", "apiserver"],
          connectionIds: ["istiod-api"],
        },
        {
          caption: { en: "Envoy sidecar intercepts calls to and from the app container.", fa: "sidecar Envoy فراخوان‌ها به/از کانتینر اپ را intercept می‌کند." },
          componentIds: ["envoy-sidecar", "app-pod"],
          connectionIds: ["sidecar-istiod", "sidecar-app"],
        },
        {
          caption: { en: "East-west traffic flows through peer sidecars with mesh policy.", fa: "ترافیک east-west از sidecarهای peer با policy mesh عبور می‌کند." },
          componentIds: ["envoy-sidecar", "app-pod"],
          connectionIds: ["sidecar-sidecar"],
        },
      ],
    },
  ],
  lab: basicLab(
    [
      labStep(
        "istio-install",
        { en: "Install Istio demo profile", fa: "نصب پروفایل demo Istio" },
        { language: "bash", title: "istioctl install", code: `istioctl install --set profile=demo -y
kubectl get ns istio-system
kubectl -n istio-system get pods` },
        `✔ Istio core installed
istio-system   Active   10s
istiod-...              1/1   Running
istio-ingressgateway-... 1/1   Running`,
        { en: "istioctl installs control plane and default ingress gateway into istio-system.", fa: "istioctl control plane و ingress gateway پیش‌فرض را در istio-system نصب می‌کند." },
        ["istiod", "istio-gateways"],
        ["istiod-api"],
      ),
      labStep(
        "istio-inject",
        { en: "Enable injection and check sidecars", fa: "فعال‌سازی injection و بررسی sidecar" },
        { language: "bash", title: "Injection label", code: `kubectl label namespace default istio-injection=enabled --overwrite
kubectl create deploy sleep --image=curlimages/curl:8.5.0 -- sleep 3600
kubectl wait --for=condition=Available deploy/sleep --timeout=90s
kubectl get pod -l app=sleep -o jsonpath='{.items[0].spec.containers[*].name}'` },
        `istio-injection=enabled
sleep istio-proxy`,
        { en: "Mutating webhook injects istio-proxy when the namespace label is set.", fa: "webhook mutating با label namespace، istio-proxy inject می‌کند." },
        ["envoy-sidecar", "app-pod"],
        ["sidecar-app"],
      ),
    ],
    {
      prompt: { en: "Run istioctl analyze and fix any reported errors.", fa: "istioctl analyze را اجرا کنید و خطاها را برطرف کنید." },
      solution: { language: "bash", title: "Analyze", code: `istioctl analyze` },
    },
  ),
  quiz: [
    q("ist-q1", { en: "Which container is injected beside your app?", fa: "کنار اپ کدام کانتینر inject می‌شود؟" }, [{ en: "istio-proxy (Envoy)", fa: "istio-proxy (Envoy)" }, { en: "etcd", fa: "etcd" }, { en: "coredns", fa: "coredns" }], 0, { en: "The data plane proxy is Envoy.", fa: "پروکسی data plane همان Envoy است." }),
    q("ist-q2", { en: "Primary Istio control plane component?", fa: "جزء اصلی control plane Istio؟" }, [{ en: "istiod", fa: "istiod" }, { en: "kube-scheduler", fa: "kube-scheduler" }, { en: "containerd", fa: "containerd" }], 0, { en: "istiod combines pilot, citadel, galley responsibilities.", fa: "istiod نقش pilot و بخش‌های امنیت/پیکربندی را ادغام کرده." }),
    q("ist-q3", { en: "VirtualService primarily configures…", fa: "VirtualService عمدتاً … را پیکربندی می‌کند" }, [{ en: "L7 routing and weights", fa: "مسیریابی L7 و وزن‌ها" }, { en: "Node disk layout", fa: "چیدمان دیسک Node" }, { en: "etcd backups", fa: "پشتیبان etcd" }], 0, { en: "VirtualService defines HTTP/TCP routing rules.", fa: "VirtualService قوانین مسیریابی HTTP/TCP را تعریف می‌کند." }),
  ],
  troubleshooting: [
    troubleshoot(
      "ist-no-sidecar",
      { en: "Pod has only one container after enabling injection.", fa: "Pod بعد از injection فقط یک کانتینر دارد." },
      [
        { label: { en: "Confirm namespace label and webhook istio-sidecar-injector", fa: "label namespace و webhook istio-sidecar-injector را چک کنید" }, correct: true, feedback: { en: "Injection requires label and working mutating webhook.", fa: "injection به label و webhook mutating سالم نیاز دارد." } },
        { label: { en: "Disable CoreDNS", fa: "CoreDNS را خاموش کنید" }, correct: false, feedback: { en: "DNS unrelated to sidecar injection.", fa: "DNS به inject sidecar ربطی ندارد." } },
      ],
      [{ language: "bash", title: "Webhook", code: `kubectl get mutatingwebhookconfigurations | grep istio\nkubectl get ns default --show-labels` }],
      { en: "Missing istio-injection label or webhook failure/certificate issue.", fa: "label istio-injection نیست یا webhook/cert مشکل دارد." },
      { en: "Label namespace; check istiod logs; recreate pod after label.", fa: "namespace را label کنید؛ لاگ istiod؛ بعد از label pod را دوباره بسازید." },
    ),
    troubleshoot(
      "ist-503",
      { en: "Mesh calls return 503 UF or NR.", fa: "فراخوان‌های mesh 503 UF یا NR برمی‌گردانند." },
      [
        { label: { en: "Check DestinationRule subsets and Service ports match", fa: "subsetهای DestinationRule و port Service را تطبیق دهید" }, correct: true, feedback: { en: "503 often means no healthy upstream or bad subset.", fa: "503 اغلب upstream سالم نیست یا subset اشتباه است." } },
        { label: { en: "Delete istiod", fa: "istiod را حذف کنید" }, correct: false, feedback: { en: "That breaks the mesh—diagnose routing instead.", fa: "mesh را می‌شکند—مسیریابی را تشخیص دهید." } },
      ],
      [{ language: "bash", title: "Proxy config", code: `istioctl proxy-status\nistioctl proxy-config routes deploy/<name>` }],
      { en: "Wrong host/port, subset labels missing, or mTLS mismatch.", fa: "host/port اشتباه، label subset نیست، یا mTLS نمی‌خواند." },
      { en: "Align VirtualService/DestinationRule with Service; verify mTLS mode.", fa: "VirtualService/DestinationRule را با Service هم‌تراز کنید؛ mTLS را چک کنید." },
    ),
  ],
};

const prometheusPack: LearningPack = {
  whyItExists:
    "Operators need a pull-based metrics database with a powerful query language and alerting—Prometheus scrapes time series and feeds Grafana and Alertmanager.",
  analogy:
    "Prometheus is a librarian with a stopwatch: every 30s it reads gauges from each book (target), stores timestamps in a local ledger, and rings bells (alerts) when rules fire.",
  howItWorks: [
    "Prometheus server scrapes HTTP /metrics endpoints on an interval.",
    "The Prometheus Operator (common install) watches ServiceMonitor/Prometheus CRs.",
    "Recording and alerting rules evaluate PromQL on scraped series.",
    "Alertmanager groups, silences, and routes notifications.",
  ],
  prerequisiteLessons: ["service-dns", "deployment-replicaset", "crd-operator"],
  levels: {
    beginner:
      "Beginners install kube-prometheus-stack, port-forward the Prometheus UI, and confirm targets are UP. You write simple PromQL like up and rate(http_requests_total[5m]).",
    intermediate:
      "Intermediate users author ServiceMonitors, recording rules, Alertmanager routes, and federation. You label metrics consistently and avoid high-cardinality labels.",
    advanced:
      "Advanced SREs run HA Prometheus, Thanos/Mimir for long-term storage, optimize scrape configs, and design SLO burn alerts. You secure the Prometheus API and tune resource limits.",
  },
  flows: [
    {
      id: "prom-scrape",
      title: { en: "Scrape pipeline", fa: "مسیر scrape" },
      steps: [
        {
          caption: { en: "ServiceMonitor selects Services exposing /metrics.", fa: "ServiceMonitor Serviceهای با /metrics را انتخاب می‌کند." },
          componentIds: ["servicemonitor", "svc", "app-pod"],
          connectionIds: ["prom-scrape"],
        },
        {
          caption: { en: "Prometheus pulls samples and stores blocks locally.", fa: "Prometheus نمونه‌ها را pull و در block محلی ذخیره می‌کند." },
          componentIds: ["prometheus", "app-pod"],
          connectionIds: ["prom-scrape", "prom-api"],
        },
        {
          caption: { en: "Firing alerts go to Alertmanager.", fa: "alertهای firing به Alertmanager می‌روند." },
          componentIds: ["prometheus", "alertmanager"],
          connectionIds: ["prom-am"],
        },
      ],
    },
  ],
  lab: basicLab(
    [
      labStep(
        "prom-install",
        { en: "Install kube-prometheus-stack", fa: "نصب kube-prometheus-stack" },
        { language: "bash", title: "Helm", code: `helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install mon prometheus-community/kube-prometheus-stack \\
  --namespace monitoring --create-namespace
kubectl -n monitoring get pods | head -8` },
        `prometheus-mon-kube-prometheus-st-prometheus-0   2/2   Running
alertmanager-mon-kube-prometheus-st-alertmanager-0   2/2   Running
mon-kube-prometheus-st-operator-...                   1/1   Running`,
        { en: "The chart installs Prometheus, Alertmanager, operator, and default monitors.", fa: "chart، Prometheus، Alertmanager، operator و monitorهای پیش‌فرض را نصب می‌کند." },
        ["prometheus", "alertmanager", "servicemonitor"],
      ),
      labStep(
        "prom-query",
        { en: "Query targets in UI", fa: "جستجوی target در UI" },
        { language: "bash", title: "Port-forward", code: `kubectl -n monitoring port-forward svc/mon-kube-prometheus-st-prometheus 9090:9090 &
curl -s 'http://127.0.0.1:9090/api/v1/query?query=up' | head -c 200` },
        `"status":"success","data":{"resultType":"vector","result":[`,
        { en: "The Prometheus HTTP API serves PromQL results; up==1 means scrape success.", fa: "API HTTP Prometheus نتیجه PromQL می‌دهد؛ up==1 یعنی scrape موفق." },
        ["prometheus", "users"],
      ),
    ],
    {
      prompt: { en: "List ServiceMonitors in monitoring namespace.", fa: "ServiceMonitorها در namespace monitoring را لیست کنید." },
      solution: { language: "bash", title: "SM", code: `kubectl -n monitoring get servicemonitor` },
    },
  ),
  quiz: [
    q("prm-q1", { en: "Prometheus default scrape path?", fa: "مسیر پیش‌فرض scrape Prometheus؟" }, [{ en: "/metrics", fa: "/metrics" }, { en: "/healthz", fa: "/healthz" }, { en: "/api", fa: "/api" }], 0, { en: "Exporters expose OpenMetrics on /metrics.", fa: "exporterها OpenMetrics را روی /metrics می‌دهند." }),
    q("prm-q2", { en: "ServiceMonitor is a CRD from…", fa: "ServiceMonitor CRD از …" }, [{ en: "Prometheus Operator", fa: "Prometheus Operator" }, { en: "CoreDNS", fa: "CoreDNS" }, { en: "cert-manager", fa: "cert-manager" }], 0, { en: "monitoring.coreos.com/v1 resources.", fa: "منابع monitoring.coreos.com/v1." }),
    q("prm-q3", { en: "Alertmanager handles…", fa: "Alertmanager … را انجام می‌دهد" }, [{ en: "Notification routing and grouping", fa: "مسیریابی و گروه‌بندی اعلان" }, { en: "Pod scheduling", fa: "زمان‌بندی Pod" }, { en: "Image pulls", fa: "pull image" }], 0, { en: "Alerts leave Prometheus; Alertmanager notifies humans.", fa: "alert از Prometheus خارج می‌شود؛ Alertmanager به انسان خبر می‌دهد." }),
  ],
  troubleshooting: [
    troubleshoot(
      "prom-target-down",
      { en: "Prometheus target shows DOWN in /targets.", fa: "target در /targets وضعیت DOWN دارد." },
      [
        { label: { en: "Verify Service port name and ServiceMonitor selector/labels", fa: "نام port Service و selector/label ServiceMonitor را چک کنید" }, correct: true, feedback: { en: "Misaligned selectors are the top cause of missing scrapes.", fa: "selector ناهماهنگ شایع‌ترین علت scrape از دست رفته است." } },
        { label: { en: "Restart Grafana only", fa: "فقط Grafana را restart کنید" }, correct: false, feedback: { en: "Grafana displays metrics; it does not scrape.", fa: "Grafana نمایش می‌دهد؛ scrape نمی‌کند." } },
      ],
      [{ language: "bash", title: "SM debug", code: `kubectl -n monitoring get servicemonitor\nkubectl -n monitoring get prometheus -o yaml | grep -A15 serviceMonitorSelector` }],
      { en: "Wrong release label on SM, bad port, or Pod not exposing /metrics.", fa: "label release روی SM اشتباه، port بد، یا Pod بدون /metrics." },
      { en: "Fix ServiceMonitor matchLabels; align chart release label; expose metrics port.", fa: "matchLabels SM را درست کنید؛ label release chart؛ port metrics را expose کنید." },
    ),
    troubleshoot(
      "prom-crash",
      { en: "Prometheus pod OOMKilled.", fa: "Pod Prometheus OOMKilled شده." },
      [
        { label: { en: "Reduce cardinality or increase memory limits", fa: "cardinality را کم کنید یا limit حافظه را زیاد کنید" }, correct: true, feedback: { en: "High-cardinality labels explode TSDB memory.", fa: "label با cardinality بالا حافظه TSDB را منفجر می‌کند." } },
        { label: { en: "Disable scraping entirely", fa: "scrape را کامل خاموش کنید" }, correct: false, feedback: { en: "You lose observability—tune labels and retention instead.", fa: "observability از دست می‌رود—label و retention را tune کنید." } },
      ],
      [{ language: "bash", title: "Resources", code: `kubectl -n monitoring describe pod -l app.kubernetes.io/name=prometheus | grep -A3 Last State` }],
      { en: "Too many series or short retention with huge WAL.", fa: "سری زیاد یا retention کوتاه با WAL بزرگ." },
      { en: "Drop expensive metrics; increase resources; use remote write for long term.", fa: "metric سنگین را حذف کنید؛ منابع زیاد کنید؛ remote write برای بلندمدت." },
    ),
  ],
};

const grafanaPack: LearningPack = {
  whyItExists:
    "Raw PromQL tables are hard to share with teams—Grafana turns metrics (and logs/traces) into dashboards, alerts, and collaborative views.",
  analogy:
    "If Prometheus is the spreadsheet, Grafana is the presentation: charts, variables, and TV walls for on-call and product teams.",
  howItWorks: [
    "Grafana reads data sources (Prometheus, Loki, Tempo, etc.) via their query APIs.",
    "Dashboards bind panels to queries with template variables for cluster/namespace.",
    "Unified alerting can evaluate Grafana-managed rules and notify channels.",
    "In kube-prometheus-stack, Grafana often ships prebuilt Kubernetes dashboards.",
  ],
  prerequisiteLessons: ["service-dns", "deployment-replicaset"],
  levels: {
    beginner:
      "Beginners log into Grafana (port-forward or Ingress), open the Kubernetes / Node dashboards, and explore template variables. You add a simple stat panel with up{job=\"...\"}.",
    intermediate:
      "Intermediate users build dashboards-as-code (Jsonnet, Helm values), configure datasources securely, and set folder RBAC. You correlate metrics with logs using derived fields.",
    advanced:
      "Advanced admins run Grafana HA, SSO, audit logs, and plugin governance. You optimize query performance and design SLO dashboards with recording rules backing panels.",
  },
  flows: [
    {
      id: "graf-query",
      title: { en: "Dashboard query path", fa: "مسیر کوئری داشبورد" },
      steps: [
        {
          caption: { en: "User opens a Grafana dashboard in the browser.", fa: "کاربر داشبورد Grafana را در مرورگر باز می‌کند." },
          componentIds: ["grafana", "users"],
          connectionIds: ["users-grafana"],
        },
        {
          caption: { en: "Grafana queries Prometheus for panel time series.", fa: "Grafana برای سری زمانی panel از Prometheus کوئری می‌زند." },
          componentIds: ["grafana", "prometheus"],
          connectionIds: ["grafana-prom"],
        },
      ],
    },
  ],
  lab: basicLab(
    [
      labStep(
        "graf-access",
        { en: "Access Grafana from kube-prometheus-stack", fa: "دسترسی به Grafana از kube-prometheus-stack" },
        { language: "bash", title: "Port-forward + secret", code: `kubectl -n monitoring get secret mon-grafana -o jsonpath='{.data.admin-password}' | base64 -d; echo
kubectl -n monitoring port-forward svc/mon-grafana 3000:80 &
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/login` },
        `302`,
        { en: "Default admin password is in the release secret; port-forward reaches the Service.", fa: "رمز admin پیش‌فرض در secret release است؛ port-forward به Service می‌رسد." },
        ["grafana", "users"],
        ["users-grafana"],
      ),
    ],
    {
      prompt: { en: "In Grafana UI, open a built-in Kubernetes dashboard (after login).", fa: "در UI Grafana یک داشبورد Kubernetes داخلی را باز کنید." },
      solution: { language: "bash", title: "Hint", code: `# Browse: Dashboards → Kubernetes / Compute Resources / Cluster` },
    },
  ),
  quiz: [
    q("grf-q1", { en: "Grafana does not store long-term metrics; it…", fa: "Grafana متریک بلندمدت نگه نمی‌دارد؛ …" }, [{ en: "Queries external datasources", fa: "از datasource خارجی کوئری می‌زند" }, { en: "Replaces Prometheus TSDB", fa: "جایگزین TSDB Prometheus" }, { en: "Scrapes /metrics itself", fa: "خودش /metrics scrape می‌کند" }], 0, { en: "Grafana is a visualization layer.", fa: "Grafana لایه visualization است." }),
    q("grf-q2", { en: "Typical Prometheus datasource URL in-cluster?", fa: "URL معمول datasource Prometheus در کلاستر؟" }, [{ en: "http://prometheus-service:9090", fa: "http://prometheus-service:9090" }, { en: "https://etcd:2379", fa: "https://etcd:2379" }, { en: "dns://kube-dns", fa: "dns://kube-dns" }], 0, { en: "Grafana talks to the Prometheus Service DNS name.", fa: "Grafana با DNS name Service Prometheus صحبت می‌کند." }),
    q("grf-q3", { en: "Template variables help…", fa: "متغیرهای template …" }, [{ en: "Reuse dashboards across namespaces/clusters", fa: "استفاده مجدد داشبورد بین namespace/کلاستر" }, { en: "Replace RBAC", fa: "جایگزین RBAC" }, { en: "Install CNI", fa: "نصب CNI" }], 0, { en: "Variables parameterize queries.", fa: "متغیرها کوئری را پارامتrizه می‌کنند." }),
  ],
  troubleshooting: [
    troubleshoot(
      "graf-nodata",
      { en: "Grafana panels show No data.", fa: "panelهای Grafana No data نشان می‌دهند." },
      [
        { label: { en: "Test the Prometheus datasource in Grafana settings", fa: "datasource Prometheus را در تنظیمات Grafana تست کنید" }, correct: true, feedback: { en: "Broken datasource URL or auth causes empty panels.", fa: "URL/auth datasource خراب panel خالی می‌کند." } },
        { label: { en: "Reinstall containerd", fa: "containerd را دوباره نصب کنید" }, correct: false, feedback: { en: "Unrelated to Grafana queries.", fa: "به کوئری Grafana ربطی ندارد." } },
      ],
      [{ language: "bash", title: "Prometheus reachability", code: `kubectl -n monitoring get svc | grep prometheus\nkubectl -n monitoring run curl --rm -it --restart=Never --image=curlimages/curl:8.5.0 -- curl -s http://mon-kube-prometheus-st-prometheus:9090/-/ready` }],
      { en: "Wrong datasource URL, Prometheus down, or query/time range mismatch.", fa: "URL datasource اشتباه، Prometheus down، یا کوئری/بازه زمانی." },
      { en: "Fix URL to in-cluster Service; verify Prometheus ready; adjust time range.", fa: "URL را به Service در کلاستر درست کنید؛ Prometheus ready؛ بازه زمانی را تنظیم کنید." },
    ),
    troubleshoot(
      "graf-login",
      { en: "Cannot log in to Grafana after Helm install.", fa: "بعد از Helm نمی‌توان به Grafana login کرد." },
      [
        { label: { en: "Read admin password from the Grafana secret", fa: "رمز admin را از secret Grafana بخوانید" }, correct: true, feedback: { en: "Chart generates a random admin password stored in a Secret.", fa: "chart رمز تصادفی admin در Secret می‌گذارد." } },
        { label: { en: "Reset etcd", fa: "etcd را reset کنید" }, correct: false, feedback: { en: "etcd does not store Grafana credentials.", fa: "etcd credential Grafana را نگه نمی‌دارد." } },
      ],
      [{ language: "bash", title: "Password", code: `kubectl -n monitoring get secret -l app.kubernetes.io/name=grafana\nkubectl -n monitoring get secret mon-grafana -o jsonpath='{.data.admin-user}' | base64 -d; echo` }],
      { en: "Wrong password or using old secret after helm upgrade.", fa: "رمز اشتباه یا secret قدیمی بعد از helm upgrade." },
      { en: "Fetch current secret; or set adminPassword in Helm values intentionally.", fa: "secret فعلی را بگیرید؛ یا adminPassword را در values Helm تنظیم کنید." },
    ),
  ],
};

const opentelemetryPack: LearningPack = {
  whyItExists:
    "Vendors and libraries each invented their own tracing/metrics APIs—OpenTelemetry provides vendor-neutral SDKs and a collector pipeline to export to Prometheus, Jaeger, and others.",
  analogy:
    "OpenTelemetry is a universal power adapter: apps speak OTel; the collector converts plugs (OTLP) to whatever wall socket (backend) you use.",
  howItWorks: [
    "Language SDKs create traces, metrics, and logs with shared context propagation.",
    "The OpenTelemetry Collector receives OTLP (gRPC/HTTP) and processes with receivers/processors/exporters.",
    "Kubernetes can run the collector as Deployment or DaemonSet (agent vs gateway patterns).",
    "Auto-instrumentation (e.g. operator) injects SDKs without full rewrites.",
  ],
  prerequisiteLessons: ["sidecar", "deployment-replicaset", "daemonset"],
  levels: {
    beginner:
      "Beginners deploy the collector Helm chart, send sample OTLP from otelcol or a demo app, and confirm spans in a backend (Jaeger/Tempo). You understand traces vs metrics vs logs.",
    intermediate:
      "Intermediate pipelines add batch/memory limit processors, tail sampling, and multiple exporters. You propagate W3C tracecontext across Services.",
    advanced:
      "Advanced platforms standardize semantic conventions, run collector HA, secure OTLP with mTLS, and tie OTel logs to Loki/Elasticsearch. You cost-control cardinality at export time.",
  },
  flows: [
    {
      id: "otel-pipeline",
      title: { en: "OTLP through collector", fa: "OTLP از collector" },
      steps: [
        {
          caption: { en: "App SDK exports spans/metrics via OTLP to the collector.", fa: "SDK اپ span/metric را با OTLP به collector می‌فرستد." },
          componentIds: ["otel-sdk", "otel-collector"],
          connectionIds: ["sdk-collector"],
        },
        {
          caption: { en: "Collector processors batch and filter telemetry.", fa: "processorهای collector telemetry را batch/filter می‌کنند." },
          componentIds: ["otel-collector"],
        },
        {
          caption: { en: "Exporters send data to Prometheus-compatible or trace backends.", fa: "exporter داده را به backend سازگار Prometheus یا trace می‌فرستد." },
          componentIds: ["otel-collector", "backend"],
          connectionIds: ["collector-backend"],
        },
      ],
    },
  ],
  lab: basicLab(
    [
      labStep(
        "otel-install",
        { en: "Install OpenTelemetry Collector (Helm)", fa: "نصب OpenTelemetry Collector (Helm)" },
        { language: "bash", title: "open-telemetry helm", code: `helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm repo update
helm install otel open-telemetry/opentelemetry-collector \\
  --namespace observability --create-namespace \\
  --set mode=deployment
kubectl -n observability get pods` },
        `otel-opentelemetry-collector-...   1/1   Running`,
        { en: "Helm deploys a collector Deployment with default receivers/exporters in values.", fa: "Helm collector Deployment با receiver/exporter پیش‌فرض در values مستقر می‌کند." },
        ["otel-collector"],
      ),
      labStep(
        "otel-otlp",
        { en: "Send a test OTLP trace", fa: "ارسال trace تست OTLP" },
        { language: "bash", title: "telemetrygen (optional)", code: `kubectl -n observability port-forward svc/otel-opentelemetry-collector 4317:4317 &
# if telemetrygen installed locally:
telemetrygen traces --otlp-insecure --otlp-endpoint 127.0.0.1:4317 --traces 3` },
        `2026/xx/xx traces generated: 3`,
        { en: "telemetrygen pushes sample traces to the collector OTLP gRPC port.", fa: "telemetrygen trace نمونه به پورت gRPC OTLP collector می‌فرستد." },
        ["otel-sdk", "otel-collector"],
        ["sdk-collector"],
      ),
    ],
    {
      prompt: { en: "Check collector logs for received batches.", fa: "لاگ collector برای batch دریافتی را ببینید." },
      solution: { language: "bash", title: "Logs", code: `kubectl -n observability logs deploy/otel-opentelemetry-collector --tail=50` },
    },
  ),
  quiz: [
    q("otel-q1", { en: "Default OTLP gRPC port?", fa: "پورت پیش‌فرض OTLP gRPC؟" }, [{ en: "4317", fa: "4317" }, { en: "6443", fa: "6443" }, { en: "53", fa: "53" }], 0, { en: "4317 gRPC and 4318 HTTP are standard OTLP ports.", fa: "4317 gRPC و 4318 HTTP پورت‌های استاندارد OTLP هستند." }),
    q("otel-q2", { en: "Collector components include…", fa: "اجزای collector شامل …" }, [{ en: "receivers, processors, exporters", fa: "receiver، processor، exporter" }, { en: "scheduler, etcd", fa: "scheduler، etcd" }, { en: "kube-proxy only", fa: "فقط kube-proxy" }], 0, { en: "Pipeline is receiver → processor → exporter.", fa: "pipeline: receiver → processor → exporter." }),
    q("otel-q3", { en: "W3C tracecontext propagates…", fa: "W3C tracecontext … را منتقل می‌کند" }, [{ en: "Trace IDs across service boundaries", fa: "Trace ID بین مرز instanceهای اپ" }, { en: "Node kernel version", fa: "نسخه kernel Node" }, { en: "Helm chart versions", fa: "نسخه chart Helm" }], 0, { en: "Context links spans in distributed traces.", fa: "context spanها را در trace توزیع‌شده وصل می‌کند." }),
  ],
  troubleshooting: [
    troubleshoot(
      "otel-no-spans",
      { en: "Backend shows no traces after instrumentation.", fa: "backend بعد از instrumentation trace نشان نمی‌دهد." },
      [
        { label: { en: "Verify OTLP endpoint env vars point to the collector Service", fa: "متغیر env OTLP به Service collector اشاره کند" }, correct: true, feedback: { en: "Wrong host/port drops telemetry silently if export fails.", fa: "host/port اشتباه telemetry را از دست می‌دهد." } },
        { label: { en: "Delete all Deployments", fa: "همه Deploymentها را حذف کنید" }, correct: false, feedback: { en: "Does not fix export path.", fa: "مسیر export را درست نمی‌کند." } },
      ],
      [{ language: "bash", title: "Collector", code: `kubectl -n observability get svc\nkubectl -n observability logs deploy/otel-opentelemetry-collector --tail=100` }],
      { en: "Misconfigured exporter, sampling set to zero, or network policy blocking OTLP.", fa: "exporter misconfig، sampling صفر، یا NetworkPolicy مانع OTLP." },
      { en: "Fix OTEL_EXPORTER_OTLP_ENDPOINT; check collector exporter config; open port 4317.", fa: "OTEL_EXPORTER_OTLP_ENDPOINT را درست کنید؛ exporter collector؛ پورت 4317." },
    ),
    troubleshoot(
      "otel-drops",
      { en: "Collector logs show dropped spans (queue full).", fa: "لاگ collector span drop (صف پر)." },
      [
        { label: { en: "Increase queue/batch settings or scale collectors", fa: "صف/batch را زیاد کنید یا collector scale کنید" }, correct: true, feedback: { en: "Backpressure means export slower than ingest.", fa: "فشار یعنی export کندتر از ingest است." } },
        { label: { en: "Disable all processors", fa: "همه processor را خاموش کنید" }, correct: false, feedback: { en: "Processors often required—tune batch sizes instead.", fa: "processor اغلب لازم است—batch را tune کنید." } },
      ],
      [{ language: "bash", title: "Describe", code: `kubectl -n observability describe pod -l app.kubernetes.io/name=opentelemetry-collector | tail -30` }],
      { en: "Exporter backend slow/down or undersized collector memory.", fa: "backend exporter کند/down یا حافظه collector کم." },
      { en: "Fix backend; add memory_limiter processor; scale Deployment.", fa: "backend را درست کنید؛ memory_limiter؛ scale Deployment." },
    ),
  ],
};

const fluentBitPack: LearningPack = {
  whyItExists:
    "Cluster apps emit logs on stdout and files—Fluent Bit is a lightweight log processor and forwarder that ships logs to Elasticsearch, Loki, CloudWatch, and more.",
  analogy:
    "Fluent Bit is a postal sorter on each street (node): it picks up letters (log lines), stamps them (metadata), and sends bags to the central post office (backend).",
  howItWorks: [
    "Fluent Bit runs as a DaemonSet reading container logs via /var/log/containers on the node.",
    "Input plugins tail files; filter plugins add Kubernetes metadata; output plugins forward.",
    "The Kubernetes filter calls the API to enrich logs with pod/namespace labels.",
    "It complements metrics/traces in the observability pillar.",
  ],
  prerequisiteLessons: ["daemonset", "pod", "node-kubelet"],
  levels: {
    beginner:
      "Beginners install the fluent-bit Helm chart, confirm DaemonSet pods Running, and see JSON logs with kubernetes.* fields in the configured output (stdout or Loki).",
    intermediate:
      "Intermediate users write custom parsers, multiline rules, and throttle noisy namespaces. You route audit logs separately and secure API access with RBAC ServiceAccount.",
    advanced:
      "Advanced pipelines use WASM/Lua filters, backpressure tuning, and dual-ship to cold storage. You integrate with OpenTelemetry for correlated logs and traces.",
  },
  flows: [
    {
      id: "fb-ship",
      title: { en: "Log shipping from node", fa: "ارسال لاگ از Node" },
      steps: [
        {
          caption: { en: "kubelet writes container logs to files on the node.", fa: "kubelet لاگ کانتینر را در فایل روی Node می‌نویسد." },
          componentIds: ["kubelet", "app-pod"],
          connectionIds: ["fb-kubelet"],
        },
        {
          caption: { en: "Fluent Bit tails logs and enriches with Pod metadata.", fa: "Fluent Bit لاگ را tail و با metadata Pod غنی می‌کند." },
          componentIds: ["fluent-bit", "apiserver"],
          connectionIds: ["fb-podlogs", "fb-kubelet"],
        },
        {
          caption: { en: "Output plugin forwards batches to the log backend.", fa: "output plugin batchها را به backend لاگ می‌فرستد." },
          componentIds: ["fluent-bit", "log-backend"],
          connectionIds: ["fb-backend"],
        },
      ],
    },
  ],
  lab: basicLab(
    [
      labStep(
        "fb-install",
        { en: "Install Fluent Bit with Helm", fa: "نصب Fluent Bit با Helm" },
        { language: "bash", title: "fluent helm", code: `helm repo add fluent https://fluent.github.io/helm-charts
helm repo update
helm install fluent-bit fluent/fluent-bit \\
  --namespace logging --create-namespace \\
  --set kind=DaemonSet
kubectl -n logging get pods -l app.kubernetes.io/name=fluent-bit` },
        `fluent-bit-xxxxx   1/1   Running`,
        { en: "DaemonSet agents start on each node to tail container logs.", fa: "agentهای DaemonSet روی هر Node برای tail لاگ کانتینر بالا می‌آیند." },
        ["fluent-bit"],
      ),
      labStep(
        "fb-logline",
        { en: "Generate a log line", fa: "تولید یک خط لاگ" },
        { language: "bash", title: "Logger pod", code: `kubectl run logger --image=busybox:1.36 --restart=Never -- sh -c 'echo hello-fluent-bit; sleep 3600'
kubectl -n logging logs -l app.kubernetes.io/name=fluent-bit --tail=20 | grep hello || true` },
        `hello-fluent-bit`,
        { en: "Agent output may echo forwarded records depending on chart output (stdout/Loki/etc.).", fa: "بسته به output chart، agent ممکن است رکورد forward شده را نشان دهد." },
        ["fluent-bit", "app-pod"],
        ["fb-podlogs"],
      ),
    ],
    {
      prompt: { en: "Describe the fluent-bit ServiceAccount RBAC in logging namespace.", fa: "RBAC ServiceAccount fluent-bit در namespace logging را describe کنید." },
      solution: { language: "bash", title: "RBAC", code: `kubectl -n logging get clusterrolebinding | grep fluent\nkubectl -n logging describe sa fluent-bit` },
    },
  ),
  quiz: [
    q("fb-q1", { en: "Fluent Bit on Kubernetes usually runs as…", fa: "Fluent Bit در Kubernetes معمولاً به‌صورت …" }, [{ en: "DaemonSet", fa: "DaemonSet" }, { en: "Job", fa: "Job" }, { en: "Ingress", fa: "Ingress" }], 0, { en: "One log agent per node is typical.", fa: "معمولاً یک agent لاگ per node." }),
    q("fb-q2", { en: "Kubernetes filter adds…", fa: "filter kubernetes … اضافه می‌کند" }, [{ en: "Pod/namespace metadata", fa: "metadata pod/namespace" }, { en: "TLS certificates", fa: "گواهی TLS" }, { en: "PersistentVolume claims", fa: "claim PersistentVolume" }], 0, { en: "Enrichment helps search in backends.", fa: "غنی‌سازی جستجو در backend را آسان می‌کند." }),
    q("fb-q3", { en: "Container logs on Linux nodes are commonly under…", fa: "لاگ کانتینر روی Node Linux معمولاً زیر …" }, [{ en: "/var/log/containers", fa: "/var/log/containers" }, { en: "/etc/kubernetes", fa: "/etc/kubernetes" }, { en: "/var/lib/etcd", fa: "/var/lib/etcd" }], 0, { en: "kubelet symlinks log files there.", fa: "kubelet symlink لاگ‌ها را آنجا می‌گذارد." }),
  ],
  troubleshooting: [
    troubleshoot(
      "fb-no-logs",
      { en: "Log backend receives nothing from Fluent Bit.", fa: "backend لاگ چیزی از Fluent Bit نمی‌گیرد." },
      [
        { label: { en: "Check output plugin config and network reachability", fa: "پیکربندی output plugin و دسترسی شبکه را چک کنید" }, correct: true, feedback: { en: "Wrong host/TLS/auth blocks delivery.", fa: "host/TLS/auth اشتباه تحویل را مسدود می‌کند." } },
        { label: { en: "Scale CoreDNS to zero", fa: "CoreDNS را صفر کنید" }, correct: false, feedback: { en: "DNS may matter for remote endpoints but is not the first fix for all outputs.", fa: "DNS برای endpoint دور مهم است ولی اولین fix همه outputها نیست." } },
      ],
      [{ language: "bash", title: "Agent logs", code: `kubectl -n logging logs -l app.kubernetes.io/name=fluent-bit --tail=80` }],
      { en: "Misconfigured output, RBAC blocking metadata filter, or backpressure.", fa: "output misconfig، RBAC مانع filter metadata، یا backpressure." },
      { en: "Fix values.yaml output section; verify ClusterRole for get pods/namespaces.", fa: "بخش output values.yaml؛ ClusterRole برای get pod/namespace." },
    ),
    troubleshoot(
      "fb-crash",
      { en: "Fluent Bit pod CrashLoopBackOff.", fa: "Pod Fluent Bit CrashLoopBackOff." },
      [
        { label: { en: "Validate config with fluent-bit -R dry run / check chart config", fa: "config را validate کنید" }, correct: true, feedback: { en: "Syntax errors in parsers/filters crash the agent.", fa: "خطای syntax در parser/filter agent را crash می‌کند." } },
        { label: { en: "Delete all nodes", fa: "همه Nodeها را حذف کنید" }, correct: false, feedback: { en: "Fix configuration instead.", fa: "پیکربندی را درست کنید." } },
      ],
      [{ language: "bash", title: "Describe", code: `kubectl -n logging describe pod -l app.kubernetes.io/name=fluent-bit | tail -25` }],
      { en: "Invalid fluent-bit.conf from Helm values or missing volume mounts.", fa: "fluent-bit.conf نامعتبر از values Helm یا mount volume نیست." },
      { en: "helm upgrade with validated config; ensure hostPath for /var/log access.", fa: "helm upgrade با config معتبر؛ hostPath برای /var/log." },
    ),
  ],
};

const argoCdPack: LearningPack = {
  whyItExists:
    "kubectl apply from laptops does not scale—Argo CD continuously reconciles cluster state with Git (GitOps) so every change is auditable and repeatable.",
  analogy:
    "Argo CD is a thermostat wired to a blueprint in Git: when the room (cluster) drifts from the drawing, it heats or cools until they match.",
  howItWorks: [
    "You define Application CRs pointing at repo paths and target clusters/namespaces.",
    "The application-controller compares live resources with Git manifests.",
    "The repo-server clones and renders Helm/Kustomize/jsonnet as configured.",
    "The API server UI and CLI show sync status, diff, and health.",
  ],
  prerequisiteLessons: ["deployment-replicaset", "namespace", "crd-operator"],
  levels: {
    beginner:
      "Beginners install Argo CD, port-forward the UI, and sync the guestbook example Application. You read Synced/Healthy/OutOfSync states.",
    intermediate:
      "Intermediate teams use AppProjects, RBAC, multiple sources, and progressive sync options. You manage secrets with External Secrets or SOPS, not plain Git.",
    advanced:
      "Advanced GitOps uses ApplicationSets, multi-cluster generators, sync waves, and OPA policy. You design disaster recovery and cluster bootstrapping repos.",
  },
  flows: [
    {
      id: "argocd-sync",
      title: { en: "Git to cluster reconcile", fa: "همگام‌سازی Git با کلاستر" },
      steps: [
        {
          caption: { en: "Application spec references a Git repo path.", fa: "spec Application به مسیر repo Git اشاره می‌کند." },
          componentIds: ["application-crd", "git", "argocd"],
          connectionIds: ["argocd-git"],
        },
        {
          caption: { en: "Argo CD renders manifests and applies via the Kubernetes API.", fa: "Argo CD manifest را render و از API Kubernetes apply می‌کند." },
          componentIds: ["argocd", "apiserver", "app-pod"],
          connectionIds: ["argocd-api"],
        },
      ],
    },
  ],
  lab: basicLab(
    [
      labStep(
        "argo-install",
        { en: "Install Argo CD", fa: "نصب Argo CD" },
        { language: "bash", title: "Official manifest", code: `kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl -n argocd wait --for=condition=Available deploy/argocd-server --timeout=180s
kubectl -n argocd get pods | head -6` },
        `argocd-server-...                     1/1   Running
argocd-application-controller-...       1/1   Running
argocd-repo-server-...                  1/1   Running`,
        { en: "Stable install manifest deploys control plane components into argocd namespace.", fa: "manifest نصب stable اجزای control plane را در namespace argocd مستقر می‌کند." },
        ["argocd"],
        ["argocd-api"],
      ),
      labStep(
        "argo-app",
        { en: "Create guestbook Application", fa: "ساخت Application guestbook" },
        { language: "bash", title: "Apply Application", code: `kubectl apply -f - <<'EOF'
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: guestbook
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/argoproj/argocd-example-apps.git
    path: guestbook
    targetRevision: HEAD
  destination:
    server: https://kubernetes.default.svc
    namespace: guestbook
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
EOF
kubectl -n argocd get application guestbook` },
        `NAME        SYNC STATUS   HEALTH STATUS
guestbook     Synced        Healthy`,
        { en: "Controller clones Git and creates guestbook namespace resources.", fa: "controller Git را clone و منابع namespace guestbook را می‌سازد." },
        ["application-crd", "git", "app-pod"],
        ["argocd-git", "argocd-api"],
      ),
    ],
    {
      prompt: { en: "List pods in guestbook namespace after sync.", fa: "Podهای namespace guestbook بعد از sync را لیست کنید." },
      solution: { language: "bash", title: "Pods", code: `kubectl -n guestbook get pods` },
    },
  ),
  quiz: [
    q("argo-q1", { en: "Argo CD desired state lives primarily in…", fa: "وضعیت مطلوب Argo CD عمدتاً در …" }, [{ en: "Git", fa: "Git" }, { en: "Local kubectl cache", fa: "cache محلی kubectl" }, { en: "containerd images", fa: "imageهای containerd" }], 0, { en: "GitOps uses Git as source of truth.", fa: "GitOps از Git به‌عنوان source of truth استفاده می‌کند." }),
    q("argo-q2", { en: "Application CR belongs to which API group?", fa: "CR Application متعلق به کدام API group است؟" }, [{ en: "argoproj.io", fa: "argoproj.io" }, { en: "networking.k8s.io", fa: "networking.k8s.io" }, { en: "cilium.io", fa: "cilium.io" }], 0, { en: "Applications are argoproj.io/v1alpha1.", fa: "Applicationها argoproj.io/v1alpha1 هستند." }),
    q("argo-q3", { en: "OutOfSync means…", fa: "OutOfSync یعنی …" }, [{ en: "Cluster differs from Git", fa: "کلاستر با Git فرق دارد" }, { en: "etcd is full", fa: "etcd پر است" }, { en: "Nodes NotReady", fa: "Nodeها NotReady" }], 0, { en: "Controller detected drift from desired manifests.", fa: "controller انحراف از manifest مطلوب را دید." }),
  ],
  troubleshooting: [
    troubleshoot(
      "argo-sync-fail",
      { en: "Application SyncFailed with permission denied.", fa: "Application SyncFailed با permission denied." },
      [
        { label: { en: "Check AppProject destinations and RBAC for argocd-manager role", fa: "destination پروژه و RBAC نقش argocd را چک کنید" }, correct: true, feedback: { en: "Argo CD needs rights on target namespaces.", fa: "Argo CD به حقوق روی namespace مقصد نیاز دارد." } },
        { label: { en: "Disable API server", fa: "API server را خاموش کنید" }, correct: false, feedback: { en: "Would break all sync.", fa: "همه sync را می‌شکند." } },
      ],
      [{ language: "bash", title: "App details", code: `kubectl -n argocd describe application guestbook\nkubectl -n argocd logs deploy/argocd-application-controller --tail=40` }],
      { en: "RBAC too narrow or destination cluster/namespace not allowed.", fa: "RBAC تنگ یا cluster/namespace مقصد مجاز نیست." },
      { en: "Update AppProject; grant ClusterRoleBinding as docs recommend for lab.", fa: "AppProject را به‌روز کنید؛ ClusterRoleBinding طبق docs لاب." },
    ),
    troubleshoot(
      "argo-repo",
      { en: "Application reports repository authentication failed.", fa: "Application خطای authentication repo گزارش می‌کند." },
      [
        { label: { en: "Add repo credentials Secret or SSH key in Argo CD", fa: "Secret credential repo یا کلید SSH در Argo CD اضافه کنید" }, correct: true, feedback: { en: "Private repos need credentials configured in Argo CD.", fa: "repo خصوصی به credential در Argo CD نیاز دارد." } },
        { label: { en: "Delete Git", fa: "Git را حذف کنید" }, correct: false, feedback: { en: "Not a fix—configure access.", fa: "راه‌حل نیست—دسترسی را پیکربندی کنید." } },
      ],
      [{ language: "bash", title: "Repo server", code: `kubectl -n argocd logs deploy/argocd-repo-server --tail=50` }],
      { en: "Missing repo-creds Secret or wrong SSH/https token.", fa: "Secret repo-creds نیست یا token SSH/https اشتباه." },
      { en: "argocd repo add with credentials; or create repository Secret.", fa: "argocd repo add با credential؛ یا Secret repository." },
    ),
  ],
};

const helmPack: LearningPack = {
  whyItExists:
    "Raw YAML sprawl is hard to reuse—Helm packages Kubernetes manifests as versioned charts with templated values and tracks releases as first-class objects.",
  analogy:
    "Helm is IKEA furniture: the chart is the flat-pack manual + parts; values.yaml is which color/size you picked; helm install builds the shelf on your cluster.",
  howItWorks: [
    "helm install/upgrade renders chart templates with values and sends manifests to the API server.",
    "Release metadata is stored in Secrets (Helm 3) labeled by release name.",
    "Charts live in repos (HTTP or OCI); helm repo add/update fetches index.",
    "helm template renders locally without applying—useful in CI.",
  ],
  prerequisiteLessons: ["deployment-replicaset", "namespace", "configmap-secret"],
  levels: {
    beginner:
      "Beginners install Helm 3, add a chart repo, and helm install a demo chart. You use helm list, helm status, and helm uninstall.",
    intermediate:
      "Intermediate users author charts (Chart.yaml, templates/, values), manage dependencies, and lint with helm template. You integrate Helm into CI with --atomic upgrades.",
    advanced:
      "Advanced workflows use OCI registries, helmfile, schema validation for values, and map releases to GitOps (Argo CD/Flux) instead of ad-hoc CLI in prod.",
  },
  flows: [
    {
      id: "helm-release",
      title: { en: "Chart to release", fa: "از chart تا release" },
      steps: [
        {
          caption: { en: "Helm CLI pulls chart from repository.", fa: "CLI Helm chart را از repository می‌گیرد." },
          componentIds: ["helm-cli", "chart-repo"],
          connectionIds: ["helm-repo"],
        },
        {
          caption: { en: "Rendered manifests apply to the API server; release Secret stored.", fa: "manifest render شده apply می‌شود؛ Secret release ذخیره می‌شود." },
          componentIds: ["helm-cli", "apiserver", "release-secret", "app-pod"],
          connectionIds: ["helm-api", "api-release"],
        },
      ],
    },
  ],
  lab: basicLab(
    [
      labStep(
        "helm-install-demo",
        { en: "Install podinfo chart", fa: "نصب chart podinfo" },
        { language: "bash", title: "helm install", code: `helm repo add podinfo https://stefanprodan.github.io/podinfo
helm repo update
helm install my-podinfo podinfo/podinfo --set service.type=ClusterIP
helm list` },
        `NAME         NAMESPACE   REVISION   STATUS   CHART
my-podinfo   default     1          deployed podinfo-x.y.z`,
        { en: "Helm creates a release and underlying Deployment/Service resources.", fa: "Helm release و منابع Deployment/Service زیرین را می‌سازد." },
        ["helm-cli", "app-pod", "release-secret"],
        ["helm-api"],
      ),
      labStep(
        "helm-verify",
        { en: "Verify workload", fa: "تأیید workload" },
        { language: "bash", title: "kubectl get", code: `kubectl get deploy,svc -l app.kubernetes.io/instance=my-podinfo
helm status my-podinfo` },
        `deployment.apps/my-podinfo   1/1   1   1
service/my-podinfo           ClusterIP   10.x.x.x   9898/TCP
STATUS: deployed`,
        { en: "Labels from the chart tie Kubernetes objects back to the release.", fa: "labelهای chart آبجکت‌های Kubernetes را به release وصل می‌کنند." },
        ["app-pod", "svc"],
      ),
    ],
    {
      prompt: { en: "Upgrade my-podinfo setting replicaCount to 2.", fa: "my-podinfo را با replicaCount=2 upgrade کنید." },
      solution: { language: "bash", title: "Upgrade", code: `helm upgrade my-podinfo podinfo/podinfo --reuse-values --set replicaCount=2\nkubectl get deploy my-podinfo` },
    },
  ),
  quiz: [
    q("helm-q1", { en: "Helm 3 stores release state in…", fa: "Helm 3 وضعیت release را در … نگه می‌دارد" }, [{ en: "Secrets in the release namespace", fa: "Secret در namespace release" }, { en: "Tiller pod only", fa: "فقط pod Tiller" }, { en: "etcd directly via helm", fa: "مستقیم etcd via helm" }], 0, { en: "Helm 3 is client-only; state is in cluster Secrets.", fa: "Helm 3 فقط client است؛ state در Secret کلاستر است." }),
    q("helm-q2", { en: "helm template is used to…", fa: "helm template برای …" }, [{ en: "Render manifests without installing", fa: "render manifest بدون نصب" }, { en: "Delete all releases", fa: "حذف همه release" }, { en: "Upgrade kernel", fa: "upgrade kernel" }], 0, { en: "Dry-run rendering for review/CI.", fa: "render dry-run برای review/CI." }),
    q("helm-q3", { en: "Chart version lives in…", fa: "نسخه chart در …" }, [{ en: "Chart.yaml", fa: "Chart.yaml" }, { en: "kubelet.conf", fa: "kubelet.conf" }, { en: "Corefile", fa: "Corefile" }], 0, { en: "Chart.yaml defines chart metadata version.", fa: "Chart.yaml نسخه metadata chart را تعریف می‌کند." }),
  ],
  troubleshooting: [
    troubleshoot(
      "helm-upgrade-fail",
      { en: "helm upgrade fails with rendered manifests invalid.", fa: "helm upgrade با manifest نامعتبر fail می‌شود." },
      [
        { label: { en: "Run helm template with same values and kubectl apply --dry-run=server", fa: "helm template با همان values و dry-run server" }, correct: true, feedback: { en: "Template errors show before apply.", fa: "خطای template قبل از apply دیده می‌شود." } },
        { label: { en: "Delete the API server", fa: "API server را حذف کنید" }, correct: false, feedback: { en: "Fix YAML/values instead.", fa: "YAML/values را درست کنید." } },
      ],
      [{ language: "bash", title: "Debug", code: `helm template my-podinfo podinfo/podinfo --debug 2>&1 | tail -30` }],
      { en: "Values produce invalid YAML or unsupported API version.", fa: "values YAML نامعتبر یا API version پشتیبانی‌نشده می‌سازد." },
      { en: "Fix values; upgrade chart version; validate with kubeconform.", fa: "values را درست کنید؛ chart را upgrade؛ kubeconform." },
    ),
    troubleshoot(
      "helm-not-found",
      { en: "helm install: chart not found in repo.", fa: "helm install: chart در repo نیست." },
      [
        { label: { en: "Run helm repo update after helm repo add", fa: "بعد از repo add، helm repo update بزنید" }, correct: true, feedback: { en: "Stale index misses new charts.", fa: "index کهنه chart جدید را ندارد." } },
        { label: { en: "Install Tiller", fa: "Tiller نصب کنید" }, correct: false, feedback: { en: "Helm 3 removed Tiller.", fa: "Helm 3 Tiller را حذف کرد." } },
      ],
      [{ language: "bash", title: "Search", code: `helm search repo podinfo\nhelm repo list` }],
      { en: "Wrong repo name or chart typo; index not updated.", fa: "نام repo یا typo chart؛ index update نشده." },
      { en: "helm repo update; verify chart name with helm search repo.", fa: "helm repo update؛ نام chart با search." },
    ),
  ],
};

const certManagerPack: LearningPack = {
  whyItExists:
    "TLS certificates expire and manual issuance does not scale—cert-manager automates requesting, renewing, and storing certificates as Kubernetes Secrets.",
  analogy:
    "cert-manager is an automatic license renewer for your doors: Certificate CRs order new keys; Issuers talk to Let's Encrypt or your CA; Secrets hold the keycards.",
  howItWorks: [
    "Certificate CRs reference Issuer/ClusterIssuer and dnsNames or commonName.",
    "Controllers create CertificateRequest and Order/Challenge for ACME HTTP-01 or DNS-01.",
    "Successful validation stores tls.crt/tls.key in a Secret referenced by Ingress or Gateway.",
    "Webhook validates cert-manager resources on create/update.",
  ],
  prerequisiteLessons: ["ingress", "configmap-secret", "crd-operator"],
  levels: {
    beginner:
      "Beginners install cert-manager, create a ClusterIssuer for Let's Encrypt staging, and issue a Certificate for a test Ingress. You watch Challenge resources complete.",
    intermediate:
      "Intermediate admins use DNS-01 with cloud DNS, separate issuers per environment, and monitor cert expiry metrics. You understand rate limits and staging vs prod CAs.",
    advanced:
      "Advanced setups integrate private CAs, ACME EAB, cross-namespace issuers, and SPIFFE/SPIRE. You harden webhook availability and backup private keys responsibly.",
  },
  flows: [
    {
      id: "cm-acme",
      title: { en: "ACME issuance flow", fa: "مسیر صدور ACME" },
      steps: [
        {
          caption: { en: "Certificate CR triggers cert-manager controller.", fa: "CR Certificate کنترلر cert-manager را trigger می‌کند." },
          componentIds: ["cm-crds", "cm-controller", "apiserver"],
          connectionIds: ["cm-api"],
        },
        {
          caption: { en: "HTTP-01 or DNS-01 challenge proves domain control.", fa: "challenge HTTP-01 یا DNS-01 مالکیت دامنه را ثابت می‌کند." },
          componentIds: ["cm-controller", "ingress"],
          connectionIds: ["ingress-secret"],
        },
        {
          caption: { en: "TLS Secret is written for Ingress/Gateway consumption.", fa: "Secret TLS برای Ingress/Gateway نوشته می‌شود." },
          componentIds: ["tls-secret", "ingress"],
          connectionIds: ["cm-secret"],
        },
      ],
    },
  ],
  lab: basicLab(
    [
      labStep(
        "cm-install",
        { en: "Install cert-manager", fa: "نصب cert-manager" },
        { language: "bash", title: "Helm jetstack", code: `helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install cert-manager jetstack/cert-manager \\
  --namespace cert-manager --create-namespace \\
  --set crds.enabled=true
kubectl -n cert-manager wait --for=condition=Available deploy/cert-manager --timeout=120s
kubectl get crd certificates.cert-manager.io` },
        `cert-manager-xxxx   1/1   Running
certificates.cert-manager.io`,
        { en: "Jetstack chart installs controller, webhook, cainjector, and CRDs.", fa: "chart Jetstack controller، webhook، cainjector و CRD نصب می‌کند." },
        ["cm-controller", "cm-webhook", "cm-crds"],
      ),
      labStep(
        "cm-issuer",
        { en: "Create staging ClusterIssuer (lab)", fa: "ساخت ClusterIssuer staging (لاب)" },
        { language: "yaml", title: "letsencrypt-staging.yaml", code: `apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: you@example.com
    privateKeySecretRef:
      name: letsencrypt-staging-account-key
    solvers:
      - http01:
          ingress:
            class: nginx` },
        `clusterissuer.cert-manager.io/letsencrypt-staging created`,
        { en: "ClusterIssuer registers ACME account and defines how challenges are solved.", fa: "ClusterIssuer حساب ACME را ثبت و نحوه حل challenge را تعریف می‌کند." },
        ["cm-crds", "cm-controller"],
        ["cm-api"],
      ),
    ],
    {
      prompt: { en: "kubectl get clusterissuer and confirm Ready=True.", fa: "clusterissuer را بگیرید و Ready=True را تأیید کنید." },
      solution: { language: "bash", title: "Status", code: `kubectl get clusterissuer letsencrypt-staging -o wide` },
    },
  ),
  quiz: [
    q("cm-q1", { en: "cert-manager stores issued certs in…", fa: "cert-manager گواهی صادر شده را در …" }, [{ en: "Kubernetes Secret", fa: "Secret Kubernetes" }, { en: "ConfigMap only", fa: "فقط ConfigMap" }, { en: "containerd layers", fa: "لایه containerd" }], 0, { en: "tls.crt/tls.key land in typed Secrets.", fa: "tls.crt/tls.key در Secret نوع‌دار می‌رود." }),
    q("cm-q2", { en: "HTTP-01 challenge typically uses…", fa: "challenge HTTP-01 معمولاً …" }, [{ en: "Temporary Ingress solver pod/route", fa: "مسیر/pod solver Ingress موقت" }, { en: "SSH to nodes", fa: "SSH به Nodeها" }, { en: "etcd snapshot", fa: "snapshot etcd" }], 0, { en: "Let's Encrypt hits a well-known URL on your domain.", fa: "Let's Encrypt URL well-known روی دامنه شما را می‌زند." }),
    q("cm-q3", { en: "ClusterIssuer is…", fa: "ClusterIssuer …" }, [{ en: "Cluster-scoped issuer", fa: "issuer سطح کلاستر" }, { en: "Namespaced Pod", fa: "Pod namespaced" }, { en: "CNI plugin", fa: "افزونه CNI" }], 0, { en: "ClusterIssuer can be referenced from any namespace.", fa: "ClusterIssuer از هر namespace قابل ارجاع است." }),
  ],
  troubleshooting: [
    troubleshoot(
      "cm-challenge-pending",
      { en: "Certificate stays not Ready; Challenge pending.", fa: "Certificate Ready نیست؛ Challenge pending." },
      [
        { label: { en: "Ensure public DNS points to ingress and port 80 reachable", fa: "DNS عمومی به ingress و پورت 80 در دسترس باشد" }, correct: true, feedback: { en: "HTTP-01 needs external reachability.", fa: "HTTP-01 به دسترسی خارجی نیاز دارد." } },
        { label: { en: "Restart kube-scheduler only", fa: "فقط kube-scheduler را restart کنید" }, correct: false, feedback: { en: "Unrelated to ACME HTTP reachability.", fa: "به دسترسی HTTP ACME ربطی ندارد." } },
      ],
      [{ language: "bash", title: "Challenge", code: `kubectl describe certificate <name>\nkubectl get challenges,orders -A` }],
      { en: "DNS not propagated, wrong ingress class, or firewall blocks LE.", fa: "DNS propagate نشده، ingress class اشتباه، یا firewall LE را block می‌کند." },
      { en: "Fix DNS/ingress; use DNS-01 if HTTP blocked; check challenge describe events.", fa: "DNS/ingress را درست کنید؛ DNS-01؛ describe challenge." },
    ),
    troubleshoot(
      "cm-webhook",
      { en: "kubectl apply fails: webhook cert-manager validation timeout.", fa: "kubectl apply: timeout webhook cert-manager." },
      [
        { label: { en: "Check cert-manager webhook pods and APIService connectivity", fa: "pod webhook cert-manager و APIService را چک کنید" }, correct: true, feedback: { en: "Webhook must be reachable when CRs are created.", fa: "webhook هنگام ساخت CR باید در دسترس باشد." } },
        { label: { en: "Delete all Certificates", fa: "همه Certificate را حذف کنید" }, correct: false, feedback: { en: "Fix webhook availability first.", fa: "اول webhook را درست کنید." } },
      ],
      [{ language: "bash", title: "Webhook", code: `kubectl -n cert-manager get pods -l app.kubernetes.io/component=webhook\nkubectl get validatingwebhookconfigurations | grep cert-manager` }],
      { en: "Webhook not ready, network policy, or cert rotation stuck.", fa: "webhook ready نیست، NetworkPolicy، یا چرخش cert گیر کرده." },
      { en: "Wait for webhook Ready; restart webhook; verify caBundle on webhook config.", fa: "webhook Ready؛ restart webhook؛ caBundle روی config." },
    ),
  ],
};

const falcoPack: LearningPack = {
  whyItExists:
    "Compliance and breach detection need kernel-level visibility—Falco detects suspicious syscalls and Kubernetes audit events using rules, without modifying apps.",
  analogy:
    "Falco is a security camera with motion rules: it watches syscalls (movement) and alerts when someone opens a forbidden door (rule match).",
  howItWorks: [
    "falco DaemonSet loads a kernel module or eBPF probe to see syscalls.",
    "Rules YAML defines conditions (containers, binaries, k8s audit fields).",
    "Alerts go to stdout, gRPC, or sidecar exporters for SIEM integration.",
    "Optional k8saudit plugin consumes Kubernetes audit logs.",
  ],
  prerequisiteLessons: ["daemonset", "admission-webhook", "pod"],
  levels: {
    beginner:
      "Beginners install Falco via Helm, confirm DaemonSet Running, and read alerts from pod logs after a safe lab trigger (e.g. reading /etc/shadow in a container).",
    intermediate:
      "Intermediate users tune rules, reduce noise with macros, and forward JSON to Loki/Elasticsearch. You map Falco priorities to paging policies.",
    advanced:
      "Advanced deployments use custom plugins, response actions via Falcosidekick, and correlate with Kubernetes audit policy. You benchmark probe overhead on production kernels.",
  },
  flows: [
    {
      id: "falco-detect",
      title: { en: "Syscall to alert", fa: "از syscall تا alert" },
      steps: [
        {
          caption: { en: "Falco probe observes syscalls in containers on the node.", fa: "probe Falco syscallها در کانتینرهای Node را می‌بیند." },
          componentIds: ["falco", "app-pod"],
          connectionIds: ["falco-kernel", "falco-pod"],
        },
        {
          caption: { en: "Matching rules emit alerts with priority and fields.", fa: "ruleهای منطبق alert با priority و field می‌فرستند." },
          componentIds: ["falco", "falco-rules"],
        },
      ],
    },
  ],
  lab: basicLab(
    [
      labStep(
        "falco-install",
        { en: "Install Falco Helm chart", fa: "نصب chart Helm Falco" },
        { language: "bash", title: "Helm", code: `helm repo add falcosecurity https://falcosecurity.github.io/charts
helm repo update
helm install falco falcosecurity/falco --namespace falco --create-namespace \\
  --set tty=true
kubectl -n falco rollout status ds/falco --timeout=120s` },
        `daemon set "falco" successfully rolled out`,
        { en: "Privileged DaemonSet installs probe and loads default rules.", fa: "DaemonSet privileged probe نصب و rule پیش‌فرض load می‌کند." },
        ["falco", "falco-rules"],
      ),
      labStep(
        "falco-trigger",
        { en: "Observe an alert (lab)", fa: "مشاهده alert (لاب)" },
        { language: "bash", title: "Sensitive read", code: `kubectl run falco-lab --image=busybox:1.36 --restart=Never -- sleep 3600
kubectl exec falco-lab -- cat /etc/shadow 2>/dev/null || true
kubectl -n falco logs -l app.kubernetes.io/name=falco --tail=30 | grep -i shadow || true` },
        `priority=Warning rule=Read sensitive file`,
        { en: "Reading /etc/shadow often matches bundled sensitive file rules in lab clusters.", fa: "خواندن /etc/shadow اغلب rule فایل حساس را در لاب match می‌کند." },
        ["falco", "app-pod"],
        ["falco-pod"],
      ),
    ],
    {
      prompt: { en: "List Falco DaemonSet pods on all nodes.", fa: "Podهای DaemonSet Falco روی همه Nodeها را لیست کنید." },
      solution: { language: "bash", title: "DS", code: `kubectl -n falco get pods -o wide` },
    },
  ),
  quiz: [
    q("falco-q1", { en: "Falco primarily detects…", fa: "Falco عمدتاً … را detect می‌کند" }, [{ en: "Runtime behavior via syscalls/rules", fa: "رفتار runtime via syscall/rule" }, { en: "YAML typos at apply time", fa: "typo YAML هنگام apply" }, { en: "DNS NXDOMAIN", fa: "DNS NXDOMAIN" }], 0, { en: "Falco is runtime detection, not admission.", fa: "Falco تشخیص runtime است نه admission." }),
    q("falco-q2", { en: "Falco on Kubernetes commonly runs as…", fa: "Falco در Kubernetes معمولاً …" }, [{ en: "DaemonSet", fa: "DaemonSet" }, { en: "CronJob only", fa: "فقط CronJob" }, { en: "Ingress", fa: "Ingress" }], 0, { en: "Needs visibility on every node.", fa: "به دید روی هر Node نیاز دارد." }),
    q("falco-q3", { en: "Falco rules are defined in…", fa: "ruleهای Falco در … تعریف می‌شوند" }, [{ en: "YAML rules files", fa: "فایل YAML rule" }, { en: "Ingress annotations only", fa: "فقط annotation Ingress" }, { en: "Corefile", fa: "Corefile" }], 0, { en: "falco_rules.yaml and custom overrides.", fa: "falco_rules.yaml و override سفارشی." }),
  ],
  troubleshooting: [
    troubleshoot(
      "falco-probe",
      { en: "Falco pod errors: unable to load probe/driver.", fa: "خطای pod Falco: unable to load probe/driver." },
      [
        { label: { en: "Check kernel version and use modern_ebpf driver if supported", fa: "نسخه kernel و driver modern_ebpf را چک کنید" }, correct: true, feedback: { en: "Probe choice depends on kernel/eBPF support.", fa: "انتخاب probe به kernel/eBPF بستگی دارد." } },
        { label: { en: "Disable kubelet", fa: "kubelet را خاموش کنید" }, correct: false, feedback: { en: "Breaks the node—fix Falco driver instead.", fa: "Node را می‌شکند—driver Falco را درست کنید." } },
      ],
      [{ language: "bash", title: "Logs", code: `kubectl -n falco logs -l app.kubernetes.io/name=falco --tail=60\nkubectl -n falco describe pod -l app.kubernetes.io/name=falco | tail -20` }],
      { en: "Unsupported kernel, missing headers, or wrong driver in values.", fa: "kernel پشتیبانی نشده، header نیست، یا driver اشتباه در values." },
      { en: "Set driver.kind=modern_ebpf or kmod per docs; upgrade node kernel.", fa: "driver.kind=modern_ebpf یا kmod طبق docs؛ upgrade kernel." },
    ),
    troubleshoot(
      "falco-no-alerts",
      { en: "Expected alerts never appear.", fa: "alertهای مورد انتظار نمی‌آیند." },
      [
        { label: { en: "Confirm rules loaded and output enabled in values", fa: "rule load شده و output در values فعال باشد" }, correct: true, feedback: { en: "Custom rules or silent outputs hide alerts.", fa: "rule سفارشی یا output خاموش alert را پنهان می‌کند." } },
        { label: { en: "Delete falco namespace permanently", fa: "namespace falco را برای همیشه حذف کنید" }, correct: false, feedback: { en: "Diagnose configuration instead.", fa: "پیکربندی را تشخیص دهید." } },
      ],
      [{ language: "bash", title: "Rules", code: `kubectl -n falco exec ds/falco -- falco --version 2>/dev/null || true\nkubectl -n falco logs -l app.kubernetes.io/name=falco | grep -i rules` }],
      { en: "Rule disabled, priority filter too high, or wrong container context.", fa: "rule غیرفعال، فیلتر priority بالا، یا context کانتینر اشتباه." },
      { en: "Lower min_priority in config; verify rule names; test with known trigger.", fa: "min_priority را پایین بیاورید؛ نام rule؛ trigger شناخته‌شده." },
    ),
  ],
};

const kyvernoPack: LearningPack = {
  whyItExists:
    "Clusters need guardrails beyond RBAC—Kyverno validates, mutates, and generates resources with Kubernetes-native policies as CRDs.",
  analogy:
    "Kyverno is a bouncer with a checklist at the API door: every create/update must satisfy ClusterPolicy rules before objects enter the club (etcd).",
  howItWorks: [
    "Kyverno admission webhooks intercept create/update/delete requests.",
    "ClusterPolicy and Policy resources define match, validate, mutate, and generate rules.",
    "Background scans optionally audit existing resources.",
    "Policies use familiar YAML patterns instead of Rego (contrast with OPA Gatekeeper).",
  ],
  prerequisiteLessons: ["admission-webhook", "namespace", "deployment-replicaset"],
  levels: {
    beginner:
      "Beginners install Kyverno, apply a require-label policy with validationFailureAction Enforce, and see kubectl create denied without labels.",
    intermediate:
      "Intermediate admins write mutate rules (add labels), generate NetworkPolicies, and use policy exceptions. You integrate verifyImages for supply chain.",
    advanced:
      "Advanced policy-as-code uses JMESPath, CEL, reporting metrics, and multi-cluster policy delivery. You tune webhook timeouts and failure policies.",
  },
  flows: [
    {
      id: "kyverno-admit",
      title: { en: "Admission validation", fa: "اعتبارسنجی admission" },
      steps: [
        {
          caption: { en: "Client submits a Deployment to the API server.", fa: "کلاینت Deployment را به API server می‌فرستد." },
          componentIds: ["users", "apiserver"],
          connectionIds: ["users-api"],
        },
        {
          caption: { en: "API server calls Kyverno validating webhook.", fa: "API server webhook validating Kyverno را صدا می‌زند." },
          componentIds: ["apiserver", "kyverno-webhook", "kyverno"],
          connectionIds: ["api-webhook", "webhook-kyverno"],
        },
        {
          caption: { en: "Policy allows or denies the request.", fa: "policy درخواست را allow یا deny می‌کند." },
          componentIds: ["clusterpolicy", "kyverno"],
          connectionIds: ["kyverno-api"],
        },
      ],
    },
  ],
  lab: basicLab(
    [
      labStep(
        "kyverno-install",
        { en: "Install Kyverno", fa: "نصب Kyverno" },
        { language: "bash", title: "Helm", code: `helm repo add kyverno https://kyverno.github.io/kyverno/
helm repo update
helm install kyverno kyverno/kyverno --namespace kyverno --create-namespace
kubectl -n kyverno wait --for=condition=Available deploy/kyverno-admission-controller --timeout=120s
kubectl get validatingwebhookconfigurations | grep kyverno` },
        `kyverno-admission-controller   1/1   Running
kyverno-resource-validating-webhook-cfg`,
        { en: "Admission controller registers validating webhooks with the API server.", fa: "کنترلر admission webhook validating را در API server ثبت می‌کند." },
        ["kyverno", "kyverno-webhook"],
        ["webhook-kyverno"],
      ),
      labStep(
        "kyverno-policy",
        { en: "Enforce owner label on Deployments", fa: "اجبار label owner روی Deployment" },
        { language: "yaml", title: "require-owner.yaml", code: `apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-owner
spec:
  validationFailureAction: Enforce
  rules:
    - name: check-owner
      match:
        any:
          - resources:
              kinds: [Deployment]
      validate:
        message: "label owner is required"
        pattern:
          metadata:
            labels:
              owner: "?*"` },
        `clusterpolicy.kyverno.io/require-owner created`,
        { en: "Kyverno validates Deployment metadata.labels.owner is present.", fa: "Kyverno وجود metadata.labels.owner روی Deployment را validate می‌کند." },
        ["clusterpolicy", "kyverno"],
        ["api-webhook"],
      ),
      labStep(
        "kyverno-test",
        { en: "Test deny and allow", fa: "تست deny و allow" },
        { language: "bash", title: "kubectl create", code: `kubectl create deployment denied --image=nginx:1.27-alpine 2>&1 | head -1
kubectl create deployment allowed --image=nginx:1.27-alpine
kubectl label deploy allowed owner=lab --overwrite` },
        `Error from server: admission webhook "validate.kyverno.svc" denied`,
        { en: "First create lacks owner label; second succeeds after labeling.", fa: "create اول بدون label owner؛ دوم بعد از label موفق می‌شود." },
        ["app-pod", "apiserver"],
      ),
    ],
    {
      prompt: { en: "kubectl apply require-owner.yaml then retry denied deployment.", fa: "require-owner.yaml را apply کنید و deployment denied را دوباره امتحان کنید." },
      solution: { language: "bash", title: "Retry", code: `kubectl apply -f require-owner.yaml\nkubectl create deployment denied --image=nginx:1.27-alpine` },
    },
  ),
  quiz: [
    q("kyv-q1", { en: "Kyverno policies are…", fa: "policyهای Kyverno …" }, [{ en: "Kubernetes CRDs", fa: "CRD Kubernetes" }, { en: "SSH config", fa: "پیکربندی SSH" }, { en: "CNI binaries", fa: "باینری CNI" }], 0, { en: "ClusterPolicy/Policy are kyverno.io resources.", fa: "ClusterPolicy/Policy منابع kyverno.io هستند." }),
    q("kyv-q2", { en: "validationFailureAction Enforce means…", fa: "validationFailureAction Enforce یعنی …" }, [{ en: "Deny violating requests", fa: "رد درخواست‌های ناقض" }, { en: "Only log to etcd", fa: "فقط log به etcd" }, { en: "Delete nodes", fa: "حذف Nodeها" }], 0, { en: "Enforce blocks non-compliant creates/updates.", fa: "Enforce ساخت/به‌روزرسانی ناسازگار را block می‌کند." }),
    q("kyv-q3", { en: "Kyverno runs admission as…", fa: "Kyverno admission را به‌صورت …" }, [{ en: "Validating (and mutating) webhooks", fa: "webhook validating (و mutating)" }, { en: "kube-proxy replacement", fa: "جایگزین kube-proxy" }, { en: "CSI driver only", fa: "فقط CSI driver" }], 0, { en: "Webhooks integrate with the API server admission chain.", fa: "webhook در زنجیره admission API server ادغام می‌شود." }),
  ],
  troubleshooting: [
    troubleshoot(
      "kyv-timeout",
      { en: "API requests timeout after Kyverno install.", fa: "درخواست‌های API بعد از نصب Kyverno timeout." },
      [
        { label: { en: "Check kyverno admission pods Ready and webhook failurePolicy", fa: "pod admission Kyverno Ready و failurePolicy webhook" }, correct: true, feedback: { en: "Unready webhooks stall the API for matched resources.", fa: "webhook ناسالم API را برای resourceهای match شده متوقف می‌کند." } },
        { label: { en: "Remove all ClusterPolicies by deleting etcd", fa: "ClusterPolicyها را با حذف etcd پاک کنید" }, correct: false, feedback: { en: "Never—fix webhook health.", fa: "هرگز—سلامت webhook را درست کنید." } },
      ],
      [{ language: "bash", title: "Webhook", code: `kubectl -n kyverno get pods\nkubectl get validatingwebhookconfigurations kyverno-resource-validating-webhook-cfg -o yaml | grep timeoutSeconds` }],
      { en: "Admission controller not ready or policies too slow.", fa: "کنترلر admission ready نیست یا policy خیلی کند." },
      { en: "Wait for Ready; increase timeoutSeconds; simplify policy rules.", fa: "Ready شوید؛ timeoutSeconds؛ ساده‌سازی rule." },
    ),
    troubleshoot(
      "kyv-not-enforcing",
      { en: "Policy exists but violations still succeed.", fa: "policy هست ولی نقض‌ها موفق می‌شوند." },
      [
        { label: { en: "Confirm validationFailureAction Enforce and rule matches kind/namespace", fa: "validationFailureAction Enforce و match kind/namespace" }, correct: true, feedback: { en: "Audit mode only logs; match blocks may exclude resources.", fa: "حالت Audit فقط log؛ match ممکن است resource را exclude کند." } },
        { label: { en: "Disable API server", fa: "API server خاموش" }, correct: false, feedback: { en: "Policies need API admission—fix policy spec.", fa: "policy به admission نیاز دارد—spec را درست کنید." } },
      ],
      [{ language: "bash", title: "Policy", code: `kubectl get clusterpolicy require-owner -o yaml\nkubectl get policyreport -A` }],
      { en: "Action Audit, exclude rules, or background-only policy.", fa: "Action Audit، rule exclude، یا فقط background." },
      { en: "Set Enforce; fix match; use kubectl create to test matched kind.", fa: "Enforce؛ match؛ kubectl create برای kind." },
    ),
  ],
};

const rookPack: LearningPack = {
  whyItExists:
    "Stateful apps need durable block/file/object storage—Rook operates Ceph inside Kubernetes, turning cluster disks into StorageClasses via CSI.",
  analogy:
    "Rook is a storage foreman: it hires Ceph crews (MON/OSD) on your nodes and hands Kubernetes a simple menu (StorageClass) to order disks.",
  howItWorks: [
    "rook-operator Deployment watches CephCluster and related CRs.",
    "MON daemons quorum over cluster metadata; OSD daemons store data on devices.",
    "Rook deploys the Ceph CSI plugin for PersistentVolumeClaims.",
    "Pools and StorageClasses map Kubernetes volumes to Ceph pools.",
  ],
  prerequisiteLessons: ["statefulset", "pod", "daemonset", "crd-operator"],
  levels: {
    beginner:
      "Beginners install Rook operator, create a minimal CephCluster on lab nodes, and provision a PVC from the ceph-block StorageClass. You watch osd/mon pods become Ready.",
    intermediate:
      "Intermediate admins plan device filters, replication size, and upgrades. You monitor ceph health and tune resources for MON/OSD pods.",
    advanced:
      "Advanced storage teams integrate object buckets (OBCS), multi-cluster failover, encryption, and performance tuning (bluestore, networks). You design bare-metal disk layouts and backup/restore with RBD snapshots.",
  },
  flows: [
    {
      id: "rook-pvc",
      title: { en: "PVC to Ceph OSD", fa: "از PVC تا Ceph OSD" },
      steps: [
        {
          caption: { en: "User creates PVC referencing rook StorageClass.", fa: "کاربر PVC با StorageClass rook می‌سازد." },
          componentIds: ["users", "apiserver", "csi"],
          connectionIds: ["users-api"],
        },
        {
          caption: { en: "CSI plugin provisions RBD volume in Ceph pool.", fa: "CSI volume RBD در pool Ceph provision می‌کند." },
          componentIds: ["csi", "ceph-osds", "app-pod"],
          connectionIds: ["csi-api", "pod-csi"],
        },
      ],
    },
  ],
  lab: basicLab(
    [
      labStep(
        "rook-operator",
        { en: "Install Rook operator", fa: "نصب operator Rook" },
        { language: "bash", title: "kubectl apply", code: `kubectl apply -f https://raw.githubusercontent.com/rook/rook/master/deploy/examples/crds.yaml
kubectl apply -f https://raw.githubusercontent.com/rook/rook/master/deploy/examples/operator.yaml
kubectl -n rook-ceph wait --for=condition=Available deploy/rook-ceph-operator --timeout=180s
kubectl -n rook-ceph get pods` },
        `rook-ceph-operator-xxxx   1/1   Running`,
        { en: "Operator watches CRDs and orchestrates Ceph daemons as Kubernetes pods.", fa: "operator CRDها را watch و daemonهای Ceph را as Pod هماهنگ می‌کند." },
        ["rook-operator"],
        ["operator-api"],
      ),
      labStep(
        "rook-cluster",
        { en: "Apply lab CephCluster manifest (review docs for your disks)", fa: "اعمال manifest CephCluster لاب (دیسک‌ها را در docs ببینید)" },
        { language: "bash", title: "Cluster CR", code: `# Use rook/deploy/examples/cluster.yaml adjusted for your environment
kubectl apply -f cluster.yaml
kubectl -n rook-ceph get cephcluster
kubectl -n rook-ceph get pods -l app=rook-ceph-mon` },
        `NAME        DATADIRHOSTPATH   MONCOUNT   AGE   PHASE   MESSAGE                 HEALTH
my-cluster  /var/lib/rook     3          2m    Ready   Cluster created successfully   HEALTH_OK`,
        { en: "CephCluster CR drives mon/osd creation; HEALTH_OK when quorum and OSDs are up.", fa: "CR CephCluster mon/osd می‌سازد؛ HEALTH_OK وقتی quorum و OSD بالا باشند." },
        ["ceph-mons", "ceph-osds", "rook-operator"],
      ),
    ],
    {
      prompt: { en: "Create a PVC from rook-ceph-block StorageClass once available.", fa: "وقتی آماده شد PVC از StorageClass rook-ceph-block بسازید." },
      solution: {
        language: "yaml",
        title: "pvc.yaml",
        code: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: rook-pvc
spec:
  accessModes: [ReadWriteOnce]
  storageClassName: rook-ceph-block
  resources:
    requests:
      storage: 1Gi`,
      },
    },
  ),
  quiz: [
    q("rook-q1", { en: "Rook primarily orchestrates which storage system?", fa: "Rook عمدتاً کدام سیستم storage را orchestrate می‌کند؟" }, [{ en: "Ceph", fa: "Ceph" }, { en: "SQLite", fa: "SQLite" }, { en: "CoreDNS", fa: "CoreDNS" }], 0, { en: "Rook is a Kubernetes operator for Ceph.", fa: "Rook operator Kubernetes برای Ceph است." }),
    q("rook-q2", { en: "Kubernetes apps consume Rook storage via…", fa: "اپ‌های Kubernetes storage Rook را via … مصرف می‌کنند" }, [{ en: "PVC + CSI driver", fa: "PVC + driver CSI" }, { en: "HostPath only", fa: "فقط HostPath" }, { en: "Ingress rules", fa: "rule Ingress" }], 0, { en: "ceph-csi provisions volumes for PVCs.", fa: "ceph-csi برای PVC volume provision می‌کند." }),
    q("rook-q3", { en: "Ceph MON responsibilities include…", fa: "وظایف Ceph MON شامل …" }, [{ en: "Maintaining cluster map quorum", fa: "نگه‌داشت quorum نقشه کلاستر" }, { en: "Scraping Prometheus metrics", fa: "scrape metric Prometheus" }, { en: "Issuing TLS certs", fa: "صدور cert TLS" }], 0, { en: "MONs hold small but critical cluster metadata.", fa: "MON metadata کوچک ولی حیاتی کلاستر را دارد." }),
  ],
  troubleshooting: [
    troubleshoot(
      "rook-osd-down",
      { en: "CephCluster HEALTH_WARN; OSD pods not Running.", fa: "CephCluster HEALTH_WARN؛ pod OSD Running نیست." },
      [
        { label: { en: "Verify raw devices/disks available and not mounted elsewhere", fa: "device/disk خام در دسترس و mount نشده باشد" }, correct: true, feedback: { en: "OSDs need dedicated devices or configured directories.", fa: "OSD به device اختصاصی یا directory پیکربندی‌شده نیاز دارد." } },
        { label: { en: "Scale Deployment web to zero", fa: "Deployment web را صفر کنید" }, correct: false, feedback: { en: "Unrelated to Ceph OSD placement.", fa: "به جای‌گذاری OSD Ceph ربطی ندارد." } },
      ],
      [{ language: "bash", title: "Ceph tools", code: `kubectl -n rook-ceph exec deploy/rook-ceph-tools -- ceph status\nkubectl -n rook-ceph get pods -l app=rook-ceph-osd` }],
      { en: "Wrong deviceFilter, insufficient resources, or permission on disks.", fa: "deviceFilter اشتباه، منابع کم، یا permission روی disk." },
      { en: "Fix cluster.yaml devices; ensure privileged mounts; check osd prepare job logs.", fa: "device در cluster.yaml؛ mount privileged؛ لاگ job prepare osd." },
    ),
    troubleshoot(
      "rook-pvc-pending",
      { en: "PVC stays Pending for rook StorageClass.", fa: "PVC برای StorageClass rook Pending می‌ماند." },
      [
        { label: { en: "Check CSI plugin pods and StorageClass provisioner name", fa: "pod CSI و نام provisioner StorageClass" }, correct: true, feedback: { en: "CSI must be Running and class must match rook driver.", fa: "CSI باید Running و class با driver rook بخواند." } },
        { label: { en: "Delete rook namespace only", fa: "فقط namespace rook حذف" }, correct: false, feedback: { en: "Diagnose CSI and cluster health first.", fa: "اول CSI و سلامت cluster." } },
      ],
      [{ language: "bash", title: "PVC events", code: `kubectl describe pvc rook-pvc\nkubectl -n rook-ceph get pods -l app=csi-cephfsplugin` }],
      { en: "Ceph not HEALTH_OK, CSI not registered, or pool missing.", fa: "Ceph HEALTH_OK نیست، CSI ثبت نشده، یا pool نیست." },
      { en: "Wait for HEALTH_OK; restart CSI; verify StorageClass and CephBlockPool CR.", fa: "HEALTH_OK؛ restart CSI؛ StorageClass و CephBlockPool." },
    ),
  ],
};

export const learningPacks: Record<ToolId, LearningPack> = {
  kubernetes: kubernetesPack,
  containerd: containerdPack,
  coredns: corednsPack,
  cilium: ciliumPack,
  istio: istioPack,
  prometheus: prometheusPack,
  grafana: grafanaPack,
  opentelemetry: opentelemetryPack,
  "fluent-bit": fluentBitPack,
  "argo-cd": argoCdPack,
  helm: helmPack,
  "cert-manager": certManagerPack,
  falco: falcoPack,
  kyverno: kyvernoPack,
  rook: rookPack,
};

export function getLearningPack(id: string): LearningPack | undefined {
  return learningPacks[id as ToolId];
}

export const learningPackToolIds: ToolId[] = [
  "kubernetes",
  "containerd",
  "coredns",
  "cilium",
  "istio",
  "prometheus",
  "grafana",
  "opentelemetry",
  "fluent-bit",
  "argo-cd",
  "helm",
  "cert-manager",
  "falco",
  "kyverno",
  "rook",
];
