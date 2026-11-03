"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { glossary } from "@data/glossary";
import { layers } from "@data/layers";
import { tools } from "@data/tools";
import { MaturityBadge } from "@/components/MaturityBadge";
import { TermSheet } from "@/components/TermSheet";
import { useI18n } from "@/lib/i18n";
import type { GlossaryTerm, LayerId, Maturity } from "@/lib/types";

const maturities: Maturity[] = [
  "Graduated",
  "Incubating",
  "Sandbox",
  "External",
];

export function SearchClient() {
  const { tr, ui } = useI18n();
  const [query, setQuery] = useState("");
  const [layer, setLayer] = useState<LayerId | "all">("all");
  const [maturity, setMaturity] = useState<Maturity | "all">("all");
  const [activeTerm, setActiveTerm] = useState<GlossaryTerm | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((t) => {
      if (layer !== "all" && t.layer !== layer) return false;
      if (maturity !== "all" && t.maturity !== maturity) return false;
      if (!q) return true;
      const hay = `${t.name} ${t.summary} ${t.problem} ${t.layer} ${t.maturity}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, layer, maturity]);

  const termResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return glossary.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.definition.en.toLowerCase().includes(q) ||
        t.definition.fa.includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="sr-only">{ui("searchTools")}</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={ui("searchTools")}
          className="min-h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-base text-slate-100 outline-none ring-teal-400/0 placeholder:text-slate-500 focus:border-teal-400/40 focus:ring-2 focus:ring-teal-400/20"
          enterKeyHint="search"
          autoCapitalize="off"
          autoCorrect="off"
        />
      </label>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {ui("layer")}
        </p>
        <div className="relative">
          <div className="flex gap-2 overflow-x-auto pb-1 pe-6 [scrollbar-width:thin]">
            <FilterChip
              label={ui("allLayers")}
              active={layer === "all"}
              onClick={() => setLayer("all")}
            />
            {layers.map((l) => (
              <FilterChip
                key={l.id}
                label={tr(l.shortName)}
                active={layer === l.id}
                onClick={() => setLayer(l.id)}
                accent={l.accent}
              />
            ))}
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 end-0 w-8 bg-gradient-to-l from-[#070b12] to-transparent"
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {ui("maturity")}
        </p>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label={ui("allLayers")}
            active={maturity === "all"}
            onClick={() => setMaturity("all")}
          />
          {maturities.map((m) => (
            <FilterChip
              key={m}
              label={m}
              active={maturity === m}
              onClick={() => setMaturity(m)}
            />
          ))}
        </div>
      </div>

      <p className="text-sm text-slate-400">
        {results.length} tool{results.length === 1 ? "" : "s"}
      </p>

      <ul className="space-y-2">
        {results.map((tool) => {
          const layerMeta = layers.find((l) => l.id === tool.layer)!;
          return (
            <li key={tool.id}>
              <Link
                href={`/tools/${tool.id}`}
                className="flex min-h-16 items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition active:bg-white/[0.06]"
              >
                <span
                  className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: layerMeta.accent }}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-[family-name:var(--font-display)] font-semibold text-slate-50">
                      {tool.name}
                    </span>
                    <MaturityBadge maturity={tool.maturity} />
                  </span>
                  <span className="mt-0.5 block text-sm text-slate-400">
                    {tr(tool.summary)}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {termResults.length > 0 ? (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {ui("searchGlossary")}
          </p>
          <ul className="space-y-2">
            {termResults.map((term) => (
              <li key={term.id}>
                <button
                  type="button"
                  onClick={() => setActiveTerm(term)}
                  className="flex min-h-14 w-full flex-col items-start rounded-xl border border-teal-400/20 bg-teal-400/[0.06] p-3 text-start"
                >
                  <span className="font-semibold text-teal-100" dir="ltr">
                    {term.term}
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-sm text-slate-400">
                    {tr(term.definition)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {activeTerm ? (
        <TermSheet term={activeTerm} onClose={() => setActiveTerm(null)} />
      ) : null}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  accent,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  accent?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 shrink-0 rounded-lg border px-3 text-sm font-medium ${
        active
          ? "border-teal-400/40 bg-teal-400/15 text-teal-100"
          : "border-white/10 bg-black/20 text-slate-300"
      }`}
      style={
        active && accent
          ? { borderColor: `${accent}66`, background: `${accent}22`, color: "#ecfeff" }
          : undefined
      }
    >
      {label}
    </button>
  );
}
