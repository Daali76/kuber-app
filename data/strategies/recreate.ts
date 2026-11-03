import type { Strategy } from "@/lib/types";
import {
  basicLab,
  comp,
  conn,
  labStep,
  q,
  troubleshoot,
} from "./_helpers";

export const recreate: Strategy = {
  id: "recreate",
  name: {
    en: "Recreate",
    fa: "Recreate",
  },
  category: "native",
  summary: {
    en: "Native Deployment strategy that terminates all old Pods before starting new ones — brief downtime.",
    fa: "استراتژی بومی Deployment که قبل از Podهای جدید، همهٔ Podهای قدیمی را terminate می‌کند؛ downtime کوتاه.",
  },
  whyItExists: {
    en: "Some apps cannot run two versions at once (schema locks, singleton workers, legacy binaries).",
    fa: "بعضی اپ‌ها دو نسخه را هم‌زمان نمی‌توانند اجرا کنند (قفل schema، worker تکی، باینری قدیمی).",
  },
  analogy: {
    en: "Closing a shop for renovation, then reopening — no overlap of old and new layout.",
    fa: "مثل بستن مغازه برای بازسازی و بعد بازگشایی؛ چیدمان قدیم و جدید هم‌زمان نیست.",
  },
  howItWorks: [
    {
      en: "On template change, the Deployment scales the old ReplicaSet to zero first.",
      fa: "با تغییر قالب، Deployment اول ReplicaSet قدیمی را به صفر می‌رساند.",
    },
    {
      en: "When old Pods are gone, it scales the new ReplicaSet up to the desired replica count.",
      fa: "وقتی Podهای قدیمی رفتند، ReplicaSet جدید تا تعداد replica موردنظر بالا می‌آید.",
    },
    {
      en: "Service endpoints may be empty during the gap — clients see errors until new Pods are Ready.",
      fa: "در فاصلهٔ میانی endpointهای Service ممکن است خالی باشند؛ تا Ready شدن Pod جدید، کلاینت خطا می‌بیند.",
    },
    {
      en: "strategy.type must be Recreate; rollingUpdate fields are ignored.",
      fa: "نوع strategy باید Recreate باشد؛ فیلدهای rollingUpdate نادیده گرفته می‌شوند.",
    },
  ],
  useWhen: [
    {
      en: "Only one version may run (migrations, exclusive file locks)",
      fa: "فقط یک نسخه مجاز است (migration، قفل فایل انحصاری)",
    },
    {
      en: "Brief downtime is acceptable",
      fa: "downtime کوتاه قابل قبول است",
    },
  ],
  avoidWhen: [
    {
      en: "You need continuous availability during updates",
      fa: "در به‌روزرسانی به دسترس‌پذیری پیوسته نیاز دارید",
    },
    {
      en: "RollingUpdate or progressive delivery is viable",
      fa: "RollingUpdate یا progressive delivery ممکن است",
    },
  ],
  docsUrl:
    "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#recreate-deployment",
  relatedToolIds: ["kubernetes"],
  relatedStrategyIds: ["rolling-update", "compare-strategies"],
  placementBlurb: {
    en: "Deployment with strategy.type Recreate; one RS at a time; Service may have no Ready endpoints briefly",
    fa: "Deployment با strategy.type Recreate؛ یک RS در هر لحظه؛ Service ممکن است لحظه‌ای endpoint Ready نداشته باشد",
  },
  diagram: {
    components: [
      comp({
        id: "deploy",
        label: "Deployment",
        zone: "namespace",
        objectType: "Deployment",
        highlight: true,
        description: "Owns Recreate strategy; only one active ReplicaSet revision during swap.",
        whyThere: "Controller enforces terminate-then-create ordering.",
      }),
      comp({
        id: "rs-v1",
        label: "ReplicaSet v1",
        zone: "namespace",
        objectType: "Deployment",
        highlight: true,
        description: "Old revision scaled to 0 before v2 starts.",
        whyThere: "No overlap with the new template.",
      }),
      comp({
        id: "rs-v2",
        label: "ReplicaSet v2",
        zone: "namespace",
        objectType: "Deployment",
        highlight: true,
        description: "New revision scaled up after v1 Pods terminate.",
        whyThere: "Carries the updated Pod template.",
      }),
      comp({
        id: "pod-v1",
        label: "Pods v1",
        zone: "pod",
        objectType: "Pod",
        highlight: true,
        description: "Terminated before new Pods are created.",
        whyThere: "Frees resources and avoids dual-version runtime.",
      }),
      comp({
        id: "gap",
        label: "Downtime gap",
        zone: "namespace",
        objectType: "External",
        highlight: true,
        description: "Window with zero Ready Pods matching the Service selector.",
        whyThere: "Recreate does not keep old Pods while starting new ones.",
      }),
      comp({
        id: "pod-v2",
        label: "Pods v2",
        zone: "pod",
        objectType: "Pod",
        highlight: true,
        description: "New Pods after the gap; traffic resumes when Ready.",
        whyThere: "Restore capacity after the swap.",
      }),
      comp({
        id: "svc",
        label: "Service",
        zone: "namespace",
        objectType: "Service",
        highlight: true,
        description: "Endpoints drop during the gap, then repopulate with v2 Ready Pods.",
        whyThere: "Stable DNS/VIP; backend membership changes abruptly.",
      }),
    ],
    connections: [
      conn("d-rs1", "deploy", "rs-v1", "owns (then scale 0)"),
      conn("d-rs2", "deploy", "rs-v2", "owns (scale up)"),
      conn("rs1-p", "rs-v1", "pod-v1", "runs"),
      conn("term-gap", "pod-v1", "gap", "all terminated"),
      conn("gap-v2", "gap", "pod-v2", "then create"),
      conn("rs2-p", "rs-v2", "pod-v2", "runs"),
      conn("svc-p2", "svc", "pod-v2", "select Ready"),
    ],
  },
  beforeAfter: {
    beforeComponentIds: ["deploy", "rs-v1", "pod-v1", "svc"],
    afterComponentIds: ["deploy", "rs-v2", "pod-v2", "svc"],
  },
  flows: [
    {
      id: "recreate-success",
      title: {
        en: "Recreate update (downtime gap)",
        fa: "به‌روزرسانی Recreate (فاصلهٔ downtime)",
      },
      steps: [
        {
          caption: {
            en: "Template changes; controller targets Recreate.",
            fa: "قالب عوض می‌شود؛ کنترلر Recreate را اجرا می‌کند.",
          },
          componentIds: ["deploy"],
        },
        {
          caption: {
            en: "Scale v1 to zero; all v1 Pods terminate.",
            fa: "v1 به صفر می‌رسد؛ همهٔ Podهای v1 terminate می‌شوند.",
          },
          componentIds: ["rs-v1", "pod-v1", "svc"],
          connectionIds: ["rs1-p", "term-gap"],
        },
        {
          caption: {
            en: "Downtime gap: Service may have no Ready endpoints.",
            fa: "فاصلهٔ downtime: Service ممکن است endpoint Ready نداشته باشد.",
          },
          componentIds: ["gap", "svc"],
          connectionIds: ["term-gap", "gap-v2"],
        },
        {
          caption: {
            en: "Scale v2 up; traffic returns when Pods pass readiness.",
            fa: "v2 بالا می‌آید؛ با پاس شدن readiness ترافیک برمی‌گردد.",
          },
          componentIds: ["rs-v2", "pod-v2", "svc"],
          connectionIds: ["rs2-p", "svc-p2"],
        },
      ],
    },
  ],
  implement: [
    {
      id: "yaml",
      title: {
        en: "Set strategy.type Recreate",
        fa: "تنظیم strategy.type روی Recreate",
      },
      description: {
        en: "Per Kubernetes docs, Recreate kills existing Pods before creating new ones.",
        fa: "طبق مستندات Kubernetes، Recreate قبل از Pod جدید، Podهای موجود را terminate می‌کند.",
      },
      diagramComponentIds: ["deploy", "rs-v1", "rs-v2"],
      code: {
        language: "yaml",
        title: "deployment-recreate.yaml",
        code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo
spec:
  replicas: 3
  selector:
    matchLabels:
      app: demo
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: demo
    spec:
      containers:
        - name: demo
          image: registry.k8s.io/e2e-test-images/agnhost:2.39
          args: ["netexec", "--http-port=8080"]
          ports:
            - containerPort: 8080
          readinessProbe:
            httpGet:
              path: /readyz
              port: 8080`,
      },
    },
    {
      id: "apply",
      title: { en: "Apply and update image", fa: "اعمال و به‌روزرسانی image" },
      description: {
        en: "Watch Pod count drop to zero briefly during the swap.",
        fa: "در جابه‌جایی، تعداد Pod لحظه‌ای به صفر می‌رسد.",
      },
      diagramComponentIds: ["deploy", "gap", "pod-v2"],
      code: {
        language: "bash",
        title: "recreate roll",
        code: `kubectl apply -f deployment-recreate.yaml
kubectl set image deployment/demo demo=registry.k8s.io/e2e-test-images/agnhost:2.47
kubectl get pods -l app=demo -w`,
      },
      expectedOutput: `demo-xxx   1/1   Terminating   ...
demo-xxx   0/3   Pending       ...
demo-yyy   1/1   Running       ...`,
    },
  ],
  lab: basicLab(
    [
      labStep(
        "apply",
        {
          en: "Apply Recreate Deployment and Service",
          fa: "اعمال Deployment با Recreate و Service",
        },
        {
          language: "bash",
          title: "apply",
          code: `kubectl apply -f deployment-recreate.yaml
kubectl expose deployment demo --port=80 --target-port=8080`,
        },
        `deployment.apps/demo created
service/demo exposed`,
        {
          en: "Three Pods run under a single ReplicaSet revision.",
          fa: "سه Pod زیر یک revision از ReplicaSet اجرا می‌شوند.",
        },
        ["deploy", "pod-v1", "svc"],
      ),
      labStep(
        "swap",
        {
          en: "Change image and observe terminate-then-create",
          fa: "تغییر image و دیدن terminate سپس create",
        },
        {
          language: "bash",
          title: "set image",
          code: `kubectl set image deployment/demo demo=registry.k8s.io/e2e-test-images/agnhost:2.47
kubectl get endpoints demo -w`,
        },
        `demo   <none>   ...
demo   10.x.x.x:8080,...`,
        {
          en: "Endpoints may clear briefly between old and new Ready Pods.",
          fa: "endpointها بین Pod قدیم و جدید Ready ممکن است لحظه‌ای خالی شوند.",
        },
        ["gap", "pod-v2"],
      ),
    ],
    {
      prompt: {
        en: "Compare kubectl get rs during a Recreate vs RollingUpdate roll — how many RS have non-zero desired replicas?",
        fa: "در Recreate در برابر RollingUpdate، چند ReplicaSet desired غیرصفر دارند؟",
      },
      solution: {
        language: "bash",
        title: "compare rs",
        code: `kubectl get rs -l app=demo
kubectl describe deploy demo | sed -n '/StrategyType/,+3p'`,
      },
    },
  ),
  quiz: [
    q(
      "rc1",
      {
        en: "What does strategy.type Recreate guarantee about old and new Pods?",
        fa: "strategy.type Recreate دربارهٔ Pod قدیم و جدید چه تضمینی می‌دهد؟",
      },
      [
        {
          en: "Old Pods terminate before new ones are created",
          fa: "Podهای قدیمی قبل از ساخت جدید terminate می‌شوند",
        },
        {
          en: "Both versions run during maxSurge",
          fa: "هر دو نسخه در maxSurge هم‌زمان اجرا می‌شوند",
        },
        { en: "Only one Pod ever exists", fa: "فقط یک Pod همیشه وجود دارد" },
      ],
      0,
      {
        en: "Recreate is terminate-then-create, not gradual replacement.",
        fa: "Recreate یعنی terminate و بعد create، نه جایگزینی تدریجی.",
      },
    ),
    q(
      "rc2",
      {
        en: "During Recreate, Service endpoints may…",
        fa: "در Recreate، endpointهای Service ممکن است…",
      },
      [
        { en: "Be empty briefly", fa: "لحظه‌ای خالی باشند" },
        { en: "Always include both versions", fa: "همیشه هر دو نسخه را داشته باشند" },
        { en: "Ignore readiness", fa: "readiness را نادیده بگیرند" },
      ],
      0,
      {
        en: "No Ready Pods means no endpoints until v2 is up.",
        fa: "بدون Pod Ready، تا بالا آمدن v2 endpoint نیست.",
      },
    ),
    q(
      "rc3",
      {
        en: "maxSurge on a Recreate Deployment…",
        fa: "maxSurge روی Deployment با Recreate…",
      },
      [
        { en: "Is ignored (Recreate has no rollingUpdate)", fa: "نادیده گرفته می‌شود (Recreate بدون rollingUpdate)" },
        { en: "Must be 100%", fa: "باید ۱۰۰٪ باشد" },
        { en: "Controls canary weight", fa: "وزن canary را کنترل می‌کند" },
      ],
      0,
      {
        en: "Only RollingUpdate uses maxSurge/maxUnavailable.",
        fa: "فقط RollingUpdate از maxSurge و maxUnavailable استفاده می‌کند.",
      },
    ),
    q(
      "rc4",
      {
        en: "A good reason to choose Recreate is…",
        fa: "دلیل مناسب برای Recreate…",
      },
      [
        {
          en: "The app cannot tolerate two versions running",
          fa: "اپ تحمل دو نسخهٔ هم‌زمان را ندارد",
        },
        { en: "You need zero downtime always", fa: "همیشه به downtime صفر نیاز دارید" },
        { en: "You want automatic traffic splitting", fa: "تقسیم خودکار ترافیک می‌خواهید" },
      ],
      0,
      {
        en: "Exclusive runtime is the classic Recreate motivator.",
        fa: "اجرای انحصاری معمولاً دلیل انتخاب Recreate است.",
      },
    ),
    q(
      "rc5",
      {
        en: "After Recreate completes, which ReplicaSet typically has replicas?",
        fa: "بعد از اتمام Recreate، کدام ReplicaSet معمولاً replica دارد؟",
      },
      [
        { en: "The new revision (v2) only", fa: "فقط revision جدید (v2)" },
        { en: "Both v1 and v2 at full count", fa: "v1 و v2 هر دو با تعداد کامل" },
        { en: "Neither — Deployment deleted", fa: "هیچ‌کدام — Deployment حذف شده" },
      ],
      0,
      {
        en: "v1 is scaled to zero; v2 holds desired count.",
        fa: "v1 صفر است؛ v2 تعداد desired را دارد.",
      },
    ),
  ],
  troubleshooting: [
    troubleshoot(
      "rc-gap-long",
      {
        en: "Downtime lasts longer than expected after image change",
        fa: "بعد از تغییر image، downtime بیش از انتظار طول می‌کشد",
      },
      [
        {
          label: {
            en: "Check image pull, readinessProbe, and resource quotas on new Pods",
            fa: "pull image، readinessProbe و quota روی Pod جدید را ببینید",
          },
          correct: true,
          feedback: {
            en: "Recreate waits for new Pods to become available after the gap.",
            fa: "Recreate بعد از فاصله تا available شدن Pod جدید صبر می‌کند.",
          },
        },
        {
          label: {
            en: "Switch to Recreate mid-roll by deleting the Service",
            fa: "با حذف Service وسط roll به Recreate بروید",
          },
          correct: false,
          feedback: {
            en: "Fix Pod startup; strategy is declared on the Deployment.",
            fa: "start Pod را درست کنید؛ strategy روی Deployment تعریف می‌شود.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "diagnose",
          code: `kubectl get pods -l app=demo
kubectl describe pod -l app=demo | sed -n '/Events/,$p'`,
        },
      ],
      {
        en: "New Pods stuck Pending/CrashLoop extend the post-terminate gap.",
        fa: "Pod جدید در Pending یا CrashLoop فاصلهٔ بعد از terminate را طولانی می‌کند.",
      },
      {
        en: "Resolve pull/probe/resource issues; verify endpoints repopulate.",
        fa: "مشکل pull/probe/resource را حل کنید؛ endpointها دوباره پر شوند.",
      },
    ),
    troubleshoot(
      "rc-wrong-strategy",
      {
        en: "Expected downtime but old and new Pods overlap",
        fa: "downtime انتظار داشتید ولی Pod قدیم و جدید هم‌پوشانی دارند",
      },
      [
        {
          label: {
            en: "Confirm spec.strategy.type is Recreate, not RollingUpdate",
            fa: "مطمئن شوید spec.strategy.type برابر Recreate است نه RollingUpdate",
          },
          correct: true,
          feedback: {
            en: "RollingUpdate keeps both RS during the roll.",
            fa: "RollingUpdate در طول roll هر دو RS را نگه می‌دارد.",
          },
        },
        {
          label: {
            en: "Set maxUnavailable to 100% only",
            fa: "فقط maxUnavailable را ۱۰۰٪ بگذارید",
          },
          correct: false,
          feedback: {
            en: "That still rolls gradually unless type is Recreate.",
            fa: "بدون type=Recreate هنوز تدریجی است.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "strategy",
          code: `kubectl get deploy demo -o jsonpath='{.spec.strategy.type}{"\\n"}'
kubectl explain deployment.spec.strategy.type`,
        },
      ],
      {
        en: "Deployment still uses RollingUpdate (default).",
        fa: "Deployment هنوز RollingUpdate (پیش‌فرض) دارد.",
      },
      {
        en: "Patch strategy.type to Recreate and re-apply if needed.",
        fa: "strategy.type را Recreate کنید و در صورت نیاز دوباره apply کنید.",
      },
    ),
  ],
};
