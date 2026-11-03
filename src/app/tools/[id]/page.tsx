import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLayer } from "@data/layers";
import { getTool, tools } from "@data/tools";
import { AppShell } from "@/components/AppShell";
import { CodeBlock } from "@/components/CodeBlock";
import { ExplainLevels } from "@/components/ExplainLevels";
import { MaturityBadge } from "@/components/MaturityBadge";

export async function generateStaticParams() {
  return tools.map((tool) => ({ id: tool.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/tools/[id]">): Promise<Metadata> {
  const { id } = await params;
  const tool = getTool(id);
  if (!tool) return { title: "Tool" };
  return {
    title: tool.name,
    description: tool.summary,
  };
}

export default async function ToolDetailPage({
  params,
}: PageProps<"/tools/[id]">) {
  const { id } = await params;
  const tool = getTool(id);
  if (!tool) notFound();

  const layer = getLayer(tool.layer)!;
  const upstream = tool.connectsTo.upstream
    .map((tid) => getTool(tid))
    .filter(Boolean);
  const downstream = tool.connectsTo.downstream
    .map((tid) => getTool(tid))
    .filter(Boolean);

  return (
    <AppShell>
      <Link
        href="/"
        className="mb-4 inline-flex min-h-10 items-center text-sm text-slate-400"
      >
        ← Map
      </Link>

      <div
        className="mb-5 overflow-hidden rounded-2xl border border-white/10 p-5"
        style={{
          background: `linear-gradient(160deg, ${layer.accentSoft}, rgba(8,12,20,0.95))`,
          boxShadow: `0 0 0 1px ${layer.accent}22`,
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <MaturityBadge maturity={tool.maturity} />
          <span
            className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
            style={{ background: `${layer.accent}22`, color: layer.accent }}
          >
            {layer.name}
          </span>
        </div>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-slate-50">
          {tool.name}
        </h1>
        <p className="mt-2 text-base leading-relaxed text-slate-300">
          {tool.summary}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-300">Problem: </span>
          {tool.problem}
        </p>
      </div>

      <div className="space-y-4">
        <ExplainLevels levels={tool.levels} />

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-slate-100">
            Connects to
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <ConnectList label="Upstream" tools={upstream} empty="—" />
            <ConnectList label="Downstream" tools={downstream} empty="—" />
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <ListCard title="Use when" items={tool.useWhen} tone="good" />
          <ListCard title="Avoid when" items={tool.avoidWhen} tone="warn" />
        </section>

        {tool.alternatives.length > 0 ? (
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-slate-100">
              Alternatives
            </h2>
            <ul className="mt-3 space-y-3">
              {tool.alternatives.map((alt) => {
                const altTool = getTool(alt.id);
                return (
                  <li key={alt.id} className="text-sm text-slate-400">
                    {altTool ? (
                      <Link
                        href={`/tools/${alt.id}`}
                        className="font-medium text-teal-200"
                      >
                        {altTool.name}
                      </Link>
                    ) : (
                      <span className="font-medium text-slate-200">{alt.id}</span>
                    )}
                    <span className="mt-0.5 block">{alt.comparison}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <section>
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-base font-semibold text-slate-100">
            Example
          </h2>
          <CodeBlock example={tool.example} />
        </section>

        <section className="flex flex-col gap-2 sm:flex-row">
          <a
            href={tool.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 flex-1 items-center justify-center rounded-xl border border-teal-400/30 bg-teal-400/10 text-sm font-semibold text-teal-100"
          >
            Official docs
          </a>
          <a
            href={tool.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-slate-200"
          >
            GitHub
          </a>
        </section>
      </div>
    </AppShell>
  );
}

function ConnectList({
  label,
  tools: list,
  empty,
}: {
  label: string;
  tools: ReturnType<typeof getTool>[];
  empty: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {list.length === 0 ? (
          <span className="text-sm text-slate-500">{empty}</span>
        ) : (
          list.map((t) =>
            t ? (
              <Link
                key={t.id}
                href={`/tools/${t.id}`}
                className="inline-flex min-h-10 items-center rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-slate-200"
              >
                {t.name}
              </Link>
            ) : null,
          )
        )}
      </div>
    </div>
  );
}

function ListCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "good" | "warn";
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-slate-100">
        {title}
      </h2>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-slate-400">
            <span
              className={
                tone === "good" ? "text-emerald-400" : "text-amber-400"
              }
            >
              {tone === "good" ? "▸" : "▹"}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
