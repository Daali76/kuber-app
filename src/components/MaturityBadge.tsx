import type { Maturity } from "@/lib/types";

const styles: Record<Maturity, string> = {
  Graduated: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  Incubating: "bg-sky-500/15 text-sky-300 ring-sky-400/30",
  Sandbox: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  External: "bg-slate-500/20 text-slate-300 ring-slate-400/30",
};

export function MaturityBadge({ maturity }: { maturity: Maturity }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide ring-1 ring-inset ${styles[maturity]}`}
    >
      {maturity}
    </span>
  );
}
