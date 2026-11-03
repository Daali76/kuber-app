"use client";

import Link from "next/link";
import { useState } from "react";
import { getLayer } from "@data/layers";
import { getLesson } from "@data/lessons";
import type { Tool } from "@/lib/types";
import { ClusterDiagram } from "@/components/cluster/ClusterDiagram";
import { ExplainLevels } from "@/components/ExplainLevels";
import { ImplementGuide } from "@/components/ImplementGuide";
import { LabPanel } from "@/components/LabPanel";
import { MaturityBadge } from "@/components/MaturityBadge";
import { QuizPanel } from "@/components/QuizPanel";
import { RichText } from "@/components/RichText";
import { TroubleshootPanel } from "@/components/TroubleshootPanel";
import { useI18n } from "@/lib/i18n";

const tabIds = [
  "diagram",
  "implement",
  "lab",
  "explain",
  "quiz",
  "troubleshoot",
  "alternatives",
] as const;

type TabId = (typeof tabIds)[number];

export function ToolWorkspace({ tool }: { tool: Tool }) {
  const [tab, setTab] = useState<TabId>("diagram");
  const layer = getLayer(tool.layer)!;
  const { ui, lang } = useI18n();

  const tabLabel: Record<TabId, string> = {
    diagram: ui("tabDiagram"),
    implement: ui("tabImplement"),
    lab: ui("tabLab"),
    explain: ui("tabExplain"),
    quiz: ui("tabQuiz"),
    troubleshoot: ui("tabTroubleshoot"),
    alternatives: ui("tabAlternatives"),
  };

  const beforeIds = tool.diagram.components
    .filter((c) => !c.highlight)
    .map((c) => c.id);
  const afterIds = tool.diagram.components.map((c) => c.id);

  return (
    <div>
      <Link
        href="/"
        className="mb-3 inline-flex min-h-10 items-center text-sm text-slate-400 transition hover:text-teal-200"
      >
        ← Cluster map
      </Link>

      {lang === "fa" ? (
        <p className="mb-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
          {ui("translationPending")}
        </p>
      ) : null}

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

      {tool.prerequisiteLessons.length > 0 ? (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {ui("learnFirst")}
          </p>
          <div className="flex flex-wrap gap-2">
            {tool.prerequisiteLessons.map((id) => {
              const lesson = getLesson(id);
              if (!lesson) return null;
              return (
                <Link
                  key={id}
                  href={`/learn/${id}`}
                  className="inline-flex min-h-10 items-center rounded-lg border border-teal-400/30 bg-teal-400/10 px-3 text-sm text-teal-100"
                >
                  {lesson.title.en}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-black/30 p-1 [scrollbar-width:thin]">
        {tabIds.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`min-h-11 shrink-0 rounded-lg px-3 text-xs font-semibold transition hover:text-slate-200 sm:text-sm ${
              tab === id
                ? "bg-teal-400/20 text-teal-100"
                : "text-slate-400"
            }`}
          >
            {tabLabel[id]}
          </button>
        ))}
      </div>

      {tab === "diagram" ? (
        <div className="space-y-4">
          <ClusterDiagram
            components={tool.diagram.components}
            connections={tool.diagram.connections}
            accent={layer.accent}
            title="Where it runs in the cluster"
            flows={tool.flows}
            beforeAfter={{
              beforeComponentIds: beforeIds,
              afterComponentIds: afterIds,
            }}
          />
          <section className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <h2 className="font-semibold text-slate-50">Why it exists</h2>
            <p className="text-sm text-slate-300">
              <RichText text={tool.whyItExists} />
            </p>
            <h2 className="pt-2 font-semibold text-slate-50">{ui("analogy")}</h2>
            <p className="text-sm text-slate-300">
              <RichText text={tool.analogy} />
            </p>
            <ol className="list-decimal space-y-1 ps-5 text-sm text-slate-300">
              {tool.howItWorks.map((step, i) => (
                <li key={i}>
                  <RichText text={step} />
                </li>
              ))}
            </ol>
          </section>
        </div>
      ) : null}

      {tab === "implement" ? (
        <ImplementGuide tool={tool} accent={layer.accent} />
      ) : null}

      {tab === "lab" ? <LabPanel tool={tool} /> : null}

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
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-teal-200"
            >
              Docs
            </a>
            <a
              href={tool.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-teal-200"
            >
              Repository
            </a>
          </div>
        </div>
      ) : null}

      {tab === "quiz" ? (
        <QuizPanel
          questions={tool.quiz}
          storageKey={`tool:${tool.id}`}
          continueHref={`/tools/${tool.id}`}
        />
      ) : null}

      {tab === "troubleshoot" ? <TroubleshootPanel tool={tool} /> : null}

      {tab === "alternatives" ? (
        <ul className="space-y-2">
          {tool.alternatives.map((alt) => (
            <li key={alt.id}>
              <Link
                href={`/tools/${alt.id}`}
                className="block rounded-xl border border-white/10 bg-white/[0.03] p-3"
              >
                <span className="font-semibold text-teal-200">{alt.id}</span>
                <p className="mt-1 text-sm text-slate-400">{alt.comparison}</p>
              </Link>
            </li>
          ))}
        </ul>
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
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <h3
        className={`mb-2 text-sm font-semibold ${
          tone === "good" ? "text-teal-200" : "text-amber-200"
        }`}
      >
        {title}
      </h3>
      <ul className="space-y-1 text-sm text-slate-300">
        {items.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}
