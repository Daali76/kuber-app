"use client";

import { resolveLandscapeLayer } from "@data/landscape/category-map";
import { layersBottomToTop } from "@data/layers";
import { useI18n } from "@/lib/i18n";

export function CatalogPlacementHint({
  category,
  subcategory,
}: {
  category: string;
  subcategory: string;
}) {
  const { ui, tr } = useI18n();
  const layerId = resolveLandscapeLayer(category, subcategory);

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {ui("typicalPlacement")}
      </p>
      <p className="text-sm text-slate-400">
        {subcategory} · {category}
      </p>
      <div className="space-y-1.5 pt-1">
        {layersBottomToTop.map((layer) => {
          const active = layer.id === layerId;
          return (
            <div
              key={layer.id}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                active
                  ? "border-teal-400/40 bg-teal-400/10 text-teal-100"
                  : "border-white/5 bg-white/[0.02] text-slate-500"
              }`}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: active ? layer.accent : "transparent" }}
                aria-hidden
              />
              <span className="font-medium">{tr(layer.shortName)}</span>
              {active ? (
                <span className="ms-auto text-[11px] text-teal-300/90">
                  ← {ui("typicalPlacement")}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
