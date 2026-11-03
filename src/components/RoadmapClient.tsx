"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { roadmapSteps } from "@data/roadmap";
import { getTool } from "@data/tools";
import { loadRoadmapProgress, saveRoadmapProgress } from "@/lib/storage";

export function RoadmapClient() {
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(loadRoadmapProgress());
    setReady(true);
  }, []);

  function toggle(id: string) {
    setProgress((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      saveRoadmapProgress(next);
      return next;
    });
  }

  const done = roadmapSteps.filter((s) => progress[s.id]).length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-2 flex items-end justify-between">
          <p className="font-[family-name:var(--font-display)] text-sm font-semibold text-slate-200">
            Progress
          </p>
          <p className="text-xs text-slate-400">
            {ready ? `${done} / ${roadmapSteps.length}` : "…"}
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-black/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-sky-400 transition-all duration-500"
            style={{
              width: `${(done / roadmapSteps.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <ol className="space-y-3">
        {roadmapSteps.map((step, index) => {
          const checked = !!progress[step.id];
          return (
            <li
              key={step.id}
              className="layer-enter rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => toggle(step.id)}
                  className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-bold transition ${
                    checked
                      ? "border-teal-400/50 bg-teal-400/20 text-teal-200"
                      : "border-white/10 bg-black/20 text-slate-400"
                  }`}
                  aria-pressed={checked}
                  aria-label={`Mark ${step.title} complete`}
                >
                  {checked ? "✓" : index + 1}
                </button>
                <div className="min-w-0 flex-1">
                  <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-slate-50">
                    {step.title}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">
                    {step.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
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
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
