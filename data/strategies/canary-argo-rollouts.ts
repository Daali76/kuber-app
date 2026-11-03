import type { Strategy } from "@/lib/types";
import {
  basicLab,
  comp,
  conn,
  labStep,
  q,
  troubleshoot,
} from "./_helpers";

export const canaryArgoRollouts: Strategy = {
  id: "canary-argo-rollouts",
  name: {
    en: "Canary (Argo Rollouts)",
    fa: "Canary (Argo Rollouts)",
  },
  category: "rollouts",
  summary: {
    en: "Progressive delivery with a Rollout CR: weighted steps, pauses, and AnalysisRuns before full promotion.",
    fa: "تحویل تدریجی با Rollout CR: گام‌های وزنی، pause و AnalysisRun قبل از promotion کامل.",
  },
  whyItExists: {
    en: "RollingUpdate cannot shift traffic by percentage or gate promotion on metrics automatically.",
    fa: "RollingUpdate نمی‌تواند ترافیک را درصدی جابه‌جا کند یا promotion را خودکار با metric قفل کند.",
  },
  analogy: {
    en: "Letting a small group taste the new recipe before the whole restaurant switches menus.",
    fa: "مثل اینکه گروه کوچکی اول غذای جدید را امتحان کند، بعد منوی کل رستوران عوض شود.",
  },
  howItWorks: [
    {
      en: "Argo Rollouts controller watches Rollout objects (similar to Deployment) and manages stable/canary ReplicaSets.",
      fa: "کنترلر Argo Rollouts، Rollout (شبیه Deployment) را می‌بیند و ReplicaSetهای stable و canary را مدیریت می‌کند.",
    },
    {
      en: "Canary steps use setWeight, pause, and analysis — traffic routing depends on your router (Service replica weights, Ingress, Istio, etc.).",
      fa: "گام‌های canary از setWeight، pause و analysis استفاده می‌کنند؛ مسیریابی ترافیک به router شما بستگی دارد (وزن replica در Service، Ingress، Istio و غیره).",
    },
    {
      en: "AnalysisTemplate defines metric queries; AnalysisRun evaluates them during a step.",
      fa: "AnalysisTemplate کوئری metric تعریف می‌کند؛ AnalysisRun در یک گام آن‌ها را ارزیابی می‌کند.",
    },
    {
      en: "Stable and canary Services (or a traffic router) send production traffic to the right Pod sets.",
      fa: "Serviceهای stable و canary (یا traffic router) ترافیک production را به Podهای درست می‌فرستند.",
    },
  ],
  useWhen: [
    {
      en: "You need metric-gated, pausable percentage rollouts",
      fa: "به rollout درصدی با pause و دروازهٔ metric نیاز دارید",
    },
    {
      en: "You already run or can install the rollouts controller",
      fa: "کنترلر rollouts را دارید یا می‌توانید نصب کنید",
    },
  ],
  avoidWhen: [
    {
      en: "Built-in RollingUpdate is enough and you have no traffic router",
      fa: "RollingUpdate بومی کافی است و traffic router ندارید",
    },
    {
      en: "You cannot operate CRDs and an extra controller",
      fa: "CRD و کنترلر اضافه را نمی‌توانید نگه دارید",
    },
  ],
  docsUrl: "https://argo-rollouts.readthedocs.io/en/stable/features/canary/",
  relatedToolIds: ["kubernetes", "prometheus"],
  relatedStrategyIds: ["blue-green-argo-rollouts", "rolling-update", "compare-strategies"],
  placementBlurb: {
    en: "Rollouts controller in argo-rollouts namespace; Rollout + stable/canary RS + Services in app namespace",
    fa: "کنترلر Rollouts در namespace مربوطه؛ Rollout و RSهای stable/canary و Serviceها در namespace اپ",
  },
  interactive: "canary-traffic",
  diagram: {
    components: [
      comp({
        id: "controller",
        label: "Rollouts controller",
        zone: "control-plane",
        objectType: "Operator",
        highlight: true,
        description: "Reconciles Rollout CRs; advances canary steps and AnalysisRuns.",
        whyThere: "Deployment controller cannot do weighted canary.",
      }),
      comp({
        id: "rollout",
        label: "Rollout CR",
        zone: "namespace",
        objectType: "CRD",
        highlight: true,
        description: "Declares canary strategy, steps, and analysis references.",
        whyThere: "Desired progressive delivery spec.",
      }),
      comp({
        id: "rs-stable",
        label: "Stable ReplicaSet",
        zone: "namespace",
        objectType: "Deployment",
        highlight: true,
        description: "Currently promoted revision receiving most traffic.",
        whyThere: "Safe baseline during canary.",
      }),
      comp({
        id: "rs-canary",
        label: "Canary ReplicaSet",
        zone: "namespace",
        objectType: "Deployment",
        highlight: true,
        description: "Candidate revision scaled per setWeight.",
        whyThere: "Exercises new version under partial load.",
      }),
      comp({
        id: "svc-stable",
        label: "stable Service",
        zone: "namespace",
        objectType: "Service",
        highlight: true,
        description: "Selects stable Pods; weight depends on router mode.",
        whyThere: "Production traffic anchor.",
      }),
      comp({
        id: "svc-canary",
        label: "canary Service",
        zone: "namespace",
        objectType: "Service",
        highlight: true,
        description: "Selects canary Pods; may share selector tricks or separate labels.",
        whyThere: "Isolates canary endpoints for routing.",
      }),
      comp({
        id: "router-note",
        label: "Traffic router",
        zone: "external",
        objectType: "External",
        highlight: false,
        description: "Ingress/Istio/ALB or Service-level replica weighting — not built into Rollout alone.",
        whyThere: "Actual split is router-specific.",
      }),
      comp({
        id: "analysis-tmpl",
        label: "AnalysisTemplate",
        zone: "namespace",
        objectType: "CRD",
        highlight: true,
        description: "Prometheus (or other) metric queries for success criteria.",
        whyThere: "Automated promotion gate.",
      }),
    ],
    connections: [
      conn("c-ro", "controller", "rollout", "reconcile"),
      conn("ro-rs1", "rollout", "rs-stable", "stable RS"),
      conn("ro-rs2", "rollout", "rs-canary", "canary RS"),
      conn("s1-p", "svc-stable", "rs-stable", "select"),
      conn("s2-p", "svc-canary", "rs-canary", "select"),
      conn("ro-at", "rollout", "analysis-tmpl", "analysis ref"),
      conn("router-split", "router-note", "svc-stable", "weight split"),
      conn("router-canary", "router-note", "svc-canary", "weight split"),
    ],
  },
  flows: [
    {
      id: "canary-success",
      title: {
        en: "Canary success (20 → pause → analysis → 50 → 100)",
        fa: "موفقیت canary (۲۰ → pause → analysis → ۵۰ → ۱۰۰)",
      },
      steps: [
        {
          caption: {
            en: "Rollout starts; setWeight 20 sends partial traffic to canary RS.",
            fa: "Rollout شروع می‌شود؛ setWeight ۲۰ بخشی از ترافیک را به RS canary می‌دهد.",
          },
          componentIds: ["rollout", "rs-canary", "svc-canary", "router-note"],
          connectionIds: ["ro-rs2", "router-canary"],
        },
        {
          caption: {
            en: "pause step waits for manual promote or duration.",
            fa: "گام pause تا promote دستی یا مدت مشخص صبر می‌کند.",
          },
          componentIds: ["rollout", "controller"],
          connectionIds: ["c-ro"],
        },
        {
          caption: {
            en: "analysis step runs AnalysisRun against AnalysisTemplate metrics.",
            fa: "گام analysis، AnalysisRun را با metricهای AnalysisTemplate اجرا می‌کند.",
          },
          componentIds: ["analysis-tmpl", "rollout"],
          connectionIds: ["ro-at"],
        },
        {
          caption: {
            en: "setWeight 50, then 100; stable RS becomes the new revision.",
            fa: "setWeight ۵۰ و بعد ۱۰۰؛ RS stable revision جدید می‌شود.",
          },
          componentIds: ["rs-stable", "rs-canary", "svc-stable"],
          connectionIds: ["ro-rs1", "s1-p"],
        },
      ],
    },
  ],
  rollbackFlows: [
    {
      id: "canary-abort",
      title: {
        en: "Abort / failed analysis rollback",
        fa: "abort / شکست analysis و rollback",
      },
      steps: [
        {
          caption: {
            en: "AnalysisRun fails or operator runs kubectl argo rollouts abort.",
            fa: "AnalysisRun fail می‌شود یا اپراتور kubectl argo rollouts abort می‌زند.",
          },
          componentIds: ["rollout", "analysis-tmpl", "controller"],
        },
        {
          caption: {
            en: "Controller scales canary RS down and restores stable as full traffic target.",
            fa: "کنترلر RS canary را پایین می‌آورد و stable را مقصد کامل ترافیک برمی‌گرداند.",
          },
          componentIds: ["rs-stable", "rs-canary", "svc-stable"],
          connectionIds: ["ro-rs1", "s1-p"],
        },
      ],
    },
  ],
  implement: [
    {
      id: "install",
      title: {
        en: "Install the rollouts controller",
        fa: "نصب کنترلر rollouts",
      },
      description: {
        en: "Official release manifest from the argoproj/argo-rollouts GitHub releases page.",
        fa: "manifest رسمی از صفحهٔ release در GitHub پروژهٔ argoproj/argo-rollouts.",
      },
      diagramComponentIds: ["controller"],
      code: {
        language: "bash",
        title: "install.yaml",
        code: `kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml`,
      },
    },
    {
      id: "plugin",
      title: {
        en: "kubectl argo rollouts plugin",
        fa: "افزونهٔ kubectl argo rollouts",
      },
      description: {
        en: "get/watch show status; promote continues a paused roll; abort rolls back the canary.",
        fa: "get/watch وضعیت را نشان می‌دهد؛ promote roll متوقف را ادامه می‌دهد؛ abort canary را برمی‌گرداند.",
      },
      diagramComponentIds: ["rollout", "controller"],
      code: {
        language: "bash",
        title: "plugin commands",
        code: `kubectl argo rollouts get rollout demo -n default
kubectl argo rollouts watch rollout demo -n default
kubectl argo rollouts promote rollout demo -n default
kubectl argo rollouts abort rollout demo -n default`,
      },
    },
    {
      id: "rollout-yaml",
      title: {
        en: "Rollout with canary steps + AnalysisTemplate",
        fa: "Rollout با گام‌های canary و AnalysisTemplate",
      },
      description: {
        en: "Canary steps and Prometheus analysis pattern from Argo Rollouts documentation (example.com Prometheus address as in docs).",
        fa: "الگوی گام canary و analysis با Prometheus از مستندات Argo Rollouts (آدرس Prometheus مثال example.com طبق docs).",
      },
      diagramComponentIds: ["rollout", "analysis-tmpl", "rs-canary"],
      code: {
        language: "yaml",
        title: "rollout-canary.yaml",
        code: `apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: success-rate
spec:
  args:
    - name: service-name
  metrics:
    - name: success-rate
      interval: 1m
      successCondition: result[0] >= 0.95
      provider:
        prometheus:
          address: http://example.com/prometheus/
          query: |
            sum(rate(
              http_requests_total{service="{{args.service-name}}",status=~"2.*"}[5m]
            )) /
            sum(rate(
              http_requests_total{service="{{args.service-name}}"}[5m]
            ))
---
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: demo
spec:
  replicas: 5
  selector:
    matchLabels:
      app: demo
  template:
    metadata:
      labels:
        app: demo
    spec:
      containers:
        - name: demo
          image: registry.k8s.io/e2e-test-images/agnhost:2.39
          args: ["netexec", "--http-port=8080"]
  strategy:
    canary:
      analysis:
        templates:
          - templateName: success-rate
        args:
          - name: service-name
            value: demo
      steps:
        - setWeight: 20
        - pause: {}
        - analysis:
            templates:
              - templateName: success-rate
            args:
              - name: service-name
                value: demo
        - setWeight: 50
        - pause: { duration: 60 }
        - setWeight: 100`,
      },
    },
  ],
  lab: basicLab(
    [
      labStep(
        "install-ctrl",
        {
          en: "Install rollouts controller (cluster admin)",
          fa: "نصب کنترلر rollouts (نیاز به admin کلاستر)",
        },
        {
          language: "bash",
          title: "install",
          code: `kubectl create namespace argo-rollouts --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml
kubectl -n argo-rollouts get pods`,
        },
        `NAME                                    READY   STATUS    RESTARTS   AGE
argo-rollouts-xxxxx                       1/1     Running   0          30s`,
        {
          en: "Rollouts controller pod becomes Ready in argo-rollouts namespace.",
          fa: "Pod کنترلر Rollouts در namespace مربوطه Ready می‌شود.",
        },
        ["controller"],
      ),
      labStep(
        "apply-rollout",
        {
          en: "Apply Rollout and watch canary progress",
          fa: "اعمال Rollout و تماشای پیشرفت canary",
        },
        {
          language: "bash",
          title: "watch",
          code: `kubectl apply -f rollout-canary.yaml
kubectl argo rollouts get rollout demo
kubectl argo rollouts watch rollout demo`,
        },
        `Name:            demo
Strategy:        Canary
Step:            1/6
SetWeight:       20`,
        {
          en: "CLI shows current step, weight, and pause/analysis state.",
          fa: "CLI گام فعلی، وزن و وضعیت pause/analysis را نشان می‌دهد.",
        },
        ["rollout", "rs-canary"],
      ),
    ],
    {
      prompt: {
        en: "While paused at step 2, run promote once — what changes in the Rollout status?",
        fa: "در pause گام ۲، یک بار promote بزنید — در وضعیت Rollout چه عوض می‌شود؟",
      },
      solution: {
        language: "bash",
        title: "promote",
        code: `kubectl argo rollouts promote rollout demo
kubectl argo rollouts get rollout demo`,
      },
    },
  ),
  quiz: [
    q(
      "cy1",
      {
        en: "Which CRD defines metric queries for a canary gate?",
        fa: "کدام CRD کوئری metric برای دروازهٔ canary تعریف می‌کند؟",
      },
      [
        { en: "AnalysisTemplate", fa: "AnalysisTemplate" },
        { en: "Ingress", fa: "Ingress" },
        { en: "HorizontalPodAutoscaler", fa: "HorizontalPodAutoscaler" },
      ],
      0,
      {
        en: "AnalysisTemplate is referenced by Rollout analysis steps.",
        fa: "AnalysisTemplate در گام‌های analysis داخل Rollout ارجاع داده می‌شود.",
      },
    ),
    q(
      "cy2",
      {
        en: "What does setWeight: 20 mean in a canary Rollout?",
        fa: "setWeight: 20 در Rollout canary یعنی چه؟",
      },
      [
        {
          en: "Target ~20% of traffic/replicas to the canary (per router config)",
          fa: "حدود ۲۰٪ ترافیک/replica به canary (بسته به پیکربندی router)",
        },
        { en: "Delete 20 Pods immediately", fa: "فوری ۲۰ Pod حذف شود" },
        { en: "Set Deployment replicas to 20 always", fa: "همیشه replica Deployment برابر ۲۰" },
      ],
      0,
      {
        en: "Weight is a canary step directive interpreted with your traffic setup.",
        fa: "weight دستور گام canary است که با setup ترافیک شما تفسیر می‌شود.",
      },
    ),
    q(
      "cy3",
      {
        en: "kubectl argo rollouts abort is used when…",
        fa: "kubectl argo rollouts abort وقتی استفاده می‌شود که…",
      },
      [
        {
          en: "You need to stop the canary and revert to stable",
          fa: "canary را متوقف و به stable برگردانید",
        },
        { en: "You want to delete the cluster", fa: "کلاستر را حذف کنید" },
        { en: "You install the controller", fa: "کنترلر را نصب کنید" },
      ],
      0,
      {
        en: "Abort aborts the in-progress rollout strategy.",
        fa: "دستور abort، rollout در حال اجرا را لغو می‌کند.",
      },
    ),
    q(
      "cy4",
      {
        en: "A pause: {} step typically…",
        fa: "گام pause: {} معمولاً…",
      },
      [
        {
          en: "Waits until kubectl argo rollouts promote (or auto if configured)",
          fa: "تا promote با kubectl (یا خودکار اگر تنظیم شده) صبر می‌کند",
        },
        { en: "Skips all analysis forever", fa: "برای همیشه analysis را رد می‌کند" },
        { en: "Sets strategy.type Recreate", fa: "strategy.type را Recreate می‌کند" },
      ],
      0,
      {
        en: "Empty pause is an indefinite hold until promotion.",
        fa: "pause خالی تا promotion نامحدود نگه می‌دارد.",
      },
    ),
    q(
      "cy5",
      {
        en: "Traffic percentage splitting requires…",
        fa: "تقسیم درصدی ترافیک نیاز دارد به…",
      },
      [
        {
          en: "A traffic router (Ingress/Istio/Service weights) — not Rollout alone",
          fa: "traffic router (Ingress/Istio/وزن Service) — نه فقط Rollout",
        },
        { en: "Only changing kube-apiserver flags", fa: "فقط تغییر flagهای kube-apiserver" },
        { en: "Deleting stable Service", fa: "حذف stable Service" },
      ],
      0,
      {
        en: "Rollout orchestrates replicas/steps; routing is environment-specific.",
        fa: "Rollout replica/گام را هماهنگ می‌کند؛ routing به محیط بستگی دارد.",
      },
    ),
  ],
  troubleshooting: [
    troubleshoot(
      "cy-paused",
      {
        en: "Rollout stuck in Paused step; weight unchanged",
        fa: "Rollout در گام Paused گیر کرده؛ وزن عوض نمی‌شود",
      },
      [
        {
          label: {
            en: "Run kubectl argo rollouts promote or set pause duration / auto-promotion",
            fa: "kubectl argo rollouts promote بزنید یا duration/auto-promotion برای pause تنظیم کنید",
          },
          correct: true,
          feedback: {
            en: "Indefinite pause waits for explicit promotion.",
            fa: "pause نامحدود منتظر promote صریح است.",
          },
        },
        {
          label: {
            en: "Delete the Rollout CR only — leave orphaned Pods",
            fa: "فقط Rollout CR را حذف کنید و Pod یتیم بماند",
          },
          correct: false,
          feedback: {
            en: "Use promote/abort CLI or fix the spec.",
            fa: "از promote/abort یا اصلاح spec استفاده کنید.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "status",
          code: `kubectl argo rollouts get rollout demo
kubectl describe rollout demo | sed -n '/Status/,+20p'`,
        },
      ],
      {
        en: "Canary paused waiting for manual promote.",
        fa: "canary برای promote دستی متوقف شده.",
      },
      {
        en: "Promote when ready, or adjust steps to timed pause.",
        fa: "وقتی آماده است promote کنید یا pause زمان‌دار بگذارید.",
      },
    ),
    troubleshoot(
      "cy-analysis-failed",
      {
        en: "AnalysisRun Failed; rollout does not advance",
        fa: "AnalysisRun Failed؛ rollout جلو نمی‌رود",
      },
      [
        {
          label: {
            en: "Check metric query, Prometheus address, and successCondition; abort or fix template",
            fa: "کوئری metric، آدرس Prometheus و successCondition را ببینید؛ abort یا template را درست کنید",
          },
          correct: true,
          feedback: {
            en: "Failed analysis blocks promotion until resolved or aborted.",
            fa: "analysis شکست‌خورده تا رفع یا abort، promotion را می‌بندد.",
          },
        },
        {
          label: {
            en: "Increase setWeight to 100 in kubectl edit pod",
            fa: "setWeight را در kubectl edit pod به ۱۰۰ برسانید",
          },
          correct: false,
          feedback: {
            en: "Edit Rollout/AnalysisTemplate, not random Pods.",
            fa: "Rollout/AnalysisTemplate را ویرایش کنید، نه Pod تصادفی.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "analysis",
          code: `kubectl get analysisrun -l rollouts-pod-template-hash
kubectl describe analysisrun <name>
kubectl argo rollouts abort rollout demo`,
        },
      ],
      {
        en: "Metrics failed successCondition or provider could not reach Prometheus.",
        fa: "metricها successCondition را پاس نکردند یا provider به Prometheus نرسید.",
      },
      {
        en: "Fix template/query; re-run roll or abort to stable.",
        fa: "template/query را درست کنید؛ roll را دوباره اجرا یا abort به stable.",
      },
    ),
    troubleshoot(
      "cy-no-traffic-split",
      {
        en: "setWeight changes but users see no canary traffic",
        fa: "setWeight عوض می‌شود ولی کاربر ترافیک canary نمی‌بیند",
      },
      [
        {
          label: {
            en: "Verify traffic router / Services align with Rollout canaryTrafficRouting config",
            fa: "traffic router و Serviceها با canaryTrafficRouting در Rollout هم‌خوان باشند",
          },
          correct: true,
          feedback: {
            en: "Replica weight alone may not split L7 traffic without a router.",
            fa: "فقط وزن replica بدون router لزوماً L7 را split نمی‌کند.",
          },
        },
        {
          label: {
            en: "Restart etcd to refresh weights",
            fa: "etcd را restart کنید تا وزن‌ها تازه شود",
          },
          correct: false,
          feedback: {
            en: "Diagnose routing layer and Rollout status.",
            fa: "لایهٔ routing و وضعیت Rollout را ببینید.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "routing",
          code: `kubectl argo rollouts get rollout demo --full
kubectl get svc,ingress -l app=demo`,
        },
      ],
      {
        en: "Missing or misconfigured traffic routing for the cluster ingress/mesh.",
        fa: "traffic routing برای ingress/mesh کلاستر نیست یا اشتباه است.",
      },
      {
        en: "Configure documented canaryTrafficRouting for your ingress/mesh or Service weights.",
        fa: "canaryTrafficRouting مستند برای ingress/mesh یا وزن Service را تنظیم کنید.",
      },
    ),
  ],
};
