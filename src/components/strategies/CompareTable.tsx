"use client";

import type { Strategy } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export function CompareTable({ strategy }: { strategy: Strategy }) {
  const { tr, lang } = useI18n();
  const rows = strategy.compareRows ?? [];
  if (!rows.length) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="min-w-[720px] w-full text-start text-sm text-slate-200">
        <thead className="bg-black/40 text-slate-400">
          <tr>
            <th className="p-3 font-medium">
              {lang === "fa" ? "بُعد" : "Dimension"}
            </th>
            <th className="p-3 font-medium">Rolling</th>
            <th className="p-3 font-medium">Recreate</th>
            <th className="p-3 font-medium">Canary</th>
            <th className="p-3 font-medium">Blue-Green</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-white/10">
              <td className="p-3 font-medium text-slate-100">
                {tr(row.dimension)}
              </td>
              <td className="p-3">{tr(row.rolling)}</td>
              <td className="p-3">{tr(row.recreate)}</td>
              <td className="p-3">{tr(row.canary)}</td>
              <td className="p-3">{tr(row.blueGreen)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
