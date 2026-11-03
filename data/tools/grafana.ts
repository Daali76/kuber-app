import type { Tool } from "@/lib/types";
import { clusterBase, mergeDiagram } from "./_base";

const base = clusterBase({
  highlightApi: true,
  highlightSvc: true,
});

export const grafana: Tool = {
  id: "grafana",
  name: "Grafana",
  layer: "observability",
  maturity: "External",
  summary:
    "Observability UI for dashboards and alerts over Prometheus and other data sources.",
  problem: "Raw PromQL and multiple backends are hard to explore without a shared UI.",
  placementBlurb: "Deployment querying Prometheus (and others)",
  levels: {
    beginner: "Point Grafana at Prometheus and import a dashboard.",
    intermediate: "Folders, provisioning, and SSO for teams.",
    advanced: "Alerting rules, recording pipelines, and multi-tenant setups.",
  },
  useWhen: [
    "You need dashboards on top of Prometheus/Loki/Tempo-style backends",
  ],
  avoidWhen: [
    "Prometheus UI alone is enough for your team",
  ],
  alternatives: [
    {
      id: "prometheus",
      comparison: "Prometheus scrapes/stores metrics; Grafana visualizes them.",
    },
  ],
  docsUrl: "https://grafana.com/docs/grafana/latest/",
  repoUrl: "https://github.com/grafana/grafana",
  diagram: mergeDiagram(base, {
    components: [
      {
        id: "grafana",
        label: "Grafana",
        zone: "namespace",
        slot: "grafana",
        objectType: "Deployment",
        description: "Grafana server Deployment (UI + API).",
        whyThere: "Runs as an in-cluster app users reach via Service/Ingress.",
        highlight: true,
        stepIds: ["install", "verify"],
      },
      {
        id: "prometheus",
        label: "Prometheus",
        zone: "namespace",
        slot: "prom",
        objectType: "StatefulSet",
        description: "Typical metrics datasource for Grafana.",
        whyThere: "Grafana queries Prometheus over HTTP in-cluster.",
        highlight: true,
        stepIds: ["example"],
      },
    ],
    connections: [
      {
        id: "users-grafana",
        from: "users",
        to: "grafana",
        label: "HTTPS UI",
        highlight: true,
        stepIds: ["test"],
      },
      {
        id: "grafana-prom",
        from: "grafana",
        to: "prometheus",
        label: "PromQL HTTP :9090",
        highlight: true,
        stepIds: ["example", "test"],
      },
      {
        id: "grafana-api",
        from: "grafana",
        to: "apiserver",
        label: "optional K8s datasource",
        highlight: false,
        stepIds: ["install"],
      },
    ],
  }),
  implement: [
    {
      id: "prereq",
      title: "Prerequisites",
      description:
        "Helm 3; a reachable Prometheus (e.g. from kube-prometheus-stack) or install Grafana alone.",
      code: {
        language: "bash",
        title: "Check Prometheus Service",
        code: `kubectl get svc -A | grep prometheus || true`,
      },
      diagramComponentIds: ["prometheus"],
    },
    {
      id: "install",
      title: "Install",
      description: "Official Grafana Helm chart.",
      code: {
        language: "bash",
        title: "Helm install",
        code: `helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
helm install grafana grafana/grafana --namespace monitoring --create-namespace`,
      },
      diagramComponentIds: ["grafana"],
    },
    {
      id: "verify",
      title: "Verify",
      description: "Grafana pod Ready; fetch admin password from the generated Secret.",
      code: {
        language: "bash",
        title: "Password + pod",
        code: `kubectl -n monitoring get pods -l app.kubernetes.io/name=grafana
kubectl -n monitoring get secret grafana -o jsonpath="{.data.admin-password}" | base64 -d; echo`,
      },
      expectedOutput: `grafana-...   1/1   Running`,
      diagramComponentIds: ["grafana"],
    },
    {
      id: "example",
      title: "Minimal working example",
      description:
        "Add a Prometheus datasource (URL like http://mon-kube-prometheus-st-prometheus.monitoring:9090).",
      code: {
        language: "yaml",
        title: "datasource sketch (UI or provisioning)",
        code: `apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://mon-kube-prometheus-st-prometheus.monitoring.svc:9090
    isDefault: true`,
      },
      diagramComponentIds: ["grafana", "prometheus"],
      diagramConnectionIds: ["grafana-prom"],
    },
    {
      id: "test",
      title: "How to test",
      description: "Port-forward and open Explore with a simple query like `up`.",
      code: {
        language: "bash",
        title: "UI",
        code: `kubectl -n monitoring port-forward svc/grafana 3000:80
# open http://127.0.0.1:3000  (admin / secret from verify step)`,
      },
      diagramComponentIds: ["grafana", "users", "prometheus"],
      diagramConnectionIds: ["users-grafana", "grafana-prom"],
    },
    {
      id: "mistakes",
      title: "Common mistakes",
      description:
        "Datasource URL using localhost instead of the in-cluster Service DNS; wrong namespace in the Service name.",
      code: {
        language: "bash",
        title: "DNS from Grafana pod",
        code: `kubectl -n monitoring exec -it deploy/grafana -- wget -qO- http://mon-kube-prometheus-st-prometheus.monitoring.svc:9090/-/ready || true`,
      },
      diagramComponentIds: ["grafana", "prometheus"],
    },
  ],
};
