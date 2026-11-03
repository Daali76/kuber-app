"use client";

import type { DiagramComponent } from "@/lib/types";

export function ComponentInfoCard({
  component,
  accent,
  onClose,
  variant = "sheet",
}: {
  component: DiagramComponent;
  accent: string;
  onClose: () => void;
  /** sheet = mobile bottom sheet; panel = desktop inline card */
  variant?: "sheet" | "panel";
}) {
  const shell =
    variant === "panel"
      ? "relative rounded-2xl border border-white/15 bg-[#0b1220]/95 p-4"
      : "fixed inset-x-0 bottom-0 z-[60] max-h-[40vh] overflow-y-auto rounded-t-2xl border border-white/15 bg-[#0b1220]/95 p-4 shadow-2xl backdrop-blur-xl md:inset-x-auto md:bottom-8 md:start-1/2 md:w-full md:max-w-md md:-translate-x-1/2 md:rounded-2xl";

  return (
    <div
      className={shell}
      style={
        variant === "sheet"
          ? { paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }
          : undefined
      }
      role="dialog"
      aria-label={component.label}
      data-testid="component-info-card"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: accent }}
          >
            {component.objectType}
          </p>
          <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-slate-50 sm:text-lg">
            {component.label}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-300"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <p className="text-base leading-relaxed text-slate-300">
        {component.description}
      </p>
      <p className="mt-3 text-base leading-relaxed text-slate-400">
        <span className="font-semibold text-slate-200">Why here: </span>
        {component.whyThere}
      </p>
    </div>
  );
}
