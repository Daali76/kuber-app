export type FaNarrative = {
  summary: string;
  problem: string;
  whyItExists: string;
  analogy: string;
  howItWorks: string[];
  levels: { beginner: string; intermediate: string; advanced: string };
  useWhen: string[];
  avoidWhen: string[];
  placementBlurb: string;
  alternatives: Record<string, string>;
  implement: Record<string, { title: string; description: string }>;
};

const stdImpl = (
  desc: Record<string, string>,
  titles?: Partial<Record<string, string>>,
) => {
  const base: Record<string, { title: string; description: string }> = {
    prereq: { title: "پیش‌نیازها", description: desc.prereq ?? "" },
    install: { title: "نصب", description: desc.install ?? "" },
    verify: { title: "تأیید", description: desc.verify ?? "" },
    example: { title: "حداقل مثال کارا", description: desc.example ?? "" },
    test: { title: "نحوه تست", description: desc.test ?? "" },
    mistakes: { title: "اشتباهات رایج", description: desc.mistakes ?? "" },
  };
  if (titles) {
    for (const [k, t] of Object.entries(titles)) {
      if (base[k] && t) base[k] = { ...base[k], title: t };
    }
  }
  return base;
};

export const faNarratives: Record<string, FaNarrative> = {
  kubernetes: {
    summary:
      "پلتفرم قابل‌حمل برای خودکارسازی استقرار، scale و عملیات کانتینرها.",
    problem:
      "اجرای تعداد زیاد کانتینر روی چند ماشین به زمان‌بندی، بازیابی و API مشترک نیاز دارد.",
    whyItExists:
      "وقتی کانتینرها روی چند ماشین پخش می‌شوند، بدون زمان‌بندی، بازیابی خودکار و API مشترک، تیم‌ها مجبورند پروسه‌ها را دستی نگه دارند؛ Kubernetes اجازه می‌دهد وضعیت مطلوب را declarative اعلام کنید.",
    analogy:
      "Kubernetes مثل برج کنترل ترافیک هوایی است: workloadها برنامه پرواز (manifest) می‌فرستند؛ برج دروازه و باند (Node) تخصیص می‌دهد و در خرابی مسیر را عوض می‌کند.",
    howItWorks: [
      "آبجکت‌های declarative مثل Pod، Deployment و Service را با HTTPS به API server می‌فرستید.",
      "etcd وضعیت را نگه می‌دارد؛ controllerها desired و actual را reconcile می‌کنند؛ scheduler Pod را به Node bind می‌کند.",
      "kubelet روی هر Node از طریق runtime (CRI) image می‌کشد و وضعیت را به API برمی‌گرداند.",
      "Service و DNS نام پایدار به Podهای گذرا می‌دهند؛ Ingress/Gateway ترافیک HTTP را از بیرون هدایت می‌کند.",
    ],
    levels: {
      beginner:
        "Kubernetes را یک API دور می‌بینید: kubectl apply با Deployment، Pod را زنده نگه می‌دارد و Service آن را داخل کلاستر expose می‌کند؛ phase، describe و logs را یاد می‌گیرید.",
      intermediate:
        "ConfigMap، Secret، Namespace، RBAC، Ingress/Gateway، rollout، probe و request/limit؛ نقش CoreDNS، CNI و runtime.",
      advanced:
        "CRD و controller، admission webhook، scheduling plugin، taint/toleration، quota، backup etcd، HA control plane و drain.",
    },
    useWhen: [
      "workload کانتینری زیاد دارید که به orchestration نیاز دارد",
      "API قابل‌حمل بین cloud و on-prem می‌خواهید",
    ],
    avoidWhen: [
      "یک VM یا serverless managed بار را پوشش می‌دهد",
      "سربار عملیاتی برای تیم کوچک بیش از سود است",
    ],
    placementBlurb: "control plane + kubelet روی هر Node",
    alternatives: {
      helm: "Helm اپ را برای Kubernetes بسته‌بندی می‌کند؛ جایگزین orchestrator نیست.",
    },
    implement: stdImpl(
      {
        prereq:
          "Nodeهای Linux (یا kind/minikube)، runtime کانتینر (containerd) و kubectl هم‌نسخه minor کلاستر.",
        install:
          "control plane مدیریت‌شده، kubeadm یا کلاستر محلی؛ مثال با kind.",
        verify:
          "Nodeها باید Ready و Podهای system در kube-system Running باشند.",
        example:
          "یک Deployment و Service تا control plane Pod را زمان‌بندی و expose کند.",
        test: "port-forward به nginx بزنید یا از Pod دیباگ به Service curl کنید.",
        mistakes:
          "ImagePullBackOff، CrashLoopBackOff، Pending (Node یا request منابع).",
      },
      { install: "نصب یا تهیه کلاستر" },
    ),
  },

  containerd: {
    summary:
      "runtime کانتینر استاندارد صنعت با تاکید بر سادگی و پایداری.",
    problem:
      "Nodeهای Kubernetes به runtime سازگار با CRI برای pull image و اجرای کانتینر نیاز دارند.",
    whyItExists:
      "Nodeهای Kubernetes به runtime سازگار با CRI نیاز دارند تا image بکشند و lifecycle کانتینر را بدون Docker Engine کامل روی هر Node مدیریت کنند.",
    analogy:
      "containerd آشپزخانه واقعی است: Kubernetes (kubelet) سفارش می‌دهد؛ containerd مواد (image) را می‌آورد و ظرف (کانتینر) را آماده می‌کند.",
    howItWorks: [
      "kubelet از طریق پلاگین CRI روی socket محلی gRPC با containerd صحبت می‌کند.",
      "containerd از shim استفاده می‌کند تا restart kubelet کانتینرهای در حال اجرا را نکشد.",
      "image در لایه‌های content-addressable ذخیره می‌شود؛ snapshot filesystem ریشه کانتینر را می‌سازد.",
      "ctr و nerdctl برای دیباگ همان daemonی هستند که kubelet استفاده می‌کند.",
    ],
    levels: {
      beginner:
        "می‌فهمید containerd — نه kubectl — کانتینر را روی Node اجرا می‌کند؛ socket، crictl و خطاهای CRI در لاگ kubelet.",
      intermediate:
        "imagePullSecret، mirror رجیستری، snapshotter و GC image؛ ImagePullBackOff و pause container.",
      advanced:
        "runtime class، snapshotter سفارشی، NRI و سخت‌سازی daemon روی Node چند tenant.",
    },
    useWhen: [
      "runtime پیش‌فرض اکثر توزیع‌های Kubernetes را می‌خواهید",
      "runtime متمرکز بدون Docker Engine کامل نیاز دارید",
    ],
    avoidWhen: ["توزیع شما به‌جای آن CRI-O را استاندارد کرده است"],
    placementBlurb: "پروسه Node زیر kubelet (CRI)",
    alternatives: {
      kubernetes:
        "Kubernetes Pod را زمان‌بندی می‌کند؛ containerd کانتینر را روی Node اجرا می‌کند.",
    },
    implement: stdImpl({
      prereq:
        "Node worker لینوکس؛ برای Kubernetes، kubelet `--container-runtime-endpoint` را به socket CRI containerd اشاره دهید.",
      install:
        "ابتدا config پیش‌فرض (با SystemdCgroup برای kubelet) بنویسید، سپس unit systemd را enable و restart کنید.",
      verify:
        "CRI در دسترس است و Nodeهای Kubernetes از containerd به‌عنوان runtime استفاده می‌کنند.",
      example: "با nerdctl (یا ctr) روی Node image pull و run کنید.",
      test: "از Kubernetes یک Pod بسازید و با crictl کانتینر را ببینید.",
      mistakes:
        "SystemdCgroup = false، socket اشتباه kubelet، پلاگین CRI غیرفعال، یا pause image غیرقابل pull.",
    }),
  },

  coredns: {
    summary:
      "سرور DNS انعطاف‌پذیر و DNS پیش‌فرض کلاستر برای Kubernetes.",
    problem: "Podها به نام‌های پایدار service discovery داخل کلاستر نیاز دارند.",
    whyItExists:
      "Pod و Service به نام DNS پایدار داخل کلاستر نیاز دارند؛ CoreDNS spec DNS Kubernetes را پیاده می‌کند.",
    analogy:
      "CoreDNS دفترچه تلفن کلاستر است: وقتی my-svc.my-ns.svc.cluster.local را می‌زنید، IP فعلی Pod پشت Service را پیدا می‌کند.",
    howItWorks: [
      "kubelet Podها را طوری تنظیم می‌کند که ClusterIP Service DNS (kube-dns در kube-system) را ببینند.",
      "Podهای CoreDNS به‌صورت Deployment اجرا می‌شوند؛ Service kube-dns کوئری را load-balance می‌کند.",
      "Corefile زنجیره پلاگین دارد: kubernetes برای cluster.local، forward برای upstream.",
      "رکورد Service و Pod از API با پلاگین kubernetes می‌آید.",
    ],
    levels: {
      beginner:
        "CoreDNS در kube-system Running است؛ nslookup از Pod دیباگ و الگوی service.namespace.svc.cluster.local.",
      intermediate:
        "ویرایش Corefile، scale برای QPS، NetworkPolicy و تفاوت headless و ClusterIP.",
      advanced:
        "NodeLocal DNSCache، split horizon، متریک DNS و پلاگین سفارشی برای چند کلاستر.",
    },
    useWhen: ["Kubernetes اجرا می‌کنید (DNS پیش‌فرض کلاستر)"],
    avoidWhen: ["سیستمی بدون نیاز به DNS کلاستر دارید"],
    placementBlurb: "Deployment در kube-system (DNS کلاستر)",
    alternatives: {},
    implement: stdImpl({
      prereq: "کلاستر Kubernetes با addon DNS (معمولاً از قبل نصب است).",
      install:
        "در اکثر توزیع‌ها CoreDNS از قبل هست؛ در غیر این صورت manifest رسمی addon.",
      verify: "Podهای CoreDNS Ready؛ Service kube-dns ClusterIP دارد.",
      example: "از Pod دیباگ یک نام DNS Service را resolve کنید.",
      test:
        "Service بسازید و تأیید کنید name.ns.svc.cluster.local resolve می‌شود.",
      mistakes:
        "Corefile خراب، Podهای CoreDNS down، یا نام/namespace اشتباه در کوئری.",
    }),
  },

  cilium: {
    summary:
      "شبکه، امنیت و observability مبتنی بر eBPF برای Kubernetes.",
    problem:
      "kube-proxy و CNIهای ساده در scale، policy مبتنی بر identity و دید به مشکل می‌خورند.",
    whyItExists:
      "کلاستر به CNI برای شبکه Pod، جایگزین kube-proxy مقیاس‌پذیر، policy مبتنی بر identity و observability نیاز دارد — Cilium با eBPF در kernel لینوکس.",
    analogy:
      "Cilium گشت مرزی هوشمند با دید eBPF است: بسته را با identity (label) می‌بیند، نه فقط IP، و policy را در wire speed اعمال می‌کند.",
    howItWorks: [
      "cilium-agent روی هر Node به‌صورت DaemonSet برنامه eBPF برای routing، NAT و policy load می‌کند.",
      "cilium-operator CRD و IPAM را از API reconcile می‌کند.",
      "CiliumNetworkPolicy endpoint را با label انتخاب و L3-L7 را در datapath enforce می‌کند.",
      "Hubble (اختیاری) flow را از همان mapهای eBPF می‌بیند.",
    ],
    levels: {
      beginner:
        "Cilium را به‌عنوان CNI نصب می‌کنید برای شبکه Pod و NetworkPolicy.",
      intermediate:
        "Hubble برای flow؛ CiliumNetworkPolicy با identity نه فقط IP.",
      advanced: "cluster mesh، Gateway API و قابلیت‌های mesh اختیاری.",
    },
    useWhen: [
      "شبکه eBPF مدرن و network policy غنی می‌خواهید",
      "observability flow داخلی (Hubble) نیاز دارید",
    ],
    avoidWhen: [
      "kernel Node نمی‌تواند eBPF اجرا کند",
      "CNI ساده‌تر نیاز را پوشش می‌دهد",
    ],
    placementBlurb: "DaemonSet agent روی هر Node + operator",
    alternatives: {
      istio:
        "Istio روی L7 mesh تمرکز دارد؛ Cilium روی شبکه/امنیت eBPF.",
    },
    implement: stdImpl({
      prereq:
        "Helm 3؛ kernel و mountهای لازم برای eBPF؛ در لاب kind ممکن است CNI پیش‌فرض را غیرفعال کنید.",
      install: "chart رسمی Helm از repo Cilium.",
      verify: "DaemonSet agent روی هر Node Ready؛ operator Running.",
      example:
        "CiliumNetworkPolicy که فقط frontend→api روی TCP 8080 را allow کند.",
      test: "Pod با label مستقر کنید و connectivity با policy را چک کنید.",
      mistakes:
        "CNI دوگانه، kernel قدیمی، یا فراموش کردن cilium status بعد از نصب.",
    }),
  },

  istio: {
    summary:
      "service mesh پرقابلیت برای مدیریت ترافیک، امنیت و telemetry.",
    problem:
      "microservice به mTLS، routing و telemetry یکسان بین زبان‌ها نیاز دارد.",
    whyItExists:
      "معماری microservice به mTLS، routing و telemetry یکپارچه بین stackهای مختلف نیاز دارد.",
    analogy:
      "Istio لایه ترافیک و امنیت بین workloadهای اپ است: sidecar Envoy سیاست control plane (istiod) را اجرا می‌کند.",
    howItWorks: [
      "istiod certificate، config و discovery را به Envoy sidecar می‌دهد.",
      "sidecar در Pod اپ inject می‌شود و ترافیک L4/L7 را intercept می‌کند.",
      "VirtualService و DestinationRule routing و subset را shape می‌کنند.",
      "telemetry و mTLS در datapath sidecar جمع می‌شود.",
    ],
    levels: {
      beginner:
        "Istio نصب، namespace با injection، sidecar با mTLS و metric.",
      intermediate:
        "VirtualService، DestinationRule، PeerAuthentication برای canary و policy.",
      advanced: "ambient mode، multi-cluster mesh و Wasm extension.",
    },
    useWhen: [
      "مدیریت ترافیک L7 پیشرفته و mTLS سراسری mesh می‌خواهید",
      "یکپارچگی عمیق Envoy نیاز دارید",
    ],
    avoidWhen: [
      "پیچیدگی mesh برای اندازه تیم زیاد است",
      "policy CNI به‌تنهایی کافی است",
    ],
    placementBlurb: "istiod + sidecar Envoy در Pod اپ",
    alternatives: {
      cilium: "Cilium با رویکرد eBPF-first می‌تواند قابلیت mesh بدهد.",
    },
    implement: stdImpl({
      prereq:
        "کلاستر Kubernetes؛ istioctl هم‌نسخه با Istio هدف.",
      install: "istioctl install با profile demo یا default در istio-system.",
      verify: "Podهای istio-system Running؛ istioctl analyze بدون خطا.",
      example:
        "injection فعال و VirtualService با split وزن canary.",
      test:
        "namespace label، restart Pod؛ 2/2 container (app + istio-proxy).",
      mistakes:
        "فراموش کردن label injection، پورت Service با VirtualService ناهماهنگ، یا subset اشتباه.",
    }),
  },

  prometheus: {
    summary:
      "جعبه‌ابزار monitoring متریک و alerting با مدل داده بعدی.",
    problem:
      "targetهای cloud-native پویا به متریک pull-based و rule alert نیاز دارند.",
    whyItExists:
      "اپراتور به پایگاه متریک pull-based با PromQL و alerting نیاز دارد؛ Prometheus scrape می‌کند و به Grafana و Alertmanager می‌دهد.",
    analogy:
      "Prometheus مثل کتابدار با زمان‌سنج است: هر interval از target می‌خواند، timestamp ذخیره می‌کند و rule alert را زنگ می‌زند.",
    howItWorks: [
      "سرور Prometheus endpoint HTTP /metrics را در interval scrape می‌کند.",
      "Prometheus Operator (نصب رایج) ServiceMonitor و CR Prometheus را watch می‌کند.",
      "recording و alerting rule روی سری scrape شده PromQL ارزیابی می‌کنند.",
      "Alertmanager گروه‌بندی، silence و route اعلان را انجام می‌دهد.",
    ],
    levels: {
      beginner:
        "kube-prometheus-stack، UI با port-forward، targetهای UP و PromQL ساده.",
      intermediate:
        "ServiceMonitor، recording rule، route Alertmanager و label با cardinality کنترل‌شده.",
      advanced: "HA Prometheus، Thanos/Mimir، federation و alert SLO.",
    },
    useWhen: [
      "متریک و alerting بومی Kubernetes می‌خواهید",
      "exporterها فرمت Prometheus دارند",
    ],
    avoidWhen: [
      "فقط log/trace کافی است و مسیر متریک دیگر اجباری است",
    ],
    placementBlurb:
      "سرور Prometheus با scrape /metrics از ServiceDiscovery",
    alternatives: {
      grafana:
        "Grafana متریک را visualize می‌کند؛ Prometheus scrape و ذخیره می‌کند.",
      opentelemetry:
        "OpenTelemetry telemetry تولید می‌کند؛ Prometheus backend متریک رایج است.",
    },
    implement: stdImpl({
      prereq:
        "Helm 3؛ مجوز نصب CRD (برای kube-prometheus-stack).",
      install:
        "chart kube-prometheus-stack از prometheus-community.",
      verify: "Podهای Prometheus و operator در monitoring Ready.",
      example:
        "ServiceMonitor برای Service اپ که /metrics expose می‌کند.",
      test: "port-forward Prometheus و کوئری target یا metric.",
      mistakes:
        "selector ServiceMonitor ناهماهنگ، port name اشتباه، یا cardinality بالا.",
    }),
  },

  grafana: {
    summary:
      "UI observability برای dashboard و alert روی Prometheus و datasourceهای دیگر.",
    problem:
      "PromQL خام و چند backend بدون UI مشترک سخت کاوش می‌شوند.",
    whyItExists:
      "جدول PromQL برای تیم سخت share می‌شود — Grafana متریک (و log/trace) را dashboard و alert مشترک می‌کند.",
    analogy:
      "اگر Prometheus spreadsheet است، Grafana ارائه است: chart، variable و دیوار TV برای on-call.",
    howItWorks: [
      "Grafana از API کوئری datasource (Prometheus، Loki، Tempo و …) می‌زند.",
      "dashboard panel را به کوئری با template variable وصل می‌کند.",
      "alerting یکپارچه rule Grafana و channel اعلان.",
      "در kube-prometheus-stack اغلب dashboard Kubernetes از قبل هست.",
    ],
    levels: {
      beginner:
        "login، dashboard Kubernetes/Node و panel ساده با up.",
      intermediate:
        "dashboard-as-code، provisioning امن datasource و RBAC پوشه.",
      advanced: "Grafana HA، SSO، audit و dashboard SLO با recording rule.",
    },
    useWhen: [
      "dashboard روی Prometheus/Loki/Tempo و backend مشابه می‌خواهید",
    ],
    avoidWhen: ["UI Prometheus به‌تنهایی برای تیم کافی است"],
    placementBlurb: "Deployment که Prometheus (و دیگران) را query می‌کند",
    alternatives: {
      prometheus:
        "Prometheus scrape و ذخیره می‌کند؛ Grafana visualize می‌کند.",
    },
    implement: stdImpl({
      prereq:
        "دسترسی به Service Prometheus (مثلاً بعد از kube-prometheus-stack).",
      install: "chart رسمی Helm Grafana.",
      verify:
        "Pod Grafana Ready؛ رمز admin از Secret تولیدشده.",
      example:
        "sketch datasource (UI یا provisioning) به Prometheus in-cluster.",
      test: "port-forward و Explore با کوئری ساده مثل up.",
      mistakes:
        "URL datasource اشتباه، رمز admin قدیمی بعد از upgrade، DNS از Pod Grafana.",
    }),
  },

  opentelemetry: {
    summary:
      "API، SDK و ابزار vendor-neutral برای trace، metric و log.",
    problem:
      "instrumentation جدا برای هر vendor شما را lock-in می‌کند.",
    whyItExists:
      "vendorها API tracing/metrics خود را داشتند — OpenTelemetry SDK و pipeline collector vendor-neutral برای export به Prometheus، Jaeger و غیره.",
    analogy:
      "OpenTelemetry آداپتور برق جهانی است: اپ OTel صحبت می‌کند؛ collector پلاگ (OTLP) را به پریز backend تبدیل می‌کند.",
    howItWorks: [
      "SDK زبان trace، metric و log با context propagation مشترک می‌سازد.",
      "Collector OTLP (gRPC/HTTP) می‌گیرد و با receiver/processor/exporter پردازش می‌کند.",
      "در Kubernetes collector به‌صورت Deployment یا DaemonSet (agent vs gateway).",
      "auto-instrumentation (مثلاً operator) بدون rewrite کامل SDK inject می‌کند.",
    ],
    levels: {
      beginner:
        "chart collector، نمونه OTLP و span در backend (Jaeger/Tempo).",
      intermediate:
        "pipeline با batch/memory limit، tail sampling و چند exporter؛ W3C tracecontext بین Service.",
      advanced:
        "semantic convention استاندارد، collector HA، mTLS OTLP و کنترل cardinality.",
    },
    useWhen: [
      "instrumentation قابل‌حمل بین backendها می‌خواهید",
      "trace + metric + log در یک ecosystem",
    ],
    avoidWhen: [
      "agent تک‌vendor اجباری است و portability مهم نیست",
    ],
    placementBlurb: "Collector Deployment/DaemonSet + instrumentation اپ",
    alternatives: {
      prometheus:
        "Prometheus backend متریک است؛ OTel نحوه تولید telemetry portable است.",
    },
    implement: stdImpl({
      prereq:
        "Helm 3؛ انتخاب توپولوژی Deployment در برابر DaemonSet برای collector.",
      install: "chart Helm OpenTelemetry Collector.",
      verify: "Pod collector Ready؛ پورت Service OTLP publish شده.",
      example:
        "sketch config collector: OTLP in و export OTLP به backend.",
      test: "span دیباگ با telemetrygen یا اپ instrumented.",
      mistakes:
        "OTEL_EXPORTER_OTLP_ENDPOINT اشتباه، exporter misconfig، یا sampling صفر.",
    }),
  },

  "fluent-bit": {
    summary:
      "agent telemetry سبک برای log (و بیشتر) روی Nodeهای Kubernetes.",
    problem:
      "log کانتینر روی Node به shipper کوچک و قابل‌اعتماد به backend نیاز دارد.",
    whyItExists:
      "اپ log روی stdout و فایل می‌دهند — Fluent Bit processor و forwarder سبک برای Elasticsearch، Loki، CloudWatch و ….",
    analogy:
      "Fluent Bit مرتب‌کننده پست روی هر خیابان (Node) است: log line را جمع، metadata می‌زند و به مرکز (backend) می‌فرستد.",
    howItWorks: [
      "Fluent Bit DaemonSet از /var/log/containers روی Node log می‌خواند.",
      "input tail؛ filter metadata Kubernetes؛ output forward.",
      "فیلتر Kubernetes از API pod/namespace label enrich می‌کند.",
      "در ستون observability کنار metric/trace تکمیل می‌کند.",
    ],
    levels: {
      beginner:
        "chart Helm، DaemonSet Running، log JSON با فیلد kubernetes.* در output.",
      intermediate:
        "parser سفارشی، multiline، throttle namespace پرسروصدا؛ RBAC ServiceAccount.",
      advanced:
        "فیلتر WASM/Lua، backpressure و dual-ship؛ همبستگی log با OTel trace.",
    },
    useWhen: [
      "agent log سبک روی Node می‌خواهید",
      "جمع‌آوری DaemonSet log کانتینر",
    ],
    avoidWhen: ["agent logging managed پلتفرم از قبل اجباری است"],
    placementBlurb: "DaemonSet روی هر Node برای خواندن log کانتینر",
    alternatives: {
      opentelemetry:
        "OTel Collector هم log می‌گیرد؛ Fluent Bit روی shipping کارآمد Node تخصص دارد.",
    },
    implement: stdImpl({
      prereq: "Helm 3؛ endpoint و credential backend خروجی.",
      install: "chart رسمی Fluent Bit به‌صورت DaemonSet.",
      verify: "یک Pod Fluent Bit per Node، Running.",
      example: "sketch config: input tail و output stdout برای smoke test.",
      test: "از Pod اپ log بنویسید و stdout/backend Fluent Bit را ببینید.",
      mistakes:
        "mount hostPath برای /var/log/containers، parser CRI اشتباه، auth backend.",
    }),
  },

  "argo-cd": {
    summary: "تحویل مداوم declarative و GitOps برای Kubernetes.",
    problem:
      "kubectl apply دستی از آنچه در Git review شده drift می‌کند.",
    whyItExists:
      "kubectl apply از لپ‌تاپ scale نمی‌شود — Argo CD مداوم Git را با کلاستر reconcile می‌کند تا تغییر auditable باشد.",
    analogy:
      "Argo CD ترموستات وصل به blueprint در Git است: وقتی کلاستر از نقشه drift کند، تا هم‌خوانی گرم/سرد می‌کند.",
    howItWorks: [
      "Application CR به repo path و cluster/namespace هدف اشاره می‌کند.",
      "application-controller منابع live را با manifest Git مقایسه می‌کند.",
      "repo-server Git را clone و Helm/Kustomize/jsonnet render می‌کند.",
      "UI و CLI وضعیت sync، diff و health را نشان می‌دهند.",
    ],
    levels: {
      beginner:
        "نصب Argo CD، UI با port-forward، sync مثال guestbook؛ Synced/Healthy/OutOfSync.",
      intermediate:
        "AppProject، RBAC، چند source و sync پیشرفته؛ secret با External Secrets/SOPS نه Git plain.",
      advanced:
        "ApplicationSet، multi-cluster، sync wave و policy OPA؛ DR و bootstrap repo.",
    },
    useWhen: [
      "Git باید source of truth وضعیت کلاستر باشد",
      "UI و UX GitOps قوی Kubernetes می‌خواهید",
    ],
    avoidWhen: [
      "deploy push-based CI اجباری است و reconcile GitOps ممنوع",
    ],
    placementBlurb: "Deployment در argocd ns؛ Git → API server",
    alternatives: {
      helm: "Helm release بسته‌بندی می‌کند؛ Argo CD chart Helm را از Git sync می‌کند.",
    },
    implement: stdImpl({
      prereq:
        "دسترسی admin برای نصب در namespace argocd؛ repo Git با manifest.",
      install: "manifest نصب stable رسمی در namespace argocd.",
      verify: "همه Deploymentهای argocd Available.",
      example: "Application به مثال guestbook رسمی.",
      test: "Application apply و تأیید Synced/Healthy.",
      mistakes:
        "RBAC مقصد، credential repo خصوصی، یا sync دستی بدون Git.",
    }),
  },

  helm: {
    summary: "package manager برای Kubernetes.",
    problem:
      "YAML خام برای اپ پیچیده سخت version، share و configure می‌شود.",
    whyItExists:
      "YAML پراکنده reuse سخت است — Helm manifest را chart نسخه‌دار با values template و release first-class می‌کند.",
    analogy:
      "Helm مثل مبل IKEA است: chart دفترچه و قطعات؛ values.yaml رنگ/اندازه؛ helm install قفسه را روی کلاستر می‌سازد.",
    howItWorks: [
      "helm install/upgrade template chart را با values render و به API می‌فرستد.",
      "metadata release در Secret (Helm 3) با label release ذخیره می‌شود.",
      "chart در repo HTTP یا OCI؛ helm repo add/update index می‌گیرد.",
      "helm template بدون apply برای CI render محلی.",
    ],
    levels: {
      beginner:
        "Helm 3 نصب، repo add، helm install demo؛ list، status، uninstall.",
      intermediate:
        "نوشتن chart، dependency، helm template و --atomic در CI.",
      advanced: "OCI registry، helmfile، schema values و GitOps به‌جای CLI ad-hoc.",
    },
    useWhen: [
      "اپ Kubernetes پارامتrizه را توزیع یا نصب می‌کنید",
      "فرمت packaging مشترک نیاز دارید",
    ],
    avoidWhen: ["یک manifest ساده plain کافی است"],
    placementBlurb: "CLI به API server؛ Secret release در namespace",
    alternatives: {
      "argo-cd":
        "Argo CD مداوم از Git sync می‌کند؛ Helm اغلب فرمت packaging است که render می‌شود.",
    },
    implement: stdImpl(
      {
        prereq: "context kubectl به کلاستر؛ Helm 3.x محلی.",
        install:
          "نصب CLI Helm (اسکript رسمی یا package manager).",
        verify: "Helm به کلاستر وصل است؛ releaseها list می‌شوند.",
        example:
          "helm install chart podinfo از repo Stefan Prodan.",
        test: "helm status و kubectl deploy/svc با label instance.",
        mistakes:
          "مستندات Helm 2/Tiller؛ typo values؛ فراموش helm repo update.",
      },
      { install: "نصب Helm (client)" },
    ),
  },

  "cert-manager": {
    summary: "خودکارسازی lifecycle گواهی X.509 در Kubernetes.",
    problem: "صدور و تمدید دستی گواهی outage می‌آورد.",
    whyItExists:
      "گواهی TLS منقضی می‌شود و دستی scale نمی‌شود — cert-manager درخواست، تمدید و Secret Kubernetes را automate می‌کند.",
    analogy:
      "cert-manager renewer خودکار برای درهاست: Certificate CR سفارش می‌دهد؛ Issuer با Let's Encrypt یا CA صحبت می‌کند؛ Secret کلید را نگه می‌دارد.",
    howItWorks: [
      "Certificate CR به Issuer/ClusterIssuer و dnsNames اشاره می‌کند.",
      "controller CertificateRequest و Order/Challenge برای ACME HTTP-01 یا DNS-01.",
      "پس از validation tls.crt/tls.key در Secret برای Ingress/Gateway.",
      "webhook resource cert-manager را روی create/update validate می‌کند.",
    ],
    levels: {
      beginner:
        "نصب cert-manager، ClusterIssuer staging Let's Encrypt، Certificate تست.",
      intermediate:
        "DNS-01 با cloud DNS، issuer per env و متریک expiry.",
      advanced: "CA خصوصی، ACME EAB، SPIFFE/SPIRE و hardening webhook.",
    },
    useWhen: [
      "workload Kubernetes به گواهی TLS خودکار نیاز دارد",
      "صدور Let's Encrypt یا CA داخلی باید declarative باشد",
    ],
    avoidWhen: [
      "گواهی کاملاً خارج از کلاستر manage می‌شود و نیاز in-cluster نیست",
    ],
    placementBlurb: "controller + CRD + webhook در cert-manager ns",
    alternatives: {},
    implement: stdImpl({
      prereq:
        "Helm 3؛ مجوز CRD و ValidatingWebhookConfiguration.",
      install: "chart Jetstack cert-manager با crds.enabled=true.",
      verify: "controller، webhook و cainjector Ready.",
      example: "ClusterIssuer self-signed و Certificate برای لاب.",
      test: "Certificate Ready؛ Secret TLS پر شده.",
      mistakes:
        "HTTP-01 بدون reachability، challenge گیرکرده، یا webhook down.",
    }),
  },

  falco: {
    summary: "موتور detection امنیت runtime cloud-native.",
    problem:
      "رفتار غیرعادی داخل کانتینر بدون سیگنال runtime دیده نمی‌شود.",
    whyItExists:
      "compliance و breach detection به دید kernel-level نیاز دارد — Falco syscall و audit Kubernetes را با rule detect می‌کند.",
    analogy:
      "Falco دوربین امنیتی با rule حرکت است: syscall (حرکت) را می‌بیند و در match rule هشدار می‌دهد.",
    howItWorks: [
      "DaemonSet Falco module kernel یا probe eBPF برای syscall load می‌کند.",
      "YAML rule شرط (container، binary، فیلد audit k8s) تعریف می‌کند.",
      "alert به stdout، gRPC یا exporter برای SIEM.",
      "پلاگین k8saudit اختیاری audit log Kubernetes.",
    ],
    levels: {
      beginner:
        "Helm Falco، DaemonSet Running، alert در log بعد از trigger امن لاب.",
      intermediate:
        "tune rule، macro برای noise کمتر، forward JSON به Loki/Elasticsearch.",
      advanced:
        "plugin سفارشی، Falcosidekick response و audit policy؛ benchmark overhead.",
    },
    useWhen: [
      "detection runtime و rule syscall در کلاستر",
      "alert امنیتی بدون تغییر کد اپ",
    ],
    avoidWhen: [
      "فقط admission/policy کافی است و runtime detection لازم نیست",
    ],
    placementBlurb: "DaemonSet رویداد kernel/syscall روی هر Node",
    alternatives: {},
    implement: stdImpl({
      prereq:
        "Helm 3؛ Nodeها probe eBPF/modern Falco را allow کنند (DaemonSet privileged).",
      install: "chart رسمی Falco.",
      verify: "DaemonSet Ready؛ log agent موتور rule را نشان دهد.",
      example:
        "trigger امن در لاب (shell در کانتینر) برای rule شناخته‌شده.",
      test: "log Falco بعد از trigger برای alert.",
      mistakes:
        "probe/driver load نشده، rule پرسروصدا، انتظار block (Falco detect می‌کند).",
    }),
  },

  kyverno: {
    summary:
      "مدیریت policy بومی Kubernetes با validate/mutate/generate.",
    problem: "policy کلاستر باید بدون یادگیری Rego قابل بیان باشد.",
    whyItExists:
      "فراتر از RBAC به guardrail نیاز است — Kyverno با policy CRD validate، mutate و generate می‌کند.",
    analogy:
      "Kyverno نگهبان با چک‌لیست در در API است: هر create/update باید ClusterPolicy را پاس کند قبل از etcd.",
    howItWorks: [
      "webhook admission Kyverno create/update/delete را intercept می‌کند.",
      "ClusterPolicy و Policy match، validate، mutate و generate تعریف می‌کنند.",
      "اسکن background اختیاری resource موجود را audit می‌کند.",
      "YAML آشنا به‌جای Rego (در contrast با OPA Gatekeeper).",
    ],
    levels: {
      beginner:
        "نصب Kyverno، policy require-label با Enforce؛ kubectl create رد شود.",
      intermediate:
        "mutate (label)، generate NetworkPolicy، verifyImages.",
      advanced: "JMESPath، CEL، reporting و multi-cluster policy.",
    },
    useWhen: [
      "policy admission Kubernetes با ergonomics YAML",
      "generate/mutate resource بخشی از policy",
    ],
    avoidWhen: [
      "موتور policy یکسان far خارج Kubernetes لازم است",
    ],
    placementBlurb: "کنترلر admission + گزارش در kyverno ns",
    alternatives: {
      falco:
        "Falco رویداد runtime را detect می‌کند؛ Kyverno آبجکت Kubernetes در admit-time را govern می‌کند.",
    },
    implement: stdImpl({
      prereq: "Helm 3؛ مجوز webhook admission و CRD.",
      install: "chart رسمی Kyverno.",
      verify: "Deployment Kyverno Ready؛ webhook ثبت شده.",
      example: "ClusterPolicy که label owner روی Deployment اجبار کند.",
      test: "Deployment بدون owner رد؛ با label موفق.",
      mistakes:
        "validationFailureAction Audit به‌جای Enforce، match اشتباه، webhook timeout.",
    }),
  },

  rook: {
    summary:
      "ارکستر storage cloud-native — معمولاً Ceph روی Kubernetes.",
    problem:
      "اپ stateful به block/file/object storage خودکار و resilient in-cluster نیاز دارد.",
    whyItExists:
      "workload stateful به storage پایدار نیاز دارد — Rook Ceph را داخل Kubernetes operate می‌کند و با CSI به PVC وصل می‌کند.",
    analogy:
      "Rook سرکارگر storage است: crew Ceph (MON/OSD) روی Node می‌گیرد و StorageClass منوی سفارش دیسک به Kubernetes می‌دهد.",
    howItWorks: [
      "Deployment rook-operator CephCluster و CR مرتبط را watch می‌کند.",
      "MON quorum metadata؛ OSD داده روی device.",
      "Rook plugin CSI Ceph را برای PVC deploy می‌کند.",
      "pool و StorageClass volume Kubernetes را به pool Ceph map می‌کنند.",
    ],
    levels: {
      beginner:
        "operator Rook، CephCluster لاب، PVC از StorageClass ceph-block.",
      intermediate:
        "فیلتر device، replication size و upgrade؛ health ceph و resource MON/OSD.",
      advanced:
        "object bucket OBCS، failover چندکلاستر، encryption و tune bluestore.",
    },
    useWhen: [
      "storage software-defined self-managed روی Kubernetes",
      "block، file و object از یک cluster Ceph",
    ],
    avoidWhen: [
      "دیسک managed cloud ساده‌تر و کافی است",
      "تیم نمی‌تواند Ceph operate کند",
    ],
    placementBlurb: "operator + mon/OSD Ceph روی Node + CSI provisioner",
    alternatives: {},
    implement: stdImpl({
      prereq:
        "Node با disk خالی یا raw device طبق doc Rook؛ کلاستر Kubernetes.",
      install: "manifest operator و CRD نسخه‌دار Rook.",
      verify: "Pod operator در rook-ceph Running.",
      example:
        "CephCluster لاب (cluster.yaml متناسب با دیسک محیط).",
      test: "PVC با StorageClass Rook و mount در Pod.",
      mistakes:
        "device اشتباه، MON/OSD resource کم، یا HEALTH_ERR بدون بررسی ceph status.",
    }),
  },
};
