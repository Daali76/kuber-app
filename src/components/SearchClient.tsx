"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { layers } from "@data/layers";
import { tools } from "@data/tools";
import { MaturityBadge } from "@/components/MaturityBadge";
import type { LayerId, Maturity } from "@/lib/types";

const maturities: Maturity[] = [
  "Graduated",
  "Incubating",
  "Sandbox",
  "External",
];

export function SearchClient() {
  const [query, setQuery] = useState("");
  const [layer, setLayer] = useState<LayerId | "all">("all");
  const [maturity, setMaturity] = useState<Maturity | "all">("all");

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

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="sr-only">Search tools</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools…"
          className="min-h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-base text-slate-100 outline-none ring-teal-400/0 placeholder:text-slate-500 focus:border-teal-400/40 focus:ring-2 focus:ring-teal-400/20"
          enterKeyHint="search"
          autoCapitalize="off"
          autoCorrect="off"
        />
      </label>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Layer
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterChip
            label="All"
            active={layer === "all"}
            onClick={() => setLayer("all")}
          />
          {layers.map((l) => (
            <FilterChip
              key={l.id}
              label={l.shortName}
              active={layer === l.id}
              onClick={() => setLayer(l.id)}
              accent={l.accent}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Maturity
        </p>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="All"
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
                    {tool.summary}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
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
