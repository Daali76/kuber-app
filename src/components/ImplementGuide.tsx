"use client";

import { useMemo, useState } from "react";
import type { ImplementStep, ToolDiagram } from "@/lib/types";
import { ClusterDiagram } from "@/components/cluster/ClusterDiagram";
import { CodeBlock } from "@/components/CodeBlock";
import { RichText } from "@/components/RichText";
import { useI18n } from "@/lib/i18n";

export function ImplementGuide({
  implement,
  diagram,
  accent,
}: {
  implement: ImplementStep[];
  diagram: ToolDiagram;
  accent: string;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = implement[stepIndex]!;
  const { ui, tr } = useI18n();

  const focusComponentIds = useMemo(() => {
    const ids = new Set<string>();
    for (let i = 0; i <= stepIndex; i++) {
      implement[i]?.diagramComponentIds.forEach((id) => ids.add(id));
    }
    return [...ids];
  }, [implement, stepIndex]);

  const focusConnectionIds = useMemo(() => {
    const ids = new Set<string>();
    for (let i = 0; i <= stepIndex; i++) {
      implement[i]?.diagramConnectionIds?.forEach((id) => ids.add(id));
    }
    return [...ids];
  }, [implement, stepIndex]);

  return (
    <div className="space-y-4">
      <div className="xl:hidden">
        <ClusterDiagram
          components={diagram.components}
          connections={diagram.connections}
          accent={accent}
          focusComponentIds={focusComponentIds}
          focusConnectionIds={focusConnectionIds}
          title={`${ui("buildUp")} · ${ui("stepOf")} ${stepIndex + 1}/${implement.length}`}
        />
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
          {implement.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStepIndex(i)}
              className={`min-h-11 shrink-0 rounded-xl border px-3 text-[15px] font-medium transition hover:border-white/25 ${
                i === stepIndex
                  ? "border-teal-400/40 bg-teal-400/15 text-teal-100"
                  : i < stepIndex
                    ? "border-white/15 bg-white/[0.05] text-slate-300"
                    : "border-white/10 bg-black/20 text-slate-400"
              }`}
            >
              {i + 1}. {tr(s.title)}
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
            <h2 className="heading-section text-lg font-semibold text-slate-50 md:text-xl">
              {tr(step.title)}
            </h2>
          </div>
          <p className="text-base leading-relaxed text-slate-400">
            <RichText text={step.description} />
          </p>
          {step.code ? (
            <div className="mt-3" dir="ltr">
              <CopyableCode example={step.code} />
            </div>
          ) : null}
          {step.expectedOutput ? (
            <div className="mt-3" dir="ltr">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {ui("expected")}
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
              className="min-h-11 flex-1 rounded-xl border border-white/10 text-[15px] text-slate-300 transition hover:bg-white/[0.04] disabled:opacity-40"
            >
              {ui("prev")}
            </button>
            <button
              type="button"
              disabled={stepIndex >= implement.length - 1}
              onClick={() =>
                setStepIndex((v) => Math.min(implement.length - 1, v + 1))
              }
              className="min-h-11 flex-1 rounded-xl text-[15px] font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-40"
              style={{ background: accent }}
            >
              {ui("next")}
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
  example: NonNullable<ImplementStep["code"]>;
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
