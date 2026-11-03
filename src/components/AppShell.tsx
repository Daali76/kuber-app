"use client";

import { AppNav } from "@/components/AppNav";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const { ui } = useI18n();
  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -start-24 top-0 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -end-16 top-40 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-24 start-1/3 h-56 w-56 rounded-full bg-orange-500/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(148,163,184,0.12) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      <AppNav />

      <header className="relative z-10 px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))] md:px-6 md:pt-8">
        <div className="mx-auto flex w-full max-w-[1440px] items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-display)] text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-300/90 md:hidden">
              {ui("brand")}
            </p>
            {title ? (
              <h1 className="heading-page mt-1 font-[family-name:var(--font-display)] font-semibold tracking-tight text-slate-50 md:mt-0">
                {title}
              </h1>
            ) : null}
            {subtitle ? (
              <p className="mt-1 max-w-3xl text-base leading-relaxed text-slate-400">
                {subtitle}
              </p>
            ) : null}
          </div>
          <div className="shrink-0 md:hidden">
            <LanguageToggle compact />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1440px] flex-1 px-4 pb-28 pt-2 md:px-6 md:pb-12 md:pt-4">
        {children}
      </main>
    </div>
  );
}
