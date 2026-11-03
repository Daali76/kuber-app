import type { Lesson } from "@/lib/types";
import { q } from "./quiz-helper";

export const extraLessons: Lesson[] = [
  {
    id: "kubeconfig-contexts",
    order: 15,
    title: { en: "kubeconfig & contexts", fa: "kubeconfig و context" },
    analogy: {
      en: "kubeconfig is your phonebook of clusters — contexts pick which cluster and user kubectl dials.",
      fa: "kubeconfig دفترچه‌ی کلاسترهاست؛ context مشخص می‌کند kubectl با کدام cluster و user تماس بگیرد.",
    },
    objectives: [
      { en: "Read cluster, user, and context entries.", fa: "ورودی cluster، user و context را بخوانید." },
      { en: "Switch contexts safely.", fa: "بین contextها امن جابه‌جا شوید." },
    ],
    explanation: [
      {
        en: "kubectl loads ~/.kube/config (or KUBECONFIG) with clusters (API URLs), users (credentials), and contexts that bind them.",
        fa: "kubectl فایل ~/.kube/config (یا KUBECONFIG) را با cluster (URLهای API)، user (اعتبار) و context که آن‌ها را وصل می‌کند بار می‌کند.",
      },
      {
        en: "current-context decides where apply/get run; namespace defaults can live on the context.",
        fa: "current-context تعیین می‌کند apply/get کجا اجرا شود؛ پیش‌فرض Namespace می‌تواند روی context باشد.",
      },
      {
        en: "Merge multiple files with KUBECONFIG=path1:path2 for prod vs lab separation.",
        fa: "با KUBECONFIG=path1:path2 چند فایل را برای prod و lab ادغام کنید.",
      },
    ],
    commonConfusion: {
      en: "A context name is not a namespace — it selects cluster+credentials.",
      fa: "نام context همان Namespace نیست؛ cluster و credential را انتخاب می‌کند.",
    },
    summaryLines: [
      { en: "cluster + user → context.", fa: "cluster + user → context." },
      { en: "kubectl config use-context switches targets.", fa: "kubectl config use-context هدف را عوض می‌کند." },
      { en: "Verify with kubectl config current-context.", fa: "با kubectl config current-context تأیید کنید." },
    ],
    diagramHighlights: { componentIds: ["users", "apiserver"], connectionIds: ["users-api"] },
    keyCommands: [
      {
        language: "bash",
        title: "Contexts",
        code: `kubectl config get-contexts
kubectl config use-context minikube
kubectl config set-context --current --namespace=practice`,
      },
    ],
    quiz: [
      q("kc1", { en: "A context combines…", fa: "یک context ترکیب…" }, [
        { en: "Cluster + user (+ optional namespace)", fa: "cluster + user (+ Namespace اختیاری)" },
        { en: "Only Pod names", fa: "فقط نام Pod" },
        { en: "Only Ingress hosts", fa: "فقط hostهای Ingress" },
      ], 0, { en: "Contexts wire API endpoint to credentials.", fa: "context، endpoint API را به credential وصل می‌کند." }),
      q("kc2", { en: "KUBECONFIG env var…", fa: "متغیر KUBECONFIG…" }, [
        { en: "Lists files to merge", fa: "فایل‌های ادغام را لیست می‌کند" },
        { en: "Starts kubelet", fa: "kubelet را start می‌کند" },
        { en: "Replaces etcd", fa: "جای etcd می‌نشیند" },
      ], 0, { en: "Later files override name clashes.", fa: "فایل‌های بعدی در تداخل نام، قبلی را override می‌کنند." }),
      q("kc3", { en: "kubectl applies to…", fa: "kubectl apply به…" }, [
        { en: "The API server in current context", fa: "API server در current-context" },
        { en: "All clusters at once", fa: "همه clusterها یک‌جا" },
        { en: "Local docker only", fa: "فقط docker محلی" },
      ], 0, { en: "Wrong context → wrong cluster accidents.", fa: "context اشتباه → حادثه در cluster غلط." }),
      q("kc4", { en: "User entries store…", fa: "ورودی user ذخیره…" }, [
        { en: "Client credentials (certs, tokens)", fa: "اعتبار کلاینت (cert، token)" },
        { en: "Container images", fa: "imageهای container" },
        { en: "Helm chart versions", fa: "نسخه Helm chart" },
      ], 0, { en: "API server validates these on each call.", fa: "API server هر بار آن‌ها را بررسی می‌کند." }),
      q("kc5", { en: "To avoid prod mistakes…", fa: "برای اجتناب از اشتباه prod…" }, [
        { en: "Use separate contexts and prompt themes", fa: "context جدا و تم shell" },
        { en: "Disable RBAC", fa: "RBAC را خاموش کنید" },
        { en: "Share one admin kubeconfig", fa: "یک kubeconfig admin مشترک" },
      ], 0, { en: "Least privilege per context/user.", fa: "حداقل دسترسی برای هر context/user." }),
    ],
  },
  {
    id: "job-cronjob",
    order: 16,
    title: { en: "Job & CronJob", fa: "Job و CronJob" },
    analogy: {
      en: "Job is a one-off task; CronJob is the alarm clock that spawns Jobs on a schedule.",
      fa: "Job کار یک‌باره است؛ CronJob ساعت زنگ‌دار است که Job را زمان‌بندی می‌کند.",
    },
    objectives: [
      { en: "Run batch work to completion.", fa: "کار batch را تا پایان اجرا کنید." },
      { en: "Schedule recurring Jobs safely.", fa: "Job تکراری را امن زمان‌بندی کنید." },
    ],
    explanation: [
      {
        en: "A Job creates Pods that run until success or backoffLimit — good for migrations, reports, one-time scripts.",
        fa: "Job، Pod می‌سازد تا موفقیت یا backoffLimit — مناسب migration، گزارش و اسکریپت یک‌باره.",
      },
      {
        en: "CronJob wraps Job templates with cron schedules; concurrencyPolicy controls overlap.",
        fa: "CronJob قالب Job را با cron می‌پیچد؛ concurrencyPolicy هم‌پوشانی را کنترل می‌کند.",
      },
      {
        en: "Use activeDeadlineSeconds and ttlSecondsAfterFinished to limit runaway or stale objects.",
        fa: "از activeDeadlineSeconds و ttlSecondsAfterFinished برای محدود کردن objectهای ماندگار استفاده کنید.",
      },
    ],
    commonConfusion: {
      en: "CronJob schedule uses the controller manager timezone unless documented otherwise — verify UTC.",
      fa: "زمان‌بندی CronJob معمولاً UTC است — تأیید کنید.",
    },
    summaryLines: [
      { en: "Job = run-to-completion Pods.", fa: "Job = Pod تا تکمیل." },
      { en: "CronJob = scheduled Job factory.", fa: "CronJob = کارخانه Job زمان‌بندی‌شده." },
      { en: "Not for long-lived servers — use Deployments.", fa: "برای سرور ماندگار Deployment بزنید." },
    ],
    diagramHighlights: { componentIds: ["controller-manager", "app-pod", "apiserver"], connectionIds: ["cm-api"] },
    keyCommands: [
      {
        language: "bash",
        title: "Job / CronJob",
        code: `kubectl create job pi --image=perl:5 -- perl -Mbignum=bpi -wle 'print bpi(50)'
kubectl get cronjobs -A`,
      },
    ],
    quiz: [
      q("jc1", { en: "Job Pods restart when…", fa: "Podهای Job restart وقتی…" }, [
        { en: "They fail until backoffLimit", fa: "تا backoffLimit fail شوند" },
        { en: "Never", fa: "هرگز" },
        { en: "Every minute always", fa: "هر دقیقه همیشه" },
      ], 0, { en: "OnFailure policy retries failed containers.", fa: "OnFailure container fail را retry می‌کند." }),
      q("jc2", { en: "CronJob creates…", fa: "CronJob می‌سازد…" }, [
        { en: "Job objects on schedule", fa: "object Job زمان‌بندی‌شده" },
        { en: "StatefulSets", fa: "StatefulSet" },
        { en: "Nodes", fa: "Node" },
      ], 0, { en: "Each tick can spawn a new Job.", fa: "هر tick می‌تواند Job جدید بسازد." }),
      q("jc3", { en: "parallelism on Job…", fa: "parallelism روی Job…" }, [
        { en: "Runs multiple Pods concurrently", fa: "چند Pod هم‌زمان" },
        { en: "Disables API", fa: "API را خاموش می‌کند" },
        { en: "Only for DaemonSet", fa: "فقط DaemonSet" },
      ], 0, { en: "completions counts successful finishes.", fa: "completions تعداد پایان موفق را می‌شمارد." }),
      q("jc4", { en: "For hourly backups use…", fa: "برای بکاپ ساعتی…" }, [
        { en: "CronJob", fa: "CronJob" },
        { en: "Bare Pod", fa: "Pod تنها (بدون کنترلر)" },
        { en: "Ingress", fa: "Ingress" },
      ], 0, { en: "Schedule + Job template fits batch cadence.", fa: "cron + قالب Job برای batch مناسب است." }),
      q("jc5", { en: "ttlSecondsAfterFinished…", fa: "ttlSecondsAfterFinished…" }, [
        { en: "Auto-deletes finished Jobs", fa: "Job تمام‌شده را خودکار حذف می‌کند" },
        { en: "Encrypts Secrets", fa: "Secret را رمز می‌کند" },
        { en: "Scales HPA", fa: "HPA را scale می‌کند" },
      ], 0, { en: "Keeps etcd clean after batch runs.", fa: "بعد از batch، etcd را تمیز نگه می‌دارد." }),
    ],
  },
  {
    id: "hpa",
    order: 17,
    title: { en: "Horizontal Pod Autoscaler", fa: "Horizontal Pod Autoscaler" },
    analogy: {
      en: "HPA is a thermostat: when CPU or custom metrics heat up, it adds Pod replicas.",
      fa: "HPA مثل ترموستات است؛ وقتی CPU یا metric سفارشی بالا برود، replica Pod اضافه می‌کند.",
    },
    objectives: [
      { en: "Scale Deployments from metrics.", fa: "Deployment را از metric مقیاس دهید." },
      { en: "Know metrics-server / custom metrics prerequisites.", fa: "پیش‌نیاز metrics-server / custom metrics را بدانید." },
    ],
    explanation: [
      {
        en: "HPA watches metrics and adjusts replica count on supported workloads (Deployment, StatefulSet, …).",
        fa: "HPA metric را می‌بیند و replica روی workload پشتیبانی‌شده (Deployment، StatefulSet و …) تنظیم می‌کند.",
      },
      {
        en: "Resource metrics need metrics-server; custom/external metrics need adapters.",
        fa: "metric منابع به metrics-server نیاز دارد؛ metric سفارشی/خارجی به adapter نیاز دارد.",
      },
      {
        en: "Set requests on Pods so utilization percentages mean something to the scheduler.",
        fa: "روی Pod request بگذارید تا درصد utilization برای scheduler معنا داشته باشد.",
      },
    ],
    commonConfusion: {
      en: "HPA changes replicas; it does not change CPU limits on existing Pods.",
      fa: "HPA replica را عوض می‌کند؛ limit CPU Pod موجود را نه.",
    },
    summaryLines: [
      { en: "Target utilization drives replica count.", fa: "utilization هدف، replica را هدایت می‌کند." },
      { en: "Needs measurable metrics pipeline.", fa: "به pipeline metric قابل اندازه‌گیری نیاز دارد." },
      { en: "Pair with cluster autoscaler for nodes.", fa: "با cluster autoscaler برای Node جفت کنید." },
    ],
    diagramHighlights: { componentIds: ["controller-manager", "app-pod", "apiserver"], connectionIds: ["cm-api"] },
    keyCommands: [
      {
        language: "bash",
        title: "HPA",
        code: `kubectl autoscale deployment web --cpu-percent=70 --min=2 --max=10
kubectl get hpa`,
      },
    ],
    quiz: [
      q("hpa1", { en: "HPA scales…", fa: "HPA مقیاس…" }, [
        { en: "Pod replicas of a workload", fa: "replica Pod یک workload" },
        { en: "etcd members", fa: "عضو etcd" },
        { en: "Ingress controllers only", fa: "فقط Ingress controller" },
      ], 0, { en: "It patches scale subresource.", fa: "subresource scale را patch می‌کند." }),
      q("hpa2", { en: "CPU percent targets need…", fa: "هدف درصد CPU نیاز…" }, [
        { en: "Pod resource requests set", fa: "request منابع Pod" },
        { en: "No limits ever", fa: "هرگز limit نباشد" },
        { en: "Static PVs", fa: "PV ایستا" },
      ], 0, { en: "Utilization = usage/request.", fa: "utilization = usage/request." }),
      q("hpa3", { en: "metrics-server provides…", fa: "metrics-server می‌دهد…" }, [
        { en: "Node/Pod resource usage API", fa: "API مصرف منابع Node/Pod" },
        { en: "Git commits", fa: "commit Git" },
        { en: "CRD definitions", fa: "تعریف CRD" },
      ], 0, { en: "HPA consumes metrics.k8s.io by default.", fa: "HPA پیش‌فرض metrics.k8s.io می‌خورد." }),
      q("hpa4", { en: "maxReplicas prevents…", fa: "maxReplicas جلوگیری…" }, [
        { en: "Unbounded scale-out", fa: "scale-out بی‌حد" },
        { en: "DNS queries", fa: "کوئری DNS" },
        { en: "Rolling updates", fa: "rolling update" },
      ], 0, { en: "Cost and cluster capacity guardrail.", fa: " نرده هزینه و ظرفیت کلاستر." }),
      q("hpa5", { en: "Custom metrics HPA uses…", fa: "HPA metric سفارشی…" }, [
        { en: "Metrics API adapters / Prometheus adapter", fa: "adapter Metrics API / Prometheus" },
        { en: "Only kubectl logs", fa: "فقط log kubectl" },
        { en: "docker ps", fa: "docker ps" },
      ], 0, { en: "External signals like queue depth are common.", fa: "سیگنال خارجی مثل عمق صف رایج است." }),
    ],
  },
  {
    id: "rollout-strategies",
    order: 18,
    title: { en: "Rollout strategies", fa: "استراتژی rollout" },
    analogy: {
      en: "Rolling update replaces tires while driving; recreate stops the car, swaps all four, then goes.",
      fa: "rolling update مثل تعویض لاستیک در حرکت؛ recreate توقف، تعویض همه، بعد حرکت.",
    },
    objectives: [
      { en: "Tune maxSurge and maxUnavailable.", fa: "maxSurge و maxUnavailable را تنظیم کنید." },
      { en: "Choose Recreate vs RollingUpdate.", fa: "Recreate در برابر RollingUpdate." },
    ],
    explanation: [
      {
        en: "strategy.type RollingUpdate is default: gradually replace Pods using surge/unavailable budgets.",
        fa: "strategy.type پیش‌فرض RollingUpdate است: Podها را با بودجه surge/unavailable تدریجی عوض می‌کند.",
      },
      {
        en: "Recreate terminates all old Pods before new ones — needed when two versions cannot coexist.",
        fa: "Recreate همه Pod قدیمی را قبل از جدید می‌کشد — وقتی دو نسخه نمی‌توانند هم‌زیستی کنند.",
      },
      {
        en: "Readiness gates traffic; watch kubectl rollout status during changes.",
        fa: "readiness ترافیک را gate می‌کند؛ kubectl rollout status را در تغییر ببینید.",
      },
    ],
    commonConfusion: {
      en: "maxUnavailable 0 with maxSurge 1 still rolls safely but may be slower.",
      fa: "maxUnavailable 0 با maxSurge 1 کندتر اما امن rollout می‌کند.",
    },
    summaryLines: [
      { en: "Surge adds extra Pods temporarily.", fa: "surge موقتاً Pod اضافه می‌کند." },
      { en: "Unavailable caps downtime tolerance.", fa: "unavailable سقف downtime را می‌گذارد." },
      { en: "rollback via kubectl rollout undo.", fa: "rollback با kubectl rollout undo." },
    ],
    diagramHighlights: { componentIds: ["app-pod", "controller-manager"], connectionIds: ["cm-api"] },
    keyCommands: [
      {
        language: "bash",
        title: "Rollout",
        code: `kubectl set image deployment/web web=nginx:1.27-alpine
kubectl rollout status deployment/web
kubectl rollout undo deployment/web`,
      },
    ],
    quiz: [
      q("rs1", { en: "RollingUpdate default…", fa: "پیش‌فرض RollingUpdate…" }, [
        { en: "Replaces Pods incrementally", fa: "Pod را تدریجی عوض می‌کند" },
        { en: "Deletes Deployment", fa: "Deployment را پاک می‌کند" },
        { en: "Skips ReplicaSet", fa: "ReplicaSet را رد می‌کند" },
      ], 0, { en: "New ReplicaSet scales up as old scales down.", fa: "ReplicaSet جدید بالا می‌آید قدیمی پایین." }),
      q("rs2", { en: "Recreate strategy…", fa: "استرategی Recreate…" }, [
        { en: "All-at-once replacement", fa: "جایگزینی یک‌جا" },
        { en: "Never uses Pods", fa: "هرگز Pod ندارد" },
        { en: "Only for CronJob", fa: "فقط CronJob" },
      ], 0, { en: "Brief outage window possible.", fa: "پنجره outage کوتاه ممکن است." }),
      q("rs3", { en: "Progress deadline…", fa: "progressDeadlineSeconds…" }, [
        { en: "Marks stalled rollouts failed", fa: "rollout گیرکرده را failed می‌کند" },
        { en: "Changes DNS", fa: "DNS را عوض می‌کند" },
        { en: "Pulls images", fa: "image pull می‌کند" },
      ], 0, { en: "Surfaces broken deploys quickly.", fa: "استقرار خراب را زود نشان می‌دهد." }),
      q("rs4", { en: "minReadySeconds…", fa: "minReadySeconds…" }, [
        { en: "Waits before counting Pod available", fa: "قبل از available شدن Pod صبر می‌کند" },
        { en: "Disables probes", fa: "probe را خاموش می‌کند" },
        { en: "Sets Ingress class", fa: "IngressClass ست می‌کند" },
      ], 0, { en: "Reduces flapping during rollouts.", fa: "نوسان در rollout را کم می‌کند." }),
      q("rs5", { en: "Paused rollout…", fa: "rollout pause…" }, [
        { en: "kubectl rollout pause/resume", fa: "kubectl rollout pause/resume" },
        { en: "Stops kubelet globally", fa: "kubelet جهانی را متوقف می‌کند" },
        { en: "Deletes etcd", fa: "etcd را پاک می‌کند" },
      ], 0, { en: "Useful for canary analysis mid-deploy.", fa: "برای canary وسط deploy مفید است." }),
    ],
  },
  {
    id: "service-types",
    order: 19,
    title: { en: "Service types", fa: "انواع Service" },
    analogy: {
      en: "ClusterIP is intercom inside the building; NodePort adds a door number; LoadBalancer rents a public line.",
      fa: "ClusterIP بی‌سیم داخل ساختمان است؛ NodePort شماره در؛ LoadBalancer خط عمومی اجاره می‌کند.",
    },
    objectives: [
      { en: "Pick ClusterIP vs NodePort vs LoadBalancer.", fa: "ClusterIP، NodePort و LoadBalancer را انتخاب کنید." },
      { en: "Understand externalTrafficPolicy effects.", fa: "اثر externalTrafficPolicy را بدانید." },
    ],
    explanation: [
      {
        en: "ClusterIP is the default — reachable only inside the cluster (often fronted by Ingress).",
        fa: "ClusterIP پیش‌فرض است — فقط داخل کلاستر (اغلب پشت Ingress).",
      },
      {
        en: "NodePort opens a high port on every Node; LoadBalancer asks the cloud to provision an external LB.",
        fa: "NodePort پورت بالا روی هر Node باز می‌کند؛ LoadBalancer از cloud یک LB خارجی می‌گیرد.",
      },
      {
        en: "externalTrafficPolicy Local preserves client source IP on NodePort/LB at the cost of uneven distribution.",
        fa: "externalTrafficPolicy برابر Local IP مبدأ را حفظ می‌کند با هزینه‌ی توزیع ناهموار.",
      },
    ],
    commonConfusion: {
      en: "type: LoadBalancer still creates a ClusterIP underneath.",
      fa: "type: LoadBalancer همچنان ClusterIP زیرش می‌سازد.",
    },
    summaryLines: [
      { en: "Default = ClusterIP.", fa: "پیش‌فرض = ClusterIP." },
      { en: "Ingress usually fronts ClusterIP Services.", fa: "Ingress معمولاً جلوی ClusterIP می‌ایستد." },
      { en: "NodePort/LB expose outside — secure with firewall/policy.", fa: "NodePort/LB بیرون expose می‌کند — firewall/policy بگذارید." },
    ],
    diagramHighlights: { componentIds: ["svc", "app-pod", "ingress"], connectionIds: ["svc-pod", "ingress-svc"] },
    keyCommands: [
      { language: "bash", title: "Service types", code: `kubectl expose deployment web --type=NodePort --port=80
kubectl get svc web -o wide` },
    ],
    quiz: [
      q("st1", { en: "Default Service type is…", fa: "نوع پیش‌فرض Service…" }, [{ en: "ClusterIP", fa: "ClusterIP" }, { en: "ExternalName", fa: "ExternalName" }, { en: "LoadBalancer only", fa: "فقط LoadBalancer" }], 0, { en: "Internal virtual IP.", fa: "IP مجازی داخلی." }),
      q("st2", { en: "NodePort exposes…", fa: "NodePort expose…" }, [{ en: "Port on each Node", fa: "پورت روی هر Node" }, { en: "Only etcd", fa: "فقط etcd" }, { en: "Git remotes", fa: "remote Git" }], 0, { en: "Traffic hits NodeIP:nodePort.", fa: "ترافیک به NodeIP:nodePort می‌رسد." }),
      q("st3", { en: "LoadBalancer on cloud…", fa: "LoadBalancer روی cloud…" }, [{ en: "Provisions external LB + NodePort/ClusterIP", fa: "LB خارجی + NodePort/ClusterIP" }, { en: "Deletes Pods", fa: "Pod پاک می‌کند" }, { en: "Replaces scheduler", fa: "scheduler را عوض می‌کند" }], 0, { en: "Controller integrates with cloud API.", fa: "کنترلر با API cloud یکپارچه می‌شود." }),
      q("st4", { en: "ExternalName Service…", fa: "Service ExternalName…" }, [{ en: "CNAME to external DNS", fa: "CNAME به DNS خارجی" }, { en: "Runs Pods", fa: "Pod اجرا می‌کند" }, { en: "Stores PV data", fa: "داده PV ذخیره می‌کند" }], 0, { en: "No proxy — DNS alias only.", fa: "پروکسی ندارد — فقط alias DNS." }),
      q("st5", { en: "For HTTP north-south prefer…", fa: "برای HTTP north-south ترجیح…" }, [{ en: "Ingress/Gateway + ClusterIP", fa: "Ingress/Gateway + ClusterIP" }, { en: "Bare NodePort only", fa: "فقط NodePort خام" }, { en: "Editing etcd", fa: "ویرایش etcd" }], 0, { en: "Central routing and TLS at edge.", fa: "مسیریابی متمرکز و TLS در لبه." }),
    ],
  },
  {
    id: "endpoints-endpointslice",
    order: 20,
    title: { en: "Endpoints & EndpointSlice", fa: "Endpoint و EndpointSlice" },
    analogy: {
      en: "Service is the published phone number; Endpoints list the extensions (Pod IPs) that actually answer.",
      fa: "Service شماره منتشرشده است؛ Endpoint داخلی‌های (IP Pod) که واقعاً جواب می‌دهند.",
    },
    objectives: [
      { en: "Link Service selectors to backend IPs.", fa: "selector Service را به IP بک‌اند وصل کنید." },
      { en: "Know EndpointSlice scales better than legacy Endpoints.", fa: "EndpointSlice برای مقیاس بهتر از Endpoint قدیمی است." },
    ],
    explanation: [
      {
        en: "When Pods match a Service selector, the Endpoints controller writes ready Pod IPs to Endpoints or EndpointSlices.",
        fa: "وقتی Pod با selector Service match شود، کنترلر IP Pod آماده را در Endpoint یا EndpointSlice می‌نویسد.",
      },
      {
        en: "kube-proxy or eBPF programs consume slices to program dataplane rules.",
        fa: "kube-proxy یا eBPF sliceها را برای قواعد dataplane می‌خواند.",
      },
      {
        en: "NotReady Pods drop from endpoints when readiness fails — traffic stops even if Pod still runs.",
        fa: "Pod NotReady از endpoint حذف می‌شود — ترافیک قطع می‌شود حتی اگر Pod اجرا شود.",
      },
    ],
    commonConfusion: {
      en: "Empty Endpoints usually means selector labels mismatch, not a broken Service API object.",
      fa: "Endpoint خالی اغلب label selector اشتباه است نه object Service خراب.",
    },
    summaryLines: [
      { en: "Selector → ready Pod IPs.", fa: "selector → IP Pod آماده." },
      { en: "EndpointSlice is the modern scaling path.", fa: "EndpointSlice مسیر مقیاس مدرن است." },
      { en: "kubectl get endpoints to debug no-traffic.", fa: "kubectl get endpoints برای no-traffic." },
    ],
    diagramHighlights: { componentIds: ["svc", "app-pod", "controller-manager"], connectionIds: ["svc-pod", "cm-api"] },
    keyCommands: [
      { language: "bash", title: "Endpoints", code: `kubectl get svc,endpoints
kubectl get endpointslice` },
    ],
    quiz: [
      q("ep1", { en: "Endpoints list…", fa: "Endpoint لیست…" }, [{ en: "Backend Pod IPs/ports", fa: "IP/پورت Pod بک‌اند" }, { en: "Helm releases", fa: "release Helm" }, { en: "CRD schemas", fa: "schema CRD" }], 0, { en: "Dataplane targets for the Service.", fa: "هدف dataplane برای Service." }),
      q("ep2", { en: "No endpoints often means…", fa: "بدون endpoint اغلب…" }, [{ en: "Label selector mismatch", fa: "selector label نمی‌خواند" }, { en: "API server down only", fa: "فقط API server down" }, { en: "Always DNS fault", fa: "همیشه DNS" }], 0, { en: "Fix labels on Pod template.", fa: "label قالب Pod را درست کنید." }),
      q("ep3", { en: "EndpointSlice helps…", fa: "EndpointSlice کمک…" }, [{ en: "Large Services with many Pods", fa: "Service بزرگ با Pod زیاد" }, { en: "Replace RBAC", fa: "جای RBAC" }, { en: "Build images", fa: "ساخت image" }], 0, { en: "Shards endpoint updates.", fa: "به‌روزرسانی endpoint را shard می‌کند." }),
      q("ep4", { en: "Readiness probe failure…", fa: "شکست readiness…" }, [{ en: "Removes Pod from Service endpoints", fa: "Pod را از endpoint حذف می‌کند" }, { en: "Deletes Namespace", fa: "Namespace پاک می‌کند" }, { en: "Upgrades cluster", fa: "کلاستر upgrade" }], 0, { en: "Traffic only to ready Pods.", fa: "ترافیک فقط به Pod آماده." }),
      q("ep5", { en: "Manual Endpoints without selector…", fa: "Endpoint دستی بدون selector…" }, [{ en: "Possible for custom backends", fa: "برای بک‌اند سفارشی ممکن است" }, { en: "Forbidden always", fa: "همیشه ممنوع" }, { en: "Replaces Ingress", fa: "جای Ingress" }], 0, { en: "Rare — usually prefer selector-based Services.", fa: "نادر — معمولاً Service با selector." }),
    ],
  },
  {
    id: "network-policy",
    order: 21,
    title: { en: "NetworkPolicy", fa: "NetworkPolicy" },
    analogy: {
      en: "Default allow is an open office; NetworkPolicy adds badge checks on doors between teams.",
      fa: "allow پیش‌فرض دفتر باز است؛ NetworkPolicy کنترل کارت بین تیم‌ها اضافه می‌کند.",
    },
    objectives: [
      { en: "Default deny vs selective allow.", fa: "deny پیش‌فرض در برابر allow انتخابی." },
      { en: "Require a CNI that enforces policy.", fa: "CNI که policy enforce کند لازم است." },
    ],
    explanation: [
      {
        en: "NetworkPolicy selects Pods and defines ingress/egress rules by labels, namespaces, and ports.",
        fa: "NetworkPolicy Pod را انتخاب و ingress/egress را با label، Namespace و پورت تعریف می‌کند.",
      },
      {
        en: "Without policies many CNIs allow all pod-to-pod traffic; a default-deny policy tightens blast radius.",
        fa: "بدون policy بسیاری CNI همه ترافیک Pod-to-Pod را allow می‌کنند؛ default-deny شعاع خرابی را کم می‌کند.",
      },
      {
        en: "DNS egress to kube-system often needs an explicit allow rule.",
        fa: "egress DNS به kube-system اغلب قاعده allow صریح می‌خواهد.",
      },
    ],
    commonConfusion: {
      en: "NetworkPolicy does not encrypt traffic — it filters flows.",
      fa: "NetworkPolicy ترافیک را رمز نمی‌کند — فیلتر می‌کند.",
    },
    summaryLines: [
      { en: "Needs enforcing CNI.", fa: "به CNI enforcing نیاز دارد." },
      { en: "Label selectors on both sides.", fa: "selector label دو طرف." },
      { en: "Plan DNS and control-plane egress.", fa: "DNS و egress control plane را plan کنید." },
    ],
    diagramHighlights: { componentIds: ["app-pod", "svc"], connectionIds: ["svc-pod"] },
    keyCommands: [
      { language: "yaml", title: "Sample deny-all ingress", code: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
spec:
  podSelector: {}
  policyTypes: [Ingress]` },
    ],
    quiz: [
      q("np1", { en: "NetworkPolicy requires…", fa: "NetworkPolicy نیاز…" }, [{ en: "CNI with policy support", fa: "CNI با پشتیبانی policy" }, { en: "Only Ingress controller", fa: "فقط Ingress controller" }, { en: "docker compose", fa: "docker compose" }], 0, { en: "Kind without Calico/Cilium may not enforce.", fa: "kind بدون Calico/Cilium شاید enforce نکند." }),
      q("np2", { en: "podSelector {} means…", fa: "podSelector {} یعنی…" }, [{ en: "All Pods in namespace", fa: "همه Pod در Namespace" }, { en: "No Pods", fa: "هیچ Pod" }, { en: "All clusters", fa: "همه cluster" }], 0, { en: "Namespace-scoped object.", fa: "object محدود به Namespace." }),
      q("np3", { en: "Egress policy controls…", fa: "policy egress…" }, [{ en: "Outbound connections from Pods", fa: "اتصال خروجی Pod" }, { en: "kubectl auth", fa: "auth kubectl" }, { en: "etcd compaction", fa: "compact etcd" }], 0, { en: "Allow kube-dns explicitly when using default deny.", fa: "با default deny، kube-dns را allow کنید." }),
      q("np4", { en: "Policy is not…", fa: "policy نیست…" }, [{ en: "TLS/mTLS by itself", fa: "TLS/mTLS به‌تنهایی" }, { en: "Label-based", fa: "مبتنی بر label" }, { en: "Namespace scoped", fa: "محدود به Namespace" }], 0, { en: "Combine with mesh or cert-manager for encryption.", fa: "با mesh یا cert-manager برای رمزنگاری ترکیب کنید." }),
      q("np5", { en: "ipBlock rules…", fa: "قاعده ipBlock…" }, [{ en: "Allow/deny CIDR ranges", fa: "محدوده CIDR allow/deny" }, { en: "Replace Services", fa: "جای Service" }, { en: "Schedule Pods", fa: "زمان‌بندی Pod" }], 0, { en: "Useful for external API egress.", fa: "برای egress API خارجی." }),
    ],
  },
  {
    id: "cni-basics",
    order: 22,
    title: { en: "CNI basics", fa: "مبانی CNI" },
    analogy: {
      en: "CNI is the electrician wiring each Pod into the cluster LAN with its own IP address.",
      fa: "CNI برق‌کار است که هر Pod را با IP خودش به LAN کلاستر وصل می‌کند.",
    },
    objectives: [
      { en: "Explain CNI ADD/DEL on Pod sandbox.", fa: "CNI ADD/DEL روی sandbox Pod." },
      { en: "Relate CNI to Service dataplane.", fa: "CNI را به dataplane Service وصل کنید." },
    ],
    explanation: [
      {
        en: "When kubelet creates a Pod sandbox, it calls CNI plugins to attach network interfaces and allocate IPs.",
        fa: "وقتی kubelet sandbox Pod می‌سازد، پلاگین CNI را برای interface و IP صدا می‌زند.",
      },
      {
        en: "Pod CIDR per Node and overlay vs underlay designs vary by plugin (Calico, Cilium, Flannel, …).",
        fa: "Pod CIDR هر Node و overlay در برابر underlay بسته به پلاگین فرق می‌کند.",
      },
      {
        en: "NetworkPolicy enforcement and kube-proxy replacement often live in advanced CNI features.",
        fa: "enforce NetworkPolicy و جایگزینی kube-proxy اغلب در قابلیت‌های پیشرفته CNI است.",
      },
    ],
    commonConfusion: {
      en: "Service ClusterIP is not implemented by CNI alone — kube-proxy/eBPF handles Service NAT.",
      fa: "ClusterIP Service فقط با CNI پیاده نمی‌شود — kube-proxy/eBPF NAT Service را انجام می‌دهد.",
    },
    summaryLines: [
      { en: "CNI wires Pod IP connectivity.", fa: "CNI اتصال IP Pod را می‌سازد." },
      { en: "Plugin choice affects policy and observability.", fa: "انتخاب پلاگین policy و observability را عوض می‌کند." },
      { en: "Check /etc/cni/net.d on nodes when debugging.", fa: "برای دیباگ /etc/cni/net.d روی Node." },
    ],
    diagramHighlights: { componentIds: ["kubelet", "runtime", "app-pod"], connectionIds: ["kubelet-runtime", "runtime-pod"] },
    keyCommands: [
      { language: "bash", title: "CNI debug", code: `# on node (requires access):
ls /etc/cni/net.d/
crictl pods` },
    ],
    quiz: [
      q("cni1", { en: "CNI is invoked by…", fa: "CNI را… صدا می‌زند" }, [{ en: "kubelet when creating pod network", fa: "kubelet هنگام شبکه Pod" }, { en: "Helm only", fa: "فقط Helm" }, { en: "Ingress controller", fa: "Ingress controller" }], 0, { en: "Container Runtime Interface triggers CNI ADD.", fa: "مسیر sandbox، CNI ADD را trigger می‌کند." }),
      q("cni2", { en: "Overlay networks…", fa: "شبکه overlay…" }, [{ en: "Encapsulate pod traffic between nodes", fa: "ترافیک Pod بین Node را کapsulate می‌کند" }, { en: "Replace etcd", fa: "جای etcd" }, { en: "Store Secrets", fa: "Secret ذخیره" }], 0, { en: "VXLAN/Geneve common in Flannel.", fa: "VXLAN/Geneve در Flannel رایج است." }),
      q("cni3", { en: "Policy enforcement needs…", fa: "enforce policy نیاز…" }, [{ en: "CNI that supports NetworkPolicy", fa: "CNI با NetworkPolicy" }, { en: "Only ConfigMap", fa: "فقط ConfigMap" }, { en: "CronJob", fa: "CronJob" }], 0, { en: "Not all CNIs implement policy.", fa: "همه CNI policy ندارند." }),
      q("cni4", { en: "Pod gets IP from…", fa: "Pod IP از…" }, [{ en: "CNI IPAM allocation", fa: "تخصیص IPAM در CNI" }, { en: "Ingress hostname", fa: "hostname Ingress" }, { en: "Git SHA", fa: "SHA Git" }], 0, { en: "IPAM plugin or host-local pool.", fa: "پلاگین IPAM یا pool محلی." }),
      q("cni5", { en: "Cilium can replace…", fa: "Cilium می‌تواند جای…" }, [{ en: "kube-proxy with eBPF Service handling", fa: "kube-proxy با eBPF Service" }, { en: "API server", fa: "API server" }, { en: "containerd entirely", fa: "کل containerd" }], 0, { en: "Dataplane features vary by version/mode.", fa: "قابلیت dataplane بسته به نسخه/حالت." }),
    ],
  },
  {
    id: "persistent-volume-storage",
    order: 23,
    title: { en: "PersistentVolume & PVC", fa: "PersistentVolume و PVC" },
    analogy: {
      en: "PV is the disk in the warehouse; PVC is the rental ticket a Pod presents to mount it.",
      fa: "PV دیسک در انبار است؛ PVC برگه اجاره است که Pod برای mount نشان می‌دهد.",
    },
    objectives: [
      { en: "Bind PVCs to PVs or dynamic provisioning.", fa: "PVC را به PV یا provision پویا وصل کنید." },
      { en: "Use access modes and reclaim policies.", fa: "access mode و reclaim policy." },
    ],
    explanation: [
      {
        en: "PersistentVolumeClaim requests storage; PersistentVolume represents a piece of storage in the cluster.",
        fa: "PersistentVolumeClaim ذخیره می‌خواهد؛ PersistentVolume قطعه ذخیره در کلاستر است.",
      },
      {
        en: "StorageClass enables dynamic provisioning — the provisioner creates PVs when PVCs appear.",
        fa: "StorageClass provision پویا می‌دهد — provisioner با PVC، PV می‌سازد.",
      },
      {
        en: "accessModes ReadWriteOnce vs ReadWriteMany affect how many nodes can mount simultaneously.",
        fa: "accessModes ReadWriteOnce در برابر ReadWriteMany تعداد Node هم‌زمان mount را تعیین می‌کند.",
      },
    ],
    commonConfusion: {
      en: "Deleting a Pod does not delete its PVC — data persists by design.",
      fa: "حذف Pod، PVC را پاک نمی‌کند — داده عمداً می‌ماند.",
    },
    summaryLines: [
      { en: "PVC request → PV supply.", fa: "درخواست PVC → عرضه PV." },
      { en: "Reclaim Retain/Delete/Recycle policies matter.", fa: "Reclaim Retain/Delete مهم است." },
      { en: "Mount via volume in Pod spec.", fa: "mount با volume در spec Pod." },
    ],
    diagramHighlights: { componentIds: ["app-pod", "cloud-storage"], connectionIds: [] },
    keyCommands: [
      { language: "bash", title: "PVC", code: `kubectl get pv,pvc
kubectl describe pvc my-data` },
    ],
    quiz: [
      q("pv1", { en: "PVC is…", fa: "PVC…" }, [{ en: "Namespaced storage request", fa: "درخواست ذخیره namespaced" }, { en: "Cluster Node object", fa: "object Node" }, { en: "Ingress rule", fa: "قاعده Ingress" }], 0, { en: "Pods reference PVCs in volumes.", fa: "Pod در volume به PVC ارجاع می‌دهد." }),
      q("pv2", { en: "ReadWriteOnce…", fa: "ReadWriteOnce…" }, [{ en: "Single node mount at a time", fa: "mount تک‌Node" }, { en: "Unlimited writers globally", fa: "نویسنده نامحدود جهانی" }, { en: "DNS only", fa: "فقط DNS" }], 0, { en: "RWX needs shared filesystem backends.", fa: "RWX به backend فایل مشترک نیاز دارد." }),
      q("pv3", { en: "Dynamic provisioning needs…", fa: "provision پویا نیاز…" }, [{ en: "StorageClass + provisioner", fa: "StorageClass + provisioner" }, { en: "Only bare Pod", fa: "فقط Pod تنها" }, { en: "Mutating webhook only", fa: "فقط webhook mutate" }], 0, { en: "Cloud or CSI driver creates PV.", fa: "cloud یا CSI driver، PV می‌سازد." }),
      q("pv4", { en: "Retain reclaim…", fa: "reclaim Retain…" }, [{ en: "Keeps PV data after PVC delete", fa: "داده PV بعد از حذف PVC می‌ماند" }, { en: "Auto wipes disk", fa: "دیسک خودکار پاک" }, { en: "Stops kubelet", fa: "kubelet متوقف" }], 0, { en: "Admin must clean manually.", fa: "ادمین دستی پاک می‌کند." }),
      q("pv5", { en: "volumeMode Block…", fa: "volumeMode Block…" }, [{ en: "Raw block device without filesystem", fa: "بلوک خام بدون filesystem" }, { en: "HTTP route", fa: "مسیر HTTP" }, { en: "Helm hook", fa: "hook Helm" }], 0, { en: "Filesystem is default Filesystem mode.", fa: "Filesystem پیش‌فرض است." }),
    ],
  },
  {
    id: "storageclass",
    order: 24,
    title: { en: "StorageClass", fa: "StorageClass" },
    analogy: {
      en: "StorageClass is the menu of disk types — fast SSD, cheap HDD, replicated, encrypted.",
      fa: "StorageClass منوی نوع دیسک است — SSD سریع، HDD ارزان، replicated، رمزشده.",
    },
    objectives: [
      { en: "Parameterize provisioners via StorageClass.", fa: "provisioner را با StorageClass پارامetrize کنید." },
      { en: "Set default StorageClass for PVCs.", fa: "StorageClass پیش‌فرض برای PVC." },
    ],
    explanation: [
      {
        en: "StorageClass names a provisioner (often CSI) and parameters like type, iops, or replication.",
        fa: "StorageClass provisioner (اغلب CSI) و پارامتر type، iops یا replication را نام می‌برد.",
      },
      {
        en: "annotation storageclass.kubernetes.io/is-default-class makes PVCs without class use it.",
        fa: "annotation storageclass.kubernetes.io/is-default-class باعث می‌شود PVC بدون class از آن استفاده کند.",
      },
      {
        en: "volumeBindingMode WaitForFirstConsumer delays provisioning until Pod schedules — good for topology.",
        fa: "volumeBindingMode WaitForFirstConsumer تا زمان‌بندی Pod صبر می‌کند — مناسب topology.",
      },
    ],
    commonConfusion: {
      en: "Changing StorageClass on an existing PVC is not supported — create a new claim.",
      fa: "عوض کردن StorageClass روی PVC موجود پشتیبانی نمی‌شود — claim جدید بسازید.",
    },
    summaryLines: [
      { en: "Provisioner + parameters = class.", fa: "provisioner + پارامتر = class." },
      { en: "Default class simplifies manifests.", fa: "class پیش‌فرض manifest را ساده می‌کند." },
      { en: "CSI drivers register their classes.", fa: "driver CSI class خود را ثبت می‌کند." },
    ],
    diagramHighlights: { componentIds: ["cloud-storage", "apiserver"], connectionIds: [] },
    keyCommands: [
      { language: "bash", title: "StorageClass", code: `kubectl get storageclass
kubectl describe storageclass standard` },
    ],
    quiz: [
      q("sc1", { en: "StorageClass provisioner field…", fa: "فیلد provisioner…" }, [{ en: "Names CSI/external provisioner", fa: "provisioner CSI/خارجی" }, { en: "Sets Pod CPU", fa: "CPU Pod" }, { en: "Creates Ingress", fa: "Ingress می‌سازد" }], 0, { en: "Example: ebs.csi.aws.com.", fa: "مثال: ebs.csi.aws.com." }),
      q("sc2", { en: "Default class annotation…", fa: "annotation class پیش‌فرض…" }, [{ en: "is-default-class true", fa: "is-default-class true" }, { en: "delete-cluster true", fa: "delete-cluster true" }, { en: "run-as-root", fa: "run-as-root" }], 0, { en: "Only one default recommended.", fa: "یک پیش‌فرض توصیه می‌شود." }),
      q("sc3", { en: "WaitForFirstConsumer…", fa: "WaitForFirstConsumer…" }, [{ en: "Binds PV in same zone as Pod", fa: "PV در zone همان Pod" }, { en: "Disables scheduling", fa: "زمان‌بندی خاموش" }, { en: "Forces hostPath", fa: "hostPath اجبار" }], 0, { en: "Topology-aware provisioning.", fa: "provision آگاه از topology." }),
      q("sc4", { en: "allowVolumeExpansion…", fa: "allowVolumeExpansion…" }, [{ en: "Permits PVC size increase", fa: "افزایش اندازه PVC" }, { en: "Deletes snapshots", fa: "snapshot پاک" }, { en: "Changes Service type", fa: "نوع Service" }], 0, { en: "Driver must support resize.", fa: "driver باید resize پشتیبانی کند." }),
      q("sc5", { en: "PVC storageClassName…", fa: "storageClassName در PVC…" }, [{ en: "Selects which class provisions", fa: "class provision را انتخاب می‌کند" }, { en: "Sets container image", fa: "image container" }, { en: "Defines RBAC role", fa: "Role RBAC" }], 0, { en: "Omit to use default class.", fa: "حذف = class پیش‌فرض." }),
    ],
  },
  {
    id: "resource-requests-limits",
    order: 25,
    title: { en: "Requests & limits", fa: "request و limit" },
    analogy: {
      en: "Requests reserve a seat on the plane; limits are the seatbelt — exceed CPU and you throttle, exceed memory and OOMKill.",
      fa: "request صندلی رزرو است؛ limit کمربند — CPU بیش از حد throttle، memory بیش از حد OOMKill.",
    },
    objectives: [
      { en: "Set cpu/memory requests for scheduling.", fa: "request cpu/memory برای زمان‌بندی." },
      { en: "Understand QoS classes and OOM behavior.", fa: "کلاس QoS و رفتار OOM." },
    ],
    explanation: [
      {
        en: "requests guarantee minimum resources for scheduling; limits cap usage per container.",
        fa: "request حداقل منابع برای زمان‌بندی؛ limit سقف مصرف هر container.",
      },
      {
        en: "QoS Guaranteed when limits=requests; Burstable when partial; BestEffort when neither set.",
        fa: "QoS Guaranteed وقتی limit=request؛ Burstable جزئی؛ BestEffort وقتی هیچ‌کدام نیست.",
      },
      {
        en: "CPU is compressible; memory is not — exceeding memory limit kills the container.",
        fa: "CPU فشردنی است؛ memory نه — عبور از limit memory، container را می‌کشد.",
      },
    ],
    commonConfusion: {
      en: "No requests → scheduler may pack Nodes until real usage causes eviction.",
      fa: "بدون request → scheduler ممکن است Node را پر کند تا eviction.",
    },
    summaryLines: [
      { en: "Always set requests in production.", fa: "در production همیشه request بگذارید." },
      { en: "Limits protect noisy neighbors.", fa: "limit همسایه پرصدا را مهار می‌کند." },
      { en: "LimitRange/ResourceQuota enforce team caps.", fa: "LimitRange/ResourceQuota سقف تیم." },
    ],
    diagramHighlights: { componentIds: ["scheduler", "app-pod", "kubelet"], connectionIds: ["sched-api", "kubelet-api"] },
    keyCommands: [
      { language: "bash", title: "Resources", code: `kubectl describe node | grep -A5 Allocated
kubectl top pods` },
    ],
    quiz: [
      q("rl1", { en: "Memory limit exceeded…", fa: "عبور limit memory…" }, [{ en: "Container OOMKilled", fa: "OOMKilled" }, { en: "Infinite CPU", fa: "CPU بی‌نهایت" }, { en: "API server restart", fa: "restart API server" }], 0, { en: "Kernel kills cgroup over user.", fa: "kernel cgroup پرمصرف را می‌کشد." }),
      q("rl2", { en: "CPU over limit…", fa: "CPU بیش از limit…" }, [{ en: "Throttled (CFS quota)", fa: "throttle (CFS)" }, { en: "Instant Pod delete", fa: "حذف فوری Pod" }, { en: "etcd wipe", fa: "پاک etcd" }], 0, { en: "Burstable shares spare cycles.", fa: "Burstable از CPU باقی‌مانده سهم می‌گیرد." }),
      q("rl3", { en: "Guaranteed QoS needs…", fa: "QoS Guaranteed…" }, [{ en: "limits == requests for all containers", fa: "limit == request همه container" }, { en: "No probes", fa: "بدون probe" }, { en: "hostNetwork true", fa: "hostNetwork true" }], 0, { en: "Last evicted under pressure usually.", fa: "تحت فشار معمولاً آخر تخلیه می‌شود." }),
      q("rl4", { en: "scheduler uses…", fa: "scheduler از…" }, [{ en: "requests for fit decisions", fa: "request برای fit" }, { en: "limits only", fa: "فقط limit" }, { en: "Ingress rules", fa: "قواعد Ingress" }], 0, { en: "Without requests, fit is blind.", fa: "بدون request، fit کور است." }),
      q("rl5", { en: "LimitRange can…", fa: "LimitRange می‌تواند…" }, [{ en: "Default/min/max per container in namespace", fa: "پیش‌فرض/حداقل/حداکثر در Namespace" }, { en: "Replace CNI", fa: "جای CNI" }, { en: "Pull images", fa: "pull image" }], 0, { en: "Stops best-effort-only Pods in prod NS.", fa: "Pod فقط BestEffort را در NS prod می‌بندد." }),
    ],
  },
  {
    id: "helm-basics",
    order: 26,
    title: { en: "Helm basics", fa: "مبانی Helm" },
    analogy: {
      en: "Helm chart is a parameterized recipe box; release is one cooked dinner installed in the cluster.",
      fa: "Helm chart جعبه دستور پارامتری است؛ release یک شام پخته‌شده در کلاستر.",
    },
    objectives: [
      { en: "Install/upgrade releases from charts.", fa: "release از chart نصب/upgrade کنید." },
      { en: "Override values safely.", fa: "values را امن override کنید." },
    ],
    explanation: [
      {
        en: "Helm packages Kubernetes manifests as charts with templated values.yaml.",
        fa: "Helm manifestهای Kubernetes را به‌صورت chart با values.yaml قالب‌دار بسته‌بندی می‌کند.",
      },
      {
        en: "helm install creates a release; helm upgrade changes it with revision history.",
        fa: "helm install یک release می‌سازد؛ helm upgrade با تاریخچه revision عوض می‌کند.",
      },
      {
        en: "helm template renders locally without applying — use for review and CI.",
        fa: "helm template محلی render می‌کند بدون apply — برای review و CI.",
      },
    ],
    commonConfusion: {
      en: "helm uninstall removes release objects — CRDs may remain depending on chart hooks.",
      fa: "helm uninstall objectهای release را حذف می‌کند — CRD بسته به chart ممکن است بماند.",
    },
    summaryLines: [
      { en: "Chart + values → manifests.", fa: "chart + values → manifest." },
      { en: "Revision history enables rollback.", fa: "revision برای rollback." },
      { en: "Prefer GitOps for prod drift control.", fa: "برای prod drift، GitOps." },
    ],
    diagramHighlights: { componentIds: ["git", "users", "apiserver"], connectionIds: ["users-api"] },
    keyCommands: [
      { language: "bash", title: "Helm",
        code: `helm install my-nginx oci://registry-1.docker.io/bitnamicharts/nginx
helm list
helm upgrade my-nginx ... --set service.type=ClusterIP` },
    ],
    quiz: [
      q("hb1", { en: "A Helm release is…", fa: "release Helm…" }, [{ en: "Installed instance of a chart", fa: "نمونه نصب‌شده chart" }, { en: "A Node label", fa: "label Node" }, { en: "etcd key only", fa: "فقط کلید etcd" }], 0, { en: "Tracked in release secrets.", fa: "در Secret release ردیابی می‌شود." }),
      q("hb2", { en: "values.yaml…", fa: "values.yaml…" }, [{ en: "Default inputs to templates", fa: "ورودی پیش‌فرض template" }, { en: "CNI config", fa: "پیکربندی CNI" }, { en: "kubelet config", fa: "پیکربندی kubelet" }], 0, { en: "Override with -f or --set.", fa: "با -f یا --set override." }),
      q("hb3", { en: "helm template helps…", fa: "helm template…" }, [{ en: "Preview YAML before apply", fa: "پیش‌نمایش YAML قبل apply" }, { en: "Start API server", fa: "start API server" }, { en: "Drain nodes", fa: "drain Node" }], 0, { en: "CI can diff rendered manifests.", fa: "CI می‌تواند diff manifest renderشده بگیرد." }),
      q("hb4", { en: "helm rollback…", fa: "helm rollback…" }, [{ en: "Reverts to prior revision", fa: "به revision قبل برمی‌گردد" }, { en: "Deletes cluster", fa: "cluster پاک" }, { en: "Disables RBAC", fa: "RBAC خاموش" }], 0, { en: "Uses stored release history.", fa: "از تاریخچه release." }),
      q("hb5", { en: "OCI charts…", fa: "chart OCI…" }, [{ en: "Pulled like container images", fa: "مثل image pull" }, { en: "Only for docker compose", fa: "فقط compose" }, { en: "Replace kubectl", fa: "جای kubectl" }], 0, { en: "helm install supports oci:// refs.", fa: "helm install از oci:// پشتیبانی می‌کند." }),
    ],
  },
  {
    id: "gitops-basics",
    order: 27,
    title: { en: "GitOps basics", fa: "مبانی GitOps" },
    analogy: {
      en: "Git is the contract; the controller is the lawyer making the cluster match every committed clause.",
      fa: "Git قرارداد است؛ کنترلر وکیل است که کلاستر را با بندهای commit‌شده هم‌تراز می‌کند.",
    },
    objectives: [
      { en: "Describe pull-based reconcile from Git.", fa: "reconcile pull-based از Git." },
      { en: "Contrast with imperative kubectl in prod.", fa: "kubectl imperative در prod." },
    ],
    explanation: [
      {
        en: "GitOps stores desired state in Git; agents (Argo CD, Flux) pull and apply to the cluster continuously.",
        fa: "GitOps وضعیت مطلوب را در Git نگه می‌دارد؛ agent (Argo CD، Flux) مداوم pull و apply می‌کند.",
      },
      {
        en: "Drift detection shows when live cluster differs from Git — revert or fix forward via PR.",
        fa: "تشخیص drift وقتی کلاستر با Git فرق دارد — revert یا PR برای fix.",
      },
      {
        en: "Secrets in Git should use encryption (SOPS, Sealed Secrets) — never plaintext credentials.",
        fa: "Secret در Git با رمزنگاری (SOPS، Sealed Secrets) — هرگز credential plain.",
      },
    ],
    commonConfusion: {
      en: "GitOps does not replace Kubernetes RBAC — it adds an auditable delivery path.",
      fa: "GitOps جای RBAC نیست — مسیر تحویل auditable اضافه می‌کند.",
    },
    summaryLines: [
      { en: "Git = source of truth.", fa: "Git = منبع حقیقت." },
      { en: "Controllers reconcile continuously.", fa: "کنترلر مداوم reconcile." },
      { en: "PR review before prod sync.", fa: "review PR قبل sync prod." },
    ],
    diagramHighlights: { componentIds: ["git", "apiserver", "controller-manager"], connectionIds: ["cm-api"] },
    keyCommands: [
      { language: "bash", title: "GitOps check",
        code: `# Argo CD example — install varies by platform
kubectl get applications -n argocd` },
    ],
    quiz: [
      q("go1", { en: "GitOps is…", fa: "GitOps…" }, [{ en: "Declarative + Git as source of truth", fa: "declarative + Git منبع حقیقت" }, { en: "SSH to nodes only", fa: "فقط SSH Node" }, { en: "Manual etcd edits", fa: "ویرایش دستی etcd" }], 0, { en: "Pull-based deployment model.", fa: "مدل استقرار pull-based." }),
      q("go2", { en: "Argo CD Application…", fa: "Application در Argo CD…" }, [{ en: "Links repo path to cluster destination", fa: "repo به cluster" }, { en: "Replaces kubelet", fa: "جای kubelet" }, { en: "CNI plugin", fa: "پلاگین CNI" }], 0, { en: "Sync status shows drift.", fa: "وضعیت sync drift را نشان می‌دهد." }),
      q("go3", { en: "Drift means…", fa: "drift یعنی…" }, [{ en: "Live cluster ≠ Git desired state", fa: "کلاستر ≠ Git" }, { en: "Pods always healthy", fa: "Pod همیشه سالم" }, { en: "DNS broken only", fa: "فقط DNS" }], 0, { en: "Controller may auto-sync or alert.", fa: "کنترلر auto-sync یا alert." }),
      q("go4", { en: "helm template in GitOps…", fa: "helm template در GitOps…" }, [{ en: "Often rendered in CI or by operator", fa: "در CI یا operator render" }, { en: "Forbidden always", fa: "همیشه ممنوع" }, { en: "Replaces API server", fa: "جای API server" }], 0, { en: "Pattern depends on tooling.", fa: "بسته به ابزار فرق دارد." }),
      q("go5", { en: "Why not kubectl apply in prod…", fa: "چرا kubectl apply در prod نه…" }, [{ en: "No auditable change trail from laptops", fa: "رد auditable از لپ‌تاپ نیست" }, { en: "kubectl too fast", fa: "kubectl خیلی سریع" }, { en: "API server rejects it", fa: "API server رد می‌کند" }], 0, { en: "Git PRs + automation scale teams.", fa: "PR Git + automation برای تیم." }),
    ],
  },
  {
    id: "prometheus-basics",
    order: 28,
    title: { en: "Prometheus metrics", fa: "metricهای Prometheus" },
    analogy: {
      en: "Metrics are the cluster’s speedometer and fuel gauge — scrape often enough to see spikes.",
      fa: "metricها سرعت‌سنج و سوخت‌سنج کلاسترند — به‌اندازه scrape کنید spike دیده شود.",
    },
    objectives: [
      { en: "Understand pull-based scraping.", fa: "scrape pull-based." },
      { en: "Find pod/service metrics endpoints.", fa: "endpoint metric Pod/Service." },
    ],
    explanation: [
      {
        en: "Prometheus pulls metrics from HTTP /metrics endpoints on a scrape interval.",
        fa: "Prometheus از endpoint /metrics با فاصله scrape می‌کشد.",
      },
      {
        en: "kube-state-metrics exposes object counts; cAdvisor/kubelet give container resource usage.",
        fa: "kube-state-metrics تعداد object؛ cAdvisor/kubelet مصرف container.",
      },
      {
        en: "PrometheusRule CRDs feed alerting; Grafana visualizes the same TSDB or remote storage.",
        fa: "PrometheusRule برای alert؛ Grafana همان TSDB یا remote storage.",
      },
    ],
    commonConfusion: {
      en: "High-cardinality labels (per-user IDs) can explode Prometheus memory.",
      fa: "label cardinality بالا (مثلاً per-user) حافظه Prometheus را منفجر می‌کند.",
    },
    summaryLines: [
      { en: "Pull model — targets must be reachable.", fa: "مدل pull — target باید reachable باشد." },
      { en: "Use recording rules for expensive queries.", fa: "recording rule برای query سنگین." },
      { en: "Alert on symptoms users feel.", fa: "alert روی symptom کاربر." },
    ],
    diagramHighlights: { componentIds: ["app-pod", "kubelet"], connectionIds: ["kubelet-api"] },
    keyCommands: [
      { language: "bash", title: "Metrics",
        code: `kubectl get --raw /apis/metrics.k8s.io/v1beta1/namespaces/default/pods | head
kubectl port-forward svc/prometheus 9090:9090` },
    ],
    quiz: [
      q("pm1", { en: "Prometheus scrapes…", fa: "Prometheus scrape…" }, [{ en: "HTTP metrics endpoints", fa: "endpoint metric HTTP" }, { en: "etcd raft log only", fa: "فقط log raft etcd" }, { en: "Git branches", fa: "branch Git" }], 0, { en: "Pull-based collection.", fa: "جمع‌آوری pull-based." }),
      q("pm2", { en: "metrics-server differs — it serves…", fa: "metrics-server…" }, [{ en: "metrics.k8s.io for kubectl top/HPA", fa: "metrics.k8s.io برای top/HPA" }, { en: "Long-term TSDB only", fa: "فقط TSDB بلندمدت" }, { en: "Ingress TLS", fa: "TLS Ingress" }], 0, { en: "Not a full Prometheus replacement.", fa: "جای کامل Prometheus نیست." }),
      q("pm3", { en: "ServiceMonitor (Prometheus Operator)…", fa: "ServiceMonitor…" }, [{ en: "Declares scrape targets via CRD", fa: "target scrape با CRD" }, { en: "Replaces Deployment", fa: "جای Deployment" }, { en: "Stores PV data", fa: "داده PV" }], 0, { en: "Operator generates scrape config.", fa: "operator پیکربندی scrape می‌سازد." }),
      q("pm4", { en: "Alertmanager handles…", fa: "Alertmanager…" }, [{ en: "Routing/grouping notifications", fa: "مسیردهی/گروه alert" }, { en: "Pod scheduling", fa: "زمان‌بندی Pod" }, { en: "CNI wiring", fa: "سیم‌کشی CNI" }], 0, { en: "Silences and receivers configured there.", fa: "silence و receiver آنجا." }),
      q("pm5", { en: "RED/USE methods help…", fa: "RED/USE…" }, [{ en: "Pick useful service metrics", fa: "metric مفید Service" }, { en: "Write NetworkPolicy", fa: "NetworkPolicy" }, { en: "Create CRD", fa: "CRD" }], 0, { en: "Rate, Errors, Duration vs Utilization.", fa: "Rate، Errors، Duration." }),
    ],
  },
  {
    id: "logging-tracing",
    order: 29,
    title: { en: "Logging & tracing", fa: "لاگ و trace" },
    analogy: {
      en: "Logs are diary entries; traces are the breadcrumb trail showing one request across Services.",
      fa: "لاگ یادداشت روزانه است؛ trace مسیر یک درخواست بین Serviceها.",
    },
    objectives: [
      { en: "Collect stdout/stderr from containers.", fa: "stdout/stderr container." },
      { en: "Link traces with ingress and mesh headers.", fa: "trace با header ingress/mesh." },
    ],
    explanation: [
      {
        en: "Containers should log to stdout/stderr; node agents or DaemonSets ship logs to centralized stores.",
        fa: "container به stdout/stderr لاگ کند؛ agent روی Node یا DaemonSet به مخزن متمرکز می‌فرستد.",
      },
      {
        en: "OpenTelemetry SDKs emit traces/metrics/logs with correlated trace IDs.",
        fa: "SDK OpenTelemetry trace/metric/log با trace ID هم‌بسته emit می‌کند.",
      },
      {
        en: "kubectl logs is the first debug tool; cluster logging stacks add search and retention.",
        fa: "kubectl logs اولین ابزار دیباگ است؛ stack لاگ کلاستر جستجو و retention می‌دهد.",
      },
    ],
    commonConfusion: {
      en: "Logging inside the container filesystem without stdout loses logs when the Pod disappears.",
      fa: "لاگ فقط داخل filesystem container بدون stdout با حذف Pod از دست می‌رود.",
    },
    summaryLines: [
      { en: "Log to stdout; avoid file-only logging.", fa: "به stdout لاگ؛ نه فقط فایل." },
      { en: "Trace context propagates via headers.", fa: "context trace با header." },
      { en: "Correlate logs with trace_id.", fa: "لاگ با trace_id." },
    ],
    diagramHighlights: { componentIds: ["app-pod", "kubelet"], connectionIds: ["kubelet-api"] },
    keyCommands: [
      { language: "bash", title: "Logs", code: `kubectl logs deploy/web --tail=100 -f
kubectl logs web-abc123 -c app --previous` },
    ],
    quiz: [
      q("lt1", { en: "Kubernetes expects apps to log…", fa: "اپ در Kubernetes لاگ…" }, [{ en: "To stdout/stderr", fa: "به stdout/stderr" }, { en: "Only to etcd", fa: "فقط etcd" }, { en: "Via Ingress", fa: "از Ingress" }], 0, { en: "kubelet reads container logs.", fa: "kubelet log container را می‌خواند." }),
      q("lt2", { en: "kubectl logs --previous…", fa: "kubectl logs --previous…" }, [{ en: "Shows crashed container instance", fa: "instance container crash" }, { en: "Deletes Pod", fa: "Pod پاک" }, { en: "Upgrades chart", fa: "upgrade chart" }], 0, { en: "Debug CrashLoopBackOff.", fa: "دیباگ CrashLoopBackOff." }),
      q("lt3", { en: "Distributed tracing needs…", fa: "trace توزیع‌شده نیاز…" }, [{ en: "Propagation of trace context", fa: "انتشار context trace" }, { en: "Static PV only", fa: "فقط PV ایستا" }, { en: "hostPath only", fa: "فقط hostPath" }], 0, { en: "W3C traceparent common.", fa: "traceparent W3C رایج است." }),
      q("lt4", { en: "Sidecar log agents…", fa: "agent لاگ sidecar…" }, [{ en: "Ship logs without app code change", fa: "ارسال بدون تغییر کد اپ" }, { en: "Replace API server", fa: "جای API server" }, { en: "Disable DNS", fa: "DNS خاموش" }], 0, { en: "DaemonSet node logging also common.", fa: "لاگ سطح Node با DaemonSet هم رایج است." }),
      q("lt5", { en: "High-cardinality log labels…", fa: "label لاگ cardinality بالا…" }, [{ en: "Costly in centralized systems", fa: "گران در سیستم متمرکز" }, { en: "Required always", fa: "همیشه لازم" }, { en: "Fix RBAC", fa: "RBAC درست" }], 0, { en: "Prefer trace IDs over random labels.", fa: "trace ID بهتر از label تصادفی." }),
    ],
  },
  {
    id: "troubleshooting-workloads",
    order: 30,
    title: { en: "Troubleshooting workloads", fa: "عیب‌یابی workload" },
    analogy: {
      en: "Debug like a doctor: symptoms (events), vitals (metrics), history (logs), anatomy (describe).",
      fa: "مثل پزشک: symptom (event)، علائم حیاتی (metric)، تاریخچه (log)، آناتومی (describe).",
    },
    objectives: [
      { en: "Use describe, events, logs systematically.", fa: "describe، event و log منظم." },
      { en: "Map Pod phases to likely causes.", fa: "phase Pod به علت محتمل." },
    ],
    explanation: [
      {
        en: "Pending → scheduling/resources/taints; ImagePullBackOff → registry/auth/tag; CrashLoopBackOff → app exit.",
        fa: "Pending → زمان‌بندی/منابع/taint؛ ImagePullBackOff → registry/auth/tag؛ CrashLoopBackOff → خروج اپ.",
      },
      {
        en: "kubectl describe surfaces Events attached to objects — read bottom-up for the latest clue.",
        fa: "kubectl describe، Event روی object را نشان می‌دهد — از پایین بخوانید.",
      },
      {
        en: "Debug Pods (ephemeral containers) attach tools without rebuilding the app image.",
        fa: "Pod دیباگ (ephemeral container) ابزار را بدون rebuild image می‌چسباند.",
      },
    ],
    commonConfusion: {
      en: "Restart count rising with OOMKilled means raise memory limit or fix leak — not ignore.",
      fa: "restart با OOMKilled یعنی limit memory یا leak — نادیده نگیرید.",
    },
    summaryLines: [
      { en: "Events + describe first.", fa: "اول event + describe." },
      { en: "Logs with --previous after crash.", fa: "log با --previous بعد crash." },
      { en: "Reproduce with minimal Job/Pod.", fa: "با Job/Pod minimal reproduce." },
    ],
    diagramHighlights: { componentIds: ["app-pod", "kubelet", "scheduler"], connectionIds: ["kubelet-api", "sched-api"] },
    keyCommands: [
      { language: "bash", title: "Debug loop", code: `kubectl get pods
kubectl describe pod <name>
kubectl logs <name> --all-containers --tail=200
kubectl get events --field-selector involvedObject.name=<name>` },
    ],
    quiz: [
      q("tw1", { en: "ImagePullBackOff often…", fa: "ImagePullBackOff اغلب…" }, [{ en: "Wrong image or missing pull secret", fa: "image اشتباه یا pull secret" }, { en: "Ingress misconfig only", fa: "فقط Ingress" }, { en: "CRD missing only", fa: "فقط CRD" }], 0, { en: "Check describe Events.", fa: "Event در describe." }),
      q("tw2", { en: "Pending Pod long time…", fa: "Pod Pending طولانی…" }, [{ en: "Insufficient CPU/memory or taints", fa: "CPU/memory یا taint" }, { en: "Always healthy", fa: "همیشه سالم" }, { en: "DNS only issue", fa: "فقط DNS" }], 0, { en: "scheduler Events explain.", fa: "Event scheduler توضیح می‌دهد." }),
      q("tw3", { en: "Readiness failing while running…", fa: "readiness fail در حال اجرا…" }, [{ en: "No Service traffic", fa: "بدون ترافیک Service" }, { en: "Automatic deletion", fa: "حذف خودکار" }, { en: "etcd quorum loss", fa: "از دست quorum etcd" }], 0, { en: "Fix probe path/port.", fa: "path/پورت probe." }),
      q("tw4", { en: "kubectl debug -it …", fa: "kubectl debug -it …" }, [{ en: "Ephemeral debug container", fa: "container دیباگ ephemeral" }, { en: "Deletes Deployment", fa: "Deployment پاک" }, { en: "Changes RBAC cluster-wide", fa: "RBAC کل cluster" }], 0, { en: "Requires feature gate/enabled cluster.", fa: "به قابلیت cluster بستگی دارد." }),
      q("tw5", { en: "First command in incident…", fa: "اولین دستور incident…" }, [{ en: "kubectl get/describe affected objects", fa: "get/describe object" }, { en: "Delete namespace", fa: "حذف Namespace" }, { en: "Restart etcd", fa: "restart etcd" }], 0, { en: "Gather facts before changes.", fa: "قبل تغییر، fact جمع کنید." }),
    ],
  },
  {
    id: "rbac",
    order: 31,
    title: { en: "RBAC", fa: "RBAC" },
    analogy: {
      en: "Roles are job titles; RoleBindings hire someone for that title in a namespace (or ClusterRole for the whole company).",
      fa: "Role عنوان شغلی است؛ RoleBinding کسی را در Namespace استخدام می‌کند (ClusterRole برای کل شرکت).",
    },
    objectives: [
      { en: "Separate Role vs ClusterRole scope.", fa: "Role در برابر ClusterRole." },
      { en: "Audit who can change what.", fa: "audit چه کسی چه چیز را عوض می‌کند." },
    ],
    explanation: [
      {
        en: "RBAC binds subjects (users, groups, ServiceAccounts) to roles with verbs on resources.",
        fa: "RBAC subject (user، group، ServiceAccount) را به role با verb روی resource وصل می‌کند.",
      },
      {
        en: "Role + RoleBinding are namespaced; ClusterRole + ClusterRoleBinding are cluster-wide.",
        fa: "Role + RoleBinding namespaced؛ ClusterRole + ClusterRoleBinding در سطح cluster.",
      },
      {
        en: "kubectl auth can-i --as=system:serviceaccount:ns:sa tests effective permissions.",
        fa: "kubectl auth can-i --as=system:serviceaccount:ns:sa مجوز مؤثر را تست می‌کند.",
      },
    ],
    commonConfusion: {
      en: "cluster-admin is powerful — prefer least privilege ServiceAccounts per app.",
      fa: "cluster-admin قدرتمند است — ServiceAccount با حداقل دسترسی.",
    },
    summaryLines: [
      { en: "verbs + resources + apiGroups.", fa: "verb + resource + apiGroup." },
      { en: "Bind ServiceAccounts in app namespaces.", fa: "ServiceAccount در Namespace اپ." },
      { en: "Audit with can-i and audit logs.", fa: "can-i و audit log." },
    ],
    diagramHighlights: { componentIds: ["users", "apiserver"], connectionIds: ["users-api"] },
    keyCommands: [
      { language: "bash", title: "RBAC", code: `kubectl auth can-i create deployments --namespace=practice
kubectl get role,rolebinding -n practice` },
    ],
    quiz: [
      q("rb1", { en: "RoleBinding connects…", fa: "RoleBinding وصل…" }, [{ en: "Subject to Role or ClusterRole", fa: "subject به Role/ClusterRole" }, { en: "Pod to Service only", fa: "Pod به Service" }, { en: "Ingress to TLS", fa: "Ingress به TLS" }], 0, { en: "Grants permissions in scope.", fa: "مجوز در محدوده." }),
      q("rb2", { en: "ServiceAccount tokens mount…", fa: "token ServiceAccount…" }, [{ en: "Into Pods at default path", fa: "در Pod مسیر پیش‌فرض" }, { en: "Into etcd public URL", fa: "URL عمومی etcd" }, { en: "Only on laptops", fa: "فقط لپ‌تاپ" }], 0, { en: "Apps call API with projected token.", fa: "اپ با token projected به API." }),
      q("rb3", { en: "ClusterRole is for…", fa: "ClusterRole برای…" }, [{ en: "Cluster-scoped or aggregated rules", fa: "cluster-scoped یا aggregated" }, { en: "Only DNS", fa: "فقط DNS" }, { en: "Image pulls", fa: "pull image" }], 0, { en: "Can be referenced by RoleBinding in one NS.", fa: "RoleBinding در یک NS می‌تواند ارجاع دهد." }),
      q("rb4", { en: "Default discovery roles…", fa: "role discovery پیش‌فرض…" }, [{ en: "Let users list common resources read-only", fa: "list read-only رایج" }, { en: "Grant cluster-admin to all", fa: "cluster-admin برای همه" }, { en: "Disable authn", fa: "authn خاموش" }], 0, { en: "Platforms ship view/edit/admin clusterroles.", fa: "view/edit/admin clusterrole." }),
      q("rb5", { en: "Authorization happens…", fa: "authorization…" }, [{ en: "After authentication at API server", fa: "بعد authn در API server" }, { en: "Inside container runtime", fa: "داخل runtime" }, { en: "In Helm only", fa: "فقط Helm" }], 0, { en: "RBAC is one authorizer mode.", fa: "RBAC یک mode authorizer است." }),
    ],
  },
  {
    id: "pod-security-standards",
    order: 32,
    title: { en: "Pod Security Standards", fa: "Pod Security Standards" },
    analogy: {
      en: "PSS labels are floor plans: privileged is the workshop; baseline adds guardrails; restricted is the clean room.",
      fa: "label PSS نقشه طبقات است: privileged کارگاه؛ baseline نرده؛ restricted اتاق تمیز.",
    },
    objectives: [
      { en: "Apply enforce/audit/warn PSS labels on namespaces.", fa: "label enforce/audit/warn PSS روی Namespace." },
      { en: "Know restricted vs baseline constraints.", fa: "محدودیت restricted در برابر baseline." },
    ],
    explanation: [
      {
        en: "Pod Security Standards define three policies: privileged, baseline, restricted — enforced via namespace labels.",
        fa: "Pod Security Standards سه policy دارد: privileged، baseline، restricted — با label روی Namespace.",
      },
      {
        en: "Restricted disallows privileged containers, host namespaces, and risky volume types among other rules.",
        fa: "restricted container privileged، host namespace و volume پرخطر را منع می‌کند.",
      },
      {
        en: "Pod Security Admission (built-in) replaces deprecated PodSecurityPolicy when enabled.",
        fa: "Pod Security Admission (داخلی) جای PodSecurityPolicy منسوخ را می‌گیرد.",
      },
    ],
    commonConfusion: {
      en: "PSS applies at Pod creation — existing Pods are not retroactively deleted.",
      fa: "PSS هنگام ساخت Pod اعمال می‌شود — Pod موجود retroactive حذف نمی‌شود.",
    },
    summaryLines: [
      { en: "Label namespaces pod-security.kubernetes.io/enforce.", fa: "label pod-security.kubernetes.io/enforce." },
      { en: "Start audit/warn before enforce.", fa: "audit/warn قبل enforce." },
      { en: "Combine with seccomp/AppArmor profiles.", fa: "با seccomp/AppArmor." },
    ],
    diagramHighlights: { componentIds: ["apiserver", "app-pod"], connectionIds: ["users-api"] },
    keyCommands: [
      { language: "bash", title: "PSS labels", code: `kubectl label namespace practice \\
  pod-security.kubernetes.io/enforce=baseline \\
  pod-security.kubernetes.io/warn=restricted \\
  --overwrite` },
    ],
    quiz: [
      q("pss1", { en: "PSS enforced via…", fa: "PSS enforce…" }, [{ en: "Namespace labels + Pod Security Admission", fa: "label Namespace + admission" }, { en: "Only CNI", fa: "فقط CNI" }, { en: "docker run flags", fa: "flag docker run" }], 0, { en: "Admission plugin checks Pod spec.", fa: "admission spec Pod را چک می‌کند." }),
      q("pss2", { en: "Restricted policy…", fa: "policy restricted…" }, [{ en: "Hardens defaults (non-root, drop caps)", fa: "سخت‌سازی (non-root، drop cap)" }, { en: "Allows privileged always", fa: "همیشه privileged" }, { en: "Disables API", fa: "API خاموش" }], 0, { en: "Stricter than baseline.", fa: "سخت‌تر از baseline." }),
      q("pss3", { en: "warn label…", fa: "label warn…" }, [{ en: "Logs violations without blocking", fa: "log بدون block" }, { en: "Deletes all Pods", fa: "همه Pod پاک" }, { en: "Opens NodePort", fa: "NodePort باز" }], 0, { en: "Good migration path.", fa: "مسیر migration خوب." }),
      q("pss4", { en: "privileged policy…", fa: "policy privileged…" }, [{ en: "Unrestricted for system namespaces", fa: "بدون محدودیت NS سیستمی" }, { en: "For every app NS", fa: "هر NS اپ" }, { en: "Replaces RBAC", fa: "جای RBAC" }], 0, { en: "kube-system often privileged.", fa: "kube-system اغلب privileged." }),
      q("pss5", { en: "To run as non-root…", fa: "اجرای non-root…" }, [{ en: "Set securityContext.runAsNonRoot and user in image", fa: "securityContext.runAsNonRoot و user در image" }, { en: "Only change Service type", fa: "فقط نوع Service" }, { en: "Disable kubelet", fa: "kubelet خاموش" }], 0, { en: "Restricted requires non-root UID.", fa: "restricted به UID non-root نیاز دارد." }),
    ],
  },
];
