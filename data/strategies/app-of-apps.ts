import type { Strategy } from "@/lib/types";
import {
  basicLab,
  comp,
  conn,
  labStep,
  q,
  troubleshoot,
} from "./_helpers";

export const appOfApps: Strategy = {
  id: "app-of-apps",
  name: {
    en: "App of Apps",
    fa: "App of Apps",
  },
  category: "gitops",
  summary: {
    en: "A root Application in Git that creates other Application CRs — bootstrap many apps from one repo folder.",
    fa: "یک Application ریشه در Git که Application CRهای دیگر می‌سازد — bootstrap چند اپ از یک پوشه در repo.",
  },
  whyItExists: {
    en: "Managing dozens of Application YAMLs by hand does not scale; one parent declares the fleet.",
    fa: "مدیریت دستی ده‌ها Application YAML مقیاس نمی‌گیرد؛ یک parent کل fleet را اعلام می‌کند.",
  },
  analogy: {
    en: "A table of contents that lists every chapter — add a chapter file and the book updates.",
    fa: "مثل فهرست مطالب که هر فصل را لیست می‌کند — فایل فصل اضافه کنید و کتاب به‌روز می‌شود.",
  },
  howItWorks: [
    {
      en: "Root Application points at a folder containing child Application manifests (or kustomization).",
      fa: "Application ریشه به پوشه‌ای اشاره می‌کند که manifestهای Application فرزند (یا kustomization) دارد.",
    },
    {
      en: "Argo CD syncs the root; child Application CRs appear in the argocd namespace (or as defined).",
      fa: "Argo CD ریشه را sync می‌کند؛ Application CR فرزند در namespace مربوط (مثلاً argocd) ظاهر می‌شوند.",
    },
    {
      en: "Each child Application then syncs its own Git path to its destination namespace.",
      fa: "هر Application فرزند مسیر Git خود را به namespace مقصد sync می‌کند.",
    },
    {
      en: "sync-wave annotation argocd.argoproj.io/sync-wave orders resources during sync.",
      fa: "annotation مربوط به sync-wave ترتیب resourceها را در sync تعیین می‌کند.",
    },
  ],
  useWhen: [
    {
      en: "One Git repo owns the platform Application definitions",
      fa: "یک repo Git تعریف Applicationهای platform را دارد",
    },
    {
      en: "You want Git-only bootstrap of new services",
      fa: "bootstrap سرویس جدید فقط با Git می‌خواهید",
    },
  ],
  avoidWhen: [
    {
      en: "ApplicationSet generators fit dynamic multi-cluster/tenant lists better",
      fa: "generatorهای ApplicationSet برای لیست پویا multi-cluster/tenant بهترند",
    },
  ],
  docsUrl: "https://argo-cd.readthedocs.io/en/stable/operator-manual/cluster-bootstrapping/",
  relatedToolIds: ["argo-cd"],
  relatedStrategyIds: ["argocd-application", "applicationset"],
  placementBlurb: {
    en: "Root Application in argocd → child Application CRs → each app's workloads",
    fa: "Application ریشه در argocd → Application CR فرزند → workload هر اپ",
  },
  diagram: {
    components: [
      comp({
        id: "git-root",
        label: "Git apps/ folder",
        zone: "external",
        objectType: "External",
        highlight: true,
        description: "Contains root and child Application YAMLs.",
        whyThere: "Declarative fleet.",
      }),
      comp({
        id: "root-app",
        label: "Root Application",
        zone: "namespace",
        objectType: "CRD",
        highlight: true,
        description: "Syncs apps/ to create child Applications.",
        whyThere: "Bootstrap entrypoint.",
      }),
      comp({
        id: "child-a",
        label: "Child Application A",
        zone: "namespace",
        objectType: "CRD",
        highlight: true,
        description: "Points at service A Git path.",
        whyThere: "Owns one app lifecycle.",
      }),
      comp({
        id: "child-b",
        label: "Child Application B",
        zone: "namespace",
        objectType: "CRD",
        highlight: true,
        description: "Points at service B Git path.",
        whyThere: "Owns another app lifecycle.",
      }),
      comp({
        id: "controller",
        label: "application-controller",
        zone: "control-plane",
        objectType: "ControlPlane",
        highlight: true,
        description: "Reconciles root then children.",
        whyThere: "GitOps engine.",
      }),
    ],
    connections: [
      conn("git-root-app", "git-root", "root-app", "source path"),
      conn("root-a", "root-app", "child-a", "creates CR"),
      conn("root-b", "root-app", "child-b", "creates CR"),
      conn("ctrl-root", "controller", "root-app", "sync"),
      conn("ctrl-a", "controller", "child-a", "sync"),
    ],
  },
  flows: [
    {
      id: "bootstrap",
      title: {
        en: "Bootstrap with sync waves",
        fa: "Bootstrap با sync wave",
      },
      steps: [
        {
          caption: {
            en: "Apply root Application once (or via install manifest).",
            fa: "یک‌بار Application ریشه apply می‌شود (یا از manifest نصب).",
          },
          componentIds: ["root-app", "controller"],
        },
        {
          caption: {
            en: "Wave 0: platform CRs; wave 1: app Applications (annotation order).",
            fa: "wave 0: CRهای platform؛ wave 1: Application اپ (ترتیب annotation).",
          },
          componentIds: ["child-a", "child-b"],
          connectionIds: ["root-a", "root-b"],
        },
        {
          caption: {
            en: "Children sync workloads to destination namespaces.",
            fa: "فرزندها workload را به namespace مقصد sync می‌کنند.",
          },
          componentIds: ["child-a", "child-b", "controller"],
        },
      ],
    },
  ],
  implement: [
    {
      id: "folder",
      title: {
        en: "Repository folder layout",
        fa: "چیدمان پوشه در repository",
      },
      description: {
        en: "Example apps/ tree: root application.yaml plus per-app child manifests.",
        fa: "نمونهٔ درخت apps/: application.yaml ریشه به‌اضافهٔ manifest فرزند برای هر اپ.",
      },
      diagramComponentIds: ["git-root", "root-app"],
      code: {
        language: "text",
        title: "repo layout",
        code: `apps/
  application.yaml          # root App of Apps
  guestbook/
    application.yaml        # child Application
  prometheus/
    application.yaml        # child Application`,
      },
    },
    {
      id: "root-yaml",
      title: {
        en: "Root Application manifest",
        fa: "manifest Application ریشه",
      },
      description: {
        en: "Root source.path is apps/; destination is argocd namespace for child CRs.",
        fa: "source.path ریشه برابر apps/ است؛ مقصد namespace argocd برای CR فرزند.",
      },
      diagramComponentIds: ["root-app"],
      code: {
        language: "yaml",
        title: "apps/application.yaml",
        code: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root-apps
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/example/gitops.git
    targetRevision: main
    path: apps
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
      selfHeal: true`,
      },
    },
    {
      id: "child-yaml",
      title: {
        en: "Child Application with sync-wave",
        fa: "Application فرزند با sync-wave",
      },
      description: {
        en: "Lower sync-wave syncs first; use for ordering dependencies.",
        fa: "sync-wave کوچک‌تر اول sync می‌شود؛ برای ترتیب وابستگی‌ها.",
      },
      diagramComponentIds: ["child-a"],
      code: {
        language: "yaml",
        title: "apps/guestbook/application.yaml",
        code: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: guestbook
  namespace: argocd
  annotations:
    argocd.argoproj.io/sync-wave: "1"
spec:
  project: default
  source:
    repoURL: https://github.com/example/gitops.git
    targetRevision: main
    path: workloads/guestbook
  destination:
    server: https://kubernetes.default.svc
    namespace: guestbook
  syncPolicy:
    automated:
      prune: true
      selfHeal: true`,
      },
    },
  ],
  lab: basicLab(
    [
      labStep(
        "apply-root",
        {
          en: "Apply root Application and list child Applications",
          fa: "اعمال Application ریشه و لیست Application فرزند",
        },
        {
          language: "bash",
          title: "bootstrap",
          code: `kubectl apply -f apps/application.yaml
kubectl get applications -n argocd`,
        },
        `NAME          SYNC STATUS   HEALTH STATUS
root-apps     Synced        Healthy
guestbook     Synced        Healthy`,
        {
          en: "Root sync creates child Application CRs from the apps/ folder.",
          fa: "sync ریشه، Application CR فرزند را از پوشهٔ apps/ می‌سازد.",
        },
        ["root-app", "child-a"],
      ),
    ],
    {
      prompt: {
        en: "Add sync-wave \"0\" to root and \"1\" to guestbook — which syncs first on a fresh cluster?",
        fa: "sync-wave «0» روی ریشه و «1» روی guestbook — روی کلاستر تازه کدام اول sync می‌شود؟",
      },
      solution: {
        language: "bash",
        title: "waves",
        code: `# Lower wave number syncs first (root platform CRs before app Applications).`,
      },
    },
  ),
  quiz: [
    q(
      "aoa1",
      {
        en: "App of Apps uses which resource as the parent?",
        fa: "App of Apps والد را با کدام resource می‌سازد؟",
      },
      [
        { en: "A root Application CR", fa: "یک Application CR ریشه" },
        { en: "A Deployment", fa: "یک Deployment" },
        { en: "A DaemonSet", fa: "یک DaemonSet" },
      ],
      0,
      {
        en: "The root Application syncs manifests that are themselves Applications.",
        fa: "Application ریشه manifestهایی را sync می‌کند که خودشان Application هستند.",
      },
    ),
    q(
      "aoa2",
      {
        en: "argocd.argoproj.io/sync-wave controls…",
        fa: "argocd.argoproj.io/sync-wave کنترل می‌کند…",
      },
      [
        { en: "Relative sync order during apply", fa: "ترتیب نسبی sync هنگام apply" },
        { en: "Git branch name", fa: "نام branch در Git" },
        { en: "Pod CPU limit", fa: "حد CPU روی Pod" },
      ],
      0,
      {
        en: "Lower waves apply before higher waves.",
        fa: "wave پایین‌تر قبل از wave بالاتر apply می‌شود.",
      },
    ),
    q(
      "aoa3",
      {
        en: "Child Applications usually live in…",
        fa: "Application فرزند معمولاً در…",
      },
      [
        { en: "argocd namespace (as CRs)", fa: "namespace argocd (به‌صورت CR)" },
        { en: "kube-system only", fa: "فقط kube-system" },
        { en: "Every worker node", fa: "هر worker node" },
      ],
      0,
      {
        en: "CRs are often stored alongside other Argo CD apps.",
        fa: "CRها اغلب کنار Applicationهای دیگر Argo CD هستند.",
      },
    ),
    q(
      "aoa4",
      {
        en: "Adding a new service in App of Apps typically means…",
        fa: "اضافه کردن سرویس جدید در App of Apps معمولاً یعنی…",
      },
      [
        { en: "Commit a new child Application YAML under apps/", fa: "commit کردن Application فرزند جدید زیر apps/" },
        { en: "kubectl run only", fa: "فقط kubectl run" },
        { en: "Delete root Application", fa: "حذف Application ریشه" },
      ],
      0,
      {
        en: "Git change triggers sync via root.",
        fa: "تغییر Git از طریق ریشه sync را راه می‌اندازد.",
      },
    ),
    q(
      "aoa5",
      {
        en: "Root Application destination.namespace for child CRs is often…",
        fa: "destination.namespace ریشه برای CR فرزند اغلب…",
      },
      [
        { en: "argocd", fa: "argocd" },
        { en: "default only for workloads", fa: "فقط default برای workload" },
        { en: "kube-public", fa: "kube-public" },
      ],
      0,
      {
        en: "Child Application objects are installed where CRs belong.",
        fa: "object Application فرزند جایی نصب می‌شود که CRها متعلق‌اند.",
      },
    ),
  ],
  troubleshooting: [
    troubleshoot(
      "aoa-child-missing",
      {
        en: "Root Synced but no child Application appears",
        fa: "ریشه Synced است ولی Application فرزند نیست",
      },
      [
        {
          label: {
            en: "Verify path, manifest kind Application, and project permissions",
            fa: "path، kind Application و مجوز project را چک کنید",
          },
          correct: true,
          feedback: {
            en: "Invalid YAML or path skips child creation.",
            fa: "YAML یا path نامعتبر، ساخت فرزند را رد می‌کند.",
          },
        },
        {
          label: {
            en: "Restart all nodes",
            fa: "همهٔ Nodeها را restart کنید",
          },
          correct: false,
          feedback: {
            en: "Inspect root sync logs and repo contents.",
            fa: "log sync ریشه و محتوای repo را ببینید.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "debug",
          code: `argocd app get root-apps
kubectl get application -n argocd
argocd app logs root-apps`,
        },
      ],
      {
        en: "Root path missing child YAML or sync error.",
        fa: "path ریشه YAML فرزند ندارد یا sync خطا داده.",
      },
      {
        en: "Fix Git layout; re-sync root.",
        fa: "چیدمان Git را درست کنید؛ ریشه را دوباره sync کنید.",
      },
    ),
    troubleshoot(
      "aoa-wave-order",
      {
        en: "App Application syncs before its CRD/platform dependency",
        fa: "Application اپ قبل از وابستگی CRD/platform sync می‌شود",
      },
      [
        {
          label: {
            en: "Lower sync-wave on platform manifests; higher on apps",
            fa: "sync-wave پایین‌تر روی manifestهای platform؛ بالاتر روی اپ‌ها",
          },
          correct: true,
          feedback: {
            en: "Waves order sync within one Application tree.",
            fa: "waveها ترتیب sync در درخت Application را می‌چینند.",
          },
        },
        {
          label: {
            en: "Disable all sync",
            fa: "همهٔ sync را خاموش کنید",
          },
          correct: false,
          feedback: {
            en: "Adjust annotations instead.",
            fa: "به‌جایش annotationها را تنظیم کنید.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "waves",
          code: `kubectl get applications -n argocd -o custom-columns=NAME:.metadata.name,WAVE:.metadata.annotations.argocd\\.argoproj\\.io/sync-wave`,
        },
      ],
      {
        en: "Missing or equal sync-wave on dependencies.",
        fa: "sync-wave روی وابستگی‌ها نیست یا برابر است.",
      },
      {
        en: "Assign lower waves to CRDs/platform; retry sync.",
        fa: "wave پایین‌تر به CRD/platform بدهید؛ sync را تکرار کنید.",
      },
    ),
  ],
};
