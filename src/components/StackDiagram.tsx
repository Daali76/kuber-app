import { getLayer } from "@data/layers";
import type { StackPick } from "@/lib/stack-builder";

export function StackDiagram({ stack }: { stack: StackPick[] }) {
  const visual = [...stack].reverse();
  return (
    <div className="space-y-2">
      {visual.map((pick, i) => {
        const layer = getLayer(pick.layer)!;
        return (
          <div
            key={pick.layer}
            className="layer-enter flex items-center gap-3 rounded-xl border border-white/10 px-3 py-3"
            style={{
              background: `linear-gradient(90deg, ${layer.accentSoft}, transparent)`,
              animationDelay: `${i * 40}ms`,
              borderColor: `${layer.accent}33`,
            }}
          >
            <div
              className="h-10 w-1.5 shrink-0 rounded-full"
              style={{ background: layer.accent }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {layer.shortName}
              </p>
              <p className="truncate font-[family-name:var(--font-display)] text-base font-semibold text-slate-50">
                {pick.tool.name}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
