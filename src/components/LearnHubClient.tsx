"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { lessons } from "@data/lessons";
import { useI18n } from "@/lib/i18n";
import {
  getProgressSnapshot,
  parseProgress,
  subscribeProgress,
} from "@/lib/progress";

export function LearnHubClient() {
  const { tr, ui } = useI18n();
  const raw = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    () => '{"version":1,"roadmap":{},"lessons":{},"labSteps":{},"quizScores":{},"flashcards":{}}',
  );
  const progress = useMemo(() => parseProgress(raw), [raw]);
  const done = lessons.filter((l) => progress.lessons[l.id]).length;

  const cards = [
    { href: "/builder", title: ui("builderCard"), desc: ui("builderCardDesc") },
    { href: "/compare", title: ui("compareCard"), desc: ui("compareCardDesc") },
    { href: "/review", title: ui("reviewCard"), desc: ui("reviewCardDesc") },
    { href: "/glossary", title: ui("glossaryCard"), desc: ui("glossaryCardDesc") },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-50 sm:text-3xl">
          {ui("learnHubTitle")}
        </h1>
        <p className="mt-1 text-sm text-slate-400">{ui("learnHubSubtitle")}</p>
        <p className="mt-2 text-xs text-slate-500">
          {ui("progress")}: {done} / {lessons.length}
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {ui("moreTools")}
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20"
            >
              <p className="font-semibold text-teal-100">{c.title}</p>
              <p className="mt-1 text-sm text-slate-400">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {ui("lessons")}
        </h2>
        <ol className="space-y-2">
          {lessons.map((lesson, i) => {
            const complete = !!progress.lessons[lesson.id];
            return (
              <li key={lesson.id}>
                <Link
                  href={`/learn/${lesson.id}`}
                  className="flex min-h-14 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      complete
                        ? "bg-teal-400/20 text-teal-200"
                        : "bg-black/30 text-slate-400"
                    }`}
                  >
                    {complete ? "✓" : i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-slate-50">
                      {tr(lesson.title)}
                    </span>
                    <span className="block text-sm text-slate-400 line-clamp-1">
                      {tr(lesson.analogy)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
