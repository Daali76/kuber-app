"use client";

import Link from "next/link";
import { useMemo, useRef, useSyncExternalStore } from "react";
import { getLesson } from "@data/lessons";
import { roadmapSteps } from "@data/roadmap";
import { getTool } from "@data/tools";
import { useI18n } from "@/lib/i18n";
import {
  exportProgress,
  getProgressSnapshot,
  importProgress,
  parseProgress,
  setRoadmapStep,
  subscribeProgress,
} from "@/lib/progress";

export function RoadmapClient() {
  const { ui } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const raw = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    () => '{"version":1,"roadmap":{},"lessons":{},"labSteps":{},"quizScores":{},"flashcards":{}}',
  );
  const progress = useMemo(() => parseProgress(raw), [raw]);

  const totalUnits = roadmapSteps.reduce(
    (n, s) =>
      n + (s.prerequisiteLessonIds?.length ?? 0) + s.toolIds.length + 1,
    0,
  );
  const doneUnits = roadmapSteps.reduce((n, s) => {
    let c = progress.roadmap[s.id] ? 1 : 0;
    for (const id of s.prerequisiteLessonIds ?? []) {
      if (progress.lessons[id]) c += 1;
    }
    for (const id of s.toolIds) {
      if (progress.quizScores[`tool:${id}`]) c += 1;
    }
    return n + c;
  }, 0);
  const pct = Math.round((doneUnits / Math.max(totalUnits, 1)) * 100);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-2 flex items-end justify-between gap-2">
          <p className="font-[family-name:var(--font-display)] text-sm font-semibold text-slate-200">
            {ui("progress")}
          </p>
          <p className="text-xs text-slate-400">
            {mounted ? `${pct}%` : "…"}
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-black/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-sky-400 transition-all duration-500"
            style={{ width: mounted ? `${pct}%` : "0%" }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="min-h-10 rounded-lg border border-white/10 px-3 text-sm text-slate-200"
            onClick={() => {
              const blob = new Blob([exportProgress()], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "cna-progress.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            {ui("exportProgress")}
          </button>
          <button
            type="button"
            className="min-h-10 rounded-lg border border-white/10 px-3 text-sm text-slate-200"
            onClick={() => fileRef.current?.click()}
          >
            {ui("importProgress")}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const text = await file.text();
              importProgress(text);
            }}
          />
        </div>
      </div>

      <ol className="space-y-3">
        {roadmapSteps.map((step, index) => {
          const checked = mounted ? !!progress.roadmap[step.id] : false;
          return (
            <li
              key={step.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRoadmapStep(step.id, !checked)}
                  className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${
                    checked
                      ? "border-teal-400/50 bg-teal-400/20 text-teal-200"
                      : "border-white/10 bg-black/20 text-slate-400"
                  }`}
                  aria-pressed={checked}
                >
                  {checked ? "✓" : index + 1}
                </button>
                <div className="min-w-0 flex-1">
                  <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-slate-50">
                    {step.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {step.description}
                  </p>
                  {step.prerequisiteLessonIds?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {step.prerequisiteLessonIds.map((id) => {
                        const lesson = getLesson(id);
                        if (!lesson) return null;
                        const ld = !!progress.lessons[id];
                        return (
                          <Link
                            key={id}
                            href={`/learn/${id}`}
                            className={`inline-flex min-h-10 items-center rounded-lg border px-3 text-sm ${
                              ld
                                ? "border-teal-400/40 text-teal-100"
                                : "border-white/10 text-teal-200"
                            }`}
                          >
                            {lesson.title.en}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                  {step.toolIds.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {step.toolIds.map((id) => {
                        const tool = getTool(id);
                        if (!tool) return null;
                        return (
                          <Link
                            key={id}
                            href={`/tools/${id}`}
                            className="inline-flex min-h-10 items-center rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-teal-200"
                          >
                            {tool.name}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
