import { clusterBase, mergeDiagram } from "./_base";

const base = clusterBase({
  highlightApi: true,
  highlightAppPod: true,
});

export const kyverno = {
  id: "kyverno",
  name: "Kyverno",
  layer: "security",
  maturity: "Incubating",
  summary: "Kubernetes-native policy management with validate/mutate/generate.",
  problem: "Cluster policy should be expressible without learning Rego.",
  placementBlurb: "Admission controllers + reports in kyverno ns",
  levels: {
    beginner: "Install Kyverno and apply ClusterPolicies that validate resources.",
    intermediate: "Mutate defaults and generate supporting resources.",
    advanced: "Cleanup policies, image verification, policy exceptions.",
  },
  useWhen: [
    "Kubernetes admission policy with YAML ergonomics",
    "Generate/mutate resources as part of policy",
  ],
  avoidWhen: [
    "You need one policy engine shared far outside Kubernetes",
  ],
  alternatives: [
    {
      id: "falco",
      comparison: "Falco detects runtime events; Kyverno governs admit-time Kubernetes objects.",
    },
  ],
  docsUrl: "https://kyverno.io/docs/",
  repoUrl: "https://github.com/kyverno/kyverno",
  diagram: mergeDiagram(base, {
    components: [
      {
        id: "kyverno",
        label: "Kyverno",
        zone: "namespace",
        slot: "kyverno",
        objectType: "Deployment",
        description: "Admission controllers (validate/mutate/generate) in kyverno namespace.",
        whyThere: "Must sit on the admission path in front of object persistence.",
        highlight: true,
        stepIds: ["install", "verify"],
      },
      {
        id: "kyverno-webhook",
        label: "Admission webhooks",
        zone: "control-plane",
        slot: "webhook",
        objectType: "ValidatingWebhook",
        description: "ValidatingWebhookConfiguration / MutatingWebhookConfiguration.",
        whyThere: "API server calls webhooks before persisting objects.",
        highlight: true,
        stepIds: ["install", "example"],
      },
      {
        id: "clusterpolicy",
        label: "ClusterPolicy",
        zone: "namespace",
        slot: "policy",
        objectType: "CRD",
        description: "Policy documents selecting resources to validate/mutate/generate.",
        whyThere: "Policies are cluster (or namespaced) custom resources.",
        highlight: true,
        stepIds: ["example", "test"],
      },
    ],
    connections: [
      {
        id: "api-webhook",
        from: "apiserver",
        to: "kyverno-webhook",
        label: "AdmissionReview",
        highlight: true,
        stepIds: ["example", "test"],
      },
      {
        id: "webhook-kyverno",
        from: "kyverno-webhook",
        to: "kyverno",
        label: "HTTPS to service",
        highlight: true,
        stepIds: ["verify"],
      },
      {
        id: "kyverno-api",
        from: "kyverno",
        to: "apiserver",
        label: "watch policies / reports",
        highlight: true,
        stepIds: ["install"],
      },
    ],
  }),
  implement: [
    {
      id: "prereq",
      title: "Prerequisites",
      description: "Helm 3; permissions to create admission webhooks and CRDs.",
      code: {
        language: "bash",
        title: "Helm",
        code: `helm version`,
      },
      diagramComponentIds: ["apiserver"],
    },
    {
      id: "install",
      title: "Install",
      description: "Official Kyverno Helm chart.",
      code: {
        language: "bash",
        title: "Helm install",
        code: `helm repo add kyverno https://kyverno.github.io/kyverno/
helm repo update
helm install kyverno kyverno/kyverno --namespace kyverno --create-namespace`,
      },
      diagramComponentIds: ["kyverno", "kyverno-webhook"],
      diagramConnectionIds: ["kyverno-api", "webhook-kyverno"],
    },
    {
      id: "verify",
      title: "Verify",
      description: "Kyverno deployments Ready; webhooks registered.",
      code: {
        language: "bash",
        title: "Webhooks",
        code: `kubectl -n kyverno get pods
kubectl get validatingwebhookconfiguration | grep kyverno`,
      },
      expectedOutput: `kyverno-admission-controller ... Running`,
      diagramComponentIds: ["kyverno", "kyverno-webhook"],
      diagramConnectionIds: ["webhook-kyverno"],
    },
    {
      id: "example",
      title: "Minimal working example",
      description: "Require an owner label on Deployments.",
      code: {
        language: "yaml",
        title: "require-owner.yaml",
        code: `apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-owner
spec:
  validationFailureAction: Enforce
  rules:
    - name: check-owner
      match:
        any:
          - resources:
              kinds: [Deployment]
      validate:
        message: "label owner is required"
        pattern:
          metadata:
            labels:
              owner: "?*"`,
      },
      diagramComponentIds: ["clusterpolicy", "kyverno", "kyverno-webhook"],
      diagramConnectionIds: ["api-webhook"],
    },
    {
      id: "test",
      title: "How to test",
      description: "A Deployment without owner should be rejected; with owner it succeeds.",
      code: {
        language: "bash",
        title: "Admit / deny",
        code: `kubectl apply -f require-owner.yaml
kubectl create deployment deny-me --image=nginx:1.27-alpine || true
kubectl create deployment ok --image=nginx:1.27-alpine
kubectl label deploy ok owner=platform`,
      },
      diagramComponentIds: ["clusterpolicy", "app-pod", "apiserver"],
      diagramConnectionIds: ["api-webhook"],
    },
    {
      id: "mistakes",
      title: "Common mistakes",
      description:
        "validationFailureAction Audit vs Enforce confusion; policies matching system namespaces unintentionally; webhook timeout during install.",
      code: {
        language: "bash",
        title: "Policy reports",
        code: `kubectl get clusterpolicy
kubectl get policyreport -A | head`,
      },
      diagramComponentIds: ["clusterpolicy", "kyverno"],
    },
  ],
};
