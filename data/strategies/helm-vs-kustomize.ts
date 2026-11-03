import type { Strategy } from "@/lib/types";
import {
  basicLab,
  comp,
  conn,
  labStep,
  q,
  troubleshoot,
} from "./_helpers";

export const helmVsKustomize: Strategy = {
  id: "helm-vs-kustomize",
  name: {
    en: "Helm vs Kustomize (Argo CD)",
    fa: "Helm در برابر Kustomize (Argo CD)",
  },
  category: "compare",
  summary: {
    en: "Choose packaging (Helm charts/values) vs overlay patching (Kustomize); Argo CD can render either from Git.",
    fa: "بین بسته‌بندی با Helm chart/values و پچ overlay با Kustomize انتخاب کنید؛ Argo CD هر دو را از Git render می‌کند.",
  },
  whyItExists: {
    en: "Teams mix charts from vendors with in-house overlays and need a clear split of responsibilities.",
    fa: "تیم‌ها chart فروشنده را با overlay داخلی قاطی می‌کنند و باید مسئولیت‌ها روشن باشد.",
  },
  analogy: {
    en: "Helm is a boxed meal kit; Kustomize is seasoning the same base recipe per table.",
    fa: "Helm مثل بستهٔ آمادهٔ غذاست؛ Kustomize چاشنی همان دستور پایه برای هر میز است.",
  },
  howItWorks: [
    {
      en: "Helm: chart templates + values → rendered manifests (Argo CD can use Helm as a source type).",
      fa: "Helm: قالب chart به‌علاوهٔ values → manifest (Argo CD می‌تواند منبع Helm داشته باشد).",
    },
    {
      en: "Kustomize: base resources + patches/overlays → rendered manifests (path to a kustomization root).",
      fa: "Kustomize: منابع base به‌علاوهٔ پچ/overlay → manifest (path به ریشهٔ kustomization).",
    },
    {
      en: "Combine when a chart is upstream and you still need last-mile patches — // TODO: confirm current Argo CD support for Helm + Kustomize post-renderer / multiple sources for your version before documenting exact fields.",
      fa: "ترکیب وقتی chart بالادستی است و هنوز پچ آخر لازم است — // TODO: پشتیبانی نسخهٔ فعلی Argo CD برای post-renderer یا multiple sources را قبل از ثبت فیلد دقیق تأیید کنید.",
    },
  ],
  useWhen: [
    {
      en: "Need a decision card for packaging vs overlays in GitOps",
      fa: "برای انتخاب بسته‌بندی در برابر overlay در GitOps به کارت تصمیم نیاز دارید",
    },
  ],
  avoidWhen: [
    {
      en: "You already standardized on one approach with no exceptions",
      fa: "از قبل روی یک رویکرد بدون استثنا استاندارد شده‌اید",
    },
  ],
  docsUrl: "https://argo-cd.readthedocs.io/en/stable/user-guide/tool_detection/",
  relatedToolIds: ["helm", "argo-cd"],
  relatedStrategyIds: ["kustomize-argocd", "argocd-application"],
  placementBlurb: {
    en: "Both render in argocd-repo-server before sync to the API server",
    fa: "هر دو قبل از sync، در argocd-repo-server render می‌شوند",
  },
  diagram: {
    components: [
      comp({
        id: "git",
        label: "Git",
        zone: "external",
        objectType: "External",
        highlight: true,
      }),
      comp({
        id: "helm",
        label: "Helm render",
        zone: "namespace",
        objectType: "CLI",
        highlight: true,
      }),
      comp({
        id: "kust",
        label: "Kustomize render",
        zone: "namespace",
        objectType: "CLI",
        highlight: true,
      }),
      comp({
        id: "repo",
        label: "repo-server",
        zone: "namespace",
        objectType: "Deployment",
        highlight: true,
      }),
      comp({
        id: "api",
        label: "API server",
        zone: "control-plane",
        objectType: "ControlPlane",
        highlight: true,
      }),
    ],
    connections: [
      conn("g-h", "git", "helm", "chart/values"),
      conn("g-k", "git", "kust", "base/overlay"),
      conn("h-r", "helm", "repo", "manifests"),
      conn("k-r", "kust", "repo", "manifests"),
      conn("r-a", "repo", "api", "sync"),
    ],
  },
  beforeAfter: {
    beforeComponentIds: ["git", "helm", "repo", "api"],
    afterComponentIds: ["git", "helm", "kust", "repo", "api"],
  },
  flows: [
    {
      id: "either",
      title: { en: "Either path renders then syncs", fa: "هر مسیر render بعد sync" },
      steps: [
        {
          caption: {
            en: "Git holds chart or kustomization sources.",
            fa: "Git منبع chart یا kustomization را نگه می‌دارد.",
          },
          componentIds: ["git"],
        },
        {
          caption: {
            en: "repo-server renders via Helm or Kustomize.",
            fa: "repo-server با Helm یا Kustomize render می‌کند.",
          },
          componentIds: ["repo", "helm", "kust"],
          connectionIds: ["h-r", "k-r"],
        },
        {
          caption: {
            en: "Application controller syncs live objects through the API server.",
            fa: "application-controller آبجکت‌های live را از مسیر API server هم‌تراز می‌کند.",
          },
          componentIds: ["api", "repo"],
          connectionIds: ["r-a"],
        },
      ],
    },
  ],
  implement: [
    {
      id: "detect",
      title: {
        en: "Let Argo CD detect the tool",
        fa: "اجازه دهید Argo CD ابزار را تشخیص دهد",
      },
      description: {
        en: "Tool detection follows Argo CD user guide (Chart.yaml vs kustomization.yaml in the path).",
        fa: "تشخیص ابزار طبق راهنمای Argo CD است (Chart.yaml در برابر kustomization.yaml در path).",
      },
      diagramComponentIds: ["git", "repo"],
      code: {
        language: "text",
        title: "hints",
        code: `Helm path: contains Chart.yaml (and templates/)
Kustomize path: contains kustomization.yaml / kustomization.yml
# See Argo CD "Tool Detection" docs for precedence and overrides.`,
      },
    },
  ],
  lab: basicLab(
    [
      labStep(
        "detect-files",
        {
          en: "Identify which marker file a path uses",
          fa: "ببینید path از کدام فایل نشانگر استفاده می‌کند",
        },
        {
          language: "bash",
          title: "markers",
          code: `ls Chart.yaml kustomization.yaml kustomization.yml 2>/dev/null || true`,
        },
        `Chart.yaml
# or
kustomization.yaml`,
        {
          en: "Those marker files drive Argo CD tool detection for a source path.",
          fa: "همان فایل‌های نشانگر تشخیص ابزار Argo CD برای path منبع را هدایت می‌کنند.",
        },
        ["git"],
      ),
    ],
    {
      prompt: {
        en: "When would you keep an upstream Helm chart and still want Kustomize-like patches? What should you verify in Argo CD docs first?",
        fa: "چه زمانی chart بالادستی Helm را نگه می‌دارید و هنوز پچ شبیه Kustomize می‌خواهید؟ اول در مستندات Argo CD چه را باید تأیید کنید؟",
      },
      solution: {
        language: "text",
        title: "answer",
        code: `When vendor chart + last-mile cluster policy patches are required.
Verify your Argo CD version’s supported combination mechanism
(multiple sources / post-renderer / etc.) — see TODO in howItWorks.`,
      },
    },
  ),
  quiz: [
    q(
      "hk1",
      {
        en: "Helm’s usual knobs are…",
        fa: "اهرم‌های معمول Helm …",
      },
      [
        { en: "Charts and values", fa: "chart و values" },
        { en: "Only maxSurge", fa: "فقط maxSurge" },
        { en: "Only etcd quotas", fa: "فقط سهمیه etcd" },
      ],
      0,
      {
        en: "Templating + values parameterization.",
        fa: "قالب‌بندی به‌علاوهٔ پارامتر values.",
      },
    ),
    q(
      "hk2",
      {
        en: "Kustomize’s usual knobs are…",
        fa: "اهرم‌های معمول Kustomize …",
      },
      [
        {
          en: "Bases, overlays, patches",
          fa: "base، overlay، پچ",
        },
        { en: "Only setWeight", fa: "فقط setWeight" },
        { en: "Only Service CIDR", fa: "فقط CIDR مربوط به Service" },
      ],
      0,
      {
        en: "Declarative patch model without a separate template language.",
        fa: "مدل پچ declarative بدون زبان قالب جدا.",
      },
    ),
    q(
      "hk3",
      {
        en: "Argo CD renders both tools primarily in…",
        fa: "Argo CD هر دو ابزار را عمدتاً کجا render می‌کند؟",
      },
      [
        { en: "argocd-repo-server", fa: "argocd-repo-server" },
        { en: "kube-proxy", fa: "kube-proxy" },
        { en: "CoreDNS", fa: "CoreDNS" },
      ],
      0,
      {
        en: "Manifest generation is centralized in repo-server.",
        fa: "تولید manifest در repo-server متمرکز است.",
      },
    ),
    q(
      "hk4",
      {
        en: "A directory with Chart.yaml is typically treated as…",
        fa: "پوشه‌ای با Chart.yaml معمولاً به‌عنوان …",
      },
      [
        { en: "A Helm chart source", fa: "منبع Helm chart" },
        { en: "An etcd member", fa: "عضو etcd" },
        { en: "A CNI binary", fa: "باینری CNI" },
      ],
      0,
      {
        en: "Tool detection looks for Chart.yaml.",
        fa: "تشخیص ابزار دنبال Chart.yaml می‌گردد.",
      },
    ),
    q(
      "hk5",
      {
        en: "Before documenting Helm+Kustomize combo fields you should…",
        fa: "قبل از ثبت فیلدهای ترکیب Helm و Kustomize باید …",
      },
      [
        {
          en: "Check your Argo CD version docs (leave TODO if unsure)",
          fa: "مستندات نسخهٔ Argo CD را ببینید (اگر مطمئن نیستید TODO بگذارید)",
        },
        {
          en: "Invent CRD fields",
          fa: "فیلد CRD اختراع کنید",
        },
        {
          en: "Disable the API server",
          fa: "API server را خاموش کنید",
        },
      ],
      0,
      {
        en: "Atlas policy: never invent tool facts.",
        fa: "سیاست اطلس: واقعیت ابزار را اختراع نکنید.",
      },
    ),
  ],
  troubleshooting: [
    troubleshoot(
      "hk-wrong-tool",
      {
        en: "Argo CD uses Helm but the path only has kustomization.yaml",
        fa: "Argo CD از Helm استفاده می‌کند اما path فقط kustomization.yaml دارد",
      },
      [
        {
          label: {
            en: "Inspect source overrides and marker files; fix path or tool explicit config",
            fa: "فایل‌های نشانگر و override منبع را ببینید؛ path یا تنظیم صریح ابزار را درست کنید",
          },
          correct: true,
          feedback: {
            en: "Wrong detection yields empty/failed renders.",
            fa: "تشخیص غلط به render خالی یا شکست‌خورده می‌انجامد.",
          },
        },
        {
          label: {
            en: "Ignore Application status",
            fa: "status مربوط به Application را نادیده بگیرید",
          },
          correct: false,
          feedback: {
            en: "Status explains comparison/sync errors.",
            fa: "status خطای مقایسه/sync را توضیح می‌دهد.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "markers",
          code: `ls Chart.yaml kustomization.yaml 2>/dev/null
kubectl -n argocd describe application <name> | sed -n '/Source/,/Destination/p'`,
        },
      ],
      {
        en: "Tool detection and explicit source config disagree.",
        fa: "تشخیص ابزار و پیکربندی صریح منبع ناسازگارند.",
      },
      {
        en: "Align markers, path, and any explicit source tool settings per docs.",
        fa: "نشانگر، path و تنظیم صریح ابزار را با مستندات هم‌تراز کنید.",
      },
    ),
    troubleshoot(
      "hk-values",
      {
        en: "Helm values in Git ignored",
        fa: "values مربوط به Helm در Git نادیده گرفته شده",
      },
      [
        {
          label: {
            en: "Confirm valueFiles / values in the Application Helm source fields",
            fa: "فیلدهای valueFiles یا values در منبع Helm مربوط به Application را تأیید کنید",
          },
          correct: true,
          feedback: {
            en: "Argo CD must be told which values files to use.",
            fa: "باید به Argo CD بگویید کدام فایل values را استفاده کند.",
          },
        },
        {
          label: {
            en: "Delete the Service account on kube-system",
            fa: "ServiceAccount مربوط به kube-system را حذف کنید",
          },
          correct: false,
          feedback: {
            en: "Unrelated and dangerous.",
            fa: "بی‌ربط و خطرناک.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "app helm",
          code: `kubectl -n argocd get application <name> -o yaml | sed -n '/helm:/,/destination:/p'`,
        },
      ],
      {
        en: "Missing Helm value references in the Application spec.",
        fa: "ارجاع values در مشخصات Application نیست.",
      },
      {
        en: "Set the documented Helm source fields; sync again.",
        fa: "فیلدهای مستند منبع Helm را بگذارید؛ دوباره sync کنید.",
      },
    ),
  ],
};
