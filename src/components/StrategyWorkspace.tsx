"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DiagramFlow, Strategy } from "@/lib/types";
import { ClusterDiagram } from "@/components/cluster/ClusterDiagram";
import { ComponentInfoCard } from "@/components/cluster/ComponentInfoCard";
import { ImplementGuide } from "@/components/ImplementGuide";
import { LabPanel } from "@/components/LabPanel";
import { QuizPanel } from "@/components/QuizPanel";
import { RichText } from "@/components/RichText";
import { TroubleshootPanel } from "@/components/TroubleshootPanel";
import { ArgoCdToggles } from "@/components/strategies/ArgoCdToggles";
import { BlueGreenControls } from "@/components/strategies/BlueGreenControls";
import { CanaryTrafficBar } from "@/components/strategies/CanaryTrafficBar";
import { CompareTable } from "@/components/strategies/CompareTable";
import { KustomizeDiffView } from "@/components/strategies/KustomizeDiffView";
import { RollingSliders } from "@/components/strategies/RollingSliders";
import { useI18n } from "@/lib/i18n";

const tabIds = [
  "how",
  "implement",
  "lab",
  "quiz",
  "troubleshoot",
] as const;

type TabId = (typeof tabIds)[number];

const ACCENT = "#f472b6";

export function StrategyWorkspace({ strategy }: { strategy: Strategy }) {
  const { ui, tr } = useI18n();
  const [tab, setTab] = useState<TabId>("how");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [roll, setRoll] = useState({
    replicas: 4,
    maxSurge: 25,
    maxUnavailable: 25,
  });
  const [canaryWeight, setCanaryWeight] = useState(20);
  const [canaryFailed, setCanaryFailed] = useState(false);
  const [bgPhase, setBgPhase] = useState<
    "deploy" | "preview" | "promoted" | "aborted"
  >("deploy");

  const selected = strategy.diagram.components.find((c) => c.id === selectedId);

  const activeFlows: DiagramFlow[] = useMemo(() => {
    if (strategy.interactive === "canary-traffic" && canaryFailed) {
      return strategy.rollbackFlows?.length
        ? strategy.rollbackFlows
        : strategy.flows;
    }
    if (strategy.interactive === "blue-green-promote" && bgPhase === "aborted") {
      return strategy.rollbackFlows?.length
        ? strategy.rollbackFlows
        : strategy.flows;
    }
    if (strategy.interactive === "rolling-sliders") {
      return strategy.flows.map((f) => ({
        ...f,
        steps: f.steps.map((s, i) => ({
          ...s,
          caption: {
            en: `${s.caption.en} (replicas=${roll.replicas}, maxSurge=${roll.maxSurge}%, maxUnavailable=${roll.maxUnavailable}%)`,
            fa: `${s.caption.fa} (replicas=${roll.replicas}، maxSurge=${roll.maxSurge}%، maxUnavailable=${roll.maxUnavailable}%)`,
          },
          // Keep first steps lighter when surge is 0
          componentIds:
            i === 1 && roll.maxSurge === 0
              ? s.componentIds?.filter((id) => id !== "pod-v2")
              : s.componentIds,
        })),
      }));
    }
    if (strategy.interactive === "canary-traffic") {
      return strategy.flows.map((f) => ({
        ...f,
        steps: f.steps.map((s) => ({
          ...s,
          caption: {
            en: `${s.caption.en} · UI weight ${canaryWeight}%`,
            fa: `${s.caption.fa} · وزن UI ${canaryWeight}%`,
          },
        })),
      }));
    }
    return strategy.flows;
  }, [strategy, roll, canaryWeight, canaryFailed, bgPhase]);

  const beforeAfter =
    strategy.beforeAfter ??
    ({
      beforeComponentIds: strategy.diagram.components
        .filter((c) => !c.highlight)
        .map((c) => c.id),
      afterComponentIds: strategy.diagram.components.map((c) => c.id),
    } as const);

  const tabLabel: Record<TabId, string> = {
    how: ui("tabExplain"),
    implement: ui("tabImplement"),
    lab: ui("tabLab"),
    quiz: ui("tabQuiz"),
    troubleshoot: ui("tabTroubleshoot"),
  };

  const interactive = (
    <>
      {strategy.interactive === "rolling-sliders" ? (
        <RollingSliders {...roll} onChange={setRoll} />
      ) : null}
      {strategy.interactive === "canary-traffic" ? (
        <CanaryTrafficBar
          weight={canaryWeight}
          failed={canaryFailed}
          onWeight={(w) => {
            setCanaryFailed(false);
            setCanaryWeight(w);
          }}
          onFail={() => {
            setCanaryFailed(true);
            setCanaryWeight(0);
          }}
          onReset={() => {
            setCanaryFailed(false);
            setCanaryWeight(20);
          }}
        />
      ) : null}
      {strategy.interactive === "blue-green-promote" ? (
        <BlueGreenControls phase={bgPhase} onPhase={setBgPhase} />
      ) : null}
      {strategy.interactive === "kustomize-diff" && strategy.kustomizeDiffs ? (
        <KustomizeDiffView overlays={strategy.kustomizeDiffs} />
      ) : null}
      {strategy.interactive === "argocd-toggles" ? <ArgoCdToggles /> : null}
      {strategy.interactive === "compare-table" ? (
        <CompareTable strategy={strategy} />
      ) : null}
    </>
  );

  const diagram = (
    <ClusterDiagram
      components={strategy.diagram.components}
      connections={strategy.diagram.connections}
      accent={ACCENT}
      title={tr(strategy.placementBlurb)}
      flows={activeFlows}
      beforeAfter={beforeAfter}
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
            tab === id ? "bg-pink-400/20 text-pink-100" : "text-slate-400"
          }`}
        >
          {tabLabel[id]}
        </button>
      ))}
    </div>
  );

  const tabBody = (
    <>
      {tab === "how" ? (
        <div className="space-y-4">
          <div className="xl:hidden">{diagram}</div>
          {interactive}
          <section className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <h2 className="font-semibold text-slate-50">{ui("whyItExists")}</h2>
            <p className="text-base text-slate-300">
              <RichText text={strategy.whyItExists} />
            </p>
            <h2 className="pt-2 font-semibold text-slate-50">{ui("analogy")}</h2>
            <p className="text-base text-slate-300">
              <RichText text={strategy.analogy} />
            </p>
            <ol className="list-decimal space-y-1 ps-5 text-base text-slate-300">
              {strategy.howItWorks.map((step, i) => (
                <li key={i}>
                  <RichText text={step} />
                </li>
              ))}
            </ol>
          </section>
          <section className="grid gap-3 sm:grid-cols-2">
            <ListCard title={ui("useWhen")} items={strategy.useWhen} tone="good" />
            <ListCard
              title={ui("avoidWhen")}
              items={strategy.avoidWhen}
              tone="warn"
            />
          </section>
        </div>
      ) : null}
      {tab === "implement" ? (
        <ImplementGuide
          implement={strategy.implement}
          diagram={strategy.diagram}
          accent={ACCENT}
        />
      ) : null}
      {tab === "lab" ? (
        <LabPanel
          id={strategy.id}
          lab={strategy.lab}
          diagram={strategy.diagram}
          hrefBase={`/strategies/${strategy.id}`}
        />
      ) : null}
      {tab === "quiz" ? (
        <QuizPanel
          questions={strategy.quiz}
          storageKey={`strategy:${strategy.id}`}
          continueHref={`/strategies/${strategy.id}`}
        />
      ) : null}
      {tab === "troubleshoot" ? (
        <TroubleshootPanel scenarios={strategy.troubleshooting} />
      ) : null}
    </>
  );

  return (
    <div>
      <Link
        href="/strategies"
        className="mb-3 inline-flex min-h-11 items-center text-[15px] text-slate-400 transition hover:text-pink-200"
      >
        {ui("strategiesBack")}
      </Link>

      <header
        className="mb-4 overflow-hidden rounded-2xl border border-white/10 p-4 md:p-6"
        style={{
          background:
            "linear-gradient(160deg, rgba(244,114,182,0.14), rgba(8,12,20,0.95))",
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-200/80">
          {ui("strategies")}
        </p>
        <h1 className="heading-page mt-2 font-extrabold tracking-tight text-slate-50">
          {tr(strategy.name)}
        </h1>
        <p className="mt-1 max-w-3xl text-base text-slate-300">
          <RichText text={strategy.summary} />
        </p>
        <a
          href={strategy.docsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex min-h-11 items-center text-[15px] text-teal-200"
        >
          Docs ↗
        </a>
      </header>

      <div className="xl:grid xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] xl:items-start xl:gap-8">
        <div className="hidden space-y-4 xl:block xl:sticky xl:top-20">
          {diagram}
          {interactive}
        </div>
        <div className="min-w-0">
          {selected ? (
            <div className="mb-4 hidden xl:block">
              <ComponentInfoCard
                component={selected}
                accent={ACCENT}
                onClose={() => setSelectedId(null)}
                variant="panel"
              />
            </div>
          ) : null}
          {tabsBar}
          {tabBody}
        </div>
      </div>

      <div className="xl:hidden">
        {selected ? (
          <ComponentInfoCard
            component={selected}
            accent={ACCENT}
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
  items: Strategy["useWhen"];
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
