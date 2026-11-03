import { clusterBase, mergeDiagram } from "./_base";

const base = clusterBase({
  highlightApi: true,
  highlightAppPod: true,
  highlightKubelet: true,
});

export const cilium = {
  id: "cilium",
  name: "Cilium",
  layer: "networking",
  maturity: "Graduated",
  summary: "eBPF-powered networking, security, and observability for Kubernetes.",
  problem:
    "kube-proxy and basic CNIs struggle with scale, identity-aware policy, and visibility.",
  placementBlurb: "DaemonSet agent on every node + operator",
  levels: {
    beginner:
      "Install Cilium as the cluster CNI for pod networking and NetworkPolicies.",
    intermediate:
      "Hubble observes flows; CiliumNetworkPolicy uses identity instead of only IPs.",
    advanced:
      "Cluster mesh, Gateway API, and optional service-mesh features.",
  },
  useWhen: [
    "You want modern eBPF networking and rich network policy",
    "You need built-in flow observability (Hubble)",
  ],
  avoidWhen: [
    "Your environment cannot run eBPF on the node kernel",
    "A simpler CNI already meets scale and policy needs",
  ],
  alternatives: [
    {
      id: "istio",
      comparison: "Istio focuses on L7 mesh features; Cilium centers on eBPF networking/security.",
    },
  ],
  docsUrl: "https://docs.cilium.io/",
  repoUrl: "https://github.com/cilium/cilium",
  diagram: mergeDiagram(base, {
    components: [
      {
        id: "cilium-agent",
        label: "cilium-agent",
        zone: "worker-node",
        slot: "cni",
        objectType: "DaemonSet",
        description: "DaemonSet agent loading eBPF programs on every node.",
        whyThere: "Datapath and CNI plumbing must run on each worker.",
        highlight: true,
        stepIds: ["install", "verify"],
      },
      {
        id: "cilium-operator",
        label: "cilium-operator",
        zone: "namespace",
        slot: "operator",
        objectType: "Deployment",
        description: "Operator Deployment managing cluster-wide Cilium state.",
        whyThere: "Cluster-scoped reconciliation runs as a Deployment, not per-node.",
        highlight: true,
        stepIds: ["install", "verify"],
      },
      {
        id: "cilium-crd",
        label: "Cilium CRDs",
        zone: "control-plane",
        slot: "crd",
        objectType: "CRD",
        description: "CiliumNetworkPolicy, CiliumIdentity, and related APIs.",
        whyThere: "Custom APIs are registered with the API server.",
        highlight: true,
        stepIds: ["install", "example"],
      },
    ],
    connections: [
      {
        id: "agent-api",
        from: "cilium-agent",
        to: "apiserver",
        label: "watch identities / policies",
        highlight: true,
        stepIds: ["verify"],
      },
      {
        id: "operator-api",
        from: "cilium-operator",
        to: "apiserver",
        label: "reconcile CRDs",
        highlight: true,
        stepIds: ["install"],
      },
      {
        id: "agent-pod",
        from: "cilium-agent",
        to: "app-pod",
        label: "eBPF datapath",
        highlight: true,
        stepIds: ["example", "test"],
      },
    ],
  }),
  implement: [
    {
      id: "prereq",
      title: "Prerequisites",
      description:
        "Kernel with eBPF support; for a fresh cluster, install Cilium as the CNI (avoid conflicting CNIs). Helm 3+.",
      code: {
        language: "bash",
        title: "Requirements check",
        code: `kubectl get nodes
uname -r`,
      },
      diagramComponentIds: ["kubelet", "apiserver"],
    },
    {
      id: "install",
      title: "Install",
      description: "Official Helm chart from the Cilium repo.",
      code: {
        language: "bash",
        title: "Helm install",
        code: `helm repo add cilium https://helm.cilium.io/
helm repo update
helm install cilium cilium/cilium --namespace kube-system \\
  --set operator.replicas=1`,
      },
      diagramComponentIds: [
        "cilium-agent",
        "cilium-operator",
        "cilium-crd",
      ],
      diagramConnectionIds: ["operator-api", "agent-api"],
    },
    {
      id: "verify",
      title: "Verify",
      description: "Agent DaemonSet Ready on each node; operator Running.",
      code: {
        language: "bash",
        title: "cilium status",
        code: `kubectl -n kube-system get ds cilium
kubectl -n kube-system get deploy cilium-operator
cilium status --wait`,
      },
      expectedOutput: `DaemonSet cilium ... Ready`,
      diagramComponentIds: ["cilium-agent", "cilium-operator"],
      diagramConnectionIds: ["agent-api"],
    },
    {
      id: "example",
      title: "Minimal working example",
      description: "Allow only frontend→api on TCP 8080 with CiliumNetworkPolicy.",
      code: {
        language: "yaml",
        title: "allow-frontend.yaml",
        code: `apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: allow-frontend
spec:
  endpointSelector:
    matchLabels: { app: api }
  ingress:
    - fromEndpoints:
        - matchLabels: { app: frontend }
      toPorts:
        - ports:
            - port: "8080"
              protocol: TCP`,
      },
      diagramComponentIds: ["cilium-crd", "cilium-agent", "app-pod"],
      diagramConnectionIds: ["agent-pod"],
    },
    {
      id: "test",
      title: "How to test",
      description: "Deploy labeled pods and confirm connectivity matches the policy.",
      code: {
        language: "bash",
        title: "Connectivity",
        code: `kubectl apply -f allow-frontend.yaml
cilium connectivity test`,
      },
      diagramComponentIds: ["cilium-agent", "app-pod"],
      diagramConnectionIds: ["agent-pod"],
    },
    {
      id: "mistakes",
      title: "Common mistakes",
      description:
        "Installing alongside another CNI; kernel too old for required eBPF features; forgetting to restart pods after CNI swap.",
      code: {
        language: "bash",
        title: "Agent logs",
        code: `kubectl -n kube-system logs -l k8s-app=cilium -c cilium-agent --tail=100`,
      },
      diagramComponentIds: ["cilium-agent"],
    },
  ],
};
