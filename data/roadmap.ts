import type { RoadmapStep } from "@/lib/types";

export const roadmapSteps: RoadmapStep[] = [
  {
    id: "containers",
    title: "Containers & runtime",
    description: "How images become running containers on a node.",
    toolIds: ["containerd"],
  },
  {
    id: "kubernetes-basics",
    title: "Kubernetes basics",
    description: "Control plane, kubelet, Pods, and Services.",
    toolIds: ["kubernetes", "coredns"],
  },
  {
    id: "helm",
    title: "Package with Helm",
    description: "Charts and releases against the API server.",
    toolIds: ["helm"],
  },
  {
    id: "gitops",
    title: "GitOps delivery",
    description: "Declare desired state in Git and reconcile continuously.",
    toolIds: ["argo-cd"],
  },
  {
    id: "observability",
    title: "Observability",
    description: "Metrics, dashboards, traces, and logs.",
    toolIds: ["prometheus", "grafana", "opentelemetry", "fluent-bit"],
  },
  {
    id: "service-mesh",
    title: "Networking & mesh",
    description: "CNI policy and service mesh traffic control.",
    toolIds: ["cilium", "istio"],
  },
  {
    id: "security",
    title: "Security & policy",
    description: "Admission policy, runtime detection, and certificates.",
    toolIds: ["kyverno", "falco", "cert-manager"],
  },
  {
    id: "storage",
    title: "Storage",
    description: "Software-defined storage with Rook/Ceph.",
    toolIds: ["rook"],
  },
];
