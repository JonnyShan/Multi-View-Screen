# Night Contracts plan

Checklist per milestone. Changes from the brief are noted under "Decisions".

## M0 Scaffold
- [x] Vite + TypeScript strict + pnpm
- [x] ESLint (sim/world/core may not import three or use Math.random)
- [x] Vitest, Playwright (desktop + iPhone landscape emulation)
- [x] Fixed-step loop, tuning file, empty scene with camera
- [x] Capacitor config, PWA manifest

## M1 Ride
- [x] City generator: 8x8 blocks, block types, alleys with bollards, named places, seeded
- [x] Coastal kit: raised boulevard with ramps, beach, ocean, marina, hillside villas
- [x] Palms, lamps (instanced), neon (a few)
- [x] Sky dome, night lighting, lamp light pool
- [x] Rapier collisions (buildings static, bike dynamic arcade controller)
- [x] Bike handling, drift, skid marks, lean, crash throw, riderless bike
- [x] Chase camera with clip avoidance
- [x] Touch controls + keyboard + gamepad
- [ ] 60 fps on a MacBook Air: not measurable in this environment (headless software rendering); needs a check on real hardware

## M2 Traffic
- [ ] Road graph lane paths, turn curves
- [ ] Queueing, intersection yielding, panic
- [ ] Respawn out of sight, stuck recovery
- [ ] 10 minute seeded test: no permanent jams, no cars in buildings

## M3 Combat
- [ ] Gun with aim assist and mouse aim, tyre blowouts
- [ ] Katana, wheel cut, spin physics, impact damage
- [ ] Car HP, smoke, fire, explosions, chain reactions
- [ ] On foot, remount, knockdown
- [ ] Leap and roof strike
- [ ] Death and respawn

## M4 Contracts
- [ ] Phone UI, contract state machine
- [ ] Target, escort AI
- [ ] Scoring, fail states
- [ ] HUD, minimap, off-screen arrows, toasts

## M5 Heat and police
- [ ] Stars, decay, police cruisers, roadblocks

## M6 Juice
- [ ] Day/night, rain, lightning, post FX, LUT grading
- [ ] Pedestrians
- [ ] GLB swap-in
- [ ] Audio
- [ ] Slow motion, hit stop, shake, sparks
- [ ] Settings, save/load

## M7 Ship to phones
- [ ] Quality presets
- [ ] PWA icons and splash
- [ ] Capacitor iOS and Android projects

## Decisions
- The prototype `reference/ronin-throttle-prototype.html` and the concept images were not in the repo when work started. Numbers come from the brief; everything else is tuned from scratch.
- The game lives in `night-contracts/` because the repository already holds other projects at its root.
- Alleys are 34 units wide as specified, with bollards at each mouth so bikes pass and cars cannot (a 34-unit alley would otherwise fit a realistic car).
- Coast layout: the raised boulevard runs one block south of the grid with ramps on columns 0, 4 and 8, a row of low lots between it and row 0, then beach and ocean. Nothing passes under the boulevard, so height is a simple function of position.
- Physics is Rapier on a flat slab (z locked, gravity off); ramps, the boulevard and airborne arcs are handled by the sim. This keeps car handling arcade and deterministic.
- Palm trunks and lamp posts are solid (`world.solidStreetFurniture`), so clipping one at speed throws you.
- Stepping off the bike below leap speed leaves it standing on its stand; above leap speed you leap. On foot far from the bike, E calls it over.
- Render maps sim (x, y, z) to three (x, z, y) as the brief asks. This is a mirror, so "left" and "right" go through helpers in `core/math.ts`.
