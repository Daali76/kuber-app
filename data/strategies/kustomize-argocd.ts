import type { Strategy } from "@/lib/types";
import {
  basicLab,
  comp,
  conn,
  labStep,
  q,
  troubleshoot,
} from "./_helpers";

const baseYaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo
spec:
  replicas: 1
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
          image: my.registry/demo:1.0.0
`;

export const kustomizeArgoCd: Strategy = {
  id: "kustomize-argocd",
  name: {
    en: "Kustomize with Argo CD",
    fa: "Kustomize با Argo CD",
  },
  category: "gitops",
  summary: {
    en: "base/ + overlays render per environment inside argocd-repo-server; each overlay can be its own Application path.",
    fa: "base/ و overlays داخل argocd-repo-server برای هر محیط render می‌شوند؛ هر overlay می‌تواند path یک Application باشد.",
  },
  whyItExists: {
    en: "Teams need environment differences without maintaining fully separate manifest trees.",
    fa: "تیم‌ها تفاوت محیط می‌خواهند؛ بدون نگهداری درخت manifest کاملاً جدا.",
  },
  analogy: {
    en: "One script (base) with sticky notes (overlays) for each stage.",
    fa: "یک متن پایه با یادداشت‌های چسبان برای هر محیط.",
  },
  howItWorks: [
    {
      en: "kustomization.yaml in base lists shared resources.",
      fa: "فایل kustomization.yaml در base منابع مشترک را فهرست می‌کند.",
    },
    {
      en: "Overlays reference the base and apply patches, images, namePrefix, replicas, …",
      fa: "هر overlay به base ارجاع می‌دهد و patch، image، namePrefix، replicas و … را اعمال می‌کند.",
    },
    {
      en: "Argo CD Application source.path points at an overlay; repo-server runs kustomize build.",
      fa: "path منبع Application به overlay می‌خورد؛ repo-server دستور kustomize build را اجرا می‌کند.",
    },
  ],
  useWhen: [
    {
      en: "Environment diffs are patches on a shared base",
      fa: "تفاوت محیط‌ها پچ روی یک base مشترک است",
    },
  ],
  avoidWhen: [
    {
      en: "You only ship a single Helm chart with values and no overlay need",
      fa: "فقط یک Helm chart با values دارید و به overlay نیاز نیست",
    },
  ],
  docsUrl: "https://argo-cd.readthedocs.io/en/stable/user-guide/kustomize/",
  relatedToolIds: ["argo-cd", "helm"],
  relatedStrategyIds: ["helm-vs-kustomize", "argocd-application"],
  placementBlurb: {
    en: "Git base/overlays → argocd-repo-server render → API server",
    fa: "base/overlays در Git → render در argocd-repo-server → API server",
  },
  interactive: "kustomize-diff",
  kustomizeDiffs: [
    {
      id: "dev",
      title: { en: "overlays/dev", fa: "overlays/dev" },
      baseYaml,
      renderedYaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: dev-demo
spec:
  replicas: 1
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
          image: my.registry/demo:1.0.0-dev
`,
      note: {
        en: "Illustrative render: namePrefix dev- + image tag (verify with kubectl kustomize).",
        fa: "نمونهٔ آموزشی: namePrefix برابر dev- و tag مربوط به image (با kubectl kustomize تأیید کنید).",
      },
    },
    {
      id: "prod",
      title: { en: "overlays/prod", fa: "overlays/prod" },
      baseYaml,
      renderedYaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: prod-demo
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
          image: my.registry/demo:1.0.0
`,
      note: {
        en: "Illustrative render: namePrefix prod- + replicas: 3.",
        fa: "نمونهٔ آموزشی: namePrefix برابر prod- و replicas: 3.",
      },
    },
  ],
  diagram: {
    components: [
      comp({
        id: "git",
        label: "Git base/overlays",
        zone: "external",
        objectType: "External",
        highlight: true,
      }),
      comp({
        id: "repo",
        label: "argocd-repo-server",
        zone: "namespace",
        objectType: "Deployment",
        highlight: true,
        description: "Renders Kustomize (and Helm) sources for Argo CD.",
        whyThere: "Manifest generation happens here before sync.",
      }),
      comp({
        id: "app",
        label: "Application",
        zone: "namespace",
        objectType: "CRD",
        highlight: true,
      }),
      comp({
        id: "api",
        label: "API server",
        zone: "control-plane",
        objectType: "ControlPlane",
        highlight: true,
      }),
      comp({
        id: "work",
        label: "Workloads",
        zone: "pod",
        objectType: "Pod",
        highlight: true,
      }),
    ],
    connections: [
      conn("git-repo", "git", "repo", "fetch"),
      conn("app-repo", "app", "repo", "generate"),
      conn("repo-api", "repo", "api", "manifests"),
      conn("api-w", "api", "work", "apply"),
    ],
  },
  flows: [
    {
      id: "render",
      title: { en: "Overlay sync", fa: "sync مربوط به overlay" },
      steps: [
        {
          caption: {
            en: "Application points at overlays/prod (example).",
            fa: "Application به overlays/prod اشاره می‌کند (نمونه).",
          },
          componentIds: ["app", "git"],
        },
        {
          caption: {
            en: "repo-server runs kustomize build for that path.",
            fa: "repo-server برای آن path، kustomize build را اجرا می‌کند.",
          },
          componentIds: ["repo", "git"],
          connectionIds: ["git-repo", "app-repo"],
        },
        {
          caption: {
            en: "Rendered objects are applied via the API server.",
            fa: "آبجکت‌های renderشده از مسیر API server اعمال می‌شوند.",
          },
          componentIds: ["api", "work"],
          connectionIds: ["repo-api", "api-w"],
        },
      ],
    },
  ],
  implement: [
    {
      id: "tree",
      title: { en: "Folder layout", fa: "چیدمان پوشه" },
      description: {
        en: "Classic base + overlays layout used with Argo CD Kustomize apps.",
        fa: "چیدمان کلاسیک base و overlays برای اپ‌های Kustomize در Argo CD.",
      },
      diagramComponentIds: ["git"],
      code: {
        language: "bash",
        title: "tree",
        code: `base/
  deployment.yaml
  kustomization.yaml
overlays/
  dev/
    kustomization.yaml
  staging/
    kustomization.yaml
  prod/
    kustomization.yaml`,
      },
    },
    {
      id: "overlay",
      title: { en: "Example prod overlay", fa: "نمونه overlay برای prod" },
      description: {
        en: "namePrefix, replicas, and images are common Kustomize fields — confirm against kubectl kustomize help for your kubectl version.",
        fa: "فیلدهای namePrefix و replicas و images رایج‌اند — با کمک kubectl kustomize نسخهٔ خودتان تأیید کنید.",
      },
      diagramComponentIds: ["git", "repo"],
      code: {
        language: "yaml",
        title: "overlays/prod/kustomization.yaml",
        code: `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ../../base
namePrefix: prod-
replicas:
  - name: demo
    count: 3
images:
  - name: my.registry/demo
    newTag: "1.0.0"`,
      },
    },
    {
      id: "preview",
      title: { en: "Preview locally", fa: "پیش‌نمایش محلی" },
      description: {
        en: "kubectl kustomize prints the rendered manifests (same idea Argo CD uses server-side).",
        fa: "kubectl kustomize خروجی renderشده را چاپ می‌کند (ایدهٔ مشابه سمت سرور Argo CD).",
      },
      diagramComponentIds: ["git"],
      code: {
        language: "bash",
        title: "kustomize",
        code: `kubectl kustomize overlays/prod`,
      },
      expectedOutput: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: prod-demo
...`,
    },
    {
      id: "app",
      title: {
        en: "Application path = overlay",
        fa: "path مربوط به Application = overlay",
      },
      description: {
        en: "Point source.path at the overlay directory, not only base.",
        fa: "source.path را به پوشهٔ overlay بدهید، نه فقط base.",
      },
      diagramComponentIds: ["app", "repo"],
      code: {
        language: "yaml",
        title: "application-prod.yaml",
        code: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: demo-prod
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/example/demo-config.git
    targetRevision: HEAD
    path: overlays/prod
  destination:
    server: https://kubernetes.default.svc
    namespace: demo-prod`,
      },
    },
  ],
  lab: basicLab(
    [
      labStep(
        "kustomize-local",
        {
          en: "Build an overlay with kubectl kustomize",
          fa: "ساخت overlay با kubectl kustomize",
        },
        {
          language: "bash",
          title: "kustomize",
          code: `# from a repo that has base/ + overlays/prod
kubectl kustomize overlays/prod | head -n 40`,
        },
        `apiVersion: apps/v1
kind: Deployment
metadata:
  name: prod-demo`,
        {
          en: "Local render shows namePrefix/replicas/images applied on the base.",
          fa: "render محلی نشان می‌دهد namePrefix و replicas و images روی base اعمال شده‌اند.",
        },
        ["git"],
      ),
    ],
    {
      prompt: {
        en: "Why should the Application path target overlays/prod instead of base for production?",
        fa: "چرا path مربوط به Application برای production باید overlays/prod باشد نه base؟",
      },
      solution: {
        language: "text",
        title: "answer",
        code: `Because prod-specific patches (replicas, images, namePrefix, …)
live in the overlay; syncing base alone skips those customizations.`,
      },
    },
  ),
  quiz: [
    q(
      "kz1",
      {
        en: "Who typically runs kustomize build for Argo CD?",
        fa: "معمولاً چه کسی برای Argo CD، kustomize build را اجرا می‌کند؟",
      },
      [
        { en: "argocd-repo-server", fa: "argocd-repo-server" },
        { en: "etcd", fa: "etcd" },
        { en: "CoreDNS", fa: "CoreDNS" },
      ],
      0,
      {
        en: "Manifest generation happens in repo-server.",
        fa: "تولید manifest در repo-server است.",
      },
    ),
    q(
      "kz2",
      {
        en: "overlays reference…",
        fa: "overlays به چه ارجاع می‌دهند؟",
      },
      [
        { en: "A base (or other resources) plus patches", fa: "یک base (یا منابع دیگر) به‌علاوهٔ پچ" },
        { en: "Only the API server binary", fa: "فقط باینری API server" },
        { en: "Only CNI config", fa: "فقط پیکربندی CNI" },
      ],
      0,
      {
        en: "That is the Kustomize overlay model.",
        fa: "مدل overlay در Kustomize همین است.",
      },
    ),
    q(
      "kz3",
      {
        en: "kubectl kustomize overlays/prod is used to…",
        fa: "دستور kubectl kustomize overlays/prod برای …",
      },
      [
        {
          en: "Preview rendered manifests locally",
          fa: "پیش‌نمایش محلی manifestهای renderشده",
        },
        { en: "Delete the control plane", fa: "حذف control plane" },
        { en: "Disable RBAC forever", fa: "خاموش کردن دائمی RBAC" },
      ],
      0,
      {
        en: "Local preview before or alongside GitOps sync.",
        fa: "پیش‌نمایش محلی قبل یا کنار sync مربوط به GitOps.",
      },
    ),
    q(
      "kz4",
      {
        en: "Application source.path for prod should usually be…",
        fa: "معمولاً source.path برای prod باید …",
      },
      [
        { en: "overlays/prod", fa: "overlays/prod" },
        { en: "/etc/kubernetes", fa: "/etc/kubernetes" },
        { en: "Only .git/hooks", fa: "فقط .git/hooks" },
      ],
      0,
      {
        en: "Point at the overlay directory you intend to ship.",
        fa: "به پوشهٔ overlay مورد نظر اشاره کنید.",
      },
    ),
    q(
      "kz5",
      {
        en: "namePrefix in Kustomize…",
        fa: "namePrefix در Kustomize …",
      },
      [
        {
          en: "Prefixes resource names in the render",
          fa: "به نام منابع در خروجی render پیشوند می‌دهد",
        },
        {
          en: "Changes the Kubernetes minor version",
          fa: "نسخهٔ minor مربوط به Kubernetes را عوض می‌کند",
        },
        {
          en: "Disables the scheduler",
          fa: "scheduler را خاموش می‌کند",
        },
      ],
      0,
      {
        en: "Common way to namespace names per environment.",
        fa: "روش رایج برای جدا کردن نام‌ها per محیط.",
      },
    ),
  ],
  troubleshooting: [
    troubleshoot(
      "kz-patch",
      {
        en: "Kustomize patch target not found",
        fa: "هدف patch در Kustomize پیدا نمی‌شود",
      },
      [
        {
          label: {
            en: "Check group/version/kind/name/namespace selectors in the patch target",
            fa: "selectorهای group/version/kind/name/namespace هدف پچ را بررسی کنید",
          },
          correct: true,
          feedback: {
            en: "Mismatched targets fail the build in repo-server.",
            fa: "هدف ناهماهنگ، build را در repo-server می‌خواباند.",
          },
        },
        {
          label: {
            en: "Delete the Git remote",
            fa: "remote مربوط به Git را حذف کنید",
          },
          correct: false,
          feedback: {
            en: "Fix the patch target instead.",
            fa: "به‌جاش هدف پچ را درست کنید.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "local build",
          code: `kubectl kustomize overlays/prod`,
        },
      ],
      {
        en: "Patch target must match a resource present after bases are loaded.",
        fa: "هدف پچ باید با منبعی که بعد از بارگذاری baseها هست جور باشد.",
      },
      {
        en: "Align names/kinds; rebuild locally until kubectl kustomize succeeds.",
        fa: "نام/kind را هم‌تراز کنید؛ محلی بسازید تا kubectl kustomize موفق شود.",
      },
    ),
    troubleshoot(
      "kz-path",
      {
        en: "Argo CD syncs base resources without prod replicas",
        fa: "Argo CD منابع base را بدون replicas مربوط به prod sync می‌کند",
      },
      [
        {
          label: {
            en: "Confirm Application path is overlays/prod not base",
            fa: "تأیید کنید path مربوط به Application برابر overlays/prod است نه base",
          },
          correct: true,
          feedback: {
            en: "Wrong path skips overlay patches.",
            fa: "path غلط پچ‌های overlay را رد می‌کند.",
          },
        },
        {
          label: {
            en: "Only restart kubelet on every node",
            fa: "فقط روی هر Node، kubelet را restart کنید",
          },
          correct: false,
          feedback: {
            en: "Unrelated to Kustomize path.",
            fa: "به path مربوط به Kustomize ربطی ندارد.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "get app",
          code: `kubectl -n argocd get application demo-prod -o yaml | sed -n '/source:/,/destination:/p'`,
        },
      ],
      {
        en: "Application source.path selects which kustomization root to build.",
        fa: "source.path ریشهٔ kustomization برای build را انتخاب می‌کند.",
      },
      {
        en: "Point path at the overlay; refresh/sync again.",
        fa: "path را به overlay بدهید؛ دوباره refresh/sync کنید.",
      },
    ),
  ],
};
