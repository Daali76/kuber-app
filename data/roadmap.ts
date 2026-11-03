import type { RoadmapStep } from "@/lib/types";

export const roadmapSteps: RoadmapStep[] = [
  {
    id: "containers",
    title: "Containers & runtime",
    description:
      "Learn images, containers, and how CRI runtimes execute pods on a node.",
    toolIds: ["containerd", "cri-o"],
  },
  {
    id: "kubernetes-basics",
    title: "Kubernetes basics",
    description:
      "Pods, Deployments, Services, and the control plane that schedules them.",
    toolIds: ["kubernetes", "etcd", "coredns"],
  },
  {
    id: "helm",
    title: "Package with Helm",
    description:
      "Templated charts for repeatable installs and upgrades of Kubernetes apps.",
    toolIds: ["helm"],
  },
  {
    id: "gitops",
    title: "GitOps delivery",
    description:
      "Declare desired state in Git and reconcile clusters continuously.",
    toolIds: ["argo-cd", "flux"],
  },
  {
    id: "observability",
    title: "Observability",
    description:
      "Collect metrics, traces, and logs so you can debug production systems.",
    toolIds: ["prometheus", "opentelemetry", "jaeger", "fluentd"],
  },
  {
    id: "service-mesh",
    title: "Service mesh & networking",
    description:
      "Secure service-to-service traffic, observability, and advanced routing.",
    toolIds: ["cilium", "istio", "linkerd", "envoy"],
  },
  {
    id: "security",
    title: "Security & policy",
    description:
      "Admission policy, runtime detection, certificates, and workload identity.",
    toolIds: ["opa", "kyverno", "falco", "cert-manager", "spiffe", "spire"],
  },
];
