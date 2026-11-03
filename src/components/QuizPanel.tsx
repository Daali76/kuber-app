"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { saveQuizScore } from "@/lib/progress";

export function QuizPanel({
  questions,
  storageKey,
  continueHref,
}: {
  questions: QuizQuestion[];
  storageKey: string;
  continueHref?: string;
}) {
  const { tr, ui } = useI18n();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const correct = questions.filter(
    (q) => answers[q.id] === q.correctIndex,
  ).length;

  function submit() {
    setSubmitted(true);
    saveQuizScore(storageKey, correct, questions.length, continueHref);
  }

  return (
    <div className="space-y-4">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-slate-50">
        {ui("quiz")}
      </h2>
      {questions.map((q, qi) => {
        const picked = answers[q.id];
        return (
          <fieldset
            key={q.id}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
          >
            <legend className="px-1 text-sm font-medium text-slate-200">
              {qi + 1}. {tr(q.prompt)}
            </legend>
            <div className="mt-2 space-y-2">
              {q.choices.map((c, i) => {
                const selected = picked === i;
                let tone = "border-white/10 bg-black/20";
                if (submitted) {
                  if (i === q.correctIndex) tone = "border-teal-400/50 bg-teal-400/15";
                  else if (selected) tone = "border-rose-400/40 bg-rose-400/10";
                } else if (selected) {
                  tone = "border-sky-400/40 bg-sky-400/15";
                }
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={submitted}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [q.id]: i }))
                    }
                    className={`flex min-h-11 w-full items-center rounded-lg border px-3 text-start text-sm text-slate-200 ${tone}`}
                  >
                    {tr(c)}
                  </button>
                );
              })}
            </div>
            {submitted ? (
              <p className="mt-2 text-sm text-slate-400">{tr(q.explanation)}</p>
            ) : null}
          </fieldset>
        );
      })}
      {!submitted ? (
        <button
          type="button"
          onClick={submit}
          disabled={Object.keys(answers).length < questions.length}
          className="flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-teal-400 to-sky-400 font-semibold text-slate-950 disabled:opacity-40"
        >
          {ui("score")}
        </button>
      ) : (
        <p className="text-center text-sm text-teal-200">
          {ui("score")}: {correct} / {questions.length}
        </p>
      )}
    </div>
  );
}
