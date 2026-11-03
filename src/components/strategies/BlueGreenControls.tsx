"use client";

import { useI18n } from "@/lib/i18n";

export function BlueGreenControls({
  phase,
  onPhase,
}: {
  phase: "deploy" | "preview" | "promoted" | "aborted";
  onPhase: (p: "deploy" | "preview" | "promoted" | "aborted") => void;
}) {
  const { lang } = useI18n();
  const steps: { id: typeof phase; label: string }[] = [
    {
      id: "deploy",
      label: lang === "fa" ? "استقرار green" : "Deploy green",
    },
    {
      id: "preview",
      label: lang === "fa" ? "تست preview" : "Preview test",
    },
    {
      id: "promoted",
      label: lang === "fa" ? "promote فعال" : "Promote active",
    },
    {
      id: "aborted",
      label: lang === "fa" ? "abort / rollback" : "Abort / rollback",
    },
  ];

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[15px] font-semibold text-slate-100">
        {lang === "fa" ? "مسیر Blue-Green" : "Blue-Green path"}
      </p>
      <div className="flex flex-wrap gap-2">
        {steps.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onPhase(s.id)}
            className={`min-h-11 rounded-lg border px-3 text-[15px] ${
              phase === s.id
                ? s.id === "aborted"
                  ? "border-rose-400/50 bg-rose-400/20 text-rose-100"
                  : "border-teal-400/50 bg-teal-400/20 text-teal-100"
                : "border-white/10 text-slate-300"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-slate-500" dir="ltr">
        activeService ← {phase === "promoted" ? "green" : "blue"} · previewService
        ← {phase === "aborted" ? "(scaled down)" : "green"}
      </p>
    </div>
  );
}
