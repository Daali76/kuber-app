import { expect, test, type Page } from "@playwright/test";

const VIEWPORTS = [
  { w: 390, h: 844 },
  { w: 768, h: 1024 },
  { w: 1280, h: 800 },
  { w: 1440, h: 900 },
] as const;

const LANGS = ["en", "fa"] as const;

async function setLang(page: Page, lang: "en" | "fa") {
  await page.addInitScript((l) => {
    localStorage.setItem("cna-lang", l);
  }, lang);
}

async function assertNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth - doc.clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(1);
}

async function assertDiagramReadable(page: Page) {
  const svg = page.locator('[data-testid="cluster-diagram-svg"]:visible').first();
  await expect(svg).toBeVisible({ timeout: 15_000 });
  const box = await svg.boundingBox();
  expect(box).toBeTruthy();
  expect(box!.width).toBeGreaterThan(200);

  const overlaps = await page.evaluate(() => {
    const svgEl = document.querySelector(
      '[data-testid="cluster-diagram-svg"]:not([aria-hidden])',
    ) as SVGSVGElement | null;
    // Prefer the visible SVG
    const all = [
      ...document.querySelectorAll('[data-testid="cluster-diagram-svg"]'),
    ] as SVGSVGElement[];
    const visible =
      all.find((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      }) ?? svgEl;
    if (!visible) return { ok: false, reason: "no svg" };

    const comps = [
      ...visible.querySelectorAll('[data-testid^="diagram-comp-"]'),
    ] as SVGGElement[];
    const labels = [
      ...visible.querySelectorAll('[data-testid^="edge-label-"]'),
    ] as SVGGElement[];

    const compBoxes = comps.map((el) => el.getBoundingClientRect());
    const labelBoxes = labels.map((el) => el.getBoundingClientRect());

    for (const lb of labelBoxes) {
      if (lb.width === 0 || lb.height === 0) continue;
      for (const cb of compBoxes) {
        const hit = !(
          lb.right < cb.left ||
          cb.right < lb.left ||
          lb.bottom < cb.top ||
          cb.bottom < lb.top
        );
        if (hit) {
          return {
            ok: false,
            reason: "edge-label overlaps box",
            lb: { x: lb.x, y: lb.y, width: lb.width, height: lb.height },
            cb: { x: cb.x, y: cb.y, width: cb.width, height: cb.height },
          };
        }
      }
    }

    const texts = [...visible.querySelectorAll("text, tspan")].map(
      (t) => t.textContent ?? "",
    );
    for (const t of texts) {
      if (t.includes("\u00ad")) {
        return { ok: false, reason: `soft hyphen in: ${t}` };
      }
    }

    return { ok: true, comps: comps.length, labels: labels.length };
  });

  expect(overlaps).toMatchObject({ ok: true });
}

for (const lang of LANGS) {
  for (const vp of VIEWPORTS) {
    test(`diagram tool page ${lang} ${vp.w}x${vp.h}`, async ({ page }) => {
      await setLang(page, lang);
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto("/tools/kubernetes/");
      await assertNoHorizontalScroll(page);
      await assertDiagramReadable(page);

      if (vp.w >= 1280) {
        const ratio = await page.evaluate(() => {
          const main = document.querySelector("main");
          const svgs = [
            ...document.querySelectorAll('[data-testid="cluster-diagram-svg"]'),
          ] as SVGSVGElement[];
          const svg = svgs.find((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
          });
          if (!main || !svg) return 0;
          return svg.getBoundingClientRect().width / main.clientWidth;
        });
        expect(ratio).toBeGreaterThanOrEqual(0.5);
      }
    });

    test(`home no clip ${lang} ${vp.w}`, async ({ page }) => {
      await setLang(page, lang);
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto("/");
      await assertNoHorizontalScroll(page);
      await assertDiagramReadable(page);
    });
  }
}
