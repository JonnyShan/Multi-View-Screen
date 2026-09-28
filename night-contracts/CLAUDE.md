# Night Contracts

Open-city superbike action game. Mobile first (phones in landscape), web build wrapped with Capacitor, desktop browser also supported.

Current milestone: **M4 Contracts** (M0 to M3 done) (see `PLAN.md`).

## Run

```
pnpm install
pnpm dev        # http://localhost:5173
pnpm test       # Vitest unit tests (sim, deterministic)
pnpm e2e        # Playwright smoke tests, desktop + emulated iPhone landscape
pnpm lint
pnpm typecheck
pnpm build      # dist/ (PWA)
pnpm cap:sync   # build + copy into the Capacitor iOS/Android projects
```

Dev helpers: `node tools/shot.mjs out.png [seconds]` rides and screenshots, `node tools/title.mjs out.png [phone]` shoots the title screen (dev server on port 5199). `node tools/fx.mjs` and `node tools/combat.mjs` capture explosions and gunfire (`__nc.slow(0.04)` slows time for inspection). URL params: `?q=low|medium|high` forces quality, `?e2e=1` lets the sim keep real time under slow software rendering.

Playwright uses the preinstalled Chromium (`@playwright/test` is pinned to match it) with SwiftShader WebGL flags.

## Architecture

```
src/
  main.ts          boot, fixed-step loop (60 Hz sim, interpolated render)
  config/tuning.ts every gameplay number
  core/            Loop, EventBus, RNG (seeded), Time, SaveService, math
  world/           pure data: CityGenerator, RoadGraph, places, DayNight, Weather
  sim/             pure game logic, no three.js (Rapier is allowed)
  render/          three.js views that read sim state, never mutate it
  ui/              DOM HUD, minimap canvas, phone, menus, toasts, touch controls
  input/           keyboard, mouse, gamepad, touch -> Intent
  audio/           AudioManager (Howler, sounds synthesised at runtime)
tests/unit         Vitest
tests/e2e          Playwright
tools/             Vite plugins (game assets)
assets/            art handoff (models, ui, audio, concept). Only models/ui/audio ship.
```

## Conventions

- Sim is deterministic given a seed and an input log. No `Math.random` in sim/world/core (lint enforced), no three.js imports there either.
- All numbers in `src/config/tuning.ts`. 8 world units = 1 metre. `KMH` converts km/h.
- Sim plane is `(x, y)` with height `z`. Render maps sim `(x, y, z)` to three `(x, z, y)`. That mapping is a mirror: the visual right of heading `a` is `(-sin a, cos a)` and increasing `a` turns right. Use the helpers in `core/math.ts`.
- Traffic drives on the left.
- Sim emits events into `sim.events` each step; `main.ts` forwards them to the EventBus for UI, audio and FX.
- UI copy is short and plain. No en dashes anywhere.
- No real brands, logos or copyrighted characters. No network calls at runtime.
- Assets: `AssetRegistry` loads GLBs listed by the `virtual:game-assets` module and falls back to code-built placeholders. Record every asset in `ASSETS.md`.
