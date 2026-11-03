"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export function ArgoCdToggles() {
  const { lang } = useI18n();
  const [auto, setAuto] = useState(true);
  const [prune, setPrune] = useState(true);
  const [selfHeal, setSelfHeal] = useState(false);

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[15px] font-semibold text-slate-100">
        {lang === "fa"
          ? "syncPolicy نمونه (Application)"
          : "Example Application syncPolicy"}
      </p>
      <Toggle
        label="automated (auto-sync)"
        on={auto}
        onChange={setAuto}
      />
      <Toggle label="prune" on={prune} onChange={setPrune} />
      <Toggle label="selfHeal" on={selfHeal} onChange={setSelfHeal} />
      <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 font-mono text-[12px] text-lime-100/90" dir="ltr">
{`syncPolicy:
  ${auto ? `automated:
    prune: ${prune}
    selfHeal: ${selfHeal}` : "# automated: omitted (manual sync)"}`}
      </pre>
      <p className="text-sm text-slate-500">
        {lang === "fa"
          ? "نام فیلدها مطابق CRD رسمی Application در Argo CD است."
          : "Field names match the official Argo CD Application CRD."}
      </p>
    </div>
  );
}

function Toggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`flex min-h-11 w-full items-center justify-between rounded-lg border px-3 text-[15px] ${
        on
          ? "border-teal-400/40 bg-teal-400/15 text-teal-100"
          : "border-white/10 text-slate-400"
      }`}
    >
      <span dir="ltr">{label}</span>
      <span>{on ? "on" : "off"}</span>
    </button>
  );
}
