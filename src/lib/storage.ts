const ROADMAP_KEY = "cna-roadmap-progress";

export function loadRoadmapProgress(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ROADMAP_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function saveRoadmapProgress(progress: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROADMAP_KEY, JSON.stringify(progress));
}
