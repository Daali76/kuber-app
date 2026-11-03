import type { DiagramComponent, DiagramConnection } from "@/lib/types";

/** Shared Kubernetes cluster skeleton present on every tool diagram. */
export function clusterBase(opts?: {
  highlightApi?: boolean;
  highlightEtcd?: boolean;
  highlightScheduler?: boolean;
  highlightCM?: boolean;
  highlightKubelet?: boolean;
  highlightRuntime?: boolean;
  highlightAppPod?: boolean;
  highlightSvc?: boolean;
  highlightIngress?: boolean;
}): { components: DiagramComponent[]; connections: DiagramConnection[] } {
  const o = opts ?? {};
  const components: DiagramComponent[] = [
    {
      id: "users",
      label: "Users / kubectl",
      zone: "external",
      slot: "users",
      objectType: "External",
      description: "Operators and developers interacting with the cluster.",
      whyThere: "Clients live outside the cluster and call the API server.",
      highlight: false,
    },
    {
      id: "git",
      label: "Git repo",
      zone: "external",
      slot: "git",
      objectType: "External",
      description: "Source of truth for manifests and application config.",
      whyThere: "GitOps and CI pull desired state from outside the cluster.",
      highlight: false,
    },
    {
      id: "cloud-storage",
      label: "Cloud / object storage",
      zone: "external",
      slot: "storage",
      objectType: "External",
      description: "External disks, S3-compatible buckets, or cloud DBs.",
      whyThere: "Durable data often lives outside node-local disks.",
      highlight: false,
    },
    {
      id: "apiserver",
      label: "API server",
      zone: "control-plane",
      slot: "apiserver",
      objectType: "ControlPlane",
      description: "Kubernetes front door — validates and serves the API.",
      whyThere: "All cluster state changes go through the API server.",
      highlight: !!o.highlightApi,
    },
    {
      id: "etcd",
      label: "etcd",
      zone: "control-plane",
      slot: "etcd",
      objectType: "ControlPlane",
      description: "Consistent key-value store for cluster state.",
      whyThere: "Control-plane source of truth for objects.",
      highlight: !!o.highlightEtcd,
    },
    {
      id: "scheduler",
      label: "Scheduler",
      zone: "control-plane",
      slot: "scheduler",
      objectType: "ControlPlane",
      description: "Assigns Pods to Nodes.",
      whyThere: "Runs as a control-plane component watching unbound Pods.",
      highlight: !!o.highlightScheduler,
    },
    {
      id: "controller-manager",
      label: "Controller manager",
      zone: "control-plane",
      slot: "cm",
      objectType: "ControlPlane",
      description: "Runs built-in controllers (Deployments, Endpoints, …).",
      whyThere: "Reconciliation loops belong in the control plane.",
      highlight: !!o.highlightCM,
    },
    {
      id: "kubelet",
      label: "kubelet",
      zone: "worker-node",
      slot: "kubelet",
      objectType: "NodeProcess",
      description: "Node agent that starts pods via the CRI runtime.",
      whyThere: "Must run on every worker to manage local pods.",
      highlight: !!o.highlightKubelet,
    },
    {
      id: "runtime",
      label: "Container runtime",
      zone: "worker-node",
      slot: "runtime",
      objectType: "NodeProcess",
      description: "CRI implementation (e.g. containerd) that runs containers.",
      whyThere: "Containers execute on the node OS under the runtime.",
      highlight: !!o.highlightRuntime,
    },
    {
      id: "app-pod",
      label: "App Pod",
      zone: "pod",
      slot: "app",
      objectType: "Pod",
      description: "Example application workload.",
      whyThere: "User workloads run as Pods on worker nodes.",
      highlight: !!o.highlightAppPod,
    },
    {
      id: "svc",
      label: "Service",
      zone: "namespace",
      slot: "svc",
      objectType: "Service",
      description: "Stable virtual IP / DNS name for a set of Pods.",
      whyThere: "Cluster networking abstraction in a namespace.",
      highlight: !!o.highlightSvc,
    },
    {
      id: "ingress",
      label: "Ingress / Gateway",
      zone: "namespace",
      slot: "ingress",
      objectType: "Ingress",
      description: "HTTP(S) entry point into Services.",
      whyThere: "Edge routing is declared as cluster objects.",
      highlight: !!o.highlightIngress,
    },
  ];

  const connections: DiagramConnection[] = [
    {
      id: "users-api",
      from: "users",
      to: "apiserver",
      label: "HTTPS :6443",
      highlight: false,
    },
    {
      id: "api-etcd",
      from: "apiserver",
      to: "etcd",
      label: "gRPC :2379",
      highlight: false,
    },
    {
      id: "sched-api",
      from: "scheduler",
      to: "apiserver",
      label: "watch Pods",
      highlight: false,
    },
    {
      id: "cm-api",
      from: "controller-manager",
      to: "apiserver",
      label: "reconcile",
      highlight: false,
    },
    {
      id: "kubelet-api",
      from: "kubelet",
      to: "apiserver",
      label: "status / specs",
      highlight: false,
    },
    {
      id: "kubelet-runtime",
      from: "kubelet",
      to: "runtime",
      label: "CRI",
      highlight: false,
    },
    {
      id: "runtime-pod",
      from: "runtime",
      to: "app-pod",
      label: "run containers",
      highlight: false,
    },
    {
      id: "svc-pod",
      from: "svc",
      to: "app-pod",
      label: "Endpoints",
      highlight: false,
    },
    {
      id: "ingress-svc",
      from: "ingress",
      to: "svc",
      label: "HTTP route",
      highlight: false,
    },
  ];

  return { components, connections };
}

export function mergeDiagram(
  base: { components: DiagramComponent[]; connections: DiagramConnection[] },
  extra: { components: DiagramComponent[]; connections: DiagramConnection[] },
): { components: DiagramComponent[]; connections: DiagramConnection[] } {
  const byId = new Map(base.components.map((c) => [c.id, c]));
  for (const c of extra.components) byId.set(c.id, c);
  const connById = new Map(base.connections.map((c) => [c.id, c]));
  for (const c of extra.connections) connById.set(c.id, c);
  return {
    components: [...byId.values()],
    connections: [...connById.values()],
  };
}
