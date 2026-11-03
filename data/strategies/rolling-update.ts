import type { Strategy } from "@/lib/types";
import {
  basicLab,
  comp,
  conn,
  labStep,
  q,
  troubleshoot,
} from "./_helpers";

export const rollingUpdate: Strategy = {
  id: "rolling-update",
  name: {
    en: "Rolling Update",
    fa: "Rolling Update",
  },
  category: "native",
  summary: {
    en: "Native Kubernetes Deployment strategy that replaces Pods gradually using maxSurge and maxUnavailable.",
    fa: "استراتژی بومی Deployment در Kubernetes که Podها را با maxSurge و maxUnavailable به‌تدریج عوض می‌کند.",
  },
  whyItExists: {
    en: "Teams need zero-or-low downtime updates without a separate progressive-delivery controller.",
    fa: "تیم‌ها می‌خواهند به‌روزرسانی با downtime کم داشته باشند؛ بدون کنترلر progressive delivery جدا.",
  },
  analogy: {
    en: "Repainting lanes on a highway one at a time while traffic still flows on the open lanes.",
    fa: "مثل رنگ‌زدن لاین‌های بزرگراه یکی‌یکی؛ ترافیک روی لاین‌های باز ادامه دارد.",
  },
  howItWorks: [
    {
      en: "The Deployment creates a new ReplicaSet (v2) while keeping the old ReplicaSet (v1).",
      fa: "Deployment یک ReplicaSet جدید (v2) می‌سازد و ReplicaSet قبلی (v1) را نگه می‌دارد.",
    },
    {
      en: "Controller scales up v2 and scales down v1 within maxSurge / maxUnavailable bounds.",
      fa: "کنترلر در محدودهٔ maxSurge و maxUnavailable، v2 را بالا و v1 را پایین می‌آورد.",
    },
    {
      en: "A Pod counts toward available capacity after it passes readiness (and minReadySeconds if set).",
      fa: "پس از عبور از readiness (و در صورت تنظیم، minReadySeconds) Pod در ظرفیت available حساب می‌شود.",
    },
    {
      en: "A Service selecting the app labels continues to send traffic to Ready Pods from both ReplicaSets during the roll.",
      fa: "Service با labelهای اپ، در طول rollout به Podهای Ready از هر دو ReplicaSet ترافیک می‌فرستد.",
    },
  ],
  useWhen: [
    {
      en: "Stateless apps that tolerate mixed versions briefly",
      fa: "اپ‌های بدون state که نسخهٔ مخلوط کوتاه را تحمل می‌کنند",
    },
    {
      en: "You want the built-in Deployment controller only",
      fa: "فقط کنترلر داخلی Deployment کافی است",
    },
  ],
  avoidWhen: [
    {
      en: "You need percentage traffic splits, analysis gates, or preview Services",
      fa: "به تقسیم درصدی ترافیک، دروازهٔ analysis یا Service پیش‌نمایش نیاز دارید",
    },
    {
      en: "The app cannot run two versions at once",
      fa: "اپ نمی‌تواند دو نسخه را هم‌زمان اجرا کند",
    },
  ],
  docsUrl:
    "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-update-deployment",
  relatedToolIds: ["kubernetes"],
  relatedStrategyIds: ["recreate", "canary-argo-rollouts", "compare-strategies"],
  placementBlurb: {
    en: "Deployment + ReplicaSets + Pods in a Namespace; Service selects Ready Pods",
    fa: "Deployment و ReplicaSet و Pod در Namespace؛ Service، Podهای Ready را انتخاب می‌کند",
  },
  interactive: "rolling-sliders",
  diagram: {
    components: [
      comp({
        id: "deploy",
        label: "Deployment",
        zone: "namespace",
        objectType: "Deployment",
        highlight: true,
        description:
          "Deployment owns the rollingUpdate strategy and ReplicaSet revisions.",
        whyThere: "Desired replica count and strategy live on the Deployment.",
      }),
      comp({
        id: "rs-v1",
        label: "ReplicaSet v1",
        zone: "namespace",
        objectType: "Deployment",
        highlight: true,
        description: "Old revision ReplicaSet being scaled down.",
        whyThere: "Previous Pod template stays until the roll finishes.",
      }),
      comp({
        id: "rs-v2",
        label: "ReplicaSet v2",
        zone: "namespace",
        objectType: "Deployment",
        highlight: true,
        description: "New revision ReplicaSet being scaled up.",
        whyThere: "New Pod template is introduced gradually.",
      }),
      comp({
        id: "pod-v1",
        label: "Pods v1",
        zone: "pod",
        objectType: "Pod",
        highlight: true,
        description: "Pods from the old ReplicaSet.",
        whyThere: "Still serving until scaled down and replaced.",
      }),
      comp({
        id: "pod-v2",
        label: "Pods v2",
        zone: "pod",
        objectType: "Pod",
        highlight: true,
        description: "Pods from the new ReplicaSet; readiness gates progress.",
        whyThere: "Must become Ready before counting as available.",
      }),
      comp({
        id: "svc",
        label: "Service",
        zone: "namespace",
        objectType: "Service",
        highlight: true,
        description:
          "Selects Pods by label; endpoints include Ready Pods from both RS during the roll.",
        whyThere: "Stable VIP while Pods churn.",
      }),
    ],
    connections: [
      conn("d-rs1", "deploy", "rs-v1", "owns"),
      conn("d-rs2", "deploy", "rs-v2", "owns"),
      conn("rs1-p", "rs-v1", "pod-v1", "runs"),
      conn("rs2-p", "rs-v2", "pod-v2", "runs"),
      conn("svc-p1", "svc", "pod-v1", "select Ready"),
      conn("svc-p2", "svc", "pod-v2", "select Ready"),
    ],
  },
  beforeAfter: {
    beforeComponentIds: ["deploy", "rs-v1", "pod-v1", "svc"],
    afterComponentIds: [
      "deploy",
      "rs-v1",
      "rs-v2",
      "pod-v1",
      "pod-v2",
      "svc",
    ],
  },
  flows: [
    {
      id: "roll-success",
      title: {
        en: "Rolling update (readiness-gated)",
        fa: "Rolling update (با readiness)",
      },
      steps: [
        {
          caption: {
            en: "Change the Pod template; Deployment creates ReplicaSet v2.",
            fa: "قالب Pod عوض می‌شود؛ Deployment، ReplicaSet v2 را می‌سازد.",
          },
          componentIds: ["deploy", "rs-v2"],
          connectionIds: ["d-rs2"],
        },
        {
          caption: {
            en: "Scale up v2 within maxSurge; new Pods must pass readiness.",
            fa: "در حد maxSurge، v2 بالا می‌آید؛ Podهای جدید باید readiness را پاس کنند.",
          },
          componentIds: ["rs-v2", "pod-v2", "svc"],
          connectionIds: ["rs2-p", "svc-p2"],
        },
        {
          caption: {
            en: "Scale down v1 within maxUnavailable; Service keeps Ready endpoints.",
            fa: "در حد maxUnavailable، v1 پایین می‌آید؛ Service endpointهای Ready را نگه می‌دارد.",
          },
          componentIds: ["rs-v1", "pod-v1", "svc", "pod-v2"],
          connectionIds: ["rs1-p", "svc-p1", "svc-p2"],
        },
        {
          caption: {
            en: "Roll completes: v2 owns all replicas; old RS retained per revisionHistoryLimit.",
            fa: "roll تمام می‌شود: همه replicaها روی v2؛ RS قبلی طبق revisionHistoryLimit می‌ماند.",
          },
          componentIds: ["deploy", "rs-v2", "pod-v2", "svc"],
          connectionIds: ["d-rs2", "rs2-p", "svc-p2"],
        },
      ],
    },
  ],
  implement: [
    {
      id: "yaml",
      title: {
        en: "Declare RollingUpdate on the Deployment",
        fa: "اعلام RollingUpdate روی Deployment",
      },
      description: {
        en: "Per Kubernetes docs, strategy.type RollingUpdate uses maxUnavailable and maxSurge (absolute or percent).",
        fa: "طبق مستندات Kubernetes، نوع RollingUpdate فیلدهای maxUnavailable و maxSurge دارد (عدد یا درصد).",
      },
      diagramComponentIds: ["deploy", "rs-v1", "rs-v2"],
      code: {
        language: "yaml",
        title: "deployment-rolling.yaml",
        code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo
spec:
  replicas: 4
  selector:
    matchLabels:
      app: demo
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
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
              port: 8080
            initialDelaySeconds: 2
            periodSeconds: 5`,
      },
    },
    {
      id: "apply",
      title: { en: "Apply and watch the rollout", fa: "اعمال و تماشای rollout" },
      description: {
        en: "kubectl rollout status waits until the Deployment is considered complete.",
        fa: "دستور kubectl rollout status تا تکمیل Deployment صبر می‌کند.",
      },
      diagramComponentIds: ["deploy", "pod-v2", "svc"],
      code: {
        language: "bash",
        title: "rollout status",
        code: `kubectl apply -f deployment-rolling.yaml
kubectl rollout status deployment/demo
kubectl get rs -l app=demo`,
      },
      expectedOutput: `deployment "demo" successfully rolled out
NAME              DESIRED   CURRENT   READY   AGE
demo-xxxxxxxxxx   4         4         4       30s
demo-yyyyyyyyyy   0         0         0       2m`,
    },
    {
      id: "undo",
      title: { en: "Undo if needed", fa: "در صورت نیاز undo" },
      description: {
        en: "kubectl rollout undo rolls back to the previous revision recorded by the Deployment.",
        fa: "kubectl rollout undo به revision قبلی ثبت‌شده در Deployment برمی‌گردد.",
      },
      diagramComponentIds: ["deploy", "rs-v1"],
      code: {
        language: "bash",
        title: "rollout undo",
        code: `kubectl rollout undo deployment/demo
kubectl rollout status deployment/demo`,
      },
      expectedOutput: `deployment.apps/demo rolled back
Waiting for deployment "demo" rollout to finish...
deployment "demo" successfully rolled out`,
    },
  ],
  lab: basicLab(
    [
      labStep(
        "apply-deploy",
        {
          en: "Apply the Deployment and a ClusterIP Service",
          fa: "اعمال Deployment و Service از نوع ClusterIP",
        },
        {
          language: "bash",
          title: "apply",
          code: `kubectl apply -f deployment-rolling.yaml
kubectl expose deployment demo --port=80 --target-port=8080 --name=demo
kubectl get pods -l app=demo -o wide`,
        },
        `deployment.apps/demo created
service/demo exposed
NAME                    READY   STATUS    RESTARTS   AGE
demo-xxxxxxxxxx-aaaaa   1/1     Running   0          15s`,
        {
          en: "Deployment and Service exist; Pods become Ready via the readinessProbe.",
          fa: "Deployment و Service ساخته شدند؛ Podها با readinessProbe به Ready می‌رسند.",
        },
        ["deploy", "svc", "pod-v1"],
      ),
      labStep(
        "trigger-roll",
        {
          en: "Change the image to trigger a rolling update",
          fa: "تغییر image برای شروع rolling update",
        },
        {
          language: "bash",
          title: "set image",
          code: `kubectl set image deployment/demo demo=registry.k8s.io/e2e-test-images/agnhost:2.47
kubectl rollout status deployment/demo`,
        },
        `deployment.apps/demo image updated
Waiting for deployment "demo" rollout to finish...
deployment "demo" successfully rolled out`,
        {
          en: "A new ReplicaSet scaled up under maxSurge while the old one scaled down under maxUnavailable.",
          fa: "ReplicaSet جدید زیر maxSurge بالا آمد و قبلی زیر maxUnavailable پایین رفت.",
        },
        ["rs-v2", "pod-v2", "rs-v1"],
      ),
    ],
    {
      prompt: {
        en: "Set maxUnavailable to 0 and maxSurge to 1, then roll again. What does that guarantee about available Pods?",
        fa: "مقدار maxUnavailable را ۰ و maxSurge را ۱ کنید و دوباره roll کنید. دربارهٔ Podهای available چه تضمینی می‌دهد؟",
      },
      solution: {
        language: "bash",
        title: "patch strategy",
        code: `kubectl patch deployment demo -p '{"spec":{"strategy":{"rollingUpdate":{"maxUnavailable":0,"maxSurge":1}}}}'
kubectl set image deployment/demo demo=registry.k8s.io/e2e-test-images/agnhost:2.39
kubectl rollout status deployment/demo`,
      },
    },
  ),
  quiz: [
    q(
      "ru1",
      {
        en: "Which fields bound a RollingUpdate?",
        fa: "کدام فیلدها محدودهٔ RollingUpdate را تعیین می‌کنند؟",
      },
      [
        { en: "maxSurge and maxUnavailable", fa: "maxSurge و maxUnavailable" },
        { en: "setWeight only", fa: "فقط setWeight" },
        { en: "activeService / previewService", fa: "activeService / previewService" },
      ],
      0,
      {
        en: "Kubernetes Deployment rollingUpdate uses those two fields.",
        fa: "در Deployment بومی Kubernetes همین دو فیلد استفاده می‌شود.",
      },
    ),
    q(
      "ru2",
      {
        en: "When does a new Pod count as available during a roll?",
        fa: "در طول roll، Pod جدید چه زمانی available حساب می‌شود؟",
      },
      [
        {
          en: "After readiness (and minReadySeconds if set)",
          fa: "پس از readiness (و در صورت تنظیم، minReadySeconds)",
        },
        { en: "As soon as the container starts", fa: "به‌محض start کانتینر" },
        { en: "Only after etcd compaction", fa: "فقط بعد از compaction در etcd" },
      ],
      0,
      {
        en: "Availability is readiness-gated for Deployments.",
        fa: "availability در Deployment به readiness وابسته است.",
      },
    ),
    q(
      "ru3",
      {
        en: "What does kubectl rollout undo do?",
        fa: "دستور kubectl rollout undo چه می‌کند؟",
      },
      [
        {
          en: "Rolls the Deployment back to a previous revision",
          fa: "Deployment را به revision قبلی برمی‌گرداند",
        },
        { en: "Deletes the cluster", fa: "کلاستر را حذف می‌کند" },
        { en: "Disables the Service", fa: "Service را خاموش می‌کند" },
      ],
      0,
      {
        en: "Undo uses revision history kept by the Deployment.",
        fa: "undo از تاریخچهٔ revision همان Deployment استفاده می‌کند.",
      },
    ),
    q(
      "ru4",
      {
        en: "During a roll, who receives Service traffic?",
        fa: "در طول roll، ترافیک Service به چه کسی می‌رسد؟",
      },
      [
        {
          en: "Ready Pods matching the selector (possibly both versions)",
          fa: "Podهای Ready مطابق selector (احتمالاً هر دو نسخه)",
        },
        { en: "Only the newest Pod, always", fa: "همیشه فقط جدیدترین Pod" },
        { en: "Only kube-apiserver", fa: "فقط kube-apiserver" },
      ],
      0,
      {
        en: "Endpoints track Ready Pods for the Service selector.",
        fa: "endpointها Podهای Ready با selector همان Service را دنبال می‌کنند.",
      },
    ),
    q(
      "ru5",
      {
        en: "maxSurge: 0 and maxUnavailable: 0 together are…",
        fa: "ترکیب maxSurge: 0 و maxUnavailable: 0 …",
      },
      [
        {
          en: "Invalid / cannot progress a roll (no room to create or remove)",
          fa: "نامعتبر / roll پیش نمی‌رود (جا برای ساخت یا حذف نیست)",
        },
        { en: "The default for every cluster", fa: "پیش‌فرض همهٔ کلاسترها" },
        { en: "Required for Recreate", fa: "برای Recreate الزامی است" },
      ],
      0,
      {
        en: "The roll needs surge and/or unavailable capacity to move replicas.",
        fa: "برای جابه‌جایی replica به surge یا unavailable نیاز است.",
      },
    ),
  ],
  troubleshooting: [
    troubleshoot(
      "ru-stuck",
      {
        en: "rollout status hangs; new Pods never become Ready",
        fa: "rollout status گیر می‌کند؛ Podهای جدید Ready نمی‌شوند",
      },
      [
        {
          label: {
            en: "Check readinessProbe, image pull, and events",
            fa: "readinessProbe، pull image و eventها را ببینید",
          },
          correct: true,
          feedback: {
            en: "Unavailable new Pods block progress when maxUnavailable is tight.",
            fa: "Pod جدید غیر Ready وقتی maxUnavailable تنگ باشد progress را می‌بندد.",
          },
        },
        {
          label: {
            en: "Delete etcd to force progress",
            fa: "etcd را حذف کنید تا progress اجباری شود",
          },
          correct: false,
          feedback: {
            en: "Never — diagnose the Pod instead.",
            fa: "هرگز — به‌جاش خود Pod را عیب‌یابی کنید.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "diagnose",
          code: `kubectl describe deploy demo
kubectl get pods -l app=demo
kubectl describe pod -l app=demo | sed -n '/Events/,$p'`,
        },
      ],
      {
        en: "Failing readiness or image pulls keep the new RS from becoming available.",
        fa: "شکست readiness یا pull باعث می‌شود RS جدید available نشود.",
      },
      {
        en: "Fix the probe/image; optionally raise maxUnavailable temporarily after you understand risk.",
        fa: "probe یا image را درست کنید؛ در صورت نیاز آگاهانه maxUnavailable را موقتاً بالا ببرید.",
      },
    ),
    troubleshoot(
      "ru-undo",
      {
        en: "Bad image shipped; need previous revision quickly",
        fa: "image بد آمده؛ سریع به revision قبل نیاز دارید",
      },
      [
        {
          label: {
            en: "kubectl rollout undo deployment/demo",
            fa: "kubectl rollout undo deployment/demo",
          },
          correct: true,
          feedback: {
            en: "Undo triggers another roll back to the prior template.",
            fa: "undo یک roll دیگر به قالب قبلی راه می‌اندازد.",
          },
        },
        {
          label: {
            en: "Only edit Service to point at a hostname outside the cluster",
            fa: "فقط Service را به یک hostname بیرون کلاستر بدهید",
          },
          correct: false,
          feedback: {
            en: "That bypasses Deployment history and usually breaks discovery.",
            fa: "تاریخچهٔ Deployment را دور می‌زند و معمولاً discovery را می‌شکند.",
          },
        },
      ],
      [
        {
          language: "bash",
          title: "history",
          code: `kubectl rollout history deployment/demo
kubectl rollout undo deployment/demo`,
        },
      ],
      {
        en: "Deployment keeps prior revisions for undo/rollback.",
        fa: "Deployment revisionهای قبلی را برای undo نگه می‌دارد.",
      },
      {
        en: "Undo, then verify with rollout status and pod images.",
        fa: "undo کنید؛ بعد با rollout status و image روی Podها تأیید کنید.",
      },
    ),
  ],
};
