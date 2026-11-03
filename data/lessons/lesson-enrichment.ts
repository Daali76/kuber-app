import type { DiagramFlow, Lesson, LessonBuildStep } from "@/lib/types";
import { QUIZ_SUPPLEMENTS } from "./quiz-supplements";

export const LESSON_BUILD_STEPS: Partial<Record<string, LessonBuildStep[]>> = {
  "control-plane": [
    {
      caption: {
        en: "You run kubectl apply; the request hits the API server over HTTPS.",
        fa: "kubectl apply را می‌زنید؛ درخواست با HTTPS به API server می‌رسد.",
      },
      componentIds: ["users", "apiserver"],
      connectionIds: ["users-api"],
    },
    {
      caption: {
        en: "After admission, the API server persists the object in etcd.",
        fa: "بعد از admission، API server object را در etcd ذخیره می‌کند.",
      },
      componentIds: ["users", "apiserver", "etcd"],
      connectionIds: ["users-api", "api-etcd"],
    },
    {
      caption: {
        en: "The scheduler binds a new Pod to a Node; controllers reconcile desired state.",
        fa: "scheduler، Pod جدید را به Node می‌چسباند؛ کنترلرها وضعیت مطلوب را reconcile می‌کنند.",
      },
      componentIds: ["scheduler", "controller-manager", "apiserver", "etcd"],
      connectionIds: ["sched-api", "cm-api", "api-etcd"],
    },
    {
      caption: {
        en: "kubelet on the Node pulls the Pod spec and asks the runtime to start containers.",
        fa: "kubelet روی Node مشخصات Pod را می‌گیرد و از runtime می‌خواهد containerها را بالا بیاورد.",
      },
      componentIds: ["kubelet", "runtime", "app-pod", "apiserver"],
      connectionIds: ["kubelet-api", "kubelet-runtime", "runtime-pod"],
    },
  ],
};

export const LESSON_FLOWS: Partial<Record<string, DiagramFlow[]>> = {
  "control-plane": [
    {
      id: "kubectl-apply",
      title: { en: "kubectl apply path", fa: "مسیر kubectl apply" },
      steps: [
        {
          caption: {
            en: "kubectl sends the manifest to the API server.",
            fa: "kubectl manifest را به API server می‌فرستد.",
          },
          componentIds: ["users", "apiserver"],
          connectionIds: ["users-api"],
        },
        {
          caption: {
            en: "Validated objects are stored in etcd.",
            fa: "objectهای تأییدشده در etcd ذخیره می‌شوند.",
          },
          componentIds: ["apiserver", "etcd"],
          connectionIds: ["api-etcd"],
        },
        {
          caption: {
            en: "Scheduler and controllers react; kubelet starts the Pod via CRI.",
            fa: "scheduler و کنترلرها واکنش نشان می‌دهند؛ kubelet از مسیر CRI، Pod را بالا می‌آورد.",
          },
          componentIds: ["scheduler", "kubelet", "runtime", "app-pod"],
          connectionIds: ["sched-api", "kubelet-api", "kubelet-runtime", "runtime-pod"],
        },
      ],
    },
  ],
  "service-dns": [
    {
      id: "svc-dns-pod",
      title: { en: "Service → DNS → Pod", fa: "Service → DNS → Pod" },
      steps: [
        {
          caption: {
            en: "A client Pod queries the cluster DNS Service (kube-dns).",
            fa: "Pod کلاینت، Service DNS کلاستر (kube-dns) را کوئری می‌کند.",
          },
          componentIds: ["app-pod", "coredns-svc"],
          connectionIds: ["pod-coredns"],
        },
        {
          caption: {
            en: "CoreDNS resolves the Service name using API data.",
            fa: "CoreDNS با داده‌ی API، نام Service را resolve می‌کند.",
          },
          componentIds: ["coredns", "apiserver", "svc"],
          connectionIds: ["coredns-api", "coredns-svc-pods"],
        },
        {
          caption: {
            en: "Traffic reaches backend Pods via the Service virtual IP and Endpoints.",
            fa: "ترافیک از IP مجازی Service و Endpoint به Podهای بک‌اند می‌رسد.",
          },
          componentIds: ["svc", "app-pod"],
          connectionIds: ["svc-pod"],
        },
      ],
    },
  ],
  ingress: [
    {
      id: "ingress-svc-pod",
      title: { en: "Ingress → Service → Pod", fa: "Ingress → Service → Pod" },
      steps: [
        {
          caption: {
            en: "External users hit the Ingress controller entry point.",
            fa: "کاربر بیرونی به نقطه‌ی ورود Ingress controller می‌رسد.",
          },
          componentIds: ["users", "ingress"],
          connectionIds: ["users-api"],
        },
        {
          caption: {
            en: "Ingress rules forward HTTP to the backend Service.",
            fa: "قواعد Ingress، HTTP را به Service بک‌اند می‌فرستد.",
          },
          componentIds: ["ingress", "svc"],
          connectionIds: ["ingress-svc"],
        },
        {
          caption: {
            en: "The Service load-balances to ready Pod endpoints.",
            fa: "Service بین Endpointهای Pod آماده توزیع می‌کند.",
          },
          componentIds: ["svc", "app-pod"],
          connectionIds: ["svc-pod"],
        },
      ],
    },
  ],
};

export const SUMMARY_SUPPLEMENTS: Partial<
  Record<string, { en: string; fa: string }>
> = {
  "container-image": {
    en: "Pull policy and image reference shape rollout behavior.",
    fa: "pull policy و مرجع image رفتار rollout را شکل می‌دهد.",
  },
  pod: {
    en: "Restart policy and probes belong in the Pod template.",
    fa: "restart policy و probe در قالب Pod تعریف می‌شوند.",
  },
  "node-kubelet": {
    en: "Node conditions surface in kubectl get nodes and affect scheduling.",
    fa: "شرایط Node در kubectl get nodes دیده می‌شود و روی زمان‌بندی اثر دارد.",
  },
  "control-plane": {
    en: "High availability means multiple API server/etcd members, not one giant Node.",
    fa: "دسترس‌پذیری بالا یعنی چند عضو API server/etcd، نه یک Node غول‌پیکر.",
  },
  "deployment-replicaset": {
    en: "kubectl rollout undo uses ReplicaSet history stored on the Deployment.",
    fa: "kubectl rollout undo از تاریخچه‌ی ReplicaSet روی Deployment استفاده می‌کند.",
  },
  "service-dns": {
    en: "Headless Services skip ClusterIP and publish Pod DNS directly.",
    fa: "Service headless، ClusterIP نمی‌گیرد و DNS مستقیم Pod منتشر می‌کند.",
  },
  namespace: {
    en: "ResourceQuota and LimitRange enforce caps per namespace.",
    fa: "ResourceQuota و LimitRange سقف را در هر Namespace اعمال می‌کنند.",
  },
  "configmap-secret": {
    en: "Mounted ConfigMaps update on a delay; env vars may need Pod restart.",
    fa: "ConfigMap mount با تأخیر به‌روز می‌شود؛ env ممکن است restart Pod بخواهد.",
  },
  daemonset: {
    en: "Taints and tolerations gate which nodes receive the DaemonSet Pod.",
    fa: "taint و toleration مشخص می‌کند کدام Node Pod DaemonSet را بگیرد.",
  },
  statefulset: {
    en: "Ordered readiness gates rolling updates for clustered apps.",
    fa: "آمادگی مرتب، rolling update اپ‌های خوشه‌ای را کنترل می‌کند.",
  },
  ingress: {
    en: "IngressClass picks which controller owns an Ingress object.",
    fa: "IngressClass مشخص می‌کند کدام controller مالک object Ingress است.",
  },
  "crd-operator": {
    en: "API aggregation and CRDs extend the schema kubectl understands.",
    fa: "CRD و aggregation، schemaای را که kubectl می‌شناسد گسترش می‌دهند.",
  },
  "admission-webhook": {
    en: "Failure policy (Fail vs Ignore) defines whether a webhook blocks writes.",
    fa: "failure policy (Fail در برابر Ignore) تعیین می‌کند webhook نوشتن را ببندد یا نه.",
  },
  sidecar: {
    en: "Native sidecar containers (when enabled) change startup ordering.",
    fa: "sidecar بومی (در صورت فعال بودن) ترتیب بالا آمدن را عوض می‌کند.",
  },
};

export function enrichLesson(lesson: Lesson): Lesson {
  const extraQuiz = QUIZ_SUPPLEMENTS[lesson.id] ?? [];
  const thirdSummary = SUMMARY_SUPPLEMENTS[lesson.id];
  const summaryLines =
    lesson.summaryLines && thirdSummary
      ? [...lesson.summaryLines.slice(0, 2), thirdSummary]
      : lesson.summaryLines;

  return {
    ...lesson,
    buildSteps: lesson.buildSteps ?? LESSON_BUILD_STEPS[lesson.id],
    flows: lesson.flows ?? LESSON_FLOWS[lesson.id],
    quiz: [...lesson.quiz, ...extraQuiz],
    summaryLines,
  };
}
