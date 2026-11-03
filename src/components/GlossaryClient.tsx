"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { glossary } from "@data/glossary";
import { TermSheet } from "@/components/TermSheet";
import { useI18n } from "@/lib/i18n";
import type { GlossaryTerm } from "@/lib/types";

export function GlossaryClient() {
  const { tr, ui } = useI18n();
  const [q, setQ] = useState("");
  const [active, setActive] = useState<GlossaryTerm | null>(null);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return glossary;
    return glossary.filter(
      (t) =>
        t.term.toLowerCase().includes(needle) ||
        t.definition.en.toLowerCase().includes(needle) ||
        t.definition.fa.includes(needle),
    );
  }, [q]);

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={ui("searchTools")}
        className="min-h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-base text-slate-100 outline-none placeholder:text-slate-500 focus:border-teal-400/40 focus:ring-2 focus:ring-teal-400/20"
        dir="auto"
      />
      <p className="text-sm text-slate-400">
        {results.length} {ui("searchGlossary").toLowerCase()}
      </p>
      <ul className="space-y-2">
        {results.map((term) => (
          <li key={term.id}>
            <button
              type="button"
              onClick={() => setActive(term)}
              className="flex min-h-14 w-full flex-col items-start rounded-xl border border-white/10 bg-white/[0.03] p-3 text-start transition active:bg-white/[0.06]"
            >
              <span className="font-semibold text-slate-50" dir="ltr">
                {term.term}
              </span>
              <span className="mt-0.5 line-clamp-2 text-sm text-slate-400">
                {tr(term.definition)}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="text-center text-sm text-slate-500">
        <Link href="/learn" className="text-teal-200">
          ← {ui("learnHubTitle")}
        </Link>
      </p>
      {active ? (
        <TermSheet term={active} onClose={() => setActive(null)} />
      ) : null}
    </div>
  );
}
