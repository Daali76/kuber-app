"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getTool } from "@data/tools";
import type { LandscapeCatalogItem, LandscapeProject } from "@data/landscape/types";
import { LandscapeMaturityBadge } from "@/components/LandscapeMaturityBadge";
import { useI18n } from "@/lib/i18n";

const WINDOW = 60;
const MATURITIES: (LandscapeProject | "all")[] = [
  "all",
  "graduated",
  "incubating",
  "sandbox",
  "archived",
];

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium transition ${
        active
          ? "bg-teal-400/20 text-teal-200 ring-1 ring-teal-400/30"
          : "bg-white/[0.04] text-slate-400 ring-1 ring-white/10 hover:text-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

export function CatalogClient({ items }: { items: LandscapeCatalogItem[] }) {
  const { ui } = useI18n();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [subcategory, setSubcategory] = useState<string>("all");
  const [maturity, setMaturity] = useState<LandscapeProject | "all">("all");
  const [visible, setVisible] = useState(WINDOW);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [items]);

  const subcategories = useMemo(() => {
    const scoped =
      category === "all"
        ? items
        : items.filter((i) => i.category === category);
    const set = new Set(scoped.map((i) => i.subcategory));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [items, category]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (subcategory !== "all" && item.subcategory !== subcategory) return false;
      if (maturity !== "all") {
        if (maturity === "archived" && item.project !== "archived") return false;
        if (maturity !== "archived" && item.project !== maturity) return false;
      }
      if (!q) return true;
      const hay = [
        item.name,
        item.description,
        item.category,
        item.subcategory,
        item.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, category, subcategory, maturity]);

  const windowed = filtered.slice(0, visible);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="sr-only">{ui("searchTools")}</span>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(WINDOW);
          }}
          placeholder={ui("searchTools")}
          className="min-h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-base text-slate-100 outline-none placeholder:text-slate-500 focus:border-teal-400/40 focus:ring-2 focus:ring-teal-400/20"
          enterKeyHint="search"
          autoCapitalize="off"
          autoCorrect="off"
        />
      </label>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Category
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          <FilterChip
            label="All"
            active={category === "all"}
            onClick={() => {
              setCategory("all");
              setSubcategory("all");
              setVisible(WINDOW);
            }}
          />
          {categories.map((c) => (
            <FilterChip
              key={c}
              label={c}
              active={category === c}
              onClick={() => {
                setCategory(c);
                setSubcategory("all");
                setVisible(WINDOW);
              }}
            />
          ))}
        </div>
      </div>

      {category !== "all" ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Subcategory
          </p>
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label="All"
              active={subcategory === "all"}
              onClick={() => {
                setSubcategory("all");
                setVisible(WINDOW);
              }}
            />
            {subcategories.map((s) => (
              <FilterChip
                key={s}
                label={s}
                active={subcategory === s}
                onClick={() => {
                  setSubcategory(s);
                  setVisible(WINDOW);
                }}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {ui("maturity")}
        </p>
        <div className="flex flex-wrap gap-2">
          {MATURITIES.map((m) => (
            <FilterChip
              key={m}
              label={m === "all" ? "All" : m.charAt(0).toUpperCase() + m.slice(1)}
              active={maturity === m}
              onClick={() => {
                setMaturity(m);
                setVisible(WINDOW);
              }}
            />
          ))}
        </div>
      </div>

      <p className="text-sm text-slate-500">
        {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
      </p>

      <ul className="space-y-2">
        {windowed.map((item) => {
          const deep = getTool(item.id);
          return (
            <li key={item.id}>
              <Link
                href={`/catalog/${item.id}`}
                className="flex min-h-14 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 transition hover:border-teal-400/30 hover:bg-teal-400/5"
              >
                {item.logo ? (
                  <Image
                    src={`/logos/${item.logo}`}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-lg bg-white/5 object-contain p-1"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs text-slate-500">
                    ?
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-100">
                    {item.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {item.subcategory}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {item.project ? (
                    <LandscapeMaturityBadge project={item.project} />
                  ) : null}
                  {deep ? (
                    <span className="text-[10px] font-medium text-teal-400/90">
                      {ui("deepGuide")}
                    </span>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {visible < filtered.length ? (
        <button
          type="button"
          onClick={() => setVisible((v) => v + WINDOW)}
          className="min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] text-sm font-medium text-slate-200 hover:bg-white/[0.07]"
        >
          Load more ({filtered.length - visible} remaining)
        </button>
      ) : null}
    </div>
  );
}
