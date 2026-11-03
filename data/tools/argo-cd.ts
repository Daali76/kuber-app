import { clusterBase, mergeDiagram } from "./_base";

const base = clusterBase({
  highlightApi: true,
  highlightAppPod: true,
});

export const argoCd = {
  id: "argo-cd",
  name: "Argo CD",
  layer: "delivery",
  maturity: "Graduated",
  summary: "Declarative, GitOps continuous delivery for Kubernetes.",
  problem: "Manual kubectl applies drift from what is reviewed in Git.",
  placementBlurb: "Deployments in argocd ns pulling Git → API server",
  levels: {
    beginner: "Point Argo CD at a Git repo and sync an Application.",
    intermediate: "AppProjects, ApplicationSets, and sync waves.",
    advanced: "Multi-cluster, SSO, and progressive sync strategies.",
  },
  useWhen: [
    "Git should be the source of truth for cluster state",
    "You want a UI and strong Kubernetes GitOps UX",
  ],
  avoidWhen: [
    "Push-based CI deploy is mandated and GitOps reconcile is forbidden",
  ],
  alternatives: [
    {
      id: "helm",
      comparison: "Helm packages releases; Argo CD can render and sync Helm charts from Git.",
    },
  ],
  docsUrl: "https://argo-cd.readthedocs.io/",
  repoUrl: "https://github.com/argoproj/argo-cd",
  diagram: mergeDiagram(base, {
    components: [
      {
        id: "argocd",
        label: "Argo CD components",
        zone: "namespace",
        slot: "argocd",
        objectType: "Deployment",
        description:
          "argocd-server, repo-server, application-controller Deployments in argocd.",
        whyThere: "GitOps controllers run in their own namespace watching Apps + Git.",
        highlight: true,
        stepIds: ["install", "verify"],
      },
      {
        id: "application-crd",
        label: "Application CR",
        zone: "namespace",
        slot: "appcr",
        objectType: "CRD",
        description: "Application (and AppProject) custom resources.",
        whyThere: "Desired sync state is declared as Kubernetes objects.",
        highlight: true,
        stepIds: ["example"],
      },
      {
        id: "git",
        label: "Git repo",
        zone: "external",
        slot: "git",
        objectType: "External",
        description: "Manifests / Helm / Kustomize source of truth.",
        whyThere: "Argo CD pulls desired state from Git over the network.",
        highlight: true,
        stepIds: ["example", "test"],
      },
    ],
    connections: [
      {
        id: "argocd-git",
        from: "argocd",
        to: "git",
        label: "git fetch (HTTPS/SSH)",
        highlight: true,
        stepIds: ["example", "test"],
      },
      {
        id: "argocd-api",
        from: "argocd",
        to: "apiserver",
        label: "apply / prune objects",
        highlight: true,
        stepIds: ["example", "verify"],
      },
      {
        id: "users-argocd",
        from: "users",
        to: "argocd",
        label: "UI / CLI",
        highlight: true,
        stepIds: ["test"],
      },
    ],
  }),
  implement: [
    {
      id: "prereq",
      title: "Prerequisites",
      description: "Cluster admin rights to install into argocd namespace; Git repo with manifests.",
      code: {
        language: "bash",
        title: "kubectl",
        code: `kubectl version --client`,
      },
      diagramComponentIds: ["users", "git"],
    },
    {
      id: "install",
      title: "Install",
      description: "Official install manifest (stable) into argocd namespace.",
      code: {
        language: "bash",
        title: "kubectl apply",
        code: `kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml`,
      },
      diagramComponentIds: ["argocd"],
      diagramConnectionIds: ["argocd-api"],
    },
    {
      id: "verify",
      title: "Verify",
      description: "All argocd Deployments Available.",
      code: {
        language: "bash",
        title: "Pods",
        code: `kubectl -n argocd get pods
kubectl -n argocd get deploy`,
      },
      expectedOutput: `argocd-server ... Running`,
      diagramComponentIds: ["argocd", "apiserver"],
      diagramConnectionIds: ["argocd-api"],
    },
    {
      id: "example",
      title: "Minimal working example",
      description: "Application pointing at the official guestbook example.",
      code: {
        language: "yaml",
        title: "application.yaml",
        code: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: guestbook
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/argoproj/argocd-example-apps.git
    path: guestbook
    targetRevision: HEAD
  destination:
    server: https://kubernetes.default.svc
    namespace: guestbook
  syncPolicy:
    automated:
      prune: true
      selfHeal: true`,
      },
      diagramComponentIds: ["application-crd", "argocd", "git", "app-pod"],
      diagramConnectionIds: ["argocd-git", "argocd-api"],
    },
    {
      id: "test",
      title: "How to test",
      description: "Apply the Application and confirm Synced/Healthy.",
      code: {
        language: "bash",
        title: "Sync status",
        code: `kubectl apply -f application.yaml
kubectl -n argocd get applications
kubectl -n guestbook get pods`,
      },
      diagramComponentIds: ["argocd", "git", "app-pod", "users"],
      diagramConnectionIds: ["argocd-git", "users-argocd"],
    },
    {
      id: "mistakes",
      title: "Common mistakes",
      description:
        "Repo credentials missing for private Git; destination namespace not created when CreateNamespace=false; RBAC blocking the application-controller.",
      code: {
        language: "bash",
        title: "Controller logs",
        code: `kubectl -n argocd logs deploy/argocd-application-controller --tail=100`,
      },
      diagramComponentIds: ["argocd", "git"],
    },
  ],
};
