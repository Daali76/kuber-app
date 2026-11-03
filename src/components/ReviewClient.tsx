"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { glossary } from "@data/glossary";
import { lessons } from "@data/lessons";
import { useI18n } from "@/lib/i18n";
import {
  getProgressSnapshot,
  gradeFlashcard,
  parseProgress,
  subscribeProgress,
  upsertFlashcard,
} from "@/lib/progress";

type Card = {
  id: string;
  front: string;
  back: string;
};

export function ReviewClient() {
  const { tr, ui } = useI18n();
  const raw = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    () => '{"version":1,"roadmap":{},"lessons":{},"labSteps":{},"quizScores":{},"flashcards":{}}',
  );
  const progress = useMemo(() => parseProgress(raw), [raw]);
  const [flipped, setFlipped] = useState(false);
  const [idx, setIdx] = useState(0);

  const deck: Card[] = useMemo(() => {
    const fromGlossary = glossary.map((g) => ({
      id: `g:${g.id}`,
      front: g.term,
      back: tr(g.definition),
    }));
    const fromQuiz = lessons.flatMap((l) =>
      l.quiz.map((q) => ({
        id: `q:${l.id}:${q.id}`,
        front: tr(q.prompt),
        back: `${tr(q.choices[q.correctIndex]!)} — ${tr(q.explanation)}`,
      })),
    );
    return [...fromGlossary, ...fromQuiz];
  }, [tr]);

  const [now] = useState(() => Date.now());
  const due = useMemo(() => {
    return deck.filter((c) => {
      const st = progress.flashcards[c.id];
      if (!st) return true;
      return st.due <= now;
    });
  }, [deck, progress.flashcards, now]);

  const card = due[idx % Math.max(due.length, 1)];

  if (!card || due.length === 0) {
    return <p className="text-sm text-slate-400">{ui("noCards")}</p>;
  }

  function grade(g: "again" | "good" | "easy") {
    upsertFlashcard(card!.id, {});
    gradeFlashcard(card!.id, g);
    setFlipped(false);
    setIdx((i) => i + 1);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        {due.length} due · {ui("progress")}
      </p>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="flex min-h-48 w-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center"
      >
        <p className="text-lg font-semibold text-slate-50" dir="auto">
          {flipped ? card.back : card.front}
        </p>
        <p className="mt-3 text-xs text-slate-500">Tap to flip</p>
      </button>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => grade("again")}
          className="min-h-12 rounded-xl border border-rose-400/30 bg-rose-400/10 text-sm font-semibold text-rose-100"
        >
          {ui("again")}
        </button>
        <button
          type="button"
          onClick={() => grade("good")}
          className="min-h-12 rounded-xl border border-sky-400/30 bg-sky-400/10 text-sm font-semibold text-sky-100"
        >
          {ui("good")}
        </button>
        <button
          type="button"
          onClick={() => grade("easy")}
          className="min-h-12 rounded-xl border border-teal-400/30 bg-teal-400/10 text-sm font-semibold text-teal-100"
        >
          {ui("easy")}
        </button>
      </div>
    </div>
  );
}
