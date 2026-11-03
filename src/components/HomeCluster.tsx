"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { getLayer, layers } from "@data/layers";
import { tools } from "@data/tools";
import type { DiagramZone, Tool } from "@/lib/types";
import { clusterBase } from "@data/tools/_base";
import { ClusterDiagram } from "@/components/cluster/ClusterDiagram";
import { useI18n } from "@/lib/i18n";
import {
  getProgressSnapshot,
  parseProgress,
  subscribeProgress,
} from "@/lib/progress";

/** Map tools onto overview diagram components as extra pins. */
function overviewModel() {
  const base = clusterBase();
  const pins = tools.map((tool) => {
    const zone = pinZone(tool);
    return {
      id: `tool-${tool.id}`,
      label: tool.name,
      zone,
      objectType: "External" as const,
      description: tool.summary,
      whyThere: tool.placementBlurb,
      highlight: true,
      toolId: tool.id,
      slot: tool.id,
    };
  });

  // Replace generic highlights — keep skeleton dim, tools hot
  const components = [
    ...base.components.map((c) => ({ ...c, highlight: false })),
    ...pins,
  ];

  return {
    components,
    connections: base.connections.map((c) => ({ ...c, highlight: false })),
    pinToTool: Object.fromEntries(pins.map((p) => [p.id, p.toolId])),
  };
}

function pinZone(tool: Tool): DiagramZone {
  switch (tool.layer) {
    case "runtime":
      return "worker-node";
    case "orchestration":
      return tool.id === "kubernetes" ? "control-plane" : "namespace";
    case "networking":
      if (tool.id === "coredns") return "namespace";
      if (tool.id === "cilium") return "worker-node";
      return "namespace";
    case "storage":
      return "worker-node";
    case "delivery":
      return tool.id === "helm" ? "external" : "namespace";
    case "observability":
      return tool.id === "fluent-bit" ? "worker-node" : "namespace";
    case "security":
      return tool.id === "falco" ? "worker-node" : "namespace";
    default:
      return "external";
  }
}

export function HomeCluster() {
  const { ui } = useI18n();
  const model = useMemo(() => overviewModel(), []);
  const [filter, setFilter] = useState<string>("all");
  const raw = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    () => '{"version":1,"roadmap":{},"lessons":{},"labSteps":{},"quizScores":{},"flashcards":{}}',
  );
  const progress = useMemo(() => parseProgress(raw), [raw]);

  const visibleTools =
    filter === "all" ? tools : tools.filter((t) => t.layer === filter);

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] p-5 md:p-8">
        <div className="brand-orb pointer-events-none absolute -end-8 -top-10 h-36 w-36 rounded-full bg-teal-400/20 blur-2xl" />
        <p className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-slate-50 md:text-5xl">
          {ui("brand")}
        </p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400 md:text-base">
          Select a tool to see exactly where it runs in a Kubernetes cluster —
          then walk an implementation guide that builds the diagram step by
          step.
        </p>
        <div className="hero-rule mt-4 max-w-md rounded-full" />
      </div>

      {progress.continue ? (
        <Link
          href={progress.continue.href}
          className="flex min-h-14 items-center justify-between rounded-xl border border-teal-400/30 bg-teal-400/10 px-4 py-3"
        >
          <span>
            <span className="block text-xs font-semibold uppercase tracking-wider text-teal-300/80">
              {ui("continueTitle")}
            </span>
            <span className="text-sm text-slate-100">
              {progress.continue.href}
            </span>
          </span>
          <span className="text-teal-200">→</span>
        </Link>
      ) : (
        <Link
          href="/learn"
          className="flex min-h-14 items-center justify-between rounded-xl border border-teal-400/30 bg-teal-400/10 px-4 py-3"
        >
          <span>
            <span className="block text-xs font-semibold uppercase tracking-wider text-teal-300/80">
              {ui("continueTitle")}
            </span>
            <span className="text-sm text-slate-100">{ui("learnHubTitle")}</span>
          </span>
          <span className="text-teal-200">→</span>
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
        <div className="lg:sticky lg:top-20">
          <ClusterDiagram
            components={model.components}
            connections={model.connections}
            accent="#38bdf8"
            title="Cluster overview — select a tool pin"
            navigateOnSelect={Object.fromEntries(
              Object.entries(model.pinToTool).map(([pin, id]) => [
                pin,
                `/tools/${id}`,
              ]),
            )}
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Tools by layer
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            <FilterChip
              label="All"
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            {layers.map((l) => (
              <FilterChip
                key={l.id}
                label={l.shortName}
                active={filter === l.id}
                onClick={() => setFilter(l.id)}
                accent={l.accent}
              />
            ))}
          </div>

          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-2">
            {visibleTools.map((tool) => {
              const layer = getLayer(tool.layer)!;
              return (
                <li key={tool.id}>
                  <Link
                    href={`/tools/${tool.id}`}
                    className="flex min-h-16 items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
                  >
                    <span
                      className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: layer.accent }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="font-[family-name:var(--font-display)] font-semibold text-slate-50">
                        {tool.name}
                      </span>
                      <span className="mt-0.5 block text-sm text-slate-400">
                        {tool.placementBlurb}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  accent,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  accent?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 shrink-0 rounded-lg border px-3 text-sm font-medium transition hover:border-white/20 ${
        active
          ? "border-teal-400/40 bg-teal-400/15 text-teal-100"
          : "border-white/10 bg-black/20 text-slate-300"
      }`}
      style={
        active && accent
          ? {
              borderColor: `${accent}66`,
              background: `${accent}22`,
              color: "#ecfeff",
            }
          : undefined
      }
    >
      {label}
    </button>
  );
}
