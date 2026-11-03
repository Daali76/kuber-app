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

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com/new) — zero config (Next.js detected automatically).
3. Deploy. Framework preset: Next.js; build command `next build`; output handled by Vercel.

Or with the Vercel CLI:

```bash
npx vercel
```

## Features

1. **Map** — eight layers (infra → security) with tappable tool chips
2. **Tool detail** — maturity, explain levels, connections, examples, docs/GitHub
3. **Roadmap** — beginner → expert steps with localStorage progress
4. **Builder** — guided recommendations (one tool per layer + install order)
5. **Search** — filter by layer and CNCF maturity

## Extend the catalog

Add a typed object to `data/tools.ts` (`Tool` in `src/lib/types.ts`). Wire layer metadata in `data/layers.ts` and roadmap links in `data/roadmap.ts`.
