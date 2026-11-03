import type { LandscapeProject } from "@data/landscape/types";

const styles: Record<LandscapeProject, string> = {
  graduated: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  incubating: "bg-sky-500/15 text-sky-300 ring-sky-400/30",
  sandbox: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  archived: "bg-slate-500/20 text-slate-400 ring-slate-400/30",
};

const labels: Record<LandscapeProject, string> = {
  graduated: "Graduated",
  incubating: "Incubating",
  sandbox: "Sandbox",
  archived: "Archived",
};

export function LandscapeMaturityBadge({
  project,
}: {
  project: LandscapeProject;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide ring-1 ring-inset ${styles[project]}`}
    >
      {labels[project]}
    </span>
  );
}
