import type { GlossaryTerm } from "@/lib/types";

export const glossary: GlossaryTerm[] = [
  { id: "pod", term: "Pod", definition: { en: "Smallest deployable unit in Kubernetes; one or more containers sharing network and storage.", fa: "کوچک‌ترین واحد قابل استقرار در کوبرنتیز؛ یک یا چند کانتینر با شبکه و ذخیره‌سازی مشترک." }, relatedLessonId: "pod" },
  { id: "container", term: "container", definition: { en: "Isolated process with its own filesystem view, started from an image.", fa: "فرایند ایزوله با فایل‌سیستم خود که از یک image اجرا می‌شود." }, relatedLessonId: "container-image" },
  { id: "image", term: "image", definition: { en: "Immutable package of app filesystem layers plus metadata used to start containers.", fa: "بسته تغییرناپذیر لایه‌های فایل‌سیستم و متادیتا برای اجرای کانتینر." }, relatedLessonId: "container-image" },
  { id: "node", term: "Node", definition: { en: "A worker machine (VM or bare metal) that runs kubelet and workloads.", fa: "ماشین worker که kubelet و workloadها را اجرا می‌کند." }, relatedLessonId: "node-kubelet" },
  { id: "kubelet", term: "kubelet", definition: { en: "Node agent that starts pods via the container runtime and reports status to the API.", fa: "عامل نود که پادها را از طریق runtime اجرا می‌کند و وضعیت را به API گزارش می‌دهد." }, relatedLessonId: "node-kubelet" },
  { id: "api-server", term: "API server", definition: { en: "Front door of the cluster; validates and serves the Kubernetes API.", fa: "درگاه اصلی کلاستر؛ API کوبرنتیز را اعتبارسنجی و سرو می‌کند." }, relatedLessonId: "control-plane" },
  { id: "etcd", term: "etcd", definition: { en: "Consistent key-value store holding cluster state for the control plane.", fa: "ذخیره کلید-مقدار سازگار که وضعیت کلاستر را نگه می‌دارد." }, relatedLessonId: "control-plane" },
  { id: "scheduler", term: "scheduler", definition: { en: "Control-plane component that assigns Pods to Nodes.", fa: "کامپوننت control plane که پاد را به نود اختصاص می‌دهد." }, relatedLessonId: "control-plane" },
  { id: "controller-manager", term: "controller-manager", definition: { en: "Runs built-in controllers that reconcile desired vs actual state.", fa: "کنترلرهای داخلی را اجرا می‌کند تا وضعیت مطلوب و واقعی را هم‌تراز کند." }, relatedLessonId: "control-plane" },
  { id: "deployment", term: "Deployment", definition: { en: "Workload API that manages ReplicaSets for declarative Pod updates and rollouts.", fa: "API بارکاری که ReplicaSet را برای به‌روزرسانی اعلامی پاد مدیریت می‌کند." }, relatedLessonId: "deployment-replicaset" },
  { id: "replicaset", term: "ReplicaSet", definition: { en: "Ensures a specified number of Pod replicas are running.", fa: "تضمین می‌کند تعداد مشخصی از کپی پاد در حال اجرا باشد." }, relatedLessonId: "deployment-replicaset" },
  { id: "service", term: "Service", definition: { en: "Stable virtual IP and DNS name for a set of Pods selected by labels.", fa: "IP مجازی و نام DNS پایدار برای مجموعه‌ای از پادهای انتخاب‌شده با label." }, relatedLessonId: "service-dns" },
  { id: "dns", term: "DNS", definition: { en: "Cluster DNS (usually CoreDNS) resolves Service and Pod names inside the cluster.", fa: "DNS کلاستر (معمولاً CoreDNS) نام Service و Pod را داخل کلاستر resolve می‌کند." }, relatedLessonId: "service-dns", relatedToolId: "coredns" },
  { id: "namespace", term: "Namespace", definition: { en: "Virtual cluster scope for names; isolates resources within one physical cluster.", fa: "محدوده مجازی نام‌ها؛ منابع را داخل یک کلاستر فیزیکی جدا می‌کند." }, relatedLessonId: "namespace" },
  { id: "configmap", term: "ConfigMap", definition: { en: "API object for non-secret configuration data injected into Pods.", fa: "آبجکت API برای داده پیکربندی غیرمحرمانه که به پاد تزریق می‌شود." }, relatedLessonId: "configmap-secret" },
  { id: "secret", term: "Secret", definition: { en: "API object for sensitive data (tokens, keys); still base64-encoded at rest by default.", fa: "آبجکت API برای داده حساس؛ به‌صورت پیش‌فرض فقط base64 است." }, relatedLessonId: "configmap-secret" },
  { id: "daemonset", term: "DaemonSet", definition: { en: "Ensures a copy of a Pod runs on all (or selected) nodes.", fa: "تضمین می‌کند یک کپی از پاد روی همه (یا نودهای انتخابی) اجرا شود." }, relatedLessonId: "daemonset" },
  { id: "statefulset", term: "StatefulSet", definition: { en: "Workload for stateful apps with stable identity, ordered deploy, and persistent volumes.", fa: "بارکاری برای اپ‌های stateful با هویت پایدار و دیسک دائمی." }, relatedLessonId: "statefulset" },
  { id: "ingress", term: "Ingress", definition: { en: "HTTP(S) routing rules into Services; needs an Ingress controller to act.", fa: "قواعد مسیریابی HTTP(S) به Service؛ به Ingress controller نیاز دارد." }, relatedLessonId: "ingress" },
  { id: "crd", term: "CRD", definition: { en: "CustomResourceDefinition — extends the Kubernetes API with your own resource types.", fa: "تعریف منبع سفارشی — API کوبرنتیز را با نوع منبع خودتان گسترش می‌دهد." }, relatedLessonId: "crd-operator" },
  { id: "operator", term: "Operator", definition: { en: "Controller pattern that encodes operational knowledge for an application via custom resources.", fa: "الگوی کنترلر که دانش عملیاتی یک اپ را با منابع سفارشی پیاده می‌کند." }, relatedLessonId: "crd-operator" },
  { id: "admission-webhook", term: "admission webhook", definition: { en: "HTTP callback the API server calls to validate or mutate objects before persist.", fa: "کال‌بک HTTP که API server قبل از ذخیره آبجکت برای validate/mutate صدا می‌زند." }, relatedLessonId: "admission-webhook" },
  { id: "sidecar", term: "sidecar", definition: { en: "Helper container in the same Pod as the app (e.g. proxy, log shipper).", fa: "کانتینر کمکی در همان پاد اپ (مثلاً پروکسی یا ارسال لاگ)." }, relatedLessonId: "sidecar" },
  { id: "cni", term: "CNI", definition: { en: "Container Network Interface — plugins that provide Pod networking.", fa: "رابط شبکه کانتینر — پلاگین‌هایی که شبکه پاد را فراهم می‌کنند." }, relatedToolId: "cilium" },
  { id: "ebpf", term: "eBPF", definition: { en: "Linux kernel technology for safe programmable hooks used by tools like Cilium.", fa: "فناوری کرنل لینوکس برای هوک‌های قابل برنامه‌ریزی؛ مورد استفاده Cilium." }, relatedToolId: "cilium" },
  { id: "servicemonitor", term: "ServiceMonitor", definition: { en: "Prometheus Operator CR that tells Prometheus how to scrape a Service.", fa: "CR اپراتور Prometheus که نحوه scrape یک Service را مشخص می‌کند." }, relatedToolId: "prometheus" },
  { id: "reconcile", term: "reconcile", definition: { en: "Controller loop: observe actual state, compare to desired, act to converge.", fa: "حلقه کنترلر: مشاهده وضعیت واقعی، مقایسه با مطلوب، اقدام برای هم‌گرایی." }, relatedLessonId: "crd-operator" },
  { id: "helm-release", term: "Helm release", definition: { en: "A named instance of a chart installed into a cluster, tracked as Secrets/ConfigMaps.", fa: "نمونه‌ای نام‌دار از یک chart نصب‌شده که به‌صورت Secret/ConfigMap ردیابی می‌شود." }, relatedToolId: "helm" },
  { id: "chart", term: "chart", definition: { en: "Helm packaging unit: templates plus default values.", fa: "واحد بسته‌بندی Helm: قالب‌ها به‌همراه values پیش‌فرض." }, relatedToolId: "helm" },
  { id: "gitops", term: "GitOps", definition: { en: "Desired cluster state lives in Git; a controller continuously reconciles the cluster to match.", fa: "وضعیت مطلوب کلاستر در Git است؛ کنترلر دائماً کلاستر را با آن هم‌تراز می‌کند." }, relatedToolId: "argo-cd" },
  { id: "cri", term: "CRI", definition: { en: "Container Runtime Interface — how kubelet talks to runtimes like containerd.", fa: "رابط runtime کانتینر — نحوه ارتباط kubelet با runtimeهایی مثل containerd." }, relatedToolId: "containerd" },
  { id: "runtime", term: "container runtime", definition: { en: "Software that pulls images and runs containers (e.g. containerd).", fa: "نرم‌افزاری که image را pull و کانتینر را اجرا می‌کند." }, relatedToolId: "containerd" },
  { id: "control-plane", term: "control plane", definition: { en: "API server, etcd, scheduler, and controllers that manage the cluster.", fa: "API server، etcd، scheduler و کنترلرها که کلاستر را مدیریت می‌کنند." }, relatedLessonId: "control-plane" },
  { id: "worker-node", term: "worker node", definition: { en: "Node that runs application Pods via kubelet and a runtime.", fa: "نودی که پادهای اپ را با kubelet و runtime اجرا می‌کند." }, relatedLessonId: "node-kubelet" },
  { id: "label", term: "label", definition: { en: "Key/value metadata on objects used for selection and organization.", fa: "متادیتای کلید/مقدار روی آبجکت‌ها برای انتخاب و سازمان‌دهی." } },
  { id: "selector", term: "selector", definition: { en: "Query over labels (e.g. Service selecting Pods).", fa: "پرس‌وجو روی labelها (مثلاً Service که پادها را انتخاب می‌کند)." }, relatedLessonId: "service-dns" },
  { id: "volume", term: "volume", definition: { en: "Storage attached into a Pod filesystem path for the Pod lifetime (or longer with PV).", fa: "ذخیره‌سازی متصل به مسیر فایل‌سیستم پاد." }, relatedLessonId: "statefulset" },
  { id: "pvc", term: "PVC", definition: { en: "PersistentVolumeClaim — request for durable storage bound to a PersistentVolume.", fa: "درخواست فضای پایدار که به PersistentVolume متصل می‌شود." }, relatedToolId: "rook" },
  { id: "pv", term: "PersistentVolume", definition: { en: "Cluster storage resource provisioned statically or dynamically via a StorageClass.", fa: "منبع ذخیره‌سازی کلاستر که ایستا یا پویا provision می‌شود." }, relatedToolId: "rook" },
  { id: "storageclass", term: "StorageClass", definition: { en: "Describes how dynamic volumes are provisioned (provisioner, parameters).", fa: "نحوه provision پویای volume را توصیف می‌کند." }, relatedToolId: "rook" },
  { id: "rbac", term: "RBAC", definition: { en: "Role-based access control for who can call which Kubernetes APIs.", fa: "کنترل دسترسی مبتنی بر نقش برای فراخوانی APIهای کوبرنتیز." } },
  { id: "serviceaccount", term: "ServiceAccount", definition: { en: "Identity for processes running in Pods when talking to the API server.", fa: "هویت فرایندهای داخل پاد برای صحبت با API server." } },
  { id: "networkpolicy", term: "NetworkPolicy", definition: { en: "Rules for allowed Pod network traffic; enforced by a CNI that supports it.", fa: "قواعد ترافیک شبکه مجاز پاد؛ توسط CNI پشتیبانی‌کننده اعمال می‌شود." }, relatedToolId: "cilium" },
  { id: "mesh", term: "service mesh", definition: { en: "Infrastructure layer (often sidecars or ambient) for traffic, identity, and observability between services.", fa: "لایه زیرساختی برای ترافیک، هویت و مشاهده‌پذیری بین سرویس‌ها." }, relatedToolId: "istio" },
  { id: "envoy", term: "Envoy", definition: { en: "High-performance proxy often used as the data plane in service meshes like Istio.", fa: "پروکسی پرکاربرد به‌عنوان data plane در meshهایی مثل Istio." }, relatedToolId: "istio" },
  { id: "istiod", term: "istiod", definition: { en: "Istio control plane process that pushes config to proxies.", fa: "فرایند control plane ایستیو که پیکربندی را به پروکسی‌ها می‌فرستد." }, relatedToolId: "istio" },
  { id: "prometheus", term: "Prometheus", definition: { en: "Pull-based metrics monitoring system and time-series database.", fa: "سیستم مانیتورینگ متریک مبتنی بر pull و پایگاه سری زمانی." }, relatedToolId: "prometheus" },
  { id: "grafana", term: "Grafana", definition: { en: "Visualization and dashboarding platform often paired with Prometheus.", fa: "پلتفرم داشبورد که اغلب با Prometheus استفاده می‌شود." }, relatedToolId: "grafana" },
  { id: "otel", term: "OpenTelemetry", definition: { en: "Vendor-neutral APIs and collectors for traces, metrics, and logs.", fa: "API و collector خنثی برای ردپا، متریک و لاگ." }, relatedToolId: "opentelemetry" },
  { id: "otlp", term: "OTLP", definition: { en: "OpenTelemetry Protocol for exporting telemetry to a collector or backend.", fa: "پروتکل OpenTelemetry برای ارسال تلمتری به collector یا بک‌اند." }, relatedToolId: "opentelemetry" },
  { id: "fluent-bit", term: "Fluent Bit", definition: { en: "Lightweight log processor and forwarder, often as a DaemonSet.", fa: "پردازشگر و فورواردکننده سبک لاگ، اغلب به‌صورت DaemonSet." }, relatedToolId: "fluent-bit" },
  { id: "falco", term: "Falco", definition: { en: "Runtime security tool that detects unexpected behavior using kernel events.", fa: "ابزار امنیت runtime که رفتار غیرمنتظره را با رویدادهای کرنل تشخیص می‌دهد." }, relatedToolId: "falco" },
  { id: "kyverno", term: "Kyverno", definition: { en: "Kubernetes-native policy engine using admission webhooks and CRDs.", fa: "موتور سیاست بومی کوبرنتیز با admission webhook و CRD." }, relatedToolId: "kyverno" },
  { id: "cert-manager", term: "cert-manager", definition: { en: "Operator that issues and renews TLS certificates in-cluster.", fa: "اپراتوری که گواهی TLS را داخل کلاستر صادر و تمدید می‌کند." }, relatedToolId: "cert-manager" },
  { id: "argo-cd", term: "Argo CD", definition: { en: "Declarative GitOps continuous delivery tool for Kubernetes.", fa: "ابزار تحویل پیوسته GitOps اعلامی برای کوبرنتیز." }, relatedToolId: "argo-cd" },
  { id: "helm", term: "Helm", definition: { en: "Package manager for Kubernetes that installs charts as releases.", fa: "مدیر بسته کوبرنتیز که chart را به‌صورت release نصب می‌کند." }, relatedToolId: "helm" },
  { id: "cilium", term: "Cilium", definition: { en: "eBPF-based CNI providing networking, security, and observability.", fa: "CNI مبتنی بر eBPF برای شبکه، امنیت و مشاهده‌پذیری." }, relatedToolId: "cilium" },
  { id: "rook", term: "Rook", definition: { en: "Storage orchestrator; commonly deploys Ceph on Kubernetes.", fa: "ارکستراتور ذخیره‌سازی؛ معمولاً Ceph را روی کوبرنتیز مستقر می‌کند." }, relatedToolId: "rook" },
  { id: "kind", term: "kind", definition: { en: "Kubernetes IN Docker — local clusters for testing inside containers.", fa: "کوبرنتیز داخل داکر — کلاستر محلی برای تست." } },
  { id: "minikube", term: "minikube", definition: { en: "Tool to run a local Kubernetes cluster on a laptop/VM.", fa: "ابزاری برای اجرای کلاستر محلی کوبرنتیز روی لپ‌تاپ/VM." } },
  { id: "manifest", term: "manifest", definition: { en: "YAML/JSON describing Kubernetes API objects to apply.", fa: "YAML/JSON توصیف‌کننده آبجکت‌های API برای apply." } },
  { id: "rollout", term: "rollout", definition: { en: "Progressive update of Pods managed by a Deployment (or similar).", fa: "به‌روزرسانی تدریجی پادهای مدیریت‌شده توسط Deployment." }, relatedLessonId: "deployment-replicaset" },
  { id: "probe", term: "probe", definition: { en: "liveness/readiness/startup checks kubelet runs against containers.", fa: "بررسی‌های liveness/readiness/startup که kubelet روی کانتینر اجرا می‌کند." }, relatedLessonId: "pod" },
  { id: "hpa", term: "HPA", definition: { en: "HorizontalPodAutoscaler scales replica count based on metrics.", fa: "با متریک‌ها تعداد replica را مقیاس می‌کند." } },
  { id: "mutating-webhook", term: "MutatingWebhook", definition: { en: "Admission webhook that can change an object before it is stored.", fa: "webhook پذیرش که می‌تواند آبجکت را قبل از ذخیره تغییر دهد." }, relatedLessonId: "admission-webhook" },
  { id: "validating-webhook", term: "ValidatingWebhook", definition: { en: "Admission webhook that accepts or rejects an object without changing it.", fa: "webhook پذیرش که آبجکت را بدون تغییر قبول یا رد می‌کند." }, relatedLessonId: "admission-webhook" },
];

export function getTerm(id: string): GlossaryTerm | undefined {
  return glossary.find((t) => t.id === id);
}

export function getTermByName(name: string): GlossaryTerm | undefined {
  const lower = name.toLowerCase();
  return glossary.find((t) => t.term.toLowerCase() === lower);
}

/** Longest term first for RichText matching. */
export function glossaryTermsSorted(): GlossaryTerm[] {
  return [...glossary].sort((a, b) => b.term.length - a.term.length);
}
