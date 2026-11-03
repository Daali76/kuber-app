"use client";

import Link from "next/link";
import { useState } from "react";
import { getLayer } from "@data/layers";
import { getLesson } from "@data/lessons";
import { strategies } from "@data/strategies";
import type { Tool } from "@/lib/types";
import { ClusterDiagram } from "@/components/cluster/ClusterDiagram";
import { ComponentInfoCard } from "@/components/cluster/ComponentInfoCard";
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const layer = getLayer(tool.layer)!;
  const { ui, lang, tr } = useI18n();

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
  const selected = tool.diagram.components.find((c) => c.id === selectedId);
  const relatedStrategies = strategies.filter((s) =>
    s.relatedToolIds?.includes(tool.id),
  );
  const showStrategiesHub =
    tool.id === "argo-cd" || relatedStrategies.length > 0;

  const diagram = (
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
      selectedId={selectedId}
      onSelect={setSelectedId}
      infoVariant="none"
    />
  );

  const tabsBar = (
    <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-black/30 p-1 [scrollbar-width:thin]">
      {tabIds.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => setTab(id)}
          className={`min-h-11 shrink-0 rounded-lg px-3 text-[15px] font-semibold transition hover:text-slate-200 ${
            tab === id ? "bg-teal-400/20 text-teal-100" : "text-slate-400"
          }`}
        >
          {tabLabel[id]}
        </button>
      ))}
    </div>
  );

  const tabBody = (
    <>
      {tab === "diagram" ? (
        <div className="space-y-4 xl:hidden">{diagram}</div>
      ) : null}
      {tab === "diagram" ? (
        <section className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <h2 className="font-semibold text-slate-50">{ui("whyItExists")}</h2>
          <p className="text-base text-slate-300">
            <RichText text={tool.whyItExists} />
          </p>
          <h2 className="pt-2 font-semibold text-slate-50">{ui("analogy")}</h2>
          <p className="text-base text-slate-300">
            <RichText text={tool.analogy} />
          </p>
          <ol className="list-decimal space-y-1 ps-5 text-base text-slate-300">
            {tool.howItWorks.map((step, i) => (
              <li key={i}>
                <RichText text={step} />
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      {tab === "implement" ? (
        <ImplementGuide
          implement={tool.implement}
          diagram={tool.diagram}
          accent={layer.accent}
        />
      ) : null}
      {tab === "lab" ? (
        <LabPanel
          id={tool.id}
          lab={tool.lab}
          diagram={tool.diagram}
          hrefBase={`/tools/${tool.id}`}
        />
      ) : null}
      {tab === "explain" ? (
        <div className="space-y-4">
          <ExplainLevels levels={tool.levels} />
          <section className="grid gap-3 sm:grid-cols-2">
            <ListCard title={ui("useWhen")} items={tool.useWhen} tone="good" />
            <ListCard title={ui("avoidWhen")} items={tool.avoidWhen} tone="warn" />
          </section>
        </div>
      ) : null}
      {tab === "quiz" ? (
        <QuizPanel
          questions={tool.quiz}
          storageKey={`tool:${tool.id}`}
          continueHref={`/tools/${tool.id}`}
        />
      ) : null}
      {tab === "troubleshoot" ? (
        <TroubleshootPanel scenarios={tool.troubleshooting} />
      ) : null}
      {tab === "alternatives" ? (
        <ul className="space-y-2">
          {tool.alternatives.map((alt) => (
            <li key={alt.id}>
              <Link
                href={`/tools/${alt.id}`}
                className="block rounded-xl border border-white/10 bg-white/[0.03] p-3"
              >
                <span className="font-semibold text-teal-200">{alt.id}</span>
                <p className="mt-1 text-base text-slate-400">
                  <RichText text={alt.comparison} />
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );

  return (
    <div>
      <Link
        href="/"
        className="mb-3 inline-flex min-h-11 items-center text-[15px] text-slate-400 transition hover:text-teal-200"
      >
        {ui("backToMap")}
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
            {tr(layer.shortName)}
          </span>
        </div>
        <h1 className="heading-page mt-2 font-[family-name:var(--font-display)] font-extrabold tracking-tight text-slate-50">
          {tool.name}
        </h1>
        <p className="mt-1 max-w-3xl text-base text-slate-300">
          <RichText text={tool.summary} />
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
                  className="inline-flex min-h-11 items-center rounded-lg border border-teal-400/30 bg-teal-400/10 px-3 text-[15px] text-teal-100"
                >
                  {lang === "fa" ? lesson.title.fa : lesson.title.en}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      {showStrategiesHub ? (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {ui("strategies")}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/strategies"
              className="inline-flex min-h-11 items-center rounded-lg border border-pink-400/30 bg-pink-400/10 px-3 text-[15px] text-pink-100"
            >
              {ui("strategiesCard")}
            </Link>
            {relatedStrategies.map((s) => (
              <Link
                key={s.id}
                href={`/strategies/${s.id}`}
                className="inline-flex min-h-11 items-center rounded-lg border border-pink-400/20 bg-pink-400/5 px-3 text-[15px] text-pink-100/90"
              >
                {tr(s.name)}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {/* Desktop: diagram 60% sticky + side panel 40% */}
      <div className="xl:grid xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] xl:items-start xl:gap-8">
        <div className="hidden xl:block xl:sticky xl:top-20">{diagram}</div>
        <div className="min-w-0">
          {selected ? (
            <div className="mb-4 hidden xl:block">
              <ComponentInfoCard
                component={selected}
                accent={layer.accent}
                onClose={() => setSelectedId(null)}
                variant="panel"
              />
            </div>
          ) : null}
          {tabsBar}
          {tabBody}
        </div>
      </div>

      {/* Mobile sheet for selection when not using desktop panel */}
      <div className="xl:hidden">
        {selected ? (
          <ComponentInfoCard
            component={selected}
            accent={layer.accent}
            onClose={() => setSelectedId(null)}
            variant="sheet"
          />
        ) : null}
      </div>
    </div>
  );
}

function ListCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: Tool["useWhen"];
  tone: "good" | "warn";
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <h3
        className={`mb-2 text-[15px] font-semibold ${
          tone === "good" ? "text-teal-200" : "text-amber-200"
        }`}
      >
        {title}
      </h3>
      <ul className="space-y-1 text-base text-slate-300">
        {items.map((item, i) => (
          <li key={i}>
            · <RichText text={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
