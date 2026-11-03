"use client";

import { useState } from "react";
import type { ToolLevels } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { RichText } from "@/components/RichText";

const tabIds = ["beginner", "intermediate", "advanced"] as const;

export function ExplainLevels({ levels }: { levels: ToolLevels }) {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<(typeof tabIds)[number]>("beginner");
  const { ui } = useI18n();

  const labels: Record<(typeof tabIds)[number], string> = {
    beginner: ui("beginner"),
    intermediate: ui("intermediate"),
    advanced: ui("advanced"),
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03]">
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-between px-4 text-start"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="heading-section text-base font-semibold text-slate-100">
          {ui("explain")}
        </span>
        <span className="text-slate-400">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div className="border-t border-white/10 px-4 pb-4 pt-3">
          <div className="mb-3 flex gap-1 rounded-xl bg-black/30 p-1">
            {tabIds.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`min-h-11 flex-1 rounded-lg px-2 text-[15px] font-semibold transition ${
                  tab === id
                    ? "bg-teal-400/20 text-teal-200"
                    : "text-slate-400"
                }`}
              >
                {labels[id]}
              </button>
            ))}
          </div>
          <p className="text-base leading-relaxed text-slate-300">
            <RichText text={levels[tab]} />
          </p>
        </div>
      ) : null}
    </section>
  );
}
