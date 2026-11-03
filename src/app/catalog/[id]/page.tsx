import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveLandscapeLayer } from "@data/landscape/category-map";
import { getCatalogItem, landscapeCatalog } from "@data/landscape";
import { getLayer } from "@data/layers";
import { getTool } from "@data/tools";
import { AppShell } from "@/components/AppShell";
import { CatalogPlacementHint } from "@/components/CatalogPlacementHint";
import { LandscapeMaturityBadge } from "@/components/LandscapeMaturityBadge";

export async function generateStaticParams() {
  return landscapeCatalog.items.map((item) => ({ id: item.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/catalog/[id]">): Promise<Metadata> {
  const { id } = await params;
  const item = getCatalogItem(id);
  if (!item) return { title: "Catalog" };
  return {
    title: item.name,
    description: item.description ?? `${item.name} on the CNCF Landscape`,
  };
}

export default async function CatalogDetailPage({
  params,
}: PageProps<"/catalog/[id]">) {
  const { id } = await params;
  const item = getCatalogItem(id);
  if (!item) notFound();

  const layer = getLayer(resolveLandscapeLayer(item.category, item.subcategory));
  const deepTool = getTool(item.id);

  return (
    <AppShell title={item.name} subtitle={item.subcategory}>
      <div className="space-y-6">
        <Link
          href="/catalog"
          className="inline-flex min-h-11 items-center text-sm font-medium text-teal-300 hover:text-teal-200"
        >
          ← Back to catalog
        </Link>

        <div className="flex flex-wrap items-start gap-4">
          {item.logo ? (
            <Image
              src={`/logos/${item.logo}`}
              alt=""
              width={72}
              height={72}
              className="h-[72px] w-[72px] rounded-xl border border-white/10 bg-white/5 object-contain p-2"
            />
          ) : null}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {item.project ? (
                <LandscapeMaturityBadge project={item.project} />
              ) : null}
              {layer ? (
                <span
                  className="rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset"
                  style={{
                    color: layer.accent,
                    background: layer.accentSoft,
                    borderColor: `${layer.accent}44`,
                  }}
                >
                  {layer.shortName.en}
                </span>
              ) : null}
            </div>
            <p className="text-sm text-slate-400">
              {item.category} · {item.subcategory}
            </p>
            {item.description ? (
              <p className="text-base leading-relaxed text-slate-200">
                {item.description}
              </p>
            ) : null}
          </div>
        </div>

        {(item.accepted || item.incubating || item.graduated) && (
          <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
            {item.accepted ? (
              <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                <dt className="text-[11px] uppercase tracking-wide text-slate-500">
                  Accepted
                </dt>
                <dd className="font-medium text-slate-200">{item.accepted}</dd>
              </div>
            ) : null}
            {item.incubating ? (
              <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                <dt className="text-[11px] uppercase tracking-wide text-slate-500">
                  Incubating
                </dt>
                <dd className="font-medium text-slate-200">
                  {item.incubating}
                </dd>
              </div>
            ) : null}
            {item.graduated ? (
              <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                <dt className="text-[11px] uppercase tracking-wide text-slate-500">
                  Graduated
                </dt>
                <dd className="font-medium text-slate-200">
                  {item.graduated}
                </dd>
              </div>
            ) : null}
          </dl>
        )}

        <div className="flex flex-wrap gap-3">
          {item.homepage_url ? (
            <a
              href={item.homepage_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-xl bg-teal-500/15 px-4 text-sm font-semibold text-teal-200 ring-1 ring-teal-400/30"
            >
              Homepage
            </a>
          ) : null}
          {item.repo_url ? (
            <a
              href={item.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-xl bg-white/[0.06] px-4 text-sm font-semibold text-slate-200 ring-1 ring-white/10"
            >
              Repository
            </a>
          ) : null}
          {deepTool ? (
            <Link
              href={`/tools/${deepTool.id}`}
              className="inline-flex min-h-11 items-center rounded-xl bg-sky-500/15 px-4 text-sm font-semibold text-sky-200 ring-1 ring-sky-400/30"
            >
              Open deep guide
            </Link>
          ) : null}
        </div>

        <CatalogPlacementHint
          category={item.category}
          subcategory={item.subcategory}
        />
      </div>
    </AppShell>
  );
}
