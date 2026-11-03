import type { QuizQuestion } from "@/lib/types";

export function q(
  id: string,
  prompt: { en: string; fa: string },
  choices: { en: string; fa: string }[],
  correctIndex: number,
  explanation: { en: string; fa: string },
): QuizQuestion {
  return { id, prompt, choices, correctIndex, explanation };
}
