import type { Tool } from "@/lib/types";
import { clusterBase, mergeDiagram } from "./_base";

const base = clusterBase({
  highlightApi: true,
  highlightAppPod: true,
  highlightSvc: true,
  highlightIngress: true,
});

export const istio: Tool = {
  id: "istio",
  name: "Istio",
  layer: "networking",
  maturity: "Graduated",
  summary:
    "Feature-rich service mesh for traffic management, security, and telemetry.",
  problem:
    "Microservices need mTLS, routing, and consistent telemetry across languages.",
  placementBlurb: "istiod + Envoy sidecars in app pods",
  levels: {
    beginner:
      "Install Istio, label a namespace for injection, get sidecars with mTLS and metrics.",
    intermediate:
      "VirtualService, DestinationRule, and PeerAuthentication shape canaries and policy.",
    advanced: "Ambient mode, multi-cluster mesh, and Wasm extensions.",
  },
  useWhen: [
    "You need advanced L7 traffic management and mesh-wide mTLS",
    "You want deep Envoy integrations",
  ],
  avoidWhen: [
    "Mesh complexity is too high for team size",
    "CNI policy alone is enough",
  ],
  alternatives: [
    {
      id: "cilium",
      comparison: "Cilium can provide mesh features with an eBPF-first approach.",
    },
  ],
  docsUrl: "https://istio.io/latest/docs/",
  repoUrl: "https://github.com/istio/istio",
  diagram: mergeDiagram(base, {
    components: [
      {
        id: "istiod",
        label: "istiod",
        zone: "namespace",
        slot: "istiod",
        objectType: "Deployment",
        description: "Control plane in istio-system (pilot + ca + etc.).",
        whyThere: "Mesh config and certificate authority run as cluster services.",
        highlight: true,
        stepIds: ["install", "verify"],
      },
      {
        id: "envoy-sidecar",
        label: "Envoy sidecar",
        zone: "pod",
        slot: "sidecar",
        objectType: "Sidecar",
        description: "Envoy proxy injected beside the app container.",
        whyThere: "Sidecar intercepts pod traffic for L7 policy and mTLS.",
        highlight: true,
        stepIds: ["example", "test"],
      },
      {
        id: "istio-gateways",
        label: "Istio Gateway",
        zone: "namespace",
        slot: "ingress",
        objectType: "Deployment",
        description: "Optional ingress/egress gateway Deployments.",
        whyThere: "Edge Envoy proxies are mesh workloads too.",
        highlight: true,
        stepIds: ["install"],
      },
    ],
    connections: [
      {
        id: "istiod-api",
        from: "istiod",
        to: "apiserver",
        label: "watch Istio CRDs",
        highlight: true,
        stepIds: ["install"],
      },
      {
        id: "sidecar-istiod",
        from: "envoy-sidecar",
        to: "istiod",
        label: "xDS (gRPC)",
        highlight: true,
        stepIds: ["example", "verify"],
      },
      {
        id: "sidecar-app",
        from: "envoy-sidecar",
        to: "app-pod",
        label: "localhost proxy",
        highlight: true,
        stepIds: ["example"],
      },
      {
        id: "sidecar-sidecar",
        from: "envoy-sidecar",
        to: "svc",
        label: "mTLS to peers",
        highlight: true,
        stepIds: ["test"],
      },
    ],
  }),
  implement: [
    {
      id: "prereq",
      title: "Prerequisites",
      description: "Kubernetes cluster; download istioctl matching your target Istio version.",
      code: {
        language: "bash",
        title: "istioctl version",
        code: `istioctl version --remote=false`,
      },
      diagramComponentIds: ["users"],
    },
    {
      id: "install",
      title: "Install",
      description: "Install the demo or default profile into istio-system.",
      code: {
        language: "bash",
        title: "istioctl install",
        code: `istioctl install --set profile=demo -y
kubectl get ns istio-system`,
      },
      diagramComponentIds: ["istiod", "istio-gateways"],
      diagramConnectionIds: ["istiod-api"],
    },
    {
      id: "verify",
      title: "Verify",
      description: "istiod Running; injection webhook present.",
      code: {
        language: "bash",
        title: "Control plane",
        code: `kubectl -n istio-system get deploy
istioctl verify-install`,
      },
      expectedOutput: `istiod ... Ready`,
      diagramComponentIds: ["istiod"],
      diagramConnectionIds: ["istiod-api"],
    },
    {
      id: "example",
      title: "Minimal working example",
      description: "Enable sidecar injection and apply a VirtualService canary weight split.",
      code: {
        language: "yaml",
        title: "virtualservice.yaml",
        code: `apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: reviews
spec:
  hosts: [reviews]
  http:
    - route:
        - destination:
            host: reviews
            subset: v1
          weight: 90
        - destination:
            host: reviews
            subset: v2
          weight: 10`,
      },
      diagramComponentIds: ["envoy-sidecar", "app-pod", "istiod"],
      diagramConnectionIds: ["sidecar-istiod", "sidecar-app"],
    },
    {
      id: "test",
      title: "How to test",
      description: "Label namespace, restart pods, confirm 2/2 containers (app + istio-proxy).",
      code: {
        language: "bash",
        title: "Injection",
        code: `kubectl label namespace default istio-injection=enabled --overwrite
kubectl rollout restart deploy -n default
kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{" "}{.spec.containers[*].name}{"\\n"}{end}'`,
      },
      diagramComponentIds: ["envoy-sidecar", "app-pod"],
      diagramConnectionIds: ["sidecar-sidecar"],
    },
    {
      id: "mistakes",
      title: "Common mistakes",
      description:
        "Forgetting namespace injection labels; mixing ambient and sidecar without planning; version skew between istioctl and control plane.",
      code: {
        language: "bash",
        title: "Proxy status",
        code: `istioctl proxy-status`,
      },
      diagramComponentIds: ["istiod", "envoy-sidecar"],
    },
  ],
};
