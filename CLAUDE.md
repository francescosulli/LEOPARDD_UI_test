# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

LEOPARDD ("Low Earth Orbit Prediction and Analysis of Radar-Detected Debris") — a browser-only public demo for Team ASTREO. It renders Earth in WebGL, loads a public debris catalog, propagates a user-supplied satellite orbit, and displays simplified close-approach risk. No backend, no tests, no linter.

UI copy is in **Italian**; code identifiers and comments are in English. Number/date formatting goes through `Intl` with the `it-IT` locale in [src/utils/formatting.ts](src/utils/formatting.ts).

## Commands

```bash
npm install
npm run dev        # Vite dev server
npm run build      # tsc -b (typecheck, noEmit) + vite build -> dist/
npm run preview    # serve dist/ on 0.0.0.0
```

There is no test or lint script. `npm run build` is the only automated check — TypeScript is `strict`, and `tsc -b` is the typecheck gate.

Useful demo URLs: `/demo` is the app; `/demo?source=cache` (or `?offline`) forces the local TLE cache and skips live fetching.

## Deployment / base path

Deployed to GitHub Pages by [.github/workflows/deploy.yml](.github/workflows/deploy.yml) on push to `main`. `vite.config.ts` sets `base: '/LEOPARDD_UI_test/'`, so:

- **Every runtime asset path must be prefixed with `import.meta.env.BASE_URL`** (textures in [src/components/Earth.tsx](src/components/Earth.tsx), TLE/JSON data in [src/services/celestrak.ts](src/services/celestrak.ts), the logo in [src/components/AstreoLogo.tsx](src/components/AstreoLogo.tsx)). Bare `/textures/...` paths 404 in production — several past commits exist purely to fix this.
- `BrowserRouter` uses `basename={import.meta.env.BASE_URL}` in [src/main.tsx](src/main.tsx).
- If the repo/Pages path changes, `base` is the single source of truth for all of the above.

## Data pipeline

The whole app is a single synchronous pipeline re-run from [src/routes/DemoPage.tsx](src/routes/DemoPage.tsx), which owns all state (no store, no context):

1. **Catalog** — [src/services/celestrak.ts](src/services/celestrak.ts) `fetchDebrisCatalog()`. Three tiers, tried in order and reflected in `CatalogStatus`:
   - `Live CelesTrak` — GP endpoint per group (`cosmos-2251`, `iridium-33`, `fengyun-1c`, `cosmos-1408` debris), JSON first with a 6.5 s abort, TLE format as fallback. JSON GP records are re-serialized into TLE lines (`buildTleFromGpRecord`) so everything downstream is uniform TLE + `satrec`.
   - `Cache TLE pubblica` — real public TLEs bundled at `public/data/celestrak_*_debris.tle`.
   - `Cached demo data` — last resort; `public/data/debris_sample.json` holds orbital-element *templates* that are expanded into synthetic TLE variants (`buildTleFromTemplate`), each with a recomputed line checksum.
   Live results below 40 objects are treated as failure; live results below `maxObjects` are topped up from cache.
2. **Timeline + propagation** — [src/services/propagation.ts](src/services/propagation.ts). `createTimeline()` builds evenly spaced `Date`s from `PropagationSettings` (`horizonHours`, `stepMinutes`, `maxDebris`). Debris always uses SGP4 via `satellite.js`. The user satellite uses SGP4 when `mode === 'tle'`, or the analytic two-body propagator in [src/services/syntheticOrbit.ts](src/services/syntheticOrbit.ts) when `mode === 'simple'` (Kepler solve + perifocal→ECI rotation; no drag, J2, or covariance — this is stated in a comment and must stay documented in the UI).
3. **Conjunctions** — [src/services/conjunction.ts](src/services/conjunction.ts) `detectConjunctions()`. Brute-force over every frame × every debris object; keeps min distance per object, thresholds it into `RiskLevel` (<5/<15/<50/<100 km, else discarded), and returns the 10 closest.
4. **Render** — [src/components/GlobeScene.tsx](src/components/GlobeScene.tsx) draws the current frame; a `requestAnimationFrame` clock in `DemoPage` advances a fractional `frameIndex` over the precomputed frames.

`PropagatedDebrisCatalog.objects` is **filtered** — objects that fail to propagate at `timeline[0]` are dropped, so `debrisIndex` in a `ConjunctionEvent` indexes into that filtered array and into the frame `Float32Array`s, not into the raw catalog. Keep those three in sync when changing propagation.

Debris positions/velocities live in flat `Float32Array`s (`positionsKm[i*3 + 0..2]`) per `DebrisFrame`, one frame per timeline step, with `NaN` marking a step that failed to propagate — consumers must check `Number.isFinite` before use.

## Coordinates and scene units

Positions are ECI kilometers everywhere in services and types. The three.js scene uses `EARTH_SCENE_RADIUS = 2` with the axis swap `(x, z, -y)`. Convert with `kmToSceneTuple()` in [src/utils/math.ts](src/utils/math.ts); [src/components/DebrisCloud.tsx](src/components/DebrisCloud.tsx) inlines the same swap for per-instance performance — change both together.

## Rendering notes

- Debris is one `instancedMesh` written in a `useLayoutEffect` (matrices + per-instance colors, scale 0 to hide invalid points). Do not turn debris into per-object React components; the catalog reaches ~1000 objects.
- `OrbitControls` is mounted with `makeDefault` so `FocusController` can read it from `useThree().controls` and lerp the camera onto a selected event.
- Earth textures are local (`public/textures/`) so the demo works offline.

## Risk score

`confidenceScore()` ("Affidabilità stimata") is a **demo heuristic, not a collision probability**: `100 × exp(-d/24) × velocityFactor × samplingFactor × freshness`, clamped to 1–99. The synthetic dramatic scenario (`appendDramaticDemoDebris`, which injects one fabricated near-pass object with `isSynthetic: true`) must stay visibly labeled in the UI, and the non-operational disclaimer must remain.

## Styling

Tailwind with a custom `astro` palette in [tailwind.config.ts](tailwind.config.ts) (note: `cyan`/`mint` are aliased to the same orange). Panel chrome comes from hand-written classes in [src/styles.css](src/styles.css): `.mission-panel`, `.grid-mask`, `.scanlines`, `.status-light`, `.landing-orbit`, `.thin-scrollbar`. Dark-only (`color-scheme: dark`), full-viewport, `body { overflow: hidden }` — panels are absolutely positioned over the canvas.

## Constraint

Do not add ESA DISCOS (or any other authenticated API) credentials to frontend code. The documented production path is a backend proxy that enriches the public catalog server-side.
