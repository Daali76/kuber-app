"use client";

import { useState } from "react";
import type { KustomizeDiffOverlay } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export function KustomizeDiffView({
  overlays,
}: {
  overlays: KustomizeDiffOverlay[];
}) {
  const { tr, lang } = useI18n();
  const [active, setActive] = useState(overlays[0]?.id ?? "");
  const current = overlays.find((o) => o.id === active) ?? overlays[0];
  if (!current) return null;

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[15px] font-semibold text-slate-100">
        {lang === "fa"
          ? "پچ overlay روی base (پیش‌نمایش)"
          : "Overlay patch on base (preview)"}
      </p>
      <div className="flex flex-wrap gap-2">
        {overlays.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setActive(o.id)}
            className={`min-h-11 rounded-lg border px-3 text-[15px] ${
              current.id === o.id
                ? "border-teal-400/50 bg-teal-400/20 text-teal-100"
                : "border-white/10 text-slate-300"
            }`}
          >
            {tr(o.title)}
          </button>
        ))}
      </div>
      {current.note ? (
        <p className="text-sm text-slate-400">{tr(current.note)}</p>
      ) : null}
      <div className="grid gap-3 lg:grid-cols-2" dir="ltr">
        <YamlPane title="base" code={current.baseYaml} />
        <YamlPane title="rendered (overlay)" code={current.renderedYaml} />
      </div>
    </div>
  );
}

function YamlPane({ title, code }: { title: string; code: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <pre className="max-h-72 overflow-auto rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-[12px] text-lime-100/90 whitespace-pre">
        {code}
      </pre>
    </div>
  );
}
