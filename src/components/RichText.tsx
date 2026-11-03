"use client";

import { useMemo, useState } from "react";
import { glossaryTermsSorted } from "@data/glossary";
import type { GlossaryTerm, LocalizedString } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { TermSheet } from "@/components/TermSheet";

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wrapLatinRuns(text: string, keyBase: number): React.ReactNode[] {
  const parts = text.split(/([A-Za-z][A-Za-z0-9./:_-]*)/g);
  return parts.map((part, i) =>
    /^[A-Za-z]/.test(part) ? (
      <bdi key={`${keyBase}-l-${i}`} dir="ltr">
        {part}
      </bdi>
    ) : (
      <span key={`${keyBase}-t-${i}`}>{part}</span>
    ),
  );
}

export function RichText({
  text,
  className,
}: {
  text: LocalizedString | string;
  className?: string;
}) {
  const { tr, lang } = useI18n();
  const [active, setActive] = useState<GlossaryTerm | null>(null);
  const content = tr(text);

  const nodes = useMemo(() => {
    const terms = glossaryTermsSorted();
    const pattern = new RegExp(
      `\\b(${terms.map((t) => escapeRegExp(t.term)).join("|")})\\b`,
      "g",
    );
    const parts: React.ReactNode[] = [];
    let last = 0;
    let match: RegExpExecArray | null;
    let key = 0;
    while ((match = pattern.exec(content)) !== null) {
      if (match.index > last) {
        const chunk = content.slice(last, match.index);
        parts.push(
          ...(lang === "fa" ? wrapLatinRuns(chunk, key++) : [chunk]),
        );
      }
      const word = match[1]!;
      const term =
        terms.find((t) =>
          lang === "en"
            ? t.term === word || t.term.toLowerCase() === word.toLowerCase()
            : t.term.toLowerCase() === word.toLowerCase(),
        ) ?? terms.find((t) => t.term.toLowerCase() === word.toLowerCase());
      if (term) {
        parts.push(
          <button
            key={`t-${key++}`}
            type="button"
            className="underline decoration-teal-400/50 decoration-dotted underline-offset-2 text-teal-100"
            onClick={() => setActive(term)}
          >
            <bdi dir="ltr">{word}</bdi>
          </button>,
        );
      } else {
        parts.push(
          lang === "fa" ? (
            <bdi key={`w-${key++}`} dir="ltr">
              {word}
            </bdi>
          ) : (
            word
          ),
        );
      }
      last = match.index + word.length;
    }
    if (last < content.length) {
      const chunk = content.slice(last);
      parts.push(...(lang === "fa" ? wrapLatinRuns(chunk, key++) : [chunk]));
    }
    return parts;
  }, [content, lang]);

  return (
    <>
      <span className={className}>{nodes}</span>
      {active ? (
        <TermSheet term={active} onClose={() => setActive(null)} />
      ) : null}
    </>
  );
}
