import type { Tool } from "@/lib/types";
import { clusterBase, mergeDiagram } from "./_base";

const base = clusterBase({
  highlightApi: true,
  highlightIngress: true,
  highlightSvc: true,
});

export const certManager: Tool = {
  id: "cert-manager",
  name: "cert-manager",
  layer: "security",
  maturity: "Graduated",
  summary: "Automates X.509 certificate lifecycle in Kubernetes.",
  problem: "Manual certificate issuance and renewal causes outages.",
  placementBlurb: "Controller + CRDs + webhook in cert-manager ns",
  levels: {
    beginner: "Install cert-manager and create an Issuer plus Certificate.",
    intermediate: "ACME HTTP-01/DNS-01 and private CAs for internal services.",
    advanced: "csi-driver, gateway integration, multi-cluster issuance.",
  },
  useWhen: [
    "Kubernetes workloads need automated TLS certificates",
    "Let's Encrypt or internal CA issuance should be declarative",
  ],
  avoidWhen: [
    "Certificates are fully managed outside the cluster with no in-cluster need",
  ],
  alternatives: [],
  docsUrl: "https://cert-manager.io/docs/",
  repoUrl: "https://github.com/cert-manager/cert-manager",
  diagram: mergeDiagram(base, {
    components: [
      {
        id: "cm-controller",
        label: "cert-manager controller",
        zone: "namespace",
        slot: "cm",
        objectType: "Deployment",
        description: "Controllers reconciling Issuer/Certificate resources.",
        whyThere: "Issuance logic runs as deployments in cert-manager namespace.",
        highlight: true,
        stepIds: ["install", "verify"],
      },
      {
        id: "cm-webhook",
        label: "cert-manager webhook",
        zone: "namespace",
        slot: "webhook",
        objectType: "ValidatingWebhook",
        description: "Admission webhook validating cert-manager resources.",
        whyThere: "API validation hooks register with the API server.",
        highlight: true,
        stepIds: ["install", "verify"],
      },
      {
        id: "cm-crds",
        label: "cert-manager CRDs",
        zone: "control-plane",
        slot: "crd",
        objectType: "CRD",
        description: "Certificate, Issuer, ClusterIssuer, Order, Challenge, …",
        whyThere: "Custom APIs extend the API server.",
        highlight: true,
        stepIds: ["install", "example"],
      },
      {
        id: "tls-secret",
        label: "TLS Secret",
        zone: "namespace",
        slot: "tls",
        objectType: "Secret",
        description: "Secret type kubernetes.io/tls written for Ingress/apps.",
        whyThere: "Workloads and Ingress mount certs from Secrets.",
        highlight: true,
        stepIds: ["example", "test"],
      },
    ],
    connections: [
      {
        id: "cm-api",
        from: "cm-controller",
        to: "apiserver",
        label: "reconcile Certificates",
        highlight: true,
        stepIds: ["install", "example"],
      },
      {
        id: "webhook-api",
        from: "cm-webhook",
        to: "apiserver",
        label: "admission review",
        highlight: true,
        stepIds: ["verify"],
      },
      {
        id: "cm-secret",
        from: "cm-controller",
        to: "tls-secret",
        label: "write tls.crt/key",
        highlight: true,
        stepIds: ["example", "test"],
      },
      {
        id: "ingress-secret",
        from: "ingress",
        to: "tls-secret",
        label: "mount TLS",
        highlight: true,
        stepIds: ["test"],
      },
    ],
  }),
  implement: [
    {
      id: "prereq",
      title: "Prerequisites",
      description: "Helm 3; cluster able to install CRDs and ValidatingWebhookConfigurations.",
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
      description: "Jetstack (cert-manager) Helm chart with CRDs enabled.",
      code: {
        language: "bash",
        title: "Helm install",
        code: `helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install cert-manager jetstack/cert-manager \\
  --namespace cert-manager --create-namespace \\
  --set crds.enabled=true`,
      },
      diagramComponentIds: ["cm-controller", "cm-webhook", "cm-crds"],
      diagramConnectionIds: ["cm-api", "webhook-api"],
    },
    {
      id: "verify",
      title: "Verify",
      description: "Controller, webhook, and cainjector Ready.",
      code: {
        language: "bash",
        title: "Pods",
        code: `kubectl -n cert-manager get pods
kubectl get crd | grep cert-manager`,
      },
      expectedOutput: `cert-manager-...   1/1   Running`,
      diagramComponentIds: ["cm-controller", "cm-webhook", "cm-crds"],
    },
    {
      id: "example",
      title: "Minimal working example",
      description: "Self-signed ClusterIssuer and a Certificate (good for labs).",
      code: {
        language: "yaml",
        title: "selfsigned-cert.yaml",
        code: `apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: selfsigned
spec:
  selfSigned: {}
---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: www
  namespace: default
spec:
  secretName: www-tls
  issuerRef:
    name: selfsigned
    kind: ClusterIssuer
  dnsNames:
    - www.example.com`,
      },
      diagramComponentIds: ["cm-crds", "cm-controller", "tls-secret"],
      diagramConnectionIds: ["cm-api", "cm-secret"],
    },
    {
      id: "test",
      title: "How to test",
      description: "Certificate becomes Ready; TLS Secret is populated.",
      code: {
        language: "bash",
        title: "Certificate status",
        code: `kubectl apply -f selfsigned-cert.yaml
kubectl get certificate
kubectl get secret www-tls`,
      },
      expectedOutput: `www   True   www-tls`,
      diagramComponentIds: ["tls-secret", "ingress"],
      diagramConnectionIds: ["cm-secret", "ingress-secret"],
    },
    {
      id: "mistakes",
      title: "Common mistakes",
      description:
        "Installing without CRDs; ACME HTTP-01 without a reachable Ingress; clock skew breaking NotBefore.",
      code: {
        language: "bash",
        title: "Describe Certificate",
        code: `kubectl describe certificate www
kubectl -n cert-manager logs deploy/cert-manager --tail=100`,
      },
      diagramComponentIds: ["cm-controller", "cm-crds"],
    },
  ],
};
