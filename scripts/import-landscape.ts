import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const LANDSCAPE_URL =
  "https://raw.githubusercontent.com/cncf/landscape/master/landscape.yml";
const LOGO_BASE =
  "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/";
const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const SKIP_CATEGORY = "CNCF Members";

/** Align catalog ids with in-app deep guides where landscape slugs differ. */
const SLUG_ALIASES: Record<string, string> = {
  k8s: "kubernetes",
  argo: "argo-cd",
};

type LandscapeProject = "graduated" | "incubating" | "sandbox" | "archived";

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description?: string;
  homepage_url?: string;
  repo_url?: string;
  logo?: string;
  project?: LandscapeProject;
  accepted?: string;
  incubating?: string;
  graduated?: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function resolveId(raw: Record<string, unknown>, name: string): string {
  const extra = raw.extra as Record<string, string> | undefined;
  const fromExtra = extra?.lfx_slug?.trim();
  const base = fromExtra || slugify(name);
  const aliased = SLUG_ALIASES[base] ?? base;
  return aliased || slugify(name) || "item";
}

function pickString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const t = value.trim();
  return t || undefined;
}

function parseProject(value: unknown): LandscapeProject | undefined {
  const p = pickString(value)?.toLowerCase();
  if (
    p === "graduated" ||
    p === "incubating" ||
    p === "sandbox" ||
    p === "archived"
  ) {
    return p;
  }
  return undefined;
}

function parseItems(doc: unknown): CatalogItem[] {
  const landscape = (doc as { landscape?: unknown[] })?.landscape;
  if (!Array.isArray(landscape)) {
    throw new Error("Unexpected landscape.yml shape: missing landscape array");
  }

  const items: CatalogItem[] = [];
  const usedIds = new Map<string, number>();

  for (const catBlock of landscape) {
    const cat = catBlock as Record<string, unknown>;
    const category =
      pickString(cat.name) ??
      pickString((cat.category as { name?: string } | undefined)?.name);
    if (!category || category === SKIP_CATEGORY) continue;

    const subcats = (cat.subcategories as unknown[] | undefined) ?? [];

    for (const subBlock of subcats) {
      const sub = subBlock as Record<string, unknown>;
      const subcategory =
        pickString(sub.name) ??
        pickString((sub.subcategory as { name?: string } | undefined)?.name);
      if (!subcategory) continue;

      const rawItems = (sub.items as unknown[] | undefined) ?? [];

      for (const entry of rawItems) {
        const wrapped = entry as Record<string, unknown>;
        const itemRaw =
          wrapped.item && typeof wrapped.item === "object"
            ? (wrapped.item as Record<string, unknown>)
            : wrapped;

        const name = pickString(itemRaw.name);
        if (!name) continue;

        const baseId = resolveId(itemRaw, name);
        const seen = usedIds.get(baseId) ?? 0;
        usedIds.set(baseId, seen + 1);
        const id = seen === 0 ? baseId : `${baseId}-${seen + 1}`;

        const extra = (itemRaw.extra ?? {}) as Record<string, unknown>;
        const project = parseProject(itemRaw.project);

        const item: CatalogItem = {
          id,
          name,
          category,
          subcategory,
        };

        const description = pickString(itemRaw.description);
        if (description) item.description = description;

        const homepage = pickString(itemRaw.homepage_url);
        if (homepage) item.homepage_url = homepage;

        const repo = pickString(itemRaw.repo_url);
        if (repo) item.repo_url = repo;

        const logo = pickString(itemRaw.logo);
        if (logo) item.logo = logo;

        if (project) item.project = project;

        const accepted = pickString(extra.accepted);
        if (accepted) item.accepted = accepted;

        const incubating = pickString(extra.incubating);
        if (incubating) item.incubating = incubating;

        const graduated = pickString(extra.graduated);
        if (graduated) item.graduated = graduated;

        items.push(item);
      }
    }
  }

  return items;
}

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function resolveSvgoBin(): Promise<string | null> {
  const local = path.join(
    ROOT,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "svgo.cmd" : "svgo",
  );
  try {
    await fs.access(local);
    return local;
  } catch {
    const r = spawnSync("svgo", ["--version"], { encoding: "utf8" });
    return r.status === 0 ? "svgo" : null;
  }
}

async function optimizeSvg(svgo: string, filePath: string): Promise<void> {
  const r = spawnSync(svgo, ["--multipass", filePath, "-o", filePath], {
    encoding: "utf8",
  });
  if (r.status !== 0) {
    console.warn(
      `warn: svgo failed for ${path.basename(filePath)}: ${r.stderr || r.stdout}`,
    );
  }
}

/**
 * Landscape has 1500+ logos; the 5 MB static budget fits CNCF project logos
 * (sandbox/incubating/graduated/archived) after SVGO. Full catalog JSON still
 * includes every non-member item.
 */
async function copyLogos(
  items: CatalogItem[],
  logosDir: string,
): Promise<number> {
  await fs.mkdir(logosDir, { recursive: true });

  const names = [
    ...new Set(
      items
        .filter((i) => i.project && i.logo)
        .map((i) => i.logo)
        .filter(Boolean),
    ),
  ] as string[];

  const svgo = await resolveSvgoBin();
  if (!svgo) {
    console.warn("warn: svgo not found — copying logos without optimization");
  }

  let totalBytes = 0;

  for (const name of names) {
    const dest = path.join(logosDir, name);
    const url = `${LOGO_BASE}${name}`;

    let buf: Buffer;
    try {
      buf = await download(url);
    } catch (err) {
      console.warn(`warn: logo download ${name}: ${(err as Error).message}`);
      continue;
    }

    await fs.writeFile(dest, buf);

    if (svgo && name.toLowerCase().endsWith(".svg")) {
      await optimizeSvg(svgo, dest);
      buf = await fs.readFile(dest);
    }

    const nextTotal = totalBytes + buf.length;
    if (nextTotal > MAX_LOGO_BYTES) {
      await fs.unlink(dest).catch(() => undefined);
      throw new Error(
        `Total logo size would exceed ${MAX_LOGO_BYTES} bytes (at ${name}). Use svgo or raise the cap.`,
      );
    }
    totalBytes = nextTotal;
  }

  return totalBytes;
}

function printStats(items: CatalogItem[]) {
  const maturity = {
    graduated: 0,
    incubating: 0,
    sandbox: 0,
    archived: 0,
    other: 0,
  };

  for (const item of items) {
    switch (item.project) {
      case "graduated":
        maturity.graduated++;
        break;
      case "incubating":
        maturity.incubating++;
        break;
      case "sandbox":
        maturity.sandbox++;
        break;
      case "archived":
        maturity.archived++;
        break;
      default:
        maturity.other++;
    }
  }

  console.log(`Items: ${items.length}`);
  console.log(
    `Maturity — graduated: ${maturity.graduated}, incubating: ${maturity.incubating}, sandbox: ${maturity.sandbox}, archived: ${maturity.archived} (non-CNCF/no project: ${maturity.other})`,
  );
}

async function main() {
  const skipLogos = process.argv.includes("--skip-logos");
  console.log("Downloading landscape.yml…");
  const yml = await download(LANDSCAPE_URL);
  console.log(`Downloaded ${(yml.length / 1024).toFixed(1)} KiB YAML`);
  const doc = yaml.load(yml.toString("utf8"));
  const items = parseItems(doc);

  const outDir = path.join(ROOT, "data", "landscape");
  const logosDir = path.join(ROOT, "public", "logos");
  const catalogPath = path.join(outDir, "catalog.json");

  let logoBytes = 0;
  if (skipLogos) {
    console.log("Skipping logos (--skip-logos)");
  } else {
    console.log("Fetching logos for CNCF-project items…");
    logoBytes = await copyLogos(items, logosDir);
    console.log(`Logos total: ${(logoBytes / 1024).toFixed(1)} KiB`);
  }

  const maturity = {
    graduated: 0,
    incubating: 0,
    sandbox: 0,
    archived: 0,
  };
  for (const item of items) {
    if (item.project && item.project in maturity) {
      maturity[item.project]++;
    }
  }

  const catalog = {
    generatedAt: new Date().toISOString(),
    itemCount: items.length,
    maturityCounts: maturity,
    items,
  };

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  console.log(`Wrote ${catalogPath}`);

  printStats(items);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
