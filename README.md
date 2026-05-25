# LEOPARDD Public Demo

Polished browser demo for Team ASTREO’s LEOPARDD concept, “Low Earth Orbit Prediction and Analysis of Radar-Detected Debris”: visualize Earth, load public debris catalog data, insert a demo satellite, propagate orbits, and preview simplified close-approach risk.

## Setup

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Data Sources

The app first attempts public CelesTrak GP debris groups for COSMOS 2251, IRIDIUM 33, FENGYUN 1C, and COSMOS 1408. It tries JSON first and falls back to TLE where needed. If live fetching fails because of network or CORS constraints, it uses cached real public TLE files in `public/data/celestrak_*_debris.tle`. The older synthetic `public/data/debris_sample.json` remains only as a last-resort demo fallback.

For a forced offline-style run, open `/demo?source=cache`; the app will skip live fetching and use the local public TLE cache immediately.

ESA DISCOS is the right institutional source for richer ESA object metadata and orbit histories, but direct API access requires authentication. For a public browser-only demo, do not ship ESA credentials in frontend code. The recommended production path is a small backend/proxy that authenticates to DISCOS, enriches the public TLE catalog by NORAD/COSPAR ID, and returns only the fields needed by the UI.

Earth rendering uses local public demo textures in `public/textures/`, so the globe remains realistic when the demo is used offline.

## Simplified Risk Score

The “Affidabilità stimata” value is a demo heuristic, not a collision probability. It combines minimum sampled distance, relative velocity, orbital-data freshness, and the number of samples near the threshold:

```txt
score ≈ 100 × exp(-d_min / scale) × freshness × sampling × velocity_factor
```

The UI includes the required disclaimer and labels the synthetic dramatic scenario clearly.
