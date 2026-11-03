import type { DiagramComponent, DiagramZone } from "@/lib/types";

export interface Point {
  x: number;
  y: number;
}

export const VIEW = { w: 360, h: 620 };

const ZONE_BOX: Record<
  DiagramZone,
  { x: number; y: number; w: number; h: number; label: string }
> = {
  external: { x: 12, y: 12, w: 336, h: 78, label: "External" },
  "control-plane": { x: 12, y: 108, w: 336, h: 120, label: "Control plane" },
  "worker-node": { x: 12, y: 246, w: 336, h: 150, label: "Worker node" },
  namespace: { x: 12, y: 414, w: 336, h: 100, label: "Namespaces / Services" },
  pod: { x: 12, y: 532, w: 336, h: 72, label: "Pods" },
};

export function zoneBox(zone: DiagramZone) {
  return ZONE_BOX[zone];
}

/** Deterministic grid placement inside a zone. */
export function placeComponents(
  components: DiagramComponent[],
): Record<string, Point> {
  const byZone = new Map<DiagramZone, DiagramComponent[]>();
  for (const c of components) {
    const list = byZone.get(c.zone) ?? [];
    list.push(c);
    byZone.set(c.zone, list);
  }

  const positions: Record<string, Point> = {};
  for (const [zone, list] of byZone) {
    const box = ZONE_BOX[zone];
    const cols = Math.min(3, Math.max(1, list.length));
    list.forEach((c, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cellW = box.w / cols;
      positions[c.id] = {
        x: box.x + cellW * col + cellW / 2,
        y: box.y + 28 + row * 36 + 14,
      };
    });
  }
  return positions;
}

export function curvePath(from: Point, to: Point): string {
  const midY = (from.y + to.y) / 2;
  const bend = Math.abs(from.x - to.x) < 8 ? 28 : 0;
  const c1x = from.x + bend;
  const c2x = to.x - bend;
  return `M ${from.x} ${from.y} C ${c1x} ${midY}, ${c2x} ${midY}, ${to.x} ${to.y}`;
}
