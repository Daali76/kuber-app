"use client";

import { useMemo, useState } from "react";
import type { Tool } from "@/lib/types";
import { ClusterDiagram } from "@/components/cluster/ClusterDiagram";
import { CodeBlock } from "@/components/CodeBlock";

export function ImplementGuide({
  tool,
  accent,
}: {
  tool: Tool;
  accent: string;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = tool.implement[stepIndex];

  const focusComponentIds = useMemo(() => {
    const ids = new Set<string>();
    for (let i = 0; i <= stepIndex; i++) {
      tool.implement[i]?.diagramComponentIds.forEach((id) => ids.add(id));
    }
    return [...ids];
  }, [tool, stepIndex]);

  const focusConnectionIds = useMemo(() => {
    const ids = new Set<string>();
    for (let i = 0; i <= stepIndex; i++) {
      tool.implement[i]?.diagramConnectionIds?.forEach((id) => ids.add(id));
    }
    return [...ids];
  }, [tool, stepIndex]);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="lg:sticky lg:top-20">
        <ClusterDiagram
          components={tool.diagram.components}
          connections={tool.diagram.connections}
          accent={accent}
          focusComponentIds={focusComponentIds}
          focusConnectionIds={focusConnectionIds}
          title={`Build-up · step ${stepIndex + 1}/${tool.implement.length}`}
        />
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
          {tool.implement.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStepIndex(i)}
              className={`min-h-11 shrink-0 rounded-xl border px-3 text-sm font-medium transition hover:border-white/25 ${
                i === stepIndex
                  ? "border-teal-400/40 bg-teal-400/15 text-teal-100"
                  : i < stepIndex
                    ? "border-white/15 bg-white/[0.05] text-slate-300"
                    : "border-white/10 bg-black/20 text-slate-400"
              }`}
            >
              {i + 1}. {s.title}
            </button>
          ))}
        </div>

        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-6">
          <div className="mb-2 flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-slate-950"
              style={{ background: accent }}
            >
              {stepIndex + 1}
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-slate-50 md:text-xl">
              {step.title}
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-400 md:text-[15px]">
            {step.description}
          </p>
          {step.code ? (
            <div className="mt-3">
              <CopyableCode example={step.code} />
            </div>
          ) : null}
          {step.expectedOutput ? (
            <div className="mt-3">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Expected output
              </p>
              <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-3 font-[family-name:var(--font-mono)] text-[12px] text-lime-200/90 md:text-[13px]">
                {step.expectedOutput}
              </pre>
            </div>
          ) : null}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((v) => Math.max(0, v - 1))}
              className="min-h-11 flex-1 rounded-xl border border-white/10 text-sm text-slate-300 transition hover:bg-white/[0.04] disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={stepIndex >= tool.implement.length - 1}
              onClick={() =>
                setStepIndex((v) => Math.min(tool.implement.length - 1, v + 1))
              }
              className="min-h-11 flex-1 rounded-xl text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-40"
              style={{ background: accent }}
            >
              Next
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}

function CopyableCode({
  example,
}: {
  example: NonNullable<Tool["implement"][number]["code"]>;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(example.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={copy}
        className="absolute right-2 top-2 z-10 min-h-9 rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs font-medium text-slate-200"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <CodeBlock
        example={{
          language: example.language === "text" ? "bash" : example.language,
          title: example.title,
          code: example.code,
        }}
      />
    </div>
  );
}
