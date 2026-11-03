import Link from "next/link";
import type { Tool } from "@/lib/types";

export function ToolChip({
  tool,
  accent,
}: {
  tool: Tool;
  accent: string;
}) {
  return (
    <Link
      href={`/tools/${tool.id}`}
      className="inline-flex min-h-11 items-center rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-sm font-medium text-slate-100 transition active:scale-[0.98]"
      style={{
        boxShadow: `inset 0 0 0 1px ${accent}22`,
      }}
    >
      <span
        className="mr-2 inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: accent }}
      />
      {tool.name}
    </Link>
  );
}
