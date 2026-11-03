"use client";

import { useMemo, useState } from "react";
import { getLayer } from "@data/layers";
import { tools } from "@data/tools";
import { ClusterDiagram } from "@/components/cluster/ClusterDiagram";
import { useI18n } from "@/lib/i18n";

export function CompareClient() {
  const { ui, lang } = useI18n();
  const [a, setA] = useState(tools[0]!.id);
  const [b, setB] = useState(tools[1]!.id);
  const toolA = useMemo(() => tools.find((t) => t.id === a)!, [a]);
  const toolB = useMemo(() => tools.find((t) => t.id === b)!, [b]);

  return (
    <div className="space-y-4">
      {lang === "fa" ? (
        <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
          {ui("translationPending")}
        </p>
      ) : null}
      <p className="text-sm text-slate-400">{ui("pickTwo")}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <select
          className="min-h-12 rounded-xl border border-white/10 bg-black/40 px-3 text-slate-100"
          value={a}
          onChange={(e) => setA(e.target.value)}
        >
          {tools.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          className="min-h-12 rounded-xl border border-white/10 bg-black/40 px-3 text-slate-100"
          value={b}
          onChange={(e) => setB(e.target.value)}
        >
          {tools.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[320px] text-start text-sm">
          <thead className="bg-black/40 text-slate-400">
            <tr>
              <th className="p-3 font-medium">Field</th>
              <th className="p-3 font-medium">{toolA.name}</th>
              <th className="p-3 font-medium">{toolB.name}</th>
            </tr>
          </thead>
          <tbody className="text-slate-200">
            <Row
              label="Layer"
              left={getLayer(toolA.layer)?.shortName ?? toolA.layer}
              right={getLayer(toolB.layer)?.shortName ?? toolB.layer}
            />
            <Row label="Maturity" left={toolA.maturity} right={toolB.maturity} />
            <Row
              label="Deploy model"
              left={toolA.placementBlurb}
              right={toolB.placementBlurb}
            />
            <Row
              label="Components"
              left={toolA.diagram.components
                .filter((c) => c.highlight)
                .map((c) => c.label)
                .join(", ")}
              right={toolB.diagram.components
                .filter((c) => c.highlight)
                .map((c) => c.label)
                .join(", ")}
            />
            <Row
              label="When to use"
              left={toolA.useWhen[0] ?? "—"}
              right={toolB.useWhen[0] ?? "—"}
            />
            <Row
              label="Complexity"
              left={toolA.levels.advanced.slice(0, 80) + "…"}
              right={toolB.levels.advanced.slice(0, 80) + "…"}
            />
          </tbody>
        </table>
      </div>

      <ClusterDiagram
        components={toolA.diagram.components}
        connections={toolA.diagram.connections}
        accent={getLayer(toolA.layer)!.accent}
        title={toolA.name}
        flows={toolA.flows}
      />
      <ClusterDiagram
        components={toolB.diagram.components}
        connections={toolB.diagram.connections}
        accent={getLayer(toolB.layer)!.accent}
        title={toolB.name}
        flows={toolB.flows}
      />
    </div>
  );
}

function Row({
  label,
  left,
  right,
}: {
  label: string;
  left: string;
  right: string;
}) {
  return (
    <tr className="border-t border-white/10 align-top">
      <td className="p-3 text-slate-500">{label}</td>
      <td className="p-3">{left}</td>
      <td className="p-3">{right}</td>
    </tr>
  );
}
