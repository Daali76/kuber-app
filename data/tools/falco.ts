import type { Tool } from "@/lib/types";
import { clusterBase, mergeDiagram } from "./_base";

const base = clusterBase({
  highlightAppPod: true,
  highlightKubelet: true,
  highlightRuntime: true,
});

export const falco: Tool = {
  id: "falco",
  name: "Falco",
  layer: "security",
  maturity: "Graduated",
  summary: "Cloud-native runtime security detection engine.",
  problem: "Misbehavior inside containers can go unnoticed without runtime signals.",
  placementBlurb: "DaemonSet reading kernel/syscall events on each node",
  levels: {
    beginner: "Falco watches syscalls and emits alerts for suspicious behaviors.",
    intermediate: "Custom rules and outputs integrate with your alerting stack.",
    advanced: "Plugins and eBPF instrumentation for richer detection.",
  },
  useWhen: [
    "You need runtime threat detection on Kubernetes nodes",
    "Compliance expects runtime monitoring",
  ],
  avoidWhen: ["You only need shift-left scanning without runtime detection"],
  alternatives: [
    {
      id: "kyverno",
      comparison: "Kyverno is admission policy; Falco detects runtime behavior after pods start.",
    },
  ],
  docsUrl: "https://falco.org/docs/",
  repoUrl: "https://github.com/falcosecurity/falco",
  diagram: mergeDiagram(base, {
    components: [
      {
        id: "falco",
        label: "Falco",
        zone: "worker-node",
        slot: "falco",
        objectType: "DaemonSet",
        description: "DaemonSet agent using eBPF/modern probe to watch syscalls.",
        whyThere: "Kernel events are per-node; detection must run on every worker.",
        highlight: true,
        stepIds: ["install", "verify"],
      },
      {
        id: "falco-rules",
        label: "Rules ConfigMap",
        zone: "namespace",
        slot: "rules",
        objectType: "ConfigMap",
        description: "Falco rules loaded by the agent.",
        whyThere: "Rule packs are mounted into the DaemonSet pods.",
        highlight: true,
        stepIds: ["example"],
      },
    ],
    connections: [
      {
        id: "falco-kernel",
        from: "falco",
        to: "runtime",
        label: "eBPF / syscalls",
        highlight: true,
        stepIds: ["verify", "test"],
      },
      {
        id: "falco-pod",
        from: "falco",
        to: "app-pod",
        label: "detect container behavior",
        highlight: true,
        stepIds: ["test"],
      },
      {
        id: "falco-api",
        from: "falco",
        to: "apiserver",
        label: "optional k8s meta",
        highlight: false,
        stepIds: ["install"],
      },
    ],
  }),
  implement: [
    {
      id: "prereq",
      title: "Prerequisites",
      description: "Helm 3; nodes allowing Falco's eBPF/modern probe (privileged DaemonSet).",
      code: {
        language: "bash",
        title: "Nodes",
        code: `kubectl get nodes`,
      },
      diagramComponentIds: ["runtime", "kubelet"],
    },
    {
      id: "install",
      title: "Install",
      description: "Official Falco Helm chart.",
      code: {
        language: "bash",
        title: "Helm install",
        code: `helm repo add falcosecurity https://falcosecurity.github.io/charts
helm repo update
helm install falco falcosecurity/falco --namespace falco --create-namespace \\
  --set tty=true`,
      },
      diagramComponentIds: ["falco", "falco-rules"],
    },
    {
      id: "verify",
      title: "Verify",
      description: "Falco DaemonSet Ready; agent logs show rule engine started.",
      code: {
        language: "bash",
        title: "DaemonSet",
        code: `kubectl -n falco get ds
kubectl -n falco logs -l app.kubernetes.io/name=falco --tail=50`,
      },
      expectedOutput: `falco ... Ready`,
      diagramComponentIds: ["falco"],
      diagramConnectionIds: ["falco-kernel"],
    },
    {
      id: "example",
      title: "Minimal working example",
      description: "Trigger a known noisy rule path carefully in a lab (shell in a container).",
      code: {
        language: "bash",
        title: "Lab trigger",
        code: `kubectl run falco-trigger --image=busybox:1.36 -it --restart=Never -- /bin/sh
# inside: cat /etc/shadow   # often matches a readable sensitive file rule`,
      },
      diagramComponentIds: ["falco", "falco-rules", "app-pod"],
      diagramConnectionIds: ["falco-pod"],
    },
    {
      id: "test",
      title: "How to test",
      description: "Watch Falco logs for an alert JSON/line after the trigger.",
      code: {
        language: "bash",
        title: "Alerts",
        code: `kubectl -n falco logs -l app.kubernetes.io/name=falco --tail=100 | grep -i priority || true`,
      },
      diagramComponentIds: ["falco", "app-pod"],
      diagramConnectionIds: ["falco-pod", "falco-kernel"],
    },
    {
      id: "mistakes",
      title: "Common mistakes",
      description:
        "Driver/probe failed to load on the kernel; overly noisy rules without output filtering; expecting Falco to block (it detects, does not enforce by itself).",
      code: {
        language: "bash",
        title: "Describe pod",
        code: `kubectl -n falco describe pod -l app.kubernetes.io/name=falco | tail -40`,
      },
      diagramComponentIds: ["falco"],
    },
  ],
};
