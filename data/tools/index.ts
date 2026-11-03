import type { Tool } from "@/lib/types";
import { argoCd } from "./argo-cd";
import { certManager } from "./cert-manager";
import { cilium } from "./cilium";
import { containerd } from "./containerd";
import { coredns } from "./coredns";
import { falco } from "./falco";
import { fluentBit } from "./fluent-bit";
import { grafana } from "./grafana";
import { helm } from "./helm";
import { istio } from "./istio";
import { kubernetes } from "./kubernetes";
import { kyverno } from "./kyverno";
import { getLearningPack } from "./learning-packs";
import { opentelemetry } from "./opentelemetry";
import { prometheus } from "./prometheus";
import { rook } from "./rook";

function withLearning<T extends { id: string; levels: Tool["levels"] }>(
  tool: T,
): Tool {
  const pack = getLearningPack(tool.id);
  if (!pack) {
    throw new Error(`Missing learning pack for tool: ${tool.id}`);
  }
  return {
    ...tool,
    ...pack,
    levels: pack.levels,
  } as unknown as Tool;
}

export const tools: Tool[] = [
  kubernetes,
  containerd,
  coredns,
  cilium,
  istio,
  prometheus,
  grafana,
  opentelemetry,
  fluentBit,
  argoCd,
  helm,
  certManager,
  falco,
  kyverno,
  rook,
].map(withLearning);

export function getTool(id: string): Tool | undefined {
  return tools.find((t) => t.id === id);
}

export function getToolsByLayer(layer: string): Tool[] {
  return tools.filter((t) => t.layer === layer);
}

export function searchTools(query: string): Tool[] {
  const q = query.trim().toLowerCase();
  if (!q) return tools;
  return tools.filter((t) => {
    const hay = [
      t.name,
      t.summary,
      t.problem,
      t.layer,
      t.maturity,
      t.placementBlurb,
      ...t.useWhen,
      ...t.avoidWhen,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export const toolCount = tools.length;
