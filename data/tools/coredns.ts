import { clusterBase, mergeDiagram } from "./_base";

const base = clusterBase({
  highlightApi: true,
  highlightAppPod: true,
  highlightSvc: true,
});

export const coredns = {
  id: "coredns",
  name: "CoreDNS",
  layer: "networking",
  maturity: "Graduated",
  summary: "Flexible DNS server and the default cluster DNS for Kubernetes.",
  problem: "Pods need stable service discovery names inside the cluster.",
  placementBlurb: "Deployment in kube-system (cluster DNS)",
  levels: {
    beginner:
      "CoreDNS answers cluster.local queries so Services are reachable by DNS name.",
    intermediate:
      "Corefile plugins rewrite, forward, cache, and integrate with the Kubernetes API.",
    advanced:
      "Custom plugins and multi-cluster DNS designs extend discovery beyond one cluster.",
  },
  useWhen: ["Running Kubernetes (it is the default cluster DNS)"],
  avoidWhen: ["You are not running a system that needs cluster DNS"],
  alternatives: [],
  docsUrl: "https://coredns.io/manual/toc/",
  repoUrl: "https://github.com/coredns/coredns",
  diagram: mergeDiagram(base, {
    components: [
      {
        id: "coredns",
        label: "CoreDNS",
        zone: "namespace",
        slot: "coredns",
        objectType: "Deployment",
        description: "Deployment (and Service) in kube-system providing cluster DNS.",
        whyThere: "Cluster DNS is a regular workload watching the API for Services/Pods.",
        highlight: true,
        stepIds: ["verify", "example"],
      },
      {
        id: "coredns-svc",
        label: "kube-dns Service",
        zone: "namespace",
        slot: "coredns-svc",
        objectType: "Service",
        description: "ClusterIP Service (often named kube-dns) fronting CoreDNS pods.",
        whyThere: "kubelet injects this ClusterIP into Pod DNS config.",
        highlight: true,
        stepIds: ["verify"],
      },
    ],
    connections: [
      {
        id: "coredns-api",
        from: "coredns",
        to: "apiserver",
        label: "watch Endpoints / Services",
        highlight: true,
        stepIds: ["verify"],
      },
      {
        id: "pod-coredns",
        from: "app-pod",
        to: "coredns-svc",
        label: "DNS :53 (udp/tcp)",
        highlight: true,
        stepIds: ["example", "test"],
      },
      {
        id: "coredns-svc-pods",
        from: "coredns-svc",
        to: "coredns",
        label: "ClusterIP → pods",
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
        "A Kubernetes cluster; CoreDNS is usually preinstalled in kube-system.",
      code: {
        language: "bash",
        title: "Namespace",
        code: `kubectl get ns kube-system`,
      },
      diagramComponentIds: ["apiserver"],
    },
    {
      id: "install",
      title: "Install",
      description:
        "On most clusters CoreDNS is already present. To (re)install via the official manifest path used by kubeadm, apply the CoreDNS Deployment/Service from your versioned install docs. Example check-only:",
      code: {
        language: "bash",
        title: "Confirm install",
        code: `kubectl -n kube-system get deploy coredns
kubectl -n kube-system get svc kube-dns`,
      },
      diagramComponentIds: ["coredns", "coredns-svc"],
      diagramConnectionIds: ["coredns-svc-pods"],
    },
    {
      id: "verify",
      title: "Verify",
      description: "CoreDNS pods Ready; kube-dns Service has a ClusterIP.",
      code: {
        language: "bash",
        title: "DNS objects",
        code: `kubectl -n kube-system get pods -l k8s-app=kube-dns
kubectl -n kube-system get configmap coredns -o yaml`,
      },
      expectedOutput: `coredns-...   1/1   Running`,
      diagramComponentIds: ["coredns", "coredns-svc", "apiserver"],
      diagramConnectionIds: ["coredns-api"],
    },
    {
      id: "example",
      title: "Minimal working example",
      description: "Resolve a Service DNS name from a debug Pod.",
      code: {
        language: "bash",
        title: "nslookup",
        code: `kubectl run -it --rm debug --image=busybox:1.36 --restart=Never -- \\
  nslookup kubernetes.default.svc.cluster.local`,
      },
      diagramComponentIds: ["app-pod", "coredns-svc", "coredns", "svc"],
      diagramConnectionIds: ["pod-coredns"],
    },
    {
      id: "test",
      title: "How to test",
      description: "Create a Service and confirm `<name>.<ns>.svc.cluster.local` resolves.",
      code: {
        language: "bash",
        title: "Service DNS",
        code: `kubectl create deployment dns-demo --image=nginx:1.27-alpine
kubectl expose deploy dns-demo --port=80
kubectl run -it --rm debug --image=busybox:1.36 --restart=Never -- \\
  nslookup dns-demo.default.svc.cluster.local`,
      },
      diagramComponentIds: ["app-pod", "svc", "coredns"],
      diagramConnectionIds: ["pod-coredns"],
    },
    {
      id: "mistakes",
      title: "Common mistakes",
      description:
        "Broken Corefile forward plugin; NetworkPolicy blocking kube-system DNS; nodes with wrong `--cluster-dns` kubelet flag.",
      code: {
        language: "bash",
        title: "Logs",
        code: `kubectl -n kube-system logs -l k8s-app=kube-dns --tail=100`,
      },
      diagramComponentIds: ["coredns", "coredns-svc"],
    },
  ],
};
