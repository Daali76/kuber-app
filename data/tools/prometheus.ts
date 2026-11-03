import { clusterBase, mergeDiagram } from "./_base";

const base = clusterBase({
  highlightApi: true,
  highlightAppPod: true,
  highlightSvc: true,
});

export const prometheus = {
  id: "prometheus",
  name: "Prometheus",
  layer: "observability",
  maturity: "Graduated",
  summary:
    "Metrics monitoring and alerting toolkit with a dimensional data model.",
  problem:
    "Dynamic cloud-native targets need pull-based metrics and alert rules.",
  placementBlurb: "Prometheus server scraping /metrics via ServiceDiscovery",
  levels: {
    beginner: "Prometheus scrapes /metrics endpoints and you graph time series.",
    intermediate:
      "Service discovery, recording rules, and Alertmanager route production alerts.",
    advanced: "Sharding, remote write, and federation for large estates.",
  },
  useWhen: [
    "You need Kubernetes-native metrics and alerting",
    "Exporters already expose Prometheus format",
  ],
  avoidWhen: [
    "You only need logs/traces and another metrics path is mandated",
  ],
  alternatives: [
    {
      id: "grafana",
      comparison: "Grafana visualizes metrics; Prometheus stores and scrapes them.",
    },
    {
      id: "opentelemetry",
      comparison: "OpenTelemetry produces telemetry; Prometheus is a common metrics backend.",
    },
  ],
  docsUrl: "https://prometheus.io/docs/introduction/overview/",
  repoUrl: "https://github.com/prometheus/prometheus",
  diagram: mergeDiagram(base, {
    components: [
      {
        id: "prometheus",
        label: "Prometheus",
        zone: "namespace",
        slot: "prom",
        objectType: "StatefulSet",
        description:
          "Prometheus server (often Deployment/StatefulSet) with persistent TSDB.",
        whyThere: "Central scraper/store runs in-cluster watching targets via the API.",
        highlight: true,
        stepIds: ["install", "verify"],
      },
      {
        id: "servicemonitor",
        label: "ServiceMonitor",
        zone: "namespace",
        slot: "sm",
        objectType: "CRD",
        description: "Prometheus Operator CRD selecting Services to scrape.",
        whyThere: "Declarative scrape config as Kubernetes objects.",
        highlight: true,
        stepIds: ["example"],
      },
      {
        id: "alertmanager",
        label: "Alertmanager",
        zone: "namespace",
        slot: "am",
        objectType: "Deployment",
        description: "Routes alerts fired by Prometheus rules.",
        whyThere: "Alert fan-out is a separate in-cluster component.",
        highlight: true,
        stepIds: ["install"],
      },
    ],
    connections: [
      {
        id: "prom-api",
        from: "prometheus",
        to: "apiserver",
        label: "SD / watch ServiceMonitors",
        highlight: true,
        stepIds: ["install", "example"],
      },
      {
        id: "prom-scrape",
        from: "prometheus",
        to: "app-pod",
        label: "HTTP scrape /metrics",
        highlight: true,
        stepIds: ["example", "test"],
      },
      {
        id: "prom-am",
        from: "prometheus",
        to: "alertmanager",
        label: "alert notifications",
        highlight: true,
        stepIds: ["install"],
      },
    ],
  }),
  implement: [
    {
      id: "prereq",
      title: "Prerequisites",
      description: "Helm 3; cluster with permission to create CRDs (for kube-prometheus-stack).",
      code: {
        language: "bash",
        title: "Helm",
        code: `helm version`,
      },
      diagramComponentIds: ["users"],
    },
    {
      id: "install",
      title: "Install",
      description:
        "prometheus-community kube-prometheus-stack chart (Prometheus Operator + Prometheus + Alertmanager).",
      code: {
        language: "bash",
        title: "Helm install",
        code: `helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install mon prometheus-community/kube-prometheus-stack \\
  --namespace monitoring --create-namespace`,
      },
      diagramComponentIds: ["prometheus", "alertmanager", "servicemonitor"],
      diagramConnectionIds: ["prom-api", "prom-am"],
    },
    {
      id: "verify",
      title: "Verify",
      description: "Prometheus and operator pods Ready in monitoring.",
      code: {
        language: "bash",
        title: "Pods",
        code: `kubectl -n monitoring get pods
kubectl -n monitoring get prometheus`,
      },
      expectedOutput: `prometheus-mon-kube-prometheus-st...   Running`,
      diagramComponentIds: ["prometheus"],
    },
    {
      id: "example",
      title: "Minimal working example",
      description: "ServiceMonitor selecting an app Service that exposes /metrics.",
      code: {
        language: "yaml",
        title: "servicemonitor.yaml",
        code: `apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: web
  namespace: monitoring
  labels:
    release: mon
spec:
  selector:
    matchLabels: { app: web }
  namespaceSelector:
    matchNames: [default]
  endpoints:
    - port: http
      path: /metrics
      interval: 30s`,
      },
      diagramComponentIds: ["servicemonitor", "prometheus", "app-pod", "svc"],
      diagramConnectionIds: ["prom-scrape", "prom-api"],
    },
    {
      id: "test",
      title: "How to test",
      description: "Port-forward Prometheus and query a target or metric.",
      code: {
        language: "bash",
        title: "Query UI",
        code: `kubectl -n monitoring port-forward svc/mon-kube-prometheus-st-prometheus 9090:9090
# open http://127.0.0.1:9090/targets`,
      },
      diagramComponentIds: ["prometheus", "app-pod", "users"],
      diagramConnectionIds: ["prom-scrape"],
    },
    {
      id: "mistakes",
      title: "Common mistakes",
      description:
        "ServiceMonitor labels not selected by the Prometheus CR; wrong port name; scraping a Service without /metrics.",
      code: {
        language: "bash",
        title: "Check ServiceMonitors",
        code: `kubectl -n monitoring get servicemonitor
kubectl -n monitoring get prometheus -o yaml | grep -A20 serviceMonitorSelector`,
      },
      diagramComponentIds: ["servicemonitor", "prometheus"],
    },
  ],
};
