import type { LearnModule } from "@/lib/types";

export const learnModules: LearnModule[] = [
  {
    id: "containers",
    order: 1,
    title: { en: "Containers", fa: "containerها" },
    goals: [
      { en: "Images, runtimes, and the Pod wrapper.", fa: "image، runtime و لایه‌ی Pod." },
      { en: "Build a mental model before the control plane.", fa: "مدل ذهنی قبل از control plane." },
    ],
    prerequisites: [],
    lessonIds: ["container-image", "pod"],
  },
  {
    id: "k8s-architecture",
    order: 2,
    title: { en: "Kubernetes architecture", fa: "معماری Kubernetes" },
    goals: [
      { en: "Control plane, nodes, and namespaces.", fa: "control plane، Node و Namespace." },
      { en: "How kubectl reaches the API.", fa: "مسیر kubectl تا API." },
    ],
    prerequisites: ["containers"],
    lessonIds: ["node-kubelet", "control-plane", "namespace", "kubeconfig-contexts"],
  },
  {
    id: "workloads",
    order: 3,
    title: { en: "Workloads", fa: "Workloadها" },
    goals: [
      { en: "Controllers for stateless and stateful apps.", fa: "کنترلر برای اپ stateless و stateful." },
      { en: "Jobs, scaling, and rollouts.", fa: "Job، مقیاس و rollout." },
    ],
    prerequisites: ["k8s-architecture"],
    lessonIds: [
      "deployment-replicaset",
      "daemonset",
      "statefulset",
      "job-cronjob",
      "hpa",
      "rollout-strategies",
    ],
  },
  {
    id: "networking-dns",
    order: 4,
    title: { en: "Networking & DNS", fa: "شبکه و DNS" },
    goals: [
      { en: "Services, Ingress, and cluster DNS.", fa: "Service، Ingress و DNS کلاستر." },
      { en: "Policy and CNI basics.", fa: "سیاست و مبانی CNI." },
    ],
    prerequisites: ["workloads"],
    lessonIds: [
      "service-dns",
      "service-types",
      "ingress",
      "endpoints-endpointslice",
      "network-policy",
      "cni-basics",
    ],
  },
  {
    id: "config-storage",
    order: 5,
    title: { en: "Config & storage", fa: "پیکربندی و ذخیره" },
    goals: [
      { en: "ConfigMaps, Secrets, volumes.", fa: "ConfigMap، Secret و volume." },
      { en: "Requests, limits, and StorageClass.", fa: "request، limit و StorageClass." },
    ],
    prerequisites: ["networking-dns"],
    lessonIds: [
      "configmap-secret",
      "persistent-volume-storage",
      "storageclass",
      "resource-requests-limits",
    ],
  },
  {
    id: "extending-k8s",
    order: 6,
    title: { en: "Extending Kubernetes", fa: "گسترش Kubernetes" },
    goals: [
      { en: "CRDs, Operators, admission, sidecars.", fa: "CRD، Operator، admission و sidecar." },
    ],
    prerequisites: ["config-storage"],
    lessonIds: ["crd-operator", "admission-webhook", "sidecar"],
  },
  {
    id: "packaging-gitops",
    order: 7,
    title: { en: "Packaging & GitOps", fa: "بسته‌بندی و GitOps" },
    goals: [
      { en: "Helm charts and Git-driven deploys.", fa: "Helm chart و استقرار مبتنی بر Git." },
    ],
    prerequisites: ["extending-k8s"],
    lessonIds: ["helm-basics", "gitops-basics"],
  },
  {
    id: "observability",
    order: 8,
    title: { en: "Observability", fa: "Observability" },
    goals: [
      { en: "Metrics, logs, traces, and debug loops.", fa: "metric، لاگ، trace و حلقه‌ی دیباگ." },
    ],
    prerequisites: ["packaging-gitops"],
    lessonIds: ["prometheus-basics", "logging-tracing", "troubleshooting-workloads"],
  },
  {
    id: "security",
    order: 9,
    title: { en: "Security", fa: "امنیت" },
    goals: [
      { en: "RBAC and Pod hardening baselines.", fa: "RBAC و خط پایه سخت‌سازی Pod." },
    ],
    prerequisites: ["observability"],
    lessonIds: ["rbac", "pod-security-standards"],
  },
];

export function getModuleForLesson(lessonId: string): LearnModule | undefined {
  return learnModules.find((m) => m.lessonIds.includes(lessonId));
}
