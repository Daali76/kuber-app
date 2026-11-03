"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type {
  DiagramComponent,
  DiagramConnection,
} from "@/lib/types";
import { ComponentInfoCard } from "@/components/cluster/ComponentInfoCard";
import {
  VIEW,
  curvePath,
  placeComponents,
  zoneBox,
} from "@/components/cluster/layout";

const ZONES = [
  "external",
  "control-plane",
  "worker-node",
  "namespace",
  "pod",
] as const;

export function ClusterDiagram({
  components,
  connections,
  accent = "#2dd4bf",
  focusComponentIds,
  focusConnectionIds,
  title,
  navigateOnSelect,
}: {
  components: DiagramComponent[];
  connections: DiagramConnection[];
  accent?: string;
  /** When set, only these (+ always dim others) are emphasized */
  focusComponentIds?: string[] | null;
  focusConnectionIds?: string[] | null;
  title?: string;
  /** Map component id → href for navigation (home overview pins) */
  navigateOnSelect?: Record<string, string>;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const positions = useMemo(() => placeComponents(components), [components]);
  const selected = components.find((c) => c.id === selectedId) ?? null;

  const focusComps = focusComponentIds ? new Set(focusComponentIds) : null;
  const focusConns = focusConnectionIds ? new Set(focusConnectionIds) : null;

  function isCompActive(c: DiagramComponent) {
    if (focusComps) return focusComps.has(c.id);
    return c.highlight;
  }

  function isConnActive(c: DiagramConnection) {
    if (focusConns) return focusConns.has(c.id);
    return c.highlight;
  }

  return (
    <div className="relative">
      {title ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {title}
        </p>
      ) : null}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#070d16]">
        <svg
          viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
          className="h-auto w-full"
          role="img"
          aria-label="Kubernetes cluster placement diagram"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
            </marker>
            <marker
              id="arrow-hot"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={accent} />
            </marker>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {ZONES.map((z) => {
            const box = zoneBox(z);
            return (
              <g key={z}>
                <rect
                  x={box.x}
                  y={box.y}
                  width={box.w}
                  height={box.h}
                  rx={14}
                  fill="rgba(255,255,255,0.03)"
                  stroke="rgba(148,163,184,0.22)"
                  strokeWidth={1}
                />
                <text
                  x={box.x + 12}
                  y={box.y + 16}
                  fill="#64748b"
                  fontSize={10}
                  fontFamily="var(--font-body), sans-serif"
                  fontWeight={600}
                  letterSpacing="0.12em"
                >
                  {box.label.toUpperCase()}
                </text>
              </g>
            );
          })}

          {connections.map((conn) => {
            const a = positions[conn.from];
            const b = positions[conn.to];
            if (!a || !b) return null;
            const active = isConnActive(conn);
            const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 6 };
            return (
              <g key={conn.id} opacity={active ? 1 : 0.22}>
                <path
                  d={curvePath(a, b)}
                  fill="none"
                  stroke={active ? accent : "#64748b"}
                  strokeWidth={active ? 2 : 1.2}
                  markerEnd={active ? "url(#arrow-hot)" : "url(#arrow)"}
                  className={active ? "flow-dash" : undefined}
                  strokeDasharray={active ? "6 8" : undefined}
                />
                {active ? (
                  <g>
                    <rect
                      x={mid.x - conn.label.length * 2.6}
                      y={mid.y - 9}
                      width={Math.max(36, conn.label.length * 5.2)}
                      height={14}
                      rx={4}
                      fill="#0b1220"
                      stroke={`${accent}55`}
                    />
                    <text
                      x={mid.x}
                      y={mid.y + 1}
                      textAnchor="middle"
                      fill={accent}
                      fontSize={8}
                      fontFamily="var(--font-mono), monospace"
                    >
                      {conn.label}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}

          {components.map((c) => {
            const p = positions[c.id];
            if (!p) return null;
            const active = isCompActive(c);
            const selected = selectedId === c.id;
            const w = 96;
            const h = 28;
            return (
              <g
                key={c.id}
                transform={`translate(${p.x - w / 2}, ${p.y - h / 2})`}
                opacity={active || selected ? 1 : 0.35}
                filter={active ? "url(#glow)" : undefined}
                className="cursor-pointer"
                onClick={() => {
                  const href = navigateOnSelect?.[c.id];
                  if (href) {
                    router.push(href);
                    return;
                  }
                  setSelectedId(c.id);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    const href = navigateOnSelect?.[c.id];
                    if (href) router.push(href);
                    else setSelectedId(c.id);
                  }
                }}
              >
                <rect
                  width={w}
                  height={h}
                  rx={8}
                  fill={active ? `${accent}22` : "rgba(15,23,42,0.9)"}
                  stroke={selected ? accent : active ? `${accent}99` : "#334155"}
                  strokeWidth={selected ? 2 : 1.2}
                />
                <circle
                  cx={10}
                  cy={h / 2}
                  r={3}
                  fill={active ? accent : "#64748b"}
                />
                <text
                  x={18}
                  y={h / 2 + 3.5}
                  fill="#e2e8f0"
                  fontSize={9}
                  fontFamily="var(--font-body), sans-serif"
                  fontWeight={600}
                >
                  {c.label.length > 14 ? `${c.label.slice(0, 13)}…` : c.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-500">
        Tap a highlighted box for object type & why it runs there
      </p>
      {selected ? (
        <ComponentInfoCard
          component={selected}
          accent={accent}
          onClose={() => setSelectedId(null)}
        />
      ) : null}
    </div>
  );
}
