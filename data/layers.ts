import type { LayerMeta } from "@/lib/types";

export const layers: LayerMeta[] = [
  {
    id: "infrastructure",
    name: "Infrastructure & Provisioning",
    shortName: "Infra",
    description: "Provision and manage cloud and cluster foundations.",
    accent: "#2dd4bf",
    accentSoft: "rgba(45, 212, 191, 0.14)",
    order: 1,
  },
  {
    id: "runtime",
    name: "Container Runtime",
    shortName: "Runtime",
    description: "Run containers via CRI-compatible engines.",
    accent: "#fbbf24",
    accentSoft: "rgba(251, 191, 36, 0.14)",
    order: 2,
  },
  {
    id: "orchestration",
    name: "Orchestration & Scheduling",
    shortName: "Orchestration",
    description: "Schedule workloads and scale cluster capacity.",
    accent: "#38bdf8",
    accentSoft: "rgba(56, 189, 248, 0.14)",
    order: 3,
  },
  {
    id: "networking",
    name: "Networking & Service Mesh",
    shortName: "Networking",
    description: "Connect services, discover endpoints, and shape traffic.",
    accent: "#34d399",
    accentSoft: "rgba(52, 211, 153, 0.14)",
    order: 4,
  },
  {
    id: "storage",
    name: "Storage",
    shortName: "Storage",
    description: "Persist state for apps and control planes.",
    accent: "#fb923c",
    accentSoft: "rgba(251, 146, 60, 0.14)",
    order: 5,
  },
  {
    id: "delivery",
    name: "App Definition & Delivery",
    shortName: "Delivery",
    description: "Package, ship, and continuously deliver apps (GitOps).",
    accent: "#f472b6",
    accentSoft: "rgba(244, 114, 182, 0.14)",
    order: 6,
  },
  {
    id: "observability",
    name: "Observability",
    shortName: "Observability",
    description: "Metrics, traces, and logs for running systems.",
    accent: "#a3e635",
    accentSoft: "rgba(163, 230, 53, 0.14)",
    order: 7,
  },
  {
    id: "security",
    name: "Security & Policy",
    shortName: "Security",
    description: "Runtime defense, policy, identity, and certificates.",
    accent: "#f87171",
    accentSoft: "rgba(248, 113, 113, 0.14)",
    order: 8,
  },
];

export const layersBottomToTop = [...layers].sort((a, b) => a.order - b.order);
export const layersTopToBottom = [...layersBottomToTop].reverse();

export function getLayer(id: string): LayerMeta | undefined {
  return layers.find((l) => l.id === id);
}
