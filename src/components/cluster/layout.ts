import type { DiagramComponent, DiagramZone } from "@/lib/types";

export interface Point {
  x: number;
  y: number;
}

export interface ZoneRect {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

/** Narrower viewBox so labels (~12 SVG px) render ≥11 CSS px at ~390px width. */
export const VIEW_W = 320;

export const COMP_BOX = { w: 94, h: 40 };
/** Minimum tappable area in SVG units (≥44 CSS px at 390px viewport). */
export const COMP_HIT = 46;

const ZONE_ORDER: DiagramZone[] = [
  "external",
  "control-plane",
  "worker-node",
  "namespace",
  "pod",
];

const ZONE_LABEL: Record<DiagramZone, string> = {
  external: "External",
  "control-plane": "Control plane",
  "worker-node": "Worker node",
  namespace: "Namespaces / Services",
  pod: "Pods",
};

const ZONE_X = 10;
const ZONE_W = 300;
const TOP = 10;
const ZONE_GAP = 14;
const LABEL_BAND = 26;
const ROW_PITCH = 50; // ≥ COMP_HIT so rows don't overlap hit targets
const BOTTOM_PAD = 10;

export interface DiagramLayout {
  view: { w: number; h: number };
  zones: Record<DiagramZone, ZoneRect>;
  positions: Record<string, Point>;
}

/** Size zones from content so pins stay inside their boxes (home overview included). */
export function computeDiagramLayout(
  components: DiagramComponent[],
): DiagramLayout {
  const byZone = new Map<DiagramZone, DiagramComponent[]>();
  for (const z of ZONE_ORDER) byZone.set(z, []);
  for (const c of components) {
    const list = byZone.get(c.zone) ?? [];
    list.push(c);
    byZone.set(c.zone, list);
  }

  const zones = {} as Record<DiagramZone, ZoneRect>;
  const positions: Record<string, Point> = {};
  let y = TOP;

  for (const zone of ZONE_ORDER) {
    const list = byZone.get(zone) ?? [];
    const cols = Math.min(3, Math.max(1, list.length || 1));
    const rows = Math.max(1, Math.ceil((list.length || 1) / cols));
    const h = LABEL_BAND + rows * ROW_PITCH + BOTTOM_PAD;

    zones[zone] = {
      x: ZONE_X,
      y,
      w: ZONE_W,
      h,
      label: ZONE_LABEL[zone],
    };

    list.forEach((c, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cellW = ZONE_W / cols;
      positions[c.id] = {
        x: ZONE_X + cellW * col + cellW / 2,
        y: y + LABEL_BAND + row * ROW_PITCH + ROW_PITCH / 2,
      };
    });

    y += h + ZONE_GAP;
  }

  return {
    view: { w: VIEW_W, h: y - ZONE_GAP + TOP },
    zones,
    positions,
  };
}

/** @deprecated Prefer computeDiagramLayout — kept for call sites that only need positions. */
export function placeComponents(
  components: DiagramComponent[],
): Record<string, Point> {
  return computeDiagramLayout(components).positions;
}

export function zoneBox(
  zone: DiagramZone,
  layout?: DiagramLayout,
): ZoneRect {
  if (layout) return layout.zones[zone];
  // Fallback empty layout (should not be used for rendering)
  return {
    x: ZONE_X,
    y: TOP,
    w: ZONE_W,
    h: 80,
    label: ZONE_LABEL[zone],
  };
}

export function curvePath(from: Point, to: Point): string {
  const midY = (from.y + to.y) / 2;
  const bend = Math.abs(from.x - to.x) < 8 ? 28 : 0;
  const c1x = from.x + bend;
  const c2x = to.x - bend;
  return `M ${from.x} ${from.y} C ${c1x} ${midY}, ${c2x} ${midY}, ${to.x} ${to.y}`;
}

/** Wrap a label onto at most two lines without truncating with ellipsis. */
export function wrapLabel(label: string, maxChars = 10): string[] {
  if (label.length <= maxChars) return [label];
  const words = label.split(/\s+/);
  if (words.length === 1) {
    return [label.slice(0, maxChars), label.slice(maxChars)];
  }
  let line1 = words[0]!;
  let i = 1;
  while (i < words.length && `${line1} ${words[i]}`.length <= maxChars) {
    line1 = `${line1} ${words[i]}`;
    i += 1;
  }
  const line2 = words.slice(i).join(" ");
  return line2 ? [line1, line2] : [line1];
}
