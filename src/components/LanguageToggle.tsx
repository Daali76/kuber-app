"use client";

import { useI18n } from "@/lib/i18n";

export function LanguageToggle({ compact }: { compact?: boolean }) {
  const { lang, setLang, ui } = useI18n();
  return (
    <div
      className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-black/30 p-1"
      role="group"
      aria-label={ui("language")}
    >
      {(["en", "fa"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          className={`min-h-9 rounded-lg px-2.5 text-xs font-semibold uppercase tracking-wide transition ${
            lang === code
              ? "bg-teal-400/20 text-teal-100"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {compact ? code : code === "en" ? "EN" : "FA"}
        </button>
      ))}
    </div>
  );
}
