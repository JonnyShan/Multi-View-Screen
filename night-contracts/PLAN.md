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
- [x] Road graph lane paths, turn curves
- [x] Queueing, intersection yielding (axis based, right turns yield), panic
- [x] Respawn out of sight (line of sight check), stuck recovery (reverse, overtake, then ghost through cars)
- [x] Parked cars in car parks wake up when disturbed
- [x] 10 minute seeded test: no permanent jams, no cars in buildings (tests/unit/traffic.test.ts)

## M3 Combat
- [x] Gun with aim assist and mouse aim, tyre blowouts (tests/unit/combat.test.ts)
- [x] Katana, wheel cut, spin physics, impact damage
- [x] Car HP, smoke, fire, explosions, chain reactions
- [x] On foot, remount, knockdown
- [x] Leap and roof strike (lands on the roof, strike kills; too slow throws you off with damage)
- [x] Death and respawn (safehouse, full health, $500 medical bill)
- [x] Car versus player by relative speed: push, knock off and hurt, kill

## M4 Contracts
- [x] Phone UI (ringing card with ANSWER, dossier that collapses), contract state machine (tests/unit/contracts.test.ts)
- [x] Target AI (spawns two blocks out, parks at the kerb, runs for its destination, overtakes when fleeing)
- [x] Escort AI (follows, then hunts: rams with lead and backs off, or holds off and shoots in bursts)
- [x] Scoring (method multipliers, $2,000 per civilian car), fail states (escaped, died), loop at 1.5x
- [x] HUD, rotating minimap with clamped blips, off-screen arrows with metres, target marker, toasts

## M5 Heat and police
- [x] Stars (rise with loud kills, civilian damage, shots), decay out of sight, switch off with `heat.enabled` (tests/unit/heat.test.ts)
- [x] Police cruisers at 2+ stars chase with sirens, ram, shoot at 3+
- [x] Roadblocks across the road ahead at 4+ (prefers intersections you cannot see yet)
- [x] A loud contract kill brings the police

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
- Traffic unjamming: a civilian stuck behind something stationary overtakes through the other lane; if it is still stuck after 10 s it briefly stops colliding with other cars and drives through. It never sits still for good, and it looks better than cars teleporting in view.
- Spinning cars take damage from gentler impacts and at 4.5x, so a wheel cut into a wall or another car reliably finishes a light target (crash kill x1.6). The limo usually needs a harder hit.
- A car hitting the player is judged by relative speed before the bike's own crash check, so a ram is never mistaken for the rider hitting a wall.
- Render maps sim (x, y, z) to three (x, z, y) as the brief asks. This is a mirror, so "left" and "right" go through helpers in `core/math.ts`.
