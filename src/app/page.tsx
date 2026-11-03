import { AppShell } from "@/components/AppShell";
import { LayerCard } from "@/components/LayerCard";
import { layersTopToBottom } from "@data/layers";
import { getToolsByLayer, toolCount } from "@data/tools";

export default function HomePage() {
  return (
    <AppShell
      title="Architecture map"
      subtitle={`${toolCount} tools across eight layers — tap a chip to open details.`}
    >
      <div className="mb-5">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] p-5">
          <div className="brand-orb pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-teal-400/20 blur-2xl" />
          <p className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-slate-50 sm:text-4xl">
            Cloud Native Atlas
          </p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
            A vertical stack from infrastructure up to security — built for
            thumbs, learning paths, and picking a practical toolset.
          </p>
          <div className="hero-rule mt-4 rounded-full" />
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
        <span>Top of stack</span>
        <span>Scroll ↓ toward infra</span>
      </div>

      <div className="space-y-3">
        {layersTopToBottom.map((layer, index) => (
          <LayerCard
            key={layer.id}
            layer={layer}
            tools={getToolsByLayer(layer.id)}
            index={index}
          />
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-slate-500">
        Infrastructure at the bottom · Security at the top
      </p>
    </AppShell>
  );
}
