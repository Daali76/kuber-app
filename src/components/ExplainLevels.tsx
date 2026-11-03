"use client";

import { useState } from "react";
import type { ToolLevels } from "@/lib/types";

const tabs = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
] as const;

export function ExplainLevels({ levels }: { levels: ToolLevels }) {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("beginner");

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03]">
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-between px-4 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="font-[family-name:var(--font-display)] text-base font-semibold text-slate-100">
          Explain
        </span>
        <span className="text-slate-400">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div className="border-t border-white/10 px-4 pb-4 pt-3">
          <div className="mb-3 flex gap-1 rounded-xl bg-black/30 p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`min-h-10 flex-1 rounded-lg px-2 text-xs font-semibold transition ${
                  tab === t.id
                    ? "bg-teal-400/20 text-teal-200"
                    : "text-slate-400"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-slate-300">{levels[tab]}</p>
        </div>
      ) : null}
    </section>
  );
}
