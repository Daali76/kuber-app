import type { Lesson, QuizQuestion } from "@/lib/types";

function q(
  id: string,
  prompt: { en: string; fa: string },
  choices: { en: string; fa: string }[],
  correctIndex: number,
  explanation: { en: string; fa: string },
): QuizQuestion {
  return { id, prompt, choices, correctIndex, explanation };
}

export const coreLessons: Lesson[] = [
  {
    id: "container-image",
    order: 1,
    title: { en: "Container & image", fa: "container و image" },
    analogy: {
      en: "An image is a sealed recipe; a container is one cooked meal from that recipe.",
      fa: "image مثل دستور پخت مهروموم‌شده است؛ container یک وعده‌ی پخته‌شده از همان دستور است.",
    },
    objectives: [
      { en: "Distinguish images from running containers.", fa: "تفاوت image و container در حال اجرا را بگویید." },
      { en: "Know who pulls images on a Node.", fa: "بدانید روی Node چه کسی image را pull می‌کند." },
    ],
    explanation: [
      {
        en: "A container image packages your app’s filesystem layers and metadata. Registries store images; runtimes pull them.",
        fa: "image، لایه‌های فایل‌سیستم و متادیتای اپ را بسته‌بندی می‌کند. رجیستری‌ها image را نگه می‌دارند؛ runtime آن‌ها را pull می‌کند.",
      },
      {
        en: "A container is a running (or created) instance of an image: an isolated process with its own view of files, controlled by the OS kernel.",
        fa: "container نمونه‌ای در حال اجرا (یا ساخته‌شده) از یک image است؛ فرایندی ایزوله با نمای خودش از فایل‌ها که کرنل کنترلش می‌کند.",
      },
      {
        en: "Kubernetes never runs “bare” containers as the unit of scheduling — it schedules Pods that wrap one or more containers.",
        fa: "Kubernetes container تنها را واحد زمان‌بندی نمی‌کند؛ Pod (کوچک‌ترین واحد اجرا در Kubernetes) را زمان‌بندی می‌کند که یک یا چند container را در بر می‌گیرد.",
      },
    ],
    commonConfusion: {
      en: "An image is not a running process; a container is not the same as a Pod.",
      fa: "image خودش فرایند در حال اجرا نیست؛ container هم با Pod یکی نیست.",
    },
    summaryLines: [
      { en: "Image = packaged layers; container = running instance.", fa: "image = لایه‌های بسته‌بندی‌شده؛ container = نمونه‌ی در حال اجرا." },
      { en: "Kubernetes schedules Pods, not lone containers.", fa: "Kubernetes، Pod را زمان‌بندی می‌کند نه container تنها." },
    ],
    diagramHighlights: { componentIds: ["runtime", "app-pod"], connectionIds: ["runtime-pod"] },
    keyCommands: [
      {
        language: "bash",
        title: "Inspect image / runtime",
        code: `crane digest nginx:1.27-alpine
sudo crictl images`,
      },
    ],
    quiz: [
      q("ci1", { en: "What does an image primarily contain?", fa: "در یک image عمدتاً چه چیزی هست؟" }, [
        { en: "A running process", fa: "یک فرایند در حال اجرا" },
        { en: "Filesystem layers + metadata", fa: "لایه‌های فایل‌سیستم + متادیتا" },
        { en: "Only a Dockerfile", fa: "فقط Dockerfile" },
      ], 1, { en: "Images are packages of layers and config; containers are runtime instances.", fa: "image بسته‌ی لایه و پیکربندی است؛ container نمونه‌ی runtime است." }),
      q("ci2", { en: "Who pulls images onto a node in Kubernetes?", fa: "در Kubernetes چه کسی image را روی Node می‌آورد؟" }, [
        { en: "etcd", fa: "etcd" },
        { en: "The container runtime (via kubelet/CRI)", fa: "container runtime (از مسیر kubelet/CRI)" },
        { en: "Ingress", fa: "Ingress" },
      ], 1, { en: "kubelet asks the CRI runtime to pull and run containers.", fa: "kubelet از runtime مبتنی بر CRI می‌خواهد image را pull و اجرا کند." }),
      q("ci3", { en: "Kubernetes schedules which unit?", fa: "کدام واحد در Kubernetes زمان‌بندی می‌شود؟" }, [
        { en: "Individual containers only", fa: "فقط container تکی" },
        { en: "Pods", fa: "Pod" },
        { en: "Docker Compose files", fa: "فایل Docker Compose" },
      ], 1, { en: "The Pod is the atomic scheduling unit.", fa: "Pod واحد اتمی زمان‌بندی است." }),
    ],
  },
  {
    id: "pod",
    order: 2,
    title: { en: "Pod", fa: "Pod" },
    analogy: {
      en: "A Pod is a pea pod: one or more peas (containers) sharing the same shell (network/storage).",
      fa: "Pod مثل غلاف نخود است؛ چند دانه (container) در یک پوسته‌ی مشترک (شبکه و ذخیره).",
    },
    objectives: [
      { en: "Explain shared networking inside a Pod.", fa: "شبکه‌ی مشترک داخل Pod را توضیح دهید." },
      { en: "Use probes for health and traffic.", fa: "از probe برای سلامت و ترافیک استفاده کنید." },
    ],
    explanation: [
      {
        en: "A Pod is the smallest deployable object. Containers in a Pod share the network namespace (same IP) and can share volumes.",
        fa: "Pod (کوچک‌ترین واحد اجرا در Kubernetes) کوچک‌ترین object قابل استقرار است. containerهای یک Pod فضای شبکه‌ی مشترک (همان IP) دارند و می‌توانند volume شریک شوند.",
      },
      {
        en: "Pods are ephemeral. Controllers recreate them; you rarely create bare Pods in production.",
        fa: "Pod موقتی است. کنترلرها دوباره می‌سازندش؛ در production کمتر Pod تنها (بدون کنترلر) می‌سازید.",
      },
      {
        en: "Probes (liveness, readiness, startup) let kubelet know when to restart or when traffic can flow.",
        fa: "probeها به kubelet می‌گویند چه زمانی container را restart کند و چه زمانی ترافیک بفرستد.",
      },
    ],
    commonConfusion: {
      en: "A Pod is not meant to be a long-lived pet you hand-edit forever.",
      fa: "Pod برای حیوان خانگی ماندگار و ویرایش دستی همیشگی طراحی نشده است.",
    },
    summaryLines: [
      { en: "One Pod, one IP, shared localhost between containers.", fa: "یک Pod، یک IP، localhost مشترک بین containerها." },
      { en: "Prefer controllers over bare Pods.", fa: "کنترلر را به Pod تنها (بدون کنترلر) ترجیح دهید." },
    ],
    diagramHighlights: { componentIds: ["app-pod", "kubelet", "runtime"], connectionIds: ["kubelet-runtime", "runtime-pod"] },
    keyCommands: [
      { language: "bash", title: "Pod basics", code: `kubectl run demo --image=nginx:1.27-alpine --restart=Never
kubectl get pods -o wide
kubectl describe pod demo` },
    ],
    quiz: [
      q("p1", { en: "Containers in one Pod share…", fa: "containerهای یک Pod چه چیزی را شریک‌اند؟" }, [
        { en: "Nothing", fa: "هیچ" },
        { en: "Network namespace (and optionally volumes)", fa: "فضای شبکه (و اختیاریاً volume)" },
        { en: "Separate cluster IPs each", fa: "هرکدام IP کلاستر جدا" },
      ], 1, { en: "They share netns; localhost works between sidecars and the app.", fa: "netns مشترک است؛ localhost بین sidecar و اپ کار می‌کند." }),
      q("p2", { en: "Are Pods durable pets?", fa: "آیا Pod ماندگار و غیرقابل تعویض است؟" }, [
        { en: "Yes, always", fa: "بله، همیشه" },
        { en: "No — treat them as replaceable", fa: "خیر — قابل جایگزینی‌اند" },
        { en: "Only on Windows", fa: "فقط روی ویندوز" },
      ], 1, { en: "Design for restart and reschedule.", fa: "برای restart و زمان‌بندی دوباره طراحی کنید." }),
      q("p3", { en: "Who executes probes?", fa: "اجرای probe بر عهده‌ی چه کسی است؟" }, [
        { en: "etcd", fa: "etcd" },
        { en: "kubelet", fa: "kubelet" },
        { en: "CoreDNS", fa: "CoreDNS" },
      ], 1, { en: "kubelet runs probes against containers on the node.", fa: "kubelet روی Node، probe را روی containerها اجرا می‌کند." }),
    ],
  },
  {
    id: "node-kubelet",
    order: 3,
    title: { en: "Node & kubelet", fa: "Node و kubelet" },
    analogy: {
      en: "The Node is the kitchen; kubelet is the cook that follows API-server tickets.",
      fa: "Node آشپزخانه است؛ kubelet آشپزی است که سفارش‌های API server را اجرا می‌کند.",
    },
    objectives: [
      { en: "List main agents on a worker Node.", fa: "عامل‌های اصلی روی worker Node را نام ببرید." },
      { en: "Describe kubelet ↔ API server ↔ CRI flow.", fa: "جریان kubelet، API server و CRI را بگویید." },
    ],
    explanation: [
      {
        en: "A Node is a machine registered to the cluster. It runs kubelet, a container runtime, and usually kube-proxy (or an eBPF dataplane).",
        fa: "Node ماشینی ثبت‌شده در کلاستر است. kubelet، runtime و معمولاً kube-proxy (یا dataplane مبتنی بر eBPF) روی آن اجرا می‌شوند.",
      },
      {
        en: "kubelet watches the API for Pods assigned to its node, then uses CRI to create containers and report status.",
        fa: "kubelet Podهای اختصاص‌یافته به Node خودش را از API می‌بیند؛ با CRI container می‌سازد و وضعیت را گزارش می‌دهد.",
      },
      {
        en: "If kubelet is unhealthy, the Node may be marked NotReady and Pods can be evicted according to policy.",
        fa: "اگر kubelet ناسالم باشد، Node ممکن است NotReady شود و Podها طبق سیاست تخلیه شوند.",
      },
    ],
    commonConfusion: {
      en: "kubelet does not replace the scheduler; it executes what was already assigned.",
      fa: "kubelet جای scheduler را نمی‌گیرد؛ فقط آنچه اختصاص یافته اجرا می‌کند.",
    },
    summaryLines: [
      { en: "Node = worker machine; kubelet = local agent.", fa: "Node = ماشین worker؛ kubelet = عامل محلی." },
      { en: "Containers start through CRI on the Node.", fa: "containerها از مسیر CRI روی Node بالا می‌آیند." },
    ],
    diagramHighlights: { componentIds: ["kubelet", "runtime", "apiserver"], connectionIds: ["kubelet-api", "kubelet-runtime"] },
    keyCommands: [
      { language: "bash", title: "Nodes", code: `kubectl get nodes -o wide
kubectl describe node` },
    ],
    quiz: [
      q("n1", { en: "kubelet primarily talks to…", fa: "عامل kubelet عمدتاً با چه چیزی صحبت می‌کند؟" }, [
        { en: "Only Git", fa: "فقط Git" },
        { en: "API server + container runtime (CRI)", fa: "API server + runtime (CRI)" },
        { en: "Only etcd directly", fa: "مستقیم فقط etcd" },
      ], 1, { en: "Status goes to the API; containers go through CRI.", fa: "وضعیت به API می‌رود؛ container از CRI." }),
      q("n2", { en: "Where do application Pods usually run?", fa: "Podهای اپ معمولاً کجا اجرا می‌شوند؟" }, [
        { en: "On worker nodes", fa: "روی worker Node" },
        { en: "Inside etcd", fa: "داخل etcd" },
        { en: "Only on laptops", fa: "فقط روی لپ‌تاپ" },
      ], 0, { en: "Workers run workloads; control plane may be tainted.", fa: "workerها workload را اجرا می‌کنند؛ control plane ممکن است taint داشته باشد." }),
      q("n3", { en: "CRI is…", fa: "منظور از CRI چیست؟" }, [
        { en: "A CNI plugin", fa: "یک پلاگین CNI" },
        { en: "The interface between kubelet and the runtime", fa: "رابط بین kubelet و runtime" },
        { en: "A Helm chart", fa: "یک Helm chart" },
      ], 1, { en: "Container Runtime Interface standardizes runtime calls.", fa: "CRI فراخوانی runtime را استاندارد می‌کند." }),
    ],
  },
  {
    id: "control-plane",
    order: 4,
    title: { en: "Control plane", fa: "Control plane" },
    analogy: {
      en: "The control plane is air-traffic control: it does not fly the planes (Pods) but decides and records everything.",
      fa: "control plane مثل برج مراقبت است؛ خودش پرواز نمی‌کند اما همه‌چیز را تصمیم و ثبت می‌کند.",
    },
    objectives: [
      { en: "Name the core control-plane components.", fa: "اجزای اصلی control plane را نام ببرید." },
      { en: "Explain where cluster state lives.", fa: "بگویید وضعیت کلاستر کجا ذخیره می‌شود." },
    ],
    explanation: [
      {
        en: "API server is the front door — authentication, authorization, admission, then persistence.",
        fa: "API server درِ ورودی کلاستر است؛ درخواست‌ها را بررسی می‌کند و Kubernetes API را در اختیار بقیه می‌گذارد. مسیر کار: احراز هویت، مجوز، admission، سپس ذخیره.",
      },
      {
        en: "etcd stores cluster state. scheduler binds Pods to Nodes. controller-manager runs reconcile loops (Deployments, Endpoints, …).",
        fa: "etcd وضعیت را نگه می‌دارد (پایگاه‌داده‌ی key-value با سازگاری قوی). scheduler، Pod را به Node می‌چسباند. controller-manager حلقه‌های reconcile را اجرا می‌کند.",
      },
      {
        en: "You interact with the control plane via kubectl or controllers — workers execute the resulting Pod specs.",
        fa: "با kubectl یا کنترلرها با control plane کار می‌کنید؛ workerها مشخصات Pod را اجرا می‌کنند.",
      },
    ],
    commonConfusion: {
      en: "Workloads usually run on workers, not on control-plane Nodes.",
      fa: "workloadها معمولاً روی worker اجرا می‌شوند نه روی Nodeهای control plane.",
    },
    summaryLines: [
      { en: "API server gates every write.", fa: "هر نوشتن از API server می‌گذرد." },
      { en: "etcd holds desired and observed state.", fa: "etcd وضعیت مطلوب و مشاهده‌شده را نگه می‌دارد." },
    ],
    diagramHighlights: {
      componentIds: ["apiserver", "etcd", "scheduler", "controller-manager"],
      connectionIds: ["api-etcd", "sched-api", "cm-api", "users-api"],
    },
    keyCommands: [
      { language: "bash", title: "Control plane health", code: `kubectl get --raw='/readyz?verbose'
kubectl get componentstatuses 2>/dev/null || true` },
    ],
    quiz: [
      q("cp1", { en: "Cluster state is stored in…", fa: "وضعیت کلاستر کجا ذخیره می‌شود؟" }, [
        { en: "etcd", fa: "etcd" },
        { en: "Prometheus", fa: "Prometheus" },
        { en: "Ingress", fa: "Ingress" },
      ], 0, { en: "etcd is the control-plane datastore.", fa: "etcd پایگاه‌داده‌ی control plane است." }),
      q("cp2", { en: "Who assigns Pods to Nodes?", fa: "اختصاص Pod به Node بر عهده‌ی چه کسی است؟" }, [
        { en: "CoreDNS", fa: "CoreDNS" },
        { en: "scheduler", fa: "scheduler" },
        { en: "Helm", fa: "Helm" },
      ], 1, { en: "kube-scheduler watches unbound Pods.", fa: "kube-scheduler Podهای بدون Node را می‌بیند." }),
      q("cp3", { en: "kubectl talks to…", fa: "ابزار kubectl با چه چیزی صحبت می‌کند؟" }, [
        { en: "Only kubelet", fa: "فقط kubelet" },
        { en: "The API server", fa: "API server" },
        { en: "Only the CNI", fa: "فقط CNI" },
      ], 1, { en: "All standard cluster writes go through the API server.", fa: "نوشتن‌های استاندارد از API server می‌گذرد." }),
    ],
  },
  {
    id: "deployment-replicaset",
    order: 5,
    title: { en: "Deployment & ReplicaSet", fa: "Deployment و ReplicaSet" },
    analogy: {
      en: "Deployment is the manager; ReplicaSet is the shift roster keeping N identical workers.",
      fa: "Deployment مدیر است؛ ReplicaSet شیفت‌بندی است که N کارگر یکسان نگه می‌دارد.",
    },
    objectives: [
      { en: "Relate Deployment → ReplicaSet → Pods.", fa: "رابطه‌ی Deployment، ReplicaSet و Pod را بگویید." },
      { en: "Use declarative rollouts safely.", fa: "rollout declarative (اعلام وضعیت مطلوب) را امن انجام دهید." },
    ],
    explanation: [
      {
        en: "A ReplicaSet ensures a Pod template runs at a desired replica count.",
        fa: "ReplicaSet تضمین می‌کند قالب Pod با تعداد replica مطلوب اجرا شود.",
      },
      {
        en: "A Deployment owns ReplicaSets and performs rolling updates, rollbacks, and scaling.",
        fa: "Deployment مالک ReplicaSet است و rolling update، rollback و مقیاس را انجام می‌دهد.",
      },
      {
        en: "You usually apply a Deployment, not a bare ReplicaSet, so rollout history is tracked.",
        fa: "معمولاً Deployment اعمال می‌کنید نه ReplicaSet تنها، تا تاریخچه‌ی rollout بماند.",
      },
    ],
    commonConfusion: {
      en: "ReplicaSet alone lacks Deployment rollout history and strategy knobs.",
      fa: "ReplicaSet تنها، تاریخچه و تنظیمات rollout Deployment را ندارد.",
    },
    summaryLines: [
      { en: "Deployment = declarative Pod updates.", fa: "Deployment = به‌روزرسانی declarative (اعلام وضعیت مطلوب) Pod." },
      { en: "ReplicaSet keeps N matching Pods.", fa: "ReplicaSet، N Pod مطابق قالب نگه می‌دارد." },
    ],
    diagramHighlights: { componentIds: ["app-pod", "apiserver", "controller-manager"], connectionIds: ["cm-api", "kubelet-api"] },
    keyCommands: [
      { language: "bash", title: "Deployment", code: `kubectl create deployment web --image=nginx:1.27-alpine
kubectl scale deployment/web --replicas=3
kubectl rollout status deployment/web` },
    ],
    quiz: [
      q("d1", { en: "Rolling updates are managed by…", fa: "مدیریت rolling update بر عهده‌ی چه کسی است؟" }, [
        { en: "Deployment", fa: "Deployment" },
        { en: "Service", fa: "Service" },
        { en: "ConfigMap", fa: "ConfigMap" },
      ], 0, { en: "Deployment creates new ReplicaSets during rollouts.", fa: "Deployment هنگام rollout، ReplicaSet جدید می‌سازد." }),
      q("d2", { en: "ReplicaSet’s job is…", fa: "کار ReplicaSet چیست؟" }, [
        { en: "Terminate etcd", fa: "خاموش کردن etcd" },
        { en: "Keep N Pods matching a template", fa: "نگه داشتن N Pod مطابق قالب" },
        { en: "Issue TLS certs", fa: "صدور گواهی TLS" },
      ], 1, { en: "It reconciles replica count.", fa: "تعداد replica را reconcile می‌کند." }),
      q("d3", { en: "Preferred production object?", fa: "object ترجیحی در production کدام است؟" }, [
        { en: "Bare Pod", fa: "Pod تنها (بدون کنترلر)" },
        { en: "Deployment", fa: "Deployment" },
        { en: "docker run", fa: "docker run" },
      ], 1, { en: "Deployments give rollout controls.", fa: "Deployment کنترل rollout می‌دهد." }),
    ],
  },
  {
    id: "service-dns",
    order: 6,
    title: { en: "Service & DNS", fa: "Service و DNS" },
    analogy: {
      en: "A Service is the front-desk phone number; Pods behind it can change seats.",
      fa: "Service مثل شماره‌ی منشی است؛ Podهای پشتش ممکن است جایشان عوض شود.",
    },
    objectives: [
      { en: "Explain stable ClusterIP vs churning Pods.", fa: "تفاوت ClusterIP پایدار و Podهای متغیر را بگویید." },
      { en: "Resolve in-cluster DNS names.", fa: "نام DNS داخل کلاستر را resolve کنید." },
    ],
    explanation: [
      {
        en: "A Service gives a stable virtual IP (ClusterIP) and selects Pods by labels.",
        fa: "Service یک IP مجازی پایدار (ClusterIP) می‌دهد و Podها را با label انتخاب می‌کند.",
      },
      {
        en: "Cluster DNS (CoreDNS) publishes names like my-svc.my-ns.svc.cluster.local.",
        fa: "DNS کلاستر (CoreDNS) نام‌هایی مثل my-svc.my-ns.svc.cluster.local را منتشر می‌کند.",
      },
      {
        en: "kube-proxy or an eBPF dataplane implements Service routing on nodes.",
        fa: "kube-proxy یا dataplane مبتنی بر eBPF، مسیریابی Service را روی Node پیاده می‌کند.",
      },
    ],
    commonConfusion: {
      en: "A Service is not a Pod; it is a stable front for a changing set of Pods.",
      fa: "Service خودش Pod نیست؛ جلوی مجموعه‌ای از Podهای در حال تعویض است.",
    },
    summaryLines: [
      { en: "Labels connect Service to Pods.", fa: "label، Service را به Pod وصل می‌کند." },
      { en: "CoreDNS resolves Service names inside the cluster.", fa: "CoreDNS نام Service را داخل کلاستر resolve می‌کند." },
    ],
    diagramHighlights: { componentIds: ["svc", "app-pod"], connectionIds: ["svc-pod"] },
    keyCommands: [
      { language: "bash", title: "Service", code: `kubectl expose deployment web --port=80 --target-port=80
kubectl get svc,endpoints
kubectl -n kube-system get pods -l k8s-app=kube-dns` },
    ],
    quiz: [
      q("s1", { en: "Services select Pods using…", fa: "برای انتخاب Pod، Service از چه استفاده می‌کند؟" }, [
        { en: "Labels / selectors", fa: "label / selector" },
        { en: "Random UIDs only", fa: "فقط UID تصادفی" },
        { en: "Image digests", fa: "digest image" },
      ], 0, { en: "Label selectors bind Service to Endpoints/EndpointSlices.", fa: "selector، Service را به Endpoint وصل می‌کند." }),
      q("s2", { en: "CoreDNS provides…", fa: "CoreDNS چه چیزی فراهم می‌کند؟" }, [
        { en: "Block storage", fa: "ذخیره‌ی بلوکی" },
        { en: "In-cluster name resolution", fa: "resolve نام داخل کلاستر" },
        { en: "TLS issuance", fa: "صدور TLS" },
      ], 1, { en: "Pods resolve Service DNS via CoreDNS.", fa: "Podها نام Service را با CoreDNS resolve می‌کنند." }),
      q("s3", { en: "ClusterIP is…", fa: "ClusterIP چیست؟" }, [
        { en: "A virtual IP for the Service", fa: "IP مجازی Service" },
        { en: "The node’s public IP", fa: "IP عمومی Node" },
        { en: "An etcd key", fa: "یک کلید etcd" },
      ], 0, { en: "ClusterIP stays stable as Pods churn.", fa: "ClusterIP با تعویض Pod پایدار می‌ماند." }),
    ],
  },
  {
    id: "namespace",
    order: 7,
    title: { en: "Namespace", fa: "Namespace" },
    analogy: {
      en: "Namespaces are labeled drawers in one filing cabinet (the cluster).",
      fa: "Namespace کشوهای برچسب‌خورده‌ی یک کمد (کلاستر) هستند.",
    },
    objectives: [
      { en: "Scope names without duplicating clusters.", fa: "نام‌ها را بدون کلاستر تکراری محدود کنید." },
      { en: "Know cluster-scoped vs namespaced types.", fa: "نوع cluster-scoped و namespaced را بشناسید." },
    ],
    explanation: [
      {
        en: "Namespaces scope names of many resources (Pods, Services, Deployments) so teams can share a cluster.",
        fa: "Namespace نام بسیاری از منابع (Pod، Service، Deployment) را محدوده می‌کند تا تیم‌ها یک کلاستر را شریک شوند.",
      },
      {
        en: "They are not strong security boundaries alone — combine with RBAC and NetworkPolicy.",
        fa: "به‌تنهایی مرز امنیتی قوی نیستند؛ با RBAC و NetworkPolicy ترکیب کنید.",
      },
      {
        en: "Some objects are cluster-scoped (nodes, PersistentVolumes, CRDs) and have no namespace.",
        fa: "بعضی objectها cluster-scoped هستند (Node، PersistentVolume، CRD) و namespace ندارند.",
      },
    ],
    commonConfusion: {
      en: "Namespace isolation is organizational, not a hard multi-tenant wall by itself.",
      fa: "جداسازی Namespace سازمانی است؛ به‌تنهایی دیوار سخت چندمستاجری نیست.",
    },
    summaryLines: [
      { en: "Same kind + name can repeat in different namespaces.", fa: "kind و نام یکسان در Namespaceهای مختلف مجاز است." },
      { en: "Nodes and PVs are cluster-scoped.", fa: "Node و PV در سطح کلاستر تعریف می‌شوند." },
    ],
    diagramHighlights: { componentIds: ["svc", "app-pod", "ingress"] },
    keyCommands: [
      { language: "bash", title: "Namespaces", code: `kubectl create namespace practice
kubectl get ns
kubectl -n practice get all` },
    ],
    quiz: [
      q("ns1", { en: "Namespaces mainly provide…", fa: "Namespace عمدتاً چه چیزی می‌دهد؟" }, [
        { en: "Name scoping", fa: "محدوده‌بندی نام" },
        { en: "Hardware virtualization", fa: "مجازی‌سازی سخت‌افزار" },
        { en: "Image builds", fa: "ساخت image" },
      ], 0, { en: "Same resource name can exist in different namespaces.", fa: "نام یکسان در Namespaceهای مختلف مجاز است." }),
      q("ns2", { en: "Are Nodes namespaced?", fa: "آیا Node داخل Namespace است؟" }, [
        { en: "Yes", fa: "بله" },
        { en: "No — cluster-scoped", fa: "خیر — cluster-scoped" },
        { en: "Only in kind", fa: "فقط در kind" },
      ], 1, { en: "Nodes are cluster-scoped objects.", fa: "Node، objectی cluster-scoped است." }),
      q("ns3", { en: "Default kubectl namespace if unset?", fa: "اگر Namespace ست نشود، پیش‌فرض kubectl چیست؟" }, [
        { en: "kube-system", fa: "kube-system" },
        { en: "default", fa: "default" },
        { en: "kube-public", fa: "kube-public" },
      ], 1, { en: "The default namespace is named default.", fa: "Namespace پیش‌فرض، default نام دارد." }),
    ],
  },
  {
    id: "configmap-secret",
    order: 8,
    title: { en: "ConfigMap & Secret", fa: "ConfigMap و Secret" },
    analogy: {
      en: "ConfigMap is the bulletin board; Secret is the locked drawer (still lock the building with encryption!).",
      fa: "ConfigMap تابلوی اعلانات است؛ Secret کشوی قفل‌دار (رمزنگاری etcd را فراموش نکنید!).",
    },
    objectives: [
      { en: "Choose ConfigMap vs Secret.", fa: "بین ConfigMap و Secret انتخاب کنید." },
      { en: "Mount or inject config into Pods.", fa: "پیکربندی را به Pod mount یا inject کنید." },
    ],
    explanation: [
      {
        en: "ConfigMaps hold non-confidential config as keys/values or files mounted into Pods.",
        fa: "ConfigMap پیکربندی غیرمحرمانه را به‌صورت کلید/مقدار یا فایل در Pod نگه می‌دارد.",
      },
      {
        en: "Secrets hold sensitive material. By default they are base64-encoded, not encrypted — enable encryption at rest.",
        fa: "Secret داده‌ی حساس دارد. پیش‌فرض فقط base64 است؛ encryption at rest را روشن کنید.",
      },
      {
        en: "Mount as volumes or inject as environment variables; watch size limits and update semantics.",
        fa: "به‌صورت volume یا متغیر محیطی تزریق کنید؛ محدودیت حجم و رفتار به‌روزرسانی را بشناسید.",
      },
    ],
    commonConfusion: {
      en: "Base64 in etcd is encoding, not encryption.",
      fa: "base64 در etcd کدگذاری است، نه رمزنگاری.",
    },
    summaryLines: [
      { en: "Never put secrets in ConfigMaps.", fa: "رمز را در ConfigMap نگذارید." },
      { en: "Use RBAC and encryption at rest for Secrets.", fa: "برای Secret از RBAC و encryption at rest استفاده کنید." },
    ],
    diagramHighlights: { componentIds: ["app-pod", "apiserver"], connectionIds: ["kubelet-api"] },
    keyCommands: [
      { language: "bash", title: "Config & Secret", code: `kubectl create configmap app-config --from-literal=theme=dark
kubectl create secret generic app-secret --from-literal=token=demo` },
    ],
    quiz: [
      q("cs1", { en: "Default Secret storage is…", fa: "ذخیره‌ی پیش‌فرض Secret چگونه است؟" }, [
        { en: "Encrypted with your password", fa: "با پسورد شما رمز شده" },
        { en: "Base64-encoded in etcd (enable encryption at rest separately)", fa: "base64 در etcd (رمزنگاری جداگانه)" },
        { en: "Never stored", fa: "هرگز ذخیره نمی‌شود" },
      ], 1, { en: "Treat RBAC + encryption at rest seriously.", fa: "RBAC و encryption at rest مهم‌اند." }),
      q("cs2", { en: "ConfigMaps are for…", fa: "ConfigMap برای چه چیزی است؟" }, [
        { en: "Non-secret configuration", fa: "پیکربندی غیرمحرمانه" },
        { en: "Only TLS private keys", fa: "فقط کلید خصوصی TLS" },
        { en: "CNI binaries", fa: "باینری CNI" },
      ], 0, { en: "Keep secrets out of ConfigMaps.", fa: "رمز را در ConfigMap نگذارید." }),
      q("cs3", { en: "How can Pods consume them?", fa: "Pod چطور از آن‌ها استفاده می‌کند؟" }, [
        { en: "Env vars or mounted files", fa: "متغیر محیطی یا فایل mountشده" },
        { en: "Only via SSH", fa: "فقط SSH" },
        { en: "Only via Ingress", fa: "فقط Ingress" },
      ], 0, { en: "Both volume mounts and envFrom/valueFrom are common.", fa: "volume و env هر دو رایج‌اند." }),
    ],
  },
  {
    id: "daemonset",
    order: 9,
    title: { en: "DaemonSet", fa: "DaemonSet" },
    analogy: {
      en: "Like putting a smoke detector in every room (node).",
      fa: "مثل نصب دتکتور دود در هر اتاق (Node).",
    },
    objectives: [
      { en: "Run one Pod per eligible Node.", fa: "یک Pod روی هر Node واجد شرایط اجرا کنید." },
      { en: "Know typical DaemonSet agents.", fa: "agentهای رایج DaemonSet را بشناسید." },
    ],
    explanation: [
      {
        en: "A DaemonSet ensures a Pod copy runs on all eligible nodes — ideal for agents (logs, CNI, security).",
        fa: "DaemonSet تضمین می‌کند یک کپی Pod روی همه‌ی Nodeهای واجد شرایط اجرا شود؛ مناسب agentها (لاگ، CNI، امنیت).",
      },
      {
        en: "As nodes join, DaemonSet schedules Pods there; when nodes leave, those Pods go away.",
        fa: "با پیوستن Node، Pod هم می‌آید؛ با رفتن Node، Pod می‌رود.",
      },
      {
        en: "Use node selectors / tolerations to control which nodes get the agent.",
        fa: "با node selector و toleration مشخص کنید کدام Node agent بگیرد.",
      },
    ],
    commonConfusion: {
      en: "DaemonSet is not the same as a Deployment with replicas=N nodes.",
      fa: "DaemonSet با Deployment که replica برابر تعداد Node باشد یکی نیست.",
    },
    summaryLines: [
      { en: "One agent Pod per node (by design).", fa: "طراحی‌شده برای یک Pod agent روی هر Node." },
      { en: "Classic for logs, CNI, node monitoring.", fa: "کلاسیک برای لاگ، CNI و مانیتور Node." },
    ],
    diagramHighlights: { componentIds: ["kubelet", "runtime", "app-pod"] },
    keyCommands: [
      { language: "bash", title: "List DaemonSets", code: `kubectl get daemonsets -A
kubectl -n kube-system get ds` },
    ],
    quiz: [
      q("ds1", { en: "DaemonSets are ideal for…", fa: "DaemonSet برای چه کاری ایده‌آل است؟" }, [
        { en: "One-off batch jobs", fa: "جاب یک‌باره" },
        { en: "Per-node agents", fa: "agent روی هر Node" },
        { en: "Storing etcd backups only", fa: "فقط بکاپ etcd" },
      ], 1, { en: "Log shippers and CNI agents are classic DaemonSets.", fa: "ارسال لاگ و agent شبکه نمونه‌ی کلاسیک‌اند." }),
      q("ds2", { en: "New node joins — DaemonSet…", fa: "وقتی Node جدید می‌پیوندد، DaemonSet…" }, [
        { en: "Ignores it", fa: "نادیده می‌گیرد" },
        { en: "Schedules a Pod on it (if eligible)", fa: "در صورت واجد شرایط Pod می‌گذارد" },
        { en: "Deletes the cluster", fa: "کلاستر را پاک می‌کند" },
      ], 1, { en: "Controller reconciles node set vs Pods.", fa: "کنترلر Nodeها را با Pod هم‌تراز می‌کند." }),
      q("ds3", { en: "Unlike Deployment, DaemonSet…", fa: "برخلاف Deployment، DaemonSet…" }, [
        { en: "Targets nodes, not a floating replica count alone", fa: "Node را هدف می‌گیرد نه فقط تعداد شناور" },
        { en: "Cannot run Pods", fa: "نمی‌تواند Pod اجرا کند" },
        { en: "Replaces etcd", fa: "جای etcd می‌نشیند" },
      ], 0, { en: "Replica count follows node count (roughly).", fa: "تعداد تقریباً از تعداد Node پیروی می‌کند." }),
    ],
  },
  {
    id: "statefulset",
    order: 10,
    title: { en: "StatefulSet", fa: "StatefulSet" },
    analogy: {
      en: "Hotel rooms with fixed numbers and luggage that stays (PVCs).",
      fa: "اتاق‌های هتل با شماره‌ی ثابت و چمدان ماندگار (PVC).",
    },
    objectives: [
      { en: "Give Pods stable network identity.", fa: "هویت شبکه‌ی پایدار به Pod بدهید." },
      { en: "Use volumeClaimTemplates per ordinal.", fa: "volumeClaimTemplates را برای هر ordinal به کار ببرید." },
    ],
    explanation: [
      {
        en: "StatefulSets give stable network identities and ordered deploy/scale for clustered software.",
        fa: "StatefulSet هویت شبکه‌ی پایدار و استقرار/مقیاس مرتب برای نرم‌افزار خوشه‌ای می‌دهد.",
      },
      {
        en: "Each ordinal Pod can get its own PersistentVolumeClaim via volumeClaimTemplates.",
        fa: "هر Pod ترتیبی می‌تواند PVC خودش را از volumeClaimTemplates بگیرد.",
      },
      {
        en: "Use when peers need stable DNS (pod-0, pod-1) — databases, queues — not for stateless web tiers.",
        fa: "وقتی peer به DNS پایدار نیاز دارد (pod-0، pod-1) — دیتابیس، صف — نه برای وب stateless.",
      },
    ],
    commonConfusion: {
      en: "Do not default to StatefulSet for every app with a disk.",
      fa: "هر اپ با دیسک لزوماً StatefulSet نیست.",
    },
    summaryLines: [
      { en: "Stable names + ordered rollout.", fa: "نام پایدار + rollout مرتب." },
      { en: "PVC per Pod via templates.", fa: "PVC به‌ازای Pod با template." },
    ],
    diagramHighlights: { componentIds: ["app-pod", "cloud-storage"] },
    keyCommands: [
      { language: "bash", title: "Inspect StatefulSets", code: `kubectl get statefulsets -A
kubectl get pvc` },
    ],
    quiz: [
      q("ss1", { en: "Stable identities matter for…", fa: "هویت پایدار برای چه چیزی مهم است؟" }, [
        { en: "Stateless nginx replicas only", fa: "فقط replicaهای nginx stateless" },
        { en: "Many clustered datastores", fa: "بسیاری از دیتاستورهای خوشه‌ای" },
        { en: "ConfigMaps", fa: "ConfigMap" },
      ], 1, { en: "Peers discover each other by ordinal DNS names.", fa: "peerها با نام DNS ترتیبی همدیگر را پیدا می‌کنند." }),
      q("ss2", { en: "volumeClaimTemplates provide…", fa: "volumeClaimTemplates چه چیزی می‌دهد؟" }, [
        { en: "Per-Pod PVCs", fa: "PVC به‌ازای هر Pod" },
        { en: "Ingress rules", fa: "قاعده Ingress" },
        { en: "Helm repos", fa: "ریپوی Helm" },
      ], 0, { en: "Each ordinal gets a claim.", fa: "هر ordinal یک claim می‌گیرد." }),
      q("ss3", { en: "Prefer Deployment when…", fa: "کی Deployment بهتر است؟" }, [
        { en: "Pods are interchangeable and stateless", fa: "Podها قابل تعویض و stateless‌اند" },
        { en: "You need sticky ordinal disks", fa: "دیسک ترتیبی چسبان می‌خواهید" },
        { en: "Always", fa: "همیشه" },
      ], 0, { en: "StatefulSet adds complexity you may not need.", fa: "StatefulSet پیچیدگی اضافه می‌کند." }),
    ],
  },
  {
    id: "ingress",
    order: 11,
    title: { en: "Ingress", fa: "Ingress" },
    analogy: {
      en: "Ingress is the building directory that points hostnames/paths to the right Service elevators.",
      fa: "Ingress تابلوی ساختمان است که hostname و path را به Service درست می‌فرستد.",
    },
    objectives: [
      { en: "Require an Ingress controller.", fa: "نیاز به Ingress controller را بدانید." },
      { en: "Route HTTP(S) to Services.", fa: "HTTP(S) را به Service مسیر دهید." },
    ],
    explanation: [
      {
        en: "Ingress objects declare HTTP routing. An Ingress controller watches them and programs proxies.",
        fa: "object Ingress مسیریابی HTTP را اعلام می‌کند. کنترلر Ingress آن را می‌بیند و پروکسی را تنظیم می‌کند.",
      },
      {
        en: "Without a controller, Ingress resources do nothing by themselves.",
        fa: "بدون کنترلر، خود Ingress کاری نمی‌کند.",
      },
      {
        en: "TLS often terminates at the controller; cert-manager can mint certificates for Ingress hosts.",
        fa: "TLS اغلب روی کنترلر terminate می‌شود؛ cert-manager می‌تواند گواهی بسازد.",
      },
    ],
    commonConfusion: {
      en: "Creating an Ingress YAML alone does not open traffic without a controller.",
      fa: "فقط YAML Ingress بدون کنترلر ترافیک باز نمی‌کند.",
    },
    summaryLines: [
      { en: "Ingress = rules; controller = implementation.", fa: "Ingress = قواعد؛ controller = پیاده‌سازی." },
      { en: "Backends are usually Services.", fa: "بک‌اند معمولاً Service است." },
    ],
    diagramHighlights: { componentIds: ["ingress", "svc", "app-pod", "users"], connectionIds: ["ingress-svc", "svc-pod", "users-api"] },
    keyCommands: [
      { language: "bash", title: "Ingress", code: `kubectl get ingressclass
kubectl get ingress -A` },
    ],
    quiz: [
      q("in1", { en: "Ingress needs…", fa: "Ingress به چه چیزی نیاز دارد؟" }, [
        { en: "An Ingress controller", fa: "یک Ingress controller" },
        { en: "Only etcd", fa: "فقط etcd" },
        { en: "A StatefulSet", fa: "یک StatefulSet" },
      ], 0, { en: "The controller implements the spec.", fa: "کنترلر مشخصات را پیاده می‌کند." }),
      q("in2", { en: "Ingress typically routes…", fa: "Ingress معمولاً چه چیزی را مسیر می‌دهد؟" }, [
        { en: "HTTP(S)", fa: "HTTP(S)" },
        { en: "raw etcd raft", fa: "raft خام etcd" },
        { en: "CRI sockets", fa: "سوکت CRI" },
      ], 0, { en: "L7 HTTP routing is the common case.", fa: "مسیریابی L7 رایج است." }),
      q("in3", { en: "Backends are usually…", fa: "بک‌اند معمولاً چیست؟" }, [
        { en: "Services", fa: "Service" },
        { en: "Nodes only", fa: "فقط Node" },
        { en: "Docker Hub", fa: "Docker Hub" },
      ], 0, { en: "Paths/hosts map to Service ports.", fa: "path و host به پورت Service می‌رسد." }),
    ],
  },
  {
    id: "crd-operator",
    order: 12,
    title: { en: "CRD & Operator", fa: "CRD و Operator" },
    analogy: {
      en: "CRDs invent new nouns for the API; Operators are specialists who keep those nouns healthy.",
      fa: "CRD اسم جدید برای API می‌سازد؛ Operator متخصصی است که آن اسم‌ها را سالم نگه می‌دارد.",
    },
    objectives: [
      { en: "Extend the API with CRDs.", fa: "API را با CRD گسترش دهید." },
      { en: "Recognize the Operator reconcile loop.", fa: "حلقه‌ی reconcile اپراتور را بشناسید." },
    ],
    explanation: [
      {
        en: "A CustomResourceDefinition registers a new API type (group/version/kind) in the cluster.",
        fa: "CRD یک نوع API جدید (group/version/kind) را در کلاستر ثبت می‌کند.",
      },
      {
        en: "An Operator is a controller that reconciles custom resources toward a desired state — backups, clusters, certificates, …",
        fa: "Operator کنترلری است که منابع سفارشی را به وضعیت مطلوب reconcile می‌کند (بکاپ، کلاستر، گواهی و …).",
      },
      {
        en: "You still use kubectl; the Operator watches your CRs and talks to the API like built-in controllers.",
        fa: "همچنان kubectl دارید؛ Operator مثل کنترلر داخلی CR را می‌بیند و با API صحبت می‌کند.",
      },
    ],
    commonConfusion: {
      en: "A CRD alone does not run reconciliation — you still need a controller/Operator.",
      fa: "CRD به‌تنهایی reconcile اجرا نمی‌کند؛ کنترلر یا Operator لازم است.",
    },
    summaryLines: [
      { en: "CRD = new kind in the API.", fa: "CRD = kind جدید در API." },
      { en: "Operator = domain logic in a reconcile loop.", fa: "Operator = منطق دامنه در حلقه‌ی reconcile." },
    ],
    diagramHighlights: { componentIds: ["apiserver", "controller-manager"], connectionIds: ["cm-api"] },
    keyCommands: [
      { language: "bash", title: "CRDs", code: `kubectl get crd
kubectl api-resources | head` },
    ],
    quiz: [
      q("co1", { en: "CRD stands for…", fa: "مخفف CRD چیست؟" }, [
        { en: "CustomResourceDefinition", fa: "CustomResourceDefinition" },
        { en: "Container Runtime Daemon", fa: "Container Runtime Daemon" },
        { en: "Cluster Route Directory", fa: "Cluster Route Directory" },
      ], 0, { en: "CRDs extend the API surface.", fa: "CRD سطح API را گسترش می‌دهد." }),
      q("co2", { en: "Operators typically…", fa: "Operator معمولاً چه می‌کند؟" }, [
        { en: "Reconcile custom resources in a loop", fa: "در حلقه، منابع سفارشی را reconcile می‌کند" },
        { en: "Replace kubelet", fa: "جای kubelet می‌نشیند" },
        { en: "Disable the API server", fa: "API server را خاموش می‌کند" },
      ], 0, { en: "Observe → diff → act.", fa: "مشاهده → اختلاف → اقدام." }),
      q("co3", { en: "After installing a CRD you can…", fa: "بعد از نصب CRD می‌توانید…" }, [
        { en: "kubectl get that kind (once served)", fa: "kubectl get آن kind را بزنید" },
        { en: "Only use docker CLI", fa: "فقط docker CLI" },
        { en: "Delete the scheduler forever", fa: "scheduler را برای همیشه پاک کنید" },
      ], 0, { en: "New kinds appear in api-resources.", fa: "kind جدید در api-resources می‌آید." }),
    ],
  },
  {
    id: "admission-webhook",
    order: 13,
    title: { en: "Admission webhook", fa: "Admission webhook" },
    analogy: {
      en: "Bouncers at the API door: they can rewrite your ticket (mutate) or refuse entry (validate).",
      fa: "نگهبان درِ API: می‌توانند بلیت را عوض کنند (mutate) یا ورود را رد کنند (validate).",
    },
    objectives: [
      { en: "Place webhooks in the admission path.", fa: "webhook را در مسیر admission بشناسید." },
      { en: "Separate mutate vs validate.", fa: "mutate و validate را از هم جدا کنید." },
    ],
    explanation: [
      {
        en: "After authn/authz, admission plugins run. Dynamic admission calls webhooks over HTTPS.",
        fa: "بعد از authn/authz، admission اجرا می‌شود. admission پویا webhook را با HTTPS صدا می‌زند؛ یک آدرس HTTP که API server پیش از ذخیره‌ی هر object صدا می‌زند تا آن را بررسی یا اصلاح کند.",
      },
      {
        en: "Mutating webhooks can change the object; validating webhooks only accept or deny.",
        fa: "mutating می‌تواند object را عوض کند؛ validating فقط قبول یا رد می‌کند.",
      },
      {
        en: "Policy engines (Kyverno) and service meshes (sidecar injection) often use admission webhooks.",
        fa: "موتورهای سیاست (Kyverno) و mesh (تزریق sidecar) اغلب از admission webhook استفاده می‌کنند.",
      },
    ],
    commonConfusion: {
      en: "Webhooks run before persistence; they are not a replacement for RBAC.",
      fa: "webhook قبل از ذخیره اجرا می‌شود؛ جای RBAC نیست.",
    },
    summaryLines: [
      { en: "API server calls your HTTPS endpoint.", fa: "API server endpoint شما را با HTTPS صدا می‌زند." },
      { en: "Mutate changes; validate approves or denies.", fa: "mutate تغییر می‌دهد؛ validate تأیید یا رد." },
    ],
    diagramHighlights: { componentIds: ["apiserver", "users"], connectionIds: ["users-api"] },
    keyCommands: [
      { language: "bash", title: "Webhooks", code: `kubectl get validatingwebhookconfigurations
kubectl get mutatingwebhookconfigurations` },
    ],
    quiz: [
      q("aw1", { en: "Mutating admission can…", fa: "در mutating admission چه کاری ممکن است؟" }, [
        { en: "Change the object before persist", fa: "قبل از ذخیره object را عوض کند" },
        { en: "Only read etcd", fa: "فقط etcd بخواند" },
        { en: "Schedule Pods", fa: "Pod زمان‌بندی کند" },
      ], 0, { en: "Injection of sidecars is a common mutation.", fa: "تزریق sidecar جهش رایج است." }),
      q("aw2", { en: "Validating webhooks…", fa: "در validating webhook چه اتفاقی می‌افتد؟" }, [
        { en: "Accept or reject without editing", fa: "بدون ویرایش قبول یا رد می‌کند" },
        { en: "Always delete Nodes", fa: "همیشه Node را پاک می‌کند" },
        { en: "Replace CNI", fa: "جای CNI می‌نشیند" },
      ], 0, { en: "Policy deny is a validation failure.", fa: "رد سیاست یعنی شکست validation." }),
      q("aw3", { en: "Webhooks are called by…", fa: "webhook را چه کسی صدا می‌زند؟" }, [
        { en: "The API server during admission", fa: "API server هنگام admission" },
        { en: "CoreDNS only", fa: "فقط CoreDNS" },
        { en: "containerd only", fa: "فقط containerd" },
      ], 0, { en: "Configured via *WebhookConfiguration objects.", fa: "با objectهای *WebhookConfiguration تنظیم می‌شود." }),
    ],
  },
  {
    id: "sidecar",
    order: 14,
    title: { en: "Sidecar", fa: "Sidecar" },
    analogy: {
      en: "A motorcycle sidecar: same trip (Pod), helper seat for proxy/logs/agents.",
      fa: "سه‌چرخه موتور: همان سفر (Pod)، صندلی کمکی برای پروکسی، لاگ و agent.",
    },
    objectives: [
      { en: "Co-locate helpers in one Pod.", fa: "کمک‌کننده را در یک Pod هم‌مکان کنید." },
      { en: "Know injection via admission.", fa: "تزریق از مسیر admission را بشناسید." },
    ],
    explanation: [
      {
        en: "A sidecar is a helper container in the same Pod as the app — shared localhost and volumes.",
        fa: "sidecar یک container کمکی در همان Pod اپ است؛ localhost و volume مشترک.",
      },
      {
        en: "Service meshes often inject an Envoy sidecar to mediate traffic; log agents may ship stdout.",
        fa: "mesh اغلب Envoy sidecar تزریق می‌کند؛ agent لاگ ممکن است stdout را بفرستد.",
      },
      {
        en: "Sidecars share fate with the Pod: same scheduling, restart policy nuances, and resource budget.",
        fa: "سرنوشت sidecar با Pod یکی است؛ زمان‌بندی، restart و بودجه‌ی منابع مشترک.",
      },
    ],
    commonConfusion: {
      en: "Sidecar containers are not a separate Pod — they restart with the Pod.",
      fa: "containerهای sidecar Pod جدا نیستند؛ با Pod restart می‌شوند.",
    },
    summaryLines: [
      { en: "Same Pod, shared network namespace.", fa: "یک Pod، netns مشترک." },
      { en: "Common for proxy, logs, mesh.", fa: "رایج برای پروکسی، لاگ و mesh." },
    ],
    diagramHighlights: { componentIds: ["app-pod"], connectionIds: ["runtime-pod"] },
    keyCommands: [
      { language: "bash", title: "See containers in a Pod", code: `kubectl get pod -o jsonpath='{range .items[*]}{.metadata.name}{" "}{.spec.containers[*].name}{"\\n"}{end}'` },
    ],
    quiz: [
      q("sc1", { en: "Sidecars run…", fa: "containerهای sidecar کجا اجرا می‌شوند؟" }, [
        { en: "In the same Pod as the app", fa: "در همان Pod اپ" },
        { en: "Only on the API server host", fa: "فقط روی هاست API server" },
        { en: "Inside etcd", fa: "داخل etcd" },
      ], 0, { en: "Shared network namespace enables localhost proxies.", fa: "netns مشترک اجازه‌ی پروکسی localhost می‌دهد." }),
      q("sc2", { en: "Istio classic data plane uses…", fa: "data plane کلاسیک Istio از چه استفاده می‌کند؟" }, [
        { en: "Envoy sidecars (or ambient modes in newer setups)", fa: "Envoy sidecar (یا حالت ambient)" },
        { en: "Only CronJobs", fa: "فقط CronJob" },
        { en: "Only PVCs", fa: "فقط PVC" },
      ], 0, { en: "Proxies carry mesh policy and telemetry.", fa: "پروکسی سیاست و تلمتری mesh را حمل می‌کند." }),
      q("sc3", { en: "How are sidecars often added?", fa: "sidecar اغلب چطور اضافه می‌شود؟" }, [
        { en: "Admission mutating webhook / injection", fa: "mutating webhook / تزریق" },
        { en: "By editing etcd by hand", fa: "با ویرایش دستی etcd" },
        { en: "By disabling kubelet", fa: "با خاموش کردن kubelet" },
      ], 0, { en: "Meshes label namespaces for injection.", fa: "mesh برای تزریق، Namespace را label می‌کند." }),
    ],
  },
];
