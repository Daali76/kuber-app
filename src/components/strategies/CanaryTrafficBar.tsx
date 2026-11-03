"use client";

import { useI18n } from "@/lib/i18n";

const STEPS = [0, 20, 50, 100] as const;

export function CanaryTrafficBar({
  weight,
  failed,
  onWeight,
  onFail,
  onReset,
}: {
  weight: number;
  failed: boolean;
  onWeight: (w: number) => void;
  onFail: () => void;
  onReset: () => void;
}) {
  const { lang } = useI18n();
  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[15px] font-semibold text-slate-100">
        {lang === "fa"
          ? "تقسیم ترافیک canary (setWeight)"
          : "Canary traffic split (setWeight)"}
      </p>
      <div className="flex h-4 overflow-hidden rounded-full bg-black/40" dir="ltr">
        <div
          className="bg-teal-400/80 transition-all"
          style={{ width: `${failed ? 0 : weight}%` }}
          title="canary"
        />
        <div
          className="bg-sky-500/50 transition-all"
          style={{ width: `${failed ? 100 : 100 - weight}%` }}
          title="stable"
        />
      </div>
      <p className="font-mono text-sm text-slate-300" dir="ltr">
        canary {failed ? 0 : weight}% · stable {failed ? 100 : 100 - weight}%
        {failed ? " · aborted" : ""}
      </p>
      <div className="flex flex-wrap gap-2">
        {STEPS.map((w) => (
          <button
            key={w}
            type="button"
            disabled={failed && w !== 0}
            onClick={() => onWeight(w)}
            className={`min-h-11 rounded-lg border px-3 text-[15px] ${
              weight === w && !failed
                ? "border-teal-400/50 bg-teal-400/20 text-teal-100"
                : "border-white/10 text-slate-300"
            }`}
          >
            {w}%
          </button>
        ))}
        <button
          type="button"
          onClick={onFail}
          className="min-h-11 rounded-lg border border-rose-400/40 bg-rose-400/10 px-3 text-[15px] text-rose-100"
        >
          {lang === "fa" ? "شکست analysis" : "Fail analysis"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="min-h-11 rounded-lg border border-white/10 px-3 text-[15px] text-slate-300"
        >
          {lang === "fa" ? "بازنشانی" : "Reset"}
        </button>
      </div>
    </div>
  );
}
