"use client";

import Link from "next/link";
import { strategies } from "@data/strategies";
import { useI18n } from "@/lib/i18n";

const categoryLabel = {
  native: { en: "Native Kubernetes", fa: "بومی Kubernetes" },
  rollouts: { en: "Argo Rollouts", fa: "Argo Rollouts" },
  gitops: { en: "GitOps / Argo CD", fa: "GitOps / Argo CD" },
  compare: { en: "Compare", fa: "مقایسه" },
} as const;

export function StrategiesHubClient() {
  const { tr, ui, lang } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-page text-2xl font-semibold text-slate-50 sm:text-3xl">
          {ui("strategies")}
        </h1>
        <p className="mt-1 max-w-2xl text-base text-slate-400">
          {ui("strategiesSubtitle")}
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {strategies.map((s) => (
          <li key={s.id}>
            <Link
              href={`/strategies/${s.id}`}
              className="flex min-h-28 flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-pink-400/30 hover:bg-pink-400/5"
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-pink-200/70">
                {lang === "fa"
                  ? categoryLabel[s.category].fa
                  : categoryLabel[s.category].en}
              </span>
              <span className="mt-1 text-lg font-semibold text-slate-50">
                {tr(s.name)}
              </span>
              <span className="mt-1 line-clamp-2 text-sm text-slate-400">
                {tr(s.summary)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
