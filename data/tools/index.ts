import type { Tool } from "@/lib/types";
import { L } from "@/lib/types";
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
import { faNarratives } from "./fa-narratives";

type RawTool = {
  id: string;
  name: string;
  layer: Tool["layer"];
  maturity: Tool["maturity"];
  summary: string;
  problem: string;
  placementBlurb: string;
  levels: { beginner: string; intermediate: string; advanced: string };
  useWhen: string[];
  avoidWhen: string[];
  alternatives: { id: string; comparison: string }[];
  docsUrl: string;
  repoUrl: string;
  diagram: Tool["diagram"];
  implement: {
    id: string;
    title: string;
    description: string;
    code?: Tool["implement"][0]["code"];
    expectedOutput?: string;
    diagramComponentIds: string[];
    diagramConnectionIds?: string[];
  }[];
};

function withLearning(raw: RawTool): Tool {
  const pack = getLearningPack(raw.id);
  if (!pack) {
    throw new Error(`Missing learning pack for tool: ${raw.id}`);
  }
  const fa = faNarratives[raw.id];
  if (!fa) {
    throw new Error(`Missing FA narrative for tool: ${raw.id}`);
  }

  return {
    id: raw.id,
    name: raw.name,
    layer: raw.layer,
    maturity: raw.maturity,
    summary: L(raw.summary, fa.summary),
    problem: L(raw.problem, fa.problem),
    whyItExists: L(pack.whyItExists, fa.whyItExists),
    analogy: L(pack.analogy, fa.analogy),
    howItWorks: pack.howItWorks.map((step, i) =>
      L(step, fa.howItWorks[i] ?? step),
    ),
    prerequisiteLessons: pack.prerequisiteLessons,
    levels: {
      beginner: L(pack.levels.beginner, fa.levels.beginner),
      intermediate: L(pack.levels.intermediate, fa.levels.intermediate),
      advanced: L(pack.levels.advanced, fa.levels.advanced),
    },
    useWhen: raw.useWhen.map((s, i) => L(s, fa.useWhen[i] ?? s)),
    avoidWhen: raw.avoidWhen.map((s, i) => L(s, fa.avoidWhen[i] ?? s)),
    alternatives: raw.alternatives.map((alt) => ({
      id: alt.id,
      comparison: L(alt.comparison, fa.alternatives[alt.id] ?? alt.comparison),
    })),
    docsUrl: raw.docsUrl,
    repoUrl: raw.repoUrl,
    placementBlurb: L(raw.placementBlurb, fa.placementBlurb),
    diagram: raw.diagram,
    implement: raw.implement.map((step) => ({
      ...step,
      title: L(step.title, fa.implement[step.id]?.title ?? step.title),
      description: L(
        step.description,
        fa.implement[step.id]?.description ?? step.description,
      ),
    })),
    flows: pack.flows,
    lab: pack.lab,
    quiz: pack.quiz,
    troubleshooting: pack.troubleshooting,
  };
}

export const tools: Tool[] = (
  [
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
  ] as RawTool[]
).map(withLearning);

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
      t.summary.en,
      t.summary.fa,
      t.problem.en,
      t.problem.fa,
      t.layer,
      t.maturity,
      t.placementBlurb.en,
      t.placementBlurb.fa,
      ...t.useWhen.flatMap((s) => [s.en, s.fa]),
      ...t.avoidWhen.flatMap((s) => [s.en, s.fa]),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export const toolCount = tools.length;
