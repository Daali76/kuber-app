"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type {
  DiagramComponent,
  DiagramConnection,
  DiagramFlow,
} from "@/lib/types";
import { ComponentInfoCard } from "@/components/cluster/ComponentInfoCard";
import {
  COMP_HIT,
  ZONE_LABEL,
  computeDiagramLayout,
  connectionLabelLayout,
  orthogonalPath,
  wrapLabel,
} from "@/components/cluster/layout";
import { useI18n } from "@/lib/i18n";

const ZONES = [
  "external",
  "control-plane",
  "worker-node",
  "namespace",
  "pod",
] as const;

const ZONE_LABEL_FA: Record<(typeof ZONES)[number], string> = {
  external: "External (بیرون کلاستر)",
  "control-plane": "Control plane",
  "worker-node": "Worker node",
  namespace: "Namespace / Service",
  pod: "Pod",
};

export function ClusterDiagram({
  components,
  connections,
  accent = "#2dd4bf",
  focusComponentIds,
  focusConnectionIds,
  title,
  navigateOnSelect,
  flows,
  beforeAfter,
  selectedId: controlledSelected,
  onSelect,
  infoVariant = "auto",
}: {
  components: DiagramComponent[];
  connections: DiagramConnection[];
  accent?: string;
  focusComponentIds?: string[] | null;
  focusConnectionIds?: string[] | null;
  title?: string;
  navigateOnSelect?: Record<string, string>;
  flows?: DiagramFlow[];
  beforeAfter?: {
    beforeComponentIds: string[];
    afterComponentIds: string[];
  };
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  /** auto: sheet on small, none when onSelect provided on xl parent */
  infoVariant?: "auto" | "sheet" | "none";
}) {
  const router = useRouter();
  const { tr, ui, lang } = useI18n();
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const selectedId =
    controlledSelected !== undefined ? controlledSelected : internalSelected;
  const setSelectedId = (id: string | null) => {
    onSelect?.(id);
    if (controlledSelected === undefined) setInternalSelected(id);
  };

  const [mode, setMode] = useState<"after" | "before">("after");
  const [playing, setPlaying] = useState(false);
  const [flowIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const fontSize = isDesktop ? 14 : 12;
  const layout = useMemo(
    () => computeDiagramLayout(components, fontSize),
    [components, fontSize],
  );
  const { positions, zones, view, boxes } = layout;
  const edgeLabels = useMemo(
    () => connectionLabelLayout(connections, positions, boxes, fontSize - 1),
    [connections, positions, boxes, fontSize],
  );

  const selected = components.find((c) => c.id === selectedId) ?? null;
  const activeFlow = flows?.[flowIndex];
  const playStep = playing && activeFlow ? activeFlow.steps[stepIndex] : null;

  const focusComps = useMemo(() => {
    if (playStep?.componentIds?.length) return new Set(playStep.componentIds);
    if (beforeAfter) {
      const ids =
        mode === "before"
          ? beforeAfter.beforeComponentIds
          : beforeAfter.afterComponentIds;
      return new Set(ids);
    }
    if (focusComponentIds) return new Set(focusComponentIds);
    return null;
  }, [playStep, beforeAfter, mode, focusComponentIds]);

  const focusConns = useMemo(() => {
    if (playStep?.connectionIds?.length) return new Set(playStep.connectionIds);
    if (focusConnectionIds) return new Set(focusConnectionIds);
    return null;
  }, [playStep, focusConnectionIds]);

  function isCompActive(c: DiagramComponent) {
    if (focusComps) return focusComps.has(c.id);
    return c.highlight;
  }

  function isConnActive(c: DiagramConnection) {
    if (focusConns) return focusConns.has(c.id);
    return c.highlight;
  }

  useEffect(() => {
    if (!selectedId || isDesktop) return;
    const el = document.getElementById(`diagram-comp-${selectedId}`);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const sheetReserve = window.innerHeight * 0.4 + 72;
    const visibleBottom = window.innerHeight - sheetReserve;
    const visibleTop = 72;
    if (rect.bottom > visibleBottom || rect.top < visibleTop) {
      const mid = (visibleTop + visibleBottom) / 2;
      const delta = rect.top + rect.height / 2 - mid;
      window.scrollBy({ top: delta, behavior: "smooth" });
    }
  }, [selectedId, isDesktop]);

  const showSheet =
    selected &&
    infoVariant !== "none" &&
    (infoVariant === "sheet" || (infoVariant === "auto" && !isDesktop));

  return (
    <div className="relative" data-testid="cluster-diagram">
      {title ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {title}
        </p>
      ) : null}

      {(flows?.length || beforeAfter) && (
        <div className="mb-3 flex flex-wrap gap-2">
          {beforeAfter ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setMode("before");
                  setPlaying(false);
                }}
                className={`min-h-11 rounded-lg border px-3 text-[15px] font-medium ${
                  mode === "before" && !playing
                    ? "border-sky-400/40 bg-sky-400/15 text-sky-100"
                    : "border-white/10 text-slate-300"
                }`}
              >
                {ui("before")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("after");
                  setPlaying(false);
                }}
                className={`min-h-11 rounded-lg border px-3 text-[15px] font-medium ${
                  mode === "after" && !playing
                    ? "border-sky-400/40 bg-sky-400/15 text-sky-100"
                    : "border-white/10 text-slate-300"
                }`}
              >
                {ui("after")}
              </button>
            </>
          ) : null}
          {flows?.length ? (
            <button
              type="button"
              onClick={() => {
                setPlaying((p) => !p);
                setStepIndex(0);
              }}
              className={`min-h-11 rounded-lg border px-3 text-[15px] font-medium ${
                playing
                  ? "border-teal-400/40 bg-teal-400/15 text-teal-100"
                  : "border-white/10 text-slate-300"
              }`}
            >
              {playing ? ui("stop") : ui("playFlow")}
            </button>
          ) : null}
        </div>
      )}

      {playing && activeFlow ? (
        <div className="mb-3 rounded-xl border border-teal-400/30 bg-teal-400/10 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-200">
            {tr(activeFlow.title)} · {stepIndex + 1}/{activeFlow.steps.length}
          </p>
          <p className="mt-1 text-base text-slate-200">
            {tr(activeFlow.steps[stepIndex]!.caption)}
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              className="min-h-11 rounded-lg border border-white/10 px-3 text-[15px] text-slate-200"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            >
              {ui("prev")}
            </button>
            <button
              type="button"
              className="min-h-11 rounded-lg border border-white/10 px-3 text-[15px] text-slate-200"
              disabled={stepIndex >= activeFlow.steps.length - 1}
              onClick={() =>
                setStepIndex((i) =>
                  Math.min(activeFlow.steps.length - 1, i + 1),
                )
              }
            >
              {ui("next")}
            </button>
          </div>
        </div>
      ) : null}

      {/* Geometry always LTR — prevents FA bidi clipping */}
      <div dir="ltr" className="diagram-frame overflow-hidden rounded-2xl border border-white/10 bg-[#070d16]">
        <svg
          viewBox={`0 0 ${view.w} ${view.h}`}
          className="h-auto w-full"
          role="img"
          aria-label="Kubernetes cluster placement diagram"
          data-testid="cluster-diagram-svg"
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
            const box = zones[z];
            const label =
              lang === "fa" ? ZONE_LABEL_FA[z] : ZONE_LABEL[z];
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
                  x={box.x + 14}
                  y={box.y + 20}
                  fill="#64748b"
                  fontSize={fontSize}
                  fontFamily="var(--font-body), sans-serif"
                  fontWeight={600}
                  letterSpacing="0.08em"
                >
                  {label.toUpperCase()}
                </text>
              </g>
            );
          })}

          {connections.map((conn) => {
            const a = positions[conn.from];
            const b = positions[conn.to];
            if (!a || !b) return null;
            const active = isConnActive(conn);
            const pill = edgeLabels[conn.id];
            return (
              <g key={conn.id} opacity={active ? 1 : 0.22}>
                <path
                  d={orthogonalPath(a, b)}
                  fill="none"
                  stroke={active ? accent : "#64748b"}
                  strokeWidth={active ? 2 : 1.2}
                  markerEnd={active ? "url(#arrow-hot)" : "url(#arrow)"}
                  className={active ? "flow-dash" : undefined}
                  strokeDasharray={active ? "6 8" : undefined}
                  data-testid={`edge-${conn.id}`}
                />
                {active && pill ? (
                  <g data-testid={`edge-label-${conn.id}`}>
                    <rect
                      x={pill.x}
                      y={pill.y}
                      width={pill.w}
                      height={pill.h}
                      rx={4}
                      fill="#0b1220"
                      stroke={`${accent}55`}
                    />
                    <text
                      x={pill.x + pill.w / 2}
                      y={pill.y + pill.h / 2 + 4}
                      textAnchor="middle"
                      fill={accent}
                      fontSize={fontSize - 1}
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
            const box = boxes[c.id];
            const p = positions[c.id];
            if (!box || !p) return null;
            const active = isCompActive(c);
            const isSelected = selectedId === c.id;
            const lines = wrapLabel(c.label, isDesktop ? 18 : 14);
            const hitPadX = Math.max(0, (COMP_HIT - box.w) / 2);
            const hitPadY = Math.max(0, (COMP_HIT - box.h) / 2);
            return (
              <g
                key={c.id}
                id={`diagram-comp-${c.id}`}
                transform={`translate(${box.x}, ${box.y})`}
                opacity={active || isSelected ? 1 : 0.35}
                filter={active ? "url(#glow)" : undefined}
                className="cursor-pointer"
                data-testid={`diagram-comp-${c.id}`}
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
                    e.preventDefault();
                    const href = navigateOnSelect?.[c.id];
                    if (href) router.push(href);
                    else setSelectedId(c.id);
                  }
                }}
              >
                <title>{c.label}</title>
                <rect
                  x={-hitPadX}
                  y={-hitPadY}
                  width={box.w + hitPadX * 2}
                  height={box.h + hitPadY * 2}
                  fill="transparent"
                />
                <rect
                  width={box.w}
                  height={box.h}
                  rx={8}
                  fill={active ? `${accent}22` : "rgba(15,23,42,0.9)"}
                  stroke={
                    isSelected ? accent : active ? `${accent}99` : "#334155"
                  }
                  strokeWidth={isSelected ? 2 : 1.2}
                />
                <circle
                  cx={12}
                  cy={box.h / 2}
                  r={3.5}
                  fill={active ? accent : "#64748b"}
                />
                <text
                  x={22}
                  y={
                    lines.length > 1
                      ? box.h / 2 - ((lines.length - 1) * (fontSize + 2)) / 2
                      : box.h / 2 + fontSize / 3
                  }
                  fill="#e2e8f0"
                  fontSize={fontSize}
                  fontFamily="var(--font-body), sans-serif"
                  fontWeight={600}
                >
                  {lines.map((line, i) => (
                    <tspan key={i} x={22} dy={i === 0 ? 0 : fontSize + 2}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {showSheet ? (
        <ComponentInfoCard
          component={selected!}
          accent={accent}
          onClose={() => setSelectedId(null)}
          variant="sheet"
        />
      ) : null}
    </div>
  );
}
