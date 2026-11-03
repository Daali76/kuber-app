"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { Lab, ToolDiagram } from "@/lib/types";
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
  id,
  hrefBase,
  stepKey,
  title,
  command,
  expectedOutput,
  whatHappened,
  checked,
}: {
  id: string;
  hrefBase: string;
  stepKey: string;
  title: Lab["steps"][0]["title"];
  command: Lab["steps"][0]["command"];
  expectedOutput: string;
  whatHappened: Lab["steps"][0]["whatHappened"];
  checked: boolean;
}) {
  const { tr, ui } = useI18n();
  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => toggleLabStep(stepKey, hrefBase, id)}
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
          {ui("expected")}
        </p>
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-black/40 p-3 font-mono text-[12px] text-slate-300">
          {expectedOutput}
        </pre>
      </div>
      <p className="text-base text-slate-400">
        <span className="font-semibold text-slate-200">{ui("whatHappened")} </span>
        <RichText text={whatHappened} />
      </p>
      <p className="sr-only">{ui("complete")}</p>
    </div>
  );
}

export function LabPanel({
  id,
  lab,
  diagram,
  hrefBase,
}: {
  id: string;
  lab: Lab;
  diagram: ToolDiagram;
  hrefBase: string;
}) {
  const { ui } = useI18n();
  const [showSolution, setShowSolution] = useState(false);
  const raw = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    () =>
      '{"version":1,"roadmap":{},"lessons":{},"labSteps":{},"quizScores":{},"flashcards":{}}',
  );
  const progress = useMemo(() => parseProgress(raw), [raw]);
  const focusIds = lab.steps.flatMap((s) => s.diagramComponentIds ?? []);

  return (
    <div className="space-y-4">
      <ClusterDiagram
        components={diagram.components}
        connections={diagram.connections}
        title={ui("labFocus")}
        focusComponentIds={focusIds.length ? focusIds : null}
      />

      <LabStepCard
        id={id}
        hrefBase={hrefBase}
        stepKey={`${id}:${lab.kindSetup.id}`}
        title={lab.kindSetup.title}
        command={lab.kindSetup.command}
        expectedOutput={lab.kindSetup.expectedOutput}
        whatHappened={lab.kindSetup.whatHappened}
        checked={!!progress.labSteps[`${id}:${lab.kindSetup.id}`]}
      />

      {lab.minikubeAlt ? (
        <LabStepCard
          id={id}
          hrefBase={hrefBase}
          stepKey={`${id}:${lab.minikubeAlt.id}`}
          title={lab.minikubeAlt.title}
          command={lab.minikubeAlt.command}
          expectedOutput={lab.minikubeAlt.expectedOutput}
          whatHappened={lab.minikubeAlt.whatHappened}
          checked={!!progress.labSteps[`${id}:${lab.minikubeAlt.id}`]}
        />
      ) : null}

      {lab.steps.map((step) => (
        <LabStepCard
          key={step.id}
          id={id}
          hrefBase={hrefBase}
          stepKey={`${id}:${step.id}`}
          title={step.title}
          command={step.command}
          expectedOutput={step.expectedOutput}
          whatHappened={step.whatHappened}
          checked={!!progress.labSteps[`${id}:${step.id}`]}
        />
      ))}

      <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <h3 className="font-semibold text-slate-50">{ui("nowTry")}</h3>
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
        id={id}
        hrefBase={hrefBase}
        stepKey={`${id}:${lab.cleanup.id}`}
        title={lab.cleanup.title}
        command={lab.cleanup.command}
        expectedOutput={lab.cleanup.expectedOutput}
        whatHappened={lab.cleanup.whatHappened}
        checked={!!progress.labSteps[`${id}:${lab.cleanup.id}`]}
      />
    </div>
  );
}
