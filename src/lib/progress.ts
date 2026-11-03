import type { AppProgress, FlashcardState } from "@/lib/types";

const PROGRESS_KEY = "cna-progress-v1";
const LEGACY_ROADMAP_KEY = "cna-roadmap-progress";
export const PROGRESS_EVENT = "cna-progress-change";

function emptyProgress(): AppProgress {
  return {
    version: 1,
    roadmap: {},
    lessons: {},
    labSteps: {},
    quizScores: {},
    flashcards: {},
  };
}

export function loadProgress(): AppProgress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppProgress;
      if (parsed?.version === 1) return parsed;
    }
    // migrate legacy roadmap-only key
    const legacy = window.localStorage.getItem(LEGACY_ROADMAP_KEY);
    if (legacy) {
      const roadmap = JSON.parse(legacy) as Record<string, boolean>;
      return { ...emptyProgress(), roadmap };
    }
  } catch {
    /* ignore */
  }
  return emptyProgress();
}

export function getProgressSnapshot(): string {
  if (typeof window === "undefined") return JSON.stringify(emptyProgress());
  try {
    return (
      window.localStorage.getItem(PROGRESS_KEY) ??
      JSON.stringify(emptyProgress())
    );
  } catch {
    return JSON.stringify(emptyProgress());
  }
}

export function saveProgress(progress: AppProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  // keep legacy key in sync for older readers
  window.localStorage.setItem(
    LEGACY_ROADMAP_KEY,
    JSON.stringify(progress.roadmap),
  );
  window.dispatchEvent(new Event(PROGRESS_EVENT));
}

export function subscribeProgress(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(PROGRESS_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(PROGRESS_EVENT, handler);
  };
}

export function parseProgress(raw: string): AppProgress {
  try {
    const parsed = JSON.parse(raw) as AppProgress;
    if (parsed?.version === 1) return parsed;
  } catch {
    /* ignore */
  }
  return emptyProgress();
}

export function exportProgress(): string {
  return JSON.stringify(loadProgress(), null, 2);
}

export function importProgress(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as AppProgress;
    if (parsed?.version !== 1) return false;
    saveProgress({
      version: 1,
      roadmap: parsed.roadmap ?? {},
      lessons: parsed.lessons ?? {},
      labSteps: parsed.labSteps ?? {},
      quizScores: parsed.quizScores ?? {},
      flashcards: parsed.flashcards ?? {},
      continue: parsed.continue,
    });
    return true;
  } catch {
    return false;
  }
}

export function markLessonComplete(id: string) {
  const p = loadProgress();
  p.lessons[id] = true;
  p.continue = { kind: "lesson", id, href: `/learn/${id}` };
  saveProgress(p);
}

export function toggleLabStep(stepKey: string, href: string, toolId: string) {
  const p = loadProgress();
  p.labSteps[stepKey] = !p.labSteps[stepKey];
  p.continue = { kind: "lab", id: toolId, href };
  saveProgress(p);
}

export function saveQuizScore(
  key: string,
  correct: number,
  total: number,
  continueHref?: string,
) {
  const p = loadProgress();
  p.quizScores[key] = { correct, total, at: Date.now() };
  if (continueHref) {
    p.continue = {
      kind: continueHref.includes("/learn/") ? "lesson" : "tool",
      id: key,
      href: continueHref,
    };
  }
  saveProgress(p);
}

export function setRoadmapStep(id: string, done: boolean) {
  const p = loadProgress();
  p.roadmap[id] = done;
  saveProgress(p);
}

export function upsertFlashcard(
  id: string,
  patch: Partial<FlashcardState>,
) {
  const p = loadProgress();
  const prev = p.flashcards[id] ?? {
    id,
    due: Date.now(),
    interval: 0,
    ease: 2.5,
  };
  p.flashcards[id] = { ...prev, ...patch, id };
  saveProgress(p);
}

/** Simple SM-2-ish: Again / Good / Easy */
export function gradeFlashcard(
  id: string,
  grade: "again" | "good" | "easy",
) {
  const p = loadProgress();
  const card = p.flashcards[id] ?? {
    id,
    due: Date.now(),
    interval: 0,
    ease: 2.5,
  };
  const now = Date.now();
  if (grade === "again") {
    card.interval = 0;
    card.due = now;
    card.ease = Math.max(1.3, card.ease - 0.2);
  } else if (grade === "good") {
    card.interval = card.interval === 0 ? 1 : Math.round(card.interval * card.ease);
    card.due = now + card.interval * 24 * 60 * 60 * 1000;
  } else {
    card.ease = card.ease + 0.15;
    card.interval = card.interval === 0 ? 3 : Math.round(card.interval * card.ease * 1.3);
    card.due = now + card.interval * 24 * 60 * 60 * 1000;
  }
  p.flashcards[id] = card;
  saveProgress(p);
}
