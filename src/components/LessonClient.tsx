"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { clusterBase, mergeDiagram } from "@data/tools/_base";
import { corednsDiagramExtra, lessonNeedsCorednsDiagram } from "@data/lessons/diagram-extras";
import { getNextRecommendedLesson } from "@data/lessons";
import type { Lesson } from "@/lib/types";
import { ClusterDiagram } from "@/components/cluster/ClusterDiagram";
import { ComponentInfoCard } from "@/components/cluster/ComponentInfoCard";
import { CodeBlock } from "@/components/CodeBlock";
import { QuizPanel } from "@/components/QuizPanel";
import { RichText } from "@/components/RichText";
import { useI18n } from "@/lib/i18n";
import {
  getProgressSnapshot,
  markLessonComplete,
  parseProgress,
  subscribeProgress,
} from "@/lib/progress";

export function LessonClient({ lesson }: { lesson: Lesson }) {
  const { tr, ui } = useI18n();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [predictDraft, setPredictDraft] = useState("");
  const [awaitPredict, setAwaitPredict] = useState(false);
  const raw = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    () =>
      '{"version":1,"roadmap":{},"lessons":{},"labSteps":{},"quizScores":{},"flashcards":{}}',
  );
  const progress = useMemo(() => parseProgress(raw), [raw]);
  const done = !!progress.lessons[lesson.id];
  const nextLesson = useMemo(
    () => getNextRecommendedLesson(progress, lesson.id),
    [progress, lesson.id],
  );

  const buildSteps = lesson.buildSteps;
  const useBuildSteps = !!buildSteps?.length;

  const base = useMemo(() => {
    const b = clusterBase();
    if (lessonNeedsCorednsDiagram(lesson.id)) {
      return mergeDiagram(b, corednsDiagramExtra);
    }
    return b;
  }, [lesson.id]);

  const focusComponentIds = useMemo(() => {
    const ids = new Set<string>();
    if (useBuildSteps && buildSteps) {
      for (let i = 0; i <= step; i++) {
        buildSteps[i]?.componentIds.forEach((id) => ids.add(id));
      }
    } else {
      lesson.diagramHighlights.componentIds
        .slice(0, Math.max(1, step + 1))
        .forEach((id) => ids.add(id));
    }
    return [...ids];
  }, [useBuildSteps, buildSteps, step, lesson.diagramHighlights.componentIds]);

  const focusConnectionIds = useMemo(() => {
    const ids = new Set<string>();
    if (useBuildSteps && buildSteps) {
      for (let i = 0; i <= step; i++) {
        buildSteps[i]?.connectionIds?.forEach((id) => ids.add(id));
      }
    } else {
      (lesson.diagramHighlights.connectionIds ?? [])
        .slice(0, step)
        .forEach((id) => ids.add(id));
    }
    return [...ids];
  }, [useBuildSteps, buildSteps, step, lesson.diagramHighlights.connectionIds]);

  const stepCount = useBuildSteps
    ? (buildSteps?.length ?? 0)
    : lesson.diagramHighlights.componentIds.length + 1;

  const canAdvanceStep = step < stepCount - 1;

  const selected =
    base.components.find((c) => c.id === selectedId) ?? null;

  const currentCaption =
    useBuildSteps && buildSteps?.[step]
      ? tr(buildSteps[step].caption)
      : null;

  function advanceStep() {
    setStep((s) => Math.min(stepCount - 1, s + 1));
    setPredictDraft("");
    setAwaitPredict(false);
  }

  function handleNextStep() {
    if (useBuildSteps && canAdvanceStep && !awaitPredict) {
      setAwaitPredict(true);
      return;
    }
    if (awaitPredict) {
      advanceStep();
      return;
    }
    if (!useBuildSteps && canAdvanceStep) advanceStep();
  }

  const diagram = (
    <ClusterDiagram
      components={base.components.map((c) => ({
        ...c,
        highlight: focusComponentIds.includes(c.id),
      }))}
      connections={base.connections.map((c) => ({
        ...c,
        highlight: focusConnectionIds.includes(c.id),
      }))}
      focusComponentIds={focusComponentIds}
      focusConnectionIds={focusConnectionIds}
      flows={lesson.flows}
      title={tr(lesson.title)}
      selectedId={selectedId}
      onSelect={setSelectedId}
      infoVariant="none"
    />
  );

  return (
    <div className="space-y-5">
      <Link
        href="/learn"
        className="inline-flex min-h-11 items-center text-[15px] text-slate-400 hover:text-teal-200"
      >
        ← {ui("learnHubTitle")}
      </Link>
      <header>
        <h1 className="heading-page font-[family-name:var(--font-display)] font-semibold text-slate-50">
          {tr(lesson.title)}
        </h1>
        <p className="mt-2 text-base text-teal-100/90">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {ui("analogy")} ·{" "}
          </span>
          {tr(lesson.analogy)}
        </p>
      </header>

      {lesson.objectives?.length ? (
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
            {ui("objectives")}
          </h2>
          <ul className="list-inside list-disc space-y-1 text-base text-slate-300">
            {lesson.objectives.map((o, i) => (
              <li key={i}>
                <RichText text={o} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="xl:grid xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] xl:items-start xl:gap-8">
        <div className="xl:sticky xl:top-20">
          {diagram}
          {currentCaption ? (
            <p className="mt-2 text-sm text-slate-400">{currentCaption}</p>
          ) : null}
          {awaitPredict ? (
            <div className="mt-3 rounded-xl border border-amber-400/25 bg-amber-400/10 p-3">
              <p className="text-sm font-semibold text-amber-100">
                {ui("predict")}
              </p>
              <textarea
                value={predictDraft}
                onChange={(e) => setPredictDraft(e.target.value)}
                rows={2}
                placeholder="…"
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200"
              />
              <button
                type="button"
                onClick={handleNextStep}
                className="mt-2 min-h-10 rounded-lg bg-amber-400/90 px-3 text-sm font-semibold text-slate-950"
              >
                {ui("next")}
              </button>
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="min-h-11 rounded-lg border border-white/10 px-3 text-[15px] text-slate-200"
              disabled={step === 0}
              onClick={() => {
                setStep((s) => Math.max(0, s - 1));
                setAwaitPredict(false);
              }}
            >
              {ui("prev")}
            </button>
            <button
              type="button"
              className="min-h-11 rounded-lg border border-white/10 px-3 text-[15px] text-slate-200"
              disabled={!canAdvanceStep || awaitPredict}
              onClick={handleNextStep}
            >
              {ui("next")}
            </button>
            <span className="flex min-h-11 items-center text-sm text-slate-500">
              Step {step + 1}/{stepCount}
            </span>
          </div>
        </div>

        <div className="mt-4 min-w-0 space-y-4 xl:mt-0">
          {selected ? (
            <div className="hidden xl:block">
              <ComponentInfoCard
                component={selected}
                accent="#2dd4bf"
                onClose={() => setSelectedId(null)}
                variant="panel"
              />
            </div>
          ) : null}

          <div className="space-y-3">
            {lesson.explanation.map((p, i) => (
              <p key={i} className="text-base leading-relaxed text-slate-300">
                <RichText text={p} />
              </p>
            ))}
          </div>

          {lesson.commonConfusion ? (
            <section className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-4">
              <h2 className="mb-1 text-sm font-semibold text-rose-200/90">
                {ui("commonConfusion")}
              </h2>
              <p className="text-base text-slate-300">
                <RichText text={lesson.commonConfusion} />
              </p>
            </section>
          ) : null}

          {lesson.summaryLines?.length ? (
            <section className="rounded-xl border border-teal-400/20 bg-teal-400/5 p-4">
              <h2 className="mb-2 text-sm font-semibold text-teal-200/90">
                {ui("summary")}
              </h2>
              <ul className="space-y-1 text-base text-slate-300">
                {lesson.summaryLines.map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-teal-400">·</span>
                    <RichText text={line} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <h2 className="mb-2 font-semibold text-slate-50">
              {ui("keyCommands")}
            </h2>
            <div className="space-y-3">
              {lesson.keyCommands.map((cmd) => (
                <CodeBlock key={cmd.title} example={cmd} />
              ))}
            </div>
          </section>

          <QuizPanel
            questions={lesson.quiz}
            storageKey={`lesson:${lesson.id}`}
            continueHref={`/learn/${lesson.id}`}
          />

          <button
            type="button"
            onClick={() => markLessonComplete(lesson.id)}
            className={`flex min-h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold ${
              done
                ? "border border-teal-400/40 bg-teal-400/15 text-teal-100"
                : "bg-gradient-to-r from-teal-400 to-sky-400 text-slate-950"
            }`}
          >
            {done ? ui("completed") : ui("complete")}
          </button>

          {nextLesson ? (
            <Link
              href={`/learn/${nextLesson.id}`}
              className="flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] text-[15px] font-semibold text-teal-100 hover:border-white/25"
            >
              {ui("nextLesson")}: {tr(nextLesson.title)} →
            </Link>
          ) : null}
        </div>
      </div>

      {selected ? (
        <div className="xl:hidden">
          <ComponentInfoCard
            component={selected}
            accent="#2dd4bf"
            onClose={() => setSelectedId(null)}
            variant="sheet"
          />
        </div>
      ) : null}
    </div>
  );
}
