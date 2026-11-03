"use client";

import type { DiagramComponent } from "@/lib/types";

export function ComponentInfoCard({
  component,
  accent,
  onClose,
}: {
  component: DiagramComponent;
  accent: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-x-3 bottom-[4.75rem] z-[60] rounded-2xl border border-white/15 bg-[#0b1220]/95 p-4 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2"
      role="dialog"
      aria-label={component.label}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: accent }}
          >
            {component.objectType}
          </p>
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-slate-50">
            {component.label}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <p className="text-sm leading-relaxed text-slate-300">
        {component.description}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">
        <span className="font-semibold text-slate-200">Why here: </span>
        {component.whyThere}
      </p>
    </div>
  );
}
