import type { Tool } from "@/lib/types";
import { clusterBase, mergeDiagram } from "./_base";

const base = clusterBase({
  highlightAppPod: true,
  highlightKubelet: true,
});

export const fluentBit: Tool = {
  id: "fluent-bit",
  name: "Fluent Bit",
  layer: "observability",
  maturity: "Graduated",
  summary: "Lightweight telemetry agent for logs (and more) on Kubernetes nodes.",
  problem: "Container logs on nodes need a small, reliable shipper to a backend.",
  placementBlurb: "DaemonSet on every node reading container logs",
  levels: {
    beginner: "DaemonSet tails container logs and forwards them to a destination.",
    intermediate: "Parsers, filters, and buffers shape production log pipelines.",
    advanced: "Multiline parsers and high-volume routing topologies.",
  },
  useWhen: [
    "You need a lightweight node log agent",
    "You want DaemonSet collection of container logs",
  ],
  avoidWhen: [
    "A managed logging agent is already mandated by your platform",
  ],
  alternatives: [
    {
      id: "opentelemetry",
      comparison: "OTel Collector can also ingest logs; Fluent Bit specializes in efficient node shipping.",
    },
  ],
  docsUrl: "https://docs.fluentbit.io/",
  repoUrl: "https://github.com/fluent/fluent-bit",
  diagram: mergeDiagram(base, {
    components: [
      {
        id: "fluent-bit",
        label: "Fluent Bit",
        zone: "worker-node",
        slot: "logging",
        objectType: "DaemonSet",
        description: "DaemonSet agent on each node reading container log files.",
        whyThere: "Log files live on the node filesystem under kubelet.",
        highlight: true,
        stepIds: ["install", "verify"],
      },
      {
        id: "log-backend",
        label: "Log backend",
        zone: "external",
        slot: "logs",
        objectType: "External",
        description: "Elasticsearch, Loki, S3, or other HTTP output.",
        whyThere: "Durable log storage is typically outside the node.",
        highlight: true,
        stepIds: ["example"],
      },
    ],
    connections: [
      {
        id: "fb-podlogs",
        from: "fluent-bit",
        to: "app-pod",
        label: "tail container logs",
        highlight: true,
        stepIds: ["verify", "test"],
      },
      {
        id: "fb-backend",
        from: "fluent-bit",
        to: "log-backend",
        label: "forward / HTTP output",
        highlight: true,
        stepIds: ["example", "test"],
      },
      {
        id: "fb-kubelet",
        from: "fluent-bit",
        to: "kubelet",
        label: "log path on node",
        highlight: true,
        stepIds: ["install"],
      },
    ],
  }),
  implement: [
    {
      id: "prereq",
      title: "Prerequisites",
      description: "Helm 3; decide output backend credentials/endpoints.",
      code: {
        language: "bash",
        title: "Nodes",
        code: `kubectl get nodes`,
      },
      diagramComponentIds: ["kubelet"],
    },
    {
      id: "install",
      title: "Install",
      description: "Official Fluent Bit Helm chart as a DaemonSet.",
      code: {
        language: "bash",
        title: "Helm install",
        code: `helm repo add fluent https://fluent.github.io/helm-charts
helm repo update
helm install fluent-bit fluent/fluent-bit --namespace logging --create-namespace`,
      },
      diagramComponentIds: ["fluent-bit"],
      diagramConnectionIds: ["fb-kubelet"],
    },
    {
      id: "verify",
      title: "Verify",
      description: "One Fluent Bit pod per node, Running.",
      code: {
        language: "bash",
        title: "DaemonSet",
        code: `kubectl -n logging get ds fluent-bit
kubectl -n logging get pods -o wide`,
      },
      expectedOutput: `fluent-bit-...   1/1   Running   ...   <node>`,
      diagramComponentIds: ["fluent-bit", "app-pod"],
      diagramConnectionIds: ["fb-podlogs"],
    },
    {
      id: "example",
      title: "Minimal working example",
      description: "Config sketch using the tail input and stdout output for a smoke test.",
      code: {
        language: "yaml",
        title: "tail → stdout",
        code: `[INPUT]
    Name              tail
    Tag               kube.*
    Path              /var/log/containers/*.log
    Parser            cri
    Mem_Buf_Limit     5MB

[OUTPUT]
    Name   stdout
    Match  *`,
      },
      diagramComponentIds: ["fluent-bit", "log-backend", "app-pod"],
      diagramConnectionIds: ["fb-podlogs", "fb-backend"],
    },
    {
      id: "test",
      title: "How to test",
      description: "Write logs from an app Pod and watch Fluent Bit stdout/backend.",
      code: {
        language: "bash",
        title: "Agent logs",
        code: `kubectl run loggen --image=busybox:1.36 --restart=Never -- /bin/sh -c "echo hello-atlas; sleep 30"
kubectl -n logging logs -l app.kubernetes.io/name=fluent-bit --tail=50`,
      },
      diagramComponentIds: ["fluent-bit", "app-pod"],
      diagramConnectionIds: ["fb-podlogs"],
    },
    {
      id: "mistakes",
      title: "Common mistakes",
      description:
        "Missing hostPath mounts for /var/log/containers; wrong CRI parser; backend auth failures silently dropping chunks.",
      code: {
        language: "bash",
        title: "Describe DaemonSet",
        code: `kubectl -n logging describe ds fluent-bit | sed -n '/Mounts/,/Conditions/p'`,
      },
      diagramComponentIds: ["fluent-bit", "kubelet"],
    },
  ],
};
