import type { Tool } from "@/lib/types";
import { clusterBase, mergeDiagram } from "./_base";

const base = clusterBase({
  highlightAppPod: true,
  highlightApi: true,
});

export const opentelemetry: Tool = {
  id: "opentelemetry",
  name: "OpenTelemetry",
  layer: "observability",
  maturity: "Graduated",
  summary:
    "Vendor-neutral APIs, SDKs, and tools for traces, metrics, and logs.",
  problem: "Instrumenting apps separately for each vendor locks you in.",
  placementBlurb: "Collector Deployment/DaemonSet + app instrumentation",
  levels: {
    beginner: "Add OTel SDK instrumentation and export to a Collector.",
    intermediate: "Collector pipelines process, sample, and route telemetry.",
    advanced: "Custom samplers, connectors, and multi-signal correlation.",
  },
  useWhen: [
    "You want portable instrumentation across backends",
    "You need traces + metrics + logs with one ecosystem",
  ],
  avoidWhen: [
    "A single vendor agent is mandated with no portability requirement",
  ],
  alternatives: [
    {
      id: "prometheus",
      comparison: "Prometheus is a metrics backend; OTel is how you produce portable telemetry.",
    },
  ],
  docsUrl: "https://opentelemetry.io/docs/",
  repoUrl: "https://github.com/open-telemetry/opentelemetry-collector",
  diagram: mergeDiagram(base, {
    components: [
      {
        id: "otel-collector",
        label: "OTel Collector",
        zone: "namespace",
        slot: "otel",
        objectType: "Deployment",
        description: "Collector Deployment (or DaemonSet) receiving OTLP.",
        whyThere: "Central pipeline in-cluster before exporting to backends.",
        highlight: true,
        stepIds: ["install", "verify"],
      },
      {
        id: "otel-sdk",
        label: "App SDK / agent",
        zone: "pod",
        slot: "sdk",
        objectType: "Sidecar",
        description: "Library or sidecar exporting OTLP from the app.",
        whyThere: "Telemetry starts in the application process/pod.",
        highlight: true,
        stepIds: ["example", "test"],
      },
      {
        id: "backend",
        label: "Backend (e.g. Jaeger/Prom)",
        zone: "external",
        slot: "backend",
        objectType: "External",
        description: "Trace/metrics backend receiving exporter output.",
        whyThere: "Long-term storage often sits beside or outside the app cluster.",
        highlight: true,
        stepIds: ["example"],
      },
    ],
    connections: [
      {
        id: "sdk-collector",
        from: "otel-sdk",
        to: "otel-collector",
        label: "OTLP gRPC :4317 / HTTP :4318",
        highlight: true,
        stepIds: ["example", "test"],
      },
      {
        id: "collector-backend",
        from: "otel-collector",
        to: "backend",
        label: "OTLP / Prometheus remote",
        highlight: true,
        stepIds: ["example"],
      },
      {
        id: "collector-api",
        from: "otel-collector",
        to: "apiserver",
        label: "optional k8sattributes",
        highlight: false,
        stepIds: ["install"],
      },
    ],
  }),
  implement: [
    {
      id: "prereq",
      title: "Prerequisites",
      description: "Helm 3; decide Deployment vs DaemonSet collector topology.",
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
      description: "OpenTelemetry Collector Helm chart.",
      code: {
        language: "bash",
        title: "Helm install",
        code: `helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm repo update
helm install otel open-telemetry/opentelemetry-collector \\
  --namespace observability --create-namespace \\
  --set mode=deployment`,
      },
      diagramComponentIds: ["otel-collector"],
    },
    {
      id: "verify",
      title: "Verify",
      description: "Collector pods Ready; OTLP Service ports published.",
      code: {
        language: "bash",
        title: "Collector",
        code: `kubectl -n observability get pods
kubectl -n observability get svc`,
      },
      expectedOutput: `otel-opentelemetry-collector ... Running`,
      diagramComponentIds: ["otel-collector"],
    },
    {
      id: "example",
      title: "Minimal working example",
      description: "Collector config sketch receiving OTLP and exporting OTLP onward.",
      code: {
        language: "yaml",
        title: "collector pipeline",
        code: `receivers:
  otlp:
    protocols:
      grpc:
      http:
exporters:
  otlp:
    endpoint: jaeger-collector:4317
    tls:
      insecure: true
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp]`,
      },
      diagramComponentIds: ["otel-collector", "otel-sdk", "backend"],
      diagramConnectionIds: ["sdk-collector", "collector-backend"],
    },
    {
      id: "test",
      title: "How to test",
      description: "Send a debug span with telemetrygen or an instrumented app.",
      code: {
        language: "bash",
        title: "Port-forward OTLP",
        code: `kubectl -n observability port-forward svc/otel-opentelemetry-collector 4317:4317`,
      },
      diagramComponentIds: ["otel-sdk", "otel-collector"],
      diagramConnectionIds: ["sdk-collector"],
    },
    {
      id: "mistakes",
      title: "Common mistakes",
      description:
        "Apps still pointing at localhost Collector from another pod; TLS mismatch on OTLP; empty pipelines missing exporters.",
      code: {
        language: "bash",
        title: "Collector logs",
        code: `kubectl -n observability logs -l app.kubernetes.io/name=opentelemetry-collector --tail=100`,
      },
      diagramComponentIds: ["otel-collector"],
    },
  ],
};
