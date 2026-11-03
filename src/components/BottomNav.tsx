"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Map", icon: MapIcon },
  { href: "/roadmap", label: "Roadmap", icon: RoadIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#070b12]/90 backdrop-blur-xl"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      aria-label="Primary"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2 pt-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-[11px] font-medium tracking-wide transition-colors ${
                  active
                    ? "text-teal-300"
                    : "text-slate-400 active:text-slate-200"
                }`}
              >
                <Icon active={active} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MapIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
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

function RoadIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
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
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
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
