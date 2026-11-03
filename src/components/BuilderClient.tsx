"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getLayer } from "@data/layers";
import { StackDiagram } from "@/components/StackDiagram";
import {
  installationOrder,
  recommendStack,
  type BuilderInput,
} from "@/lib/stack-builder";
import type { Environment, Priority, Scale, TeamSize } from "@/lib/types";

const teamOptions: { id: TeamSize; label: string }[] = [
  { id: "solo", label: "Solo" },
  { id: "small", label: "2–10" },
  { id: "medium", label: "11–50" },
  { id: "large", label: "50+" },
];

const scaleOptions: { id: Scale; label: string }[] = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
];

const envOptions: { id: Environment; label: string }[] = [
  { id: "cloud", label: "Cloud" },
  { id: "on-prem", label: "On-prem" },
  { id: "hybrid", label: "Hybrid" },
];

const priorityOptions: { id: Priority; label: string }[] = [
  { id: "simplicity", label: "Simplicity" },
  { id: "security", label: "Security" },
  { id: "observability", label: "Observability" },
];

export function BuilderClient() {
  const [teamSize, setTeamSize] = useState<TeamSize>("small");
  const [scale, setScale] = useState<Scale>("medium");
  const [environment, setEnvironment] = useState<Environment>("cloud");
  const [priorities, setPriorities] = useState<Priority[]>(["simplicity"]);
  const [submitted, setSubmitted] = useState(false);

  const input: BuilderInput = { teamSize, scale, environment, priorities };

  const stack = useMemo(
    () => (submitted ? recommendStack(input) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [submitted, teamSize, scale, environment, priorities.join(",")],
  );

  const order = stack ? installationOrder(stack) : [];

  function togglePriority(p: Priority) {
    setPriorities((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
    setSubmitted(false);
  }

  return (
    <div className="space-y-5">
      <Field label="Team size">
        <ChipGroup
          options={teamOptions}
          value={teamSize}
          onChange={(v) => {
            setTeamSize(v);
            setSubmitted(false);
          }}
        />
      </Field>
      <Field label="Expected scale">
        <ChipGroup
          options={scaleOptions}
          value={scale}
          onChange={(v) => {
            setScale(v);
            setSubmitted(false);
          }}
        />
      </Field>
      <Field label="Environment">
        <ChipGroup
          options={envOptions}
          value={environment}
          onChange={(v) => {
            setEnvironment(v);
            setSubmitted(false);
          }}
        />
      </Field>
      <Field label="Priorities">
        <div className="flex flex-wrap gap-2">
          {priorityOptions.map((o) => {
            const on = priorities.includes(o.id);
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => togglePriority(o.id)}
                className={`min-h-11 rounded-xl border px-3.5 text-sm font-medium transition ${
                  on
                    ? "border-teal-400/40 bg-teal-400/15 text-teal-100"
                    : "border-white/10 bg-white/[0.03] text-slate-300"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </Field>

      <button
        type="button"
        onClick={() => setSubmitted(true)}
        className="flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-teal-400 to-sky-400 font-[family-name:var(--font-display)] text-base font-semibold text-slate-950 transition active:scale-[0.99]"
      >
        Recommend stack
      </button>

      {stack ? (
        <div className="space-y-5 pt-2">
          <section>
            <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold text-slate-50">
              Layered stack
            </h2>
            <StackDiagram stack={stack} />
          </section>

          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-slate-50">
              Why these picks
            </h2>
            {stack.map((pick) => {
              const layer = getLayer(pick.layer)!;
              return (
                <div
                  key={pick.layer}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: layer.accent }}
                    />
                    <Link
                      href={`/tools/${pick.tool.id}`}
                      className="font-medium text-teal-200"
                    >
                      {pick.tool.name}
                    </Link>
                    <span className="text-xs text-slate-500">
                      · {layer.shortName}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{pick.reason}</p>
                </div>
              );
            })}
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold text-slate-50">
              Installation order
            </h2>
            <ol className="space-y-2">
              {order.map((pick, i) => (
                <li
                  key={pick.layer}
                  className="flex min-h-11 items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-400/15 text-xs font-bold text-teal-200">
                    {i + 1}
                  </span>
                  <Link href={`/tools/${pick.tool.id}`} className="text-slate-100">
                    {pick.tool.name}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </legend>
      {children}
    </fieldset>
  );
}

function ChipGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`min-h-11 rounded-xl border px-3.5 text-sm font-medium transition ${
            value === o.id
              ? "border-sky-400/40 bg-sky-400/15 text-sky-100"
              : "border-white/10 bg-white/[0.03] text-slate-300"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
