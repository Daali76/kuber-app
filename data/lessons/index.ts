import type { Lesson } from "@/lib/types";
import type { AppProgress } from "@/lib/types";
import { coreLessons } from "./core-lessons";
import { extraLessons } from "./extra-lessons";
import { enrichLesson } from "./lesson-enrichment";
import { learnModules, getModuleForLesson } from "./modules";

export { learnModules, getModuleForLesson } from "./modules";

const merged = [...coreLessons, ...extraLessons]
  .sort((a, b) => a.order - b.order)
  .map((lesson) => {
    const mod = getModuleForLesson(lesson.id);
    return enrichLesson({
      ...lesson,
      moduleId: lesson.moduleId ?? mod?.id,
    });
  });

export const lessons: Lesson[] = merged;

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

export const lessonCount = lessons.length;

export function moduleProgressPercent(
  moduleId: string,
  progress: AppProgress,
): number {
  const mod = learnModules.find((m) => m.id === moduleId);
  if (!mod || mod.lessonIds.length === 0) return 0;
  const done = mod.lessonIds.filter((id) => progress.lessons[id]).length;
  return Math.round((done / mod.lessonIds.length) * 100);
}

export function getNextRecommendedLesson(
  progress: AppProgress,
  afterLessonId?: string,
): Lesson | undefined {
  const ordered = [...learnModules]
    .sort((a, b) => a.order - b.order)
    .flatMap((m) => m.lessonIds);
  let start = 0;
  if (afterLessonId) {
    const idx = ordered.indexOf(afterLessonId);
    if (idx >= 0) start = idx + 1;
  }
  for (let i = start; i < ordered.length; i++) {
    const id = ordered[i]!;
    if (!progress.lessons[id]) return getLesson(id);
  }
  for (const id of ordered) {
    if (!progress.lessons[id]) return getLesson(id);
  }
  return undefined;
}

/** @deprecated use getNextRecommendedLesson */
export const nextRecommendedLesson = getNextRecommendedLesson;
