/** @deprecated prefer src/lib/progress — kept as thin roadmap adapters */
import {
  getProgressSnapshot,
  loadProgress,
  saveProgress,
  subscribeProgress,
} from "@/lib/progress";

export const ROADMAP_CHANGE_EVENT = "cna-progress-change";

export function loadRoadmapProgress(): Record<string, boolean> {
  return loadProgress().roadmap;
}

export function getRoadmapProgressSnapshot(): string {
  return JSON.stringify(loadProgress().roadmap);
}

export function saveRoadmapProgress(progress: Record<string, boolean>) {
  const p = loadProgress();
  p.roadmap = progress;
  saveProgress(p);
}

export function subscribeRoadmapProgress(onStoreChange: () => void) {
  return subscribeProgress(onStoreChange);
}

export { getProgressSnapshot, subscribeProgress };
