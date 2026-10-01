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
- [x] 24 hour cycle (1 real minute = 1 game hour, pausable), sky dome with sun, moon and stars, warm haze by day, blue fog at night
- [x] Rain as a random weather event: streaks, splashes, wet asphalt with puddles, lamp reflection streaks, lightning with thunder
- [x] Post FX: bloom (quarter resolution on phones), per time of day LUT grade blend, vignette, hurt flash; desktop ambient occlusion option (off by default)
- [x] Pedestrians walk footpath loops, cross streets, scatter from gunfire, get knocked down. They are instanced people built from parts (four hairstyles, two builds, jackets, belts, shorts or skirts, trainers) with a walk and run cycle, a per-person palette, umbrellas in the rain and the odd phone call
- [x] GLB swap-in: bike, rider (AnimationMixer clips), cars, palm, lamp, bench, bus stop, barrier, fence. Verified with `node tools/glbcheck.mjs` (exports placeholder GLBs, drops them in, confirms they load, removes them)
- [x] Audio: engine loop pitched by speed, gun, katana, screech, impacts, explosion, rain, phone, siren, thunder, music, all synthesised at runtime; files in assets/audio override them
- [x] Handler voice: drop `audio/voice/<id>.mp3` files in (script in ASSETS.md) and the calls are spoken through a phone line filter, with music and engine dipping under the voice. No voice files ship yet
- [x] The single-page build inlines everything in assets/ (models, sounds, voice) so dropped-in art works there too
- [x] Generated models (Higgsfield test batch, about 170 credits): a rigged rider with six clips, the bike and the sedan, processed by `tools/art` (scale, ground, wheels on axles, mount points, far versions, painted metal and roughness maps, 1024 JPEG textures). The rider rides with two-bone IK on the grips and pegs; sedans take their paint as a tint and draw their own wheels and lamps
- [x] Five more generated cars (SUV, limo, hatch, ute, van; 113 credits): measured with `tools/art/measure.mjs`, processed by `tools/art/car.mjs`. All generated models ship meshopt compressed, so the eight of them make the single-page build smaller than the first three did (10.8 MB)
- [ ] The police car: its concept image is made, but the 3D step was stopped by the session's permission check, so it waits on the owner. It stays code-built until then
- [x] Hit markers where your rounds land (white ticks, red when the round kills) with a tick sound, and a red glow on the screen edge facing whoever hurt you (every edge for damage with no direction, like a hard landing)
- [x] Slow motion on wheel cut and roof strike (0.3x for 0.6 s), hit stop, screen shake, sparks, skid marks, tyre smoke, fire
- [x] Settings menu (quality, weather, clock, volumes, haptics, debug, button layout), save/load (e2e test)

## M7 Ship to phones
- [x] Quality presets auto-picked by device (Low/Medium/High/Ultra: recent phone GPUs get High, strong desktop GPUs Ultra), adaptive pixel ratio that drops when frames run long and climbs back once they hold
- [x] Mobile budgets: emulated iPhone (Medium) about 96 to 135 draw calls and 80k to 145k triangles after CPU instance culling and lighter palms and fences. The generated rider, bike and cars raise the start scene to about 110 draw calls and 245k triangles
- [x] Rain is an occasional shower (starts dry, about one short shower every 20 minutes) with a lighter drop count, and plays at half the volume it launched with
- [x] PWA: manifest, generated icons (192, 512, maskable, apple touch), service worker registered in production web builds
- [x] Capacitor iOS and Android projects: landscape only, fullscreen, screen kept on, generated app icons and splash screens (`node tools/icons.mjs`)
- [ ] Debug APK / iOS build on a real device: not possible in the cloud session (no device, no Xcode, and `dl.google.com` for the Android SDK is blocked by the environment's network policy). Steps in docs/DEVICE_TESTING.md
- [ ] 60 fps on recent iPhones, 30 fps floor on mid-range Android, 20 minute battery and thermal check: needs real devices, checklist in docs/DEVICE_TESTING.md

## Decisions
- The prototype `reference/ronin-throttle-prototype.html` and the concept images were not in the repo when work started. Numbers come from the brief; everything else is tuned from scratch.
- The game lives in `night-contracts/` because the repository already holds other projects at its root.
- Alleys are 34 units wide as specified, with bollards at each mouth so bikes pass and cars cannot (a 34-unit alley would otherwise fit a realistic car).
- Coast layout: the raised boulevard runs one block south of the grid with ramps on columns 0, 4 and 8, a row of low lots between it and row 0, then beach and ocean. Nothing passes under the boulevard, so height is a simple function of position.
- Physics is Rapier on a flat slab (z locked, gravity off); ramps, the boulevard and airborne arcs are handled by the sim. This keeps car handling arcade and deterministic.
- Palm trunks and lamp posts are solid (`world.solidStreetFurniture`), so clipping one at speed throws you.
- Stepping off the bike below leap speed leaves it standing on its stand; above leap speed you leap. On foot, E whistles: the bike stands itself up and rides to you along the roads (left lane, slowing for traffic, squeezing past stopped cars on the kerb side) and stops beside you. From more than about 1400 units of road away it appears out of sight about 650 out and rides in.
- The bike tops out at 150 km/h (0 to 100 in about 3 s): the city is only about 500 m across, and 240 km/h crossed it in 8 seconds. Car top speeds were scaled down with it so police and escorts stay just slower than the bike.
- Traffic unjamming: a civilian stuck behind something stationary overtakes through the other lane; if it is still stuck after 10 s it briefly stops colliding with other cars and drives through. It never sits still for good, and it looks better than cars teleporting in view.
- Spinning cars take damage from gentler impacts and at 4.5x, so a wheel cut into a wall or another car reliably finishes a light target (crash kill x1.6). The limo usually needs a harder hit.
- A car hitting the player is judged by relative speed before the bike's own crash check, so a ram is never mistaken for the rider hitting a wall.
- The player has 2x armour (`player.armor`): every hit does half damage. A heavy car hit does a full health bar of damage before armour, so it now takes half your health instead of killing outright.
- The art deco building kit is procedural (plinth, window bands, cornices, fins, balconies, roof kit, merged per chunk). GLB city kit pieces are not wired in yet; props, palms, lamps, cars, bike and rider are.
- A rigged rider GLB needs no `ride` clip: riding and the roof crouch are solved in code with two-bone IK against the bike's grips, pegs and seat, and aiming, the whistle and the lean are layered on top.
- Generated models came with metal maps that made the rider solid chrome and the bike patchy mirror metal (bronze statues under the warm night sky), so `tools/art` paints metal and roughness from the colour map. At night the player's rider and bike also get a stronger share of the environment and a cool rim so black leather and black paint keep their shape.
- Render maps sim (x, y, z) to three (x, z, y) as the brief asks. This is a mirror, so "left" and "right" go through helpers in `core/math.ts`.
