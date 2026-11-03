"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { Lab, Tool } from "@/lib/types";
import { CodeBlock } from "@/components/CodeBlock";
import { ClusterDiagram } from "@/components/cluster/ClusterDiagram";
import { RichText } from "@/components/RichText";
import { useI18n } from "@/lib/i18n";
import {
  getProgressSnapshot,
  parseProgress,
  subscribeProgress,
  toggleLabStep,
} from "@/lib/progress";

function LabStepCard({
  toolId,
  stepKey,
  title,
  command,
  expectedOutput,
  whatHappened,
  checked,
}: {
  toolId: string;
  stepKey: string;
  title: Lab["steps"][0]["title"];
  command: Lab["steps"][0]["command"];
  expectedOutput: string;
  whatHappened: Lab["steps"][0]["whatHappened"];
  checked: boolean;
}) {
  const { tr, ui } = useI18n();
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-3">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() =>
            toggleLabStep(stepKey, `/tools/${toolId}`, toolId)
          }
          className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${
            checked
              ? "border-teal-400/50 bg-teal-400/20 text-teal-200"
              : "border-white/10 bg-black/20 text-slate-400"
          }`}
          aria-pressed={checked}
        >
          {checked ? "✓" : ""}
        </button>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-50">{tr(title)}</h3>
        </div>
      </div>
      <CodeBlock example={command} />
      <div dir="ltr">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Expected
        </p>
        <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 font-mono text-[12px] text-slate-300 whitespace-pre-wrap">
          {expectedOutput}
        </pre>
      </div>
      <p className="text-sm text-slate-400">
        <span className="font-semibold text-slate-200">What happened: </span>
        <RichText text={whatHappened} />
      </p>
      <p className="sr-only">{ui("complete")}</p>
    </div>
  );
}

export function LabPanel({ tool }: { tool: Tool }) {
  const { ui, lang } = useI18n();
  const [showSolution, setShowSolution] = useState(false);
  const raw = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    () => '{"version":1,"roadmap":{},"lessons":{},"labSteps":{},"quizScores":{},"flashcards":{}}',
  );
  const progress = useMemo(() => parseProgress(raw), [raw]);
  const lab = tool.lab;

  const focusIds = lab.steps.flatMap((s) => s.diagramComponentIds ?? []);

  return (
    <div className="space-y-4">
      {lang === "fa" ? (
        <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
          {ui("translationPending")}
        </p>
      ) : null}

      <ClusterDiagram
        components={tool.diagram.components}
        connections={tool.diagram.connections}
        title="Lab focus"
        focusComponentIds={focusIds.length ? focusIds : null}
      />

      <LabStepCard
        toolId={tool.id}
        stepKey={`${tool.id}:${lab.kindSetup.id}`}
        title={lab.kindSetup.title}
        command={lab.kindSetup.command}
        expectedOutput={lab.kindSetup.expectedOutput}
        whatHappened={lab.kindSetup.whatHappened}
        checked={!!progress.labSteps[`${tool.id}:${lab.kindSetup.id}`]}
      />

      {lab.minikubeAlt ? (
        <LabStepCard
          toolId={tool.id}
          stepKey={`${tool.id}:${lab.minikubeAlt.id}`}
          title={lab.minikubeAlt.title}
          command={lab.minikubeAlt.command}
          expectedOutput={lab.minikubeAlt.expectedOutput}
          whatHappened={lab.minikubeAlt.whatHappened}
          checked={!!progress.labSteps[`${tool.id}:${lab.minikubeAlt.id}`]}
        />
      ) : null}

      {lab.steps.map((step) => (
        <LabStepCard
          key={step.id}
          toolId={tool.id}
          stepKey={`${tool.id}:${step.id}`}
          title={step.title}
          command={step.command}
          expectedOutput={step.expectedOutput}
          whatHappened={step.whatHappened}
          checked={!!progress.labSteps[`${tool.id}:${step.id}`]}
        />
      ))}

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
        <h3 className="font-semibold text-slate-50">Now try</h3>
        <p className="text-sm text-slate-300">
          <RichText text={lab.exercise.prompt} />
        </p>
        <button
          type="button"
          onClick={() => setShowSolution((s) => !s)}
          className="min-h-10 rounded-lg border border-white/10 px-3 text-sm text-teal-200"
        >
          {showSolution ? ui("hideSolution") : ui("showSolution")}
        </button>
        {showSolution ? <CodeBlock example={lab.exercise.solution} /> : null}
      </div>

      <LabStepCard
        toolId={tool.id}
        stepKey={`${tool.id}:${lab.cleanup.id}`}
        title={lab.cleanup.title}
        command={lab.cleanup.command}
        expectedOutput={lab.cleanup.expectedOutput}
        whatHappened={lab.cleanup.whatHappened}
        checked={!!progress.labSteps[`${tool.id}:${lab.cleanup.id}`]}
      />
    </div>
  );
}
