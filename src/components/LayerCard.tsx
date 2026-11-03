"use client";

import { ToolChip } from "@/components/ToolChip";
import type { LayerMeta, Tool } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export function LayerCard({
  layer,
  tools,
  index,
}: {
  layer: LayerMeta;
  tools: Tool[];
  index: number;
}) {
  const { tr } = useI18n();
  return (
    <section
      className="layer-enter rounded-2xl border border-white/10 p-4"
      style={{
        background: `linear-gradient(145deg, ${layer.accentSoft}, rgba(8,12,20,0.9))`,
        animationDelay: `${index * 45}ms`,
        boxShadow: `0 0 0 1px ${layer.accent}18, 0 12px 40px rgba(0,0,0,0.25)`,
      }}
    >
      <div className="mb-3 flex items-start gap-3">
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-slate-950"
          style={{ background: layer.accent }}
        >
          {layer.order}
        </div>
        <div className="min-w-0">
          <h2 className="heading-section text-lg font-semibold tracking-tight text-slate-50">
            {tr(layer.name)}
          </h2>
          <p className="mt-0.5 text-base text-slate-400">
            {tr(layer.description)}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {tools.map((tool) => (
          <ToolChip key={tool.id} tool={tool} accent={layer.accent} />
        ))}
      </div>
    </section>
  );
}
