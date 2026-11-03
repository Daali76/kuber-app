"use client";

import { useState } from "react";
import type { TroubleshootingScenario } from "@/lib/types";
import { CodeBlock } from "@/components/CodeBlock";
import { RichText } from "@/components/RichText";
import { useI18n } from "@/lib/i18n";

export function TroubleshootPanel({
  scenarios,
}: {
  scenarios: TroubleshootingScenario[];
}) {
  const { tr, ui } = useI18n();
  const [picked, setPicked] = useState<Record<string, number>>({});

  return (
    <div className="space-y-4">
      {scenarios.map((sc) => {
        const choice = picked[sc.id];
        const revealed = choice !== undefined;
        return (
          <div
            key={sc.id}
            className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
          >
            <h3 className="font-semibold text-slate-50">
              <RichText text={sc.symptom} />
            </h3>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {ui("whatFirst")}
            </p>
            <div className="space-y-2">
              {sc.choices.map((c, i) => {
                let tone = "border-white/10 bg-black/20";
                if (revealed) {
                  if (c.correct) tone = "border-teal-400/50 bg-teal-400/15";
                  else if (choice === i)
                    tone = "border-rose-400/40 bg-rose-400/10";
                } else if (choice === i) {
                  tone = "border-sky-400/40 bg-sky-400/15";
                }
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={revealed}
                    onClick={() => setPicked((p) => ({ ...p, [sc.id]: i }))}
                    className={`flex min-h-11 w-full items-center rounded-lg border px-3 text-start text-sm text-slate-200 ${tone}`}
                  >
                    {tr(c.label)}
                  </button>
                );
              })}
            </div>
            {revealed ? (
              <div className="space-y-2 text-sm text-slate-300">
                <p>
                  <RichText text={sc.choices[choice!]!.feedback} />
                </p>
                {sc.diagnosticCommands.map((cmd) => (
                  <CodeBlock key={cmd.title} example={cmd} />
                ))}
                <p>
                  <span className="font-semibold text-slate-100">Cause: </span>
                  <RichText text={sc.cause} />
                </p>
                <p>
                  <span className="font-semibold text-slate-100">Fix: </span>
                  <RichText text={sc.fix} />
                </p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
