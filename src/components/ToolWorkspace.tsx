"use client";

import Link from "next/link";
import { useState } from "react";
import { getLayer } from "@data/layers";
import { getTool } from "@data/tools";
import type { Tool } from "@/lib/types";
import { ClusterDiagram } from "@/components/cluster/ClusterDiagram";
import { ExplainLevels } from "@/components/ExplainLevels";
import { ImplementGuide } from "@/components/ImplementGuide";
import { MaturityBadge } from "@/components/MaturityBadge";

const tabs = [
  { id: "diagram", label: "Diagram" },
  { id: "implement", label: "Implement" },
  { id: "explain", label: "Explain" },
  { id: "alternatives", label: "Alternatives" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ToolWorkspace({ tool }: { tool: Tool }) {
  const [tab, setTab] = useState<TabId>("diagram");
  const layer = getLayer(tool.layer)!;

  return (
    <div>
      <Link
        href="/"
        className="mb-3 inline-flex min-h-10 items-center text-sm text-slate-400 transition hover:text-teal-200"
      >
        ← Cluster map
      </Link>

      <header
        className="mb-4 overflow-hidden rounded-2xl border border-white/10 p-4 md:p-6"
        style={{
          background: `linear-gradient(160deg, ${layer.accentSoft}, rgba(8,12,20,0.95))`,
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <MaturityBadge maturity={tool.maturity} />
          <span
            className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
            style={{ background: `${layer.accent}22`, color: layer.accent }}
          >
            {layer.shortName}
          </span>
        </div>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-slate-50 md:text-4xl">
          {tool.name}
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-300 md:text-base">
          {tool.summary}
        </p>
        <p className="mt-2 text-xs text-slate-400 md:text-sm">
          {tool.placementBlurb}
        </p>
      </header>

      <div className="mb-4 flex gap-1 rounded-xl bg-black/30 p-1 md:max-w-xl">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`min-h-11 flex-1 rounded-lg px-1 text-xs font-semibold transition hover:text-slate-200 sm:text-sm ${
              tab === t.id
                ? "bg-teal-400/20 text-teal-100"
                : "text-slate-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "diagram" ? (
        <ClusterDiagram
          components={tool.diagram.components}
          connections={tool.diagram.connections}
          accent={layer.accent}
          title="Where it runs in the cluster"
        />
      ) : null}

      {tab === "implement" ? (
        <ImplementGuide tool={tool} accent={layer.accent} />
      ) : null}

      {tab === "explain" ? (
        <div className="space-y-4">
          <ExplainLevels levels={tool.levels} />
          <section className="grid gap-3 sm:grid-cols-2">
            <ListCard title="Use when" items={tool.useWhen} tone="good" />
            <ListCard title="Avoid when" items={tool.avoidWhen} tone="warn" />
          </section>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={tool.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 flex-1 items-center justify-center rounded-xl border border-teal-400/30 bg-teal-400/10 text-sm font-semibold text-teal-100"
            >
              Official docs
            </a>
            <a
              href={tool.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-slate-200"
            >
              GitHub
            </a>
          </div>
        </div>
      ) : null}

      {tab === "alternatives" ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-slate-100">
            Alternatives
          </h2>
          {tool.alternatives.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">
              No close alternatives in this atlas yet.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {tool.alternatives.map((alt) => {
                const altTool = getTool(alt.id);
                return (
                  <li key={alt.id} className="text-sm text-slate-400">
                    {altTool ? (
                      <Link
                        href={`/tools/${alt.id}`}
                        className="font-medium text-teal-200"
                      >
                        {altTool.name}
                      </Link>
                    ) : (
                      <span className="font-medium text-slate-200">
                        {alt.id}
                      </span>
                    )}
                    <span className="mt-0.5 block">{alt.comparison}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}

function ListCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "good" | "warn";
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-slate-100">
        {title}
      </h2>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-slate-400">
            <span
              className={
                tone === "good" ? "text-emerald-400" : "text-amber-400"
              }
            >
              ▸
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
