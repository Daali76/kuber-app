"use client";

import Link from "next/link";
import type { GlossaryTerm } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export function TermSheet({
  term,
  onClose,
}: {
  term: GlossaryTerm;
  onClose: () => void;
}) {
  const { tr, ui } = useI18n();
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[70] max-h-[40vh] overflow-y-auto rounded-t-2xl border border-white/15 bg-[#0b1220]/95 p-4 shadow-2xl backdrop-blur-xl md:inset-x-auto md:bottom-8 md:start-1/2 md:w-full md:max-w-md md:-translate-x-1/2 md:rounded-2xl"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      role="dialog"
      aria-label={term.term}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-300">
            {ui("glossaryCard")}
          </p>
          <h3
            className="font-[family-name:var(--font-display)] text-base font-semibold text-slate-50"
            dir="ltr"
          >
            {term.term}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-300"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <p className="text-sm leading-relaxed text-slate-300">{tr(term.definition)}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {term.relatedLessonId ? (
          <Link
            href={`/learn/${term.relatedLessonId}`}
            className="inline-flex min-h-10 items-center rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-teal-200"
            onClick={onClose}
          >
            {ui("related")}: lesson
          </Link>
        ) : null}
        {term.relatedToolId ? (
          <Link
            href={`/tools/${term.relatedToolId}`}
            className="inline-flex min-h-10 items-center rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-teal-200"
            onClick={onClose}
          >
            {ui("related")}: {term.relatedToolId}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
