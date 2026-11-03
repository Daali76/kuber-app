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

  const picks: Partial<Record<LayerId, { id: string; reason: string }>> = {
    runtime: {
      id: "containerd",
      reason: "Default CRI runtime on most Kubernetes distributions.",
    },
    orchestration: {
      id: "kubernetes",
      reason: "Orchestration baseline for every other tool in this atlas.",
    },
    networking: {
      id: wantsSimple ? "coredns" : wantsSecurity || isLarge ? "cilium" : "istio",
      reason: wantsSimple
        ? "Start with CoreDNS before adding a mesh or advanced CNI."
        : wantsSecurity || isLarge
          ? "Cilium gives eBPF networking and identity-aware policy."
          : "Istio covers advanced L7 mesh features.",
    },
    storage: {
      id: onPrem ? "rook" : "kubernetes",
      reason: onPrem
        ? "Rook/Ceph fits self-managed on-prem persistent storage."
        : "Prefer cloud disks first; keep etcd/control-plane healthy via Kubernetes ops.",
    },
    delivery: {
      id: wantsSimple ? "helm" : "argo-cd",
      reason: wantsSimple
        ? "Helm is the lightest packaging path."
        : "Argo CD continuously reconciles Git to the cluster.",
    },
    observability: {
      id: wantsObs ? "opentelemetry" : "prometheus",
      reason: wantsObs
        ? "OpenTelemetry keeps instrumentation portable."
        : "Prometheus is the practical metrics starting point.",
    },
    security: {
      id: wantsSecurity
        ? wantsSimple
          ? "kyverno"
          : "falco"
        : "cert-manager",
      reason: wantsSecurity
        ? wantsSimple
          ? "Kyverno expresses admission policy in YAML."
          : "Falco adds runtime detection on every node."
        : "cert-manager automates TLS certificates.",
    },
  };

  return layersBottomToTop
    .filter((layer) => picks[layer.id])
    .map((layer) => {
      const pick = picks[layer.id]!;
      const tool = prefer([pick.id])!;
      return { layer: layer.id, tool, reason: pick.reason };
    });
}

export function installationOrder(stack: StackPick[]): StackPick[] {
  const order: LayerId[] = [
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
