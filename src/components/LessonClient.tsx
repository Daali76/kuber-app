"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { clusterBase } from "@data/tools/_base";
import type { Lesson } from "@/lib/types";
import { ClusterDiagram } from "@/components/cluster/ClusterDiagram";
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
  const raw = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    () => '{"version":1,"roadmap":{},"lessons":{},"labSteps":{},"quizScores":{},"flashcards":{}}',
  );
  const progress = useMemo(() => parseProgress(raw), [raw]);
  const done = !!progress.lessons[lesson.id];
  const base = useMemo(() => clusterBase(), []);

  return (
    <div className="space-y-5">
      <Link href="/learn" className="text-sm text-slate-400 hover:text-teal-200">
        ← {ui("learnHubTitle")}
      </Link>
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-50 sm:text-3xl">
          {tr(lesson.title)}
        </h1>
        <p className="mt-2 text-sm text-teal-100/90">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {ui("analogy")} ·{" "}
          </span>
          {tr(lesson.analogy)}
        </p>
      </header>

      <ClusterDiagram
        components={base.components.map((c) => ({
          ...c,
          highlight: lesson.diagramHighlights.componentIds.includes(c.id),
        }))}
        connections={base.connections.map((c) => ({
          ...c,
          highlight: !!lesson.diagramHighlights.connectionIds?.includes(c.id),
        }))}
        focusComponentIds={lesson.diagramHighlights.componentIds}
        focusConnectionIds={lesson.diagramHighlights.connectionIds ?? null}
        title={tr(lesson.title)}
      />

      <div className="space-y-3">
        {lesson.explanation.map((p, i) => (
          <p key={i} className="text-sm leading-relaxed text-slate-300">
            <RichText text={p} />
          </p>
        ))}
      </div>

      <section>
        <h2 className="mb-2 font-semibold text-slate-50">{ui("keyCommands")}</h2>
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
        className={`flex min-h-12 w-full items-center justify-center rounded-xl font-semibold ${
          done
            ? "border border-teal-400/40 bg-teal-400/15 text-teal-100"
            : "bg-gradient-to-r from-teal-400 to-sky-400 text-slate-950"
        }`}
      >
        {done ? ui("completed") : ui("complete")}
      </button>
    </div>
  );
}
