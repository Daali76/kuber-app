# Cloud Native Atlas

Mobile-first guide to CNCF tools across the cloud-native stack. Explore an architecture map, tool details, a learning roadmap, a stack builder, and search — all static data, no backend.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Static tool data in [`data/tools.ts`](data/tools.ts)
- PWA manifest for Add to Home Screen
- Dark UI by default; tuned for iPhone Safari

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## CNCF Landscape catalog (Phase 3)

```bash
npm run import:landscape              # YAML + CNCF-project logos
npm run import:landscape -- --skip-logos   # JSON only (faster)
npm run lint:fa
npm run test:e2e
```

`import:landscape` downloads [landscape.yml](https://github.com/cncf/landscape), skips **CNCF Members**, writes [`data/landscape/catalog.json`](data/landscape/catalog.json) (~1722 items; maturity printed to stdout), and copies referenced **CNCF project** logos into `public/logos/` (SVGO when installed). Fails if logos exceed **5 MB**. Commit the generated JSON + logos for offline deterministic builds.

Browse `/catalog` and `/catalog/[id]`. Deep guides: see [`docs/roadmap.md`](docs/roadmap.md). Persian copy: [`docs/fa-style-guide.md`](docs/fa-style-guide.md).

**Build note (measured):** `npm run build` (~21s webpack) exports **1722** catalog pages; `out/` ≈ **110 MB** with logos. Turbopack build is flaky at this page count — the npm script forces `--webpack`.

## Static export

`next.config.ts` uses `output: "export"` (images unoptimized). `npm run build` writes a static site to `out/`.

On every push to `cursor/cloud-native-atlas-da00`, GitHub Actions builds and force-pushes the contents of `out/` to the `static-build` branch (see `.github/workflows/static-build.yml`).

Serve locally:

```bash
npm run build
npx serve out
```

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com/new) — zero config (Next.js detected automatically).
3. Deploy. Framework preset: Next.js; build command `next build`; output handled by Vercel.

Or with the Vercel CLI:

```bash
npx vercel
```

## Features

1. **Cluster map (home)** — tools placed on a Kubernetes cluster diagram; tap to open a tool
2. **Placement diagram** — interactive SVG of where the tool runs, with flow arrows
3. **Implement guide** — prerequisites → install → verify → example → test → mistakes; diagram builds up per step
4. **Explain / Alternatives** — levels plus comparisons
5. **Roadmap & Search** — learning path and filters

## Extend the catalog

Add `data/tools/<id>.ts` exporting a `Tool` (see `src/lib/types.ts`) with `diagram` + `implement`, then register it in `data/tools/index.ts`.
