import { layersBottomToTop } from "@data/layers";
import { getTool, tools } from "@data/tools";
import type {
  Environment,
  LayerId,
  Priority,
  Scale,
  TeamSize,
  Tool,
} from "@/lib/types";

export interface BuilderInput {
  teamSize: TeamSize;
  scale: Scale;
  environment: Environment;
  priorities: Priority[];
}

export interface StackPick {
  layer: LayerId;
  tool: Tool;
  reason: string;
}

const prefer = (ids: string[]): Tool | undefined => {
  for (const id of ids) {
    const t = getTool(id);
    if (t) return t;
  }
  return tools[0];
};

export function recommendStack(input: BuilderInput): StackPick[] {
  const { teamSize, scale, environment, priorities } = input;
  const wantsSimple = priorities.includes("simplicity") || teamSize === "solo";
  const wantsSecurity = priorities.includes("security");
  const wantsObs = priorities.includes("observability");
  const isLarge = scale === "large";
  const onPrem = environment === "on-prem" || environment === "hybrid";

  const picks: Record<LayerId, { id: string; reason: string }> = {
    infrastructure: {
      id: onPrem || wantsSimple ? "crossplane" : "terraform",
      reason: onPrem
        ? "Kubernetes-native infra APIs fit hybrid/on-prem platforms."
        : wantsSimple
          ? "Crossplane keeps infra in the same GitOps control plane as apps."
          : "Terraform remains the broadest multi-cloud provisioning choice.",
    },
    runtime: {
      id: "containerd",
      reason: "Default, widely supported CRI runtime across distributions.",
    },
    orchestration: {
      id: isLarge && !wantsSimple ? "keda" : "kubernetes",
      reason:
        isLarge && !wantsSimple
          ? "Pair Kubernetes with KEDA when event-driven scale matters at size."
          : "Kubernetes is the orchestration baseline for this atlas.",
    },
    networking: {
      id: wantsSimple ? "linkerd" : wantsSecurity ? "cilium" : isLarge ? "istio" : "cilium",
      reason: wantsSimple
        ? "Linkerd keeps mesh operations light for smaller teams."
        : wantsSecurity
          ? "Cilium adds eBPF identity-aware networking and policy."
          : isLarge
            ? "Istio covers advanced L7 traffic features at scale."
            : "Cilium is a strong modern CNI with observability built in.",
    },
    storage: {
      id: onPrem ? (wantsSimple ? "longhorn" : "rook") : "etcd",
      reason: onPrem
        ? wantsSimple
          ? "Longhorn provides simpler distributed block storage on-prem."
          : "Rook/Ceph covers block, file, and object for serious on-prem needs."
        : "Protect etcd first — it holds Kubernetes control-plane state.",
    },
    delivery: {
      id: wantsSimple ? "flux" : "argo-cd",
      reason: wantsSimple
        ? "Flux's modular controllers are lightweight for GitOps."
        : "Argo CD's app model and UI help larger teams manage many deployments.",
    },
    observability: {
      id: wantsObs || isLarge ? "opentelemetry" : "prometheus",
      reason: wantsObs || isLarge
        ? "OpenTelemetry keeps instrumentation portable as the stack grows."
        : "Prometheus is the practical metrics starting point on Kubernetes.",
    },
    security: {
      id: wantsSecurity
        ? wantsSimple
          ? "kyverno"
          : "falco"
        : "cert-manager",
      reason: wantsSecurity
        ? wantsSimple
          ? "Kyverno expresses Kubernetes policy in familiar YAML."
          : "Falco adds runtime detection once baseline controls exist."
        : "cert-manager automates TLS — a universal security baseline.",
    },
  };

  // Ensure orchestration always includes kubernetes when KEDA picked
  return layersBottomToTop.map((layer) => {
    let pick = picks[layer.id];
    if (layer.id === "orchestration" && pick.id === "keda") {
      // Recommend KEDA but diagram should still center Kubernetes — use kubernetes as primary
      pick = {
        id: "kubernetes",
        reason:
          "Start with Kubernetes; add KEDA next for event-driven autoscaling at scale.",
      };
    }
    const tool = prefer([pick.id])!;
    return { layer: layer.id, tool, reason: pick.reason };
  });
}

export function installationOrder(stack: StackPick[]): StackPick[] {
  // Bottom-up install: infra → runtime → orchestration → networking → storage → security baseline → delivery → observability
  const order: LayerId[] = [
    "infrastructure",
    "runtime",
    "orchestration",
    "networking",
    "storage",
    "security",
    "delivery",
    "observability",
  ];
  return order
    .map((id) => stack.find((s) => s.layer === id)!)
    .filter(Boolean);
}
