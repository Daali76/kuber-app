import type { Strategy } from "@/lib/types";
import {
  basicLab,
  comp,
  conn,
  labStep,
  q,
  troubleshoot,
} from "./_helpers";

export const compareStrategies: Strategy = {
  id: "compare-strategies",
  name: {
    en: "Compare deployment strategies",
    fa: "مقایسهٔ strategyهای deployment",
  },
  category: "compare",
  summary: {
    en: "Side-by-side view of RollingUpdate, Recreate, Canary, and Blue-Green trade-offs.",
    fa: "نمای کنارهم trade-offهای RollingUpdate، Recreate، Canary و Blue-Green.",
  },
  whyItExists: {
    en: "Choosing a strategy affects downtime, cost, rollback speed, and operational complexity.",
    fa: "انتخاب strategy روی downtime، هزینه، سرعت rollback و پیچیدگی عملیاتی اثر می‌گذارد.",
  },
  analogy: {
    en: "Picking a lane closure plan before repaving a highway — speed vs safety vs cost.",
    fa: "مثل انتخاب طرح بستن لاین قبل از آسفالت — سرعت در برابر ایمنی و هزینه.",
  },
  howItWorks: [
    {
      en: "Native Deployment supports RollingUpdate (default) and Recreate only.",
      fa: "Deployment بومی فقط RollingUpdate (پیش‌فرض) و Recreate دارد.",
    },
    {
      en: "Argo Rollouts adds Canary and Blue-Green via Rollout CR and extra controller.",
      fa: "Argo Rollouts با Rollout CR و کنترلر اضافه، Canary و Blue-Green می‌دهد.",
    },
    {
      en: "Compare downtime, extra resources, rollback speed, traffic control, and complexity.",
      fa: "downtime، منابع اضافه، سرعت rollback، کنترل ترافیک و پیچیدگی را مقایسه کنید.",
    },
  ],
  useWhen: [
    {
      en: "Planning how a team should release the next service",
      fa: "برنامه‌ریزی نحوهٔ release سرویس بعدی",
    },
    {
      en: "Explaining trade-offs to stakeholders",
      fa: "توضیح trade-offها برای ذی‌نفعان",
    },
  ],
  avoidWhen: [
    {
      en: "You already standardized one pattern with no exceptions",
      fa: "یک الگو را بدون استثنا استاندارد کرده‌اید",
    },
  ],
  docsUrl:
    "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#strategy",
  relatedStrategyIds: [
    "rolling-update",
    "recreate",
    "canary-argo-rollouts",
    "blue-green-argo-rollouts",
  ],
  placementBlurb: {
    en: "Conceptual — maps to Deployment.strategy or Rollout.strategy",
    fa: "مفهومی — به Deployment.strategy یا Rollout.strategy نگاشت می‌شود",
  },
  interactive: "compare-table",
  compareRows: [
    {
      dimension: { en: "Downtime", fa: "Downtime" },
      rolling: {
        en: "Usually low if readiness passes",
        fa: "معمولاً کم اگر readiness پاس شود",
      },
      recreate: {
        en: "Brief gap with zero Ready Pods",
        fa: "فاصلهٔ کوتاه بدون Pod Ready",
      },
      canary: {
        en: "Low if steps are healthy; gated by analysis",
        fa: "کم اگر گام‌ها سالم باشند؛ با analysis قفل می‌شود",
      },
      blueGreen: {
        en: "Low at cutover instant; preview phase uses extra capacity",
        fa: "در لحظهٔ cutover کم؛ فاز preview منابع اضافه می‌خواهد",
      },
    },
    {
      dimension: { en: "Extra resources", fa: "منابع اضافه" },
      rolling: {
        en: "Up to maxSurge extra Pods",
        fa: "تا maxSurge Pod اضافه",
      },
      recreate: {
        en: "Minimal overlap (none during gap)",
        fa: "هم‌پوشانی کم (در gap هیچ)",
      },
      canary: {
        en: "Canary replicas + router overhead",
        fa: "replicaهای canary + overhead router",
      },
      blueGreen: {
        en: "Full second stack until scale-down",
        fa: "stack دوم کامل تا scale down",
      },
    },
    {
      dimension: { en: "Rollback speed", fa: "سرعت rollback" },
      rolling: {
        en: "kubectl rollout undo — another roll",
        fa: "kubectl rollout undo — roll دیگر",
      },
      recreate: {
        en: "Another Recreate swap (downtime again)",
        fa: "swap دیگر Recreate (دوباره downtime)",
      },
      canary: {
        en: "abort / undo step — fast traffic shift back",
        fa: "abort / undo گام — برگشت سریع ترافیک",
      },
      blueGreen: {
        en: "Abort before promote; after promote, promote old or roll back RS",
        fa: "abort قبل از promote؛ بعد از promote، revision قبلی یا rollback RS",
      },
    },
    {
      dimension: { en: "Traffic control", fa: "کنترل ترافیک" },
      rolling: {
        en: "Ready Pod mix only (no % split)",
        fa: "فقط مخلوط Pod Ready (بدون split درصد)",
      },
      recreate: {
        en: "All-or-nothing cut",
        fa: "برش همه یا هیچ",
      },
      canary: {
        en: "Weighted steps + optional analysis",
        fa: "گام‌های وزنی + analysis اختیاری",
      },
      blueGreen: {
        en: "Two Services; instant switch on promote",
        fa: "دو Service؛ switch آنی با promote",
      },
    },
    {
      dimension: { en: "Complexity", fa: "پیچیدگی" },
      rolling: {
        en: "Low — built-in",
        fa: "کم — داخلی Kubernetes",
      },
      recreate: {
        en: "Low — one field change",
        fa: "کم — یک فیلد",
      },
      canary: {
        en: "High — controller, metrics, router",
        fa: "زیاد — کنترلر، metric، router",
      },
      blueGreen: {
        en: "Medium–high — dual Services, promotion",
        fa: "متوسط تا زیاد — Service دوتایی، promotion",
      },
    },
    {
      dimension: { en: "When to use", fa: "چه وقت استفاده کنیم" },
      rolling: {
        en: "Default stateless apps",
        fa: "اپ بدون state پیش‌فرض",
      },
      recreate: {
        en: "Exclusive single-version apps",
        fa: "اپ تک‌نسخهٔ انحصاری",
      },
      canary: {
        en: "Metric-gated progressive traffic",
        fa: "ترافیک تدریجی با دروازهٔ metric",
      },
      blueGreen: {
        en: "Full preview then instant switch",
        fa: "preview کامل بعد switch آنی",
      },
    },
  ],
  diagram: {
    components: [
      comp({
        id: "native",
        label: "Deployment (native)",
        zone: "namespace",
        objectType: "Deployment",
        highlight: true,
        description: "RollingUpdate or Recreate.",
        whyThere: "Built-in controller.",
      }),
      comp({
        id: "rollouts",
        label: "Rollout (Argo)",
        zone: "namespace",
        objectType: "CRD",
        highlight: true,
        description: "Canary or Blue-Green strategies.",
        whyThere: "Progressive delivery.",
      }),
      comp({
        id: "traffic",
        label: "Traffic / readiness",
        zone: "external",
        objectType: "External",
        highlight: false,
        description: "Service endpoints, ingress, mesh weights.",
        whyThere: "Where users feel the strategy.",
      }),
    ],
    connections: [
      conn("n-t", "native", "traffic", "RS + Service"),
      conn("r-t", "rollouts", "traffic", "steps / Services"),
    ],
  },
  flows: [
    {
      id: "pick-strategy",
      title: {
        en: "Decision flow (high level)",
        fa: "مسیر تصمیم (سطح بالا)",
      },
      steps: [
        {
          caption: {
            en: "Can two versions run at once?",
            fa: "آیا دو نسخه هم‌زمان اجرا می‌شوند؟",
          },
          componentIds: ["native"],
        },
        {
          caption: {
            en: "No → Recreate; Yes → need % traffic or preview?",
            fa: "نه → Recreate؛ بله → split درصد یا preview لازم است؟",
          },
          componentIds: ["native", "rollouts"],
        },
        {
          caption: {
            en: "Default → RollingUpdate; advanced → Rollouts canary/blue-green.",
            fa: "پیش‌فرض → RollingUpdate؛ پیشرفته → canary/blue-green در Rollouts.",
          },
          componentIds: ["rollouts", "traffic"],
          connectionIds: ["r-t"],
        },
      ],
    },
  ],
  implement: [
    {
      id: "explain",
      title: {
        en: "Inspect Deployment strategy fields",
        fa: "بررسی فیلدهای strategy در Deployment",
      },
      description: {
        en: "kubectl explain documents RollingUpdate vs Recreate on Deployment.",
        fa: "kubectl explain تفاوت RollingUpdate و Recreate روی Deployment را نشان می‌دهد.",
      },
      diagramComponentIds: ["native"],
      code: {
        language: "bash",
        title: "kubectl explain",
        code: `kubectl explain deployment.spec.strategy
kubectl explain deployment.spec.strategy.rollingUpdate`,
      },
    },
  ],
  lab: basicLab(
    [
      labStep(
        "explain-strategy",
        {
          en: "Read official field docs for strategy.type",
          fa: "خواندن docs رسمی برای strategy.type",
        },
        {
          language: "bash",
          title: "explain",
          code: `kubectl explain deployment.spec.strategy.type
kubectl explain deployment.spec.strategy.rollingUpdate.maxSurge`,
        },
        `KIND:     Deployment
FIELD:    strategy.type
DESCRIPTION:
  Type of deployment. Can be "Recreate" or "RollingUpdate".`,
        {
          en: "Only Recreate and RollingUpdate exist on native Deployment.",
          fa: "روی Deployment بومی فقط Recreate و RollingUpdate هست.",
        },
        ["native"],
      ),
    ],
    {
      prompt: {
        en: "For an app that cannot run v1 and v2 together, which native strategy fits?",
        fa: "برای اپی که v1 و v2 هم‌زمان نمی‌روند، کدام strategy بومی مناسب است؟",
      },
      solution: {
        language: "bash",
        title: "answer",
        code: `# Recreate — set spec.strategy.type: Recreate on the Deployment`,
      },
    },
  ),
  quiz: [
    q(
      "cmp1",
      {
        en: "Which strategy causes a deliberate zero-endpoint gap?",
        fa: "کدام strategy عمداً فاصلهٔ endpoint صفر می‌سازد؟",
      },
      [
        { en: "Recreate", fa: "Recreate" },
        { en: "RollingUpdate with maxSurge 1", fa: "RollingUpdate با maxSurge 1" },
        { en: "Canary setWeight 10", fa: "Canary با setWeight 10" },
      ],
      0,
      {
        en: "Recreate terminates all old Pods before new ones are Ready.",
        fa: "Recreate همهٔ Pod قدیم را قبل از Ready شدن جدید terminate می‌کند.",
      },
    ),
    q(
      "cmp2",
      {
        en: "Percentage traffic splits are native Deployment features?",
        fa: "split درصدی ترافیک قابلیت بومی Deployment است؟",
      },
      [
        { en: "No — use Rollouts / ingress / mesh", fa: "نه — Rollouts / ingress / mesh" },
        { en: "Yes — via maxUnavailable percent only", fa: "بله — فقط با درصد maxUnavailable" },
        { en: "Yes — via Recreate", fa: "بله — با Recreate" },
      ],
      0,
      {
        en: "Deployment rolls replicas; it does not split L7 traffic by %.",
        fa: "Deployment replica را roll می‌کند؛ L7 را درصدی split نمی‌کند.",
      },
    ),
    q(
      "cmp3",
      {
        en: "Blue-green typically uses more resources than rolling because…",
        fa: "blue-green معمولاً منابع بیشتری از rolling می‌خواهد چون…",
      },
      [
        {
          en: "Full preview stack runs alongside active",
          fa: "stack preview کامل کنار active اجرا می‌شود",
        },
        { en: "It deletes etcd", fa: "etcd را حذف می‌کند" },
        { en: "It disables Services", fa: "Serviceها را خاموش می‌کند" },
      ],
      0,
      {
        en: "Two full replica sets exist until scale-down.",
        fa: "دو ReplicaSet کامل تا scale down وجود دارند.",
      },
    ),
    q(
      "cmp4",
      {
        en: "Fastest rollback during a failed canary is often…",
        fa: "سریع‌ترین rollback وقتی canary fail می‌شود اغلب…",
      },
      [
        { en: "kubectl argo rollouts abort", fa: "kubectl argo rollouts abort" },
        { en: "Delete the namespace", fa: "حذف namespace" },
        { en: "Change Service type to ExternalName only", fa: "فقط type Service را ExternalName کنید" },
      ],
      0,
      {
        en: "Abort reverts canary traffic to stable.",
        fa: "abort ترافیک canary را به stable برمی‌گرداند.",
      },
    ),
    q(
      "cmp5",
      {
        en: "Default Deployment strategy when unset is…",
        fa: "strategy پیش‌فرض Deployment وقتی تنظیم نشده…",
      },
      [
        { en: "RollingUpdate", fa: "RollingUpdate" },
        { en: "Recreate", fa: "Recreate" },
        { en: "BlueGreen", fa: "BlueGreen" },
      ],
      0,
      {
        en: "Kubernetes defaults to RollingUpdate.",
        fa: "Kubernetes پیش‌فرض RollingUpdate است.",
      },
    ),
  ],
  troubleshooting: [
    troubleshoot(
      "cmp-wrong-tool",
      {
        en: "Team wants metric gates but only patched Deployment maxSurge",
        fa: "تیم دروازهٔ metric می‌خواهد ولی فقط maxSurge روی Deployment patch کرده",
      },
      [
        {
          label: {
            en: "Adopt Rollout canary with AnalysisTemplate or external CI gates",
            fa: "Rollout canary با AnalysisTemplate یا gate در CI خارجی",
          },
          correct: true,
          feedback: {
            en: "Deployment has no analysis steps.",
            fa: "Deployment گام analysis ندارد.",
          },
        },
        {
          label: {
            en: "Set strategy.type Recreate for metrics",
            fa: "برای metric، strategy.type را Recreate بگذارید",
          },
          correct: false,
          feedback: {
            en: "Recreate does not add metrics.",
            fa: "Recreate metric اضافه نمی‌کند.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "compare",
          code: `kubectl explain deployment.spec.strategy
kubectl get crd rollouts.argoproj.io`,
        },
      ],
      {
        en: "Requirement needs progressive delivery beyond Deployment.",
        fa: "نیازمندی فراتر از Deployment و progressive delivery می‌خواهد.",
      },
      {
        en: "Install Rollouts and migrate workload to Rollout CR.",
        fa: "Rollouts را نصب و workload را به Rollout CR منتقل کنید.",
      },
    ),
    troubleshoot(
      "cmp-downtime-surprise",
      {
        en: "Expected zero downtime but users saw errors during release",
        fa: "downtime صفر انتظار داشتید ولی در release خطا دیدید",
      },
      [
        {
          label: {
            en: "Check if Recreate or failed readiness caused empty endpoints",
            fa: "ببینید Recreate یا readiness شکست‌خورده endpoint خالی ساخته",
          },
          correct: true,
          feedback: {
            en: "Strategy and probe health drive availability.",
            fa: "strategy و سلامت probe، availability را تعیین می‌کنند.",
          },
        },
        {
          label: {
            en: "Ignore — always user error",
            fa: "نادیده بگیرید — همیشه خطای کاربر است",
          },
          correct: false,
          feedback: {
            en: "Inspect rollout/Rollout events and endpoints.",
            fa: "eventهای rollout/Rollout و endpointها را ببینید.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "endpoints",
          code: `kubectl get deploy -o jsonpath='{.items[0].spec.strategy.type}{"\\n"}'
kubectl get endpoints
kubectl get pods`,
        },
      ],
      {
        en: "Recreate gap or unavailable new Pods during RollingUpdate.",
        fa: "فاصلهٔ Recreate یا Pod جدید unavailable در RollingUpdate.",
      },
      {
        en: "Match strategy to SLO; fix probes or use Rollouts.",
        fa: "strategy را با SLO هم‌تراز کنید؛ probe را درست یا Rollouts بگیرید.",
      },
    ),
  ],
};
