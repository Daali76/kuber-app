import type { DiagramComponent, DiagramConnection, DiagramZone } from "@/lib/types";

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

export interface BoxRect {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Logical viewBox width — SVG scales to column; keep geometry stable for RTL. */
export const VIEW_W = 640;

export const COMP_HIT = 48;

const ZONE_ORDER: DiagramZone[] = [
  "external",
  "control-plane",
  "worker-node",
  "namespace",
  "pod",
];

export const ZONE_LABEL: Record<DiagramZone, string> = {
  external: "External",
  "control-plane": "Control plane",
  "worker-node": "Worker node",
  namespace: "Namespaces / Services",
  pod: "Pods",
};

const ZONE_X = 16;
const ZONE_W = 608;
const TOP = 12;
const ZONE_GAP = 18;
const LABEL_BAND = 28;
const ROW_PITCH = 58;
const BOTTOM_PAD = 14;
const H_PAD = 8;

export interface DiagramLayout {
  view: { w: number; h: number };
  zones: Record<DiagramZone, ZoneRect>;
  positions: Record<string, Point>;
  boxes: Record<string, BoxRect>;
}

/** Estimate text width (approx) for layout — monospace-ish average. */
export function estimateTextWidth(text: string, fontSize: number): number {
  let w = 0;
  for (const ch of text) {
    w += /[iIl1\s]/.test(ch) ? fontSize * 0.35 : fontSize * 0.62;
  }
  return w;
}

/**
 * Wrap only at spaces, hyphens, or slashes — never mid-word.
 * "kube-scheduler" → ["kube-", "scheduler"]; "API server" → ["API", "server"].
 */
export function wrapLabel(label: string, maxChars = 14): string[] {
  if (label.length <= maxChars) return [label];

  // Tokens: words ending with optional - or /, or plain words; spaces separate soft breaks.
  const rawParts = label.split(/(\s+)/).filter((p) => p.length > 0);
  const atoms: string[] = [];
  for (const part of rawParts) {
    if (/^\s+$/.test(part)) {
      atoms.push(" ");
      continue;
    }
    // Split on hyphen/slash keeping delimiter on the left piece
    let rest = part;
    while (rest.length) {
      const m = rest.match(/^([^/-]+[-/]|[^/-]+|[-/])/);
      if (!m) {
        atoms.push(rest);
        break;
      }
      atoms.push(m[1]!);
      rest = rest.slice(m[1]!.length);
    }
  }

  const lines: string[] = [];
  let line = "";
  const push = () => {
    const t = line.trim();
    if (t) lines.push(t);
    line = "";
  };

  for (const atom of atoms) {
    if (atom === " ") {
      if (line && !line.endsWith(" ") && !line.endsWith("-") && !line.endsWith("/")) {
        line += " ";
      }
      continue;
    }
    const glued =
      !line || line.endsWith("-") || line.endsWith("/") || line.endsWith(" ")
        ? line + atom
        : `${line} ${atom}`;
    if (glued.trim().length <= maxChars || !line.trim()) {
      line = glued;
    } else {
      push();
      line = atom;
    }
  }
  push();

  if (lines.length === 0) return [label];
  // Still one unbroken long token: keep full word (no mid-word ellipsis)
  return lines.slice(0, 3);
}

function boxForLabel(label: string, fontSize: number): { w: number; h: number } {
  const lines = wrapLabel(label, 16);
  const textW = Math.max(...lines.map((l) => estimateTextWidth(l, fontSize)));
  const w = Math.min(ZONE_W / 2 - H_PAD, Math.max(COMP_HIT, textW + 28));
  const h = Math.max(COMP_HIT, 18 + lines.length * (fontSize + 4));
  return { w, h };
}

export function computeDiagramLayout(
  components: DiagramComponent[],
  fontSize = 14,
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
  const boxes: Record<string, BoxRect> = {};
  let y = TOP;

  for (const zone of ZONE_ORDER) {
    const list = byZone.get(zone) ?? [];
    const cols = Math.min(3, Math.max(1, list.length || 1));
    const sizes = list.map((c) => boxForLabel(c.label, fontSize));
    const rowH: number[] = [];
    const rows = Math.max(1, Math.ceil((list.length || 1) / cols));
    for (let r = 0; r < rows; r++) {
      let maxH = ROW_PITCH;
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        if (i < sizes.length) maxH = Math.max(maxH, sizes[i]!.h + 10);
      }
      rowH[r] = maxH;
    }
    const contentH = rowH.reduce((a, b) => a + b, 0);
    const h = LABEL_BAND + contentH + BOTTOM_PAD;

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
      const size = sizes[i]!;
      let rowOffset = 0;
      for (let r = 0; r < row; r++) rowOffset += rowH[r]!;
      const cx = ZONE_X + cellW * col + cellW / 2;
      const cy = y + LABEL_BAND + rowOffset + rowH[row]! / 2;
      positions[c.id] = { x: cx, y: cy };
      boxes[c.id] = {
        id: c.id,
        x: cx - size.w / 2,
        y: cy - size.h / 2,
        w: size.w,
        h: size.h,
      };
    });

    y += h + ZONE_GAP;
  }

  return {
    view: { w: VIEW_W, h: y - ZONE_GAP + TOP },
    zones,
    positions,
    boxes,
  };
}

export function placeComponents(
  components: DiagramComponent[],
): Record<string, Point> {
  return computeDiagramLayout(components).positions;
}

export function zoneBox(zone: DiagramZone, layout?: DiagramLayout): ZoneRect {
  if (layout) return layout.zones[zone];
  return {
    x: ZONE_X,
    y: TOP,
    w: ZONE_W,
    h: 80,
    label: ZONE_LABEL[zone],
  };
}

/** Orthogonal path with padding — avoids cutting straight through mid boxes when possible. */
export function orthogonalPath(from: Point, to: Point): string {
  const pad = 12;
  if (Math.abs(from.x - to.x) < 8) {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }
  const midY = from.y + (to.y - from.y) * 0.5;
  return `M ${from.x} ${from.y} L ${from.x} ${midY + (to.y > from.y ? pad : -pad)} L ${to.x} ${midY + (to.y > from.y ? pad : -pad)} L ${to.x} ${to.y}`;
}

export function curvePath(from: Point, to: Point): string {
  return orthogonalPath(from, to);
}

export function pathMidpoint(from: Point, to: Point): Point {
  return {
    x: (from.x + to.x) / 2,
    y: from.y + (to.y - from.y) * 0.5,
  };
}

function intersects(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): boolean {
  return !(
    a.x + a.w < b.x ||
    b.x + b.w < a.x ||
    a.y + a.h < b.y ||
    b.y + b.h < a.y
  );
}

/** Place edge label pill at path midpoint; nudge if colliding with boxes. */
export function placeEdgeLabel(
  from: Point,
  to: Point,
  label: string,
  boxes: BoxRect[],
  fontSize = 12,
  avoid: { x: number; y: number; w: number; h: number }[] = [],
): { x: number; y: number; w: number; h: number } {
  const mid = pathMidpoint(from, to);
  const w = Math.max(36, estimateTextWidth(label, fontSize) + 16);
  const h = 18;
  const candidates: Point[] = [
    { x: mid.x - w / 2, y: mid.y - h / 2 - 8 },
    { x: mid.x - w / 2, y: mid.y + 10 },
    { x: mid.x - w / 2 - 24, y: mid.y - h / 2 },
    { x: mid.x - w / 2 + 24, y: mid.y - h / 2 },
    { x: mid.x - w / 2, y: mid.y - h - 20 },
    { x: mid.x - w / 2, y: mid.y + 24 },
  ];

  const blockers = [...boxes, ...avoid];
  for (const c of candidates) {
    const x = Math.max(4, Math.min(VIEW_W - w - 4, c.x));
    const y = Math.max(4, c.y);
    const pill = { x, y, w, h };
    if (!blockers.some((b) => intersects(pill, b))) {
      return pill;
    }
  }

  // Last resort: park above the highest colliding box near midpoint
  const x = Math.max(4, Math.min(VIEW_W - w - 4, mid.x - w / 2));
  let y = Math.max(4, mid.y - 40);
  for (let i = 0; i < 12; i++) {
    const pill = { x, y, w, h };
    if (!blockers.some((b) => intersects(pill, b))) return pill;
    y += h + 4;
  }
  return { x, y, w, h };
}

export function connectionLabelLayout(
  connections: DiagramConnection[],
  positions: Record<string, Point>,
  boxes: Record<string, BoxRect>,
  fontSize = 12,
): Record<string, { x: number; y: number; w: number; h: number }> {
  const out: Record<string, { x: number; y: number; w: number; h: number }> = {};
  const boxList = Object.values(boxes);
  const placed: { x: number; y: number; w: number; h: number }[] = [];
  for (const conn of connections) {
    const a = positions[conn.from];
    const b = positions[conn.to];
    if (!a || !b) continue;
    const pill = placeEdgeLabel(a, b, conn.label, boxList, fontSize, placed);
    placed.push(pill);
    out[conn.id] = pill;
  }
  return out;
}
