import { clusterBase, mergeDiagram } from "./_base";

const base = clusterBase({
  highlightApi: true,
  highlightAppPod: true,
});

export const helm = {
  id: "helm",
  name: "Helm",
  layer: "delivery",
  maturity: "Graduated",
  summary: "The package manager for Kubernetes.",
  problem: "Raw YAML for complex apps is hard to version, share, and configure.",
  placementBlurb: "CLI talking to API server; release Secret in namespace",
  levels: {
    beginner: "helm install deploys a chart with overridable values.",
    intermediate: "Chart dependencies, hooks, and library charts.",
    advanced: "OCI registries, provenance, and GitOps-friendly packaging.",
  },
  useWhen: [
    "You distribute or install parameterized Kubernetes apps",
    "You need a common packaging format",
  ],
  avoidWhen: [
    "A single plain manifest is enough",
  ],
  alternatives: [
    {
      id: "argo-cd",
      comparison: "Argo CD continuously syncs from Git; Helm is often the packaging format it renders.",
    },
  ],
  docsUrl: "https://helm.sh/docs/",
  repoUrl: "https://github.com/helm/helm",
  diagram: mergeDiagram(base, {
    components: [
      {
        id: "helm-cli",
        label: "Helm CLI",
        zone: "external",
        slot: "users",
        objectType: "CLI",
        description: "helm binary on an operator workstation or CI job.",
        whyThere: "Helm is a client; it does not run as a cluster DaemonSet.",
        highlight: true,
        stepIds: ["install", "example"],
      },
      {
        id: "release-secret",
        label: "Release Secret",
        zone: "namespace",
        slot: "release",
        objectType: "Secret",
        description: "Release metadata stored as a Secret (or ConfigMap) in the target namespace.",
        whyThere: "Helm records release revisions as Kubernetes objects.",
        highlight: true,
        stepIds: ["example", "verify"],
      },
      {
        id: "chart-repo",
        label: "Chart repo / OCI",
        zone: "external",
        slot: "git",
        objectType: "External",
        description: "Helm chart repository or OCI registry.",
        whyThere: "Charts are fetched from outside the cluster before apply.",
        highlight: true,
        stepIds: ["install", "example"],
      },
    ],
    connections: [
      {
        id: "helm-repo",
        from: "helm-cli",
        to: "chart-repo",
        label: "pull chart",
        highlight: true,
        stepIds: ["example"],
      },
      {
        id: "helm-api",
        from: "helm-cli",
        to: "apiserver",
        label: "create/update objects",
        highlight: true,
        stepIds: ["example", "verify"],
      },
      {
        id: "api-release",
        from: "apiserver",
        to: "release-secret",
        label: "store release",
        highlight: true,
        stepIds: ["verify"],
      },
    ],
  }),
  implement: [
    {
      id: "prereq",
      title: "Prerequisites",
      description: "kubectl context to a cluster; install Helm 3.x locally.",
      code: {
        language: "bash",
        title: "Helm version",
        code: `helm version`,
      },
      diagramComponentIds: ["helm-cli"],
    },
    {
      id: "install",
      title: "Install Helm (client)",
      description: "Install the Helm CLI (example via official script or package manager).",
      code: {
        language: "bash",
        title: "Official install script",
        code: `curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
helm version`,
      },
      diagramComponentIds: ["helm-cli", "chart-repo"],
    },
    {
      id: "verify",
      title: "Verify",
      description: "Helm can talk to the cluster; list releases.",
      code: {
        language: "bash",
        title: "List releases",
        code: `helm list -A
kubectl auth can-i create deployments`,
      },
      diagramComponentIds: ["helm-cli", "apiserver", "release-secret"],
      diagramConnectionIds: ["helm-api"],
    },
    {
      id: "example",
      title: "Minimal working example",
      description: "Install the maintained podinfo chart (demo app) from Stefan Prodan's chart repo.",
      code: {
        language: "bash",
        title: "helm install",
        code: `helm repo add podinfo https://stefanprodan.github.io/podinfo
helm repo update
helm install my-podinfo podinfo/podinfo \\
  --set service.type=ClusterIP`,
      },
      diagramComponentIds: [
        "helm-cli",
        "chart-repo",
        "release-secret",
        "app-pod",
      ],
      diagramConnectionIds: ["helm-repo", "helm-api", "api-release"],
    },
    {
      id: "test",
      title: "How to test",
      description: "Check release status and resulting workload.",
      code: {
        language: "bash",
        title: "Status",
        code: `helm status my-podinfo
kubectl get deploy,svc -l app.kubernetes.io/instance=my-podinfo`,
      },
      diagramComponentIds: ["app-pod", "release-secret", "helm-cli"],
      diagramConnectionIds: ["helm-api"],
    },
    {
      id: "mistakes",
      title: "Common mistakes",
      description:
        "Using Helm 2/Tiller docs; values typos (`--set`); forgetting `helm repo update` after add.",
      code: {
        language: "bash",
        title: "Template debug",
        code: `helm get values my-podinfo
helm template my-podinfo podinfo/podinfo --debug | head`,
      },
      diagramComponentIds: ["helm-cli"],
    },
  ],
};
