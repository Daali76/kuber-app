import { clusterBase, mergeDiagram } from "./_base";

const base = clusterBase({
  highlightApi: true,
  highlightEtcd: true,
  highlightScheduler: true,
  highlightCM: true,
  highlightKubelet: true,
  highlightRuntime: true,
  highlightAppPod: true,
  highlightSvc: true,
});

export const kubernetes = {
  id: "kubernetes",
  name: "Kubernetes",
  layer: "orchestration",
  maturity: "Graduated",
  summary:
    "Portable platform for automating deployment, scaling, and operations of containers.",
  problem:
    "Running many containers across machines needs scheduling, healing, and a shared API.",
  placementBlurb: "Control plane + kubelet on every node",
  levels: {
    beginner:
      "You declare Pods and Deployments; the control plane places them on nodes and restarts failures.",
    intermediate:
      "Services, Ingress/Gateway, ConfigMaps, Secrets, and RBAC shape real application platforms.",
    advanced:
      "Operators, scheduling plugins, and multi-cluster topologies extend the API for platforms.",
  },
  useWhen: [
    "You run many containerized services that need orchestration",
    "You want a portable API across clouds and on-prem",
  ],
  avoidWhen: [
    "A single VM or managed serverless covers the workload",
    "Operational overhead outweighs benefits for a tiny team",
  ],
  alternatives: [
    {
      id: "helm",
      comparison: "Helm packages apps for Kubernetes; it does not replace the orchestrator.",
    },
  ],
  docsUrl: "https://kubernetes.io/docs/home/",
  repoUrl: "https://github.com/kubernetes/kubernetes",
  diagram: mergeDiagram(base, {
    components: [
      {
        id: "apiserver",
        label: "API server",
        zone: "control-plane",
        slot: "apiserver",
        objectType: "ControlPlane",
        description: "kube-apiserver — validates and serves the Kubernetes API.",
        whyThere: "Central control-plane process; clients and controllers talk only here.",
        highlight: true,
        stepIds: ["install", "verify"],
      },
      {
        id: "etcd",
        label: "etcd",
        zone: "control-plane",
        slot: "etcd",
        objectType: "ControlPlane",
        description: "Stores all cluster object state.",
        whyThere: "API server persists objects in etcd.",
        highlight: true,
        stepIds: ["install"],
      },
      {
        id: "scheduler",
        label: "kube-scheduler",
        zone: "control-plane",
        slot: "scheduler",
        objectType: "ControlPlane",
        description: "Binds Pods to Nodes.",
        whyThere: "Watches the API for unbound Pods.",
        highlight: true,
        stepIds: ["install", "example"],
      },
      {
        id: "controller-manager",
        label: "kube-controller-manager",
        zone: "control-plane",
        slot: "cm",
        objectType: "ControlPlane",
        description: "Runs controllers that reconcile Deployments, ReplicaSets, etc.",
        whyThere: "Built-in reconciliation belongs in the control plane.",
        highlight: true,
        stepIds: ["install", "example"],
      },
      {
        id: "kubelet",
        label: "kubelet",
        zone: "worker-node",
        slot: "kubelet",
        objectType: "NodeProcess",
        description: "Node agent registered with the API server.",
        whyThere: "Must run on each worker to realize PodSpecs locally.",
        highlight: true,
        stepIds: ["install", "verify"],
      },
    ],
    connections: [
      {
        id: "users-api",
        from: "users",
        to: "apiserver",
        label: "HTTPS :6443",
        highlight: true,
        stepIds: ["verify", "example"],
      },
      {
        id: "api-etcd",
        from: "apiserver",
        to: "etcd",
        label: "gRPC :2379",
        highlight: true,
        stepIds: ["install"],
      },
      {
        id: "kubelet-api",
        from: "kubelet",
        to: "apiserver",
        label: "Node / Pod status",
        highlight: true,
        stepIds: ["verify"],
      },
    ],
  }),
  implement: [
    {
      id: "prereq",
      title: "Prerequisites",
      description:
        "Linux nodes (or a local kind/minikube), container runtime (containerd), and kubectl matching your cluster minor version.",
      code: {
        language: "bash",
        title: "Check client",
        code: `kubectl version --client`,
      },
      diagramComponentIds: ["users"],
    },
    {
      id: "install",
      title: "Install / obtain a cluster",
      description:
        "Use a managed control plane, kubeadm, or a local cluster. Example with kind:",
      code: {
        language: "bash",
        title: "kind create cluster",
        code: `kind create cluster --name atlas
kubectl cluster-info`,
      },
      diagramComponentIds: [
        "apiserver",
        "etcd",
        "scheduler",
        "controller-manager",
        "kubelet",
        "runtime",
      ],
      diagramConnectionIds: ["api-etcd", "kubelet-api"],
    },
    {
      id: "verify",
      title: "Verify",
      description: "Nodes should be Ready and system pods Running.",
      code: {
        language: "bash",
        title: "Cluster health",
        code: `kubectl get nodes
kubectl get pods -n kube-system`,
      },
      expectedOutput: `NAME                 STATUS   ROLES           AGE
atlas-control-plane  Ready    control-plane   1m`,
      diagramComponentIds: ["apiserver", "kubelet", "users"],
      diagramConnectionIds: ["users-api", "kubelet-api"],
    },
    {
      id: "example",
      title: "Minimal working example",
      description: "A Deployment and Service so the control plane schedules and exposes a Pod.",
      code: {
        language: "yaml",
        title: "web.yaml",
        code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 2
  selector:
    matchLabels: { app: web }
  template:
    metadata:
      labels: { app: web }
    spec:
      containers:
        - name: web
          image: nginx:1.27-alpine
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  selector: { app: web }
  ports:
    - port: 80
      targetPort: 80`,
      },
      diagramComponentIds: [
        "app-pod",
        "svc",
        "scheduler",
        "controller-manager",
      ],
      diagramConnectionIds: ["svc-pod", "sched-api", "cm-api"],
    },
    {
      id: "test",
      title: "How to test",
      description: "Port-forward and hit nginx, or curl the Service from a debug Pod.",
      code: {
        language: "bash",
        title: "Port-forward",
        code: `kubectl apply -f web.yaml
kubectl rollout status deploy/web
kubectl port-forward svc/web 8080:80
# then: curl -I http://127.0.0.1:8080`,
      },
      diagramComponentIds: ["app-pod", "svc", "users"],
      diagramConnectionIds: ["users-api", "svc-pod"],
    },
    {
      id: "mistakes",
      title: "Common mistakes",
      description:
        "ImagePullBackOff (wrong tag/registry auth), CrashLoopBackOff (app exits), Pending Pods (no schedulable nodes / resource requests).",
      code: {
        language: "bash",
        title: "Debug",
        code: `kubectl describe pod -l app=web
kubectl logs -l app=web --tail=100
kubectl get events --sort-by=.lastTimestamp | tail`,
      },
      diagramComponentIds: ["app-pod", "kubelet", "scheduler"],
    },
  ],
};
