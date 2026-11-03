import type { Strategy } from "@/lib/types";
import {
  basicLab,
  comp,
  conn,
  labStep,
  q,
  troubleshoot,
} from "./_helpers";

export const blueGreenArgoRollouts: Strategy = {
  id: "blue-green-argo-rollouts",
  name: {
    en: "Blue-Green (Argo Rollouts)",
    fa: "Blue-Green (Argo Rollouts)",
  },
  category: "rollouts",
  summary: {
    en: "Run preview (green) alongside active (blue), then switch Service traffic and scale down old revision.",
    fa: "preview (green) کنار active (blue) اجرا می‌شود؛ بعد ترافیک Service عوض و revision قدیم پایین می‌آید.",
  },
  whyItExists: {
    en: "Teams want instant cutover and a full clone to test before switching production traffic.",
    fa: "تیم‌ها برش فوری و clone کامل برای تست قبل از ترافیک production می‌خواهند.",
  },
  analogy: {
    en: "Rehearsing on a duplicate stage, then flipping the auditorium sign to the new show.",
    fa: "مثل تمرین روی صحنهٔ دوم، بعد برگرداندن تابلو سالن به نمایش جدید.",
  },
  howItWorks: [
    {
      en: "Rollout strategy.blueGreen declares activeService and previewService names.",
      fa: "در strategy.blueGreen نام activeService و previewService مشخص می‌شود.",
    },
    {
      en: "New revision Pods register on preview Service; active Service still points at the old stable stack.",
      fa: "Podهای revision جدید روی preview Service می‌آیند؛ active Service هنوز stack stable قدیم را دارد.",
    },
    {
      en: "Promotion switches selector/traffic to preview; optional autoPromotionEnabled skips manual approve.",
      fa: "promotion ترافیک/selector را به preview می‌برد؛ autoPromotionEnabled در صورت true، تأیید دستی را حذف می‌کند.",
    },
    {
      en: "After promotion, scaleDownDelaySeconds (when set) waits before scaling down the old ReplicaSet.",
      fa: "بعد از promotion، scaleDownDelaySeconds (در صورت تنظیم) قبل از scale down کردن ReplicaSet قدیم صبر می‌کند.",
    },
  ],
  useWhen: [
    {
      en: "You need a full duplicate environment slice before cutover",
      fa: "قبل از cutover به یک برش کامل از محیط نیاز دارید",
    },
    {
      en: "Instant switch is OK and you can pay 2× resources briefly",
      fa: "برش آنی OK است و لحظه‌ای منابع دوبرابر دارید",
    },
  ],
  avoidWhen: [
    {
      en: "You cannot afford double Pods for every release",
      fa: "Pod دوبل برای هر release را ندارید",
    },
    {
      en: "Gradual percentage canary fits better",
      fa: "canary درصدی تدریجی مناسب‌تر است",
    },
  ],
  docsUrl: "https://argo-rollouts.readthedocs.io/en/stable/features/bluegreen/",
  relatedToolIds: ["kubernetes"],
  relatedStrategyIds: ["canary-argo-rollouts", "compare-strategies"],
  placementBlurb: {
    en: "Rollout + active/preview Services; preview gets new RS before Service switch",
    fa: "Rollout و Serviceهای active/preview؛ preview قبل از switch، RS جدید می‌گیرد",
  },
  interactive: "blue-green-promote",
  diagram: {
    components: [
      comp({
        id: "controller",
        label: "Rollouts controller",
        zone: "control-plane",
        objectType: "Operator",
        highlight: true,
        description: "Manages blue-green promotion and scale-down timing.",
        whyThere: "Orchestrates Service switch beyond Deployment.",
      }),
      comp({
        id: "rollout",
        label: "Rollout CR",
        zone: "namespace",
        objectType: "CRD",
        highlight: true,
        description: "blueGreen block with activeService, previewService, autoPromotionEnabled.",
        whyThere: "Declares cutover behavior.",
      }),
      comp({
        id: "rs-active",
        label: "Active RS (blue)",
        zone: "namespace",
        objectType: "Deployment",
        highlight: true,
        description: "Currently serving production via active Service.",
        whyThere: "Production baseline.",
      }),
      comp({
        id: "rs-preview",
        label: "Preview RS (green)",
        zone: "namespace",
        objectType: "Deployment",
        highlight: true,
        description: "New revision fully scaled on preview Service.",
        whyThere: "Pre-cutover validation target.",
      }),
      comp({
        id: "svc-active",
        label: "active Service",
        zone: "namespace",
        objectType: "Service",
        highlight: true,
        description: "Production traffic today (blue).",
        whyThere: "Stable user-facing entry.",
      }),
      comp({
        id: "svc-preview",
        label: "preview Service",
        zone: "namespace",
        objectType: "Service",
        highlight: true,
        description: "Test traffic to green before promotion.",
        whyThere: "Safe rehearsal endpoint.",
      }),
    ],
    connections: [
      conn("c-ro", "controller", "rollout", "reconcile"),
      conn("ro-active", "rollout", "rs-active", "active RS"),
      conn("ro-preview", "rollout", "rs-preview", "preview RS"),
      conn("sa", "svc-active", "rs-active", "select"),
      conn("sp", "svc-preview", "rs-preview", "select"),
      conn("promote", "rollout", "svc-active", "promote switch"),
    ],
  },
  flows: [
    {
      id: "bg-success",
      title: {
        en: "Blue-green success (preview → promote → scale down)",
        fa: "موفقیت blue-green (preview → promote → scale down)",
      },
      steps: [
        {
          caption: {
            en: "New revision scales on preview Service; active unchanged.",
            fa: "revision جدید روی preview Service بالا می‌آید؛ active عوض نمی‌شود.",
          },
          componentIds: ["rs-preview", "svc-preview"],
          connectionIds: ["sp", "ro-preview"],
        },
        {
          caption: {
            en: "Tests hit preview; operator promotes or autoPromotionEnabled fires.",
            fa: "تست‌ها preview را می‌زنند؛ اپراتور promote می‌کند یا autoPromotionEnabled فعال می‌شود.",
          },
          componentIds: ["rollout", "svc-active", "svc-preview"],
          connectionIds: ["promote"],
        },
        {
          caption: {
            en: "active Service now selects green; optional scaleDownDelaySeconds waits.",
            fa: "active Service حالا green را انتخاب می‌کند؛ scaleDownDelaySeconds اختیاری صبر می‌کند.",
          },
          componentIds: ["rs-active", "rs-preview", "svc-active"],
          connectionIds: ["sa", "ro-active"],
        },
        {
          caption: {
            en: "Old ReplicaSet scaled down after delay.",
            fa: "ReplicaSet قدیم بعد از delay پایین می‌آید.",
          },
          componentIds: ["rs-active", "controller"],
          connectionIds: ["c-ro"],
        },
      ],
    },
  ],
  rollbackFlows: [
    {
      id: "bg-abort",
      title: {
        en: "Abort before promotion",
        fa: "abort قبل از promotion",
      },
      steps: [
        {
          caption: {
            en: "Preview fails tests; kubectl argo rollouts abort or delete preview stack.",
            fa: "preview در تست fail می‌شود؛ abort یا preview stack حذف می‌شود.",
          },
          componentIds: ["rs-preview", "svc-preview", "rollout"],
        },
        {
          caption: {
            en: "active Service never switched; stable RS remains production.",
            fa: "active Service switch نشده؛ RS stable همان production است.",
          },
          componentIds: ["svc-active", "rs-active"],
          connectionIds: ["sa"],
        },
      ],
    },
  ],
  implement: [
    {
      id: "services",
      title: {
        en: "Active and preview Services",
        fa: "Serviceهای active و preview",
      },
      description: {
        en: "Two Services let you route test vs production traffic during blue-green.",
        fa: "دو Service ترافیک تست و production را در blue-green جدا می‌کنند.",
      },
      diagramComponentIds: ["svc-active", "svc-preview"],
      code: {
        language: "yaml",
        title: "services.yaml",
        code: `apiVersion: v1
kind: Service
metadata:
  name: demo-active
spec:
  selector:
    app: demo
  ports:
    - port: 80
      targetPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: demo-preview
spec:
  selector:
    app: demo
  ports:
    - port: 80
      targetPort: 8080`,
      },
    },
    {
      id: "rollout-bg",
      title: {
        en: "Rollout blueGreen spec",
        fa: "spec blueGreen در Rollout",
      },
      description: {
        en: "activeService and previewService are required; autoPromotionEnabled and scaleDownDelaySeconds per docs.",
        fa: "activeService و previewService الزامی‌اند؛ autoPromotionEnabled و scaleDownDelaySeconds طبق docs.",
      },
      diagramComponentIds: ["rollout", "svc-active", "svc-preview"],
      code: {
        language: "yaml",
        title: "rollout-bluegreen.yaml",
        code: `apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: demo
spec:
  replicas: 3
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
    blueGreen:
      activeService: demo-active
      previewService: demo-preview
      autoPromotionEnabled: false
      scaleDownDelaySeconds: 30`,
      },
    },
    {
      id: "promote-cli",
      title: {
        en: "Promote or abort via CLI",
        fa: "promote یا abort با CLI",
      },
      description: {
        en: "promote switches active to preview; abort drops preview revision.",
        fa: "promote active را به preview وصل می‌کند؛ abort revision preview را کنار می‌گذارد.",
      },
      diagramComponentIds: ["rollout", "controller"],
      code: {
        language: "bash",
        title: "promote / abort",
        code: `kubectl argo rollouts promote rollout demo
kubectl argo rollouts abort rollout demo
kubectl argo rollouts get rollout demo`,
      },
    },
  ],
  lab: basicLab(
    [
      labStep(
        "apply",
        {
          en: "Apply Services and blue-green Rollout",
          fa: "اعمال Serviceها و Rollout blue-green",
        },
        {
          language: "bash",
          title: "apply",
          code: `kubectl apply -f services.yaml
kubectl apply -f rollout-bluegreen.yaml
kubectl argo rollouts get rollout demo`,
        },
        `Strategy:        BlueGreen
Status:          Healthy
Preview:         demo-preview`,
        {
          en: "Preview Service receives the new ReplicaSet while active stays on old revision.",
          fa: "preview Service RS جدید را می‌گیرد و active روی revision قدیم می‌ماند.",
        },
        ["svc-preview", "rs-preview"],
      ),
      labStep(
        "promote",
        {
          en: "Promote after testing preview",
          fa: "بعد از تست preview، promote کنید",
        },
        {
          language: "bash",
          title: "promote",
          code: `kubectl argo rollouts promote rollout demo
kubectl get svc demo-active -o wide`,
        },
        `demo-active   ClusterIP   ...   80/TCP`,
        {
          en: "Active Service selector updates to the promoted revision.",
          fa: "selector روی active Service به revision promote‌شده به‌روز می‌شود.",
        },
        ["svc-active", "promote"],
      ),
    ],
    {
      prompt: {
        en: "Set autoPromotionEnabled: true — what manual step disappears?",
        fa: "autoPromotionEnabled: true — کدام گام دستی حذف می‌شود؟",
      },
      solution: {
        language: "bash",
        title: "patch auto",
        code: `kubectl patch rollout demo --type merge -p '{"spec":{"strategy":{"blueGreen":{"autoPromotionEnabled":true}}}}'`,
      },
    },
  ),
  quiz: [
    q(
      "bg1",
      {
        en: "Which Services does blueGreen require?",
        fa: "blueGreen به کدام Serviceها نیاز دارد؟",
      },
      [
        { en: "activeService and previewService", fa: "activeService و previewService" },
        { en: "Only one ClusterIP Service", fa: "فقط یک Service از نوع ClusterIP" },
        { en: "NodePort only", fa: "فقط NodePort" },
      ],
      0,
      {
        en: "Both names are referenced in the Rollout spec.",
        fa: "هر دو نام در spec Rollout ارجاع داده می‌شوند.",
      },
    ),
    q(
      "bg2",
      {
        en: "Before promotion, production users typically hit…",
        fa: "قبل از promotion، کاربر production معمولاً به…",
      },
      [
        { en: "active Service (blue)", fa: "active Service (blue)" },
        { en: "preview Service only", fa: "فقط preview Service" },
        { en: "kube-apiserver", fa: "kube-apiserver" },
      ],
      0,
      {
        en: "Preview is for tests; active carries live traffic.",
        fa: "preview برای تست است؛ active ترافیک live دارد.",
      },
    ),
    q(
      "bg3",
      {
        en: "autoPromotionEnabled: true means…",
        fa: "autoPromotionEnabled: true یعنی…",
      },
      [
        {
          en: "Rollout promotes automatically when preview is healthy",
          fa: "وقتی preview سالم است Rollout خودکار promote می‌کند",
        },
        { en: "Recreate strategy is used", fa: "از Recreate استفاده می‌شود" },
        { en: "Canary setWeight runs", fa: "setWeight canary اجرا می‌شود" },
      ],
      0,
      {
        en: "Auto promotion skips manual kubectl promote.",
        fa: "promotion خودکار promote دستی را حذف می‌کند.",
      },
    ),
    q(
      "bg4",
      {
        en: "scaleDownDelaySeconds controls…",
        fa: "scaleDownDelaySeconds کنترل می‌کند…",
      },
      [
        {
          en: "Wait time before scaling down the old ReplicaSet after promotion",
          fa: "زمان انتظار قبل از scale down RS قدیم بعد از promotion",
        },
        { en: "Ingress TLS renewal", fa: "تمدید TLS روی Ingress" },
        { en: "etcd snapshot interval", fa: "فاصلهٔ snapshot در etcd" },
      ],
      0,
      {
        en: "Documented blueGreen field delays old RS teardown.",
        fa: "فیلد مستند blueGreen، حذف RS قدیم را به تأخیر می‌اندازد.",
      },
    ),
    q(
      "bg5",
      {
        en: "kubectl argo rollouts abort during preview…",
        fa: "kubectl argo rollouts abort در حین preview…",
      },
      [
        {
          en: "Keeps active on blue; drops failed green attempt",
          fa: "active روی blue می‌ماند؛ green ناموفق کنار گذاشته می‌شود",
        },
        { en: "Deletes the cluster", fa: "کلاستر را حذف می‌کند" },
        { en: "Forces Recreate on Deployment", fa: "Recreate روی Deployment اجبار می‌کند" },
      ],
      0,
      {
        en: "Abort cancels in-progress strategy without switching active.",
        fa: "abort rollout در حال اجرا را بدون switch روی active لغو می‌کند.",
      },
    ),
  ],
  troubleshooting: [
    troubleshoot(
      "bg-no-preview",
      {
        en: "Preview Service has no endpoints after update",
        fa: "بعد از به‌روزرسانی preview Service endpoint ندارد",
      },
      [
        {
          label: {
            en: "Check Rollout status, Pod readiness, and Service selector vs Pod labels",
            fa: "وضعیت Rollout، readiness Pod و selector Service در برابر label Pod را ببینید",
          },
          correct: true,
          feedback: {
            en: "Preview RS must produce Ready Pods matching preview Service.",
            fa: "RS preview باید Pod Ready مطابق preview Service بسازد.",
          },
        },
        {
          label: {
            en: "Promote immediately without Ready Pods",
            fa: "بدون Pod Ready فوراً promote کنید",
          },
          correct: false,
          feedback: {
            en: "Fix Pod startup first.",
            fa: "اول start Pod را درست کنید.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "preview",
          code: `kubectl get endpoints demo-preview
kubectl get pods -l app=demo
kubectl describe rollout demo`,
        },
      ],
      {
        en: "New Pods not Ready or selector mismatch on preview Service.",
        fa: "Pod جدید Ready نیست یا selector preview Service نمی‌خواند.",
      },
      {
        en: "Fix template/probes; verify endpoints on demo-preview.",
        fa: "قالب/probe را درست کنید؛ endpoint روی demo-preview را چک کنید.",
      },
    ),
    troubleshoot(
      "bg-premature-promote",
      {
        en: "Promoted too early; production errors after cutover",
        fa: "زود promote شد؛ بعد از cutover خطا در production",
      },
      [
        {
          label: {
            en: "Use autoPromotionEnabled: false and test via preview Service before promote",
            fa: "autoPromotionEnabled: false بگذارید و قبل از promote از preview Service تست کنید",
          },
          correct: true,
          feedback: {
            en: "Blue-green separates rehearsal from cutover.",
            fa: "blue-green تمرین را از cutover جدا می‌کند.",
          },
        },
        {
          label: {
            en: "Disable readinessProbe to speed promotion",
            fa: "readinessProbe را خاموش کنید تا promote سریع شود",
          },
          correct: false,
          feedback: {
            en: "Weakens safety; fix app and test preview.",
            fa: "ایمنی کم می‌شود؛ اپ را درست و preview را تست کنید.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "rollback",
          code: `kubectl argo rollouts abort rollout demo
kubectl argo rollouts get rollout demo`,
        },
      ],
      {
        en: "Insufficient validation on preview before switching active.",
        fa: "اعتبارسنجی ناکافی روی preview قبل از switch روی active.",
      },
      {
        en: "Abort or roll back; tighten promotion gates and preview tests.",
        fa: "abort یا rollback؛ دروازهٔ promotion و تست preview را سخت‌تر کنید.",
      },
    ),
  ],
};
