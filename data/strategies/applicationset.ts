import type { Strategy } from "@/lib/types";
import {
  basicLab,
  comp,
  conn,
  labStep,
  q,
  troubleshoot,
} from "./_helpers";

export const applicationSet: Strategy = {
  id: "applicationset",
  name: { en: "ApplicationSet", fa: "ApplicationSet" },
  category: "gitops",
  summary: {
    en: "Argo CD controller that templates many Applications from generators (List, Git, Cluster, …).",
    fa: "کنترلر Argo CD که با generatorها (List، Git، Cluster و …) تعداد زیادی Application می‌سازد.",
  },
  whyItExists: {
    en: "Managing dozens of near-identical Applications by hand does not scale across clusters or environments.",
    fa: "مدیریت ده‌ها Application تقریباً یکسان دستی، روی چند کلاستر یا محیط مقیاس‌پذیر نیست.",
  },
  analogy: {
    en: "A mail-merge for Application YAMLs: one template, many filled forms.",
    fa: "مثل ادغام نامه برای YAMLهای Application: یک قالب، چند فرم پرشده.",
  },
  howItWorks: [
    {
      en: "The ApplicationSet controller watches ApplicationSet CRs.",
      fa: "کنترلر ApplicationSet، منابع ApplicationSet را watch می‌کند.",
    },
    {
      en: "Generators (List, Git directories, Cluster, …) produce parameter sets.",
      fa: "generatorهایی مثل List، پوشه‌های Git یا Cluster مجموعه‌پارامتر می‌سازند.",
    },
    {
      en: "Each parameter set renders the Application template into a concrete Application.",
      fa: "هر مجموعه پارامتر، قالب Application را به یک Application واقعی تبدیل می‌کند.",
    },
    {
      en: "Prefer ApplicationSet when parameters dominate; prefer App of Apps when the tree of apps is curated as Git folders of Application manifests.",
      fa: "وقتی پارامتر غالب است ApplicationSet؛ وقتی درخت اپ به‌صورت پوشه‌های Application در Git مدیریت می‌شود App of Apps.",
    },
  ],
  useWhen: [
    {
      en: "Many apps or clusters share the same Application shape",
      fa: "چند اپ یا کلاستر شکل Application یکسان دارند",
    },
  ],
  avoidWhen: [
    {
      en: "You only have one or two Applications with unique specs",
      fa: "فقط یک یا دو Application با مشخصات یکتا دارید",
    },
  ],
  docsUrl: "https://argo-cd.readthedocs.io/en/stable/user-guide/application-set/",
  relatedToolIds: ["argo-cd"],
  relatedStrategyIds: ["app-of-apps", "argocd-application"],
  placementBlurb: {
    en: "ApplicationSet controller (usually with Argo CD) templates Applications",
    fa: "کنترلر ApplicationSet (معمولاً همراه Argo CD) منابع Application را قالب‌بندی می‌کند",
  },
  diagram: {
    components: [
      comp({
        id: "appset-ctrl",
        label: "ApplicationSet ctrl",
        zone: "namespace",
        objectType: "Deployment",
        highlight: true,
        description: "ApplicationSet controller Deployment.",
        whyThere: "Reconciles ApplicationSet CRs into Applications.",
      }),
      comp({
        id: "appset-cr",
        label: "ApplicationSet CR",
        zone: "namespace",
        objectType: "CRD",
        highlight: true,
      }),
      comp({
        id: "gen",
        label: "Generators",
        zone: "external",
        objectType: "External",
        highlight: true,
        description: "List / Git / Cluster (and other) generators.",
        whyThere: "Supply parameters for templating.",
      }),
      comp({
        id: "apps",
        label: "Applications",
        zone: "namespace",
        objectType: "CRD",
        highlight: true,
      }),
      comp({
        id: "clusters",
        label: "Target clusters",
        zone: "external",
        objectType: "External",
        highlight: true,
      }),
    ],
    connections: [
      conn("g-cr", "gen", "appset-cr", "params"),
      conn("ctrl-cr", "appset-ctrl", "appset-cr", "reconcile"),
      conn("cr-apps", "appset-cr", "apps", "template"),
      conn("apps-cl", "apps", "clusters", "sync"),
    ],
  },
  flows: [
    {
      id: "generate",
      title: { en: "Generate Applications", fa: "تولید Applicationها" },
      steps: [
        {
          caption: {
            en: "Generator emits parameter sets (e.g. one per cluster or directory).",
            fa: "generator مجموعه‌پارامتر می‌دهد (مثلاً یکی برای هر کلاستر یا پوشه).",
          },
          componentIds: ["gen", "appset-cr"],
          connectionIds: ["g-cr"],
        },
        {
          caption: {
            en: "Controller renders the Application template for each set.",
            fa: "کنترلر برای هر مجموعه، قالب Application را render می‌کند.",
          },
          componentIds: ["appset-ctrl", "apps"],
          connectionIds: ["ctrl-cr", "cr-apps"],
        },
        {
          caption: {
            en: "Each Application syncs its destination (cluster/namespace).",
            fa: "هر Application مقصد خودش (کلاستر/Namespace) را sync می‌کند.",
          },
          componentIds: ["apps", "clusters"],
          connectionIds: ["apps-cl"],
        },
      ],
    },
  ],
  implement: [
    {
      id: "list-gen",
      title: {
        en: "Minimal List generator example",
        fa: "نمونهٔ مینیمال generator از نوع List",
      },
      description: {
        en: "Official ApplicationSet docs show List elements providing key/value parameters into the template.",
        fa: "مستندات رسمی ApplicationSet عناصر List را برای پارامتر کلید/مقدار در قالب نشان می‌دهند.",
      },
      diagramComponentIds: ["appset-cr", "apps"],
      code: {
        language: "yaml",
        title: "applicationset-list.yaml",
        code: `apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: guestbook
  namespace: argocd
spec:
  generators:
    - list:
        elements:
          - cluster: engineering-dev
            url: https://1.2.3.4
          - cluster: engineering-prod
            url: https://2.4.6.8
  template:
    metadata:
      name: '{{cluster}}-guestbook'
    spec:
      project: default
      source:
        repoURL: https://github.com/argoproj/argocd-example-apps.git
        targetRevision: HEAD
        path: guestbook
      destination:
        server: '{{url}}'
        namespace: guestbook`,
      },
    },
  ],
  lab: basicLab(
    [
      labStep(
        "explain-appset",
        {
          en: "Read ApplicationSet API (cluster with Argo CD + ApplicationSet installed)",
          fa: "خواندن API مربوط به ApplicationSet (با نصب Argo CD و ApplicationSet)",
        },
        {
          language: "bash",
          title: "api-resources",
          code: `kubectl api-resources | grep -i applicationset || echo "ApplicationSet CRD not installed"
# TODO: install ApplicationSet per current Argo CD version docs if missing`,
        },
        `applicationsets   appset   argoproj.io/v1alpha1   true   ApplicationSet`,
        {
          en: "Confirms the ApplicationSet CRD is present when the component is installed.",
          fa: "وجود CRD مربوط به ApplicationSet را وقتی کامپوننت نصب است تأیید می‌کند.",
        },
        ["appset-cr"],
      ),
    ],
    {
      prompt: {
        en: "Name two generators you might use for multi-cluster vs multi-directory repos.",
        fa: "دو generator برای چندکلاستر در برابر چندپوشه در repo نام ببرید.",
      },
      solution: {
        language: "text",
        title: "answer",
        code: `Cluster (or list of cluster URLs) for multi-cluster;
Git directory/file generators for many paths in one repo.
# Confirm exact generator names in Argo CD ApplicationSet docs for your version.`,
      },
    },
  ),
  quiz: [
    q(
      "as1",
      {
        en: "ApplicationSet primarily creates…",
        fa: "ApplicationSet عمدتاً چه می‌سازد؟",
      },
      [
        { en: "Application objects", fa: "آبجکت‌های Application" },
        { en: "etcd snapshots", fa: "snapshotهای etcd" },
        { en: "IngressClasses only", fa: "فقط IngressClass" },
      ],
      0,
      {
        en: "It templates Applications from generators.",
        fa: "از روی generator، Application قالب می‌زند.",
      },
    ),
    q(
      "as2",
      {
        en: "List / Git / Cluster in this context are…",
        fa: "در این بافت List / Git / Cluster …",
      },
      [
        { en: "Generators", fa: "generator" },
        { en: "CNI plugins", fa: "پلاگین CNI" },
        { en: "etcd members", fa: "عضو etcd" },
      ],
      0,
      {
        en: "They feed parameters into the Application template.",
        fa: "به قالب Application پارامتر می‌دهند.",
      },
    ),
    q(
      "as3",
      {
        en: "App of Apps vs ApplicationSet — rough rule?",
        fa: "قانون سرانگشتی App of Apps در برابر ApplicationSet؟",
      },
      [
        {
          en: "Parameter fan-out → ApplicationSet; curated Application Git tree → App of Apps",
          fa: "پخش پارامتری → ApplicationSet؛ درخت Git از Applicationها → App of Apps",
        },
        {
          en: "Always delete one of them",
          fa: "همیشه یکی را حذف کنید",
        },
        {
          en: "They replace Kubernetes Deployments",
          fa: "جایگزین Deployment می‌شوند",
        },
      ],
      0,
      {
        en: "Both can coexist; choose by how apps are parameterized.",
        fa: "هر دو می‌توانند باشند؛ بر اساس نحوهٔ پارامترسازی انتخاب کنید.",
      },
    ),
    q(
      "as4",
      {
        en: "Who reconciles ApplicationSet CRs?",
        fa: "چه کسی ApplicationSet CR را reconcile می‌کند؟",
      },
      [
        {
          en: "ApplicationSet controller",
          fa: "کنترلر ApplicationSet",
        },
        { en: "kube-proxy only", fa: "فقط kube-proxy" },
        { en: "CoreDNS", fa: "CoreDNS" },
      ],
      0,
      {
        en: "A dedicated controller watches those CRs.",
        fa: "یک کنترلر اختصاصی آن CRها را می‌بیند.",
      },
    ),
    q(
      "as5",
      {
        en: "Templated destination.server often comes from…",
        fa: "مقدار قالب‌خوردهٔ destination.server اغلب از …",
      },
      [
        {
          en: "Generator parameters (e.g. cluster URL)",
          fa: "پارامترهای generator (مثلاً URL کلاستر)",
        },
        { en: "Random etcd keys", fa: "کلیدهای تصادفی etcd" },
        { en: "The Service CIDR only", fa: "فقط CIDR مربوط به Service" },
      ],
      0,
      {
        en: "List/Cluster generators commonly supply server URLs.",
        fa: "generatorهای List/Cluster معمولاً URL سرور را می‌دهند.",
      },
    ),
  ],
  troubleshooting: [
    troubleshoot(
      "as-no-apps",
      {
        en: "ApplicationSet exists but no Applications appear",
        fa: "ApplicationSet هست اما Application ساخته نمی‌شود",
      },
      [
        {
          label: {
            en: "Check ApplicationSet status/conditions and controller logs",
            fa: "status/condition مربوط به ApplicationSet و لاگ کنترلر را ببینید",
          },
          correct: true,
          feedback: {
            en: "Generator errors and template failures show up there.",
            fa: "خطای generator و شکست قالب آنجا دیده می‌شود.",
          },
        },
        {
          label: {
            en: "Disable the API server",
            fa: "API server را خاموش کنید",
          },
          correct: false,
          feedback: {
            en: "That breaks the cluster.",
            fa: "کلاستر را می‌شکند.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "status",
          code: `kubectl -n argocd describe applicationset.argoproj.io
kubectl -n argocd logs deploy/argocd-applicationset-controller --tail=100`,
        },
      ],
      {
        en: "Bad generator config or template placeholders prevent creation.",
        fa: "پیکربندی بد generator یا placeholder قالب مانع ساخت می‌شود.",
      },
      {
        en: "Fix the generator/template; confirm Applications are created in the expected namespace.",
        fa: "generator/قالب را درست کنید؛ ببینید Application در Namespace درست ساخته شده.",
      },
    ),
    troubleshoot(
      "as-dup",
      {
        en: "Applications flap or conflict on names",
        fa: "Applicationها در نام با هم تداخل دارند",
      },
      [
        {
          label: {
            en: "Ensure template metadata.name is unique per generator element",
            fa: "مطمئن شوید metadata.name قالب برای هر عنصر generator یکتاست",
          },
          correct: true,
          feedback: {
            en: "Colliding names cause update fights.",
            fa: "نام تکراری باعث جنگ به‌روزرسانی می‌شود.",
          },
        },
        {
          label: {
            en: "Use the same name for every cluster",
            fa: "برای همهٔ کلاسترها یک نام بگذارید",
          },
          correct: false,
          feedback: {
            en: "That guarantees collisions.",
            fa: "حتماً تداخل می‌سازد.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "list apps",
          code: `kubectl -n argocd get applications`,
        },
      ],
      {
        en: "Name template must include a distinguishing parameter.",
        fa: "قالب نام باید پارامتر متمایزکننده داشته باشد.",
      },
      {
        en: "Include cluster or path in the name template.",
        fa: "cluster یا path را در قالب نام بگنجانید.",
      },
    ),
  ],
};
