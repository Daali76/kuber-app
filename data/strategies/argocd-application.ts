import type { Strategy } from "@/lib/types";
import {
  basicLab,
  comp,
  conn,
  labStep,
  q,
  troubleshoot,
} from "./_helpers";

export const argoCdApplication: Strategy = {
  id: "argocd-application",
  name: {
    en: "Argo CD Application",
    fa: "Application در Argo CD",
  },
  category: "gitops",
  summary: {
    en: "Declarative GitOps: an Application CR syncs a Git path to the cluster desired state.",
    fa: "GitOps اعلانی: Application CR مسیر Git را با desired state کلاستر همگام می‌کند.",
  },
  whyItExists: {
    en: "Manual kubectl apply drifts from Git; teams need continuous reconciliation from repo to cluster.",
    fa: "kubectl apply دستی از Git جدا می‌شود؛ تیم‌ها reconciliation پیوسته از repo به کلاستر می‌خواهند.",
  },
  analogy: {
    en: "A thermostat comparing the room to the setting on the wall — it heats or cools until they match.",
    fa: "مثل ترموستات که دمای اتاق را با عدد روی دیوار مقایسه می‌کند تا برابر شود.",
  },
  howItWorks: [
    {
      en: "You define source.repoURL, path, and targetRevision plus destination cluster/namespace.",
      fa: "source.repoURL، path و targetRevision به‌همراه cluster/namespace مقصد را تعریف می‌کنید.",
    },
    {
      en: "repo-server clones and renders manifests; application-controller compares live vs desired.",
      fa: "repo-server clone و render می‌کند؛ application-controller وضعیت live را با desired مقایسه می‌کند.",
    },
    {
      en: "Sync applies diff; status shows Synced/OutOfSync and Health (Healthy, Progressing, Degraded, etc.).",
      fa: "Sync اختلاف را apply می‌کند؛ وضعیت Synced/OutOfSync و Health (Healthy، Progressing، Degraded و غیره) را نشان می‌دهد.",
    },
    {
      en: "syncPolicy.automated can enable automated sync with prune and selfHeal options.",
      fa: "syncPolicy.automated می‌تواند sync خودکار با گزینه‌های prune و selfHeal فعال کند.",
    },
  ],
  useWhen: [
    {
      en: "Git is the source of truth for Kubernetes manifests",
      fa: "Git منبع حقیقت manifestهای Kubernetes است",
    },
    {
      en: "You want visibility into drift and health in one UI/CR",
      fa: "دrift و health را در یک UI/CR می‌خواهید",
    },
  ],
  avoidWhen: [
    {
      en: "Secrets or config should never live in Git (without sealed/secrets tooling)",
      fa: "secret/config نباید در Git باشد (بدون ابزار sealed/secret)",
    },
    {
      en: "One-off imperative debugging is the only workflow",
      fa: "فقط workflow imperative یک‌باره برای debug دارید",
    },
  ],
  docsUrl: "https://argo-cd.readthedocs.io/en/stable/user-guide/application-specification/",
  relatedToolIds: ["argo-cd"],
  relatedStrategyIds: ["app-of-apps", "applicationset", "kustomize-argocd"],
  placementBlurb: {
    en: "Git repo → repo-server → application-controller → API server; argocd-server UI/CLI",
    fa: "Git → repo-server → application-controller → API server؛ UI/CLI روی argocd-server",
  },
  interactive: "argocd-toggles",
  diagram: {
    components: [
      comp({
        id: "git",
        label: "Git repository",
        zone: "external",
        objectType: "External",
        highlight: true,
        description: "Desired manifests at repoURL/path/revision.",
        whyThere: "Source of truth.",
      }),
      comp({
        id: "repo-server",
        label: "repo-server",
        zone: "control-plane",
        objectType: "ControlPlane",
        highlight: true,
        description: "Clones Git and generates manifests (helm/kustomize/jsonnet).",
        whyThere: "Render pipeline from Git.",
      }),
      comp({
        id: "app-controller",
        label: "application-controller",
        zone: "control-plane",
        objectType: "ControlPlane",
        highlight: true,
        description: "Reconciles Application CR; drives sync operations.",
        whyThere: "Continuous GitOps loop.",
      }),
      comp({
        id: "api",
        label: "kube-apiserver",
        zone: "control-plane",
        objectType: "ControlPlane",
        highlight: true,
        description: "Live cluster state Application compares against.",
        whyThere: "Reconciliation target.",
      }),
      comp({
        id: "argocd-server",
        label: "argocd-server",
        zone: "control-plane",
        objectType: "ControlPlane",
        highlight: false,
        description: "API/UI for users and CLI.",
        whyThere: "Operate Applications.",
      }),
      comp({
        id: "application",
        label: "Application CR",
        zone: "namespace",
        objectType: "CRD",
        highlight: true,
        description: "Links source Git to destination; holds syncPolicy.",
        whyThere: "Unit of GitOps deployment.",
      }),
    ],
    connections: [
      conn("git-repo", "git", "repo-server", "clone"),
      conn("repo-app", "repo-server", "app-controller", "manifests"),
      conn("ctrl-app", "app-controller", "application", "reconcile"),
      conn("ctrl-api", "app-controller", "api", "apply/prune"),
      conn("server-app", "argocd-server", "application", "UI/API"),
    ],
  },
  flows: [
    {
      id: "sync-healthy",
      title: {
        en: "Sync to Synced + Healthy",
        fa: "Sync تا Synced + Healthy",
      },
      steps: [
        {
          caption: {
            en: "Application spec points at Git source and cluster destination.",
            fa: "spec Application به source Git و مقصد cluster اشاره می‌کند.",
          },
          componentIds: ["application", "git"],
          connectionIds: ["git-repo"],
        },
        {
          caption: {
            en: "repo-server renders manifests at targetRevision.",
            fa: "repo-server manifestها را در targetRevision render می‌کند.",
          },
          componentIds: ["repo-server"],
          connectionIds: ["repo-app"],
        },
        {
          caption: {
            en: "Controller detects OutOfSync; sync applies diff to API server.",
            fa: "کنترلر OutOfSync می‌بیند؛ sync اختلاف را روی API server apply می‌کند.",
          },
          componentIds: ["app-controller", "api"],
          connectionIds: ["ctrl-api"],
        },
        {
          caption: {
            en: "Status Synced; health reflects workload readiness.",
            fa: "وضعیت Synced؛ health از readiness workload می‌آید.",
          },
          componentIds: ["application"],
          connectionIds: ["ctrl-app"],
        },
      ],
    },
  ],
  implement: [
    {
      id: "application-yaml",
      title: {
        en: "Application with syncPolicy toggles",
        fa: "Application با toggleهای syncPolicy",
      },
      description: {
        en: "automated.prune removes resources removed from Git; selfHeal re-applies when live drifts.",
        fa: "automated.prune منابع حذف‌شده از Git را پاک می‌کند؛ selfHeal وقتی live drift کند دوباره apply می‌کند.",
      },
      diagramComponentIds: ["application", "git", "app-controller"],
      code: {
        language: "yaml",
        title: "application.yaml",
        code: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: guestbook
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/argoproj/argocd-example-apps.git
    targetRevision: HEAD
    path: guestbook
  destination:
    server: https://kubernetes.default.svc
    namespace: guestbook
  syncPolicy:
    automated:
      prune: true
      selfHeal: true`,
      },
    },
    {
      id: "cli-sync",
      title: {
        en: "CLI sync and status",
        fa: "sync و وضعیت با CLI",
      },
      description: {
        en: "argocd app sync/get shows sync and health.",
        fa: "argocd app sync/get وضعیت sync و health را نشان می‌دهد.",
      },
      diagramComponentIds: ["argocd-server", "application"],
      code: {
        language: "bash",
        title: "argocd cli",
        code: `argocd app get guestbook
argocd app sync guestbook
argocd app wait guestbook --health`,
      },
    },
  ],
  lab: basicLab(
    [
      labStep(
        "create-app",
        {
          en: "Create Application from example repo (Argo CD installed)",
          fa: "ساخت Application از repo نمونه (Argo CD نصب باشد)",
        },
        {
          language: "bash",
          title: "apply application",
          code: `kubectl apply -f application.yaml
kubectl get application guestbook -n argocd`,
        },
        `NAME         SYNC STATUS   HEALTH STATUS
guestbook    Synced        Healthy`,
        {
          en: "Controller clones guestbook path and applies resources to destination namespace.",
          fa: "کنترلر مسیر guestbook را clone و منابع را در namespace مقصد apply می‌کند.",
        },
        ["application", "git", "app-controller"],
      ),
      labStep(
        "toggle-selfheal",
        {
          en: "Disable selfHeal and kubectl edit a managed resource",
          fa: "selfHeal را خاموش کنید و resource مدیریت‌شده را kubectl edit کنید",
        },
        {
          language: "bash",
          title: "drift",
          code: `kubectl patch application guestbook -n argocd --type merge -p '{"spec":{"syncPolicy":{"automated":{"selfHeal":false}}}}'
# edit a field on a deployed resource, then:
argocd app get guestbook`,
        },
        `Sync Status:   OutOfSync`,
        {
          en: "With selfHeal off, live drift stays until manual sync.",
          fa: "با selfHeal خاموش، drift تا sync دستی می‌ماند.",
        },
        ["application"],
      ),
    ],
    {
      prompt: {
        en: "Re-enable selfHeal — what happens to the manual edit?",
        fa: "selfHeal را دوباره روشن کنید — edit دستی چه می‌شود؟",
      },
      solution: {
        language: "bash",
        title: "selfHeal on",
        code: `kubectl patch application guestbook -n argocd --type merge -p '{"spec":{"syncPolicy":{"automated":{"selfHeal":true}}}}'
argocd app sync guestbook`,
      },
    },
  ),
  quiz: [
    q(
      "acd1",
      {
        en: "Which component clones Git and renders manifests?",
        fa: "کدام جزء Git را clone و manifest render می‌کند؟",
      },
      [
        { en: "repo-server", fa: "repo-server" },
        { en: "kubelet", fa: "kubelet" },
        { en: "etcd", fa: "etcd" },
      ],
      0,
      {
        en: "repo-server serves rendered manifests to the controller.",
        fa: "repo-server manifest render‌شده را به کنترلر می‌دهد.",
      },
    ),
    q(
      "acd2",
      {
        en: "syncPolicy.automated.prune: true means…",
        fa: "syncPolicy.automated.prune: true یعنی…",
      },
      [
        {
          en: "Delete cluster objects removed from Git during sync",
          fa: "در sync، object حذف‌شده از Git از کلاستر پاک شود",
        },
        { en: "Never delete anything", fa: "هیچ‌چیز حذف نشود" },
        { en: "Disable all sync", fa: "همهٔ sync خاموش شود" },
      ],
      0,
      {
        en: "Prune aligns cluster with Git deletions.",
        fa: "prune حذف‌های Git را در کلاستر اعمال می‌کند.",
      },
    ),
    q(
      "acd3",
      {
        en: "selfHeal: true reverses…",
        fa: "selfHeal: true برمی‌گرداند…",
      },
      [
        { en: "Manual kubectl drift on managed resources", fa: "drift دستی kubectl روی resourceهای مدیریت‌شده" },
        { en: "Git commit history", fa: "تاریخچهٔ commit در Git" },
        { en: "Node OS upgrades", fa: "upgrade OS روی Node" },
      ],
      0,
      {
        en: "Controller re-applies Git desired state.",
        fa: "کنترلر desired state در Git را دوباره apply می‌کند.",
      },
    ),
    q(
      "acd4",
      {
        en: "OutOfSync means…",
        fa: "OutOfSync یعنی…",
      },
      [
        { en: "Live cluster differs from Git-rendered desired", fa: "کلاستر live با desired render‌شده از Git فرق دارد" },
        { en: "Git repo is empty", fa: "repo Git خالی است" },
        { en: "Argo CD is uninstalled", fa: "Argo CD حذف شده" },
      ],
      0,
      {
        en: "Sync status compares desired vs live.",
        fa: "وضعیت sync، desired را با live مقایسه می‌کند.",
      },
    ),
    q(
      "acd5",
      {
        en: "destination.server typically points to…",
        fa: "destination.server معمولاً به…",
      },
      [
        { en: "Kubernetes API (in-cluster or registered cluster URL)", fa: "API Kubernetes (درون کلاستر یا URL cluster ثبت‌شده)" },
        { en: "Docker Hub only", fa: "فقط Docker Hub" },
        { en: "Prometheus", fa: "Prometheus" },
      ],
      0,
      {
        en: "Application deploys to a registered cluster endpoint.",
        fa: "Application به endpoint cluster ثبت‌شده deploy می‌کند.",
      },
    ),
  ],
  troubleshooting: [
    troubleshoot(
      "acd-outofsync",
      {
        en: "Application stays OutOfSync after sync",
        fa: "بعد از sync، Application OutOfSync می‌ماند",
      },
      [
        {
          label: {
            en: "Check for fields ignored by apply, compare diff in UI/CLI",
            fa: "فیلدهای نادیده‌شده در apply را ببینید؛ diff در UI/CLI",
          },
          correct: true,
          feedback: {
            en: "Server-side defaults or ignored fields cause perpetual diff.",
            fa: "default سمت سرور یا فیلدهای ignored diff دائمی می‌سازند.",
          },
        },
        {
          label: {
            en: "Delete the Git repo",
            fa: "repo Git را حذف کنید",
          },
          correct: false,
          feedback: {
            en: "Fix manifest or use ignoreDifferences.",
            fa: "manifest را درست کنید یا ignoreDifferences بگذارید.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "diff",
          code: `argocd app diff guestbook
kubectl get application guestbook -n argocd -o yaml | sed -n '/status:/,$p'`,
        },
      ],
      {
        en: "Diff noise from immutable or defaulted fields.",
        fa: "نویز diff از فیلدهای immutable یا default.",
      },
      {
        en: "Configure ignoreDifferences or fix manifests.",
        fa: "ignoreDifferences تنظیم یا manifestها را اصلاح کنید.",
      },
    ),
    troubleshoot(
      "acd-unhealthy",
      {
        en: "Synced but Health Degraded",
        fa: "Synced ولی Health برابر Degraded",
      },
      [
        {
          label: {
            en: "Inspect workload events — failing Pods, probes, or resources",
            fa: "eventهای workload — Pod، probe یا resource شکست‌خورده",
          },
          correct: true,
          feedback: {
            en: "Sync success does not mean Pods are healthy.",
            fa: "موفقیت sync یعنی Podها سالم‌اند نیست.",
          },
        },
        {
          label: {
            en: "Set selfHeal false permanently without investigation",
            fa: "بدون بررسی selfHeal را برای همیشه false کنید",
          },
          correct: false,
          feedback: {
            en: "Fix underlying workload health.",
            fa: "سلامت workload زیرین را درست کنید.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "health",
          code: `argocd app get guestbook
kubectl get pods -n guestbook
kubectl describe application guestbook -n argocd`,
        },
      ],
      {
        en: "Applied manifests run but workloads fail readiness.",
        fa: "manifest apply شده ولی workload readiness را fail می‌کند.",
      },
      {
        en: "Fix Deployment/Service issues in Git and sync.",
        fa: "مشکل Deployment/Service را در Git درست و sync کنید.",
      },
    ),
  ],
};
