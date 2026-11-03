"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";

const items = [
  { href: "/", key: "navMap" as const, icon: MapIcon },
  { href: "/learn", key: "navLearn" as const, icon: LearnIcon },
  { href: "/roadmap", key: "navRoadmap" as const, icon: RoadIcon },
  { href: "/search", key: "navSearch" as const, icon: SearchIcon },
];

function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop top nav + mobile bottom nav. */
export function AppNav() {
  const pathname = usePathname();
  const { ui } = useI18n();

  return (
    <>
      <nav
        className="sticky top-0 z-50 hidden border-b border-white/10 bg-[#070b12]/90 backdrop-blur-xl md:block"
        aria-label="Primary"
      >
        <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between gap-6 px-6">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-sm font-bold tracking-tight text-slate-50 transition hover:text-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
          >
            {ui("brand")}
          </Link>
          <div className="flex items-center gap-3">
            <ul className="flex items-center gap-1">
              {items.map(({ href, key, icon: Icon }) => {
                const active = isActive(pathname, href);
                const label = ui(key);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 text-[15px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 ${
                        active
                          ? "bg-teal-400/15 text-teal-200"
                          : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100"
                      }`}
                    >
                      <Icon active={active} />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <LanguageToggle />
          </div>
        </div>
      </nav>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#070b12]/90 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
        aria-label="Primary"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2 pt-1">
          {items.map(({ href, key, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-[12px] font-medium tracking-wide transition-colors ${
                    active
                      ? "text-teal-300"
                      : "text-slate-400 active:text-slate-200"
                  }`}
                >
                  <Icon active={active} />
                  <span>{ui(key)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

function MapIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7.5 9 5l6 3 5-2.5V16.5L15 19l-6-3-5 2.5V7.5Z"
        stroke={active ? "#5eead4" : "currentColor"}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 5v11M15 8v11"
        stroke={active ? "#5eead4" : "currentColor"}
        strokeWidth="1.6"
      />
    </svg>
  );
}

function LearnIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 5.5h7.5v13L8 16.5 4 18.5v-13Z"
        stroke={active ? "#5eead4" : "currentColor"}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 5.5H20v13l-3.5-2-3.5 2v-13Z"
        stroke={active ? "#5eead4" : "currentColor"}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RoadIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 4h8l2 16H6L8 4Z"
        stroke={active ? "#5eead4" : "currentColor"}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 7v2.5M12 12v2.5M12 17v1"
        stroke={active ? "#5eead4" : "currentColor"}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="11"
        cy="11"
        r="6.5"
        stroke={active ? "#5eead4" : "currentColor"}
        strokeWidth="1.6"
      />
      <path
        d="M16 16l4 4"
        stroke={active ? "#5eead4" : "currentColor"}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
